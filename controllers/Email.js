const nodemailer = require('nodemailer');



const smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'saurav@rimes.int',
        pass: 'sxcjuiwivyptrxkp'
    }
});

exports.sendEmail = async (req, res) => {
    const { to, subject, text, attachments } = req.body;
    const mailOptions = {
        from: 'saurav@rimes.int',
        to: to,
        subject: subject,
        text: text,
        attachments: attachments
    };
    
    console.log("Sending Email");
    
    try {
        const response = await smtpTransport.sendMail(mailOptions);
        console.log('Email sent: ' + response.message);
        
        await client.query('INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', [mailOptions.to, mailOptions.subject, mailOptions.text, new Date(), true]);
        
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        
        try {
            await client.query('INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', [mailOptions.to, mailOptions.subject, mailOptions.text, new Date(), false]);
            
            res.status(500).json({ error: 'Error sending email. Data inserted into log.' });
        } catch (insertError) {
            console.error('Error inserting data into log:', insertError);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
