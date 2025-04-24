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
        console.error(`
DATABASE_URL environment variable is not set. 

To configure the database connection in Render.com:
1. Create a new PostgreSQL database in your Render.com dashboard
2. Go to your Web Service's Environment settings
3. Add a new Environment Variable:
   - Key: DATABASE_URL
   - Value: Copy the "External Database URL" from your PostgreSQL database settings

For local development:
1. Create a .env file in the project root
2. Add: DATABASE_URL=postgres://username:password@localhost:5432/form_docentes
`);
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