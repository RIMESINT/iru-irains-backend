const express = require("express")
const router = express.Router()

const { fetchCountryData} = require("../controllers/Country")
const { getnCountryDataAndInsertInNormalCountry } = require("../controllers/scripts/country/normalCountry")


// ********************************************************************************************************
//                                      Region routes
// ********************************************************************************************************

// for scripts
router.get("/nCountryPrev", getnCountryDataAndInsertInNormalCountry);

// fetch sub division data
router.post("/fetchCountryData", fetchCountryData);


module.exports = router;