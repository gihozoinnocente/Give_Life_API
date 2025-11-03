import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { CreateAppointmentDTO, UpdateAppointmentDTO } from '../types';

export class AppointmentController {
  /**
   * Get all appointments for a donor
   */
  async getDonorAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { donorId } = req.params;
      const { status } = req.query;

      let query = `
        SELECT 
          a.id,
          a.donor_id,
          a.hospital_id,
          a.date,
          a.time,
          a.type,
          a.status,
          a.notes,
          a.created_at,
          a.updated_at,
          h.hospital_name as hospital,
          h.address,
          h.phone_number as phone
        FROM appointments a
        LEFT JOIN hospital_profiles h ON a.hospital_id = h.user_id
        WHERE a.donor_id = $1
      `;
      const params: any[] = [donorId];

      if (status) {
        query += ` AND a.status = $2`;
        params.push(status);
      }

      query += ` ORDER BY a.date DESC, a.time DESC`;

      const result = await pool.query(query, params);

      // Format response to match UI expectations
      const formattedData = result.rows.map(row => ({
        id: row.id,
        hospital: row.hospital,
        address: row.address,
        phone: row.phone,
        date: row.date,
        time: row.time,
        type: row.type === 'regular' ? 'Regular Donation' : 
              row.type === 'platelet' ? 'Platelet Donation' :
              row.type === 'plasma' ? 'Plasma Donation' : 'Urgent Donation',
        status: row.status,
        notes: row.notes,
        donorId: row.donor_id,
        hospitalId: row.hospital_id
      }));

