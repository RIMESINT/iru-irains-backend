const axios  = require("axios");
const client = require("../../../connection");
const moment = require("moment-timezone");

const IST = "Asia/Kolkata";

const parseVal = (val) => {
    try {
        return val && val !== "NULL" && val !== "" ? parseFloat(val) : null;
    } catch {
        return null;
    }
};


// ─── UP AWS ───────────────────────────────────────────────────────────────────
const fetchAndStoreUP = async () => {
    const today    = moment().tz(IST).format("YYYY-MM-DD");
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
    console.log(`[UP AWS]       ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Inserted: ${inserted} | Skipped: ${skipped}`);
};


// ─── NHP AWS ──────────────────────────────────────────────────────────────────
const fetchAndStoreNHP = async () => {
    const today    = moment().tz(IST).format("YYYY-MM-DD");
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
    console.log(`[NHP AWS]      ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Inserted: ${inserted} | Skipped: ${skipped}`);
};


// ─── ZOMATO AWS ───────────────────────────────────────────────────────────────
const fetchAndStoreZomato = async () => {
    const today    = moment().tz(IST).format("YYYY-MM-DD");
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
            s.ID, s.STATION, s.CITY, s.STATION_TYPE,
            parseVal(s.Latitude), parseVal(s.Longitude),
            s.DATE, s.TIME,
            parseVal(s.CURR_TEMP), parseVal(s["Feel Like"]),
            parseVal(s.RH), parseVal(s.WIND_SPEED),
            parseVal(s.WIND_DIRECTION), parseVal(s.RAINFALL)
        ]);
        inserted++;
    }
    console.log(`[ZOMATO AWS]   ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Inserted: ${inserted} | Skipped: ${skipped}`);
};


// ─── MEGHALAYA AWS ────────────────────────────────────────────────────────────
const fetchAndStoreMeghalaya = async () => {
    const today    = moment().tz(IST).format("YYYY-MM-DD");
    const response = await axios.get("https://city.imd.gov.in/api/v1/getMeghalayaAWS", { timeout: 15000 });
    const records  = response.data?.data || [];
    let inserted = 0, skipped = 0;

    for (const s of records) {
        if (s.dat !== today) { skipped++; continue; }
        await client.query(`
            INSERT INTO observations_aws_meghalaya (
                id, station, facility, station_type,
                state, district, block, lat, lon, alt,
                dat, time, updated_at,
                rainfall, rainfall_avg, temp, rh, slp,
                winds, windd,
                soil_temp, irradiance, water_content, conductivity,
                battery, panel_temp
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,
                $14,$15,$16,$17,$18,
                $19,$20,
                $21,$22,$23,$24,
                $25,$26
            ) ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.id, s.station_name, s.facility, s.station_type,
            s.state, s.district, s.block,
            parseVal(s.latitude), parseVal(s.longitude), parseVal(s.altitude),
            s.dat, s.time, s.updated_at,
            parseVal(s.total_rainfall), parseVal(s.average_rainfall),
            parseVal(s.average_air_temperature), parseVal(s.relative_humidity),
            parseVal(s.average_barometric_pressure),
            parseVal(s.average_wind_speed), parseVal(s.wind_direction),
            parseVal(s.average_soil_temperature),
            parseVal(s.global_horizontal_irradiance),
            parseVal(s.average_volumetric_water_content),
            parseVal(s.average_electrical_conductivity),
            parseVal(s.average_battery_voltage),
            parseVal(s.average_panel_temperature)
        ]);
        inserted++;
    }
    console.log(`[MEG AWS]      ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Inserted: ${inserted} | Skipped: ${skipped}`);
};


// ─── MIZORAM AWS ──────────────────────────────────────────────────────────────
const fetchAndStoreMizoram = async () => {
    const today    = moment().tz(IST).format("YYYY-MM-DD");
    const response = await axios.get("https://city.imd.gov.in/api/v1/getMizoramAWS", { timeout: 15000 });
    const records  = response.data?.data || [];
    let inserted = 0, skipped = 0;

    for (const s of records) {
        if (s.dat !== today) { skipped++; continue; }
        await client.query(`
            INSERT INTO observations_aws_mizoram (
                id, station, station_type, state, district,
                lat, lon,
                dat, time, updated_at,
                rainfall, rainfall_hourly,
                temp, rh, slp,
                winds, windd,
                soil_moisture, soil_temp, solar_radiation
            ) VALUES (
                $1,$2,$3,$4,$5,
                $6,$7,
                $8,$9,$10,
                $11,$12,
                $13,$14,$15,
                $16,$17,
                $18,$19,$20
            ) ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.id, s.station_name, s.station_type, s.state, s.district,
            parseVal(s.latitude), parseVal(s.longitude),
            s.dat, s.time, s.updated_at,
            parseVal(s.raindaily), parseVal(s.rainhourly),
            parseVal(s.temp), parseVal(s.relativehumidity),
            parseVal(s.absolutepressure),
            parseVal(s.windspeed), parseVal(s.winddirection),
            parseVal(s.soilmoisture), parseVal(s.soiltemperature),
            parseVal(s.solarradiation)
        ]);
        inserted++;
    }
    console.log(`[MIZ AWS]      ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Inserted: ${inserted} | Skipped: ${skipped}`);
};


