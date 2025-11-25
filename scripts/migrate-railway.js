/**
 * Railway Database Migration Script
 * 
 * This script helps migrate your database schema to Railway PostgreSQL.
 * 
 * ⚠️  IMPORTANT: Database migration happens AUTOMATICALLY when your server starts!
 * You typically don't need to run this manually. Just deploy your app.
 * 
 * Manual Migration Options:
 * 
 * Option 1: Get External DATABASE_URL (Recommended for manual migration)
 *   1. Go to Railway dashboard → Your PostgreSQL service → Variables tab
 *   2. Copy the DATABASE_URL (should use .railway.app domain, NOT .internal)
 *   3. Run: DATABASE_URL=<your_external_url> node scripts/migrate-railway.js
 * 
 * Option 2: Use Railway Connect
 *   1. railway link (select Postgres service)
 *   2. railway connect postgres
 *   3. Then manually paste schema.sql contents
 * 
 * Option 3: Automatic Migration (Recommended)
 *   Just deploy your app - migration happens automatically on first startup!
 *   The server will create all tables when it starts.
 * 
 * Note: railway run doesn't work for database connections because
 * it uses internal hostnames that don't resolve from your local machine.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrateDatabase() {
  // Get database connection
  let connectionString = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

  // Fix Railway internal hostname issue - convert to external/public URL if needed
  if (connectionString.includes('postgres.railway.internal')) {
    console.log('⚠️  Warning: Internal Railway hostname detected.');
    console.log('   The migration will run automatically when your server starts on Railway.');
    console.log('   For manual migration, use one of these options:\n');
    console.log('   1. Get external DATABASE_URL from Railway dashboard:');
    console.log('      - Go to your PostgreSQL service → Variables tab');
    console.log('      - Copy the DATABASE_URL (should have .railway.app domain)');
    console.log('      - Run: DATABASE_URL=<external_url> node scripts/migrate-railway.js\n');
    console.log('   2. Use Railway connect:');
    console.log('      - Run: railway connect postgres\n');
    console.log('   3. Deploy your app - migration happens automatically on startup!\n');
    
    throw new Error('Cannot use internal Railway hostname from local machine. See instructions above.');
  }

  console.log('🔄 Starting database migration...');
  console.log(`   Connecting to: ${connectionString.replace(/:[^:@]+@/, ':****@').replace(/@[^:]+:\d+/, '@****:****')}`); // Hide password and host

  const pool = new Pool({
    connectionString,
    // Railway PostgreSQL requires SSL
    ssl: connectionString.includes('railway') || process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Check current database
    const dbResult = await client.query('SELECT current_database()');
    console.log(`   Database: ${dbResult.rows[0].current_database}`);
    
    client.release();

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'src', 'config', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    console.log('📖 Reading schema file...');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    console.log('🚀 Executing schema migration...');
    await pool.query(schema);

    console.log('✅ Database migration completed successfully!');
    console.log('');
    console.log('📊 Verifying tables...');
    
    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`   Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.code === '42P07') {
      console.log('');
      console.log('ℹ️  Note: Some tables already exist. This is normal if the database was previously migrated.');
      console.log('   The migration script uses CREATE TABLE IF NOT EXISTS, so existing tables are safe.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log('');
      console.log('⚠️  Connection failed. Please check:');
      console.log('   1. You are using an EXTERNAL DATABASE_URL (not .internal hostname)');
      console.log('   2. Database is running and accessible');
      console.log('   3. Connection string is correct');
      console.log('');
      console.log('💡 Tip: Database migration happens automatically when your server starts!');
      console.log('   Just deploy your app - no manual migration needed.');
    } else if (error.code === '28P01') {
      console.log('');
      console.log('⚠️  Authentication failed. Please check:');
      console.log('   1. Database username is correct');
      console.log('   2. Database password is correct');
    } else {
      console.log('');
      console.log('Full error:', error);
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
migrateDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
