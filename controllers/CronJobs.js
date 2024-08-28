const schedule = require('node-schedule');
const { AddDailyStationData} = require("../controllers/StationDataUpdates")
const { dailyDataUpdateReminder, dailyDataVerificationReminder} = require("../controllers/Email")
// Schedule a job to run at 2:00 PM every day
const job1 = schedule.scheduleJob('59 7 * * *', AddDailyStationData);
//12:30
const job2 = schedule.scheduleJob('1 7 * * *', dailyDataUpdateReminder);
const job3 = schedule.scheduleJob('45 7 * * *', dailyDataVerificationReminder);
