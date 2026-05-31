// controllers/ftp/shared.js

const xlsx = require('xlsx');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const ftp = require('ftp'); // npm install ftp
const client = require("../../connection");

// Import your PDF services
const PDFDistrictService = require('../scripts/pdf/pdfDistrictService');
const PDFStateService = require('../scripts/pdf/pdfStateService');
const PDFSubdivService = require('../scripts/pdf/pdfSubdivService');
const PDFRegionService = require('../scripts/pdf/pdfRegionService');

// Import fetchers (excluding block)
const district    = require("../District");
const state       = require("../State");
const subdivision = require("../SubDivision");
const region      = require("../Region");
const country     = require("../Country");
const awsCtrl     = require("../AwsInclusiveControllers");
const { isAwsEnabled } = require("../../utils/calculationsMode");

// Returns the right set of fetchers based on the DB toggle
const getFetchers = async () => {
    const useAws = await isAwsEnabled();
    return useAws ? {
        district:    (s, e, cd, dt) => awsCtrl.fetchDistrictWithAWS(s, e),
        state:       (s, e, cd, dt) => awsCtrl.fetchStateWithAWS(s, e),
        subdivision: (s, e, cd, dt) => awsCtrl.fetchSubDivisionWithAWS(s, e),
        region:      (s, e, cd, dt) => awsCtrl.fetchRegionWithAWS(s, e),
        country:     (s, e, cd, dt) => awsCtrl.fetchCountryWithAWS(s, e),
    } : {
        district:    district.fetchBetweenDates,
        state:       state.fetchBetweenDates,
        subdivision: subdivision.fetchBetweenDates,
        region:      region.fetchBetweenDates,
        country:     country.fetchBetweenDates,
    };
};

// Keep legacy fetchers object for any direct references
const fetchers = {
    district:    district.fetchBetweenDates,
    state:       state.fetchBetweenDates,
    subdivision: subdivision.fetchBetweenDates,
    region:      region.fetchBetweenDates,
    country:     country.fetchBetweenDates,
};

const serviceMap = {
    district: PDFDistrictService,
    state: PDFStateService,
    subdivision: PDFSubdivService,
    region: PDFRegionService,
    country: null
};

const levelNames = {
    district: "District",
    state: "State",
    subdivision: "Subdivision",
    region: "Region",
    country: "Country"
};

// Local backup directory
const localOutputDir = path.join(__dirname, '../../monthly_drms_output');
if (!fs.existsSync(localOutputDir)) {
    fs.mkdirSync(localOutputDir, { recursive: true });
}

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

