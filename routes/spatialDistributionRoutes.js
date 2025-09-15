const express = require("express");
const router = express.Router();

const {
  getSpatialDistributionData,
  getSpatialDistributionDataState,
} = require("../controllers/SpatialDistribution");

// ********************************************************************************************************
//                                      Spatial Distribution routes
// ********************************************************************************************************

// Subdivision routes
router.get("/getSpatialDistributionData", getSpatialDistributionData);

// State routes
router.get("/getSpatialDistributionDataState", getSpatialDistributionDataState);

module.exports = router;
