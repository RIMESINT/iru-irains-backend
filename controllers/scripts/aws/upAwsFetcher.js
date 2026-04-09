const axios = require("axios");
const client = require("../../../connection");
const moment = require("moment");

const UP_API_URL = "https://city.imd.gov.in/api/v1/getUPAWS";

const parseVal = (val) => {
    try {
        return val && val !== "NULL" && val !== "" ? parseFloat(val) : null;
    } catch {
        return null;
    }
};

const fetchAndStoreUP = async () => {
    const today = moment().format("YYYY-MM-DD");

    const response = await axios.get(UP_API_URL, { timeout: 15000 });
    const records = response.data?.data || [];

    let inserted = 0, skipped = 0;

    for (const s of records) {

        // Skip stale / offline stations
        if (s.dat !== today) { skipped++; continue; }

        await client.query(`
            INSERT INTO up_aws_observations (
                id, station, type,
                state, district, tehsil, block,
                lat, lon, alt,
                dat, time, updated_at,
                rainfall, temp, feel_like, dewpoint, rh,
                winds, windd, slp, mslp
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,
                $8,$9,$10,
                $11,$12,$13,
                $14,$15,$16,$17,$18,
                $19,$20,$21,$22
            )
            ON CONFLICT (id, dat, time) DO NOTHING
        `, [
            s.id,           s.station,          s.type,
            s.state,        s.district,         s.tehsil,       s.block,
            parseVal(s.lat), parseVal(s.lon),   parseVal(s.alt),
            s.dat,          s.time,             s.updated_at,
            parseVal(s.rainfall),   parseVal(s.temp),
            parseVal(s.feel_like),  parseVal(s.dewpoint),   parseVal(s.rh),
            parseVal(s.winds),      parseVal(s.windd),
            parseVal(s.slp),        parseVal(s.mslp)
        ]);

        inserted++;
    }

    console.log(`[UP AWS] ${moment().format("YYYY-MM-DD HH:mm:ss")} | Inserted: ${inserted} | Skipped (stale): ${skipped}`);
};

module.exports = { fetchAndStoreUP };