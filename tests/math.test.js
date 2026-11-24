// ============================================================================
// CAPICÚA 888 — Math Engine Test Suite
// Verifies Sandboxed Mathematical Evaluator (Zero new Function / Zero eval)
// ============================================================================
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Extract safeEvalMath function from capicua-simulacros.js for rigorous unit testing
const simulacrosCode = fs.readFileSync(path.join(__dirname, '..', 'capicua-simulacros.js'), 'utf8');
const fnMatch = simulacrosCode.match(/function safeEvalMath\([\s\S]*?\n    \}/);
if (!fnMatch) {
  throw new Error('No se encontró safeEvalMath en capicua-simulacros.js');
}

const safeEvalMath = new (function() {
  const code = fnMatch[0] + '; return safeEvalMath;';
  return Function(code)();
})();

test('Math Engine — Basic Arithmetic and Precedence', () => {
  assert.strictEqual(safeEvalMath('2 + 3 * 4'), 14);
  assert.strictEqual(safeEvalMath('(2 + 3) * 4'), 20);
  assert.strictEqual(safeEvalMath('100 / 4 - 5'), 20);
  assert.strictEqual(safeEvalMath('15.5 + 4.5'), 20);
});

test('Math Engine — Powers and Exponents', () => {
  assert.strictEqual(safeEvalMath('2^8'), 256);
  assert.strictEqual(safeEvalMath('3^3'), 27);
  assert.strictEqual(safeEvalMath('4^0.5'), 2);
});

test('Math Engine — Math Functions (sqrt, abs, sin, cos)', () => {
  assert.strictEqual(safeEvalMath('sqrt(196)'), 14);
  assert.strictEqual(safeEvalMath('abs(-42)'), 42);
  assert.strictEqual(Math.round(safeEvalMath('sin(0)')), 0);
  assert.strictEqual(Math.round(safeEvalMath('cos(0)')), 1);
});

test('Math Engine — OWASP Sandboxing: Rejects Arbitrary Code & Malicious Input', () => {
  // Must return null, NEVER evaluate or execute arbitrary JavaScript
  assert.strictEqual(safeEvalMath('process.exit(1)'), null);
  assert.strictEqual(safeEvalMath('alert("XSS")'), null);
  assert.strictEqual(safeEvalMath('require("fs")'), null);
  assert.strictEqual(safeEvalMath('console.log("hacked")'), null);
  assert.strictEqual(safeEvalMath('window.location'), null);
  assert.strictEqual(safeEvalMath('1/0'), null); // division by zero handled cleanly
});
