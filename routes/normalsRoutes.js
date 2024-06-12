const express = require("express")
const router = express.Router()

const { getnRegionDataAndInsertInNormalRegion } = require("../controllers/scripts/region/normalRegion")
const { getnDistrictDataAndInsertInNormalDistrict } = require("../controllers/scripts/district/normalDistrict");
const { getDistrictData} = require("../controllers/scripts/district/fetchDistrictData")
const { getnSubDivisionDataAndInsertInNormalSubDivision } = require("../controllers/scripts/subDivision/normalSubDivision");
const { getnCountryDataAndInsertInNormalCountry } = require("../controllers/scripts/country/normalCountry");
const { getnStateDataAndInsertInNormalState } = require("../controllers/scripts/state/normalState");



// Routes for District Inofrmation
router.get("/nRegionPrev", getnRegionDataAndInsertInNormalRegion);
router.get("/nSubDivisionPrev", getnSubDivisionDataAndInsertInNormalSubDivision);
router.get("/nCountryPrev", getnCountryDataAndInsertInNormalCountry);
router.get("/nStatePrev", getnStateDataAndInsertInNormalState);

module.exports = router;