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
async function migrateTableName() {
    const client = await pool.connect();
    try {
        // Check if the old table exists and count records
        const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'form_submissions'
      );
    `;
        const tableExists = await client.query(checkTableQuery);
        if (tableExists.rows[0].exists) {
            // Count records before migration
            const countQuery = 'SELECT COUNT(*) FROM form_submissions;';
            const countResult = await client.query(countQuery);
            const recordCount = parseInt(countResult.rows[0].count);
            console.log(`Found ${recordCount} records in form_submissions table`);
            // Rename the table
            const renameQuery = `
        ALTER TABLE form_submissions 
        RENAME TO docentes_form_submissions;
      `;
            await client.query(renameQuery);
            // Verify records after migration
            const newCountQuery = 'SELECT COUNT(*) FROM docentes_form_submissions;';
            const newCountResult = await client.query(newCountQuery);
            const newRecordCount = parseInt(newCountResult.rows[0].count);
            if (newRecordCount === recordCount) {
                console.log(`Successfully renamed table from form_submissions to docentes_form_submissions`);
                console.log(`All ${recordCount} records preserved in the new table`);
            }
            else {
                throw new Error(`Data preservation check failed: Original count ${recordCount} != New count ${newRecordCount}`);
            }
        }
        else {
            console.log('Table form_submissions does not exist, no migration needed');
        }
    }
    catch (error) {
        console.error('Error during migration:', error);
        throw error;
    }
    finally {
        client.release();
    }
}
migrateTableName()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
