const express = require("express")
const router = express.Router()

const { fetchStateData} = require("../controllers/State")
const { getnStateDataAndInsertInNormalState } = require("../controllers/scripts/state/normalState");


// ********************************************************************************************************
//                                      District routes
// ********************************************************************************************************

// for scripts
router.get("/nStatePrev", getnStateDataAndInsertInNormalState);


// fetch state data
router.post("/fetchStateData", fetchStateData);


module.exports = router;