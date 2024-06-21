
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');


exports.fetchDistrictData = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;

        // Use current date if no dates are provided
        const currentDate = moment().format('YYYY-MM-DD');
        if (!startDate && !endDate) {
            startDate = endDate = currentDate;
        } else if (!startDate) {
            startDate = endDate;
        } else if (!endDate) {
            endDate = startDate;
        }

        // Ensure startDate is less than or equal to endDate
        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate",
            });
        }

        let data = await fetchBetweenDates(startDate, endDate);

        res.status(200).json({
            success: true,
            message: "District data fetched Successfully",
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch District data",
            error: error.message,
        });
    }
}

const fetchBetweenDates = async (startDate, endDate) => {
    const query = `
       SELECT 
            min(d_name) as district_name,
            min(s_code) as state_code,
            min(r_code) as region_code,
            min(sd_code) as sub_division_code,
            min(normal_rainfall) as normal_rainfall,
            district_code,
            sum(actual_rainfall) as actual_rainfall,
            ((sum(actual_rainfall) - sum(CASE WHEN normal_rainfall = 0 THEN 0.01 ELSE normal_rainfall END)) / sum(CASE WHEN normal_rainfall = 0 THEN 0.01 ELSE normal_rainfall END)) * 100 as departure
        FROM (
            SELECT 
                date,
                min(rainfall_value) as normal_rainfall, 
                min(ndd.district_name) as d_name,
                ndd.district_code,
                min(ndd.new_state_code) as s_code,
                min(ndd.region_code) as r_code,
                min(ndd.subdiv_code) as sd_code,
                avg(
                    CASE 
                        WHEN sdd.data = '-999.9' THEN NULL 
                        ELSE sdd.data 
                    END
                ) as actual_rainfall
            FROM 
                public.normal_district nd
            JOIN 
                public.normal_district_details ndd
                ON nd.normal_district_details_id = ndd.id
            JOIN 
                public.station_daily_data sdd 
                ON ndd.district_code = sdd.district_code 
                AND sdd.collection_date = nd.date
            WHERE 
                date BETWEEN $1 AND $2
            GROUP BY 
                ndd.district_code, 
                date
        ) as test
        GROUP BY 
            district_code;
    `;

    try {
        const result = await client.query(query, [startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}
