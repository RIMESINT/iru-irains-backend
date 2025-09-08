const MapImageScraper = require('./scripts/scraping/mapImageScraper');
const fs = require('fs-extra');
const path = require('path');

class MapImageController {
    constructor() {
        this.scraper = new MapImageScraper();
    }

    // Ensure browser is closed properly
    async ensureCleanup() {
        try {
            await this.scraper.closeBrowser();
        } catch (error) {
            console.error('Error during browser cleanup:', error.message);
        }
    }

    captureMapImages = async (req, res) => {
        try {
            console.log('🚀 Starting map image capture...');
            
            const capturedImages = await this.scraper.captureMapImages();
            
            // Always cleanup browser
            await this.ensureCleanup();

            if (!capturedImages || capturedImages.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No map images were captured. Please check if the website is accessible and maps are loaded.',
                    images: [],
                    count: 0
                });
            }

            console.log(`✅ Successfully captured ${capturedImages.length} map images`);
            
            res.status(200).json({
                success: true,
                message: 'Map images captured successfully',
                images: capturedImages,
                count: capturedImages.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Error capturing map images:', error.message);
            
            // Ensure cleanup even on error
            await this.ensureCleanup();
            
            res.status(500).json({
                success: false,
                message: 'Failed to capture map images',
                error: error.message,
                timestamp: new Date().toISOString(),
                suggestion: 'Please check if the website is accessible and try again'
            });
        }
    };

    getMapImageUrls = async (req, res) => {
        try {
            console.log('🔍 Scraping image URLs...');
            
            const imageUrls = await this.scraper.scrapeImageUrls();
            
            // Always cleanup browser
            await this.ensureCleanup();

            if (!imageUrls || imageUrls.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No image URLs found on the target website',
                    images: [],
                    count: 0
                });
            }

            // Filter out invalid or irrelevant images
            const validImages = imageUrls.filter(img => 
                img.src && 
                !img.src.includes('data:') && 
                !img.src.includes('logo') &&
                !img.src.includes('icon')
            );

            console.log(`✅ Successfully scraped ${validImages.length} image URLs`);

