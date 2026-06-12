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

module.exports = { getExclusions };
