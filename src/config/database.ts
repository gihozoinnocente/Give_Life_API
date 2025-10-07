import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Log database connection configuration (without sensitive data)
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
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'blood_donation',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

// Validate database connection on startup
const validateConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection validated successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection validation failed:', error);
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️  CRITICAL: Production database connection failed!');
      console.error('⚠️  Please check your DATABASE_URL environment variable in Railway');
    }
    throw error;
  }
};

// Run validation
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
