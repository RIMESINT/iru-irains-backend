const express = require('express');
const multer  = require('multer');
const router  = express.Router();

// Store uploaded file in memory (same pattern used in stationRoutes.js)
const upload = multer({ storage: multer.memoryStorage() });

const { uploadGeojson, getGeojson, listFolder, getUploadHistory } = require('../controllers/Geojson');

// Upload a GeoJSON file from the frontend admin panel
router.post('/geojson/upload', upload.single('file'), uploadGeojson);

// Get recent upload history (for the upload history table)
router.get('/geojson/upload-history', getUploadHistory);

// List all files in a folder (metadata only, no geojson payload)
router.get('/geojson/:folder', listFolder);

// Fetch a specific GeoJSON file by folder + filename
router.get('/geojson/:folder/:fileName', getGeojson);

module.exports = router;
