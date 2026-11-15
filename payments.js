/**
 * CAPICÚA 888 — Payments & Membership Verification Service (Wompi)
 * Handles checkout creation, signature generation, webhook verification, and idempotency.
 */
const crypto = require('crypto');
const config = require('./config');

const PLANS_CATALOG = {
  orbita: {
    id: 'orbita',
    name: 'Órbita',
    monthly: 0,
    semestral: 0,
    annual: 0,
    free: true
  },
  chispa: {
    id: 'chispa',
    name: 'Chispa',
    monthly: 1900,
    semestral: 9690,
    annual: 16000,
    free: false
  },
  cometa: {
    id: 'cometa',
    name: 'Cometa',
    monthly: 3900,
    semestral: 19890,
    annual: 32800,
    free: false
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    monthly: 6900,
    semestral: 35190,
    annual: 58000,
    free: false
  }
};

// Cache for processed event IDs (in-memory idempotency check)
const processedWebhooks = new Set();

function createCheckoutSession(params) {
  const { planId, period = 'monthly', currency = 'COP', userId } = params;

  const plan = PLANS_CATALOG[planId];
  if (!plan) {
    throw new Error('Plan de membresía no válido.');
  }

  if (plan.free) {
    return {
      ok: true,
      free: true,
      planId: plan.id,
      planName: plan.name,
      message: 'El plan Órbita es gratuito de forma permanente.'
    };
  }

  const amount = period === 'annual' ? plan.annual : period === 'semestral' ? plan.semestral : plan.monthly;
  const amountInCents = amount * 100;
  const reference = `CAP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  // Wompi Integrity Signature formula: SHA256(reference + amountInCents + currency + integritySecret)
  let signature = null;
  const integritySecret = config.wompi.integritySecret;
  if (integritySecret) {
    const rawString = `${reference}${amountInCents}${currency}${integritySecret}`;
    signature = crypto.createHash('sha256').update(rawString).digest('hex');
  }

  return {
    ok: true,
    reference,
    amount,
    amountInCents,
    currency,
    planId: plan.id,
    planName: plan.name,
    period,
    wompi: {
      publicKey: config.wompi.publicKey,
      signature,
      redirectUrl: `${config.appUrl}/#membresias.confirmacion?ref=${reference}`
    },
    sandbox: config.wompi.sandbox
  };
}

function verifyWebhook(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('Payload de webhook inválido');
  }

  // Idempotency check
  const eventId = body.id || (body.data && body.data.transaction && body.data.transaction.id);
  if (eventId && processedWebhooks.has(eventId)) {
    return {
      received: true,
      duplicate: true,
      note: 'Evento ya procesado previamente'
    };
  }

  // Wompi transaction updated event
  if (body.event === 'transaction.updated' && body.data && body.data.transaction) {
    const tx = body.data.transaction;
    const eventsSecret = config.wompi.eventsSecret;

    // Cryptographic signature verification if secret is present
    if (eventsSecret && body.signature && body.signature.checksum) {
      const properties = body.signature.properties || [];
      let concat = '';
      properties.forEach(prop => {
        const parts = prop.split('.');
        let val = body.data;
        parts.forEach(p => { if (val) val = val[p]; });
        concat += val !== undefined ? val : '';
      });
      concat += body.timestamp + eventsSecret;
      const computedChecksum = crypto.createHash('sha256').update(concat).digest('hex');

      if (computedChecksum !== body.signature.checksum) {
        throw new Error('Firma criptográfica de webhook Wompi no válida.');
      }
    }

    if (eventId) {
      processedWebhooks.add(eventId);
    }

    return {
      received: true,
      status: tx.status, // 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'
      reference: tx.reference,
      amountInCents: tx.amount_in_cents,
      currency: tx.currency,
      paymentMethodType: tx.payment_method_type,
      transactionId: tx.id
    };
  }

  return {
    received: true,
    note: 'Evento genérico o de prueba procesado correctamente'
  };
}

module.exports = {
  PLANS_CATALOG,
  createCheckoutSession,
  verifyWebhook
};
