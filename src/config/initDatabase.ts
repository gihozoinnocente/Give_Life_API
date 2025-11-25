import fs from 'fs';
import path from 'path';
import pool from './database';

export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database schema...');
    
    // First, test the connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection established');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute the schema
    // Note: Schema uses CREATE TABLE IF NOT EXISTS, so it's safe to run multiple times
    await pool.query(schema);
    
    console.log('✅ Database schema initialized successfully');
  } catch (error: any) {
    // Handle specific PostgreSQL error codes
    if (error.code === '42P07') {
      // Table already exists - this is OK, schema uses IF NOT EXISTS
      console.log('ℹ️  Some tables already exist - this is normal');
      console.log('✅ Database schema check completed');
      return; // Don't throw error for existing tables
    }
    
    console.error('❌ Error initializing database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Cannot connect to PostgreSQL. Please ensure:');
      console.error('   1. PostgreSQL service is running');
      console.error('   2. Connection settings in .env are correct');
      console.error('   3. Database exists');
    } else if (error.code === '28P01') {
      console.error('⚠️  Authentication failed. Check DB_USER and DB_PASSWORD in .env');
    } else if (error.code === '3D000') {
      console.error('⚠️  Database does not exist. Create it with:');
      console.error('   psql -U postgres -c "CREATE DATABASE blood_donation;"');
    } else {
      console.error('   Error code:', error.code);
      console.error('   Full error:', error);
    }
    throw error;
  }
};
