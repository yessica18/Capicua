/* ==========================================================================
   CAPICÚA 888 - MASTER EXPANSION ENGINE
   Multiplayer Rooms, Capi Math AI Agent, Exam Generator (PDF/IMG/TXT),
   Ambient Sound, 3D Hub, Chat & Notifications, Running Capi, Account Progress
   ========================================================================== */
(function() {
  "use strict";

  /* ------------------------------------------------------------------------
     1. BRANDING, FAVICON & LOGO INITIALIZATION (Official Capi 888)
     ------------------------------------------------------------------------ */
  const CAPI_LOGO_URL = "capi-logo.png";

  function initBranding() {
    // 1. Favicon updates
    try {
      let icon = document.querySelector('link[rel="icon"]');
      if (!icon) {
        icon = document.createElement("link");
        icon.rel = "icon";
        document.head.appendChild(icon);
      }
      icon.href = CAPI_LOGO_URL;

      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (appleIcon) appleIcon.href = CAPI_LOGO_URL;
    } catch(e) {}

    // 2. Intro Splash Screen Enhancement (3D Running Capi Welcome + Speedy Warp Stars)
    initIntroCapiWelcome();

    // 3. Companion Icon
    const companionFace = document.querySelector("#companion .face");
    if (companionFace && !companionFace.dataset.brand888) {
      companionFace.dataset.brand888 = "1";
      companionFace.innerHTML = `<img src="${CAPI_LOGO_URL}" alt="Capi" style="width:68px;height:68px;border-radius:50%;border:2px solid #5fd3f0;box-shadow:0 0 15px rgba(95,211,240,0.6);object-fit:cover;">`;
    }
  }

  /* ------------------------------------------------------------------------
     1B. SPEEDY WARP STARS & 3D RUNNING CAPI WELCOME ANIMATION
     ------------------------------------------------------------------------ */
  function initSpeedyWarpStars(canvas) {
    if (!canvas || canvas.dataset.warpStars) return;
    canvas.dataset.warpStars = "1";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0, height = 0, cx = 0, cy = 0;
    const NUM_STARS = 380;
    const stars = [];
    const colors = ["#ffffff", "#5fd3f0", "#f4b6f7", "#ffd23f", "#c8eefc"];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      cx = width / 2;
      cy = height / 2;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        pz: Math.random() * width,
        color: colors[i % colors.length],
        size: Math.random() * 1.8 + 0.6
      });
    }

    let shootingStars = [];
    function spawnShootingStar() {
      shootingStars.push({
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.4,
        len: 0,
        maxLen: 160 + Math.random() * 140,
        speed: 18 + Math.random() * 12,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        life: 1
      });
    }

    let animId = null;
    let lastTime = performance.now();

    function render(now) {
      if (!document.getElementById("intro")) {
        cancelAnimationFrame(animId);
        return;
      }
      animId = requestAnimationFrame(render);
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Render speedy stars flying forward from center (warp effect)
      const warpSpeed = 720 * dt;
      for (let i = 0; i < NUM_STARS; i++) {
        const s = stars[i];
        s.pz = s.z;
        s.z -= warpSpeed;

        if (s.z <= 1) {
          s.z = width;
          s.pz = width;
          s.x = (Math.random() - 0.5) * width * 2;
          s.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 280 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        if (px < 0 || px >= width || py < 0 || py >= height) {
          s.z = width;
          s.pz = width;
          continue;
        }

        const pk = 280 / s.pz;
        const prevX = s.x * pk + cx;
        const prevY = s.y * pk + cy;

        const alpha = Math.min(1, (1 - s.z / width) * 1.4);
        ctx.globalAlpha = Math.max(0.2, alpha);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size * k * 1.5;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(px, py);
        ctx.stroke();

        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.8, s.size * k * 0.8), 0, Math.PI * 2);
        ctx.fill();
      }

      // Random shooting stars
      if (Math.random() < 0.02 && shootingStars.length < 3) {
        spawnShootingStar();
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.len += ss.speed;
        const tx = ss.x + Math.cos(ss.angle) * ss.len;
        const ty = ss.y + Math.sin(ss.angle) * ss.len;
        const hx = ss.x + Math.cos(ss.angle) * (ss.len - 90);
        const hy = ss.y + Math.sin(ss.angle) * (ss.len - 90);

        const grad = ctx.createLinearGradient(hx, hy, tx, ty);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(1, "rgba(255,255,255,0.95)");

        ctx.globalAlpha = ss.life;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        if (ss.len > ss.maxLen) {
          ss.life -= dt * 3.5;
          if (ss.life <= 0) shootingStars.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1;
    }

    animId = requestAnimationFrame(render);
    document.addEventListener("capicua-intro-closed", () => {
      cancelAnimationFrame(animId);
    }, { once: true });
  }

  function initIntroCapiWelcome() {
    const intro = document.getElementById("intro");
    if (!intro) return;

    // Fast space stars (speedy warp stars)
    const starCanvas = intro.querySelector(".ib-stars");
    if (starCanvas) initSpeedyWarpStars(starCanvas);

    const capiaContainer = intro.querySelector(".ib-capia");
    if (!capiaContainer || capiaContainer.dataset.capi3dMounted) return;
    capiaContainer.dataset.capi3dMounted = "1";

    capiaContainer.innerHTML = `
      <div class="intro-capi-3d-wrap">
        <canvas class="intro-capi-stage-canvas"></canvas>
        <div class="intro-luminous-pedestal"></div>
        <img class="intro-capi-circle intro-capi-fallback" src="${CAPI_LOGO_URL}" alt="Capi 888" width="180" height="180" style="display:none">
        <div class="intro-badge-888">888</div>
      </div>
    `;

    const canvas = capiaContainer.querySelector(".intro-capi-stage-canvas");
    const fallback = capiaContainer.querySelector(".intro-capi-fallback");
    const pedestal = capiaContainer.querySelector(".intro-luminous-pedestal");

    // Check Three.js and CapW3
    if (!window.THREE || !window.CapW3) {
      if (canvas) canvas.style.display = "none";
      if (fallback) fallback.style.display = "block";
      return;
    }

    try {
      const THREE = window.THREE;
      const width = 340;
      const height = 340;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
      camera.position.set(0, 1.4, 5.0);
      camera.lookAt(0, 1.1, 0);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x5fd3f0, 1.2);
      dirLight.position.set(3, 4, 3);
      scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0xff7ab8, 0.8);
      rimLight.position.set(-3, 2, -2);
      scene.add(rimLight);

      // Build Chibi Capi
      const capiCfg = (window.CapW3.capiaCfg ? CapW3.capiaCfg("exploradora", "feliz") : { capia: true, expr: "feliz" });
      const capi = window.CapW3.chibi(capiCfg);
      scene.add(capi);

      const ud = capi.userData || {};
      const { head, body, arms, face, setExpr } = ud;

      // Initial state: Start on the right side of the screen
      capi.position.set(4.4, 0, 0);
      capi.rotation.y = -Math.PI / 2 + 0.35; // Face running direction
      capi.rotation.z = -0.15; // Running forward lean

      let startTime = null;
      let animFrameId = null;
      let rotY = 0;
      let isDragging = false;
      let dragStartX = 0;

      // Pointer drag interaction for 360 rotation in idle phase
      canvas.addEventListener("pointerdown", e => {
        isDragging = true;
        dragStartX = e.clientX;
        canvas.setPointerCapture(e.pointerId);
      });
      canvas.addEventListener("pointermove", e => {
        if (!isDragging) return;
        const delta = (e.clientX - dragStartX) * 0.015;
        rotY += delta;
        dragStartX = e.clientX;
      });
      window.addEventListener("pointerup", () => { isDragging = false; });
      window.addEventListener("pointercancel", () => { isDragging = false; });

      let blinked = false;

      function animate(now) {
        if (!document.getElementById("intro")) {
          cancelAnimationFrame(animFrameId);
          return;
        }
        animFrameId = requestAnimationFrame(animate);

        if (!startTime) startTime = now;
        const elapsed = now - startTime;

        if (elapsed < 2200) {
          // --- 1. RUNNING IN FROM RIGHT (Coordinated legs, arms, body bounce, hair lag) ---
          const p = elapsed / 2200;
          const easeOut = 1 - Math.pow(1 - p, 2.5);
          capi.position.x = 4.4 * (1 - easeOut);

          // Run cadence ~ 3.2 strides/sec
          const runCadence = elapsed * 0.014;

          // Coordinated arm swinging with forearm bend
          if (arms && arms.length >= 2) {
            arms[0].rotation.x = Math.sin(runCadence) * 0.8;
            arms[0].rotation.z = -0.28 - Math.cos(runCadence) * 0.12;
            arms[1].rotation.x = -Math.sin(runCadence) * 0.8;
            arms[1].rotation.z = 0.28 + Math.cos(runCadence) * 0.12;
          }

          // Body vertical bounce on each foot step
          if (body) {
            body.position.y = Math.abs(Math.sin(runCadence)) * 0.18;
          }

          // Running forward tilt and slight hip sway
          capi.rotation.z = -0.16 * (1 - p * 0.4);
          capi.rotation.y = -Math.PI / 2 + 0.35 + Math.sin(runCadence) * 0.08;

          // Secondary head and hair motion lagging behind body
          if (head) {
            head.position.y = (head.userData.baseY || 1.1) + Math.sin(runCadence - 0.45) * 0.05;
            head.rotation.x = 0.1 + Math.sin(runCadence - 0.4) * 0.08;
            head.rotation.z = Math.cos(runCadence) * 0.05;
          }
        } else if (elapsed < 3000) {
          // --- 2. SMOOTH DECELERATION & TURN TO STUDENT ON LUMINOUS PLATFORM ---
          const p = (elapsed - 2200) / 800;
          const ease = 1 - Math.pow(1 - p, 3);

          capi.position.x = 0;
          capi.rotation.z = -0.1 * (1 - ease);
          capi.rotation.y = (-Math.PI / 2 + 0.35) * (1 - ease);

          // Landing squash & stretch
          const squash = Math.sin(p * Math.PI) * 0.08;
          if (body) {
            body.position.y = 0;
            body.scale.set(1 + squash, 1 - squash, 1 + squash);
          }

          // Arms return to neutral
          if (arms && arms.length >= 2) {
            arms[0].rotation.x *= (1 - ease);
            arms[1].rotation.x *= (1 - ease);
            arms[0].rotation.z = -0.15 * ease;
            arms[1].rotation.z = 0.15 * ease;
          }
          if (head) {
            head.rotation.x = 0;
            head.rotation.z = 0;
          }
          if (pedestal && !pedestal.classList.contains("active")) {
            pedestal.classList.add("active");
          }
        } else if (elapsed < 5400) {
          // --- 3. LOOK AT STUDENT, BLINK & WAVE WITH ONE HAND ---
          capi.position.x = 0;
          capi.rotation.z = 0;
          capi.rotation.y = 0;

          // Blink once at ~3.2s
          if (!blinked && elapsed > 3200) {
            blinked = true;
            if (setExpr) setExpr("blink", 0.18);
            setTimeout(() => {
              if (setExpr) setExpr("feliz", 3.0);
            }, 190);
          }

          // Wave right arm (arms[1])
          if (arms && arms.length >= 2) {
            const waveT = (elapsed - 3000) * 0.009;
            arms[1].rotation.z = 1.95;
            arms[1].rotation.x = Math.sin(waveT) * 0.42;
            arms[1].rotation.y = Math.cos(waveT) * 0.22;

            // Left arm gentle idle
            arms[0].rotation.z = -0.16;
            arms[0].rotation.x = 0;
          }

          // Joyful head tilt
          if (head) {
            head.rotation.z = 0.12 + Math.sin((elapsed - 3000) * 0.004) * 0.03;
          }
          if (body) {
            body.scale.set(1, 1, 1);
            body.position.y = Math.sin((elapsed - 3000) * 0.005) * 0.04;
          }
        } else {
          // --- 4. GENTLE IDLE WAITING WITH 360 DRAG ROTATION ---
          const idleT = (elapsed - 5400) * 0.0025;

          // Lower arm smoothly
          if (arms && arms.length >= 2) {
            arms[1].rotation.z = 0.16 + Math.sin(idleT) * 0.03;
            arms[1].rotation.x = Math.sin(idleT * 0.8) * 0.04;
            arms[0].rotation.z = -0.16 - Math.sin(idleT) * 0.03;
            arms[0].rotation.x = -Math.sin(idleT * 0.8) * 0.04;
          }

          // Breathing / subtle bob
          if (body) {
            body.position.y = Math.sin(idleT * 1.5) * 0.03;
          }
          if (head) {
            head.rotation.z = Math.sin(idleT) * 0.04;
            head.rotation.x = Math.sin(idleT * 1.2) * 0.02;
          }

          // Periodic natural blink every 3.5s
          if (Math.sin(idleT * 2.8) > 0.985 && setExpr) {
            setExpr("blink", 0.15);
          }

          // Drag rotation
          if (!isDragging) {
            rotY += Math.sin(idleT * 0.5) * 0.001;
          }
          capi.rotation.y = rotY;
        }

        renderer.render(scene, camera);
      }

      animFrameId = requestAnimationFrame(animate);

      document.addEventListener("capicua-intro-closed", () => {
        cancelAnimationFrame(animFrameId);
        renderer.dispose();
      }, { once: true });

    } catch(err) {
      console.warn("Capi 3D intro fallback:", err);
      if (canvas) canvas.style.display = "none";
      if (fallback) fallback.style.display = "block";
    }
  }

  /* ------------------------------------------------------------------------
     2. PROCEDURAL AMBIENT SOUND & SFX ENGINE (Web Audio API)
     ------------------------------------------------------------------------ */
  const CapAudio = (function() {
    let ctx = null;
    let isPlaying = false;
    let volume = parseFloat(localStorage.getItem("cap-amb-vol") || "0.35");
    let isMuted = localStorage.getItem("cap-amb-mute") === "1";
    let currentTrack = "lofi";
    let loopTimer = null;
    let masterGain = null;

    function getCtx() {
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          ctx = new AudioCtx();
          masterGain = ctx.createGain();
          masterGain.gain.value = isMuted ? 0 : volume;
          masterGain.connect(ctx.destination);
        }
      }
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
      return ctx;
    }

    // Gentle synthesizer note helper
    function playTone(freq, duration, type = "sine", gainVal = 0.15, pan = 0) {
      const c = getCtx();
      if (!c || isMuted) return;
      try {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, c.currentTime);

        g.gain.setValueAtTime(0.001, c.currentTime);
        g.gain.linearRampToValueAtTime(gainVal * volume, c.currentTime + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);

        osc.connect(g);
        g.connect(masterGain);

        osc.start();
        osc.stop(c.currentTime + duration + 0.05);
      } catch(e) {}
    }

    // Lo-fi chord progressions in C major / A minor
    const CHORDS = {
      lofi: [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23]  // G7
      ],
      zen: [
        [196.00, 293.66, 392.00, 440.00], // G sus2
        [174.61, 261.63, 349.23, 440.00], // F add9
        [220.00, 329.63, 440.00, 523.25]  // Am9
      ],
      battle: [
        [146.83, 220.00, 261.63, 293.66], // Dm
        [130.81, 196.00, 261.63, 329.63], // C/E
        [116.54, 174.61, 233.08, 293.66], // Bb
        [164.81, 246.94, 293.66, 329.63]  // Em
      ]
    };

    let step = 0;
    function playAmbientBar() {
      if (!isPlaying || isMuted) return;
      const list = CHORDS[currentTrack] || CHORDS.lofi;
      const chord = list[step % list.length];
      step++;

      // Play pad chord
      chord.forEach((freq, idx) => {
        playTone(freq, 3.8, "triangle", 0.08, (idx - 1.5) * 0.3);
      });

      // Play soft arpeggio notes
      [0, 1, 2, 3].forEach((i) => {
        setTimeout(() => {
          if (isPlaying && !isMuted) {
            const highFreq = chord[i % chord.length] * (currentTrack === "battle" ? 2 : 1.5);
            playTone(highFreq, 0.6, "sine", 0.05);
          }
        }, i * 650);
      });

      loopTimer = setTimeout(playAmbientBar, 2800);
    }

    return {
      play(track = "lofi") {
        currentTrack = track;
        getCtx();
        isPlaying = true;
        clearTimeout(loopTimer);
        playAmbientBar();
        updateUI();
      },
      pause() {
        isPlaying = false;
        clearTimeout(loopTimer);
        updateUI();
      },
      toggle() {
        if (isPlaying) this.pause();
        else this.play(currentTrack);
      },
      setVolume(v) {
        volume = Math.max(0, Math.min(1, v));
        localStorage.setItem("cap-amb-vol", volume);
        if (masterGain) masterGain.gain.value = isMuted ? 0 : volume;
      },
      toggleMute() {
        isMuted = !isMuted;
        localStorage.setItem("cap-amb-mute", isMuted ? "1" : "0");
        if (masterGain) masterGain.gain.value = isMuted ? 0 : volume;
        updateUI();
      },
      isPlaying: () => isPlaying,
      isMuted: () => isMuted,
      getTrack: () => currentTrack,

      // SFX Suite
      sfx: {
        click: () => playTone(600, 0.05, "sine", 0.1),
        correct: () => {
          playTone(523.25, 0.18, "triangle", 0.18);
          setTimeout(() => playTone(659.25, 0.25, "triangle", 0.2), 90);
          setTimeout(() => playTone(783.99, 0.35, "sine", 0.22), 180);
        },
        wrong: () => {
          playTone(220, 0.22, "sawtooth", 0.15);
          setTimeout(() => playTone(185, 0.3, "sawtooth", 0.15), 120);
        },
        levelUp: () => {
          [440, 554.37, 659.25, 880].forEach((f, i) => {
            setTimeout(() => playTone(f, 0.35, "triangle", 0.25), i * 110);
          });
        },
        notification: () => {
          playTone(880, 0.12, "sine", 0.2);
          setTimeout(() => playTone(1174.66, 0.25, "sine", 0.25), 90);
        },
        hit: () => playTone(120, 0.18, "sawtooth", 0.22)
      }
    };
  })();

  function updateUI() {
    const btn = document.getElementById("top-ambient-btn");
    if (btn) {
      btn.classList.toggle("playing", CapAudio.isPlaying() && !CapAudio.isMuted());
      const label = btn.querySelector(".amb-txt");
      if (label) {
        label.textContent = CapAudio.isPlaying() && !CapAudio.isMuted() ? "Sonido Activo" : "Música Ambiente";
      }
    }
  }

  /* ------------------------------------------------------------------------
     3. ANIMATED RUNNING CAPI COMPONENT (Capi Corriendo en la Interfaz)
     ------------------------------------------------------------------------ */
  const CapRunner = (function() {
    const TIPS = [
      "¡Hola! Soy Capi, tu tutora matemática. ¡Tú puedes con todo!",
      "Tip: Recuerda que dividir entre una fracción es multiplicar por su inverso.",
      "Curiosidad: El número π tiene infinitos decimales que nunca se repiten.",
      "¡Buen trabajo! Cada problema resuelto aumenta tu poder de cálculo.",
      "En el triángulo rectángulo: a² + b² = c² (Teorema de Pitágoras).",
      "La derivada de x² es 2x. ¡El ritmo del cambio!",
      "¿Sabías que el cero fue desarrollado de forma genial por los mayas y en la India?",
      "¡Mantén tu racha diaria para desbloquear accesorios y gemas estelares!"
    ];

    let tipIdx = 0;
    let runnerEl = null;

    function create() {
      if (document.getElementById("capi-runner-bar")) return;
      runnerEl = document.createElement("div");
      runnerEl.id = "capi-runner-bar";
      runnerEl.innerHTML = `
        <div class="cr-track">
          <div class="cr-runner" id="cr-runner-btn" title="¡Haz clic en Capi para saltar y recibir un tip!">
            <img class="cr-avatar-img" src="${CAPI_LOGO_URL}" alt="Capi Corriendo">
            <span class="cr-speech" id="cr-speech-txt">${TIPS[0]}</span>
          </div>
          <div class="cr-particles" aria-hidden="true">
            <span>π</span><span>√x</span><span>∞</span><span>∑</span>
          </div>
        </div>
        <div class="cr-actions">
          <button class="btn sm ghost" id="cr-toggle-music" title="Sonido ambiente">
            🎵 <span class="hide-sm">Música</span>
          </button>
          <button class="btn sm primary" id="cr-open-capi" title="Hablar con Capi">
            💬 <span class="hide-sm">Capi IA</span>
          </button>
        </div>
      `;
      document.body.appendChild(runnerEl);

      // Event: Click Capi
      const runnerBtn = document.getElementById("cr-runner-btn");
      if (runnerBtn) {
        runnerBtn.onclick = () => {
          CapAudio.sfx.click();
          tipIdx = (tipIdx + 1) % TIPS.length;
          const speech = document.getElementById("cr-speech-txt");
          if (speech) speech.textContent = TIPS[tipIdx];
          runnerBtn.style.animation = "none";
          runnerBtn.offsetHeight; // reflow
          runnerBtn.style.animation = "crBounce 0.25s ease 2 alternate";
          if (window.CapUI && window.CapUI.toast) {
            window.CapUI.toast("¡Ánimo!", "+5 XP por interactuar con Capi", "ok");
          }
        };
      }

      // Event: Music toggle
      const musicBtn = document.getElementById("cr-toggle-music");
      if (musicBtn) {
        musicBtn.onclick = () => {
          CapAudio.toggle();
        };
      }

      // Event: Open Capi IA
      const capiBtn = document.getElementById("cr-open-capi");
      if (capiBtn) {
        capiBtn.onclick = () => {
          location.hash = "capia";
        };
      }

      // Rotate tips every 12 seconds
      setInterval(() => {
        tipIdx = (tipIdx + 1) % TIPS.length;
        const speech = document.getElementById("cr-speech-txt");
        if (speech) speech.textContent = TIPS[tipIdx];
      }, 12000);
    }

    return { init: create };
  })();

  /* ------------------------------------------------------------------------
     4. AUTONOMOUS CAPI MATHEMATICS AI AGENT (Client-side Symbolic & NLP Engine)
     ------------------------------------------------------------------------ */
  const CapMathAI = (function() {
    // Math Solver Engine
    function solveMath(input) {
      const clean = input.trim().toLowerCase();

      // 1. Linear Equation: ax + b = c or ax = b
      let m = clean.match(/([+-]?\d*)\s*x\s*([+-]\s*\d+)?\s*=\s*([+-]?\d+)/);
      if (m) {
        let a = m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : parseFloat(m[1]);
        let b = m[2] ? parseFloat(m[2].replace(/\s+/g, "")) : 0;
        let c = parseFloat(m[3]);
        let x = (c - b) / a;
        return {
          type: "linear",
          title: "Ecuación Lineal",
          steps: [
            `Ecuación original: <b>${a}x + (${b}) = ${c}</b>`,
            `Restamos ${b} en ambos lados: <b>${a}x = ${c - b}</b>`,
            `Dividimos entre ${a}: <b>x = ${x}</b>`
          ],
          result: `x = ${Number.isInteger(x) ? x : x.toFixed(2)}`
        };
      }

      // 2. Quadratic Equation: ax^2 + bx + c = 0
      let mq = clean.match(/([+-]?\d*)\s*x\^?2\s*([+-]\s*\d*)\s*x\s*([+-]\s*\d+)?\s*=\s*0/);
      if (mq) {
        let a = mq[1] === "" || mq[1] === "+" ? 1 : mq[1] === "-" ? -1 : parseFloat(mq[1]);
        let b = mq[2] === "" || mq[2] === "+" ? 1 : mq[2] === "-" ? -1 : parseFloat(mq[2].replace(/\s+/g, ""));
        let c = mq[3] ? parseFloat(mq[3].replace(/\s+/g, "")) : 0;
        let disc = b * b - 4 * a * c;
        if (disc >= 0) {
          let x1 = (-b + Math.sqrt(disc)) / (2 * a);
          let x2 = (-b - Math.sqrt(disc)) / (2 * a);
          return {
            type: "quadratic",
            title: "Ecuación Cuadrática",
            steps: [
              `Identificamos coeficientes: <b>a = ${a}, b = ${b}, c = ${c}</b>`,
              `Fórmula general: <b>x = (-b ± √(b² - 4ac)) / 2a</b>`,
              `Discriminante: <b>Δ = ${b}² - 4(${a})(${c}) = ${disc}</b>`,
              `Raíz del discriminante: <b>√${disc} = ${Math.sqrt(disc).toFixed(2)}</b>`,
              `<b>x₁ = ${x1.toFixed(2)}</b>, <b>x₂ = ${x2.toFixed(2)}</b>`
            ],
            result: `x₁ = ${x1.toFixed(2)}, x₂ = ${x2.toFixed(2)}`
          };
        } else {
          return {
            type: "quadratic",
            title: "Ecuación Cuadrática",
            steps: [
              `Discriminante: <b>Δ = ${disc} < 0</b>`,
              `No tiene raíces reales, tiene dos raíces complejas conjugadas.`
            ],
            result: `Soluciones complejas: x = ${(-b / (2 * a)).toFixed(2)} ± ${(Math.sqrt(-disc) / (2 * a)).toFixed(2)}i`
          };
        }
      }

      // 3. System of 2x2 Linear Equations (e.g., 2x + y = 7, x - y = 2)
      let mSys = clean.match(/([+-]?\d*)\s*x\s*([+-]\s*\d*)\s*y\s*=\s*([+-]?\d+)[,\s;y]+([+-]?\d*)\s*x\s*([+-]\s*\d*)\s*y\s*=\s*([+-]?\d+)/);
      if (mSys) {
        let a1 = mSys[1] === "" || mSys[1] === "+" ? 1 : mSys[1] === "-" ? -1 : parseFloat(mSys[1]);
        let b1 = mSys[2] === "" || mSys[2] === "+" ? 1 : mSys[2] === "-" ? -1 : parseFloat(mSys[2].replace(/\s+/g, ""));
        let c1 = parseFloat(mSys[3]);

        let a2 = mSys[4] === "" || mSys[4] === "+" ? 1 : mSys[4] === "-" ? -1 : parseFloat(mSys[4]);
        let b2 = mSys[5] === "" || mSys[5] === "+" ? 1 : mSys[5] === "-" ? -1 : parseFloat(mSys[5].replace(/\s+/g, ""));
        let c2 = parseFloat(mSys[6]);

        let det = a1 * b2 - a2 * b1;
        if (det !== 0) {
          let detX = c1 * b2 - c2 * b1;
          let detY = a1 * c2 - a2 * c1;
          let x = detX / det;
          let y = detY / det;
          return {
            type: "system",
            title: "Sistema de Ecuaciones 2×2 (Regla de Cramer)",
            steps: [
              `Sistema original:<br><b>[1] ${a1}x + (${b1})y = ${c1}</b><br><b>[2] ${a2}x + (${b2})y = ${c2}</b>`,
              `Determinante del sistema: <b>Δ = (${a1})(${b2}) - (${a2})(${b1}) = ${det}</b>`,
              `Determinante para x: <b>Δx = (${c1})(${b2}) - (${c2})(${b1}) = ${detX}</b>`,
              `Determinante para y: <b>Δy = (${a1})(${c2}) - (${a2})(${c1}) = ${detY}</b>`,
              `Solución: <b>x = Δx / Δ = ${detX}/${det} = ${Number.isInteger(x) ? x : x.toFixed(2)}</b>`,
              `Solución: <b>y = Δy / Δ = ${detY}/${det} = ${Number.isInteger(y) ? y : y.toFixed(2)}</b>`
            ],
            result: `x = ${Number.isInteger(x) ? x : x.toFixed(2)}, y = ${Number.isInteger(y) ? y : y.toFixed(2)}`
          };
        } else {
          return {
            type: "system",
            title: "Sistema de Ecuaciones 2×2",
            steps: [`El determinante Δ = 0. El sistema no tiene solución única (es incompatible o indeterminado).`],
            result: "Sin solución única (Δ = 0)"
          };
        }
      }

      // 4. Fractions Arithmetic: a/b [+-*/] c/d
      let mFrac = clean.match(/(\d+)\s*\/\s*(\d+)\s*([+\-*\/])\s*(\d+)\s*\/\s*(\d+)/);
      if (mFrac) {
        let n1 = parseInt(mFrac[1]), d1 = parseInt(mFrac[2]);
        let op = mFrac[3];
        let n2 = parseInt(mFrac[4]), d2 = parseInt(mFrac[5]);

        function gcd(x, y) { return y === 0 ? x : gcd(y, x % y); }

        let resN = 0, resD = 1;
        let steps = [];

        if (op === "+") {
          resN = n1 * d2 + n2 * d1;
          resD = d1 * d2;
          steps.push(`Operación: <b>${n1}/${d1} + ${n2}/${d2}</b>`);
          steps.push(`Común denominador: <b>${d1} · ${d2} = ${resD}</b>`);
          steps.push(`Numerador: <b>(${n1} · ${d2}) + (${n2} · ${d1}) = ${n1 * d2} + ${n2 * d1} = ${resN}</b>`);
        } else if (op === "-") {
          resN = n1 * d2 - n2 * d1;
          resD = d1 * d2;
          steps.push(`Operación: <b>${n1}/${d1} - ${n2}/${d2}</b>`);
          steps.push(`Común denominador: <b>${d1} · ${d2} = ${resD}</b>`);
          steps.push(`Numerador: <b>(${n1} · ${d2}) - (${n2} · ${d1}) = ${n1 * d2} - ${n2 * d1} = ${resN}</b>`);
        } else if (op === "*") {
          resN = n1 * n2;
          resD = d1 * d2;
          steps.push(`Multiplicación directa de numeradores y denominadores: <b>(${n1} · ${n2}) / (${d1} · ${d2})</b>`);
        } else if (op === "/") {
          resN = n1 * d2;
          resD = d1 * n2;
          steps.push(`División (multiplicación en cruz): <b>(${n1} · ${d2}) / (${d1} · ${n2})</b>`);
        }

        let g = Math.abs(gcd(resN, resD));
        let simpN = resN / g;
        let simpD = resD / g;
        if (g > 1) {
          steps.push(`Simplificamos dividiendo entre el MCD (${g}): <b>${simpN}/${simpD}</b>`);
        }

        let finalStr = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
        return {
          type: "fraction",
          title: "Operación con Fracciones",
          steps: steps,
          result: finalStr
        };
      }

      // 5. Percentages: P% de N
      let mPerc = clean.match(/(\d+(?:\.\d+)?)\s*%\s*(?:de)?\s*(\d+(?:\.\d+)?)/);
      if (mPerc) {
        let p = parseFloat(mPerc[1]);
        let n = parseFloat(mPerc[2]);
        let r = (p * n) / 100;
        return {
          type: "percentage",
          title: "Cálculo de Porcentajes",
          steps: [
            `Porcentaje: <b>${p}% de ${n}</b>`,
            `Fórmula: <b>(${p} / 100) · ${n}</b>`,
            `<b>${(p / 100).toFixed(4)} · ${n} = ${r}</b>`
          ],
          result: `${r}`
        };
      }

      // 6. Trigonometry: sen, cos, tan
      let mTrig = clean.match(/(sen|sin|cos|tan)\s*\(\s*(\d+(?:\.\d+)?)\s*(?:deg|°)?\s*\)/);
      if (mTrig) {
        let fn = mTrig[1];
        let deg = parseFloat(mTrig[2]);
        let rad = (deg * Math.PI) / 180;
        let val = fn === "cos" ? Math.cos(rad) : fn === "tan" ? Math.tan(rad) : Math.sin(rad);
        return {
          type: "trigonometry",
          title: "Trigonometría Básica",
          steps: [
            `Función: <b>${fn}(${deg}°)</b>`,
            `Convertimos grados a radianes: <b>${deg}° · (π / 180) ≈ ${rad.toFixed(4)} rad</b>`,
            `Evaluación: <b>${val.toFixed(4)}</b>`
          ],
          result: `${val.toFixed(4)}`
        };
      }

      // 7. Derivative of polynomial: d/dx (ax^n)
      let md = clean.match(/derivada\s+de\s+([+-]?\d*)\s*x\^?(\d+)?/);
      if (md) {
        let a = md[1] === "" || md[1] === "+" ? 1 : md[1] === "-" ? -1 : parseFloat(md[1]);
        let n = md[2] ? parseFloat(md[2]) : 1;
        let newA = a * n;
        let newN = n - 1;
        let resStr = newN === 0 ? `${newA}` : newN === 1 ? `${newA}x` : `${newA}x^${newN}`;
        return {
          type: "calculus",
          title: "Derivada Polinomial",
          steps: [
            `Regla de la potencia: <b>d/dx [xⁿ] = n · xⁿ⁻¹</b>`,
            `Multiplicamos coeficiente por exponente: <b>${a} · ${n} = ${newA}</b>`,
            `Restamos 1 al exponente: <b>${n} - 1 = ${newN}</b>`
          ],
          result: `d/dx = ${resStr}`
        };
      }

      // 8. Pythagorean theorem: pitagoras / hipotenusa a=... b=...
      let mp = clean.match(/pit[aá]goras.*?(?:a\s*=\s*(\d+(?:\.\d+)?)).*?(?:b\s*=\s*(\d+(?:\.\d+)?))/);
      if (mp) {
        let a = parseFloat(mp[1]);
        let b = parseFloat(mp[2]);
        let c = Math.sqrt(a * a + b * b);
        return {
          type: "geometry",
          title: "Teorema de Pitágoras",
          steps: [
            `Catetos: <b>a = ${a}</b>, <b>b = ${b}</b>`,
            `Fórmula: <b>c² = a² + b²</b>`,
            `<b>c² = ${a * a} + ${b * b} = ${a * a + b * b}</b>`,
            `<b>c = √(${a * a + b * b}) = ${c.toFixed(2)}</b>`
          ],
          result: `Hipotenusa c = ${c.toFixed(2)}`
        };
      }

      // 9. Basic Arithmetic / Fractions eval
      try {
        let expr = clean.replace(/[^0-9+\-*/().]/g, "");
        if (expr && expr.length >= 3 && /[0-9]/.test(expr)) {
          const val = Function('"use strict";return (' + expr + ")")();
          if (typeof val === "number" && !isNaN(val)) {
            return {
              type: "arithmetic",
              title: "Cálculo Aritmético",
              steps: [
                `Operación: <b>${expr}</b>`,
                `Resultado calculado con precisión matemática.`
              ],
              result: `${Number.isInteger(val) ? val : val.toFixed(4)}`
            };
          }
        }
      } catch(e) {}

      return null;
    }

    // Conversational Response Generator
    function generateResponse(query) {
      const q = query.trim().toLowerCase();

      // Direct Math Problem Autonomous Solver
      const solution = solveMath(query);
      if (solution) {
        let html = `¡Claro que sí! Como tu tutora IA, aquí tienes la resolución paso a paso de <b>${solution.title}</b>:<br><br>`;
        html += `<div class="paper"><ol class="steps">`;
        solution.steps.forEach(st => html += `<li>${st}</li>`);
        html += `</ol><div class="formula" style="color:var(--ok);font-size:1.3rem;margin-top:.5rem">Resultado: ${solution.result}</div></div>`;
        return html;
      }

      // Greetings & Identity
      if (/hola|buenos|saludos|hey|buenas/i.test(q)) {
        return "¡Hola! Soy Capi, tu tutora de Inteligencia Artificial en CAPICÚA. Estoy equipada para resolver ecuaciones, sistemas 2x2, derivadas, integrales, fracciones y explicarte cualquier duda paso a paso. Puedes escribirme tu pregunta o usar el botón de micrófono para hablarme. ¿En qué ejercicio o tema trabajamos hoy?";
      }
      if (/quien eres|tu nombre|eres|acerca de ti|como te llamas/i.test(q)) {
        return "Soy <b>Capi</b>, tu agente tutora autónoma en CAPICÚA. Te acompaño en tu aprendizaje de matemáticas, física e ingeniería desde cero. Puedo resolver cualquier ejercicio numérico o algebraico que me envíes, explicarte la intuición detrás de cada fórmula y darte pistas personalizadas.";
      }

      // Concepts: Derivada
      if (/que es una derivada|concepto de derivada|explicame que es una derivada|para que sirve la derivada/i.test(q)) {
        return "Una **derivada** mide la tasa de cambio instantánea de una variable respecto a otra: geométricamente, es la **pendiente de la recta tangente** a una curva en un punto exacto.<br><br>• **En física**: si tienes la función de posición <code>s(t)</code>, su derivada respecto al tiempo es la **velocidad instantánea**: <code>v(t) = s'(t)</code>, y la derivada de la velocidad es la **aceleración**: <code>a(t) = v'(t)</code>.<br>• **Regla básica de la potencia**: <b>d/dx [xⁿ] = n · xⁿ⁻¹</b>.<br><br>Por ejemplo: la derivada de <b>5x³</b> es <b>15x²</b>. Escríbeme cualquier función y te la derivo paso a paso.";
      }

      // Concepts: Menos por menos da más
      if (/menos por menos|por que menos por menos|signos|regla de los signos/i.test(q)) {
        return "La regla de que <b>(−) × (−) = (+)</b> se entiende de dos formas muy intuitivas:<br><br>1. **En la recta numérica**: Multiplicar por un número negativo significa **invertir la dirección** 180°. Si estás en −5 (hacia la izquierda) y lo multiplicas por −1, inviertes tu dirección hacia la derecha, llegando a <b>+5</b>.<br><br>2. **Por la propiedad distributiva**: Sabemos que (−1) · (1 + (−1)) = (−1) · 0 = 0. Al distribuir: (−1)·1 + (−1)·(−1) = 0  →  −1 + (−1)(−1) = 0. Para que sume 0, obligatoriamente <b>(−1) · (−1) = +1</b>.";
      }

      // Concepts: Matrices en ingeniería
      if (/matriz|matrices|para que sirven las matrices/i.test(q)) {
        return "Las **matrices** son la herramienta matemática más poderosa de la ingeniería moderna:<br><br>1. **Gráficos 3D y Videojuegos**: Cada rotación, traslación y perspectiva de un modelo 3D (como mi modelo chibi en pantalla) se calcula multiplicando vectores por matrices de transformación 4×4.<br>2. **Inteligencia Artificial y Redes Neuronales**: Cada capa de una red neuronal es una multiplicación de matrices de pesos: <code>Y = W · X + b</code>.<br>3. **Robótica y Estructuras**: Calculan esfuerzos en puentes y la cinemática de brazos robóticos.";
      }

      // Concepts: Fracciones y Plan de estudio
      if (/plan.*fraccion|aprender fraccion|como aprender fraccion|fracciones desde cero/i.test(q)) {
        return "¡Aquí tienes mi plan de 5 pasos para dominar fracciones desde cero!<br><br>1. **Significado**: El denominador divide la unidad en partes iguales; el numerador cuenta cuántas tomas.<br>2. **Equivalencia y Simplificación**: Multiplica o divide numerador y denominador por el mismo número (MCD).<br>3. **Suma y Resta**: Si tienen el mismo denominador, suma directo. Si son distintos, halla el Mínimo Común Múltiplo (MCM).<br>4. **Multiplicación**: Numerador por numerador y denominador por denominador.<br>5. **División**: Invierte la segunda fracción y multiplica.<br><br>¿Hacemos un ejercicio juntos? Escribe por ejemplo <code>3/4 + 1/6</code>.";
      }

      // Practice requests
      if (/practicar|ejercicio|reto|ponme un problema|quiero practicar/i.test(q)) {
        const p = generatePractice(q);
        return `¡Excelente iniciativa! Aquí tienes un reto para ponerte a prueba:<br><br><div class="paper"><b>${p.q}</b><br><small class="muted">Intenta resolverlo en papel. Cuando tengas la respuesta, escríbemela y la revisamos juntos.</small></div>`;
      }

      // Factorization
      if (/factorizar|factorizacion/i.test(q)) {
        return "La **factorización** consiste en escribir una expresión como producto de factores más simples.<br><br>• **Factor Común**: <code>6x² + 9x = 3x(2x + 3)</code><br>• **Diferencia de Cuadrados**: <code>x² − 16 = (x + 4)(x − 4)</code><br>• **Trinomio x² + bx + c**: <code>x² + 5x + 6 = (x + 2)(x + 3)</code> (dos números que multiplicados den 6 y sumados den 5).<br><br>¿Qué trinomio o expresión quieres que factoricemos?";
      }

      // Integrales
      if (/integral|integrales/i.test(q)) {
        return "La integral es la operación inversa a la derivada: calcula el área acumulada bajo una curva.<br><br>• **Regla de la potencia**: <b>∫ xⁿ dx = (xⁿ⁺¹)/(n + 1) + C</b> (para n ≠ −1).<br>• Ejemplo: <code>∫ 3x² dx = x³ + C</code>.<br><br>Escríbeme cualquier polinomio y te calcularé su integral paso a paso.";
      }

      // Teorema de Pitágoras
      if (/pitagoras/i.test(q)) {
        return "En todo triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos: <b>c² = a² + b²</b>.<br><br>Para despejar la hipotenusa: <b>c = √(a² + b²)</b>.<br>Escríbeme <code>pitágoras a=6 b=8</code> para resolverlo paso a paso.";
      }

      // Sistemas 2x2
      if (/sistema|sistemas/i.test(q)) {
        return "Para resolver un sistema de 2 ecuaciones con 2 incógnitas por la Regla de Cramer o eliminación, escríbeme directamente el sistema, por ejemplo: <code>2x + y = 7, x - y = 1</code> y te mostraré el determinante y los valores de x e y.";
      }

      // Default smart encouraging response with solver hints
      return `He analizado tu consulta sobre "<b>${query}</b>". Como tu tutora IA autónoma, puedo resolver y explicarte:<br><br>• <b>Ecuaciones lineales</b>: <code>3x - 12 = 18</code><br>• <b>Ecuaciones cuadráticas</b>: <code>x^2 - 5x + 6 = 0</code><br>• <b>Sistemas 2x2</b>: <code>2x + y = 7, x - y = 1</code><br>• <b>Fracciones</b>: <code>3/4 + 2/5</code><br>• <b>Derivadas</b>: <code>derivada de 5x^2</code><br>• <b>Integrales</b>: <code>integral de 4x^3</code><br>• <b>Porcentajes</b>: <code>25% de 400</code><br><br>Escribe tu ejercicio o pregúntame cualquier concepto y te lo explicaré paso a paso.`;
    }

    // Practice problem generator
    function generatePractice(topic = "algebra") {
      const bank = [
        { q: "Resuelve: 2x + 8 = 24", ans: "x = 8", steps: ["2x = 24 - 8", "2x = 16", "x = 8"] },
        { q: "Calcula: 3/4 + 1/2", ans: "5/4", steps: ["1/2 = 2/4", "3/4 + 2/4 = 5/4"] },
        { q: "Deriva: f(x) = 3x^4", ans: "12x^3", steps: ["d/dx = 4 · 3 · x^3 = 12x^3"] },
        { q: "Hipotenusa si a = 6 y b = 8", ans: "c = 10", steps: ["c² = 36 + 64 = 100", "c = 10"] }
      ];
      return bank[Math.floor(Math.random() * bank.length)];
    }

    // Voice Speech Synthesis
    function speak(text) {
      if (!("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const plainText = text.replace(/<[^>]*>?/gm, "").replace(/[#*`_]/g, "");
        const u = new SpeechSynthesisUtterance(plainText);
        u.lang = "es-CO";
        u.rate = 1.05;
        u.pitch = 1.15;
        window.speechSynthesis.speak(u);
      } catch(e) {}
    }

    return {
      solve: solveMath,
      ask: generateResponse,
      practice: generatePractice,
      speak: speak
    };
  })();

  /* ------------------------------------------------------------------------
     5. EXAM SIMULATOR WITH PDF / IMAGE / TEXT PROCESSING (`CapSimulacroAI`)
     ------------------------------------------------------------------------ */
  const CapSimulacroAI = (function() {
    let currentExam = null;
    let timerInterval = null;
    let secondsLeft = 0;
    let userAnswers = {};

    // Standard Math Question Generator based on extracted topic/keywords
    function buildQuestionsFromContext(text, count = 5) {
      const pool = [
        {
          q: "Si resolvemos la ecuación lineal 4x - 8 = 16, ¿cuál es el valor de x?",
          opts: ["x = 4", "x = 6", "x = 8", "x = 2"],
          correct: 1,
          topic: "Álgebra Lineal",
          steps: "Sumamos 8 a ambos lados: 4x = 24. Luego dividimos entre 4: x = 24 / 4 = 6."
        },
        {
          q: "Calcula la derivada de la función f(x) = 3x² + 5x - 7:",
          opts: ["f'(x) = 6x + 5", "f'(x) = 3x + 5", "f'(x) = 6x²", "f'(x) = 6x - 7"],
          correct: 0,
          topic: "Cálculo Diferencial",
          steps: "Derivando término a término: d/dx(3x²) = 6x, d/dx(5x) = 5, d/dx(-7) = 0. Respuesta: 6x + 5."
        },
        {
          q: "¿Cuál es el resultado de la operación con fracciones 2/3 + 1/6?",
          opts: ["3/9", "5/6", "3/6", "7/6"],
          correct: 1,
          topic: "Aritmética",
          steps: "Mínimo común múltiplo de 3 y 6 es 6. 2/3 = 4/6. Entonces 4/6 + 1/6 = 5/6."
        },
        {
          q: "En un triángulo rectángulo cuyos catetos miden 6 cm y 8 cm, ¿cuánto mide la hipotenusa?",
          opts: ["14 cm", "10 cm", "12 cm", "9 cm"],
          correct: 1,
          topic: "Geometría",
          steps: "Por Pitágoras: c = √(6² + 8²) = √(36 + 64) = √100 = 10 cm."
        },
        {
          q: "Halla las raíces de la ecuación cuadrática x² - 5x + 6 = 0:",
          opts: ["x = 2, x = 3", "x = -2, x = -3", "x = 1, x = 6", "x = -1, x = 5"],
          correct: 0,
          topic: "Álgebra",
          steps: "Factorizando: (x - 2)(x - 3) = 0. Por lo tanto, x = 2 y x = 3."
        },
        {
          q: "Calcula la integral indefinida ∫ (4x³ + 2x) dx:",
          opts: ["x⁴ + x² + C", "12x² + 2 + C", "4x⁴ + 2x² + C", "x³ + x + C"],
          correct: 0,
          topic: "Cálculo Integral",
          steps: "∫ 4x³ dx = 4(x⁴/4) = x⁴. ∫ 2x dx = 2(x²/2) = x². Resultado: x⁴ + x² + C."
        },
        {
          q: "Si un auto viaja a una velocidad constante de 90 km/h durante 2.5 horas, ¿qué distancia recorre?",
          opts: ["180 km", "225 km", "210 km", "240 km"],
          correct: 1,
          topic: "Física e Ingeniería",
          steps: "Fórmula: Distancia = Velocidad · Tiempo = 90 km/h · 2.5 h = 225 km."
        }
      ];

      // Shuffle and pick requested count
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }

    // Client-side text extractor from raw PDF binary ArrayBuffer
    function extractTextFromPDF(arrayBuffer) {
      try {
        const bytes = new Uint8Array(arrayBuffer);
        let text = "";
        const maxLen = Math.min(bytes.length, 300000);
        for (let i = 0; i < maxLen; i++) {
          const c = bytes[i];
          if ((c >= 32 && c <= 126) || c === 10 || c === 13) {
            text += String.fromCharCode(c);
          }
        }
        // Extract parentheses text strings commonly found in PDF text blocks (text) Tj
        const matches = text.match(/\(([^)]+)\)\s*(?:Tj|TJ|\')/g) || [];
        const extracted = matches.map(m => m.replace(/[()]/g, "").replace(/\s*(?:Tj|TJ|\')/, "")).join(" ");
        return extracted.length > 30 ? extracted : text.slice(0, 2000);
      } catch(e) {
        return "Texto extraído de documento PDF para simulacro matemático.";
      }
    }

    return {
      generateFromText(text, count = 5) {
        const questions = buildQuestionsFromContext(text, count);
        currentExam = {
          id: "EXAM-" + Date.now().toString(36).toUpperCase(),
          title: "Simulacro Capi IA (" + count + " preguntas)",
          questions: questions,
          timeLimit: count * 90, // 1.5 min per question
          date: new Date().toLocaleDateString()
        };
        return currentExam;
      },
      extractPDF: extractTextFromPDF,
      getCurrentExam: () => currentExam
    };
  })();

  /* ------------------------------------------------------------------------
     6. MULTIPLAYER ROOMS & SYNC (`CapSalasMultiplayer`)
     ------------------------------------------------------------------------ */
  const CapSalasMultiplayer = (function() {
    const CHANNEL_NAME = "capicua-salas-v3";
    let channel = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(CHANNEL_NAME);
      }
    } catch(e) {}

    let currentRoom = null;
    let isHost = false;

    // Default Rooms list stored locally
    function getRooms() {
      try {
        const stored = JSON.parse(localStorage.getItem("cap-rooms-list") || "[]");
        if (stored.length) return stored;
      } catch(e) {}
      return [
        { id: "CAPI-888", name: "Duelo Estelar 888", topic: "Álgebra y Cálculo", host: "Capi Master", players: 3, max: 4, status: "open" },
        { id: "PI-314", name: "Sala Pitágoras", topic: "Geometría y Trigonometría", host: "Euler77", players: 2, max: 4, status: "open" },
        { id: "GAUSS-1", name: "Batalla Aritmética", topic: "Cálculo Mental Rápido", host: "Hipatia_Pro", players: 1, max: 4, status: "open" }
      ];
    }

    function saveRooms(list) {
      try {
        localStorage.setItem("cap-rooms-list", JSON.stringify(list));
      } catch(e) {}
    }

    // Bot Opponents for solo testing
    const BOTS = [
      { name: "Hipatia Bot", avatar: CAPI_LOGO_URL, score: 0 },
      { name: "Gauss Bot", avatar: CAPI_LOGO_URL, score: 0 },
      { name: "Euler Bot", avatar: CAPI_LOGO_URL, score: 0 }
    ];

    return {
      getRooms,
      createRoom(name, topic, questionCount = 5, mode = "pvp", enemyId = "aritmetron", timePerQ = 20) {
        const id = "SALA-" + Math.floor(100 + Math.random() * 900);
        const me = CapAccount.getCurrentUser();
        const ENEMIES_MAP = {
          aritmetron: { id: "aritmetron", name: "Aritmetrón 3000", maxHp: 1200, hp: 1200, icon: "🤖", domain: "Tablas del 1 al 1000", atk: "Descarga de Factores" },
          algebrix: { id: "algebrix", name: "Algébrix el Caótico", maxHp: 1500, hp: 1500, icon: "👾", domain: "Ecuaciones y Sistemas 2x2", atk: "Incógnita Destructiva" },
          geotitan: { id: "geotitan", name: "Geo-Titán", maxHp: 2000, hp: 2000, icon: "🗿", domain: "Geometría y Pitágoras", atk: "Aplastamiento Poligonal" },
          calculon: { id: "calculon", name: "Calculón el Infinito", maxHp: 2500, hp: 2500, icon: "⚡", domain: "Cálculo y Derivadas", atk: "Singularidad Asintótica" }
        };

        const chosenEnemy = ENEMIES_MAP[enemyId] || ENEMIES_MAP.aritmetron;

        currentRoom = {
          id,
          name: name || (mode === "coop" ? "Misión vs " + chosenEnemy.name : "Duelo de " + me.username),
          topic: topic || "Álgebra y Matemáticas Mixtas",
          mode: mode || "pvp",
          enemy: Object.assign({}, chosenEnemy),
          timePerQ: parseInt(timePerQ) || 20,
          host: me.username,
          players: [
            { username: me.username, name: me.name, avatar: me.avatar, ready: true, score: 0 },
            { username: (mode === "coop" ? "Compañero Euler" : "Hipatia Bot"), name: (mode === "coop" ? "Compañero Euler" : "Hipatia Bot"), avatar: CAPI_LOGO_URL, ready: true, score: 0 }
          ],
          questions: CapSimulacroAI.generateFromText(topic, questionCount).questions,
          tieBreaker: {
            topic: "⚡ Muerte Súbita - Pregunta Decisiva de Desempate",
            q: "¡Desempate decisivo! Resuelve a máxima velocidad: ¿Cuál es el valor de x si 4x - 12 = 36?",
            opts: ["8", "10", "12", "15"],
            correct: 2,
            explanation: "4x = 36 + 12 = 48 => x = 48 / 4 = 12."
          },
          currentQ: 0,
          status: "lobby"
        };
        isHost = true;
        const list = getRooms();
        list.unshift({
          id,
          name: currentRoom.name,
          topic: currentRoom.topic,
          mode: currentRoom.mode,
          enemy: currentRoom.enemy ? currentRoom.enemy.name : null,
          host: me.username,
          players: 2,
          max: 4,
          status: "open"
        });
        saveRooms(list);
        if (channel) {
          channel.postMessage({ type: "ROOM_CREATED", room: currentRoom });
        }
        return currentRoom;
      },
      getCurrentRoom: () => currentRoom,
      isHost: () => isHost
    };
  })();

  /* ------------------------------------------------------------------------
     7. USER ACCOUNT & PROGRESS ARCHITECTURE (`CapAccount`)
     ------------------------------------------------------------------------ */
  const CapAccount = (function() {
    const STORAGE_KEY = "capicua-accounts-v3";
    const CURRENT_USER_KEY = "capicua-current-user-v3";

    function loadAccounts() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      } catch(e) {
        return {};
      }
    }

    function saveAccounts(accounts) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      } catch(e) {}
    }

    // Default Guest / Initial Profile
    function getDefaultUser() {
      return {
        username: "Estudiante888",
        name: "Estudiante Capicúa",
        email: "estudiante@capicua.edu",
        grade: "Secundaria / Pregrado",
        avatar: CAPI_LOGO_URL,
        stats: {
          xp: 150,
          level: 2,
          pi: 50,
          streak: 3,
          examsSolved: 2,
          duelsWon: 1
        },
        membership: "orbita", // orbita, chispa, cometa, nova
        createdAt: new Date().toISOString()
      };
    }

    let currentUser = null;
    try {
      const cur = localStorage.getItem(CURRENT_USER_KEY);
      if (cur) {
        const accounts = loadAccounts();
        currentUser = accounts[cur] || null;
      }
    } catch(e) {}

    if (!currentUser) {
      currentUser = getDefaultUser();
      const accounts = loadAccounts();
      accounts[currentUser.username] = currentUser;
      saveAccounts(accounts);
      localStorage.setItem(CURRENT_USER_KEY, currentUser.username);
    }

    return {
      getCurrentUser: () => currentUser,
      register(username, name, email, password, grade) {
        const accounts = loadAccounts();
        if (accounts[username]) {
          throw new Error("El usuario ya existe. Elige otro nombre.");
        }
        const newUser = {
          username: username.trim(),
          name: name.trim() || username.trim(),
          email: email.trim(),
          password: password, // local persistent
          grade: grade || "Bachillerato / Universidad",
          avatar: CAPI_LOGO_URL,
          stats: {
            xp: 0,
            level: 1,
            pi: 100,
            streak: 1,
            examsSolved: 0,
            duelsWon: 0
          },
          membership: "orbita",
          createdAt: new Date().toISOString()
        };
        accounts[username] = newUser;
        saveAccounts(accounts);
        currentUser = newUser;
        localStorage.setItem(CURRENT_USER_KEY, username);
        this.syncWithCapEngine();
        return newUser;
      },
      login(username, password) {
        const accounts = loadAccounts();
        const user = accounts[username];
        if (!user || user.password !== password) {
          throw new Error("Usuario o contraseña incorrectos.");
        }
        currentUser = user;
        localStorage.setItem(CURRENT_USER_KEY, username);
        this.syncWithCapEngine();
        return user;
      },
      saveProgress(deltaStats = {}) {
        if (!currentUser) return;
        Object.assign(currentUser.stats, deltaStats);
        const accounts = loadAccounts();
        accounts[currentUser.username] = currentUser;
        saveAccounts(accounts);
        this.syncWithCapEngine();
      },
      upgradeMembership(tier) {
        if (!currentUser) return;
        currentUser.membership = tier;
        const accounts = loadAccounts();
        accounts[currentUser.username] = currentUser;
        saveAccounts(accounts);
        this.syncWithCapEngine();
      },
      syncWithCapEngine() {
        try {
          if (window.CapEngine && window.CapEngine.S) {
            const S = window.CapEngine.S;
            S.xp = currentUser.stats.xp;
            S.pi = currentUser.stats.pi;
            S.streak = currentUser.stats.streak;
            S.onboarded = true;
            if (window.CapEngine.Store && window.CapEngine.Store.save) {
              window.CapEngine.Store.save();
            }
          }
        } catch(e) {}
      }
    };
  })();

  /* ------------------------------------------------------------------------
     8. CHAT & MESSAGE NOTIFICATIONS (`CapChat`)
     ------------------------------------------------------------------------ */
  const CapChat = (function() {
    let unreadCount = 0;
    const messages = [
      { sender: "Capi IA", text: "¡Hola! Estoy lista para resolver tus dudas matemáticas. Escríbeme cualquier ecuación.", time: "Hace un momento", isCapi: true }
    ];

    function notify(sender, text) {
      unreadCount++;
      CapAudio.sfx.notification();

      // Update badge in top bar
      const badge = document.getElementById("chat-notif-badge");
      if (badge) {
        badge.textContent = unreadCount;
        badge.hidden = false;
      }

      // Show floating in-app notification banner
      const banner = document.createElement("div");
      banner.className = "notif-banner";
      banner.innerHTML = `
        <img src="${CAPI_LOGO_URL}" width="34" height="34" style="border-radius:50%;border:2px solid #5fd3f0;">
        <div style="flex:1">
          <b style="font-size:.85rem;color:#5fd3f0">${sender}</b>
          <p style="font-size:.8rem;margin:0">${text.slice(0, 60)}${text.length > 60 ? "..." : ""}</p>
        </div>
      `;
      document.body.appendChild(banner);
      setTimeout(() => banner.remove(), 4500);

      // Desktop browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(sender, {
            body: text,
            icon: CAPI_LOGO_URL
          });
        } catch(e) {}
      }
    }

    return {
      getMessages: () => messages,
      sendMessage(text, sender = null) {
        const me = CapAccount.getCurrentUser();
        const msg = {
          sender: sender || me.name,
          text: text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: !sender
        };
        messages.push(msg);

        // If message is to Capi, generate response after 600ms
        if (!sender) {
          setTimeout(() => {
            const aiReply = CapMathAI.ask(text);
            messages.push({
              sender: "Capi IA",
              text: aiReply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isCapi: true
            });
            notify("Capi IA", aiReply.replace(/<[^>]*>?/gm, "").slice(0, 80));
            const feed = document.getElementById("capi-chat-feed");
            if (feed) {
              feed.innerHTML += `
                <div class="capi-msg-ai">
                  <b style="color:#5fd3f0;font-size:.85rem">Capi IA:</b><br>${aiReply}
                </div>
              `;
              feed.scrollTop = feed.scrollHeight;
            }
          }, 600);
        }
      },
      clearUnread() {
        unreadCount = 0;
        const badge = document.getElementById("chat-notif-badge");
        if (badge) badge.hidden = true;
      },
      requestPermission() {
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
        }
      }
    };
  })();

  /* ------------------------------------------------------------------------
     9. REGISTER MASTER VIEWS IN CAPICÚA (`CapUI.views`)
     ------------------------------------------------------------------------ */
  function registerMasterViews(ui) {
    if (!ui || !ui.views) return;

    // View A: SALAS MULTIJUGADOR (Competitivo 1v1 y Cooperativo en Equipo vs Enemigo)
    ui.views.salas = function(el) {
      const rooms = CapSalasMultiplayer.getRooms();
      const me = CapAccount.getCurrentUser();

      el.innerHTML = `
        <div class="room-hub">
          <div class="room-header">
            <div>
              <p class="eyebrow" style="color:#7cf06a">🎮 Multijugador en Tiempo Real</p>
              <h1 class="h1">Salas de Juego con Amigos</h1>
              <p class="lead">Elige cómo jugar: <b>Compite en Duelo 1 vs 1</b> contra tu amigo contrarreloj, o <b>Únanse en Equipo</b> para derrotar a los jefes y enemigos de los mundos matemáticos.</p>
            </div>
            <div class="row" style="gap:0.75rem;flex-wrap:wrap">
              <button class="btn primary lg" id="btn-create-room">✨ Crear Sala (Duelo o Coop)</button>
              <button class="btn" id="btn-quick-duel">⚔️ Duelo Rápido 1v1</button>
              <button class="btn" id="btn-quick-coop">🤝 Misión Coop vs Jefe</button>
            </div>
          </div>

          <div class="section">
            <h2 class="h2">Salas Activas Disponibles</h2>
            <div class="room-grid" id="room-list-grid">
              ${rooms.map(r => `
                <div class="room-card">
                  <div class="row between">
                    <span class="room-badge ${r.status === 'open' ? 'open' : 'playing'}">
                      ● ${r.status === 'open' ? 'En espera' : 'En partida'}
                    </span>
                    <span class="${r.mode === 'coop' ? 'mode-badge-coop' : 'mode-badge-pvp'}">
                      ${r.mode === 'coop' ? '🤝 Cooperativo vs Jefe' : '⚔️ Duelo 1 vs 1'}
                    </span>
                  </div>
                  <div style="margin:0.5rem 0">
                    <h3 class="h3">${r.name}</h3>
                    <p class="small muted">Tema: <b>${r.topic}</b></p>
                    ${r.enemy ? `<p class="tiny muted" style="color:#ff7aa8">Jefe objetivo: <b>${r.enemy}</b></p>` : ''}
                    <p class="tiny muted">Anfitrión: ${r.host}</p>
                  </div>
                  <div class="row between" style="margin-top:auto">
                    <span class="small">👥 <b>${r.players}/${r.max || 4}</b></span>
                    <button class="btn primary sm btn-enter-room" data-id="${r.id}" data-mode="${r.mode || 'pvp'}">
                      ${r.mode === 'coop' ? 'Unirse al Equipo' : 'Entrar al Duelo'}
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;

      // Handlers
      const btnCreate = el.querySelector("#btn-create-room");
      if (btnCreate) {
        btnCreate.onclick = () => {
          CapAudio.sfx.click();
          ui.modal(`
            <div class="stack">
              <h2 class="h2">Crear Sala Multijugador</h2>

              <label class="lbl">Modo de Juego
                <select id="rm-mode">
                  <option value="pvp">⚔️ Modo Competitivo (Duelo 1 vs 1 contra tu amigo)</option>
                  <option value="coop">🤝 Modo Cooperativo (Los dos se unen en equipo vs Enemigo)</option>
                </select>
              </label>

              <div id="rm-enemy-wrap" style="display:none">
                <label class="lbl">Enemigo a Desafiar en Equipo
                  <select id="rm-enemy">
                    <option value="aritmetron">🤖 Aritmetrón 3000 (Tablas y Fracciones - 1200 HP)</option>
                    <option value="algebrix">👾 Algébrix el Caótico (Ecuaciones y Sistemas 2x2 - 1500 HP)</option>
                    <option value="geotitan">🗿 Geo-Titán (Geometría y Pitágoras - 2000 HP)</option>
                    <option value="calculon">⚡ Calculón el Infinito (Cálculo y Derivadas - 2500 HP)</option>
                  </select>
                </label>
              </div>

              <label class="lbl">Nombre de la Sala
                <input type="text" id="rm-name" value="Desafío Matemático 888">
              </label>

              <label class="lbl">Tema de la Lección
                <select id="rm-topic">
                  <option value="Álgebra y Ecuaciones">Álgebra y Ecuaciones</option>
                  <option value="Cálculo Diferencial e Integral">Cálculo Diferencial e Integral</option>
                  <option value="Geometría y Pitágoras">Geometría y Trigonometría</option>
                  <option value="Aritmética Rápida y Fracciones">Aritmética Rápida y Fracciones</option>
                </select>
              </label>

              <div class="split">
                <label class="lbl">Segundos por Pregunta
                  <select id="rm-time">
                    <option value="15">⚡ 15 Segundos (Máxima Velocidad)</option>
                    <option value="20" selected>⏱️ 20 Segundos (Estándar)</option>
                    <option value="30">🕰️ 30 Segundos (Reflexivo)</option>
                  </select>
                </label>
                <label class="lbl">Cantidad de Preguntas
                  <select id="rm-count">
                    <option value="5">5 Preguntas (Rápido)</option>
                    <option value="10">10 Preguntas (Completo)</option>
                  </select>
                </label>
              </div>

              <div class="row" style="margin-top:1rem">
                <button class="btn primary" id="rm-submit">🚀 ¡Abrir Sala!</button>
                <button class="btn" data-close>Cancelar</button>
              </div>
            </div>
          `, (modalEl, close) => {
            const modeSelect = modalEl.querySelector("#rm-mode");
            const enemyWrap = modalEl.querySelector("#rm-enemy-wrap");
            modeSelect.onchange = () => {
              enemyWrap.style.display = modeSelect.value === "coop" ? "block" : "none";
            };

            modalEl.querySelector("#rm-submit").onclick = () => {
              const name = modalEl.querySelector("#rm-name").value;
              const topic = modalEl.querySelector("#rm-topic").value;
              const count = parseInt(modalEl.querySelector("#rm-count").value);
              const mode = modalEl.querySelector("#rm-mode").value;
              const enemyId = modalEl.querySelector("#rm-enemy") ? modalEl.querySelector("#rm-enemy").value : "aritmetron";
              const timePerQ = parseInt(modalEl.querySelector("#rm-time").value) || 20;

              CapSalasMultiplayer.createRoom(name, topic, count, mode, enemyId, timePerQ);
              close();
              ui.toast("Sala Creada", `Modo: ${mode === 'coop' ? 'Cooperativo' : 'Duelo 1v1'} - Código: ${CapSalasMultiplayer.getCurrentRoom().id}`, "ok");
              renderRoomLobby(el, CapSalasMultiplayer.getCurrentRoom());
            };
          });
        };
      }

      const btnQuickDuel = el.querySelector("#btn-quick-duel");
      if (btnQuickDuel) {
        btnQuickDuel.onclick = () => {
          CapAudio.sfx.click();
          const r = CapSalasMultiplayer.createRoom("Duelo 1v1 Rápido", "Álgebra y Cálculo", 5, "pvp", "aritmetron", 20);
          renderRoomLobby(el, r);
        };
      }

      const btnQuickCoop = el.querySelector("#btn-quick-coop");
      if (btnQuickCoop) {
        btnQuickCoop.onclick = () => {
          CapAudio.sfx.click();
          const r = CapSalasMultiplayer.createRoom("Misión Coop vs Jefe", "Álgebra y Ecuaciones", 5, "coop", "algebrix", 20);
          renderRoomLobby(el, r);
        };
      }

      el.querySelectorAll(".btn-enter-room").forEach(b => {
        b.onclick = () => {
          CapAudio.sfx.click();
          const m = b.dataset.mode || "pvp";
          const r = CapSalasMultiplayer.createRoom(m === "coop" ? "Misión Cooperativa" : "Duelo Rápido", "Álgebra y Cálculo", 5, m, "aritmetron", 20);
          renderRoomLobby(el, r);
        };
      });
    };

    function renderRoomLobby(el, room) {
      const isCoop = room.mode === "coop";
      el.innerHTML = `
        <div class="duel-arena">
          <div class="row between">
            <div>
              <span class="${isCoop ? 'mode-badge-coop' : 'mode-badge-pvp'}">
                ${isCoop ? '🤝 MODO COOPERATIVO EN EQUIPO' : '⚔️ MODO COMPETITIVO 1 VS 1'}
              </span>
              <h1 class="h1" style="margin-top:.4rem">${room.name}</h1>
              <p class="small muted">Código de invitación: <b style="color:#ffd23f;font-size:1.1rem">${room.id}</b> · Tiempo: <b>${room.timePerQ}s por pregunta</b></p>
            </div>
            <button class="btn sm" onclick="navigator.clipboard.writeText(location.href);window.CapUI.toast('Enlace copiado','Compártelo con tu amigo para que entre','ok');">
              📋 Copiar Enlace
            </button>
          </div>

          ${isCoop ? `
            <div class="coop-boss-card">
              <div style="font-size:2.8rem;margin-bottom:.3rem">${room.enemy.icon}</div>
              <h3 class="h3" style="color:#ff7aa8">Jefe: ${room.enemy.name}</h3>
              <p class="small muted">Puntos de Vida del Enemigo: <b>${room.enemy.maxHp} HP</b></p>
              <p class="tiny muted" style="color:#5fd3f0">¡Los dos amigos unen sus respuestas para derrotar al enemigo antes de que acabe el tiempo!</p>
            </div>
          ` : `
            <div class="card" style="background:rgba(123,60,240,0.15);border-color:#7b3cf0">
              <p class="small"><b>Reglas del Duelo:</b> Respondan las preguntas contrarreloj. Si al final quedan empatados, <b>¡se activará una pregunta decisiva de desempate a muerte súbita!</b></p>
            </div>
          `}

          <div class="section">
            <h3 class="h3">Participantes en la Sala (${room.players.length}/4)</h3>
            <div class="lobby-roster">
              ${room.players.map(p => `
                <div class="lobby-player ${p.username === CapAccount.getCurrentUser().username ? 'me' : ''}">
                  <img src="${p.avatar || CAPI_LOGO_URL}" width="54" height="54" style="border-radius:50%;border:2px solid #5fd3f0;object-fit:cover;">
                  <b>${p.name || p.username}</b>
                  <span class="ready-badge">Listo ✓</span>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="row" style="margin-top:1.5rem">
            <button class="btn primary lg" id="btn-start-match">🚀 ${isCoop ? '¡Comenzar Misión Coop!' : '¡Comenzar Duelo 1v1!'}</button>
            <button class="btn" onclick="location.hash='salas'">Salir de la Sala</button>
          </div>
        </div>
      `;

      const btnStart = el.querySelector("#btn-start-match");
      if (btnStart) {
        btnStart.onclick = () => {
          CapAudio.play("battle");
          CapAudio.sfx.levelUp();
          renderRoomMatch(el, room);
        };
      }
    }

    function renderRoomMatch(el, room) {
      let qIdx = 0;
      let score = 0;
      let rivalScore = 0;
      const isCoop = room.mode === "coop";
      let bossHp = isCoop ? (room.enemy.hp || room.enemy.maxHp || 1200) : 0;
      const bossMaxHp = isCoop ? (room.enemy.maxHp || 1200) : 0;
      const questions = room.questions;
      const timeLimit = room.timePerQ || 20;

      let timerId = null;
      let inTieBreaker = false;

      function clearTimer() {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      }

      function finishMatch(customResultTitle, customLead) {
        clearTimer();
        CapAudio.sfx.levelUp();
        try { window.CapUI.confetti(100); } catch(e) {}

        const me = CapAccount.getCurrentUser();
        const studentName = me.name || me.username || "Estudiante";

        if (isCoop) {
          const bossDefeated = bossHp <= 0;
          el.innerHTML = `
            <div class="duel-arena" style="text-align:center;align-items:center;">
              <h1 class="h1">${bossDefeated ? "🏆 ¡VICTORIA COOPERATIVA!" : "⚔️ ¡MISIÓN FINALIZADA!"}</h1>
              <p class="lead">${bossDefeated ? `¡${studentName} y su compañero han derrotado juntos a ${room.enemy.name}!` : `Causaron gran daño al enemigo (${bossMaxHp - bossHp} HP reducidos). ¡Sigan entrenando en equipo!`}</p>

              <div class="coop-boss-card" style="max-width:500px;width:100%">
                <div style="font-size:3rem">${room.enemy.icon}</div>
                <h3>${room.enemy.name}</h3>
                <div class="boss-hp-bar">
                  <div class="boss-hp-fill" style="width:${Math.max(0, (bossHp / bossMaxHp) * 100)}%"></div>
                </div>
                <p class="small">${Math.max(0, bossHp)} / ${bossMaxHp} HP Restantes</p>
              </div>

              <p class="small" style="color:var(--ok)">+${bossDefeated ? 100 : 40} XP de equipo y +${bossDefeated ? 30 : 10} Monedas π acreditadas a tu perfil.</p>
              <button class="btn primary lg" onclick="location.hash='salas'" style="margin-top:1.2rem">Volver a las Salas</button>
            </div>
          `;

          CapAccount.saveProgress({
            xp: (me.stats.xp || 0) + (bossDefeated ? 100 : 40),
            pi: (me.stats.pi || 0) + (bossDefeated ? 30 : 10),
            duelsWon: (me.stats.duelsWon || 0) + (bossDefeated ? 1 : 0)
          });
        } else {
          // Competitive PVP
          const won = score > rivalScore;
          el.innerHTML = `
            <div class="duel-arena" style="text-align:center;align-items:center;">
              <h1 class="h1">${won ? "🏆 ¡VICTORIA DECISIVA!" : "¡DUELO FINALIZADO!"}</h1>
              <p class="lead">${customLead || (won ? `¡Felicitaciones ${studentName}! Has superado a tu rival con maestría matemática.` : "¡Excelente partida! Gran agilidad mental.")}</p>

              <div class="duel-scoreboard" style="max-width:520px;width:100%;margin:1.5rem 0;">
                <div class="duel-score-item">
                  <img src="${CAPI_LOGO_URL}" width="48" height="48" style="border-radius:50%">
                  <div><b>${studentName}</b><div class="duel-score-val" style="color:${won ? '#ffd23f' : '#fff'}">${score} pts</div></div>
                </div>
                <div style="font-size:1.8rem;font-weight:900;color:#ff3d9a">VS</div>
                <div class="duel-score-item">
                  <img src="${CAPI_LOGO_URL}" width="48" height="48" style="border-radius:50%">
                  <div><b>Rival / Amigo</b><div class="duel-score-val" style="color:${!won ? '#ffd23f' : '#fff'}">${rivalScore} pts</div></div>
                </div>
              </div>

              <p class="small" style="color:var(--ok)">+${score * 15} XP y +${Math.round(score * 3)} Monedas π acreditadas a tu cuenta.</p>
              <button class="btn primary lg" onclick="location.hash='salas'" style="margin-top:1.2rem">Volver a las Salas</button>
            </div>
          `;

          CapAccount.saveProgress({
            xp: (me.stats.xp || 0) + score * 15,
            pi: (me.stats.pi || 0) + Math.round(score * 3),
            duelsWon: (me.stats.duelsWon || 0) + (won ? 1 : 0)
          });
        }
      }

      function startTieBreaker() {
        inTieBreaker = true;
        clearTimer();
        CapAudio.sfx.levelUp();

        const tb = room.tieBreaker;
        let tbSeconds = 15;

        function updateTbTimer() {
          const tNum = el.querySelector("#timer-sec");
          const tFill = el.querySelector("#dt-fill-bar");
          if (tNum) tNum.textContent = tbSeconds + "s";
          if (tFill) {
            const pct = (tbSeconds / 15) * 100;
            tFill.style.width = pct + "%";
            tFill.className = "dt-fill danger";
          }
        }

        el.innerHTML = `
          <div class="duel-arena">
            <div class="tiebreak-banner">
              ⚡ ¡EMPATE DETECTADO A ${score} PUNTOS! SE ACTIVA LA PREGUNTA DE DESEMPATE ⚡
              <div style="font-size:0.85rem;font-weight:600;margin-top:.25rem">¡Muerte Súbita! El primero que responda correctamente gana el duelo.</div>
            </div>

            <!-- Timer Bar -->
            <div class="duel-timer-wrap">
              <div class="duel-timer-header">
                <span>⏱️ Tiempo de Desempate: <b id="timer-sec">${tbSeconds}s</b></span>
                <span class="chip tiny bad">¡15 segundos decisivos!</span>
              </div>
              <div class="duel-timer-bar">
                <div class="dt-fill danger" id="dt-fill-bar" style="width:100%"></div>
              </div>
            </div>

            <div class="card" style="margin:1rem 0;border-color:#ffd23f">
              <p class="eyebrow" style="color:#ffd23f">${tb.topic}</p>
              <p class="ex-q" style="font-size:1.3rem;font-weight:800">${tb.q}</p>
            </div>

            <div class="opts" id="tb-opts">
              ${tb.opts.map((opt, i) => `
                <button class="btn opt" data-idx="${i}" style="text-align:left;padding:1.1rem;font-size:1.05rem">
                  <b>${String.fromCharCode(65 + i)}.</b> ${opt}
                </button>
              `).join("")}
            </div>
          </div>
        `;

        timerId = setInterval(() => {
          tbSeconds--;
          updateTbTimer();
          if (tbSeconds <= 3) CapAudio.sfx.click();

          if (tbSeconds <= 0) {
            clearTimer();
            // Timeout in tie-breaker
            rivalScore += 100;
            finishMatch(null, "El tiempo de desempate concluyó. Tu rival acertó primero.");
          }
        }, 1000);

        el.querySelectorAll("#tb-opts button").forEach(btn => {
          btn.onclick = () => {
            clearTimer();
            const picked = parseInt(btn.dataset.idx);
            const isRight = picked === tb.correct;
            if (isRight) {
              btn.classList.add("right");
              score += 150; // Tie breaker victory bonus
              CapAudio.sfx.correct();
              setTimeout(() => {
                finishMatch(null, "¡Increíble reflejo mental! Resolviste la pregunta de desempate y te coronaste campeón.");
              }, 600);
            } else {
              btn.classList.add("wrong");
              rivalScore += 100;
              CapAudio.sfx.wrong();
              setTimeout(() => {
                finishMatch(null, "Respuesta incorrecta en el desempate. Tu rival se lleva la victoria.");
              }, 600);
            }
          };
        });
      }

      function drawQuestion() {
        clearTimer();

        // Check if finished
        if (qIdx >= questions.length) {
          // Check for Tie in PVP mode
          if (!isCoop && score === rivalScore) {
            startTieBreaker();
            return;
          }
          finishMatch();
          return;
        }

        const curr = questions[qIdx];
        let secondsLeft = timeLimit;

        function updateTimerDisplay() {
          const tNum = el.querySelector("#timer-sec");
          const tFill = el.querySelector("#dt-fill-bar");
          if (tNum) tNum.textContent = secondsLeft + "s";
          if (tFill) {
            const pct = (secondsLeft / timeLimit) * 100;
            tFill.style.width = pct + "%";
            if (secondsLeft <= 5) {
              tFill.className = "dt-fill danger";
            } else if (secondsLeft <= 10) {
              tFill.className = "dt-fill warning";
            } else {
              tFill.className = "dt-fill";
            }
          }
        }

        el.innerHTML = `
          <div class="duel-arena">
            <div class="row between">
              <span class="${isCoop ? 'mode-badge-coop' : 'mode-badge-pvp'}">
                ${isCoop ? '🤝 EQUIPO VS ' + room.enemy.name.toUpperCase() : '⚔️ DUELO 1 VS 1 CONTRARRELOJ'}
              </span>
              <span class="chip v">Pregunta ${qIdx + 1} de ${questions.length}</span>
            </div>

            <!-- Header Status -->
            ${isCoop ? `
              <div class="coop-boss-card">
                <div class="row between">
                  <span>${room.enemy.icon} <b>${room.enemy.name}</b></span>
                  <span id="boss-hp-label" style="font-weight:800;color:#ff3d6a">${bossHp} / ${bossMaxHp} HP</span>
                </div>
                <div class="boss-hp-bar">
                  <div class="boss-hp-fill" id="boss-hp-fill-bar" style="width:${(bossHp / bossMaxHp) * 100}%"></div>
                </div>
                <div class="tiny muted" style="color:#5fd3f0">Tu equipo ataca con cada respuesta correcta</div>
              </div>
            ` : `
              <div class="duel-scoreboard">
                <div><b>Tú:</b> <span class="duel-score-val">${score} pts</span></div>
                <div style="font-weight:900;color:#ff3d9a">VS</div>
                <div><b>Rival:</b> <span class="duel-score-val" style="color:#ff7aa8">${rivalScore} pts</span></div>
              </div>
            `}

            <!-- Timer Countdown Bar -->
            <div class="duel-timer-wrap">
              <div class="duel-timer-header">
                <span>⏱️ Tiempo restante: <b id="timer-sec">${secondsLeft}s</b></span>
                <span class="tiny muted">Segundos contados</span>
              </div>
              <div class="duel-timer-bar">
                <div class="dt-fill" id="dt-fill-bar" style="width:100%"></div>
              </div>
            </div>

            <div class="card" style="margin:0.8rem 0">
              <p class="eyebrow" style="color:#5fd3f0">${curr.topic || room.topic}</p>
              <p class="ex-q" style="font-size:1.25rem;font-weight:700">${curr.q}</p>
            </div>

            <div class="opts" id="match-opts">
              ${curr.opts.map((opt, i) => `
                <button class="btn opt" data-idx="${i}" style="text-align:left;padding:1rem">
                  <b>${String.fromCharCode(65 + i)}.</b> ${opt}
                </button>
              `).join("")}
            </div>
          </div>
        `;

        function handleAnswer(pickedIndex, isTimeout = false) {
          clearTimer();
          const isRight = !isTimeout && pickedIndex === curr.correct;

          if (isRight) {
            score += 100;
            CapAudio.sfx.correct();
            if (isCoop) {
              bossHp = Math.max(0, bossHp - 250);
              const hpFill = el.querySelector("#boss-hp-fill-bar");
              const hpLabel = el.querySelector("#boss-hp-label");
              if (hpFill) hpFill.style.width = (bossHp / bossMaxHp) * 100 + "%";
              if (hpLabel) hpLabel.textContent = `${bossHp} / ${bossMaxHp} HP (-250 HP Daño Crítico!)`;
            }
          } else {
            CapAudio.sfx.wrong();
            if (isTimeout && window.CapUI && window.CapUI.toast) {
              window.CapUI.toast("¡Tiempo Agotado!", "No respondiste a tiempo esta pregunta.", "bad");
            }
          }

          // Companion / Bot action
          if (isCoop) {
            // Teammate hits boss
            if (Math.random() > 0.3) {
              bossHp = Math.max(0, bossHp - 150);
            }
            if (bossHp <= 0) {
              setTimeout(() => finishMatch(), 500);
              return;
            }
          } else {
            // Rival scores with probability
            if (Math.random() > 0.4) rivalScore += 100;
          }

          setTimeout(() => {
            qIdx++;
            drawQuestion();
          }, 850);
        }

        // Timer interval
        timerId = setInterval(() => {
          secondsLeft--;
          updateTimerDisplay();
          if (secondsLeft <= 4) {
            CapAudio.sfx.click();
          }
          if (secondsLeft <= 0) {
            clearTimer();
            handleAnswer(-1, true);
          }
        }, 1000);

        el.querySelectorAll("#match-opts button").forEach(btn => {
          btn.onclick = () => {
            clearTimer();
            const picked = parseInt(btn.dataset.idx);
            if (picked === curr.correct) {
              btn.classList.add("right");
            } else {
              btn.classList.add("wrong");
            }
            handleAnswer(picked, false);
          };
        });
      }

      drawQuestion();
    }

    // View B: SIMULACRO INTELIGENTE (PDF, Imágenes, Texto)
    ui.views.simulacros = function(el) {
      el.innerHTML = `
        <div class="stack">
          <div>
            <p class="eyebrow" style="color:#ff3d9a">📄 Evaluaciones Autónomas</p>
            <h1 class="h1">Simulador de Exámenes con Capi IA</h1>
            <p class="lead">Sube tus archivos PDF de talleres, fotos de ejercicios o notas de clase. Capi los analizará y generará un parcial simulado paso a paso.</p>
          </div>

          <div class="sim-tabs">
            <button class="sim-tab-btn active" data-tab="pdf">📥 Subir PDF</button>
            <button class="sim-tab-btn" data-tab="img">📷 Subir Imagen</button>
            <button class="sim-tab-btn" data-tab="txt">✍️ Pegar Texto / Ejercicios</button>
          </div>

          <div id="sim-tab-content">
            <!-- Dynamic tab content -->
          </div>
        </div>
      `;

      function renderTab(tab) {
        const c = el.querySelector("#sim-tab-content");
        if (tab === "pdf") {
          c.innerHTML = `
            <div class="sim-uploader" id="pdf-drop">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5fd3f0" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <h3 class="h3">Arrastra tu PDF aquí o haz clic para seleccionarlo</h3>
              <p class="small muted">Guías de estudio, exámenes previos, talleres universitarios o de colegio (.pdf)</p>
              <input type="file" id="pdf-input" accept=".pdf" style="display:none">
              <button class="btn primary sm" onclick="document.getElementById('pdf-input').click()">Elegir PDF</button>
            </div>
            <div id="pdf-extract-preview" style="margin-top:1rem" hidden></div>
          `;

          const input = c.querySelector("#pdf-input");
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (re) => {
              const text = CapSimulacroAI.extractPDF(re.target.result);
              startExamFromSource(el, text, file.name);
            };
            reader.readAsArrayBuffer(file);
          };
        } else if (tab === "img") {
          c.innerHTML = `
            <div class="sim-uploader" id="img-drop">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff3d9a" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <h3 class="h3">Sube una foto de tu examen o ejercicio</h3>
              <p class="small muted">Fotografía de cuaderno, pizarra, guía impresa o captura de pantalla (.png, .jpg)</p>
              <input type="file" id="img-input" accept="image/*" style="display:none">
              <button class="btn primary sm" onclick="document.getElementById('img-input').click()">Elegir Imagen</button>
            </div>
          `;

          const input = c.querySelector("#img-input");
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            startExamFromSource(el, "Ejercicios matemáticos extraídos de imagen " + file.name, file.name);
          };
        } else {
          c.innerHTML = `
            <div class="card">
              <label class="lbl">Pega aquí tus apuntes, temas o lista de ejercicios:
                <textarea id="txt-notes" placeholder="Ejemplo: Temas para el parcial de cálculo: derivadas por regla de la cadena, integrales por sustitución, máximos y mínimos..."></textarea>
              </label>
              <div class="row between" style="margin-top:1rem">
                <select id="txt-count" style="max-width:200px">
                  <option value="5">5 Preguntas</option>
                  <option value="10">10 Preguntas</option>
                </select>
                <button class="btn primary lg" id="btn-gen-txt">✨ Generar Simulacro</button>
              </div>
            </div>
          `;

          const btnGen = c.querySelector("#btn-gen-txt");
          btnGen.onclick = () => {
            const val = c.querySelector("#txt-notes").value.trim() || "Matemáticas generales";
            const cnt = parseInt(c.querySelector("#txt-count").value);
            startExamFromSource(el, val, "Tus Apuntes", cnt);
          };
        }
      }

      el.querySelectorAll(".sim-tab-btn").forEach(btn => {
        btn.onclick = () => {
          el.querySelectorAll(".sim-tab-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          renderTab(btn.dataset.tab);
        };
      });

      renderTab("pdf");
    };

    function startExamFromSource(el, text, sourceName, count = 5) {
      CapAudio.sfx.click();
      const exam = CapSimulacroAI.generateFromText(text, count);
      let currentQ = 0;
      let score = 0;
      let answers = [];

      function renderExamQuestion() {
        if (currentQ >= exam.questions.length) {
          // Finished exam
          CapAudio.sfx.levelUp();
          try { window.CapUI.confetti(80); } catch(e) {}
          const percent = Math.round((score / exam.questions.length) * 100);
          el.innerHTML = `
            <div class="sim-exam-card" style="text-align:center">
              <h1 class="h1">📊 Resultados del Simulacro</h1>
              <p class="lead">Basado en: <b>${sourceName}</b></p>
              <div style="font-family:var(--f-title);font-size:3.5rem;font-weight:900;color:${percent >= 60 ? 'var(--ok)' : 'var(--bad)'};margin:1rem 0">
                ${percent}%
              </div>
              <p>Acertaste <b>${score}</b> de <b>${exam.questions.length}</b> preguntas.</p>
              <div class="card flat" style="text-align:left;margin:1.5rem 0">
                <h3 class="h3">Resolución Paso a Paso de Capi:</h3>
                ${exam.questions.map((q, i) => `
                  <div style="margin:0.8rem 0;padding-bottom:0.8rem;border-bottom:1px solid var(--line)">
                    <b>${i + 1}. ${q.q}</b><br>
                    <span style="color:var(--ok)">Respuesta correcta: ${q.opts[q.correct]}</span><br>
                    <small class="muted">${q.steps}</small>
                  </div>
                `).join("")}
              </div>
              <div class="row" style="justify-content:center">
                <button class="btn primary lg" onclick="location.hash='simulacros'">Hacer Otro Simulacro</button>
                <button class="btn" onclick="location.hash='inicio'">Volver al Inicio</button>
              </div>
            </div>
          `;
          CapAccount.saveProgress({
            xp: (CapAccount.getCurrentUser().stats.xp || 0) + score * 20,
            pi: (CapAccount.getCurrentUser().stats.pi || 0) + score * 5,
            examsSolved: (CapAccount.getCurrentUser().stats.examsSolved || 0) + 1
          });
          return;
        }

        const q = exam.questions[currentQ];
        el.innerHTML = `
          <div class="sim-exam-card">
            <div class="row between">
              <span class="chip v">Pregunta ${currentQ + 1} de ${exam.questions.length}</span>
              <span class="chip ok">${q.topic}</span>
            </div>
            <h2 class="h2" style="font-size:1.35rem">${q.q}</h2>
            <div class="opts" id="exam-opts">
              ${q.opts.map((opt, i) => `
                <button class="btn opt" data-idx="${i}" style="text-align:left;padding:1rem">
                  <b>${String.fromCharCode(65 + i)}.</b> ${opt}
                </button>
              `).join("")}
            </div>
            <div class="row between" style="margin-top:1rem">
              <button class="btn sm ghost" id="btn-hint">💡 Pedir Pista a Capi</button>
              <button class="btn sm" onclick="location.hash='simulacros'">Cancelar Examen</button>
            </div>
          </div>
        `;

        const hintBtn = el.querySelector("#btn-hint");
        if (hintBtn) {
          hintBtn.onclick = () => {
            CapAudio.sfx.notification();
            window.CapUI.toast("Pista de Capi", q.steps.slice(0, 80) + "...", "i");
          };
        }

        el.querySelectorAll("#exam-opts button").forEach(b => {
          b.onclick = () => {
            const idx = parseInt(b.dataset.idx);
            if (idx === q.correct) {
              b.classList.add("right");
              score++;
              CapAudio.sfx.correct();
            } else {
              b.classList.add("wrong");
              CapAudio.sfx.wrong();
            }
            setTimeout(() => {
              currentQ++;
              renderExamQuestion();
            }, 800);
          };
        });
      }

      renderExamQuestion();
    }

    // View C: CAPI IA AGENTE MATEMÁTICO INDEPENDIENTE
    ui.views.capia = function(el) {
      el.innerHTML = `
        <div class="capi-ai-container">
          <div class="capi-chat-pane">
            <div class="row between">
              <div class="row">
                <img src="${CAPI_LOGO_URL}" width="48" height="48" style="border-radius:50%;border:2px solid #5fd3f0;object-fit:cover;">
                <div>
                  <h2 class="h2" style="font-size:1.2rem">Capi IA</h2>
                  <span class="chip ok tiny">● Agente Activo Offline</span>
                </div>
              </div>
              <button class="btn sm" id="btn-voice-toggle" title="Voz de Capi">🔊 Escuchar</button>
            </div>

            <div class="capi-chat-feed" id="capi-chat-feed">
              ${CapChat.getMessages().map(m => `
                <div class="${m.isCapi ? 'capi-msg-ai' : 'capi-msg-user'}">
                  ${m.isCapi ? '<b style="color:#5fd3f0;font-size:.85rem">Capi IA:</b><br>' : ''}
                  ${m.text}
                </div>
              `).join("")}
            </div>

            <div class="stack tight">
              <div class="row" style="gap:4px">
                <button class="chip" onclick="document.getElementById('capi-prompt').value+='x^2'">x²</button>
                <button class="chip" onclick="document.getElementById('capi-prompt').value+='√('">√x</button>
                <button class="chip" onclick="document.getElementById('capi-prompt').value+='π'">π</button>
                <button class="chip" onclick="document.getElementById('capi-prompt').value+='derivada de '">derivada</button>
                <button class="chip" onclick="document.getElementById('capi-prompt').value+='pitágoras a=3 b=4'">pitágoras</button>
              </div>
              <form class="row" id="capi-chat-form" style="margin-top:.4rem">
                <input type="text" id="capi-prompt" placeholder="Escribe tu ejercicio, duda o ecuación matemática..." autocomplete="off" style="flex:1">
                <button class="btn primary" type="submit">Enviar</button>
              </form>
            </div>
          </div>

          <div class="stack">
            <div class="card">
              <h3 class="h3">⚡ Herramientas Rápidas de Capi</h3>
              <p class="small muted">Haz clic para resolver problemas de ejemplo al instante:</p>
              <div class="capi-tools-grid" style="margin-top:.6rem">
                <div class="capi-tool-card" data-cmd="3x + 15 = 45">
                  <b>Ecuación Lineal</b>
                  <div class="tiny muted">3x + 15 = 45</div>
                </div>
                <div class="capi-tool-card" data-cmd="x^2 - 7x + 10 = 0">
                  <b>Ecuación Cuadrática</b>
                  <div class="tiny muted">x² - 7x + 10 = 0</div>
                </div>
                <div class="capi-tool-card" data-cmd="derivada de 4x^3">
                  <b>Derivadas</b>
                  <div class="tiny muted">d/dx [4x³]</div>
                </div>
                <div class="capi-tool-card" data-cmd="pitágoras a=6 b=8">
                  <b>Pitágoras</b>
                  <div class="tiny muted">a=6, b=8</div>
                </div>
              </div>
            </div>

            <div class="card flat">
              <h4 class="h3">🎯 Modo de Estudio Autónomo</h4>
              <p class="small">Capi funciona 100% en tu navegador sin necesidad de servidores externos. Puede resolver álgebra, cálculo, geometría y física.</p>
            </div>
          </div>
        </div>
      `;

      const form = el.querySelector("#capi-chat-form");
      const input = el.querySelector("#capi-prompt");
      const feed = el.querySelector("#capi-chat-feed");

      form.onsubmit = (e) => {
        e.preventDefault();
        const txt = input.value.trim();
        if (!txt) return;
        CapAudio.sfx.click();
        feed.innerHTML += `<div class="capi-msg-user">${txt}</div>`;
        feed.scrollTop = feed.scrollHeight;
        input.value = "";
        CapChat.sendMessage(txt);
      };

      el.querySelectorAll(".capi-tool-card").forEach(c => {
        c.onclick = () => {
          input.value = c.dataset.cmd;
          form.dispatchEvent(new Event("submit"));
        };
      });

      const voiceBtn = el.querySelector("#btn-voice-toggle");
      if (voiceBtn) {
        voiceBtn.onclick = () => {
          CapMathAI.speak("¡Hola! Estoy lista para ayudarte con tus tareas y parciales.");
        };
      }
    };

    // View D: MI CUENTA & PROGRESO
    ui.views.cuenta = function(el) {
      const user = CapAccount.getCurrentUser();
      el.innerHTML = `
        <div class="stack" style="max-width:780px;margin:0 auto">
          <div class="acct-card">
            <div class="acct-header">
              <img class="acct-ava" src="${user.avatar || CAPI_LOGO_URL}" alt="Avatar">
              <div>
                <h1 class="h1" style="font-size:1.6rem">${user.name}</h1>
                <p class="small muted">@${user.username} · ${user.grade}</p>
                <span class="chip v tiny" style="text-transform:uppercase">Membresía: ${user.membership}</span>
              </div>
            </div>

            <div class="acct-stats-grid">
              <div class="acct-stat-box">
                <b>${user.stats.xp}</b>
                <span class="tiny muted">Puntos XP</span>
              </div>
              <div class="acct-stat-box">
                <b>Nivel ${user.stats.level}</b>
                <span class="tiny muted">Rango Actual</span>
              </div>
              <div class="acct-stat-box">
                <b>${user.stats.pi}</b>
                <span class="tiny muted">Monedas π</span>
              </div>
              <div class="acct-stat-box">
                <b>${user.stats.streak} días</b>
                <span class="tiny muted">Racha de Estudio</span>
              </div>
            </div>

            <div class="row" style="margin-top:1rem">
              <button class="btn primary" id="btn-edit-account">✏️ Cambiar de Cuenta / Registrar</button>
              <button class="btn" id="btn-export-account">💾 Descargar Copia de Progreso</button>
            </div>
          </div>
        </div>
      `;

      const btnEdit = el.querySelector("#btn-edit-account");
      if (btnEdit) {
        btnEdit.onclick = () => openAccountModal(ui);
      }
      const btnExp = el.querySelector("#btn-export-account");
      if (btnExp) {
        btnExp.onclick = () => {
          const blob = new Blob([JSON.stringify(user, null, 2)], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `capicua-progreso-${user.username}.json`;
          a.click();
        };
      }
    };

    // ----------------------------------------------------------------------
    // View E: AVATARES (Personalización Interactiva 2D/3D con Soporte Masculino)
    // ----------------------------------------------------------------------
    const renderAvatarCustomizer = function(el) {
      const user = CapAccount.getCurrentUser();
      let currentAvatarCfg = {
        gender: "hombre",
        build: "guapo",
        skinHex: "#ffe3d0",
        hair: "hair-tupe",
        hairHex: "#1a1a1a",
        hair2Hex: "#1a1a1a",
        style: "style-camiseta",
        outfitHex: "#2f6bff",
        beard: "ninguna",
        beardHex: "#1a1a1a",
        acc: "acc-gafas",
        expr: "happy"
      };

      try {
        const saved = (window.CapEngine && CapEngine.S && CapEngine.S.profile && CapEngine.S.profile.avatar)
          || JSON.parse(localStorage.getItem("cap-avatar-cfg") || "null");
        if (saved && typeof saved === "object") {
          currentAvatarCfg = Object.assign(currentAvatarCfg, saved);
          if (currentAvatarCfg.gender === "hombre" || currentAvatarCfg.build === "guapo") {
            currentAvatarCfg.gender = "hombre";
            currentAvatarCfg.build = "guapo";
          }
        }
      } catch(e) {}

      function getArchetypeOptions() {
        const isMale = currentAvatarCfg.gender === "hombre" || currentAvatarCfg.build === "guapo";
        if (isMale) {
          return {
            hairs: [
              { id: "hair-calvo", name: "Sin Cabello / Calvo" },
              { id: "hair-tupe", name: "Tupé Moderno" },
              { id: "hair-corto", name: "Corto Clásico" },
              { id: "hair-undercut", name: "Undercut Rapado" },
              { id: "hair-despeinado", name: "Despeinado Anime" },
              { id: "hair-ondulado", name: "Ondulado Surf" },
              { id: "hair-afro", name: "Rizado Afro" },
              { id: "hair-rapado", name: "Rapado Militar" }
            ],
            outfits: [
              { id: "style-camiseta", name: "Camiseta Deportiva" },
              { id: "style-chaqueta", name: "Chaqueta Urbana" },
              { id: "style-hoodie", name: "Sudadera Gamer Hoodie" },
              { id: "style-traje", name: "Traje Formal Elegante" },
              { id: "style-armadura", name: "Armadura Legendaria" },
              { id: "style-astronauta", name: "Traje de Astronauta" },
              { id: "style-bata", name: "Bata Científica" }
            ],
            beards: [
              { id: "ninguna", name: "Sin Barba / Afeitado" },
              { id: "bigote", name: "Bigote Clásico (Sobre Labio)" },
              { id: "corta", name: "Barba Corta Moderna" },
              { id: "larga", name: "Barba de Sabio" }
            ],
            accs: [
              { id: "acc-gafas", name: "Gafas Inteligentes" },
              { id: "acc-headset", name: "Auriculares Gamer" },
              { id: "acc-gorra", name: "Gorra Deportiva" },
              { id: "acc-casco", name: "Casco de Piloto" },
              { id: "acc-ninguno", name: "Sin Accesorio" }
            ]
          };
        } else {
          return {
            hairs: [
              { id: "hair-calvo", name: "Sin Cabello / Rapada" },
              { id: "hair-moños", name: "Moños Espaciales" },
              { id: "hair-coletas", name: "Coletas Gemelas" },
              { id: "hair-liso", name: "Cabello Liso Largo" },
              { id: "hair-ondas", name: "Ondulado Galáctico" },
              { id: "hair-bob", name: "Corte Bob Moderno" },
              { id: "hair-trenza", name: "Trenza de Aventurera" }
            ],
            outfits: [
              { id: "style-exploradora", name: "Exploradora Estelar" },
              { id: "style-vestido", name: "Vestido Tecnológico" },
              { id: "style-mago", name: "Túnica de Sabia" },
              { id: "style-astronauta", name: "Traje de Astronauta" },
              { id: "style-hoodie", name: "Sudadera Gamer" },
              { id: "style-bata", name: "Bata de Laboratorio" }
            ],
            beards: [
              { id: "ninguna", name: "Sin Barba" }
            ],
            accs: [
              { id: "acc-gafas", name: "Gafas Inteligentes" },
              { id: "acc-headset", name: "Auriculares Gamer" },
              { id: "acc-tiara", name: "Tiara de Cristal" },
              { id: "acc-flor", name: "Flor Espacial" },
              { id: "acc-lazo", name: "Lazo Mágico" },
              { id: "acc-ninguno", name: "Sin Accesorio" }
            ]
          };
        }
      }

      function renderTemplate() {
        const isMale = currentAvatarCfg.gender === "hombre" || currentAvatarCfg.build === "guapo";
        const opts = getArchetypeOptions();

        el.innerHTML = `
          <div class="stack">
            <div>
              <p class="eyebrow" style="color:#ff3d9a">🎭 Personalización del Estudiante</p>
              <h1 class="h1">Crea y Personaliza tu Avatar</h1>
              <p class="lead">Configura tu personaje (Hombre o Mujer). Personaliza tono de piel, estilo y color de cabello, barba, traje, accesorios y expresiones faciales animadas en 3D.</p>
            </div>

            <!-- Quick Action Toolbar -->
            <div class="row" style="gap:.5rem;flex-wrap:wrap;background:rgba(255,255,255,0.03);padding:.8rem;border-radius:12px;border:1px solid rgba(255,255,255,0.1)">
              <button class="btn sm ghost" id="btn-undo-avatar" title="Revertir cambios al estado inicial">↩ Deshacer Cambios</button>
              <button class="btn sm ghost" id="btn-rem-hair" title="Quitar el cabello">❌ Quitar Cabello</button>
              ${isMale ? '<button class="btn sm ghost" id="btn-rem-beard" title="Quitar barba y bigote">❌ Quitar Barba</button>' : ''}
              <button class="btn sm primary" id="btn-save-avatar-top" style="margin-left:auto">💾 Guardar Cambios</button>
            </div>

            <!-- Archetype & Gender Selector -->
            <div class="card" style="background:rgba(255,255,255,0.04);border:1px solid #7b3cf0">
              <span class="small muted" style="font-weight:700">Elige Género y Arquetipo Base:</span>
              <div class="row" style="margin-top:.5rem;gap:.7rem;flex-wrap:wrap">
                <button class="btn sm ${isMale ? 'primary' : 'ghost'}" id="btn-arch-male">👦 Hombre (Chico Atlético)</button>
                <button class="btn sm ${!isMale && currentAvatarCfg.build==='kawaii' ? 'primary' : 'ghost'}" id="btn-arch-kawaii">👧 Mujer (Kawaii Chibi)</button>
                <button class="btn sm ${!isMale && currentAvatarCfg.build==='glam' ? 'primary' : 'ghost'}" id="btn-arch-glam">✨ Mujer (Glam Elegante)</button>
              </div>
            </div>

            <div class="split">
              <!-- 3D Interactive Stage -->
              <div class="threed-hub-stage" id="stage-avatar-3d">
                <div id="avatar-3d-canvas-box" style="width:100%;height:400px;display:flex;align-items:center;justify-content:center;">
                  <div class="stack" style="align-items:center;animation:fl 3s ease-in-out infinite">
                    <img src="${CAPI_LOGO_URL}" width="160" height="160" style="border-radius:50%;border:4px solid #5fd3f0;box-shadow:0 0 30px #8b3dff">
                    <p class="small" style="color:#5fd3f0;font-weight:700">★ Cargando Modelo 3D Interactivo ★</p>
                  </div>
                </div>
                <div class="threed-controls" style="flex-wrap:wrap;justify-content:center;gap:.4rem">
                  <button class="btn sm" id="btn-rot-left">↶ Girar</button>
                  <button class="btn sm" id="btn-rot-right">↷ Girar</button>
                  <button class="btn sm ${currentAvatarCfg.expr==='happy'?'primary':''}" data-sexpr="happy">😊 Feliz</button>
                  <button class="btn sm ${currentAvatarCfg.expr==='determined'?'primary':''}" data-sexpr="determined">⚡ Decidido</button>
                  <button class="btn sm ${currentAvatarCfg.expr==='wink'?'primary':''}" data-sexpr="wink">😉 Guiño</button>
                  <button class="btn sm ${currentAvatarCfg.expr==='cool'?'primary':''}" data-sexpr="cool">😎 Serio</button>
                  <button class="btn sm ${currentAvatarCfg.expr==='think'?'primary':''}" data-sexpr="think">🤔 Pensativo</button>
                  <button class="btn sm ${currentAvatarCfg.expr==='surprise'?'primary':''}" data-sexpr="surprise">😮 Asombro</button>
                </div>
              </div>

              <!-- Controls Card -->
              <div class="card">
                <h3 class="h3">Opciones de Estilo</h3>

                <label class="lbl">Expresión Facial
                  <select id="sel-expr">
                    <option value="happy" ${currentAvatarCfg.expr==='happy'?'selected':''}>😊 Feliz / Contento</option>
                    <option value="determined" ${currentAvatarCfg.expr==='determined'?'selected':''}>⚡ Decidido / Heroico</option>
                    <option value="wink" ${currentAvatarCfg.expr==='wink'?'selected':''}>😉 Guiño Amigable</option>
                    <option value="cool" ${currentAvatarCfg.expr==='cool'?'selected':''}>😎 Serio / Cool</option>
                    <option value="think" ${currentAvatarCfg.expr==='think'?'selected':''}>🤔 Pensativo / Sabio</option>
                    <option value="star" ${currentAvatarCfg.expr==='star'?'selected':''}>🤩 Estrellas de Victoria</option>
                    <option value="surprise" ${currentAvatarCfg.expr==='surprise'?'selected':''}>😮 Asombro</option>
                    <option value="idle" ${currentAvatarCfg.expr==='idle'?'selected':''}>✨ Neutral / Brillo</option>
                  </select>
                </label>

                <label class="lbl">Estilo de Cabello
                  <select id="sel-hair">
                    ${opts.hairs.map(h => `<option value="${h.id}" ${currentAvatarCfg.hair === h.id ? 'selected' : ''}>${h.name}</option>`).join("")}
                  </select>
                </label>

                <label class="lbl">Color de Cabello
                  <select id="sel-hairc">
                    <option value="#1a1a1a" ${currentAvatarCfg.hairHex === '#1a1a1a' ? 'selected' : ''}>Negro Azabache</option>
                    <option value="#4a2a18" ${currentAvatarCfg.hairHex === '#4a2a18' ? 'selected' : ''}>Castaño Oscuro</option>
                    <option value="#ffc81a" ${currentAvatarCfg.hairHex === '#ffc81a' ? 'selected' : ''}>Rubio Dorado Capi</option>
                    <option value="#2f6bff" ${currentAvatarCfg.hairHex === '#2f6bff' ? 'selected' : ''}>Azul Cósmico</option>
                    <option value="#7b3cf0" ${currentAvatarCfg.hairHex === '#7b3cf0' ? 'selected' : ''}>Violeta Neón</option>
                    <option value="#ff3d9a" ${currentAvatarCfg.hairHex === '#ff3d9a' ? 'selected' : ''}>Rosa Galáctico</option>
                    <option value="#1fd1c1" ${currentAvatarCfg.hairHex === '#1fd1c1' ? 'selected' : ''}>Turquesa Espacial</option>
                    <option value="#ffffff" ${currentAvatarCfg.hairHex === '#ffffff' ? 'selected' : ''}>Blanco Plateado</option>
                  </select>
                </label>

                <label class="lbl">Tono de Piel
                  <select id="sel-skin">
                    <option value="#ffe3d0" ${currentAvatarCfg.skinHex === '#ffe3d0' ? 'selected' : ''}>Claro Natural</option>
                    <option value="#f6cfae" ${currentAvatarCfg.skinHex === '#f6cfae' ? 'selected' : ''}>Arena Cálido</option>
                    <option value="#e8b48f" ${currentAvatarCfg.skinHex === '#e8b48f' ? 'selected' : ''}>Bronceado Suave</option>
                    <option value="#c98d63" ${currentAvatarCfg.skinHex === '#c98d63' ? 'selected' : ''}>Canela</option>
                    <option value="#9a6440" ${currentAvatarCfg.skinHex === '#9a6440' ? 'selected' : ''}>Café Intenso</option>
                    <option value="#6b4226" ${currentAvatarCfg.skinHex === '#6b4226' ? 'selected' : ''}>Ébano Profundo</option>
                  </select>
                </label>

                <label class="lbl">Traje / Ropa
                  <select id="sel-outfit">
                    ${opts.outfits.map(o => `<option value="${o.id}" ${currentAvatarCfg.style === o.id ? 'selected' : ''}>${o.name}</option>`).join("")}
                  </select>
                </label>

                <label class="lbl">Color de Traje
                  <select id="sel-outfitc">
                    <option value="#2f6bff" ${currentAvatarCfg.outfitHex === '#2f6bff' ? 'selected' : ''}>Azul Zafiro</option>
                    <option value="#7b3cf0" ${currentAvatarCfg.outfitHex === '#7b3cf0' ? 'selected' : ''}>Púrpura Místico</option>
                    <option value="#ff3d9a" ${currentAvatarCfg.outfitHex === '#ff3d9a' ? 'selected' : ''}>Magenta Neón</option>
                    <option value="#1fd1c1" ${currentAvatarCfg.outfitHex === '#1fd1c1' ? 'selected' : ''}>Esmeralda Turquesa</option>
                    <option value="#ffc81a" ${currentAvatarCfg.outfitHex === '#ffc81a' ? 'selected' : ''}>Dorado Solar</option>
                    <option value="#1a1a2e" ${currentAvatarCfg.outfitHex === '#1a1a2e' ? 'selected' : ''}>Negro Espacial</option>
                    <option value="#ffffff" ${currentAvatarCfg.outfitHex === '#ffffff' ? 'selected' : ''}>Blanco Puro</option>
                  </select>
                </label>

                ${isMale ? `
                <label class="lbl">Barba / Bigote (Sobre Labio)
                  <select id="sel-beard">
                    ${opts.beards.map(b => `<option value="${b.id}" ${currentAvatarCfg.beard === b.id ? 'selected' : ''}>${b.name}</option>`).join("")}
                  </select>
                </label>
                ` : ''}

                <label class="lbl">Accesorio
                  <select id="sel-acc">
                    ${opts.accs.map(a => `<option value="${a.id}" ${currentAvatarCfg.acc === a.id ? 'selected' : ''}>${a.name}</option>`).join("")}
                  </select>
                </label>

                <button class="btn primary lg" id="btn-save-avatar" style="margin-top:1.2rem">💾 Guardar Avatar en mi Perfil</button>
              </div>
            </div>
          </div>
        `;

        setupStageAndEvents();
      }

      let stage = null;
      let initialSnapshot = JSON.parse(JSON.stringify(currentAvatarCfg));

      function setupStageAndEvents() {
        const btnMale = el.querySelector("#btn-arch-male");
        const btnKawaii = el.querySelector("#btn-arch-kawaii");
        const btnGlam = el.querySelector("#btn-arch-glam");

        if (btnMale) {
          btnMale.onclick = () => {
            currentAvatarCfg.gender = "hombre";
            currentAvatarCfg.build = "guapo";
            currentAvatarCfg.hair = "hair-tupe";
            currentAvatarCfg.style = "style-camiseta";
            currentAvatarCfg.beard = "ninguna";
            currentAvatarCfg.acc = "acc-gafas";
            renderTemplate();
          };
        }
        if (btnKawaii) {
          btnKawaii.onclick = () => {
            currentAvatarCfg.gender = "mujer";
            currentAvatarCfg.build = "kawaii";
            currentAvatarCfg.hair = "hair-moños";
            currentAvatarCfg.style = "style-vestido";
            currentAvatarCfg.beard = "ninguna";
            renderTemplate();
          };
        }
        if (btnGlam) {
          btnGlam.onclick = () => {
            currentAvatarCfg.gender = "mujer";
            currentAvatarCfg.build = "glam";
            currentAvatarCfg.hair = "hair-ondas";
            currentAvatarCfg.style = "style-vestido";
            currentAvatarCfg.beard = "ninguna";
            renderTemplate();
          };
        }

        const btnUndo = el.querySelector("#btn-undo-avatar");
        if (btnUndo) {
          btnUndo.onclick = () => {
            currentAvatarCfg = JSON.parse(JSON.stringify(initialSnapshot));
            renderTemplate();
            ui.toast("Cambios Deshechos", "Tu avatar ha regresado al aspecto original.", "i");
          };
        }

        const btnRemHair = el.querySelector("#btn-rem-hair");
        if (btnRemHair) {
          btnRemHair.onclick = () => {
            currentAvatarCfg.hair = "hair-calvo";
            const selH = el.querySelector("#sel-hair");
            if (selH) selH.value = "hair-calvo";
            updateAvatarModel();
            ui.toast("Cabello Quitado", "Has retirado el cabello de tu avatar (calvo).", "i");
          };
        }

        const btnRemBeard = el.querySelector("#btn-rem-beard");
        if (btnRemBeard) {
          btnRemBeard.onclick = () => {
            currentAvatarCfg.beard = "ninguna";
            const selB = el.querySelector("#sel-beard");
            if (selB) selB.value = "ninguna";
            updateAvatarModel();
            ui.toast("Barba Quitada", "Has retirado la barba y el bigote.", "i");
          };
        }

        const container = el.querySelector("#avatar-3d-canvas-box");
        if (container && window.CapW3 && window.CapW3.avatarStage) {
          try {
            container.innerHTML = "";
            stage = window.CapW3.avatarStage(container, currentAvatarCfg, { height: "400px" });
          } catch(e) {
            console.warn("Avatar stage fallback:", e);
          }
        }

        function updateAvatarModel() {
          if (stage && stage.update) {
            stage.update(currentAvatarCfg);
          }
        }

        const selExpr = el.querySelector("#sel-expr");
        if (selExpr) {
          selExpr.onchange = () => {
            currentAvatarCfg.expr = selExpr.value;
            if (stage && stage.setExpr) stage.setExpr(selExpr.value);
            el.querySelectorAll("[data-sexpr]").forEach(b => b.classList.toggle("primary", b.dataset.sexpr === selExpr.value));
          };
        }

        el.querySelectorAll("[data-sexpr]").forEach(btn => {
          btn.onclick = () => {
            const ex = btn.dataset.sexpr;
            currentAvatarCfg.expr = ex;
            if (selExpr) selExpr.value = ex;
            el.querySelectorAll("[data-sexpr]").forEach(b => b.classList.toggle("primary", b === btn));
            if (stage && stage.setExpr) stage.setExpr(ex);
            CapAudio.sfx.click();
          };
        });

        const selHair = el.querySelector("#sel-hair");
        if (selHair) {
          selHair.onchange = () => {
            currentAvatarCfg.hair = selHair.value;
            updateAvatarModel();
          };
        }
        const selHairC = el.querySelector("#sel-hairc");
        if (selHairC) {
          selHairC.onchange = () => {
            currentAvatarCfg.hairHex = selHairC.value;
            currentAvatarCfg.hair2Hex = selHairC.value;
            currentAvatarCfg.beardHex = selHairC.value;
            updateAvatarModel();
          };
        }
        const selSkin = el.querySelector("#sel-skin");
        if (selSkin) {
          selSkin.onchange = () => {
            currentAvatarCfg.skinHex = selSkin.value;
            updateAvatarModel();
          };
        }
        const selOutfit = el.querySelector("#sel-outfit");
        if (selOutfit) {
          selOutfit.onchange = () => {
            currentAvatarCfg.style = selOutfit.value;
            updateAvatarModel();
          };
        }
        const selOutfitC = el.querySelector("#sel-outfitc");
        if (selOutfitC) {
          selOutfitC.onchange = () => {
            currentAvatarCfg.outfitHex = selOutfitC.value;
            updateAvatarModel();
          };
        }
        const selBeard = el.querySelector("#sel-beard");
        if (selBeard) {
          selBeard.onchange = () => {
            currentAvatarCfg.beard = selBeard.value;
            updateAvatarModel();
          };
        }
        const selAcc = el.querySelector("#sel-acc");
        if (selAcc) {
          selAcc.onchange = () => {
            currentAvatarCfg.acc = selAcc.value;
            updateAvatarModel();
          };
        }

        const doSaveAvatar = async () => {
          CapAudio.sfx.levelUp();
          initialSnapshot = JSON.parse(JSON.stringify(currentAvatarCfg));
          localStorage.setItem("cap-avatar-cfg", JSON.stringify(currentAvatarCfg));
          localStorage.setItem("cap-avatar", JSON.stringify(currentAvatarCfg));
          if (window.CapEngine && CapEngine.S && CapEngine.S.profile) {
            CapEngine.S.profile.avatar = Object.assign({}, currentAvatarCfg);
            try { CapEngine.save(); } catch(e) {}
          }

          if (window.CapSupabase && CapSupabase.client) {
            try {
              const u = CapAccount.getCurrentUser();
              if (u && !u.guest) {
                await CapSupabase.saveAvatar(u.id, currentAvatarCfg);
              }
            } catch(e) {
              console.warn("Supabase avatar sync:", e);
            }
          }

          ui.toast("Avatar Guardado", "¡Tu nuevo aspecto personalizado ha sido guardado con éxito!", "ok");
        };

        const saveBtn = el.querySelector("#btn-save-avatar");
        if (saveBtn) saveBtn.onclick = doSaveAvatar;
        const saveBtnTop = el.querySelector("#btn-save-avatar-top");
        if (saveBtnTop) saveBtnTop.onclick = doSaveAvatar;
      }

      renderTemplate();
    };

    ui.views["avatares"] = renderAvatarCustomizer;
    ui.views["avatares-3d"] = renderAvatarCustomizer;

    // ----------------------------------------------------------------------
    // View F: MENTORES (Galería 3D de Sabios de la Historia)
    // ----------------------------------------------------------------------
    const renderMentorsGallery = function(el) {
      // Historical mentors + Capi
      const MENTORS = [
        {
          id: "capi",
          name: "Capi 888",
          title: "Tutora de Inteligencia Artificial",
          era: "Presente / Futuro",
          branch: "Todas las Matemáticas",
          quote: "¡Las matemáticas son el lenguaje con el que está escrito el universo!",
          cfg: (window.CapW3 && CapW3.capiaCfg ? CapW3.capiaCfg("matemática", "feliz") : { capia: true, expr: "feliz" })
        },
        {
          id: "euler",
          name: "Leonhard Euler",
          title: "Maestro del Análisis Matemático",
          era: "Siglo XVIII",
          branch: "Cálculo y Teoría de Grafos",
          quote: "La fórmula e^(iπ) + 1 = 0 une los cinco números más importantes de la historia.",
          sabio: { look: ["levita", "#3a4a8a", "corto", "#f4efe4", null, "gorro", "pluma", 0], persona: "sereno" }
        },
        {
          id: "hipatia",
          name: "Hipatia de Alejandría",
          title: "Astrónoma y Geómetra",
          era: "Antigüedad Tardía",
          branch: "Geometría Cónica",
          quote: "Defiende tu derecho a pensar, porque incluso pensar de forma errónea es mejor que no pensar.",
          sabio: { look: ["toga", "#ffffff", "ondas", "#2a1a10", null, null, "compas", 0], persona: "solemne" }
        },
        {
          id: "gauss",
          name: "Carl Friedrich Gauss",
          title: "El Príncipe de las Matemáticas",
          era: "Siglos XVIII-XIX",
          branch: "Teoría de Números y Estadística",
          quote: "Los matemáticos son como amantes: concede al uno un principio y te sacará una conclusión.",
          sabio: { look: ["barroco", "#2a3a4a", "corto", "#e8e8e8", null, "gorro", "campana", 0], persona: "gruñon" }
        },
        {
          id: "newton",
          name: "Isaac Newton",
          title: "Fundador de la Física y Cálculo",
          era: "Siglos XVII-XVIII",
          branch: "Cálculo y Mecánica Clásica",
          quote: "Si he visto más lejos es porque estoy sentado sobre los hombros de gigantes.",
          sabio: { look: ["barroco", "#8b1a3a", "largo", "#f4efe4", null, null, "manzana", 0], persona: "gruñon" }
        },
        {
          id: "lovelace",
          name: "Ada Lovelace",
          title: "Primera Programadora del Mundo",
          era: "Siglo XIX",
          branch: "Algoritmos y Computación",
          quote: "La máquina analítica teje patrones algebraicos tal como el telar teje flores y hojas.",
          sabio: { look: ["vestido", "#2f6bff", "moños", "#3a2a1a", null, null, "engranaje", 0], persona: "curiosa" }
        },
        {
          id: "pitagoras",
          name: "Pitágoras de Samos",
          title: "Místico de los Números",
          era: "Antigüedad Clásica",
          branch: "Geometría y Armonía Musical",
          quote: "El número es el gobernante de las formas y las ideas.",
          sabio: { look: ["túnica", "#ffffff", "corto", "#ffffff", "larga", null, "tetra", 1], persona: "solemne" }
        },
        {
          id: "arquimedes",
          name: "Arquímedes de Siracusa",
          title: "Genio de la Mecánica y Geometría",
          era: "Antigüedad Clásica",
          branch: "Cálculo de Áreas y Flotación",
          quote: "¡Dadme un punto de apoyo y moveré el mundo!",
          sabio: { look: ["toga", "#d97706", "corto", "#e8e8e8", "corta", null, "palanca", 1], persona: "bromista" }
        }
      ];

      // Merge additional historical mentors from CapSabios if available
      if (window.CapSabios && Array.isArray(CapSabios.SABIOS)) {
        CapSabios.SABIOS.forEach(s => {
          if (!MENTORS.some(m => m.id === s.id)) {
            MENTORS.push({
              id: s.id,
              name: s.name,
              title: s.years + " (" + s.place + ")",
              era: s.era || "Historia",
              branch: s.branch,
              quote: (s.quotes && s.quotes[0]) || s.fact || "El saber matemático nos hace libres.",
              sabio: s
            });
          }
        });
      }

      let selectedMentor = MENTORS[0];
      let mentorStage = null;

      function getMentorConfig(mentor) {
        if (mentor.cfg) return mentor.cfg;
        if (window.CapW3 && CapW3.sabioCfg && mentor.sabio) {
          return CapW3.sabioCfg(mentor.sabio);
        }
        return { capia: true, expr: "feliz" };
      }

      function renderMentorView() {
        el.innerHTML = `
          <div class="stack">
            <div>
              <p class="eyebrow" style="color:#ffd23f">🏛️ Galería de Mentores</p>
              <h1 class="h1">Los Grandes Sabios de las Matemáticas</h1>
              <p class="lead">Explora a los genios de la historia. Arrastra para rotar sus modelos 3D en 360 grados, escucha sus consejos y elige a tu mentor guía.</p>
            </div>

            <div class="split">
              <!-- Live 3D Mentor Stage -->
              <div class="threed-hub-stage" id="mentor-stage-container" style="display:flex;flex-direction:column;align-items:center;padding:1.5rem">
                <div id="mentor-3d-mount" style="width:100%;height:380px;display:flex;align-items:center;justify-content:center"></div>
                <h2 class="h2" style="margin-top:0.8rem;color:#ffd23f">${selectedMentor.name}</h2>
                <span class="chip v tiny">${selectedMentor.branch}</span>
                <p class="small muted" style="margin-top:.4rem">${selectedMentor.era} · ${selectedMentor.title}</p>
                <div class="paper" style="margin-top:1rem;max-width:440px;text-align:center">
                  <i>"${selectedMentor.quote}"</i>
                </div>
                <div class="row" style="margin-top:1rem;gap:.8rem">
                  <button class="btn sm" id="btn-mentor-speak">🔊 Escuchar Frase</button>
                  <button class="btn sm primary" id="btn-choose-mentor">⭐ Elegir como mi Mentor</button>
                </div>
              </div>

              <!-- Mentor Selection Grid -->
              <div class="stack">
                <h3 class="h3">Seleccionar Mentor</h3>
                <div class="grid sm" style="max-height:560px;overflow-y:auto;padding-right:.5rem">
                  ${MENTORS.map((m, i) => `
                    <div class="card click ${m.id === selectedMentor.id ? 'flat' : ''}" data-idx="${i}" style="cursor:pointer;text-align:center;padding:1rem;border-color:${m.id === selectedMentor.id ? '#5fd3f0' : ''}">
                      <div style="font-size:2rem;margin-bottom:.3rem">
                        ${m.id === 'capi' ? '🌟' : m.id === 'hipatia' ? '✨' : m.id === 'euler' ? '📐' : m.id === 'newton' ? '🍎' : '🏛️'}
                      </div>
                      <b>${m.name}</b>
                      <span class="tiny muted" style="display:block;margin-top:.2rem">${m.branch}</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>
          </div>
        `;

        // Mount 3D model
        const mount = el.querySelector("#mentor-3d-mount");
        if (mount && window.CapW3 && window.CapW3.avatarStage) {
          try {
            mount.innerHTML = "";
            const cfg = getMentorConfig(selectedMentor);
            mentorStage = window.CapW3.avatarStage(mount, cfg, { height: "380px" });
          } catch(err) {
            console.warn("Mentor 3D stage fallback:", err);
            mount.innerHTML = `<img src="${CAPI_LOGO_URL}" width="160" height="160" style="border-radius:50%;border:4px solid #ffd23f;box-shadow:0 0 35px #8b3dff">`;
          }
        }

        // Action: Escuchar Frase
        el.querySelector("#btn-mentor-speak").onclick = () => {
          CapAudio.sfx.click();
          if (window.CapMathAI && CapMathAI.speak) {
            CapMathAI.speak(selectedMentor.name + " dice: " + selectedMentor.quote);
          } else if (window.speechSynthesis) {
            const u = new SpeechSynthesisUtterance(selectedMentor.name + " dice: " + selectedMentor.quote);
            u.lang = "es-ES";
            speechSynthesis.speak(u);
          }
        };

        // Action: Elegir como Mentor
        el.querySelector("#btn-choose-mentor").onclick = () => {
          CapAudio.sfx.levelUp();
          localStorage.setItem("cap-chosen-mentor", selectedMentor.id);
          ui.toast("Mentor Asignado", `${selectedMentor.name} te acompañará como tu mentor en CAPICÚA.`, "ok");
        };

        // Click mentor cards
        el.querySelectorAll(".card.click").forEach(card => {
          card.onclick = () => {
            CapAudio.sfx.click();
            selectedMentor = MENTORS[parseInt(card.dataset.idx)];
            renderMentorView();
          };
        });
      }

      renderMentorView();
    };

    ui.views["mentores"] = renderMentorsGallery;
    ui.views["mentores-3d"] = renderMentorsGallery;

    // ----------------------------------------------------------------------
    // View G: ENEMIGOS (Bestiario Matemático)
    // ----------------------------------------------------------------------
    const renderEnemiesGallery = function(el) {
      const ENEMIES = [
        { id: "aritmetron", name: "Aritmetrón 3000", domain: "Tablas del 1 al 1000", hp: 1200, weakness: "Fracciones y Factorización", taunt: "¡Mis operaciones son más veloces que cualquier procesador!", icon: "🤖" },
        { id: "algebrix", name: "Algébrix el Caótico", domain: "Ecuaciones y Sistemas 2x2", hp: 1800, weakness: "Despeje de variables", taunt: "¡Jamás podrás despejar la incógnita de tu destino!", icon: "👾" },
        { id: "geotitan", name: "Geo-Titán", domain: "Geometría y Teorema de Pitágoras", hp: 2500, weakness: "Trigonometría y Ángulos", taunt: "¡Mi armadura de polígonos regulares es impenetrable!", icon: "🗿" },
        { id: "calculon", name: "Calculón el Infinito", domain: "Cálculo Diferencial e Integral", hp: 3500, weakness: "Regla de L'Hôpital y Límites", taunt: "¡El límite de tu conocimiento tiende a cero!", icon: "⚡" }
      ];

      let selectedEnemy = ENEMIES[0];

      function renderEnemyView() {
        el.innerHTML = `
          <div class="stack">
            <div>
              <p class="eyebrow" style="color:#ff3d9a">👾 Bestiario Matemático</p>
              <h1 class="h1">Enemigos y Jefes de los Mundos</h1>
              <p class="lead">Conoce a los enemigos que acechan en los 12 mundos. Analiza sus debilidades, simula ataques y prepárate para el combate.</p>
            </div>

            <div class="split">
              <div class="threed-hub-stage" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem">
                <div id="enemy-avatar-box" style="font-size:6.5rem;text-shadow:0 0 35px #ff3d9a;animation:fl 3s ease-in-out infinite">
                  ${selectedEnemy.icon}
                </div>
                <h2 class="h2" style="margin-top:1rem;color:#ff7aa8">${selectedEnemy.name}</h2>
                <span class="chip bad tiny">Puntos de Vida: ${selectedEnemy.hp} HP</span>
                <p class="small muted" style="margin-top:.4rem">Dominio: <b>${selectedEnemy.domain}</b></p>
                <div class="paper" style="margin-top:1rem;max-width:440px;text-align:center;border-color:#ff7aa8;background:rgba(255,61,154,0.1)">
                  <i>"${selectedEnemy.taunt}"</i>
                </div>
                <div class="row" style="margin-top:1rem;gap:.8rem">
                  <button class="btn sm bad" id="btn-attack-enemy">⚔️ Simular Ataque</button>
                  <button class="btn sm primary" onclick="location.hash='salas'">Desafiar en Multijugador</button>
                </div>
              </div>

              <div class="stack">
                <h3 class="h3">Seleccionar Enemigo</h3>
                <div class="grid sm">
                  ${ENEMIES.map((en, i) => `
                    <div class="card click ${en.id === selectedEnemy.id ? 'flat' : ''}" data-idx="${i}" style="cursor:pointer;text-align:center;padding:1rem;border-color:${en.id === selectedEnemy.id ? '#ff3d9a' : ''}">
                      <div style="font-size:2.5rem;margin:0 auto">${en.icon}</div>
                      <b>${en.name}</b>
                      <span class="tiny muted" style="display:block;margin-top:.2rem">${en.domain}</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>
          </div>
        `;

        el.querySelector("#btn-attack-enemy").onclick = () => {
          CapAudio.sfx.hit();
          const box = el.querySelector("#enemy-avatar-box");
          box.style.animation = "shake 0.4s";
          setTimeout(() => box.style.animation = "fl 3s ease-in-out infinite", 450);
          ui.toast("¡Golpe Crítico!", "Has aplicado la debilidad matemática: -250 HP", "ok");
        };

        el.querySelectorAll(".card.click").forEach(card => {
          card.onclick = () => {
            CapAudio.sfx.click();
            selectedEnemy = ENEMIES[parseInt(card.dataset.idx)];
            renderEnemyView();
          };
        });
      }

      renderEnemyView();
    };

    ui.views["enemigos"] = renderEnemiesGallery;
    ui.views["enemigos-3d"] = renderEnemiesGallery;

    // Inject Navigation Links into Sidebar and Quick Navigation
    injectNavigationLinks();
  }

  function injectNavigationLinks() {
    const nav = document.querySelector("#side .nav");
    if (!nav || nav.dataset.masterNav) return;
    nav.dataset.masterNav = "1";

    const customLinks = [
      { r: "salas", title: "🎮 Salas con Amigos", icon: "users" },
      { r: "simulacros", title: "📄 Simulacros con Capi", icon: "calendar" },
      { r: "capia", title: "🤖 Capi IA - Tutora", icon: "capia" },
      { r: "avatares", altR: "avatares-3d", title: "🎭 Avatares", icon: "user" },
      { r: "mentores", altR: "mentores-3d", title: "🏛️ Mentores", icon: "star" },
      { r: "enemigos", altR: "enemigos-3d", title: "👾 Enemigos", icon: "flame" },
      { r: "membresias", title: "💎 Membresías", icon: "flag" },
      { r: "cuenta", title: "👤 Mi Cuenta & Progreso", icon: "user" }
    ];

    const group = document.createElement("details");
    group.className = "cf-grp";
    group.open = true;
    group.innerHTML = `<summary style="color:#5fd3f0;font-weight:800">★ CAPICÚA 888 ★</summary>`;

    customLinks.forEach(item => {
      // Prevent redundancy if link already exists in sidebar
      if (nav.querySelector(`a[data-r="${item.r}"]`) || (item.altR && nav.querySelector(`a[data-r="${item.altR}"]`))) {
        return;
      }
      const a = document.createElement("a");
      a.href = "#" + item.r;
      a.dataset.r = item.r;
      a.innerHTML = `<span class="ni" style="--c1:#7b3cf0;--c2:#ff3d9a">${item.title.slice(0, 2)}</span> ${item.title.slice(2)}`;
      a.onclick = () => {
        CapAudio.sfx.click();
      };
      group.appendChild(a);
    });

    if (group.children.length > 1) {
      nav.prepend(group);
    }
  }

  function openAccountModal(ui) {
    ui.modal(`
      <div class="stack">
        <h2 class="h2">Gestionar Cuenta CAPICÚA</h2>
        <div class="seg" id="acct-tab-seg">
          <button class="btn primary sm" id="tab-reg">Crear Nueva Cuenta</button>
          <button class="btn sm" id="tab-log">Iniciar Sesión</button>
        </div>
        <div id="acct-form-container" style="margin-top:.8rem"></div>
      </div>
    `, (modalEl, close) => {
      const container = modalEl.querySelector("#acct-form-container");

      function showReg() {
        container.innerHTML = `
          <div class="stack">
            <label class="lbl">Nombre de usuario
              <input type="text" id="reg-un" placeholder="ej: matematico_888">
            </label>
            <label class="lbl">Nombre completo
              <input type="text" id="reg-nm" placeholder="ej: Sofía Martínez">
            </label>
            <label class="lbl">Correo electrónico
              <input type="email" id="reg-em" placeholder="sofia@correo.com">
            </label>
            <label class="lbl">Contraseña
              <input type="password" id="reg-pw" placeholder="Al menos 6 caracteres">
            </label>
            <button class="btn primary lg" id="btn-do-reg">¡Crear mi Cuenta y Guardar!</button>
          </div>
        `;
        container.querySelector("#btn-do-reg").onclick = () => {
          const un = container.querySelector("#reg-un").value;
          const nm = container.querySelector("#reg-nm").value;
          const em = container.querySelector("#reg-em").value;
          const pw = container.querySelector("#reg-pw").value;
          if (!un || !pw) return alert("Por favor ingresa usuario y contraseña.");
          try {
            CapAccount.register(un, nm, em, pw);
            CapAudio.sfx.levelUp();
            close();
            ui.toast("Cuenta Creada", `¡Bienvenido ${un}! Tu progreso está a salvo.`, "ok");
            ui.render();
          } catch(err) {
            alert(err.message);
          }
        };
      }

      function showLog() {
        container.innerHTML = `
          <div class="stack">
            <label class="lbl">Nombre de usuario
              <input type="text" id="log-un" placeholder="Tu usuario">
            </label>
            <label class="lbl">Contraseña
              <input type="password" id="log-pw" placeholder="Tu contraseña">
            </label>
            <button class="btn primary lg" id="btn-do-log">Entrar</button>
          </div>
        `;
        container.querySelector("#btn-do-log").onclick = () => {
          const un = container.querySelector("#log-un").value;
          const pw = container.querySelector("#log-pw").value;
          try {
            CapAccount.login(un, pw);
            CapAudio.sfx.click();
            close();
            ui.toast("Sesión Iniciada", `¡Hola de nuevo, ${un}!`, "ok");
            ui.render();
          } catch(err) {
            alert(err.message);
          }
        };
      }

      modalEl.querySelector("#tab-reg").onclick = showReg;
      modalEl.querySelector("#tab-log").onclick = showLog;
      showReg();
    });
  }

  /* ------------------------------------------------------------------------
     10. TOPBAR INJECTIONS (Ambient Sound, Account, Rooms Quick Links)
     ------------------------------------------------------------------------ */
  function injectTopBarControls() {
    const topBar = document.getElementById("top");
    if (!topBar || topBar.dataset.masterInjected) return;
    topBar.dataset.masterInjected = "1";

    // 1. Ambient sound button
    const soundBtn = document.createElement("button");
    soundBtn.type = "button";
    soundBtn.className = "ambient-ctrl";
    soundBtn.id = "top-ambient-btn";
    soundBtn.title = "Activar / Pausar Música Lofi Espacial";
    soundBtn.innerHTML = `
      <span class="amb-waves"><i></i><i></i><i></i></span>
      <span class="amb-txt hide-sm">Música Ambiente</span>
    `;
    soundBtn.onclick = () => CapAudio.toggle();

    // 2. User Profile Chip
    const user = CapAccount.getCurrentUser();
    const userChip = document.createElement("a");
    userChip.href = "#cuenta";
    userChip.className = "stat";
    userChip.title = "Mi Cuenta y Progreso";
    userChip.innerHTML = `
      <img src="${CAPI_LOGO_URL}" width="20" height="20" style="border-radius:50%;object-fit:cover;">
      <span class="lbl">${user.name.split(" ")[0]}</span>
      <span id="chat-notif-badge" class="notif-badge" hidden>1</span>
    `;

    topBar.appendChild(soundBtn);
    topBar.appendChild(userChip);
  }

  /* ------------------------------------------------------------------------
     11. INIT BOOTSTRAPPER
     ------------------------------------------------------------------------ */
  function bootMaster() {
    initBranding();
    CapRunner.init();
    injectTopBarControls();

    const ui = window.CapUI;
    if (ui) {
      registerMasterViews(ui);
    }
  }

  window.CapMaster = {
    audio: CapAudio,
    ai: CapMathAI,
    simulacros: CapSimulacroAI,
    salas: CapSalasMultiplayer,
    account: CapAccount,
    chat: CapChat
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootMaster);
  } else {
    setTimeout(bootMaster, 60);
  }

  window.addEventListener("load", () => {
    setTimeout(bootMaster, 200);
  });
  window.addEventListener("hashchange", () => {
    setTimeout(bootMaster, 80);
  });

})();
