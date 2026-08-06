/**
 * ARG / AWS Cumulative + Real-Time analytics.
 *
 * Two data worlds are joined here:
 *
 *   1. CUMULATIVE  — aws_station_daily_data + aws_station_details. One row per
 *      station per AWS day, written by the daily store in aws_station.js. This
 *      is the authoritative State-AWS daily series (-999.9 = no observation).
 *
 *   2. REAL TIME   — the ten observations_aws_* / up_aws_observations /
 *      observations_iitm_mumbai tables, each holding 15-minute slots. The
 *      rainfall column in every one of them is cumulative-since-day-start,
 *      which is why the daily controllers take MAX(rainfall) — the same
 *      property is what makes the 24-hour scrubber possible.
 *
 * Only stations present in aws_mapping_id have a station_code, so world 2 is
 * strictly wider than world 1. Reporting that gap is a first-class feature of
 * this module, not an error case — see fetchSourceHealth / fetchUnmapped.
 */

const client = require("../../../connection");
const moment = require("moment-timezone");
const { IST, getAwsToday, resolveDates } = require("./awsConfig");

/**
 * awsConfig's AWS_DAY_EXPR leaves `dat`/`time` unqualified. Every query here
 * joins the observation table to aws_mapping_id and aws_station_details, so the
 * columns are alias-qualified to keep resolution unambiguous if those tables
 * ever grow a same-named column. Semantics are identical: day D spans
 * (D-1) 21:30 UTC → D 21:30 UTC and is labelled by the end date.
 */
const AWS_DAY = `(t.dat::date + t.time::time + INTERVAL '2 hours 30 minutes')::date`;

// ─── SOURCE REGISTRY ──────────────────────────────────────────────────────────
// The ten real-time tables, normalised. Every table names its columns slightly
// differently (meghalaya's usable total is rainfall_avg, mizoram/meghalaya call
// the type column station_type, zomato has city instead of district and no
// state at all), so each query is generated from this table rather than
// hand-written ten times over.
//
// `table` doubles as the aws_mapping_id.source_table value.
// A null column means "this source does not carry that field".
const SOURCES = [
    {
        key: "up", table: "up_aws_observations", label: "Uttar Pradesh AWS", short: "UP",
        rain: "rainfall", state: "state", district: "district", block: "block",
        lat: "lat", lon: "lon", type: "type",
        temp: "temp", rh: "rh", winds: "winds", updated: "updated_at",
    },
    {
        key: "nhp", table: "observations_aws_nhp", label: "NHP AWS", short: "NHP",
        rain: "rainfall", state: "state", district: "district", block: null,
        lat: null, lon: null, type: null,
        temp: "temp", rh: "rh", winds: "winds", updated: "updated_at",
    },
    {
        key: "zomato", table: "observations_aws_zomato", label: "Zomato AWS", short: "ZOM",
        rain: "rainfall", state: null, district: "city", block: null,
        lat: "lat", lon: "lon", type: "type",
        temp: "temp", rh: "rh", winds: "winds", updated: null,
    },
    {
        key: "meghalaya", table: "observations_aws_meghalaya", label: "Meghalaya AWS", short: "ML",
        rain: "rainfall_avg", state: "state", district: "district", block: "block",
        lat: null, lon: null, type: "station_type",
        temp: "temp", rh: "rh", winds: "winds", updated: "updated_at",
    },
    {
        key: "mizoram", table: "observations_aws_mizoram", label: "Mizoram AWS", short: "MZ",
        rain: "rainfall", state: "state", district: "district", block: null,
        lat: null, lon: null, type: "station_type",
        temp: "temp", rh: "rh", winds: "winds", updated: "updated_at",
    },
    {
        key: "tamilnadu", table: "observations_aws_tamilnadu", label: "Tamil Nadu AWS", short: "TN",
        rain: "rainfall", state: "state", district: "district", block: "block",
        lat: "lat", lon: "lon", type: "type",
        temp: "temp", rh: "rh", winds: "winds", updated: "updated_at",
    },
    {
        key: "uttarakhand", table: "observations_aws_uttarakhand", label: "Uttarakhand AWS", short: "UK",
        rain: "rainfall", state: "state", district: "district", block: "block",
        lat: "lat", lon: "lon", type: "type",
        temp: "temp", rh: "rh", winds: "winds", updated: "updated_at",
    },
    {
        key: "telangana", table: "observations_aws_telangana", label: "Telangana AWS", short: "TS",
        rain: "rainfall", state: "state", district: "district", block: "block",
        lat: "lat", lon: "lon", type: "type",
        temp: "temp", rh: "rh", winds: "winds", updated: "updated_at",
    },
    {
        key: "karnataka", table: "observations_aws_karnataka", label: "Karnataka AWS", short: "KA",
        rain: "rainfall", state: "state", district: "district", block: "block",
        lat: "lat", lon: "lon", type: "type",
        temp: "temp", rh: "rh", winds: "winds", updated: "updated_at",
    },
    {
        key: "iitm", table: "observations_iitm_mumbai", label: "IITM Mumbai ARG", short: "IITM",
        rain: "rainfall", state: "state", district: "district", block: null,
        lat: "lat", lon: "lon", type: "type",
        temp: null, rh: null, winds: null, updated: "updated_at",
    },
];

const SOURCE_BY_KEY = new Map(SOURCES.map((s) => [s.key, s]));

/** "No observation" sentinel written by aws_station.js#fillMissingWithNoData. */
const NO_DATA = -999.9;
/** Anything at or below this is the sentinel, never a real reading. */
const NO_DATA_FLOOR = -900;
/** A day counts as a rain day at or above this, matching the IMD trace threshold. */
const RAIN_THRESHOLD = 0.1;

/** 15-minute slots in one AWS day. */
const SLOT_COUNT = 96;
/** The AWS day boundary is 21:30 UTC, i.e. 03:00 IST — slot 0 starts there. */
const DAY_START_IST_HOURS = 3;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Column reference for `src`, or a typed NULL when the source lacks the field.
 * Everything interpolated into SQL comes from SOURCES, never from the request.
 */
