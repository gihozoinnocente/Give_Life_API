import fs from 'fs';
import path from 'path';
import pool from './database';

export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database schema...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await pool.query(schema);
    
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};
