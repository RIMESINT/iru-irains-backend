const schedule = require('node-schedule');
const { AddDailyStationData} = require("../controllers/StationDataUpdates")
const { dailyDataUpdateReminder, dailyDataVerificationReminder} = require("../controllers/Email")
// Schedule a job to run at 2:00 PM every day
const job1 = schedule.scheduleJob('7 13 * * *', AddDailyStationData);
const job2 = schedule.scheduleJob('7 13 * * *', dailyDataUpdateReminder);
const job3 = schedule.scheduleJob('7 13 * * *', dailyDataVerificationReminder);
