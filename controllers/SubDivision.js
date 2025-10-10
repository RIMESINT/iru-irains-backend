
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

        // let data = await fetchBetweenDates(startDate, endDate);

        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        let data = await fetchBetweenDates(startDate, endDate, currentDate, specificDateTime);

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

// --------------------------------- Previous Formula ---------------------------------------

// const fetchBetweenDates = async (startDate, endDate, currentDate, specificDateTime) => {
//     let additionalCondition = '';
//     if (endDate === currentDate) {
//         additionalCondition = ` AND updated_at < '${specificDateTime}'`;
//     }
// const query = `
//        select 
//         name as subdiv_name,
//         s_code ,
//         r_code as region_code,
//         rainfall_normal_value,
//         actual_subdiv_rainfall,
//         ((actual_subdiv_rainfall - (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) / (CASE WHEN rainfall_normal_value = 0 THEN 0.01 ELSE rainfall_normal_value END)) * 100 as departure
//     From (
//         select 
//             min(name) as name,
//             s_code,
//             min(r_code) as r_code,
//             min(rainfall_value) as rainfall_normal_value,
//             (SUM(CASE WHEN subdiv_actual_numerator IS NOT NULL THEN subdiv_actual_numerator ELSE 0 END) / 
//                     NULLIF(SUM(CASE WHEN subdiv_actual_numerator IS NOT NULL THEN district_area ELSE 0 END), 0)) AS actual_subdiv_rainfall
//         FROM (
//                 select 	
//                     min(name) as name, 
//                     min(s_code) as s_code,  
//                     min(r_code) as r_code,  
//                     d_code as district_code, 
//                     sum(normal_rainfall) as rainfall_value,
//                      sum(actual_rainfall) as actual_rainfall_district,
// 					d_area as district_area,
//                     (d_area*sum(actual_rainfall)) as subdiv_actual_numerator
//                     from (
//                         SELECT 
//                             ns.date, 
//                             MIN(ndd.subdiv_name) AS name, 
//                             MIN(subdiv_code) AS s_code, 
//                             MIN(region_code) AS r_code, 
//                             ndd.district_code AS d_code,
//                             -- min(district_area) as d_area,
// 							 CASE 
//                         WHEN ndd.district_code IN (30506001, 30506002) THEN 0 
//                         ELSE MIN(district_area) 
//                     END AS d_area,
//                             MIN(ns.rainfall_value) AS normal_rainfall,
//                             AVG(
//                                 CASE 
//                                     WHEN sdd.data = '-999.9' THEN NULL 
//                                     ELSE sdd.data 
//                                 END
//                             ) AS actual_rainfall
//                         FROM 
//                             station_daily_data AS sdd 
//                         JOIN
//                             normal_district_details AS ndd
//                         ON 
//                             sdd.district_code = ndd.district_code
//                         JOIN
//                             normal_sub_division AS ns
//                         ON 
//                             ndd.subdiv_code = ns.sub_division_id
//                         AND 
//                             ns.date = sdd.collection_date
//                         WHERE 
//                             ns.date BETWEEN $1 AND $2 
//                         GROUP BY
//                             ndd.district_code,
//                             ns.date
//                             ) as sub_query2
//                             GROUP BY
//                                 d_code,
//                                 d_area
//                                 ) as sub2
//                             GROUP BY
//                                 s_code
//                         )
//                         as result`;
//                         // exception : we have to use 0 area for this two district 30506001, 30506002 for subdiv calculation 

//     try {
//         const result = await client.query(query, [startDate, endDate]);
//         return result.rows;
//     } catch (error) {
//         console.error('Error executing query', error.stack);
//         throw error;
//     }
// }

// ------------------------------------------------------------------------------------------


