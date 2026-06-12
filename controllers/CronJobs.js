const schedule = require('node-schedule');
const axios = require('axios');
const { AddDailyStationData } = require("../controllers/StationDataUpdates");
const { dailyDataUpdateReminder, dailyDataVerificationReminder } = require("../controllers/Email");
const { sendBulkReports } = require('./emailController');
const { aggregateCurrentSeasonData } = require('./scripts/all/calculateAndIncludeAllDatesData');
// const { uploadMonthlyDRMSAndMetadata } = require('../controllers/ftp/shared.js');
const {
    fetchAndStoreUP,
    fetchAndStoreNHP,
    fetchAndStoreZomato,
    fetchAndStoreMeghalaya,
    fetchAndStoreMizoram,
    fetchAndStoreTamilnadu,
    fetchAndStoreUttarakhand,
    fetchAndStoreTelangana,
    fetchAndStoreKarnataka,
    fetchAndStoreIITMMumbai
} = require("../controllers/scripts/aws/awsFetcher");
const { runDailyStore } = require("../controllers/scripts/aws/aws_station");


// ─── Existing — every 30 min 10:30AM to 6:00PM ───────────────────────────────
const cronPatterns = [
    '30 10 * * *', // 10:30 AM
    '00 11 * * *', // 11:00 AM
    '30 11 * * *', // 11:30 AM
    '00 12 * * *', // 12:00 PM
    '30 12 * * *', // 12:30 PM
    '00 13 * * *', // 1:00 PM
    '30 13 * * *', // 1:30 PM
    '00 14 * * *', // 2:00 PM
    '30 14 * * *', // 2:30 PM
    '00 15 * * *', // 3:00 PM
    '30 15 * * *', // 3:30 PM
    '00 16 * * *', // 4:00 PM
    '30 16 * * *', // 4:30 PM
    '00 17 * * *', // 5:00 PM
    '30 17 * * *', // 5:30 PM
    '00 18 * * *'  // 6:00 PM
];

const jobs = cronPatterns.map((pattern, index) =>
    schedule.scheduleJob(pattern, AddDailyStationData)
);


// ─── Other existing jobs ──────────────────────────────────────────────────────
const seasonalJobs  = schedule.scheduleJob('01 23 * * *', aggregateCurrentSeasonData);
const seasonalJobs2 = schedule.scheduleJob('01 15 * * *', aggregateCurrentSeasonData);
const job2 = schedule.scheduleJob('30 09 * * *', dailyDataUpdateReminder);  // 9:30 AM
const job3 = schedule.scheduleJob('15 10 * * *', dailyDataVerificationReminder); // 10:15 AM
// const job4 = schedule.scheduleJob('59 14 * * *', sendBulkReports);


// const job5 = schedule.scheduleJob('15 15 7 * *', async () => {
//     console.log(`\n[MONTHLY CRON] Starting DRMS & Metadata generation - ${new Date().toLocaleString()}`);
//     try {
//         await uploadMonthlyDRMSAndMetadata();
//         console.log("[MONTHLY CRON] Completed successfully\n");
//     } catch (error) {
//         console.error("[MONTHLY CRON] Failed:", error);
//     }
// });


// ─── Connectivity pre-check ──────────────────────────────────────────────────
const checkImdConnectivity = async () => {
    try {
        await axios.head("https://city.imd.gov.in", { timeout: 30000 });
        return true;
    } catch (err) {
        const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        console.error(`[AWS CRON] [${ts} IST] city.imd.gov.in connectivity check failed: ${err.message} | code: ${err.code || 'N/A'}`);
        return false;
    }
};

// ─── AWS — all states every 15 minutes all day ───────────────────────────────
const runAllAwsFetchers = async () => {
    console.log(`[AWS CRON] Running at ${new Date().toLocaleString()}`);
    const reachable = await checkImdConnectivity();
    if (!reachable) {
        console.error("[AWS CRON] city.imd.gov.in unreachable — skipping all fetchers");
        return;
    }
    try { await fetchAndStoreUP();          } catch (e) { console.error("[UP AWS] Failed:",          e.message); }
    try { await fetchAndStoreNHP();         } catch (e) { console.error("[NHP AWS] Failed:",         e.message); }
    try { await fetchAndStoreZomato();      } catch (e) { console.error("[ZOMATO AWS] Failed:",      e.message); }
    try { await fetchAndStoreMeghalaya();   } catch (e) { console.error("[MEG AWS] Failed:",         e.message); }
    try { await fetchAndStoreMizoram();     } catch (e) { console.error("[MIZ AWS] Failed:",         e.message); }
    try { await fetchAndStoreTamilnadu();   } catch (e) { console.error("[TN AWS] Failed:",          e.message); }
    try { await fetchAndStoreUttarakhand(); } catch (e) { console.error("[UK AWS] Failed:",          e.message); }
    try { await fetchAndStoreTelangana();   } catch (e) { console.error("[TG AWS] Failed:",          e.message); }
    try { await fetchAndStoreKarnataka();   } catch (e) { console.error("[KA AWS] Failed:",          e.message); }
    try { await fetchAndStoreIITMMumbai();  } catch (e) { console.error("[IITM MUM] Failed:",        e.message); }
};

const awsJobs = ['0 * * * *', '15 * * * *', '30 * * * *', '45 * * * *'].map((pattern) =>
    schedule.scheduleJob(pattern, runAllAwsFetchers)
);

// ─── AWS Station Daily Store — every day at 10:30 AM IST ─────────────────────
schedule.scheduleJob('30 10 * * *', async () => {
    const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[AWS STATION] Daily store triggered at ${ts} IST`);
    try {
        await runDailyStore();
    } catch (e) {
        console.error(`[AWS STATION] Daily store failed: ${e.message}`);
    }
});


// ─── Run once immediately on server start ────────────────────────────────────
console.log("[AWS] Initial fetch on server start...");
runAllAwsFetchers();


