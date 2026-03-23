const schedule = require('node-schedule');
const { AddDailyStationData} = require("../controllers/StationDataUpdates")
const { dailyDataUpdateReminder, dailyDataVerificationReminder} = require("../controllers/Email");
const { sendBulkReports } = require('./emailController');
const { aggregateCurrentSeasonData } = require('./scripts/all/calculateAndIncludeAllDatesData'); // Adjust path as needed
// const { uploadMonthlyDRMSAndMetadata } = require('../controllers/ftp/shared.js'); 


// Schedule jobs to run every 30 minutes from 1:29 PM to 6:00 PM
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

// Other existing jobs
const seasonalJobs = schedule.scheduleJob('01 23 * * *',  aggregateCurrentSeasonData)
const seasonalJobs2 = schedule.scheduleJob('01 15 * * *',  aggregateCurrentSeasonData)
const job2 = schedule.scheduleJob('30 12 * * *', dailyDataUpdateReminder); // 12:30 PM
const job3 = schedule.scheduleJob('15 13 * * *', dailyDataVerificationReminder); // 1:15 PM
// const job4 = schedule.scheduleJob('59 14 * * *', sendBulkReports); // 14:59 ~~ 3:00PM

// const job5 = schedule.scheduleJob('15 15 7 * *', async () => {
//         console.log(`\n[MONTHLY CRON] Starting DRMS & Metadata generation - ${new Date().toLocaleString()}`);
//         try {
//             await uploadMonthlyDRMSAndMetadata(); // No req/res → logs to console
//             console.log("[MONTHLY CRON] Completed successfully\n");
//         } catch (error) {
//             console.error("[MONTHLY CRON] Failed:", error);
//         }
//     });

