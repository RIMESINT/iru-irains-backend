const express     = require("express");
const router      = express.Router();

const upCtrl      = require("../controllers/scripts/aws/upAwsController");
const nhpCtrl     = require("../controllers/scripts/aws/nhpAwsController");
const zomatoCtrl  = require("../controllers/scripts/aws/zomatoAwsController");

// ── UP AWS ────────────────────────────────────────────────────────────────────
router.post("/up/daily",            upCtrl.fetchDailyData);
router.post("/up/hourly",           upCtrl.fetchHourlyData);
router.post("/up/slot",             upCtrl.fetchSlotData);
router.post("/up/cumulative",       upCtrl.fetchCumulativeData);
router.post("/up/district-summary", upCtrl.fetchDistrictSummary);

// ── NHP AWS ───────────────────────────────────────────────────────────────────
router.post("/nhp/daily",            nhpCtrl.fetchDailyData);
router.post("/nhp/hourly",           nhpCtrl.fetchHourlyData);
router.post("/nhp/slot",             nhpCtrl.fetchSlotData);
router.post("/nhp/cumulative",       nhpCtrl.fetchCumulativeData);
router.post("/nhp/district-summary", nhpCtrl.fetchDistrictSummary);

// ── ZOMATO AWS ────────────────────────────────────────────────────────────────
router.post("/zomato/daily",        zomatoCtrl.fetchDailyData);
router.post("/zomato/hourly",       zomatoCtrl.fetchHourlyData);
router.post("/zomato/slot",         zomatoCtrl.fetchSlotData);
router.post("/zomato/cumulative",   zomatoCtrl.fetchCumulativeData);
router.post("/zomato/city-summary", zomatoCtrl.fetchCitySummary);

module.exports = router;