
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');


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


exports.updateStationData = async (req, res) => {
    try {
        let { station_code, date, value } = req.body;
        if(station_code && date && (value||value==0) ){
            let data = await updateStationDataQuery(station_code, date, value );

            res.status(200).json({
                success: true,
                message: " data updated Successfully",
            });

        }else{
            res.status(200).json({
                success: false,
                message: "request pearmeters are missing",
            });
        }



        
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
                    ndd.new_state_code,
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

const updateStationDataQuery = async (station_code, date, value ) => {
    const query = `
                Update public.station_daily_data set data =$1
                WHERE collection_date = $2 and station_id = $3;`;  

    try {
        const result = await client.query(query, [value, date,station_code ]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}