// ─── TAMILNADU AWS ────────────────────────────────────────────────────────────
const fetchAndStoreTamilnadu = async () => {
    const today    = moment().tz(IST).format("YYYY-MM-DD");
    const response = await axios.get("https://city.imd.gov.in/api/v1/getTamilnaduAWS", { timeout: 15000 });
    const records  = response.data?.data || [];
    let inserted = 0, skipped = 0;

    for (const s of records) {
        if (s.dat !== today) { skipped++; continue; }
        await client.query(`
            INSERT INTO observations_aws_tamilnadu (
                id, station, type, state, district, tehsil, firka, block,
                lat, lon, dat, time, updated_at,
                rainfall, temp, feel_like, rh, winds, windd,
                slp, solar_radiation, soil_temp, soil_moist
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,
                $9,$10,$11,$12,$13,
                $14,$15,$16,$17,$18,$19,
                $20,$21,$22,$23
            ) ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.id, s.station, s.type, s.state, s.district,
            s.tehsil, s.firka, s.block,
            parseVal(s.lat), parseVal(s.lon),
            s.dat, s.time, s.updated_at,
            parseVal(s.rainfall), parseVal(s.temp), parseVal(s.feel_like),
            parseVal(s.rh), parseVal(s.winds), parseVal(s.windd),
            parseVal(s.slp), parseVal(s.solar_radiation),
            parseVal(s.soil_temp), parseVal(s.soil_moist)
        ]);
        inserted++;
    }
    console.log(`[TN AWS]       ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Inserted: ${inserted} | Skipped: ${skipped}`);
};

// ─── UTTARAKHAND AWS ──────────────────────────────────────────────────────────
const fetchAndStoreUttarakhand = async () => {
    const today    = moment().tz(IST).format("YYYY-MM-DD");
    const response = await axios.get("https://city.imd.gov.in/api/v1/getUttrakhandAWS", { timeout: 15000 });
    const records  = response.data?.data || [];
    let inserted = 0, skipped = 0;

    for (const s of records) {
        if (s.dat !== today) { skipped++; continue; }
        await client.query(`
            INSERT INTO observations_aws_uttarakhand (
                id, station, type, state, district, tehsil, block,
                lat, lon, alt, dat, time, updated_at,
                rainfall, temp, feel_like, dewpoint, rh, winds, windd, slp, mslp
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
            ) ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.id,
            (!s.station  || s.station  === "NULL") ? null : s.station,
            s.type,
            s.state,
            (!s.district || s.district === "NULL") ? null : s.district,
            (!s.tehsil   || s.tehsil   === "NULL") ? null : s.tehsil,
            (!s.block    || s.block    === "" || s.block === "NULL") ? null : s.block,
            parseVal(s.lat), parseVal(s.lon), parseVal(s.alt),
            s.dat, s.time, s.updated_at,
            parseVal(s.rainfall), parseVal(s.temp), parseVal(s.feel_like),
            parseVal(s.dewpoint), parseVal(s.rh), parseVal(s.winds),
            parseVal(s.windd), parseVal(s.slp), parseVal(s.mslp)
        ]);
        inserted++;
    }
    console.log(`[UK AWS]       ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Inserted: ${inserted} | Skipped: ${skipped}`);
};



