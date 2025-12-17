import crypto from "crypto";
import axios from "axios";

export default async function handler(req, res) {
  try {
    const API_KEY = process.env.BYBIT_KEY;
    const API_SECRET = process.env.BYBIT_SECRET;

    if (!API_KEY || !API_SECRET) {
      return res.status(500).json({ error: "API não configurada" });
    }

    const timestamp = Date.now().toString();
    const recvWindow = "5000";
    const query = "accountType=UNIFIED";

    const sign = crypto
      .createHmac("sha256", API_SECRET)
      .update(timestamp + API_KEY + recvWindow + query)
      .digest("hex");

    const r = await axios.get(
      `https://api.bybit.com/v5/account/wallet-balance?${query}`,
      {
        headers: {
          "X-BAPI-API-KEY": API_KEY,
          "X-BAPI-SIGN": sign,
          "X-BAPI-TIMESTAMP": timestamp,
          "X-BAPI-RECV-WINDOW": recvWindow
        }
      }
    );

    const balance =
      r.data?.result?.list?.[0]?.totalWalletBalance || "0";

    res.json({ balance });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
