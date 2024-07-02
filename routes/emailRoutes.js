const express = require("express")
const router = express.Router()

const { testMail,dailyDataUpdateReminder,dailyDataVerificationReminder} = require("../controllers/Email")



// ********************************************************************************************************
//                                      Email routes
// ********************************************************************************************************
router.get('/sendemail',testMail)
router.get('/dailyDataUpdateReminderQuery',dailyDataUpdateReminder)
router.get('/dailyDataVerificationReminder',dailyDataVerificationReminder)

module.exports = router;