// Main function - generates and uploads 6 reports + metadata
exports.uploadMonthlyDRMSAndMetadata = async (req, res) => {
    let ftpClient = null;
    try {
        const today = moment();
        const todayStr = today.format('YYYYMMDD'); // e.g., 20260107
        const prevMonthStart = today.clone().subtract(1, 'month').startOf('month');
        const prevMonthEnd = today.clone().subtract(1, 'month').endOf('month');

        const fromDate = prevMonthStart.format('YYYY-MM-DD');
        const toDate = prevMonthEnd.format('YYYY-MM-DD');
        const currentDate = today.format('YYYY-MM-DD');

        // Read toggle once for the entire upload run
        const activeFetchers = await getFetchers();
        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        console.log(`\nStarting Monthly DRMS Upload for ${fromDate} to ${toDate}`);
        console.log(`Target FTP folder: ${remoteBaseDir}/${todayStr}/`);

        const dateRange = { startDate: fromDate, endDate: toDate };

        // Calculate season period
        const calculateSeasonPeriod = (startDate) => {
            const start = new Date(startDate);
            const month = start.getMonth();
            let seasonStart, seasonEnd;

            if (month >= 0 && month <= 1) {
                seasonStart = new Date(start.getFullYear(), 0, 1);
                seasonEnd = new Date(start.getFullYear(), 1, 29);
            } else if (month >= 2 && month <= 4) {
                seasonStart = new Date(start.getFullYear(), 2, 1);
                seasonEnd = new Date(start.getFullYear(), 4, 31);
            } else if (month >= 5 && month <= 8) {
                seasonStart = new Date(start.getFullYear(), 5, 1);
                seasonEnd = new Date(start.getFullYear(), 8, 30);
            } else {
                seasonStart = new Date(start.getFullYear(), 9, 1);
                seasonEnd = new Date(start.getFullYear(), 11, 31);
            }

            if (seasonEnd > new Date()) seasonEnd = new Date();

            return {
                startDate: moment(seasonStart).format('YYYY-MM-DD'),
                endDate: moment(seasonEnd).format('YYYY-MM-DD')
            };
        };

        const seasonPeriod = calculateSeasonPeriod(fromDate);

        // Connect to FTP
        ftpClient = new ftp();
        await new Promise((resolve, reject) => {
            ftpClient.on('ready', resolve);
            ftpClient.on('error', reject);
            ftpClient.connect(ftpConfig);
        });
        console.log('Connected to IMD FTP server');

        // Create dated folder: /home/imdhydromet/irains_drmsdata/20260107/
        const remoteDatedDir = `${remoteBaseDir}/${todayStr}`;
        await new Promise((resolve, reject) => {
            ftpClient.mkdir(remoteDatedDir, true, (err) => {
                if (err && !err.message.includes('already exists')) {
                    return reject(err);
                }
                console.log(`Ensured remote directory: ${remoteDatedDir}`);
                resolve();
            });
        });

        const uploadedFiles = [];

        // Generate and upload each report
        for (const [levelKey, fetchFunc] of Object.entries(activeFetchers)) {
            const levelName = levelNames[levelKey];
            const ServiceClass = serviceMap[levelKey];

            try {
                console.log(`\nGenerating ${levelName} report...`);

                let wb;

                if (ServiceClass) {
                    const service = new ServiceClass();

                    const [currentData, seasonData] = await Promise.all([
                        fetchFunc(fromDate, toDate, currentDate, specificDateTime),
                        fetchFunc(seasonPeriod.startDate, seasonPeriod.endDate, currentDate, specificDateTime)
                    ]);

                    if (levelKey === 'district') {
                        const [districtCurr, stateCurr, subdivCurr, districtSeason, stateSeason, subdivSeason] = await Promise.all([
                            activeFetchers.district(fromDate, toDate, currentDate, specificDateTime),
                            activeFetchers.state(fromDate, toDate, currentDate, specificDateTime),
                            activeFetchers.subdivision(fromDate, toDate, currentDate, specificDateTime),
                            activeFetchers.district(seasonPeriod.startDate, seasonPeriod.endDate, currentDate, specificDateTime),
                            activeFetchers.state(seasonPeriod.startDate, seasonPeriod.endDate, currentDate, specificDateTime),
                            activeFetchers.subdivision(seasonPeriod.startDate, seasonPeriod.endDate, currentDate, specificDateTime)
                        ]);
                        await service.setData(districtCurr, stateCurr, subdivCurr, districtSeason, stateSeason, subdivSeason, dateRange, seasonPeriod);
                    } else if (levelKey === 'state') {
                        const [stateCurr, regionCurr, stateSeason, regionSeason] = await Promise.all([
                            activeFetchers.state(fromDate, toDate, currentDate, specificDateTime),
                            activeFetchers.region(fromDate, toDate, currentDate, specificDateTime),
                            activeFetchers.state(seasonPeriod.startDate, seasonPeriod.endDate, currentDate, specificDateTime),
                            activeFetchers.region(seasonPeriod.startDate, seasonPeriod.endDate, currentDate, specificDateTime)
                        ]);
                        await service.setData(stateCurr, regionCurr, stateSeason, regionSeason, dateRange, seasonPeriod);
                    } else if (levelKey === 'subdivision') {
                        const [subdivCurr, regionCurr, subdivSeason, regionSeason] = await Promise.all([
                            activeFetchers.subdivision(fromDate, toDate, currentDate, specificDateTime),
                            activeFetchers.region(fromDate, toDate, currentDate, specificDateTime),
                            activeFetchers.subdivision(seasonPeriod.startDate, seasonPeriod.endDate, currentDate, specificDateTime),
                            activeFetchers.region(seasonPeriod.startDate, seasonPeriod.endDate, currentDate, specificDateTime)
                        ]);
                        await service.setData(subdivCurr, regionCurr, subdivSeason, regionSeason, dateRange, seasonPeriod);
                    } else if (levelKey === 'region') {
                        await service.setData(currentData, seasonData, dateRange, seasonPeriod);
                    }

                    wb = service.generateExcel();
                } else {
                    // Country level - raw data
                    const data = await fetchFunc(fromDate, toDate, currentDate, specificDateTime);
                    wb = xlsx.utils.book_new();
                    const ws = xlsx.utils.json_to_sheet(data);
                    xlsx.utils.book_append_sheet(wb, ws, "Country");
                }

                const fileName = `presentMonthDataFor${levelName}.xlsx`;
                const localPath = path.join(localOutputDir, fileName);
                const remotePath = `${remoteDatedDir}/${fileName}`;

                const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

                // Save locally (backup)
                fs.writeFileSync(localPath, buffer);

                // Upload to FTP
                await new Promise((resolve, reject) => {
                    ftpClient.put(buffer, remotePath, (err) => {
                        if (err) return reject(err);
                        console.log(`Uploaded: ${fileName} → ${remotePath}`);
                        resolve();
                    });
                });

                uploadedFiles.push({ level: levelName, file: fileName, uploaded: true });

            } catch (err) {
                console.error(`Failed to process ${levelName}:`, err.message);
                uploadedFiles.push({ level: levelName, file: `presentMonthDataFor${levelName}.xlsx`, uploaded: false, error: err.message });
            }
        }

        // Upload Station Metadata
        const metadataRows = await fetchStationMetadata();
        if (metadataRows?.length > 0) {
            const metaWb = xlsx.utils.book_new();
            const metaWs = xlsx.utils.json_to_sheet(metadataRows);
            xlsx.utils.book_append_sheet(metaWb, metaWs, "Station_Metadata");

            const metadataFileName = `stationMetadata_${todayStr}.xlsx`;
            const localMetaPath = path.join(localOutputDir, metadataFileName);
            const remoteMetaPath = `${remoteDatedDir}/${metadataFileName}`;
            const metaBuffer = xlsx.write(metaWb, { type: 'buffer', bookType: 'xlsx' });

            fs.writeFileSync(localMetaPath, metaBuffer);

            await new Promise((resolve, reject) => {
                ftpClient.put(metaBuffer, remoteMetaPath, (err) => {
                    if (err) return reject(err);
                    console.log(`Uploaded: ${metadataFileName} → ${remoteMetaPath}`);
                    resolve();
                });
            });

            uploadedFiles.push({ level: "Metadata", file: metadataFileName, uploaded: true });
        }

        console.log(`\nUpload completed! All files are in: ${remoteDatedDir}/`);
        console.log(`Local backup: ${localOutputDir}`);

        const response = {
            success: true,
            message: "Monthly DRMS data and metadata successfully uploaded to IMD FTP",
            uploadDate: todayStr,
            remoteFolder: remoteDatedDir,
            totalFiles: uploadedFiles.length,
            files: uploadedFiles
        };

        if (res) {
            res.status(200).json(response);
        } else {
            console.log(JSON.stringify(response, null, 2));
        }

    } catch (error) {
        console.error("Critical error during FTP upload:", error);
        if (res) {
            res.status(500).json({ success: false, error: error.message });
        }
    } finally {
        if (ftpClient) {
            ftpClient.end();
        }
    }
};

// Station Metadata Query
async function fetchStationMetadata() {
    try {
        const query = `
            SELECT
                CONCAT(TRIM(COALESCE(sd.centre_name, '')), ' ', TRIM(COALESCE(sd.centre_type, ''))) AS centre,
                sd.station_name,
                sd.station_code AS station_code,
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
            JOIN public.normal_district_details ndd ON ndd.district_code = sd.district_code
            WHERE sd.flag != 0
            ORDER BY ndd.region_name, ndd.subdiv_name, ndd.state_name, ndd.district_name, sd.block_name, sd.station_name;
        `;
        const result = await client.query(query);
        return result.rows;
    } catch (err) {
        console.error("Error fetching metadata:", err);
        return [];
    }
}