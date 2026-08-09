const client = require("../connection");
const moment = require("moment");

// Same 7 sources as SOURCES in controllers/scripts/aws/aws_station.js — kept
// as a separate list here (rather than importing) since that file's SOURCES
// entries carry live controller references for ingestion, not display data
// (label/url) needed for this read-only logs view.
const SOURCES = [
    { key: 'up',          label: 'UP AWS',         source_table: 'up_aws_observations',          url: 'https://city.imd.gov.in/api/v1/getUPAWS' },
    { key: 'tamilnadu',   label: 'Tamil Nadu AWS', source_table: 'observations_aws_tamilnadu',   url: 'https://city.imd.gov.in/api/v1/getTamilnaduAWS' },
    { key: 'telangana',   label: 'Telangana AWS',  source_table: 'observations_aws_telangana',   url: 'https://city.imd.gov.in/api/v1/getTelanganaAWS' },
    { key: 'uttarakhand', label: 'Uttarakhand AWS', source_table: 'observations_aws_uttarakhand', url: 'https://city.imd.gov.in/api/v1/getUttrakhandAWS' },
    { key: 'meghalaya',   label: 'Meghalaya AWS',  source_table: 'observations_aws_meghalaya',   url: 'https://city.imd.gov.in/api/v1/getMeghalayaAWS' },
    { key: 'mizoram',     label: 'Mizoram AWS',    source_table: 'observations_aws_mizoram',     url: 'https://city.imd.gov.in/api/v1/getMizoramAWS' },
    { key: 'iitmMumbai',  label: 'IITM Mumbai AWS', source_table: 'observations_iitm_mumbai',    url: 'https://city.imd.gov.in/api/v1/getIITMRainfallData' },
];

// City IMD AWS sources that ARE fetched (controllers/scripts/aws/awsFetcher.js)
// but have no aws_mapping_id entry, so their data lands only in their own raw
// observation table and never reaches aws_station_daily_data — not part of
// any calculation. These tables have no station_code/aws_station_details link
// (station identity is only the source's own `id`), and no shared schema
// across the three (NHP/Zomato have no `block` column), so "reporting" here
// means "rows exist that day" rather than the -999.9-sentinel check used for
// the mapped sources, and "Total Stations" is an all-time distinct count
// (there's no master registry to compare against, unlike the mapped sources).
// Table names below are a fixed, hardcoded list — never user input — so
// interpolating them into the FROM clause is safe.
// hasBlock: only Karnataka's table has a `block` column (see awsFetcher.js's
// INSERT statements) — NHP and Zomato have no block-level field at all.
const EXCLUDED_SOURCES = [
    { key: 'nhp',       label: 'NHP AWS',       table: 'observations_aws_nhp',       url: 'https://city.imd.gov.in/api/v1/getNHPAWS',       hasBlock: false },
    { key: 'zomato',    label: 'Zomato AWS',    table: 'observations_aws_zomato',    url: 'https://city.imd.gov.in/api/v1/getZomatoAWS',    hasBlock: false },
    { key: 'karnataka', label: 'Karnataka AWS', table: 'observations_aws_karnataka', url: 'https://city.imd.gov.in/api/v1/getKarnatakaAWS', hasBlock: true },
];

// Per source: total stations mapped to it, distinct blocks covered, and how
// many of its stations reported real data (not the -999.9 sentinel) on each
// date in [fromDate, toDate]. Station-to-source linkage is via aws_mapping_id
// (station_code + source_table), joined to aws_station_details for block info
// and aws_station_daily_data for daily reporting counts.
exports.fetchAwsSourceLogs = async (req, res) => {
    try {
        let { fromDate, toDate } = req.body;
        const today = moment().format('YYYY-MM-DD');
        fromDate = fromDate || today;
        toDate = toDate || fromDate;

        if (moment(fromDate).isAfter(toDate)) {
            return res.status(400).json({ success: false, message: "fromDate should be less than or equal to toDate" });
        }
        const spanDays = moment(toDate).diff(moment(fromDate), 'days') + 1;
        if (spanDays > 31) {
            return res.status(400).json({ success: false, message: "Date range cannot exceed 31 days" });
        }

        const dates = [];
        let cursor = moment(fromDate);
        const last = moment(toDate);
        while (cursor.isSameOrBefore(last)) {
            dates.push(cursor.format('YYYY-MM-DD'));
            cursor.add(1, 'day');
        }

        const sources = await Promise.all(SOURCES.map(async (src) => {
            const [totalsResult, dailyResult] = await Promise.all([
                client.query(`
                    SELECT COUNT(DISTINCT m.station_code)::int AS total_stations,
                           COUNT(DISTINCT asd.block_code)::int AS total_blocks
                    FROM public.aws_mapping_id m
                    JOIN public.aws_station_details asd ON asd.station_code = m.station_code
                    WHERE m.source_table = $1
                `, [src.source_table]),
                client.query(`
                    SELECT TO_CHAR(asdd.collection_date, 'YYYY-MM-DD') AS date,
                           COUNT(DISTINCT asdd.station_id)::int AS reporting_count
                    FROM public.aws_station_daily_data asdd
                    JOIN public.aws_mapping_id m ON m.station_code = asdd.station_id AND m.source_table = $1
                    WHERE asdd.collection_date BETWEEN $2 AND $3
                      AND asdd.data != -999.9
                    GROUP BY asdd.collection_date
                `, [src.source_table, fromDate, toDate]),
            ]);

            const totals = totalsResult.rows[0] || { total_stations: 0, total_blocks: 0 };
            const dailyMap = {};
            dailyResult.rows.forEach(r => { dailyMap[r.date] = r.reporting_count; });
            const daily = dates.map(d => ({ date: d, count: dailyMap[d] ?? 0 }));

            return {
                key: src.key,
                label: src.label,
                url: src.url,
                totalStations: totals.total_stations,
                totalBlocks: totals.total_blocks,
                daily,
            };
        }));

        const excludedSources = await Promise.all(EXCLUDED_SOURCES.map(async (src) => {
            const [totalsResult, dailyResult, blocksResult] = await Promise.all([
                client.query(`SELECT COUNT(DISTINCT id)::int AS total_stations FROM ${src.table}`),
                client.query(`
                    SELECT TO_CHAR(dat::date, 'YYYY-MM-DD') AS date,
                           COUNT(DISTINCT id)::int AS reporting_count
                    FROM ${src.table}
                    WHERE dat::date BETWEEN $1::date AND $2::date
                      AND rainfall IS NOT NULL
                    GROUP BY dat::date
                `, [fromDate, toDate]),
                src.hasBlock
                    ? client.query(`SELECT COUNT(DISTINCT block)::int AS total_blocks FROM ${src.table} WHERE block IS NOT NULL`)
                    : Promise.resolve({ rows: [{ total_blocks: null }] }),
            ]);

            const totals = totalsResult.rows[0] || { total_stations: 0 };
            const dailyMap = {};
            dailyResult.rows.forEach(r => { dailyMap[r.date] = r.reporting_count; });
            const daily = dates.map(d => ({ date: d, count: dailyMap[d] ?? 0 }));

            return {
                key: src.key,
                label: src.label,
                url: src.url,
                totalStations: totals.total_stations,
                totalBlocks: src.hasBlock ? (blocksResult.rows[0]?.total_blocks ?? 0) : null,
                daily,
            };
        }));

        res.status(200).json({ success: true, fromDate, toDate, dates, sources, excludedSources });
    } catch (error) {
        console.error('[AWS SOURCE LOGS] fetchAwsSourceLogs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
