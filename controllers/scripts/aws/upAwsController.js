const client = require("../../../connection");
const moment = require("moment-timezone");

const IST = "Asia/Kolkata";

// UTC → IST conversion expressions (data stored as UTC, served as IST)
const IST_TS   = `(dat::date + time::time + INTERVAL '5 hours 30 minutes')`;
const IST_DATE = `${IST_TS}::date`;
const IST_TIME = `${IST_TS}::time`;

const resolveDates = (startDate, endDate) => {
    const today = moment().tz(IST).format("YYYY-MM-DD");
    if (!startDate && !endDate) return { startDate: today, endDate: today };
    if (!startDate) return { startDate: endDate, endDate };
    if (!endDate)   return { startDate, endDate: startDate };
    return { startDate, endDate };
};


// ─────────────────────────────────────────────────────────────────────────────
// 1. FULL DAY — sum all 15-min slots per station (IST date)
//    POST /api/up-aws/daily
//    Body: { startDate?, endDate?, district? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchDailyData = async (req, res) => {
    try {
        let { startDate, endDate, district } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));

        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST))) {
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        }

        let params = [startDate, endDate];
        let districtFilter = "";
        if (district) {
            params.push(district);
            districtFilter = `AND district = $${params.length}`;
        }

        const query = `
            WITH ist AS (
                SELECT *,
                    ${IST_DATE} AS ist_dat
                FROM up_aws_observations
                WHERE ${IST_DATE} BETWEEN $1::date AND $2::date
                  ${districtFilter}
            )
            SELECT
                ist_dat                                     AS dat,
                district, id, station, type, lat, lon,
                SUM(rainfall)                               AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)                AS avg_temp,
                MAX(temp)                                   AS max_temp,
                MIN(temp)                                   AS min_temp,
                ROUND(AVG(rh)::NUMERIC, 1)                  AS avg_rh,
                ROUND(AVG(winds)::NUMERIC, 1)               AS avg_wind_speed,
                COUNT(*)                                    AS readings_count,
                ROUND((COUNT(*) / 96.0) * 100, 1)           AS data_completeness_pct
            FROM ist
            GROUP BY ist_dat, district, id, station, type, lat, lon
            ORDER BY ist_dat, district, total_rainfall DESC
        `;

        const result = await client.query(query, params);
        res.status(200).json({
            success: true,
            message: "Daily UP AWS data fetched successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("[UP AWS] fetchDailyData error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch daily data", error: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 2. HOURLY — sum per station per IST hour
//    POST /api/up-aws/hourly
//    Body: { date?, hour?(0-23), district? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchHourlyData = async (req, res) => {
    try {
        let { date, hour, district } = req.body;
        date = date || moment().tz(IST).format("YYYY-MM-DD");

        let params = [date];
        let hourFilter     = "";
        let districtFilter = "";

        if (hour !== undefined && hour !== null) {
            params.push(parseInt(hour));
            hourFilter = `AND EXTRACT(HOUR FROM ist_time) = $${params.length}`;
        }
        if (district) {
            params.push(district);
            districtFilter = `AND district = $${params.length}`;
        }

        const query = `
            WITH ist AS (
                SELECT *,
                    ${IST_DATE} AS ist_dat,
                    ${IST_TIME} AS ist_time
                FROM up_aws_observations
                WHERE ${IST_DATE} = $1::date
                  ${districtFilter}
            )
            SELECT
                ist_dat                                     AS dat,
                EXTRACT(HOUR FROM ist_time)::INT            AS hour,
                district, id, station, type,
                SUM(rainfall)                               AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)                AS avg_temp,
                ROUND(AVG(rh)::NUMERIC, 1)                  AS avg_rh,
                COUNT(*)                                    AS readings_count
            FROM ist
            WHERE true ${hourFilter}
            GROUP BY ist_dat, EXTRACT(HOUR FROM ist_time)::INT, district, id, station, type
            ORDER BY hour, district, total_rainfall DESC
        `;

        const result = await client.query(query, params);
        res.status(200).json({
            success: true,
            message: "Hourly UP AWS data fetched successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("[UP AWS] fetchHourlyData error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch hourly data", error: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 3. SINGLE 15-MIN SLOT — exact IST time reading per station
//    POST /api/up-aws/slot
//    Body: { date?, time?, district? }   time: "11:30:00" (IST)
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchSlotData = async (req, res) => {
    try {
        let { date, time, district } = req.body;
        date = date || moment().tz(IST).format("YYYY-MM-DD");
        time = time || moment().tz(IST).startOf("hour").format("HH:mm:ss");

        let params = [date, time];
        let districtFilter = "";

        if (district) {
            params.push(district);
            districtFilter = `AND district = $${params.length}`;
        }

        const query = `
            WITH ist AS (
                SELECT *,
                    ${IST_DATE}                             AS ist_dat,
                    ${IST_TIME}                             AS ist_time,
                    (updated_at + INTERVAL '5 hours 30 minutes') AS ist_updated_at
                FROM up_aws_observations
                WHERE ${IST_DATE} = $1::date
                  AND ${IST_TIME} = $2::time
                  ${districtFilter}
            )
            SELECT
                ist_dat     AS dat,
                ist_time    AS time,
                district, id, station, type, lat, lon,
                rainfall, temp, feel_like, rh, winds, windd, slp, mslp,
                ist_updated_at AS updated_at
            FROM ist
            ORDER BY district, rainfall DESC
        `;

        const result = await client.query(query, params);
        res.status(200).json({
            success: true,
            message: "Slot data fetched successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("[UP AWS] fetchSlotData error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch slot data", error: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 4. CUMULATIVE RUNNING TOTAL — day-by-day running sum per station (IST dates)
//    POST /api/up-aws/cumulative
//    Body: { startDate?, endDate?, district? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchCumulativeData = async (req, res) => {
    try {
        let { startDate, endDate, district } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));

        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST))) {
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        }

        let params = [startDate, endDate];
        let districtFilter = "";

        if (district) {
            params.push(district);
            districtFilter = `AND district = $${params.length}`;
        }

        const query = `
            SELECT
                ist_dat                             AS dat,
                district, id, station,
                daily_rainfall,
                SUM(daily_rainfall) OVER (
                    PARTITION BY id
                    ORDER BY ist_dat
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                )                                   AS cumulative_rainfall
            FROM (
                SELECT
                    ${IST_DATE}                     AS ist_dat,
                    district, id, station,
                    SUM(rainfall)                   AS daily_rainfall
                FROM up_aws_observations
                WHERE ${IST_DATE} BETWEEN $1::date AND $2::date
                  ${districtFilter}
                GROUP BY ist_dat, district, id, station
            ) AS daily_totals
            ORDER BY id, ist_dat
        `;

        const result = await client.query(query, params);
        res.status(200).json({
            success: true,
            message: "Cumulative UP AWS data fetched successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("[UP AWS] fetchCumulativeData error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch cumulative data", error: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 5. DISTRICT SUMMARY — aggregated at district level (IST date)
//    POST /api/up-aws/district-summary
//    Body: { date? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchDistrictSummary = async (req, res) => {
    try {
        const date = req.body.date || moment().tz(IST).format("YYYY-MM-DD");

        const query = `
            SELECT
                ist_dat                                     AS dat,
                district,
                COUNT(DISTINCT id)                          AS total_stations,
                ROUND(AVG(daily_rain)::NUMERIC, 2)          AS avg_rainfall,
                MAX(daily_rain)                             AS max_rainfall,
                MIN(daily_rain)                             AS min_rainfall,
                SUM(daily_rain)                             AS sum_rainfall,
                ROUND(AVG(avg_temp)::NUMERIC, 1)            AS avg_temp
            FROM (
                SELECT
                    ${IST_DATE}                             AS ist_dat,
                    district, id,
                    SUM(rainfall)                           AS daily_rain,
                    AVG(temp)                               AS avg_temp
                FROM up_aws_observations
                WHERE ${IST_DATE} = $1::date
                GROUP BY ist_dat, district, id
            ) AS station_daily
            GROUP BY ist_dat, district
            ORDER BY avg_rainfall DESC
        `;

        const result = await client.query(query, [date]);
        res.status(200).json({
            success: true,
            message: "District summary fetched successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("[UP AWS] fetchDistrictSummary error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch district summary", error: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// DEPARTURE — shared helper (mirrors block.js fetchBetweenDates)
// UP data is stored in UTC; IST_DATE converts to IST date for joins.
// ─────────────────────────────────────────────────────────────────────────────
const IST_DATE_EXPR = `(dat::date + time::time + INTERVAL '5 hours 30 minutes')::date`;

const fetchBetweenDates = async (startDate, endDate) => {
    const query = `
        SELECT
            MIN(inner_q.block_name)        AS block_name,
            inner_q.block_code,
            MIN(inner_q.district_name)     AS district_name,
            MIN(inner_q.district_code)     AS district_code,
            MIN(inner_q.state_name)        AS state_name,
            MIN(inner_q.state_code)        AS state_code,
            MIN(inner_q.region_name)       AS region_name,
            MIN(inner_q.region_code)       AS region_code,
            MIN(inner_q.sub_division_code) AS sub_division_code,
            SUM(inner_q.normal_rainfall)   AS normal_rainfall,
            SUM(inner_q.actual_rainfall)   AS actual_rainfall,
            CASE
              WHEN SUM(inner_q.normal_rainfall) IS NULL THEN NULL
              ELSE
                ((SUM(inner_q.actual_rainfall)
                  - SUM(CASE WHEN inner_q.normal_rainfall = 0 THEN 0.01 ELSE inner_q.normal_rainfall END))
                 / SUM(CASE WHEN inner_q.normal_rainfall = 0 THEN 0.01 ELSE inner_q.normal_rainfall END)) * 100
            END AS departure
        FROM (
            SELECT
                aws.block                  AS block_name,
                sd.block_code,
                aws.district               AS district_name,
                ndd.district_code,
                aws.state                  AS state_name,
                ndd.new_state_code         AS state_code,
                ndd.region_name,
                ndd.region_code,
                ndd.subdiv_code            AS sub_division_code,
                aws.ist_dat                AS dat,
                AVG(nb.rainfall_value)     AS normal_rainfall,
                AVG(aws.station_rf)        AS actual_rainfall
            FROM (
                SELECT block, district, state, id,
                    ${IST_DATE_EXPR} AS ist_dat,
                    SUM(rainfall) AS station_rf
                FROM up_aws_observations
                WHERE ${IST_DATE_EXPR} BETWEEN $1::date AND $2::date
                  AND block IS NOT NULL AND TRIM(block) != ''
                GROUP BY block, district, state, id, ${IST_DATE_EXPR}
            ) AS aws
            LEFT JOIN station_details sd
                ON LOWER(TRIM(sd.block_name)) = LOWER(TRIM(aws.block))
            LEFT JOIN normal_district_details ndd
                ON sd.district_code = ndd.district_code
            LEFT JOIN normal_block nb
                ON sd.block_code = nb.block_id AND nb.date = aws.ist_dat
            GROUP BY
                aws.block, sd.block_code, aws.district, ndd.district_code,
                aws.state, ndd.new_state_code, ndd.region_name, ndd.region_code,
                ndd.subdiv_code, aws.ist_dat
        ) AS inner_q
        GROUP BY inner_q.block_code
        ORDER BY inner_q.block_code
    `;
    const result = await client.query(query, [startDate, endDate]);
    return result.rows;
};


// ─────────────────────────────────────────────────────────────────────────────
// 6. ACTUAL DEPARTURE
//    POST /api/v1/up-aws/actual-departure
//    Body: { startDate?, endDate? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchActualDeparture = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST))) {
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        }
        const data = await fetchBetweenDates(startDate, endDate);
        res.status(200).json({ success: true, message: "UP AWS actual departure fetched", data });
    } catch (error) {
        console.error("[UP AWS] fetchActualDeparture:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 7. DEPARTURE ANALYSIS
//    POST /api/v1/up-aws/departure-analysis
//    Body: { startDate?, endDate? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchDepartureAnalysis = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST))) {
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        }

        const blockData = await fetchBetweenDates(startDate, endDate);

        const legendCriteria = [
            { category: "Large Excess",    min: 60,   max: Infinity, color: "#0096ff" },
            { category: "Excess",          min: 20,   max: 59,       color: "#32c0f8" },
            { category: "Normal",          min: -19,  max: 19,       color: "#00cd5b" },
            { category: "Deficient",       min: -59,  max: -20,      color: "#ff2700" },
            { category: "Large Deficient", min: -99,  max: -60,      color: "#ffff20" },
            { category: "No Rain",         min: -100, max: -100,     color: "#ffffff" },
            { category: "No Data",         min: null, max: null,     color: "#c0c0c0" },
        ];

        const categoryCounts = {
            "Large Excess": 0, "Excess": 0, "Normal": 0,
            "Deficient": 0, "Large Deficient": 0, "No Rain": 0, "No Data": 0,
        };

        blockData.forEach((block) => {
            if (block.departure === null) {
                categoryCounts["No Data"]++;
            } else if (block.departure === -100) {
                categoryCounts["No Rain"]++;
            } else {
                const category = legendCriteria.find(
                    (c) => c.min !== null && c.max !== null &&
                           block.departure >= c.min && block.departure <= c.max
                );
                if (category) categoryCounts[category.category]++;
            }
        });

        const validBlocks           = blockData.filter((b) => b.actual_rainfall !== null);
        const validDepartureBlocks  = blockData.filter((b) => b.departure !== null);

        const topActual    = validBlocks.length ? validBlocks.reduce((max, b) => b.actual_rainfall > (max.actual_rainfall || 0) ? b : max) : null;
        const minActual    = validBlocks.length ? validBlocks.reduce((min, b) => b.actual_rainfall < (min.actual_rainfall ?? Infinity) ? b : min) : null;
        const topDeparture = validDepartureBlocks.length ? validDepartureBlocks.reduce((max, b) => b.departure > (max.departure ?? -Infinity) ? b : max) : null;
        const minDeparture = validDepartureBlocks.length ? validDepartureBlocks.reduce((min, b) => b.departure < (min.departure ?? Infinity) ? b : min) : null;

        const regions = ["CENTRAL INDIA", "NORTH INDIA", "SOUTH INDIA", "EAST INDIA", "WEST INDIA"];
        const regionalStats = regions.map((region) => {
            const rb = blockData.filter((b) => b.region_name === region);
            const totalRf = rb.reduce((s, b) => s + (b.actual_rainfall || 0), 0);
            const vb = rb.filter((b) => b.departure !== null);
            const avgDep = vb.length ? vb.reduce((s, b) => s + b.departure, 0) / vb.length : null;
            return {
                region,
                avgRainfall: rb.length ? Number((totalRf / rb.length).toFixed(1)) : null,
                change: avgDep !== null ? Number(avgDep.toFixed(1)) : null,
            };
        }).filter((s) => s.avgRainfall !== null);

        const stateStats = [...new Set(blockData.map((b) => b.state_name))].map((state) => {
            const sb = blockData.filter((b) => b.state_name === state);
            const totalRf = sb.reduce((s, b) => s + (b.actual_rainfall || 0), 0);
            const vb = sb.filter((b) => b.departure !== null);
            const avgDep = vb.length ? vb.reduce((s, b) => s + b.departure, 0) / vb.length : null;
            return {
                state,
                avgRainfall: sb.length ? Number((totalRf / sb.length).toFixed(1)) : null,
                change: avgDep !== null ? Number(avgDep.toFixed(1)) : null,
            };
        }).filter((s) => s.avgRainfall !== null);

        const subdivStats = [...new Set(blockData.map((b) => b.sub_division_code))].map((subdiv) => {
            const sb = blockData.filter((b) => b.sub_division_code === subdiv);
            const totalRf = sb.reduce((s, b) => s + (b.actual_rainfall || 0), 0);
            const vb = sb.filter((b) => b.departure !== null);
            const avgDep = vb.length ? vb.reduce((s, b) => s + b.departure, 0) / vb.length : null;
            return {
                subdivision: `Subdivision ${subdiv}`,
                avgRainfall: sb.length ? Number((totalRf / sb.length).toFixed(1)) : null,
                change: avgDep !== null ? Number(avgDep.toFixed(1)) : null,
            };
        }).filter((s) => s.avgRainfall !== null);

        const totalRainfall = blockData.reduce((s, b) => s + (b.actual_rainfall || 0), 0);
        const vbDep = blockData.filter((b) => b.departure !== null);
        const avgDeparture = vbDep.length ? vbDep.reduce((s, b) => s + b.departure, 0) / vbDep.length : null;
        const highestRf = regionalStats.reduce((max, s) => (s.avgRainfall > (max.avgRainfall || 0) ? s : max), {});
        const lowestRf  = regionalStats.reduce((min, s) => (s.avgRainfall < (min.avgRainfall ?? Infinity) ? s : min), {});

        res.status(200).json({
            success: true,
            message: "UP AWS departure analysis fetched",
            data: {
                categoryCounts,
                topActual:    topActual    || { message: "No valid actual rainfall data" },
                minActual:    minActual    || { message: "No valid actual rainfall data" },
                topDeparture: topDeparture || { message: "No valid departure data" },
                minDeparture: minDeparture || { message: "No valid departure data" },
                regionalStatistics:    regionalStats,
                stateStatistics:       stateStats,
                subdivisionStatistics: subdivStats,
                summaryStatistics: {
                    totalRainfall:    Number(totalRainfall.toFixed(1)),
                    highestRainfall:  highestRf.avgRainfall ? `${highestRf.avgRainfall} mm (${highestRf.region})` : "No Data",
                    lowestRainfall:   lowestRf.avgRainfall  ? `${lowestRf.avgRainfall} mm (${lowestRf.region})`   : "No Data",
                    averageDeparture: avgDeparture !== null ? Number(avgDeparture.toFixed(1)) : null,
                },
            },
        });
    } catch (error) {
        console.error("[UP AWS] fetchDepartureAnalysis:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 8. DEPARTURE EXPORT (CWC_DEP protected)
//    POST /api/v1/up-aws/departure-export
//    Body: { user, pass, fromDate?, toDate? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchDepartureForAPIexport = async (req, res) => {
    try {
        let { user, pass, fromDate, toDate } = req.body;
        if (user !== "CWC_DEP" || pass !== "!Md@15O#cwc") {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid credentials" });
        }
        const today = moment().tz(IST).format("YYYY-MM-DD");
        if (!fromDate && !toDate) { fromDate = toDate = today; }
        else if (!fromDate) { fromDate = toDate; }
        else if (!toDate)   { toDate = fromDate; }
        if (moment.tz(fromDate, IST).isAfter(moment.tz(toDate, IST))) {
            return res.status(400).json({ success: false, message: "fromDate must be <= toDate" });
        }
        const data = await fetchBetweenDates(fromDate, toDate);
        res.status(200).json({ success: true, message: "UP AWS departure data fetched", data });
    } catch (error) {
        console.error("[UP AWS] fetchDepartureForAPIexport:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};