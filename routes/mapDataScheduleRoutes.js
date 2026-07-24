const express = require("express");
const router = express.Router();
const { getSchedule, setSchedule } = require("../controllers/MapDataScheduleController");

router.get("/map-data-schedule/:role", getSchedule);
router.post("/map-data-schedule", setSchedule);

module.exports = router;
