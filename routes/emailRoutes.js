const express = require("express")
const router = express.Router()

const { sendEmail} = require("../controllers/Email")


// ********************************************************************************************************
//                                      Email routes
// ********************************************************************************************************
route.post('/send-email',sendEmail)