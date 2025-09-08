const nodemailer = require('nodemailer');
const client = require('../connection'); // Your DB connection
require('dotenv').config();

// Email configuration similar to your working example
const smtp = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
});

// Verify connection configuration
smtp.verify(function (error, success) {
    if (error) {
        console.error('❌ Error configuring SMTP transporter:', error);
    } else {
        console.log('✅ SMTP transporter configured successfully');
    }
});

// Email sending function similar to your working sendEmail
const sendEmail = async ({ to, subject, text, attachments, html }) => {
    if (!to || !subject || (!text && !html)) {
        return { success: false, message: 'To, subject, and either text or html are required fields.' };
    }

    const mailOptions = {
        from: process.env.EMAIL_USER || 'balakrishna@rimes.int',
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: attachments
    };

    try {
        const response = await smtp.sendMail(mailOptions);

        if (!response || !response.messageId) {
            throw new Error('Invalid SMTP response.');
        }

        // Log to database
        await client.query(
            'INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', 
            [mailOptions.to, mailOptions.subject, mailOptions.text ?? mailOptions.html, new Date(), true]
        );

        return { success: true, message: 'Email sent successfully', response: response };
    } catch (error) {
        console.error('❌ Error sending email:', error);

        try {
            await client.query(
                'INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', 
                [mailOptions.to, mailOptions.subject, mailOptions.text ?? mailOptions.html, new Date(), false]
            );
            return { success: false, message: 'Error sending email. Data inserted into log.', error: error };
        } catch (insertError) {
            console.error('Error inserting data into log:', insertError);
            return { success: false, message: 'Internal server error. Could not insert log.', error: insertError };
        }
    }
};

// Generate email content function
const generateEmailContent = ({ reportType, customMessage, dateRange }) => {
    const currentDate = new Date().toLocaleDateString('en-IN');
    const currentTime = new Date().toLocaleTimeString('en-IN');

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: #007bff; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">India Meteorological Department</h1>
            <p style="margin: 5px 0 0 0;">Hydromet Division, New Delhi</p>
        </header>

        <main style="padding: 20px;">
            <h2 style="color: #343a40; text-align: center;">
                ${reportType.toUpperCase()}-WISE RAINFALL DISTRIBUTION REPORT
            </h2>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>📅 Generated:</strong> ${currentDate} at ${currentTime}</p>
                <p><strong>🎯 Analysis Level:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
            </div>

            ${customMessage ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #856404;">📝 Additional Information</h3>
                <p style="color: #856404;">${customMessage}</p>
            </div>
            ` : ''}

            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #495057;">📎 Attachments</h3>
                <ul>
                    <li>📄 ${reportType.toUpperCase()} Rainfall Distribution Report (PDF)</li>
                </ul>
            </div>
        </main>
        
        <footer style="background: #343a40; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0;">© ${new Date().getFullYear()} India Meteorological Department</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Automated Report System</p>
        </footer>
    </div>
    `;

    const text = `
India Meteorological Department
${reportType.toUpperCase()}-WISE RAINFALL DISTRIBUTION REPORT

Generated: ${currentDate} at ${currentTime}
Analysis Level: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}

${customMessage ? `Additional Information: ${customMessage}\n` : ''}
Attachments: ${reportType.toUpperCase()} Rainfall Distribution Report (PDF)

© ${new Date().getFullYear()} India Meteorological Department
    `;

    return { html, text };
};

// Generate subject function
const generateSubject = (baseSubject, reportType, dateRange) => {
    let subject = baseSubject;
    
    if (dateRange?.startDate && dateRange?.endDate) {
        const start = new Date(dateRange.startDate).toLocaleDateString('en-IN');
        const end = new Date(dateRange.endDate).toLocaleDateString('en-IN');
        
        subject += dateRange.startDate === dateRange.endDate ? ` - ${start}` : ` - ${start} to ${end}`;
    } else {
        subject += ` - ${new Date().toLocaleDateString('en-IN')}`;
    }

    return subject;
};

// Send individual report function
const sendReportWithMaps = async ({
    recipients,
    subject = 'Rainfall Distribution Report',
    reportType = 'district',
    customMessage = '',
    dateRange = {}
}) => {
    try {
        console.log(`📧 Preparing ${reportType} report for ${Array.isArray(recipients) ? recipients.length : 1} recipients...`);

        // Create mock PDF attachment
        const mockPdfBuffer = Buffer.from(`
            India Meteorological Department
            ${reportType.toUpperCase()} RAINFALL DISTRIBUTION REPORT
            
            Generated: ${new Date().toISOString()}
            Period: ${dateRange.startDate || 'N/A'} to ${dateRange.endDate || 'N/A'}
            
            ${customMessage || 'Automated rainfall distribution analysis'}
            
            This is a test PDF report with sample rainfall data.
        `);
        
        const attachments = [{
            filename: `${reportType.toUpperCase()}_RAINFALL_REPORT_${Date.now()}.pdf`,
            content: mockPdfBuffer,
            contentType: 'application/pdf'
        }];

        // Generate email content
        const emailContent = generateEmailContent({ reportType, customMessage, dateRange });
        const recipientList = Array.isArray(recipients) ? recipients.join(', ') : recipients;
        const emailSubject = generateSubject(subject, reportType, dateRange);

        // Send email using the sendEmail function
        const result = await sendEmail({
            to: recipientList,
            subject: emailSubject,
            html: emailContent.html,
            text: emailContent.text,
            attachments: attachments
        });

        if (result.success) {
            console.log(`✅ ${reportType} email sent successfully!`);
            return {
                success: true,
                messageId: result.response.messageId,
                attachmentCount: attachments.length,
                recipientCount: Array.isArray(recipients) ? recipients.length : 1,
                reportType: reportType,
                sentAt: new Date().toISOString()
            };
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        console.error(`❌ Error sending ${reportType} email:`, error.message);
        throw new Error(`Failed to send ${reportType} email: ${error.message}`);
    }
};

// Main bulk email controller
const sendBulkReports = async (req, res) => {
    try {
        const { reportConfigs } = req.body;
        
        if (!reportConfigs || !Array.isArray(reportConfigs) || reportConfigs.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'reportConfigs array is required and cannot be empty'
            });
        }

        console.log(`🚀 Processing bulk email request for ${reportConfigs.length} reports`);

        const results = [];
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < reportConfigs.length; i++) {
            const config = reportConfigs[i];
            console.log(`📤 Sending ${i + 1}/${reportConfigs.length}: ${config.reportType} report`);

            try {
                const result = await sendReportWithMaps(config);
                results.push({ ...result, configIndex: i });
                successCount++;
                
                // 2-second delay between emails
                if (i < reportConfigs.length - 1) {
                    console.log('⏳ Waiting 2 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                results.push({ 
                    success: false, 
                    error: error.message,
                    configIndex: i,
                    reportType: config.reportType,
                    sentAt: new Date().toISOString()
                });
                failureCount++;
                console.error(`❌ Failed to send ${config.reportType} report: ${error.message}`);
            }
        }

        console.log(`📊 Bulk email completed: ${successCount} successful, ${failureCount} failed`);

        const response = {
            success: true,
            message: `Bulk reports processed: ${successCount} successful, ${failureCount} failed`,
            totalSent: reportConfigs.length,
            successCount,
            failureCount,
            results,
            timestamp: new Date().toISOString()
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('❌ Error processing bulk reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process bulk reports',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = { sendBulkReports };
