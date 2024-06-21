
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');


exports.fetchSubDivisionData = async (req, res) => {
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
            message: "Sub division data fetched Successfully",
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Sub division data",
            error: error.message,
        });
    }
}

const fetchBetweenDates = async (startDate, endDate) => {
    const query = `
        select 
        name as subdiv_name,
        s_code ,
        r_code as region_code,
        rainfall_normal_value,
        actual_subdiv_rainfall,
        ((actual_subdiv_rainfall - (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) / (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) * 100 as departure
    From (
        select 
            min(name) as name,
            s_code,
            min(r_code) as r_code,
            min(rainfall_value) as rainfall_normal_value,
            (SUM(subdiv_actual_numerator) / NULLIF(SUM(district_area), 0)) AS actual_subdiv_rainfall
        FROM (
                select 	
                    min(name) as name, 
                    min(s_code) as s_code,  
                    min(r_code) as r_code,  
                    d_code as district_code, 
                    sum(normal_rainfall) as rainfall_value,
                    sum(actual_rainfall) as actual_rainfall_district,
                    d_area as district_area,
                    (d_area*sum(actual_rainfall)) as subdiv_actual_numerator
                    from (
                        SELECT 
                            ns.date, 
                            MIN(ndd.subdiv_name) AS name, 
                            MIN(subdiv_code) AS s_code, 
                            MIN(region_code) AS r_code, 
                            ndd.district_code AS d_code,
                            min(district_area) as d_area,
                            MIN(ns.rainfall_value) AS normal_rainfall,
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
                            normal_sub_division AS ns
                        ON 
                            ndd.subdiv_code = ns.sub_division_id
                        AND 
                            ns.date = sdd.collection_date
                        WHERE 
                            ns.date BETWEEN $1 AND $2
                        GROUP BY
                            ndd.district_code,
                            ns.date
                            ) as sub_query2
                            GROUP BY
                                d_code,
                                d_area
                                ) as sub2
                            GROUP BY
                                s_code
                        )
                        as result`;

    try {
        const result = await client.query(query, [startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}

