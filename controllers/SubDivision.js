const client = require("../connection");
const moment = require('moment');
// ✅ FIX 3: Removed unused `const express`, `const router`, `const app`


exports.fetchSubDivisionData = async (req, res) => {
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


// --------------------------------- Previous Formula (unchanged, kept as-is) ---
// ------------------------------------------------------------------------------------------


const fetchBetweenDates = async (startDate, endDate, currentDate, specificDateTime) => {
    // ✅ FIX 2: additionalCondition now injected into WHERE clause below
    let additionalCondition = '';
    if (endDate === currentDate) {
        additionalCondition = `AND sdd.updated_at < '${specificDateTime}'`;
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
                        WHEN sdd.data::numeric < 0 THEN NULL
                        ELSE sdd.data::numeric
                    END
                ) AS daily_avg_rainfall
            FROM station_daily_data sdd
            JOIN normal_district_details ndd 
                ON sdd.district_code = ndd.district_code
            WHERE 
                sdd.collection_date BETWEEN $1 AND $2
                ${additionalCondition}
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
                -- ✅ FIX 1: Old → NULLIF(SUM(district_area), 0)
                --   counted ALL districts' area even if actual was NULL
                --   → blank district treated as 0 (area diluted the avg)
                -- New → only sum area where actual IS NOT NULL
                --   → blank district excluded from both numerator & denominator
                SUM(total_actual_rainfall * district_area) /
                    NULLIF(SUM(CASE WHEN total_actual_rainfall IS NOT NULL 
                                   THEN district_area ELSE 0 END), 0)
                AS actual_subdiv_rainfall
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
        // exception: area forced to 0 for districts 30506001, 30506002 in subdiv calculation

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
                subdiv_name
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


exports.getMetWiseSubDivisions = async (req, res) => {
    const query = `
        SELECT 
            nd.subdiv_code,
            nd.subdiv_name,
            nd.sd,
            nd.subdiv_weight,
            nd.state_name,
            nd.state_code,
            nd.region_name,
            nd.region_code,
            STRING_AGG(DISTINCT COALESCE(sd.centre_type,'') || ' ' || COALESCE(sd.centre_name,''), ', ') AS met_centre
        FROM 
            public.normal_district_details nd
        LEFT JOIN 
            public.station_details sd 
            ON nd.district_code = sd.district_code
        GROUP BY 
            nd.subdiv_code,
            nd.subdiv_name,
            nd.sd,
            nd.subdiv_weight,
            nd.state_name,
            nd.state_code,
            nd.region_name,
            nd.region_code
        ORDER BY 
            nd.region_name, nd.state_name, nd.subdiv_name;
    `;

    try {
        const result = await client.query(query);
        res.status(200).json({
            success: true,
            message: "Subdivision centre metadata fetched successfully",
            data: result.rows
        });
    } catch (error) {
        console.error("getSubDivisionCentres error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subdivision centre data",
            error: error.message
        });
    }
};


const getSubdivisionAreaPercentages = async (_req, res) => {
    const query = `
        SELECT
            subdiv_code,
            subdiv_name,
            ROUND(
                (SUM(district_area) / (SELECT SUM(district_area) FROM normal_district_details) * 100)::numeric,
                2
            ) AS area_percentage
        FROM normal_district_details
        GROUP BY subdiv_code, subdiv_name
        ORDER BY subdiv_code;
    `;
    try {
        const result = await client.query(query);
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error("getSubdivisionAreaPercentages error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch subdivision area percentages", error: error.message });
    }
};


module.exports.fetchBetweenDates = fetchBetweenDates;
module.exports.getSubdivisionAreaPercentages = getSubdivisionAreaPercentages;