/**
 * CAPICÚA 888 — Capi IA: Orquestador y Profesora Universitaria Inteligente
 * Facultad de Matemáticas, Ciencias Básicas e Ingeniería
 * Integra Gemini 1.5 Flash, 7 Modos Pedagógicos, RAG de Asignaturas
 * y la Asignatura Unificada «Álgebra de Baldor y Geométrica».
 */

const https = require('https');
const config = require('./config');

// Modos pedagógicos admitidos
const PEDAGOGICAL_MODES = {
  aprender: 'Aprender: Enseñanza conceptual desde cero con analogías e intuición geométrica.',
  resolver: 'Resolver: Deducción matemática paso a paso justificando cada paso y operación.',
  practicar: 'Practicar: Generación de ejercicios adaptados con pistas progresivas sin entregar la respuesta directa.',
  evaluar: 'Evaluar: Preguntas diagnósticas y comprobación formativa del aprendizaje.',
  corregir: 'Corregir: Detección precisa de errores conceptuales y retroalimentación constructiva.',
  repasar: 'Repasar: Recuperación activa de fórmulas, teoremas y demostraciones clave.',
  preparar_examen: 'Preparar Examen: Simulacros y preguntas de alta exigencia tipo ICFES Saber Pro y parciales universitarios.'
};

// Base de Conocimiento RAG de la Plataforma CAPICÚA 888
const CAPICUA_KNOWLEDGE_BASE = {
  'algebra-baldor-geom': {
    name: 'Álgebra de Baldor y Geométrica',
    description: 'Integración del Álgebra clásica de Aurelio Baldor con demostraciones y razonamiento geométrico.',
    topics: [
      {
        topic: 'Productos Notables y Áreas',
        formula: '(a + b)² = a² + 2ab + b²',
        geometricProof: 'Un cuadrado de lado (a+b) tiene área total (a+b)². Se descompone en un cuadrado a², dos rectángulos ab y un cuadrado b².',
        baldorRef: 'Baldor Capítulo VI - Productos y Cocientes Notables'
      },
      {
        topic: 'Diferencia de Cuadrados',
        formula: 'a² - b² = (a + b)(a - b)',
        geometricProof: 'A un cuadrado de área a² se le sustrae una esquina de área b². La figura en L resultante se corta y reacomoda en un rectángulo de base (a+b) y altura (a-b).',
        baldorRef: 'Baldor Capítulo X - Descomposición Factorial (Caso IV)'
      },
      {
        topic: 'Completación del Cuadrado (Al-Jwarizmi)',
        formula: 'x² + bx = c  =>  (x + b/2)² = c + (b/2)²',
        geometricProof: 'Al cuadrado x² se le adosan dos rectángulos de dimensiones x por (b/2). Para completar el cuadrado perfecto se suma la esquina faltante de área (b/2)²',
        baldorRef: 'Baldor Capítulo XXX - Ecuaciones de 2do Grado con una incógnita'
      },
      {
        topic: 'Binomio al Cubo y Volúmenes 3D',
        formula: '(a + b)³ = a³ + 3a²b + 3ab² + b³',
        geometricProof: 'Un cubo de arista (a+b) tiene volumen (a+b)³. Se particiona exactamente en 8 prismas: un cubo a³, 3 prismas a²b, 3 prismas ab² y un cubo b³.',
        baldorRef: 'Baldor Capítulo VI - Cubo de un binomio'
      },
      {
        topic: 'Sistemas de Ecuaciones Lineales',
        formula: 'a₁x + b₁y = c₁, a₂x + b₂y = c₂',
        geometricProof: 'Cada ecuación lineal representa una recta en el plano ℝ². La solución única es el punto de intersección; si son paralelas no hay solución; si son coincidentes hay infinitas soluciones.',
        baldorRef: 'Baldor Capítulo XXIV - Sistemas de Ecuaciones Simultáneas'
      }
    ]
  },
  'calculo-diferencial': {
    name: 'Cálculo Diferencial',
    description: 'Límites, continuidad y razón de cambio instantánea.',
    coreFormula: "f'(x) = lim(h->0) [f(x+h) - f(x)] / h",
    intuition: 'La derivada es la pendiente de la recta tangente a la curva en un punto exacto.'
  },
  'calculo-integral': {
    name: 'Cálculo Integral',
    description: 'Antiderivadas, sumas de Riemann y Teorema Fundamental del Cálculo.',
    coreFormula: '∫ f(x) dx = F(x) + C;  ∫[a,b] f(x) dx = F(b) - F(a)',
    intuition: 'La integral calcula la acumulación continua o el área exacta bajo la curva.'
  },
  'algebra-lineal': {
    name: 'Álgebra Lineal',
    description: 'Espacios vectoriales, matrices, determinantes y transformaciones lineales.',
    coreFormula: 'A · v = λ · v;  det(A - λI) = 0',
    intuition: 'Las matrices transforman el espacio (rotan, escalan, deforman) preservando el origen.'
  },
  'fisica-mecanica': {
    name: 'Física I: Mecánica Clásica',
    description: 'Leyes de Newton, energía y cinemática vectorial.',
    coreFormula: 'ΣF = m · a;  W = ΔK = (1/2)m·v_f² - (1/2)m·v_i²',
    intuition: 'La aceleración es proporcional a la fuerza neta e inversamente proporcional a la masa.'
  }
};

