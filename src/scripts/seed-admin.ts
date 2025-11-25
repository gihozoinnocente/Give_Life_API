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
    const existing = await query(
      'SELECT id, is_active FROM users WHERE email = $1 AND role = $2', 
      [email, UserRole.ADMIN]
    );
    
    if (existing.rows.length > 0) {
      const adminId = existing.rows[0].id;
      const isActive = existing.rows[0].is_active;
      
      // If admin exists but is inactive, activate them
      if (!isActive) {
        await query('UPDATE users SET is_active = $1 WHERE id = $2', [true, adminId]);
        console.log('✅ Admin user found and activated');
      } else {
        console.log('✅ Admin user already exists and is active');
      }
      
      // Check if admin profile exists
      const profileCheck = await query('SELECT id FROM admin_profiles WHERE user_id = $1', [adminId]);
      if (profileCheck.rows.length === 0) {
        // Create profile if missing
        await query(
          `INSERT INTO admin_profiles (user_id, first_name, last_name, phone_number) VALUES ($1, $2, $3, $4)`,
          [adminId, firstName, lastName, phoneNumber]
        );
        console.log('✅ Admin profile created');
      }
      
      console.log('\n📋 Admin Login Credentials:');
      console.log(`   Email/Username: ${email}`);
      console.log(`   Password: ${password}\n`);
      process.exit(0);
    }

    const hashed = await bcrypt.genSalt(10).then(s => bcrypt.hash(password, s));

    await query('BEGIN');

    const userRes = await query(
      `INSERT INTO users (email, password, role, is_active) VALUES ($1, $2, $3, $4) RETURNING id`,
      [email, hashed, UserRole.ADMIN, true]
    );

    const userId = userRes.rows[0].id as string;

    await query(
      `INSERT INTO admin_profiles (user_id, first_name, last_name, phone_number) VALUES ($1, $2, $3, $4)`,
      [userId, firstName, lastName, phoneNumber]
    );

    await query('COMMIT');

    console.log('🎉 Seeded default admin successfully!');
    console.log('\n📋 Admin Login Credentials:');
    console.log(`   Email/Username: ${email}`);
    console.log(`   Password: ${password}\n`);
    process.exit(0);
  } catch (err) {
    await query('ROLLBACK').catch(() => {});
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  }
}

ensureAdmin();
