const express = require("express")
const router = express.Router()

const { getnRegionDataAndInsertInNormalRegion } = require("../controllers/scripts/region/normalRegion")
const { getnSubDivisionDataAndInsertInNormalSubDivision } = require("../controllers/scripts/subDivision/normalSubDivision");
const { getnCountryDataAndInsertInNormalCountry } = require("../controllers/scripts/country/normalCountry");



// Routes for District Inofrmation
router.get("/nRegionPrev", getnRegionDataAndInsertInNormalRegion);
router.get("/nSubDivisionPrev", getnSubDivisionDataAndInsertInNormalSubDivision);
router.get("/nCountryPrev", getnCountryDataAndInsertInNormalCountry);

module.exports = router;