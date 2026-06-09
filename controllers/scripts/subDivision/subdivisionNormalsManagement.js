const client = require('../../../connection');
const xlsx   = require('xlsx');

const SEASON_STARTS = new Set(['01-01', '03-01', '06-01', '10-01']);
const SKIP_KEYS     = new Set(['sub_division_name', 'sub_division_id', 'sub_division_code']);

function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

function sortedDateKeys(row, year) {
    return Object.keys(row)
        .filter(k => /^\d{2}-\d{2}$/.test(k) && !SKIP_KEYS.has(k))
        .sort()
        .filter(k => !(k === '02-29' && !isLeapYear(year)));
}

function buildInsertValues(row, year, sub_division_code, sub_division_name, sub_division_id) {
    const keys = sortedDateKeys(row, year);
    const values = [];
    let prev = 0;
    for (const key of keys) {
        const val = parseFloat(row[key]);
        if (isNaN(val)) continue;
        if (SEASON_STARTS.has(key)) prev = 0;
        const dateStr = `${year}-${key}`;
        values.push(`('${dateStr}', '${sub_division_name.replace(/'/g, "''")}', ${sub_division_id}, ${sub_division_code}, ${val}, ${val - prev})`);
        prev = val;
    }
    return values;
}

async function getSubdivMeta(sub_division_code) {
    const r = await client.query(
        `SELECT sub_division_name, sub_division_id FROM normal_sub_division WHERE sub_division_code = $1 LIMIT 1`,
        [sub_division_code]
    );
    return r.rows[0] || null;
}

