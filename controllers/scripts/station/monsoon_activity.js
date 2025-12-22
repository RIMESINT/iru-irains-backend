// // controllers/scripts/station/monsoon_activity.js
// const client = require("../../../connection");
// const moment = require("moment");

// // CONFIG
// const EXCLUDED_SUBDIVS = [1, 36]; // A&N, Lakshadweep
// const WEST_COAST_SUBDIVS = [12, 13, 14, 19, 20, 21, 22];
// const NE_VIGOROUS_HIGH_THRESHOLD = [31, 32]; // Coastal TN + S.Coastal AP

// // MAIN API
// exports.getMonsoonActivity = async (req, res) => {
//     try {
//         let { date } = req.body;
//         const targetDate = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
//         const prevDate = moment(targetDate).subtract(1, "day").format("YYYY-MM-DD");

//         const report = await computeMonsoonActivity(targetDate, prevDate);

//         res.status(200).json({
//             success: true,
//             message: "Monsoon activity computed successfully",
//             date: targetDate,
//             data: report
//         });

//     } catch (error) {
//         console.error("Error in getMonsoonActivity:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to compute monsoon activity",
//             error: error.message
//         });
//     }
// };

// // CORE FUNCTION
// const computeMonsoonActivity = async (targetDate, prevDate) => {
//     const prevStats = await getPrevDayStats(prevDate);

//     const query = `
//         WITH stats AS (
//             SELECT 
//                 ndd.subdiv_code,
//                 MIN(ndd.subdiv_name) AS subdiv_name,
//                 MIN(ns.rainfall_value) AS normal_raw,
//                 COUNT(sdd.id) FILTER (WHERE sdd.data IS NOT NULL AND sdd.data >= 0) AS reporting_stations,
//                 COUNT(*) AS total_stations,
//                 SUM(COALESCE(NULLIF(sdd.data, -999.9), 0)) AS total_actual_mm,
//                 100.0 * COUNT(*) FILTER (WHERE COALESCE(NULLIF(sdd.data, -999.9), 0) > 0.1) / NULLIF(COUNT(*), 0) AS pct_reporting
//             FROM normal_district_details ndd
//             JOIN normal_sub_division ns 
//                 ON ndd.subdiv_code = ns.sub_division_id AND ns.date = $1
//             LEFT JOIN station_daily_data sdd 
//                 ON sdd.district_code = ndd.district_code AND sdd.collection_date = $1
//             GROUP BY ndd.subdiv_code
//         ),
//         heavy AS (
//             SELECT 
//                 ndd.subdiv_code,
//                 COUNT(*) FILTER (WHERE NULLIF(sdd.data, -999.9) >= 80) AS c80,
//                 COUNT(*) FILTER (WHERE NULLIF(sdd.data, -999.9) >= 50) AS c50,
//                 COUNT(*) FILTER (WHERE NULLIF(sdd.data, -999.9) >= 30) AS c30
//             FROM normal_district_details ndd
//             JOIN station_daily_data sdd 
//                 ON sdd.district_code = ndd.district_code AND sdd.collection_date = $1
//             GROUP BY ndd.subdiv_code
//         )
//         SELECT 
//             s.subdiv_code,
//             s.subdiv_name,
//             COALESCE(s.normal_raw, 0)::numeric AS normal,
//             COALESCE(s.total_actual_mm, 0)::numeric AS total_actual_mm,
//             s.reporting_stations,
//             s.pct_reporting,
//             COALESCE(h.c80, 0) AS heavy_8cm,
//             COALESCE(h.c50, 0) AS heavy_5cm,
//             COALESCE(h.c30, 0) AS heavy_3cm
//         FROM stats s
//         LEFT JOIN heavy h ON s.subdiv_code = h.subdiv_code
//         WHERE s.normal_raw > 0 AND s.total_stations > 0
//         ORDER BY s.subdiv_code;
//     `;

//     const result = await client.query(query, [targetDate]);
//     const rows = result.rows;

//     const report = {};

//     for (const r of rows) {
//         const code = Number(r.subdiv_code);
//         if (EXCLUDED_SUBDIVS.includes(code)) continue;

