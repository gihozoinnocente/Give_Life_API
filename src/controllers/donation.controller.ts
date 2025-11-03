import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { CreateDonationDTO } from '../types';

export class DonationController {
  /**
   * Get all donations for a donor
   */
  async getDonorDonations(req: Request, res: Response): Promise<void> {
    try {
      const { donorId } = req.params;

      const result = await pool.query(
        `SELECT d.*, h.hospital_name, h.address as hospital_address
         FROM donations d
         LEFT JOIN hospital_profiles h ON d.hospital_id = h.user_id
         WHERE d.donor_id = $1
         ORDER BY d.date DESC`,
        [donorId]
      );

      res.status(200).json({
        status: 'success',
        data: result.rows,
      });
    } catch (error) {
      console.error('Error fetching donor donations:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch donations',
      });
    }
  }

  /**
   * Get all donations for a hospital
   */
  async getHospitalDonations(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;

      const result = await pool.query(
        `SELECT d.*, 
                dp.first_name || ' ' || dp.last_name as donor_name,
                dp.phone_number as donor_phone,
                dp.blood_group
         FROM donations d
         LEFT JOIN donor_profiles dp ON d.donor_id = dp.user_id
         WHERE d.hospital_id = $1
         ORDER BY d.date DESC`,
        [hospitalId]
      );

      res.status(200).json({
        status: 'success',
        data: result.rows,
      });
    } catch (error) {
      console.error('Error fetching hospital donations:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch donations',
      });
    }
  }

  /**
   * Create a new donation record
   */
  async createDonation(req: Request, res: Response): Promise<void> {
    try {
      const donationData: CreateDonationDTO = req.body;
      const id = uuidv4();

      const result = await pool.query(
        `INSERT INTO donations (id, donor_id, hospital_id, date, blood_type, units, status, impact, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [
          id,
          donationData.donorId,
          donationData.hospitalId,
          donationData.date,
          donationData.bloodType,
          donationData.units,
          'completed',
          donationData.units * 3, // Each unit can save up to 3 lives
        ]
      );

      res.status(201).json({
        status: 'success',
        message: 'Donation recorded successfully',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error creating donation:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create donation record',
      });
    }
  }

  /**
   * Get donation statistics for a donor
   */
  async getDonorStats(req: Request, res: Response): Promise<void> {
    try {
      const { donorId } = req.params;

      const statsResult = await pool.query(
        `SELECT 
          COUNT(*) as total_donations,
          SUM(units) as total_units,
          SUM(impact) as lives_impacted,
          MAX(date) as last_donation
         FROM donations
         WHERE donor_id = $1 AND status = 'completed'`,
        [donorId]
      );

      const stats = statsResult.rows[0];

      // Calculate next eligible date (3 months after last donation)
      let nextEligible = 'Eligible now';
      if (stats.last_donation) {
        const lastDonation = new Date(stats.last_donation);
        const nextEligibleDate = new Date(lastDonation);
        nextEligibleDate.setMonth(nextEligibleDate.getMonth() + 3);
        
        const today = new Date();
        if (nextEligibleDate > today) {
          const daysUntil = Math.ceil((nextEligibleDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          nextEligible = `${daysUntil} days`;
        }
      }

      res.status(200).json({
        status: 'success',
        data: {
          totalDonations: parseInt(stats.total_donations) || 0,
          totalUnits: parseInt(stats.total_units) || 0,
          livesImpacted: parseInt(stats.lives_impacted) || 0,
          lastDonation: stats.last_donation,
          nextEligible,
          points: (parseInt(stats.total_donations) || 0) * 100,
        },
      });
    } catch (error) {
      console.error('Error fetching donor stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch donor statistics',
      });
    }
  }

  /**
   * Get donation by ID
   */
  async getDonationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT d.*, 
                h.hospital_name,
                dp.first_name || ' ' || dp.last_name as donor_name
         FROM donations d
         LEFT JOIN hospital_profiles h ON d.hospital_id = h.user_id
         LEFT JOIN donor_profiles dp ON d.donor_id = dp.user_id
         WHERE d.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Donation not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error fetching donation:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch donation',
      });
    }
  }

  /**
   * Update donation status
   */
  async updateDonationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await pool.query(
        `UPDATE donations 
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Donation not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'Donation status updated',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error updating donation:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update donation',
      });
    }
  }
}
