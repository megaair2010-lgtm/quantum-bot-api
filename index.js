import express from "express";
import axios from "axios";
import crypto from "crypto";

const app = express();

app.get("/", (req, res) => {
  res.send("API Quantum Bot Bybit rodando 🚀");
});

app.get("/saldo", async (req, res) => {
  const API_KEY = process.env.BYBIT_API_KEY;
  const API_SECRET = process.env.BYBIT_API_SECRET;

  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: "API Bybit não configurada" });
  }

  try {
    const timestamp = Date.now().toString();
    const recvWindow = "5000";

    const queryString = `api_key=${API_KEY}&timestamp=${timestamp}&recv_window=${recvWindow}`;

    const signature = crypto
      .createHmac("sha256", API_SECRET)
      .update(queryString)
      .digest("hex");

    const url = `https://api.bybit.com/v5/account/wallet-balance?accountType=UNIFIED&${queryString}&sign=${signature}`;

    const response = await axios.get(url);

    const balances =
      response.data.result.list[0].coin
        .filter(c => parseFloat(c.walletBalance) > 0)
        .map(c => ({
          asset: c.coin,
          balance: c.walletBalance
        }));

    res.json({ balances });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: "Erro ao buscar saldo Bybit",
      bybit: err.response?.data || null
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor Bybit rodando na porta", PORT);
});
