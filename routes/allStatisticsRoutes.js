const express = require("express");
const router = express.Router();
const {
    getDefaultSelection,
    saveDefaultSelection,
    toggleDefaultSelection,
    clearDefaultSelection,
} = require("../controllers/AllStatisticsSelectionController");

// ALL STATISTICS — which products open ticked, per user.
router.get("/all-statistics/default-selection", getDefaultSelection);
router.post("/all-statistics/default-selection", saveDefaultSelection);
router.post("/all-statistics/default-selection/toggle", toggleDefaultSelection);
router.delete("/all-statistics/default-selection", clearDefaultSelection);

module.exports = router;
