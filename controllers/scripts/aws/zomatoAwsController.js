const client = require("../../../connection");
const moment = require("moment");

const resolveDates = (startDate, endDate) => {
    const today = moment().format("YYYY-MM-DD");
    if (!startDate && !endDate) return { startDate: today, endDate: today };
    if (!startDate) return { startDate: endDate, endDate };
    if (!endDate)   return { startDate, endDate: startDate };
    return { startDate, endDate };
};

// 1. DAILY
exports.fetchDailyData = async (req, res) => {
    try {
        let { startDate, endDate, city } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));

        let params = [startDate, endDate];
        let cityFilter = "";
        if (city) { params.push(city); cityFilter = `AND city = $${params.length}`; }

        const result = await client.query(`
            SELECT
                dat, city, id, station, type, lat, lon,
                SUM(rainfall)                       AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)        AS avg_temp,
                MAX(temp)                           AS max_temp,
                MIN(temp)                           AS min_temp,
                ROUND(AVG(rh)::NUMERIC, 1)          AS avg_rh,
                ROUND(AVG(winds)::NUMERIC, 1)       AS avg_wind_speed,
                COUNT(*)                            AS readings_count
            FROM observations_aws_zomato
            WHERE dat BETWEEN $1 AND $2 ${cityFilter}
            GROUP BY dat, city, id, station, type, lat, lon
            ORDER BY dat, city, total_rainfall DESC
        `, params);

        res.status(200).json({ success: true, message: "Zomato Daily data fetched", data: result.rows });
    } catch (error) {
        console.error("[ZOMATO AWS] fetchDailyData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. HOURLY
exports.fetchHourlyData = async (req, res) => {
    try {
        let { date, hour, city } = req.body;
        date = date || moment().format("YYYY-MM-DD");

        let params = [date];
        let hourFilter = "", cityFilter = "";
        if (hour !== undefined && hour !== null) { params.push(parseInt(hour)); hourFilter = `AND EXTRACT(HOUR FROM time) = $${params.length}`; }
        if (city) { params.push(city); cityFilter = `AND city = $${params.length}`; }

        const result = await client.query(`
            SELECT
                dat,
                EXTRACT(HOUR FROM time)::INT    AS hour,
                city, id, station,
                SUM(rainfall)                   AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)    AS avg_temp,
                ROUND(AVG(rh)::NUMERIC, 1)      AS avg_rh,
                COUNT(*)                        AS readings_count
            FROM observations_aws_zomato
            WHERE dat = $1 ${hourFilter} ${cityFilter}
            GROUP BY dat, hour, city, id, station
            ORDER BY hour, city, total_rainfall DESC
        `, params);

        res.status(200).json({ success: true, message: "Zomato Hourly data fetched", data: result.rows });
    } catch (error) {
        console.error("[ZOMATO AWS] fetchHourlyData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. SLOT
exports.fetchSlotData = async (req, res) => {
    try {
        let { date, time, city } = req.body;
        date = date || moment().format("YYYY-MM-DD");
        time = time || moment().startOf("hour").format("HH:mm:ss");

        let params = [date, time];
        let cityFilter = "";
        if (city) { params.push(city); cityFilter = `AND city = $${params.length}`; }

        const result = await client.query(`
            SELECT
                dat, time, city, id, station, type,
                lat, lon, rainfall, temp, feel_like,
                rh, winds, windd
            FROM observations_aws_zomato
            WHERE dat = $1 AND time = $2 ${cityFilter}
            ORDER BY city, rainfall DESC
        `, params);

        res.status(200).json({ success: true, message: "Zomato Slot data fetched", data: result.rows });
    } catch (error) {
        console.error("[ZOMATO AWS] fetchSlotData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. CUMULATIVE
exports.fetchCumulativeData = async (req, res) => {
    try {
        let { startDate, endDate, city } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));

        let params = [startDate, endDate];
        let cityFilter = "";
        if (city) { params.push(city); cityFilter = `AND city = $${params.length}`; }

        const result = await client.query(`
            SELECT dat, city, id, station, daily_rainfall,
                SUM(daily_rainfall) OVER (
                    PARTITION BY id ORDER BY dat
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS cumulative_rainfall
            FROM (
                SELECT dat, city, id, station,
                    SUM(rainfall) AS daily_rainfall
                FROM observations_aws_zomato
                WHERE dat BETWEEN $1 AND $2 ${cityFilter}
                GROUP BY dat, city, id, station
            ) AS daily_totals
            ORDER BY id, dat
        `, params);

        res.status(200).json({ success: true, message: "Zomato Cumulative data fetched", data: result.rows });
    } catch (error) {
        console.error("[ZOMATO AWS] fetchCumulativeData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. CITY SUMMARY
exports.fetchCitySummary = async (req, res) => {
    try {
        const date = req.body.date || moment().format("YYYY-MM-DD");

        const result = await client.query(`
            SELECT dat, city,
                COUNT(DISTINCT id)                  AS total_stations,
                ROUND(AVG(daily_rain)::NUMERIC, 2)  AS avg_rainfall,
                MAX(daily_rain)                     AS max_rainfall,
                MIN(daily_rain)                     AS min_rainfall,
                SUM(daily_rain)                     AS sum_rainfall,
                ROUND(AVG(avg_temp)::NUMERIC, 1)    AS avg_temp
            FROM (
                SELECT dat, city, id,
                    SUM(rainfall) AS daily_rain,
                    AVG(temp)     AS avg_temp
                FROM observations_aws_zomato
                WHERE dat = $1
                GROUP BY dat, city, id
            ) AS station_daily
            GROUP BY dat, city
            ORDER BY avg_rainfall DESC
        `, [date]);

        res.status(200).json({ success: true, message: "Zomato City summary fetched", data: result.rows });
    } catch (error) {
        console.error("[ZOMATO AWS] fetchCitySummary:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};