const express = require("express")
const router = express.Router()
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { fetchBlockData, getAllBlocks} = require("../controllers/block")

// fetch Block data
router.post("/fetchBlockData", fetchBlockData);
// fetch Block data
router.get("/getAllBlocks", getAllBlocks);

module.exports = router;