//         // SAFE NUMBER CONVERSION
//         const normal = Number(r.normal) || 0;
//         const totalActual = Number(r.total_actual_mm) || 0;
//         const reporting = Number(r.reporting_stations) || 1;

//         const avgActual = reporting > 0 ? totalActual / reporting : 0;
//         const R = normal > 0 ? avgActual / normal : 0;
//         const pct = Number(r.pct_reporting) || 0;
//         const spatial = getSpatial(pct);

//         const prev = prevStats.find(p => p.subdiv_code === code) || {};
//         const isSW = moment(targetDate).isBetween("2025-06-01", "2025-09-30", undefined, "[]");

//         let activity = "Normal";
//         const details = {
//             R: Number(R.toFixed(3)),
//             avg_actual: Number(avgActual.toFixed(2)),
//             normal: Number(normal.toFixed(2)),
//             spatial,
//             pct_reporting: Number(pct.toFixed(1))
//         };

//         // SUBDUED
//         if (
//             prev.R !== undefined && prev.R < 1.0 &&
//             ["Dry", "Isolated", "Scattered"].includes(prev.spatial) &&
//             R < 1.0 &&
//             ["Dry", "Isolated", "Scattered"].includes(spatial)
//         ) {
//             activity = "Subdued";
//             details.subdued_confirmed_on = targetDate;
//         }
//         // WEAK
//         else if (R < 0.5) {
//             activity = "Weak";
//         }
//         // VIGOROUS
//         else if (R > 4.0) {
//             const isWestCoast = WEST_COAST_SUBDIVS.includes(code);
//             const isNEHigh = NE_VIGOROUS_HIGH_THRESHOLD.includes(code);

//             let heavyCount, thresholdCm;
//             if (isSW) {
//                 heavyCount = isWestCoast ? Number(r.heavy_8cm) : Number(r.heavy_5cm);
//                 thresholdCm = isWestCoast ? 8 : 5;
//             } else {
//                 heavyCount = isNEHigh ? Number(r.heavy_5cm) : Number(r.heavy_3cm);
//                 thresholdCm = isNEHigh ? 5 : 3;
//             }

//             if (heavyCount >= 2 && ["Fairly Widespread", "Widespread"].includes(spatial)) {
//                 activity = "Vigorous";
//                 details.heavy_stations = heavyCount;
//                 details.threshold_cm = thresholdCm;
//             }
//         }
//         // ACTIVE
//         else if (R >= 1.5 && R <= 4.0) {
//             if (!isSW) {
//                 activity = "Active";
//             } else {
//                 const heavyCount = WEST_COAST_SUBDIVS.includes(code) 
//                     ? Number(r.heavy_5cm) 
//                     : Number(r.heavy_3cm);
//                 if (heavyCount >= 2 && ["Fairly Widespread", "Widespread"].includes(spatial)) {
//                     activity = "Active";
//                     details.heavy_stations = heavyCount;
//                     details.threshold_cm = WEST_COAST_SUBDIVS.includes(code) ? 5 : 3;
//                 }
//             }
//         }

//         report[code] = {
//             name: r.subdiv_name,
//             activity,
//             ...details
//         };
//     }

//     return report;
// };

// // PREVIOUS DAY STATS (for Subdued)
// const getPrevDayStats = async (date) => {
//     const q = `
//         WITH x AS (
//             SELECT 
//                 ndd.subdiv_code,
//                 MIN(ns.rainfall_value)::numeric AS normal,
//                 COUNT(sdd.id) FILTER (WHERE sdd.data IS NOT NULL AND sdd.data >= 0) AS rep,
//                 SUM(COALESCE(NULLIF(sdd.data, -999.9), 0)) AS tot,
//                 100.0 * COUNT(*) FILTER (WHERE COALESCE(NULLIF(sdd.data, -999.9), 0) > 0.1) / NULLIF(COUNT(*), 0) AS pct
//             FROM normal_district_details ndd
//             JOIN normal_sub_division ns ON ndd.subdiv_code = ns.sub_division_id AND ns.date = $1
//             LEFT JOIN station_daily_data sdd ON sdd.district_code = ndd.district_code AND sdd.collection_date = $1
//             GROUP BY ndd.subdiv_code
//         )
//         SELECT 
//             subdiv_code,
//             COALESCE((tot / NULLIF(rep, 0)) / NULLIF(normal, 0), 0) AS R,
//             CASE 
//                 WHEN pct = 0 THEN 'Dry'
//                 WHEN pct <= 25 THEN 'Isolated'
//                 WHEN pct <= 50 THEN 'Scattered'
//                 WHEN pct <= 75 THEN 'Fairly Widespread'
//                 ELSE 'Widespread'
//             END AS spatial
//         FROM x
//         WHERE normal > 0;
//     `;

