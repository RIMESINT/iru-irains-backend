
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');


exports.fetchRegionData = async (req, res) => {
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

        // let data = await fetchBetweenDates(startDate, endDate);

        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        let data = await fetchBetweenDates(startDate, endDate, currentDate, specificDateTime);

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

const fetchBetweenDates = async (startDate, endDate, currentDate, specificDateTime) => {
    let additionalCondition = '';
    if (endDate === currentDate) {
        additionalCondition = ` AND updated_at < '${specificDateTime}'`;
    }
    const query = `
                 SELECT *,
    ((actual_rainfall - 
        (CASE 
            WHEN rainfall_normal_value = 0 THEN 0.01 
            ELSE rainfall_normal_value 
        END)) / 
        (CASE 
            WHEN rainfall_normal_value = 0 THEN 0.01 
            ELSE rainfall_normal_value 
        END)) * 100 AS departure
FROM (
    SELECT  
        MIN(name) AS name,
        MIN(r_code) AS r_code,
        (SUM(CASE 
                WHEN actual_reg_num IS NOT NULL THEN actual_reg_num 
                ELSE 0 
            END) / 
        NULLIF(SUM(CASE 
                    WHEN actual_reg_num IS NOT NULL THEN s_w 
                    ELSE 0 
                END), 0)) AS actual_rainfall,
        MIN(rainfall_normal_value) AS rainfall_normal_value
    FROM (
        SELECT 
            name,
            r_code,
            s_w,
            rainfall_normal_value,
            actual_subdiv_rainfall * s_w AS actual_reg_num
        FROM (
            SELECT 
                MIN(name) AS name,
                s_code,
                MIN(s_w) AS s_w,
                MIN(r_code) AS r_code,
                MIN(rainfall_value) AS rainfall_normal_value,
                (SUM(CASE 
                        WHEN subdiv_actual_numerator IS NOT NULL THEN subdiv_actual_numerator 
                        ELSE 0 
                    END) / 
                NULLIF(SUM(CASE 
                            WHEN subdiv_actual_numerator IS NOT NULL THEN district_area 
                            ELSE 0 
                        END), 0)) AS actual_subdiv_rainfall
            FROM (
                SELECT 	
                    MIN(name) AS name, 
                    MIN(s_code) AS s_code,  
                    MIN(r_code) AS r_code,  
                    d_code AS district_code, 
                    SUM(normal_rainfall) AS rainfall_value,
                    SUM(actual_rainfall) AS actual_rainfall_district,
                    d_area AS district_area,
                    MIN(s_w) AS s_w,
                    (d_area * SUM(actual_rainfall)) AS subdiv_actual_numerator
                FROM (
                    SELECT 
                        ns.date, 
                        MIN(ndd.region_name) AS name, 
                        MIN(subdiv_code) AS s_code, 
                        MIN(region_code) AS r_code, 
                        ndd.district_code AS d_code,
                        MIN(subdiv_weight) AS s_w,
                        CASE 
                            WHEN ndd.district_code IN (30506001, 30506002) THEN 0 
                            ELSE MIN(district_area) 
                        END AS d_area,
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
                        normal_region AS ns
                    ON 
                        ndd.region_code = ns.region_id
                    AND 
                        ns.date = sdd.collection_date
                    WHERE  
                        ns.date BETWEEN $1 AND $2 
                    GROUP BY
                        ndd.district_code,
                        ns.date
                ) AS sub_query2
                GROUP BY
                    d_code,
                    d_area
            ) AS sub2
            GROUP BY
                s_code
        ) AS result
    ) AS subquery
    GROUP BY 
        r_code
) AS final_subquery;`;

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




exports.fetchCummulativeRegionData = async (req, res) => {
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

        let data = await fetchCummulativeBetweenDates(startDate, endDate);

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

const fetchCummulativeBetweenDates = async (startDate, endDate) => {
    const query = `
    SELECT *,
	date,
    ((actual_rainfall - 
        (CASE 
            WHEN rainfall_normal_value = 0 THEN 0.01 
            ELSE rainfall_normal_value 
        END)) / 
        (CASE 
            WHEN rainfall_normal_value = 0 THEN 0.01 
            ELSE rainfall_normal_value 
        END)) * 100 AS departure
FROM (
    SELECT  date,
        MIN(name) AS name,
        MIN(r_code) AS r_code,
        sum((SUM(CASE 
                WHEN actual_reg_num IS NOT NULL THEN actual_reg_num 
                ELSE 0 
            END) / 
        NULLIF(SUM(CASE 
                    WHEN actual_reg_num IS NOT NULL THEN s_w 
                    ELSE 0 
                END), 0))) OVER (PARTITION BY r_code ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS actual_rainfall,
        sum(MIN(rainfall_normal_value)) OVER (PARTITION BY r_code ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS rainfall_normal_value
    FROM (
        SELECT 
            date,
			name,
            r_code,
            s_w,
            rainfall_normal_value,
            actual_subdiv_rainfall * s_w AS actual_reg_num
        FROM (
            SELECT 
                date,
				MIN(name) AS name,
                s_code,
                MIN(s_w) AS s_w,
                MIN(r_code) AS r_code,
                MIN(rainfall_value) AS rainfall_normal_value,
                (SUM(CASE 
                        WHEN subdiv_actual_numerator IS NOT NULL THEN subdiv_actual_numerator 
                        ELSE 0 
                    END) / 
                NULLIF(SUM(CASE 
                            WHEN subdiv_actual_numerator IS NOT NULL THEN district_area 
                            ELSE 0 
                        END), 0)) AS actual_subdiv_rainfall
            FROM (
                SELECT 	
					date,
                    MIN(name) AS name, 
                    MIN(s_code) AS s_code,  
                    MIN(r_code) AS r_code,  
                    d_code AS district_code, 
                    SUM(normal_rainfall) AS rainfall_value,
                    SUM(actual_rainfall) AS actual_rainfall_district,
                    d_area AS district_area,
                    MIN(s_w) AS s_w,
                    (d_area * SUM(actual_rainfall)) AS subdiv_actual_numerator
                FROM (
                    SELECT 
                        ns.date, 
                        MIN(ndd.region_name) AS name, 
                        MIN(subdiv_code) AS s_code, 
                        MIN(region_code) AS r_code, 
                        ndd.district_code AS d_code,
                        MIN(subdiv_weight) AS s_w,
                        CASE 
                            WHEN ndd.district_code IN (30506001, 30506002) THEN 0 
                            ELSE MIN(district_area) 
                        END AS d_area,
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
                        normal_region AS ns
                    ON 
                        ndd.region_code = ns.region_id
                    AND 
                        ns.date = sdd.collection_date
                    WHERE  
                        ns.date BETWEEN $1 AND $2
                    GROUP BY
                        ndd.district_code,
                        ns.date
                ) AS sub_query2
                GROUP BY
                    d_code,
                    d_area,
					date
            ) AS sub2
            GROUP BY
                s_code,
				date
        ) AS result
    ) AS subquery
    GROUP BY 
        r_code,
		date
) AS final_subquery;
`;

    try {
        const result = await client.query(query, [startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}

