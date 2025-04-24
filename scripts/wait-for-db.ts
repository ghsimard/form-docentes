import { Pool } from 'pg';

const maxRetries = 30;
const retryInterval = 2000; // 2 seconds

async function waitForDatabase(): Promise<void> {
  let retries = 0;

  // Log environment information
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    PORT: process.env.PORT
  });
  
  while (retries < maxRetries) {
    try {
      if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL environment variable is not set. Please configure the database connection.');
        process.exit(1);
      }

      console.log('Attempting database connection...');
      
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false
        } : false
      });

      console.log('Pool created, testing connection...');
      await pool.query('SELECT NOW()');
      console.log('Database is available!');
      await pool.end();
      process.exit(0);
    } catch (error) {
      console.log(`Waiting for database... (attempt ${retries + 1}/${maxRetries})`);
      if (error instanceof Error) {
        console.log('Connection error:', error.message);
      }
      await new Promise(resolve => setTimeout(resolve, retryInterval));
      retries++;
    }
  }

  console.error('Failed to connect to database after maximum retries');
  process.exit(1);
}

waitForDatabase(); 