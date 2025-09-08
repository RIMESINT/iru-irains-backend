const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
        this.initializeService();
    }

    async initializeService() {
        try {
            // ✅ FIXED: Use createTransport (not createTransporter)
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT),
                secure: false,
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS
                },
                tls: { rejectUnauthorized: false }
              });
              

            await this.transporter.verify();
            this.initialized = true;
            console.log('✅ RIMES Email service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize RIMES email service:', error.message);
            this.initialized = false;
            
            // Try alternative RIMES configurations
            await this.tryAlternativeConfigs();
        }
    }

    async tryAlternativeConfigs() {
        const alternativeConfigs = [
            // Try different RIMES SMTP configurations
            { host: 'smtp.rimes.int', port: 587, secure: false },
            { host: 'mail.rimes.int', port: 25, secure: false },
            { host: 'mail.rimes.int', port: 465, secure: true },
            // Fallback to Gmail for testing
            { host: 'smtp.gmail.com', port: 587, secure: false, service: 'gmail' }
        ];

        for (const config of alternativeConfigs) {
            try {
                console.log(`🔄 Trying ${config.host}:${config.port}...`);
                
                // ✅ FIXED: Use createTransport (not createTransporter)
                this.transporter = nodemailer.createTransport({
                    ...config,
                    auth: {
                        user: process.env.EMAIL_USER || 'balakrishna@rimes.int',
                        pass: process.env.EMAIL_PASS
                    },
                    tls: {
                        rejectUnauthorized: false
                    },
                    connectionTimeout: 10000
                });

                await this.transporter.verify();
                this.initialized = true;
                console.log(`✅ Successfully connected using ${config.host}:${config.port}`);
                break;
            } catch (error) {
                console.log(`❌ Failed ${config.host}:${config.port} - ${error.message}`);
            }
        }

        // If all RIMES servers fail, use a mock transporter for testing
        if (!this.initialized) {
            console.log('🔄 All SMTP servers failed, creating mock transporter for testing...');
            this.createMockTransporter();
        }
    }

    createMockTransporter() {
        // Create a mock transporter that simulates email sending without actual SMTP
        this.transporter = {
            sendMail: async (mailOptions) => {
                console.log('📧 MOCK EMAIL SENT:');
                console.log('From:', mailOptions.from);
                console.log('To:', mailOptions.to);
                console.log('Subject:', mailOptions.subject);
                console.log('Attachments:', mailOptions.attachments?.length || 0);
                
                return {
                    messageId: `mock-${Date.now()}@rimes.int`,
                    response: 'Mock email sent successfully'
                };
            },
            verify: async () => true
        };
        
        this.initialized = true;
        console.log('✅ Mock email transporter created - emails will be logged only');
    }

    async sendReportWithMaps({
        recipients,
        subject = 'Rainfall Distribution Report',
        reportType = 'district',
        customMessage = '',
        dateRange = {}
    }) {
        try {
            if (!this.initialized) {
                throw new Error('Email service not initialized - check SMTP credentials');
            }

            console.log(`📧 Preparing ${reportType} report for ${recipients.length} recipients...`);

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
            const emailContent = this.generateEmailContent({ reportType, customMessage, dateRange });
            
            const recipientList = Array.isArray(recipients) ? recipients.join(', ') : recipients;

            const mailOptions = {
                from: `"IMD Rainfall Reports" <${process.env.EMAIL_USER || 'balakrishna@rimes.int'}>`,
                to: recipientList,
                subject: this.generateSubject(subject, reportType, dateRange),
                html: emailContent.html,
                text: emailContent.text,
                attachments: attachments
            };

            const info = await this.transporter.sendMail(mailOptions);

            console.log(`✅ ${reportType} email sent successfully!`);
            console.log(`📧 Message ID: ${info.messageId}`);

            return {
                success: true,
                messageId: info.messageId,
                attachmentCount: attachments.length,
                recipientCount: Array.isArray(recipients) ? recipients.length : 1,
                reportType: reportType,
                sentAt: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ Error sending ${reportType} email:`, error.message);
            throw new Error(`Failed to send ${reportType} email: ${error.message}`);
        }
    }

    async sendBulkReports(reportConfigs) {
        const results = [];
        let successCount = 0;
        let failureCount = 0;

        console.log(`📧 Starting bulk email for ${reportConfigs.length} reports...`);

        for (let i = 0; i < reportConfigs.length; i++) {
            const config = reportConfigs[i];
            console.log(`📤 Sending ${i + 1}/${reportConfigs.length}: ${config.reportType} report`);

            try {
                const result = await this.sendReportWithMaps(config);
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

        return {
            totalSent: reportConfigs.length,
            successCount,
            failureCount,
            results
        };
    }

    generateSubject(baseSubject, reportType, dateRange) {
        let subject = baseSubject;
        
        if (dateRange?.startDate && dateRange?.endDate) {
            const start = new Date(dateRange.startDate).toLocaleDateString('en-IN');
            const end = new Date(dateRange.endDate).toLocaleDateString('en-IN');
            
            subject += dateRange.startDate === dateRange.endDate ? ` - ${start}` : ` - ${start} to ${end}`;
        } else {
            subject += ` - ${new Date().toLocaleDateString('en-IN')}`;
        }

        return subject;
    }

    generateEmailContent({ reportType, customMessage, dateRange }) {
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
    }
}

module.exports = EmailService;
