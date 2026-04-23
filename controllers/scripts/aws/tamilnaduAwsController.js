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


// ─────────────────────────────────────────────────────────────────────────────
// 1. DAILY
//    POST /api/v1/tamilnadu-aws/daily
//    Body: { startDate?, endDate?, district?, block? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchDailyData = async (req, res) => {
    try {
        let { startDate, endDate, district, block } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));

        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST))) {
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        }

        let params = [startDate, endDate];
        let filters = "";
        if (district) { params.push(district); filters += ` AND district = $${params.length}`; }
        if (block)    { params.push(block);    filters += ` AND block = $${params.length}`; }

        const query = `
            SELECT
                dat, district, block, id, station, type,
                SUM(rainfall)                               AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)                AS avg_temp,
                MAX(temp)                                   AS max_temp,
                MIN(temp)                                   AS min_temp,
                ROUND(AVG(feel_like)::NUMERIC, 1)           AS avg_feel_like,
                ROUND(AVG(rh)::NUMERIC, 1)                  AS avg_rh,
                ROUND(AVG(winds)::NUMERIC, 1)               AS avg_wind_speed,
                ROUND(AVG(solar_radiation)::NUMERIC, 1)     AS avg_solar_radiation,
                COUNT(*)                                    AS readings_count,
                ROUND((COUNT(*) / 96.0) * 100, 1)           AS data_completeness_pct
            FROM observations_aws_tamilnadu
            WHERE dat BETWEEN $1 AND $2 ${filters}
            GROUP BY dat, district, block, id, station, type
            ORDER BY dat, district, total_rainfall DESC
        `;

        const result = await client.query(query, params);
        res.status(200).json({ success: true, message: "Tamilnadu Daily data fetched", data: result.rows });

    } catch (error) {
        console.error("[TN AWS] fetchDailyData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 2. HOURLY
//    POST /api/v1/tamilnadu-aws/hourly
//    Body: { date?, hour?(0-23), district?, block? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchHourlyData = async (req, res) => {
    try {
        let { date, hour, district, block } = req.body;
        date = date || moment().tz(IST).format("YYYY-MM-DD");

        let params = [date];
        let hourFilter = "", filters = "";

        if (hour !== undefined && hour !== null) {
            params.push(parseInt(hour));
            hourFilter = `AND EXTRACT(HOUR FROM time) = $${params.length}`;
        }
        if (district) { params.push(district); filters += ` AND district = $${params.length}`; }
        if (block)    { params.push(block);    filters += ` AND block = $${params.length}`; }

        const query = `
            SELECT
                dat,
                EXTRACT(HOUR FROM time)::INT        AS hour,
                district, block, id, station, type,
                SUM(rainfall)                       AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)        AS avg_temp,
                ROUND(AVG(rh)::NUMERIC, 1)          AS avg_rh,
                COUNT(*)                            AS readings_count
            FROM observations_aws_tamilnadu
            WHERE dat = $1 ${hourFilter} ${filters}
            GROUP BY dat, EXTRACT(HOUR FROM time)::INT, district, block, id, station, type
            ORDER BY hour, district, total_rainfall DESC
        `;

        const result = await client.query(query, params);
        res.status(200).json({ success: true, message: "Tamilnadu Hourly data fetched", data: result.rows });

    } catch (error) {
        console.error("[TN AWS] fetchHourlyData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 3. SLOT
//    POST /api/v1/tamilnadu-aws/slot
//    Body: { date?, time?, district?, block? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchSlotData = async (req, res) => {
    try {
        let { date, time, district, block } = req.body;
        date = date || moment().tz(IST).format("YYYY-MM-DD");
        time = time || moment().tz(IST).startOf("hour").format("HH:mm:ss");

        let params = [date, time];
        let filters = "";
        if (district) { params.push(district); filters += ` AND district = $${params.length}`; }
        if (block)    { params.push(block);    filters += ` AND block = $${params.length}`; }

        const query = `
            SELECT
                dat, time, state, district, tehsil, firka, block,
                id, station, type, lat, lon,
                rainfall, temp, feel_like, rh, winds, windd,
                slp, solar_radiation, soil_temp, soil_moist,
                updated_at
            FROM observations_aws_tamilnadu
            WHERE dat = $1 AND time = $2 ${filters}
            ORDER BY district, block, rainfall DESC
        `;

        const result = await client.query(query, params);
        res.status(200).json({ success: true, message: "Tamilnadu Slot data fetched", data: result.rows });

    } catch (error) {
        console.error("[TN AWS] fetchSlotData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 4. CUMULATIVE
//    POST /api/v1/tamilnadu-aws/cumulative
//    Body: { startDate?, endDate?, district?, block? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchCumulativeData = async (req, res) => {
    try {
        let { startDate, endDate, district, block } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));

        if (moment.tz(startDate, IST).isAfter(moment.tz(endDate, IST))) {
            return res.status(400).json({ success: false, message: "startDate must be <= endDate" });
        }

        let params = [startDate, endDate];
        let filters = "";
        if (district) { params.push(district); filters += ` AND district = $${params.length}`; }
        if (block)    { params.push(block);    filters += ` AND block = $${params.length}`; }

        const query = `
            SELECT
                dat, district, block, id, station,
                daily_rainfall,
                SUM(daily_rainfall) OVER (
                    PARTITION BY id
                    ORDER BY dat
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS cumulative_rainfall
            FROM (
                SELECT dat, district, block, id, station,
                    SUM(rainfall) AS daily_rainfall
                FROM observations_aws_tamilnadu
                WHERE dat BETWEEN $1 AND $2 ${filters}
                GROUP BY dat, district, block, id, station
            ) AS daily_totals
            ORDER BY id, dat
        `;

        const result = await client.query(query, params);
        res.status(200).json({ success: true, message: "Tamilnadu Cumulative data fetched", data: result.rows });

    } catch (error) {
        console.error("[TN AWS] fetchCumulativeData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 5. DISTRICT SUMMARY
//    POST /api/v1/tamilnadu-aws/district-summary
//    Body: { date? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchDistrictSummary = async (req, res) => {
    try {
        const date = req.body.date || moment().tz(IST).format("YYYY-MM-DD");

        const query = `
            SELECT
                dat, district,
                COUNT(DISTINCT id)                  AS total_stations,
                ROUND(AVG(daily_rain)::NUMERIC, 2)  AS avg_rainfall,
                MAX(daily_rain)                     AS max_rainfall,
                MIN(daily_rain)                     AS min_rainfall,
                SUM(daily_rain)                     AS sum_rainfall,
                ROUND(AVG(avg_temp)::NUMERIC, 1)    AS avg_temp
            FROM (
                SELECT dat, district, id,
                    SUM(rainfall)   AS daily_rain,
                    AVG(temp)       AS avg_temp
                FROM observations_aws_tamilnadu
                WHERE dat = $1
                GROUP BY dat, district, id
            ) AS station_daily
            GROUP BY dat, district
            ORDER BY avg_rainfall DESC
        `;

        const result = await client.query(query, [date]);
        res.status(200).json({ success: true, message: "Tamilnadu District summary fetched", data: result.rows });

    } catch (error) {
        console.error("[TN AWS] fetchDistrictSummary:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 6. BLOCK SUMMARY
//    POST /api/v1/tamilnadu-aws/block-summary
//    Body: { date?, district? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchBlockSummary = async (req, res) => {
    try {
        const date = req.body.date || moment().tz(IST).format("YYYY-MM-DD");

        let params = [date];
        let districtFilter = "";
        if (req.body.district) {
            params.push(req.body.district);
            districtFilter = `AND district = $${params.length}`;
        }

        const query = `
            SELECT
                dat, district, block,
                COUNT(DISTINCT id)                  AS total_stations,
                ROUND(AVG(daily_rain)::NUMERIC, 2)  AS avg_rainfall,
                MAX(daily_rain)                     AS max_rainfall,
                MIN(daily_rain)                     AS min_rainfall,
                SUM(daily_rain)                     AS sum_rainfall,
                ROUND(AVG(avg_temp)::NUMERIC, 1)    AS avg_temp
            FROM (
                SELECT dat, district, block, id,
                    SUM(rainfall)   AS daily_rain,
                    AVG(temp)       AS avg_temp
                FROM observations_aws_tamilnadu
                WHERE dat = $1 ${districtFilter}
                GROUP BY dat, district, block, id
            ) AS station_daily
            GROUP BY dat, district, block
            ORDER BY district, avg_rainfall DESC
        `;

        const result = await client.query(query, params);
        res.status(200).json({ success: true, message: "Tamilnadu Block summary fetched", data: result.rows });

    } catch (error) {
        console.error("[TN AWS] fetchBlockSummary:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};