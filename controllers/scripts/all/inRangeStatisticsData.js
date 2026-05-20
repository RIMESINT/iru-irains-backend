const express = require("express");
const app = express();
const client = require("../../../connection");
const moment = require("moment");

exports.fetchBlockRangeStatistics = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;

        if (!startDate) {
            const earliestDate = await client.query(
                `SELECT MIN(from_date) AS earliest_start_date FROM public.block_data WHERE from_date = to_date;`
            );
            startDate = earliestDate.rows.length > 0 && earliestDate.rows[0].earliest_start_date
                ? moment(earliestDate.rows[0].earliest_start_date).format("YYYY-MM-DD")
                : moment().format("YYYY-MM-DD");
        }

        if (!endDate) {
            endDate = moment().format("YYYY-MM-DD");
        }

        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate",
            });
        }

        const query = `
            WITH block_metadata AS (
                SELECT
                    block_code,
                    MIN(block_name) AS block_name,
                    MIN(district_code) AS district_code
                FROM public.station_details
                WHERE flag != 0
                GROUP BY block_code
            ),
            district_metadata AS (
                SELECT
                    district_code,
                    MIN(district_name) AS district_name,
                    MIN(state_name) AS state_name,
                    MIN(new_state_code) AS state_code,
                    MIN(region_name) AS region_name,
                    MIN(region_code) AS region_code
                FROM public.normal_district_details
                GROUP BY district_code
            )
            SELECT
                bd.block_id,
                bd.actual AS actual_rainfall,
                bd.departure AS departure,
                nb.rainfall_value AS normal_rainfall,
                TO_CHAR(bd.from_date, 'YYYY-MM-DD') AS date,
                bm.block_name,
                bm.block_code,
                dm.district_name,
                bm.district_code,
                dm.state_name,
                dm.state_code,
                dm.region_name,
                dm.region_code
            FROM public.block_data bd
            LEFT JOIN block_metadata bm ON bd.block_id = bm.block_code
            LEFT JOIN district_metadata dm ON bm.district_code = dm.district_code
            LEFT JOIN public.normal_block nb ON bd.block_id = nb.block_id AND bd.from_date = nb.date
            WHERE bd.from_date BETWEEN $1 AND $2
                AND bd.from_date = bd.to_date
                AND bd.block_id IS NOT NULL
                AND (bd.actual < 999 OR bd.actual IS NULL)
            ORDER BY bd.from_date, bd.block_id;
        `;

        const result = await client.query(query, [startDate, endDate]);

        res.status(200).json({
            success: true,
            message: `Block data fetched for dates between ${startDate} and ${endDate} where from_date equals to_date and actual < 999`,
            data: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch block data in range",
            error: error.message,
        });
    }
};

exports.fetchDistrictRangeStatistics = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;

        if (!startDate) {
            const earliestDate = await client.query(
                `SELECT MIN(from_date) AS earliest_start_date FROM public.district_data WHERE from_date = to_date;`
            );
            startDate = earliestDate.rows.length > 0 && earliestDate.rows[0].earliest_start_date
                ? moment(earliestDate.rows[0].earliest_start_date).format("YYYY-MM-DD")
                : moment().format("YYYY-MM-DD");
        }

        if (!endDate) {
            endDate = moment().format("YYYY-MM-DD");
        }

        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate",
            });
        }

        const query = `
            WITH district_metadata AS (
                SELECT
                    district_code,
                    MIN(id) AS normal_district_details_id,
                    MIN(district_name) AS district_name,
                    MIN(state_name) AS state_name,
                    MIN(new_state_code) AS state_code,
                    MIN(region_name) AS region_name,
                    MIN(region_code) AS region_code
                FROM public.normal_district_details
                GROUP BY district_code
            )
            SELECT
                dd.district_id,
                dd.actual AS actual_rainfall,
                dd.departure AS departure,
                nd.rainfall_value AS normal_rainfall,
                TO_CHAR(dd.from_date, 'YYYY-MM-DD') AS date,
                dm.district_name,
                dm.district_code,
                dm.state_name,
                dm.state_code,
                dm.region_name,
                dm.region_code
            FROM public.district_data dd
            LEFT JOIN district_metadata dm ON dd.district_id = dm.district_code
            LEFT JOIN public.normal_district nd ON dm.normal_district_details_id = nd.normal_district_details_id AND dd.from_date = nd.date
            WHERE dd.from_date BETWEEN $1 AND $2
                AND dd.from_date = dd.to_date
                AND dd.district_id IS NOT NULL
                AND (dd.actual < 999 OR dd.actual IS NULL)
            ORDER BY dd.from_date, dd.district_id;
        `;

        const result = await client.query(query, [startDate, endDate]);

        res.status(200).json({
            success: true,
            message: `District data fetched for dates between ${startDate} and ${endDate} where from_date equals to_date and actual < 999`,
            data: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch district data in range",
            error: error.message,
        });
    }
};

