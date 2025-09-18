const nodemailer = require('nodemailer');
const client = require('../connection');
const moment = require('moment');
const fs = require('fs-extra');
const path = require('path');
const XLSX = require('xlsx'); // ADD THIS LINE
require('dotenv').config();

// Import your existing PDF services
const PDFDistrictService = require('./scripts/pdf/pdfDistrictService');
const PDFStateService = require('./scripts/pdf/pdfStateService');
const PDFSubdivService = require('./scripts/pdf/pdfSubdivService');
const PDFRegionService = require('./scripts/pdf/pdfRegionService');

// Import your map image scraper
const MapImageScraper = require('./scripts/scraping/mapImageScraper');

// Import your existing data fetch functions
const { fetchBetweenDates: fetchDistrictBetweenDates } = require('./District');
const { fetchBetweenDates: fetchStateBetweenDates } = require('./State'); 
const { fetchBetweenDates: fetchSubdivBetweenDates } = require('./SubDivision');
const { fetchBetweenDates: fetchRegionBetweenDates } = require('./Region');

// **ENHANCED SMTP CONFIGURATION FOR 8 ATTACHMENTS**
const createUltraSMTPTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 600000,  // 10 minutes
        greetingTimeout: 300000,    // 5 minutes  
        socketTimeout: 600000,      // 10 minutes
        pool: false,
        maxConnections: 1,
        maxMessages: 1
    });
};

const createMockTransporter = () => {
    return {
        sendMail: async (mailOptions) => {
            console.log('📧 MOCK EMAIL (8 attachments: 4 Excel + 4 Images):'); // CHANGED
            console.log('From:', mailOptions.from);
            console.log('To:', mailOptions.to);
            console.log('Subject:', mailOptions.subject);
            console.log('Total attachments:', mailOptions.attachments?.length || 0);
            
            if (mailOptions.attachments && mailOptions.attachments.length > 0) {
                let excelCount = 0; // CHANGED
                let imageCount = 0;
                let totalSize = 0;
                
                mailOptions.attachments.forEach((att, i) => {
                    const sizeMB = (att.content?.length / (1024 * 1024)).toFixed(2);
                    totalSize += att.content?.length || 0;
                    
                    if (att.filename.toLowerCase().includes('.xlsx')) { // CHANGED
                        excelCount++; // CHANGED
                        console.log(`  📊 Excel ${excelCount}: ${att.filename} (${sizeMB} MB)`); // CHANGED
                    } else {
                        imageCount++;
                        console.log(`  🖼️  Image ${imageCount}: ${att.filename} (${sizeMB} MB)`);
                    }
                });
                
                const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
                console.log(`📊 Summary: ${excelCount} Excel + ${imageCount} Images = ${totalSizeMB} MB total`); // CHANGED
            }
            
            return {
                messageId: `mock-${Date.now()}@rimes.int`,
                response: 'Mock email sent successfully with 8 attachments (4 Excel + 4 Images)' // CHANGED
            };
        },
        verify: async () => true
    };
};

// SMTP initialization
let smtp;
let isUsingMockMode = false;

try {
    smtp = createUltraSMTPTransporter();

    smtp.verify().then(() => {
        console.log('✅ Ultra SMTP transporter configured for 8 attachments (4 Excel + 4 Images)'); // CHANGED
        isUsingMockMode = false;
    }).catch((error) => {
        console.error('⚠️ SMTP verification failed:', error.message);
        console.log('🔄 Switching to mock mode for 8 attachments testing');
        smtp = createMockTransporter();
        isUsingMockMode = true;
    });
    
} catch (error) {
    console.error('⚠️ Failed to create SMTP transporter:', error.message);
    smtp = createMockTransporter();
    isUsingMockMode = true;
}

