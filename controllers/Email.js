const sendEmail  = require("../configEmail");
const client = require("../connection");
// const moment = require('moment');


exports.testMail = async (req, res) => {
    try {
        
        // const { to, subject, text, attachments,html } = req.body;
        sendEmail({to:"ghanshyampal789@gmail.com",subject:"Test mail",html:"<h1>test Msil</h1>"})

        res.status(200).json({
            success: true,
            message: "Email Sent Successfully",
            // data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to send Email",
            error: error.message,
        });
    }
}
