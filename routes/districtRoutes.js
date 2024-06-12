const express = require("express")
const router = express.Router()
const { getDistrictData} = require("../controllers/scripts/district/fetchDistrictData")
const { getnDistrictDataAndInsertInNormalDistrict } = require("../controllers/scripts/district/normalDistrict");


router.get("/nDistrictPrev", getnDistrictDataAndInsertInNormalDistrict);
router.get("/fetchDistrictData", getDistrictData);

module.exports = router;