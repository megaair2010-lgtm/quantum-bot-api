import express from "express";
import axios from "axios";
import crypto from "crypto";

const app = express();

app.get("/", (req, res) => {
  res.send("API Quantum Bot Binance rodando 🚀");
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

    const balances = response.data.balances
      .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map(b => ({
        asset: b.asset,
        free: b.free,
        locked: b.locked
      }));

    res.json({ balances });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: "Erro ao buscar saldo Binance",
      binance: err.response?.data || null
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor Binance rodando na porta", PORT);
});
