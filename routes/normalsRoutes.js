const express = require("express")
const router = express.Router()

const { getnRegionDataAndInsertInNormalRegion } = require("../controllers/normalRegion")
const { getnDistrictDataAndInsertInNormalDistrict } = require("../controllers/normalDistrict");
const { getnSubDivisionDataAndInsertInNormalSubDivision } = require("../controllers/normalSubDivision");
const { getnCountryDataAndInsertInNormalCountry } = require("../controllers/normalCountry");
const { getnStateDataAndInsertInNormalState } = require("../controllers/normalState");


// Route for user login getDistrictData
router.get("/nRegionPrev", getnRegionDataAndInsertInNormalRegion);
router.get("/nSubDivisionPrev", getnSubDivisionDataAndInsertInNormalSubDivision);
router.get("/nCountryPrev", getnCountryDataAndInsertInNormalCountry);
router.get("/nStatePrev", getnStateDataAndInsertInNormalState);
router.get("/nDistrictPrev", getnDistrictDataAndInsertInNormalDistrict);

module.exports = router;