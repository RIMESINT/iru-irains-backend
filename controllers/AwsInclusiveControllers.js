const client = require("../connection");
const moment = require('moment');

// ─── SHARED EXCLUSION SUBQUERY (IMD stations) ────────────────────────────────
const EXCLUSION_SQL = `
    SELECT sd2.station_code
    FROM public.station_details sd2
    JOIN public.normal_district_details ndd2 ON ndd2.district_code = sd2.district_code
    WHERE
        sd2.station_code IN (SELECT entity_code FROM public.calculation_exclusions WHERE entity_type = 'station')
        OR sd2.block_code  IN (SELECT entity_code FROM public.calculation_exclusions WHERE entity_type = 'block')
        OR ndd2.district_code IN (SELECT entity_code FROM public.calculation_exclusions WHERE entity_type = 'district')
`;

// ─── SHARED EXCLUSION SUBQUERY (AWS stations) ────────────────────────────────
const AWS_EXCLUSION_SQL = `
    SELECT asd2.station_code
    FROM public.aws_station_details asd2
    WHERE
        asd2.station_code IN (SELECT entity_code FROM public.calculation_exclusions WHERE entity_type = 'aws_station')
        OR asd2.block_code    IN (SELECT entity_code FROM public.calculation_exclusions WHERE entity_type = 'block')
        OR asd2.district_code IN (SELECT entity_code FROM public.calculation_exclusions WHERE entity_type = 'district')
`;

// ─── DATE VALIDATION HELPER ───────────────────────────────────────────────────
const resolveDates = (startDate, endDate) => {
    const today = moment().format('YYYY-MM-DD');
    if (!startDate && !endDate) return { startDate: today, endDate: today };
    if (!startDate) return { startDate: endDate, endDate };
    if (!endDate)   return { startDate, endDate: startDate };
    return { startDate, endDate };
};


