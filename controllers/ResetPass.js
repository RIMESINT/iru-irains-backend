
const express = require("express");
// const router = express.Router();
// const app = express();
const client = require("../connection");
// const moment = require('moment');
const sendEmail  = require("../configEmail");



exports.resetPassword = async (req, res) => {
    try {
        let { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is Missing",
            });
        }

        if(!await isUserExist(email)){
            console.log('23')
            return res.status(400).json({
                success: false,
                message: "Email doesn't Exist",
            });
        }

        if(!await sendOTP(email)){
            return res.status(500).json({
                success: false,
                message: "OTP Failed",
                // data: data
            });
        }


        return res.status(200).json({
            success: true,
            message: "OTP send successfully",
            // data: data
        });

        

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to send otp",
            error: error.message,
        });
    }
}



const isUserExist = async (email) =>{
    const query = 'SELECT COUNT(*) FROM login WHERE username = $1';
    const values = [email];

    try {
        const res = await client.query(query, values);
        const count = parseInt(res.rows[0].count, 10);
        console.log(count > 0)
        
        return count > 0; // Return true if user exists, false otherwise
    } catch (err) {
        console.error('Error checking user existence:', err);
        throw err; // Rethrow error to handle it in the calling function
    }
}

const sendOTP =  (email) =>{
    console.log("sending mail")

    const to = email;
    const subject = "Password Reset Request for irains";
    const otp = Math.floor(100000 + Math.random() * 900000);
    const text = html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 5px;
            padding: 20px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
        }
        p {
            color: #555555;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
        }
        .button {
            display: inline-block;
            background-color: #4CAF50;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Password Reset Request</h1>
        <p>Dear User,</p>
        <p>We received a request to reset your password for your account on <strong>irains</strong>. To proceed with resetting your password, please use the One-Time Password (OTP) provided below:</p>
        <p class="otp">${otp}</p>
        <p>This OTP is valid for the next 5 minutes. Please enter it on the password reset page.</p>
        <p>If you did not request this password reset, please ignore this email. Your account remains secure, and no changes have been made.</p>

        <p>Thank you for using <strong>irains</strong>!</p>
<p>Best regards,<br>The Hydromet Team<br>IMD, Mausam Bhawan,<br>Lodhi Road,<br>New Delhi - 110003</p>
</div>
</body>
</html>

    `;
    const attachments = null;



    const query = 'insert into otps (email,otp) values($1,$2)';
    const values = [to,otp];

    try {
        const emailRes =  sendEmail({to, subject, text, attachments,html})
        const queryRes =  client.query(query, values);
        console.log("send otp",emailRes?.success)
        return true;

    } catch (err) {
        console.error('Error:', err);
        throw err; // Rethrow error to handle it in the calling function
    }

    // return resp?.success;

}



exports.setNewPassword = async (req, res) => {
    try {
        let { email,otp,password } = req.body;

        if (!email||!otp||!password) {
            return res.status(400).json({
                success: false,
                message: "parmeters are Missing",
            });
        }

        if(!await isUserExist(email)){
            return res.status(400).json({
                success: false,
                message: "Email doesn't Exist",
            });
        }

        if(!await verifyOTP(email,otp,password)){
            return res.status(500).json({
                success: false,
                message: "OTP verification Failed",
                // data: data
            });
        }


        return res.status(200).json({
            success: true,
            message: "Passwored reset successfully",
            // data: data
        });

        

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to reset password",
            error: error.message,
        });
    }
}

const verifyOTP = async (email,otp,password) =>{
    const query = `SELECT COUNT(*) FROM otps WHERE email = $1 and created_at >= NOW() - INTERVAL '5 minutes' and otp = $2;`;
    const updateQuery = `update login set password = $1 where username = $2`;
    const values = [email,otp];

    try {
        const res = await client.query(query, values);
        const count = parseInt(res.rows[0].count, 10);
        if(count > 0){
            const res1 = await client.query(updateQuery, [password,email]);
        }
        console.log(count > 0)
        
        return count > 0; // Return true if user exists, false otherwise
    } catch (err) {
        console.error('Error checking user existence:', err);
        throw err; // Rethrow error to handle it in the calling function
    }
}



