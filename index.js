import express from "express";
import axios from "axios";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());

// Rota de teste (IMPORTANTE)
app.get("/", (req, res) => {
  res.send("API Quantum Bot rodando 🚀");
});

// ROTA /saldo (Binance Testnet)
app.get("/saldo", async (req, res) => {
  try {
    if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_API_SECRET) {
      return res.status(500).json({ error: "API Binance não configurada" });
    }

    const timestamp = Date.now();
    const query = `timestamp=${timestamp}`;

    const signature = crypto
      .createHmac("sha256", process.env.BINANCE_API_SECRET)
      .update(query)
      .digest("hex");

    const { data } = await axios.get(
      `https://testnet.binance.vision/api/v3/account?${query}&signature=${signature}`,
      {
        headers: {
          "X-MBX-APIKEY": process.env.BINANCE_API_KEY
        }
      }
    );

    res.json(
      data.balances.filter(b => Number(b.free) > 0)
    );

  } catch (err) {
    res.status(500).json({
      error: "Erro ao buscar saldo",
      details: err?.response?.data || err.message
    });
  }
});

// START DO SERVIDOR (OBRIGATÓRIO)
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
