const express = require("express");
const router = express.Router();

// const { fetchStateData, getAllStates} = require("../controllers/State")
const {
  getSpatialDistributionData,
} = require("../controllers/SpatialDistribution");

// ********************************************************************************************************
//                                      Spatial Distribution routes
// ********************************************************************************************************

// get single day data
// router.post("/fetchStateData", fetchStateData);

router.get("/getSpatialDistributionData", getSpatialDistributionData);

module.exports = router;
