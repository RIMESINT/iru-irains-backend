const express = require("express")
const router = express.Router()

const { sendMail,
        dailyDataUpdateReminder,
        dailyDataVerificationReminder, 
        fetchEmailLogs, 
        fetchEmailGroups,
        createEmailGroups} = require("../controllers/Email")



// ********************************************************************************************************
//                                      Email routes
// ********************************************************************************************************
router.post('/sendemail',sendMail)
router.get('/dailyDataUpdateReminderQuery',dailyDataUpdateReminder)
router.get('/dailyDataVerificationReminder',dailyDataVerificationReminder)
router.get('/fetchEmailLogs',fetchEmailLogs)
router.get('/fetchEmailGroups',fetchEmailGroups)
router.post('/createEmailGroups',createEmailGroups)

module.exports = router;
