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
router.post('/fetchEmailLogs',fetchEmailLogs)
router.post('/fetchEmailGroups',fetchEmailGroups)
router.post('/createEmailGroups',createEmailGroups)

module.exports = router;
