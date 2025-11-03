import { query } from '../config/database';

// SMS Result Interface
interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// SMS Service Interface
interface SMSProvider {
  sendSMS(to: string, message: string): Promise<SMSResult>;
  sendBulkSMS(recipients: string[], message: string): Promise<SMSResult[]>;
}

// Twilio Provider
class TwilioProvider implements SMSProvider {
  private client: any;
  private phoneNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken || !this.phoneNumber) {
      console.warn('Twilio credentials not configured. SMS will be disabled.');
      return;
    }

    try {
      // Dynamic import to avoid errors if twilio is not installed
      const twilio = require('twilio');
      this.client = twilio(accountSid, authToken);
    } catch (error) {
      console.warn('Twilio package not installed. Install with: npm install twilio');
    }
  }

  async sendSMS(to: string, message: string): Promise<SMSResult> {
    try {
      if (!this.client) {
        console.log('[SMS Simulation] Would send to:', to, 'Message:', message);
        return { success: false, error: 'Twilio not configured' };
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: to,
      });

      console.log('SMS sent via Twilio:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error: any) {
      console.error('Twilio SMS error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkSMS(recipients: string[], message: string): Promise<SMSResult[]> {
    const promises = recipients.map((phone) => this.sendSMS(phone, message));
    const results = await Promise.allSettled(promises);
    return results.map((r) => (r.status === 'fulfilled' ? r.value : { success: false, error: 'Failed' }));
  }
}

// Africa's Talking Provider
class AfricasTalkingProvider implements SMSProvider {
  private client: any;
  private senderId: string;

  constructor() {
    const username = process.env.AFRICASTALKING_USERNAME;
    const apiKey = process.env.AFRICASTALKING_API_KEY;
    this.senderId = process.env.AFRICASTALKING_SENDER_ID || '';

    if (!username || !apiKey) {
      console.warn("Africa's Talking credentials not configured. SMS will be disabled.");
      return;
    }

    try {
      const AfricasTalking = require('africastalking')({
        apiKey: apiKey,
        username: username,
      });
      this.client = AfricasTalking.SMS;
    } catch (error) {
      console.error("Failed to initialize Africa's Talking:", error);
    }
  }

  async sendSMS(to: string, message: string): Promise<SMSResult> {
    try {
      if (!this.client) {
        console.log('[SMS Simulation] Would send to:', to, 'Message:', message);
        return { success: false, error: "Africa's Talking not configured" };
      }

      const options = {
        to: [to],
        message: message,
        from: this.senderId,
      };

      const result = await this.client.send(options);
      console.log("SMS sent via Africa's Talking:", result);
      
      const messageId = result.SMSMessageData?.Recipients?.[0]?.messageId;
      return { success: true, messageId };
    } catch (error: any) {
      console.error("Africa's Talking SMS error:", error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkSMS(recipients: string[], message: string): Promise<SMSResult[]> {
    try {
      if (!this.client) {
        console.log('[SMS Simulation] Would send bulk SMS to', recipients.length, 'recipients');
        return recipients.map(() => ({ success: false, error: 'Not configured' }));
      }

      const options = {
        to: recipients,
        message: message,
        from: this.senderId,
      };

      const result = await this.client.send(options);
      console.log('Bulk SMS sent:', result);
      
      // Parse results for each recipient
      const smsResults = result.SMSMessageData?.Recipients?.map((r: any) => ({
        success: r.status === 'Success',
        messageId: r.messageId,
        error: r.status !== 'Success' ? r.status : undefined,
      })) || [];
      
      return smsResults;
    } catch (error: any) {
      console.error('Bulk SMS error:', error);
      return recipients.map(() => ({ success: false, error: error.message }));
    }
  }
}

// SMS Service
export class SMSService {
  private provider: SMSProvider;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.SMS_ENABLED === 'true';

    if (!this.enabled) {
      console.log('SMS service is disabled');
      this.provider = new TwilioProvider(); // Fallback
      return;
    }

    // Choose provider based on environment variables
    if (process.env.AFRICASTALKING_USERNAME && process.env.AFRICASTALKING_API_KEY) {
      console.log("Using Africa's Talking SMS provider");
      this.provider = new AfricasTalkingProvider();
    } else if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      console.log('Using Twilio SMS provider');
      this.provider = new TwilioProvider();
    } else {
      console.warn('No SMS provider configured. SMS will be simulated.');
      this.provider = new TwilioProvider(); // Fallback for simulation
    }
  }

  // Format phone number to international format
  private formatPhoneNumber(phone: string): string {
    // Remove spaces, dashes, and parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // If it starts with 0, replace with country code (Rwanda: +250)
    if (cleaned.startsWith('0')) {
      cleaned = '+250' + cleaned.substring(1);
    }

    // If it doesn't start with +, add Rwanda country code
    if (!cleaned.startsWith('+')) {
      cleaned = '+250' + cleaned;
    }

    return cleaned;
  }

  // Log SMS to database
  private async logSMS(
    userId: string | null,
    phoneNumber: string,
    message: string,
    result: SMSResult,
    bloodRequestId?: string
  ): Promise<void> {
    try {
      const provider = process.env.AFRICASTALKING_USERNAME ? 'africastalking' : 'twilio';
      await query(
        `INSERT INTO sms_logs 
         (user_id, phone_number, message, blood_request_id, status, provider, provider_message_id, error_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          phoneNumber,
          message,
          bloodRequestId || null,
          result.success ? 'sent' : 'failed',
          provider,
          result.messageId || null,
          result.error || null,
        ]
      );
    } catch (error) {
      console.error('Failed to log SMS:', error);
    }
  }

  // Send single SMS
  async sendSMS(to: string, message: string, userId?: string, bloodRequestId?: string): Promise<SMSResult> {
    if (!this.enabled) {
      console.log('[SMS Disabled] Would send to:', to);
      return { success: false, error: 'SMS disabled' };
    }

    const formattedPhone = this.formatPhoneNumber(to);
    const result = await this.provider.sendSMS(formattedPhone, message);
    
    // Log to database
    await this.logSMS(userId || null, formattedPhone, message, result, bloodRequestId);
    
    return result;
  }

  // Send bulk SMS
  async sendBulkSMS(
    recipients: Array<{ phoneNumber: string; userId?: string }>,
    message: string,
    bloodRequestId?: string
  ): Promise<SMSResult[]> {
    if (!this.enabled) {
      console.log('[SMS Disabled] Would send to', recipients.length, 'recipients');
      return recipients.map(() => ({ success: false, error: 'SMS disabled' }));
    }

    const formattedPhones = recipients.map((r) => this.formatPhoneNumber(r.phoneNumber));
    const results = await this.provider.sendBulkSMS(formattedPhones, message);
    
    // Log each SMS to database
    for (let i = 0; i < recipients.length; i++) {
      await this.logSMS(
        recipients[i].userId || null,
        formattedPhones[i],
        message,
        results[i],
        bloodRequestId
      );
    }
    
    return results;
  }

  // Format critical blood request SMS message
  private formatCriticalBloodRequestSMS(
    hospitalName: string,
    bloodType: string,
    unitsNeeded: number,
    contactPerson: string,
    contactPhone: string,
    patientCondition: string
  ): string {
    return `🚨 URGENT BLOOD NEEDED 🚨

Hospital: ${hospitalName}
Blood Type: ${bloodType}
Units: ${unitsNeeded}
Urgency: CRITICAL

Contact: ${contactPerson}
Phone: ${contactPhone}

${patientCondition}

Please respond if you can donate.
Lives depend on you! 🩸`;
  }

  // Format normal blood request SMS message
  private formatNormalBloodRequestSMS(
    hospitalName: string,
    bloodType: string,
    unitsNeeded: number,
    contactPhone: string
  ): string {
    return `🩸 Blood Donation Request

Hospital: ${hospitalName}
Blood Type: ${bloodType}
Units Needed: ${unitsNeeded}

Contact: ${contactPhone}

Your donation can save lives!`;
  }

  // Send blood request SMS to donors
  async sendBloodRequestSMS(
    recipients: Array<{ phoneNumber: string; userId?: string; firstName?: string }>,
    bloodType: string,
    hospitalName: string,
    urgency: string,
    unitsNeeded: number,
    contactPerson: string,
    contactPhone: string,
    patientCondition: string,
    bloodRequestId?: string
  ): Promise<{ sent: number; failed: number }> {
    // Format message based on urgency
    let message: string;
    if (urgency === 'critical') {
      message = this.formatCriticalBloodRequestSMS(
        hospitalName,
        bloodType,
        unitsNeeded,
        contactPerson,
        contactPhone,
        patientCondition
      );
    } else {
      message = this.formatNormalBloodRequestSMS(
        hospitalName,
        bloodType,
        unitsNeeded,
        contactPhone
      );
    }

    const validRecipients = recipients.filter((r) => r.phoneNumber && r.phoneNumber.trim() !== '');

    if (validRecipients.length === 0) {
      console.log('No valid phone numbers to send SMS');
      return { sent: 0, failed: 0 };
    }

    console.log(`Sending ${urgency} blood request SMS to ${validRecipients.length} donors`);
    const results = await this.sendBulkSMS(validRecipients, message, bloodRequestId);
    
    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    
    console.log(`SMS Results: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  // Test SMS functionality
  async testSMS(to: string): Promise<SMSResult> {
    const message = 'Test message from Blood Donation App. SMS is working!';
    return await this.sendSMS(to, message);
  }

  // Get SMS statistics
  async getSMSStats(bloodRequestId?: string): Promise<any> {
    try {
      let queryText = `
        SELECT 
          status,
          COUNT(*) as count,
          provider
        FROM sms_logs
      `;
      const params: any[] = [];
      
      if (bloodRequestId) {
        queryText += ' WHERE blood_request_id = $1';
        params.push(bloodRequestId);
      }
      
      queryText += ' GROUP BY status, provider';
      
      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Failed to get SMS stats:', error);
      return [];
    }
  }
}
