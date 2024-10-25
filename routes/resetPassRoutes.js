const express = require("express")
const router = express.Router()

const { resetPassword,setNewPassword} = require("../controllers/ResetPass")


// ********************************************************************************************************
//                                     Centre routes
// ********************************************************************************************************

// fetch sub division list
router.post("/resetPassword", resetPassword);
router.post("/setNewPassword", setNewPassword);


module.exports = router;