// Your existing helper functions
const calculateSeasonPeriod = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const getSeason = (date) => {
        const month = date.getMonth();
        if (month >= 0 && month <= 1) return 'Jan-Feb';
        if (month >= 2 && month <= 4) return 'Mar-May';
        if (month >= 5 && month <= 8) return 'Jun-Sep';
        if (month >= 9 && month <= 11) return 'Oct-Dec';
        return '';
    };
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const season = getSeason(start);
    let seasonStartDate, seasonEndDate;
    
    switch (season) {
        case 'Jan-Feb':
            seasonStartDate = new Date(start.getFullYear(), 0, 1);
            seasonEndDate = new Date(start.getFullYear(), 1, 28);
            if (start.getFullYear() % 4 === 0) {
                seasonEndDate = new Date(start.getFullYear(), 1, 29);
            }
            break;
        case 'Mar-May':
            seasonStartDate = new Date(start.getFullYear(), 2, 1);
            seasonEndDate = new Date(start.getFullYear(), 4, 31);
            break;
        case 'Jun-Sep':
            seasonStartDate = new Date(start.getFullYear(), 5, 1);
            seasonEndDate = new Date(start.getFullYear(), 8, 30);
            break;
        case 'Oct-Dec':
            seasonStartDate = new Date(start.getFullYear(), 9, 1);
            seasonEndDate = new Date(start.getFullYear(), 11, 31);
            break;
        default:
            seasonStartDate = start;
            seasonEndDate = end;
    }
    
    const currentDate = new Date();
    if (seasonEndDate > currentDate) {
        seasonEndDate = currentDate;
    }
    
    return {
        startDate: formatDate(seasonStartDate),
        endDate: formatDate(seasonEndDate)
    };
};

// Data fetch functions (same as before)
const getDistrictData = async (startDate, endDate, currentDate, specificDateTime) => {
    try {
        return await fetchDistrictBetweenDates(startDate, endDate, currentDate, specificDateTime);
    } catch (error) {
        console.error('Error fetching district data:', error);
        throw error;
    }
};

const getStateData = async (startDate, endDate, currentDate, specificDateTime) => {
    try {
        return await fetchStateBetweenDates(startDate, endDate, currentDate, specificDateTime);
    } catch (error) {
        console.error('Error fetching state data:', error);
        throw error;
    }
};

const getSubdivData = async (startDate, endDate, currentDate, specificDateTime) => {
    try {
        return await fetchSubdivBetweenDates(startDate, endDate, currentDate, specificDateTime);
    } catch (error) {
        console.error('Error fetching subdivision data:', error);
        throw error;
    }
};

const getRegionData = async (startDate, endDate, currentDate, specificDateTime) => {
    try {
        return await fetchRegionBetweenDates(startDate, endDate, currentDate, specificDateTime);
    } catch (error) {
        console.error('Error fetching region data:', error);
        throw error;
    }
};