// ═════════════════════════════════════════════════════════════════════════════
// 1. BLOCK
// ═════════════════════════════════════════════════════════════════════════════
const fetchBlockWithAWS = async (startDate, endDate) => {
    const query = `
    WITH
    reg AS (
        SELECT
            sd.block_code, sd.block_name,
            ndd.district_code, ndd.district_name,
            ndd.new_state_code AS state_code, ndd.state_name,
            ndd.region_code, ndd.region_name, ndd.subdiv_code,
            sd.centre_name, sd.centre_type,
            sdd.collection_date,
            CASE WHEN sdd.data = '-999.9' THEN NULL ELSE sdd.data::FLOAT END AS rainfall,
            nb.rainfall_value AS normal_rainfall
        FROM station_details sd
        JOIN normal_district_details ndd ON sd.district_code = ndd.district_code
        LEFT JOIN station_daily_data sdd
            ON sd.station_code = sdd.station_id
            AND sdd.collection_date BETWEEN $1 AND $2
            AND sdd.data::numeric >= 0
        LEFT JOIN normal_block nb ON sd.block_code = nb.block_id AND nb.date = sdd.collection_date
        WHERE sd.block_code IS NOT NULL
          AND sd.station_code NOT IN (${EXCLUSION_SQL})
    ),
    aws AS (
        SELECT
            asd.block_code, asd.block_name,
            ndd.district_code, ndd.district_name,
            ndd.new_state_code AS state_code, ndd.state_name,
            ndd.region_code, ndd.region_name, ndd.subdiv_code,
            NULL::varchar AS centre_name, NULL::varchar AS centre_type,
            asdd.collection_date,
            CASE WHEN asdd.data < 0 THEN NULL ELSE asdd.data END AS rainfall,
            nb.rainfall_value AS normal_rainfall
        FROM aws_station_details asd
        JOIN normal_district_details ndd ON asd.district_code = ndd.district_code
        LEFT JOIN aws_station_daily_data asdd
            ON asd.station_code = asdd.station_id
            AND asdd.collection_date BETWEEN $1 AND $2
            AND asdd.data >= 0
        LEFT JOIN normal_block nb ON asd.block_code = nb.block_id AND nb.date = asdd.collection_date
        WHERE asd.block_code IS NOT NULL
          AND asd.station_code NOT IN (${AWS_EXCLUSION_SQL})
    ),
    combined AS (
        SELECT * FROM reg
        UNION ALL
        SELECT * FROM aws
    ),
    block_daily AS (
        SELECT block_code, collection_date,
               AVG(rainfall) AS avg_actual, AVG(normal_rainfall) AS avg_normal
        FROM combined
        GROUP BY block_code, collection_date
    ),
    block_meta AS (
        SELECT DISTINCT ON (block_code)
            block_code, block_name, district_code, district_name,
            state_code, state_name, region_code, region_name,
            subdiv_code, centre_name, centre_type
        FROM combined
        ORDER BY block_code
    )
    SELECT
        bm.block_code,
        MIN(bm.block_name)    AS block_name,
        MIN(bm.district_name) AS district_name,
        MIN(bm.district_code) AS district_code,
        MIN(bm.state_name)    AS state_name,
        MIN(bm.state_code)    AS state_code,
        MIN(bm.region_name)   AS region_name,
        MIN(bm.region_code)   AS region_code,
        MIN(bm.centre_name)   AS centre_name,
        MIN(bm.centre_type)   AS centre_type,
        MIN(bm.subdiv_code)   AS sub_division_code,
        SUM(bd.avg_normal)    AS normal_rainfall,
        SUM(bd.avg_actual)    AS actual_rainfall,
        CASE
            WHEN SUM(bd.avg_normal) IS NULL THEN NULL
            ELSE ((SUM(bd.avg_actual) - SUM(CASE WHEN bd.avg_normal = 0 THEN 0.01 ELSE bd.avg_normal END))
                / SUM(CASE WHEN bd.avg_normal = 0 THEN 0.01 ELSE bd.avg_normal END)) * 100
        END AS departure
    FROM block_meta bm
    LEFT JOIN block_daily bd ON bd.block_code = bm.block_code
    GROUP BY bm.block_code
    ORDER BY bm.block_code;
    `;
    const result = await client.query(query, [startDate, endDate]);
    return result.rows;
};

