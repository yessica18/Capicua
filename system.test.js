const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Set up a mock browser window environment
function createMockBrowser() {
  const store = {};
  const mockLocalStorage = {
    getItem: (k) => store[k] !== undefined ? store[k] : null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };

  const ctx2d = new Proxy({
    getImageData: () => ({ data: new Uint8Array(64) }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    measureText: () => ({ width: 10 })
  }, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      return () => {};
    }
  });

  const listeners = {};
  const mockDocument = {
    readyState: 'complete',
    documentElement: { classList: { add: () => {}, remove: () => {}, contains: () => false } },
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    querySelector: (sel) => null,
    querySelectorAll: (sel) => [],
    getElementById: (id) => null,
    createElement: (tag) => {
      return {
        tagName: tag.toUpperCase(),
        width: 256,
        height: 256,
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        appendChild: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        addEventListener: () => {},
        remove: () => {},
        getContext: (type) => (type === '2d' ? ctx2d : {})
      };
    },
    addEventListener: (evt, fn) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    },
    dispatchEvent: (evt) => {
      const fns = listeners[evt.type] || [];
      fns.forEach(fn => fn(evt));
    }
  };

  const sandbox = {
    window: null,
    document: mockDocument,
    localStorage: mockLocalStorage,
    sessionStorage: mockLocalStorage,
    location: { href: 'http://localhost:8088/#inicio', hash: '#inicio' },
    navigator: { userAgent: 'NodeTest', onLine: true },
    performance: { now: () => Date.now() },
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    console: console,
    Math: Math,
    Date: Date,
    JSON: JSON,
    URL: { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} },
    Blob: class Blob { constructor(c) { this.content = c; } },
    Event: class Event { constructor(type) { this.type = type; } },
    CustomEvent: class CustomEvent { constructor(type, d) { this.type = type; this.detail = d; } },
    addEventListener: (evt, fn) => mockDocument.addEventListener(evt, fn),
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
    SpeechSynthesisUtterance: class MockUtterance { constructor(t) { this.text = t; } },
    speechSynthesis: { speak: () => {}, cancel: () => {} }
  };
  sandbox.window = sandbox;
  return vm.createContext(sandbox);
}

function loadScript(ctx, filename) {
  const code = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
  vm.runInContext(code, ctx, { filename });
}

test('1. Three.js Engine and WebGL Canvas Support', () => {
  const ctx = createMockBrowser();
  loadScript(ctx, 'vendor/three.min.js');
  assert.ok(ctx.window.THREE, 'window.THREE debe estar definido');
  assert.ok(ctx.window.THREE.Scene, 'THREE.Scene debe ser una clase');
  assert.ok(ctx.window.THREE.WebGLRenderer, 'THREE.WebGLRenderer debe ser una clase');
  assert.ok(ctx.window.THREE.Group, 'THREE.Group debe ser una clase');
});

test('2. Script-3D Engine & Chibi Generator with Male Archetype', () => {
  const ctx = createMockBrowser();
  loadScript(ctx, 'vendor/three.min.js');
  loadScript(ctx, 'script-3d.js');

  assert.ok(ctx.window.CapW3, 'window.CapW3 debe estar registrado');
  const initOk = ctx.window.CapW3.init();
  assert.ok(initOk, 'CapW3.init() debe inicializar el motor');

  assert.strictEqual(typeof ctx.window.CapW3.chibi, 'function', 'CapW3.chibi debe ser una función');
  assert.strictEqual(typeof ctx.window.CapW3.capiaCfg, 'function', 'CapW3.capiaCfg debe ser una función');
  assert.strictEqual(typeof ctx.window.CapW3.sabioCfg, 'function', 'CapW3.sabioCfg debe ser una función');
  assert.strictEqual(typeof ctx.window.CapW3.avatarStage, 'function', 'CapW3.avatarStage debe ser una función');

  // Verify Capi official config
  const capiCfg = ctx.window.CapW3.capiaCfg('matemática', 'feliz');
  assert.ok(capiCfg, 'Configuración de Capi debe generarse');
  assert.strictEqual(capiCfg.expr, 'feliz', 'Expresión inicial debe ser feliz');

  // Verify Male Archetype configuration
  const maleCfg = {
    build: 'guapo',
    hair: 'hair-tupe',
    hairHex: '#1a1a1a',
    style: 'style-camiseta',
    outfitHex: '#2f6bff',
    beard: 'corta',
    beardHex: '#1a1a1a',
    acc: 'acc-gafas',
    skinHex: '#ffe3d0'
  };
  const maleModel = ctx.window.CapW3.chibi(maleCfg);
  assert.ok(maleModel, 'El modelo 3D masculino debe instanciarse');
  assert.ok(maleModel.userData, 'userData debe contener partes del avatar');
  assert.strictEqual(maleModel.userData.arms.length, 2, 'userData.arms debe contener 2 brazos');
  assert.ok(maleModel.userData.body, 'userData.body debe contener el cuerpo para rebotes');
  assert.ok(maleModel.userData.head, 'userData.head debe contener la cabeza');
});

