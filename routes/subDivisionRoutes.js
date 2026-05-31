const express = require("express")
const router = express.Router()

const { fetchSubDivisionDataWithAWS } = require("../controllers/AwsInclusiveControllers");
const { fetchSubDivisionData, getAllSubDivisions, fetchSubDivisionDataAforAPIexport, getMetWiseSubDivisions, getSubdivisionAreaPercentages, fetchSubDivisionDistrictCount, getSubdivisionDisplayOrder, updateSubdivisionDisplayOrder, updateSubdivisionDisplayOrders, addSubdivisionDisplayOrderEntry, deleteSubdivisionDisplayOrderEntry } = require("../controllers/SubDivision")
const { fetchSubDivisionDataFtp, fetchSubDivisionDataInBunchOfDatesFtp} = require("../controllers/ftp/SubDivision")
const { getnSubDivisionDataAndInsertInNormalSubDivision } = require("../controllers/scripts/subDivision/normalSubDivision");


// ********************************************************************************************************
//                                      Sub Division routes
// ********************************************************************************************************

// for scripts
router.get("/nSubDivisionPrev", getnSubDivisionDataAndInsertInNormalSubDivision);


// fetch sub division data
router.post("/fetchSubDivisionDataAPIexport", fetchSubDivisionDataAforAPIexport);
router.post("/fetchSubDivisionData", fetchSubDivisionData);
router.post("/fetchSubDivisionDataWithAWS", fetchSubDivisionDataWithAWS);
// fetch sub division list
router.get("/getAllSubDivisions", getAllSubDivisions);
router.get("/metWiseSubDivisions", getMetWiseSubDivisions)
router.get("/getSubdivisionAreaPercentages", getSubdivisionAreaPercentages);
router.post("/fetchSubDivisionDistrictCount", fetchSubDivisionDistrictCount);

router.post('/fetchSubDivisionOfBunchDate', fetchSubDivisionDataInBunchOfDatesFtp)

// subdivision display order
router.get("/getSubdivisionDisplayOrder", getSubdivisionDisplayOrder);
router.put("/updateSubdivisionDisplayOrder", updateSubdivisionDisplayOrder);
router.put("/updateSubdivisionDisplayOrders", updateSubdivisionDisplayOrders);
router.post("/addSubdivisionDisplayOrderEntry", addSubdivisionDisplayOrderEntry);
router.delete("/deleteSubdivisionDisplayOrderEntry/:display_order", deleteSubdivisionDisplayOrderEntry);



// ********************************************************************************************************
//                                      Sub Division routes for FTP
// ********************************************************************************************************


// fetch sub division data
router.post("/fetchSubDivisionDataFtp", fetchSubDivisionDataFtp);

module.exports = router;