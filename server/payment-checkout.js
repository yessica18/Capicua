/**
 * CAPICÚA — Netlify Serverless Function: Checkout de Pagos
 * Endpoint: POST /api/payment-checkout
 * 
 * Genera referencias únicas, calcula montos y firmas de integridad para Wompi y Stripe.
 */

const crypto = require("crypto");

const PLANS_DATA = {
  orbita: { name: "Órbita", monthly: 0, semestral: 0, annual: 0 },
  chispa: { name: "Chispa", monthly: 1900, semestral: 9690, annual: 16000 },
  cometa: { name: "Cometa", monthly: 3900, semestral: 19890, annual: 32800 },
  nova:   { name: "Nova",   monthly: 6900, semestral: 35190, annual: 58000 }
};

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Método no permitido" }) };
  }

  try {
    const { planId, period = "monthly", currency = "COP", country = "CO", userId } = JSON.parse(event.body || "{}");

    const plan = PLANS_DATA[planId];
    if (!plan) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Plan inválido" })
      };
    }

    if (planId === "orbita") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          free: true,
          planId: "orbita",
          message: "El plan Órbita es gratuito de por vida."
        })
      };
    }

    const amount = period === "annual" ? plan.annual : period === "semestral" ? plan.semestral : plan.monthly;
    const amountInCents = amount * 100;
    const reference = `CAP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // Wompi Integrity Signature: SHA256(reference + amountInCents + currency + integritySecret)
    const wompiIntegritySecret = process.env.WOMPI_INTEGRITY_SECRET;
    let wompiSignature = null;
    if (wompiIntegritySecret) {
      const rawString = `${reference}${amountInCents}${currency}${wompiIntegritySecret}`;
      wompiSignature = crypto.createHash("sha256").update(rawString).digest("hex");
    }

    const wompiPublicKey = process.env.WOMPI_PUBLIC_KEY || "pub_test_capicua_demo";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        reference,
        amount,
        amountInCents,
        currency,
        planId,
        planName: plan.name,
        period,
        wompi: {
          publicKey: wompiPublicKey,
          signature: wompiSignature,
          redirectUrl: `${process.env.APP_URL || ""}/#membresias.confirmacion?ref=${reference}`
        },
        sandbox: !wompiIntegritySecret
      })
    };

  } catch (err) {
    console.error("Error en checkout de pagos:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error al generar sesión de pago", details: err.message })
    };
  }
};
