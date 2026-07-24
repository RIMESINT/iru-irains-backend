const client = require('../../../connection');
const xlsx   = require('xlsx');

const SEASON_STARTS = new Set(['01-01', '03-01', '06-01', '10-01']);
const SKIP_KEYS     = new Set(['block_code', 'block_name']);

function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

function sortedDateKeys(row, year) {
    return Object.keys(row)
        .filter(k => /^\d{2}-\d{2}$/.test(k) && !SKIP_KEYS.has(k))
        .sort()
        .filter(k => !(k === '02-29' && !isLeapYear(year)));
}

function buildInsertValues(row, year, block_code) {
    const keys = sortedDateKeys(row, year);
    const values = [];
    let prev = 0;
    for (const key of keys) {
        const val = parseFloat(row[key]);
        if (SEASON_STARTS.has(key)) prev = 0;
        const dateStr = `${year}-${key}`;
        // INSERT order: date, cumulative_rainfall_value, rainfall_value, block_id
        values.push(`('${dateStr}', ${val}, ${val - prev}, ${block_code})`);
        prev = val;
    }
    return values;
}

// ── Get distinct block list from station_details ──────────────────────────────
exports.getBlockNormalList = async (_req, res) => {
    try {
        const result = await client.query(
            `SELECT DISTINCT block_code, block_name
             FROM station_details
             WHERE block_code IS NOT NULL AND block_name IS NOT NULL
             ORDER BY block_name`
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getBlockNormalList error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Get normals for one block + year ─────────────────────────────────────────
exports.getBlockNormals = async (req, res) => {
    try {
        const { block_id } = req.params;
        const year = req.query.year || new Date().getFullYear();
        const result = await client.query(
            `SELECT date, cumulative_rainfall_value, rainfall_value
             FROM normal_block
             WHERE block_id = $1 AND EXTRACT(YEAR FROM date) = $2
             ORDER BY date`,
            [block_id, year]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getBlockNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Download template pre-filled with sample data ────────────────────────────
exports.downloadBlockNormalTemplate = async (req, res) => {
    try {
        const { block_id } = req.params;
        const nameResult = await client.query(
            `SELECT block_name FROM station_details WHERE block_code = $1 LIMIT 1`, [block_id]
        );
        const block_name = nameResult.rows.length ? nameResult.rows[0].block_name : 'Sample Block';

        const months = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const dates = [];
        for (let m = 0; m < 12; m++)
            for (let d = 1; d <= months[m]; d++)
                dates.push(`${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);

        const sampleRow = { block_code: parseInt(block_id), block_name };
        const seasonStarts = new Set(['01-01', '03-01', '06-01', '10-01']);
        let counter = 0;
        dates.forEach(d => {
            if (seasonStarts.has(d)) counter = 0;
            counter++;
            sampleRow[d] = counter * 2;
        });

        const headers = ['block_code', 'block_name', ...dates];
        const ws = xlsx.utils.json_to_sheet([sampleRow], { header: headers });
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Template');
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename="block_normals_${block_id}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        console.error('downloadBlockNormalTemplate error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Replace normals for one block + year ─────────────────────────────────────
exports.replaceBlockNormals = async (req, res) => {
    try {
        const { block_id } = req.params;
        const year = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        const row = rows[0];
        const blockCode = row.block_code || block_id;

        const blockCheck = await client.query(
            `SELECT block_name FROM station_details WHERE block_code = $1 LIMIT 1`, [block_id]
        );
        const block_name = row.block_name || blockCheck.rows[0]?.block_name || `Block ${block_id}`;

        const insertValues = buildInsertValues(row, year, blockCode);
        if (!insertValues.length) return res.status(400).json({ success: false, error: 'No valid date columns found' });

        await client.query('BEGIN');
        await client.query(
            `DELETE FROM normal_block WHERE block_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
            [block_id, year]
        );
        await client.query(
            `INSERT INTO normal_block (date, cumulative_rainfall_value, rainfall_value, block_id) VALUES ${insertValues.join(',')}`
        );
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `${year} normals replaced for ${block_name} (${insertValues.length} records)` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('replaceBlockNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Add normals for one block + year (reject if exists) ───────────────────────
exports.addBlockYearNormals = async (req, res) => {
    try {
        const { block_id } = req.params;
        const year = req.body.year ? parseInt(req.body.year, 10) : null;
        if (!year) return res.status(400).json({ success: false, error: 'Valid year is required' });
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });

        const existCheck = await client.query(
            `SELECT COUNT(*) AS cnt FROM normal_block WHERE block_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
            [block_id, year]
        );
        if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
            return res.status(409).json({
                success: false,
                error: `Normals for year ${year} already exist for this block. Use "Replace Normals" to overwrite.`
            });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        const row = rows[0];
        const blockCheck = await client.query(
            `SELECT block_name FROM station_details WHERE block_code = $1 LIMIT 1`, [block_id]
        );
        const block_name = row.block_name || blockCheck.rows[0]?.block_name || `Block ${block_id}`;

        const insertValues = buildInsertValues(row, year, block_id);
        if (!insertValues.length) return res.status(400).json({ success: false, error: 'No valid date columns found' });

        await client.query('BEGIN');
        await client.query(
            `INSERT INTO normal_block (date, cumulative_rainfall_value, rainfall_value, block_id) VALUES ${insertValues.join(',')}`
        );
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `${insertValues.length} normals added for ${block_name} — year ${year}` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('addBlockYearNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Bulk replace normals for multiple blocks + year ───────────────────────────
exports.bulkReplaceBlockNormals = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });
        const year = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        await client.query('BEGIN');
        const results = [];

        for (const row of rows) {
            const block_code = row.block_code;
            const block_name = row.block_name;
            if (!block_code) continue;

            const insertValues = buildInsertValues(row, year, block_code);
            if (!insertValues.length) continue;

            await client.query(
                `DELETE FROM normal_block WHERE block_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
                [block_code, year]
            );
            await client.query(
                `INSERT INTO normal_block (date, cumulative_rainfall_value, rainfall_value, block_id) VALUES ${insertValues.join(',')}`
            );
            results.push({ block_code, block_name: block_name || `Block ${block_code}`, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Bulk replace complete for year ${year} — ${results.length} block(s) updated`,
            details: results
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('bulkReplaceBlockNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Bulk add normals for multiple blocks + year (skip if exists) ──────────────
exports.bulkAddBlockYearNormals = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });
        const year = req.body.year ? parseInt(req.body.year, 10) : null;
        if (!year) return res.status(400).json({ success: false, error: 'Valid year is required' });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        await client.query('BEGIN');
        const inserted = [];
        const skipped  = [];

        for (const row of rows) {
            const block_code = row.block_code;
            const block_name = row.block_name || `Block ${block_code}`;
            if (!block_code) continue;

            const existCheck = await client.query(
                `SELECT COUNT(*) AS cnt FROM normal_block WHERE block_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
                [block_code, year]
            );
            if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
                skipped.push({ block_code, block_name, reason: `Year ${year} already exists` });
                continue;
            }

            const insertValues = buildInsertValues(row, year, block_code);
            if (!insertValues.length) {
                skipped.push({ block_code, block_name, reason: 'No valid date columns' });
                continue;
            }

            await client.query(
                `INSERT INTO normal_block (date, cumulative_rainfall_value, rainfall_value, block_id) VALUES ${insertValues.join(',')}`
            );
            inserted.push({ block_code, block_name, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Year ${year}: ${inserted.length} block(s) added, ${skipped.length} skipped`,
            inserted,
            skipped
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('bulkAddBlockYearNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Get blocks missing normals for a given year ───────────────────────────────
exports.getMissingBlockNormals = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const result = await client.query(
            `SELECT DISTINCT s.block_code, s.block_name
             FROM station_details s
             WHERE s.block_code IS NOT NULL
             AND NOT EXISTS (
               SELECT 1 FROM normal_block nb
               WHERE nb.block_id = s.block_code
               AND EXTRACT(YEAR FROM nb.date) = $1
             )
             ORDER BY s.block_name`,
            [year]
        );
        res.status(200).json({ success: true, data: result.rows, year });
    } catch (err) {
        console.error('getMissingBlockNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
