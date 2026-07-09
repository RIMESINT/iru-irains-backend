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
const client = require("../connection");


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


// ─── Data Entry Lock — auto-open 8:30 AM, auto-lock 2:00 PM IST ──────────────
// Admins can still flip the toggle manually anytime from Data Management ->
// Calculation -> Review and Publish (data_entry_lock table); it just gets
// overridden by whichever of these two triggers fires next.
const setDataEntryLock = async (is_locked) => {
    const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    try {
        await client.query(
            `INSERT INTO data_entry_lock (id, is_locked, updated_at)
             VALUES (1, $1, now())
             ON CONFLICT (id) DO UPDATE SET is_locked = $1, updated_at = now()`,
            [is_locked]
        );
        console.log(`[DATA ENTRY LOCK] ${is_locked === 1 ? 'Locked' : 'Unlocked'} at ${ts} IST`);
    } catch (e) {
        console.error(`[DATA ENTRY LOCK] Failed to set is_locked=${is_locked}: ${e.message}`);
    }
};

schedule.scheduleJob('30 08 * * *', () => setDataEntryLock(0)); // 8:30 AM — open data entry
schedule.scheduleJob('00 14 * * *', () => setDataEntryLock(1)); // 2:00 PM — lock data entry for review


// ─── Publish Gate — auto-publish 2:00 PM-11:59 PM, auto-hold-back 12:00 AM-1:59 PM IST ──
// Applies to all four mcorhq_type roles (map_data_schedules.publish). Admins can
// still flip any role's toggle manually anytime from Review and Publish; it just
// gets overridden by whichever of these two triggers fires next.
const setPublishForRole = async (role, publish) => {
    try {
        await client.query(
            `UPDATE map_data_schedules SET publish = $2, updated_at = now() WHERE mcorhq_type = $1`,
            [role, publish]
        );
    } catch (e) {
        console.error(`[PUBLISH GATE] Failed to set publish=${publish} for ${role}: ${e.message}`);
    }
};

const setPublishAllRoles = async (publish) => {
    const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    await setPublishForRole('mc', publish);
    await setPublishForRole('hq', publish);
    await setPublishForRole('sp', publish);
    await setPublishForRole('public', publish);
    console.log(`[PUBLISH GATE] MC, HQ, SP & Public ${publish === 1 ? 'published' : 'held back'} at ${ts} IST`);
};

schedule.scheduleJob('00 14 * * *', () => setPublishAllRoles(1)); // 2:00 PM — publish today's data
schedule.scheduleJob('00 00 * * *', () => setPublishAllRoles(0)); // 12:00 AM — hold back today's data


// ─── Run once immediately on server start ────────────────────────────────────
console.log("[AWS] Initial fetch on server start...");
runAllAwsFetchers();


