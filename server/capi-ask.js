/**
 * CAPICÚA 888 — Netlify Serverless Function: Capi IA Assistant Proxy
 * Endpoint: POST /.netlify/functions/capi-ask o POST /api/capi-ask
 * 
 * Orquestador pedagógico y tutora de Inteligencia Artificial para
 * Matemáticas, Ciencias Básicas y Facultad de Ingeniería.
 */

const ai = require('../../lib/ai');

exports.handler = async function(event, context) {
  // Manejo de preflight CORS
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
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método no permitido. Usa POST." })
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const result = await ai.askCapi(payload);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (err) {
    console.error("[Capi IA Handler Error]:", err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        ok: false,
        error: err.message
      })
    };
  }
};
