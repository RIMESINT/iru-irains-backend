const express = require("express");
const router = express.Router();
const { getLock, setLock, getLockHistoryForDate } = require("../controllers/DataEntryLockController");

router.get("/data-entry-lock", getLock);
router.post("/data-entry-lock", setLock);
router.post("/data-entry-lock-history", getLockHistoryForDate);

module.exports = router;
