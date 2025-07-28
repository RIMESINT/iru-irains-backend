const express = require("express");
const router = express.Router();
const app = express();
const moment = require('moment');
const xlsx = require('xlsx');
const client = require("../../connection"); 

const ftp = require("basic-ftp");
const path = require("path");
const stream = require("stream");
const csv = require("csv-parser");

const fs = require("fs/promises");
const tmp = require("tmp-promise");


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
    // Validate and normalize input dates to YYYY-MM-DD
    let startDateStr, endDateStr;
    try {
        startDateStr = new Date(startDate).toISOString().split('T')[0]; // e.g., '2025-07-18'
        endDateStr = new Date(endDate).toISOString().split('T')[0];     // e.g., '2025-07-19'
        if (!startDateStr.match(/^\d{4}-\d{2}-\d{2}$/) || !endDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            throw new Error('Invalid date format');
        }
    } catch (error) {
        console.error('Invalid date input:', { startDate, endDate, error: error.message });
        throw new Error('startDate and endDate must be valid dates in YYYY-MM-DD format');
    }

    // Ensure endDate is not before startDate
    if (new Date(endDateStr) < new Date(startDateStr)) {
        console.error('endDate is before startDate:', { startDateStr, endDateStr });
        throw new Error('endDate must be on or after startDate');
    }

    // Log inputs for debugging
    console.log('Raw inputs:', { startDate, endDate, districtCodes });
    console.log('Normalized dates:', { startDate: startDateStr, endDate: endDateStr });

    try {
        // SQL Query with explicit DATE casting in UTC
        const query = `
            SELECT *,
                   DATE(collection_date AT TIME ZONE 'UTC') as date_only
            FROM public.station_daily_data as sddf
            JOIN station_details as sd ON sd.station_code = sddf.station_id
            WHERE sddf.district_code = ANY($1) 
            AND DATE(collection_date AT TIME ZONE 'UTC') >= $2 
            AND DATE(collection_date AT TIME ZONE 'UTC') <= $3;
        `;

        // Log query and parameters
        console.log('Executing SQL query:', query);
        console.log('Query parameters:', { districtCodes, startDate: startDateStr, endDate: endDateStr });

        // Execute the query
        const result = await client.query(query, [districtCodes, startDateStr, endDateStr]);

        // Log result summary
        console.log('Query result row count:', result.rowCount);
        console.log('Query result rows:', result.rows.map(row => ({
            id: row.id,
            collection_date: row.collection_date.toISOString(),
            date_only: row.date_only,
            station_name: row.station_name
        })));

        return result.rows;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};



exports.fetchLatestAwsExcelData = async (req, res) => {
    const { date } = req.body;

    if (!date) {
        return res.status(400).json({
            success: false,
            message: "Date is required in format YYYY-MM-DD"
        });
    }

    console.log("🔌 Connecting to FTP...");
    const client = new ftp.Client();
    client.ftp.verbose = false;

    const [year, month, day] = date.split("-");
    const formattedPath = `2025${month}${day}`;
    const rootPath = "/data/REALTIME/FORECAST/AWS";

    const result = {};

    try {
        await client.access({
            host: "103.215.208.77",
            user: "sasiaffg_imd_ftp",
            password: "IMD:140520:Xchg.ftp",
            secure: false
        });
        console.log("✅ Connected to FTP server");

        // 📍 TELANGANA
        const telanganaPath = `${rootPath}/TELANGANA/${formattedPath}`;
        console.log(`📂 Navigating to ${telanganaPath}`);
        result.TELANGANA = await fetchLatestCsvFromPath(client, telanganaPath);

        // 📍 KARNATAKA
        const karnatakaPath = `${rootPath}/KARNATAKA/${formattedPath}/TRG`;
        console.log(`📂 Navigating to ${karnatakaPath}`);
        result.KARNATAKA = await fetchLatestCsvFromPath(client, karnatakaPath);

        const data = processAWSStationDataAndGetBlockData(result)

        res.status(200).json({
            success: true,
            message: "Latest AWS CSV data fetched",
            data: data
        });

    } catch (err) {
        console.error("❌ FTP error:", err.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch AWS CSV data",
            error: err.message
        });
    } finally {
        client.close();
        console.log("🔌 FTP connection closed");
    }
};

// ✅ Fetch and parse latest CSV from given path
async function fetchLatestCsvFromPath(client, path) {
    try {
        await client.cd(path);
        const files = await client.list();

        const csvFiles = files
            .filter(file => file.name.endsWith(".csv"))
            .sort((a, b) => extractTimeFromFilename(b.name) - extractTimeFromFilename(a.name));

        console.log(`🧾 CSV Files in ${path}:`, csvFiles.map(f => f.name));

        if (csvFiles.length === 0) {
            return {
                filename: null,
                data: [],
                message: `No CSV files found in ${path}`
            };
        }

        const latestFile = csvFiles[0];
        console.log(`📤 Downloading latest CSV: ${latestFile.name}`);

        const tempFile = await tmp.file();
        await client.downloadTo(tempFile.path, latestFile.name);
        const buffer = await fs.readFile(tempFile.path);
        await tempFile.cleanup();

        const data = await parseCsvBuffer(buffer);
        console.log(`✅ Parsed CSV: ${latestFile.name}, Rows: ${data.length}`);

        return {
            filename: latestFile.name,
            rowCount: data.length,
            data
        };
    } catch (err) {
        console.error(`❌ Error in ${path}:`, err.message);
        return {
            filename: null,
            data: [],
            message: `Error processing path ${path}: ${err.message}`
        };
    }
}

// ⏱ Extract numeric time from filename like _0645UTC.csv
function extractTimeFromFilename(filename) {
    const match = filename.match(/_(\d{4})UTC\.csv$/);
    return match ? parseInt(match[1], 10) : 0;
}

// 📄 Parse CSV buffer to JSON rows
async function parseCsvBuffer(buffer) {
    return new Promise((resolve, reject) => {
        const results = [];
        const readable = new stream.Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);

        readable
            .pipe(csv())
            .on("data", row => results.push(row))
            .on("end", () => resolve(results))
            .on("error", err => reject(err));
    });
}






function processAWSStationDataAndGetBlockData(allStateData) {
    const allBlocks = [];

    for (const [stateName, stateInfo] of Object.entries(allStateData)) {
        const csvData = stateInfo.data;
        const blockMap = {};

        for (const row of csvData) {
            const blockName = row.mandal?.trim();
            const districtName = row.district?.trim();
            const rainStr = row.rain?.trim();
            const rain = parseFloat(rainStr);

            if (!blockName || isNaN(rain) || rainStr === "-999.9") continue;

            const key = `${blockName}__${districtName}`;

            if (!blockMap[key]) {
                blockMap[key] = {
                    block_name: blockName,
                    block_code: '',                  // Placeholder
                    district_name: districtName,
                    district_code: '',               // Placeholder
                    state_name: stateName,
                    state_code: '',                  // Placeholder
                    region_name: '',                 // Placeholder
                    region_code: '',                 // Placeholder
                    centre_name: '',                 // Placeholder
                    centre_type: '',                 // Placeholder
                    sub_division_code: '',           // Placeholder
                    normal_rainfall: null,
                    actuals: []
                };
            }

            blockMap[key].actuals.push(rain);
        }

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

    return allBlocks;
}