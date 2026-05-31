
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');
const awsCtrl      = require('./AwsInclusiveControllers');
const { isAwsEnabled } = require('../utils/calculationsMode');


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

        // let data = await fetchBetweenDates(startDate, endDate);
        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        let data = await fetchBetweenDates(startDate, endDate, currentDate, specificDateTime);

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


// --------------------------------- Previous Formula ---------------------------------------
// const fetchBetweenDates = async (startDate, endDate, currentDate, specificDateTime) => {
//     let additionalCondition = '';
//     if (endDate === currentDate) {
//         additionalCondition = ` AND updated_at < '${specificDateTime}'`;
//     }
//     const query = `
//                 SELECT *,
// 	'INDIA' as name,
//     ((actual_rainfall - 
//         (CASE 
//             WHEN rainfall_normal_value = 0 THEN 0.01 
//             ELSE rainfall_normal_value 
//         END)) / 
//         (CASE 
//             WHEN rainfall_normal_value = 0 THEN 0.01 
//             ELSE rainfall_normal_value 
//         END)) * 100 AS departure
// FROM (
//     SELECT 
//         (SUM(CASE 
//                 WHEN actual_rainfall IS NOT NULL THEN actual_rainfall 
//                 ELSE 0 
//             END) / 
//         NULLIF(SUM(CASE 
//                     WHEN actual_rainfall IS NOT NULL THEN s_w 
//                     ELSE 0 
//                 END), 0)) AS actual_rainfall,
//         MIN(rainfall_normal_value) AS rainfall_normal_value
//     FROM (
//         SELECT 
//             actual_rainfall * s_w AS actual_rainfall,
//             s_w,
//             rainfall_normal_value
//         FROM (
//             SELECT  
//                 SUM(s_w) AS s_w,
//                 (SUM(CASE 
//                         WHEN actual_reg_num IS NOT NULL THEN actual_reg_num 
//                         ELSE 0 
//                     END) / 
//                 NULLIF(SUM(CASE 
//                             WHEN actual_reg_num IS NOT NULL THEN s_w 
//                             ELSE 0 
//                         END), 0)) AS actual_rainfall,
//                 MIN(rainfall_normal_value) AS rainfall_normal_value
//             FROM (
//                 SELECT 
//                     r_code,
//                     s_w,
//                     rainfall_normal_value,
//                     actual_subdiv_rainfall * s_w AS actual_reg_num
//                 FROM (
//                     SELECT 
//                         s_code,
//                         MIN(s_w) AS s_w,
//                         MIN(r_code) AS r_code,
//                         MIN(rainfall_value) AS rainfall_normal_value,
//                         (SUM(CASE 
//                                 WHEN subdiv_actual_numerator IS NOT NULL THEN subdiv_actual_numerator 
//                                 ELSE 0 
//                             END) / 
//                         NULLIF(SUM(CASE 
//                                     WHEN subdiv_actual_numerator IS NOT NULL THEN district_area 
//                                     ELSE 0 
//                                 END), 0)) AS actual_subdiv_rainfall
//                     FROM (
//                         SELECT 	
//                             MIN(s_code) AS s_code,  
//                             MIN(r_code) AS r_code,  
//                             d_code AS district_code, 
//                             SUM(normal_rainfall) AS rainfall_value,
//                             SUM(actual_rainfall) AS actual_rainfall_district,
//                             d_area AS district_area,
//                             MIN(s_w) AS s_w,
//                             (d_area * SUM(actual_rainfall)) AS subdiv_actual_numerator
//                         FROM (
//                             SELECT 
//                                 ns.date, 
//                                 MIN(subdiv_code) AS s_code, 
//                                 MIN(region_code) AS r_code, 
//                                 ndd.district_code AS d_code,
//                                 MIN(subdiv_weight) AS s_w,
//                                 CASE 
//                                     WHEN ndd.district_code IN (30506001, 30506002) THEN 0 
//                                     ELSE MIN(district_area) 
//                                 END AS d_area,
//                                 MIN(ns.rainfall_value) AS normal_rainfall,
//                                 AVG(
//                                     CASE 
//                                         WHEN sdd.data = '-999.9' THEN NULL 
//                                         ELSE sdd.data 
//                                     END
//                                 ) AS actual_rainfall
//                             FROM 
//                                 station_daily_data AS sdd 
//                             JOIN
//                                 normal_district_details AS ndd
//                             ON 
//                                 sdd.district_code = ndd.district_code
//                             JOIN
//                                 normal_country AS ns
//                             ON 
//                                 ns.date = sdd.collection_date
//                             WHERE  
//                                 ns.date BETWEEN $1 AND $2 
//                             GROUP BY
//                                 ndd.district_code,
//                                 ns.date
//                         ) AS sub_query2
//                         GROUP BY
//                             d_code,
//                             d_area
//                     ) AS sub2
//                     GROUP BY
//                         s_code
//                 ) AS result
//             ) AS subquery
//             GROUP BY 
//                 r_code
//         ) AS final_subquery
//     )
// ) AS outer_query;`;

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
    WITH summed_normal AS (
        SELECT 
            SUM(rainfall_value) AS rainfall_normal_value
        FROM normal_country
        WHERE date BETWEEN $1 AND $2
          AND country_name = 'INDIA'
    )
    
    SELECT 
        *,
        'INDIA' AS name,
        ((actual_rainfall - 
            (CASE 
                WHEN summed_normal.rainfall_normal_value = 0 THEN 0.01 
                ELSE summed_normal.rainfall_normal_value 
            END)) / 
            (CASE 
                WHEN summed_normal.rainfall_normal_value = 0 THEN 0.01 
                ELSE summed_normal.rainfall_normal_value 
            END)) * 100 AS departure
    FROM (
        SELECT 
            (SUM(CASE 
                    WHEN actual_rainfall IS NOT NULL THEN actual_rainfall 
                    ELSE 0 
                END) / 
            NULLIF(SUM(CASE 
                        WHEN actual_rainfall IS NOT NULL THEN s_w 
                        ELSE 0 
                    END), 0)) AS actual_rainfall
        FROM (
            SELECT 
                actual_rainfall * s_w AS actual_rainfall,
                s_w
            FROM (
                SELECT  
                    SUM(s_w) AS s_w,
                    (SUM(CASE 
                            WHEN actual_reg_num IS NOT NULL THEN actual_reg_num 
                            ELSE 0 
                        END) / 
                    NULLIF(SUM(CASE 
                                WHEN actual_reg_num IS NOT NULL THEN s_w 
                                ELSE 0 
                            END), 0)) AS actual_rainfall
                FROM (
                    SELECT 
                        r_code,
                        s_w,
                        actual_subdiv_rainfall * s_w AS actual_reg_num
                    FROM (
                        SELECT 
                            s_code,
                            MIN(s_w) AS s_w,
                            MIN(r_code) AS r_code,
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
                                MIN(s_code) AS s_code,  
                                MIN(r_code) AS r_code,  
                                d_code AS district_code, 
                                SUM(actual_rainfall) AS actual_rainfall_district,
                                d_area AS district_area,
                                MIN(s_w) AS s_w,
                                (d_area * SUM(actual_rainfall)) AS subdiv_actual_numerator
                            FROM (
                                SELECT 
                                    ns.date, 
                                    MIN(subdiv_code) AS s_code, 
                                    MIN(region_code) AS r_code, 
                                    ndd.district_code AS d_code,
                                    MIN(subdiv_weight) AS s_w,
                                    CASE 
                                        WHEN ndd.district_code IN (30506001, 30506002) THEN 0 
                                        ELSE MIN(district_area) 
                                    END AS d_area,
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
                                    ON sdd.district_code = ndd.district_code
                                JOIN
                                    normal_country AS ns
                                    ON ns.date = sdd.collection_date
                                WHERE
                                    ns.date BETWEEN $1 AND $2
                                    AND sdd.station_id NOT IN (
                                        SELECT sd.station_code
                                        FROM public.station_details sd
                                        JOIN public.normal_district_details ndd2
                                            ON ndd2.district_code = sd.district_code
                                        WHERE
                                            sd.station_code IN (
                                                SELECT entity_code FROM public.calculation_exclusions
                                                WHERE entity_type = 'station')
                                            OR sd.block_code IN (
                                                SELECT entity_code FROM public.calculation_exclusions
                                                WHERE entity_type = 'block')
                                            OR ndd2.district_code IN (
                                                SELECT entity_code FROM public.calculation_exclusions
                                                WHERE entity_type = 'district')
                                    )
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
            ) AS final_subquery
        )
    ) AS outer_query,
    summed_normal
    `;

    try {
        const result = await client.query(query, [startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}


exports.fetchCummulativeCountryData = async (req, res) => {
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

const fetchCummulativeBetweenDates = async (startDate, endDate) => {
    const query = `
 select * ,
     ((actual_rainfall - 
         (CASE 
             WHEN rainfall_normal_value = 0 THEN 0.01 
             ELSE rainfall_normal_value 
         END)) / 
         (CASE 
             WHEN rainfall_normal_value = 0 THEN 0.01 
             ELSE rainfall_normal_value 
         END)) * 100 AS departure
 from(
SELECT date,
sum(actual_rainfall) OVER ( PARTITION BY name ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as actual_rainfall,
sum(rainfall_normal_value) OVER ( ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as rainfall_normal_value
	

FROM (
    SELECT 
	'INDIA' as name,
	date,
        (SUM(CASE 
                WHEN actual_rainfall IS NOT NULL THEN actual_rainfall 
                ELSE 0 
            END) / 
        NULLIF(SUM(CASE 
                    WHEN actual_rainfall IS NOT NULL THEN s_w 
                    ELSE 0 
                END), 0)) AS actual_rainfall,
        MIN(rainfall_normal_value) AS rainfall_normal_value
    FROM (
        SELECT 
			date,
            actual_rainfall * s_w AS actual_rainfall,
            s_w,
            rainfall_normal_value
        FROM (
            SELECT  
			date,
                SUM(s_w) AS s_w,
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
                SELECT date,
                    r_code,
                    s_w,
                    rainfall_normal_value,
                    actual_subdiv_rainfall * s_w AS actual_reg_num
                FROM (
                    SELECT date,
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
                                normal_country AS ns
                            ON 
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
        ) AS final_subquery
    )
	group by date
) AS outer_query)
`;

    try {
        const result = await client.query(query, [startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}





exports.fetchCountryDataAforAPIexport = async (req, res) => {
    try {
        let { user, pass, fromDate, toDate } = req.body;

        // 🔐 Validate credentials
        if (user !== "CWC_DEP" || pass !== "!Md@15O#cwc") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid credentials",
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

        // Ensure valid range
        if (moment(fromDate).isAfter(toDate)) {
            return res.status(400).json({
                success: false,
                message: "fromDate should be less than or equal to toDate",
            });
        }

        // Cutoff handling
        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        const useAws = await isAwsEnabled();
        let data = useAws
            ? await awsCtrl.fetchCountryWithAWS(fromDate, toDate)
            : await fetchBetweenDates(fromDate, toDate, currentDate, specificDateTime);

        return res.status(200).json({
            success: true,
            message: "Country data fetched successfully",
            data: data,
        });

    } catch (error) {
        console.error("Error in fetchCountryDataAforAPIexport:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Country data",
            error: error.message,
        });
    }
};


exports.fetchCountryCoverageCount = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;

        const currentDate = moment().format('YYYY-MM-DD');
        if (!startDate && !endDate) {
            startDate = endDate = currentDate;
        } else if (!startDate) {
            startDate = endDate;
        } else if (!endDate) {
            endDate = startDate;
        }

        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate",
            });
        }

        const query = `
            SELECT
                COUNT(DISTINCT ndd.district_code) AS district_count,
                COUNT(DISTINCT ndd.new_state_code) AS state_count,
                COUNT(DISTINCT ndd.subdiv_code) AS subdivision_count,
                COUNT(DISTINCT ndd.region_code) AS region_count,
                COUNT(DISTINCT sdd.station_id) AS station_count
            FROM
                public.normal_district_details ndd
            JOIN
                public.station_daily_data sdd ON ndd.district_code = sdd.district_code
                AND sdd.collection_date BETWEEN $1 AND $2
                AND sdd.data != '-999.9'
                AND sdd.data::numeric >= 0;
        `;

        const result = await client.query(query, [startDate, endDate]);

        res.status(200).json({
            success: true,
            message: "Country coverage count fetched successfully",
            data: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch country coverage count",
            error: error.message,
        });
    }
};

// Export the fetchBetweenDates function for use in other modules
module.exports.fetchBetweenDates = fetchBetweenDates;