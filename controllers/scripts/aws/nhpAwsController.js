const client = require("../../../connection");
const moment = require("moment");

const AWS_DAY = `(dat::date + time::time - INTERVAL '14 hours')::date`;

const resolveDates = (startDate, endDate) => {
    const awsToday = moment.utc().subtract(8, 'hours').subtract(30, 'minutes').format("YYYY-MM-DD");
    if (!startDate && !endDate) return { startDate: awsToday, endDate: awsToday };
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
            WITH aws AS (
                SELECT *, ${AWS_DAY} AS aws_day
                FROM observations_aws_nhp
                WHERE dat BETWEEN $1::date AND ($2::date + INTERVAL '1 day') ${districtFilter}
            )
            SELECT
                aws_day AS dat,
                district, state, id, station,
                SUM(rainfall)                       AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)        AS avg_temp,
                MAX(temp)                           AS max_temp,
                MIN(temp)                           AS min_temp,
                ROUND(AVG(rh)::NUMERIC, 1)          AS avg_rh,
                ROUND(AVG(winds)::NUMERIC, 1)       AS avg_wind_speed,
                COUNT(*)                            AS readings_count
            FROM aws
            WHERE aws_day BETWEEN $1::date AND $2::date
            GROUP BY aws_day, district, state, id, station
            ORDER BY aws_day, district, total_rainfall DESC
        `, params);

        res.status(200).json({ success: true, message: "NHP Daily data fetched", data: result.rows });
    } catch (error) {
        console.error("[NHP AWS] fetchDailyData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. HOURLY
exports.fetchHourlyData = async (req, res) => {
    try {
        let { date, hour, district } = req.body;
        date = date || moment.utc().subtract(8, 'hours').subtract(30, 'minutes').format("YYYY-MM-DD");

        let params = [date];
        let hourFilter = "", districtFilter = "";
        if (hour !== undefined && hour !== null) { params.push(parseInt(hour)); hourFilter = `AND EXTRACT(HOUR FROM time) = $${params.length}`; }
        if (district) { params.push(district); districtFilter = `AND district = $${params.length}`; }

        const result = await client.query(`
            WITH aws AS (
                SELECT *, ${AWS_DAY} AS aws_day
                FROM observations_aws_nhp
                WHERE dat BETWEEN $1::date AND ($1::date + INTERVAL '1 day') ${districtFilter}
            )
            SELECT
                aws_day AS dat,
                EXTRACT(HOUR FROM time)::INT    AS hour,
                district, state, id, station,
                SUM(rainfall)                   AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)    AS avg_temp,
                ROUND(AVG(rh)::NUMERIC, 1)      AS avg_rh,
                COUNT(*)                        AS readings_count
            FROM aws
            WHERE aws_day = $1::date ${hourFilter}
            GROUP BY aws_day, EXTRACT(HOUR FROM time)::INT, district, state, id, station
            ORDER BY hour, district, total_rainfall DESC
        `, params);

        res.status(200).json({ success: true, message: "NHP Hourly data fetched", data: result.rows });
    } catch (error) {
        console.error("[NHP AWS] fetchHourlyData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. SLOT
exports.fetchSlotData = async (req, res) => {
    try {
        let { date, time, district } = req.body;
        date = date || moment.utc().subtract(8, 'hours').subtract(30, 'minutes').format("YYYY-MM-DD");
        time = time || moment().startOf("hour").format("HH:mm:ss");

        let params = [date, time];
        let districtFilter = "";
        if (district) { params.push(district); districtFilter = `AND district = $${params.length}`; }

        const result = await client.query(`
            SELECT
                dat, time, district, state, id, station,
                rainfall, rainfall_daily, temp, feel_like,
                rh, winds, windd, slp, updated_at
            FROM observations_aws_nhp
            WHERE dat = $1 AND time = $2 ${districtFilter}
            ORDER BY district, rainfall DESC
        `, params);

        res.status(200).json({ success: true, message: "NHP Slot data fetched", data: result.rows });
    } catch (error) {
        console.error("[NHP AWS] fetchSlotData:", error);
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
            SELECT aws_day AS dat, district, id, station, daily_rainfall,
                SUM(daily_rainfall) OVER (
                    PARTITION BY id ORDER BY aws_day
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS cumulative_rainfall
            FROM (
                SELECT ${AWS_DAY} AS aws_day, district, id, station,
                    SUM(rainfall) AS daily_rainfall
                FROM observations_aws_nhp
                WHERE dat BETWEEN $1::date AND ($2::date + INTERVAL '1 day') ${districtFilter}
                  AND ${AWS_DAY} BETWEEN $1::date AND $2::date
                GROUP BY ${AWS_DAY}, district, id, station
            ) AS daily_totals
            ORDER BY id, aws_day
        `, params);

        res.status(200).json({ success: true, message: "NHP Cumulative data fetched", data: result.rows });
    } catch (error) {
        console.error("[NHP AWS] fetchCumulativeData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. DISTRICT SUMMARY
exports.fetchDistrictSummary = async (req, res) => {
    try {
        const date = req.body.date || moment.utc().subtract(8, 'hours').subtract(30, 'minutes').format("YYYY-MM-DD");

        const result = await client.query(`
            SELECT aws_day AS dat, district, state,
                COUNT(DISTINCT id)                  AS total_stations,
                ROUND(AVG(daily_rain)::NUMERIC, 2)  AS avg_rainfall,
                MAX(daily_rain)                     AS max_rainfall,
                MIN(daily_rain)                     AS min_rainfall,
                SUM(daily_rain)                     AS sum_rainfall,
                ROUND(AVG(avg_temp)::NUMERIC, 1)    AS avg_temp
            FROM (
                SELECT ${AWS_DAY} AS aws_day, district, state, id,
                    SUM(rainfall) AS daily_rain,
                    AVG(temp)     AS avg_temp
                FROM observations_aws_nhp
                WHERE dat BETWEEN $1::date AND ($1::date + INTERVAL '1 day')
                  AND ${AWS_DAY} = $1::date
                GROUP BY ${AWS_DAY}, district, state, id
            ) AS station_daily
            GROUP BY aws_day, district, state
            ORDER BY avg_rainfall DESC
        `, [date]);

        res.status(200).json({ success: true, message: "NHP District summary fetched", data: result.rows });
    } catch (error) {
        console.error("[NHP AWS] fetchDistrictSummary:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTURE — district-level helper (mirrors block.js fetchBetweenDates)
// NHP has no block column; normals are aggregated from block→district.
// ─────────────────────────────────────────────────────────────────────────────
const fetchBetweenDates = async (startDate, endDate) => {
    const query = `
        SELECT
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
                aws.district               AS district_name,
                ndd.district_code,
                aws.state                  AS state_name,
                ndd.new_state_code         AS state_code,
                ndd.region_name,
                ndd.region_code,
                ndd.subdiv_code            AS sub_division_code,
                aws.dat,
                AVG(nb_dist.normal_rainfall) AS normal_rainfall,
                AVG(aws.station_rf)          AS actual_rainfall
            FROM (
                SELECT district, state, id, ${AWS_DAY} AS dat, SUM(rainfall) AS station_rf
                FROM observations_aws_nhp
                WHERE dat BETWEEN $1::date AND ($2::date + INTERVAL '1 day')
                  AND ${AWS_DAY} BETWEEN $1::date AND $2::date
                GROUP BY district, state, id, ${AWS_DAY}
            ) AS aws
            LEFT JOIN normal_district_details ndd
                ON LOWER(TRIM(ndd.district_name)) = LOWER(TRIM(aws.district))
            LEFT JOIN (
                SELECT sd2.district_code, nb2.date, SUM(nb2.rainfall_value) AS normal_rainfall
                FROM normal_block nb2
                JOIN station_details sd2 ON nb2.block_id = sd2.block_code
                WHERE nb2.date BETWEEN $1 AND $2
                GROUP BY sd2.district_code, nb2.date
            ) nb_dist ON nb_dist.district_code = ndd.district_code AND nb_dist.date = aws.dat
            GROUP BY
                aws.district, ndd.district_code, aws.state, ndd.new_state_code,
                ndd.region_name, ndd.region_code, ndd.subdiv_code, aws.dat
        ) AS inner_q
        GROUP BY inner_q.district_name
        ORDER BY inner_q.district_name
    `;
    const result = await client.query(query, [startDate, endDate]);
    return result.rows;
};

// POST /api/v1/nhp-aws/actual-departure
exports.fetchActualDeparture = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        }
        const data = await fetchBetweenDates(startDate, endDate);
        res.status(200).json({ success: true, message: "NHP AWS actual departure fetched", data });
    } catch (error) {
        console.error("[NHP AWS] fetchActualDeparture:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/nhp-aws/departure-analysis
exports.fetchDepartureAnalysis = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));
        if (moment(startDate).isAfter(endDate)) {
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
            success: true, message: "NHP AWS departure analysis fetched",
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
        console.error("[NHP AWS] fetchDepartureAnalysis:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/nhp-aws/departure-export
exports.fetchDepartureForAPIexport = async (req, res) => {
    try {
        let { user, pass, fromDate, toDate } = req.body;
        if (user !== "CWC_DEP" || pass !== "!Md@15O#cwc") {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid credentials" });
        }
        const awsToday = moment.utc().subtract(8, 'hours').subtract(30, 'minutes').format("YYYY-MM-DD");
        if (!fromDate && !toDate) { fromDate = toDate = awsToday; }
        else if (!fromDate) { fromDate = toDate; }
        else if (!toDate)   { toDate = fromDate; }
        if (moment(fromDate).isAfter(toDate)) {
            return res.status(400).json({ success: false, message: "fromDate must be <= toDate" });
        }
        const data = await fetchBetweenDates(fromDate, toDate);
        res.status(200).json({ success: true, message: "NHP AWS departure data fetched", data });
    } catch (error) {
        console.error("[NHP AWS] fetchDepartureForAPIexport:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
