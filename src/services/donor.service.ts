import { query } from '../config/database';
import { DonorSearchFilters, BloodType } from '../types';

export class DonorService {
  // Search donors with filters
  async searchDonors(filters: DonorSearchFilters): Promise<any[]> {
    let queryText = `
      SELECT u.id, u.email, u.role, u.is_active,
             dp.first_name, dp.last_name, dp.phone_number, dp.address, 
             dp.age, dp.blood_group, dp.district, dp.state, dp.pin_code,
             dp.last_donation_month, dp.last_donation_year
      FROM users u
      JOIN donor_profiles dp ON u.id = dp.user_id
      WHERE u.role = 'donor' AND u.is_active = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters.bloodGroup) {
      queryText += ` AND dp.blood_group = $${paramIndex}`;
      params.push(filters.bloodGroup);
      paramIndex++;
    }

    if (filters.district) {
      queryText += ` AND dp.district = $${paramIndex}`;
      params.push(filters.district);
      paramIndex++;
    }

    if (filters.state) {
      queryText += ` AND dp.state = $${paramIndex}`;
      params.push(filters.state);
      paramIndex++;
    }

    if (filters.minAge) {
      queryText += ` AND dp.age >= $${paramIndex}`;
      params.push(filters.minAge);
      paramIndex++;
    }

    if (filters.maxAge) {
      queryText += ` AND dp.age <= $${paramIndex}`;
      params.push(filters.maxAge);
      paramIndex++;
    }

    queryText += ' ORDER BY dp.first_name, dp.last_name';

    const result = await query(queryText, params);

    return result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phoneNumber: row.phone_number,
      address: row.address,
      age: row.age,
      bloodGroup: row.blood_group,
      district: row.district,
      state: row.state,
      pinCode: row.pin_code,
      lastDonationMonth: row.last_donation_month,
      lastDonationYear: row.last_donation_year,
      isActive: row.is_active,
    }));
  }

  // Get all donors
  async getAllDonors(): Promise<any[]> {
    const result = await query(
      `SELECT u.id, u.email, u.role, u.is_active,
              dp.first_name, dp.last_name, dp.phone_number, dp.address, 
              dp.age, dp.blood_group, dp.district, dp.state, dp.pin_code,
              dp.last_donation_month, dp.last_donation_year
       FROM users u
       JOIN donor_profiles dp ON u.id = dp.user_id
       WHERE u.role = 'donor' AND u.is_active = true
       ORDER BY dp.first_name, dp.last_name`,
      []
    );

    return result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phoneNumber: row.phone_number,
      address: row.address,
      age: row.age,
      bloodGroup: row.blood_group,
      district: row.district,
      state: row.state,
      pinCode: row.pin_code,
      lastDonationMonth: row.last_donation_month,
      lastDonationYear: row.last_donation_year,
      isActive: row.is_active,
    }));
  }

  // Get donor by ID
  async getDonorById(donorId: string): Promise<any> {
    const result = await query(
      `SELECT u.id, u.email, u.role, u.is_active, u.created_at,
              dp.first_name, dp.last_name, dp.phone_number, dp.address, 
              dp.age, dp.blood_group, dp.district, dp.state, dp.pin_code,
              dp.last_donation_month, dp.last_donation_year
       FROM users u
       JOIN donor_profiles dp ON u.id = dp.user_id
       WHERE u.id = $1 AND u.role = 'donor'`,
      [donorId]
    );

    if (result.rows.length === 0) {
      throw new Error('Donor not found');
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phoneNumber: row.phone_number,
      address: row.address,
      age: row.age,
      bloodGroup: row.blood_group,
      district: row.district,
      state: row.state,
      pinCode: row.pin_code,
      lastDonationMonth: row.last_donation_month,
      lastDonationYear: row.last_donation_year,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  // Get donors by blood group
  async getDonorsByBloodGroup(bloodGroup: BloodType): Promise<any[]> {
    const result = await query(
      `SELECT u.id, u.email,
              dp.first_name, dp.last_name, dp.phone_number, dp.address, 
              dp.age, dp.blood_group, dp.district, dp.state, dp.pin_code
       FROM users u
       JOIN donor_profiles dp ON u.id = dp.user_id
       WHERE u.role = 'donor' AND u.is_active = true AND dp.blood_group = $1
       ORDER BY dp.district, dp.first_name`,
      [bloodGroup]
    );

    return result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phoneNumber: row.phone_number,
      address: row.address,
      age: row.age,
      bloodGroup: row.blood_group,
      district: row.district,
      state: row.state,
      pinCode: row.pin_code,
    }));
  }
}
