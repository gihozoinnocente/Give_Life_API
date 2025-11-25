import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { UserRole } from '../types';

dotenv.config();

async function debugAdmin() {
  const email = 'admin';
  const testPassword = 'admin';

  try {
    console.log('🔍 Debugging Admin Login...\n');

    // Check if admin exists
    const adminCheck = await query(
      'SELECT id, email, password, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (adminCheck.rows.length === 0) {
      console.log('❌ Admin user NOT FOUND in database');
      console.log('💡 Run: npm run seed:admin\n');
      process.exit(1);
    }

    const admin = adminCheck.rows[0];
    console.log('✅ Admin user found:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Is Active: ${admin.is_active}`);
    console.log(`   Has Password Hash: ${admin.password ? 'Yes' : 'No'}`);
    console.log(`   Password Hash Length: ${admin.password?.length || 0}`);

    // Check role
    if (admin.role !== UserRole.ADMIN) {
      console.log(`\n⚠️  WARNING: User role is "${admin.role}" but expected "admin"`);
    }

    // Check if active
    if (!admin.is_active) {
      console.log('\n⚠️  WARNING: Admin user is INACTIVE');
      console.log('💡 This will prevent login. Fixing...');
      await query('UPDATE users SET is_active = $1 WHERE id = $2', [true, admin.id]);
      console.log('✅ Admin activated!\n');
    }

    // Test password
    console.log('\n🔐 Testing password verification...');
    if (!admin.password) {
      console.log('❌ No password hash found!');
      console.log('💡 Run: npm run reset:admin\n');
      process.exit(1);
    }

    const isValid = await bcrypt.compare(testPassword, admin.password);
    
    if (isValid) {
      console.log('✅ Password verification SUCCESSFUL');
    } else {
      console.log('❌ Password verification FAILED');
      console.log(`   Testing password: "${testPassword}"`);
      console.log('💡 Password hash might be incorrect. Run: npm run reset:admin\n');
      process.exit(1);
    }

    // Check admin profile
    const profileCheck = await query(
      'SELECT id, first_name, last_name FROM admin_profiles WHERE user_id = $1',
      [admin.id]
    );

    if (profileCheck.rows.length === 0) {
      console.log('\n⚠️  WARNING: Admin profile missing');
      console.log('💡 Creating admin profile...');
      await query(
        `INSERT INTO admin_profiles (user_id, first_name, last_name, phone_number) VALUES ($1, $2, $3, $4)`,
        [admin.id, 'Main', 'Admin', '0000000000']
      );
      console.log('✅ Admin profile created!');
    } else {
      const profile = profileCheck.rows[0];
      console.log('\n✅ Admin profile exists:');
      console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
    }

    console.log('\n✅ Admin account is configured correctly!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email/Username: ${email}`);
    console.log(`   Password: ${testPassword}\n`);
    process.exit(0);

  } catch (err) {
    console.error('❌ Error debugging admin:', err);
    process.exit(1);
  }
}

debugAdmin();

