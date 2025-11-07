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

// Ajuste para __dirname no ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Configuração de CORS segura e compatível com Render
const allowedOrigins = [
  "https://mapa-6wu5.onrender.com", // 🔹 substitua pelo domínio do seu frontend Render
  "http://localhost:5173", // para rodar localmente com Vite
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origem não permitida pelo CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

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
app.get("https://rastreador-1.onrender.com/api/locations/latest", async (req, res) => {
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
