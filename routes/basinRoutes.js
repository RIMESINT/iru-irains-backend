const express = require("express");
const router = express.Router();

const { fetchBasinStationRainfallDataAPIexport } = require("../controllers/Basin");

// ********************************************************************************************************
//                                      Basin routes
// ********************************************************************************************************

router.post("/fetchBasinStationRainfallDataAPIexport", fetchBasinStationRainfallDataAPIexport);

module.exports = router;
