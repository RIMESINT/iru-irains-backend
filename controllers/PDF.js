const client = require('../connection');
const pdfService = require('./scripts/pdf/pdfService');
const { Readable, PassThrough } = require('stream');
const PgQueryStream = require('pg-query-stream'); // Install this package if not already installed



// Controller function for PDF upload
exports.uploadPdf = async (req, res) => {
    try {
      const { userId, document_name, document_type } = req.body;
      const pdfFile = req.file;
  
      if (!pdfFile) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }
  
      console.log('File info:', pdfFile);
      console.log('Request body:', req.body);
  
      // Call the service to upload the PDF
      const result = await pdfService.uploadPdf(userId, document_name, document_type, pdfFile);
  
      res.status(200).json({ success: true, documentId: result });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      res.status(500).json({ success: false, error: 'Failed to upload PDF' });
    }
  };
  

  exports.uploadPdfNew = async (req, res) => {
    const { category, subsection, uploaded_by, isactive } = req.body; // Get new fields from the request
    const file = req.file;
  
    if (!file || !category || !uploaded_by) {
        return res.status(400).json({ error: 'File, category, and uploaded_by are required.' });
    }
  
    try {
        const fileName = file.originalname;
        const fileData = file.buffer;
        const activeStatus = isactive === 'false' ? false : true; // Handle isactive
  
        // Insert the file into PostgreSQL
        await pool.query(
            `INSERT INTO pdf_files (file_name, file_data, category, subsection, uploaded_by, isactive) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [fileName, fileData, category, subsection || null, uploaded_by, activeStatus]
        );
  
        res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error uploading file', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
  }
  

  exports.getPdfNEW = async (req, res) => {
    const { category, subsection } = req.query;
  
    try {
        let query = `SELECT id, file_name FROM pdf_files WHERE category = $1 AND isactive = TRUE`; // Only fetch active files
        let params = [category];
  
        if (subsection) {
            query += ` AND subsection = $2`;
            params.push(subsection);
        }
  
        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching files', error);
        res.status(500).json({ error: 'Error fetching files' });
    }
  }
  

// exports.getPdf = async (req, res) => {
//   console.log("Fetching PDF...");
//   try {
//     const { id } = req.params;
    
//     // Verify ID is valid (you might add additional checks)
//     if (!id || isNaN(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid document ID' });
//     }

//     const query = 'SELECT document_name, document_data FROM public.pdf_documents WHERE id = $1';
//     const result = await client.query(query, [id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Document not found' });
//     }

//     const { document_name, document_data } = result.rows[0];

//     // Set the response headers to serve the PDF
//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `inline; filename="${document_name}"`,
//     });

//     res.send(document_data);
//   } catch (error) {
//     console.error('Error fetching PDF:', error.message);
//     res.status(500).json({ success: false, error: 'Failed to fetch PDF' });
//   }
// };



exports.getPdf = async (req, res) => {
  console.log("Fetching PDF...");
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid document ID' });
    }

    // First, get the document name
    const queryForName = 'SELECT document_name FROM public.pdf_documents WHERE id = $1';
    const result = await client.query(queryForName, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const { document_name } = result.rows[0];

    // Set headers to serve PDF in the browser
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${document_name}"`,
    });

    // Stream the binary data
    const queryForPdf = 'SELECT document_data FROM public.pdf_documents WHERE id = $1';
    const pdfStream = new PgQueryStream(queryForPdf, [id]);
    const stream = client.query(pdfStream);

    stream.on('data', (row) => {
      // Stream the binary data chunk
      res.write(row.document_data);
    });

    stream.on('end', () => {
      // Close the response when finished
      console.log("PDF stream finished.");
      res.end();
    });

    stream.on('error', (error) => {
      console.error("Error streaming PDF:", error);
      res.status(500).json({ success: false, error: 'Failed to stream PDF' });
    });

  } catch (error) {
    console.error('Error fetching PDF:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch PDF' });
  }
};


// getAllPdfsByDocumentType
exports.getAllPdfsByDocumentType = async (req, res) => {
  try {
    console.log('Received request for /getAllPdfsByDocumentType');
    const query = new PgQueryStream(`
      SELECT document_type, 
             json_agg(
               json_build_object(
                 'id', id,
                 'file_name', document_name,
                 'uploaded_at', upload_date,
                 'uploaded_by', uploaded_by,
                 'document_data', encode(document_data, 'base64')
               ) ORDER BY document_name
             ) AS pdfs
      FROM pdf_documents
      GROUP BY document_type
      ORDER BY document_type
    `);
    const stream = client.query(query);
    const pass = new PassThrough({ objectMode: true });

    res.setHeader('Content-Type', 'application/json');
    res.write('[');

    let first = true;
    stream.on('data', (row) => {
      if (!first) res.write(',');
      res.write(JSON.stringify(row));
      first = false;
    });
    stream.on('end', () => {
      res.write(']');
      res.end();
    });
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming PDFs' });
      }
    });
    stream.pipe(pass);
  } catch (error) {
    console.error('Error fetching PDFs by document type:', error);
    res.status(500).json({ error: 'Error fetching PDFs by document type' });
  }
};




exports.getDocumentTypesAndNames = async (req, res) => {
  try {
    console.log('Received request for /getDocumentTypesAndNames');
    const query = `
      SELECT document_type, 
             json_agg(
               json_build_object(
                 'id', id,
                 'document_name', document_name,
                 'upload_at', upload_date,
                 'uploaded_by', uploaded_by
               ) ORDER BY document_name
             ) AS documents
      FROM pdf_documents
      GROUP BY document_type
      ORDER BY document_type
    `;
    const result = await client.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching document types and names:', error);
    res.status(500).json({ error: 'Error fetching document types and names' });
  }
};




exports.getPdfByDocumentName = async (req, res) => {
  console.log('Fetching PDF by document name...');
  try {
    const { document_name } = req.body;
    console.log(document_name)

    if (!document_name) {
      return res.status(400).json({ success: false, message: 'Document name is required' });
    }

    // Get the document
    const queryForName = 'SELECT document_name, document_data FROM pdf_documents WHERE document_name = $1';
    const result = await client.query(queryForName, [document_name]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const { document_name: name, document_data } = result.rows[0];

    // Set headers to serve PDF in the browser
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${name}"`,
    });

    // Stream the binary data
    const pdfStream = new PgQueryStream('SELECT document_data FROM pdf_documents WHERE document_name = $1', [document_name]);
    const stream = client.query(pdfStream);

    stream.on('data', (row) => {
      res.write(row.document_data);
    });

    stream.on('end', () => {
      console.log('PDF stream finished.');
      res.end();
    });

    stream.on('error', (error) => {
      console.error('Error streaming PDF:', error);
      res.status(500).json({ success: false, error: 'Failed to stream PDF' });
    });
  } catch (error) {
    console.error('Error fetching PDF by document name:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch PDF' });
  }
};