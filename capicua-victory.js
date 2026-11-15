/* ══════════════════════════════════════════════════════════════════════════
   CAPICÚA 2.5 — Sistema de Victoria y Cofres con Capi 888
   • Voz suave y entusiasta de Capi (SpeechSynthesis)
   • Anuncios dinámicos y no repetitivos con el nombre del usuario
   • Confeti variado: Estrellas, Símbolos Matemáticos, Arcoíris Neón, Gemas
   • Capi de la intro bailando con notas musicales ♪ ♫
   • Cofres con efecto sorpresa evolucionando con los días de racha
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  function init(){
    const t = window.CapEngine, ui = window.CapUI;
    if(!t || !ui){ setTimeout(init, 200); return; }
    setup(t, ui);
  }

  function setup(t, ui){

    /* ═══════════════════════════════════════════════════════════
       1. FRASES DINÁMICAS DE VICTORIA (Con nombre del usuario)
       ═══════════════════════════════════════════════════════════ */
    const VICTORY_PHRASES = [
      "¡Increíble victoria, {name}! ¡Tu brillantez matemática deslumbra a todo el cosmos!",
      "¡Lo lograste, {name}! ¡Cada problema que resuelves te hace más imparable!",
      "¡Qué orgullo, {name}! ¡Has demostrado ser un auténtico genio de los números!",
      "¡Victoria estelar para {name}! ¡Las estrellas y constelaciones celebran tu conocimiento!",
      "¡Espectacular triunfo, {name}! ¡Tu concentración y destreza matemática son legendarias!",
      "¡Bravo, {name}! ¡Superaste el desafío con pura elegancia y precisión!",
      "¡Victoria colosal para {name}! ¡El universo de Capicúa brilla más fuerte gracias a ti!",
      "¡Insuperable, {name}! ¡Estás dominando las matemáticas como un verdadero maestro!",
      "¡Qué jugada tan magistral, {name}! ¡Capi 888 celebra tu triunfo por todo lo alto!",
      "¡Extraordinario avance, {name}! ¡Tu mente lógica no tiene límites en este cosmos!",
      "¡Victoria resplandeciente, {name}! ¡Eres el orgullo del templo de los sabios!",
      "¡Fantástico resultado, {name}! ¡Prepárate para abrir los tesoros que te has ganado!"
    ];

    let lastPhraseIdx = -1;
    function getVictoryPhrase(studentName){
      let idx;
      do {
        idx = Math.floor(Math.random() * VICTORY_PHRASES.length);
      } while (idx === lastPhraseIdx && VICTORY_PHRASES.length > 1);
      lastPhraseIdx = idx;
      return VICTORY_PHRASES[idx].replace(/\{name\}/g, studentName);
    }

    /* ═══════════════════════════════════════════════════════════
       2. VOZ SUAVE Y ENTUSIASTA DE CAPI (Mascot Persona)
       ═══════════════════════════════════════════════════════════ */
    function speakCapi(text){
      if (!window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices() || [];
        const prefVoice = voices.find(v => v.lang.startsWith("es") && (
          v.name.includes("Sabina") || v.name.includes("Monica") || v.name.includes("Paulina") ||
          v.name.includes("Paloma") || v.name.includes("Camila") || v.name.includes("Helena") ||
          v.name.includes("Natural") || v.name.includes("Google")
        )) || voices.find(v => v.lang.startsWith("es-CO") || v.lang.startsWith("es-MX"))
           || voices.find(v => v.lang.startsWith("es"));

        if (prefVoice) u.voice = prefVoice;
        u.lang = (prefVoice && prefVoice.lang) || "es-CO";
        u.pitch = 1.28; // Tono suave, alegre y dulce de Capi
        u.rate = 1.05;  // Ritmo animado y claro
        u.volume = 1.0;
        window.speechSynthesis.speak(u);
      } catch(e) {
        console.warn("Capi speech synthesis:", e);
      }
    }

    /* ═══════════════════════════════════════════════════════════
       3. SISTEMA DE CONFETI VARIADO
       (Estrellas, Símbolos Matemáticos, Arcoíris, Gemas Cósmicas)
       ═══════════════════════════════════════════════════════════ */
    const CONFETTI_MODES = ["math", "stars", "rainbow", "gems"];
    let currentConfettiMode = "math";

    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    }

    function drawGem(ctx, w, h) {
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(w / 2, -h / 6);
      ctx.lineTo(w / 3, h / 2);
      ctx.lineTo(-w / 3, h / 2);
      ctx.lineTo(-w / 2, -h / 6);
      ctx.closePath();
      ctx.fill();
    }

    function launchConfetti(duration, mode){
      duration = duration || 4500;
      mode = mode || currentConfettiMode || "math";
      const canvas = document.createElement("canvas");
      canvas.className = "victory-confetti-canvas";
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:10005;";
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");

      const colors = ["#ffd700","#6342ff","#ff3d9a","#00e5ff","#2ecc71","#ff9f1a","#ffffff","#c742ff"];
      const mathGlyphs = ["π", "∞", "∑", "√x", "Δ", "∫", "≈", "λ", "888", "★", "✦"];
      const particles = [];
      const count = mode === "math" ? 90 : 130;

      for(let i = 0; i < count; i++){
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * -0.8 - 20,
          w: 6 + Math.random() * 10,
          h: 6 + Math.random() * 8,
          vx: (Math.random() - 0.5) * 5,
          vy: 2.2 + Math.random() * 4.5,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.18,
          color: colors[Math.floor(Math.random() * colors.length)],
          glyph: mathGlyphs[Math.floor(Math.random() * mathGlyphs.length)],
          shape: mode === "stars" ? "star" : mode === "gems" ? "gem" : (Math.random() > 0.5 ? "rect" : "circle"),
          size: 16 + Math.floor(Math.random() * 14),
          mode: mode,
          alpha: 1
        });
      }

      const start = performance.now();
      function frame(now){
        const elapsed = now - start;
        const fade = elapsed > duration * 0.75 ? 1 - (elapsed - duration * 0.75) / (duration * 0.25) : 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for(const p of particles){
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05;
          p.rot += p.vr;
          p.alpha = Math.max(0, fade);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.alpha;

          if (p.mode === "math") {
            ctx.fillStyle = p.color;
            ctx.font = "bold " + p.size + "px Quicksand, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fillText(p.glyph, 0, 0);
          } else if (p.mode === "stars" || p.shape === "star") {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            drawStar(ctx, 0, 0, 5, p.w, p.w * 0.45);
          } else if (p.mode === "gems" || p.shape === "gem") {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 12;
            drawGem(ctx, p.w * 1.5, p.h * 1.8);
          } else if (p.shape === "rect") {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          if(p.y > canvas.height + 30){
            p.y = -20;
            p.x = Math.random() * canvas.width;
            p.vy = 2.2 + Math.random() * 4.5;
          }
        }

        if(elapsed < duration) requestAnimationFrame(frame);
        else canvas.remove();
      }
      requestAnimationFrame(frame);
    }

    /* ═══════════════════════════════════════════════════════════
       4. EFECTO DE MONEDAS VOLADORAS SORPRESA (Burst Coins)
       ═══════════════════════════════════════════════════════════ */
    function burstFlyingCoins(originX, originY, amount){
      amount = amount || 18;
      const container = document.createElement("div");
      container.className = "flying-coins-container";
      container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:10020;";
      document.body.appendChild(container);

      const targetEl = document.querySelector("#v-pi") || document.querySelector(".pi-counter");
      const targetRect = targetEl ? targetEl.getBoundingClientRect() : { left: window.innerWidth - 60, top: 40 };

      for (let i = 0; i < amount; i++) {
        const coin = document.createElement("div");
        coin.className = "loot-burst-coin";
        coin.innerHTML = "π";
        coin.style.cssText = `
          position:absolute;
          left:${originX}px;
          top:${originY}px;
          width:32px;
          height:32px;
          border-radius:50%;
          background:radial-gradient(circle at 35% 35%, #fff275, #ffb300 70%, #d48800);
          color:#4a2800;
          font-weight:900;
          font-size:18px;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 0 16px rgba(255,200,0,0.8), inset 0 2px 4px #fff;
          border:2px solid #fff;
          transition:all 0.9s cubic-bezier(0.2, 0.8, 0.3, 1);
          transform:translate(-50%, -50%) scale(0.6);
        `;
        container.appendChild(coin);

        const angle = (i / amount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const dist = 70 + Math.random() * 110;
        const splashX = originX + Math.cos(angle) * dist;
        const splashY = originY + Math.sin(angle) * dist;

        setTimeout(() => {
          coin.style.left = splashX + "px";
          coin.style.top = splashY + "px";
          coin.style.transform = `translate(-50%, -50%) scale(1.15) rotate(${Math.random() * 360}deg)`;
        }, 30);

        setTimeout(() => {
          coin.style.transition = "all 0.65s cubic-bezier(0.55, 0.05, 0.67, 0.19)";
          coin.style.left = targetRect.left + 15 + "px";
          coin.style.top = targetRect.top + 15 + "px";
          coin.style.transform = "translate(-50%, -50%) scale(0.3) rotate(720deg)";
          coin.style.opacity = "0";
        }, 550 + i * 25);
      }

      setTimeout(() => container.remove(), 1600);
    }

    /* ── ANIMATED COUNTER ── */
    function animateCount(el, from, to, dur){
      dur = dur || 1200;
      const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now - start) / dur);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (to - from) * ease);
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    /* ═══════════════════════════════════════════════════════════
       5. SISTEMA EVOLUTIVO DE COFRES Y BOTÍN POR DÍAS DE RACHA
       ═══════════════════════════════════════════════════════════ */
    const CHEST_TIERS = [
      {
        day: 1,
        title: "Cofre de Bronce del Aprendiz",
        color: "#cd7f32",
        rarity: "COMÚN ★",
        pi: 35,
        xp: 40,
        relic: { name: "Amuleto de Pitágoras", desc: "Destello dorado de sabiduría iniciática", icon: "📐" }
      },
      {
        day: 2,
        title: "Cofre de Plata de los Polígonos",
        color: "#d0d8e8",
        rarity: "RARO ★★",
        pi: 70,
        xp: 75,
        relic: { name: "Pergamino de Euclides", desc: "Escudo estelar que protege tu racha", icon: "📜" }
      },
      {
        day: 3,
        title: "Cofre de Jade de Fibonacci",
        color: "#00e5a3",
        rarity: "ÉPICO ★★★",
        pi: 120,
        xp: 130,
        relic: { name: "Espiral Áurea de Fibonacci", desc: "Desbloquea confeti matemático en tus victorias", icon: "🌀" }
      },
      {
        day: 4,
        title: "Cofre de Oro de Hipatia",
        color: "#ffd700",
        rarity: "ÉPICO ★★★",
        pi: 180,
        xp: 200,
        relic: { name: "Cristal Cuántico de Hipatia", desc: "Pista mágica instantánea otorgada por Capi", icon: "💎" }
      },
      {
        day: 5,
        title: "Cofre de Zafiro de Gauss",
        color: "#2f6bff",
        rarity: "LEGENDARIO ★★★★",
        pi: 260,
        xp: 280,
        relic: { name: "Esfera Polar de Gauss", desc: "Multiplicador de XP x1.5 para todas tus lecciones", icon: "🔮" }
      },
      {
        day: 6,
        title: "Cofre de Rubí de Arquímedes",
        color: "#ff3d6a",
        rarity: "LEGENDARIO ★★★★",
        pi: 360,
        xp: 380,
        relic: { name: "Prisma Solar de Arquímedes", desc: "Aura cósmica de fuego para tu modelo 3D", icon: "🔥" }
      },
      {
        day: 7,
        title: "Cofre Sagrado de Euler y Capi 888",
        color: "#a855f7",
        rarity: "MÍTICO ★★★★★",
        pi: 500,
        xp: 888,
        relic: { name: "Corona Galáctica de Euler & Capi", desc: "Multiplicador de XP x2 y Título de Gran Sabio", icon: "👑" }
      }
    ];

    function getChestRewardForStreak(streakDays){
      const dayIndex = Math.min(Math.max(streakDays, 1), 7) - 1;
      return CHEST_TIERS[dayIndex];
    }

    /* ═══════════════════════════════════════════════════════════
       6. OVERLAY DE VICTORIA Y BAILE DE CAPI
       ═══════════════════════════════════════════════════════════ */
    function showVictoryDance(opts){
      opts = opts || {};
      const currentUser = (window.CapAccount && CapAccount.getCurrentUser && CapAccount.getCurrentUser()) || {};
      const studentName = currentUser.name || currentUser.username
        || (window.CapEngine && CapEngine.S && CapEngine.S.profile && (CapEngine.S.profile.name || CapEngine.S.profile.username))
        || "Campeón";

      const streakDays = currentUser.streak || parseInt(localStorage.getItem("cap_streak_days") || "1", 10) || 1;
      const chestTier = getChestRewardForStreak(streakDays);

      const dynamicPhrase = getVictoryPhrase(studentName);
      const title = opts.title || ("¡VICTORIA, " + studentName.toUpperCase() + "!");
      const subtitle = opts.subtitle || dynamicPhrase;
      const xpGained = opts.xp || chestTier.xp;
      const piGained = opts.pi || chestTier.pi;
      const duration = opts.duration || 7000;

      // Cycle confetti style
      const nextIdx = (CONFETTI_MODES.indexOf(currentConfettiMode) + 1) % CONFETTI_MODES.length;
      currentConfettiMode = CONFETTI_MODES[nextIdx];

      /* Build overlay */
      const overlay = document.createElement("div");
      overlay.className = "victory-overlay";
      overlay.style.cssText = "position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(8,4,26,0.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);overflow-y:auto;padding:1.5rem;";

      /* Avatar HTML */
      const avatarSrc = document.querySelector(".avatar img, .companion img, .face img");
      const avatarHTML = avatarSrc
        ? '<img src="' + avatarSrc.src + '" style="width:100%;height:100%;object-fit:contain;border-radius:50%">'
        : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#6342ff,#c742ff);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3rem">&#x2728;</div>';

      /* Capi Icon HTML */
      const capiHTML = window.CapUI && CapUI.capiaIcon
        ? CapUI.capiaIcon(100)
        : '<img src="capi-logo.png" width="90" height="90" style="border-radius:50%;box-shadow:0 0 25px #ffd23f;object-fit:contain;">';

      overlay.innerHTML = `
        <div class="victory-content" style="max-width:580px;width:100%;background:rgba(25,14,64,0.85);border:2px solid rgba(255,215,0,0.3);border-radius:24px;padding:2rem;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.7), 0 0 50px rgba(99,66,255,0.4);position:relative;">

          <!-- Dúo de Festejo: Capi Bailarín + Avatar del Estudiante -->
          <div class="victory-duo-stage" style="display:flex;justify-content:center;align-items:flex-end;gap:1.5rem;margin-bottom:1rem;position:relative;">
            <!-- Avatar Estudiante -->
            <div class="duo-item avatar-box" style="text-align:center;">
              <div class="victory-avatar dancing" style="width:100px;height:100px;margin:0 auto;position:relative;">
                <div class="victory-rings"><div class="ring"></div><div class="ring"></div><div class="ring"></div></div>
                ${avatarHTML}
              </div>
              <span class="chip ok sm" style="margin-top:.4rem;display:inline-block;font-size:.75rem">${studentName}</span>
            </div>

            <!-- Capi Bailarín con Notas Musicales -->
            <div class="duo-item capi-box" style="text-align:center;position:relative;">
              <div class="cf-dance" style="display:flex;align-items:flex-end;justify-content:center;gap:.3rem;">
                <span class="n n1" style="font-size:1.8rem;color:#ffd54f;animation:cfnote 1.2s infinite">♪</span>
                <div class="cf-d" style="animation:cfdance .85s ease-in-out infinite;transform-origin:50% 100%">
                  ${capiHTML}
                </div>
                <span class="n n2" style="font-size:1.8rem;color:#ff3d9a;animation:cfnote 1.2s infinite .3s">♫</span>
              </div>
              <span class="chip v sm" style="margin-top:.4rem;display:inline-block;font-size:.75rem">Capi Bailando</span>
            </div>
          </div>

          <!-- Speech bubble de Capi -->
          <div class="capi-bubble-cheer" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,215,0,0.4);border-radius:14px;padding:.6rem 1rem;margin-bottom:1rem;font-weight:700;color:#ffd23f;text-shadow:0 0 10px rgba(255,210,63,0.5);font-size:.95rem;">
            🐾 <b>Capi:</b> "¡Bailo de alegría contigo, ${studentName}! ¡Tu racha sigue brillando!"
          </div>

          <div class="victory-title" style="font-size:2rem;font-weight:900;background:linear-gradient(135deg,#ffd700,#ff6b9d,#00e5ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-transform:uppercase;letter-spacing:1px;">
            ${title}
          </div>

          <div class="victory-subtitle" style="color:#ffd23f;font-weight:700;font-size:1.1rem;margin-top:.5rem;line-height:1.4;">
            ${subtitle}
          </div>

          <!-- Stats -->
          <div class="victory-stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem;margin-top:1.2rem;">
            <div class="card flat" style="padding:.8rem .5rem;background:rgba(255,255,255,0.04);border-radius:14px;">
              <div class="small muted" style="font-size:.75rem;text-transform:uppercase;">XP Ganada</div>
              <div class="h2" style="color:#2ecc71;margin-top:.2rem;" id="v-xp">0</div>
            </div>
            <div class="card flat" style="padding:.8rem .5rem;background:rgba(255,255,255,0.04);border-radius:14px;">
              <div class="small muted" style="font-size:.75rem;text-transform:uppercase;">Monedas PI</div>
              <div class="h2" style="color:#ffd700;margin-top:.2rem;" id="v-pi">0</div>
            </div>
            <div class="card flat" style="padding:.8rem .5rem;background:rgba(255,255,255,0.04);border-radius:14px;">
              <div class="small muted" style="font-size:.75rem;text-transform:uppercase;">Nivel Actual</div>
              <div class="h2" style="color:#00e5ff;margin-top:.2rem;" id="v-lvl">${t.level()}</div>
            </div>
          </div>

          <!-- Evolving Chest Surprise Preview -->
          <div class="evolving-chest-card" style="margin-top:1.2rem;background:linear-gradient(135deg,rgba(255,215,0,0.1),rgba(139,61,255,0.15));border:1px dashed ${chestTier.color};border-radius:16px;padding:1rem;display:flex;align-items:center;gap:1rem;text-align:left;">
            <div style="font-size:2.4rem;filter:drop-shadow(0 0 12px ${chestTier.color});">${chestTier.relic.icon}</div>
            <div style="flex:1;">
              <div class="row between" style="align-items:center;">
                <span class="badge" style="background:${chestTier.color};color:#100526;font-weight:900;font-size:.7rem;padding:2px 8px;border-radius:99px;">${chestTier.rarity} · DÍA ${streakDays}</span>
                <span class="small muted" style="font-size:.75rem;">Cofre Evolutivo</span>
              </div>
              <div style="font-weight:800;color:#fff;margin-top:.2rem;">${chestTier.relic.name}</div>
              <p class="small muted" style="margin:0;font-size:.8rem;">${chestTier.relic.desc}</p>
            </div>
          </div>

          <!-- Interactive Confetti Selector -->
          <div class="row center" style="margin-top:1.2rem;gap:.5rem;justify-content:center;flex-wrap:wrap;">
            <span class="small muted" style="font-size:.8rem;">Confeti:</span>
            <button class="btn sm ${currentConfettiMode==='math'?'primary':'ghost'}" id="btn-conf-math">π Matemático</button>
            <button class="btn sm ${currentConfettiMode==='stars'?'primary':'ghost'}" id="btn-conf-stars">★ Estrellas</button>
            <button class="btn sm ${currentConfettiMode==='rainbow'?'primary':'ghost'}" id="btn-conf-rainbow">🌈 Neón</button>
            <button class="btn sm ${currentConfettiMode==='gems'?'primary':'ghost'}" id="btn-conf-gems">💎 Gemas</button>
          </div>

          <div class="row center" style="margin-top:1.2rem;gap:1rem;justify-content:center;">
            <button class="btn primary lg" id="btn-victory-claim" style="box-shadow:0 0 25px rgba(255,215,0,0.5);">¡Reclamar y Abrir Botín!</button>
          </div>
          <div class="victory-countdown" id="v-countdown" style="margin-top:.8rem;font-size:.85rem;color:rgba(255,255,255,0.6);"></div>
        </div>
      `;

      document.body.appendChild(overlay);

      /* Animate counters */
      const xpEl = document.getElementById("v-xp");
      const piEl = document.getElementById("v-pi");
      if(xpEl) animateCount(xpEl, 0, xpGained, 1100);
      if(piEl) animateCount(piEl, 0, piGained, 1100);

      /* Capi Voice Announcement */
      speakCapi(dynamicPhrase);

      /* Companion floating speech bubble */
      try {
        const bubble = document.querySelector("#companion .bubble");
        if (bubble) {
          bubble.innerHTML = `<b>Capi:</b> ${dynamicPhrase} 🌟`;
          bubble.hidden = false;
          setTimeout(() => { bubble.hidden = true; }, 7500);
        }
      } catch(e) {}

      /* Launch initial confetti */
      launchConfetti(duration, currentConfettiMode);

      /* Confetti buttons */
      overlay.querySelectorAll("[id^='btn-conf-']").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const mode = btn.id.replace("btn-conf-", "");
          currentConfettiMode = mode;
          overlay.querySelectorAll("[id^='btn-conf-']").forEach(b => b.classList.toggle("primary", b === btn));
          launchConfetti(4000, mode);
        };
      });

      /* Burst flying coins from center */
      setTimeout(() => {
        burstFlyingCoins(window.innerWidth / 2, window.innerHeight / 2, 22);
      }, 500);

      /* Claim button */
      const claimBtn = overlay.querySelector("#btn-victory-claim");
      if (claimBtn) {
        claimBtn.onclick = (e) => {
          e.stopPropagation();
          dismiss();
        };
      }

      /* Countdown */
      const countEl = document.getElementById("v-countdown");
      let remaining = Math.ceil(duration / 1000);
      let timer = null;
      function updateCountdown(){
        if(countEl) countEl.textContent = "Continuar automáticamente en " + remaining + "s (o toca en cualquier lugar)";
        remaining--;
        if(remaining >= 0) timer = setTimeout(updateCountdown, 1000);
      }
      updateCountdown();

      function dismiss(){
        if (timer) clearTimeout(timer);
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity .35s";
        setTimeout(function(){ overlay.remove(); }, 350);
      }

      overlay.addEventListener("click", function(e){
        if (e.target.closest("button")) return;
        dismiss();
      });

      setTimeout(function(){
        if(overlay.parentNode) dismiss();
      }, duration);
    }

    /* ═══════════════════════════════════════════════════════════
       7. APERTURA DE COFRE CON SORPRESA EVOLUTIVA
       ═══════════════════════════════════════════════════════════ */
    function openSurpriseChest(options){
      options = options || {};
      const currentUser = (window.CapAccount && CapAccount.getCurrentUser && CapAccount.getCurrentUser()) || {};
      const studentName = currentUser.name || currentUser.username || "Explorador";
      let streakDays = currentUser.streak || parseInt(localStorage.getItem("cap_streak_days") || "1", 10) || 1;

      // Increment day for surprise evolution
      const lastChestDate = localStorage.getItem("cap_last_chest_date");
      const todayStr = new Date().toISOString().slice(0, 10);
      if (lastChestDate !== todayStr) {
        streakDays = Math.min(streakDays + 1, 7);
        localStorage.setItem("cap_streak_days", streakDays.toString());
        localStorage.setItem("cap_last_chest_date", todayStr);
      }

      const reward = getChestRewardForStreak(streakDays);

      // Play levelUp / fanfare sound
      if (window.CapAudio && CapAudio.sfx && CapAudio.sfx.levelUp) {
        CapAudio.sfx.levelUp();
      }

      // Launch confetti
      launchConfetti(5000, currentConfettiMode);

      // Flying coins
      burstFlyingCoins(window.innerWidth / 2, window.innerHeight / 2, 26);

      // Voice
      const speech = `¡Sorpresa, ${studentName}! Has abierto el ${reward.title} y desbloqueado la reliquia ${reward.relic.name}.`;
      speakCapi(speech);

      // Award XP and PI
      try {
        if (t.addPI) t.addPI(reward.pi, reward.title);
        if (t.addXP) t.addXP(reward.xp);
      } catch(e) {}

      // Render surprise modal card
      const modal = document.createElement("div");
      modal.className = "chest-surprise-modal";
      modal.style.cssText = "position:fixed;inset:0;z-index:10030;display:flex;align-items:center;justify-content:center;background:rgba(8,3,25,0.9);backdrop-filter:blur(16px);padding:1.5rem;";

      modal.innerHTML = `
        <div style="max-width:520px;width:100%;background:radial-gradient(ellipse at 50% 20%, rgba(139,61,255,0.3), #12092e 75%);border:2px solid ${reward.color};border-radius:24px;padding:2.2rem;text-align:center;box-shadow:0 0 60px ${reward.color}66;animation:victoryPop .45s cubic-bezier(.34,1.56,.64,1);position:relative;">
          
          <div style="font-size:4rem;animation:cfdance .9s infinite;filter:drop-shadow(0 0 20px ${reward.color});">${reward.relic.icon}</div>
          
          <span class="badge" style="background:${reward.color};color:#0a031e;font-weight:900;font-size:.85rem;padding:4px 14px;border-radius:99px;margin-top:.8rem;display:inline-block;">
            ${reward.rarity} · DÍA ${streakDays} DE RACHA
          </span>

          <h2 class="h2" style="margin-top:.8rem;font-size:1.8rem;color:#fff;">${reward.title}</h2>
          <h3 class="h3" style="color:#ffd700;margin-top:.3rem;">✨ ${reward.relic.name} ✨</h3>
          <p class="lead" style="color:#b9c6ff;margin-top:.5rem;font-size:1rem;">${reward.relic.desc}</p>

          <div class="row center" style="margin-top:1.4rem;gap:1rem;justify-content:center;">
            <div class="card flat" style="padding:.6rem 1.4rem;background:rgba(255,255,255,0.06);border-radius:12px;">
              <span class="small muted">Premio PI</span>
              <div class="h2" style="color:#ffd700;">+${reward.pi} π</div>
            </div>
            <div class="card flat" style="padding:.6rem 1.4rem;background:rgba(255,255,255,0.06);border-radius:12px;">
              <span class="small muted">Premio XP</span>
              <div class="h2" style="color:#2ecc71;">+${reward.xp} XP</div>
            </div>
          </div>

          <!-- Progress bar towards Day 7 Euler Mythic Chest -->
          <div style="margin-top:1.4rem;text-align:left;background:rgba(255,255,255,0.05);padding:.8rem;border-radius:14px;">
            <div class="row between" style="font-size:.8rem;font-weight:700;color:#e2e8f0;margin-bottom:.3rem;">
              <span>Progreso de Racha Evolutiva</span>
              <span>Día ${streakDays} de 7</span>
            </div>
            <div style="width:100%;height:10px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden;">
              <div style="width:${(streakDays / 7) * 100}%;height:100%;background:linear-gradient(90deg,#ffd700,#ff3d9a,#8b3dff);border-radius:99px;transition:width .5s ease-out;"></div>
            </div>
            <p class="small muted" style="margin-top:.4rem;font-size:.75rem;">
              ${streakDays < 7 ? `¡Mañana tu cofre evolucionará al Día ${streakDays + 1} con más premios!` : '¡Has alcanzado la cima mítica de Euler & Capi 888!'}
            </p>
          </div>

          <button class="btn primary lg" id="btn-close-surprise" style="margin-top:1.5rem;width:100%;">¡Fantástico, Capi!</button>
        </div>
      `;

      document.body.appendChild(modal);

      const closeBtn = modal.querySelector("#btn-close-surprise");
      if (closeBtn) {
        closeBtn.onclick = () => {
          modal.style.opacity = "0";
          modal.style.transition = "opacity .3s";
          setTimeout(() => modal.remove(), 300);
          if (options.onClose) options.onClose();
        };
      }
    }

    /* ═══════════════════════════════════════════════════════════
       8. HOOKS DE EVENTOS DE VICTORIA Y BATALLAS
       ═══════════════════════════════════════════════════════════ */
    const origConfetti = ui.confetti;
    ui.confetti = function(n){
      if(origConfetti) origConfetti.call(ui, n);
      if(n >= 90){
        setTimeout(function(){
          showVictoryDance({
            xp: 50,
            pi: 30,
            duration: 7000
          });
        }, 400);
      }
    };

    if(t.bus){
      ["lesson:complete", "lesson:done", "lesson:win", "lesson:finish", "battle:win"].forEach(evtName => {
        t.bus.on(evtName, function(info){
          setTimeout(function(){
            showVictoryDance({
              xp: (info && info.xp) || 50,
              pi: (info && info.pi) || 25,
              duration: 7000
            });
          }, 400);
        });
      });

      t.bus.on("levelup", function(data){
        const lvl = typeof data === "number" ? data : t.level();
        setTimeout(function(){
          const u = (window.CapAccount && CapAccount.getCurrentUser && CapAccount.getCurrentUser()) || {};
          const name = u.name || "Campeón";
          showVictoryDance({
            title: "¡NIVEL " + lvl + "!",
            subtitle: "¡Subiste de nivel, " + name + "! ¡Capi celebra tu asombrosa evolución matemática!",
            xp: 0,
            pi: 0,
            duration: 5000
          });
        }, 300);
      });

      t.bus.on("mastered", function(){
        setTimeout(function(){
          const u = (window.CapAccount && CapAccount.getCurrentUser && CapAccount.getCurrentUser()) || {};
          const name = u.name || "Campeón";
          showVictoryDance({
            title: "¡MAESTRÍA ALCANZADA!",
            subtitle: "¡Felicidades, " + name + "! ¡Has dominado este templo del saber!",
            xp: 0,
            pi: 0,
            duration: 5000
          });
        }, 300);
      });
    }

    /* ═══════════════════════════════════════════════════════════
       9. EXPORTACIONES GLOBALES
       ═══════════════════════════════════════════════════════════ */
    window.CapVictory = {
      show: showVictoryDance,
      confetti: launchConfetti,
      speak: speakCapi,
      openChest: openSurpriseChest,
      getPhrases: () => VICTORY_PHRASES,
      getModes: () => CONFETTI_MODES
    };

    window.CapChestSystem = {
      open: openSurpriseChest,
      getReward: getChestRewardForStreak,
      getTiers: () => CHEST_TIERS
    };

    console.log("[CAPICÚA] Victoria v2.5 y Cofres Evolutivos con Capi 888 activos");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
