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

    const url = `https://api.bybit.com/v5/account/wallet-balance?accountType=UNIFIED&${query}&sign=${sign}`;

    const r = await axios.get(url);

    const balance =
      r.data?.result?.list?.[0]?.totalWalletBalance ?? "0.00";

    res.json({ balance });
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).json({ error: "Erro ao buscar saldo" });
  }
});
