const express = require("express")
const router = express.Router()

const { getCenterDetails} = require("../controllers/Centre")


// ********************************************************************************************************
//                                     Centre routes
// ********************************************************************************************************

// fetch sub division list
router.post("/getCenterDetails", getCenterDetails);


module.exports = router;