// ── List ─────────────────────────────────────────────────────────────────────
exports.getSubdivisionNormalList = async (_req, res) => {
    try {
        const result = await client.query(
            `SELECT DISTINCT sub_division_code, sub_division_name, sub_division_id
             FROM normal_sub_division ORDER BY sub_division_name`
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getSubdivisionNormalList error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Normals for one subdiv + year ─────────────────────────────────────────────
exports.getSubdivisionNormals = async (req, res) => {
    try {
        const { sub_division_code } = req.params;
        const year = req.query.year || new Date().getFullYear();
        const result = await client.query(
            `SELECT date, cumulative_rainfall_value, rainfall_value
             FROM normal_sub_division
             WHERE sub_division_code = $1 AND EXTRACT(YEAR FROM date) = $2
             ORDER BY date`,
            [sub_division_code, year]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getSubdivisionNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Download template ─────────────────────────────────────────────────────────
exports.downloadSubdivisionNormalTemplate = async (req, res) => {
    try {
        const { sub_division_code } = req.params;
        const meta = await getSubdivMeta(sub_division_code);
        const sub_division_name = meta ? meta.sub_division_name : 'Sample Subdivision';
        const sub_division_id   = meta ? meta.sub_division_id   : 0;

        const months = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const dates = [];
        for (let m = 0; m < 12; m++)
            for (let d = 1; d <= months[m]; d++)
                dates.push(`${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`);

        const sampleRow = { sub_division_name, sub_division_id, sub_division_code: parseInt(sub_division_code) };
        let counter = 0;
        dates.forEach(d => {
            if (SEASON_STARTS.has(d)) counter = 0;
            counter++;
            sampleRow[d] = counter * 2;
        });

        const headers = ['sub_division_name', 'sub_division_id', 'sub_division_code', ...dates];
        const ws = xlsx.utils.json_to_sheet([sampleRow], { header: headers });
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Template');
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename="subdivision_normals_${sub_division_code}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        console.error('downloadSubdivisionNormalTemplate error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Replace normals for one subdiv + year ─────────────────────────────────────
exports.replaceSubdivisionNormals = async (req, res) => {
    try {
        const { sub_division_code } = req.params;
        const year = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });

        const rows = xlsx.utils.sheet_to_json(
            xlsx.read(req.file.buffer, { type: 'buffer' }).Sheets[xlsx.read(req.file.buffer, { type: 'buffer' }).SheetNames[0]]
        );
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        const row = rows[0];
        let sub_division_name = row.sub_division_name;
        let sub_division_id   = row.sub_division_id;

        if (!sub_division_name || sub_division_id == null) {
            const meta = await getSubdivMeta(sub_division_code);
            if (!meta) return res.status(404).json({ success: false, error: `Subdivision code ${sub_division_code} not found` });
            sub_division_name = sub_division_name || meta.sub_division_name;
            sub_division_id   = sub_division_id   ?? meta.sub_division_id;
        }

        const insertValues = buildInsertValues(row, year, sub_division_code, sub_division_name, sub_division_id);
        if (!insertValues.length) return res.status(400).json({ success: false, error: 'No valid date columns found in the file' });

        await client.query('BEGIN');
        await client.query(
            `DELETE FROM normal_sub_division WHERE sub_division_code = $1 AND EXTRACT(YEAR FROM date) = $2`,
            [sub_division_code, year]
        );
        await client.query(
            `INSERT INTO normal_sub_division (date, sub_division_name, sub_division_id, sub_division_code, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
        );
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `${year} normals replaced for ${sub_division_name} (${insertValues.length} records)` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('replaceSubdivisionNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Add normals for one subdiv + year (reject if exists) ──────────────────────
exports.addSubdivisionYearNormals = async (req, res) => {
    try {
        const { sub_division_code } = req.params;
        const year = req.body.year ? parseInt(req.body.year, 10) : null;
        if (!year) return res.status(400).json({ success: false, error: 'Valid year is required' });
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });

        const existCheck = await client.query(
            `SELECT COUNT(*) AS cnt FROM normal_sub_division WHERE sub_division_code = $1 AND EXTRACT(YEAR FROM date) = $2`,
            [sub_division_code, year]
        );
        if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
            return res.status(409).json({
                success: false,
                error: `Normals for year ${year} already exist for this subdivision. Use "Replace Normals" to overwrite.`
            });
        }

        const rows = xlsx.utils.sheet_to_json(
            xlsx.read(req.file.buffer, { type: 'buffer' }).Sheets[xlsx.read(req.file.buffer, { type: 'buffer' }).SheetNames[0]]
        );
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        const row = rows[0];
        let sub_division_name = row.sub_division_name;
        let sub_division_id   = row.sub_division_id;

        if (!sub_division_name || sub_division_id == null) {
            const meta = await getSubdivMeta(sub_division_code);
            if (!meta) return res.status(404).json({ success: false, error: `Subdivision code ${sub_division_code} not found` });
            sub_division_name = sub_division_name || meta.sub_division_name;
            sub_division_id   = sub_division_id   ?? meta.sub_division_id;
        }

        const insertValues = buildInsertValues(row, year, sub_division_code, sub_division_name, sub_division_id);
        if (!insertValues.length) return res.status(400).json({ success: false, error: 'No valid date columns found in the file' });

        await client.query('BEGIN');
        await client.query(
            `INSERT INTO normal_sub_division (date, sub_division_name, sub_division_id, sub_division_code, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
        );
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `${insertValues.length} normals added for ${sub_division_name} — year ${year}` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('addSubdivisionYearNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Bulk replace ──────────────────────────────────────────────────────────────
exports.bulkReplaceSubdivisionNormals = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });
        const year = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();

        const rows = xlsx.utils.sheet_to_json(
            xlsx.read(req.file.buffer, { type: 'buffer' }).Sheets[xlsx.read(req.file.buffer, { type: 'buffer' }).SheetNames[0]]
        );
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        await client.query('BEGIN');
        const results = [];

        for (const row of rows) {
            const sub_division_code = row.sub_division_code;
            const sub_division_name = row.sub_division_name;
            const sub_division_id   = row.sub_division_id;
            if (!sub_division_code || !sub_division_name || sub_division_id == null) continue;

            const insertValues = buildInsertValues(row, year, sub_division_code, sub_division_name, sub_division_id);
            if (!insertValues.length) continue;

            await client.query(
                `DELETE FROM normal_sub_division WHERE sub_division_code = $1 AND EXTRACT(YEAR FROM date) = $2`,
                [sub_division_code, year]
            );
            await client.query(
                `INSERT INTO normal_sub_division (date, sub_division_name, sub_division_id, sub_division_code, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
            );
            results.push({ sub_division_code, sub_division_name, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Bulk replace complete for year ${year} — ${results.length} subdivision(s) updated`,
            details: results
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('bulkReplaceSubdivisionNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Bulk add (skip if year exists) ────────────────────────────────────────────
exports.bulkAddSubdivisionYearNormals = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });
        const year = req.body.year ? parseInt(req.body.year, 10) : null;
        if (!year) return res.status(400).json({ success: false, error: 'Valid year is required' });

        const rows = xlsx.utils.sheet_to_json(
            xlsx.read(req.file.buffer, { type: 'buffer' }).Sheets[xlsx.read(req.file.buffer, { type: 'buffer' }).SheetNames[0]]
        );
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        await client.query('BEGIN');
        const inserted = [];
        const skipped  = [];

        for (const row of rows) {
            const sub_division_code = row.sub_division_code;
            const sub_division_name = row.sub_division_name;
            const sub_division_id   = row.sub_division_id;
            if (!sub_division_code || !sub_division_name || sub_division_id == null) continue;

            const existCheck = await client.query(
                `SELECT COUNT(*) AS cnt FROM normal_sub_division WHERE sub_division_code = $1 AND EXTRACT(YEAR FROM date) = $2`,
                [sub_division_code, year]
            );
            if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
                skipped.push({ sub_division_code, sub_division_name, reason: `Year ${year} already exists` });
                continue;
            }

            const insertValues = buildInsertValues(row, year, sub_division_code, sub_division_name, sub_division_id);
            if (!insertValues.length) {
                skipped.push({ sub_division_code, sub_division_name, reason: 'No valid date columns' });
                continue;
            }

            await client.query(
                `INSERT INTO normal_sub_division (date, sub_division_name, sub_division_id, sub_division_code, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
            );
            inserted.push({ sub_division_code, sub_division_name, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Year ${year}: ${inserted.length} subdivision(s) added, ${skipped.length} skipped`,
            inserted,
            skipped
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('bulkAddSubdivisionYearNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
