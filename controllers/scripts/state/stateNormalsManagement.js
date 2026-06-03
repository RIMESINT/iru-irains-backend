const client  = require('../../../connection');
const xlsx    = require('xlsx');

const SEASON_STARTS = new Set(['01-01', '03-01', '06-01', '10-01']);
const SKIP_KEYS     = new Set(['state_name', 'state_code']);

function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

function sortedDateKeys(row, year) {
    return Object.keys(row)
        .filter(k => /^\d{2}-\d{2}$/.test(k) && !SKIP_KEYS.has(k))
        .sort()
        .filter(k => !(k === '02-29' && !isLeapYear(year)));
}

function buildInsertValues(row, year, state_code, state_name) {
    const keys = sortedDateKeys(row, year);
    const values = [];
    let prev = 0;
    for (const key of keys) {
        const val = parseFloat(row[key]);
        if (SEASON_STARTS.has(key)) prev = 0;
        const dateStr = `${year}-${key}`;
        values.push(`('${dateStr}', '${state_name.replace(/'/g, "''")}', ${state_code}, ${val}, ${val - prev})`);
        prev = val;
    }
    return values;
}

// ── Get list of all states (distinct) ────────────────────────────────────────
exports.getStateNormalList = async (_req, res) => {
    try {
        const result = await client.query(
            `SELECT DISTINCT state_code, state_name
             FROM normal_state
             ORDER BY state_name`
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getStateNormalList error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Get normals for one state + year ─────────────────────────────────────────
exports.getStateNormals = async (req, res) => {
    try {
        const { state_code } = req.params;
        const year = req.query.year || new Date().getFullYear();
        const result = await client.query(
            `SELECT date, cumulative_rainfall_value, rainfall_value
             FROM normal_state
             WHERE state_code = $1 AND EXTRACT(YEAR FROM date) = $2
             ORDER BY date`,
            [state_code, year]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getStateNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Download template pre-filled with state data ──────────────────────────────
exports.downloadStateNormalTemplate = async (req, res) => {
    try {
        const { state_code } = req.params;
        const nameResult = await client.query(
            `SELECT state_name FROM normal_state WHERE state_code = $1 LIMIT 1`, [state_code]
        );
        const state_name = nameResult.rows.length ? nameResult.rows[0].state_name : 'Sample State';

        const months = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const dates = [];
        for (let m = 0; m < 12; m++)
            for (let d = 1; d <= months[m]; d++)
                dates.push(`${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`);

        const sampleRow = { state_name, state_code: parseInt(state_code) };
        const seasonStarts = new Set(['01-01','03-01','06-01','10-01']);
        let counter = 0;
        dates.forEach(d => {
            if (seasonStarts.has(d)) counter = 0;
            counter++;
            sampleRow[d] = counter * 2;
        });

        const headers = ['state_name', 'state_code', ...dates];
        const ws = xlsx.utils.json_to_sheet([sampleRow], { header: headers });
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Template');
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename="state_normals_${state_code}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        console.error('downloadStateNormalTemplate error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Replace normals for one state + year ─────────────────────────────────────
exports.replaceStateNormals = async (req, res) => {
    try {
        const { state_code } = req.params;
        const year = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        const row = rows[0];
        const state_name = row.state_name || (await client.query(
            `SELECT state_name FROM normal_state WHERE state_code = $1 LIMIT 1`, [state_code]
        )).rows[0]?.state_name;

        if (!state_name) return res.status(404).json({ success: false, error: `State code ${state_code} not found` });

        const insertValues = buildInsertValues(row, year, state_code, state_name);
        if (!insertValues.length) return res.status(400).json({ success: false, error: 'No valid date columns found' });

        await client.query('BEGIN');
        await client.query(
            `DELETE FROM normal_state WHERE state_code = $1 AND EXTRACT(YEAR FROM date) = $2`,
            [state_code, year]
        );
        await client.query(
            `INSERT INTO normal_state (date, state_name, state_code, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
        );
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `${year} normals replaced for ${state_name} (${insertValues.length} records)` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('replaceStateNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Add normals for one state + year (reject if exists) ───────────────────────
exports.addStateYearNormals = async (req, res) => {
    try {
        const { state_code } = req.params;
        const year = req.body.year ? parseInt(req.body.year, 10) : null;
        if (!year) return res.status(400).json({ success: false, error: 'Valid year is required' });
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });

        const existCheck = await client.query(
            `SELECT COUNT(*) AS cnt FROM normal_state WHERE state_code = $1 AND EXTRACT(YEAR FROM date) = $2`,
            [state_code, year]
        );
        if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
            return res.status(409).json({
                success: false,
                error: `Normals for year ${year} already exist for this state. Use "Replace Normals" to overwrite.`
            });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        const row = rows[0];
        const state_name = row.state_name || (await client.query(
            `SELECT state_name FROM normal_state WHERE state_code = $1 LIMIT 1`, [state_code]
        )).rows[0]?.state_name;

        if (!state_name) return res.status(404).json({ success: false, error: `State code ${state_code} not found` });

        const insertValues = buildInsertValues(row, year, state_code, state_name);
        if (!insertValues.length) return res.status(400).json({ success: false, error: 'No valid date columns found' });

        await client.query('BEGIN');
        await client.query(
            `INSERT INTO normal_state (date, state_name, state_code, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
        );
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `${insertValues.length} normals added for ${state_name} — year ${year}` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('addStateYearNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Bulk replace normals for multiple states + year ───────────────────────────
exports.bulkReplaceStateNormals = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });
        const year = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        await client.query('BEGIN');
        const results = [];

        for (const row of rows) {
            const state_code = row.state_code;
            const state_name = row.state_name;
            if (!state_code || !state_name) continue;

            const insertValues = buildInsertValues(row, year, state_code, state_name);
            if (!insertValues.length) continue;

            await client.query(
                `DELETE FROM normal_state WHERE state_code = $1 AND EXTRACT(YEAR FROM date) = $2`,
                [state_code, year]
            );
            await client.query(
                `INSERT INTO normal_state (date, state_name, state_code, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
            );
            results.push({ state_code, state_name, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Bulk replace complete for year ${year} — ${results.length} state(s) updated`,
            details: results
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('bulkReplaceStateNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Bulk add normals for multiple states + year (skip if exists) ──────────────
exports.bulkAddStateYearNormals = async (req, res) => {
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
            const state_code = row.state_code;
            const state_name = row.state_name;
            if (!state_code || !state_name) continue;

            const existCheck = await client.query(
                `SELECT COUNT(*) AS cnt FROM normal_state WHERE state_code = $1 AND EXTRACT(YEAR FROM date) = $2`,
                [state_code, year]
            );
            if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
                skipped.push({ state_code, state_name, reason: `Year ${year} already exists` });
                continue;
            }

            const insertValues = buildInsertValues(row, year, state_code, state_name);
            if (!insertValues.length) {
                skipped.push({ state_code, state_name, reason: 'No valid date columns' });
                continue;
            }

            await client.query(
                `INSERT INTO normal_state (date, state_name, state_code, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
            );
            inserted.push({ state_code, state_name, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Year ${year}: ${inserted.length} state(s) added, ${skipped.length} skipped`,
            inserted,
            skipped
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('bulkAddStateYearNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
