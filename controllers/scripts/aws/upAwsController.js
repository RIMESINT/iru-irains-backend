const client = require("../../../connection");
const moment = require("moment");

const resolveDates = (startDate, endDate) => {
    const today = moment().format("YYYY-MM-DD");
    if (!startDate && !endDate) return { startDate: today, endDate: today };
    if (!startDate) return { startDate: endDate, endDate };
    if (!endDate)   return { startDate, endDate: startDate };
    return { startDate, endDate };
};


// ─────────────────────────────────────────────────────────────────────────────
// 1. FULL DAY — sum all 15-min slots per station
//    POST /api/up-aws/daily
//    Body: { startDate?, endDate?, district? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchDailyData = async (req, res) => {
    try {
        let { startDate, endDate, district } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));

        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate must be <= endDate"
            });
        }

        let params = [startDate, endDate];
        let districtFilter = "";
        if (district) {
            params.push(district);
            districtFilter = `AND district = $${params.length}`;
        }

        const query = `
            SELECT
                dat,
                district,
                id,
                station,
                type,
                lat,
                lon,
                SUM(rainfall)                           AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)            AS avg_temp,
                MAX(temp)                               AS max_temp,
                MIN(temp)                               AS min_temp,
                ROUND(AVG(rh)::NUMERIC, 1)              AS avg_rh,
                ROUND(AVG(winds)::NUMERIC, 1)           AS avg_wind_speed,
                COUNT(*)                                AS readings_count,
                ROUND((COUNT(*) / 96.0) * 100, 1)       AS data_completeness_pct
            FROM up_aws_observations
            WHERE dat BETWEEN $1 AND $2
              ${districtFilter}
            GROUP BY dat, district, id, station, type, lat, lon
            ORDER BY dat, district, total_rainfall DESC
        `;

        const result = await client.query(query, params);
        res.status(200).json({
            success: true,
            message: "Daily UP AWS data fetched successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("[UP AWS] fetchDailyData error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch daily data",
            error: error.message
        });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 2. HOURLY — sum per station per hour
//    POST /api/up-aws/hourly
//    Body: { date?, hour?(0-23), district? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchHourlyData = async (req, res) => {
    try {
        let { date, hour, district } = req.body;
        date = date || moment().format("YYYY-MM-DD");

        let params = [date];
        let hourFilter     = "";
        let districtFilter = "";

        if (hour !== undefined && hour !== null) {
            params.push(parseInt(hour));
            hourFilter = `AND EXTRACT(HOUR FROM time) = $${params.length}`;
        }
        if (district) {
            params.push(district);
            districtFilter = `AND district = $${params.length}`;
        }

        const query = `
            SELECT
                dat,
                EXTRACT(HOUR FROM time)::INT        AS hour,
                district,
                id,
                station,
                type,
                SUM(rainfall)                       AS total_rainfall,
                ROUND(AVG(temp)::NUMERIC, 1)        AS avg_temp,
                ROUND(AVG(rh)::NUMERIC, 1)          AS avg_rh,
                COUNT(*)                            AS readings_count
            FROM up_aws_observations
            WHERE dat = $1
              ${hourFilter}
              ${districtFilter}
            GROUP BY dat, hour, district, id, station, type
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
        res.status(500).json({
            success: false,
            message: "Failed to fetch hourly data",
            error: error.message
        });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 3. SINGLE 15-MIN SLOT — exact time reading per station
//    POST /api/up-aws/slot
//    Body: { date?, time, district? }   time: "06:45:00"
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchSlotData = async (req, res) => {
    try {
        let { date, time, district } = req.body;
        date = date || moment().format("YYYY-MM-DD");
        time = time || moment().startOf("hour").format("HH:mm:ss");

        let params = [date, time];
        let districtFilter = "";

        if (district) {
            params.push(district);
            districtFilter = `AND district = $${params.length}`;
        }

        const query = `
            SELECT
                dat,
                time,
                district,
                id,
                station,
                type,
                lat,
                lon,
                rainfall,
                temp,
                feel_like,
                rh,
                winds,
                windd,
                slp,
                mslp,
                updated_at
            FROM up_aws_observations
            WHERE dat = $1
              AND time = $2
              ${districtFilter}
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
        res.status(500).json({
            success: false,
            message: "Failed to fetch slot data",
            error: error.message
        });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 4. CUMULATIVE RUNNING TOTAL — day by day running sum per station
//    POST /api/up-aws/cumulative
//    Body: { startDate?, endDate?, district? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchCumulativeData = async (req, res) => {
    try {
        let { startDate, endDate, district } = req.body;
        ({ startDate, endDate } = resolveDates(startDate, endDate));

        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate must be <= endDate"
            });
        }

        let params = [startDate, endDate];
        let districtFilter = "";

        if (district) {
            params.push(district);
            districtFilter = `AND district = $${params.length}`;
        }

        const query = `
            SELECT
                dat,
                district,
                id,
                station,
                daily_rainfall,
                SUM(daily_rainfall) OVER (
                    PARTITION BY id
                    ORDER BY dat
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS cumulative_rainfall
            FROM (
                SELECT
                    dat,
                    district,
                    id,
                    station,
                    SUM(rainfall) AS daily_rainfall
                FROM up_aws_observations
                WHERE dat BETWEEN $1 AND $2
                  ${districtFilter}
                GROUP BY dat, district, id, station
            ) AS daily_totals
            ORDER BY id, dat
        `;

        const result = await client.query(query, params);
        res.status(200).json({
            success: true,
            message: "Cumulative UP AWS data fetched successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("[UP AWS] fetchCumulativeData error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cumulative data",
            error: error.message
        });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// 5. DISTRICT SUMMARY — aggregated at district level
//    POST /api/up-aws/district-summary
//    Body: { date? }
// ─────────────────────────────────────────────────────────────────────────────
exports.fetchDistrictSummary = async (req, res) => {
    try {
        const date = req.body.date || moment().format("YYYY-MM-DD");

        const query = `
            SELECT
                dat,
                district,
                COUNT(DISTINCT id)                  AS total_stations,
                ROUND(AVG(daily_rain)::NUMERIC, 2)  AS avg_rainfall,
                MAX(daily_rain)                     AS max_rainfall,
                MIN(daily_rain)                     AS min_rainfall,
                SUM(daily_rain)                     AS sum_rainfall,
                ROUND(AVG(avg_temp)::NUMERIC, 1)    AS avg_temp
            FROM (
                SELECT
                    dat,
                    district,
                    id,
                    SUM(rainfall)   AS daily_rain,
                    AVG(temp)       AS avg_temp
                FROM up_aws_observations
                WHERE dat = $1
                GROUP BY dat, district, id
            ) AS station_daily
            GROUP BY dat, district
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
        res.status(500).json({
            success: false,
            message: "Failed to fetch district summary",
            error: error.message
        });
    }
};