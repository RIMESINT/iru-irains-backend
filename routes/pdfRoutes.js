const express = require("express");
const multer = require('multer');
const router = express.Router();

// Import both controllers with different names
const pdfUploadController = require('../controllers/PDF');
const pdfGenerationController = require('../controllers/pdfViewDownload');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ********************************************************************************************************
//                                   PDF UPLOAD/MANAGEMENT ROUTES
// ********************************************************************************************************

// Define the route for PDF upload
router.post('/uploadPdf', upload.single('pdfFile'), pdfUploadController.uploadPdf);

// Get PDF by ID
router.get('/getPdf/:id', pdfUploadController.getPdf);

// Upload PDF with new method
router.post('/uploadpdfNEW', upload.single('file'), pdfUploadController.uploadPdfNew);

// Get all PDFs by document type
router.get('/getAllPdfsByDocumentType', pdfUploadController.getAllPdfsByDocumentType);

// Get document types and names
router.get('/getDocumentTypesAndNames', pdfUploadController.getDocumentTypesAndNames);

// Get PDF by document name
router.post('/getPdfByDocumentName', pdfUploadController.getPdfByDocumentName);

// Delete PDF by ID
router.delete('/deletePdf/:id', pdfUploadController.deletePdf);

// ********************************************************************************************************
//                                   PDF GENERATION ROUTES
// ********************************************************************************************************

// Main PDF generation endpoint
router.post('/generate-district-pdf', pdfGenerationController.generateDistrictPDF);

// Convenience endpoints
router.post('/download-district-pdf', pdfGenerationController.downloadDistrictPDF);
router.post('/view-district-pdf', pdfGenerationController.viewDistrictPDF);

// Custom date range PDF generation
router.post('/generate-custom-district-pdf', pdfGenerationController.generateCustomDatePDF);

// Health check
router.get('/health', pdfGenerationController.pdfServiceHealthCheck);

// STATE PDF GENERATION ROUTES
router.post('/generate-state-pdf', pdfGenerationController.generateStatePDF);
router.post('/download-state-pdf', pdfGenerationController.downloadStatePDF);
router.post('/view-state-pdf', pdfGenerationController.viewStatePDF);
router.post('/generate-custom-state-pdf', pdfGenerationController.generateCustomStatePDF);

// SUBDIVISION PDF GENERATION ROUTES
router.post('/generate-subdiv-pdf', pdfGenerationController.generateSubdivPDF);
router.post('/download-subdiv-pdf', pdfGenerationController.downloadSubdivPDF);
router.post('/view-subdiv-pdf', pdfGenerationController.viewSubdivPDF);
router.post('/generate-custom-subdiv-pdf', pdfGenerationController.generateCustomSubdivPDF);

// REGION PDF GENERATION ROUTES
router.post('/generate-region-pdf', pdfGenerationController.generateRegionPDF);
router.post('/download-region-pdf', pdfGenerationController.downloadRegionPDF);
router.post('/view-region-pdf', pdfGenerationController.viewRegionPDF);
router.post('/generate-custom-region-pdf', pdfGenerationController.generateCustomRegionPDF);


module.exports = router;
