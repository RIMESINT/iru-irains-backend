const express = require("express")
const router = express.Router()
const { insertStationData} = require("../controllers/scripts/station/stationDailyData")
const { createStationDetailsTable } = require("../controllers/scripts/station/station_details")
const { fetchStationData ,updateStationData, addNewStation, editStation, deleteStation} = require("../controllers/Station")


// ********************************************************************************************************
//                                      Station routes
// ********************************************************************************************************
router.get("/insertStationData", insertStationData);
router.get("/createStationDetailsTable", createStationDetailsTable);
router.post("/fetchStationData", fetchStationData);
router.post("/updateStationData", updateStationData);
router.post("/addNewStation", addNewStation);
router.post("/editStation", editStation);
router.post("/deleteStation", deleteStation);


module.exports = router;