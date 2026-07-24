const client = require("../connection");

// ─── SQL ─────────────────────────────────────────────────────────────────────

const IMD_STATIONS_SQL = `
    SELECT
        sd.station_code,
        sd.station_name,
        sd.block_name,
        ndd.state_name,
        ndd.district_name,
        sdd.collection_date::text AS date,
        sdd.data::float            AS data
    FROM public.station_details sd
    JOIN public.station_daily_data_updates sdd ON sdd.station_id = sd.station_code
    JOIN public.normal_district_details    ndd ON ndd.district_code = sdd.district_code
    WHERE sdd.collection_date BETWEEN $1 AND $2
      AND sd.flag  != 0
    ORDER BY sd.station_code, sdd.collection_date
`;

const AWS_STATIONS_SQL = `
    SELECT
        asd.station_code,
        asd.station_name,
        asd.block_name,
        ndd.state_name,
        ndd.district_name,
        asdd.collection_date::text AS date,
        asdd.data::float            AS data
    FROM public.aws_station_details    asd
    JOIN public.normal_district_details ndd  ON ndd.district_code  = asd.district_code
    JOIN public.aws_station_daily_data  asdd ON asdd.station_id    = asd.station_code
    WHERE asdd.collection_date BETWEEN $1 AND $2
    ORDER BY asd.station_code, asdd.collection_date
`;

const IMD_COUNT_PER_DATE_SQL = `
    SELECT
        sdd.collection_date::text AS date,
        COUNT(DISTINCT sdd.station_id)::int AS count
    FROM public.station_daily_data_updates sdd
    JOIN public.station_details sd ON sd.station_code = sdd.station_id
    WHERE sdd.collection_date BETWEEN $1 AND $2
      AND sdd.data::float >= 0
      AND sd.flag   != 0
    GROUP BY sdd.collection_date
    ORDER BY sdd.collection_date
`;

const AWS_COUNT_PER_DATE_SQL = `
    SELECT
        collection_date::text AS date,
        COUNT(DISTINCT station_id)::int AS count
    FROM public.aws_station_daily_data
    WHERE collection_date BETWEEN $1 AND $2
      AND data >= 0
    GROUP BY collection_date
    ORDER BY collection_date
`;

// District-area weighted country actual per date (IMD only)
const IMD_COUNTRY_PER_DATE_SQL = `
    WITH dist_avg AS (
        SELECT
            sdd.collection_date::text AS date,
            sdd.district_code,
            AVG(sdd.data::float)      AS avg_data
        FROM public.station_daily_data_updates sdd
        JOIN public.station_details sd ON sd.station_code = sdd.station_id
        WHERE sdd.collection_date BETWEEN $1 AND $2
          AND sdd.data::float >= 0
          AND sd.flag  != 0
        GROUP BY sdd.collection_date, sdd.district_code
    )
    SELECT
        da.date,
        SUM(da.avg_data * ndd.district_area) / NULLIF(SUM(ndd.district_area), 0) AS country_actual
    FROM dist_avg da
    JOIN public.normal_district_details ndd ON ndd.district_code = da.district_code
    GROUP BY da.date
    ORDER BY da.date
`;

