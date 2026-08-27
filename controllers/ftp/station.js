const express = require("express");
const router = express.Router();
const app = express();
const moment = require('moment');
const xlsx = require('xlsx');
const client = require("../../connection");
const axios = require('axios'); // Add axios for API calls
const { getExclusionWindows } = require("../utils/exclusionSql");
const QueryStream = require('pg-query-stream');

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
// Every YYYY-MM-DD from startDate to endDate inclusive, walked in UTC so a
// server running in IST cannot skip or repeat a day.
const buildDateRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(`${startDate}T00:00:00Z`);
    const last = new Date(`${endDate}T00:00:00Z`);
    while (current <= last) {
        dates.push(current.toISOString().slice(0, 10));
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return dates;
};

// Returns the station-by-date grid the UI renders directly:
//   { columns: [...meta fields, ...dates], rows: [{ ...meta, '2026-01-01': 0.0, ... }] }
// The daily readings are streamed and pivoted here rather than sent one row per
// station-per-day. The old flat shape repeated each station's name/district/lat/lon
// on all 239 rows of a long range, which pushed the response past V8's max string
// length and made res.json throw "RangeError: Invalid string length".
const fetchFilteredStationUnifiedFile = async (startDate, endDate, districtCodes) => {
    try {
        // Station metadata once per station instead of once per reading. The inner
        // join to normal_district_details mirrors the original query, so any station
        // missing from this map is one the old join would have dropped anyway.
        const metaResult = await client.query(`
            SELECT
                sd.station_code,
                sd.station_name,
                sd.latitude,
                sd.longitude,
                sd.block_name,
                sd.block_code,
                ndd.district_name,
                ndd.state_name
            FROM station_details AS sd
            JOIN normal_district_details ndd ON ndd.district_code = sd.district_code
            WHERE sd.flag != 0
            ORDER BY ndd.state_name, ndd.district_name, sd.block_name, sd.station_name
        `);

        const meta = new Map();
        for (const row of metaResult.rows) {
            meta.set(String(row.station_code), row);
        }

        const { byStation, byDistrict, byBlock } = await getExclusionWindows(startDate, endDate);
        const inWindow = (windows, date) =>
            windows && windows.some(w => date >= w.from && date <= w.to);

        const dates = buildDateRange(startDate, endDate);
        const dateIndex = new Map(dates.map((d, i) => [d, i]));

        const values = new Map();   // station_code -> values positioned by dateIndex
        const seenDates = new Set();

        // Streamed so the 1.6M readings of a long range never sit in memory at once.
        const stream = client.query(new QueryStream(`
            SELECT
                sddf.station_id,
                sddf.district_code,
                sddf.data,
                TO_CHAR(sddf.collection_date, 'YYYY-MM-DD') AS collection_date
            FROM public.station_daily_data AS sddf
            WHERE sddf.district_code = ANY($1)
            AND sddf.collection_date BETWEEN $2 AND $3
        `, [districtCodes, startDate, endDate], { batchSize: 10000 }));

        for await (const row of stream) {
            const stationId = String(row.station_id);
            const stationMeta = meta.get(stationId);
            if (!stationMeta) continue;

            const index = dateIndex.get(row.collection_date);
            if (index === undefined) continue;

            let stationValues = values.get(stationId);
            if (!stationValues) {
                stationValues = new Array(dates.length).fill(null);
                values.set(stationId, stationValues);
            }

            // Same -999.9 sentinel applyExclusions writes for a covered window
            const excluded =
                inWindow(byStation.get(stationId), row.collection_date) ||
                inWindow(byDistrict.get(String(row.district_code)), row.collection_date) ||
                inWindow(byBlock.get(String(stationMeta.block_code)), row.collection_date);

            stationValues[index] = excluded ? '-999.9' : row.data;
            seenDates.add(index);
        }

        // Only dates that actually carry a reading become columns, matching the
        // uniqueDates the UI used to derive from the flat rows.
        const activeIndexes = [...seenDates].sort((a, b) => a - b);
        const activeDates = activeIndexes.map(i => dates[i]);

        const rows = [];
        for (const [stationId, stationMeta] of meta) {
            const stationValues = values.get(stationId);
            if (!stationValues) continue;   // no readings in range, as before

            const row = {
                state_name: stationMeta.state_name,
                district_name: stationMeta.district_name,
                block_name: stationMeta.block_name,
                block_code: stationMeta.block_code,
                station_name: stationMeta.station_name,
                station_id: stationId,
                latitude: Number(parseFloat(stationMeta.latitude).toFixed(4)),
                longitude: Number(parseFloat(stationMeta.longitude).toFixed(4)),
            };
            for (let i = 0; i < activeIndexes.length; i++) {
                row[activeDates[i]] = stationValues[activeIndexes[i]];
            }
            rows.push(row);
        }

        return {
            columns: [
                "state_name", "district_name", "block_name", "station_name",
                "station_id", "latitude", "longitude",
                ...activeDates,
            ],
            rows,
        };
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
