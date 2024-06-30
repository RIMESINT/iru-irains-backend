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




sendEmail = async ({ to, subject, text, attachments,html }) => {
    // const { to, subject, text, attachments,html } = req.body;
    const mailOptions = {
        from: 'ghanshyam@rimes.int',
        to: to,
        subject: subject,
        text: text,
        html:html,
        attachments: attachments
    };
    
    console.log("Sending Email");
    
    try {
        const response = await smtp.sendMail(mailOptions);
        console.log('Email sent: ' + response.message);
        
        await client.query('INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', [mailOptions.to, mailOptions.subject, mailOptions.text, new Date(), true]);
        
        // res.status(200).json({ message: 'Email sent successfully' });
        return {success:true,message:response}
    } catch (error) {
        console.error('Error sending email:', error);
        
        try {
            await client.query('INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', [mailOptions.to, mailOptions.subject, mailOptions.text, new Date(), false]);
            
            // res.status(500).json({ error: 'Error sending email. Data inserted into log.' });
            return {success:false,message:error}
        } catch (insertError) {
            console.error('Error inserting data into log:', insertError);
            // res.status(500).json({ error: 'Internal server error' });
            return {success:false,message:insertError}

        }
    }
};


// SELECT * FROM public.station_details
// where station_code  in (
// 	select station_id 
// 	from public.station_daily_data 
// 	where collection_date = '2024-06-12' and (data = null or data =-999.9) 
// )
// order by centre_type,centre_name

module.exports = sendEmail;

