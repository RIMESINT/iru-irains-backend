


const express = require("express");
const app = express();
const client = require("../../../connection");
const moment = require("moment");

const getEarliestBlockDataStartDate = async () => {
    const query = `SELECT MIN(from_date) AS earliest_start_date FROM public.block_data WHERE from_date = to_date;`;
    const result = await client.query(query);
    if (result.rows.length > 0 && result.rows[0].earliest_start_date) {
        return result.rows[0].earliest_start_date;
    }
    return null;
};

exports.fetchTopNBlocks = async (req, res) => {
    try {
        let { block_code, startDate, endDate, topN } = req.body;
        topN = parseInt(topN) || 10;

        if (!block_code) {
            return res.status(400).json({
                success: false,
                message: "block_code is required",
            });
        }

        if (!startDate) {
            const earliestDate = await getEarliestBlockDataStartDate();
            startDate = earliestDate ? moment(earliestDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
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
            SELECT
                bd.block_id,
                bd.actual AS actual_rainfall,
                bd.departure AS departure,
                TO_CHAR(bd.from_date, 'YYYY-MM-DD') AS date,
                sd.block_name,
                sd.block_code,
                ndd.district_name,
                ndd.district_code,
                ndd.state_name,
                ndd.state_code,
                ndd.region_name,
                ndd.region_code
            FROM public.block_data bd
            LEFT JOIN public.station_details sd ON bd.block_id = sd.block_code
            LEFT JOIN public.normal_district_details ndd ON sd.district_code = ndd.district_code
            WHERE bd.from_date BETWEEN $1 AND $2
                AND bd.from_date = bd.to_date
                AND bd.block_id = $3
                AND (bd.actual < 999 OR bd.actual IS NULL)
            ORDER BY bd.actual DESC, bd.departure DESC
            LIMIT $4;
        `;

        const result = await client.query(query, [startDate, endDate, block_code, topN]);

        res.status(200).json({
            success: true,
            message: `Top ${topN} records for block_code ${block_code} by actual rainfall (filtered for actual < 999) and departure`,
            data: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch top N block data",
            error: error.message,
        });
    }
};

const getEarliestDistrictDataStartDate = async () => {
    const query = `SELECT MIN(from_date) AS earliest_start_date FROM public.district_data WHERE from_date = to_date;`;
    const result = await client.query(query);
    if (result.rows.length > 0 && result.rows[0].earliest_start_date) {
        return result.rows[0].earliest_start_date;
    }
    return null;
};

exports.fetchTopNDistricts = async (req, res) => {
    try {
        let { district_code, startDate, endDate, topN } = req.body;
        topN = parseInt(topN) || 10;

        if (!district_code) {
            return res.status(400).json({
                success: false,
                message: "district_code is required",
            });
        }

        if (!startDate) {
            const earliestDate = await getEarliestDistrictDataStartDate();
            startDate = earliestDate ? moment(earliestDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
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
            SELECT
                dd.district_id,
                dd.actual AS actual_rainfall,
                dd.departure AS departure,
                TO_CHAR(dd.from_date, 'YYYY-MM-DD') AS date,
                ndd.district_name,
                ndd.district_code,
                ndd.state_name,
                ndd.new_state_code AS state_code,
                ndd.region_name,
                ndd.region_code
            FROM public.district_data dd
            LEFT JOIN public.normal_district_details ndd ON dd.district_id = ndd.district_code
            WHERE dd.from_date BETWEEN $1 AND $2
                AND dd.from_date = dd.to_date
                AND dd.district_id = $3
                AND (dd.actual < 999 OR dd.actual IS NULL)
            ORDER BY dd.actual DESC, dd.departure DESC
            LIMIT $4;
        `;

        const result = await client.query(query, [startDate, endDate, district_code, topN]);

        res.status(200).json({
            success: true,
            message: `Top ${topN} records for district_code ${district_code} by actual rainfall (filtered for actual < 999) and departure`,
            data: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch top N district data",
            error: error.message,
        });
    }
};

const getEarliestSubdivisionDataStartDate = async () => {
    const query = `SELECT MIN(from_date) AS earliest_start_date FROM public.subdivision_data WHERE from_date = to_date;`;
    const result = await client.query(query);
    if (result.rows.length > 0 && result.rows[0].earliest_start_date) {
        return result.rows[0].earliest_start_date;
    }
    return null;
};

exports.fetchTopNSubdivisions = async (req, res) => {
    try {
        let { subdivision_code, startDate, endDate, topN } = req.body;
        topN = parseInt(topN) || 10;

        if (!subdivision_code) {
            return res.status(400).json({
                success: false,
                message: "subdivision_code is required",
            });
        }

        if (!startDate) {
            const earliestDate = await getEarliestSubdivisionDataStartDate();
            startDate = earliestDate ? moment(earliestDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
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
                    MIN(region_name) AS region_name,
                    MIN(region_code) AS region_code,
                    MIN(state_name) AS state_name,
                    MIN(new_state_code) AS state_code
                FROM public.normal_district_details
                GROUP BY subdiv_code
            )
            SELECT
                sd.subdivision_id,
                sd.actual AS actual_rainfall,
                sd.departure AS departure,
                TO_CHAR(sd.from_date, 'YYYY-MM-DD') AS date,
                sm.subdivision_name,
                sm.subdiv_code AS subdivision_code,
                sm.state_name,
                sm.state_code,
                sm.region_name,
                sm.region_code
            FROM public.subdivision_data sd
            LEFT JOIN subdiv_metadata sm ON sd.subdivision_id = sm.subdiv_code
            WHERE sd.from_date BETWEEN $1 AND $2
                AND sd.from_date = sd.to_date
                AND sd.subdivision_id = $3
                AND (sd.actual < 999 OR sd.actual IS NULL)
            ORDER BY sd.actual DESC, sd.departure DESC
            LIMIT $4;
        `;

        const result = await client.query(query, [startDate, endDate, subdivision_code, topN]);

        res.status(200).json({
            success: true,
            message: `Top ${topN} records for subdivision_code ${subdivision_code} by actual rainfall (filtered for actual < 999) and departure`,
            data: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch top N subdivision data",
            error: error.message,
        });
    }
};

const getEarliestStateDataStartDate = async () => {
    const query = `SELECT MIN(from_date) AS earliest_start_date FROM public.state_data WHERE from_date = to_date;`;
    const result = await client.query(query);
    if (result.rows.length > 0 && result.rows[0].earliest_start_date) {
        return result.rows[0].earliest_start_date;
    }
    return null;
};

exports.fetchTopNStates = async (req, res) => {
    try {
        let { state_code, startDate, endDate, topN } = req.body;
        topN = parseInt(topN) || 10;

        if (!state_code) {
            return res.status(400).json({
                success: false,
                message: "state_code is required",
            });
        }

        if (!startDate) {
            const earliestDate = await getEarliestStateDataStartDate();
            startDate = earliestDate ? moment(earliestDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
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
                    new_state_code as state_code,
                    MIN(state_name) AS state_name,
                    MIN(region_name) AS region_name,
                    MIN(region_code) AS region_code
                FROM public.normal_district_details
                GROUP BY new_state_code
            )
            SELECT
                sd.state_id,
                sd.actual AS actual_rainfall,
                sd.departure AS departure,
                TO_CHAR(sd.from_date, 'YYYY-MM-DD') AS date,
                sm.state_name,
                sm.state_code,
                sm.region_name,
                sm.region_code
            FROM public.state_data sd
            LEFT JOIN state_metadata sm ON sd.state_id = sm.state_code
            WHERE sd.from_date BETWEEN $1 AND $2
                AND sd.from_date = sd.to_date
                AND sd.state_id = $3
                AND (sd.actual < 999 OR sd.actual IS NULL)
            ORDER BY sd.actual DESC, sd.departure DESC
            LIMIT $4;
        `;

        const result = await client.query(query, [startDate, endDate, state_code, topN]);

        res.status(200).json({
            success: true,
            message: `Top ${topN} records for state_code ${state_code} by actual rainfall (filtered for actual < 999) and departure`,
            data: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch top N state data",
            error: error.message,
        });
    }
};

const getEarliestRegionDataStartDate = async () => {
    const query = `SELECT MIN(from_date) AS earliest_start_date FROM public.region_data WHERE from_date = to_date;`;
    const result = await client.query(query);
    if (result.rows.length > 0 && result.rows[0].earliest_start_date) {
        return result.rows[0].earliest_start_date;
    }
    return null;
};

exports.fetchTopNRegions = async (req, res) => {
    try {
        let { region_code, startDate, endDate, topN } = req.body;
        topN = parseInt(topN) || 10;

        if (!region_code) {
            return res.status(400).json({
                success: false,
                message: "region_code is required",
            });
        }

        if (!startDate) {
            const earliestDate = await getEarliestRegionDataStartDate();
            startDate = earliestDate ? moment(earliestDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
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
            SELECT
                rd.region_id,
                rd.actual AS actual_rainfall,
                rd.departure AS departure,
                TO_CHAR(rd.from_date, 'YYYY-MM-DD') AS date
            FROM public.region_data rd
            WHERE rd.from_date BETWEEN $1 AND $2
                AND rd.from_date = rd.to_date
                AND rd.region_id = $3
                AND (rd.actual < 999 OR rd.actual IS NULL)
            ORDER BY rd.actual DESC, rd.departure DESC
            LIMIT $4;
        `;

        const result = await client.query(query, [startDate, endDate, region_code, topN]);

        res.status(200).json({
            success: true,
            message: `Top ${topN} records for region_code ${region_code} by actual rainfall (filtered for actual < 999) and departure`,
            data: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch top N region data",
            error: error.message,
        });
    }
};

const getEarliestCountryDataStartDate = async () => {
    const query = `SELECT MIN(from_date) AS earliest_start_date FROM public.country_data WHERE from_date = to_date;`;
    const result = await client.query(query);
    if (result.rows.length > 0 && result.rows[0].earliest_start_date) {
        return result.rows[0].earliest_start_date;
    }
    return null;
};

exports.fetchTopNCountries = async (req, res) => {
    try {
        let { country_code, startDate, endDate, topN } = req.body;
        topN = parseInt(topN) || 10;

        if (!country_code) {
            return res.status(400).json({
                success: false,
                message: "country_code is required",
            });
        }

        country_code = parseInt(country_code);
        if (isNaN(country_code)) {
            return res.status(400).json({
                success: false,
                message: "country_code must be a valid number",
            });
        }

        if (!startDate) {
            const earliestDate = await getEarliestCountryDataStartDate();
            startDate = earliestDate ? moment(earliestDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
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
            SELECT
                cd.country_id AS country_code,
                cd.actual AS actual_rainfall,
                cd.departure AS departure,
                TO_CHAR(cd.from_date, 'YYYY-MM-DD') AS date
            FROM public.country_data cd
            WHERE cd.from_date BETWEEN $1 AND $2
                AND cd.from_date = cd.to_date
                AND cd.country_id = $3
                AND (cd.actual < 999 OR cd.actual IS NULL)
            ORDER BY cd.actual DESC, cd.departure DESC
            LIMIT $4;
        `;

        const result = await client.query(query, [startDate, endDate, country_code, topN]);

        res.status(200).json({
            success: true,
            message: `Top ${topN} rainfall records for country_code ${country_code}`,
            data: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch top N country data",
            error: error.message,
        });
    }
};