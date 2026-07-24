
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../../../connection");
const convertDate = require("../../../utils/convertDate");
const xlsx = require("xlsx");




function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

const SEASON_STARTS = new Set(['01-01', '03-01', '06-01', '10-01']);
const SKIP_KEYS = new Set(['district_code', 'district_name', 'district_area']);

exports.updateDistrictNormals = async (req, res) => {
    try {
        const { district_code } = req.params;
        const currentYear = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Excel file is required' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(worksheet);

        if (rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Excel file has no data rows' });
        }

        // Get all detail ids for this district
        const detailResult = await client.query(
            `SELECT id FROM normal_district_details WHERE district_code = $1`,
            [district_code]
        );
        if (detailResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'District not found in normal_district_details' });
        }
        const detailIds = detailResult.rows.map(r => r.id);
        const primaryDetailId = detailIds[0];

        await client.query('BEGIN');

        // Delete ONLY current year's normals — preserve historical years
        await client.query(
            `DELETE FROM normal_district WHERE normal_district_details_id = ANY($1) AND EXTRACT(YEAR FROM date) = $2`,
            [detailIds, currentYear]
        );

        // Build insert from the first matching row in the Excel
        const row = rows[0];
        const insertValues = [];
        let prev = 0;

        // Sort date keys so 02-29 falls between 02-28 and 03-01
        const dateKeys = Object.keys(row)
            .filter(k => /^\d{2}-\d{2}$/.test(k) && !SKIP_KEYS.has(k))
            .sort();

        for (const key of dateKeys) {
            // Skip Feb 29 on non-leap years
            if (key === '02-29' && !isLeapYear(currentYear)) continue;

            const value = row[key];
            const dateStr = `${currentYear}-${key}`;

            if (SEASON_STARTS.has(key)) prev = 0;

            const rainfall = value - prev;
            insertValues.push(`('${dateStr}', ${value}, ${rainfall}, ${primaryDetailId})`);
            prev = value;
        }

        if (insertValues.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: 'No valid MM-DD date columns found in the file' });
        }

        await client.query(
            `INSERT INTO normal_district (date, cumulative_rainfall_value, rainfall_value, normal_district_details_id) VALUES ${insertValues.join(',')}`
        );

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `${currentYear} normals replaced successfully (${insertValues.length} records)` });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('updateDistrictNormals error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.bulkReplaceDistrictNormals = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Excel file is required' });
        }

        const currentYear = req.body.year ? parseInt(req.body.year, 10) : new Date().getFullYear();
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(worksheet);

        if (rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Excel file has no data rows' });
        }

        await client.query('BEGIN');

        const results = [];

        for (const row of rows) {
            const district_code = row.district_code;
            if (!district_code) continue;

            // Get detail ids for this district
            const detailResult = await client.query(
                `SELECT id FROM normal_district_details WHERE district_code = $1`,
                [district_code]
            );
            if (detailResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, error: `District code ${district_code} not found in normal_district_details` });
            }

            const detailIds = detailResult.rows.map(r => r.id);
            const primaryDetailId = detailIds[0];

            // Delete ONLY current year's normals — preserve historical years
            await client.query(
                `DELETE FROM normal_district WHERE normal_district_details_id = ANY($1) AND EXTRACT(YEAR FROM date) = $2`,
                [detailIds, currentYear]
            );

            // Build insert values — sort keys so 02-29 falls between 02-28 and 03-01
            const insertValues = [];
            let prev = 0;

            const dateKeys = Object.keys(row)
                .filter(k => /^\d{2}-\d{2}$/.test(k) && !SKIP_KEYS.has(k))
                .sort();

            for (const key of dateKeys) {
                if (key === '02-29' && !isLeapYear(currentYear)) continue;

                const value = row[key];
                const dateStr = `${currentYear}-${key}`;

                if (SEASON_STARTS.has(key)) prev = 0;

                insertValues.push(`('${dateStr}', ${value}, ${value - prev}, ${primaryDetailId})`);
                prev = value;
            }

            if (insertValues.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, error: `No valid date columns for district ${district_code}` });
            }

            await client.query(
                `INSERT INTO normal_district (date, cumulative_rainfall_value, rainfall_value, normal_district_details_id) VALUES ${insertValues.join(',')}`
            );

            results.push({ district_code, district_name: row.district_name, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Bulk replace complete for year ${currentYear} — ${results.length} district(s) updated`,
            details: results
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('bulkReplaceDistrictNormals error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.addYearDistrictNormals = async (req, res) => {
    try {
        const { district_code } = req.params;
        const year = parseInt(req.body.year, 10);

        if (!year || year < 2000 || year > 2100) {
            return res.status(400).json({ success: false, error: 'Valid year is required (e.g. 2024)' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Excel file is required' });
        }

        // Get detail ids for this district
        const detailResult = await client.query(
            `SELECT id FROM normal_district_details WHERE district_code = $1`,
            [district_code]
        );
        if (detailResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: `District code ${district_code} not found` });
        }
        const detailIds = detailResult.rows.map(r => r.id);
        const primaryDetailId = detailIds[0];

        // Check if normals already exist for this district + year
        const existCheck = await client.query(
            `SELECT COUNT(*) AS cnt FROM normal_district
             WHERE normal_district_details_id = ANY($1)
             AND EXTRACT(YEAR FROM date) = $2`,
            [detailIds, year]
        );
        if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
            return res.status(409).json({
                success: false,
                error: `Normals for year ${year} already exist for this district. Use "Replace Normals" to overwrite.`
            });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(worksheet);
        if (rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Excel file has no data rows' });
        }

        const row = rows[0];
        const insertValues = [];
        let prev = 0;

        const dateKeys = Object.keys(row)
            .filter(k => /^\d{2}-\d{2}$/.test(k) && !SKIP_KEYS.has(k))
            .sort();

        for (const key of dateKeys) {
            if (key === '02-29' && !isLeapYear(year)) continue;

            const value = row[key];
            const dateStr = `${year}-${key}`;

            if (SEASON_STARTS.has(key)) prev = 0;

            insertValues.push(`('${dateStr}', ${value}, ${value - prev}, ${primaryDetailId})`);
            prev = value;
        }

        if (insertValues.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid MM-DD date columns found in the file' });
        }

        await client.query('BEGIN');
        await client.query(
            `INSERT INTO normal_district (date, cumulative_rainfall_value, rainfall_value, normal_district_details_id) VALUES ${insertValues.join(',')}`
        );
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: `${insertValues.length} normals added for year ${year} successfully`
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('addYearDistrictNormals error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.bulkAddYearDistrictNormals = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Excel file is required' });

        const year = req.body.year ? parseInt(req.body.year, 10) : null;
        if (!year || year < 2000 || year > 2100) {
            return res.status(400).json({ success: false, error: 'Valid year is required' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(worksheet);

        if (rows.length === 0) return res.status(400).json({ success: false, error: 'Excel file has no data rows' });

        await client.query('BEGIN');

        const inserted = [];
        const skipped  = [];

        for (const row of rows) {
            const district_code = row.district_code;
            if (!district_code) continue;

            const detailResult = await client.query(
                `SELECT id FROM normal_district_details WHERE district_code = $1`, [district_code]
            );
            if (detailResult.rows.length === 0) {
                skipped.push({ district_code, district_name: row.district_name, reason: 'Not found in DB' });
                continue;
            }
            const detailIds = detailResult.rows.map(r => r.id);
            const primaryDetailId = detailIds[0];

            // Check if year already exists
            const existCheck = await client.query(
                `SELECT COUNT(*) AS cnt FROM normal_district WHERE normal_district_details_id = ANY($1) AND EXTRACT(YEAR FROM date) = $2`,
                [detailIds, year]
            );
            if (parseInt(existCheck.rows[0].cnt, 10) > 0) {
                skipped.push({ district_code, district_name: row.district_name, reason: `Year ${year} already exists` });
                continue;
            }

            const dateKeys = Object.keys(row)
                .filter(k => /^\d{2}-\d{2}$/.test(k) && !SKIP_KEYS.has(k))
                .sort();

            const insertValues = [];
            let prev = 0;
            for (const key of dateKeys) {
                if (key === '02-29' && !isLeapYear(year)) continue;
                const value = row[key];
                const dateStr = `${year}-${key}`;
                if (SEASON_STARTS.has(key)) prev = 0;
                insertValues.push(`('${dateStr}', ${value}, ${value - prev}, ${primaryDetailId})`);
                prev = value;
            }

            if (insertValues.length === 0) {
                skipped.push({ district_code, district_name: row.district_name, reason: 'No valid date columns' });
                continue;
            }

            await client.query(
                `INSERT INTO normal_district (date, cumulative_rainfall_value, rainfall_value, normal_district_details_id) VALUES ${insertValues.join(',')}`
            );
            inserted.push({ district_code, district_name: row.district_name, records: insertValues.length });
        }

        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: `Year ${year}: ${inserted.length} district(s) added, ${skipped.length} skipped`,
            inserted,
            skipped
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('bulkAddYearDistrictNormals error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.addNewDistrictDetails = async (req, res) => {
    try {
        const { district_code, district_name } = req.body;

        if (!district_code || !district_name) {
            return res.status(400).json({ success: false, error: 'district_code and district_name are required' });
        }

        const result = await client.query(
            `UPDATE normal_district_details SET district_name = $1 WHERE district_code = $2`,
            [district_name.trim(), district_code]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'District not found' });
        }

        res.status(200).json({ success: true, message: 'District updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// ── Get districts missing normals for a given year ────────────────────────────
exports.getMissingDistrictNormals = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const result = await client.query(
            `SELECT DISTINCT nd.district_code, nd.district_name
             FROM normal_district_details nd
             WHERE NOT EXISTS (
               SELECT 1 FROM normal_district ndr
               WHERE ndr.normal_district_details_id = nd.id
               AND EXTRACT(YEAR FROM ndr.date) = $1
             )
             ORDER BY nd.district_name`,
            [year]
        );
        res.status(200).json({ success: true, data: result.rows, year });
    } catch (err) {
        console.error('getMissingDistrictNormals error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};