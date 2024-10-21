// const pool = require('../models/db'); // PostgreSQL connection
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../../../connection");


// Service function to handle PDF upload
exports.uploadPdf = async (userId, document_name, document_type, pdfFile) => {
    const documentSize = pdfFile.size;
    const documentData = pdfFile.buffer; // Buffer contains binary data
  
    const query = `
      INSERT INTO public.pdf_documents (document_name, document_type, document_size, document_data, uploaded_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
  
    const values = [
      document_name,
      document_type,
      documentSize,
      documentData, // Insert binary data here
      userId
    ];
  
    try {
      const result = await client.query(query, values);
      return result.rows[0].id; // Return the document ID
    } catch (error) {
      console.error('Error inserting PDF:', error);
      throw new Error('Error uploading PDF to the database');
    }
  };
  
// // Controller Method: Fetch PDF from the database and send it as a response
// exports.getPdf = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Query to get the PDF document by ID
//     const query = 'SELECT document_name, document_data FROM public.pdf_documents WHERE id = $1';
//     const result = await client.query(query, [id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Document not found' });
//     }

//     const { document_name, document_data } = result.rows[0];

//     // Set headers to serve the PDF
//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `inline; filename="${document_name}"` // Open in a new tab
//     });

//     res.send(document_data); // Send the PDF binary data
//   } catch (error) {
//     console.error('Error fetching PDF:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch PDF' });
//   }
// };

