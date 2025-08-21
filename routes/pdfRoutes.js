const express = require("express")
const multer = require('multer');
const router = express.Router()
const pdfController = require('../controllers/PDF');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ********************************************************************************************************
//                                      PDF routes
// ********************************************************************************************************


// Define the route for PDF upload
router.post('/uploadPdf', upload.single('pdfFile'), pdfController.uploadPdf);

// routes/pdfRoutes.js
router.get('/getPdf/:id', pdfController.getPdf);

router.post('/uploadpdfNEW', upload.single('file'), pdfController.uploadPdfNew);

router.get('/getAllPdfsByDocumentType', pdfController.getAllPdfsByDocumentType);
router.get('/getDocumentTypesAndNames', pdfController.getDocumentTypesAndNames);
router.post('/getPdfByDocumentName', pdfController.getPdfByDocumentName);
router.delete('/deletePdf/:id', pdfController.deletePdf);



module.exports = router;
