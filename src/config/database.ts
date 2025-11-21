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
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      // Force SSL when using DATABASE_URL (managed providers like Railway typically require TLS)
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'blood_donation',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

// Retryable validation so startup doesn't crash if DB is temporarily unavailable
const validateConnection = async (retries = 5, delayMs = 2000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      client.release();
      console.log('✅ Database connection validated successfully');
      return;
    } catch (error) {
      console.error(`❌ Database validation attempt ${attempt} failed:`, error);
      if (attempt < retries) {
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 1.5;
      } else {
        console.error('⚠️  All database validation attempts failed. Proceeding without blocking server startup.');
      }
    }
  }
};

// Fire-and-forget validation so import doesn't crash the process
validateConnection().catch((err) => {
  console.error('Unexpected error during DB validation:', err);
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database (pool)');
});

pool.on('error', (err) => {
  console.error('Unexpected error on PostgreSQL client:', err);
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
