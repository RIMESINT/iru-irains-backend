const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/scripts/aws/awsRealtimeAnalytics");

// ── ARG / AWS CUMULATIVE + REAL-TIME ANALYTICS ───────────────────────────────
router.post("/aws-realtime/filters",           ctrl.fetchFilters);
router.post("/aws-realtime/sources",           ctrl.fetchSourceHealth);
router.post("/aws-realtime/unmapped-stations", ctrl.fetchUnmapped);
router.post("/aws-realtime/timeline",          ctrl.fetchTimeline);
router.post("/aws-realtime/cumulative",        ctrl.fetchCumulative);
router.post("/aws-realtime/station-series",    ctrl.fetchStationSeries);

module.exports = router;
