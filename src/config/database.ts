import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Database Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);

// Create a PostgreSQL connection pool
// Supports both DATABASE_URL (Railway/Heroku format) and individual env vars
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        // Railway PostgreSQL requires SSL in production
        ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('railway') 
          ? { rejectUnauthorized: false } 
          : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // 10 seconds for local connections
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'blood_donation',
        user: process.env.DB_USER || 'postgres',
        // Coerce environment value to string (defensive) to avoid pg SASL errors
        password: typeof process.env.DB_PASSWORD === 'undefined' ? undefined : String(process.env.DB_PASSWORD),
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // 10 seconds for local connections
      }
);

// Validate database connection on startup (non-blocking)
const validateConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection validated successfully');
    console.log(`   Database time: ${result.rows[0].now}`);
    client.release();
    return true;
  } catch (error: any) {
    console.error('❌ Database connection validation failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Could not connect to PostgreSQL. Please ensure:');
      console.error('   1. PostgreSQL service is running');
      console.error('   2. Database credentials in .env are correct');
      console.error('   3. Database "blood_donation" exists');
    } else if (error.code === '28P01') {
      console.error('⚠️  Authentication failed. Please check DB_USER and DB_PASSWORD in .env');
    } else if (error.code === '3D000') {
      console.error('⚠️  Database does not exist. Please create the database:');
      console.error('   CREATE DATABASE blood_donation;');
    }
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️  CRITICAL: Production database connection failed!');
      console.error('⚠️  Please check your DATABASE_URL environment variable');
    }
    return false;
  }
};

// Run validation (non-blocking - won't prevent server from starting)
validateConnection().catch(err => {
  console.error('Failed to validate database connection:', err);
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Don't exit in production - just log the error
  if (process.env.NODE_ENV !== 'production') {
    console.error('Exiting due to database error (development mode)');
  }
});

// Query helper function
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get a client from the pool
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export default pool;
