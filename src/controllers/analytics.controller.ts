import { Request, Response } from 'express';
import pool from '../config/database';

export class AnalyticsController {
  /**
   * Get hospital dashboard statistics
   */
  async getHospitalStats(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;
      console.log('=== FETCHING HOSPITAL STATS ===');
      console.log('Hospital ID:', hospitalId);

      // Total and active requests
      const requestsResult = await pool.query(
        `SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'active' OR status = 'pending' THEN 1 END) as active_requests
         FROM blood_requests
         WHERE hospital_id = $1`,
        [hospitalId]
      );
      
      console.log('Requests query result:', requestsResult.rows[0]);

      // Total donors (count all active donors in system)
      let totalDonors = 0;
      try {
        const donorsResult = await pool.query(
          `SELECT COUNT(*) as total_donors
           FROM users
           WHERE role = 'donor' AND is_active = true`
        );
        totalDonors = parseInt(donorsResult.rows[0]?.total_donors || 0);
      } catch (err) {
        console.log('Donors count query failed, using 0');
      }

      // Blood units available
      let bloodUnits = 0;
      try {
        const inventoryResult = await pool.query(
          `SELECT COALESCE(SUM(units_available), 0) as blood_units
           FROM blood_inventory
           WHERE hospital_id = $1`,
          [hospitalId]
        );
        bloodUnits = parseInt(inventoryResult.rows[0]?.blood_units || 0);
      } catch (err) {
        console.log('Inventory query failed, using 0');
      }

      // Total donations and units from donations
      let totalDonations = 0;
      let totalDonationUnits = 0;
      try {
        const donationsAgg = await pool.query(
          `SELECT COUNT(*) AS total_donations, COALESCE(SUM(units), 0) AS total_units
           FROM donations
           WHERE hospital_id = $1 AND status = 'completed'`,
          [hospitalId]
        );
        totalDonations = parseInt(donationsAgg.rows[0]?.total_donations || 0);
        totalDonationUnits = parseInt(donationsAgg.rows[0]?.total_units || 0);
      } catch (err) {
        console.log('Donations aggregation failed, using 0');
      }

      // Appointments today
      let appointmentsToday = 0;
      try {
        const appointmentsResult = await pool.query(
          `SELECT COUNT(*) as appointments_today
           FROM appointments
           WHERE hospital_id = $1 
           AND DATE(date) = CURRENT_DATE
           AND status != 'cancelled'`,
          [hospitalId]
        );
        appointmentsToday = parseInt(appointmentsResult.rows[0]?.appointments_today || 0);
      } catch (err) {
        console.log('Appointments query failed, using 0');
      }

      const responseData = {
        totalRequests: parseInt(requestsResult.rows[0]?.total_requests) || 0,
        activeRequests: parseInt(requestsResult.rows[0]?.active_requests) || 0,
        totalDonors: totalDonors,
        bloodUnits: bloodUnits,
        appointmentsToday: appointmentsToday,
        totalDonations,
        totalDonationUnits,
      };
      
      console.log('Sending response:', responseData);
      console.log('===============================');

      res.status(200).json({
        status: 'success',
        data: responseData,
      });
    } catch (error) {
      console.error('Error fetching hospital stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch hospital statistics',
      });
    }
  }

  /**
   * Get blood type distribution
   */
  async getBloodTypeDistribution(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;

      const result = await pool.query(
        `SELECT 
          blood_type,
          COUNT(*) as count
         FROM donations
         WHERE hospital_id = $1 AND status = 'completed'
         GROUP BY blood_type
         ORDER BY count DESC`,
        [hospitalId]
      );

      const total = result.rows.reduce((sum: number, row: any) => sum + parseInt(row.count), 0);

      const distribution = result.rows.map((row: any) => ({
        bloodType: row.blood_type,
        count: parseInt(row.count),
        percentage: total > 0 ? ((parseInt(row.count) / total) * 100).toFixed(2) : 0,
      }));

      res.status(200).json({
        status: 'success',
        data: distribution,
      });
    } catch (error) {
      console.error('Error fetching blood type distribution:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch blood type distribution',
      });
    }
  }

  /**
   * Get donation trends
   */
  async getDonationTrends(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;
      const { period = '30' } = req.query; // days

      const result = await pool.query(
        `SELECT 
          DATE(date) as date,
          COUNT(*) as count
         FROM donations
         WHERE hospital_id = $1 
         AND status = 'completed'
         AND date >= CURRENT_DATE - INTERVAL '${period} days'
         GROUP BY DATE(date)
         ORDER BY date ASC`,
        [hospitalId]
      );

      res.status(200).json({
        status: 'success',
        data: result.rows,
      });
    } catch (error) {
      console.error('Error fetching donation trends:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch donation trends',
      });
    }
  }

  /**
   * Get monthly donation report
   */
  async getMonthlyReport(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;
      const { year, month } = req.query;

      let dateFilter = '';
      const params: any[] = [hospitalId];

      if (year && month) {
        dateFilter = `AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3`;
        params.push(year, month);
      } else {
        dateFilter = `AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE) 
                      AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)`;
      }

      const result = await pool.query(
        `SELECT 
          COUNT(*) as total_donations,
          SUM(units) as total_units,
          SUM(impact) as lives_saved,
          COUNT(DISTINCT donor_id) as unique_donors,
          blood_type,
          COUNT(*) as count_by_type
         FROM donations
         WHERE hospital_id = $1 
         AND status = 'completed'
         ${dateFilter}
         GROUP BY blood_type`,
        params
      );

      const summary = await pool.query(
        `SELECT 
          COUNT(*) as total_donations,
          SUM(units) as total_units,
          SUM(impact) as lives_saved,
          COUNT(DISTINCT donor_id) as unique_donors
         FROM donations
         WHERE hospital_id = $1 
         AND status = 'completed'
         ${dateFilter}`,
        params
      );

      res.status(200).json({
        status: 'success',
        data: {
          summary: summary.rows[0],
          byBloodType: result.rows,
        },
      });
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch monthly report',
      });
    }
  }

  /**
   * Get donor analytics
   */
  async getDonorAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;

      // Age distribution
      const ageDistribution = await pool.query(
        `SELECT 
          CASE 
            WHEN dp.age < 25 THEN '18-24'
            WHEN dp.age < 35 THEN '25-34'
            WHEN dp.age < 45 THEN '35-44'
            WHEN dp.age < 55 THEN '45-54'
            ELSE '55+'
          END as age_group,
          COUNT(DISTINCT d.donor_id) as count
         FROM donations d
         JOIN donor_profiles dp ON d.donor_id = dp.user_id
         WHERE d.hospital_id = $1 AND d.status = 'completed'
         GROUP BY age_group
         ORDER BY age_group`,
        [hospitalId]
      );

      // Gender distribution (if available)
      const genderDistribution = await pool.query(
        `SELECT 
          COUNT(DISTINCT d.donor_id) as total_donors
         FROM donations d
         WHERE d.hospital_id = $1 AND d.status = 'completed'`,
        [hospitalId]
      );

      // Repeat donors
      const repeatDonors = await pool.query(
        `SELECT COUNT(*) as repeat_donors
         FROM (
           SELECT donor_id, COUNT(*) as donation_count
           FROM donations
           WHERE hospital_id = $1 AND status = 'completed'
           GROUP BY donor_id
           HAVING COUNT(*) > 1
         ) as repeat_donor_list`,
        [hospitalId]
      );

      res.status(200).json({
        status: 'success',
        data: {
          ageDistribution: ageDistribution.rows,
          totalDonors: parseInt(genderDistribution.rows[0].total_donors) || 0,
          repeatDonors: parseInt(repeatDonors.rows[0].repeat_donors) || 0,
        },
      });
    } catch (error) {
      console.error('Error fetching donor analytics:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch donor analytics',
      });
    }
  }
}
