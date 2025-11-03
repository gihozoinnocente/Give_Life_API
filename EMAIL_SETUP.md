# Email Service Setup Guide

This guide will help you configure the email service for the Blood Donation App API.

## 📋 Current Issues Found

1. ❌ Missing email configuration in `.env` file
2. ❌ `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are empty
3. ❌ Missing `EMAIL_PROVIDER` setting
4. ❌ Missing `EMAIL_FROM` or sender email address
5. ⚠️ `SMTP_SECURE=true` with port 587 (should be `false` for port 587)

## 🚀 Quick Setup

### Option 1: Gmail SMTP (Easiest for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Update your `.env` file**:
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yigihozoinnocente@gmail.com
SMTP_PASS=zsxn hlzz yzok ktai
EMAIL_FROM=igihozoinnocente@gmail.com
TEST_EMAIL=recipient@example.com
```

### Option 2: SendGrid (Recommended for Production)

1. **Create a SendGrid account**: https://signup.sendgrid.com/
2. **Create an API Key**:
   - Go to: Settings → API Keys
   - Click "Create API Key"
   - Choose "Full Access"
   - Copy the API key

3. **Verify a Sender Email**:
   - Go to: Settings → Sender Authentication
   - Verify a single sender email

4. **Update your `.env` file**:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM=noreply@yourdomain.com
TEST_EMAIL=recipient@example.com
```

### Option 3: Outlook/Hotmail SMTP

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
EMAIL_FROM=your-email@outlook.com
TEST_EMAIL=recipient@example.com
```

## 🧪 Testing the Email Service

After configuring your `.env` file, run the test:

```bash
npm run test:email
```

Or manually:

```bash
npx ts-node src/tests/email.test.ts
```

### Expected Output

```
🧪 Testing Email Service...

📋 Current Email Configuration:
EMAIL_PROVIDER: smtp
SENDGRID_API_KEY: Not set
EMAIL_FROM: your-email@gmail.com
...

✅ Step 1: Initializing Email Service...
✅ Email Service initialized successfully!

📧 Step 2: Sending test email to: recipient@example.com
✅ Test email sent successfully! 🎉

✨ Email Service Test Completed Successfully!
```

## 📧 Common Email Use Cases in the App

The email service will be used for:

1. **Welcome Emails**: When a new donor or hospital registers
2. **Donation Confirmations**: After a successful blood donation
3. **Appointment Reminders**: Before scheduled donation appointments
4. **Blood Request Notifications**: When a hospital needs blood
5. **Password Reset**: For account recovery
6. **Match Notifications**: When a donor matches a blood request

## 🔧 Troubleshooting

### Gmail Issues

**Problem**: "Less secure app access"
- **Solution**: Use App Passwords (not your regular password)
- Enable 2FA first, then generate app password

**Problem**: "Username and Password not accepted"
- **Solution**: 
  - Verify you're using the app password, not your regular password
  - Check that 2FA is enabled
  - Make sure SMTP settings are correct

### SendGrid Issues

**Problem**: "Sender not verified"
- **Solution**: Go to SendGrid → Settings → Sender Authentication and verify your sender email

**Problem**: "Invalid API Key"
- **Solution**: Regenerate API key and update `.env` file

### General Issues

**Problem**: Connection timeout
- **Solution**: 
  - Check your firewall settings
  - Verify SMTP_HOST and SMTP_PORT are correct
  - Try using a different network (some ISPs block SMTP)

**Problem**: "Email transporter not initialized"
- **Solution**: Check that all required environment variables are set

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EMAIL_PROVIDER` | Yes | Email service provider | `smtp` or `sendgrid` |
| `EMAIL_FROM` | Yes* | Sender email address | `noreply@yourapp.com` |
| `SENDGRID_API_KEY` | If using SendGrid | SendGrid API key | `SG.xxxxx...` |
| `SENDGRID_FROM` | If using SendGrid | Verified sender email | `noreply@yourapp.com` |
| `SMTP_HOST` | If using SMTP | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | If using SMTP | SMTP server port | `587` (TLS) or `465` (SSL) |
| `SMTP_SECURE` | If using SMTP | Use SSL/TLS | `false` (587) or `true` (465) |
| `SMTP_USER` | If using SMTP | SMTP username/email | `your-email@gmail.com` |
| `SMTP_PASS` | If using SMTP | SMTP password | App password for Gmail |
| `TEST_EMAIL` | Optional | Email for testing | `test@example.com` |

*Falls back to `SENDGRID_FROM` or `SMTP_USER` if not set

## 🎯 Next Steps

1. Choose your email provider (Gmail for testing, SendGrid for production)
2. Update your `.env` file with the correct credentials
3. Run the test: `npx ts-node src/tests/email.test.ts`
4. If successful, integrate email notifications into your controllers
5. Add the test script to `package.json` for easy access

## 📚 Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

**Need Help?** Check the troubleshooting section above or create an issue in the repository.
