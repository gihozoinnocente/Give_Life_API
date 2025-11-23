import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import pool from '../config/database';
import { UpdateBloodRequestDTO } from '../types';

export class RequestController {
  /**
   * Get all blood requests
   */
  async getAllRequests(req: Request, res: Response): Promise<void> {
    try {
      const { status, urgency, bloodType } = req.query;

      let query = `
        SELECT r.*, h.hospital_name, h.address, h.phone_number
        FROM blood_requests r
        LEFT JOIN hospital_profiles h ON r.hospital_id = h.user_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (status) {
        query += ` AND r.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (urgency) {
        query += ` AND r.urgency = $${paramIndex}`;
        params.push(urgency);
        paramIndex++;
      }

      if (bloodType) {
        query += ` AND r.blood_type = $${paramIndex}`;
        params.push(bloodType);
        paramIndex++;
      }

      query += ` ORDER BY 
        CASE r.urgency 
          WHEN 'critical' THEN 1 
          WHEN 'urgent' THEN 2 
          WHEN 'normal' THEN 3 
        END,
        r.created_at DESC`;

      const result = await pool.query(query, params);

      res.status(200).json({
        status: 'success',
        data: result.rows,
      });
    } catch (error) {
      console.error('Error fetching blood requests:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch blood requests',
      });
    }
  }

  /**
   * Get requests for a specific hospital
   */
  async getHospitalRequests(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;
      const { status } = req.query;

      let query = `
        SELECT * FROM blood_requests 
        WHERE hospital_id = $1
      `;
      const params: any[] = [hospitalId];

      if (status) {
        query += ` AND status = $2`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await pool.query(query, params);

      res.status(200).json({
        status: 'success',
        data: result.rows,
      });
    } catch (error) {
      console.error('Error fetching hospital requests:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch requests',
      });
    }
  }

  /**
   * Create a new blood request
   */
  async createRequest(req: Request, res: Response): Promise<void> {
    try {
      const requestData: any = req.body as any;
      const id = randomUUID();

      // Fetch hospital profile to derive name and location
      const hospitalId = requestData.hospitalId;
      const hp = await pool.query(
        `SELECT hospital_name, address FROM hospital_profiles WHERE user_id = $1`,
        [hospitalId]
      );

      if (!hp.rows || hp.rows.length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'Hospital profile not found for the provided hospitalId',
        });
        return;
      }
      const hospital_name = hp.rows[0].hospital_name;
      const location = hp.rows[0].address;

      // Basic validation per schema
      const required = ['bloodType', 'unitsNeeded', 'urgency', 'contactPerson', 'contactPhone', 'expiryDate'];
      for (const field of required) {
        if (
          requestData[field] === undefined ||
          requestData[field] === null ||
          (typeof requestData[field] === 'string' && requestData[field].trim() === '')
        ) {
          res.status(400).json({ status: 'error', message: `Missing required field: ${field}` });
          return;
        }
      }
      const unitsNum = parseInt(requestData.unitsNeeded, 10);
      if (isNaN(unitsNum) || unitsNum <= 0) {
        res.status(400).json({ status: 'error', message: 'unitsNeeded must be a positive integer' });
        return;
      }
      const allowedUrgency = ['critical', 'urgent', 'normal'];
      if (!allowedUrgency.includes(String(requestData.urgency).toLowerCase())) {
        res.status(400).json({ status: 'error', message: 'Invalid urgency value' });
        return;
      }

      const result = await pool.query(
        `INSERT INTO blood_requests 
         (id, hospital_id, hospital_name, blood_type, units_needed, urgency, patient_condition, contact_person, contact_phone, location, additional_notes, expiry_date, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active', NOW(), NOW())
         RETURNING *`,
        [
          id,
          hospitalId,
          hospital_name,
          requestData.bloodType,
          unitsNum,
          requestData.urgency,
          requestData.patientCondition || 'N/A',
          requestData.contactPerson,
          requestData.contactPhone,
          location,
          requestData.additionalNotes || null,
          requestData.expiryDate || null,
        ]
      );

      res.status(201).json({
        status: 'success',
        message: 'Blood request created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error creating blood request:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create blood request',
      });
    }
  }

  /**
   * Update blood request
   */
  async updateRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateBloodRequestDTO = req.body;

      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

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
        `UPDATE blood_requests SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Blood request not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'Blood request updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error updating blood request:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update blood request',
      });
    }
  }

  /**
   * Get request by ID
   */
  async getRequestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT r.*, h.hospital_name, h.address, h.phone_number
         FROM blood_requests r
         LEFT JOIN hospital_profiles h ON r.hospital_id = h.user_id
         WHERE r.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Blood request not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error fetching blood request:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch blood request',
      });
    }
  }

  /**
   * Delete blood request
   */
  async deleteRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `DELETE FROM blood_requests WHERE id = $1 RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Blood request not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'Blood request deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting blood request:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete blood request',
      });
    }
  }

  /**
   * Get urgent requests for matching donors
   */
  async getUrgentRequestsForDonor(req: Request, res: Response): Promise<void> {
    try {
      const { donorId } = req.params;

      // Get donor's blood type
      const donorResult = await pool.query(
        `SELECT blood_group FROM donor_profiles WHERE user_id = $1`,
        [donorId]
      );

      if (donorResult.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Donor not found',
        });
        return;
      }

      const bloodType = donorResult.rows[0].blood_group;

      // Get urgent requests matching donor's blood type
      const result = await pool.query(
        `SELECT r.*, h.hospital_name, h.address, h.phone_number
         FROM blood_requests r
         LEFT JOIN hospital_profiles h ON r.hospital_id = h.user_id
         WHERE r.blood_type = $1 
         AND r.status = 'pending'
         AND r.urgency IN ('critical', 'urgent')
         ORDER BY 
           CASE r.urgency 
             WHEN 'critical' THEN 1 
             WHEN 'urgent' THEN 2 
           END,
           r.created_at DESC
         LIMIT 10`,
        [bloodType]
      );

      res.status(200).json({
        status: 'success',
        data: result.rows,
      });
    } catch (error) {
      console.error('Error fetching urgent requests:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch urgent requests',
      });
    }
  }
}