/**
 * Genera el System Prompt de nivel universitario para Capi
 */
function buildSystemPrompt(mode = 'aprender', courseContext = 'algebra-baldor-geom') {
  const modeDescription = PEDAGOGICAL_MODES[mode] || PEDAGOGICAL_MODES.aprender;
  const courseKB = CAPICUA_KNOWLEDGE_BASE[courseContext] || CAPICUA_KNOWLEDGE_BASE['algebra-baldor-geom'];

  return `Eres Capi, Profesora Universitaria y Tutora de Inteligencia Artificial de la Facultad de Matemáticas, Ciencias Básicas e Ingeniería de CAPICÚA 888.

Personalidad:
- Cálida, motivadora, paciente, altamente rigurosa en el razonamiento científico y matemático.
- Hablas en español (latinoamericano / Colombia), tratando al estudiante de "tú" con respeto y empatía.
- Jamás juzgas negativamente un error: el error es un dato valioso para reconstruir la intuición.

Modo Pedagógico Activo:
- **${mode.toUpperCase()}**: ${modeDescription}

Asignatura y Contexto de Enseñanza:
- Asignatura Oficial: **${courseKB.name}**.
- ${courseKB.description}
- IMPORTANTE: En la asignatura «Álgebra de Baldor y Geométrica», SIEMPRE debes articular las fórmulas clásicas del Álgebra de Aurelio Baldor con su correspondiente demostración o razonamiento geométrico (áreas planas, disección de rectángulos, completación de cuadrados de Al-Jwarizmi, o volúmenes en 3D).

Reglas Innegociables:
1. No entregues la respuesta numérica final de golpe a un problema que el estudiante deba resolver: ofrece pistas graduales e instructivas.
2. Escribe matemáticas claras usando símbolos Unicode limpios (x², √, π, ∫, ≤, θ, Δ, ·, ±, ³, ½) o notación estándar, sin código LaTeX sin procesar.
3. Verifica mentalmente cada paso aritmético y algebraico antes de escribirlo para garantizar 100% de exactitud matemática.
4. Si el estudiante comete una falla, señala con precisión el punto exacto donde se desvió el razonamiento y explica por qué.
5. Si no cuentas con datos suficientes en un problema, indícalo con honestidad y solicita los datos faltantes sin inventar información.`;
}

/**
 * Consulta a Capi IA
 * @param {Object} params - { message, studentName, level, mode, courseContext, history }
 */