exports.fetchStateRangeStatistics = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;

        if (!startDate) {
            const earliestDate = await client.query(
                `SELECT MIN(from_date) AS earliest_start_date FROM public.state_data WHERE from_date = to_date;`
            );
            startDate = earliestDate.rows.length > 0 && earliestDate.rows[0].earliest_start_date
                ? moment(earliestDate.rows[0].earliest_start_date).format("YYYY-MM-DD")
                : moment().format("YYYY-MM-DD");
        }

        if (!endDate) {
            endDate = moment().format("YYYY-MM-DD");
        }

        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate",
            });
        }

        const query = `
            WITH state_metadata AS (
                SELECT
                    new_state_code AS state_code,
                    MIN(state_name) AS state_name,
                    MIN(region_name) AS region_name,
                    MIN(region_code) AS region_code
                FROM public.normal_district_details
                GROUP BY new_state_code
            ),
            normal_state_data AS (
                SELECT
                    ns.date,
                    ns.rainfall_value,
                    CAST(ndd.new_state_code AS bigint) AS state_code
                FROM public.normal_state ns
                JOIN public.normal_district_details ndd ON CAST(ns.state_code AS bigint) = ndd.new_state_code
            )
            SELECT
                sd.state_id,
                sd.actual AS actual_rainfall,
                sd.departure AS departure,
                nsd.rainfall_value AS normal_rainfall,
                TO_CHAR(sd.from_date, 'YYYY-MM-DD') AS date,
                sm.state_name,
                sm.state_code,
                sm.region_name,
                sm.region_code
            FROM public.state_data sd
            LEFT JOIN state_metadata sm ON sd.state_id = sm.state_code
            LEFT JOIN normal_state_data nsd ON sd.state_id = nsd.state_code AND sd.from_date = nsd.date
            WHERE sd.from_date BETWEEN $1 AND $2
                AND sd.from_date = sd.to_date
                AND sd.state_id IS NOT NULL
                AND (sd.actual < 999 OR sd.actual IS NULL)
            ORDER BY sd.from_date, sd.state_id;
        `;

        const result = await client.query(query, [startDate, endDate]);

        // Debugging: Log row count and sample data
        console.log(`Fetched ${result.rows.length} state data rows for ${startDate} to ${endDate}`);
        if (result.rows.length > 0) {
            console.log("Sample row:", result.rows[0]);
        }

        res.status(200).json({
            success: true,
            message: `State data fetched for dates between ${startDate} and ${endDate} where from_date equals to_date and actual < 999`,
            data: result.rows
        });

    } catch (error) {
        console.error("Error in fetchStateRangeStatistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch state data in range",
            error: error.message,
        });
    }
};


exports.fetchSubdivisionRangeStatistics = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;

        if (!startDate) {
            const earliestDate = await client.query(
                `SELECT MIN(from_date) AS earliest_start_date FROM public.subdivision_data WHERE from_date = to_date;`
            );
            startDate = earliestDate.rows.length > 0 && earliestDate.rows[0].earliest_start_date
                ? moment(earliestDate.rows[0].earliest_start_date).format("YYYY-MM-DD")
                : moment().format("YYYY-MM-DD");
        }

        if (!endDate) {
            endDate = moment().format("YYYY-MM-DD");
        }

        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate",
            });
        }

        const query = `
            WITH subdiv_metadata AS (
                SELECT
                    subdiv_code,
                    MIN(subdiv_name) AS subdivision_name,
                    MIN(state_name) AS state_name,
                    MIN(new_state_code) AS state_code,
                    MIN(region_name) AS region_name,
                    MIN(region_code) AS region_code
                FROM public.normal_district_details
                GROUP BY subdiv_code
            ),
            normal_subdiv_data AS (
                SELECT
                    ns.date,
                    ns.rainfall_value,
                    ndd.subdiv_code
                FROM public.normal_sub_division ns
                JOIN public.normal_district_details ndd ON CAST(ns.sub_division_id AS bigint) = ndd.subdiv_code
            )
            SELECT
                sd.subdivision_id,
                sd.actual AS actual_rainfall,
                sd.departure AS departure,
                nsd.rainfall_value AS normal_rainfall,
                TO_CHAR(sd.from_date, 'YYYY-MM-DD') AS date,
                sm.subdivision_name,
                sm.subdiv_code AS subdivision_code,
                sm.state_name,
                sm.state_code,
                sm.region_name,
                sm.region_code
            FROM public.subdivision_data sd
            LEFT JOIN subdiv_metadata sm ON sd.subdivision_id = sm.subdiv_code
            LEFT JOIN normal_subdiv_data nsd ON sd.subdivision_id = nsd.subdiv_code AND sd.from_date = nsd.date
            WHERE sd.from_date BETWEEN $1 AND $2
                AND sd.from_date = sd.to_date
                AND sd.subdivision_id IS NOT NULL
                AND (sd.actual < 999 OR sd.actual IS NULL)
            ORDER BY sd.from_date, sd.subdivision_id;
        `;

        const result = await client.query(query, [startDate, endDate]);

        res.status(200).json({
            success: true,
            message: `Subdivision data fetched for dates between ${startDate} and ${endDate} where from_date equals to_date and actual < 999`,
            data: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subdivision data in range",
            error: error.message,
        });
    }
};