// **CHANGED: Generate individual Excel buffer instead of PDF**
const generateSingleExcelBuffer = async (reportType, startDate, endDate) => {
    try {
        console.log(`🔄 Generating ${reportType.toUpperCase()} EXCEL...`); // CHANGED
        
        const currentDate = moment().format('YYYY-MM-DD');
        const data = { startDate, endDate };
        
        const seasonPeriodDate = calculateSeasonPeriod(startDate, endDate);
        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        let pdfService;

        switch (reportType.toLowerCase()) {
            case 'district':
                const [districtData, stateData, subdivData, districtSeasonData, stateSeasonData, subdivSeasonData] = await Promise.all([
                    getDistrictData(data.startDate, data.endDate, currentDate, specificDateTime),
                    getStateData(data.startDate, data.endDate, currentDate, specificDateTime),
                    getSubdivData(data.startDate, data.endDate, currentDate, specificDateTime),
                    getDistrictData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime),
                    getStateData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime),
                    getSubdivData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime)
                ]);

                pdfService = new PDFDistrictService();
                await pdfService.setData(
                    districtData || [], stateData || [], subdivData || [],
                    districtSeasonData || [], stateSeasonData || [], subdivSeasonData || [],
                    data, seasonPeriodDate
                );
                break;

            case 'state':
                const [stateData2, regionData1, stateSeasonData2, regionSeasonData1] = await Promise.all([
                    getStateData(data.startDate, data.endDate, currentDate, specificDateTime),
                    getRegionData(data.startDate, data.endDate, currentDate, specificDateTime),
                    getStateData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime),
                    getRegionData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime)
                ]);

                pdfService = new PDFStateService();
                await pdfService.setData(
                    stateData2 || [], regionData1 || [], 
                    stateSeasonData2 || [], regionSeasonData1 || [], 
                    data, seasonPeriodDate
                );
                break;

            case 'subdivision':
                const [subdivData2, regionData2, subdivSeasonData2, regionSeasonData2] = await Promise.all([
                    getSubdivData(data.startDate, data.endDate, currentDate, specificDateTime),
                    getRegionData(data.startDate, data.endDate, currentDate, specificDateTime),
                    getSubdivData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime),
                    getRegionData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime)
                ]);

                pdfService = new PDFSubdivService();
                await pdfService.setData(
                    subdivData2 || [], regionData2 || [], 
                    subdivSeasonData2 || [], regionSeasonData2 || [], 
                    data, seasonPeriodDate
                );
                break;

            case 'region':
                const [regionData3, regionSeasonData3] = await Promise.all([
                    getRegionData(data.startDate, data.endDate, currentDate, specificDateTime),
                    getRegionData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime)
                ]);

                pdfService = new PDFRegionService();
                await pdfService.setData(
                    regionData3 || [], regionSeasonData3 || [], 
                    data, seasonPeriodDate
                );
                break;

            default:
                throw new Error(`❌ Unsupported report type: ${reportType}`);
        }

        // **CHANGED: Generate Excel instead of PDF**
        // Add generateExcel method if it doesn't exist
        if (typeof pdfService.generateExcel !== 'function') {
            pdfService.generateExcel = () => {
                const wb = XLSX.utils.book_new();
                const ws_data = [];

                // Header
                const dateLabel = pdfService.data.startDate === pdfService.data.endDate
                    ? `DAY: ${pdfService.convertToIndianDateFormat(pdfService.data.startDate)}`
                    : `DAY: ${pdfService.convertToIndianDateFormat(pdfService.data.startDate)} to ${pdfService.convertToIndianDateFormat(pdfService.data.endDate)}`;
                const periodLabel = `PERIOD: ${pdfService.convertToIndianDateFormat(pdfService.seasonPeriodDate.startDate)} to ${pdfService.convertToIndianDateFormat(pdfService.seasonPeriodDate.endDate)}`;
                
                ws_data.push(['', '', dateLabel, '', '', '', periodLabel, '', '', '']);
                
                const columnHeaders = reportType.toLowerCase() === 'region' 
                    ? ['S.No', 'REGION', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.']
                    : reportType.toLowerCase() === 'state'
                    ? ['S.No', 'REGION/STATE', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.']
                    : reportType.toLowerCase() === 'subdivision'
                    ? ['S.No', 'REGION/SUBDIVISION', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.']
                    : ['S.No', 'MET.SUBDIVISION/UT/STATE/DISTRICT', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.'];
                
                ws_data.push(columnHeaders);

                // Load and convert rows
                pdfService.loadTheRows();
                for (const row of pdfService.rows) {
                    ws_data.push(row.map(cell => typeof cell === 'object' ? cell.content : cell));
                }

                // Legend
                ws_data.push([]);
                ws_data.push(['', 'LEGEND', '', '', '', '', '', '', '', '']);
                ws_data.push(['CATEGORY', '% DEPARTURES OF RAINFALL', 'COLOUR NAME', '', '', '', '', '', '', '']);
                [
                    ['Large Excess (LE)', '>= 60%', 'Blue'],
                    ['Excess (E)', '>= 20% and <= 59%', 'Light Blue'],
                    ['Normal (N)', '>= -19% and <= +19%', 'Green'],
                    ['Deficient (D)', '>= -59% and <= -20%', 'Red'],
                    ['Large Deficient (LD)', '>= -99% and <= -60%', 'Yellow'],
                    ['No Rain (NR)', '= -100%', 'White'],
                    ['Not Available', 'ND', 'Grey'],
                ].forEach(legendRow => ws_data.push([...legendRow, '', '', '', '', '', '', '', '']));

                const ws = XLSX.utils.aoa_to_sheet(ws_data);
                XLSX.utils.book_append_sheet(wb, ws, `${reportType}Rainfall`);
                return wb;
            };
        }

        const wb = pdfService.generateExcel();
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        
        console.log(`✅ ${reportType.toUpperCase()} EXCEL generated: ${excelBuffer.length} bytes`);
        return excelBuffer;

    } catch (error) {
        console.error(`❌ Error generating ${reportType.toUpperCase()} EXCEL:`, error);
        throw error;
    }
};

// **Capture map images using your existing scraper (same as before)**
const captureMapImages = async () => {
    try {
        console.log('🚀 Capturing map images...');
        
        const scraper = new MapImageScraper();
        const capturedImages = await scraper.captureMapImages();
        
        try {
            await scraper.closeBrowser();
        } catch (error) {
            console.error('Error during browser cleanup:', error.message);
        }
        
        if (!capturedImages || capturedImages.length === 0) {
            console.log('⚠️ No map images captured, using placeholder');
            return [];
        }
        
        console.log(`✅ Successfully captured ${capturedImages.length} map images`);
        return capturedImages;
        
    } catch (error) {
        console.error('❌ Error capturing map images:', error);
        return [];
    }
};

// **CHANGED: Generate 4 Excel + 4 Images as attachments**
const generateExcelAndImagesAttachments = async (reportTypes, startDate, endDate) => {
    try {
        console.log(`🚀 Generating 4 Excel + 4 Images for email...`); // CHANGED
        
        // Generate all 4 Excel files in parallel
        console.log('📊 Generating Excel files...'); // CHANGED
        const excelPromises = reportTypes.map(reportType => 
            generateSingleExcelBuffer(reportType, startDate, endDate) // CHANGED function name
        );
        
        const excelBuffers = await Promise.all(excelPromises); // CHANGED variable name
        const timestamp = moment().format('YYYYMMDD_HHmmss');
        
        // Capture 4 map images
        console.log('🖼️ Capturing map images...');
        const capturedImages = await captureMapImages();
        
        // Create Excel attachments
        const excelAttachments = []; // CHANGED from pdfAttachments
        for (let i = 0; i < excelBuffers.length; i++) { // CHANGED from pdfBuffers
            const reportType = reportTypes[i];
            const sizeMB = (excelBuffers[i].length / (1024 * 1024)).toFixed(2); // CHANGED from pdfBuffers
            
            excelAttachments.push({ // CHANGED from pdfAttachments
                filename: `DISTRIBUTION_${reportType.toUpperCase()}_INDIA_cd_${timestamp}.xlsx`, // CHANGED extension
                content: excelBuffers[i], // CHANGED from pdfBuffers
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // CHANGED content type
            });
            
            console.log(`📊 Excel Attachment ${i + 1}: ${reportType.toUpperCase()} Excel (${sizeMB} MB)`); // CHANGED
        }
        
        // Create image attachments (same as before)
        const imageAttachments = [];
        const imageDir = path.join(__dirname, 'scripts/scraping/../../../public/scraped-images');
        
        for (let i = 0; i < Math.min(capturedImages.length, 4); i++) {
            const imageInfo = capturedImages[i];
            const imagePath = path.join(imageDir, imageInfo.filename);
            
            try {
                if (await fs.pathExists(imagePath)) {
                    const imageBuffer = await fs.readFile(imagePath);
                    const imageSize = (imageBuffer.length / (1024 * 1024)).toFixed(2);
                    
                    imageAttachments.push({
                        filename: `MAP_${i + 1}_${imageInfo.filename}`,
                        content: imageBuffer,
                        contentType: `image/${path.extname(imageInfo.filename).replace('.', '').toLowerCase()}`
                    });
                    
                    console.log(`🖼️ Image Attachment ${i + 1}: ${imageInfo.filename} (${imageSize} MB)`);
                } else {
                    console.log(`⚠️ Image file not found: ${imagePath}`);
                }
            } catch (error) {
                console.error(`❌ Error processing image ${imageInfo.filename}:`, error.message);
            }
        }
        
        // Combine all attachments
        const allAttachments = [...excelAttachments, ...imageAttachments]; // CHANGED from pdfAttachments
        
        const totalSize = allAttachments.reduce((sum, att) => sum + att.content.length, 0);
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        console.log(`📊 Total attachments: ${excelAttachments.length} Excel + ${imageAttachments.length} Images = ${allAttachments.length} files (${totalSizeMB} MB total)`); // CHANGED
        
        return allAttachments;
        
    } catch (error) {
        console.error('❌ Error generating Excel and images attachments:', error); // CHANGED
        throw error;
    }
};

// Truncate text for database logging
const truncateForLog = (text, maxLength = 200) => {
    if (!text) return 'No content';
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return cleanText.length > maxLength ? cleanText.substring(0, maxLength - 3) + '...' : cleanText;
};

// **Enhanced email sending for 8 attachments**
const sendEmailWithEightAttachments = async ({ to, subject, text, attachments, html }) => {
    if (!to || !subject || (!text && !html)) {
        return { success: false, message: 'To, subject, and either text or html are required fields.' };
    }

    const mailOptions = {
        from: process.env.EMAIL_USER || 'balakrishna@rimes.int',
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: attachments
    };

    try {
        let lastError;
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            try {
                attempts++;
                
                if (mailOptions.attachments && mailOptions.attachments.length > 0) {
                    const totalSize = mailOptions.attachments.reduce((sum, att) => sum + att.content.length, 0);
                    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
                    
                    const excelCount = mailOptions.attachments.filter(att => att.filename.toLowerCase().includes('.xlsx')).length; // CHANGED
                    const imageCount = mailOptions.attachments.length - excelCount; // CHANGED
                    
                    console.log(`📤 Attempt ${attempts}/${maxAttempts} - Sending ${excelCount} Excel + ${imageCount} images (${sizeMB}MB total) to ${to}`); // CHANGED
                }
                
                const response = await smtp.sendMail(mailOptions);
                if (!response || !response.messageId) {
                    throw new Error('Invalid SMTP response.');
                }

                const logMessage = truncateForLog(text || html);
                const logSubject = subject.length > 100 ? subject.substring(0, 97) + '...' : subject;
                
                try {
                    await client.query(
                        'INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', 
                        [to, logSubject, logMessage, new Date(), true]
                    );
                } catch (dbError) {
                    console.error('⚠️ Database logging failed (email sent successfully):', dbError.message);
                }

                console.log(`✅ 8 attachments email sent successfully to ${to} ${isUsingMockMode ? '(MOCK MODE)' : ''}`);
                return { success: true, message: 'Email sent successfully', response: response };

            } catch (error) {
                lastError = error;
                
                if (error.message.includes('Timeout') || error.code === 'ETIMEDOUT') {
                    console.error(`⏳ Timeout error on attempt ${attempts}: ${error.message}`);
                    
                    if (attempts < maxAttempts) {
                        const waitTime = 10000;
                        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    } else {
                        console.log('🔄 All attempts failed, switching to mock mode');
                        smtp = createMockTransporter();
                        isUsingMockMode = true;
                        
                        const mockResponse = await smtp.sendMail(mailOptions);
                        
                        const logMessage = truncateForLog(text || html);
                        const logSubject = subject.length > 100 ? subject.substring(0, 97) + '...' : subject;
                        
                        try {
                            await client.query(
                                'INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', 
                                [to, logSubject, `[MOCK-8ATT-EXCEL] ${logMessage}`, new Date(), true] // CHANGED
                            );
                        } catch (dbError) {
                            console.error('⚠️ Database logging failed:', dbError.message);
                        }
                        
                        return { success: true, message: 'Email sent successfully (mock mode - 4 Excel + 4 Images)', response: mockResponse }; // CHANGED
                    }
                } else {
                    break;
                }
            }
        }

        throw lastError;

    } catch (error) {
        console.error('❌ Final error sending 8 attachments email:', error.message);

        const logMessage = truncateForLog(text || html);
        const logSubject = subject.length > 100 ? subject.substring(0, 97) + '...' : subject;
        
        try {
            await client.query(
                'INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', 
                [to, logSubject, `[ERROR-8ATT-EXCEL] ${logMessage}`, new Date(), false] // CHANGED
            );
            return { success: false, message: 'Error sending email. Data inserted into log.', error: error.message };
        } catch (insertError) {
            console.error('❌ Error inserting data into log:', insertError.message);
            return { success: false, message: 'Internal server error. Could not insert log.', error: insertError.message };
        }
    }
};

// **CHANGED: Email Content Generation for Excel**
const generateEmailContent = ({ reportTypes, customMessage, dateRange }) => {
    let today = new Date();
    today = today.toISOString().split("T")[0];
    const reportTypesText = reportTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()).join(', ');

    const html = `
    <div style="font-family: Arial, sans-serif;">
        <p>Greetings from the iRAINS</p>
        <p>These are the iRAINS Products of ${reportTypesText} for today-${today}.</p>
        <p><strong>📊 Excel Reports (4 files)</strong></p>
        <p>📊 DISTRICT Rainfall Distribution Report (Excel)<br>
        📊 STATE Rainfall Distribution Report (Excel)<br>
        📊 SUBDIVISION Rainfall Distribution Report (Excel)<br>
        📊 REGION Rainfall Distribution Report (Excel)</p>
        
        <p><strong>🖼️ Map Images (4 files)</strong></p>
        <p>🗺️ District-wise Rainfall Map<br>
        🗺️ State-wise Rainfall Map<br>
        🗺️ Subdivision-wise Rainfall Map<br>
        🗺️ Region-wise Rainfall Map</p>
        
        <p>© 2025 India Meteorological Department</p>
    </div>`;

    const text = `These are the iRAINS Products of ${reportTypesText}.

📊 Excel Reports (4 files)
📊 DISTRICT Rainfall Distribution Report (Excel)
📊 STATE Rainfall Distribution Report (Excel)
📊 SUBDIVISION Rainfall Distribution Report (Excel)
📊 REGION Rainfall Distribution Report (Excel)

🖼️ Map Images (4 files)
🗺️ District-wise Rainfall Map
🗺️ State-wise Rainfall Map
🗺️ Subdivision-wise Rainfall Map
🗺️ Region-wise Rainfall Map

© 2025 India Meteorological Department`;

    return { html, text };
};

