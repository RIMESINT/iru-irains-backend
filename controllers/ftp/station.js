const express = require("express");
const router = express.Router();
const app = express();
const moment = require('moment');
const xlsx = require('xlsx');
const client = require("../../connection"); 


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
            SELECT *
            FROM public.station_daily_data as sddf
			join station_details as sd on sd.station_code = sddf.station_id
            WHERE sddf.district_code = ANY($1) 
            AND collection_date BETWEEN $2 AND $3;
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