//     try {
//         const res = await client.query(q, [date]);
//         return res.rows.map(r => ({
//             subdiv_code: Number(r.subdiv_code),
//             R: Number(r.r),
//             spatial: r.spatial || "Dry"
//         }));
//     } catch (err) {
//         console.warn("Previous day fetch failed (Subdued disabled):", err.message);
//         return [];
//     }
// };

// // SPATIAL HELPER
// const getSpatial = (pct) => {
//     if (pct <= 0) return "Dry";
//     if (pct <= 25) return "Isolated";
//     if (pct <= 50) return "Scattered";
//     if (pct <= 75) return "Fairly Widespread";
//     return "Widespread";
// };



// controllers/scripts/station/monsoon_activity.js
const client = require("../../../connection");
const moment = require("moment");

// CONFIG
const EXCLUDED_SUBDIVS = [1, 36]; // A&N, Lakshadweep
const WEST_COAST_SUBDIVS = [12, 13, 14, 19, 20, 21, 22];
const NE_VIGOROUS_HIGH_THRESHOLD = [31, 32]; // Coastal TN + S.Coastal AP

// MAIN API
exports.getMonsoonActivity = async (req, res) => {
    try {
        let { date } = req.body;
        const targetDate = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        const prevDate = moment(targetDate).subtract(1, "day").format("YYYY-MM-DD");

        const report = await computeMonsoonActivity(targetDate, prevDate);

        // Sort report by subdivision name for consistent table display
        const sortedReport = Object.keys(report)
            .sort((a, b) => report[a].name.localeCompare(report[b].name))
            .reduce((obj, key) => {
                obj[key] = report[key];
                return obj;
            }, {});

        res.status(200).json({
            success: true,
            message: "Monsoon activity computed successfully",
            date: targetDate,
            data: sortedReport
        });

    } catch (error) {
        console.error("Error in getMonsoonActivity:", error);
        res.status(500).json({
            success: false,
            message: "Failed to compute monsoon activity",
            error: error.message
        });
    }
};

