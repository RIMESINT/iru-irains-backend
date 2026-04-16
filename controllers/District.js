
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

// --------------------------------- Previous Formula ---------------------------------------

// const fetchBetweenDates = async (startDate, endDate, currentDate, specificDateTime) => {
//     let additionalCondition = '';
//     if (endDate === currentDate) {
//         additionalCondition = ` AND updated_at < '${specificDateTime}'`;
//     }

//     const query = `
    //   SELECT 
    //         min(d_name) as district_name,
    //         min(s_code) as state_code,
    //         min(r_code) as region_code,
    //         min(sd_code) as sub_division_code,
    //         sum(normal_rainfall) as normal_rainfall,
    //         district_code,
    //         sum(actual_rainfall) as actual_rainfall,
    //         ((sum(actual_rainfall) - sum(CASE WHEN normal_rainfall = 0 THEN 0.01 ELSE normal_rainfall END)) / sum(CASE WHEN normal_rainfall = 0 THEN 0.01 ELSE normal_rainfall END)) * 100 as departure
    //     FROM (
    //         SELECT 
    //             date,
    //             min(rainfall_value) as normal_rainfall, 
    //             min(ndd.district_name) as d_name,
    //             ndd.district_code,
    //             min(ndd.new_state_code) as s_code,
    //             min(ndd.region_code) as r_code,
    //             min(ndd.subdiv_code) as sd_code,
    //             avg(
    //                 CASE 
    //                     WHEN sdd.data = '-999.9' THEN NULL 
    //                     ELSE sdd.data 
    //                 END
    //             ) as actual_rainfall
    //         FROM 
    //             public.normal_district nd
    //         JOIN 
    //             public.normal_district_details ndd
    //             ON nd.normal_district_details_id = ndd.id
    //         JOIN 
    //             public.station_daily_data sdd 
    //             ON ndd.district_code = sdd.district_code 
    //             AND sdd.collection_date = nd.date
    //         WHERE 
    //             date BETWEEN $1 AND $2 
    //         GROUP BY 
    //             ndd.district_code, 
    //             date
    //     ) as test
    //     GROUP BY 
    //         district_code;
//     `;

//     console.log(query);

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
    WITH daily_actuals AS (
        SELECT 
            sdd.collection_date AS date,
            sdd.district_code,
            AVG(NULLIF(sdd.data::numeric, -999.9)) AS raw_rainfall
        FROM station_daily_data sdd
        WHERE 
            sdd.collection_date BETWEEN $1 AND $2
            AND sdd.data::numeric >= 0  -- ✅ Exclude negative values
        GROUP BY sdd.collection_date, sdd.district_code
    )
    
    SELECT 
        MIN(ndd.district_name) AS district_name,
        MIN(ndd.new_state_code) AS state_code,
        MIN(ndd.region_code) AS region_code,
        MIN(ndd.subdiv_code) AS sub_division_code,
        ndd.district_code,
        SUM(nd.rainfall_value) AS normal_rainfall,
        SUM(da.raw_rainfall) AS actual_rainfall,
        CASE
            WHEN SUM(da.raw_rainfall) IS NULL THEN NULL
            WHEN SUM(da.raw_rainfall) = 0 THEN -100
            ELSE (
                (SUM(da.raw_rainfall) - 
                 SUM(CASE WHEN nd.rainfall_value = 0 THEN 0.01 ELSE nd.rainfall_value END)) / 
                 SUM(CASE WHEN nd.rainfall_value = 0 THEN 0.01 ELSE nd.rainfall_value END)
            ) * 100
        END AS departure
    FROM 
        normal_district nd
    JOIN 
        normal_district_details ndd
        ON nd.normal_district_details_id = ndd.id
    LEFT JOIN 
        daily_actuals da
        ON da.date = nd.date AND da.district_code = ndd.district_code
    WHERE 
        nd.date BETWEEN $1 AND $2
    GROUP BY 
        ndd.district_code
    ORDER BY 
        district_name;
      
    `;


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
                            MIN(region_name) as region_name, 
                            MIN(region_code) as region_code, 
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




exports.getLatestFiveYearDataOfDistrict = async (req, res) => {
    // Define state_code and district_code outside of the try block

    console.log('req.body', req.body);
    
    const { startDate, endDate, district_code } = req.body;

    try {

        // Validate inputs
        if (!startDate || !endDate || !district_code) {
            return res.status(400).json({
                success: false,
                message: "State code and district code are required",
            });
        }

        // Query to fetch last 5 years' monthly data
        const query = `select * ,
      (((actual_rainfall) - (CASE WHEN normal_rainfall = 0 THEN 0.01 ELSE normal_rainfall END)) / (CASE WHEN normal_rainfall = 0 THEN 0.01 ELSE normal_rainfall END)) * 100 as departure
from (
select DATE_TRUNC('month', date) as date,
avg(normal_rainfall) as normal_rainfall,
avg(actual_rainfall) as actual_rainfall
from (SELECT date,
            min(d_name) as district_name,
            min(s_code) as state_code,
            min(r_code) as region_code,
            min(sd_code) as sub_division_code,
            sum(normal_rainfall) as normal_rainfall,
            district_code,
            sum(actual_rainfall) as actual_rainfall
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
                public.station_daily_data_ftp sdd 
                ON ndd.district_code = sdd.district_code 
                AND sdd.collection_date = nd.date
            WHERE 
                date BETWEEN $1 AND $2 and ndd.district_code = $3
            GROUP BY 
                ndd.district_code, 
                date
        ) as test
        GROUP BY 
            district_code,
			date)

			group by district_code, 
			DATE_TRUNC('month', date)
			)`;
        
        const result = await client.query(query, [startDate, endDate, district_code]);

        console.log('result.rows' ,result.rows);

        // Handle empty results
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No data found for the given state and district over the last five years",
            });
        }

        // Send successful response
        res.status(200).json({
            success: true,
            message: "Monthly rainfall data for the past years fetched successfully",
            data: result.rows
        });

    } catch (error) {
        console.error(`Error fetching data for state_code: ${state_code}, district_code: ${district_code}, error`);
        res.status(500).json({
            success: false,
            message: "Failed to fetch monthly rainfall data",
            error: error.message
        });
    }
};










exports.fetchDistrictDataforAPIexport = async (req, res) => {
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

        // Check if start <= end
        if (moment(fromDate).isAfter(toDate)) {
            return res.status(400).json({
                success: false,
                message: "fromDate should be less than or equal to toDate"
            });
        }

        // Specific cutoff time logic
        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        // 📊 Fetch data (reuse your same function)
        let data = await fetchBetweenDates(fromDate, toDate, currentDate, specificDateTime);

        return res.status(200).json({
            success: true,
            message: "District data fetched successfully",
            data: data
        });

    } catch (error) {
        console.error("Error in fetchDistrictDataAforAPIexport:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch District data",
            error: error.message
        });
    }
};



const getDistrictAreaPercentages = async (_req, res) => {
    const query = `
        SELECT
            district_code,
            district_name,
            ROUND(
                district_area / (SELECT SUM(district_area) FROM normal_district_details) * 100,
                4
            ) AS area_percentage
        FROM normal_district_details
        ORDER BY district_code;
    `;
    try {
        const result = await client.query(query);
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error("getDistrictAreaPercentages error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch district area percentages", error: error.message });
    }
};

module.exports.fetchBetweenDates = fetchBetweenDates;
module.exports.getDistrictAreaPercentages = getDistrictAreaPercentages;
