const express = require("express");
const router  = express.Router();

// ── IMPORTS ───────────────────────────────────────────────────────────────────
const upCtrl          = require("../controllers/scripts/aws/upAwsController");
const nhpCtrl         = require("../controllers/scripts/aws/nhpAwsController");
const zomatoCtrl      = require("../controllers/scripts/aws/zomatoAwsController");
const meghalayaCtrl   = require("../controllers/scripts/aws/meghalayaAwsController");
const mizoramCtrl     = require("../controllers/scripts/aws/mizoramAwsController");
const tamilnaduCtrl   = require("../controllers/scripts/aws/tamilnaduAwsController");
const uttarakhandCtrl = require("../controllers/scripts/aws/uttarakhandAwsController");
const telanganaCtrl   = require("../controllers/scripts/aws/telanganaAwsController");
const karnatakaCtrl   = require("../controllers/scripts/aws/karnatakaAwsController");
const iitmMumbaiCtrl  = require("../controllers/scripts/aws/iitmMumbaiController");
const stateAwsCtrl    = require("../controllers/scripts/aws/stateAwsUnifiedController");
const awsStationCtrl  = require("../controllers/scripts/aws/aws_station");


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
router.post("/mizoram-aws/daily",            mizoramCtrl.fetchDailyData);
router.post("/mizoram-aws/hourly",           mizoramCtrl.fetchHourlyData);
router.post("/mizoram-aws/slot",             mizoramCtrl.fetchSlotData);
router.post("/mizoram-aws/cumulative",       mizoramCtrl.fetchCumulativeData);
router.post("/mizoram-aws/district-summary", mizoramCtrl.fetchDistrictSummary);


// ── TAMILNADU AWS ─────────────────────────────────────────────────────────────
router.post("/tamilnadu-aws/daily",            tamilnaduCtrl.fetchDailyData);
router.post("/tamilnadu-aws/hourly",           tamilnaduCtrl.fetchHourlyData);
router.post("/tamilnadu-aws/slot",             tamilnaduCtrl.fetchSlotData);
router.post("/tamilnadu-aws/cumulative",       tamilnaduCtrl.fetchCumulativeData);
router.post("/tamilnadu-aws/district-summary", tamilnaduCtrl.fetchDistrictSummary);
router.post("/tamilnadu-aws/block-summary",    tamilnaduCtrl.fetchBlockSummary);


// ── UTTARAKHAND AWS ───────────────────────────────────────────────────────────
router.post("/uttarakhand-aws/daily",            uttarakhandCtrl.fetchDailyData);
router.post("/uttarakhand-aws/hourly",           uttarakhandCtrl.fetchHourlyData);
router.post("/uttarakhand-aws/slot",             uttarakhandCtrl.fetchSlotData);
router.post("/uttarakhand-aws/cumulative",       uttarakhandCtrl.fetchCumulativeData);
router.post("/uttarakhand-aws/district-summary", uttarakhandCtrl.fetchDistrictSummary);


// ── TELANGANA AWS ─────────────────────────────────────────────────────────────
router.post("/telangana-aws/daily",            telanganaCtrl.fetchDailyData);
router.post("/telangana-aws/hourly",           telanganaCtrl.fetchHourlyData);
router.post("/telangana-aws/slot",             telanganaCtrl.fetchSlotData);
router.post("/telangana-aws/cumulative",       telanganaCtrl.fetchCumulativeData);
router.post("/telangana-aws/district-summary", telanganaCtrl.fetchDistrictSummary);


// ── KARNATAKA AWS ─────────────────────────────────────────────────────────────
router.post("/karnataka-aws/daily",            karnatakaCtrl.fetchDailyData);
router.post("/karnataka-aws/hourly",           karnatakaCtrl.fetchHourlyData);
router.post("/karnataka-aws/slot",             karnatakaCtrl.fetchSlotData);
router.post("/karnataka-aws/cumulative",       karnatakaCtrl.fetchCumulativeData);
router.post("/karnataka-aws/district-summary", karnatakaCtrl.fetchDistrictSummary);


// ── STATE AWS UNIFIED ─────────────────────────────────────────────────────────
router.post("/state-aws/fetchFilteredStationUnifiedFile", stateAwsCtrl.fetchFilteredStationUnifiedFile);


