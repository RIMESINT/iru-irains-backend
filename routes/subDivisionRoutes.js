const express = require("express")
const router = express.Router()

const { fetchSubDivisionData} = require("../controllers/SubDivision")
const { getnSubDivisionDataAndInsertInNormalSubDivision } = require("../controllers/scripts/subDivision/normalSubDivision");


// ********************************************************************************************************
//                                      Sub Division routes
// ********************************************************************************************************

// for scripts
router.get("/nSubDivisionPrev", getnSubDivisionDataAndInsertInNormalSubDivision);


// fetch sub division data
router.post("/fetchSubDivisionData", fetchSubDivisionData);


module.exports = router;