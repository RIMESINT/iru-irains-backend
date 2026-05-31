const express = require("express")
const router = express.Router()

const { fetchRegionDataWithAWS } = require("../controllers/AwsInclusiveControllers");
const { fetchRegionData, getAllRegions, fetchCummulativeRegionData, fetchRegionDataAforAPIexport, getRegionAreaPercentages, fetchRegionCoverageCount} = require("../controllers/Region")
const { fetchRegionDataFtp, fetchCummulativeRegionDataFtp} = require("../controllers/ftp/Region")
const { getnRegionDataAndInsertInNormalRegion } = require("../controllers/scripts/region/normalRegion")


// ********************************************************************************************************
//                                      Region routes
// ********************************************************************************************************

// for scripts
router.get("/nRegionPrev", getnRegionDataAndInsertInNormalRegion);

// fetch region data
router.post("/fetchRegionData", fetchRegionData);
router.post("/fetchRegionDataWithAWS", fetchRegionDataWithAWS);
router.post("/fetchRegionDataAPIexport", fetchRegionDataAforAPIexport);

//get all regions
router.get("/getAllRegions", getAllRegions)
router.get("/getRegionAreaPercentages", getRegionAreaPercentages);
router.post("/fetchRegionCoverageCount", fetchRegionCoverageCount);
router.post("/fetchCummulativeRegionData", fetchCummulativeRegionData);

// ********************************************************************************************************
//                                      Region routes
// ********************************************************************************************************

router.post("/fetchRegionDataFtp", fetchRegionDataFtp);

router.post("/fetchCummulativeRegionDataFtp", fetchCummulativeRegionDataFtp);




module.exports = router;