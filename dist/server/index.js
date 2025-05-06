import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
// Debug environment
console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    PORT: process.env.PORT
});
// Middleware
app.use(cors({
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
}));
// Configure express to handle larger request headers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not set');
        }
        await pool.query('SELECT NOW()');
        res.json({ status: 'healthy', database: 'connected' });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: process.env.NODE_ENV === 'production' ? 'Database connection failed' : error.message
        });
    }
});
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../build')));
// PostgreSQL connection configuration
if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    process.exit(1); // Exit if no database URL is provided
}
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
};
console.log('Database config:', {
    hasConnectionString: !!dbConfig.connectionString,
    ssl: dbConfig.ssl
});
const pool = new Pool(dbConfig);
// Test database connection
pool.query('SELECT NOW()')
    .then(() => console.log('Successfully connected to database'))
    .catch(err => {
    console.error('Error connecting to database:', err);
    if (process.env.NODE_ENV === 'production') {
        process.exit(1); // Exit in production if we can't connect to the database
    }
});
// API endpoint to save form data
app.post('/api/submit-form', async (req, res) => {
    try {
        const { schoolName, yearsOfExperience, teachingGradesEarly, teachingGradesLate, schedule, feedbackSources, comunicacion, practicas_pedagogicas, convivencia } = req.body;
        // Log the received data for debugging
        console.log('Received form data:', {
            schoolName,
            yearsOfExperience,
            teachingGradesEarly,
            teachingGradesLate,
            schedule,
            feedbackSources,
            hasComunicacion: !!comunicacion,
            hasPracticas: !!practicas_pedagogicas,
            hasConvivencia: !!convivencia
        });
        // Validate required fields
        if (!schoolName || !yearsOfExperience || !schedule) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: {
                    schoolName: !schoolName,
                    yearsOfExperience: !yearsOfExperience,
                    schedule: !schedule
                }
            });
        }
        // Combine early and late teaching grades into a single array
        const allGrades = [...(teachingGradesEarly || []), ...(teachingGradesLate || [])];
        if (allGrades.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one teaching grade must be selected'
            });
        }
        if (!feedbackSources || feedbackSources.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one feedback source must be selected'
            });
        }
        const query = `
      INSERT INTO docentes_form_submissions (
        institucion_educativa,
        anos_como_docente,
        grados_asignados,
        jornada,
        retroalimentacion_de,
        comunicacion,
        practicas_pedagogicas,
        convivencia
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
        const values = [
            schoolName,
            yearsOfExperience,
            allGrades,
            schedule,
            feedbackSources,
            comunicacion,
            practicas_pedagogicas,
            convivencia
        ];
        const result = await pool.query(query, values);
        res.json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error saving form response:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save form response',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// API endpoint to search for school names
app.get('/api/search-schools', async (req, res) => {
    const searchTerm = req.query.q;
    try {
        // First check if the rectores table exists
        const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'rectores'
      );
    `);
        if (!tableCheck.rows[0].exists) {
            // If table doesn't exist, return empty results
            return res.json([]);
        }
        const query = `
      SELECT DISTINCT TRIM(nombre_de_la_institucion_educativa_en_la_actualmente_desempena_) as school_name
      FROM rectores
      WHERE LOWER(TRIM(nombre_de_la_institucion_educativa_en_la_actualmente_desempena_)) LIKE LOWER($1)
      ORDER BY school_name;
    `;
        const result = await pool.query(query, [`%${searchTerm}%`]);
        res.json(result.rows.map(row => row.school_name));
    }
    catch (error) {
        console.error('Error searching schools:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search schools'
        });
    }
});
// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build/index.html'));
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
