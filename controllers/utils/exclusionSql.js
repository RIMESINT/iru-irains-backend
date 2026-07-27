const client = require("../../connection");

// Resolve which station_ids / district_codes should be excluded for a given
// request date range. A calculation_exclusions row applies if its
// [from_date, to_date] window overlaps [startDate, endDate]. Block-level
// exclusions are expanded to the stations within that block.
const getExclusions = async (startDate, endDate, stationDetailsTable = 'station_details') => {
    const result = await client.query(
        `SELECT entity_type, entity_code
         FROM public.calculation_exclusions
         WHERE from_date <= $2 AND to_date >= $1`,
        [startDate, endDate]
    );

    const stationIds = new Set();
    const districtIds = [];
    const blockCodes = [];

    for (const row of result.rows) {
        if (row.entity_type === 'station') stationIds.add(row.entity_code);
        else if (row.entity_type === 'district') districtIds.push(row.entity_code);
        else if (row.entity_type === 'block') blockCodes.push(row.entity_code);
    }

    if (blockCodes.length) {
        const blockResult = await client.query(
            `SELECT station_code FROM public.${stationDetailsTable} WHERE block_code = ANY($1::bigint[])`,
            [blockCodes]
        );
        blockResult.rows.forEach(r => stationIds.add(r.station_code));
    }

    return {
        stationIds: [...stationIds],
        districtIds,
    };
};

// Row-level exclusion windows for a data source. `prefix` is '' for IMD
// (entity types 'station'/'district'/'block') or 'aws_' for State Govt AWS
// ('aws_station'/'aws_district'/'aws_block') — see VALID_TYPES in
// controllers/scripts/admin-panel/calculationExclusion.js.
// A window only hides the specific dates it covers, not the whole station:
// e.g. a 1-25 exclusion queried against a 1-26 selection still returns day 26.
const getExclusionWindows = async (startDate, endDate, prefix = '') => {
    const types = [`${prefix}station`, `${prefix}district`, `${prefix}block`];
    const result = await client.query(
        `SELECT entity_type, entity_code,
                TO_CHAR(from_date, 'YYYY-MM-DD') AS from_date,
                TO_CHAR(to_date, 'YYYY-MM-DD') AS to_date
         FROM public.calculation_exclusions
         WHERE entity_type = ANY($1) AND from_date <= $3 AND to_date >= $2`,
        [types, startDate, endDate]
    );

    const byStation = new Map();
    const byDistrict = new Map();
    const byBlock = new Map();

    const addTo = (map, code, window) => {
        const key = String(code);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(window);
    };

    for (const row of result.rows) {
        const window = { from: row.from_date, to: row.to_date };
        if (row.entity_type === `${prefix}station`) addTo(byStation, row.entity_code, window);
        else if (row.entity_type === `${prefix}district`) addTo(byDistrict, row.entity_code, window);
        else if (row.entity_type === `${prefix}block`) addTo(byBlock, row.entity_code, window);
    }

    return { byStation, byDistrict, byBlock };
};

// Mutates rows in place: any row whose collection_date falls inside a
// matching station/district/block window gets its data flagged as the
// app-wide "no data" sentinel (-999.9), same as genuinely missing data.
const applyExclusions = (rows, { byStation, byDistrict, byBlock }) => {
    const inWindow = (windows, date) =>
        windows && windows.some(w => date >= w.from && date <= w.to);

    for (const row of rows) {
        const date = row.collection_date;
        if (
            inWindow(byStation.get(String(row.station_id)), date) ||
            inWindow(byDistrict.get(String(row.district_code)), date) ||
            inWindow(byBlock.get(String(row.block_code)), date)
        ) {
            row.data = '-999.9';
        }
    }
    return rows;
};

module.exports = { getExclusions, getExclusionWindows, applyExclusions };
