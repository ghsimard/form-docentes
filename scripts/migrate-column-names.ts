import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateColumnNames() {
  try {
    // Migrate acudientes_form_submissions
    try {
      await pool.query(`ALTER TABLE acudientes_form_submissions RENAME COLUMN frequency_ratings5 TO "Comunicacion";`);
      console.log('Renamed frequency_ratings5 to Comunicacion in acudientes_form_submissions');
    } catch (error) {
      console.error('Error renaming frequency_ratings5:', error);
    }

    try {
      await pool.query(`ALTER TABLE acudientes_form_submissions RENAME COLUMN frequency_ratings6 TO "Practicas_Pedagogicas";`);
      console.log('Renamed frequency_ratings6 to Practicas_Pedagogicas in acudientes_form_submissions');
    } catch (error) {
      console.error('Error renaming frequency_ratings6:', error);
    }

    try {
      await pool.query(`ALTER TABLE acudientes_form_submissions RENAME COLUMN frequency_ratings7 TO "Convivencia";`);
      console.log('Renamed frequency_ratings7 to Convivencia in acudientes_form_submissions');
    } catch (error) {
      console.error('Error renaming frequency_ratings7:', error);
    }

    // Migrate estudiantes_form_submissions
    try {
      await pool.query(`ALTER TABLE estudiantes_form_submissions RENAME COLUMN frequency_ratings5 TO "Comunicacion";`);
      console.log('Renamed frequency_ratings5 to Comunicacion in estudiantes_form_submissions');
    } catch (error) {
      console.error('Error renaming frequency_ratings5:', error);
    }

    try {
      await pool.query(`ALTER TABLE estudiantes_form_submissions RENAME COLUMN frequency_ratings6 TO "Practicas_Pedagogicas";`);
      console.log('Renamed frequency_ratings6 to Practicas_Pedagogicas in estudiantes_form_submissions');
    } catch (error) {
      console.error('Error renaming frequency_ratings6:', error);
    }

    try {
      await pool.query(`ALTER TABLE estudiantes_form_submissions RENAME COLUMN frequency_ratings7 TO "Convivencia";`);
      console.log('Renamed frequency_ratings7 to Convivencia in estudiantes_form_submissions');
    } catch (error) {
      console.error('Error renaming frequency_ratings7:', error);
    }

    // Migrate docentes_form_submissions
    try {
      await pool.query(`ALTER TABLE docentes_form_submissions RENAME COLUMN frequency_ratings6 TO "Comunicacion";`);
      console.log('Renamed frequency_ratings6 to Comunicacion in docentes_form_submissions');
    } catch (error) {
      console.error('Error renaming frequency_ratings6:', error);
    }

    try {
      await pool.query(`ALTER TABLE docentes_form_submissions RENAME COLUMN frequency_ratings7 TO "Practicas_Pedagogicas";`);
      console.log('Renamed frequency_ratings7 to Practicas_Pedagogicas in docentes_form_submissions');
    } catch (error) {
      console.error('Error renaming frequency_ratings7:', error);
    }

    try {
      await pool.query(`ALTER TABLE docentes_form_submissions RENAME COLUMN frequency_ratings8 TO "Convivencia";`);
      console.log('Renamed frequency_ratings8 to Convivencia in docentes_form_submissions');
    } catch (error) {
      console.error('Error renaming frequency_ratings8:', error);
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Error in migration:', error);
  } finally {
    await pool.end();
  }
}

migrateColumnNames(); 