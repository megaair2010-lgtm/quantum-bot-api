import express from "express";
import axios from "axios";
import crypto from "crypto";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Quantum Bot rodando 🚀");
});

app.get("/saldo", async (req, res) => {
  const API_KEY = process.env.BYBIT_KEY;
  const API_SECRET = process.env.BYBIT_SECRET;

  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: "API não configurada" });
  }

  try {
    const timestamp = Date.now().toString();
    const recvWindow = "5000";

    const query = `api_key=${API_KEY}&recv_window=${recvWindow}&timestamp=${timestamp}`;
    const sign = crypto
      .createHmac("sha256", API_SECRET)
      .update(query)
      .digest("hex");

    const url = `https://api.bybit.com/v5/account/wallet-balance?accountType=SPOT&${query}&sign=${sign}`;


    const r = await axios.get(url);

    const balance =
      r.data?.result?.list?.[0]?.totalWalletBalance ?? "0.00";

    res.json({ balance });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao buscar saldo" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
