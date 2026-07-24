const express = require("express")
const router = express.Router()

const { fetchStateDataWithAWS } = require("../controllers/AwsInclusiveControllers");
const { fetchStateData, getAllStates, fetchStateDataAforAPIexport, getMetWiseStates, getStateAreaPercentages, fetchStateDistrictCount, getStateDisplayOrder, updateStateDisplayOrder, updateStateDisplayOrders, addStateDisplayOrderEntry, deleteStateDisplayOrderEntry } = require("../controllers/State")
const { fetchStateDataFtp} = require("../controllers/ftp/State")
const { getnStateDataAndInsertInNormalState } = require("../controllers/scripts/state/normalState");
const multer  = require('multer');
const upload  = multer({ storage: multer.memoryStorage() });
const {
    getStateNormalList,
    getStateNormals,
    downloadStateNormalTemplate,
    replaceStateNormals,
    addStateYearNormals,
    bulkReplaceStateNormals,
    bulkAddStateYearNormals,
    getMissingStateNormals,
} = require("../controllers/scripts/state/stateNormalsManagement");


// ********************************************************************************************************
//                                      State routes
// ********************************************************************************************************

// for scripts
router.get("/nStatePrev", getnStateDataAndInsertInNormalState);


// fetch state data
router.post("/fetchStateData", fetchStateData);
router.post("/fetchStateDataWithAWS", fetchStateDataWithAWS);
router.get("/fetchMetWiseStates", getMetWiseStates)
router.get("/getStateAreaPercentages", getStateAreaPercentages);
router.post("/fetchStateDistrictCount", fetchStateDistrictCount);


router.post("/fetchStateDataAPIexport", fetchStateDataAforAPIexport);

// fetch state list
router.get("/getAllStates", getAllStates);

// state display order
router.get("/getStateDisplayOrder", getStateDisplayOrder);
router.put("/updateStateDisplayOrder", updateStateDisplayOrder);
router.put("/updateStateDisplayOrders", updateStateDisplayOrders);
router.post("/addStateDisplayOrderEntry", addStateDisplayOrderEntry);
router.delete("/deleteStateDisplayOrderEntry/:display_order", deleteStateDisplayOrderEntry);


// ********************************************************************************************************
//                                      State routes for FTP
// ********************************************************************************************************

// fetch state data
router.post("/fetchStateDataFtp", fetchStateDataFtp);


// ── State Normals Management ────────────────────────────────────────────────
router.get("/getStateNormalList",                                    getStateNormalList);
router.get("/getStateNormals/:state_code",                           getStateNormals);
router.get("/downloadStateNormalTemplate/:state_code",               downloadStateNormalTemplate);
router.put("/replaceStateNormals/:state_code",    upload.single('file'), replaceStateNormals);
router.post("/addStateYearNormals/:state_code",   upload.single('file'), addStateYearNormals);
router.put("/bulkReplaceStateNormals",            upload.single('file'), bulkReplaceStateNormals);
router.post("/bulkAddStateYearNormals",           upload.single('file'), bulkAddStateYearNormals);
router.get("/getMissingStateNormals",             getMissingStateNormals);

module.exports = router;