import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    process.exit(1);
}
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});
async function migrateColumnNames() {
    const client = await pool.connect();
    try {
        // Start a transaction
        await client.query('BEGIN');
        // Rename the columns
        await client.query(`
      ALTER TABLE docentes_form_submissions 
      RENAME COLUMN "Comunicacion" TO comunicacion;
    `);
        console.log('Renamed Comunicacion to comunicacion');
        await client.query(`
      ALTER TABLE docentes_form_submissions 
      RENAME COLUMN "Practicas_Pedagogicas" TO practicas_pedagogicas;
    `);
        console.log('Renamed Practicas_Pedagogicas to practicas_pedagogicas');
        await client.query(`
      ALTER TABLE docentes_form_submissions 
      RENAME COLUMN "Convivencia" TO convivencia;
    `);
        console.log('Renamed Convivencia to convivencia');
        // Commit the transaction
        await client.query('COMMIT');
        console.log('Migration completed successfully');
    }
    catch (error) {
        // Rollback in case of error
        await client.query('ROLLBACK');
        console.error('Error during migration:', error);
        throw error;
    }
    finally {
        client.release();
    }
}
// Run the migration
migrateColumnNames()
    .then(() => {
    console.log('Migration completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
