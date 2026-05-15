const client     = require("../../../connection");
const moment     = require("moment-timezone");
const { IST, AWS_DAY_EXPR, getAwsToday } = require("./awsConfig");

// ─── SOURCE TABLE CONFIG ──────────────────────────────────────────────────────
// Each entry: which observation table to read from, which column is rainfall,
// and what flag value to stamp on the inserted row in aws_station_daily_data.
// Flags must be 1–7 per the aws_station_daily_data constraint.
const SOURCES = [
    { table: "up_aws_observations",          rainfallCol: "rainfall", flag: 1 },
    { table: "observations_aws_nhp",         rainfallCol: "rainfall", flag: 1 },
    { table: "observations_aws_zomato",      rainfallCol: "rainfall", flag: 1 },
    { table: "observations_aws_meghalaya",   rainfallCol: "rainfall", flag: 1 },
    { table: "observations_aws_mizoram",     rainfallCol: "rainfall", flag: 1 },
    { table: "observations_aws_tamilnadu",   rainfallCol: "rainfall", flag: 1 },
    { table: "observations_aws_uttarakhand", rainfallCol: "rainfall", flag: 1 },
    { table: "observations_aws_telangana",   rainfallCol: "rainfall", flag: 1 },
    { table: "observations_aws_karnataka",   rainfallCol: "rainfall", flag: 1 },
    { table: "observations_iitm_mumbai",     rainfallCol: "rainfall", flag: 1 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Generates all YYYY-MM-DD dates from startDate to endDate inclusive
const dateRange = (startDate, endDate) => {
    const dates = [];
    let cur = moment.tz(startDate, IST);
    const end = moment.tz(endDate, IST);
    while (cur.isSameOrBefore(end, "day")) {
        dates.push(cur.format("YYYY-MM-DD"));
        cur.add(1, "day");
    }
    return dates;
};

// Sums rainfall for one source table on one AWS day and inserts into aws_station_daily_data.
// Only inserts rows where station id exists in aws_mapping_id AND aws_station_details.
const insertForSourceAndDay = async (pgClient, table, rainfallCol, flag, date) => {
    const query = `
        INSERT INTO aws_station_daily_data (
            collection_date, data, station_id, district_code, flag
        )
        SELECT
            ${AWS_DAY_EXPR}                         AS collection_date,
            COALESCE(SUM(o.${rainfallCol}), 0)      AS data,
            asd.station_code                         AS station_id,
            asd.district_code,
            ${flag}                                  AS flag
        FROM aws_station_details asd
        JOIN aws_mapping_id m
            ON m.station_code = asd.station_code
            AND m.source_table = '${table}'
        JOIN ${table} o
            ON o.id::varchar = m.id
        WHERE
            o.dat BETWEEN $1::date AND ($1::date + INTERVAL '1 day')
            AND ${AWS_DAY_EXPR} = $1::date
        GROUP BY
            ${AWS_DAY_EXPR}, asd.station_code, asd.district_code
    `;
    const result = await pgClient.query(query, [date]);
    return result.rowCount;
};

// Deletes all rows for a given collection_date from aws_station_daily_data
const deleteForDay = async (pgClient, date) => {
    await pgClient.query(
        `DELETE FROM aws_station_daily_data WHERE collection_date = $1`,
        [date]
    );
};

// Checks if any rows exist in aws_station_daily_data for a given date
const hasDataForDay = async (pgClient, date) => {
    const r = await pgClient.query(
        `SELECT 1 FROM aws_station_daily_data WHERE collection_date = $1 LIMIT 1`,
        [date]
    );
    return r.rowCount > 0;
};


// ─────────────────────────────────────────────────────────────────────────────
// 1. OVERRIDE MODE
//    POST /api/aws-station/store-override
//    Body: { startDate, endDate }
//    For each day in range: DELETE existing rows for that source+day, then INSERT fresh sums.
// ─────────────────────────────────────────────────────────────────────────────
exports.storeOverride = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        if (!startDate) return res.status(400).json({ success: false, message: "startDate is required" });
        if (!endDate) endDate = startDate;

        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST))) {
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        }

        const dates = dateRange(startDate, endDate);
        const summary = [];

        for (const date of dates) {
            const dayResult = { date, sources: [] };

            await deleteForDay(client, date);

            for (const src of SOURCES) {
                const inserted = await insertForSourceAndDay(client, src.table, src.rainfallCol, src.flag, date);
                dayResult.sources.push({ table: src.table, inserted });
            }

            summary.push(dayResult);
        }

        res.status(200).json({
            success: true,
            message: `Override complete for ${dates.length} day(s)`,
            summary,
        });

    } catch (error) {
        console.error("[AWS STATION] storeOverride error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 2. CONTINUE MODE
//    POST /api/aws-station/store-continue
//    Body: { startDate, endDate }
//    For each day in range: skip if data already exists, otherwise INSERT.
// ─────────────────────────────────────────────────────────────────────────────
exports.storeContinue = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        if (!startDate) return res.status(400).json({ success: false, message: "startDate is required" });
        if (!endDate) endDate = startDate;

        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST))) {
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        }

        const dates = dateRange(startDate, endDate);
        const summary = [];

        for (const date of dates) {
            const alreadyHasData = await hasDataForDay(client, date);

            if (alreadyHasData) {
                summary.push({ date, skipped: true });
                continue;
            }

            const dayResult = { date, skipped: false, sources: [] };

            for (const src of SOURCES) {
                const inserted = await insertForSourceAndDay(client, src.table, src.rainfallCol, src.flag, date);
                dayResult.sources.push({ table: src.table, inserted });
            }

            summary.push(dayResult);
        }

        res.status(200).json({
            success: true,
            message: `Continue complete for ${dates.length} day(s)`,
            summary,
        });

    } catch (error) {
        console.error("[AWS STATION] storeContinue error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 3. CRON MODE
//    POST /api/aws-station/store-cron
//    No body required.
//    Runs for the current AWS day (determined by global time config).
//    Deletes existing rows for today then inserts fresh sums — always up to date.
// ─────────────────────────────────────────────────────────────────────────────
exports.storeCron = async (req, res) => {
    try {
        const date = getAwsToday();
        const summary = { date, sources: [] };

        await deleteForDay(client, date);

        for (const src of SOURCES) {
            const inserted = await insertForSourceAndDay(client, src.table, src.rainfallCol, src.flag, date);
            summary.sources.push({ table: src.table, inserted });
        }

        console.log(`[AWS STATION CRON] ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Date: ${date} | Done`);

        res.status(200).json({
            success: true,
            message: `Cron store complete for ${date}`,
            summary,
        });

    } catch (error) {
        console.error("[AWS STATION] storeCron error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
