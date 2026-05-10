const express = require("express");
const router = express.Router();
const app = express();
const moment = require('moment');
const xlsx = require('xlsx');
const client = require("../../connection"); 
const axios = require('axios'); // Add axios for API calls

exports.fetchStationUnifiedFileFtp = async (req, res) => {
    try {
        let { startDate, endDate, districtCodes } = req.body;

        const currentDate = moment().format('YYYY-MM-DD');
        if (!startDate) {
            startDate = currentDate;
        }
        if (!endDate) {
            endDate = currentDate;
        }

        if (!Array.isArray(districtCodes)) {
            return res.status(400).json({
                success: false,
                message: "Invalid district codes format. Expecting an array of numbers.",
            });
        }

        // Fetch filtered data using client query
        let data = await fetchFilteredStationUnifiedFile(startDate, endDate, districtCodes);

        res.status(200).json({
            success: true,
            message: "Station data fetched successfully",
            data: data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch station data",
            error: error.message,
        });
    }
};
// created by balu on oct 22
const fetchFilteredStationUnifiedFile = async (startDate, endDate, districtCodes) => {
    try {


        // SQL Query to fetch the filtered data
        const query = `
        SELECT
            TO_CHAR(sddf.collection_date, 'YYYY-MM-DD') AS collection_date,
            sddf.data,
            sddf.station_id,
            sddf.district_code,
            ndd.district_name,
            ndd.state_name,
            sd.station_name,
            sd.latitude,
            sd.longitude,
            sd.block_name,
            sd.block_code
        FROM public.station_daily_data as sddf
        JOIN station_details as sd ON sd.station_code = sddf.station_id
        JOIN normal_district_details ndd on ndd.district_code = sd.district_code
        WHERE sddf.district_code = ANY($1)
        AND sddf.collection_date BETWEEN $2 AND $3;
    `;
    

        // Execute the query using the client
        const result = await client.query(query, [districtCodes, startDate, endDate]);

        // Disconnect the client after query execution
        // await client.end();

        // Return the fetched data
        return result.rows;
    } catch (error) {
        console.error('Error fetching station data:', error);
        throw error;
    }
};





// Updated function to fetch AWS data from APIs
exports.fetchLatestAwsExcelData = async (req, res) => {
    console.log("🔌 Fetching data from APIs...");
    
    const apiEndpoints = {
        'MEGHALAYA': 'https://city.imd.gov.in/api/v1/getMeghalayaAWS',
        'UTTAR_PRADESH': 'https://city.imd.gov.in/api/v1/getUPAWS',
        'TAMILNADU': 'https://city.imd.gov.in/api/v1/getTamilnaduAWS'
    };

    try {
        const result = {};
        
        // Iterate over entries (state name and URL)
        for (const [stateName, apiUrl] of Object.entries(apiEndpoints)) {
            console.log(`📂 Fetching data for ${stateName} from ${apiUrl}`);
            const data = await fetchAwsDataFromApi(apiUrl);
            result[stateName] = data; // Store by state name, not URL
        }

        const data = processAWSStationDataAndGetBlockData(result);
        
        res.status(200).json({
            success: true,
            message: "Latest AWS data fetched from APIs",
            data: data,
            totalBlocks: data.length
        });
    } catch (err) {
        console.error("❌ API error:", err.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch AWS data from APIs",
            error: err.message
        });
    }
};

// Fetch AWS data from API endpoint
async function fetchAwsDataFromApi(apiUrl) {
    try {
        console.log(`📤 Fetching data from: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, {
            timeout: 30000, // 30 seconds timeout
            headers: {
                'User-Agent': 'AWS-Data-Fetcher/1.0',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.status && response.data.data) {
            console.log(`✅ API Response successful. Records: ${response.data.data.length}`);
            return {
                success: true,
                rowCount: response.data.data.length,
                data: response.data.data,
                message: response.data.message
            };
        } else {
            throw new Error('Invalid API response structure');
        }
    } catch (err) {
        console.error(`❌ Error fetching from ${apiUrl}:`, err.message);
        return {
            success: false,
            data: [],
            message: `Error processing API ${apiUrl}: ${err.message}`
        };
    }
}

// Updated function to process AWS station data from APIs
function processAWSStationDataAndGetBlockData(allStateData) {
    const allBlocks = [];
    
    for (const [stateName, stateInfo] of Object.entries(allStateData)) {
        console.log(`🔄 Processing data for state: ${stateName}`);
        
        if (!stateInfo.success || !stateInfo.data) {
            console.warn(`⚠️ Skipping ${stateName} due to API error: ${stateInfo.message}`);
            continue;
        }

        const awsData = stateInfo.data;
        const blockMap = {};
        let processedRecords = 0;
        
        for (const row of awsData) {
            let blockName, districtName, rainfall;
            
            // Handle different API response structures
            if (stateName.toUpperCase() === 'MEGHALAYA') {
                blockName = row.block?.trim();
                districtName = row.district?.trim();
                rainfall = parseFloat(row.total_rainfall || row.average_rainfall || 0);
            } else if (stateName.toUpperCase() === 'UTTAR_PRADESH') {
                blockName = row.block?.trim();
                districtName = row.district?.trim();
                rainfall = parseFloat(row.rainfall || 0);
            } else if (stateName.toUpperCase() === 'TAMILNADU') {
                blockName = row.block?.trim();
                districtName = row.district?.trim();
                rainfall = parseFloat(row.rainfall || 0);
            }
            
            // Debug logging
            if (processedRecords < 3) {
                console.log(`Sample record ${processedRecords + 1}: Block=${blockName}, District=${districtName}, Rainfall=${rainfall}`);
            }
            
            // Skip invalid records
            if (!blockName || !districtName || isNaN(rainfall)) {
                continue;
            }
            
            const key = `${blockName}__${districtName}`;
            
            if (!blockMap[key]) {
                blockMap[key] = {
                    block_name: blockName,
                    block_code: '',
                    district_name: districtName,
                    district_code: '',
                    state_name: stateName,
                    state_code: '',
                    region_name: '',
                    region_code: '',
                    centre_name: '',
                    centre_type: '',
                    sub_division_code: '',
                    normal_rainfall: null,
                    actuals: []
                };
            }
            
            blockMap[key].actuals.push(rainfall);
            processedRecords++;
        }
        
        console.log(`📊 Processed ${processedRecords} records for ${stateName}, created ${Object.keys(blockMap).length} unique blocks`);
        
        // Process each block
        for (const block of Object.values(blockMap)) {
            const actualSum = block.actuals.reduce((sum, val) => sum + val, 0);
            const actualAvg = actualSum / block.actuals.length;
            
            let departure = null;
            if (block.normal_rainfall !== null) {
                const normalSafe = block.normal_rainfall === 0 ? 0.01 : block.normal_rainfall;
                departure = ((actualAvg - normalSafe) / normalSafe) * 100;
            }
            
            allBlocks.push({
                block_name: block.block_name,
                block_code: block.block_code,
                district_name: block.district_name,
                district_code: block.district_code,
                state_name: block.state_name,
                state_code: block.state_code,
                region_name: block.region_name,
                region_code: block.region_code,
                centre_name: block.centre_name,
                centre_type: block.centre_type,
                sub_division_code: block.sub_division_code,
                normal_rainfall: block.normal_rainfall,
                actual_rainfall: parseFloat(actualAvg.toFixed(2)),
                departure: departure !== null ? parseFloat(departure.toFixed(2)) : null
            });
        }
    }
    
    console.log(`🎯 Total blocks processed: ${allBlocks.length}`);
    return allBlocks;
}

// module.exports = router;
