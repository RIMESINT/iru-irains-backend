
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../../connection");
const moment = require('moment');


exports.fetchRegionDataFtp = async (req, res) => {
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
            message: "Region data fetched Successfully",
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Region data",
            error: error.message,
        });
    }
}

const fetchBetweenDates = async (startDate, endDate) => {
    const query = `
                SELECT 
                    name,
                    r_code,
                    rainfall_normal_value,
                    actual_rainfall,
                    ((actual_rainfall - (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) / (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) * 100 AS departure
                FROM (
                    SELECT 
                        MIN(name) AS name,
                        r_code,
                        MIN(rainfall_value) AS rainfall_normal_value,
                        (SUM(CASE WHEN actual_numerator IS NOT NULL THEN actual_numerator ELSE 0 END) / 
                            NULLIF(SUM(CASE WHEN actual_numerator IS NOT NULL THEN district_area ELSE 0 END), 0)) AS actual_rainfall
                    FROM (
                        SELECT     
                            MIN(name) AS name, 
                            MIN(r_code) AS r_code,  
                            d_code AS district_code, 
                            d_area AS district_area,
                            SUM(normal_rainfall) AS rainfall_value,
                            SUM(actual_rainfall) AS actual_rainfall_district,
                            (d_area * SUM(actual_rainfall)) AS actual_numerator
                        FROM (
                            SELECT 
                                nr.date, 
                                MIN(ndd.region_name) AS name, 
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
                                station_daily_data_ftp AS sdd 
                            JOIN
                                normal_district_details AS ndd
                            ON 
                                sdd.district_code = ndd.district_code
                            JOIN
                                normal_region AS nr
                            ON 
                                ndd.region_code = nr.region_id
                            AND 
                                nr.date = sdd.collection_date
                            WHERE 
                                date BETWEEN $1 AND $2
                            GROUP BY
                                ndd.district_code,
                                nr.date 
                        ) AS sub_query
                        GROUP BY
                            d_code,
                            d_area
                    ) AS sub2
                    GROUP BY
                        r_code
                ) AS result`;

    try {
        const result = await client.query(query, [startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}

exports.getAllRegions = async (req, res) => {
    try {
        const query = `
                    SELECT 
                        region_name,region_code 
                    FROM 
                        public.normal_district_details
                    GROUP BY 
                        region_code, region_name
                    `;
        
        const result = await client.query(query);

        res.status(200).json({
            success: true,
            message: "Region list fetched Successfully",
            data: result?.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Region list",
            error: error.message,
        });
    }
}