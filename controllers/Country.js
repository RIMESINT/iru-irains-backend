
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');


exports.fetchCountryData = async (req, res) => {
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
            message: "Country data fetched Successfully",
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Country data",
            error: error.message,
        });
    }
}

const fetchBetweenDates = async (startDate, endDate) => {
    const query = `
                SELECT 
                    'INDIA' as name,
                    rainfall_normal_value,
                    actual_rainfall,
                CASE 
                        WHEN ((actual_rainfall - (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) / (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) * 100 >= 400 
                THEN 400
                    ELSE ((actual_rainfall - (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) / (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) * 100
                END as departure
                FROM (
                    SELECT 
                        min(rainfall_normal_value) as rainfall_normal_value,
                        avg(actual_rainfall) as actual_rainfall
                    FROM (
                        SELECT 
                            r_code,
                            MIN(rainfall_value) AS rainfall_normal_value,
                            (SUM(actual_numerator) / SUM(CASE WHEN district_area = 0 THEN 0.02 ELSE district_area END)) AS actual_rainfall
                        FROM (
                            SELECT     
                                MIN(r_code) AS r_code,  
                                d_code AS district_code, 
                                d_area AS district_area,
                                SUM(normal_rainfall) AS rainfall_value,
                                SUM(actual_rainfall) AS actual_rainfall_district,
                                (d_area * SUM(actual_rainfall)) AS actual_numerator
                            FROM (
                                SELECT 
                                    nc.date, 
                                    MIN(region_code) AS r_code, 
                                    ndd.district_code AS d_code,     
                                    MIN(district_area) AS d_area,
                                    MIN(rainfall_value) AS normal_rainfall,
                                    AVG(
                                        CASE 
                                            WHEN sdd.data = '-999.9' THEN NULL 
                                            ELSE sdd.data 
                                        END
                                    ) AS actual_rainfall
                                FROM 
                                    station_daily_data AS sdd 
                                JOIN
                                    normal_district_details AS ndd
                                ON 
                                    sdd.district_code = ndd.district_code
                                JOIN
                                    normal_country AS nc
                                ON 
                                    nc.date = sdd.collection_date
                                WHERE 
                                    date BETWEEN $1 AND $2
                                GROUP BY
                                    ndd.district_code,
                                    nc.date 
                            ) AS sub_query
                            GROUP BY
                                d_code,
                                d_area
                        ) AS sub2
                        GROUP BY
                            r_code
                    ) AS sub3
                ) AS result`;

    try {
        const result = await client.query(query, [startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}

