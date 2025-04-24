import { Pool } from 'pg';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'ghsimard',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'form_docentes',
});

const router = express.Router();

// Endpoint to fetch school names
router.get('/schools', async (req, res) => {
  try {
    const searchTerm = req.query.search as string || '';
    const query = `
      SELECT DISTINCT nombre_de_la_institucion_educativa_en_la_actualmente_desempena_ as name
      FROM Rectores
      WHERE LOWER(nombre_de_la_institucion_educativa_en_la_actualmente_desempena_) 
      LIKE LOWER($1)
      ORDER BY nombre_de_la_institucion_educativa_en_la_actualmente_desempena_
      LIMIT 10
    `;
    
    const result = await pool.query(query, [`%${searchTerm}%`]);
    res.json(result.rows.map(row => row.name));
  } catch (error) {
    console.error('Error fetching school names:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 