// **CHANGED: Subject Generation**
const generateSubject = (baseSubject, reportTypes, dateRange) => {
    const reportTypesText = reportTypes.map(type => type.toUpperCase()).join('+');
    return `iRAINS - Daily Rainfall Statistics of ${reportTypesText} (Excel)`; // CHANGED
};

// **Send complete package with 4 Excel + 4 Images**
const sendCompleteReportPackage = async ({
    recipients,
    subject = 'iRAINS - Daily Rainfall Statistics',
    reportTypes = ['district', 'state', 'subdivision', 'region'],
    customMessage = '',
    dateRange = {}
}) => {
    try {
        const recipientCount = Array.isArray(recipients) ? recipients.length : 1;
        console.log(`🚀 Preparing iRAINS PACKAGE (4 Excel + 4 Images) for ${recipientCount} recipients...`); // CHANGED

        const startDate = dateRange.startDate || moment().format('YYYY-MM-DD');
        const endDate = dateRange.endDate || moment().format('YYYY-MM-DD');
        
        // Generate all 8 attachments (4 Excel + 4 Images)
        const allAttachments = await generateExcelAndImagesAttachments(reportTypes, startDate, endDate); // CHANGED function name
        
        const emailContent = generateEmailContent({ reportTypes, customMessage, dateRange });
        const recipientList = Array.isArray(recipients) ? recipients.join(', ') : recipients;
        const emailSubject = generateSubject(subject, reportTypes, dateRange);

        // Send email with 8 attachments
        const result = await sendEmailWithEightAttachments({
            to: recipientList,
            subject: emailSubject,
            html: emailContent.html,
            text: emailContent.text,
            attachments: allAttachments
        });

        if (result.success) {
            const totalSizeMB = allAttachments.reduce((sum, att) => sum + att.content.length, 0) / (1024 * 1024);
            const excelCount = allAttachments.filter(att => att.filename.toLowerCase().includes('.xlsx')).length; // CHANGED
            const imageCount = allAttachments.length - excelCount; // CHANGED
            
            console.log(`✅ iRAINS PACKAGE email sent: ${excelCount} Excel + ${imageCount} images (${totalSizeMB.toFixed(2)}MB total)! ${isUsingMockMode ? '(MOCK MODE)' : ''}`); // CHANGED
            
            return {
                success: true,
                messageId: result.response.messageId,
                attachmentCount: allAttachments.length,
                excelCount: excelCount, // CHANGED from pdfCount
                imageCount: imageCount,
                recipientCount: recipientCount,
                reportTypes: reportTypes.map(type => type.toUpperCase()),
                totalAttachmentSize: totalSizeMB.toFixed(2) + ' MB',
                mode: isUsingMockMode ? 'mock' : 'production',
                sentAt: new Date().toISOString()
            };
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        console.error(`❌ Error sending iRAINS PACKAGE:`, error.message);
        throw new Error(`Failed to send iRAINS PACKAGE: ${error.message}`);
    }
};

// **MAIN CONTROLLER FOR 8 ATTACHMENTS - WORKS FOR BOTH HTTP AND CRON**
const sendBulkReports = async (req, res) => {
    try {
        // **HANDLE BOTH HTTP REQUESTS AND CRON JOBS**
        let reportConfigs;
        
        // If called from HTTP request
        if (req && req.body) {
            reportConfigs = req.body.reportConfigs;
            console.log('📋 Called from HTTP request');
        } else {
            // If called from cron job (no req/res)
            reportConfigs = null;
            console.log('📋 Called from CRON JOB');
        }

        let today = new Date();
        today = today.toISOString().split("T")[0];

        // **Use default config if no reportConfigs provided (for cron jobs)**
        const finalReportConfigs = (reportConfigs && Array.isArray(reportConfigs) && reportConfigs.length > 0) 
            ? reportConfigs 
            : [
                {
                    // "recipients": ["balakrishna@rimes.int"],
                    "recipients": ["rmudelhi@gmail.com","RAHULSAXENA.IMD@gmail.com", "shravankumar.imd@gmail.com","tarakesh@rimes.int","balakrishna@rimes.int","manu@rimes.int", "sivaramakrishna@rimes.int"],
                    "subject": "Complete Rainfall Analysis Package",
                    "reportTypes": ["district", "state", "subdivision", "region"],
                    "customMessage": `This is the dissemination of the ${today} reports with 4 Excel reports + 4 map images has completed by crawling from iRAINS website.`, // CHANGED
                    "dateRange": {
                        "startDate": today,
                        "endDate": today
                    }
                }
            ];

        console.log(`🚀 Processing iRAINS PACKAGE bulk email (4 Excel + 4 Images) for ${finalReportConfigs.length} recipients`); // CHANGED

        const results = [];
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < finalReportConfigs.length; i++) {
            const config = finalReportConfigs[i];
            
            console.log(`📤 Sending ${i + 1}/${finalReportConfigs.length}: iRAINS PACKAGE (8 attachments)`);

            try {
                const result = await sendCompleteReportPackage(config);
                results.push({ ...result, configIndex: i });
                successCount++;
                
                if (i < finalReportConfigs.length - 1) {
                    console.log('⏳ Waiting 10 seconds... (8 attachments rate limiting)');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
            } catch (error) {
                results.push({ 
                    success: false, 
                    error: error.message,
                    configIndex: i,
                    reportTypes: config.reportTypes || ['UNKNOWN'],
                    sentAt: new Date().toISOString()
                });
                failureCount++;
                console.error(`❌ Failed to send iRAINS PACKAGE: ${error.message}`);
            }
        }

        console.log(`📊 iRAINS PACKAGE bulk email completed: ${successCount} successful, ${failureCount} failed`);

        const response = {
            success: successCount > 0,
            message: `iRAINS package bulk reports processed: ${successCount} successful, ${failureCount} failed`,
            totalSent: finalReportConfigs.length,
            successCount,
            failureCount,
            packageContents: '4 Excel + 4 Map Images = 8 attachments per email', // CHANGED
            mode: isUsingMockMode ? 'mock' : 'production',
            results,
            timestamp: new Date().toISOString()
        };

        // **SEND HTTP RESPONSE ONLY IF res EXISTS**
        if (res && res.status) {
            res.status(200).json(response);
        } else {
            // **FOR CRON JOBS - JUST LOG THE RESULT**
            console.log('✅ CRON JOB COMPLETED:', JSON.stringify(response, null, 2));
        }

        return response;

    } catch (error) {
        console.error('❌ Error processing iRAINS PACKAGE bulk reports:', error.message);
        
        // **SEND ERROR RESPONSE ONLY IF res EXISTS**
        if (res && res.status) {
            res.status(500).json({
                success: false,
                message: 'Failed to process iRAINS package bulk reports',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } else {
            // **FOR CRON JOBS - JUST LOG THE ERROR**
            console.error('❌ CRON JOB ERROR:', {
                success: false,
                message: 'Failed to process iRAINS package bulk reports',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        // **DON'T THROW ERROR FOR CRON JOBS**
        if (!res) {
            return { success: false, error: error.message };
        }
        throw error;
    }
};

module.exports = { sendBulkReports };
