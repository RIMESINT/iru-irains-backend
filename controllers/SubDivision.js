const client = require("../connection");
const moment = require('moment');
const awsCtrl      = require('./AwsInclusiveControllers');
const { isAwsEnabled } = require('../utils/calculationsMode');
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
    let additionalCondition = '';
    if (endDate === currentDate) {
        additionalCondition = ` AND updated_at < '${specificDateTime}'`;
    }
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
            (SUM(CASE WHEN subdiv_actual_numerator IS NOT NULL THEN subdiv_actual_numerator ELSE 0 END) / 
                    NULLIF(SUM(CASE WHEN subdiv_actual_numerator IS NOT NULL THEN district_area ELSE 0 END), 0)) AS actual_subdiv_rainfall
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
                            -- min(district_area) as d_area,
							 CASE 
                        WHEN ndd.district_code IN (30506001, 30506002) THEN 0 
                        ELSE MIN(district_area) 
                    END AS d_area,
                            MIN(ns.rainfall_value) AS normal_rainfall,
                            AVG(
                                CASE
                                    WHEN sdd.data = '-999.9' THEN NULL
                                    WHEN sdd.data::numeric < 0 THEN NULL
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
                            ) as sub_query2
                            GROUP BY
                                d_code,
                                d_area
                                ) as sub2
                            GROUP BY
                                s_code
                        )
                        as result`;
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

        const useAws = await isAwsEnabled();
        let data = useAws
            ? await awsCtrl.fetchSubDivisionWithAWS(fromDate, toDate)
            : await fetchBetweenDates(fromDate, toDate, currentDate, specificDateTime);

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


exports.fetchSubDivisionDistrictCount = async (req, res) => {
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
                ndd.subdiv_code,
                MIN(ndd.subdiv_name) AS subdiv_name,
                MIN(ndd.region_name) AS region_name,
                MIN(ndd.region_code) AS region_code,
                COUNT(DISTINCT ndd.district_code) AS district_count
            FROM
                public.normal_district_details ndd
            JOIN
                public.station_daily_data sdd ON ndd.district_code = sdd.district_code
                AND sdd.collection_date BETWEEN $1 AND $2
                AND sdd.data != '-999.9'
                AND sdd.data::numeric >= 0
            WHERE
                ndd.subdiv_code IS NOT NULL
            GROUP BY
                ndd.subdiv_code
            ORDER BY
                ndd.subdiv_code;
        `;

        const result = await client.query(query, [startDate, endDate]);

        res.status(200).json({
            success: true,
            message: "Subdivision district count fetched successfully",
            data: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subdivision district count",
            error: error.message,
        });
    }
};

exports.getSubdivisionDisplayOrder = async (_req, res) => {
    try {
        const result = await client.query(
            `SELECT display_order, region_code, region_name, subdiv_code, subdivision_name
             FROM subdivision_display_order
             ORDER BY display_order ASC`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("getSubdivisionDisplayOrder error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch subdivision display order", error: error.message });
    }
};

exports.updateSubdivisionDisplayOrder = async (req, res) => {
    const { subdiv_code, display_order } = req.body;

    if (!subdiv_code || display_order == null) {
        return res.status(400).json({ success: false, message: "subdiv_code and display_order are required" });
    }

    try {
        const result = await client.query(
            `UPDATE subdivision_display_order
             SET display_order = $1
             WHERE subdiv_code = $2
             RETURNING *`,
            [display_order, subdiv_code]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "subdiv_code not found" });
        }

        res.status(200).json({ success: true, message: "Display order updated", data: result.rows[0] });
    } catch (error) {
        console.error("updateSubdivisionDisplayOrder error:", error);
        res.status(500).json({ success: false, message: "Failed to update subdivision display order", error: error.message });
    }
};

exports.addSubdivisionDisplayOrderEntry = async (req, res) => {
    const { region_code, region_name, subdiv_code, subdivision_name, insert_after } = req.body;
    if (insert_after == null) {
        return res.status(400).json({ success: false, message: "insert_after is required" });
    }
    const new_display_order = insert_after + 1;
    try {
        await client.query("BEGIN");
        await client.query(
            `UPDATE subdivision_display_order SET display_order = display_order + 1 WHERE display_order > $1`,
            [insert_after]
        );
        await client.query(
            `INSERT INTO subdivision_display_order (display_order, region_code, region_name, subdiv_code, subdivision_name)
             VALUES ($1, $2, $3, $4, $5)`,
            [new_display_order, region_code, region_name, subdiv_code, subdivision_name]
        );
        await client.query("COMMIT");
        res.status(200).json({ success: true });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("addSubdivisionDisplayOrderEntry error:", error);
        res.status(500).json({ success: false, message: "Failed to add subdivision display order entry", error: error.message });
    }
};

exports.deleteSubdivisionDisplayOrderEntry = async (req, res) => {
    const display_order = parseInt(req.params.display_order, 10);
    if (isNaN(display_order)) {
        return res.status(400).json({ success: false, message: "Invalid display_order" });
    }
    try {
        await client.query(
            `DELETE FROM subdivision_display_order WHERE display_order = $1`,
            [display_order]
        );
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("deleteSubdivisionDisplayOrderEntry error:", error);
        res.status(500).json({ success: false, message: "Failed to delete subdivision display order entry", error: error.message });
    }
};

exports.updateSubdivisionDisplayOrders = async (req, res) => {
    const { orders } = req.body;
    if (!Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({ success: false, message: "orders array is required" });
    }
    try {
        await client.query("BEGIN");
        for (const { old_display_order } of orders) {
            await client.query(
                `UPDATE subdivision_display_order SET display_order = display_order + 1000000 WHERE display_order = $1`,
                [old_display_order]
            );
        }
        for (const { old_display_order, new_display_order } of orders) {
            await client.query(
                `UPDATE subdivision_display_order SET display_order = $1 WHERE display_order = $2`,
                [new_display_order, old_display_order + 1000000]
            );
        }
        await client.query("COMMIT");
        res.status(200).json({ success: true });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("updateSubdivisionDisplayOrders error:", error);
        res.status(500).json({ success: false, message: "Failed to update subdivision display orders", error: error.message });
    }
};

module.exports.fetchBetweenDates = fetchBetweenDates;
module.exports.getSubdivisionAreaPercentages = getSubdivisionAreaPercentages;