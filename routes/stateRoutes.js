const express = require("express")
const router = express.Router()

const { fetchStateData, getAllStates, fetchStateDataAforAPIexport, getMetWiseStates, getStateAreaPercentages, fetchStateDistrictCount, getStateDisplayOrder, updateStateDisplayOrder } = require("../controllers/State")
const { fetchStateDataFtp} = require("../controllers/ftp/State")
const { getnStateDataAndInsertInNormalState } = require("../controllers/scripts/state/normalState");


// ********************************************************************************************************
//                                      State routes
// ********************************************************************************************************

// for scripts
router.get("/nStatePrev", getnStateDataAndInsertInNormalState);


// fetch state data
router.post("/fetchStateData", fetchStateData);
router.get("/fetchMetWiseStates", getMetWiseStates)
router.get("/getStateAreaPercentages", getStateAreaPercentages);
router.post("/fetchStateDistrictCount", fetchStateDistrictCount);


router.post("/fetchStateDataAPIexport", fetchStateDataAforAPIexport);

// fetch state list
router.get("/getAllStates", getAllStates);

// state display order
router.get("/getStateDisplayOrder", getStateDisplayOrder);
router.put("/updateStateDisplayOrder", updateStateDisplayOrder);


// ********************************************************************************************************
//                                      State routes for FTP
// ********************************************************************************************************

// fetch state data
router.post("/fetchStateDataFtp", fetchStateDataFtp);


module.exports = router;