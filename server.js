import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Corrige __dirname em ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Banco Neon
const pool = new Pool({
  host: process.env.NEON_HOST,
  database: process.env.NEON_DB,
  user: process.env.NEON_USER,
  password: process.env.NEON_PASSWORD,
  port: process.env.NEON_PORT,
  ssl: { rejectUnauthorized: false }
});

// Habilita CORS
app.use(cors());



// Rota para última localização
app.get('/api/locations/latest', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT latitude, longitude, created_at as datahora
      FROM locations
      ORDER BY datahora DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhuma localização encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar localização' });
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhuma localização encontrada' });
    }
    app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

    

// Start server (escuta todas as interfaces)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
