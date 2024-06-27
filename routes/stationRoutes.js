const express = require("express")
const router = express.Router()
const { insertStationData} = require("../controllers/scripts/station/stationDailyData")
const { createStationDetailsTable } = require("../controllers/scripts/station/station_details")
const { fetchStationData, insertMultipleStations } = require("../controllers/Station")
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ********************************************************************************************************
//                                      Station routes
// ********************************************************************************************************
router.get("/insertStationData", insertStationData);
router.post("/insertMultipleStations", upload.single('file'), insertMultipleStations);

router.get("/createStationDetailsTable", createStationDetailsTable);
router.post("/fetchStationData", fetchStationData);

module.exports = router;