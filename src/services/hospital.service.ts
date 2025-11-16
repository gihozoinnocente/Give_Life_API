import { query } from '../config/database';
import jwt from 'jsonwebtoken';

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

  // Recognition aggregates for a hospital
  async getRecognitionStats(hospitalId: string): Promise<{
    summary: { totalDonors: number; activeDonors: number; badgesEarned: number; livesImpacted: number };
    topDonors: Array<{ id: string; name: string; bloodType: string; totalDonations: number; unitsContributed: number; lastDonation: string | null; streak: number; points: number; badges: string[]; }>;
    badgeCounts: Array<{ key: string; count: number }>;
  }> {
    // Total donors associated (consented) with this hospital
    const donorsRes = await query(
      `SELECT COUNT(*)::int AS total
       FROM hospital_donor_memberships m
       JOIN users u ON u.id = m.donor_id AND u.role = 'donor' AND u.is_active = true
       WHERE m.hospital_id = $1 AND m.consented = true`,
      [hospitalId]
    );
    const totalDonors = donorsRes.rows[0]?.total || 0;

    // Active donors: completed a donation with this hospital in last 12 months
    const activeRes = await query(
      `SELECT COUNT(DISTINCT d.donor_id)::int AS active
       FROM donations d
       WHERE d.hospital_id = $1 AND d.status = 'completed' AND d.date >= NOW() - INTERVAL '12 months'`,
      [hospitalId]
    );
    const activeDonors = activeRes.rows[0]?.active || 0;

    // Lives impacted: units * 3 for donations at this hospital
    const impactRes = await query(
      `SELECT COALESCE(SUM(units),0)::int * 3 AS impact
       FROM donations WHERE hospital_id = $1 AND status = 'completed'`,
      [hospitalId]
    );
    const livesImpacted = impactRes.rows[0]?.impact || 0;

    // Top donors by total donations at this hospital
    const topRes = await query(
      `WITH donor_names AS (
         SELECT u.id AS donor_id,
                COALESCE(dp.first_name || ' ' || dp.last_name, u.email) AS name,
                dp.blood_group
         FROM users u
         LEFT JOIN donor_profiles dp ON dp.user_id = u.id
       ),
       agg AS (
         SELECT d.donor_id,
                COUNT(*)::int AS total_donations,
                COALESCE(SUM(d.units),0)::int AS units,
                MAX(d.date) AS last_date
         FROM donations d
         WHERE d.hospital_id = $1 AND d.status = 'completed'
         GROUP BY d.donor_id
       ),
       badge_points AS (
         SELECT db.donor_id,
                ARRAY_AGG(db.badge_key) AS badges,
                SUM(
                  CASE db.badge_key
                    WHEN 'donation_1' THEN 100
                    WHEN 'donation_5' THEN 300
                    WHEN 'donation_10' THEN 700
                    WHEN 'donation_20' THEN 1500
                    WHEN 'impact_5' THEN 150
                    WHEN 'impact_15' THEN 400
                    WHEN 'impact_30' THEN 900
                    WHEN 'streak_3' THEN 250
                    WHEN 'streak_6' THEN 600
                    WHEN 'rare_on_5' THEN 500
                    WHEN 'rare_abp_5' THEN 300
                    WHEN 'urgent_24h' THEN 500
                    ELSE 0
                  END
                ) AS points
         FROM donor_badges db
         GROUP BY db.donor_id
       )
       SELECT a.donor_id AS id,
              dn.name,
              dn.blood_group AS blood_type,
              a.total_donations,
              a.units,
              a.last_date,
              0 AS streak,
              COALESCE(bp.points, 0) AS points,
              COALESCE(bp.badges, ARRAY[]::text[]) AS badges
       FROM agg a
       JOIN donor_names dn ON dn.donor_id = a.donor_id
       LEFT JOIN badge_points bp ON bp.donor_id = a.donor_id
       ORDER BY a.total_donations DESC, a.units DESC, a.last_date DESC
       LIMIT 10`,
      [hospitalId]
    );
    const topDonors = topRes.rows.map((r) => ({
      id: r.id,
      name: r.name,
      bloodType: r.blood_type,
      totalDonations: r.total_donations,
      unitsContributed: r.units,
      lastDonation: r.last_date ? new Date(r.last_date).toISOString() : null,
      streak: r.streak,
      points: r.points,
      badges: Array.isArray(r.badges) ? r.badges : [],
    }));

    // Badge counts overall (for this hospital's donors): approximate by badges per donor who donated here
    const badgeRes = await query(
      `SELECT db.badge_key AS key, COUNT(*)::int AS count
       FROM donor_badges db
       WHERE db.donor_id IN (
         SELECT DISTINCT d.donor_id FROM donations d WHERE d.hospital_id = $1 AND d.status = 'completed'
       )
       GROUP BY db.badge_key
       ORDER BY count DESC`,
      [hospitalId]
    );
    const badgeCounts = badgeRes.rows;

    return {
      summary: { totalDonors, activeDonors, badgesEarned: badgeCounts.reduce((s, b) => s + b.count, 0), livesImpacted },
      topDonors,
      badgeCounts,
    };
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

  // Record donor opt-in via signed token
  async recordDonorOptIn(hospitalId: string, token: string): Promise<{ donorId: string; hospitalId: string; }>{
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      throw new Error('Invalid or expired token');
    }

    if (!payload || payload.purpose !== 'hospital-opt-in') {
      throw new Error('Invalid token purpose');
    }
    if (payload.hospitalId !== hospitalId) {
      throw new Error('Hospital mismatch');
    }

    const donorId = payload.donorId as string;

    await query(
      `INSERT INTO hospital_donor_memberships (donor_id, hospital_id, consented)
       VALUES ($1, $2, true)
       ON CONFLICT (donor_id, hospital_id)
       DO UPDATE SET consented = EXCLUDED.consented`,
      [donorId, hospitalId]
    );

    return { donorId, hospitalId };
  }

  // Get donors who consented for this hospital
  async getHospitalDonors(hospitalId: string): Promise<any[]> {
    const result = await query(
      `SELECT u.id, u.email, dp.first_name, dp.last_name, dp.phone_number, dp.address,
              dp.age, dp.blood_group, dp.district, dp.state, dp.pin_code
       FROM hospital_donor_memberships m
       JOIN users u ON u.id = m.donor_id AND u.role = 'donor' AND u.is_active = true
       JOIN donor_profiles dp ON dp.user_id = u.id
       WHERE m.hospital_id = $1 AND m.consented = true
       ORDER BY dp.first_name, dp.last_name`,
      [hospitalId]
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

  // Get health records for a hospital (optionally filtered by donor)
  async getHealthRecords(hospitalId: string, donorId?: string): Promise<any[]> {
    const params: any[] = [hospitalId];
    let where = 'WHERE hr.hospital_id = $1';

    if (donorId) {
      params.push(donorId);
      where += ` AND hr.donor_id = $2`;
    }

    const result = await query(
      `SELECT
         hr.id,
         hr.hospital_id,
         hr.donor_id,
         COALESCE(dp.first_name || ' ' || dp.last_name, hr.patient_name) AS patient_name,
         dp.blood_group AS donor_blood_group,
         hr.patient_name,
         hr.blood_type,
         hr.status,
         hr.last_visit,
         hr.age,
         hr.weight,
         hr.temperature,
         hr.blood_pressure,
         hr.heart_rate,
         hr.hemoglobin,
         hr.allergies,
         hr.medications,
         hr.chronic_conditions,
         hr.hospital_notes,
         hr.created_at
       FROM hospital_health_records hr
       LEFT JOIN donor_profiles dp ON dp.user_id = hr.donor_id
       ${where}
       ORDER BY hr.created_at DESC`,
      params
    );

    return result.rows.map((row) => ({
      id: row.id,
      hospitalId: row.hospital_id,
      donorId: row.donor_id,
      patientName: row.patient_name,
      bloodType: row.blood_type || row.donor_blood_group,
      status: row.status,
      lastVisit: row.last_visit,
      age: row.age,
      weight: row.weight,
      height: row.height,
      temperature: row.temperature,
      bloodPressure: row.blood_pressure,
      heartRate: row.heart_rate,
      hemoglobin: row.hemoglobin,
      averageHemoglobin: row.average_hemoglobin,
      allergies: row.allergies,
      medications: row.medications,
      chronicConditions: row.chronic_conditions,
      hospitalNotes: row.hospital_notes,
      createdAt: row.created_at,
    }));
  }

  // Create a new health record for a donor at this hospital
  async createHealthRecord(hospitalId: string, payload: {
    donorId: string;
    patientName?: string;
    bloodType?: string;
    status?: string;
    lastVisit?: string | null;
    age?: number | null;
    weight?: number | null;
    height?: number | null;
    temperature?: number | null;
    bloodPressure?: string | null;
    heartRate?: number | null;
    hemoglobin?: number | null;
    averageHemoglobin?: number | null;
    allergies?: string | null;
    medications?: string | null;
    chronicConditions?: string | null;
    hospitalNotes?: string | null;
  }): Promise<any> {
    const {
      donorId,
      patientName,
      bloodType,
      status,
      lastVisit,
      age,
      weight,
      height,
      temperature,
      bloodPressure,
      heartRate,
      hemoglobin,
      averageHemoglobin,
      allergies,
      medications,
      chronicConditions,
      hospitalNotes,
    } = payload;

    const result = await query(
      `INSERT INTO hospital_health_records (
         hospital_id,
         donor_id,
         patient_name,
         blood_type,
         status,
         last_visit,
         age,
         weight,
         height,
         temperature,
         blood_pressure,
         heart_rate,
         hemoglobin,
         average_hemoglobin,
         allergies,
         medications,
         chronic_conditions,
         hospital_notes
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
       )
       RETURNING *`,
      [
        hospitalId,
        donorId,
        patientName || null,
        bloodType || null,
        status || 'stable',
        lastVisit || null,
        age ?? null,
        weight ?? null,
        height ?? null,
        temperature ?? null,
        bloodPressure || null,
        heartRate ?? null,
        hemoglobin ?? null,
        averageHemoglobin ?? null,
        allergies || null,
        medications || null,
        chronicConditions || null,
        hospitalNotes || null,
      ]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      hospitalId: row.hospital_id,
      donorId: row.donor_id,
      patientName: row.patient_name,
      bloodType: row.blood_type,
      status: row.status,
      lastVisit: row.last_visit,
      age: row.age,
      weight: row.weight,
      temperature: row.temperature,
      bloodPressure: row.blood_pressure,
      heartRate: row.heart_rate,
      hemoglobin: row.hemoglobin,
      allergies: row.allergies,
      medications: row.medications,
      chronicConditions: row.chronic_conditions,
      hospitalNotes: row.hospital_notes,
      createdAt: row.created_at,
    };
  }
}
