import { EmailService } from '../services/email.service';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Display current configuration
  console.log('📋 Current Email Configuration:');
  console.log('EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER || 'Not set');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '***SET***' : 'Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
  console.log('SENDGRID_FROM:', process.env.SENDGRID_FROM || 'Not set');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'Not set');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || 'Not set');
  console.log('SMTP_USER:', process.env.SMTP_USER || 'Not set');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'Not set');
  console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'Not set');
  console.log('---\n');

  try {
    // Initialize email service
    console.log('✅ Step 1: Initializing Email Service...');
    const emailService = new EmailService();
    console.log('✅ Email Service initialized successfully!\n');

    // Get test email from user
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    console.log(`📧 Step 2: Sending test email to: ${testEmail}`);

    // Send test email
    await emailService.sendMail(
      testEmail,
      '🩸 Blood Donation App - Email Test',
      `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9fafb; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🩸 Blood Donation App</h1>
            </div>
            <div class="content">
              <h2>Email Service Test Successful!</h2>
              <p>Hello,</p>
              <p>This is a test email from your Blood Donation App API. If you're reading this, your email service is configured correctly! 🎉</p>
              <p><strong>Test Details:</strong></p>
              <ul>
                <li>Date: ${new Date().toLocaleString()}</li>
                <li>Service: ${process.env.EMAIL_PROVIDER || 'SMTP'}</li>
                <li>Environment: ${process.env.NODE_ENV || 'development'}</li>
              </ul>
              <p>You can now use this email service to send notifications to donors and hospitals.</p>
            </div>
            <div class="footer">
              <p>© 2025 Blood Donation App. Powered by Give Life API.</p>
            </div>
          </div>
        </body>
        </html>
      `
    );

    console.log('✅ Test email sent successfully! 🎉');
    console.log('\n✨ Email Service Test Completed Successfully!\n');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Email Service Test Failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting Tips:');
    
    if (error.message.includes('SendGrid')) {
      console.error('  - Check your SENDGRID_API_KEY in .env file');
      console.error('  - Verify the API key is valid on SendGrid dashboard');
      console.error('  - Set SENDGRID_FROM or EMAIL_FROM with a verified sender email');
    } else if (error.message.includes('SMTP')) {
      console.error('  - Check your SMTP_HOST, SMTP_USER, SMTP_PASS in .env file');
      console.error('  - Verify SMTP_PORT (587 for TLS, 465 for SSL)');
      console.error('  - Set SMTP_SECURE=false for port 587, true for port 465');
      console.error('  - Check if your email provider requires app-specific passwords');
    }
    console.error('  - Make sure all required environment variables are set');
    console.error('\n');
    process.exit(1);
  }
}

// Run the test
testEmailService();
