const express = require("express");
const router  = express.Router();
const { getAllSchedules, updateSchedule, toggleSchedule } = require("../controllers/SchedulerController");

router.get("/scheduler/jobs",            getAllSchedules);
router.put("/scheduler/jobs/:id",        updateSchedule);
router.patch("/scheduler/jobs/:id/toggle", toggleSchedule);

module.exports = router;
