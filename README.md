# 🪐 CAPICÚA — Plataforma Educativa Gamificada 3D con IA

Plataforma educativa tipo videojuego en 3D para aprender matemáticas, física e ingeniería desde cero: mundos interactivos, batallas conceptuales, juegos de tablas de multiplicar (1 a 1000), sudokus, duelos multijugador y la tutora inteligente **Capi**.

---

## 🏗️ 1. Arquitectura del Sistema

El proyecto opera bajo una arquitectura **Jamstack / Modular Service-Based**, desacoplada y escalable:

- **Frontend**: Single Page Application (HTML5, CSS3, JavaScript modular, Three.js v0.149, Web Audio API, Canvas 2D/3D).
- **Backend Serverless**: Netlify Functions (`/.netlify/functions/*` mapeado a `/api/*`) para:
  - `capi-ask`: Proxy seguro a Google Gemini con prompts pedagógicos colombianos.
  - `payment-checkout`: Cálculo de firmas criptográficas de integridad y sesiones de pago.
  - `payment-webhook`: Validación de webhooks de Wompi y Stripe.
- **Base de Datos & Auth**: **Supabase (PostgreSQL 15)** con:
  - Autenticación segura (JWT, Email/Password, OAuth).
  - Row Level Security (RLS) en todas las tablas.
  - Triggers para inicialización de perfiles y progreso.
  - Procedimientos almacenados (RPCs) para otorgar XP y recompensas sin riesgo de manipulación en el cliente.
- **Sincronización**: Capa *Offline-First* con `capicua-supabase.js` que sincroniza el progreso del estudiante automáticamente y mantiene caché local ante fallos de conexión.

---

## 📁 2. Estructura del Repositorio

```text
├── index.html                  # Shell principal y layout visual
├── script.js                   # Núcleo: CapEngine, CapContent, CapGen, CapUI
├── capicua-supabase.js         # Capa de Servicios: Supabase Auth, Store y Pagos
├── capicua-plus.js             # Módulo Plus: Batallas, combos, Olvidina y calidad 3D
├── capicua-members.js          # Planes de membresía, insignias y beneficios
├── capicua-final.js            # Control de navegación agrupada, voz y checkout
├── capicua-extras.js           # Temporizadores, racha, falencias, avatares y mascotas
├── capicua-simulacros.js       # Pruebas diagnósticas, quizzes y exámenes
├── capicua-victory.js          # Animaciones de confeti y celebración de victoria
├── script-extra.js             # Vistas perezosas (Historia, Juegos, Aventura, Foros)
├── script-3d.js                # Renderizador 3D y mundo Three.js
├── sw.js                       # Service Worker (PWA y caché offline)
├── netlify/
│   └── functions/
│       ├── capi-ask.js         # Endpoint serverless para Capi IA
│       ├── payment-checkout.js # Endpoint serverless para checkout y firmas
│       └── payment-webhook.js  # Endpoint serverless para confirmación de pagos
├── supabase/
│   └── migrations/
│       └── 20261113000000_capicua_core.sql # Schema maestro PostgreSQL y RLS
├── test/
│   ├── engine.test.js          # Pruebas unitarias matemáticas y de progreso
│   └── serverless.test.js      # Pruebas de integración serverless
├── marca/                      # Iconos PWA y logotipos oficiales
├── vendor/                     # Three.js minificado
├── netlify.toml                # Configuración de despliegue y seguridad
├── package.json                # Scripts y dependencias de testing
├── .env.example                # Plantilla de variables de entorno
└── .gitignore                  # Exclusiones de seguridad
```

---

## 🚀 3. Instalación y Ejecución en Local

### Prerrequisitos:
- Node.js 18 o superior.

### Pasos:
1. Clona o descarga el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/capicua.git
   cd capicua
   ```
2. Instala dependencias y prepara el entorno:
   ```bash
   npm install
   ```
3. Ejecuta la suite de pruebas automatizadas:
   ```bash
   npm test
   ```
4. Sirve los archivos estáticos en tu navegador:
   - Puedes usar `npx serve .`, la extensión Live Server de VS Code, o abrir directamente `index.html`.

---

## 🗄️ 4. Configuración de Supabase (Base de Datos & Auth)

1. Crea un proyecto gratuito en [Supabase](https://supabase.com).
2. Ve a **SQL Editor** en tu panel de Supabase.
3. Copia el contenido del archivo `supabase/migrations/20261113000000_capicua_core.sql` y ejecútalo.
4. Obtén tu **Project URL** y tu **anon public key** en `Settings -> API`.
5. En `index.html` (o mediante variable en producción), configura:
   ```html
   <script>
     window.CAPICUA_SUPABASE_URL = "https://tu-proyecto.supabase.co";
     window.CAPICUA_SUPABASE_ANON_KEY = "tu-anon-key";
   </script>
   ```

---

## 🤖 5. Configuración de Capi IA (Google Gemini)

1. Obtén una clave de API gratuita en [Google AI Studio](https://aistudio.google.com/).
2. En tu panel de Netlify (o archivo `.env` local para Netlify CLI), agrega:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```
3. Capi responderá automáticamente con Gemini 1.5 Flash aplicando las directrices pedagógicas colombianas, explicaciones paso a paso y análisis de falencias.

---

## 💳 6. Configuración de Pagos (Wompi y Stripe)

Para habilitar pagos reales:
1. Regístrate en [Wompi Colombia](https://comercios.wompi.co/) para recibir pagos por **Nequi, Bancolombia, PSE y Tarjetas**.
2. Configura las variables en Netlify:
   - `WOMPI_PUBLIC_KEY`: Llave pública del comercio.
   - `WOMPI_INTEGRITY_SECRET`: Secreto de integridad (para validar el monto y referencia antes de pagar).
   - `WOMPI_EVENTS_SECRET`: Secreto de eventos para verificar webhooks.
3. Configura la URL del webhook en Wompi apuntando a:
   `https://tu-sitio.netlify.app/api/payment-webhook`

---

## 🧪 7. Pruebas Automatizadas

El proyecto incluye pruebas automatizadas para garantizar la estabilidad técnica:
```bash
npm test
```
Las pruebas cubren:
- Fórmulas de XP, cálculo de niveles y mecánicas de rachas con escudos.
- Verificación matemática de respuestas y geometría (Pitágoras, fracciones).
- Respuestas pedagógicas de Capi IA sin errores de sintaxis.
- Generación de referencias y firmas criptográficas de checkout.
- Procesamiento de eventos en el webhook de pagos.

---

## 🚢 8. Despliegue en Netlify

1. Sube el código a un repositorio en **GitHub**.
2. Conecta el repositorio en [Netlify](https://app.netlify.com).
3. Netlify detectará automáticamente el archivo `netlify.toml`:
   - Directorio de publicación: `.` (raíz).
   - Directorio de funciones: `netlify/functions`.
4. En **Site configuration -> Environment variables**, agrega:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `WOMPI_INTEGRITY_SECRET` (opcional para pagos reales en Colombia).
5. Haz clic en **Deploy site**. ¡Tu plataforma estará en línea con HTTPS, funciones serverless y base de datos relacional activa!
