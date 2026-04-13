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