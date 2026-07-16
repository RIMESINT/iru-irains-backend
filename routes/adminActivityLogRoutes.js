const express = require("express");
const router = express.Router();
const { recordActivity, getActivityLogs, getRealtimeConfig } = require("../controllers/AdminActivityLogController");

router.post("/admin/activity-log", recordActivity);
router.get("/admin/activity-logs", getActivityLogs);
router.get("/admin/realtime-config", getRealtimeConfig);

module.exports = router;