exports.fetchBlockDataWithAWS = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment(startDate).isAfter(endDate))
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        const data = await fetchBlockWithAWS(startDate, endDate);
        res.status(200).json({ success: true, message: "Block data with AWS fetched successfully", data });
    } catch (error) {
        console.error("[AWS] fetchBlockDataWithAWS:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ═════════════════════════════════════════════════════════════════════════════
// 2. DISTRICT
// ═════════════════════════════════════════════════════════════════════════════
const fetchDistrictWithAWS = async (startDate, endDate) => {
    const query = `
    WITH
    combined_raw AS (
        SELECT sdd.district_code::bigint AS district_code, sdd.collection_date AS date,
               CASE WHEN sdd.data = '-999.9' THEN NULL ELSE sdd.data::numeric END AS rainfall
        FROM station_daily_data sdd
        WHERE sdd.collection_date BETWEEN $1 AND $2
          AND sdd.data::numeric >= 0
          AND sdd.station_id NOT IN (${EXCLUSION_SQL})
        UNION ALL
        SELECT asdd.district_code::bigint, asdd.collection_date, asdd.data
        FROM aws_station_daily_data asdd
        WHERE asdd.collection_date BETWEEN $1 AND $2
          AND asdd.data >= 0
          AND asdd.station_id NOT IN (${AWS_EXCLUSION_SQL})
    ),
    daily_actuals AS (
        SELECT district_code, date, AVG(rainfall) AS raw_rainfall
        FROM combined_raw
        GROUP BY district_code, date
    )
    SELECT
        MIN(ndd.district_name)  AS district_name,
        MIN(ndd.new_state_code) AS state_code,
        MIN(ndd.region_code)    AS region_code,
        MIN(ndd.subdiv_code)    AS sub_division_code,
        ndd.district_code,
        SUM(nd.rainfall_value)  AS normal_rainfall,
        SUM(da.raw_rainfall)    AS actual_rainfall,
        CASE
            WHEN SUM(da.raw_rainfall) IS NULL THEN NULL
            WHEN SUM(da.raw_rainfall) = 0     THEN -100
            ELSE ((SUM(da.raw_rainfall) -
                   SUM(CASE WHEN nd.rainfall_value = 0 THEN 0.01 ELSE nd.rainfall_value END)) /
                   SUM(CASE WHEN nd.rainfall_value = 0 THEN 0.01 ELSE nd.rainfall_value END)) * 100
        END AS departure
    FROM normal_district nd
    JOIN normal_district_details ndd ON nd.normal_district_details_id = ndd.id
    LEFT JOIN daily_actuals da ON da.date = nd.date AND da.district_code = ndd.district_code
    WHERE nd.date BETWEEN $1 AND $2
    GROUP BY ndd.district_code
    ORDER BY district_name;
    `;
    const result = await client.query(query, [startDate, endDate]);
    return result.rows;
};

exports.fetchDistrictDataWithAWS = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment(startDate).isAfter(endDate))
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        const data = await fetchDistrictWithAWS(startDate, endDate);
        res.status(200).json({ success: true, message: "District data with AWS fetched successfully", data });
    } catch (error) {
        console.error("[AWS] fetchDistrictDataWithAWS:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ═════════════════════════════════════════════════════════════════════════════
// 3. STATE
// ═════════════════════════════════════════════════════════════════════════════
const fetchStateWithAWS = async (startDate, endDate) => {
    const query = `
    WITH
    combined_raw AS (
        SELECT sdd.district_code::bigint AS district_code, sdd.collection_date AS date,
               CASE WHEN sdd.data = '-999.9' THEN NULL ELSE sdd.data::numeric END AS rainfall
        FROM station_daily_data sdd
        WHERE sdd.collection_date BETWEEN $1 AND $2
          AND sdd.data::numeric >= 0
          AND sdd.station_id NOT IN (${EXCLUSION_SQL})
        UNION ALL
        SELECT asdd.district_code::bigint, asdd.collection_date, asdd.data
        FROM aws_station_daily_data asdd
        WHERE asdd.collection_date BETWEEN $1 AND $2
          AND asdd.data >= 0
          AND asdd.station_id NOT IN (${AWS_EXCLUSION_SQL})
    ),
    state_normals AS (
        SELECT state_code, SUM(rainfall_value) AS rainfall_normal_value
        FROM normal_state
        WHERE date BETWEEN $1 AND $2
        GROUP BY state_code
    )
    SELECT
        state_name, result.state_code, r_code AS region_code,
        sn.rainfall_normal_value, actual_state_rainfall,
        ((actual_state_rainfall - (CASE WHEN sn.rainfall_normal_value = 0 THEN 0.01 ELSE sn.rainfall_normal_value END))
         / (CASE WHEN sn.rainfall_normal_value = 0 THEN 0.01 ELSE sn.rainfall_normal_value END)) * 100 AS departure
    FROM (
        SELECT MIN(state_name) AS state_name, state_code, MIN(r_code) AS r_code,
               MIN(rainfall_value) AS rainfall_normal_value,
               (SUM(CASE WHEN state_actual_numerator IS NOT NULL THEN state_actual_numerator ELSE 0 END) /
                NULLIF(SUM(CASE WHEN state_actual_numerator IS NOT NULL THEN district_area ELSE 0 END), 0)) AS actual_state_rainfall
        FROM (
            SELECT MIN(name) AS state_name, MIN(s_code) AS state_code, MIN(r_code) AS r_code,
                   MIN(sd_code) AS sd_code, d_code AS district_code, d_area AS district_area,
                   SUM(normal_rainfall) AS rainfall_value,
                   (d_area * SUM(actual_rainfall)) AS state_actual_numerator
            FROM (
                SELECT ns.date, MIN(ndd.state_name) AS name, MIN(new_state_code) AS s_code,
                       MIN(region_code) AS r_code, MIN(subdiv_code) AS sd_code,
                       ndd.district_code AS d_code, MIN(district_area) AS d_area,
                       MIN(rainfall_value) AS normal_rainfall,
                       AVG(cr.rainfall::FLOAT) AS actual_rainfall
                FROM (SELECT district_code, date, rainfall FROM combined_raw) cr
                JOIN normal_district_details ndd ON cr.district_code = ndd.district_code
                JOIN normal_state ns ON ndd.new_state_code = ns.state_code AND ns.date = cr.date
                WHERE cr.date BETWEEN $1 AND $2
                GROUP BY ndd.district_code, ns.date
            ) AS sub_query
            GROUP BY d_code, d_area
        ) AS sub2
        GROUP BY state_code
    ) AS result
    JOIN state_normals sn ON sn.state_code = result.state_code;
    `;
    const result = await client.query(query, [startDate, endDate]);
    return result.rows;
};

exports.fetchStateDataWithAWS = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment(startDate).isAfter(endDate))
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        const data = await fetchStateWithAWS(startDate, endDate);
        res.status(200).json({ success: true, message: "State data with AWS fetched successfully", data });
    } catch (error) {
        console.error("[AWS] fetchStateDataWithAWS:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ═════════════════════════════════════════════════════════════════════════════
// 4. SUBDIVISION
// ═════════════════════════════════════════════════════════════════════════════
const fetchSubDivisionWithAWS = async (startDate, endDate) => {
    const query = `
    WITH
    combined_raw AS (
        SELECT sdd.district_code::bigint AS district_code, sdd.collection_date AS date,
               CASE WHEN sdd.data = '-999.9' THEN NULL ELSE sdd.data::numeric END AS rainfall
        FROM station_daily_data sdd
        WHERE sdd.collection_date BETWEEN $1 AND $2
          AND sdd.data::numeric >= 0
          AND sdd.station_id NOT IN (${EXCLUSION_SQL})
        UNION ALL
        SELECT asdd.district_code::bigint, asdd.collection_date, asdd.data
        FROM aws_station_daily_data asdd
        WHERE asdd.collection_date BETWEEN $1 AND $2
          AND asdd.data >= 0
          AND asdd.station_id NOT IN (${AWS_EXCLUSION_SQL})
    ),
    subdiv_normals AS (
        SELECT sub_division_id AS s_code, SUM(rainfall_value) AS rainfall_normal_value
        FROM normal_sub_division
        WHERE date BETWEEN $1 AND $2
        GROUP BY sub_division_id
    )
    SELECT
        result.name AS subdiv_name, result.s_code,
        result.r_code AS region_code, sn.rainfall_normal_value, result.actual_subdiv_rainfall,
        ((result.actual_subdiv_rainfall - (CASE WHEN sn.rainfall_normal_value = 0 THEN 0.01 ELSE sn.rainfall_normal_value END))
         / (CASE WHEN sn.rainfall_normal_value = 0 THEN 0.01 ELSE sn.rainfall_normal_value END)) * 100 AS departure
    FROM (
        SELECT MIN(name) AS name, s_code, MIN(r_code) AS r_code,
               MIN(rainfall_value) AS rainfall_normal_value,
               (SUM(CASE WHEN subdiv_actual_numerator IS NOT NULL THEN subdiv_actual_numerator ELSE 0 END) /
                NULLIF(SUM(CASE WHEN subdiv_actual_numerator IS NOT NULL THEN district_area ELSE 0 END), 0)) AS actual_subdiv_rainfall
        FROM (
            SELECT MIN(name) AS name, MIN(s_code) AS s_code, MIN(r_code) AS r_code,
                   d_code AS district_code, SUM(normal_rainfall) AS rainfall_value,
                   d_area AS district_area,
                   (d_area * SUM(actual_rainfall)) AS subdiv_actual_numerator
            FROM (
                SELECT ns.date, MIN(ndd.subdiv_name) AS name, MIN(subdiv_code) AS s_code,
                       MIN(region_code) AS r_code, ndd.district_code AS d_code,
                       CASE WHEN ndd.district_code IN (30506001, 30506002) THEN 0 ELSE MIN(district_area) END AS d_area,
                       MIN(ns.rainfall_value) AS normal_rainfall,
                       AVG(cr.rainfall::FLOAT) AS actual_rainfall
                FROM (SELECT district_code, date, rainfall FROM combined_raw) cr
                JOIN normal_district_details ndd ON cr.district_code = ndd.district_code
                JOIN normal_sub_division ns ON ndd.subdiv_code = ns.sub_division_id AND ns.date = cr.date
                WHERE cr.date BETWEEN $1 AND $2
                GROUP BY ndd.district_code, ns.date
            ) AS sub_query2
            GROUP BY d_code, d_area
        ) AS sub2
        GROUP BY s_code
    ) AS result
    JOIN subdiv_normals sn ON sn.s_code = result.s_code;
    `;
    const result = await client.query(query, [startDate, endDate]);
    return result.rows;
};

exports.fetchSubDivisionDataWithAWS = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment(startDate).isAfter(endDate))
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        const data = await fetchSubDivisionWithAWS(startDate, endDate);
        res.status(200).json({ success: true, message: "SubDivision data with AWS fetched successfully", data });
    } catch (error) {
        console.error("[AWS] fetchSubDivisionDataWithAWS:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ═════════════════════════════════════════════════════════════════════════════
// 5. REGION
// ═════════════════════════════════════════════════════════════════════════════
const fetchRegionWithAWS = async (startDate, endDate) => {
    const query = `
    WITH
    combined_raw AS (
        SELECT sdd.district_code::bigint AS district_code, sdd.collection_date AS date,
               CASE WHEN sdd.data = '-999.9' THEN NULL ELSE sdd.data::numeric END AS rainfall
        FROM station_daily_data sdd
        WHERE sdd.collection_date BETWEEN $1 AND $2
          AND sdd.data::numeric >= 0
          AND sdd.station_id NOT IN (${EXCLUSION_SQL})
        UNION ALL
        SELECT asdd.district_code::bigint, asdd.collection_date, asdd.data
        FROM aws_station_daily_data asdd
        WHERE asdd.collection_date BETWEEN $1 AND $2
          AND asdd.data >= 0
          AND asdd.station_id NOT IN (${AWS_EXCLUSION_SQL})
    ),
    region_normals AS (
        SELECT region_id AS r_code, SUM(rainfall_value) AS rainfall_normal_value
        FROM normal_region
        WHERE date BETWEEN $1 AND $2
        GROUP BY region_id
    )
    SELECT
        final_subquery.name,
        final_subquery.r_code,
        final_subquery.actual_rainfall,
        rn.rainfall_normal_value,
        ((final_subquery.actual_rainfall - (CASE WHEN rn.rainfall_normal_value = 0 THEN 0.01 ELSE rn.rainfall_normal_value END))
         / (CASE WHEN rn.rainfall_normal_value = 0 THEN 0.01 ELSE rn.rainfall_normal_value END)) * 100 AS departure
    FROM (
        SELECT MIN(name) AS name, MIN(r_code) AS r_code,
               (SUM(CASE WHEN actual_reg_num IS NOT NULL THEN actual_reg_num ELSE 0 END) /
                NULLIF(SUM(CASE WHEN actual_reg_num IS NOT NULL THEN s_w ELSE 0 END), 0)) AS actual_rainfall,
               MIN(rainfall_normal_value) AS rainfall_normal_value
        FROM (
            SELECT name, r_code, s_w, rainfall_normal_value, actual_subdiv_rainfall * s_w AS actual_reg_num
            FROM (
                SELECT MIN(name) AS name, s_code, MIN(s_w) AS s_w, MIN(r_code) AS r_code,
                       MIN(rainfall_value) AS rainfall_normal_value,
                       (SUM(CASE WHEN subdiv_actual_numerator IS NOT NULL THEN subdiv_actual_numerator ELSE 0 END) /
                        NULLIF(SUM(CASE WHEN subdiv_actual_numerator IS NOT NULL THEN district_area ELSE 0 END), 0)) AS actual_subdiv_rainfall
                FROM (
                    SELECT MIN(name) AS name, MIN(s_code) AS s_code, MIN(r_code) AS r_code,
                           d_code AS district_code, SUM(normal_rainfall) AS rainfall_value,
                           d_area AS district_area, MIN(s_w) AS s_w,
                           (d_area * SUM(actual_rainfall)) AS subdiv_actual_numerator
                    FROM (
                        SELECT ns.date, MIN(ndd.region_name) AS name, MIN(subdiv_code) AS s_code,
                               MIN(region_code) AS r_code, ndd.district_code AS d_code,
                               MIN(subdiv_weight) AS s_w,
                               CASE WHEN ndd.district_code IN (30506001, 30506002) THEN 0 ELSE MIN(district_area) END AS d_area,
                               MIN(ns.rainfall_value) AS normal_rainfall,
                               AVG(cr.rainfall::FLOAT) AS actual_rainfall
                        FROM (SELECT district_code, date, rainfall FROM combined_raw) cr
                        JOIN normal_district_details ndd ON cr.district_code = ndd.district_code
                        JOIN normal_region ns ON ndd.region_code = ns.region_id AND ns.date = cr.date
                        WHERE cr.date BETWEEN $1 AND $2
                        GROUP BY ndd.district_code, ns.date
                    ) AS sub_query2
                    GROUP BY d_code, d_area
                ) AS sub2
                GROUP BY s_code
            ) AS result
        ) AS subquery
        GROUP BY r_code
    ) AS final_subquery
    JOIN region_normals rn ON rn.r_code = final_subquery.r_code;
    `;
    const result = await client.query(query, [startDate, endDate]);
    return result.rows;
};

exports.fetchRegionDataWithAWS = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment(startDate).isAfter(endDate))
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        const data = await fetchRegionWithAWS(startDate, endDate);
        res.status(200).json({ success: true, message: "Region data with AWS fetched successfully", data });
    } catch (error) {
        console.error("[AWS] fetchRegionDataWithAWS:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ═════════════════════════════════════════════════════════════════════════════
// 6. COUNTRY
// ═════════════════════════════════════════════════════════════════════════════
const fetchCountryWithAWS = async (startDate, endDate) => {
    const query = `
    WITH
    summed_normal AS (
        SELECT SUM(rainfall_value) AS rainfall_normal_value
        FROM normal_country
        WHERE date BETWEEN $1 AND $2 AND country_name = 'INDIA'
    ),
    combined_raw AS (
        SELECT sdd.district_code::bigint AS district_code, sdd.collection_date AS date,
               CASE WHEN sdd.data = '-999.9' THEN NULL ELSE sdd.data::numeric END AS rainfall
        FROM station_daily_data sdd
        WHERE sdd.collection_date BETWEEN $1 AND $2
          AND sdd.data::numeric >= 0
          AND sdd.station_id NOT IN (${EXCLUSION_SQL})
        UNION ALL
        SELECT asdd.district_code::bigint, asdd.collection_date, asdd.data
        FROM aws_station_daily_data asdd
        WHERE asdd.collection_date BETWEEN $1 AND $2
          AND asdd.data >= 0
          AND asdd.station_id NOT IN (${AWS_EXCLUSION_SQL})
    )
    SELECT
        'INDIA' AS name,
        outer_query.actual_rainfall,
        summed_normal.rainfall_normal_value,
        ((outer_query.actual_rainfall -
            (CASE WHEN summed_normal.rainfall_normal_value = 0 THEN 0.01 ELSE summed_normal.rainfall_normal_value END)) /
            (CASE WHEN summed_normal.rainfall_normal_value = 0 THEN 0.01 ELSE summed_normal.rainfall_normal_value END)) * 100 AS departure
    FROM (
        SELECT (SUM(CASE WHEN actual_rainfall IS NOT NULL THEN actual_rainfall ELSE 0 END) /
                NULLIF(SUM(CASE WHEN actual_rainfall IS NOT NULL THEN s_w ELSE 0 END), 0)) AS actual_rainfall
        FROM (
            SELECT actual_rainfall * s_w AS actual_rainfall, s_w
            FROM (
                SELECT SUM(s_w) AS s_w,
                       (SUM(CASE WHEN actual_reg_num IS NOT NULL THEN actual_reg_num ELSE 0 END) /
                        NULLIF(SUM(CASE WHEN actual_reg_num IS NOT NULL THEN s_w ELSE 0 END), 0)) AS actual_rainfall
                FROM (
                    SELECT r_code, s_w, actual_subdiv_rainfall * s_w AS actual_reg_num
                    FROM (
                        SELECT s_code, MIN(s_w) AS s_w, MIN(r_code) AS r_code,
                               (SUM(CASE WHEN subdiv_actual_numerator IS NOT NULL THEN subdiv_actual_numerator ELSE 0 END) /
                                NULLIF(SUM(CASE WHEN subdiv_actual_numerator IS NOT NULL THEN district_area ELSE 0 END), 0)) AS actual_subdiv_rainfall
                        FROM (
                            SELECT MIN(s_code) AS s_code, MIN(r_code) AS r_code,
                                   d_code AS district_code, d_area AS district_area, MIN(s_w) AS s_w,
                                   (d_area * SUM(actual_rainfall)) AS subdiv_actual_numerator
                            FROM (
                                SELECT ns.date, MIN(subdiv_code) AS s_code, MIN(region_code) AS r_code,
                                       ndd.district_code AS d_code, MIN(subdiv_weight) AS s_w,
                                       CASE WHEN ndd.district_code IN (30506001, 30506002) THEN 0 ELSE MIN(district_area) END AS d_area,
                                       AVG(cr.rainfall::FLOAT) AS actual_rainfall
                                FROM (SELECT district_code, date, rainfall FROM combined_raw) cr
                                JOIN normal_district_details ndd ON cr.district_code = ndd.district_code
                                JOIN normal_country ns ON ns.date = cr.date
                                WHERE cr.date BETWEEN $1 AND $2
                                GROUP BY ndd.district_code, ns.date
                            ) AS sub_query2
                            GROUP BY d_code, d_area
                        ) AS sub2
                        GROUP BY s_code
                    ) AS result
                ) AS subquery
                GROUP BY r_code
            ) AS final_subquery
        ) AS outer_query_inner
    ) AS outer_query,
    summed_normal;
    `;
    const result = await client.query(query, [startDate, endDate]);
    return result.rows;
};

exports.fetchCountryDataWithAWS = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment(startDate).isAfter(endDate))
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        const data = await fetchCountryWithAWS(startDate, endDate);
        res.status(200).json({ success: true, message: "Country data with AWS fetched successfully", data });
    } catch (error) {
        console.error("[AWS] fetchCountryDataWithAWS:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── INTERNAL EXPORTS (for use by ftp/Shared.js and other backend modules) ───
exports.fetchBlockWithAWS       = fetchBlockWithAWS;
exports.fetchDistrictWithAWS    = fetchDistrictWithAWS;
exports.fetchStateWithAWS       = fetchStateWithAWS;
exports.fetchSubDivisionWithAWS = fetchSubDivisionWithAWS;
exports.fetchRegionWithAWS      = fetchRegionWithAWS;
exports.fetchCountryWithAWS     = fetchCountryWithAWS;
