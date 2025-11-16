import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { UserRole } from '../types';

dotenv.config();

async function ensureAdmin() {
  const email = 'admin'; // login identifier (username: admin)
  const password = 'admin';
  const firstName = 'Main';
  const lastName = 'Admin';
  const phoneNumber = '0000000000';

  try {
    // Check if admin already exists
    const existing = await query('SELECT id FROM users WHERE email = $1 AND role = $2', [email, UserRole.ADMIN]);
    if (existing.rows.length > 0) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }

    const hashed = await bcrypt.genSalt(10).then(s => bcrypt.hash(password, s));

    await query('BEGIN');

    const userRes = await query(
      `INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id`,
      [email, hashed, UserRole.ADMIN]
    );

    const userId = userRes.rows[0].id as string;

    await query(
      `INSERT INTO admin_profiles (user_id, first_name, last_name, phone_number) VALUES ($1, $2, $3, $4)`,
      [userId, firstName, lastName, phoneNumber]
    );

    await query('COMMIT');

    console.log('🎉 Seeded default admin');
    console.log({ username: email, password });
    process.exit(0);
  } catch (err) {
    await query('ROLLBACK').catch(() => {});
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  }
}

ensureAdmin();
