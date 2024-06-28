const express = require("express")
const router = express.Router()
const { insertStationData} = require("../controllers/scripts/station/stationDailyData")
const { createStationDetailsTable } = require("../controllers/scripts/station/station_details")
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { fetchStationData ,updateStationData, addNewStation, editStation, deleteStation, insertMultipleStations, insertRainfallFile} = require("../controllers/Station")


// ********************************************************************************************************
//                                      Station routes
// ********************************************************************************************************
router.get("/insertStationData", insertStationData);
router.post("/insertMultipleStations", upload.single('file'), insertMultipleStations);
router.post("/insertRainfallFile", upload.single('file'), insertRainfallFile);

router.get("/createStationDetailsTable", createStationDetailsTable);
router.post("/fetchStationData", fetchStationData);
router.post("/updateStationData", updateStationData);
router.post("/addNewStation", addNewStation);
router.post("/editStation", editStation);
router.post("/deleteStation", deleteStation);


module.exports = router;