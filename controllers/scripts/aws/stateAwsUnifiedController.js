const client  = require("../../../connection");
const moment   = require("moment");

exports.fetchFilteredStationUnifiedFile = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;

        const awsToday = moment.utc().add(2, 'hours').add(30, 'minutes').format("YYYY-MM-DD");
        if (!startDate) startDate = awsToday;
        if (!endDate)   endDate   = awsToday;

        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate must be <= endDate",
            });
        }

        const query = `
            WITH all_aws AS (

                /* ── UP AWS (raw dat+time are UTC; AWS day boundary at 21:30 UTC) ── */
                SELECT
                    (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date  AS collection_date,
                    id::text          AS station_id,
                    station           AS station_name,
                    district          AS district_raw,
                    NULL::text        AS block_raw,
                    lat               AS latitude,
                    lon               AS longitude,
                    MAX(rainfall)     AS data,
                    'UP AWS'          AS source
                FROM up_aws_observations
                WHERE dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
                  AND (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date
                      BETWEEN $1::date AND $2::date
                GROUP BY collection_date, id, station, district, lat, lon

                UNION ALL

                /* ── NHP AWS (IST-stored; AWS day = IST - 14h) ───────────────────── */
                SELECT
                    (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date  AS collection_date,
                    id::text          AS station_id,
                    station           AS station_name,
                    district          AS district_raw,
                    NULL::text        AS block_raw,
                    NULL::numeric     AS latitude,
                    NULL::numeric     AS longitude,
                    MAX(rainfall)     AS data,
                    'NHP AWS'         AS source
                FROM observations_aws_nhp
                WHERE dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
                  AND (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date
                      BETWEEN $1::date AND $2::date
                GROUP BY collection_date, id, station, district

                UNION ALL

                /* ── ZOMATO AWS (IST-stored; uses 'city' instead of district) ──── */
                SELECT
                    (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date  AS collection_date,
                    id::text          AS station_id,
                    station           AS station_name,
                    city              AS district_raw,
                    NULL::text        AS block_raw,
                    lat               AS latitude,
                    lon               AS longitude,
                    MAX(rainfall)     AS data,
                    'ZOMATO AWS'      AS source
                FROM observations_aws_zomato
                WHERE dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
                  AND (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date
                      BETWEEN $1::date AND $2::date
                GROUP BY collection_date, id, station, city, lat, lon

                UNION ALL

                /* ── MEGHALAYA AWS (IST-stored) ──────────────────────────────────── */
                SELECT
                    (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date  AS collection_date,
                    id::text          AS station_id,
                    station           AS station_name,
                    district          AS district_raw,
                    block             AS block_raw,
                    NULL::numeric     AS latitude,
                    NULL::numeric     AS longitude,
                    MAX(rainfall)     AS data,
                    'MEGHALAYA AWS'   AS source
                FROM observations_aws_meghalaya
                WHERE dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
                  AND (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date
                      BETWEEN $1::date AND $2::date
                GROUP BY collection_date, id, station, district, block

                UNION ALL

                /* ── MIZORAM AWS (IST-stored) ────────────────────────────────────── */
                SELECT
                    (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date  AS collection_date,
                    id::text          AS station_id,
                    station           AS station_name,
                    district          AS district_raw,
                    NULL::text        AS block_raw,
                    NULL::numeric     AS latitude,
                    NULL::numeric     AS longitude,
                    MAX(rainfall)     AS data,
                    'MIZORAM AWS'     AS source
                FROM observations_aws_mizoram
                WHERE dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
                  AND (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date
                      BETWEEN $1::date AND $2::date
                GROUP BY collection_date, id, station, district

                UNION ALL

                /* ── TAMILNADU AWS (IST-stored) ──────────────────────────────────── */
                SELECT
                    (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date  AS collection_date,
                    id::text          AS station_id,
                    station           AS station_name,
                    district          AS district_raw,
                    block             AS block_raw,
                    NULL::numeric     AS latitude,
                    NULL::numeric     AS longitude,
                    MAX(rainfall)     AS data,
                    'TAMILNADU AWS'   AS source
                FROM observations_aws_tamilnadu
                WHERE dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
                  AND (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date
                      BETWEEN $1::date AND $2::date
                GROUP BY collection_date, id, station, district, block

                UNION ALL

                /* ── UTTARAKHAND AWS (IST-stored) ────────────────────────────────── */
                SELECT
                    (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date  AS collection_date,
                    id::text          AS station_id,
                    station           AS station_name,
                    district          AS district_raw,
                    block             AS block_raw,
                    lat               AS latitude,
                    lon               AS longitude,
                    MAX(rainfall)     AS data,
                    'UTTARAKHAND AWS' AS source
                FROM observations_aws_uttarakhand
                WHERE dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
                  AND (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date
                      BETWEEN $1::date AND $2::date
                GROUP BY collection_date, id, station, district, block, lat, lon

                UNION ALL

                /* ── TELANGANA AWS (IST-stored) ──────────────────────────────────── */
                SELECT
                    (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date  AS collection_date,
                    id::text          AS station_id,
                    station           AS station_name,
                    district          AS district_raw,
                    block             AS block_raw,
                    lat               AS latitude,
                    lon               AS longitude,
                    MAX(rainfall)     AS data,
                    'TELANGANA AWS'   AS source
                FROM observations_aws_telangana
                WHERE dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
                  AND (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date
                      BETWEEN $1::date AND $2::date
                GROUP BY collection_date, id, station, district, block, lat, lon

                UNION ALL

                /* ── KARNATAKA AWS (IST-stored) ──────────────────────────────────── */
                SELECT
                    (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date  AS collection_date,
                    id::text          AS station_id,
                    station           AS station_name,
                    district          AS district_raw,
                    block             AS block_raw,
                    lat               AS latitude,
                    lon               AS longitude,
                    MAX(rainfall)     AS data,
                    'KARNATAKA AWS'   AS source
                FROM observations_aws_karnataka
                WHERE dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
                  AND (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date
                      BETWEEN $1::date AND $2::date
                GROUP BY collection_date, id, station, district, block, lat, lon

                UNION ALL

                /* ── IITM MUMBAI (IST-stored) ────────────────────────────────────── */
                SELECT
                    (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date  AS collection_date,
                    id::text          AS station_id,
                    station           AS station_name,
                    district          AS district_raw,
                    NULL::text        AS block_raw,
                    lat               AS latitude,
                    lon               AS longitude,
                    MAX(rainfall)     AS data,
                    'IITM MUMBAI'     AS source
                FROM observations_iitm_mumbai
                WHERE dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
                  AND (dat::date + time::time + INTERVAL '2 hours 30 minutes')::date
                      BETWEEN $1::date AND $2::date
                GROUP BY collection_date, id, station, district, lat, lon
            ),

            /* district → state lookup (one row per distinct district name) */
            district_meta AS (
                SELECT
                    LOWER(TRIM(district_name)) AS district_key,
                    MIN(district_name)         AS district_name,
                    MIN(state_name)            AS state_name
                FROM normal_district_details
                GROUP BY LOWER(TRIM(district_name))
            ),

            /* block name → block_code lookup */
            block_meta AS (
                SELECT
                    LOWER(TRIM(block_name)) AS block_key,
                    MIN(block_code)         AS block_code
                FROM station_details
                WHERE block_name IS NOT NULL
                GROUP BY LOWER(TRIM(block_name))
            )

            SELECT
                a.source,
                COALESCE(dm.state_name,    '')              AS state_name,
                COALESCE(dm.district_name, a.district_raw)  AS district_name,
                a.block_raw                                  AS block_name,
                bm.block_code,
                a.station_name,
                a.station_id,
                a.latitude,
                a.longitude,
                TO_CHAR(a.collection_date, 'YYYY-MM-DD')    AS collection_date,
                ROUND(a.data::NUMERIC, 2)                   AS data
            FROM all_aws a
            LEFT JOIN district_meta dm
                ON dm.district_key = LOWER(TRIM(a.district_raw))
            LEFT JOIN block_meta bm
                ON bm.block_key = LOWER(TRIM(a.block_raw))
            ORDER BY a.source, a.collection_date, a.district_raw, a.station_id;
        `;

        const result = await client.query(query, [startDate, endDate]);

        res.status(200).json({
            success: true,
            message: "State AWS station data fetched successfully",
            data: result.rows,
        });
    } catch (error) {
        console.error("[STATE AWS UNIFIED] fetchFilteredStationUnifiedFile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch state AWS station data",
            error: error.message,
        });
    }
};
