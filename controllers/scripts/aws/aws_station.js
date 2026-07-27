const client  = require("../../../connection");
const moment   = require("moment-timezone");
const { IST, getAwsToday } = require("./awsConfig");
const { getExclusionWindows, applyExclusions } = require("../../utils/exclusionSql");

const upCtrl          = require("./upAwsController");
const tamilnaduCtrl   = require("./tamilnaduAwsController");
const telanganaCtrl   = require("./telanganaAwsController");
const uttarakhandCtrl = require("./uttarakhandAwsController");
const meghalayaCtrl   = require("./meghalayaAwsController");
const mizoramCtrl     = require("./mizoramAwsController");
const iitmMumbaiCtrl  = require("./iitmMumbaiController");

// ─── SOURCE CONFIG ────────────────────────────────────────────────────────────
const SOURCES = [
    { ctrl: upCtrl,          source_table: "up_aws_observations",          flag: 1 },
    { ctrl: tamilnaduCtrl,   source_table: "observations_aws_tamilnadu",   flag: 1 },
    { ctrl: telanganaCtrl,   source_table: "observations_aws_telangana",   flag: 1 },
    { ctrl: uttarakhandCtrl, source_table: "observations_aws_uttarakhand", flag: 1 },
    { ctrl: meghalayaCtrl,   source_table: "observations_aws_meghalaya",   flag: 1 },
    { ctrl: mizoramCtrl,     source_table: "observations_aws_mizoram",     flag: 1 },
    { ctrl: iitmMumbaiCtrl,  source_table: "observations_iitm_mumbai",     flag: 1 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

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

const deleteForDay = async (date) => {
    await client.query(`DELETE FROM aws_station_daily_data WHERE collection_date = $1`, [date]);
};

const hasDataForDay = async (date) => {
    const r = await client.query(
        `SELECT 1 FROM aws_station_daily_data WHERE collection_date = $1 LIMIT 1`, [date]
    );
    return r.rowCount > 0;
};

// Calls the existing fetchDailyData controller function directly (same logic as /daily API)
const callDailyCtrl = (ctrl, startDate, endDate) => {
    return new Promise((resolve, reject) => {
        const req = { body: { startDate, endDate } };
        const res = {
            status: () => res,
            json: (payload) => {
                if (payload.success) resolve(payload.data);
                else reject(new Error(payload.message));
            }
        };
        ctrl.fetchDailyData(req, res).catch(reject);
    });
};

// For one source: call /daily, map id → station_code via aws_mapping_id, insert into aws_station_daily_data
const insertFromSource = async (ctrl, source_table, flag, date) => {
    const [dailyRows, mappingResult] = await Promise.all([
        callDailyCtrl(ctrl, date, date),
        client.query(`
            SELECT m.id, m.station_code, asd.district_code
            FROM aws_mapping_id m
            JOIN aws_station_details asd ON asd.station_code = m.station_code
            WHERE m.source_table = $1
        `, [source_table])
    ]);

    if (!dailyRows || dailyRows.length === 0) return 0;

    const mapping = {};
    for (const row of mappingResult.rows) {
        mapping[String(row.id)] = { station_code: row.station_code, district_code: row.district_code };
    }

    let inserted = 0;
    for (const row of dailyRows) {
        const m = mapping[String(row.id)];
        if (!m) continue;
        await client.query(`
            INSERT INTO aws_station_daily_data (collection_date, data, station_id, district_code, flag)
            VALUES ($1, $2, $3, $4, $5)
        `, [row.dat, row.total_rainfall ?? 0, m.station_code, m.district_code, flag]);
        inserted++;
    }
    return inserted;
};


// Fills every aws_station_details station that has no row for the date with -999.9.
// Covers both: (1) unmapped stations, (2) mapped stations that had no API data.
const fillMissingWithNoData = async (date) => {
    const result = await client.query(`
        INSERT INTO aws_station_daily_data (collection_date, data, station_id, district_code, flag)
        SELECT $1::date, -999.9, asd.station_code, asd.district_code, 1
        FROM aws_station_details asd
        WHERE asd.station_code NOT IN (
            SELECT station_id FROM aws_station_daily_data WHERE collection_date = $1::date
        )
    `, [date]);
    return result.rowCount;
};


// ─────────────────────────────────────────────────────────────────────────────
// 1. OVERRIDE — delete existing, re-insert from /daily for each source
//    POST /api/v1/aws-station/store-override
//    Body: { startDate, endDate }
// ─────────────────────────────────────────────────────────────────────────────
exports.storeOverride = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        if (!startDate) return res.status(400).json({ success: false, message: "startDate is required" });
        if (!endDate) endDate = startDate;

        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST)))
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });

        const dates   = dateRange(startDate, endDate);
        const summary = [];

        for (const date of dates) {
            await deleteForDay(date);
            const dayResult = { date, sources: [] };
            for (const src of SOURCES) {
                const inserted = await insertFromSource(src.ctrl, src.source_table, src.flag, date);
                dayResult.sources.push({ table: src.source_table, inserted });
            }
            const filled = await fillMissingWithNoData(date);
            dayResult.filled_no_data = filled;
            summary.push(dayResult);
        }

        res.status(200).json({ success: true, message: `Override complete for ${dates.length} day(s)`, summary });
    } catch (error) {
        console.error("[AWS STATION] storeOverride error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 2. CONTINUE — skip days that already have data
//    POST /api/v1/aws-station/store-continue
//    Body: { startDate, endDate }
// ─────────────────────────────────────────────────────────────────────────────
exports.storeContinue = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        if (!startDate) return res.status(400).json({ success: false, message: "startDate is required" });
        if (!endDate) endDate = startDate;

        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST)))
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });

        const dates   = dateRange(startDate, endDate);
        const summary = [];

        for (const date of dates) {
            if (await hasDataForDay(date)) { summary.push({ date, skipped: true }); continue; }
            const dayResult = { date, skipped: false, sources: [] };
            for (const src of SOURCES) {
                const inserted = await insertFromSource(src.ctrl, src.source_table, src.flag, date);
                dayResult.sources.push({ table: src.source_table, inserted });
            }
            const filled = await fillMissingWithNoData(date);
            dayResult.filled_no_data = filled;
            summary.push(dayResult);
        }

        res.status(200).json({ success: true, message: `Continue complete for ${dates.length} day(s)`, summary });
    } catch (error) {
        console.error("[AWS STATION] storeContinue error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 3. CRON — always refreshes today
//    POST /api/v1/aws-station/store-cron
// ─────────────────────────────────────────────────────────────────────────────
// Internal function — called directly by CronJobs.js (no req/res needed)
const runDailyStore = async () => {
    const date = getAwsToday();
    await deleteForDay(date);
    const summary = { date, sources: [] };

    for (const src of SOURCES) {
        const inserted = await insertFromSource(src.ctrl, src.source_table, src.flag, date);
        summary.sources.push({ table: src.source_table, inserted });
    }

    summary.filled_no_data = await fillMissingWithNoData(date);
    console.log(`[AWS STATION] ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Date: ${date} | Sources: ${JSON.stringify(summary.sources)} | Filled: ${summary.filled_no_data}`);
    return summary;
};
exports.runDailyStore = runDailyStore;

exports.storeCron = async (req, res) => {
    try {
        const summary = await runDailyStore();
        res.status(200).json({ success: true, message: `Cron store complete for ${summary.date}`, summary });
    } catch (error) {
        console.error("[AWS STATION] storeCron error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 4. UNIFIED FILE — same shape as IMD's fetchFilteredStationUnifiedFileFtp,
//    but reads from aws_station_details / aws_station_daily_data.
//    POST /api/v1/aws-station/fetchFilteredStationUnifiedFile
//    Body: { startDate, endDate, districtCodes }
// ─────────────────────────────────────────────────────────────────────────────
const fetchFilteredGovtAwsUnifiedFile = async (startDate, endDate, districtCodes) => {
    const query = `
        SELECT
            TO_CHAR(asdd.collection_date, 'YYYY-MM-DD') AS collection_date,
            asdd.data,
            asdd.station_id,
            asdd.district_code,
            ndd.district_name,
            ndd.state_name,
            asd.station_name,
            asd.latitude,
            asd.longitude,
            asd.block_name,
            asd.block_code
        FROM public.aws_station_daily_data as asdd
        JOIN aws_station_details as asd ON asd.station_code = asdd.station_id
        JOIN normal_district_details ndd on ndd.district_code = asd.district_code
        WHERE asdd.district_code = ANY($1)
        AND asdd.collection_date BETWEEN $2 AND $3
        AND asd.flag != 0;
    `;

    const result = await client.query(query, [districtCodes, startDate, endDate]);

    // Flag dates covered by an aws_station/aws_district/aws_block exclusion
    // window with the -999.9 "no data" sentinel instead of the real value
    const windows = await getExclusionWindows(startDate, endDate, 'aws_');
    applyExclusions(result.rows, windows);

    return result.rows;
};

exports.fetchFilteredStationUnifiedFile = async (req, res) => {
    try {
        let { startDate, endDate, districtCodes } = req.body;

        const currentDate = moment().format('YYYY-MM-DD');
        if (!startDate) startDate = currentDate;
        if (!endDate) endDate = currentDate;

        if (!Array.isArray(districtCodes)) {
            return res.status(400).json({
                success: false,
                message: "Invalid district codes format. Expecting an array of numbers.",
            });
        }

        const data = await fetchFilteredGovtAwsUnifiedFile(startDate, endDate, districtCodes);

        res.status(200).json({
            success: true,
            message: "Govt AWS station data fetched successfully",
            data: data,
        });
    } catch (error) {
        console.error("[AWS STATION] fetchFilteredStationUnifiedFile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Govt AWS station data",
            error: error.message,
        });
    }
};