// ─── TELANGANA AWS ────────────────────────────────────────────────────────────
const fetchAndStoreTelangana = async () => {
    const today    = moment().tz(IST).format("YYYY-MM-DD");
    const response = await axios.get("https://city.imd.gov.in/api/v1/getTelanganaAWS", { timeout: 15000 });
    const records  = response.data?.data || [];
    let inserted = 0, skipped = 0;

    for (const s of records) {
        if (s.dat !== today) { skipped++; continue; }
        await client.query(`
            INSERT INTO observations_aws_telangana (
                id, station, type, state, district, tehsil, block,
                lat, lon, alt, dat, time, updated_at,
                rainfall, temp, feel_like, dewpoint, rh, winds, windd, slp, mslp
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
            ) ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.id, s.station, s.type, s.state, s.district,
            s.tehsil, s.block,
            parseVal(s.lat), parseVal(s.lon), parseVal(s.alt),
            s.dat, s.time, s.updated_at,
            parseVal(s.rainfall), parseVal(s.temp), parseVal(s.feel_like),
            parseVal(s.dewpoint), parseVal(s.rh), parseVal(s.winds),
            parseVal(s.windd), parseVal(s.slp), parseVal(s.mslp)
        ]);
        inserted++;
    }
    console.log(`[TG AWS]       ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Inserted: ${inserted} | Skipped: ${skipped}`);
};

// Karnataka rainfall comes as "00:00" format — special parser
const parseRainfallKA = (val) => {
    if (!val || val === "" || val === "NULL") return null;
    // "00:00" → 0, "12:30" → treat as bad data → null, normal "5.2" → 5.2
    if (typeof val === "string" && val.includes(":")) {
        const parts = val.split(":");
        // Only treat as mm if both parts are numeric and look like rainfall
        const num = parseFloat(parts[0]);
        return isNaN(num) ? null : num;
    }
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
};

// ─── KARNATAKA AWS ────────────────────────────────────────────────────────────
const fetchAndStoreKarnataka = async () => {
    const today    = moment().tz(IST).format("YYYY-MM-DD");
    const response = await axios.get("https://city.imd.gov.in/api/v1/getKarnatakaAWS", { timeout: 15000 });
    const records  = response.data?.data || [];
    let inserted = 0, skipped = 0;

    for (const s of records) {
        if (s.dat !== today) { skipped++; continue; }
        await client.query(`
            INSERT INTO observations_aws_karnataka (
                id, station, type, state, district, tehsil, block,
                lat, lon, alt, dat, time, updated_at,
                rainfall, temp, feel_like, dewpoint, rh, winds, windd, slp, mslp
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
            ) ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.id,
            (!s.station  || s.station  === "NULL") ? null : s.station,
            s.type,
            s.state,
            (!s.district || s.district === "NULL") ? null : s.district,
            (!s.tehsil   || s.tehsil   === "NULL") ? null : s.tehsil,
            (!s.block    || s.block    === "" || s.block === "NULL") ? null : s.block,
            parseVal(s.lat), parseVal(s.lon), parseVal(s.alt),
            s.dat, s.time, s.updated_at,
            parseRainfallKA(s.rainfall),          // ✅ special parser
            parseVal(s.temp),   parseVal(s.feel_like),
            parseVal(s.dewpoint), parseVal(s.rh),
            parseVal(s.winds),  parseVal(s.windd),
            parseVal(s.slp),    parseVal(s.mslp)
        ]);
        inserted++;
    }
    console.log(`[KA AWS]       ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Inserted: ${inserted} | Skipped: ${skipped}`);
};


// ─── IITM MUMBAI ARG ──────────────────────────────────────────────────────────
const fetchAndStoreIITMMumbai = async () => {
    const today    = moment().tz(IST).format("YYYY-MM-DD");
    const response = await axios.get("https://city.imd.gov.in/api/v1/getIITMRainfallData", { timeout: 15000 });
    const records  = response.data?.data || [];
    let inserted = 0, skipped = 0;

    for (const s of records) {
        if (s.dat !== today) { skipped++; continue; }
        await client.query(`
            INSERT INTO observations_iitm_mumbai (
                id, station, type, state, district,
                lat, lon, dat, time, updated_at, rainfall
            ) VALUES (
                $1,$2,$3,$4,$5,
                $6,$7,$8,$9,$10,$11
            ) ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.id, s.station, s.type, s.state, s.district,
            parseVal(s.lat), parseVal(s.lon),
            s.dat, s.time, s.updated_at,
            parseVal(s.rainfall)
        ]);
        inserted++;
    }
    console.log(`[IITM MUM]     ${moment().tz(IST).format("YYYY-MM-DD HH:mm:ss")} IST | Inserted: ${inserted} | Skipped: ${skipped}`);
};

module.exports = {
    fetchAndStoreUP, fetchAndStoreNHP, fetchAndStoreZomato,
    fetchAndStoreMeghalaya, fetchAndStoreMizoram,
    fetchAndStoreTamilnadu, fetchAndStoreUttarakhand,
    fetchAndStoreTelangana, fetchAndStoreKarnataka,
    fetchAndStoreIITMMumbai
};