            res.status(200).json({
                success: true,
                message: 'Image URLs scraped successfully',
                images: validImages,
                count: validImages.length,
                totalFound: imageUrls.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Error scraping image URLs:', error.message);
            
            // Ensure cleanup even on error
            await this.ensureCleanup();
            
            res.status(500).json({
                success: false,
                message: 'Failed to scrape image URLs',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    };

    downloadMapImage = async (req, res) => {
        try {
            const { imageUrl, filename } = req.body;
            
            // Validation
            if (!imageUrl || !filename) {
                return res.status(400).json({
                    success: false,
                    message: 'Both imageUrl and filename are required',
                    required: ['imageUrl', 'filename'],
                    received: { imageUrl: !!imageUrl, filename: !!filename }
                });
            }

            // Validate URL format
            try {
                new URL(imageUrl);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid imageUrl format',
                    error: 'Please provide a valid HTTP/HTTPS URL'
                });
            }

            // Validate filename
            if (!/^[a-zA-Z0-9_-]+\.(png|jpg|jpeg|gif|webp)$/i.test(filename)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid filename format',
                    error: 'Filename must contain only alphanumeric characters, hyphens, underscores and have a valid image extension (png, jpg, jpeg, gif, webp)'
                });
            }

            console.log(`⬇️ Downloading image: ${imageUrl} -> ${filename}`);

            const filepath = await this.scraper.downloadImageFromUrl(imageUrl, filename);

            // Verify file was actually downloaded
            const fileExists = await fs.pathExists(filepath);
            if (!fileExists) {
                throw new Error('File download completed but file not found on disk');
            }

            const stats = await fs.stat(filepath);
            
            console.log(`✅ Successfully downloaded image: ${filename} (${stats.size} bytes)`);

            res.status(200).json({
                success: true,
                message: 'Image downloaded successfully',
                filename: filename,
                path: filepath,
                url: `/api/maps/images/${filename}`,
                size: stats.size,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Error downloading image:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to download image',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    };

    serveImage = async (req, res) => {
        try {
            const filename = req.params.filename;
            
            // Validate filename parameter
            if (!filename) {
                return res.status(400).json({
                    success: false,
                    message: 'Filename parameter is required'
                });
            }

            // Security check: prevent path traversal
            if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid filename: path traversal not allowed'
                });
            }

            const imagePath = path.join(__dirname, 'scripts/scraping/../../../public/scraped-images', filename);
            const resolvedPath = path.resolve(imagePath);

            // Check if file exists
            if (await fs.pathExists(resolvedPath)) {
                // Set appropriate headers for image serving
                const ext = path.extname(filename).toLowerCase();
                const mimeTypes = {
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.webp': 'image/webp'
                };

                const contentType = mimeTypes[ext] || 'image/png';
                res.setHeader('Content-Type', contentType);
                res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

                console.log(`📸 Serving image: ${filename}`);
                res.sendFile(resolvedPath);
            } else {
                console.log(`❌ Image not found: ${filename}`);
                res.status(404).json({
                    success: false,
                    message: 'Image not found',
                    filename: filename,
                    suggestion: 'Please check if the image was properly captured or downloaded'
                });
            }
        } catch (error) {
            console.error('❌ Error serving image:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to serve image',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    };

    // Health check endpoint
    healthCheck = async (req, res) => {
        try {
            const imageDir = path.join(__dirname, 'scripts/scraping/../../../public/scraped-images');
            const dirExists = await fs.pathExists(imageDir);
            
            let imageCount = 0;
            if (dirExists) {
                const files = await fs.readdir(imageDir);
                imageCount = files.filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file)).length;
            }

            res.status(200).json({
                success: true,
                message: 'Map scraping service is operational',
                status: {
                    imageDirectory: dirExists ? 'exists' : 'missing',
                    storedImages: imageCount,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Health check failed',
                error: error.message
            });
        }
    };

    // Clear all cached images
    clearImages = async (req, res) => {
        try {
            const imageDir = path.join(__dirname, 'scripts/scraping/../../../public/scraped-images');
            
            if (await fs.pathExists(imageDir)) {
                const files = await fs.readdir(imageDir);
                const imageFiles = files.filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));
                
                for (const file of imageFiles) {
                    await fs.remove(path.join(imageDir, file));
                }

                console.log(`🗑️ Cleared ${imageFiles.length} cached images`);

                res.status(200).json({
                    success: true,
                    message: 'Cached images cleared successfully',
                    clearedCount: imageFiles.length,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Image directory not found'
                });
            }
        } catch (error) {
            console.error('❌ Error clearing images:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to clear images',
                error: error.message
            });
        }
    };


    // Add this to your controller class
    captureFullPageMaps = async (req, res) => {
        try {
            console.log('🚀 Starting full page map capture (without UI controls)...');
            
            const capturedImage = await this.scraper.captureFullPageWithExclusions();
            
            await this.ensureCleanup();

            if (!capturedImage) {
                return res.status(404).json({
                    success: false,
                    message: 'Failed to capture full page map',
                });
            }

            console.log(`✅ Successfully captured full page map`);
            
            res.status(200).json({
                success: true,
                message: 'Full page map captured successfully (UI controls hidden)',
                image: capturedImage,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Error capturing full page map:', error.message);
            await this.ensureCleanup();
            
            res.status(500).json({
                success: false,
                message: 'Failed to capture full page map',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    };



}

// Create single instance
const controller = new MapImageController();

// Export methods
module.exports = {
    captureMapImages: controller.captureMapImages,
    getMapImageUrls: controller.getMapImageUrls,
    downloadMapImage: controller.downloadMapImage,
    serveImage: controller.serveImage,
    healthCheck: controller.healthCheck,
    clearImages: controller.clearImages.apply,
    captureFullPageMaps: controller.captureFullPageMaps  // ← Make sure this is added

};
