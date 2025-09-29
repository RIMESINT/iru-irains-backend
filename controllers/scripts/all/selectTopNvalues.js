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
        let { startDate, endDate, topN } = req.body;
        topN = parseInt(topN) || 10;

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
            WITH ranked_actual AS (
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
                    ndd.region_code,
                    ROW_NUMBER() OVER (PARTITION BY bd.block_id ORDER BY bd.actual DESC) AS rn
                FROM public.block_data bd
                LEFT JOIN public.station_details sd ON bd.block_id = sd.block_code
                LEFT JOIN public.normal_district_details ndd ON sd.district_code = ndd.district_code
                WHERE bd.from_date BETWEEN $1 AND $2
                    AND bd.from_date = bd.to_date
                    AND bd.block_id IS NOT NULL
                    AND (bd.actual < 999 OR bd.actual IS NULL)
            )
            SELECT 
                block_id,
                block_name,
                block_code,
                district_name,
                district_code,
                state_name,
                state_code,
                region_name,
                region_code,
                date,
                actual_rainfall,
                departure
            FROM ranked_actual
            WHERE rn = 1
            ORDER BY actual_rainfall DESC
            LIMIT $3;

            WITH ranked_departure AS (
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
                    ndd.region_code,
                    ROW_NUMBER() OVER (PARTITION BY bd.block_id ORDER BY bd.departure DESC) AS rn
                FROM public.block_data bd
                LEFT JOIN public.station_details sd ON bd.block_id = sd.block_code
                LEFT JOIN public.normal_district_details ndd ON sd.district_code = ndd.district_code
                WHERE bd.from_date BETWEEN $1 AND $2
                    AND bd.from_date = bd.to_date
                    AND bd.block_id IS NOT NULL
            )
            SELECT 
                block_id,
                block_name,
                block_code,
                district_name,
                district_code,
                state_name,
                state_code,
                region_name,
                region_code,
                date,
                actual_rainfall,
                departure
            FROM ranked_departure
            WHERE rn = 1
            ORDER BY departure DESC
            LIMIT $3;
        `;

        const [actualResult, departureResult] = await Promise.all([
            client.query(query.split(';')[0], [startDate, endDate, topN]),
            client.query(query.split(';')[1], [startDate, endDate, topN])
        ]);

        res.status(200).json({
            success: true,
            message: `Top ${topN} blocks by actual rainfall (filtered for actual < 999) and departure where from_date equals to_date`,
            data: {
                topByActualRainfall: actualResult.rows,
                topByDeparture: departureResult.rows
            }
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
        let { startDate, endDate, topN } = req.body;
        topN = parseInt(topN) || 10;

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
            WITH ranked_actual AS (
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
                    ndd.region_code,
                    ROW_NUMBER() OVER (PARTITION BY dd.district_id ORDER BY dd.actual DESC) AS rn
                FROM public.district_data dd
                LEFT JOIN public.normal_district_details ndd ON dd.district_id = ndd.district_code
                WHERE dd.from_date BETWEEN $1 AND $2
                    AND dd.from_date = dd.to_date
                    AND dd.district_id IS NOT NULL
                    AND (dd.actual < 999 OR dd.actual IS NULL)
            )
            SELECT 
                district_id,
                district_name,
                district_code,
                state_name,
                state_code,
                region_name,
                region_code,
                date,
                actual_rainfall,
                departure
            FROM ranked_actual
            WHERE rn = 1
            ORDER BY actual_rainfall DESC
            LIMIT $3;

            WITH ranked_departure AS (
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
                    ndd.region_code,
                    ROW_NUMBER() OVER (PARTITION BY dd.district_id ORDER BY dd.departure DESC) AS rn
                FROM public.district_data dd
                LEFT JOIN public.normal_district_details ndd ON dd.district_id = ndd.district_code
                WHERE dd.from_date BETWEEN $1 AND $2
                    AND dd.from_date = dd.to_date
                    AND dd.district_id IS NOT NULL
            )
            SELECT 
                district_id,
                district_name,
                district_code,
                state_name,
                state_code,
                region_name,
                region_code,
                date,
                actual_rainfall,
                departure
            FROM ranked_departure
            WHERE rn = 1
            ORDER BY departure DESC
            LIMIT $3;
        `;

        const [actualResult, departureResult] = await Promise.all([
            client.query(query.split(';')[0], [startDate, endDate, topN]),
            client.query(query.split(';')[1], [startDate, endDate, topN])
        ]);

        res.status(200).json({
            success: true,
            message: `Top ${topN} districts by actual rainfall (filtered for actual < 999) and departure where from_date equals to_date`,
            data: {
                topByActualRainfall: actualResult.rows,
                topByDeparture: departureResult.rows
            }
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
        let { startDate, endDate, topN } = req.body;
        topN = parseInt(topN) || 10;

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
            ),
            ranked_actual AS (
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
                    sm.region_code,
                    ROW_NUMBER() OVER (PARTITION BY sd.subdivision_id ORDER BY sd.actual DESC) AS rn
                FROM public.subdivision_data sd
                LEFT JOIN subdiv_metadata sm ON sd.subdivision_id = sm.subdiv_code
                WHERE sd.from_date BETWEEN $1 AND $2
                    AND sd.from_date = sd.to_date
                    AND sd.subdivision_id IS NOT NULL
                    AND (sd.actual < 999 OR sd.actual IS NULL)
            )
            SELECT 
                subdivision_id,
                subdivision_name,
                subdivision_code,
                state_name,
                state_code,
                region_name,
                region_code,
                date,
                actual_rainfall,
                departure
            FROM ranked_actual
            WHERE rn = 1
            ORDER BY actual_rainfall DESC
            LIMIT $3;

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
            ),
            ranked_departure AS (
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
                    sm.region_code,
                    ROW_NUMBER() OVER (PARTITION BY sd.subdivision_id ORDER BY sd.departure DESC) AS rn
                FROM public.subdivision_data sd
                LEFT JOIN subdiv_metadata sm ON sd.subdivision_id = sm.subdiv_code
                WHERE sd.from_date BETWEEN $1 AND $2
                    AND sd.from_date = sd.to_date
                    AND sd.subdivision_id IS NOT NULL
            )
            SELECT 
                subdivision_id,
                subdivision_name,
                subdivision_code,
                state_name,
                state_code,
                region_name,
                region_code,
                date,
                actual_rainfall,
                departure
            FROM ranked_departure
            WHERE rn = 1
            ORDER BY departure DESC
            LIMIT $3;
        `;

        const [actualResult, departureResult] = await Promise.all([
            client.query(query.split(';')[0], [startDate, endDate, topN]),
            client.query(query.split(';')[1], [startDate, endDate, topN])
        ]);

        res.status(200).json({
            success: true,
            message: `Top ${topN} subdivisions by actual rainfall (filtered for actual < 999) and departure where from_date equals to_date`,
            data: {
                topByActualRainfall: actualResult.rows,
                topByDeparture: departureResult.rows
            }
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
        let { startDate, endDate, topN } = req.body;
        topN = parseInt(topN) || 10;

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
            WITH ranked_actual AS (
                SELECT
                    rd.region_id,
                    rd.actual AS actual_rainfall,
                    rd.departure AS departure,
                    TO_CHAR(rd.from_date, 'YYYY-MM-DD') AS date,
                    ROW_NUMBER() OVER (PARTITION BY rd.region_id ORDER BY rd.actual DESC) AS rn
                FROM public.region_data rd
                WHERE rd.from_date BETWEEN $1 AND $2
                    AND rd.from_date = rd.to_date
                    AND rd.region_id IS NOT NULL
                    AND (rd.actual < 999 OR rd.actual IS NULL)
            )
            SELECT 
                region_id,
                date,
                actual_rainfall,
                departure
            FROM ranked_actual
            WHERE rn = 1
            ORDER BY actual_rainfall DESC
            LIMIT $3;

            WITH ranked_departure AS (
                SELECT
                    rd.region_id,
                    rd.actual AS actual_rainfall,
                    rd.departure AS departure,
                    TO_CHAR(rd.from_date, 'YYYY-MM-DD') AS date,
                    ROW_NUMBER() OVER (PARTITION BY rd.region_id ORDER BY rd.departure DESC) AS rn
                FROM public.region_data rd
                WHERE rd.from_date BETWEEN $1 AND $2
                    AND rd.from_date = rd.to_date
                    AND rd.region_id IS NOT NULL
            )
            SELECT 
                region_id,
                date,
                actual_rainfall,
                departure
            FROM ranked_departure
            WHERE rn = 1
            ORDER BY departure DESC
            LIMIT $3;
        `;

        const [actualResult, departureResult] = await Promise.all([
            client.query(query.split(';')[0], [startDate, endDate, topN]),
            client.query(query.split(';')[1], [startDate, endDate, topN])
        ]);

        res.status(200).json({
            success: true,
            message: `Top ${topN} regions by actual rainfall (filtered for actual < 999) and departure where from_date equals to_date`,
            data: {
                topByActualRainfall: actualResult.rows,
                topByDeparture: departureResult.rows
            }
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
        let { startDate, endDate, topN } = req.body;
        topN = parseInt(topN) || 10;

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
            WITH ranked_actual AS (
                SELECT
                    cd.country_id,
                    cd.actual AS actual_rainfall,
                    cd.departure AS departure,
                    TO_CHAR(cd.from_date, 'YYYY-MM-DD') AS date,
                    ROW_NUMBER() OVER (PARTITION BY cd.country_id ORDER BY cd.actual DESC) AS rn
                FROM public.country_data cd
                WHERE cd.from_date BETWEEN $1 AND $2
                    AND cd.from_date = cd.to_date
                    AND cd.country_id IS NOT NULL
                    AND (cd.actual < 999 OR cd.actual IS NULL)
            )
            SELECT 
                country_id,
                date,
                actual_rainfall,
                departure
            FROM ranked_actual
            WHERE rn = 1
            ORDER BY actual_rainfall DESC
            LIMIT $3;

            WITH ranked_departure AS (
                SELECT
                    cd.country_id,
                    cd.actual AS actual_rainfall,
                    cd.departure AS departure,
                    TO_CHAR(cd.from_date, 'YYYY-MM-DD') AS date,
                    ROW_NUMBER() OVER (PARTITION BY cd.country_id ORDER BY cd.departure DESC) AS rn
                FROM public.country_data cd
                WHERE cd.from_date BETWEEN $1 AND $2
                    AND cd.from_date = cd.to_date
                    AND cd.country_id IS NOT NULL
            )
            SELECT 
                country_id,
                date,
                actual_rainfall,
                departure
            FROM ranked_departure
            WHERE rn = 1
            ORDER BY departure DESC
            LIMIT $3;
        `;

        const [actualResult, departureResult] = await Promise.all([
            client.query(query.split(';')[0], [startDate, endDate, topN]),
            client.query(query.split(';')[1], [startDate, endDate, topN])
        ]);

        res.status(200).json({
            success: true,
            message: `Top ${topN} countries by actual rainfall (filtered for actual < 999) and departure where from_date equals to_date`,
            data: {
                topByActualRainfall: actualResult.rows,
                topByDeparture: departureResult.rows
            }
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