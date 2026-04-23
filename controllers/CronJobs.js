const schedule = require('node-schedule');
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


// ─── Existing — every 30 min 1:29PM to 5:59PM ────────────────────────────────
const cronPatterns = [
    '29 13 * * *', // 1:29 PM
    '59 13 * * *', // 1:59 PM
    '29 14 * * *', // 2:29 PM
    '59 14 * * *', // 2:59 PM
    '29 15 * * *', // 3:29 PM
    '59 15 * * *', // 3:59 PM
    '29 16 * * *', // 4:29 PM
    '59 16 * * *', // 4:59 PM
    '29 17 * * *', // 5:29 PM
    '59 17 * * *'  // 5:59 PM
];

const jobs = cronPatterns.map((pattern, index) =>
    schedule.scheduleJob(pattern, AddDailyStationData)
);


// ─── Other existing jobs ──────────────────────────────────────────────────────
const seasonalJobs  = schedule.scheduleJob('01 23 * * *', aggregateCurrentSeasonData);
const seasonalJobs2 = schedule.scheduleJob('01 15 * * *', aggregateCurrentSeasonData);
const job2 = schedule.scheduleJob('30 12 * * *', dailyDataUpdateReminder);  // 12:30 PM
const job3 = schedule.scheduleJob('15 13 * * *', dailyDataVerificationReminder); // 1:15 PM
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


// ─── AWS — all states every 15 minutes all day ───────────────────────────────
const awsJobs = ['0 * * * *', '15 * * * *', '30 * * * *', '45 * * * *'].map((pattern) =>
    schedule.scheduleJob(pattern, async () => {
        console.log(`[AWS CRON] Running at ${new Date().toLocaleString()}`);
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
    })
);


// ─── Run once immediately on server start ────────────────────────────────────
(async () => {
    console.log("[AWS] Initial fetch on server start...");
    try { await fetchAndStoreUP();          } catch (e) { console.error("[UP AWS] Init failed:",          e.message); }
    try { await fetchAndStoreNHP();         } catch (e) { console.error("[NHP AWS] Init failed:",         e.message); }
    try { await fetchAndStoreZomato();      } catch (e) { console.error("[ZOMATO AWS] Init failed:",      e.message); }
    try { await fetchAndStoreMeghalaya();   } catch (e) { console.error("[MEG AWS] Init failed:",         e.message); }
    try { await fetchAndStoreMizoram();     } catch (e) { console.error("[MIZ AWS] Init failed:",         e.message); }
    try { await fetchAndStoreTamilnadu();   } catch (e) { console.error("[TN AWS] Init failed:",          e.message); }
    try { await fetchAndStoreUttarakhand(); } catch (e) { console.error("[UK AWS] Init failed:",          e.message); }
    try { await fetchAndStoreTelangana();   } catch (e) { console.error("[TG AWS] Init failed:",          e.message); }
    try { await fetchAndStoreKarnataka();   } catch (e) { console.error("[KA AWS] Init failed:",          e.message); }
    try { await fetchAndStoreIITMMumbai();  } catch (e) { console.error("[IITM MUM] Init failed:",        e.message); }
})();