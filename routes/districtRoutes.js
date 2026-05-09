const express = require("express")
const router = express.Router()
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { fetchDistrictData, getAllDistrict, getLatestFiveYearDataOfDistrict, fetchDistrictDataforAPIexport, getDistrictAreaPercentages, fetchDistrictStationCount, getDistrictDisplayOrder} = require("../controllers/District")
const { fetchDistrictDataFtp, fetchDistrictDataInBunchOfDatesFtp,getLatestFiveYearDataOfDistrictFtp} = require("../controllers/ftp/District")
const { getnDistrictDataAndInsertInNormalDistrict } = require("../controllers/scripts/district/normalDistrict");
const { addNewDistrictDetails } = require("../controllers/scripts/district/addNormalDistrict");
const { inserNewDistrictAndNormalValues } = require("../controllers/scripts/AddDistrictAndNormals");


// ********************************************************************************************************
//                                      District routes
// ********************************************************************************************************

// for scripts
router.get("/nDistrictPrev", getnDistrictDataAndInsertInNormalDistrict);
router.post("/addNewDistrictDetails", upload.single('file'), addNewDistrictDetails);
router.post("/inserNewDistrictAndNormalValues", upload.single('file'), inserNewDistrictAndNormalValues);



// fetch district data
router.post("/fetchDistrictData", fetchDistrictData);
router.post("/fetchDistrictDataAPIexport", fetchDistrictDataforAPIexport);
// fetch district data
router.get("/getAllDistrict", getAllDistrict)
router.get("/getDistrictAreaPercentages", getDistrictAreaPercentages);
router.post("/getLatestFiveYearDataOfDistrict", getLatestFiveYearDataOfDistrict);
router.post("/fetchDistrictStationCount", fetchDistrictStationCount);
router.get("/getDistrictDisplayOrder", getDistrictDisplayOrder);




// ********************************************************************************************************
//                                      District routes for FTP
// ********************************************************************************************************


// fetch district data
router.post("/fetchDistrictDataFtp", fetchDistrictDataFtp);
router.post("/getLatestFiveYearDataOfDistrictFtp", getLatestFiveYearDataOfDistrictFtp);
router.post("/fetchDistrictDataInBunchOfDatesFtp", fetchDistrictDataInBunchOfDatesFtp);




module.exports = router;