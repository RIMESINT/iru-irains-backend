const client = require('../connection');

const VALID_FOLDERS = ['root', 'state', 'subdivision', 'regions', 'mcrmcs', 'river_basin'];

// ── Recursively collect all [lng, lat] coordinate pairs ───────────────────
function extractCoords(coords, out) {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === 'number') {
        out.push(coords);
    } else {
        for (const c of coords) extractCoords(c, out);
    }
}

function computeBbox(geojson) {
    const pts = [];
    for (const f of (geojson.features || [])) {
        if (f.geometry?.coordinates) extractCoords(f.geometry.coordinates, pts);
    }
    if (!pts.length) return { minx: null, miny: null, maxx: null, maxy: null };
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const [lng, lat] of pts) {
        if (lng < minx) minx = lng;
        if (lng > maxx) maxx = lng;
        if (lat < miny) miny = lat;
        if (lat > maxy) maxy = lat;
    }
    return { minx, miny, maxx, maxy };
}

// POST /api/v1/geojson/upload
// Body (multipart): folder (string), file (.json)
async function uploadGeojson(req, res) {
    try {
        const folder = req.body.folder?.trim().toLowerCase();
        const file   = req.file;

        if (!folder || !VALID_FOLDERS.includes(folder)) {
            return res.status(400).json({
                success: false,
                message: `Invalid folder. Must be one of: ${VALID_FOLDERS.join(', ')}`
            });
        }
        if (!file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        // Parse and validate GeoJSON
        let geojson;
        try {
            geojson = JSON.parse(file.buffer.toString('utf8'));
        } catch {
            return res.status(400).json({ success: false, message: 'File is not valid JSON.' });
        }
        if (geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
            return res.status(400).json({ success: false, message: 'File must be a GeoJSON FeatureCollection.' });
        }

        const fileName     = file.originalname;
        const featureCount = geojson.features.length;
        const bbox         = computeBbox(geojson);
        const displayName  = fileName.replace(/\.json$/i, '').replace(/_/g, ' ');

        // Get current max version so we can bump it on re-upload
        const versionResult = await client.query(
            `SELECT COALESCE(MAX(version), 0) AS max_version
               FROM geojson_store
              WHERE folder = $1 AND file_name = $2`,
            [folder, fileName]
        );
        const newVersion = versionResult.rows[0].max_version + 1;

        // Insert new version
        const insert = await client.query(
            `INSERT INTO geojson_store
                (folder, file_name, display_name, geojson, feature_count,
                 bbox_minx, bbox_miny, bbox_maxx, bbox_maxy,
                 source, original_filename, uploaded_by,
                 version, is_active, is_validated)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'manual_upload',$10,$11,$12,TRUE,FALSE)
             RETURNING id`,
            [folder, fileName, displayName,
             JSON.stringify(geojson), featureCount,
             bbox.minx, bbox.miny, bbox.maxx, bbox.maxy,
             fileName, req.user?.id ?? null, newVersion]
        );
        const newId = insert.rows[0].id;

        // Deactivate previous version if this is a re-upload
        if (newVersion > 1) {
            await client.query(
                `UPDATE geojson_store
                    SET is_active = FALSE, superseded_by = $1, updated_at = NOW()
                  WHERE folder = $2 AND file_name = $3 AND version = $4`,
                [newId, folder, fileName, newVersion - 1]
            );
        }

        return res.status(201).json({
            success: true,
            message: `Uploaded — ${featureCount} features stored.`,
            data: { id: newId, folder, fileName, featureCount, version: newVersion }
        });

    } catch (err) {
        console.error('uploadGeojson error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error during upload.' });
    }
}

// GET /api/v1/geojson/:folder/:fileName
// Returns the raw GeoJSON FeatureCollection
async function getGeojson(req, res) {
    try {
        const { folder, fileName } = req.params;

        const result = await client.query(
            `SELECT geojson
               FROM geojson_store
              WHERE folder = $1 AND file_name = $2 AND is_active = TRUE
              ORDER BY version DESC
              LIMIT 1`,
            [folder, fileName]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: 'GeoJSON not found.' });
        }

        res.setHeader('Content-Type', 'application/geo+json');
        return res.status(200).json(result.rows[0].geojson);

    } catch (err) {
        console.error('getGeojson error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}

// GET /api/v1/geojson/:folder
// Returns list of file metadata in a folder (no geojson payload)
async function listFolder(req, res) {
    try {
        const { folder } = req.params;

        const result = await client.query(
            `SELECT id, file_name, display_name, feature_count, version,
                    source, is_validated, created_at, updated_at
               FROM geojson_store
              WHERE folder = $1 AND is_active = TRUE
              ORDER BY file_name`,
            [folder]
        );

        return res.status(200).json({ success: true, folder, files: result.rows });

    } catch (err) {
        console.error('listFolder error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}

// GET /api/v1/geojson/upload-history
// Returns recent manual uploads (for the upload history table in the frontend)
async function getUploadHistory(req, res) {
    try {
        const result = await client.query(
            `SELECT id, folder, file_name, feature_count, version,
                    source, is_validated, created_at
               FROM geojson_store
              WHERE source = 'manual_upload'
              ORDER BY created_at DESC
              LIMIT 50`
        );

        return res.status(200).json({ success: true, history: result.rows });

    } catch (err) {
        console.error('getUploadHistory error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}

module.exports = { uploadGeojson, getGeojson, listFolder, getUploadHistory };
