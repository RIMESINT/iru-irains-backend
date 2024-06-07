const express = require("express")
const router = express.Router()

const { getnRegionDataAndInsertInNormalRegion } = require("../controllers/normalRegion")
const { getnDistrictDataAndInsertInNormalDistrict } = require("../controllers/normalDistrict");
const { getnSubDivisionDataAndInsertInNormalSubDivision } = require("../controllers/normalSubDivision");
// Route for user login
router.get("/nRegionPrev", getnRegionDataAndInsertInNormalRegion);
router.get("/nSubDivisionPrev", getnSubDivisionDataAndInsertInNormalSubDivision);

module.exports = router;