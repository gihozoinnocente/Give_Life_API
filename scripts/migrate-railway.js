/**
 * Railway Database Migration Script
 * 
 * This script helps migrate your database schema to Railway PostgreSQL.
 * 
 * Usage:
 *   1. Install Railway CLI: npm install -g @railway/cli
 *   2. Login: railway login
 *   3. Link project: railway link
 *   4. Run: railway run node scripts/migrate-railway.js
 * 
 * Or run locally with DATABASE_URL:
 *   DATABASE_URL=your_railway_db_url node scripts/migrate-railway.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrateDatabase() {
  // Get database connection
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

  console.log('🔄 Starting database migration...');
  console.log(`   Connecting to: ${connectionString.replace(/:[^:@]+@/, ':****@')}`); // Hide password

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
    } else if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('⚠️  Connection refused. Please check:');
      console.log('   1. Database is running');
      console.log('   2. Connection string is correct');
      console.log('   3. Network/firewall allows connection');
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
