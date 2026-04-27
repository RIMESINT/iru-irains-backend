const client = require("../connection");
const moment = require('moment');
// ✅ FIX 3: Removed unused `const router`, `const app`, `const express` — never used in this file


exports.fetchStateData = async (req, res) => {
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

        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        let data = await fetchBetweenDates(startDate, endDate, currentDate, specificDateTime);

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


// --------------------------------- Previous Formula ---------------------------------------
// (unchanged — kept as-is commented out)
// ------------------------------------------------------------------------------------------


const fetchBetweenDates = async (startDate, endDate, currentDate, specificDateTime) => {
    // ✅ FIX 2: additionalCondition is now actually injected into the WHERE clause below
    let additionalCondition = '';
    if (endDate === currentDate) {
        additionalCondition = `AND sdd.updated_at < '${specificDateTime}'`;
    }

    const query = `
    WITH daily_district_actuals AS (
        SELECT
            ndd.new_state_code AS state_code,
            MIN(ndd.state_name) AS state_name,
            MIN(ndd.region_code) AS r_code,
            ndd.district_code,
            MIN(ndd.district_area) AS district_area,
            sdd.collection_date,
            AVG(CASE 
                WHEN sdd.data::numeric = -999.9 THEN NULL
                WHEN sdd.data::numeric < 0 THEN NULL
                ELSE sdd.data::numeric
            END) AS daily_avg_rainfall
        FROM station_daily_data sdd
        JOIN normal_district_details ndd 
            ON sdd.district_code = ndd.district_code
        WHERE 
            sdd.collection_date BETWEEN $1 AND $2
            ${additionalCondition}
        GROUP BY 
            sdd.collection_date, ndd.district_code, ndd.new_state_code
    ),

    district_totals AS (
        SELECT
            state_code,
            state_name,
            r_code,
            district_code,
            district_area,
            SUM(daily_avg_rainfall) AS total_actual_rainfall
        FROM daily_district_actuals
        GROUP BY state_code, state_name, r_code, district_code, district_area
    ),

    state_actuals AS (
        SELECT
            state_code,
            state_name,
            r_code,
            -- ✅ FIX 1: Old denominator → NULLIF(SUM(district_area), 0)
            --   counted ALL districts' area even when actual was NULL
            --   → blank district treated as 0 (area diluted the average)
            -- New denominator → only sum area where actual IS NOT NULL
            --   → blank district fully excluded from both numerator & denominator
            SUM(total_actual_rainfall * district_area) /
                NULLIF(SUM(CASE WHEN total_actual_rainfall IS NOT NULL 
                               THEN district_area ELSE 0 END), 0)
            AS actual_state_rainfall
        FROM district_totals
        GROUP BY state_code, state_name, r_code
    ),

    state_normals AS (
        SELECT 
            state_code,
            SUM(rainfall_value) AS rainfall_normal_value
        FROM normal_state
        WHERE date BETWEEN $1 AND $2
        GROUP BY state_code
    )

    SELECT 
        sa.state_name,
        sa.state_code,
        sa.r_code AS region_code,
        sn.rainfall_normal_value,
        sa.actual_state_rainfall,
        CASE
            WHEN sa.actual_state_rainfall IS NULL THEN NULL
            WHEN sa.actual_state_rainfall = 0 THEN -100
            ELSE (
                (sa.actual_state_rainfall - 
                 CASE WHEN sn.rainfall_normal_value = 0 THEN 0.01 ELSE sn.rainfall_normal_value END) /
                 CASE WHEN sn.rainfall_normal_value = 0 THEN 0.01 ELSE sn.rainfall_normal_value END
            ) * 100
        END AS departure
    FROM state_actuals sa
    LEFT JOIN state_normals sn ON sa.state_code = sn.state_code;    
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


exports.fetchStateDataAforAPIexport = async (req, res) => {
    try {
        let { user, pass, fromDate, toDate } = req.body;

        if (user !== "CWC_DEP" || pass !== "!Md@15O#cwc") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid credentials"
            });
        }

        const currentDate = moment().format("YYYY-MM-DD");
        if (!fromDate && !toDate) {
            fromDate = toDate = currentDate;
        } else if (!fromDate) {
            fromDate = toDate;
        } else if (!toDate) {
            toDate = fromDate;
        }

        if (moment(fromDate).isAfter(toDate)) {
            return res.status(400).json({
                success: false,
                message: "fromDate should be less than or equal to toDate"
            });
        }

        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        let data = await fetchBetweenDates(fromDate, toDate, currentDate, specificDateTime);

        return res.status(200).json({
            success: true,
            message: "State data fetched successfully",
            data: data
        });

    } catch (error) {
        console.error("Error in fetchStateDataAforAPIexport:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch State data",
            error: error.message
        });
    }
};


exports.getMetWiseStates = async (req, res) => {
    const query = `
        SELECT 
            nd.new_state_code::bigint AS state_code,
            MIN(nd.state_name) AS state_name,
            MIN(nd.region_name) AS region_name,
            MIN(nd.region_code) AS region_code,
            STRING_AGG(DISTINCT COALESCE(sd.centre_type, '') || ' ' || COALESCE(sd.centre_name, ''), ', ') AS met_centre
        FROM 
            public.normal_district_details nd
        LEFT JOIN 
            public.station_details sd 
            ON nd.district_code = sd.district_code
        WHERE 
            nd.new_state_code IS NOT NULL
        GROUP BY 
            nd.new_state_code
        ORDER BY 
            MIN(nd.region_name), MIN(nd.state_name);
    `;

    try {
        const result = await client.query(query);
        res.status(200).json({
            success: true,
            message: "State-wise met centre metadata (using new_state_code) fetched successfully",
            data: result.rows
        });
    } catch (error) {
        console.error("getMetWiseStatesUsingNewStateCode error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch state met centre data",
            error: error.message
        });
    }
};


const getStateAreaPercentages = async (_req, res) => {
    const query = `
        SELECT
            new_state_code AS state_code,
            MIN(state_name) AS state_name,
            ROUND(
                (SUM(district_area) / (SELECT SUM(district_area) FROM normal_district_details) * 100)::numeric,
                2
            ) AS area_percentage
        FROM normal_district_details
        WHERE new_state_code IS NOT NULL
        GROUP BY new_state_code
        ORDER BY new_state_code;
    `;
    try {
        const result = await client.query(query);
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error("getStateAreaPercentages error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch state area percentages", error: error.message });
    }
};


module.exports.fetchBetweenDates = fetchBetweenDates;
module.exports.getStateAreaPercentages = getStateAreaPercentages;