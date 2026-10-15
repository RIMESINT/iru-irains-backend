// controllers/ftp/Shared.js
//
// Monthly upload to IMD's FTP server, run by CronJobs on the 7th at 15:15 IST.
// Sends exactly two CSV files for the PREVIOUS month:
//
//   IRAINS_DATA_YYYY_MM.csv    one row per active station, one column per day
//   DRMS_METADATA_YYYY_MM.csv  where each of those same stations is
//
// Both list the same stations: station_details rows with flag = 1.

const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const ftp = require('ftp'); // npm install ftp
const client = require("../../connection");

/** The app-wide "no reading" value. */
const NO_DATA = -999.9;

// Local copy of every file sent
const localOutputDir = path.join(__dirname, '../../monthly_drms_output');

// FTP Configuration (from IMD email)
const ftpConfig = {
    host: '210.212.167.217',
    port: 21,
    user: 'imdhydromet',
    password: 'toNDC#2025',
    secure: false,
    connTimeout: 30000,
    pasvTimeout: 30000,
    keepalive: 10000
};

const remoteBaseDir = '/home/imdhydromet/irains_drmsdata';

const METADATA_COLUMNS = [
    'centre', 'station_name', 'station_code', 'latitude', 'longitude',
    'block_name', 'block_code', 'district_name', 'district_code', 'district_area',
    'state_name', 'state_code', 'subdivision_name', 'subdivision_code', 'region_name', 'region_code',
];

/**
 * IRAINS_DATA: station_id, then one column per day of the month ("1".."28"–"31").
 *
 * A day with no row, a null value, or any negative value is written as -999.9.
 * The `d.data >= 0` filter does that in one place: nulls and negatives (including
 * -999.9 itself) are left out of MAX(), so COALESCE falls back to -999.9.
 */
const buildStationDataCsv = async (monthStart) => {
    const nextMonthStart = monthStart.clone().add(1, 'month');
    const dayColumns = [];
    for (let day = 1; day <= monthStart.daysInMonth(); day++) {
        dayColumns.push(
            `COALESCE(MAX(d.data) FILTER (WHERE EXTRACT(DAY FROM d.collection_date) = ${day} AND d.data >= 0), ${NO_DATA}) AS "${day}"`
        );
    }

    const query = `
        SELECT
            sd.station_code AS station_id,
            ${dayColumns.join(',\n            ')}
        FROM public.station_details sd
        LEFT JOIN public.station_daily_data d
               ON d.station_id = sd.station_code
              AND d.collection_date >= $1
              AND d.collection_date <  $2
        WHERE sd.flag = 1
        GROUP BY sd.station_code
        ORDER BY sd.station_code;
    `;

    const result = await client.query(query, [monthStart.format('YYYY-MM-DD'), nextMonthStart.format('YYYY-MM-DD')]);
    return toCsv(result.fields.map((f) => f.name), result.rows);
};

/** DRMS_METADATA: the same flag = 1 stations with their block, district, state, subdivision and region. */
const buildStationMetadataCsv = async () => {
    const query = `
        SELECT
            TRIM(sd.centre_name)  AS centre,
            sd.station_name,
            sd.station_code,
            sd.latitude,
            sd.longitude,
            sd.block_name,
            sd.block_code,
            ndd.district_name,
            ndd.district_code,
            ndd.district_area,
            ndd.state_name,
            ndd.state_code,
            ndd.subdiv_name AS subdivision_name,
            ndd.subdiv_code AS subdivision_code,
            ndd.region_name,
            ndd.region_code
        FROM public.station_details sd
        LEFT JOIN public.normal_district_details ndd ON ndd.district_code = sd.district_code
        WHERE sd.flag = 1
        ORDER BY ndd.region_name, ndd.subdiv_name, ndd.state_name, ndd.district_name, sd.station_name, sd.station_code;
    `;

    const result = await client.query(query);
    return toCsv(METADATA_COLUMNS, result.rows);
};

/** RFC 4180 quoting; line breaks inside a value (some block names have them) become spaces. */
const toCsv = (columns, rows) => {
    const cell = (value) => {
        if (value === null || value === undefined) return '';
        const text = String(value).replace(/[\r\n]+/g, ' ').trim();
        return /[",]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const lines = [columns.join(',')];
    for (const row of rows) {
        lines.push(columns.map((c) => cell(row[c])).join(','));
    }
    return lines.join('\n') + '\n';
};

const ftpPut = (ftpClient, content, remotePath) =>
    new Promise((resolve, reject) => {
        ftpClient.put(Buffer.from(content, 'utf8'), remotePath, (err) => (err ? reject(err) : resolve()));
    });

/**
 * Builds both files for last month, keeps a local copy, then uploads them to
 * /home/imdhydromet/irains_drmsdata/<run date YYYYMMDD>/. Throws on any failure
 * so the cron logs it as failed.
 */
exports.uploadMonthlyDRMSAndMetadata = async () => {
    const runDate = moment.tz('Asia/Kolkata');
    const monthStart = runDate.clone().subtract(1, 'month').startOf('month');
    const monthTag = monthStart.format('YYYY_MM'); // e.g. 2026_09

    const files = [
        { name: `IRAINS_DATA_${monthTag}.csv`, content: await buildStationDataCsv(monthStart) },
        { name: `DRMS_METADATA_${monthTag}.csv`, content: await buildStationMetadataCsv() },
    ];

    // Saved before the upload, so the files exist even if the FTP server is down.
    fs.mkdirSync(localOutputDir, { recursive: true });
    for (const f of files) {
        fs.writeFileSync(path.join(localOutputDir, f.name), f.content);
    }

    const remoteDatedDir = `${remoteBaseDir}/${runDate.format('YYYYMMDD')}`;
    const ftpClient = new ftp();
    try {
        await new Promise((resolve, reject) => {
            ftpClient.on('ready', resolve);
            ftpClient.on('error', reject);
            ftpClient.connect(ftpConfig);
        });

        await new Promise((resolve, reject) => {
            ftpClient.mkdir(remoteDatedDir, true, (err) => {
                if (err && !err.message.includes('already exists')) return reject(err);
                resolve();
            });
        });

        for (const f of files) {
            await ftpPut(ftpClient, f.content, `${remoteDatedDir}/${f.name}`);
            console.log(`[MONTHLY FTP] Uploaded ${f.name} → ${remoteDatedDir}/`);
        }
    } finally {
        ftpClient.end();
    }

    return { month: monthTag, remoteFolder: remoteDatedDir, files: files.map((f) => f.name) };
};

// Exported so the two files can be built and checked without uploading.
exports.buildStationDataCsv = buildStationDataCsv;
exports.buildStationMetadataCsv = buildStationMetadataCsv;
