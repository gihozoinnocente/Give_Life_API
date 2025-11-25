const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'blood_donation',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL');
    const res = await client.query('SELECT version()');
    console.log('PostgreSQL version:', res.rows[0].version);
    client.release();
  } catch (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('   → PostgreSQL service might not be running');
    } else if (err.code === '28P01') {
      console.error('   → Authentication failed. Check DB_USER and DB_PASSWORD');
    } else if (err.code === '3D000') {
      console.error('   → Database does not exist. Create it with: CREATE DATABASE blood_donation;');
    }
  } finally {
    await pool.end();
  }
}

testConnection();
