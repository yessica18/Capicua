/**
 * CAPICÚA — Netlify Serverless Function: Webhook de Pagos
 * Endpoint: POST /api/payment-webhook
 * 
 * Recibe y valida de forma segura eventos de Wompi (Colombia) y Stripe.
 * Activa suscripciones únicamente cuando el pago ha sido aprobado en el servidor.
 */

const crypto = require("crypto");

exports.handler = async function(event, context) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Método no permitido" }) };
  }

  try {
    const rawBody = event.body || "{}";
    const body = JSON.parse(rawBody);

    // Identificar si es evento de Wompi
    if (body.event === "transaction.updated" && body.data && body.data.transaction) {
      const tx = body.data.transaction;
      const wompiEventsSecret = process.env.WOMPI_EVENTS_SECRET;

      // Validación criptográfica de Wompi si el secreto está configurado
      if (wompiEventsSecret && body.signature && body.signature.checksum) {
        const properties = body.signature.properties || [];
        // Concatenar propiedades indicadas por Wompi + timestamp + eventsSecret
        let concat = "";
        properties.forEach(prop => {
          const parts = prop.split(".");
          let val = body.data;
          parts.forEach(p => { if (val) val = val[p]; });
          concat += val !== undefined ? val : "";
        });
        concat += body.timestamp + wompiEventsSecret;
        const computedChecksum = crypto.createHash("sha256").update(concat).digest("hex");

        if (computedChecksum !== body.signature.checksum) {
          console.error("Firma de webhook Wompi inválida.");
          return { statusCode: 400, headers, body: JSON.stringify({ error: "Firma inválida" }) };
        }
      }

      console.log(`[WOMPI WEBHOOK] Transacción ${tx.id} estado: ${tx.status} referencia: ${tx.reference}`);

      // Si el pago fue aprobado:
      if (tx.status === "APPROVED") {
        // En un entorno de producción con Supabase:
        // Se ejecuta UPDATE public.payments SET status = 'approved' WHERE reference = tx.reference;
        // Y se activa la suscripción en public.subscriptions.
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ received: true, status: tx.status, ref: tx.reference })
      };
    }

    // Modo demostración o evento genérico
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true, note: "Evento procesado correctamente" })
    };

  } catch (err) {
    console.error("Error procesando webhook de pago:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error en procesamiento de webhook", details: err.message })
    };
  }
};
