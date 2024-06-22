const express = require("express")
const router = express.Router()

const { fetchDistrictData, getAllDistrict} = require("../controllers/District")
const { getnDistrictDataAndInsertInNormalDistrict } = require("../controllers/scripts/district/normalDistrict");


// ********************************************************************************************************
//                                      District routes
// ********************************************************************************************************

// for scripts
router.get("/nDistrictPrev", getnDistrictDataAndInsertInNormalDistrict);


// fetch district data
router.post("/fetchDistrictData", fetchDistrictData);
// fetch district data
router.get("/getAllDistrict", getAllDistrict);

module.exports = router;