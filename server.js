// server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Ajuste para __dirname no ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve arquivos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// Banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Exemplo: postgres://user:pass@host:5432/dbname
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

// Função de query reutilizável
const query = (text, params) => pool.query(text, params);

// Rota para pegar última localização
app.get("/api/locations/latest", async (req, res) => {
  try {
    const result = await query(
      `SELECT latitude, longitude,
            created_at AS data_hora
       FROM locations
       ORDER BY data_hora DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sem dados" });
    }

    const row = result.rows[0];
    res.json({
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      datahora: row.data_hora,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao consultar banco" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server rodando na porta ${PORT}`));
