// controllers/scripts/station/monsoon_activity.js
const client = require("../../../connection");
const moment = require("moment");

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const EXCLUDED_SUBDIVS          = [1, 36];              // A&N, Lakshadweep
const WEST_COAST_SUBDIVS        = [12, 13, 14, 19, 20, 21, 22];
const NE_VIGOROUS_HIGH_THRESHOLD = [31, 32];            // Coastal TN + S.Coastal AP

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SPATIAL HELPER
// ─────────────────────────────────────────────────────────────────────────────
const getSpatial = (pct) => {
    if (pct <= 0)  return "Dry";
    if (pct <= 25) return "Isolated";
    if (pct <= 50) return "Scattered";
    if (pct <= 75) return "Fairly Widespread";
    return "Widespread";
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ACTIVITY CLASSIFIER
// Accepts a row's computed values + context flags, returns { activity, reason }
// ─────────────────────────────────────────────────────────────────────────────
const classifyActivity = ({ R, spatial, prev, isSW, isWestCoast, isNEHigh, r, targetDate }) => {
    let activity = "Normal";
    let reason   = "Does not meet criteria for Weak, Active, Vigorous, or Subdued → default Normal.";

    // SUBDUED
    if (
        prev.R !== undefined && prev.R < 1.0 &&
        ["Dry", "Isolated", "Scattered"].includes(prev.spatial) &&
        R < 1.0 &&
        ["Dry", "Isolated", "Scattered"].includes(spatial)
    ) {
        return {
            activity: "Subdued",
            reason: "Continued weak rainfall (R < 1.0) with low spatial coverage on both today and previous day → indicates fading monsoon.",
            extra: { subdued_confirmed_on: targetDate }
        };
    }

    // WEAK
    if (R < 0.5) {
        return {
            activity: "Weak",
            reason: "Very low intensity: Actual rainfall less than half the normal (R < 0.5).",
            extra: {}
        };
    }

    // VIGOROUS
    if (R > 4.0) {
        let heavyCount, thresholdCm;
        if (isSW) {
            heavyCount  = isWestCoast ? Number(r.heavy_8cm) : Number(r.heavy_5cm);
            thresholdCm = isWestCoast ? 8 : 5;
        } else {
            heavyCount  = isNEHigh ? Number(r.heavy_5cm) : Number(r.heavy_3cm);
            thresholdCm = isNEHigh ? 5 : 3;
        }

        if (heavyCount >= 2 && ["Fairly Widespread", "Widespread"].includes(spatial)) {
            return {
                activity: "Vigorous",
                reason: `Extremely high intensity (R > 4.0), ≥2 stations with ≥${thresholdCm} cm rain, and good spatial spread.`,
                extra: { heavy_stations: heavyCount, threshold_cm: thresholdCm }
            };
        }
        return {
            activity: "Normal",
            reason: "R > 4.0 but insufficient heavy rain stations or spatial coverage for Vigorous.",
            extra: {}
        };
    }

    // ACTIVE
    if (R >= 1.5 && R <= 4.0) {
        if (!isSW) {
            return {
                activity: "Active",
                reason: "Good intensity during NE monsoon (1.5 ≤ R ≤ 4.0).",
                extra: {}
            };
        }

        const heavyCount  = isWestCoast ? Number(r.heavy_5cm) : Number(r.heavy_3cm);
        const thresholdCm = isWestCoast ? 5 : 3;

        if (heavyCount >= 2 && ["Fairly Widespread", "Widespread"].includes(spatial)) {
            return {
                activity: "Active",
                reason: `Strong intensity (1.5 ≤ R ≤ 4.0), ≥2 stations with ≥${thresholdCm} cm rain, and good spatial spread during SW monsoon.`,
                extra: { heavy_stations: heavyCount, threshold_cm: thresholdCm }
            };
        }
        return {
            activity: "Normal",
            reason: "1.5 ≤ R ≤ 4.0 but insufficient heavy rain or spread for Active during SW monsoon.",
            extra: {}
        };
    }

    return { activity, reason, extra: {} };
};


// ═════════════════════════════════════════════════════════════════════════════
//  SUBDIVISION-LEVEL MONSOON ACTIVITY
// ═════════════════════════════════════════════════════════════════════════════

// MAIN API — Subdivision
exports.getMonsoonActivity = async (req, res) => {
    try {
        let { date } = req.body;
        const targetDate = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        const prevDate   = moment(targetDate).subtract(1, "day").format("YYYY-MM-DD");

        const report = await computeMonsoonActivity(targetDate, prevDate);

        const sortedReport = Object.keys(report)
            .sort((a, b) => report[a].name.localeCompare(report[b].name))
            .reduce((obj, key) => { obj[key] = report[key]; return obj; }, {});

        res.status(200).json({
            success: true,
            message: "Monsoon activity computed successfully",
            date: targetDate,
            data: sortedReport
        });

    } catch (error) {
        console.error("Error in getMonsoonActivity:", error);
        res.status(500).json({ success: false, message: "Failed to compute monsoon activity", error: error.message });
    }
};

// CORE — Subdivision
const computeMonsoonActivity = async (targetDate, prevDate) => {
    const prevStats = await getPrevDayStats(prevDate);

    const query = `
        WITH stats AS (
            SELECT 
                ndd.subdiv_code,
                MIN(ndd.subdiv_name) AS subdiv_name,
                MIN(ns.rainfall_value) AS normal_raw,
                COUNT(sdd.id) FILTER (WHERE sdd.data IS NOT NULL AND sdd.data >= 0) AS reporting_stations,
                COUNT(*) AS total_stations,
                SUM(COALESCE(NULLIF(sdd.data, -999.9), 0)) AS total_actual_mm,
                100.0 * COUNT(*) FILTER (WHERE COALESCE(NULLIF(sdd.data, -999.9), 0) > 0.1) / NULLIF(COUNT(*), 0) AS pct_reporting
            FROM normal_district_details ndd
            JOIN normal_sub_division ns 
                ON ndd.subdiv_code = ns.sub_division_id AND ns.date = $1
            LEFT JOIN station_daily_data sdd 
                ON sdd.district_code = ndd.district_code AND sdd.collection_date = $1
            GROUP BY ndd.subdiv_code
        ),
        heavy AS (
            SELECT 
                ndd.subdiv_code,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data, -999.9) >= 80) AS c80,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data, -999.9) >= 50) AS c50,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data, -999.9) >= 30) AS c30
            FROM normal_district_details ndd
            JOIN station_daily_data sdd 
                ON sdd.district_code = ndd.district_code AND sdd.collection_date = $1
            GROUP BY ndd.subdiv_code
        )
        SELECT 
            s.subdiv_code,
            s.subdiv_name,
            COALESCE(s.normal_raw, 0)::numeric AS normal,
            COALESCE(s.total_actual_mm, 0)::numeric AS total_actual_mm,
            s.reporting_stations,
            s.pct_reporting,
            COALESCE(h.c80, 0) AS heavy_8cm,
            COALESCE(h.c50, 0) AS heavy_5cm,
            COALESCE(h.c30, 0) AS heavy_3cm
        FROM stats s
        LEFT JOIN heavy h ON s.subdiv_code = h.subdiv_code
        WHERE s.normal_raw > 0 AND s.total_stations > 0
        ORDER BY s.subdiv_code;
    `;

    const result = await client.query(query, [targetDate]);
    const report = {};

    for (const r of result.rows) {
        const code = Number(r.subdiv_code);
        if (EXCLUDED_SUBDIVS.includes(code)) continue;

        const normal      = Number(r.normal) || 0;
        const totalActual = Number(r.total_actual_mm) || 0;
        const reporting   = Number(r.reporting_stations) || 1;
        const avgActual   = reporting > 0 ? totalActual / reporting : 0;
        const R           = normal > 0 ? avgActual / normal : 0;
        const pct         = Number(r.pct_reporting) || 0;
        const spatial     = getSpatial(pct);
        const prev        = prevStats.find(p => p.subdiv_code === code) || {};
        const isSW        = moment(targetDate).isBetween("2025-06-01", "2025-09-30", undefined, "[]");

        const { activity, reason, extra } = classifyActivity({
            R, spatial, prev, isSW,
            isWestCoast: WEST_COAST_SUBDIVS.includes(code),
            isNEHigh:    NE_VIGOROUS_HIGH_THRESHOLD.includes(code),
            r, targetDate
        });

        report[code] = {
            name: r.subdiv_name,
            activity,
            reason,
            R:            Number(R.toFixed(3)),
            avg_actual:   Number(avgActual.toFixed(2)),
            normal:       Number(normal.toFixed(2)),
            spatial,
            pct_reporting: Number(pct.toFixed(1)),
            ...extra
        };
    }

    return report;
};

// PREV DAY STATS — Subdivision
const getPrevDayStats = async (date) => {
    const q = `
        WITH x AS (
            SELECT 
                ndd.subdiv_code,
                MIN(ns.rainfall_value)::numeric AS normal,
                COUNT(sdd.id) FILTER (WHERE sdd.data IS NOT NULL AND sdd.data >= 0) AS rep,
                SUM(COALESCE(NULLIF(sdd.data, -999.9), 0)) AS tot,
                100.0 * COUNT(*) FILTER (WHERE COALESCE(NULLIF(sdd.data, -999.9), 0) > 0.1) / NULLIF(COUNT(*), 0) AS pct
            FROM normal_district_details ndd
            JOIN normal_sub_division ns ON ndd.subdiv_code = ns.sub_division_id AND ns.date = $1
            LEFT JOIN station_daily_data sdd ON sdd.district_code = ndd.district_code AND sdd.collection_date = $1
            GROUP BY ndd.subdiv_code
        )
        SELECT 
            subdiv_code,
            COALESCE((tot / NULLIF(rep, 0)) / NULLIF(normal, 0), 0) AS R,
            CASE 
                WHEN pct = 0    THEN 'Dry'
                WHEN pct <= 25  THEN 'Isolated'
                WHEN pct <= 50  THEN 'Scattered'
                WHEN pct <= 75  THEN 'Fairly Widespread'
                ELSE 'Widespread'
            END AS spatial
        FROM x
        WHERE normal > 0;
    `;

    try {
        const res = await client.query(q, [date]);
        return res.rows.map(r => ({
            subdiv_code: Number(r.subdiv_code),
            R:           Number(r.r),
            spatial:     r.spatial || "Dry"
        }));
    } catch (err) {
        console.warn("Previous day fetch failed (Subdued disabled):", err.message);
        return [];
    }
};


// ═════════════════════════════════════════════════════════════════════════════
//  DISTRICT-LEVEL MONSOON ACTIVITY
// ═════════════════════════════════════════════════════════════════════════════

// MAIN API — District
exports.getMonsoonActivityDistrict = async (req, res) => {
    try {
        let { date } = req.body;
        const targetDate = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        const prevDate   = moment(targetDate).subtract(1, "day").format("YYYY-MM-DD");

        const report = await computeMonsoonActivityDistrict(targetDate, prevDate);

        const sortedReport = Object.keys(report)
            .sort((a, b) => report[a].name.localeCompare(report[b].name))
            .reduce((obj, key) => { obj[key] = report[key]; return obj; }, {});

        res.status(200).json({
            success: true,
            message: "District monsoon activity computed successfully",
            date: targetDate,
            data: sortedReport
        });

    } catch (error) {
        console.error("Error in getMonsoonActivityDistrict:", error);
        res.status(500).json({ success: false, message: "Failed to compute district monsoon activity", error: error.message });
    }
};

// CORE — District
const computeMonsoonActivityDistrict = async (targetDate, prevDate) => {
    const prevStats = await getPrevDayStatsDistrict(prevDate);

    const query = `
        WITH stats AS (
            SELECT
                ndd.district_code,
                MIN(ndd.district_name)  AS district_name,
                MIN(ndd.subdiv_code)    AS subdiv_code,
                MIN(nd.rainfall_value)  AS normal_raw,
                COUNT(sdd.id) FILTER (WHERE sdd.data IS NOT NULL AND sdd.data::numeric >= 0) AS reporting_stations,
                COUNT(*)                AS total_stations,
                SUM(COALESCE(NULLIF(sdd.data::numeric, -999.9), 0))  AS total_actual_mm,
                100.0 * COUNT(*) FILTER (
                    WHERE COALESCE(NULLIF(sdd.data::numeric, -999.9), 0) > 0.1
                ) / NULLIF(COUNT(*), 0) AS pct_reporting
            FROM normal_district_details ndd
            JOIN normal_district nd
                ON nd.normal_district_details_id = ndd.id
                AND nd.date = $1
            LEFT JOIN station_daily_data sdd
                ON sdd.district_code   = ndd.district_code
                AND sdd.collection_date = $1
            GROUP BY ndd.district_code
        ),
        heavy AS (
            SELECT
                ndd.district_code,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data::numeric, -999.9) >= 80) AS c80,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data::numeric, -999.9) >= 50) AS c50,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data::numeric, -999.9) >= 30) AS c30
            FROM normal_district_details ndd
            JOIN station_daily_data sdd
                ON sdd.district_code   = ndd.district_code
                AND sdd.collection_date = $1
            GROUP BY ndd.district_code
        )
        SELECT
            s.district_code,
            s.district_name,
            s.subdiv_code,
            COALESCE(s.normal_raw, 0)::numeric      AS normal,
            COALESCE(s.total_actual_mm, 0)::numeric AS total_actual_mm,
            s.reporting_stations,
            s.pct_reporting,
            COALESCE(h.c80, 0) AS heavy_8cm,
            COALESCE(h.c50, 0) AS heavy_5cm,
            COALESCE(h.c30, 0) AS heavy_3cm
        FROM stats s
        LEFT JOIN heavy h ON s.district_code = h.district_code
        WHERE s.normal_raw > 0 AND s.total_stations > 0
        ORDER BY s.district_code;
    `;

    const result = await client.query(query, [targetDate]);
    const report = {};

    for (const r of result.rows) {
        const distCode   = Number(r.district_code);
        const subdivCode = Number(r.subdiv_code);

        // Exclude districts in A&N / Lakshadweep subdivisions
        if (EXCLUDED_SUBDIVS.includes(subdivCode)) continue;

        const normal      = Number(r.normal) || 0;
        const totalActual = Number(r.total_actual_mm) || 0;
        const reporting   = Number(r.reporting_stations) || 1;
        const avgActual   = reporting > 0 ? totalActual / reporting : 0;
        const R           = normal > 0 ? avgActual / normal : 0;
        const pct         = Number(r.pct_reporting) || 0;
        const spatial     = getSpatial(pct);
        const prev        = prevStats.find(p => p.district_code === distCode) || {};
        const isSW        = moment(targetDate).isBetween("2025-06-01", "2025-09-30", undefined, "[]");

        const { activity, reason, extra } = classifyActivity({
            R, spatial, prev, isSW,
            isWestCoast: WEST_COAST_SUBDIVS.includes(subdivCode),
            isNEHigh:    NE_VIGOROUS_HIGH_THRESHOLD.includes(subdivCode),
            r, targetDate
        });

        report[distCode] = {
            name: r.district_name,
            activity,
            reason,
            subdiv_code:   subdivCode,
            R:             Number(R.toFixed(3)),
            avg_actual:    Number(avgActual.toFixed(2)),
            normal:        Number(normal.toFixed(2)),
            spatial,
            pct_reporting: Number(pct.toFixed(1)),
            ...extra
        };
    }

    return report;
};

// PREV DAY STATS — District
const getPrevDayStatsDistrict = async (date) => {
    const q = `
        WITH x AS (
            SELECT
                ndd.district_code,
                MIN(nd.rainfall_value)::numeric AS normal,
                COUNT(sdd.id) FILTER (WHERE sdd.data IS NOT NULL AND sdd.data::numeric >= 0) AS rep,
                SUM(COALESCE(NULLIF(sdd.data::numeric, -999.9), 0)) AS tot,
                100.0 * COUNT(*) FILTER (
                    WHERE COALESCE(NULLIF(sdd.data::numeric, -999.9), 0) > 0.1
                ) / NULLIF(COUNT(*), 0) AS pct
            FROM normal_district_details ndd
            JOIN normal_district nd
                ON nd.normal_district_details_id = ndd.id AND nd.date = $1
            LEFT JOIN station_daily_data sdd
                ON sdd.district_code = ndd.district_code AND sdd.collection_date = $1
            GROUP BY ndd.district_code
        )
        SELECT
            district_code,
            COALESCE((tot / NULLIF(rep, 0)) / NULLIF(normal, 0), 0) AS R,
            CASE
                WHEN pct = 0    THEN 'Dry'
                WHEN pct <= 25  THEN 'Isolated'
                WHEN pct <= 50  THEN 'Scattered'
                WHEN pct <= 75  THEN 'Fairly Widespread'
                ELSE 'Widespread'
            END AS spatial
        FROM x
        WHERE normal > 0;
    `;

    try {
        const res = await client.query(q, [date]);
        return res.rows.map(r => ({
            district_code: Number(r.district_code),
            R:             Number(r.r),
            spatial:       r.spatial || "Dry"
        }));
    } catch (err) {
        console.warn("District prev-day fetch failed (Subdued disabled):", err.message);
        return [];
    }
};



// ═════════════════════════════════════════════════════════════════════════════
//  HISTORICAL ACTIVITY — SUBDIVISION (7-day & 30-day)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Shared internal function: computes daily activity + stats for each
 * subdivision across a given date range.
 * Returns: { [subdiv_code]: { name, days: [ { date, activity, R, avg_actual, normal, spatial, label } ] } }
 */
const computeHistoricalActivitySubdiv = async (dates) => {
    // Build parameterized placeholders: $1, $2, ...
    const placeholders = dates.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
        WITH stats AS (
            SELECT
                nd_date.d                        AS date,
                ndd.subdiv_code,
                MIN(ndd.subdiv_name)             AS subdiv_name,
                MIN(ns.rainfall_value)           AS normal_raw,
                COUNT(sdd.id) FILTER (WHERE sdd.data IS NOT NULL AND sdd.data::numeric >= 0) AS reporting_stations,
                COUNT(*)                         AS total_stations,
                SUM(COALESCE(NULLIF(sdd.data::numeric, -999.9), 0))  AS total_actual_mm,
                100.0 * COUNT(*) FILTER (
                    WHERE COALESCE(NULLIF(sdd.data::numeric, -999.9), 0) > 0.1
                ) / NULLIF(COUNT(*), 0)          AS pct_reporting
            FROM (SELECT UNNEST(ARRAY[${placeholders}]::date[]) AS d) nd_date
            JOIN normal_district_details ndd ON TRUE
            JOIN normal_sub_division ns
                ON ndd.subdiv_code = ns.sub_division_id AND ns.date = nd_date.d
            LEFT JOIN station_daily_data sdd
                ON sdd.district_code    = ndd.district_code
                AND sdd.collection_date = nd_date.d
            GROUP BY nd_date.d, ndd.subdiv_code
        ),
        heavy AS (
            SELECT
                sdd.collection_date              AS date,
                ndd.subdiv_code,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data::numeric, -999.9) >= 80) AS c80,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data::numeric, -999.9) >= 50) AS c50,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data::numeric, -999.9) >= 30) AS c30
            FROM normal_district_details ndd
            JOIN station_daily_data sdd
                ON sdd.district_code    = ndd.district_code
                AND sdd.collection_date = ANY(ARRAY[${placeholders}]::date[])
            GROUP BY sdd.collection_date, ndd.subdiv_code
        )
        SELECT
            s.date,
            s.subdiv_code,
            s.subdiv_name,
            COALESCE(s.normal_raw, 0)::numeric      AS normal,
            COALESCE(s.total_actual_mm, 0)::numeric AS total_actual_mm,
            s.reporting_stations,
            s.pct_reporting,
            COALESCE(h.c80, 0) AS heavy_8cm,
            COALESCE(h.c50, 0) AS heavy_5cm,
            COALESCE(h.c30, 0) AS heavy_3cm
        FROM stats s
        LEFT JOIN heavy h
            ON s.subdiv_code = h.subdiv_code AND s.date = h.date
        WHERE s.normal_raw > 0 AND s.total_stations > 0
        ORDER BY s.subdiv_code, s.date;
    `;

    const params = dates;
    const result = await client.query(query, params);

    // Build prev-day lookup (index by subdiv_code + date for Subdued check)
    const prevMap = {};
    for (const r of result.rows) {
        const code    = Number(r.subdiv_code);
        const dateKey = moment(r.date).format("YYYY-MM-DD");
        const normal  = Number(r.normal) || 0;
        const totalActual = Number(r.total_actual_mm) || 0;
        const reporting   = Number(r.reporting_stations) || 1;
        const avgActual   = reporting > 0 ? totalActual / reporting : 0;
        const R           = normal > 0 ? avgActual / normal : 0;
        const pct         = Number(r.pct_reporting) || 0;

        if (!prevMap[code]) prevMap[code] = {};
        prevMap[code][dateKey] = { R, spatial: getSpatial(pct) };
    }

    const report = {};

    for (const r of result.rows) {
        const code    = Number(r.subdiv_code);
        if (EXCLUDED_SUBDIVS.includes(code)) continue;

        const dateKey = moment(r.date).format("YYYY-MM-DD");
        const prevKey = moment(r.date).subtract(1, "day").format("YYYY-MM-DD");

        const normal      = Number(r.normal) || 0;
        const totalActual = Number(r.total_actual_mm) || 0;
        const reporting   = Number(r.reporting_stations) || 1;
        const avgActual   = reporting > 0 ? totalActual / reporting : 0;
        const R           = normal > 0 ? avgActual / normal : 0;
        const pct         = Number(r.pct_reporting) || 0;
        const spatial     = getSpatial(pct);
        const isSW        = moment(dateKey).isBetween("2025-06-01", "2025-09-30", undefined, "[]");

        const prev = (prevMap[code] && prevMap[code][prevKey]) ? prevMap[code][prevKey] : {};

        const { activity, reason, extra } = classifyActivity({
            R, spatial, prev, isSW,
            isWestCoast: WEST_COAST_SUBDIVS.includes(code),
            isNEHigh:    NE_VIGOROUS_HIGH_THRESHOLD.includes(code),
            r, targetDate: dateKey
        });

        if (!report[code]) {
            report[code] = { name: r.subdiv_name, days: [] };
        }

        report[code].days.push({
            date:         dateKey,
            activity,
            reason,
            R:            Number(R.toFixed(3)),
            avg_actual:   Number(avgActual.toFixed(2)),
            normal:       Number(normal.toFixed(2)),
            spatial,
            pct_reporting: Number(pct.toFixed(1)),
            label:        getActivityLabel(activity),
            ...extra
        });
    }

    return report;
};

// API — Subdivision 7-day history
exports.getMonsoonActivitySubdivLast7 = async (req, res) => {
    try {
        let { date } = req.body;
        const endDate = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        const dates   = getLast7Dates(endDate);

        const report = await computeHistoricalActivitySubdiv(dates);

        res.status(200).json({
            success: true,
            message: "Subdivision monsoon activity for last 7 days computed successfully",
            from:  dates[0],
            to:    dates[dates.length - 1],
            data:  report
        });
    } catch (error) {
        console.error("Error in getMonsoonActivitySubdivLast7:", error);
        res.status(500).json({ success: false, message: "Failed to compute 7-day subdivision monsoon activity", error: error.message });
    }
};

// API — Subdivision 30-day history
exports.getMonsoonActivitySubdivLast30 = async (req, res) => {
    try {
        let { date } = req.body;
        const endDate = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        const dates   = getLast30Dates(endDate);

        const report = await computeHistoricalActivitySubdiv(dates);

        res.status(200).json({
            success: true,
            message: "Subdivision monsoon activity for last 30 days computed successfully",
            from:  dates[0],
            to:    dates[dates.length - 1],
            data:  report
        });
    } catch (error) {
        console.error("Error in getMonsoonActivitySubdivLast30:", error);
        res.status(500).json({ success: false, message: "Failed to compute 30-day subdivision monsoon activity", error: error.message });
    }
};


// ═════════════════════════════════════════════════════════════════════════════
//  HISTORICAL ACTIVITY — DISTRICT (7-day & 30-day)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Shared internal function: computes daily activity + stats for each
 * district across a given date range.
 */
const computeHistoricalActivityDistrict = async (dates) => {
    const placeholders = dates.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
        WITH stats AS (
            SELECT
                nd_date.d                        AS date,
                ndd.district_code,
                MIN(ndd.district_name)           AS district_name,
                MIN(ndd.subdiv_code)             AS subdiv_code,
                MIN(nd.rainfall_value)           AS normal_raw,
                COUNT(sdd.id) FILTER (WHERE sdd.data IS NOT NULL AND sdd.data::numeric >= 0) AS reporting_stations,
                COUNT(*)                         AS total_stations,
                SUM(COALESCE(NULLIF(sdd.data::numeric, -999.9), 0))  AS total_actual_mm,
                100.0 * COUNT(*) FILTER (
                    WHERE COALESCE(NULLIF(sdd.data::numeric, -999.9), 0) > 0.1
                ) / NULLIF(COUNT(*), 0)          AS pct_reporting
            FROM (SELECT UNNEST(ARRAY[${placeholders}]::date[]) AS d) nd_date
            JOIN normal_district_details ndd ON TRUE
            JOIN normal_district nd
                ON nd.normal_district_details_id = ndd.id
                AND nd.date = nd_date.d
            LEFT JOIN station_daily_data sdd
                ON sdd.district_code    = ndd.district_code
                AND sdd.collection_date = nd_date.d
            GROUP BY nd_date.d, ndd.district_code
        ),
        heavy AS (
            SELECT
                sdd.collection_date              AS date,
                ndd.district_code,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data::numeric, -999.9) >= 80) AS c80,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data::numeric, -999.9) >= 50) AS c50,
                COUNT(*) FILTER (WHERE NULLIF(sdd.data::numeric, -999.9) >= 30) AS c30
            FROM normal_district_details ndd
            JOIN station_daily_data sdd
                ON sdd.district_code    = ndd.district_code
                AND sdd.collection_date = ANY(ARRAY[${placeholders}]::date[])
            GROUP BY sdd.collection_date, ndd.district_code
        )
        SELECT
            s.date,
            s.district_code,
            s.district_name,
            s.subdiv_code,
            COALESCE(s.normal_raw, 0)::numeric      AS normal,
            COALESCE(s.total_actual_mm, 0)::numeric AS total_actual_mm,
            s.reporting_stations,
            s.pct_reporting,
            COALESCE(h.c80, 0) AS heavy_8cm,
            COALESCE(h.c50, 0) AS heavy_5cm,
            COALESCE(h.c30, 0) AS heavy_3cm
        FROM stats s
        LEFT JOIN heavy h
            ON s.district_code = h.district_code AND s.date = h.date
        WHERE s.normal_raw > 0 AND s.total_stations > 0
        ORDER BY s.district_code, s.date;
    `;

    const params = dates;
    const result = await client.query(query, params);

    // Build prev-day lookup indexed by district_code + date
    const prevMap = {};
    for (const r of result.rows) {
        const code    = Number(r.district_code);
        const dateKey = moment(r.date).format("YYYY-MM-DD");
        const normal  = Number(r.normal) || 0;
        const totalActual = Number(r.total_actual_mm) || 0;
        const reporting   = Number(r.reporting_stations) || 1;
        const avgActual   = reporting > 0 ? totalActual / reporting : 0;
        const R           = normal > 0 ? avgActual / normal : 0;
        const pct         = Number(r.pct_reporting) || 0;

        if (!prevMap[code]) prevMap[code] = {};
        prevMap[code][dateKey] = { R, spatial: getSpatial(pct) };
    }

    const report = {};

    for (const r of result.rows) {
        const distCode   = Number(r.district_code);
        const subdivCode = Number(r.subdiv_code);
        if (EXCLUDED_SUBDIVS.includes(subdivCode)) continue;

        const dateKey = moment(r.date).format("YYYY-MM-DD");
        const prevKey = moment(r.date).subtract(1, "day").format("YYYY-MM-DD");

        const normal      = Number(r.normal) || 0;
        const totalActual = Number(r.total_actual_mm) || 0;
        const reporting   = Number(r.reporting_stations) || 1;
        const avgActual   = reporting > 0 ? totalActual / reporting : 0;
        const R           = normal > 0 ? avgActual / normal : 0;
        const pct         = Number(r.pct_reporting) || 0;
        const spatial     = getSpatial(pct);
        const isSW        = moment(dateKey).isBetween("2025-06-01", "2025-09-30", undefined, "[]");

        const prev = (prevMap[distCode] && prevMap[distCode][prevKey]) ? prevMap[distCode][prevKey] : {};

        const { activity, reason, extra } = classifyActivity({
            R, spatial, prev, isSW,
            isWestCoast: WEST_COAST_SUBDIVS.includes(subdivCode),
            isNEHigh:    NE_VIGOROUS_HIGH_THRESHOLD.includes(subdivCode),
            r, targetDate: dateKey
        });

        if (!report[distCode]) {
            report[distCode] = { name: r.district_name, subdiv_code: subdivCode, days: [] };
        }

        report[distCode].days.push({
            date:          dateKey,
            activity,
            reason,
            R:             Number(R.toFixed(3)),
            avg_actual:    Number(avgActual.toFixed(2)),
            normal:        Number(normal.toFixed(2)),
            spatial,
            pct_reporting: Number(pct.toFixed(1)),
            label:         getActivityLabel(activity),
            ...extra
        });
    }

    return report;
};