// CORE FUNCTION
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
    const rows = result.rows;

    const report = {};

    for (const r of rows) {
        const code = Number(r.subdiv_code);
        if (EXCLUDED_SUBDIVS.includes(code)) continue;

        const normal = Number(r.normal) || 0;
        const totalActual = Number(r.total_actual_mm) || 0;
        const reporting = Number(r.reporting_stations) || 1;

        const avgActual = reporting > 0 ? totalActual / reporting : 0;
        const R = normal > 0 ? avgActual / normal : 0;
        const pct = Number(r.pct_reporting) || 0;
        const spatial = getSpatial(pct);

        const prev = prevStats.find(p => p.subdiv_code === code) || {};
        const isSW = moment(targetDate).isBetween("2025-06-01", "2025-09-30", undefined, "[]");

        let activity = "Normal";
        let reason = "";  // New: Explain why this activity was chosen

        const details = {
            R: Number(R.toFixed(3)),
            avg_actual: Number(avgActual.toFixed(2)),
            normal: Number(normal.toFixed(2)),
            spatial,
            pct_reporting: Number(pct.toFixed(1))
        };

        // SUBDUED
        if (
            prev.R !== undefined && prev.R < 1.0 &&
            ["Dry", "Isolated", "Scattered"].includes(prev.spatial) &&
            R < 1.0 &&
            ["Dry", "Isolated", "Scattered"].includes(spatial)
        ) {
            activity = "Subdued";
            reason = "Continued weak rainfall (R < 1.0) with low spatial coverage on both today and previous day → indicates fading monsoon.";
            details.subdued_confirmed_on = targetDate;
        }
        // WEAK
        else if (R < 0.5) {
            activity = "Weak";
            reason = "Very low intensity: Actual rainfall less than half the normal (R < 0.5).";
        }
        // VIGOROUS
        else if (R > 4.0) {
            const isWestCoast = WEST_COAST_SUBDIVS.includes(code);
            const isNEHigh = NE_VIGOROUS_HIGH_THRESHOLD.includes(code);

            let heavyCount, thresholdCm;
            if (isSW) {
                heavyCount = isWestCoast ? Number(r.heavy_8cm) : Number(r.heavy_5cm);
                thresholdCm = isWestCoast ? 8 : 5;
            } else {
                heavyCount = isNEHigh ? Number(r.heavy_5cm) : Number(r.heavy_3cm);
                thresholdCm = isNEHigh ? 5 : 3;
            }

            if (heavyCount >= 2 && ["Fairly Widespread", "Widespread"].includes(spatial)) {
                activity = "Vigorous";
                reason = `Extremely high intensity (R > 4.0), ≥2 stations with ≥${thresholdCm} cm rain, and good spatial spread.`;
                details.heavy_stations = heavyCount;
                details.threshold_cm = thresholdCm;
            } else {
                reason = "R > 4.0 but insufficient heavy rain stations or spatial coverage for Vigorous.";
            }
        }
        // ACTIVE
        else if (R >= 1.5 && R <= 4.0) {
            if (!isSW) {
                activity = "Active";
                reason = "Good intensity during NE monsoon (1.5 ≤ R ≤ 4.0).";
            } else {
                const heavyCount = WEST_COAST_SUBDIVS.includes(code) 
                    ? Number(r.heavy_5cm) 
                    : Number(r.heavy_3cm);
                const thresholdCm = WEST_COAST_SUBDIVS.includes(code) ? 5 : 3;

                if (heavyCount >= 2 && ["Fairly Widespread", "Widespread"].includes(spatial)) {
                    activity = "Active";
                    reason = `Strong intensity (1.5 ≤ R ≤ 4.0), ≥2 stations with ≥${thresholdCm} cm rain, and good spatial spread during SW monsoon.`;
                    details.heavy_stations = heavyCount;
                    details.threshold_cm = thresholdCm;
                } else {
                    reason = "1.5 ≤ R ≤ 4.0 but insufficient heavy rain or spread for Active during SW monsoon.";
                }
            }
        } else {
            reason = "Rainfall intensity and spread do not meet criteria for Weak, Active, Vigorous, or Subdued → default Normal.";
        }

        report[code] = {
            name: r.subdiv_name,
            activity,
            reason,  // Added for clarity
            ...details
        };
    }

    return report;
};

// PREVIOUS DAY STATS (for Subdued)
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
                WHEN pct = 0 THEN 'Dry'
                WHEN pct <= 25 THEN 'Isolated'
                WHEN pct <= 50 THEN 'Scattered'
                WHEN pct <= 75 THEN 'Fairly Widespread'
                ELSE 'Widespread'
            END AS spatial
        FROM x
        WHERE normal > 0;
    `;

    try {
        const res = await client.query(q, [date]);
        return res.rows.map(r => ({
            subdiv_code: Number(r.subdiv_code),
            R: Number(r.r),
            spatial: r.spatial || "Dry"
        }));
    } catch (err) {
        console.warn("Previous day fetch failed (Subdued disabled):", err.message);
        return [];
    }
};

// SPATIAL HELPER
const getSpatial = (pct) => {
    if (pct <= 0) return "Dry";
    if (pct <= 25) return "Isolated";
    if (pct <= 50) return "Scattered";
    if (pct <= 75) return "Fairly Widespread";
    return "Widespread";
};