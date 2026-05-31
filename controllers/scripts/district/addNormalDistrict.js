
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
        const currentYear = new Date().getFullYear();

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

        // Delete ALL existing normals for every detail entry of this district
        await client.query(
            `DELETE FROM normal_district WHERE normal_district_details_id = ANY($1)`,
            [detailIds]
        );

        // Build insert from the first matching row in the Excel
        const row = rows[0];
        const insertValues = [];
        let prev = 0;

        for (const [key, value] of Object.entries(row)) {
            if (SKIP_KEYS.has(key)) continue;

            // key must be MM-DD
            if (!/^\d{2}-\d{2}$/.test(key)) continue;

            // Skip Feb 29 on non-leap years
            if (key === '02-29' && !isLeapYear(currentYear)) continue;

            const [mm, dd] = key.split('-');
            const month = parseInt(mm, 10);
            const day = parseInt(dd, 10);
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
        res.status(200).json({ success: true, message: `District normals updated successfully (${insertValues.length} records replaced)` });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('updateDistrictNormals error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
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