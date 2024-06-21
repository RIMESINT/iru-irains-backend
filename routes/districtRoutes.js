const express = require("express")
const router = express.Router()

const { fetchDistrictData} = require("../controllers/District")
const { getnDistrictDataAndInsertInNormalDistrict } = require("../controllers/scripts/district/normalDistrict");


// ********************************************************************************************************
//                                      District routes
// ********************************************************************************************************

// for scripts
router.get("/nDistrictPrev", getnDistrictDataAndInsertInNormalDistrict);


// fetch district data
router.post("/fetchDistrictData", fetchDistrictData);


module.exports = router;