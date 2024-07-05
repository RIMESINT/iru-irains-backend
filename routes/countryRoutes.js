const express = require("express")
const router = express.Router()

const { fetchCountryData} = require("../controllers/Country")
const { fetchCountryDataFtp} = require("../controllers/ftp/Country")
const { getnCountryDataAndInsertInNormalCountry } = require("../controllers/scripts/country/normalCountry")


// ********************************************************************************************************
//                                      Country routes
// ********************************************************************************************************

// for scripts
router.get("/nCountryPrev", getnCountryDataAndInsertInNormalCountry);

// fetch country data
router.post("/fetchCountryData", fetchCountryData);




// ********************************************************************************************************
//                                      Country routes for FTP
// ********************************************************************************************************


// fetch country data
router.post("/fetchCountryDataFtp", fetchCountryDataFtp);


module.exports = router;