      res.status(200).json({
        status: 'success',
        data: formattedData,
      });
    } catch (error) {
      console.error('Error fetching donor appointments:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch appointments',
      });
    }
  }

  /**
   * Get all appointments for a hospital
   */
  async getHospitalAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;
      const { status, date } = req.query;

      let query = `
        SELECT 
          a.id,
          a.donor_id,
          a.hospital_id,
          a.date,
          a.time,
          a.type,
          a.status,
          a.notes,
          a.created_at,
          a.updated_at,
          COALESCE(
            dp.first_name || ' ' || dp.last_name,
            u.email
          ) as donor_name,
          dp.phone_number as phone,
          dp.blood_group as blood_type,
          u.email as donor_email
        FROM appointments a
        JOIN users u ON a.donor_id = u.id
        LEFT JOIN donor_profiles dp ON a.donor_id = dp.user_id
        WHERE a.hospital_id = $1
      `;
      const params: any[] = [hospitalId];
      let paramIndex = 2;

      if (status) {
        query += ` AND a.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (date) {
        query += ` AND DATE(a.date) = $${paramIndex}`;
        params.push(date);
        paramIndex++;
      }

      query += ` ORDER BY a.date ASC, a.time ASC`;

      const result = await pool.query(query, params);

      // Format response to match UI expectations
      const formattedData = result.rows.map(row => ({
        id: row.id,
        donorName: row.donor_name,
        bloodType: row.blood_type,
        phone: row.phone,
        time: row.time,
        duration: '30 min',
        status: row.status,
        type: row.type,
        location: 'Main Donation Center',
        notes: row.notes || '',
        donorId: row.donor_id,
        date: row.date
      }));

      res.status(200).json({
        status: 'success',
        data: formattedData,
      });
    } catch (error) {
      console.error('Error fetching hospital appointments:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch appointments',
      });
    }
  }

  /**
   * Create a new appointment
   */
  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointmentData: CreateAppointmentDTO = req.body;
      
      // Validate required fields
      if (!appointmentData.donorId || !appointmentData.hospitalId || !appointmentData.date || !appointmentData.time || !appointmentData.type) {
        res.status(400).json({
          status: 'error',
          message: 'Missing required fields: donorId, hospitalId, date, time, and type are required',
        });
        return;
      }

      // Check if the time slot is already booked
      const existingAppointment = await pool.query(
        `SELECT id FROM appointments 
         WHERE hospital_id = $1 AND DATE(date) = $2 AND time = $3 AND status != 'cancelled'`,
        [appointmentData.hospitalId, appointmentData.date, appointmentData.time]
      );

      if (existingAppointment.rows.length > 0) {
        res.status(409).json({
          status: 'error',
          message: 'This time slot is already booked. Please choose another time.',
        });
        return;
      }

      // Check if donor already has an appointment on this date at this hospital
      const donorExistingAppointment = await pool.query(
        `SELECT id FROM appointments 
         WHERE donor_id = $1 AND hospital_id = $2 AND DATE(date) = $3 AND status != 'cancelled'`,
        [appointmentData.donorId, appointmentData.hospitalId, appointmentData.date]
      );

      if (donorExistingAppointment.rows.length > 0) {
        res.status(409).json({
          status: 'error',
          message: 'You already have an appointment at this hospital on this date.',
        });
        return;
      }

      const id = uuidv4();

      const result = await pool.query(
        `INSERT INTO appointments (id, donor_id, hospital_id, date, time, type, status, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [
          id,
          appointmentData.donorId,
          appointmentData.hospitalId,
          appointmentData.date,
          appointmentData.time,
          appointmentData.type,
          'pending',
          appointmentData.notes || null,
        ]
      );

      // Fetch hospital details for response
      const hospitalDetails = await pool.query(
        `SELECT hospital_name, address, phone_number FROM hospital_profiles WHERE user_id = $1`,
        [appointmentData.hospitalId]
      );

      res.status(201).json({
        status: 'success',
        message: 'Appointment scheduled successfully',
        data: {
          ...result.rows[0],
          hospital_name: hospitalDetails.rows[0]?.hospital_name,
          hospital_address: hospitalDetails.rows[0]?.address,
          hospital_phone: hospitalDetails.rows[0]?.phone_number,
        },
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create appointment',
      });
    }
  }

  /**
   * Update appointment
   */
  async updateAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateAppointmentDTO = req.body;

      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateData.date !== undefined) {
        fields.push(`date = $${paramIndex}`);
        values.push(updateData.date);
        paramIndex++;
      }

      if (updateData.time !== undefined) {
        fields.push(`time = $${paramIndex}`);
        values.push(updateData.time);
        paramIndex++;
      }

      if (updateData.type !== undefined) {
        fields.push(`type = $${paramIndex}`);
        values.push(updateData.type);
        paramIndex++;
      }

      if (updateData.status !== undefined) {
        fields.push(`status = $${paramIndex}`);
        values.push(updateData.status);
        paramIndex++;
      }

      if (updateData.notes !== undefined) {
        fields.push(`notes = $${paramIndex}`);
        values.push(updateData.notes);
        paramIndex++;
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await pool.query(
        `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Appointment not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'Appointment updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update appointment',
      });
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE appointments 
         SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Appointment not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'Appointment cancelled successfully',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to cancel appointment',
      });
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT a.*, 
                h.hospital_name,
                dp.first_name || ' ' || dp.last_name as donor_name,
                dp.phone_number as donor_phone
         FROM appointments a
         LEFT JOIN hospital_profiles h ON a.hospital_id = h.user_id
         LEFT JOIN donor_profiles dp ON a.donor_id = dp.user_id
         WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Appointment not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch appointment',
      });
    }
  }

  /**
   * Get available time slots for a hospital on a specific date
   */
  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;
      const { date } = req.query;

      if (!date) {
        res.status(400).json({
          status: 'error',
          message: 'Date is required',
        });
        return;
      }

      // Verify hospital exists
      const hospitalCheck = await pool.query(
        `SELECT hospital_name, address FROM hospital_profiles WHERE user_id = $1`,
        [hospitalId]
      );

      if (hospitalCheck.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Hospital not found',
        });
        return;
      }

      // Get booked slots
      const result = await pool.query(
        `SELECT time FROM appointments 
         WHERE hospital_id = $1 AND DATE(date) = $2 AND status != 'cancelled'
         ORDER BY time`,
        [hospitalId, date]
      );

      const bookedSlots = result.rows.map(row => row.time);

      // All possible time slots (8 AM to 5:30 PM, 30-minute intervals)
      const allSlots = [
        '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
        '05:00 PM', '05:30 PM'
      ];

      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

      res.status(200).json({
        status: 'success',
        data: {
          hospitalId,
          hospitalName: hospitalCheck.rows[0].hospital_name,
          hospitalAddress: hospitalCheck.rows[0].address,
          date,
          totalSlots: allSlots.length,
          availableSlots,
          bookedSlots,
          availableCount: availableSlots.length,
          bookedCount: bookedSlots.length,
        },
      });
    } catch (error) {
      console.error('Error fetching available slots:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch available slots',
      });
    }
  }

  /**
   * Get all hospitals where donors can schedule appointments
   */
  async getAllHospitals(_req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(
        `SELECT u.id, hp.hospital_name, hp.address, hp.phone_number, hp.head_of_hospital
         FROM users u
         INNER JOIN hospital_profiles hp ON u.id = hp.user_id
         WHERE u.role = 'hospital' AND u.is_active = true
         ORDER BY hp.hospital_name`
      );

      res.status(200).json({
        status: 'success',
        data: result.rows,
      });
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch hospitals',
      });
    }
  }
}
