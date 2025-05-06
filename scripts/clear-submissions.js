import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function clearSubmissions() {
  try {
    console.log('Connecting to database...');
    
    console.log('Deleting all records from docentes_form_submissions table...');
    const result = await pool.query('DELETE FROM docentes_form_submissions');
    
    console.log(`Successfully deleted ${result.rowCount} records.`);
    
    // Check if the table is empty
    const checkResult = await pool.query('SELECT COUNT(*) FROM docentes_form_submissions');
    const count = parseInt(checkResult.rows[0].count);
    
    console.log(`Remaining records in the table: ${count}`);
    
    await pool.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error clearing submissions:', error);
    process.exit(1);
  }
}

clearSubmissions(); 