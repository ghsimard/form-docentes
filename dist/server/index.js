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
// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../build')));
// PostgreSQL connection configuration
const pool = new Pool(process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
    : {
        user: process.env.DB_USER || 'ghsimard',
        password: process.env.DB_PASSWORD || '',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'form_docentes'
    });
// Create table if it doesn't exist
const createTableQuery = `
  DROP TABLE IF EXISTS form_submissions;
  CREATE TABLE IF NOT EXISTS form_submissions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    institucion_educativa VARCHAR(255) NOT NULL,
    anos_como_docente VARCHAR(50) NOT NULL,
    grados_asignados TEXT[] NOT NULL,
    jornada VARCHAR(50) NOT NULL,
    retroalimentacion_de TEXT[] NOT NULL,
    frequency_ratings6 JSONB NOT NULL,
    frequency_ratings7 JSONB NOT NULL,
    frequency_ratings8 JSONB NOT NULL
  );
`;
pool.query(createTableQuery)
    .then(() => console.log('form_submissions table created successfully'))
    .catch(err => console.error('Error creating form_submissions table:', err));
// API endpoint to save form data
app.post('/api/submit-form', async (req, res) => {
    try {
        const { schoolName, yearsOfExperience, teachingGradesEarly, teachingGradesLate, schedule, feedbackSources, frequencyRatings6, frequencyRatings7, frequencyRatings8 } = req.body;
        const query = `
      INSERT INTO form_submissions (
        institucion_educativa,
        anos_como_docente,
        grados_asignados,
        jornada,
        retroalimentacion_de,
        frequency_ratings6,
        frequency_ratings7,
        frequency_ratings8
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
        // Combine early and late teaching grades into a single array
        const allGrades = [...teachingGradesEarly, ...teachingGradesLate];
        const values = [
            schoolName,
            yearsOfExperience,
            allGrades,
            schedule,
            feedbackSources,
            frequencyRatings6,
            frequencyRatings7,
            frequencyRatings8
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
            error: 'Failed to save form response'
        });
    }
});
// API endpoint to search for school names
app.get('/api/search-schools', async (req, res) => {
    const searchTerm = req.query.q;
    try {
        const query = `
      SELECT DISTINCT TRIM(nombre_de_la_institucion_educativa_en_la_actualmente_desempena_) as school_name
      FROM rectores
      WHERE LOWER(TRIM(nombre_de_la_institucion_educativa_en_la_actualmente_desempena_)) LIKE LOWER($1)
      LIMIT 10;
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
