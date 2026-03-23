const express = require("express");
const router  = express.Router();
const {
  trackVisit,
  getDailyCount,
  getHistory
} = require("../controllers/scripts/admin-panel/visitorController");  // adjust path as needed

router.post("/visitor/track",   trackVisit);
router.get("/visitor/count",    getDailyCount);
router.get("/visitor/history",  getHistory);

module.exports = router;