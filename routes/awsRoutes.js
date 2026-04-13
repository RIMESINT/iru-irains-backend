const express     = require("express");
const router      = express.Router();

const upCtrl         = require("../controllers/scripts/aws/upAwsController");
const nhpCtrl        = require("../controllers/scripts/aws/nhpAwsController");
const zomatoCtrl     = require("../controllers/scripts/aws/zomatoAwsController");
const meghalayaCtrl  = require("../controllers/scripts/aws/meghalayaAwsController");
// const mizoramCtrl    = require("../controllers/scripts/aws/mizoramAwsController");

// ── UP AWS ────────────────────────────────────────────────────────────────────
router.post("/up-aws/daily",            upCtrl.fetchDailyData);
router.post("/up-aws/hourly",           upCtrl.fetchHourlyData);
router.post("/up-aws/slot",             upCtrl.fetchSlotData);
router.post("/up-aws/cumulative",       upCtrl.fetchCumulativeData);
router.post("/up-aws/district-summary", upCtrl.fetchDistrictSummary);

// ── NHP AWS ───────────────────────────────────────────────────────────────────
router.post("/nhp-aws/daily",            nhpCtrl.fetchDailyData);
router.post("/nhp-aws/hourly",           nhpCtrl.fetchHourlyData);
router.post("/nhp-aws/slot",             nhpCtrl.fetchSlotData);
router.post("/nhp-aws/cumulative",       nhpCtrl.fetchCumulativeData);
router.post("/nhp-aws/district-summary", nhpCtrl.fetchDistrictSummary);

// ── ZOMATO AWS ────────────────────────────────────────────────────────────────
router.post("/zomato-aws/daily",        zomatoCtrl.fetchDailyData);
router.post("/zomato-aws/hourly",       zomatoCtrl.fetchHourlyData);
router.post("/zomato-aws/slot",         zomatoCtrl.fetchSlotData);
router.post("/zomato-aws/cumulative",   zomatoCtrl.fetchCumulativeData);
router.post("/zomato-aws/city-summary", zomatoCtrl.fetchCitySummary);

// ── MEGHALAYA AWS ─────────────────────────────────────────────────────────────
router.post("/meghalaya-aws/daily",            meghalayaCtrl.fetchDailyData);
router.post("/meghalaya-aws/hourly",           meghalayaCtrl.fetchHourlyData);
router.post("/meghalaya-aws/slot",             meghalayaCtrl.fetchSlotData);
router.post("/meghalaya-aws/cumulative",       meghalayaCtrl.fetchCumulativeData);
router.post("/meghalaya-aws/district-summary", meghalayaCtrl.fetchDistrictSummary);

// ── MIZORAM AWS ───────────────────────────────────────────────────────────────
// router.post("/mizoram-aws/daily",            mizoramCtrl.fetchDailyData);
// router.post("/mizoram-aws/hourly",           mizoramCtrl.fetchHourlyData);
// router.post("/mizoram-aws/slot",             mizoramCtrl.fetchSlotData);
// router.post("/mizoram-aws/cumulative",       mizoramCtrl.fetchCumulativeData);
// router.post("/mizoram-aws/district-summary", mizoramCtrl.fetchDistrictSummary);

module.exports = router;