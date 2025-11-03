import { query } from '../config/database';

export class HospitalService {
  // Get all hospitals
  async getAllHospitals(): Promise<any[]> {
    const result = await query(
      `SELECT u.id, u.email, u.role, u.is_active,
              hp.hospital_name, hp.address, hp.head_of_hospital, hp.phone_number
       FROM users u
       JOIN hospital_profiles hp ON u.id = hp.user_id
       WHERE u.role = 'hospital' AND u.is_active = true
       ORDER BY hp.hospital_name`,
      []
    );

    return result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      hospitalName: row.hospital_name,
      address: row.address,
      headOfHospital: row.head_of_hospital,
      phoneNumber: row.phone_number,
      isActive: row.is_active,
    }));
  }

  // Get hospital by ID
  async getHospitalById(hospitalId: string): Promise<any> {
    const result = await query(
      `SELECT u.id, u.email, u.role, u.is_active, u.created_at,
              hp.hospital_name, hp.address, hp.head_of_hospital, hp.phone_number
       FROM users u
       JOIN hospital_profiles hp ON u.id = hp.user_id
       WHERE u.id = $1 AND u.role = 'hospital'`,
      [hospitalId]
    );

    if (result.rows.length === 0) {
      throw new Error('Hospital not found');
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      hospitalName: row.hospital_name,
      address: row.address,
      headOfHospital: row.head_of_hospital,
      phoneNumber: row.phone_number,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  // Search hospitals by district/location
  async searchHospitals(searchTerm?: string): Promise<any[]> {
    let queryText = `
      SELECT u.id, u.email,
             hp.hospital_name, hp.address, hp.head_of_hospital, hp.phone_number
      FROM users u
      JOIN hospital_profiles hp ON u.id = hp.user_id
      WHERE u.role = 'hospital' AND u.is_active = true
    `;

    const params: any[] = [];

    if (searchTerm) {
      queryText += ` AND (
        hp.hospital_name ILIKE $1 OR 
        hp.address ILIKE $1
      )`;
      params.push(`%${searchTerm}%`);
    }

    queryText += ' ORDER BY hp.hospital_name';

    const result = await query(queryText, params);

    return result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      hospitalName: row.hospital_name,
      address: row.address,
      headOfHospital: row.head_of_hospital,
      phoneNumber: row.phone_number,
    }));
  }
}