// API — District 7-day history
exports.getMonsoonActivityDistrictLast7 = async (req, res) => {
    try {
        let { date } = req.body;
        const endDate = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        const dates   = getLast7Dates(endDate);

        const report = await computeHistoricalActivityDistrict(dates);

        res.status(200).json({
            success: true,
            message: "District monsoon activity for last 7 days computed successfully",
            from:  dates[0],
            to:    dates[dates.length - 1],
            data:  report
        });
    } catch (error) {
        console.error("Error in getMonsoonActivityDistrictLast7:", error);
        res.status(500).json({ success: false, message: "Failed to compute 7-day district monsoon activity", error: error.message });
    }
};

// API — District 30-day history
exports.getMonsoonActivityDistrictLast30 = async (req, res) => {
    try {
        let { date } = req.body;
        const endDate = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        const dates   = getLast30Dates(endDate);

        const report = await computeHistoricalActivityDistrict(dates);

        res.status(200).json({
            success: true,
            message: "District monsoon activity for last 30 days computed successfully",
            from:  dates[0],
            to:    dates[dates.length - 1],
            data:  report
        });
    } catch (error) {
        console.error("Error in getMonsoonActivityDistrictLast30:", error);
        res.status(500).json({ success: false, message: "Failed to compute 30-day district monsoon activity", error: error.message });
    }
};


// ═════════════════════════════════════════════════════════════════════════════
//  SHARED DATE & LABEL HELPERS  (add at bottom of file)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Returns array of N past dates ending on endDate (inclusive), oldest first.
 * e.g. getLast7Dates("2026-04-24") → ["2026-04-18", ..., "2026-04-24"]
 */
const getLastNDates = (endDate, n) =>
    Array.from({ length: n }, (_, i) =>
        moment(endDate).subtract(n - 1 - i, "days").format("YYYY-MM-DD")
    );

const getLast7Dates  = (endDate) => getLastNDates(endDate, 7);
const getLast30Dates = (endDate) => getLastNDates(endDate, 30);

/**
 * Human-readable label for UI badges / chart tooltips.
 */
const getActivityLabel = (activity) => {
    const map = {
        Vigorous: "🔴 Vigorous",
        Active:   "🟠 Active",
        Normal:   "🟢 Normal",
        Weak:     "🟡 Weak",
        Subdued:  "⚪ Subdued"
    };
    return map[activity] || "🟢 Normal";
};