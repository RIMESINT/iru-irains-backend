const PDFDistrictService = require('./scripts/pdf/pdfDistrictService');
const moment = require('moment');
const client = require("../connection");
const PDFStateService = require('./scripts/pdf/pdfStateService');
const PDFSubdivService = require('./scripts/pdf/pdfSubdivService');
const PDFRegionService = require('./scripts/pdf/pdfRegionService');

const { fetchBetweenDates: fetchDistrictBetweenDates } = require('./District');
const { fetchBetweenDates: fetchStateBetweenDates } = require('./State'); 
const { fetchBetweenDates: fetchSubdivBetweenDates } = require('./SubDivision');
const { fetchBetweenDates: fetchRegionBetweenDates } = require('./Region');

/**
 * Helper function to calculate season period based on date range
 */
const calculateSeasonPeriod = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const getSeason = (date) => {
        const month = date.getMonth(); // 0-based
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
            // Check for leap year
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
    
    // Don't go beyond selected end date
    const selectedEnd = new Date(endDate);
    if (seasonEndDate > selectedEnd) {
        seasonEndDate = selectedEnd;
    }
    
    return {
        startDate: formatDate(seasonStartDate),
        endDate: formatDate(seasonEndDate)
    };
};

/**
 * Wrapper functions to call the fetchBetweenDates from other controllers
 * These functions extract the core logic without the HTTP request/response handling
 */
const getDistrictData = async (startDate, endDate, currentDate, specificDateTime) => {
    try {
        // Call the existing fetchBetweenDates function from District controller
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

/**
 * Main PDF generation function
 */
exports.generateDistrictPDF = async (req, res) => {
    try {
        const { startDate, endDate, action = 'download' } = req.body;
        
        // Handle date validation
        const currentDate = moment().format('YYYY-MM-DD');
        const data = {
            startDate: startDate || currentDate,
            endDate: endDate || currentDate
        };

        // Validate date range
        if (moment(data.startDate).isAfter(data.endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate"
            });
        }

        // Calculate season period based on the selected date range
        const seasonPeriodDate = calculateSeasonPeriod(data.startDate, data.endDate);
        
        console.log('Date range:', data);
        console.log('Season period:', seasonPeriodDate);

        // Set up specific time for data cutoff
        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        // Fetch all required data in parallel for better performance
        console.log('Fetching all data...');
        
        const [
            districtData,
            stateData,
            subdivData,
            districtSeasonData,
            stateSeasonData,
            subdivSeasonData
        ] = await Promise.all([
            getDistrictData(data.startDate, data.endDate, currentDate, specificDateTime),
            getStateData(data.startDate, data.endDate, currentDate, specificDateTime),
            getSubdivData(data.startDate, data.endDate, currentDate, specificDateTime),
            getDistrictData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime),
            getStateData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime),
            getSubdivData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime)
        ]);

        console.log('Data fetching completed. Sample counts:');
        console.log('- District data:', districtData?.length || 0);
        console.log('- State data:', stateData?.length || 0);
        console.log('- Subdivision data:', subdivData?.length || 0);

        // Initialize PDF service and set data
        const pdfService = new PDFDistrictService();
        await pdfService.setData(
            districtData || [],
            stateData || [],
            subdivData || [],
            districtSeasonData || [],
            stateSeasonData || [],
            subdivSeasonData || [],
            data,
            seasonPeriodDate
        );

        // Generate PDF document
        console.log('Generating PDF...');
        const doc = await pdfService.generatePDF();
        const pdfBuffer = doc.output('arraybuffer');

        // Create filename with current timestamp
        const timestamp = moment().format('YYYYMMDD_HHmmss');
        const filename = `DISTRIBUTION_DISTRICT_INDIA_cd_${timestamp}.pdf`;

        // Set response headers based on action
        res.setHeader('Content-Type', 'application/pdf');
        
        if (action === 'view') {
            // For viewing in browser
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        } else {
            // For downloading
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        }

        // Send the PDF buffer
        res.send(Buffer.from(pdfBuffer));
        console.log(`PDF ${action === 'view' ? 'viewed' : 'downloaded'} successfully: ${filename}`);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Generate PDF for download (convenience method)
 */
exports.downloadDistrictPDF = async (req, res) => {
    req.body.action = 'download';
    return await exports.generateDistrictPDF(req, res);
};

/**
 * Generate PDF for viewing (convenience method)
 */
exports.viewDistrictPDF = async (req, res) => {
    console.log('viewDistrictPDF')
    req.body.action = 'view';
    return await exports.generateDistrictPDF(req, res);
};

/**
 * Generate PDF with custom date range
 */
