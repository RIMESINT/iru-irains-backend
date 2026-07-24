const express = require("express")
const router = express.Router()
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { fetchBlockData, getAllBlocks, fetchBlockRainfallAnalysis, fetchBlockDataAforAPIexport, fetchBlockStationCount} = require("../controllers/block")
const { fetchBlockDataWithAWS } = require("../controllers/AwsInclusiveControllers");
const {
    getBlockNormalList,
    getBlockNormals,
    downloadBlockNormalTemplate,
    replaceBlockNormals,
    addBlockYearNormals,
    bulkReplaceBlockNormals,
    bulkAddBlockYearNormals,
    getMissingBlockNormals,
} = require("../controllers/scripts/block/blockNormalsManagement");

// fetch Block data
router.post("/fetchBlockData", fetchBlockData);
router.post("/fetchBlockDataWithAWS", fetchBlockDataWithAWS);
router.post("/fetchBlockDataAPIexport", fetchBlockDataAforAPIexport);
router.post("/fetchBlockRainfallAnalysis", fetchBlockRainfallAnalysis);

// fetch Block data
router.get("/getAllBlocks", getAllBlocks);

router.post("/fetchBlockStationCount", fetchBlockStationCount);

// ── Block Normals Management ──────────────────────────────────────────────────
router.get("/getBlockNormalList",                                  getBlockNormalList);
router.get("/getBlockNormals/:block_id",                           getBlockNormals);
router.get("/downloadBlockNormalTemplate/:block_id",               downloadBlockNormalTemplate);
router.put("/replaceBlockNormals/:block_id",  upload.single('file'), replaceBlockNormals);
router.post("/addBlockYearNormals/:block_id", upload.single('file'), addBlockYearNormals);
router.put("/bulkReplaceBlockNormals",        upload.single('file'), bulkReplaceBlockNormals);
router.post("/bulkAddBlockYearNormals",       upload.single('file'), bulkAddBlockYearNormals);
router.get("/getMissingBlockNormals",                              getMissingBlockNormals);


module.exports = router;
