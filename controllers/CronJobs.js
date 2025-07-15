const schedule = require('node-schedule');
const { AddDailyStationData} = require("../controllers/StationDataUpdates")
const { dailyDataUpdateReminder, dailyDataVerificationReminder} = require("../controllers/Email")
// Schedule a job to run at 1:29 PM every day
const job1 = schedule.scheduleJob('29 13 * * *', AddDailyStationData);
//12:30
const job2 = schedule.scheduleJob('30 12 * * *', dailyDataUpdateReminder);
//1:15
const job3 = schedule.scheduleJob('15 13 * * *', dailyDataVerificationReminder);
//4:29PM
const job4 = schedule.scheduleJob('33 16 * * *', AddDailyStationData);
