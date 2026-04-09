const express = require("express");
const router = express.Router();
const {
    fetchDailyData,
    fetchHourlyData,
    fetchSlotData,
    fetchCumulativeData,
    fetchDistrictSummary
} = require("../controllers/scripts/aws/upAwsController");

router.post("/daily",            fetchDailyData);
router.post("/hourly",           fetchHourlyData);
router.post("/slot",             fetchSlotData);
router.post("/cumulative",       fetchCumulativeData);
router.post("/district-summary", fetchDistrictSummary);

module.exports = router;