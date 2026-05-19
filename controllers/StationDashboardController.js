const client = require('../connection');

// ─── Metrics ────────────────────────────────────────────────────────────────

exports.getMetrics = async (req, res) => {
    try {
        const totalQ = await client.query(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN flag = 1 THEN 1 ELSE 0 END) AS active,
                SUM(CASE WHEN flag = 0 THEN 1 ELSE 0 END) AS inactive
            FROM station_details
        `);
        const typeQ = await client.query(`
            SELECT station_type, COUNT(*) AS count
            FROM station_details
            WHERE flag = 1
            GROUP BY station_type
            ORDER BY count DESC
        `);

        const { total, active, inactive } = totalQ.rows[0];
        const by_type = {};
        typeQ.rows.forEach(r => { by_type[r.station_type] = parseInt(r.count); });

        return res.status(200).json({
            success: true,
            data: {
                total: parseInt(total),
                active: parseInt(active),
                inactive: parseInt(inactive),
                operational_rate: total > 0 ? ((active / total) * 100).toFixed(1) : '0.0',
                by_type
            }
        });
    } catch (error) {
        console.error('getMetrics error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Distribution ────────────────────────────────────────────────────────────

exports.getDistribution = async (req, res) => {
    const { level = 'state' } = req.query;

    const levelMap = {
        region: { col: 'ndd.region_name', join: true },
        state:  { col: 'ndd.state_name',  join: true },
        district: { col: 'ndd.district_name', join: true },
        block: { col: 'sd.block_name', join: false },
        type:  { col: 'sd.station_type', join: false },
    };

    const cfg = levelMap[level] || levelMap['state'];

    try {
        let query;
        if (cfg.join) {
            query = `
                SELECT ${cfg.col} AS label, COUNT(*) AS count
                FROM station_details sd
                JOIN normal_district_details ndd ON ndd.district_code = sd.district_code
                WHERE sd.flag = 1 AND ${cfg.col} IS NOT NULL
                GROUP BY ${cfg.col}
                ORDER BY count DESC
                LIMIT 30
            `;
        } else {
            query = `
                SELECT ${cfg.col} AS label, COUNT(*) AS count
                FROM station_details sd
                WHERE sd.flag = 1 AND ${cfg.col} IS NOT NULL
                GROUP BY ${cfg.col}
                ORDER BY count DESC
                LIMIT 30
            `;
        }
        const result = await client.query(query);
        return res.status(200).json({
            success: true,
            data: {
                labels: result.rows.map(r => r.label),
                counts: result.rows.map(r => parseInt(r.count))
            }
        });
    } catch (error) {
        console.error('getDistribution error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Recent Changes ──────────────────────────────────────────────────────────

exports.getRecentChanges = async (req, res) => {
    const days = parseInt(req.query.days) || 7;
    try {
        const result = await client.query(`
            SELECT station_code, station_name, flag, updated_at, created_at
            FROM station_details
            WHERE updated_at >= NOW() - INTERVAL '${days} days'
            ORDER BY updated_at DESC
            LIMIT 100
        `);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('getRecentChanges error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── History (inactive stations) ─────────────────────────────────────────────

exports.getHistory = async (req, res) => {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    try {
        const countResult = await client.query(`SELECT COUNT(*) AS total FROM station_details WHERE flag = 0`);
        const total = parseInt(countResult.rows[0].total);

        const result = await client.query(`
            SELECT sd.station_code, sd.station_name, sd.station_type,
                   sd.block_name, sd.block_code,
                   sd.centre_type || ' ' || sd.centre_name AS rmc_mc,
                   sd.latitude, sd.longitude,
                   ndd.district_name, ndd.state_name, ndd.region_name,
                   sd.created_at, sd.updated_at
            FROM station_details sd
            LEFT JOIN normal_district_details ndd ON ndd.district_code = sd.district_code
            WHERE sd.flag = 0
            ORDER BY sd.updated_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        return res.status(200).json({
            success: true,
            data: result.rows,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('getHistory error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Timeline (all versions of a station by name) ────────────────────────────

exports.getTimeline = async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, message: 'name is required' });

    try {
        const result = await client.query(`
            SELECT sd.station_code, sd.station_name, sd.station_type, sd.flag,
                   sd.block_name, sd.block_code,
                   sd.centre_type || ' ' || sd.centre_name AS rmc_mc,
                   sd.latitude, sd.longitude,
                   ndd.district_name, ndd.state_name, ndd.region_name,
                   sd.created_at, sd.updated_at
            FROM station_details sd
            LEFT JOIN normal_district_details ndd ON ndd.district_code = sd.district_code
            WHERE LOWER(sd.station_name) = LOWER($1)
            ORDER BY sd.created_at ASC
        `, [name]);

        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('getTimeline error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Generate Station Code ────────────────────────────────────────────────────

exports.generateCode = async (req, res) => {
    const { block_code } = req.body;
    if (!block_code) return res.status(400).json({ success: false, message: 'block_code is required' });

    const blockStr = block_code.toString();
    if (blockStr.length !== 10) return res.status(400).json({ success: false, message: 'block_code must be 10 digits' });

    try {
        const result = await client.query(`
            SELECT MAX(station_code::bigint) AS max_code
            FROM station_details
            WHERE station_code::text LIKE $1
              AND LENGTH(station_code::text) = 13
        `, [blockStr + '%']);

        let new_code;
        if (result.rows[0].max_code) {
            new_code = (BigInt(result.rows[0].max_code) + 1n).toString();
        } else {
            new_code = blockStr + '001';
        }

        return res.status(200).json({ success: true, data: { station_code: new_code } });
    } catch (error) {
        console.error('generateCode error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Move Station ─────────────────────────────────────────────────────────────

exports.moveStation = async (req, res) => {
    const {
        station_code,
        new_block_code, new_block_name,
        new_district_code
    } = req.body;

    if (!station_code || !new_block_code || !new_district_code) {
        return res.status(400).json({ success: false, message: 'station_code, new_block_code, new_district_code are required' });
    }

    try {
        // 1. Fetch old record
        const oldResult = await client.query(`SELECT * FROM station_details WHERE station_code = $1 AND flag = 1`, [station_code]);
        if (oldResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Active station not found' });
        }
        const old = oldResult.rows[0];

        // 2. Deactivate old station
        await client.query(`UPDATE station_details SET flag = 0, updated_at = NOW() WHERE station_code = $1`, [station_code]);

        // 3. Generate new station code at new block
        const blockStr = new_block_code.toString();
        const codeResult = await client.query(`
            SELECT MAX(station_code::bigint) AS max_code
            FROM station_details
            WHERE station_code::text LIKE $1 AND LENGTH(station_code::text) = 13
        `, [blockStr + '%']);

        let new_station_code;
        if (codeResult.rows[0].max_code) {
            new_station_code = (BigInt(codeResult.rows[0].max_code) + 1n).toString();
        } else {
            new_station_code = blockStr + '001';
        }

        // 4. Insert new station at new block
        await client.query(`
            INSERT INTO station_details (
                station_code, station_name, station_type,
                centre_type, centre_name, is_new_station,
                latitude, longitude, activationdate,
                block_code, block_name, district_code, flag
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,1)
        `, [
            new_station_code, old.station_name, old.station_type,
            old.centre_type, old.centre_name, old.is_new_station,
            old.latitude, old.longitude, old.activationdate,
            new_block_code, new_block_name || null, new_district_code
        ]);

        return res.status(200).json({
            success: true,
            message: 'Station moved successfully',
            data: { old_station_code: station_code, new_station_code }
        });
    } catch (error) {
        console.error('moveStation error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Permanent Delete ─────────────────────────────────────────────────────────

exports.permanentDelete = async (req, res) => {
    const { station_codes } = req.body;
    if (!station_codes || !Array.isArray(station_codes) || station_codes.length === 0) {
        return res.status(400).json({ success: false, message: 'station_codes array is required' });
    }

    try {
        const result = await client.query(`
            DELETE FROM station_details
            WHERE station_code = ANY($1::bigint[]) AND flag = 0
        `, [station_codes]);

        return res.status(200).json({
            success: true,
            message: `Permanently deleted ${result.rowCount} station(s)`,
            data: { deleted_count: result.rowCount }
        });
    } catch (error) {
        console.error('permanentDelete error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Search Stations ──────────────────────────────────────────────────────────

exports.searchStations = async (req, res) => {
    const {
        q = '', mode = 'contains', case_sensitive = false,
        status = 'active', station_type, region, state,
        page = 1, limit = 50
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = [];

    // flag filter
    if (status === 'active')   conditions.push(`sd.flag = 1`);
    if (status === 'inactive') conditions.push(`sd.flag = 0`);

    // search term
    if (q) {
        const term = case_sensitive === 'true' ? q : q.toLowerCase();
        const col  = case_sensitive === 'true' ? 'sd.station_name' : 'LOWER(sd.station_name)';
        params.push(term);
        if (mode === 'contains')    conditions.push(`${col} LIKE '%' || $${params.length} || '%'`);
        if (mode === 'starts_with') conditions.push(`${col} LIKE $${params.length} || '%'`);
        if (mode === 'ends_with')   conditions.push(`${col} LIKE '%' || $${params.length}`);
        if (mode === 'exact')       conditions.push(`${col} = $${params.length}`);
    }

    if (station_type) { params.push(station_type); conditions.push(`sd.station_type = $${params.length}`); }
    if (region)       { params.push(region);        conditions.push(`ndd.region_name = $${params.length}`); }
    if (state)        { params.push(state);          conditions.push(`ndd.state_name = $${params.length}`); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    try {
        const countResult = await client.query(
            `SELECT COUNT(*) AS total FROM station_details sd LEFT JOIN normal_district_details ndd ON ndd.district_code = sd.district_code ${where}`,
            params
        );
        const total = parseInt(countResult.rows[0].total);

        params.push(parseInt(limit), offset);
        const result = await client.query(`
            SELECT sd.station_code, sd.station_name, sd.station_type, sd.flag,
                   sd.block_name, sd.block_code, sd.latitude, sd.longitude,
                   sd.centre_type || ' ' || sd.centre_name AS rmc_mc,
                   ndd.district_name, ndd.state_name, ndd.region_name,
                   sd.created_at, sd.updated_at
            FROM station_details sd
            LEFT JOIN normal_district_details ndd ON ndd.district_code = sd.district_code
            ${where}
            ORDER BY sd.station_code
            LIMIT $${params.length - 1} OFFSET $${params.length}
        `, params);

        return res.status(200).json({
            success: true,
            data: result.rows,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('searchStations error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get full geography hierarchy from normal_district_details ───────────────

exports.getGeography = async (req, res) => {
    try {
        const result = await client.query(`
            SELECT DISTINCT
                region_name, region_code,
                subdiv_name, subdiv_code,
                state_name, new_state_code AS state_code,
                district_name, district_code
            FROM normal_district_details
            ORDER BY region_name, subdiv_name, state_name, district_name
        `);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('getGeography error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get Blocks by district_code (for cascade dropdown) ──────────────────────

exports.getBlocks = async (req, res) => {
    const { district_code } = req.query;
    if (!district_code) return res.status(400).json({ success: false, message: 'district_code is required' });

    try {
        const result = await client.query(`
            SELECT DISTINCT block_code, block_name
            FROM station_details
            WHERE district_code = $1 AND block_code IS NOT NULL
            ORDER BY block_name
        `, [district_code]);

        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('getBlocks error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get RMC/MC dropdown options ─────────────────────────────────────────────

exports.getRmcMcOptions = async (req, res) => {
    try {
        const result = await client.query(`
            SELECT DISTINCT centre_type || ' ' || centre_name AS rmc_mc
            FROM station_details
            WHERE flag = 1 AND centre_type IS NOT NULL AND centre_name IS NOT NULL
            ORDER BY rmc_mc
        `);
        return res.status(200).json({ success: true, data: result.rows.map(r => r.rmc_mc) });
    } catch (error) {
        console.error('getRmcMcOptions error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get station by code (for Edit/Move pre-fill) ────────────────────────────

exports.getStationByCode = async (req, res) => {
    const { station_code } = req.query;
    if (!station_code) return res.status(400).json({ success: false, message: 'station_code is required' });

    try {
        const result = await client.query(`
            SELECT sd.station_code, sd.station_name, sd.station_type, sd.flag,
                   sd.block_name, sd.block_code, sd.latitude, sd.longitude,
                   sd.is_new_station, sd.activationdate,
                   sd.centre_type || ' ' || sd.centre_name AS rmc_mc,
                   sd.centre_type, sd.centre_name,
                   ndd.district_code, ndd.district_name,
                   ndd.state_code, ndd.state_name,
                   ndd.subdiv_code, ndd.subdiv_name,
                   ndd.region_code, ndd.region_name,
                   sd.created_at, sd.updated_at
            FROM station_details sd
            LEFT JOIN normal_district_details ndd ON ndd.district_code = sd.district_code
            WHERE sd.station_code = $1
        `, [station_code]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }
        return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('getStationByCode error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── List active stations (for Edit/Delete/Move search) ──────────────────────

exports.listActiveStations = async (req, res) => {
    const { q = '', page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereExtra = '';

    if (q) {
        params.push(`%${q.toLowerCase()}%`);
        whereExtra = `AND (LOWER(sd.station_name) LIKE $1 OR sd.station_code::text LIKE $1)`;
    }

    try {
        const countQ = await client.query(
            `SELECT COUNT(*) AS total FROM station_details sd WHERE sd.flag = 1 ${whereExtra}`,
            params
        );
        const total = parseInt(countQ.rows[0].total);

        params.push(parseInt(limit), offset);
        const result = await client.query(`
            SELECT sd.station_code, sd.station_name, sd.station_type,
                   sd.block_name, sd.latitude, sd.longitude,
                   sd.centre_type || ' ' || sd.centre_name AS rmc_mc,
                   ndd.district_name, ndd.state_name, ndd.region_name
            FROM station_details sd
            LEFT JOIN normal_district_details ndd ON ndd.district_code = sd.district_code
            WHERE sd.flag = 1 ${whereExtra}
            ORDER BY sd.station_name
            LIMIT $${params.length - 1} OFFSET $${params.length}
        `, params);

        return res.status(200).json({
            success: true,
            data: result.rows,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('listActiveStations error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};
