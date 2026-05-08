const express = require("express")
const router = express.Router()

const { fetchCountryData, fetchCummulativeCountryData, fetchCountryDataAforAPIexport, fetchCountryCoverageCount} = require("../controllers/Country")
const { fetchCountryDataFtp,fetchCummulativeCountryDataFtp} = require("../controllers/ftp/Country")
const { getnCountryDataAndInsertInNormalCountry } = require("../controllers/scripts/country/normalCountry")


// ********************************************************************************************************
//                                      Country routes
// ********************************************************************************************************

// for scripts
router.get("/nCountryPrev", getnCountryDataAndInsertInNormalCountry);

// fetch country data
router.post("/fetchCountryData", fetchCountryData);
router.post("/fetchCountryDataAPIexport", fetchCountryDataAforAPIexport);
router.post("/fetchCummulativeCountryData", fetchCummulativeCountryData);
router.post("/fetchCountryCoverageCount", fetchCountryCoverageCount);




// ********************************************************************************************************
//                                      Country routes for FTP
// ********************************************************************************************************


// fetch country data
router.post("/fetchCountryDataFtp", fetchCountryDataFtp);
router.post("/fetchCummulativeCountryDataFtp", fetchCummulativeCountryDataFtp);


module.exports = router;