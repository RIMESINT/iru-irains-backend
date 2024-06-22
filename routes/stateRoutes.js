const express = require("express")
const router = express.Router()

const { fetchStateData, getAllStates} = require("../controllers/State")
const { getnStateDataAndInsertInNormalState } = require("../controllers/scripts/state/normalState");


// ********************************************************************************************************
//                                      State routes
// ********************************************************************************************************

// for scripts
router.get("/nStatePrev", getnStateDataAndInsertInNormalState);


// fetch state data
router.post("/fetchStateData", fetchStateData);

// fetch state list
router.get("/getAllStates", getAllStates);


module.exports = router;