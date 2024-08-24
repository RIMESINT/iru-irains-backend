
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');


exports.fetchStateData = async (req, res) => {
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

        // let data = await fetchBetweenDates(startDate, endDate);

        res.status(200).json({
            success: true,
            message: "State data fetched Successfully",
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch State data",
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
            state_name,
            state_code,
			r_code AS region_code,  
            rainfall_normal_value,
            actual_state_rainfall,
            ((actual_state_rainfall - (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) / (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) * 100 AS departure
        FROM (
            SELECT 
                MIN(state_name) AS state_name,
                state_code,
                MIN(r_code) AS r_code,  
                MIN(rainfall_value) AS rainfall_normal_value,
                (SUM(CASE WHEN state_actual_numerator IS NOT NULL THEN state_actual_numerator ELSE 0 END) / 
                    NULLIF(SUM(CASE WHEN state_actual_numerator IS NOT NULL THEN district_area ELSE 0 END), 0)) AS actual_state_rainfall
            FROM (
                SELECT     
                    MIN(name) AS state_name, 
                    MIN(s_code) AS state_code,  
                    MIN(r_code) AS r_code,  
                    MIN(sd_code) AS sd_code,  
                    d_code AS district_code, 
                    d_area AS district_area,
                    SUM(normal_rainfall) AS rainfall_value,
                    SUM(actual_rainfall) AS actual_rainfall_district,
                    (d_area * SUM(actual_rainfall)) AS state_actual_numerator
                FROM (
                    SELECT 
                        ns.date, 
                        MIN(ndd.state_name) AS name, 
                        MIN(new_state_code) AS s_code, 
                        MIN(region_code) AS r_code, 
                        MIN(subdiv_code) AS sd_code, 
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
                        normal_state AS ns
                    ON 
                        ndd.new_state_code = ns.state_code 
                    AND 
                        ns.date = sdd.collection_date
                    WHERE 
                        date BETWEEN $1 AND $2 ${additionalCondition}
                    GROUP BY
                        ndd.district_code,
                        ns.date 
                ) AS sub_query
                GROUP BY
                    d_code,
                    d_area
            ) AS sub2
            GROUP BY
                state_code
        ) AS result
    `;

    try {
        const result = await client.query(query, [startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}

exports.getAllStates = async (req, res) => {
    try {
        const query = `
                        SELECT 
                            MIN(ndd.state_name) AS state_name, 
                            ndd.new_state_code AS state_code, 
                            MIN(ndd.region_name) AS region_name, 
                            MIN(ndd.region_code) AS region_code, 
                            MIN(sd.centre_type) AS centre_type, 
                            MIN(sd.centre_name) AS centre_name
                        FROM 
                            public.station_details AS sd
                        JOIN 
                            normal_district_details AS ndd 
                        ON 
                            ndd.district_code = sd.district_code
                        GROUP BY 
                            ndd.new_state_code;`;
        
        const result = await client.query(query);

        res.status(200).json({
            success: true,
            message: "state list fetched Successfully",
            data: result?.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch state list",
            error: error.message,
        });
    }
}