// District-area weighted country actual per date (IMD + AWS combined)
const AWS_COUNTRY_PER_DATE_SQL = `
    WITH combined AS (
        SELECT
            sdd.collection_date AS date,
            sdd.district_code,
            sdd.data::float     AS rainfall
        FROM public.station_daily_data_updates sdd
        JOIN public.station_details sd ON sd.station_code = sdd.station_id
        WHERE sdd.collection_date BETWEEN $1 AND $2
          AND sdd.data::float >= 0
          AND sd.flag  != 0
        UNION ALL
        SELECT
            asdd.collection_date,
            asdd.district_code::int,
            asdd.data::float
        FROM public.aws_station_daily_data asdd
        WHERE asdd.collection_date BETWEEN $1 AND $2
          AND asdd.data >= 0
    ),
    dist_avg AS (
        SELECT
            date::text         AS date,
            district_code,
            AVG(rainfall)      AS avg_data
        FROM combined
        GROUP BY date, district_code
    )
    SELECT
        da.date,
        SUM(da.avg_data * ndd.district_area) / NULLIF(SUM(ndd.district_area), 0) AS country_actual
    FROM dist_avg da
    JOIN public.normal_district_details ndd ON ndd.district_code = da.district_code
    GROUP BY da.date
    ORDER BY da.date
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateDateRange(from, to) {
    const dates = [];
    const cur = new Date(from + 'T00:00:00Z');
    const end = new Date(to   + 'T00:00:00Z');
    while (cur <= end) {
        dates.push(cur.toISOString().split('T')[0]);
        cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return dates;
}

function toMap(rows, key, val) {
    const m = {};
    rows.forEach(r => { m[r[key]] = r[val]; });
    return m;
}

// ─── Controller ──────────────────────────────────────────────────────────────

// POST /api/v1/fetchCalcModeStationsPivot
// Body: { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
exports.fetchCalcModeStationsPivot = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "startDate and endDate are required" });
        }
        if (endDate < startDate) {
            return res.status(400).json({ success: false, message: "endDate must be >= startDate" });
        }

        const [
            imdRows,
            awsRows,
            imdTotalRes,
            awsTotalRes,
            imdCountRes,
            awsCountRes,
            imdCountryRes,
            awsCountryRes,
        ] = await Promise.all([
            client.query(IMD_STATIONS_SQL,          [startDate, endDate]),
            client.query(AWS_STATIONS_SQL,          [startDate, endDate]),
            client.query(`SELECT COUNT(*)::int AS total FROM public.station_details    WHERE flag != 0`),
            client.query(`SELECT COUNT(*)::int AS total FROM public.aws_station_details`),
            client.query(IMD_COUNT_PER_DATE_SQL,    [startDate, endDate]),
            client.query(AWS_COUNT_PER_DATE_SQL,    [startDate, endDate]),
            client.query(IMD_COUNTRY_PER_DATE_SQL,  [startDate, endDate]),
            client.query(AWS_COUNTRY_PER_DATE_SQL,  [startDate, endDate]),
        ]);

        const imdTotal = imdTotalRes.rows[0]?.total ?? 0;
        const awsTotal = awsTotalRes.rows[0]?.total ?? 0;

        const imdCountMap   = toMap(imdCountRes.rows,   'date', 'count');
        const awsCountMap   = toMap(awsCountRes.rows,   'date', 'count');
        const imdCountryMap = toMap(imdCountryRes.rows, 'date', 'country_actual');
        const awsCountryMap = toMap(awsCountryRes.rows, 'date', 'country_actual');

        const dates = generateDateRange(startDate, endDate);

        // Build IMD pivot: one entry per station, values keyed by date
        const imdMap = new Map();
        imdRows.rows.forEach(row => {
            const key = String(row.station_code);
            if (!imdMap.has(key)) {
                imdMap.set(key, {
                    station_code:  row.station_code,
                    station_name:  row.station_name,
                    state_name:    row.state_name,
                    district_name: row.district_name,
                    block_name:    row.block_name,
                    values:        {},
                });
            }
            const imdVal = row.data !== null ? parseFloat(row.data) : null;
            imdMap.get(key).values[row.date] = (imdVal === null || imdVal < 0) ? null : imdVal;
        });

        // Build AWS pivot
        const awsMap = new Map();
        awsRows.rows.forEach(row => {
            const key = String(row.station_code);
            if (!awsMap.has(key)) {
                awsMap.set(key, {
                    station_code:  row.station_code,
                    station_name:  row.station_name,
                    state_name:    row.state_name,
                    district_name: row.district_name,
                    block_name:    row.block_name,
                    values:        {},
                });
            }
            const awsVal = row.data !== null ? parseFloat(row.data) : null;
            awsMap.get(key).values[row.date] = (awsVal === null || awsVal < 0) ? null : awsVal;
        });

        // Build per-date metadata for each date in range
        const imdPerDate = {};
        const awsPerDate = {};
        dates.forEach(date => {
            const imdCountry = imdCountryMap[date];
            const awsCountry = awsCountryMap[date];
            imdPerDate[date] = {
                count:         imdCountMap[date]   ?? 0,
                total:         imdTotal,
                countryActual: imdCountry != null ? parseFloat(imdCountry) : null,
            };
            awsPerDate[date] = {
                count:         awsCountMap[date]   ?? 0,
                total:         awsTotal,
                countryActual: awsCountry != null ? parseFloat(awsCountry) : null,
            };
        });

        res.status(200).json({
            success: true,
            dates,
            imd: {
                stations: Array.from(imdMap.values()),
                perDate:  imdPerDate,
            },
            aws: {
                stations: Array.from(awsMap.values()),
                perDate:  awsPerDate,
            },
        });

    } catch (error) {
        console.error("[CALC MODE PIVOT] error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
