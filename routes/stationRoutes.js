const express = require("express")
const router = express.Router()
const { insertStationData} = require("../controllers/scripts/station/stationDailyData")
const { createStationDetailsTable, insertLatLongInStationDetails } = require("../controllers/scripts/station/station_details")
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { fetchStationData,
        // updateStationData, 
        addNewStation, 
        editStation, 
        deleteStation, 
        insertMultipleStations, 
        fetchStationDataInRadius,
        fetchStationWithMaxRainfall, 
        // verifyStationData, 
        // verifyMultipleStationData, 
        fetchInRangeStationdata,
        fetchStationLogs,
        fetchAllDatesAndDataOfStation,
    } = require("../controllers/Station")
const { insertStationDataFtp} = require("../controllers/scripts/station/stationDailyDataFtp")

const { 
    fetchStationDataNew,
    updateStationData, 
    // addNewStation, 
    // editStation, 
    // deleteStation, 
    // insertMultipleStations, 
    insertRainfallFile, 
    verifyStationData, 
    verifyMultipleStationData, 
    fetchInRangeStationdataNew,
    // fetchStationLogs,
    // fetchAllDatesAndDataOfStation,
    AddDailyStationData
} = require("../controllers/StationDataUpdates")

// ********************************************************************************************************
//                                      Station routes
// ********************************************************************************************************
router.get("/insertStationData", insertStationData);
router.post("/insertMultipleStations", upload.single('file'), insertMultipleStations);
router.post("/insertRainfallFile", upload.single('file'), insertRainfallFile);
router.get("/insertLatLongInStationDetails", upload.single('file'), insertLatLongInStationDetails);


router.get("/createStationDetailsTable", createStationDetailsTable);
router.post("/fetchStationDataNew", fetchStationData);
router.post("/fetchStationData", fetchStationDataNew);
router.post("/fetchInRangeStationdata", fetchInRangeStationdataNew);
router.post("/fetchInRangeStationdataNew", fetchInRangeStationdata);
router.post("/updateStationData", updateStationData);
router.post("/addNewStation", addNewStation);
router.post("/editStation", editStation);
router.post("/deleteStation", deleteStation);
router.post("/verifyStationData", verifyStationData);
router.post("/verifyMultipleStationData", verifyMultipleStationData);

router.get("/fetchStationLogs", fetchStationLogs);
router.post("/fetchAllDatesAndDataOfStation", fetchAllDatesAndDataOfStation);



// ********************************************************************************************************
//                                      Station routes
// ********************************************************************************************************
// router.get("/insertStationDataFtp", insertStationDataFtp);
router.post("/insertStationDataFtp", upload.single('file'), insertStationDataFtp);
router.post("/fetchStationDataInRadius", fetchStationDataInRadius);
router.post("/fetchStationWithMaxRainfall", fetchStationWithMaxRainfall);
router.get("/AddDailyStationData", AddDailyStationData);  //testing 


module.exports = router;