const express = require("express")
const router = express.Router()
const { insertStationData} = require("../controllers/scripts/station/stationDailyData")
const { createStationDetailsTable } = require("../controllers/scripts/station/station_details")


// ********************************************************************************************************
//                                      Station routes
// ********************************************************************************************************
router.get("/insertStationData", insertStationData);
router.get("/createStationDetailsTable", createStationDetailsTable);

module.exports = router;