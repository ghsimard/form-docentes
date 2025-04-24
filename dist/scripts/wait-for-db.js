import { Pool } from 'pg';
const maxRetries = 30;
const retryInterval = 2000; // 2 seconds
async function waitForDatabase() {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            if (!process.env.DATABASE_URL) {
                console.error('DATABASE_URL is not set');
                process.exit(1);
            }
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? {
                    rejectUnauthorized: false
                } : false
            });
            await pool.query('SELECT NOW()');
            console.log('Database is available!');
            await pool.end();
            process.exit(0);
        }
        catch (error) {
            console.log(`Waiting for database... (attempt ${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryInterval));
            retries++;
        }
    }
    console.error('Failed to connect to database after maximum retries');
    process.exit(1);
}
waitForDatabase();
