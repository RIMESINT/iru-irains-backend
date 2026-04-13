const axios  = require("axios");
const client = require("../../../connection");
const moment = require("moment");

const parseVal = (val) => {
    try {
        return val && val !== "NULL" && val !== "" ? parseFloat(val) : null;
    } catch {
        return null;
    }
};

// ─── UP AWS ───────────────────────────────────────────────────────────────────
const fetchAndStoreUP = async () => {
    const today    = moment().format("YYYY-MM-DD");
    const response = await axios.get("https://city.imd.gov.in/api/v1/getUPAWS", { timeout: 15000 });
    const records  = response.data?.data || [];
    let inserted = 0, skipped = 0;

    for (const s of records) {
        if (s.dat !== today) { skipped++; continue; }
        await client.query(`
            INSERT INTO up_aws_observations (
                id, station, type, state, district, tehsil, block,
                lat, lon, alt, dat, time, updated_at,
                rainfall, temp, feel_like, dewpoint, rh, winds, windd, slp, mslp
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
            ) ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.id, s.station, s.type, s.state, s.district, s.tehsil, s.block,
            parseVal(s.lat), parseVal(s.lon), parseVal(s.alt),
            s.dat, s.time, s.updated_at,
            parseVal(s.rainfall), parseVal(s.temp), parseVal(s.feel_like),
            parseVal(s.dewpoint), parseVal(s.rh), parseVal(s.winds),
            parseVal(s.windd), parseVal(s.slp), parseVal(s.mslp)
        ]);
        inserted++;
    }
    console.log(`[UP AWS]     ${moment().format("YYYY-MM-DD HH:mm:ss")} | Inserted: ${inserted} | Skipped: ${skipped}`);
};


// ─── NHP AWS ──────────────────────────────────────────────────────────────────
const fetchAndStoreNHP = async () => {
    const today    = moment().format("YYYY-MM-DD");
    const response = await axios.get("https://city.imd.gov.in/api/v1/getNHPAWS", { timeout: 15000 });
    const records  = response.data?.data || [];
    let inserted = 0, skipped = 0;

    for (const s of records) {
        if (s.dat !== today) { skipped++; continue; }
        await client.query(`
            INSERT INTO observations_aws_nhp (
                id, station, district, state,
                dat, time, updated_at,
                temp, feel_like, rh, slp,
                winds, windd, rainfall_daily, rainfall
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,
                $8,$9,$10,$11,$12,$13,$14,$15
            ) ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.id, s.stationName, s.districtName, s.stateName,
            s.dat, s.time, s.last_updated,
            parseVal(s.temperature_insat),
            parseVal(s.feel_like_insat),
            parseVal(s.humidity_insat),
            parseVal(s.pressure_insat),
            parseVal(s.wind_speed_insat),
            parseVal(s.wind_direction_insat),
            parseVal(s.rain_accumulation_daily_insat),
            parseVal(s.rain_by_telemetry_insat)
        ]);
        inserted++;
    }
    console.log(`[NHP AWS]    ${moment().format("YYYY-MM-DD HH:mm:ss")} | Inserted: ${inserted} | Skipped: ${skipped}`);
};


// ─── ZOMATO AWS ───────────────────────────────────────────────────────────────
const fetchAndStoreZomato = async () => {
    const today    = moment().format("YYYY-MM-DD");
    const response = await axios.get("https://city.imd.gov.in/api/v1/getZomatoAWS", { timeout: 15000 });
    const records  = response.data?.data || [];
    let inserted = 0, skipped = 0;

    for (const s of records) {
        if (s.DATE !== today) { skipped++; continue; }
        await client.query(`
            INSERT INTO observations_aws_zomato (
                id, station, city, type,
                lat, lon,
                dat, time,
                temp, feel_like, rh,
                winds, windd, rainfall
            ) VALUES (
                $1,$2,$3,$4,$5,$6,
                $7,$8,
                $9,$10,$11,
                $12,$13,$14
            ) ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.ID,
            s.STATION,
            s.CITY,
            s.STATION_TYPE,
            parseVal(s.Latitude),
            parseVal(s.Longitude),
            s.DATE,
            s.TIME,
            parseVal(s.CURR_TEMP),
            parseVal(s["Feel Like"]),
            parseVal(s.RH),
            parseVal(s.WIND_SPEED),
            parseVal(s.WIND_DIRECTION),
            parseVal(s.RAINFALL)
        ]);
        inserted++;
    }
    console.log(`[ZOMATO AWS] ${moment().format("YYYY-MM-DD HH:mm:ss")} | Inserted: ${inserted} | Skipped: ${skipped}`);
};


// ─── MEGHALAYA AWS ────────────────────────────────────────────────────────────
const fetchAndStoreMeghalaya = async () => {
    const today    = moment().format("YYYY-MM-DD");
    const response = await axios.get("https://city.imd.gov.in/api/v1/getMeghalayaAWS", { timeout: 15000 });
    const records  = response.data?.data || [];
    let inserted = 0, skipped = 0;

    for (const s of records) {
        if (s.dat !== today) { skipped++; continue; }
        await client.query(`
            INSERT INTO observations_aws_meghalaya (
                id, station, facility, station_type,
                state, district, block, alt,
                dat, time, updated_at,
                rainfall, rainfall_avg, temp, rh, slp,
                winds, windd,
                soil_temp, irradiance, water_content, conductivity,
                battery, panel_temp
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,
                $9,$10,$11,
                $12,$13,$14,$15,$16,
                $17,$18,
                $19,$20,$21,$22,
                $23,$24
            ) ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.id,
            s.station_name,
            s.facility,
            s.station_type,
            s.state,
            s.district,
            s.block,
            parseVal(s.altitude),
            s.dat,
            s.time,
            s.updated_at,
            parseVal(s.total_rainfall),
            parseVal(s.average_rainfall),
            parseVal(s.average_air_temperature),
            parseVal(s.relative_humidity),
            parseVal(s.average_barometric_pressure),
            parseVal(s.average_wind_speed),
            parseVal(s.wind_direction),
            parseVal(s.average_soil_temperature),
            parseVal(s.global_horizontal_irradiance),
            parseVal(s.average_volumetric_water_content),
            parseVal(s.average_electrical_conductivity),
            parseVal(s.average_battery_voltage),
            parseVal(s.average_panel_temperature)
        ]);
        inserted++;
    }
    console.log(`[MEG AWS]    ${moment().format("YYYY-MM-DD HH:mm:ss")} | Inserted: ${inserted} | Skipped: ${skipped}`);
};

module.exports = { fetchAndStoreUP, fetchAndStoreNHP, fetchAndStoreZomato, fetchAndStoreMeghalaya };