const col = (src, field, type = "text", alias = field) => {
    const name = src[field];
    return name ? `t.${name} AS ${alias}` : `NULL::${type} AS ${alias}`;
};

/** Resolves a `sources` request array to config objects; empty/absent = all. */
const resolveSources = (keys) => {
    if (!Array.isArray(keys) || keys.length === 0) return SOURCES;
    const picked = keys.map((k) => SOURCE_BY_KEY.get(String(k))).filter(Boolean);
    return picked.length ? picked : SOURCES;
};

/** IST clock label for slot `i`, e.g. slot 0 -> "03:00", slot 95 -> "02:45". */
const slotLabel = (i) => {
    const minutes = DAY_START_IST_HOURS * 60 + i * 15;
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** Slot labels plus the day-rollover flag the UI needs to caption "next day". */
const buildSlots = () =>
    Array.from({ length: SLOT_COUNT }, (_, i) => ({
        index: i,
        label: slotLabel(i),
        nextDay: DAY_START_IST_HOURS * 60 + i * 15 >= 24 * 60,
    }));

const num = (v) => (v === null || v === undefined ? null : Number(v));
const int = (v) => (v === null || v === undefined ? 0 : parseInt(v, 10));

/**
 * Days of 15-minute history a feed probe may scan.
 *
 * Defaults to 1 and is capped hard. Each extra day is another ~6000 stations ×
 * 96 slots per table across ten tables, all of it behind COUNT(DISTINCT), and
 * the app shares a single pg Client — so a wide window here does not just make
 * this request slow, it blocks every other request in the backend behind it.
 * A one-day probe costs about the same as the timeline query, which is known
 * to return comfortably.
 */
const clampLookback = (value) => {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return 1;
    return Math.min(Math.max(n, 1), 31);
};

/**
 * Slot index of a row within AWS day $-N. The AWS day runs 03:00 IST → 03:00
 * IST, so the offset is measured from `<date> 03:00 IST`, not from midnight.
 */
const slotExpr = (dateParam) =>
    `FLOOR(EXTRACT(EPOCH FROM (
        (t.dat::timestamp + t.time::time + INTERVAL '5 hours 30 minutes')
        - (${dateParam}::date + INTERVAL '${DAY_START_IST_HOURS} hours')
     )) / 900)::int`;

const fail = (res, tag, error) => {
    console.error(`[AWS RT] ${tag}:`, error);
    return res.status(500).json({ success: false, message: error.message });
};


// ─────────────────────────────────────────────────────────────────────────────
// 1. SOURCE HEALTH
//    POST /api/v1/aws-realtime/sources
//    Body: { date?, lookbackDays? }
//
//    One row per real-time table: how many stations it carries, how many of
//    them resolve to a station_code, how stale the feed is, and how much of
//    today it has delivered. The mapped/unmapped split is the whole point —
//    unmapped stations never reach aws_station_daily_data.
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchSourceHealth = async (req, res) => {
    try {
        const date = req.body.date || getAwsToday();
        const lookbackDays = clampLookback(req.body.lookbackDays);
        const fromDate = moment.tz(date, IST).subtract(lookbackDays - 1, "days").format("YYYY-MM-DD");

        // $1 = window start, $2 = target AWS day
        const parts = SOURCES.map((s) => `
            SELECT
                '${s.key}'::text                                        AS key,
                COUNT(*)                                                AS rows_window,
                COUNT(DISTINCT t.id)                                    AS stations_window,
                COUNT(DISTINCT m.id)                                    AS stations_mapped,
                MAX(t.dat::timestamp + t.time::time
                    + INTERVAL '5 hours 30 minutes')                    AS last_obs_ist,
                COUNT(*) FILTER (WHERE ${AWS_DAY} = $2::date)           AS rows_today,
                COUNT(DISTINCT t.id) FILTER (WHERE ${AWS_DAY} = $2::date) AS stations_today,
                COUNT(DISTINCT t.time) FILTER (WHERE ${AWS_DAY} = $2::date) AS slots_today,
                MAX(t.${s.rain}) FILTER (WHERE ${AWS_DAY} = $2::date)    AS max_rain_today,
                COUNT(DISTINCT t.id) FILTER (
                    WHERE ${AWS_DAY} = $2::date AND t.${s.rain} >= ${RAIN_THRESHOLD}
                )                                                        AS raining_today
            FROM ${s.table} t
            LEFT JOIN aws_mapping_id m
                   ON m.source_table = '${s.table}' AND m.id = t.id
            WHERE t.dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
        `);

        const [health, mapping, store] = await Promise.all([
            client.query(parts.join("\nUNION ALL\n"), [fromDate, date]),
            client.query(`
                SELECT m.source_table,
                       COUNT(*)                                      AS mapped_ids,
                       COUNT(DISTINCT m.station_code)                AS mapped_codes,
                       COUNT(asd.station_code)                       AS resolvable_codes
                FROM aws_mapping_id m
                LEFT JOIN aws_station_details asd ON asd.station_code = m.station_code
                GROUP BY m.source_table
            `),
            client.query(`
                SELECT
                    COUNT(*)                                                  AS rows_stored,
                    COUNT(*) FILTER (WHERE data > ${NO_DATA_FLOOR})            AS rows_with_data,
                    COUNT(*) FILTER (WHERE data >= ${RAIN_THRESHOLD})          AS rows_raining,
                    (SELECT COUNT(*) FROM aws_station_details WHERE flag <> 0) AS stations_registered
                FROM aws_station_daily_data
                WHERE collection_date = $1::date
            `, [date]),
        ]);

        const healthByKey = new Map(health.rows.map((r) => [r.key, r]));
        const mapByTable = new Map(mapping.rows.map((r) => [r.source_table, r]));
        const nowIst = moment().tz(IST);

        const sources = SOURCES.map((s) => {
            const h = healthByKey.get(s.key) || {};
            const m = mapByTable.get(s.table) || {};
            const stationsWindow = int(h.stations_window);
            const stationsMapped = int(h.stations_mapped);
            const lastObs = h.last_obs_ist ? moment(h.last_obs_ist) : null;

            return {
                key: s.key,
                label: s.label,
                short: s.short,
                table: s.table,
                rain_column: s.rain,
                has_coordinates: Boolean(s.lat && s.lon),
                has_state: Boolean(s.state),
                has_block: Boolean(s.block),

                // Real-time feed
                rows_window: int(h.rows_window),
                stations_window: stationsWindow,
                rows_today: int(h.rows_today),
                stations_today: int(h.stations_today),
                slots_today: int(h.slots_today),
                slot_completeness_pct: Number(((int(h.slots_today) / SLOT_COUNT) * 100).toFixed(1)),
                raining_today: int(h.raining_today),
                max_rain_today: num(h.max_rain_today),
                last_obs_ist: lastObs ? lastObs.format("YYYY-MM-DD HH:mm:ss") : null,
                lag_minutes: lastObs ? Math.max(0, nowIst.diff(lastObs, "minutes")) : null,

                // Mapping coverage — the bridge into the cumulative store
                registered_in_mapping: int(m.mapped_ids),
                mapped_station_codes: int(m.mapped_codes),
                // A mapping row whose station_code is absent from
                // aws_station_details is dangling and still yields no daily row.
                dangling_mappings: int(m.mapped_ids) - int(m.resolvable_codes),
                stations_mapped: stationsMapped,
                stations_unmapped: Math.max(0, stationsWindow - stationsMapped),
                mapping_coverage_pct: stationsWindow
                    ? Number(((stationsMapped / stationsWindow) * 100).toFixed(1))
                    : null,
                feeds_cumulative_store: int(m.mapped_ids) > 0,
            };
        });

        const totals = sources.reduce((acc, s) => {
            acc.stations_window += s.stations_window;
            acc.stations_today += s.stations_today;
            acc.stations_mapped += s.stations_mapped;
            acc.stations_unmapped += s.stations_unmapped;
            acc.raining_today += s.raining_today;
            acc.rows_today += s.rows_today;
            return acc;
        }, {
            stations_window: 0, stations_today: 0, stations_mapped: 0,
            stations_unmapped: 0, raining_today: 0, rows_today: 0,
        });

        const st = store.rows[0] || {};
        res.status(200).json({
            success: true,
            message: "AWS source health fetched",
            data: {
                date,
                window: { from: fromDate, to: date, days: lookbackDays },
                generated_at_ist: nowIst.format("YYYY-MM-DD HH:mm:ss"),
                sources,
                totals: {
                    ...totals,
                    sources_total: SOURCES.length,
                    sources_mapped: sources.filter((s) => s.feeds_cumulative_store).length,
                    sources_unmapped: sources.filter((s) => !s.feeds_cumulative_store).length,
                    mapping_coverage_pct: totals.stations_window
                        ? Number(((totals.stations_mapped / totals.stations_window) * 100).toFixed(1))
                        : null,
                },
                cumulative_store: {
                    rows_stored: int(st.rows_stored),
                    rows_with_data: int(st.rows_with_data),
                    rows_no_data: int(st.rows_stored) - int(st.rows_with_data),
                    rows_raining: int(st.rows_raining),
                    stations_registered: int(st.stations_registered),
                    store_completeness_pct: int(st.stations_registered)
                        ? Number(((int(st.rows_with_data) / int(st.stations_registered)) * 100).toFixed(1))
                        : null,
                },
            },
        });
    } catch (error) {
        return fail(res, "fetchSourceHealth", error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 2. UNMAPPED STATIONS
//    POST /api/v1/aws-realtime/unmapped-stations
//    Body: { sources?, lookbackDays?, limit? }
//
//    Stations that stream 15-minute data but have no aws_mapping_id row, so
//    they are invisible to every cumulative product. Ordered by how much rain
//    they reported in the window — the ones worth mapping first.
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchUnmapped = async (req, res) => {
    try {
        const date = req.body.date || getAwsToday();
        const lookbackDays = clampLookback(req.body.lookbackDays);
        const limit = Math.min(Math.max(parseInt(req.body.limit, 10) || 500, 1), 5000);
        const fromDate = moment.tz(date, IST).subtract(lookbackDays - 1, "days").format("YYYY-MM-DD");
        const srcs = resolveSources(req.body.sources);

        const parts = srcs.map((s) => `
            SELECT
                '${s.key}'::text                        AS source_key,
                '${s.label}'::text                      AS source_label,
                t.id                                    AS station_id,
                MAX(t.station)                          AS station_name,
                MAX(${s.state ? `t.${s.state}` : "NULL::text"})       AS state_name,
                MAX(${s.district ? `t.${s.district}` : "NULL::text"}) AS district_name,
                MAX(${s.block ? `t.${s.block}` : "NULL::text"})       AS block_name,
                MAX(${s.lat ? `t.${s.lat}` : "NULL::numeric"})        AS latitude,
                MAX(${s.lon ? `t.${s.lon}` : "NULL::numeric"})        AS longitude,
                COUNT(*)                                AS observations,
                COUNT(DISTINCT ${AWS_DAY})              AS days_seen,
                MAX(t.${s.rain})                        AS peak_rainfall,
                MAX(t.dat::timestamp + t.time::time
                    + INTERVAL '5 hours 30 minutes')    AS last_obs_ist
            FROM ${s.table} t
            WHERE t.dat BETWEEN ($1::date - INTERVAL '1 day') AND $2::date
              AND NOT EXISTS (
                  SELECT 1 FROM aws_mapping_id m
                  WHERE m.source_table = '${s.table}' AND m.id = t.id
              )
            GROUP BY t.id
        `);

        const sql = `
            SELECT * FROM (
                ${parts.join("\nUNION ALL\n")}
            ) u
            ORDER BY peak_rainfall DESC NULLS LAST, observations DESC
            LIMIT ${limit}
        `;
        const result = await client.query(sql, [fromDate, date]);

        const bySource = {};
        for (const row of result.rows) {
            bySource[row.source_key] = (bySource[row.source_key] || 0) + 1;
        }

        res.status(200).json({
            success: true,
            message: "Unmapped AWS stations fetched",
            data: {
                window: { from: fromDate, to: date, days: lookbackDays },
                truncated: result.rows.length === limit,
                count_by_source: bySource,
                stations: result.rows.map((r) => ({
                    source_key: r.source_key,
                    source_label: r.source_label,
                    station_id: r.station_id,
                    station_name: r.station_name,
                    state_name: r.state_name,
                    district_name: r.district_name,
                    block_name: r.block_name,
                    latitude: num(r.latitude),
                    longitude: num(r.longitude),
                    observations: int(r.observations),
                    days_seen: int(r.days_seen),
                    peak_rainfall: num(r.peak_rainfall),
                    last_obs_ist: r.last_obs_ist
                        ? moment(r.last_obs_ist).format("YYYY-MM-DD HH:mm:ss")
                        : null,
                })),
            },
        });
    } catch (error) {
        return fail(res, "fetchUnmapped", error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 3. 24-HOUR TIMELINE
//    POST /api/v1/aws-realtime/timeline
//    Body: { date?, sources?, state?, district?, minRain? }
//
//    The scrubber payload: for every live station, the cumulative rainfall at
//    each of the 96 slots of one AWS day. Because the source rainfall column
//    is already cumulative-since-day-start, the slot value IS the cumulative
//    curve; the client differences it for 15-minute intensity.
//
//    Stations without coordinates in their own table (NHP, Meghalaya, Mizoram)
//    borrow lat/lon from aws_station_details via aws_mapping_id, which is the
//    only way they can appear on the map at all.
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchTimeline = async (req, res) => {
    try {
        const date = req.body.date || getAwsToday();
        const srcs = resolveSources(req.body.sources);
        const stateFilter = req.body.state ? String(req.body.state).trim() : null;
        const districtFilter = req.body.district ? String(req.body.district).trim() : null;
        const requireCoords = req.body.requireCoords !== false;

        // $1 = AWS day. $2 = state filter, $3 = district filter (nullable).
        const params = [date, stateFilter, districtFilter];
        const slot = slotExpr("$1");

        const whereFor = (s) => {
            const clauses = [
                `t.dat BETWEEN ($1::date - INTERVAL '1 day') AND $1::date`,
                `${AWS_DAY} = $1::date`,
            ];
            clauses.push(s.state
                ? `($2::text IS NULL OR LOWER(TRIM(t.${s.state})) = LOWER(TRIM($2::text)))`
                : `$2::text IS NULL`);
            clauses.push(s.district
                ? `($3::text IS NULL OR LOWER(TRIM(t.${s.district})) = LOWER(TRIM($3::text)))`
                : `$3::text IS NULL`);
            return clauses.join(" AND ");
        };

        // ── Station metadata (one row per station) ───────────────────────────
        const metaParts = srcs.map((s) => `
            SELECT
                '${s.key}'::text                                       AS source_key,
                t.id                                                   AS station_id,
                MAX(t.station)                                         AS station_name,
                MAX(${s.state ? `t.${s.state}` : "NULL::text"})        AS state_name,
                MAX(${s.district ? `t.${s.district}` : "NULL::text"})  AS district_name,
                MAX(${s.block ? `t.${s.block}` : "NULL::text"})        AS block_name,
                MAX(${s.type ? `t.${s.type}` : "NULL::text"})          AS station_type,
                MAX(${s.lat ? `t.${s.lat}` : "NULL::numeric"})         AS own_lat,
                MAX(${s.lon ? `t.${s.lon}` : "NULL::numeric"})         AS own_lon,
                MAX(m.station_code)                                    AS station_code,
                MAX(asd.latitude)                                      AS mapped_lat,
                MAX(asd.longitude)                                     AS mapped_lon,
                MAX(asd.station_name)                                  AS mapped_name,
                MAX(t.${s.rain})                                       AS day_total,
                COUNT(*)                                               AS slots_reported,
                MAX(${s.temp ? `t.${s.temp}` : "NULL::numeric"})       AS max_temp,
                MIN(${s.temp ? `t.${s.temp}` : "NULL::numeric"})       AS min_temp,
                AVG(${s.rh ? `t.${s.rh}` : "NULL::numeric"})           AS avg_rh,
                MAX(${s.winds ? `t.${s.winds}` : "NULL::numeric"})     AS max_wind
            FROM ${s.table} t
            LEFT JOIN aws_mapping_id m
                   ON m.source_table = '${s.table}' AND m.id = t.id
            LEFT JOIN aws_station_details asd
                   ON asd.station_code = m.station_code
            WHERE ${whereFor(s)}
            GROUP BY t.id
        `);

        // ── Slot matrix (one row per station per 15-minute slot) ─────────────
        const slotParts = srcs.map((s) => `
            SELECT
                '${s.key}'::text  AS source_key,
                t.id              AS station_id,
                ${slot}           AS slot_index,
                MAX(t.${s.rain})  AS cum
            FROM ${s.table} t
            WHERE ${whereFor(s)}
              AND ${slot} BETWEEN 0 AND ${SLOT_COUNT - 1}
            GROUP BY t.id, ${slot}
        `);

        const [metaRes, slotRes] = await Promise.all([
            client.query(metaParts.join("\nUNION ALL\n"), params),
            client.query(slotParts.join("\nUNION ALL\n"), params),
        ]);

        const stations = new Map();
        for (const r of metaRes.rows) {
            const lat = num(r.own_lat) ?? num(r.mapped_lat);
            const lon = num(r.own_lon) ?? num(r.mapped_lon);
            stations.set(`${r.source_key}|${r.station_id}`, {
                source_key: r.source_key,
                source_label: SOURCE_BY_KEY.get(r.source_key).label,
                station_id: r.station_id,
                station_name: r.station_name || r.mapped_name || r.station_id,
                state_name: r.state_name,
                district_name: r.district_name,
                block_name: r.block_name,
                station_type: r.station_type,
                latitude: lat,
                longitude: lon,
                // Where the marker position came from — "mapped" means the
                // source itself has no coordinates.
                coord_source: num(r.own_lat) !== null ? "source"
                    : num(r.mapped_lat) !== null ? "mapped" : null,
                station_code: r.station_code ? String(r.station_code) : null,
                mapped: Boolean(r.station_code),
                day_total: num(r.day_total),
                slots_reported: int(r.slots_reported),
                slot_completeness_pct: Number(((int(r.slots_reported) / SLOT_COUNT) * 100).toFixed(1)),
                max_temp: num(r.max_temp),
                min_temp: num(r.min_temp),
                avg_rh: r.avg_rh === null ? null : Number(Number(r.avg_rh).toFixed(1)),
                max_wind: num(r.max_wind),
                cum: new Array(SLOT_COUNT).fill(null),
            });
        }

        for (const r of slotRes.rows) {
            const st = stations.get(`${r.source_key}|${r.station_id}`);
            if (!st) continue;
            const i = int(r.slot_index);
            if (i < 0 || i >= SLOT_COUNT) continue;
            const v = num(r.cum);
            st.cum[i] = v === null ? null : Number(v.toFixed(1));
        }

        let list = [...stations.values()];
        const withoutCoords = list.filter((s) => s.latitude === null || s.longitude === null).length;
        if (requireCoords) {
            list = list.filter((s) => s.latitude !== null && s.longitude !== null);
        }

        // Per-slot network aggregates. Computed here rather than client-side so
        // the timeline chart can render before the 96×N matrix is walked.
        const perSlot = Array.from({ length: SLOT_COUNT }, (_, i) => ({
            index: i,
            reporting: 0,
            raining: 0,
            sum_cum: 0,
            max_cum: 0,
        }));
        for (const st of list) {
            for (let i = 0; i < SLOT_COUNT; i++) {
                const v = st.cum[i];
                if (v === null) continue;
                const p = perSlot[i];
                p.reporting += 1;
                p.sum_cum += v;
                if (v >= RAIN_THRESHOLD) p.raining += 1;
                if (v > p.max_cum) p.max_cum = v;
            }
        }
        for (const p of perSlot) {
            p.sum_cum = Number(p.sum_cum.toFixed(1));
            p.max_cum = Number(p.max_cum.toFixed(1));
            p.avg_cum = p.reporting ? Number((p.sum_cum / p.reporting).toFixed(2)) : 0;
        }

        const bySource = {};
        for (const st of list) {
            bySource[st.source_key] = (bySource[st.source_key] || 0) + 1;
        }

        res.status(200).json({
            success: true,
            message: "AWS 24-hour timeline fetched",
            data: {
                date,
                day_start_ist: `${date} 03:00`,
                slot_minutes: 15,
                slots: buildSlots(),
                stations: list,
                per_slot: perSlot,
                meta: {
                    sources: srcs.map((s) => s.key),
                    stations_total: stations.size,
                    stations_plotted: list.length,
                    stations_without_coordinates: withoutCoords,
                    stations_mapped: list.filter((s) => s.mapped).length,
                    stations_unmapped: list.filter((s) => !s.mapped).length,
                    count_by_source: bySource,
                },
            },
        });
    } catch (error) {
        return fail(res, "fetchTimeline", error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 4. CUMULATIVE OVERVIEW
//    POST /api/v1/aws-realtime/cumulative
//    Body: { startDate, endDate, stateCodes?, districtCodes?, stationType? }
//
//    Everything the page needs about the stored State-AWS daily series over a
//    range: per-station totals with spell analysis, the daily network curve,
//    and state / district / centre rollups.
// ─────────────────────────────────────────────────────────────────────────────

/** Shared CTE: the filtered slice of aws_station_daily_data, decorated. */
const cumulativeBaseCte = `
    base AS (
        SELECT
            d.station_id,
            d.collection_date,
            d.data                                                  AS raw,
            CASE WHEN d.data > ${NO_DATA_FLOOR} THEN d.data END     AS val,
            (d.data >= ${RAIN_THRESHOLD})                           AS is_rain,
            (d.data > ${NO_DATA_FLOOR})                             AS is_valid,
            asd.station_name,
            asd.latitude,
            asd.longitude,
            asd.block_name,
            asd.block_code,
            asd.station_type,
            asd.centre_name,
            asd.centre_type,
            asd.district_code,
            ndd.district_name,
            ndd.state_name,
            ndd.state_code,
            ndd.region_name,
            ndd.subdiv_name
        FROM aws_station_daily_data d
        JOIN aws_station_details asd
          ON asd.station_code = d.station_id AND asd.flag <> 0
        LEFT JOIN normal_district_details ndd
          ON ndd.district_code = asd.district_code
        WHERE d.collection_date BETWEEN $1::date AND $2::date
          AND ($3::bigint[] IS NULL OR ndd.state_code    = ANY($3::bigint[]))
          AND ($4::bigint[] IS NULL OR asd.district_code = ANY($4::bigint[]))
          AND ($5::text   IS NULL OR asd.station_type  = $5::text)
    )
`;

exports.fetchCumulative = async (req, res) => {
    try {
        let { startDate, endDate, stateCodes, districtCodes, stationType } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST))) {
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        }

        const toCodes = (v) =>
            Array.isArray(v) && v.length ? v.map(Number).filter(Number.isFinite) : null;
        const params = [
            startDate,
            endDate,
            toCodes(stateCodes),
            toCodes(districtCodes),
            stationType ? String(stationType) : null,
        ];

        // ── Per-station summary, including longest wet spell ─────────────────
        // The spell is a gaps-and-islands run: a running count of dry days
        // labels each consecutive rain streak, then the longest label wins.
        const stationsSql = `
            WITH ${cumulativeBaseCte},
            flagged AS (
                SELECT *,
                    SUM(CASE WHEN is_rain THEN 0 ELSE 1 END)
                        OVER (PARTITION BY station_id ORDER BY collection_date
                              ROWS UNBOUNDED PRECEDING) AS spell_grp
                FROM base
            ),
            spells AS (
                SELECT station_id, spell_grp,
                       COUNT(*)                 AS spell_days,
                       SUM(val)                 AS spell_total,
                       MIN(collection_date)     AS spell_start,
                       MAX(collection_date)     AS spell_end
                FROM flagged
                WHERE is_rain
                GROUP BY station_id, spell_grp
            ),
            best_spell AS (
                SELECT DISTINCT ON (station_id)
                       station_id, spell_days, spell_total, spell_start, spell_end
                FROM spells
                ORDER BY station_id, spell_days DESC, spell_total DESC
            ),
            peak AS (
                SELECT DISTINCT ON (station_id) station_id, collection_date AS peak_date, val AS peak_value
                FROM base
                WHERE is_valid
                ORDER BY station_id, val DESC, collection_date
            )
            SELECT
                b.station_id,
                MIN(b.station_name)                                     AS station_name,
                MIN(b.latitude)                                         AS latitude,
                MIN(b.longitude)                                        AS longitude,
                MIN(b.district_name)                                    AS district_name,
                MIN(b.district_code)                                    AS district_code,
                MIN(b.state_name)                                       AS state_name,
                MIN(b.state_code)                                       AS state_code,
                MIN(b.region_name)                                      AS region_name,
                MIN(b.block_name)                                       AS block_name,
                MIN(b.station_type)                                     AS station_type,
                MIN(b.centre_name)                                      AS centre_name,
                COUNT(*)                                                AS days_total,
                COUNT(*) FILTER (WHERE b.is_valid)                      AS days_reported,
                COUNT(*) FILTER (WHERE NOT b.is_valid)                  AS days_missing,
                COUNT(*) FILTER (WHERE b.is_rain)                       AS rain_days,
                COUNT(*) FILTER (WHERE b.is_valid AND NOT b.is_rain)    AS dry_days,
                ROUND(COALESCE(SUM(b.val), 0)::numeric, 1)              AS total_rainfall,
                ROUND(AVG(b.val)::numeric, 2)                           AS mean_daily,
                ROUND(AVG(b.val) FILTER (WHERE b.is_rain)::numeric, 2)  AS mean_rain_day,
                ROUND(STDDEV_SAMP(b.val)::numeric, 2)                   AS sd_daily,
                MAX(b.val)                                              AS max_daily,
                ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY b.val)::numeric, 1)  AS median_daily,
                ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY b.val)::numeric, 1) AS p95_daily,
                MIN(p.peak_date)                                        AS peak_date,
                COALESCE(MIN(s.spell_days), 0)                          AS longest_wet_spell,
                ROUND(COALESCE(MIN(s.spell_total), 0)::numeric, 1)      AS longest_spell_total,
                MIN(s.spell_start)                                      AS spell_start,
                MIN(s.spell_end)                                        AS spell_end
            FROM base b
            LEFT JOIN best_spell s ON s.station_id = b.station_id
            LEFT JOIN peak p       ON p.station_id = b.station_id
            GROUP BY b.station_id
            ORDER BY total_rainfall DESC
        `;

        // ── Daily network curve ──────────────────────────────────────────────
        const dailySql = `
            WITH ${cumulativeBaseCte}
            SELECT
                TO_CHAR(collection_date, 'YYYY-MM-DD')                  AS collection_date,
                COUNT(*)                                                AS stations_total,
                COUNT(*) FILTER (WHERE is_valid)                        AS stations_reporting,
                COUNT(*) FILTER (WHERE is_rain)                         AS stations_raining,
                ROUND(COALESCE(SUM(val), 0)::numeric, 1)                AS sum_rainfall,
                ROUND(AVG(val)::numeric, 2)                             AS avg_rainfall,
                ROUND(AVG(val) FILTER (WHERE is_rain)::numeric, 2)      AS avg_rain_station,
                MAX(val)                                                AS max_rainfall,
                ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY val)::numeric, 1) AS median_rainfall
            FROM base
            GROUP BY collection_date
            ORDER BY collection_date
        `;

        // ── Geographic rollups, one pass per level ───────────────────────────
        const rollupSql = (codeCol, nameCol, levelKey) => `
            WITH ${cumulativeBaseCte},
            per_station AS (
                SELECT station_id,
                       MIN(${codeCol}) AS group_code,
                       MIN(${nameCol}) AS group_name,
                       SUM(val)        AS station_total,
                       COUNT(*) FILTER (WHERE is_valid) AS days_reported,
                       COUNT(*) FILTER (WHERE is_rain)  AS rain_days
                FROM base
                GROUP BY station_id
            )
            SELECT
                '${levelKey}'::text                             AS level,
                group_code,
                group_name,
                COUNT(*)                                        AS stations,
                COUNT(*) FILTER (WHERE days_reported > 0)       AS stations_reporting,
                ROUND(COALESCE(SUM(station_total), 0)::numeric, 1) AS sum_rainfall,
                ROUND(AVG(station_total)::numeric, 1)           AS avg_rainfall,
                MAX(station_total)                              AS max_rainfall,
                ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY station_total)::numeric, 1) AS median_rainfall,
                ROUND(AVG(rain_days)::numeric, 1)               AS avg_rain_days
            FROM per_station
            WHERE group_name IS NOT NULL
            GROUP BY group_code, group_name
            ORDER BY avg_rainfall DESC NULLS LAST
        `;

        const [stationsRes, dailyRes, statesRes, districtsRes, centresRes] = await Promise.all([
            client.query(stationsSql, params),
            client.query(dailySql, params),
            client.query(rollupSql("state_code", "state_name", "state"), params),
            client.query(rollupSql("district_code", "district_name", "district"), params),
            client.query(rollupSql("centre_name", "centre_name", "centre"), params),
        ]);

        const stations = stationsRes.rows.map((r) => ({
            station_code: String(r.station_id),
            station_name: r.station_name,
            latitude: num(r.latitude),
            longitude: num(r.longitude),
            district_name: r.district_name,
            district_code: r.district_code === null ? null : String(r.district_code),
            state_name: r.state_name,
            state_code: r.state_code === null ? null : String(r.state_code),
            region_name: r.region_name,
            block_name: r.block_name,
            station_type: r.station_type,
            centre_name: r.centre_name,
            days_total: int(r.days_total),
            days_reported: int(r.days_reported),
            days_missing: int(r.days_missing),
            reporting_pct: int(r.days_total)
                ? Number(((int(r.days_reported) / int(r.days_total)) * 100).toFixed(1))
                : 0,
            rain_days: int(r.rain_days),
            dry_days: int(r.dry_days),
            total_rainfall: num(r.total_rainfall),
            mean_daily: num(r.mean_daily),
            mean_rain_day: num(r.mean_rain_day),
            sd_daily: num(r.sd_daily),
            // Coefficient of variation — how erratic the station's daily
            // rainfall is, independent of how much it gets.
            cv_pct: num(r.mean_daily) ? Number(((num(r.sd_daily) / num(r.mean_daily)) * 100).toFixed(1)) : null,
            max_daily: num(r.max_daily),
            median_daily: num(r.median_daily),
            p95_daily: num(r.p95_daily),
            peak_date: r.peak_date ? moment(r.peak_date).format("YYYY-MM-DD") : null,
            longest_wet_spell: int(r.longest_wet_spell),
            longest_spell_total: num(r.longest_spell_total),
            spell_start: r.spell_start ? moment(r.spell_start).format("YYYY-MM-DD") : null,
            spell_end: r.spell_end ? moment(r.spell_end).format("YYYY-MM-DD") : null,
            // Share of the window's total delivered on its single wettest day.
            peak_share_pct: num(r.total_rainfall)
                ? Number(((num(r.max_daily) / num(r.total_rainfall)) * 100).toFixed(1))
                : null,
        }));

        const daily = dailyRes.rows.map((r) => ({
            collection_date: r.collection_date,
            stations_total: int(r.stations_total),
            stations_reporting: int(r.stations_reporting),
            stations_raining: int(r.stations_raining),
            sum_rainfall: num(r.sum_rainfall),
            avg_rainfall: num(r.avg_rainfall),
            avg_rain_station: num(r.avg_rain_station),
            max_rainfall: num(r.max_rainfall),
            median_rainfall: num(r.median_rainfall),
            reporting_pct: int(r.stations_total)
                ? Number(((int(r.stations_reporting) / int(r.stations_total)) * 100).toFixed(1))
                : 0,
        }));

        const mapRollup = (rows) => rows.map((r) => ({
            code: r.group_code === null ? null : String(r.group_code),
            name: r.group_name,
            stations: int(r.stations),
            stations_reporting: int(r.stations_reporting),
            sum_rainfall: num(r.sum_rainfall),
            avg_rainfall: num(r.avg_rainfall),
            max_rainfall: num(r.max_rainfall),
            median_rainfall: num(r.median_rainfall),
            avg_rain_days: num(r.avg_rain_days),
        }));

        const reporting = stations.filter((s) => s.days_reported > 0);
        const totals = reporting.reduce((a, s) => a + (s.total_rainfall || 0), 0);
        const days = daily.length;

        res.status(200).json({
            success: true,
            message: "AWS cumulative analytics fetched",
            data: {
                range: { startDate, endDate, days },
                summary: {
                    stations_total: stations.length,
                    stations_reporting: reporting.length,
                    stations_silent: stations.length - reporting.length,
                    network_reporting_pct: stations.length
                        ? Number(((reporting.length / stations.length) * 100).toFixed(1))
                        : 0,
                    total_rainfall: Number(totals.toFixed(1)),
                    mean_station_total: reporting.length
                        ? Number((totals / reporting.length).toFixed(1))
                        : 0,
                    wettest_station: reporting[0] || null,
                    wettest_day: daily.reduce(
                        (best, d) => (best === null || (d.avg_rainfall ?? -1) > (best.avg_rainfall ?? -1) ? d : best),
                        null
                    ),
                    peak_station_day: stations.reduce(
                        (best, s) => (best === null || (s.max_daily ?? -1) > (best.max_daily ?? -1) ? s : best),
                        null
                    ),
                },
                stations,
                daily,
                states: mapRollup(statesRes.rows),
                districts: mapRollup(districtsRes.rows),
                centres: mapRollup(centresRes.rows),
            },
        });
    } catch (error) {
        return fail(res, "fetchCumulative", error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 5. STATION DEEP DIVE
//    POST /api/v1/aws-realtime/station-series
//    Body: { stationCode, startDate, endDate }
//
//    One station's stored daily series plus a running accumulation, and — when
//    the station maps back to a live source — its 15-minute curve for the last
//    day of the range.
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchStationSeries = async (req, res) => {
    try {
        let { stationCode, startDate, endDate } = req.body;
        if (stationCode === undefined || stationCode === null || stationCode === "") {
            return res.status(400).json({ success: false, message: "stationCode is required" });
        }
        ({ startDate, endDate } = resolveDates(startDate, endDate));

        const detailQ = await client.query(`
            SELECT asd.station_code, asd.station_name, asd.station_type, asd.centre_name,
                   asd.latitude, asd.longitude, asd.block_name, asd.block_code,
                   asd.activationdate, asd.district_code,
                   ndd.district_name, ndd.state_name, ndd.state_code, ndd.region_name, ndd.subdiv_name
            FROM aws_station_details asd
            LEFT JOIN normal_district_details ndd ON ndd.district_code = asd.district_code
            WHERE asd.station_code = $1::bigint
        `, [stationCode]);

        if (detailQ.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Station not found in aws_station_details" });
        }

        const seriesQ = await client.query(`
            SELECT TO_CHAR(collection_date, 'YYYY-MM-DD') AS collection_date,
                   data,
                   CASE WHEN data > ${NO_DATA_FLOOR} THEN data END AS val
            FROM aws_station_daily_data
            WHERE station_id = $1::bigint AND collection_date BETWEEN $2::date AND $3::date
            ORDER BY collection_date
        `, [stationCode, startDate, endDate]);

        // Which live table (if any) this station_code came from.
        const sourceQ = await client.query(
            `SELECT id, source_table FROM aws_mapping_id WHERE station_code = $1::bigint`,
            [stationCode]
        );

        let running = 0;
        const series = seriesQ.rows.map((r) => {
            const val = num(r.val);
            if (val !== null) running += val;
            return {
                collection_date: r.collection_date,
                value: val,
                missing: val === null,
                cumulative: Number(running.toFixed(1)),
            };
        });

        const values = series.filter((s) => s.value !== null).map((s) => s.value);
        const sorted = [...values].sort((a, b) => a - b);
        const pct = (p) => {
            if (!sorted.length) return null;
            const i = (sorted.length - 1) * p;
            const lo = Math.floor(i), hi = Math.ceil(i);
            return Number((sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo)).toFixed(1));
        };
        const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
        const sd = values.length > 1
            ? Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1))
            : null;

        // Live 15-minute curve for the last day of the range, if a source exists.
        let liveSlots = null;
        const mapped = sourceQ.rows[0];
        if (mapped) {
            const src = SOURCES.find((s) => s.table === mapped.source_table);
            if (src) {
                const slot = slotExpr("$2");
                const liveQ = await client.query(`
                    SELECT ${slot} AS slot_index, MAX(t.${src.rain}) AS cum
                    FROM ${src.table} t
                    WHERE t.id = $1
                      AND t.dat BETWEEN ($2::date - INTERVAL '1 day') AND $2::date
                      AND ${AWS_DAY} = $2::date
                      AND ${slot} BETWEEN 0 AND ${SLOT_COUNT - 1}
                    GROUP BY ${slot}
                    ORDER BY 1
                `, [mapped.id, endDate]);

                const cum = new Array(SLOT_COUNT).fill(null);
                for (const r of liveQ.rows) cum[int(r.slot_index)] = num(r.cum);
                liveSlots = {
                    date: endDate,
                    source_key: src.key,
                    source_label: src.label,
                    source_id: mapped.id,
                    slots: buildSlots(),
                    cum,
                };
            }
        }

        const d = detailQ.rows[0];
        res.status(200).json({
            success: true,
            message: "AWS station series fetched",
            data: {
                station: {
                    station_code: String(d.station_code),
                    station_name: d.station_name,
                    station_type: d.station_type,
                    centre_name: d.centre_name,
                    latitude: num(d.latitude),
                    longitude: num(d.longitude),
                    block_name: d.block_name,
                    district_name: d.district_name,
                    state_name: d.state_name,
                    region_name: d.region_name,
                    subdiv_name: d.subdiv_name,
                    activation_date: d.activationdate
                        ? moment(d.activationdate).format("YYYY-MM-DD")
                        : null,
                    live_sources: sourceQ.rows.map((r) => ({
                        source_id: r.id,
                        source_table: r.source_table,
                        source_label: (SOURCES.find((s) => s.table === r.source_table) || {}).label || r.source_table,
                    })),
                },
                range: { startDate, endDate },
                series,
                stats: {
                    days_total: series.length,
                    days_reported: values.length,
                    days_missing: series.length - values.length,
                    rain_days: values.filter((v) => v >= RAIN_THRESHOLD).length,
                    total: Number(values.reduce((a, b) => a + b, 0).toFixed(1)),
                    mean: mean === null ? null : Number(mean.toFixed(2)),
                    sd: sd === null ? null : Number(sd.toFixed(2)),
                    max: values.length ? Math.max(...values) : null,
                    median: pct(0.5),
                    p90: pct(0.9),
                    p95: pct(0.95),
                },
                live: liveSlots,
            },
        });
    } catch (error) {
        return fail(res, "fetchStationSeries", error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 6. FILTER OPTIONS
//    POST /api/v1/aws-realtime/filters
//
//    States / districts that actually carry State-AWS stations, plus the live
//    state names each real-time source reports (they are free text and do not
//    always match normal_district_details spellings).
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchFilters = async (req, res) => {
    try {
        const date = req.body.date || getAwsToday();

        const geoQ = await client.query(`
            SELECT DISTINCT
                ndd.state_code, ndd.state_name,
                asd.district_code, ndd.district_name, ndd.region_name
            FROM aws_station_details asd
            JOIN normal_district_details ndd ON ndd.district_code = asd.district_code
            WHERE asd.flag <> 0
            ORDER BY ndd.state_name, ndd.district_name
        `);

        const typeQ = await client.query(`
            SELECT station_type, COUNT(*) AS stations
            FROM aws_station_details
            WHERE flag <> 0 AND station_type IS NOT NULL
            GROUP BY station_type
            ORDER BY stations DESC
        `);

        const liveGeoParts = SOURCES.filter((s) => s.state || s.district).map((s) => `
            SELECT DISTINCT
                '${s.key}'::text                                      AS source_key,
                ${s.state ? `t.${s.state}` : "NULL::text"}            AS state_name,
                ${s.district ? `t.${s.district}` : "NULL::text"}      AS district_name
            FROM ${s.table} t
            WHERE t.dat BETWEEN ($1::date - INTERVAL '7 days') AND $1::date
        `);
        const liveQ = await client.query(liveGeoParts.join("\nUNION\n"), [date]);

        const states = [];
        const seenState = new Set();
        const districtsByState = {};
        for (const r of geoQ.rows) {
            const sc = String(r.state_code);
            if (!seenState.has(sc)) {
                seenState.add(sc);
                states.push({ state_code: sc, state_name: r.state_name, region_name: r.region_name });
            }
            (districtsByState[sc] = districtsByState[sc] || []).push({
                district_code: String(r.district_code),
                district_name: r.district_name,
            });
        }

        const liveStates = {};
        const liveDistricts = {};
        for (const r of liveQ.rows) {
            if (r.state_name) {
                (liveStates[r.source_key] = liveStates[r.source_key] || new Set()).add(r.state_name.trim());
            }
            if (r.district_name) {
                (liveDistricts[r.source_key] = liveDistricts[r.source_key] || new Set()).add(r.district_name.trim());
            }
        }

        res.status(200).json({
            success: true,
            message: "AWS filter options fetched",
            data: {
                aws_today: getAwsToday(),
                states,
                districts_by_state: districtsByState,
                station_types: typeQ.rows.map((r) => ({
                    station_type: r.station_type,
                    stations: int(r.stations),
                })),
                sources: SOURCES.map((s) => ({
                    key: s.key,
                    label: s.label,
                    short: s.short,
                    table: s.table,
                    has_coordinates: Boolean(s.lat && s.lon),
                    live_states: [...(liveStates[s.key] || [])].sort(),
                    live_districts: [...(liveDistricts[s.key] || [])].sort(),
                })),
            },
        });
    } catch (error) {
        return fail(res, "fetchFilters", error);
    }
};

exports.SOURCES = SOURCES;
