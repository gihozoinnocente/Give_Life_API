import { query, getClient } from '../config/database';
import {
  BloodRequestNotification,
  Notification,
} from '../types';
import { SMSService } from './sms.service';

export class NotificationService {
  private smsService: SMSService;

  constructor() {
    this.smsService = new SMSService();
  }

  // Blood type compatibility matrix
  private getCompatibleBloodTypes(bloodType: string): string[] {
    const compatibilityMap: { [key: string]: string[] } = {
      'O-': ['O-'],
      'O+': ['O-', 'O+'],
      'A-': ['O-', 'A-'],
      'A+': ['O-', 'O+', 'A-', 'A+'],
      'B-': ['O-', 'B-'],
      'B+': ['O-', 'O+', 'B-', 'B+'],
      'AB-': ['O-', 'A-', 'B-', 'AB-'],
      'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
    };
    return compatibilityMap[bloodType] || [bloodType];
  }

  // Helper: Resolve user ID (accepts UUID or integer index)
  private async resolveUserId(userIdOrIndex: string): Promise<string> {
    // Check if it's a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(userIdOrIndex)) {
      return userIdOrIndex; // Already a UUID
    }

    // If it's a number, treat it as a row index (for development/testing)
    const index = parseInt(userIdOrIndex);
    if (!isNaN(index) && index > 0) {
      const result = await query(
        `SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET $1`,
        [index - 1] // Convert 1-based to 0-based index
      );
      
      if (result.rows.length === 0) {
        throw new Error(`User with index ${index} not found`);
      }
      
      return result.rows[0].id;
    }

