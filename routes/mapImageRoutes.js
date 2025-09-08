const express = require('express');
const router = express.Router();
const mapImageController = require('../controllers/mapImageController');

// Capture screenshots of maps
router.post('/capture-maps', mapImageController.captureMapImages);

// Get image URLs from the website
router.get('/scrape-urls', mapImageController.getMapImageUrls);

// Download specific image
router.post('/download-image', mapImageController.downloadMapImage);

// Serve captured images
router.get('/images/:filename', mapImageController.serveImage);

// Health check
router.get('/health', mapImageController.healthCheck);

// Clear cached images
router.delete('/clear-cache', mapImageController.clearImages);

// Capture full page without UI controls
router.post('/capture-full-page', mapImageController.captureFullPageMaps);


module.exports = router;
