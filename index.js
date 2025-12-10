import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// APP CODE & KEY USANDO ENV
const APP_CODE = process.env.SERVER_APP_CODE;
const APP_KEY = process.env.SERVER_APP_KEY;

// GENERAR AUTH TOKEN DINÁMICO
const getToken = () => {
  return Buffer.from(`${APP_CODE}:${APP_KEY}`).toString("base64");
};

// GENERAR LINKTOPAY
app.post("/create-link", async (req, res) => {
  try {
    const { amount, email, reference, description } = req.body;

    const body = {
      user: {
        id: "1",
        email: email || "cliente@correo.com",
        name: "Cliente",
        last_name: "Shopify"
      },
      order: {
        dev_reference: reference,
        description: description,
        amount: amount,
        currency: "USD"
      },
      configuration: {
        allowed_payment_methods: ["All"],
        success_url: "https://tutienda.com/pages/gracias",
        failure_url: "https://tutienda.com/pages/error"
      }
    };

    const response = await fetch(
      "https://noccapi-stg.paymentez.com/linktopay/init_order/",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "auth-token": getToken()
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    console.log("Nuvei:", data);

    if (data.payment_url) {
      return res.json({ url: data.payment_url });
    } else {
      return res.json({ error: data });
    }

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ error: "Error generando enlace" });
  }
});

// WEBHOOK (opcional)
app.post("/webhook", (req, res) => {
  console.log("Webhook recibido:", req.body);
  res.send("ok");
});

// TEST
app.get("/", (req, res) => {
  res.send("Servidor Nuvei funcionando correctamente ✔️");
});

// PUERTO
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en Render ✔️ Puerto:", PORT);
});