exports.generateCustomDatePDF = async (req, res) => {
    const { fromDate, toDate, action = 'download' } = req.body;
    
    if (!fromDate || !toDate) {
        return res.status(400).json({
            success: false,
            message: 'Both fromDate and toDate are required'
        });
    }
    
    // Set the dates and call the main function
    req.body.startDate = fromDate;
    req.body.endDate = toDate;
    req.body.action = action;
    
    return await exports.generateDistrictPDF(req, res);
};

/**
 * Health check endpoint for PDF service
 */
exports.pdfServiceHealthCheck = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'PDF service is operational',
            timestamp: new Date().toISOString(),
            service: 'District PDF Generation Service'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'PDF service health check failed',
            error: error.message
        });
    }
};



/**
 * STATE PDF GENERATION METHODS
 */

const getRegionData = async (startDate, endDate, currentDate, specificDateTime) => {
    try {
        return await fetchRegionBetweenDates(startDate, endDate, currentDate, specificDateTime);
    } catch (error) {
        console.error('Error fetching region data:', error);
        throw error;
    }
};

exports.generateStatePDF = async (req, res) => {
    try {
        const { startDate, endDate, action = 'download' } = req.body;
        
        const currentDate = moment().format('YYYY-MM-DD');
        const data = {
            startDate: startDate || currentDate,
            endDate: endDate || currentDate
        };

        if (moment(data.startDate).isAfter(data.endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate"
            });
        }

        const seasonPeriodDate = calculateSeasonPeriod(data.startDate, data.endDate);
        
        console.log('State PDF - Date range:', data);
        console.log('State PDF - Season period:', seasonPeriodDate);

        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        console.log('Fetching state and region data...');
        
        const [
            stateData,
            regionData,
            stateSeasonData,
            regionSeasonData
        ] = await Promise.all([
            getStateData(data.startDate, data.endDate, currentDate, specificDateTime),
            getRegionData(data.startDate, data.endDate, currentDate, specificDateTime),
            getStateData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime),
            getRegionData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime)
        ]);

        console.log('State PDF - Data fetching completed. Sample counts:');
        console.log('- State data:', stateData?.length || 0);
        console.log('- Region data:', regionData?.length || 0);

        const pdfService = new PDFStateService();
        await pdfService.setData(
            stateData || [],
            regionData || [],
            stateSeasonData || [],
            regionSeasonData || [],
            data,
            seasonPeriodDate
        );

        console.log('Generating State PDF...');
        const doc = await pdfService.generatePDF();
        const pdfBuffer = doc.output('arraybuffer');

        const timestamp = moment().format('YYYYMMDD_HHmmss');
        const filename = `DISTRIBUTION_STATE_INDIA_cd_${timestamp}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        
        if (action === 'view') {
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        } else {
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        }

        res.send(Buffer.from(pdfBuffer));
        console.log(`State PDF ${action === 'view' ? 'viewed' : 'downloaded'} successfully: ${filename}`);

    } catch (error) {
        console.error('Error generating state PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate state PDF',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.downloadStatePDF = async (req, res) => {
    req.body.action = 'download';
    return await exports.generateStatePDF(req, res);
};

exports.viewStatePDF = async (req, res) => {
    req.body.action = 'view';
    return await exports.generateStatePDF(req, res);
};

exports.generateCustomStatePDF = async (req, res) => {
    const { fromDate, toDate, action = 'download' } = req.body;
    
    if (!fromDate || !toDate) {
        return res.status(400).json({
            success: false,
            message: 'Both fromDate and toDate are required'
        });
    }
    
    req.body.startDate = fromDate;
    req.body.endDate = toDate;
    req.body.action = action;
    
    return await exports.generateStatePDF(req, res);
};






/**
 * SUBDIVISION PDF GENERATION METHODS
 */

exports.generateSubdivPDF = async (req, res) => {
    try {
        const { startDate, endDate, action = 'download' } = req.body;
        
        const currentDate = moment().format('YYYY-MM-DD');
        const data = {
            startDate: startDate || currentDate,
            endDate: endDate || currentDate
        };

        if (moment(data.startDate).isAfter(data.endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate"
            });
        }

        const seasonPeriodDate = calculateSeasonPeriod(data.startDate, data.endDate);
        
        console.log('Subdivision PDF - Date range:', data);
        console.log('Subdivision PDF - Season period:', seasonPeriodDate);

        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        console.log('Fetching subdivision and region data...');
        
        const [
            subdivData,
            regionData,
            subdivSeasonData,
            regionSeasonData
        ] = await Promise.all([
            getSubdivData(data.startDate, data.endDate, currentDate, specificDateTime),
            getRegionData(data.startDate, data.endDate, currentDate, specificDateTime),
            getSubdivData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime),
            getRegionData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime)
        ]);

        console.log('Subdivision PDF - Data fetching completed. Sample counts:');
        console.log('- Subdivision data:', subdivData?.length || 0);
        console.log('- Region data:', regionData?.length || 0);

        const pdfService = new PDFSubdivService();
        await pdfService.setData(
            subdivData || [],
            regionData || [],
            subdivSeasonData || [],
            regionSeasonData || [],
            data,
            seasonPeriodDate
        );

        console.log('Generating Subdivision PDF...');
        const doc = await pdfService.generatePDF();
        const pdfBuffer = doc.output('arraybuffer');

        const timestamp = moment().format('YYYYMMDD_HHmmss');
        const filename = `DISTRIBUTION_SUBDIVISION_INDIA_cd_${timestamp}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        
        if (action === 'view') {
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        } else {
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        }

        res.send(Buffer.from(pdfBuffer));
        console.log(`Subdivision PDF ${action === 'view' ? 'viewed' : 'downloaded'} successfully: ${filename}`);

    } catch (error) {
        console.error('Error generating subdivision PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate subdivision PDF',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.downloadSubdivPDF = async (req, res) => {
    req.body.action = 'download';
    return await exports.generateSubdivPDF(req, res);
};

exports.viewSubdivPDF = async (req, res) => {
    req.body.action = 'view';
    return await exports.generateSubdivPDF(req, res);
};

exports.generateCustomSubdivPDF = async (req, res) => {
    const { fromDate, toDate, action = 'download' } = req.body;
    
    if (!fromDate || !toDate) {
        return res.status(400).json({
            success: false,
            message: 'Both fromDate and toDate are required'
        });
    }
    
    req.body.startDate = fromDate;
    req.body.endDate = toDate;
    req.body.action = action;
    
    return await exports.generateSubdivPDF(req, res);
};





/**
 * REGION PDF GENERATION METHODS
 */

exports.generateRegionPDF = async (req, res) => {
    try {
        const { startDate, endDate, action = 'download' } = req.body;
        
        const currentDate = moment().format('YYYY-MM-DD');
        const data = {
            startDate: startDate || currentDate,
            endDate: endDate || currentDate
        };

        if (moment(data.startDate).isAfter(data.endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate"
            });
        }

        const seasonPeriodDate = calculateSeasonPeriod(data.startDate, data.endDate);
        
        console.log('Region PDF - Date range:', data);
        console.log('Region PDF - Season period:', seasonPeriodDate);

        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        console.log('Fetching region data...');
        
        const [
            regionData,
            regionSeasonData
        ] = await Promise.all([
            getRegionData(data.startDate, data.endDate, currentDate, specificDateTime),
            getRegionData(seasonPeriodDate.startDate, seasonPeriodDate.endDate, currentDate, specificDateTime)
        ]);

        console.log('Region PDF - Data fetching completed. Sample counts:');
        console.log('- Region data:', regionData?.length || 0);

        const pdfService = new PDFRegionService();
        await pdfService.setData(
            regionData || [],
            regionSeasonData || [],
            data,
            seasonPeriodDate
        );

        console.log('Generating Region PDF...');
        const doc = await pdfService.generatePDF();
        const pdfBuffer = doc.output('arraybuffer');

        const timestamp = moment().format('YYYYMMDD_HHmmss');
        const filename = `DISTRIBUTION_REGION_INDIA_cd_${timestamp}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        
        if (action === 'view') {
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        } else {
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        }

        res.send(Buffer.from(pdfBuffer));
        console.log(`Region PDF ${action === 'view' ? 'viewed' : 'downloaded'} successfully: ${filename}`);

    } catch (error) {
        console.error('Error generating region PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate region PDF',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.downloadRegionPDF = async (req, res) => {
    req.body.action = 'download';
    return await exports.generateRegionPDF(req, res);
};

exports.viewRegionPDF = async (req, res) => {
    req.body.action = 'view';
    return await exports.generateRegionPDF(req, res);
};

exports.generateCustomRegionPDF = async (req, res) => {
    const { fromDate, toDate, action = 'download' } = req.body;
    
    if (!fromDate || !toDate) {
        return res.status(400).json({
            success: false,
            message: 'Both fromDate and toDate are required'
        });
    }
    
    req.body.startDate = fromDate;
    req.body.endDate = toDate;
    req.body.action = action;
    
    return await exports.generateRegionPDF(req, res);
};





module.exports = exports;