    throw new Error('Invalid user ID format');
  }

  // Get hospital profile
  async getHospitalProfile(userId: string): Promise<any> {
    const result = await query(
      `SELECT hp.hospital_name, hp.address 
       FROM hospital_profiles hp 
       WHERE hp.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Hospital profile not found');
    }

    return {
      hospitalName: result.rows[0].hospital_name,
      address: result.rows[0].address,
    };
  }

  // Create blood request and send notifications to all users
  async createBloodRequest(
    requestData: BloodRequestNotification
  ): Promise<BloodRequestNotification> {
    // Get a single client for the transaction
    const client = await getClient();

    try {
      await client.query('BEGIN');
      
      // Insert blood request
      const requestResult = await client.query(
        `INSERT INTO blood_requests 
         (hospital_id, hospital_name, blood_type, units_needed, urgency, 
          patient_condition, contact_person, contact_phone, location, 
          additional_notes, expiry_date, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         RETURNING *`,
        [
          requestData.hospitalId,
          requestData.hospitalName,
          requestData.bloodType,
          requestData.unitsNeeded,
          requestData.urgency,
          requestData.patientCondition,
          requestData.contactPerson,
          requestData.contactPhone,
          requestData.location,
          requestData.additionalNotes || null,
          requestData.expiryDate,
          'active',
        ]
      );

      const bloodRequest = requestResult.rows[0];

      // Verify blood request was created
      if (!bloodRequest || !bloodRequest.id) {
        throw new Error('Failed to create blood request');
      }

      console.log('Blood request created with ID:', bloodRequest.id);

      // Get compatible blood types for the request
      const compatibleBloodTypes = this.getCompatibleBloodTypes(requestData.bloodType);
      console.log(`Compatible blood types for ${requestData.bloodType}:`, compatibleBloodTypes);

      // Get eligible donors based on blood type compatibility
      const usersResult = await client.query(
        `SELECT u.id, dp.phone_number, dp.first_name, dp.blood_group 
         FROM users u
         LEFT JOIN donor_profiles dp ON u.id = dp.user_id
         WHERE u.is_active = true 
         AND (dp.blood_group = ANY($1) OR dp.blood_group IS NULL)`,
        [compatibleBloodTypes]
      );

      console.log(`Found ${usersResult.rows.length} eligible users for notifications`);

      // Create notification title and message based on urgency
      const isCritical = requestData.urgency === 'critical';
      const title = isCritical 
        ? `🚨 CRITICAL: ${requestData.bloodType} Blood Needed Urgently`
        : `Urgent: ${requestData.bloodType} Blood Needed`;
      const message = `${requestData.hospitalName} needs ${requestData.unitsNeeded} units of ${requestData.bloodType} blood. Urgency: ${requestData.urgency}. Contact: ${requestData.contactPhone}`;

      // Insert notifications for all eligible users
      const notificationPromises = usersResult.rows.map((user) =>
        client.query(
          `INSERT INTO notifications 
           (user_id, type, title, message, blood_request_id, is_read) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.id, 'blood_request', title, message, bloodRequest.id, false]
        )
      );

      await Promise.all(notificationPromises);
      
      console.log('All notifications created successfully');

      // Send SMS ONLY for critical requests
      if (isCritical) {
        try {
          // Filter donors with compatible blood types and phone numbers
          const eligibleDonors = usersResult.rows
            .filter((user) => 
              user.phone_number && 
              user.phone_number.trim() !== '' &&
              user.blood_group && 
              compatibleBloodTypes.includes(user.blood_group)
            )
            .map((user) => ({
              phoneNumber: user.phone_number,
              userId: user.id,
              firstName: user.first_name,
            }));

          if (eligibleDonors.length > 0) {
            console.log(`🚨 CRITICAL REQUEST: Sending SMS to ${eligibleDonors.length} compatible donors`);
            const smsResults = await this.smsService.sendBloodRequestSMS(
              eligibleDonors,
              bloodRequest.blood_type,
              bloodRequest.hospital_name,
              bloodRequest.urgency,
              bloodRequest.units_needed,
              bloodRequest.contact_person,
              bloodRequest.contact_phone,
              bloodRequest.patient_condition,
              bloodRequest.id
            );
            console.log(`SMS sent: ${smsResults.sent} successful, ${smsResults.failed} failed`);
          } else {
            console.log('No eligible donors with phone numbers found for SMS');
          }
        } catch (smsError) {
          // Don't fail the whole transaction if SMS fails
          console.error('SMS sending failed, but notifications were created:', smsError);
        }
      } else {
        console.log(`ℹ️ Non-critical request (${requestData.urgency}): SMS not sent, only in-app notifications created`);
      }

      await client.query('COMMIT');

      return {
        id: bloodRequest.id,
        hospitalId: bloodRequest.hospital_id,
        hospitalName: bloodRequest.hospital_name,
        bloodType: bloodRequest.blood_type,
        unitsNeeded: bloodRequest.units_needed,
        urgency: bloodRequest.urgency,
        patientCondition: bloodRequest.patient_condition,
        contactPerson: bloodRequest.contact_person,
        contactPhone: bloodRequest.contact_phone,
        location: bloodRequest.location,
        additionalNotes: bloodRequest.additional_notes,
        expiryDate: bloodRequest.expiry_date,
        status: bloodRequest.status,
        createdAt: bloodRequest.created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all notifications for a user
  async getUserNotifications(userIdOrIndex: string): Promise<Notification[]> {
    const userId = await this.resolveUserId(userIdOrIndex);
    const result = await query(
      `SELECT n.*, 
              br.hospital_id, br.hospital_name, br.blood_type, br.units_needed, 
              br.urgency, br.patient_condition, br.contact_person, br.contact_phone, 
              br.location, br.additional_notes, br.expiry_date, br.status as request_status
       FROM notifications n
       LEFT JOIN blood_requests br ON n.blood_request_id = br.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      data: {
        id: row.blood_request_id,
        hospitalId: row.hospital_id,
        hospitalName: row.hospital_name,
        bloodType: row.blood_type,
        unitsNeeded: row.units_needed,
        urgency: row.urgency,
        patientCondition: row.patient_condition,
        contactPerson: row.contact_person,
        contactPhone: row.contact_phone,
        location: row.location,
        additionalNotes: row.additional_notes,
        expiryDate: row.expiry_date,
        status: row.request_status,
      },
      isRead: row.is_read,
      createdAt: row.created_at,
    }));
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
  }

  // Get unread notification count
  async getUnreadCount(userIdOrIndex: string): Promise<number> {
    const userId = await this.resolveUserId(userIdOrIndex);
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  // Delete notification
  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<void> {
    await query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [
      notificationId,
      userId,
    ]);
  }

  // Get all active blood requests
  async getActiveBloodRequests(): Promise<BloodRequestNotification[]> {
    const result = await query(
      `SELECT * FROM blood_requests 
       WHERE status = 'active' AND expiry_date > NOW()
       ORDER BY 
         CASE urgency 
           WHEN 'critical' THEN 1 
           WHEN 'urgent' THEN 2 
           WHEN 'normal' THEN 3 
         END,
         created_at DESC`,
      []
    );

    return result.rows.map((row) => ({
      id: row.id,
      hospitalId: row.hospital_id,
      hospitalName: row.hospital_name,
      bloodType: row.blood_type,
      unitsNeeded: row.units_needed,
      urgency: row.urgency,
      patientCondition: row.patient_condition,
      contactPerson: row.contact_person,
      contactPhone: row.contact_phone,
      location: row.location,
      additionalNotes: row.additional_notes,
      expiryDate: row.expiry_date,
      status: row.status,
      createdAt: row.created_at,
    }));
  }
}
