const express = require("express")
const router = express.Router()

const { fetchRegionData} = require("../controllers/Region")
const { getnRegionDataAndInsertInNormalRegion } = require("../controllers/scripts/region/normalRegion")


// ********************************************************************************************************
//                                      Region routes
// ********************************************************************************************************

// for scripts
router.get("/nRegionPrev", getnRegionDataAndInsertInNormalRegion);

// fetch sub division data
router.post("/fetchRegionData", fetchRegionData);


module.exports = router;