exports.fetchRegionRangeStatistics = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;

        if (!startDate) {
            const earliestDate = await client.query(
                `SELECT MIN(from_date) AS earliest_start_date FROM public.region_data WHERE from_date = to_date;`
            );
            startDate = earliestDate.rows.length > 0 && earliestDate.rows[0].earliest_start_date
                ? moment(earliestDate.rows[0].earliest_start_date).format("YYYY-MM-DD")
                : moment().format("YYYY-MM-DD");
        }

        if (!endDate) {
            endDate = moment().format("YYYY-MM-DD");
        }

        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate",
            });
        }

        const query = `
            WITH region_metadata AS (
                SELECT
                    region_id,
                    MIN(region_name) AS region_name,
                    CAST(MIN(region_id) AS bigint) AS region_code
                FROM public.normal_region
                GROUP BY region_id
            )
            SELECT
                rd.region_id,
                rd.actual AS actual_rainfall,
                rd.departure AS departure,
                nr.rainfall_value AS normal_rainfall,
                TO_CHAR(rd.from_date, 'YYYY-MM-DD') AS date,
                rm.region_name,
                rm.region_code
            FROM public.region_data rd
            LEFT JOIN region_metadata rm ON rd.region_id = rm.region_code
            LEFT JOIN public.normal_region nr ON CAST(rd.region_id AS integer) = nr.region_id AND rd.from_date = nr.date
            WHERE rd.from_date BETWEEN $1 AND $2
                AND rd.from_date = rd.to_date
                AND rd.region_id IS NOT NULL
                AND (rd.actual < 999 OR rd.actual IS NULL)
            ORDER BY rd.from_date, rd.region_id;
        `;

        const result = await client.query(query, [startDate, endDate]);

        res.status(200).json({
            success: true,
            message: `Region data fetched for dates between ${startDate} and ${endDate} where from_date equals to_date and actual < 999`,
            data: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch region data in range",
            error: error.message,
        });
    }
};

exports.fetchCountryRangeStatistics = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;

        if (!startDate) {
            const earliestDate = await client.query(
                `SELECT MIN(from_date) AS earliest_start_date FROM public.country_data WHERE from_date = to_date;`
            );
            startDate = earliestDate.rows.length > 0 && earliestDate.rows[0].earliest_start_date
                ? moment(earliestDate.rows[0].earliest_start_date).format("YYYY-MM-DD")
                : moment().format("YYYY-MM-DD");
        }

        if (!endDate) {
            endDate = moment().format("YYYY-MM-DD");
        }

        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate",
            });
        }

        const query = `
            WITH country_metadata AS (
                SELECT
                    MIN(country_name) AS country_name
                FROM public.normal_country
            )
            SELECT
                cd.country_id,
                cd.actual AS actual_rainfall,
                cd.departure AS departure,
                nc.rainfall_value AS normal_rainfall,
                TO_CHAR(cd.from_date, 'YYYY-MM-DD') AS date,
                cm.country_name
            FROM public.country_data cd
            LEFT JOIN country_metadata cm ON 1 = 1
            LEFT JOIN public.normal_country nc ON cd.from_date = nc.date
            WHERE cd.from_date BETWEEN $1 AND $2
                AND cd.from_date = cd.to_date
                AND cd.country_id IS NOT NULL
                AND (cd.actual < 999 OR cd.actual IS NULL)
            ORDER BY cd.from_date, cd.country_id;
        `;

        const result = await client.query(query, [startDate, endDate]);

        res.status(200).json({
            success: true,
            message: `Country data fetched for dates between ${startDate} and ${endDate} where from_date equals to_date and actual < 999`,
            data: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch country data in range",
            error: error.message,
        });
    }
};