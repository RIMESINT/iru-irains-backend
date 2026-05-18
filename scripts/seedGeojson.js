/**
 * Seed script: reads all GeoJSON files from the frontend assets folder
 * and inserts them into the geojson_store table in PostgreSQL.
 *
 * Run from the iru-irains-backend/ directory:
 *   node scripts/seedGeojson.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ── DB connection (uses same env vars as the backend) ──────────────────────
const client = new Client({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    port:     process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB,
});

// ── Path to the GeoJSON assets folder ─────────────────────────────────────
// Set GEOJSON_PATH in .env to the absolute path of the assets/geojson/ folder.
// This is different on every environment (dev machine, staging server, prod server).
const GEOJSON_ROOT = process.env.GEOJSON_PATH;

if (!GEOJSON_ROOT) {
    console.error('ERROR: GEOJSON_PATH is not set in .env');
    console.error('Set it to the absolute path of the assets/geojson/ folder.');
    console.error('Example: GEOJSON_PATH=/var/www/irains/assets/geojson');
    process.exit(1);
}

if (!fs.existsSync(GEOJSON_ROOT)) {
    console.error(`ERROR: GEOJSON_PATH does not exist: ${GEOJSON_ROOT}`);
    process.exit(1);
}

console.log(`Reading GeoJSON files from: ${GEOJSON_ROOT}\n`);

// ── Folder → DB folder name mapping ───────────────────────────────────────
const FOLDERS = [
    { dir: '',            folder: 'root'        },
    { dir: 'state',       folder: 'state'       },
    { dir: 'subdivision', folder: 'subdivision'  },
    { dir: 'regions',     folder: 'regions'      },
    { dir: 'MCRMCs',      folder: 'mcrmcs'       },
    { dir: 'river_basin', folder: 'river_basin'  },
];

// ── Derive a human-readable display name from the filename ─────────────────
function toDisplayName(fileName) {
    return fileName
        .replace(/\.json$/i, '')
        .replace(/^(ST_|SD_|MC_|RMC_|INDIA_)/, '')
        .replace(/_/g, ' ')
        .replace(/&/g, '&')
        .trim()
        .replace(/\b\w/g, c => c.toUpperCase());
}

// ── Recursively extract all [lng, lat] coordinate pairs ───────────────────
function extractCoords(coords, out) {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === 'number') {
        out.push(coords);
    } else {
        for (const c of coords) extractCoords(c, out);
    }
}

// ── Compute bounding box from a GeoJSON FeatureCollection ─────────────────
function computeBbox(geojson) {
    const allCoords = [];
    const features = geojson.features || [];
    for (const f of features) {
        if (f.geometry && f.geometry.coordinates) {
            extractCoords(f.geometry.coordinates, allCoords);
        }
    }
    if (allCoords.length === 0) return { minx: null, miny: null, maxx: null, maxy: null };

    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const [lng, lat] of allCoords) {
        if (lng < minx) minx = lng;
        if (lng > maxx) maxx = lng;
        if (lat < miny) miny = lat;
        if (lat > maxy) maxy = lat;
    }
    return { minx, miny, maxx, maxy };
}

// ── Upsert one file into geojson_store ────────────────────────────────────
async function upsertFile(folder, fileName, geojson) {
    const featureCount = (geojson.features || []).length;
    const bbox = computeBbox(geojson);
    const displayName = toDisplayName(fileName);

    const sql = `
        INSERT INTO geojson_store
            (folder, file_name, display_name, geojson, feature_count,
             bbox_minx, bbox_miny, bbox_maxx, bbox_maxy,
             source, version, is_active, is_validated, updated_at)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9,
             'seed_script', 1, TRUE, FALSE, NOW())
        ON CONFLICT (folder, file_name, version)
        DO UPDATE SET
            geojson       = EXCLUDED.geojson,
            feature_count = EXCLUDED.feature_count,
            bbox_minx     = EXCLUDED.bbox_minx,
            bbox_miny     = EXCLUDED.bbox_miny,
            bbox_maxx     = EXCLUDED.bbox_maxx,
            bbox_maxy     = EXCLUDED.bbox_maxy,
            display_name  = EXCLUDED.display_name,
            updated_at    = NOW()
    `;

    await client.query(sql, [
        folder, fileName, displayName,
        JSON.stringify(geojson), featureCount,
        bbox.minx, bbox.miny, bbox.maxx, bbox.maxy,
    ]);
}

// ── Main ──────────────────────────────────────────────────────────────────
async function seed() {
    await client.connect();
    console.log('Connected to PostgreSQL.\n');

    const counts = {};
    let totalFiles = 0;
    let totalFeatures = 0;

    for (const { dir, folder } of FOLDERS) {
        const dirPath = dir ? path.join(GEOJSON_ROOT, dir) : GEOJSON_ROOT;

        // For root folder: only pick .json files (not directories)
        const entries = fs.readdirSync(dirPath);
        const jsonFiles = entries.filter(f => {
            if (!f.endsWith('.json')) return false;
            if (dir === '') {
                // root: only the 6 root files, skip subdirectories
                return fs.statSync(path.join(dirPath, f)).isFile();
            }
            return true;
        });

        counts[folder] = 0;

        for (const fileName of jsonFiles) {
            const filePath = path.join(dirPath, fileName);
            let geojson;
            try {
                geojson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (e) {
                console.warn(`  ⚠ Skipping ${fileName}: ${e.message}`);
                continue;
            }

            await upsertFile(folder, fileName, geojson);

            const fc = (geojson.features || []).length;
            totalFeatures += fc;
            counts[folder]++;
            totalFiles++;
            console.log(`  ✓ [${folder}] ${fileName}  (${fc} features)`);
        }
    }

    console.log('\n── Seed complete ──────────────────────────────');
    for (const [f, c] of Object.entries(counts)) {
        console.log(`  ${f.padEnd(14)} : ${c} files`);
    }
    console.log(`${'Total'.padEnd(14)} : ${totalFiles} files, ${totalFeatures} features`);

    await client.end();
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