// ── IITM MUMBAI ARG ───────────────────────────────────────────────────────────
router.post("/iitm-mumbai/daily",            iitmMumbaiCtrl.fetchDailyData);
router.post("/iitm-mumbai/hourly",           iitmMumbaiCtrl.fetchHourlyData);
router.post("/iitm-mumbai/slot",             iitmMumbaiCtrl.fetchSlotData);
router.post("/iitm-mumbai/cumulative",       iitmMumbaiCtrl.fetchCumulativeData);
router.post("/iitm-mumbai/district-summary", iitmMumbaiCtrl.fetchDistrictSummary);


// ── DEPARTURE APIS (all 10 states × 3 endpoints each) ────────────────────────

// UP
router.post("/up-aws/actual-departure",   upCtrl.fetchActualDeparture);
router.post("/up-aws/departure-analysis", upCtrl.fetchDepartureAnalysis);
router.post("/up-aws/departure-export",   upCtrl.fetchDepartureForAPIexport);

// NHP
router.post("/nhp-aws/actual-departure",   nhpCtrl.fetchActualDeparture);
router.post("/nhp-aws/departure-analysis", nhpCtrl.fetchDepartureAnalysis);
router.post("/nhp-aws/departure-export",   nhpCtrl.fetchDepartureForAPIexport);

// ZOMATO
router.post("/zomato-aws/actual-departure",   zomatoCtrl.fetchActualDeparture);
router.post("/zomato-aws/departure-analysis", zomatoCtrl.fetchDepartureAnalysis);
router.post("/zomato-aws/departure-export",   zomatoCtrl.fetchDepartureForAPIexport);

// MEGHALAYA
router.post("/meghalaya-aws/actual-departure",   meghalayaCtrl.fetchActualDeparture);
router.post("/meghalaya-aws/departure-analysis", meghalayaCtrl.fetchDepartureAnalysis);
router.post("/meghalaya-aws/departure-export",   meghalayaCtrl.fetchDepartureForAPIexport);

// MIZORAM
router.post("/mizoram-aws/actual-departure",   mizoramCtrl.fetchActualDeparture);
router.post("/mizoram-aws/departure-analysis", mizoramCtrl.fetchDepartureAnalysis);
router.post("/mizoram-aws/departure-export",   mizoramCtrl.fetchDepartureForAPIexport);

// TAMILNADU
router.post("/tamilnadu-aws/actual-departure",   tamilnaduCtrl.fetchActualDeparture);
router.post("/tamilnadu-aws/departure-analysis", tamilnaduCtrl.fetchDepartureAnalysis);
router.post("/tamilnadu-aws/departure-export",   tamilnaduCtrl.fetchDepartureForAPIexport);

// UTTARAKHAND
router.post("/uttarakhand-aws/actual-departure",   uttarakhandCtrl.fetchActualDeparture);
router.post("/uttarakhand-aws/departure-analysis", uttarakhandCtrl.fetchDepartureAnalysis);
router.post("/uttarakhand-aws/departure-export",   uttarakhandCtrl.fetchDepartureForAPIexport);

// TELANGANA
router.post("/telangana-aws/actual-departure",   telanganaCtrl.fetchActualDeparture);
router.post("/telangana-aws/departure-analysis", telanganaCtrl.fetchDepartureAnalysis);
router.post("/telangana-aws/departure-export",   telanganaCtrl.fetchDepartureForAPIexport);

// KARNATAKA
router.post("/karnataka-aws/actual-departure",   karnatakaCtrl.fetchActualDeparture);
router.post("/karnataka-aws/departure-analysis", karnatakaCtrl.fetchDepartureAnalysis);
router.post("/karnataka-aws/departure-export",   karnatakaCtrl.fetchDepartureForAPIexport);

// IITM MUMBAI
router.post("/iitm-mumbai/actual-departure",   iitmMumbaiCtrl.fetchActualDeparture);
router.post("/iitm-mumbai/departure-analysis", iitmMumbaiCtrl.fetchDepartureAnalysis);
router.post("/iitm-mumbai/departure-export",   iitmMumbaiCtrl.fetchDepartureForAPIexport);


// ── AWS STATION DAILY STORE ───────────────────────────────────────────────────
router.post("/aws-station/store-override", awsStationCtrl.storeOverride);
router.post("/aws-station/store-continue", awsStationCtrl.storeContinue);
router.post("/aws-station/store-cron",     awsStationCtrl.storeCron);


module.exports = router;