const fetchBetweenDates = async (startDate, endDate, currentDate, specificDateTime) => {
    let additionalCondition = '';
    if (endDate === currentDate) {
        additionalCondition = ` AND updated_at < '${specificDateTime}'`;
    }
const query = `
        WITH daily_subdiv_actuals AS (
            SELECT 
                ndd.subdiv_code AS s_code,
                MIN(ndd.subdiv_name) AS subdiv_name,
                MIN(ndd.region_code) AS r_code,
                ndd.district_code AS d_code,
                CASE 
                    WHEN ndd.district_code IN (30506001, 30506002) THEN 0
                    ELSE MIN(ndd.district_area)
                END AS district_area,
                sdd.collection_date,
                AVG(
                    CASE 
                        WHEN sdd.data::numeric = -999.9 THEN NULL 
                        WHEN sdd.data::numeric < 0 THEN NULL  -- ✅ filter out negative rainfall
                        ELSE sdd.data::numeric
                    END
                ) AS daily_avg_rainfall
            FROM station_daily_data sdd
            JOIN normal_district_details ndd 
                ON sdd.district_code = ndd.district_code
            WHERE 
                sdd.collection_date BETWEEN $1 AND $2
            GROUP BY 
                sdd.collection_date, ndd.district_code, ndd.subdiv_code
        ),

        subdiv_district_totals AS (
            SELECT
                s_code,
                subdiv_name,
                r_code,
                d_code,
                district_area,
                SUM(daily_avg_rainfall) AS total_actual_rainfall
            FROM daily_subdiv_actuals
            GROUP BY s_code, subdiv_name, r_code, d_code, district_area
        ),

        subdiv_actuals AS (
            SELECT
                s_code,
                subdiv_name,
                r_code,
                SUM(total_actual_rainfall * district_area) / NULLIF(SUM(district_area), 0) AS actual_subdiv_rainfall
            FROM subdiv_district_totals
            GROUP BY s_code, subdiv_name, r_code
        ),

        subdiv_normals AS (
            SELECT 
                sub_division_id AS s_code,
                SUM(rainfall_value) AS rainfall_normal_value
            FROM normal_sub_division
            WHERE date BETWEEN $1 AND $2
            GROUP BY sub_division_id
        )

        SELECT 
            sa.subdiv_name,
            sa.s_code,
            sa.r_code AS region_code,
            sn.rainfall_normal_value,
            sa.actual_subdiv_rainfall,
            CASE
                WHEN sa.actual_subdiv_rainfall IS NULL THEN NULL
                WHEN sa.actual_subdiv_rainfall = 0 THEN -100
                ELSE (
                    (sa.actual_subdiv_rainfall - 
                    CASE WHEN sn.rainfall_normal_value = 0 THEN 0.01 ELSE sn.rainfall_normal_value END) /
                    CASE WHEN sn.rainfall_normal_value = 0 THEN 0.01 ELSE sn.rainfall_normal_value END
                ) * 100
            END AS departure
        FROM subdiv_actuals sa
        LEFT JOIN subdiv_normals sn ON sa.s_code = sn.s_code;

        `;
                        // exception : we have to use 0 area for this two district 30506001, 30506002 for subdiv calculation 

    try {
        const result = await client.query(query, [startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}


exports.getAllSubDivisions = async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT
                subdiv_name, 
                subdiv_code, 
                region_name, 
                region_code
            FROM 
                public.normal_district_details
            ORDER BY
                subdiv_code
        `;
        
        const result = await client.query(query);

        res.status(200).json({
            success: true,
            message: "Sub divisions list fetched Successfully",
            data: result?.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Sub divisions list",
            error: error.message,
        });
    }
};


exports.fetchSubDivisionDataAforAPIexport = async (req, res) => {
    try {
        let { user, pass, fromDate, toDate } = req.body;

        // 🔐 Validate credentials
        if (user !== "CWC_DEP" || pass !== "!Md@15O#cwc") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid credentials"
            });
        }

        // ✅ Handle dates
        const currentDate = moment().format("YYYY-MM-DD");
        if (!fromDate && !toDate) {
            fromDate = toDate = currentDate;
        } else if (!fromDate) {
            fromDate = toDate;
        } else if (!toDate) {
            toDate = fromDate;
        }

        // Ensure fromDate <= toDate
        if (moment(fromDate).isAfter(toDate)) {
            return res.status(400).json({
                success: false,
                message: "fromDate should be less than or equal to toDate"
            });
        }

        // Specific cutoff time
        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        // 📊 Fetch subdivision data (reusing same query logic)
        let data = await fetchBetweenDates(fromDate, toDate, currentDate, specificDateTime);

        return res.status(200).json({
            success: true,
            message: "Subdivision data fetched successfully",
            data: data
        });

    } catch (error) {
        console.error("Error in fetchSubDivisionDataAforAPIexport:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch Subdivision data",
            error: error.message
        });
    }
};



// Export the fetchBetweenDates function for use in other modules  
module.exports.fetchBetweenDates = fetchBetweenDates;
