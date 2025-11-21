import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Database Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);


const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
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


validateConnection().catch((err) => {
  console.error('Unexpected error during DB validation:', err);
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database (pool)');
});

pool.on('error', (err) => {
  console.error('Unexpected error on PostgreSQL client:', err);
});

export default pool;
