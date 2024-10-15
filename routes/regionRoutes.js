const express = require("express")
const router = express.Router()

const { fetchRegionData, getAllRegions} = require("../controllers/Region")
const { fetchRegionDataFtp, fetchCummulativeRegionDataFtp} = require("../controllers/ftp/Region")
const { getnRegionDataAndInsertInNormalRegion } = require("../controllers/scripts/region/normalRegion")


// ********************************************************************************************************
//                                      Region routes
// ********************************************************************************************************

// for scripts
router.get("/nRegionPrev", getnRegionDataAndInsertInNormalRegion);

// fetch region data
router.post("/fetchRegionData", fetchRegionData);

//get all regions
router.get("/getAllRegions", getAllRegions);

// ********************************************************************************************************
//                                      Region routes
// ********************************************************************************************************

router.post("/fetchRegionDataFtp", fetchRegionDataFtp);

router.post("/fetchCummulativeRegionDataFtp", fetchCummulativeRegionDataFtp);




module.exports = router;