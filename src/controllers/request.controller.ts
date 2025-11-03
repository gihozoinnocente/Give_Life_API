import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { CreateBloodRequestDTO, UpdateBloodRequestDTO } from '../types';

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
      const requestData: CreateBloodRequestDTO = req.body;
      const id = uuidv4();

      const result = await pool.query(
        `INSERT INTO blood_requests 
         (id, hospital_id, patient_name, blood_type, units, urgency, status, contact_person, contact_phone, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING *`,
        [
          id,
          requestData.hospitalId,
          requestData.patientName,
          requestData.bloodType,
          requestData.units,
          requestData.urgency,
          'pending',
          requestData.contactPerson,
          requestData.contactPhone,
          requestData.notes || null,
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
