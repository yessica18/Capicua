/* ═══════════════════════════════════════════════
   CAPICÚA 2.1 — Baile y Conteo de Victoria
   ═══════════════════════════════════════════════ */
(function(){
  "use strict";

  function init(){
    const t = window.CapEngine, ui = window.CapUI;
    if(!t || !ui){ setTimeout(init, 200); return; }
    setup(t, ui);
  }

  function setup(t, ui){

    /* ── CANVAS CONFETTI ── */
    function launchConfetti(duration){
      duration = duration || 3000;
      const canvas = document.createElement("canvas");
      canvas.className = "victory-confetti-canvas";
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");

      const colors = ["#6342ff","#c742ff","#ff6b9d","#ffd700","#3498db","#2ecc71","#ff3d6a","#00e5ff"];
      const particles = [];
      for(let i = 0; i < 150; i++){
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * -1,
          w: 4 + Math.random() * 8,
          h: 4 + Math.random() * 6,
          vx: (Math.random() - 0.5) * 6,
          vy: 2 + Math.random() * 4,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: Math.random() > 0.5 ? "rect" : "circle",
          alpha: 1
        });
      }

      const start = performance.now();
      function frame(now){
        const elapsed = now - start;
        const fade = elapsed > duration * 0.7 ? 1 - (elapsed - duration * 0.7) / (duration * 0.3) : 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for(const p of particles){
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          p.rot += p.vr;
          p.alpha = Math.max(0, fade);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          if(p.shape === "rect"){
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          if(p.y > canvas.height + 20){
            p.y = -20;
            p.x = Math.random() * canvas.width;
            p.vy = 2 + Math.random() * 4;
          }
        }

        if(elapsed < duration) requestAnimationFrame(frame);
        else canvas.remove();
      }
      requestAnimationFrame(frame);
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

    /* ── VICTORY OVERLAY ── */
    function showVictoryDance(opts){
      opts = opts || {};
      const title = opts.title || "VICTORIA";
      const xpGained = opts.xp || 40;
      const piGained = opts.pi || 20;
      const duration = opts.duration || 5000;

      /* Build overlay */
      const overlay = document.createElement("div");
      overlay.className = "victory-overlay";

      /* Avatar */
      const avatarSrc = document.querySelector(".avatar img, .companion img, .face img");
      const avatarHTML = avatarSrc
        ? '<img src="' + avatarSrc.src + '" style="width:100%;height:100%;object-fit:contain;border-radius:50%">'
        : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#6342ff,#c742ff);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3rem">&#x2728;</div>';

      overlay.innerHTML =
        '<div class="victory-content">' +
          '<div class="victory-avatar dancing">' +
            '<div class="victory-rings"><div class="ring"></div><div class="ring"></div><div class="ring"></div></div>' +
            avatarHTML +
          '</div>' +
          '<div class="victory-title">' + title + '</div>' +
          '<div class="victory-stats">' +
            '<div class="victory-stat"><div class="victory-stat-label">XP</div><div class="victory-stat-val" id="v-xp">0</div></div>' +
            '<div class="victory-stat"><div class="victory-stat-label">PI</div><div class="victory-stat-val" id="v-pi">0</div></div>' +
            '<div class="victory-stat"><div class="victory-stat-label">Nivel</div><div class="victory-stat-val" id="v-lvl">' + t.level() + '</div></div>' +
          '</div>' +
          '<div class="victory-countdown" id="v-countdown"></div>' +
        '</div>';

      document.body.appendChild(overlay);

      /* Animate counters */
      const xpEl = document.getElementById("v-xp");
      const piEl = document.getElementById("v-pi");
      if(xpEl) animateCount(xpEl, 0, xpGained, 1000);
      if(piEl) animateCount(piEl, 0, piGained, 1000);

      /* Launch confetti */
      launchConfetti(duration);

      /* Countdown */
      const countEl = document.getElementById("v-countdown");
      let remaining = Math.ceil(duration / 1000);
      function updateCountdown(){
        if(countEl) countEl.textContent = "Continuar en " + remaining + "s";
        remaining--;
        if(remaining >= 0) setTimeout(updateCountdown, 1000);
      }
      updateCountdown();

      /* Click to dismiss early */
      overlay.addEventListener("click", function(){
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity .3s";
        setTimeout(function(){ overlay.remove(); }, 300);
      });

      /* Auto dismiss */
      setTimeout(function(){
        if(overlay.parentNode){
          overlay.style.opacity = "0";
          overlay.style.transition = "opacity .3s";
          setTimeout(function(){ overlay.remove(); }, 300);
        }
      }, duration);
    }

    /* ── HOOK INTO BATTLE VICTORY ── */
    const origConfetti = ui.confetti;
    ui.confetti = function(n){
      if(origConfetti) origConfetti.call(ui, n);
      /* Battle victory triggers confetti(120) */
      if(n >= 100){
        setTimeout(function(){
          showVictoryDance({ title:"K.O.", xp:40, pi:20, duration:5000 });
        }, 600);
      }
    };

    /* ── HOOK LEVEL UP ── */
    if(t.bus){
      t.bus.on("levelup", function(data){
        const lvl = typeof data === "number" ? data : t.level();
        setTimeout(function(){
          showVictoryDance({ title:"NIVEL " + lvl, xp:0, pi:0, duration:4000 });
        }, 300);
      });

      /* Mastery */
      t.bus.on("mastered", function(){
        setTimeout(function(){
          showVictoryDance({ title:"DOMINADO", xp:0, pi:0, duration:4000 });
        }, 300);
      });
    }

    /* ── XP FLOAT NOTIFICATION ── */
    if(t.bus){
      t.bus.on("xp", function(data){
        const amount = typeof data === "number" ? data : (data && data.amount) || 0;
        if(amount > 0){
          const el = document.createElement("div");
          el.textContent = "+" + amount + " XP";
          Object.assign(el.style, {
            position:"fixed", top:"80px", right:"24px",
            background:"linear-gradient(135deg,#6342ff,#c742ff)",
            color:"#fff", padding:"8px 18px", borderRadius:"20px",
            fontWeight:"700", fontSize:"15px", zIndex:"9999",
            pointerEvents:"none", boxShadow:"0 4px 16px rgba(99,66,255,.4)",
            animation:"xpFloat 1.8s ease-out forwards"
          });
          document.body.appendChild(el);
          setTimeout(function(){ el.remove(); }, 2000);
        }
      });
    }

    /* ── EXPORT ── */
    window.CapVictory = {
      show: showVictoryDance,
      confetti: launchConfetti
    };

    console.log("[CAPICÚA] Victoria v2.1 activa");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