test('3. Sabios 3D Configuration for Mentors Gallery', () => {
  const ctx = createMockBrowser();
  loadScript(ctx, 'vendor/three.min.js');
  loadScript(ctx, 'script-3d.js');
  ctx.window.CapW3.init();

  const sabioEuler = {
    name: 'Leonhard Euler',
    look: ['levita', '#3a4a8a', 'corto', '#f4efe4', null, 'gorro', 'pluma', 0],
    persona: 'sereno'
  };

  const eulerCfg = ctx.window.CapW3.sabioCfg(sabioEuler);
  assert.ok(eulerCfg.sabio, 'Debe marcarse como sabio');
  assert.strictEqual(eulerCfg.style, 'levita', 'Debe conservar la vestimenta levita');
  assert.strictEqual(eulerCfg.hat, 'gorro', 'Debe tener gorro');
  assert.strictEqual(eulerCfg.prop, 'pluma', 'Debe tener pluma de cálculo');

  const euler3D = ctx.window.CapW3.chibi(eulerCfg);
  assert.ok(euler3D, 'El modelo 3D de Euler debe crearse con éxito');
  assert.strictEqual(euler3D.userData.arms.length, 2, 'Euler debe tener brazos animados');
});

test('4. CapVictory Name Greeting & Sound Synthesis Announcement', () => {
  const ctx = createMockBrowser();
  ctx.window.CapEngine = {
    level: () => 5,
    S: { profile: { name: 'Yessi' } },
    bus: { on: () => {} }
  };
  ctx.window.CapUI = { confetti: () => {} };

  loadScript(ctx, 'capicua-victory.js');

  assert.ok(ctx.window.CapVictory, 'window.CapVictory debe registrarse');
  assert.strictEqual(typeof ctx.window.CapVictory.show, 'function', 'show debe ser una función');

  let spokenText = null;
  ctx.window.speechSynthesis.speak = (utterance) => {
    spokenText = utterance.text;
  };

  ctx.window.CapVictory.show({ xp: 50, pi: 25 });
  assert.ok(spokenText, 'La voz de Capi debe emitir el mensaje');
  assert.match(spokenText, /Yessi/, 'El mensaje debe nombrar al estudiante (Yessi)');
  assert.match(spokenText, /victoria/, 'El mensaje debe anunciar la victoria de la lección');
});

test('5. CapMaster Subsystems and Aliased Navigation Routes', () => {
  const ctx = createMockBrowser();
  ctx.window.CapUI = { views: {} };
  ctx.window.CapEngine = {
    S: { profile: { name: 'Carlos', username: 'carlos_pi' } },
    save: () => {}
  };

  loadScript(ctx, 'capicua-master.js');

  assert.ok(ctx.window.CapMaster, 'CapMaster debe estar inicializado');
  assert.ok(ctx.window.CapMaster.audio, 'CapAudio debe existir');
  assert.ok(ctx.window.CapMaster.ai, 'CapMathAI debe existir');
  assert.ok(ctx.window.CapMaster.simulacros, 'CapSimulacros debe existir');
  assert.ok(ctx.window.CapMaster.salas, 'CapSalasMultiplayer debe existir');
  assert.ok(ctx.window.CapMaster.account, 'CapAccount debe existir');
  assert.ok(ctx.window.CapMaster.chat, 'CapChat debe existir');

  // Verify registered views and aliases
  const views = ctx.window.CapUI.views;
  assert.strictEqual(views['avatares'], views['avatares-3d'], 'avatares y avatares-3d deben compartir la misma vista');
  assert.strictEqual(views['mentores'], views['mentores-3d'], 'mentores y mentores-3d deben compartir la misma vista');
  assert.strictEqual(views['enemigos'], views['enemigos-3d'], 'enemigos y enemigos-3d deben compartir la misma vista');
});
