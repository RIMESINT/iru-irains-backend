const express = require("express")
const router = express.Router()

const { sendManualMail,
        sendMailToGroup,
        dailyDataUpdateReminder,
        dailyDataVerificationReminder, 
        fetchEmailLogs, 
        fetchEmailGroups,
        createEmailGroups,
        deleteEmailGroup,
        updateEmailGroups} = require("../controllers/Email")



// ********************************************************************************************************
//                                      Email routes
// ********************************************************************************************************
router.post('/sendEmail',sendManualMail)
router.post('/sendMailToGroup',sendMailToGroup)
router.get('/dailyDataUpdateReminderQuery',dailyDataUpdateReminder)
router.get('/dailyDataVerificationReminder',dailyDataVerificationReminder)
router.get('/fetchEmailLogs',fetchEmailLogs)
router.get('/fetchEmailGroups',fetchEmailGroups)
router.post('/createEmailGroups',createEmailGroups)
router.post('/deleteEmailGroup',deleteEmailGroup)
router.post('/updateEmailGroups',updateEmailGroups)

module.exports = router;
