const express = require("express");
const router = express.Router();
const { getLock, setLock } = require("../controllers/DataEntryLockController");

router.get("/data-entry-lock", getLock);
router.post("/data-entry-lock", setLock);

module.exports = router;
