// ============================================================================
// CAPICÚA 888 — Payments Module Test Suite
// Verifies Wompi Checkout Signature, Webhook Checksum & Idempotency
// ============================================================================
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { createCheckoutSession, verifyWebhook, PLANS_CATALOG } = require('../lib/payments');
const config = require('../lib/config');

test('Payments Module — Wompi Checkout Signature Generation', () => {
  const params = {
    planId: 'chispa',
    period: 'monthly',
    userId: 'user-uuid-12345'
  };

  const checkout = createCheckoutSession(params);

  assert.strictEqual(checkout.ok, true, 'Checkout must succeed');
  assert.ok(checkout.reference, 'Must generate reference');
  assert.ok(checkout.reference.startsWith('CAP-'), 'Reference must start with CAP-');
  assert.strictEqual(checkout.currency, 'COP', 'Currency must be COP');
  assert.strictEqual(checkout.amount, PLANS_CATALOG.chispa.monthly, 'Amount must match plan');
  assert.strictEqual(checkout.amountInCents, PLANS_CATALOG.chispa.monthly * 100, 'Amount must be in cents');
  assert.ok(checkout.wompi.signature, 'Integrity signature must be generated');
  assert.strictEqual(checkout.wompi.signature.length, 64, 'SHA-256 signature must be 64 hex characters');

  // Verify calculation: sha256(reference + amountInCents + currency + integritySecret)
  const expectedHash = crypto.createHash('sha256')
    .update(`${checkout.reference}${checkout.amountInCents}${checkout.currency}${config.wompi.integritySecret}`)
    .digest('hex');
  assert.strictEqual(checkout.wompi.signature, expectedHash, 'Signature calculation must match exact Wompi spec');
});

test('Payments Module — Free Plan (Órbita) Requires No Payment', () => {
  const result = createCheckoutSession({ planId: 'orbita' });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.free, true);
  assert.strictEqual(result.planId, 'orbita');
});

test('Payments Module — Wompi Webhook Signature Verification & Idempotency', () => {
  const transactionId = 'tx-test-' + Date.now();
  const status = 'APPROVED';
  const amountInCents = 190000;
  const timestamp = Math.floor(Date.now() / 1000);
  const secret = config.wompi.eventsSecret;

  // Wompi checksum formula: sha256(properties + timestamp + secret)
  const rawString = `${transactionId}${status}${amountInCents}${timestamp}${secret}`;
  const validChecksum = crypto.createHash('sha256').update(rawString).digest('hex');

  const validPayload = {
    event: 'transaction.updated',
    data: {
      transaction: {
        id: transactionId,
        status: status,
        amount_in_cents: amountInCents,
        reference: 'CAP-TEST-12345',
        currency: 'COP',
        payment_method_type: 'CARD'
      }
    },
    signature: {
      properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
      checksum: validChecksum
    },
    timestamp: timestamp
  };

  // 1. Valid webhook test
  const verificationResult = verifyWebhook(validPayload);
  assert.strictEqual(verificationResult.received, true, 'Valid webhook payload must verify successfully');
  assert.strictEqual(verificationResult.status, 'APPROVED');
  assert.strictEqual(verificationResult.transactionId, transactionId);

  // 2. Idempotency test (same event sent again)
  const duplicateResult = verifyWebhook(validPayload);
  assert.strictEqual(duplicateResult.duplicate, true, 'Duplicate webhook event must be flagged idempotent');

  // 3. Tampered webhook test with different transaction ID
  const tamperedTxId = 'tx-tampered-' + Date.now();
  const tamperedPayload = {
    event: 'transaction.updated',
    data: {
      transaction: {
        id: tamperedTxId,
        status: 'VOIDED', // status changed
        amount_in_cents: amountInCents,
        reference: 'CAP-TEST-TAMPER'
      }
    },
    signature: {
      properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
      checksum: validChecksum // invalid checksum for tampered data
    },
    timestamp: timestamp
  };

  assert.throws(
    () => verifyWebhook(tamperedPayload),
    /Firma criptográfica/,
    'Tampered webhook payload must throw signature error'
  );
});
