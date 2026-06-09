const express = require("express")
const router = express.Router()

const { fetchCountryDataWithAWS } = require("../controllers/AwsInclusiveControllers");
const { fetchCountryData, fetchCummulativeCountryData, fetchCountryDataAforAPIexport, fetchCountryCoverageCount} = require("../controllers/Country")
const { fetchCountryDataFtp,fetchCummulativeCountryDataFtp} = require("../controllers/ftp/Country")
const { getnCountryDataAndInsertInNormalCountry } = require("../controllers/scripts/country/normalCountry")
const multer  = require('multer');
const upload  = multer({ storage: multer.memoryStorage() });
const {
    getCountryNormalList,
    getCountryNormals,
    downloadCountryNormalTemplate,
    replaceCountryNormals,
    addCountryYearNormals,
    bulkReplaceCountryNormals,
    bulkAddCountryYearNormals,
} = require("../controllers/scripts/country/countryNormalsManagement");


// ********************************************************************************************************
//                                      Country routes
// ********************************************************************************************************

// for scripts
router.get("/nCountryPrev", getnCountryDataAndInsertInNormalCountry);

// fetch country data
router.post("/fetchCountryData", fetchCountryData);
router.post("/fetchCountryDataWithAWS", fetchCountryDataWithAWS);
router.post("/fetchCountryDataAPIexport", fetchCountryDataAforAPIexport);
router.post("/fetchCummulativeCountryData", fetchCummulativeCountryData);
router.post("/fetchCountryCoverageCount", fetchCountryCoverageCount);




// ********************************************************************************************************
//                                      Country routes for FTP
// ********************************************************************************************************


// fetch country data
router.post("/fetchCountryDataFtp", fetchCountryDataFtp);
router.post("/fetchCummulativeCountryDataFtp", fetchCummulativeCountryDataFtp);


// ── Country Normals Management ───────────────────────────────────────────────
router.get("/getCountryNormalList",                                    getCountryNormalList);
router.get("/getCountryNormals/:country_name",                         getCountryNormals);
router.get("/downloadCountryNormalTemplate/:country_name",             downloadCountryNormalTemplate);
router.put("/replaceCountryNormals/:country_name",  upload.single('file'), replaceCountryNormals);
router.post("/addCountryYearNormals/:country_name", upload.single('file'), addCountryYearNormals);
router.put("/bulkReplaceCountryNormals",            upload.single('file'), bulkReplaceCountryNormals);
router.post("/bulkAddCountryYearNormals",           upload.single('file'), bulkAddCountryYearNormals);

module.exports = router;