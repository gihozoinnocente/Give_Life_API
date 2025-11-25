import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { UserRole } from '../types';

dotenv.config();

async function resetAdminPassword() {
  const email = 'admin';
  const newPassword = 'admin'; // Change this if you want a different password

  try {
    console.log('🔍 Checking for admin user...');
    
    // Check if admin exists
    const existing = await query(
      'SELECT id, email, is_active FROM users WHERE email = $1 AND role = $2',
      [email, UserRole.ADMIN]
    );

    if (existing.rows.length === 0) {
      console.error('❌ Admin user not found. Please run: npm run seed:admin');
      process.exit(1);
    }

    const adminId = existing.rows[0].id;
    const isActive = existing.rows[0].is_active;

    console.log(`✅ Admin user found (ID: ${adminId})`);
    console.log(`   Current status: ${isActive ? 'Active' : 'Inactive'}`);

    // Hash the new password
    const hashed = await bcrypt.genSalt(10).then(s => bcrypt.hash(newPassword, s));

    await query('BEGIN');

    // Reset password and ensure user is active
    await query(
      'UPDATE users SET password = $1, is_active = $2 WHERE id = $3',
      [hashed, true, adminId]
    );

    await query('COMMIT');

    console.log('✅ Admin password reset successfully!');
    console.log('\n📋 Updated Admin Login Credentials:');
    console.log(`   Email/Username: ${email}`);
    console.log(`   Password: ${newPassword}\n`);
    process.exit(0);
  } catch (err) {
    await query('ROLLBACK').catch(() => {});
    console.error('❌ Failed to reset admin password:', err);
    process.exit(1);
  }
}

resetAdminPassword();

