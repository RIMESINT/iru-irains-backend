
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

        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        let data = await fetchBetweenDates(startDate, endDate, currentDate, specificDateTime);

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

const fetchBetweenDates = async (startDate, endDate, currentDate, specificDateTime) => {
    let additionalCondition = '';
    if (endDate === currentDate) {
        additionalCondition = ` AND updated_at < '${specificDateTime}'`;
    }

    const query = `
      SELECT 
            min(d_name) as district_name,
            min(s_code) as state_code,
            min(r_code) as region_code,
            min(sd_code) as sub_division_code,
            sum(normal_rainfall) as normal_rainfall,
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
                date BETWEEN $1 AND $2 ${additionalCondition}
            GROUP BY 
                ndd.district_code, 
                date
        ) as test
        GROUP BY 
            district_code;
    `;

    console.log(query);

    try {
        const result = await client.query(query, [startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}

exports.getAllDistrict = async (req, res) => {
    try {
        const query = `
                        SELECT 
                            ndd.district_name, 
                            ndd.district_code, 
                            MIN(subdiv_name), 
                            MIN(subdiv_code), 
                            MIN(region_name), 
                            MIN(region_code), 
                            MIN(state_name), 
                            MIN(new_state_code) AS state_code,
                            MIN(sd.centre_type) AS centre_type, 
                            MIN(sd.centre_name) AS centre_name
                        FROM 
                            public.station_details AS sd
                        JOIN 
                            normal_district_details AS ndd 
                        ON 
                            ndd.district_code = sd.district_code
                        GROUP BY
                            ndd.district_code, 
                            ndd.district_name
                        ORDER BY
                            district_code;

                        `;
        
        const result = await client.query(query);

        res.status(200).json({
            success: true,
            message: "District list fetched Successfully",
            data: result?.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch District list",
            error: error.message,
        });
    }
}
