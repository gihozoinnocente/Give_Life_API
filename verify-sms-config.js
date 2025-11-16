/**
 * SMS Configuration Verification Script
 * Run this to check if your SMS setup is correct
 * 
 * Usage: node verify-sms-config.js
 */

require('dotenv').config();

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║                                                       ║');
console.log('║   🩸 Blood Donation API - SMS Configuration Check    ║');
console.log('║                                                       ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

// Check if SMS is enabled
const smsEnabled = process.env.SMS_ENABLED === 'true';
console.log('1. SMS Service Status:');
console.log(`   ${smsEnabled ? '✅' : '❌'} SMS_ENABLED = ${process.env.SMS_ENABLED || 'not set'}`);
console.log(`   ${smsEnabled ? '   SMS will be sent' : '   SMS will NOT be sent (only simulated)'}\n`);

// Check provider configuration
console.log('2. SMS Provider Configuration:\n');

// Check Africa's Talking
const hasAfricasTalking = !!(
  process.env.AFRICASTALKING_USERNAME && 
  process.env.AFRICASTALKING_API_KEY
);

console.log('   Africa\'s Talking (Recommended for Rwanda):');
console.log(`   ${process.env.AFRICASTALKING_USERNAME ? '✅' : '❌'} Username: ${process.env.AFRICASTALKING_USERNAME || 'not set'}`);
console.log(`   ${process.env.AFRICASTALKING_API_KEY ? '✅' : '❌'} API Key: ${process.env.AFRICASTALKING_API_KEY ? '***' + process.env.AFRICASTALKING_API_KEY.slice(-4) : 'not set'}`);
console.log(`   ${process.env.AFRICASTALKING_SENDER_ID ? '✅' : '⚠️'} Sender ID: ${process.env.AFRICASTALKING_SENDER_ID || 'not set (optional)'}\n`);

// Check Twilio
const hasTwilio = !!(
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_PHONE_NUMBER
);

console.log('   Twilio (Global):');
console.log(`   ${process.env.TWILIO_ACCOUNT_SID ? '✅' : '❌'} Account SID: ${process.env.TWILIO_ACCOUNT_SID || 'not set'}`);
console.log(`   ${process.env.TWILIO_AUTH_TOKEN ? '✅' : '❌'} Auth Token: ${process.env.TWILIO_AUTH_TOKEN ? '***' + process.env.TWILIO_AUTH_TOKEN.slice(-4) : 'not set'}`);
console.log(`   ${process.env.TWILIO_PHONE_NUMBER ? '✅' : '❌'} Phone Number: ${process.env.TWILIO_PHONE_NUMBER || 'not set'}\n`);

// Determine active provider
console.log('3. Active SMS Provider:\n');
if (!smsEnabled) {
  console.log('   ⚠️  SMS is DISABLED - No provider will be used');
  console.log('   📝 SMS messages will be logged to console only\n');
} else if (hasAfricasTalking) {
  console.log('   ✅ Africa\'s Talking will be used');
  console.log('   📱 Good choice for Rwanda!\n');
} else if (hasTwilio) {
  console.log('   ✅ Twilio will be used');
  console.log('   🌍 Global SMS provider\n');
} else {
  console.log('   ❌ NO PROVIDER CONFIGURED');
  console.log('   ⚠️  SMS will be simulated (logged to console)\n');
}

// Check database configuration
console.log('4. Database Configuration:\n');
const hasDatabase = !!(
  process.env.DATABASE_URL || 
  (process.env.DB_HOST && process.env.DB_NAME)
);
console.log(`   ${hasDatabase ? '✅' : '❌'} Database: ${hasDatabase ? 'Configured' : 'Not configured'}`);
if (process.env.DATABASE_URL) {
  console.log(`   📊 Using DATABASE_URL`);
} else if (process.env.DB_HOST) {
  console.log(`   📊 Using: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
}
console.log();

// Summary
console.log('═══════════════════════════════════════════════════════\n');
console.log('📋 SUMMARY:\n');

const canSendSMS = smsEnabled && (hasAfricasTalking || hasTwilio);

if (canSendSMS) {
  console.log('✅ SMS CONFIGURATION IS COMPLETE!');
  console.log('   You can send SMS to donors for critical blood requests.\n');
  
  console.log('🧪 To test SMS sending:');
  console.log('   1. Start your server: npm run dev');
  console.log('   2. Create a critical blood request via API');
  console.log('   3. Check server logs for SMS sending status\n');
  
  console.log('💰 Cost Information:');
  if (hasAfricasTalking) {
    console.log('   - Africa\'s Talking: ~$0.02-$0.05 per SMS');
    console.log('   - Sandbox mode: Free (limited to verified numbers)');
  } else {
    console.log('   - Twilio: ~$0.0079 per SMS (US/Canada)');
    console.log('   - Trial account: Free credits (verified numbers only)');
  }
  console.log();
  
} else if (!smsEnabled) {
  console.log('⚠️  SMS IS DISABLED');
  console.log('   SMS messages will be logged to console only.\n');
  
  console.log('To enable SMS:');
  console.log('   1. Set SMS_ENABLED=true in .env');
  console.log('   2. Configure a provider (Africa\'s Talking or Twilio)');
  console.log('   3. Restart your server\n');
  
} else {
  console.log('❌ SMS PROVIDER NOT CONFIGURED');
  console.log('   SMS is enabled but no provider credentials found.\n');
  
  console.log('To fix this:');
  console.log('\n📱 For Africa\'s Talking (Recommended for Rwanda):');
  console.log('   1. Sign up: https://account.africastalking.com/auth/register');
  console.log('   2. Get your credentials from dashboard');
  console.log('   3. Add to .env:');
  console.log('      AFRICASTALKING_USERNAME=your_username');
  console.log('      AFRICASTALKING_API_KEY=your_api_key');
  console.log('      AFRICASTALKING_SENDER_ID=BloodDonor\n');
  
  console.log('🌍 For Twilio (Global):');
  console.log('   1. Sign up: https://www.twilio.com/try-twilio');
  console.log('   2. Get your credentials from console');
  console.log('   3. Add to .env:');
  console.log('      TWILIO_ACCOUNT_SID=your_account_sid');
  console.log('      TWILIO_AUTH_TOKEN=your_auth_token');
  console.log('      TWILIO_PHONE_NUMBER=+1234567890\n');
}

console.log('═══════════════════════════════════════════════════════\n');

// Exit with appropriate code
process.exit(canSendSMS ? 0 : 1);
