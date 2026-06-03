const express = require("express")
const router = express.Router()
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { fetchDistrictDataWithAWS } = require("../controllers/AwsInclusiveControllers");
const { fetchDistrictData, getAllDistrict, getLatestFiveYearDataOfDistrict, fetchDistrictDataforAPIexport, getDistrictAreaPercentages, fetchDistrictStationCount, getDistrictDisplayOrder, getNormalDistrictDetails, updateDistrictDisplayOrders, addDistrictDisplayOrderEntry, deleteDistrictDisplayOrderEntry, getDistrictNormals, downloadDistrictNormalTemplate, downloadDistrictNormalTemplateForDistrict } = require("../controllers/District")
const { fetchDistrictDataFtp, fetchDistrictDataInBunchOfDatesFtp,getLatestFiveYearDataOfDistrictFtp} = require("../controllers/ftp/District")
const { getnDistrictDataAndInsertInNormalDistrict } = require("../controllers/scripts/district/normalDistrict");
const { addNewDistrictDetails, updateDistrictNormals, bulkReplaceDistrictNormals, addYearDistrictNormals, bulkAddYearDistrictNormals } = require("../controllers/scripts/district/addNormalDistrict");
const { inserNewDistrictAndNormalValues } = require("../controllers/scripts/AddDistrictAndNormals");


// ********************************************************************************************************
//                                      District routes
// ********************************************************************************************************

// for scripts
router.get("/nDistrictPrev", getnDistrictDataAndInsertInNormalDistrict);
router.put("/addNewDistrictDetails", addNewDistrictDetails);
router.put("/updateDistrictNormals/:district_code", upload.single('file'), updateDistrictNormals);
router.put("/bulkReplaceDistrictNormals", upload.single('file'), bulkReplaceDistrictNormals);
router.post("/addYearDistrictNormals/:district_code", upload.single('file'), addYearDistrictNormals);
router.post("/bulkAddYearDistrictNormals", upload.single('file'), bulkAddYearDistrictNormals);
router.post("/inserNewDistrictAndNormalValues", upload.single('file'), inserNewDistrictAndNormalValues);



// fetch district data
router.post("/fetchDistrictData", fetchDistrictData);
router.post("/fetchDistrictDataWithAWS", fetchDistrictDataWithAWS);
router.post("/fetchDistrictDataAPIexport", fetchDistrictDataforAPIexport);
// fetch district data
router.get("/getAllDistrict", getAllDistrict)
router.get("/getDistrictAreaPercentages", getDistrictAreaPercentages);
router.post("/getLatestFiveYearDataOfDistrict", getLatestFiveYearDataOfDistrict);
router.post("/fetchDistrictStationCount", fetchDistrictStationCount);
router.get("/getDistrictDisplayOrder", getDistrictDisplayOrder);
router.get("/getNormalDistrictDetails", getNormalDistrictDetails);
router.get("/getDistrictNormals/:district_code", getDistrictNormals);
router.get("/downloadDistrictNormalTemplate", downloadDistrictNormalTemplate);
router.get("/downloadDistrictNormalTemplate/:district_code", downloadDistrictNormalTemplateForDistrict);
router.put("/updateDistrictDisplayOrders", updateDistrictDisplayOrders);
router.post("/addDistrictDisplayOrderEntry", addDistrictDisplayOrderEntry);
router.delete("/deleteDistrictDisplayOrderEntry/:display_order", deleteDistrictDisplayOrderEntry);




// ********************************************************************************************************
//                                      District routes for FTP
// ********************************************************************************************************


// fetch district data
router.post("/fetchDistrictDataFtp", fetchDistrictDataFtp);
router.post("/getLatestFiveYearDataOfDistrictFtp", getLatestFiveYearDataOfDistrictFtp);
router.post("/fetchDistrictDataInBunchOfDatesFtp", fetchDistrictDataInBunchOfDatesFtp);




module.exports = router;