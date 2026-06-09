const express = require("express")
const router = express.Router()

const { fetchRegionDataWithAWS } = require("../controllers/AwsInclusiveControllers");
const { fetchRegionData, getAllRegions, fetchCummulativeRegionData, fetchRegionDataAforAPIexport, getRegionAreaPercentages, fetchRegionCoverageCount} = require("../controllers/Region")
const { fetchRegionDataFtp, fetchCummulativeRegionDataFtp} = require("../controllers/ftp/Region")
const { getnRegionDataAndInsertInNormalRegion } = require("../controllers/scripts/region/normalRegion")
const multer  = require('multer');
const upload  = multer({ storage: multer.memoryStorage() });
const {
    getRegionNormalList,
    getRegionNormals,
    downloadRegionNormalTemplate,
    replaceRegionNormals,
    addRegionYearNormals,
    bulkReplaceRegionNormals,
    bulkAddRegionYearNormals,
} = require("../controllers/scripts/region/regionNormalsManagement");


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




// ── Region Normals Management ────────────────────────────────────────────────
router.get("/getRegionNormalList",                                  getRegionNormalList);
router.get("/getRegionNormals/:region_id",                          getRegionNormals);
router.get("/downloadRegionNormalTemplate/:region_id",              downloadRegionNormalTemplate);
router.put("/replaceRegionNormals/:region_id",  upload.single('file'), replaceRegionNormals);
router.post("/addRegionYearNormals/:region_id", upload.single('file'), addRegionYearNormals);
router.put("/bulkReplaceRegionNormals",         upload.single('file'), bulkReplaceRegionNormals);
router.post("/bulkAddRegionYearNormals",        upload.single('file'), bulkAddRegionYearNormals);

module.exports = router;