const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class MapImageScraper {
    constructor() {
        this.browser = null;
        this.imageDir = path.join(__dirname, '../../../public/scraped-images');
        this.exclusionClasses = [
            "download",
            "downloadpdf", 
            "leaflet-control-zoom",
            "leaflet-control-fullscreen",
            "leaflet-control-zoomin",
            "download-buttons",
            "download-buttons-2",
            "DownloadMaps",
            "ResetMap"
        ];
        this.defaultZoom = 1.1;          // Global zoom factor (80%)
        this.deviceScaleFactor = 3;      // DPI scaling for better image quality
    }

    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    async setZoom(page, zoomFactor = this.defaultZoom) {
        try {
            console.log(`🔍 Setting zoom to ${zoomFactor * 100}%...`);
            await page.evaluate((zoom) => {
                document.body.style.zoom = zoom;
            }, zoomFactor);

            // CSS transform fallback for robustness
            await page.evaluate((zoom) => {
                document.body.style.transform = `scale(${zoom})`;
                document.body.style.transformOrigin = 'top left';
            }, zoomFactor);

            await this.delay(2000);
            console.log('✅ Zoom applied successfully');
        } catch (error) {
            console.warn('⚠️ Warning: Could not set zoom:', error.message);
        }
    }

    async cleanAndCreateImageDir() {
        try {
            console.log('🗑️ Cleaning old scraped-images directory...');
            await fs.remove(this.imageDir);
            console.log('✅ Old scraped-images directory removed');
            await fs.ensureDir(this.imageDir);
            console.log('✅ Fresh scraped-images directory created');
        } catch (error) {
            console.error('❌ Error cleaning directory:', error);
            throw error;
        }
    }

    async emptyImageDir() {
        try {
            console.log('🧹 Emptying scraped-images directory...');
            await fs.emptyDir(this.imageDir);
            console.log('✅ Scraped-images directory emptied');
        } catch (error) {
            console.error('❌ Error emptying directory:', error);
            throw error;
        }
    }

    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        return this.browser;
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async hideUnwantedElements(page) {
        try {
            await page.evaluate((exclusionClasses) => {
                exclusionClasses.forEach(className => {
                    document.querySelectorAll(`.${className}`).forEach(element => {
                        element.style.display = 'none';
                    });
                });

                document.querySelectorAll('*').forEach(element => {
                    if (element.className) {
                        const classNames = element.className.toString().toLowerCase();
                        exclusionClasses.forEach(exclusionClass => {
                            if (classNames.includes(exclusionClass.toLowerCase())) {
                                element.style.display = 'none';
                            }
                        });
                    }
                });

                const controlSelectors = [
                    '[class*="leaflet-control"]',
                    '[class*="download"]', 
                    '[class*="button"]',
                    '[class*="zoom"]',
                    '[class*="fullscreen"]',
                    'button',
                    '.btn',
                    '[role="button"]'
                ];

                controlSelectors.forEach(selector => {
                    try {
                        document.querySelectorAll(selector).forEach(element => {
                            const elementText = element.textContent?.toLowerCase() || '';
                            const elementClass = element.className?.toLowerCase() || '';
                            const shouldHide = exclusionClasses.some(exclusionClass =>
                                elementText.includes(exclusionClass.toLowerCase()) ||
                                elementClass.includes(exclusionClass.toLowerCase())
                            );
                            if (shouldHide) {
                                element.style.display = 'none';
                            }
                        });
                    } catch (e) {
                        // Ignore errors on selectors
                    }
                });

                console.log('UI elements hidden');
            }, this.exclusionClasses);
        } catch (error) {
            console.warn('⚠️ Warning: Could not hide all unwanted elements:', error.message);
        }
    }

    async captureMapImages() {
        await this.cleanAndCreateImageDir();
        const browser = await this.initBrowser();
        const page = await browser.newPage();

        try {
            // Adjust viewport dimensions inversely proportional to zoom for consistent element size
            await page.setViewport({
                width: Math.floor(1920 / this.defaultZoom),
                height: Math.floor(1080 / this.defaultZoom),
                deviceScaleFactor: this.deviceScaleFactor
            });

            console.log('🌐 Navigating to maps page...');
            await page.goto('https://irainshydro.imd.gov.in/all-maps', {
                waitUntil: 'networkidle2',
                timeout: 20000
            });

            await this.delay(10000);

            // Apply zoom to page content
            await this.setZoom(page, this.defaultZoom);

            console.log('🎭 Hiding UI controls and download buttons...');
            await this.hideUnwantedElements(page);
            await this.delay(5000);

            const mapSelectors = [
                { name: 'district-map', selector: '#map-district' },
                { name: 'state-map', selector: '#map-state' },
                { name: 'subdivision-map', selector: '#map-subdivision' },
                { name: 'region-map', selector: '#map-region' }
            ];

            const capturedImages = [];

            for (const map of mapSelectors) {
                try {
                    console.log(`📸 Capturing ${map.name} at ${this.defaultZoom * 100}% zoom with deviceScaleFactor ${this.deviceScaleFactor}...`);

                    const element = await page.$(map.selector);
                    if (element) {
                        await page.waitForSelector(map.selector, {
                            visible: true,
                            timeout: 7000
                        });

                        const timestamp = Date.now();
                        const filename = `${map.name}-${Math.round(this.defaultZoom * 100)}pct-${timestamp}.png`;
                        const filepath = path.join(this.imageDir, filename);

                        await element.screenshot({
                            path: filepath,
                            type: 'png'
                        });

                        capturedImages.push({
                            name: map.name,
                            filename: filename,
                            path: filepath,
                            url: `/api/maps/images/${filename}`,
                            timestamp: new Date().toISOString(),
                            zoom: `${Math.round(this.defaultZoom * 100)}%`,
                            deviceScaleFactor: this.deviceScaleFactor
                        });

                        console.log(`✅ Captured ${map.name}: ${filename}`);
                    } else {
                        console.log(`❌ Element not found: ${map.selector}`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to capture ${map.name}:`, error.message);
                }
            }

            console.log(`🎉 Total images captured: ${capturedImages.length}`);
            return capturedImages;

        } catch (error) {
            console.error('❌ Error during map capture:', error);
            throw error;
        }
    }

    async captureFullPageWithExclusions() {
        await this.cleanAndCreateImageDir();
        const browser = await this.initBrowser();
        const page = await browser.newPage();

        try {
            await page.setViewport({
                width: Math.floor(1920 / this.defaultZoom),
                height: Math.floor(1080 / this.defaultZoom),
                deviceScaleFactor: this.deviceScaleFactor
            });

            await page.goto('https://irainshydro.imd.gov.in/all-maps', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            await this.delay(5000);

            await this.setZoom(page, this.defaultZoom);

            await this.hideUnwantedElements(page);
            await this.delay(2000);

            const timestamp = Date.now();
            const filename = `full-page-maps-${Math.round(this.defaultZoom * 100)}pct-${timestamp}.png`;
            const filepath = path.join(this.imageDir, filename);

            await page.screenshot({
                path: filepath,
                type: 'png',
                fullPage: true
            });

            console.log(`✅ Captured full page: ${filename}`);

            return {
                name: 'full-page-maps',
                filename: filename,
                path: filepath,
                url: `/api/maps/images/${filename}`,
                timestamp: new Date().toISOString(),
                zoom: `${Math.round(this.defaultZoom * 100)}%`,
                deviceScaleFactor: this.deviceScaleFactor
            };

        } catch (error) {
            console.error('❌ Error capturing full page:', error);
            throw error;
        }
    }

    async scrapeImageUrls() {
        const browser = await this.initBrowser();
        const page = await browser.newPage();

        try {
            await page.goto('https://irainshydro.imd.gov.in/all-maps', {
                waitUntil: 'networkidle2'
            });
            await this.delay(3000);

            const imageUrls = await page.evaluate((exclusionClasses) => {
                const images = document.querySelectorAll('img');
                return Array.from(images)
                    .map(img => ({
                        src: img.src,
                        alt: img.alt,
                        id: img.id,
                        className: img.className
                    }))
                    .filter(img => {
                        if (!img.src || img.src.includes('data:')) return false;
                        const imgClass = img.className?.toLowerCase() || '';
                        const imgAlt = img.alt?.toLowerCase() || '';
                        return !exclusionClasses.some(exclusionClass =>
                            imgClass.includes(exclusionClass.toLowerCase()) ||
                            imgAlt.includes(exclusionClass.toLowerCase())
                        );
                    });
            }, this.exclusionClasses);

            return imageUrls;

        } catch (error) {
            console.error('❌ Error scraping image URLs:', error);
            throw error;
        }
    }

    async downloadImageFromUrl(url, filename) {
        await fs.ensureDir(this.imageDir);
        try {
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream'
            });

            const filepath = path.join(this.imageDir, filename);
            const writer = fs.createWriteStream(filepath);

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(filepath));
                writer.on('error', reject);
            });
        } catch (error) {
            console.error('❌ Error downloading image:', error);
            throw error;
        }
    }

    async captureMapImagesWithZoom(zoomFactor = this.defaultZoom) {
        await this.cleanAndCreateImageDir();
        const browser = await this.initBrowser();
        const page = await browser.newPage();

        try {
            await page.setViewport({
                width: Math.floor(1920 / zoomFactor),
                height: Math.floor(1080 / zoomFactor),
                deviceScaleFactor: this.deviceScaleFactor
            });

            await page.goto('https://irainshydro.imd.gov.in/all-maps', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            await this.delay(10000);

            await this.setZoom(page, zoomFactor);

            await this.hideUnwantedElements(page);
            await this.delay(5000);

            const mapSelectors = [
                { name: 'district-map', selector: '#map-district' },
                { name: 'state-map', selector: '#map-state' },
                { name: 'subdivision-map', selector: '#map-subdivision' },
                { name: 'region-map', selector: '#map-region' }
            ];

            const capturedImages = [];

            for (const map of mapSelectors) {
                try {
                    console.log(`📸 Capturing ${map.name} at ${zoomFactor * 100}% zoom...`);
                    const element = await page.$(map.selector);
                    if (element) {
                        await page.waitForSelector(map.selector, {
                            visible: true,
                            timeout: 7000
                        });

                        const timestamp = Date.now();
                        const filename = `${map.name}-${Math.round(zoomFactor * 100)}pct-${timestamp}.png`;
                        const filepath = path.join(this.imageDir, filename);

                        await element.screenshot({
                            path: filepath,
                            type: 'png'
                        });

                        capturedImages.push({
                            name: map.name,
                            filename: filename,
                            path: filepath,
                            url: `/api/maps/images/${filename}`,
                            timestamp: new Date().toISOString(),
                            zoom: `${Math.round(zoomFactor * 100)}%`,
                            deviceScaleFactor: this.deviceScaleFactor
                        });

                        console.log(`✅ Captured ${map.name} at ${Math.round(zoomFactor * 100)}% zoom: ${filename}`);
                    } else {
                        console.log(`❌ Element not found: ${map.selector}`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to capture ${map.name}:`, error.message);
                }
            }

            console.log(`🎉 Total images captured at ${zoomFactor * 100}% zoom: ${capturedImages.length}`);
            return capturedImages;

        } catch (error) {
            console.error('❌ Error during map capture:', error);
            throw error;
        }
    }
}

module.exports = MapImageScraper;
