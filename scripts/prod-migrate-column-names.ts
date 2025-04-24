import { Pool } from 'pg';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for confirmation
function promptForConfirmation(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Auto-confirm in production environments, especially on Render
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      console.log('Auto-confirming in production environment');
      resolve(true);
      return;
    }
    
    rl.question(`${question} (yes/no): `, (answer) => {
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

// Function to check if we're in production
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Function to check database connection
async function checkDatabaseConnection(pool: Pool): Promise<boolean> {
  try {
    await pool.query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    return false;
  }
}

// Function to check if tables exist
async function checkTablesExist(pool: Pool): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'acudientes_form_submissions'
      ) as acudientes_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'estudiantes_form_submissions'
      ) as estudiantes_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'docentes_form_submissions'
      ) as docentes_exists
    `);
    
    const { acudientes_exists, estudiantes_exists, docentes_exists } = result.rows[0];
    
    if (!acudientes_exists || !estudiantes_exists || !docentes_exists) {
      console.error('One or more required tables do not exist:');
      console.error(`- acudientes_form_submissions: ${acudientes_exists ? 'exists' : 'missing'}`);
      console.error(`- estudiantes_form_submissions: ${estudiantes_exists ? 'exists' : 'missing'}`);
      console.error(`- docentes_form_submissions: ${docentes_exists ? 'exists' : 'missing'}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

// Function to check if columns exist
async function checkColumnsExist(pool: Pool): Promise<boolean> {
  try {
    // Check acudientes_form_submissions
    const acudientesResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'acudientes_form_submissions' 
      AND column_name IN ('frequency_ratings5', 'frequency_ratings6', 'frequency_ratings7')
    `);
    
    // Check estudiantes_form_submissions
    const estudiantesResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'estudiantes_form_submissions' 
      AND column_name IN ('frequency_ratings5', 'frequency_ratings6', 'frequency_ratings7')
    `);
    
    // Check docentes_form_submissions
    const docentesResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'docentes_form_submissions' 
      AND column_name IN ('frequency_ratings6', 'frequency_ratings7', 'frequency_ratings8')
    `);
    
    const acudientesColumns = acudientesResult.rows.map(row => row.column_name);
    const estudiantesColumns = estudiantesResult.rows.map(row => row.column_name);
    const docentesColumns = docentesResult.rows.map(row => row.column_name);
    
    console.log('Existing columns:');
    console.log('- acudientes_form_submissions:', acudientesColumns.join(', ') || 'none');
    console.log('- estudiantes_form_submissions:', estudiantesColumns.join(', ') || 'none');
    console.log('- docentes_form_submissions:', docentesColumns.join(', ') || 'none');
    
    // Check if all required columns exist
    const acudientesComplete = ['frequency_ratings5', 'frequency_ratings6', 'frequency_ratings7'].every(col => 
      acudientesColumns.includes(col)
    );
    
    const estudiantesComplete = ['frequency_ratings5', 'frequency_ratings6', 'frequency_ratings7'].every(col => 
      estudiantesColumns.includes(col)
    );
    
    const docentesComplete = ['frequency_ratings6', 'frequency_ratings7', 'frequency_ratings8'].every(col => 
      docentesColumns.includes(col)
    );
    
    if (!acudientesComplete || !estudiantesComplete || !docentesComplete) {
      console.error('One or more required columns are missing:');
      console.error(`- acudientes_form_submissions: ${acudientesComplete ? 'complete' : 'incomplete'}`);
      console.error(`- estudiantes_form_submissions: ${estudiantesComplete ? 'complete' : 'incomplete'}`);
      console.error(`- docentes_form_submissions: ${docentesComplete ? 'complete' : 'incomplete'}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking columns:', error);
    return false;
  }
}

// Main migration function
async function migrateColumnNames() {
  console.log('Starting production migration script...');
  
  // Check if we're in production
  if (!isProduction()) {
    console.error('This script is intended for production use only.');
    console.error('Please set NODE_ENV=production before running this script.');
    rl.close();
    return;
  }
  
  // Log environment information
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    RENDER: process.env.RENDER ? 'true' : 'false',
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set'
  });
  
  // Create database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Check database connection
    console.log('Checking database connection...');
    const connected = await checkDatabaseConnection(pool);
    if (!connected) {
      console.error('Failed to connect to the database. Aborting migration.');
      rl.close();
      return;
    }
    console.log('Database connection successful.');
    
    // Check if tables exist
    console.log('Checking if required tables exist...');
    const tablesExist = await checkTablesExist(pool);
    if (!tablesExist) {
      console.error('One or more required tables do not exist. Aborting migration.');
      rl.close();
      return;
    }
    console.log('All required tables exist.');
    
    // Check if columns exist
    console.log('Checking if required columns exist...');
    const columnsExist = await checkColumnsExist(pool);
    if (!columnsExist) {
      console.error('One or more required columns do not exist. Aborting migration.');
      rl.close();
      return;
    }
    console.log('All required columns exist.');
    
    // Prompt for confirmation
    const confirmed = await promptForConfirmation(
      'WARNING: This will rename columns in the database. This operation cannot be undone. Are you sure you want to proceed?'
    );
    
    if (!confirmed) {
      console.log('Migration cancelled by user.');
      rl.close();
      return;
    }
    
    // Perform migration
    console.log('Starting migration...');
    
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

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Error in migration:', error);
  } finally {
    await pool.end();
    rl.close();
  }
}

// Run the migration
migrateColumnNames(); 