const client = require("./connection");
const nodemailer = require('nodemailer');
require('dotenv').config();

const smtp = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection configuration
smtp.verify(function (error, success) {
    if (error) {
        console.error('Error configuring SMTP transporter:', error);
    } else {
        console.log('SMTP transporter configured successfully');
    }
});




const sendEmail = async ({ to, subject, text, attachments, html }) => {
    // Validate input fields
    if (!to || !subject || (!text && !html)) {
        return { success: false, message: 'To, subject, and either text or html are required fields.' };
    }

    const mailOptions = {
        from: 'ghanshyam@rimes.int',
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: attachments
    };

    try {
        const response = await smtp.sendMail(mailOptions);

        // Validate SMTP response
        if (!response || !response.messageId) {
            throw new Error('Invalid SMTP response.');
        }

        await client.query('INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', [mailOptions.to, mailOptions.subject, mailOptions.text ?? mailOptions.html, new Date(), true]);

        return { success: true, message: 'Email sent successfully', response: response };
    } catch (error) {
        console.error('Error sending email:', error);

        try {
            await client.query('INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', [mailOptions.to, mailOptions.subject, mailOptions.text ?? mailOptions.html, new Date(), false]);
            return { success: false, message: 'Error sending email. Data inserted into log.', error: error };
        } catch (insertError) {
            console.error('Error inserting data into log:', insertError);
            return { success: false, message: 'Internal server error. Could not insert log.', error: insertError };
        }
    }
};



module.exports = sendEmail;

