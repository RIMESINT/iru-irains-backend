const client = require("../../../connection");
const moment = require("moment-timezone");

const IST = "Asia/Kolkata";

const resolveDates = (startDate, endDate) => {
    const today = moment().tz(IST).format("YYYY-MM-DD");
    if (!startDate && !endDate) return { startDate: today, endDate: today };
    if (!startDate) return { startDate: endDate, endDate };
    if (!endDate)   return { startDate, endDate: startDate };
    return { startDate, endDate };
};

// 1. DAILY
exports.fetchDailyData = async (req, res) => {
    try {
        let { startDate, endDate, district } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));

        let params = [startDate, endDate];
        let districtFilter = "";
        if (district) { params.push(district); districtFilter = `AND district = $${params.length}`; }

        const result = await client.query(`
            SELECT
                dat, district, block, id, station, station_type,
                SUM(rainfall)                       AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)        AS avg_temp,
                MAX(temp)                           AS max_temp,
                MIN(temp)                           AS min_temp,
                ROUND(AVG(rh)::NUMERIC, 1)          AS avg_rh,
                ROUND(AVG(winds)::NUMERIC, 1)       AS avg_wind_speed,
                ROUND(AVG(soil_temp)::NUMERIC, 1)   AS avg_soil_temp,
                ROUND(AVG(irradiance)::NUMERIC, 1)  AS avg_irradiance,
                COUNT(*)                            AS readings_count
            FROM observations_aws_meghalaya
            WHERE dat BETWEEN $1 AND $2 ${districtFilter}
            GROUP BY dat, district, block, id, station, station_type
            ORDER BY dat, district, total_rainfall DESC
        `, params);

        res.status(200).json({ success: true, message: "Meghalaya Daily data fetched", data: result.rows });
    } catch (error) {
        console.error("[MEG AWS] fetchDailyData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. HOURLY
exports.fetchHourlyData = async (req, res) => {
    try {
        let { date, hour, district } = req.body;
        date = date || moment().format("YYYY-MM-DD");

        let params = [date];
        let hourFilter = "", districtFilter = "";
        if (hour !== undefined && hour !== null) { params.push(parseInt(hour)); hourFilter = `AND EXTRACT(HOUR FROM time) = $${params.length}`; }
        if (district) { params.push(district); districtFilter = `AND district = $${params.length}`; }

        const result = await client.query(`
            SELECT
                dat,
                EXTRACT(HOUR FROM time)::INT        AS hour,
                district, id, station,
                SUM(rainfall)                       AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)        AS avg_temp,
                ROUND(AVG(rh)::NUMERIC, 1)          AS avg_rh,
                COUNT(*)                            AS readings_count
            FROM observations_aws_meghalaya
            WHERE dat = $1 ${hourFilter} ${districtFilter}
            GROUP BY dat, hour, district, id, station
            ORDER BY hour, district, total_rainfall DESC
        `, params);

        res.status(200).json({ success: true, message: "Meghalaya Hourly data fetched", data: result.rows });
    } catch (error) {
        console.error("[MEG AWS] fetchHourlyData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. SLOT
exports.fetchSlotData = async (req, res) => {
    try {
        let { date, time, district } = req.body;
        date = date || moment().format("YYYY-MM-DD");
        time = time || moment().startOf("hour").format("HH:mm:ss");

        let params = [date, time];
        let districtFilter = "";
        if (district) { params.push(district); districtFilter = `AND district = $${params.length}`; }

        const result = await client.query(`
            SELECT
                dat, time, district, block, id, station,
                facility, station_type, alt,
                rainfall, temp, rh, winds, windd, slp,
                soil_temp, irradiance, water_content,
                conductivity, updated_at
            FROM observations_aws_meghalaya
            WHERE dat = $1 AND time = $2 ${districtFilter}
            ORDER BY district, rainfall DESC
        `, params);

        res.status(200).json({ success: true, message: "Meghalaya Slot data fetched", data: result.rows });
    } catch (error) {
        console.error("[MEG AWS] fetchSlotData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. CUMULATIVE
exports.fetchCumulativeData = async (req, res) => {
    try {
        let { startDate, endDate, district } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));

        let params = [startDate, endDate];
        let districtFilter = "";
        if (district) { params.push(district); districtFilter = `AND district = $${params.length}`; }

        const result = await client.query(`
            SELECT dat, district, id, station, daily_rainfall,
                SUM(daily_rainfall) OVER (
                    PARTITION BY id ORDER BY dat
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS cumulative_rainfall
            FROM (
                SELECT dat, district, id, station,
                    SUM(rainfall) AS daily_rainfall
                FROM observations_aws_meghalaya
                WHERE dat BETWEEN $1 AND $2 ${districtFilter}
                GROUP BY dat, district, id, station
            ) AS daily_totals
            ORDER BY id, dat
        `, params);

        res.status(200).json({ success: true, message: "Meghalaya Cumulative data fetched", data: result.rows });
    } catch (error) {
        console.error("[MEG AWS] fetchCumulativeData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. DISTRICT SUMMARY
exports.fetchDistrictSummary = async (req, res) => {
    try {
        const date = req.body.date || moment().format("YYYY-MM-DD");

        const result = await client.query(`
            SELECT dat, district,
                COUNT(DISTINCT id)                  AS total_stations,
                ROUND(AVG(daily_rain)::NUMERIC, 2)  AS avg_rainfall,
                MAX(daily_rain)                     AS max_rainfall,
                MIN(daily_rain)                     AS min_rainfall,
                SUM(daily_rain)                     AS sum_rainfall,
                ROUND(AVG(avg_temp)::NUMERIC, 1)    AS avg_temp
            FROM (
                SELECT dat, district, id,
                    SUM(rainfall) AS daily_rain,
                    AVG(temp)     AS avg_temp
                FROM observations_aws_meghalaya
                WHERE dat = $1
                GROUP BY dat, district, id
            ) AS station_daily
            GROUP BY dat, district
            ORDER BY avg_rainfall DESC
        `, [date]);

        res.status(200).json({ success: true, message: "Meghalaya District summary fetched", data: result.rows });
    } catch (error) {
        console.error("[MEG AWS] fetchDistrictSummary:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTURE — shared helper (mirrors block.js fetchBetweenDates)
// ─────────────────────────────────────────────────────────────────────────────
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
                aws.dat,
                AVG(nb.rainfall_value)     AS normal_rainfall,
                AVG(aws.station_rf)        AS actual_rainfall
            FROM (
                SELECT block, district, state, id, dat, SUM(rainfall) AS station_rf
                FROM observations_aws_meghalaya
                WHERE dat BETWEEN $1 AND $2
                  AND block IS NOT NULL AND TRIM(block) != ''
                GROUP BY block, district, state, id, dat
            ) AS aws
            LEFT JOIN station_details sd
                ON LOWER(TRIM(sd.block_name)) = LOWER(TRIM(aws.block))
            LEFT JOIN normal_district_details ndd
                ON sd.district_code = ndd.district_code
            LEFT JOIN normal_block nb
                ON sd.block_code = nb.block_id AND nb.date = aws.dat
            GROUP BY
                aws.block, sd.block_code, aws.district, ndd.district_code,
                aws.state, ndd.new_state_code, ndd.region_name, ndd.region_code,
                ndd.subdiv_code, aws.dat
        ) AS inner_q
        GROUP BY inner_q.block_code
        ORDER BY inner_q.block_code
    `;
    const result = await client.query(query, [startDate, endDate]);
    return result.rows;
};

// POST /api/v1/meghalaya-aws/actual-departure
exports.fetchActualDeparture = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST))) {
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        }
        const data = await fetchBetweenDates(startDate, endDate);
        res.status(200).json({ success: true, message: "Meghalaya AWS actual departure fetched", data });
    } catch (error) {
        console.error("[MEG AWS] fetchActualDeparture:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/meghalaya-aws/departure-analysis
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
        const categoryCounts = { "Large Excess": 0, "Excess": 0, "Normal": 0, "Deficient": 0, "Large Deficient": 0, "No Rain": 0, "No Data": 0 };
        blockData.forEach((block) => {
            if (block.departure === null) { categoryCounts["No Data"]++; }
            else if (block.departure === -100) { categoryCounts["No Rain"]++; }
            else {
                const cat = legendCriteria.find((c) => c.min !== null && c.max !== null && block.departure >= c.min && block.departure <= c.max);
                if (cat) categoryCounts[cat.category]++;
            }
        });
        const vb = blockData.filter((b) => b.actual_rainfall !== null);
        const vd = blockData.filter((b) => b.departure !== null);
        const topActual    = vb.length ? vb.reduce((m, b) => b.actual_rainfall > (m.actual_rainfall || 0) ? b : m) : null;
        const minActual    = vb.length ? vb.reduce((m, b) => b.actual_rainfall < (m.actual_rainfall ?? Infinity) ? b : m) : null;
        const topDeparture = vd.length ? vd.reduce((m, b) => b.departure > (m.departure ?? -Infinity) ? b : m) : null;
        const minDeparture = vd.length ? vd.reduce((m, b) => b.departure < (m.departure ?? Infinity) ? b : m) : null;
        const regions = ["CENTRAL INDIA", "NORTH INDIA", "SOUTH INDIA", "EAST INDIA", "WEST INDIA"];
        const regionalStats = regions.map((region) => {
            const rb = blockData.filter((b) => b.region_name === region);
            const totalRf = rb.reduce((s, b) => s + (b.actual_rainfall || 0), 0);
            const vr = rb.filter((b) => b.departure !== null);
            const avgDep = vr.length ? vr.reduce((s, b) => s + b.departure, 0) / vr.length : null;
            return { region, avgRainfall: rb.length ? Number((totalRf / rb.length).toFixed(1)) : null, change: avgDep !== null ? Number(avgDep.toFixed(1)) : null };
        }).filter((s) => s.avgRainfall !== null);
        const stateStats = [...new Set(blockData.map((b) => b.state_name))].map((state) => {
            const sb = blockData.filter((b) => b.state_name === state);
            const totalRf = sb.reduce((s, b) => s + (b.actual_rainfall || 0), 0);
            const vs = sb.filter((b) => b.departure !== null);
            const avgDep = vs.length ? vs.reduce((s, b) => s + b.departure, 0) / vs.length : null;
            return { state, avgRainfall: sb.length ? Number((totalRf / sb.length).toFixed(1)) : null, change: avgDep !== null ? Number(avgDep.toFixed(1)) : null };
        }).filter((s) => s.avgRainfall !== null);
        const subdivStats = [...new Set(blockData.map((b) => b.sub_division_code))].map((subdiv) => {
            const sb = blockData.filter((b) => b.sub_division_code === subdiv);
            const totalRf = sb.reduce((s, b) => s + (b.actual_rainfall || 0), 0);
            const vs = sb.filter((b) => b.departure !== null);
            const avgDep = vs.length ? vs.reduce((s, b) => s + b.departure, 0) / vs.length : null;
            return { subdivision: `Subdivision ${subdiv}`, avgRainfall: sb.length ? Number((totalRf / sb.length).toFixed(1)) : null, change: avgDep !== null ? Number(avgDep.toFixed(1)) : null };
        }).filter((s) => s.avgRainfall !== null);
        const totalRainfall = blockData.reduce((s, b) => s + (b.actual_rainfall || 0), 0);
        const vbDep = blockData.filter((b) => b.departure !== null);
        const avgDeparture = vbDep.length ? vbDep.reduce((s, b) => s + b.departure, 0) / vbDep.length : null;
        const highestRf = regionalStats.reduce((m, s) => (s.avgRainfall > (m.avgRainfall || 0) ? s : m), {});
        const lowestRf  = regionalStats.reduce((m, s) => (s.avgRainfall < (m.avgRainfall ?? Infinity) ? s : m), {});
        res.status(200).json({
            success: true, message: "Meghalaya AWS departure analysis fetched",
            data: {
                categoryCounts,
                topActual: topActual || { message: "No valid actual rainfall data" },
                minActual: minActual || { message: "No valid actual rainfall data" },
                topDeparture: topDeparture || { message: "No valid departure data" },
                minDeparture: minDeparture || { message: "No valid departure data" },
                regionalStatistics: regionalStats, stateStatistics: stateStats, subdivisionStatistics: subdivStats,
                summaryStatistics: {
                    totalRainfall: Number(totalRainfall.toFixed(1)),
                    highestRainfall: highestRf.avgRainfall ? `${highestRf.avgRainfall} mm (${highestRf.region})` : "No Data",
                    lowestRainfall:  lowestRf.avgRainfall  ? `${lowestRf.avgRainfall} mm (${lowestRf.region})`   : "No Data",
                    averageDeparture: avgDeparture !== null ? Number(avgDeparture.toFixed(1)) : null,
                },
            },
        });
    } catch (error) {
        console.error("[MEG AWS] fetchDepartureAnalysis:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/meghalaya-aws/departure-export
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
        res.status(200).json({ success: true, message: "Meghalaya AWS departure data fetched", data });
    } catch (error) {
        console.error("[MEG AWS] fetchDepartureForAPIexport:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
