const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

// TU AUTH TOKEN
const AUTH_TOKEN = "TElOS1RPUEFZMDEtRUMtQ0xJRU5UOk1FVGJiMWFxS2RzTjRnRnJRRUxCVGljc2NjS2hHZw==";

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
          "Content-Type": "application/json",
          "auth-token": AUTH_TOKEN
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    console.log("Respuesta Nuvei:", data);

    if (data.payment_url) {
      return res.json({ url: data.payment_url });
    } else {
      return res.json({ error: data });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error generando enlace" });
  }
});

// WEBHOOK
app.post("/webhook", (req, res) => {
  console.log("WEBHOOK:", req.body);
  res.send("ok");
});

// HOME
app.get("/", (req, res) => {
  res.send("Servidor Nuvei funcionando correctamente.");
});

// 🚀 PUERTO CORRECTO PARA RENDER
app.listen(process.env.PORT || 10000, () => {
  console.log("Servidor corriendo en Render en el puerto", process.env.PORT);
});

