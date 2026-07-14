const express = require("express");
const router  = express.Router();

const {
  trackVisit,
  getDailyCount,
  getTotalCount,
  getHistory
} = require("../controllers/scripts/admin-panel/visitorController");

const {
  toggleExclusion,
  excludeEntity,
  includeEntity,
  getExclusions,
  checkStatus,
  bulkExclusion
} = require("../controllers/scripts/admin-panel/calculationExclusion");

const {
  getAllStations
} = require("../controllers/scripts/admin-panel/stationListController");


// ── Visitor ──────────────────────────────────────────────────
router.post("/visitor/track",        trackVisit);
router.get("/visitor/count",         getDailyCount);
router.get("/visitor/total-count",   getTotalCount);
router.get("/visitor/history",       getHistory);


// ── Calculation Exclusions ───────────────────────────────────
router.post("/calculation-exclusion/toggle",         toggleExclusion);
router.post("/calculation-exclusion/exclude",        excludeEntity);
router.post("/calculation-exclusion/include",        includeEntity);
router.post("/calculation-exclusion/get-exclusions", getExclusions);
router.post("/calculation-exclusion/check-status",   checkStatus);
router.post("/calculation-exclusion/bulk",           bulkExclusion);
router.post("/calculation-exclusion/bulk-toggle",    bulkExclusion);


// ── Station List (for exclusion UI) ─────────────────────────
router.get("/getStationsForExclusion", getAllStations);


module.exports = router;