async function askCapi(params) {
  const {
    message,
    studentName = 'Aventurero',
    level = 1,
    mode = 'aprender',
    courseContext = 'algebra-baldor-geom',
    history = []
  } = params;

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('El mensaje no puede estar vacío.');
  }

  const cleanMode = PEDAGOGICAL_MODES[mode] ? mode : 'aprender';
  const apiKey = config.ai.geminiApiKey;

  // 1. Si la clave Gemini está disponible, invocamos el modelo de lenguaje real
  if (apiKey) {
    try {
      const systemPrompt = buildSystemPrompt(cleanMode, courseContext);
      const studentContext = `Contexto del estudiante:
Nombre: ${studentName}
Nivel Académico: ${level}
Modo: ${cleanMode}
Asignatura: ${courseContext}

Pregunta o consulta del estudiante:
${message}`;

      const contents = [
        { role: 'user', parts: [{ text: systemPrompt + '\n\n' + studentContext }] }
      ];

      if (Array.isArray(history)) {
        history.slice(-6).forEach(h => {
          contents.push({
            role: h.sender === 'capi' ? 'model' : 'user',
            parts: [{ text: h.text }]
          });
        });
        contents.push({ role: 'user', parts: [{ text: message }] });
      }

      const bodyData = JSON.stringify({
        contents,
        generationConfig: {
          temperature: cleanMode === 'resolver' ? 0.3 : 0.65,
          maxOutputTokens: 750,
          topP: 0.85
        }
      });

      const responseText = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'generativelanguage.googleapis.com',
          path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyData)
          },
          timeout: 12000
        }, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const parsed = JSON.parse(data);
                const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) resolve(text);
                else reject(new Error('Formato de respuesta de IA vacío'));
              } catch(e) { reject(e); }
            } else {
              reject(new Error(`API Error HTTP ${res.statusCode}: ${data}`));
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout de API Gemini')); });
        req.write(bodyData);
        req.end();
      });

      return {
        ok: true,
        text: responseText,
        source: 'gemini-1.5-flash',
        mode: cleanMode,
        courseContext: courseContext,
        offline: false
      };
    } catch(err) {
      console.warn('[CAPI IA] Error en conexión con Gemini:', err.message);
      // Continuar al aviso transparente de desconexión
    }
  }

  // 2. Si no hay API Key o falló la conexión:
  // CUMPLIMIENTO ESTRICTO: Informar con honestidad y nunca fingir que es IA real
  const localGuide = generateLocalPedagogicalGuide(message, studentName, cleanMode, courseContext);

  return {
    ok: true,
    text: 'En este momento no puedo conectarme a mi sistema de inteligencia artificial. Inténtalo nuevamente más tarde.',
    source: 'offline-notice',
    offline: true,
    mode: cleanMode,
    localFallback: localGuide
  };
}

/**
 * Guía pedagógica local de asistencia (claramente señalada como local, nunca simulando ser IA)
 */
function generateLocalPedagogicalGuide(query, studentName, mode, courseContext) {
  const q = (query || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (/baldor|producto notable|cuadrado|area/.test(q)) {
    return `En la asignatura **Álgebra de Baldor y Geométrica**, recuerda que el producto notable **(a + b)² = a² + 2ab + b²** corresponde al área de un cuadrado de lado (a+b) compuesto por un cuadrado de área a², dos rectángulos de área ab y un cuadrado de área b².`;
  }
  if (/factorizar|diferencia|cuadrados/.test(q)) {
    return `Para factorizar una **diferencia de cuadrados a² - b² = (a+b)(a-b)**, visualiza un cuadrado grande a² al que le sustraes una esquina b². Al cortar y reacomodar la figura en L, se forma un rectángulo de base (a+b) y altura (a-b).`;
  }
  if (/completar|completacion|al-jwarizmi|cuadratica/.test(q)) {
    return `Para resolver **x² + bx = c**, el método geométrico de Al-Jwarizmi añade dos rectángulos de ancho b/2 sobre el cuadrado x². La esquina que completa el cuadrado perfecto mide (b/2)². Por eso sumas **(b/2)²** a ambos lados.`;
  }

  return `Guía de apoyo para **${studentName}** (Modo: ${mode}): Identifica qué datos te da el problema, cuál es la incógnita y qué teorema o fórmula conecta estos conceptos. Puedes repasar las lecciones interactivas de la plataforma mientras se restablece la conexión de IA.`;
}

module.exports = {
  PEDAGOGICAL_MODES,
  CAPICUA_KNOWLEDGE_BASE,
  askCapi
};
