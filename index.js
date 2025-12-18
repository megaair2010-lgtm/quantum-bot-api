import express from "express";
import axios from "axios";
import crypto from "crypto";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("API Binance Quantum rodando 🚀");
});

app.get("/saldo", async (req, res) => {
  const API_KEY = process.env.BINANCE_KEY;
  const API_SECRET = process.env.BINANCE_SECRET;

  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: "API Binance não configurada" });
  }

  try {
    const timestamp = Date.now();
    const query = `timestamp=${timestamp}`;

    const signature = crypto
      .createHmac("sha256", API_SECRET)
      .update(query)
      .digest("hex");

    const response = await axios.get(
      `https://api.binance.com/api/v3/account?${query}&signature=${signature}`,
      {
        headers: {
          "X-MBX-APIKEY": API_KEY
        }
      }
    );

    const balances = response.data.balances.filter(
      b => Number(b.free) > 0 || Number(b.locked) > 0
    );

    res.json({ balances });
  } catch (err) {
    res.status(500).json({
      error: "Erro ao buscar saldo",
      details: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
