const client = require('../../../connection');
const xlsx   = require('xlsx');

const SEASON_STARTS = new Set(['01-01', '03-01', '06-01', '10-01']);
const SKIP_KEYS     = new Set(['country_name']);

function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

function sortedDateKeys(row, year) {
    return Object.keys(row)
        .filter(k => /^\d{2}-\d{2}$/.test(k) && !SKIP_KEYS.has(k))
        .sort()
        .filter(k => !(k === '02-29' && !isLeapYear(year)));
}

function buildInsertValues(row, year, country_name) {
    const keys = sortedDateKeys(row, year);
    const values = [];
    let prev = 0;
    for (const key of keys) {
        const val = parseFloat(row[key]);
        if (isNaN(val)) continue;
        if (SEASON_STARTS.has(key)) prev = 0;
        const dateStr = `${year}-${key}`;
        values.push(`('${dateStr}', '${country_name.replace(/'/g, "''")}', ${val}, ${val - prev})`);
        prev = val;
    }
    return values;
}

// ── List ─────────────────────────────────────────────────────────────────────
exports.getCountryNormalList = async (_req, res) => {
    try {
        const result = await client.query(
            `SELECT DISTINCT country_name FROM normal_country ORDER BY country_name`
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getCountryNormalList error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Normals for one country + year ────────────────────────────────────────────
exports.getCountryNormals = async (req, res) => {
    try {
        const country_name = decodeURIComponent(req.params.country_name);
        const year = req.query.year || new Date().getFullYear();
        const result = await client.query(
            `SELECT date, cumulative_rainfall_value, rainfall_value
             FROM normal_country
             WHERE country_name = $1 AND EXTRACT(YEAR FROM date) = $2
             ORDER BY date`,
            [country_name, year]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getCountryNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Download template ─────────────────────────────────────────────────────────
exports.downloadCountryNormalTemplate = async (req, res) => {
    try {
        const country_name = decodeURIComponent(req.params.country_name);

        const months = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const dates = [];
        for (let m = 0; m < 12; m++)
            for (let d = 1; d <= months[m]; d++)
                dates.push(`${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`);

        const sampleRow = { country_name };
        let counter = 0;
        dates.forEach(d => {
            if (SEASON_STARTS.has(d)) counter = 0;
            counter++;
            sampleRow[d] = counter * 2;
        });

        const headers = ['country_name', ...dates];
        const ws = xlsx.utils.json_to_sheet([sampleRow], { header: headers });
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Template');
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        const safeName = country_name.replace(/[^a-zA-Z0-9_-]/g, '_');
        res.setHeader('Content-Disposition', `attachment; filename="country_normals_${safeName}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        console.error('downloadCountryNormalTemplate error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Replace normals for one country + year ────────────────────────────────────
exports.replaceCountryNormals = async (req, res) => {
    try {
        const country_name = decodeURIComponent(req.params.country_name);
        const year = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });

        const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        const row = rows[0];
        const insertValues = buildInsertValues(row, year, country_name);
        if (!insertValues.length) return res.status(400).json({ success: false, error: 'No valid date columns found in the file' });

        await client.query('BEGIN');
        await client.query(
            `DELETE FROM normal_country WHERE country_name = $1 AND EXTRACT(YEAR FROM date) = $2`,
            [country_name, year]
        );
        await client.query(
            `INSERT INTO normal_country (date, country_name, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
        );
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `${year} normals replaced for ${country_name} (${insertValues.length} records)` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('replaceCountryNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Add normals for one country + year (reject if exists) ─────────────────────
exports.addCountryYearNormals = async (req, res) => {
    try {
        const country_name = decodeURIComponent(req.params.country_name);
        const year = req.body.year ? parseInt(req.body.year, 10) : null;
        if (!year) return res.status(400).json({ success: false, error: 'Valid year is required' });
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });

        const existCheck = await client.query(
            `SELECT COUNT(*) AS cnt FROM normal_country WHERE country_name = $1 AND EXTRACT(YEAR FROM date) = $2`,
            [country_name, year]
        );
        if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
            return res.status(409).json({
                success: false,
                error: `Normals for year ${year} already exist for ${country_name}. Use "Replace Normals" to overwrite.`
            });
        }

        const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        const row = rows[0];
        const insertValues = buildInsertValues(row, year, country_name);
        if (!insertValues.length) return res.status(400).json({ success: false, error: 'No valid date columns found in the file' });

        await client.query('BEGIN');
        await client.query(
            `INSERT INTO normal_country (date, country_name, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
        );
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `${insertValues.length} normals added for ${country_name} — year ${year}` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('addCountryYearNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Bulk replace ──────────────────────────────────────────────────────────────
exports.bulkReplaceCountryNormals = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });
        const year = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();

        const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        await client.query('BEGIN');
        const results = [];

        for (const row of rows) {
            const country_name = row.country_name;
            if (!country_name) continue;

            const insertValues = buildInsertValues(row, year, country_name);
            if (!insertValues.length) continue;

            await client.query(
                `DELETE FROM normal_country WHERE country_name = $1 AND EXTRACT(YEAR FROM date) = $2`,
                [country_name, year]
            );
            await client.query(
                `INSERT INTO normal_country (date, country_name, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
            );
            results.push({ country_name, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Bulk replace complete for year ${year} — ${results.length} country entry/entries updated`,
            details: results
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('bulkReplaceCountryNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Bulk add (skip if year exists) ────────────────────────────────────────────
exports.bulkAddCountryYearNormals = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });
        const year = req.body.year ? parseInt(req.body.year, 10) : null;
        if (!year) return res.status(400).json({ success: false, error: 'Valid year is required' });

        const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        await client.query('BEGIN');
        const inserted = [];
        const skipped  = [];

        for (const row of rows) {
            const country_name = row.country_name;
            if (!country_name) continue;

            const existCheck = await client.query(
                `SELECT COUNT(*) AS cnt FROM normal_country WHERE country_name = $1 AND EXTRACT(YEAR FROM date) = $2`,
                [country_name, year]
            );
            if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
                skipped.push({ country_name, reason: `Year ${year} already exists` });
                continue;
            }

            const insertValues = buildInsertValues(row, year, country_name);
            if (!insertValues.length) {
                skipped.push({ country_name, reason: 'No valid date columns' });
                continue;
            }

            await client.query(
                `INSERT INTO normal_country (date, country_name, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
            );
            inserted.push({ country_name, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Year ${year}: ${inserted.length} country entry/entries added, ${skipped.length} skipped`,
            inserted,
            skipped
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('bulkAddCountryYearNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Get countries missing normals for a given year ────────────────────────────
exports.getMissingCountryNormals = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const result = await client.query(
            `SELECT DISTINCT country_name
             FROM normal_country
             WHERE country_name NOT IN (
               SELECT DISTINCT country_name FROM normal_country
               WHERE EXTRACT(YEAR FROM date) = $1
             )
             ORDER BY country_name`,
            [year]
        );
        res.status(200).json({ success: true, data: result.rows, year });
    } catch (err) {
        console.error('getMissingCountryNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
