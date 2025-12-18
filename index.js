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

    const params = "accountType=UNIFIED";
    const payload = timestamp + API_KEY + recvWindow + params;

    const sign = crypto
      .createHmac("sha256", API_SECRET)
      .update(payload)
      .digest("hex");

    const response = await axios.get(
      "https://api.bybit.com/v5/account/wallet-balance",
      {
        params: { accountType: "UNIFIED" },
        headers: {
          "X-BAPI-API-KEY": API_KEY,
          "X-BAPI-TIMESTAMP": timestamp,
          "X-BAPI-RECV-WINDOW": recvWindow,
          "X-BAPI-SIGN": sign
        }
      }
    );

    const balance =
      response.data?.result?.list?.[0]?.totalWalletBalance ?? "0.00";

    res.json({ balance });
  } catch (err) {
    console.error("BYBIT ERROR:", err.response?.data || err.message);
    res.status(500).json({
      error: "Erro ao buscar saldo",
      bybit: err.response?.data || null
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
