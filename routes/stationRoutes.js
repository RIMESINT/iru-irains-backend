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
        EditMultipleStations, 
        fetchStationDataInRadius,
        fetchStationWithMaxRainfall, 
        // verifyStationData, 
        // verifyMultipleStationData, 
        fetchInRangeStationdata,
        fetchStationLogs,
        fetchAllDatesAndDataOfStation,
        fetchStationUnifiedFile,
        dataActions,
        fetchStationDataNWP,
    } = require("../controllers/Station")
const { insertStationDataFtp} = require("../controllers/scripts/station/stationDailyDataFtp")
const { aggregateRainfallData } = require("../controllers/scripts/all/calculateAndIncludeAllDatesData")
const { fetchTopNBlocks, fetchTopNDistricts, fetchTopNSubdivisions, fetchTopNStates, fetchTopNRegions, fetchTopNCountries } = require("../controllers/scripts/all/selectTopNvalues")
const { fetchBlockRangeStatistics, fetchDistrictRangeStatistics, fetchStateRangeStatistics, fetchSubdivisionRangeStatistics, fetchRegionRangeStatistics, fetchCountryRangeStatistics } = require("../controllers/scripts/all/inRangeStatisticsData")


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
    AddDailyStationData,
    fetchStationDataIncludingVerification,
    

} = require("../controllers/StationDataUpdates")



const {
    fetchStationUnifiedFileFtp,
    fetchLatestAwsExcelData,
} = require("../controllers/ftp/station")

// ********************************************************************************************************
//                                      Station routes
// ********************************************************************************************************
router.get("/insertStationData", insertStationData);
router.post("/insertMultipleStations", upload.single('file'), insertMultipleStations);
router.post("/insertRainfallFile", upload.single('file'), insertRainfallFile);
router.get("/insertLatLongInStationDetails", upload.single('file'), insertLatLongInStationDetails);
router.post("/EditMultipleStations", upload.single('file'), EditMultipleStations);



router.get("/createStationDetailsTable", createStationDetailsTable);
router.post("/fetchStationDataNew", fetchStationData);
router.post("/station_data_for_nwp", fetchStationDataNWP);
router.post("/fetchStationData", fetchStationDataNew);
router.post("/fetchStationDataIncludingVerification", fetchStationDataIncludingVerification);
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
router.post("/fetchFilteredStationUnifiedFile", fetchStationUnifiedFile);
router.post("/dataActions", dataActions);



// ********************************************************************************************************
//                                     FTP Station routes
// ********************************************************************************************************
router.post("/fetchFilteredStationUnifiedFileFtp", fetchStationUnifiedFileFtp);
router.post("/fetchLatestAwsExcelData", fetchLatestAwsExcelData);


// ********************************************************************************************************
//                                     ALL
// ********************************************************************************************************
router.post("/aggregateRainfallData", aggregateRainfallData);
router.post("/fetchTopNBlocks", fetchTopNBlocks);
router.post("/fetchTopNDistricts", fetchTopNDistricts);
router.post("/fetchTopNSubdivisions", fetchTopNSubdivisions);
router.post("/fetchTopNStates", fetchTopNStates);
router.post("/fetchTopNRegions", fetchTopNRegions);
router.post("/fetchTopNCountries", fetchTopNCountries);
router.post("/fetchBlockRangeStatistics", fetchBlockRangeStatistics);
router.post("/fetchDistrictRangeStatistics", fetchDistrictRangeStatistics);
router.post("/fetchStateRangeStatistics", fetchStateRangeStatistics);
router.post("/fetchSubdivisionRangeStatistics", fetchSubdivisionRangeStatistics);
router.post("/fetchRegionRangeStatistics", fetchRegionRangeStatistics);
router.post("/fetchCountryRangeStatistics", fetchCountryRangeStatistics);

module.exports = router;