
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');
const xlsx = require('xlsx');

exports.fetchStationData = async (req, res) => {
    try {
        let { Date } = req.body;

        // Use current date if no dates are provided
        const currentDate = moment().format('YYYY-MM-DD');
        if (!Date ) {
            Date =  currentDate;
        } 

        let data = await fetchFilteredData(Date);

        res.status(200).json({
            success: true,
            message: "Station data fetched Successfully",
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Station data",
            error: error.message,
        });
    }
}

const fetchFilteredData = async (Date) => {
    const query = `
                SELECT ndd.region_code,
                    ndd.region_name,
                    ndd.new_state_code as state_code,
                    ndd.state_name,
                    ndd.district_code,
                    ndd.district_name,
                    sd.station_code,
                    sd.station_name,
                    sd.station_type,
                    sd.centre_type,
                    sd.centre_name,
                    sd.is_new_station,
                    sd.latitude,
                    sd.longitude,
                    sd.activationdate,
                    sdd.data
                FROM public.station_details AS sd
                JOIN public.station_daily_data AS sdd 
                    ON sdd.station_id = sd.station_code
                JOIN normal_district_details AS ndd 
                    ON ndd.district_code = sdd.district_code
                WHERE sdd.collection_date = $1`;

    try {
        const result = await client.query(query, [Date]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}

exports.insertMultipleStations = async(req, res) => {
    try {       
        
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const { centre_type, centre_name} = req.body;

        res.status(200).json({ data: sheetData });

        console.log({sheetData});
    } catch (error) {
        console.error("Error processing request:", error.message);
        res.status(500).json({ error: error.message });
    }
}