const client = require('../../../connection');
const xlsx   = require('xlsx');

const SEASON_STARTS = new Set(['01-01', '03-01', '06-01', '10-01']);
const SKIP_KEYS     = new Set(['region_name', 'region_id']);

function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

function sortedDateKeys(row, year) {
    return Object.keys(row)
        .filter(k => /^\d{2}-\d{2}$/.test(k) && !SKIP_KEYS.has(k))
        .sort()
        .filter(k => !(k === '02-29' && !isLeapYear(year)));
}

function buildInsertValues(row, year, region_id, region_name) {
    const keys = sortedDateKeys(row, year);
    const values = [];
    let prev = 0;
    for (const key of keys) {
        const val = parseFloat(row[key]);
        if (isNaN(val)) continue;
        if (SEASON_STARTS.has(key)) prev = 0;
        const dateStr = `${year}-${key}`;
        values.push(`('${dateStr}', '${region_name.replace(/'/g, "''")}', ${region_id}, ${val}, ${val - prev})`);
        prev = val;
    }
    return values;
}

async function getRegionMeta(region_id) {
    const r = await client.query(
        `SELECT region_name FROM normal_region WHERE region_id = $1 LIMIT 1`, [region_id]
    );
    return r.rows[0] || null;
}

// ── List ─────────────────────────────────────────────────────────────────────
exports.getRegionNormalList = async (_req, res) => {
    try {
        const result = await client.query(
            `SELECT DISTINCT region_id, region_name FROM normal_region ORDER BY region_name`
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getRegionNormalList error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Normals for one region + year ─────────────────────────────────────────────
exports.getRegionNormals = async (req, res) => {
    try {
        const { region_id } = req.params;
        const year = req.query.year || new Date().getFullYear();
        const result = await client.query(
            `SELECT date, cumulative_rainfall_value, rainfall_value
             FROM normal_region
             WHERE region_id = $1 AND EXTRACT(YEAR FROM date) = $2
             ORDER BY date`,
            [region_id, year]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getRegionNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Download template ─────────────────────────────────────────────────────────
exports.downloadRegionNormalTemplate = async (req, res) => {
    try {
        const { region_id } = req.params;
        const meta = await getRegionMeta(region_id);
        const region_name = meta ? meta.region_name : 'Sample Region';

        const months = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const dates = [];
        for (let m = 0; m < 12; m++)
            for (let d = 1; d <= months[m]; d++)
                dates.push(`${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`);

        const sampleRow = { region_name, region_id: parseInt(region_id) };
        let counter = 0;
        dates.forEach(d => {
            if (SEASON_STARTS.has(d)) counter = 0;
            counter++;
            sampleRow[d] = counter * 2;
        });

        const headers = ['region_name', 'region_id', ...dates];
        const ws = xlsx.utils.json_to_sheet([sampleRow], { header: headers });
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Template');
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename="region_normals_${region_id}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        console.error('downloadRegionNormalTemplate error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Replace normals for one region + year ─────────────────────────────────────
exports.replaceRegionNormals = async (req, res) => {
    try {
        const { region_id } = req.params;
        const year = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });

        const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        const row = rows[0];
        let region_name = row.region_name;

        if (!region_name) {
            const meta = await getRegionMeta(region_id);
            if (!meta) return res.status(404).json({ success: false, error: `Region id ${region_id} not found` });
            region_name = meta.region_name;
        }

        const insertValues = buildInsertValues(row, year, region_id, region_name);
        if (!insertValues.length) return res.status(400).json({ success: false, error: 'No valid date columns found in the file' });

        await client.query('BEGIN');
        await client.query(
            `DELETE FROM normal_region WHERE region_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
            [region_id, year]
        );
        await client.query(
            `INSERT INTO normal_region (date, region_name, region_id, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
        );
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `${year} normals replaced for ${region_name} (${insertValues.length} records)` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('replaceRegionNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Add normals for one region + year (reject if exists) ──────────────────────
exports.addRegionYearNormals = async (req, res) => {
    try {
        const { region_id } = req.params;
        const year = req.body.year ? parseInt(req.body.year, 10) : null;
        if (!year) return res.status(400).json({ success: false, error: 'Valid year is required' });
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });

        const existCheck = await client.query(
            `SELECT COUNT(*) AS cnt FROM normal_region WHERE region_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
            [region_id, year]
        );
        if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
            return res.status(409).json({
                success: false,
                error: `Normals for year ${year} already exist for this region. Use "Replace Normals" to overwrite.`
            });
        }

        const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        const row = rows[0];
        let region_name = row.region_name;

        if (!region_name) {
            const meta = await getRegionMeta(region_id);
            if (!meta) return res.status(404).json({ success: false, error: `Region id ${region_id} not found` });
            region_name = meta.region_name;
        }

        const insertValues = buildInsertValues(row, year, region_id, region_name);
        if (!insertValues.length) return res.status(400).json({ success: false, error: 'No valid date columns found in the file' });

        await client.query('BEGIN');
        await client.query(
            `INSERT INTO normal_region (date, region_name, region_id, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
        );
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `${insertValues.length} normals added for ${region_name} — year ${year}` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('addRegionYearNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Bulk replace ──────────────────────────────────────────────────────────────
exports.bulkReplaceRegionNormals = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });
        const year = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();

        const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
        const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        await client.query('BEGIN');
        const results = [];

        for (const row of rows) {
            const region_id   = row.region_id;
            const region_name = row.region_name;
            if (!region_id || !region_name) continue;

            const insertValues = buildInsertValues(row, year, region_id, region_name);
            if (!insertValues.length) continue;

            await client.query(
                `DELETE FROM normal_region WHERE region_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
                [region_id, year]
            );
            await client.query(
                `INSERT INTO normal_region (date, region_name, region_id, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
            );
            results.push({ region_id, region_name, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Bulk replace complete for year ${year} — ${results.length} region(s) updated`,
            details: results
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('bulkReplaceRegionNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Bulk add (skip if year exists) ────────────────────────────────────────────
exports.bulkAddRegionYearNormals = async (req, res) => {
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
            const region_id   = row.region_id;
            const region_name = row.region_name;
            if (!region_id || !region_name) continue;

            const existCheck = await client.query(
                `SELECT COUNT(*) AS cnt FROM normal_region WHERE region_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
                [region_id, year]
            );
            if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
                skipped.push({ region_id, region_name, reason: `Year ${year} already exists` });
                continue;
            }

            const insertValues = buildInsertValues(row, year, region_id, region_name);
            if (!insertValues.length) {
                skipped.push({ region_id, region_name, reason: 'No valid date columns' });
                continue;
            }

            await client.query(
                `INSERT INTO normal_region (date, region_name, region_id, cumulative_rainfall_value, rainfall_value) VALUES ${insertValues.join(',')}`
            );
            inserted.push({ region_id, region_name, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Year ${year}: ${inserted.length} region(s) added, ${skipped.length} skipped`,
            inserted,
            skipped
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('bulkAddRegionYearNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Get regions missing normals for a given year ──────────────────────────────
exports.getMissingRegionNormals = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const result = await client.query(
            `SELECT DISTINCT region_id, region_name
             FROM normal_region
             WHERE region_id NOT IN (
               SELECT DISTINCT region_id FROM normal_region
               WHERE EXTRACT(YEAR FROM date) = $1
             )
             ORDER BY region_name`,
            [year]
        );
        res.status(200).json({ success: true, data: result.rows, year });
    } catch (err) {
        console.error('getMissingRegionNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
