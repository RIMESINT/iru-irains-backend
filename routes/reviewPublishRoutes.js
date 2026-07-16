const express = require("express");
const router = express.Router();
const { recordReviewPublishOfficerAccess } = require("../controllers/StationDataUpdates");

router.post("/review-and-publish/officer-access", recordReviewPublishOfficerAccess);

module.exports = router;
