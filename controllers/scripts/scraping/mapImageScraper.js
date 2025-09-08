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
    }

    // Helper function for delay
    delay(time) {
        return new Promise(function(resolve) {
            setTimeout(resolve, time);
        });
    }

    // Clean and recreate the scraped images directory
    async cleanAndCreateImageDir() {
        try {
            console.log('🗑️  Cleaning old scraped-images directory...');
            
            // Remove the entire directory and all its contents
            await fs.remove(this.imageDir);
            console.log('✅ Old scraped-images directory removed');
            
            // Recreate the directory fresh
            await fs.ensureDir(this.imageDir);
            console.log('✅ Fresh scraped-images directory created');
            
        } catch (error) {
            console.error('❌ Error cleaning directory:', error);
            throw error;
        }
    }

    // Alternative: Just empty the directory (keep the folder structure)
    async emptyImageDir() {
        try {
            console.log('🧹 Emptying scraped-images directory...');
            
            // Empty directory contents but keep the directory itself
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

    // Hide unwanted elements before screenshot
    async hideUnwantedElements(page) {
        try {
            await page.evaluate((exclusionClasses) => {
                exclusionClasses.forEach(className => {
                    const elements = document.querySelectorAll(`.${className}`);
                    elements.forEach(element => {
                        element.style.display = 'none';
                    });
                });

                const allElements = document.querySelectorAll('*');
                allElements.forEach(element => {
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
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(element => {
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
                        // Ignore selector errors
                    }
                });

                console.log('UI elements hidden');
            }, this.exclusionClasses);
        } catch (error) {
            console.warn('⚠️  Warning: Could not hide all unwanted elements:', error.message);
        }
    }

    async captureMapImages() {
        // 🚨 FIRST: Clean old images before starting
        await this.cleanAndCreateImageDir();
        
        const browser = await this.initBrowser();
        const page = await browser.newPage();

        try {
            await page.setViewport({ width: 1920, height: 1080 });

            console.log('🌐 Navigating to maps page...');
            await page.goto('https://irainshydro.imd.gov.in/all-maps', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            await this.delay(5000);

            console.log('🎭 Hiding UI controls and download buttons...');
            await this.hideUnwantedElements(page);
            await this.delay(2000);

            const mapSelectors = [
                { name: 'district-map', selector: '#map-district' },
                { name: 'state-map', selector: '#map-state' },
                { name: 'subdivision-map', selector: '#map-subdivision' },
                { name: 'region-map', selector: '#map-region' }
            ];

            const capturedImages = [];

            for (const map of mapSelectors) {
                try {
                    console.log(`📸 Capturing ${map.name}...`);

                    const element = await page.$(map.selector);
                    if (element) {
                        await page.waitForSelector(map.selector, { 
                            visible: true, 
                            timeout: 5000 
                        });

                        const timestamp = Date.now();
                        const filename = `${map.name}-${timestamp}.png`;
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
                            timestamp: new Date().toISOString()
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
        // 🚨 FIRST: Clean old images before starting
        await this.cleanAndCreateImageDir();
        
        const browser = await this.initBrowser();
        const page = await browser.newPage();

        try {
            await page.setViewport({ width: 1920, height: 1080 });
            
            await page.goto('https://irainshydro.imd.gov.in/all-maps', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            await this.delay(5000);
            await this.hideUnwantedElements(page);
            await this.delay(2000);

            const timestamp = Date.now();
            const filename = `full-page-maps-${timestamp}.png`;
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
                timestamp: new Date().toISOString()
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
        // Ensure directory exists before downloading
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
}

module.exports = MapImageScraper;
