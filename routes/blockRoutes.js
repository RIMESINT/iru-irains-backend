const express = require("express")
const router = express.Router()
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { fetchBlockData, getAllBlocks, fetchBlockRainfallAnalysis, fetchBlockDataAforAPIexport, fetchBlockStationCount} = require("../controllers/block")
const { fetchBlockDataWithAWS } = require("../controllers/AwsInclusiveControllers");

// fetch Block data
router.post("/fetchBlockData", fetchBlockData);
router.post("/fetchBlockDataWithAWS", fetchBlockDataWithAWS);
router.post("/fetchBlockDataAPIexport", fetchBlockDataAforAPIexport);
router.post("/fetchBlockRainfallAnalysis", fetchBlockRainfallAnalysis);

// fetch Block data
router.get("/getAllBlocks", getAllBlocks);

router.post("/fetchBlockStationCount", fetchBlockStationCount);


module.exports = router;
