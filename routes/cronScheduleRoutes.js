const express = require("express");
const router = express.Router();
const {
    getAllSchedules,
    createSchedule,
    updateSchedule,
    toggleSchedule,
    deleteSchedule
} = require("../controllers/CronScheduleController");

// ********************************************************************************************************
//                                     Cron Job Schedules routes
// ********************************************************************************************************

router.get("/cron-schedules", getAllSchedules);
router.post("/cron-schedules", createSchedule);
router.put("/cron-schedules/:job_key", updateSchedule);
router.patch("/cron-schedules/:job_key/toggle", toggleSchedule);
router.delete("/cron-schedules/:job_key", deleteSchedule);

module.exports = router;
