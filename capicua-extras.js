/* ═══════════════════════════════════════════════
   CAPICUA 2.1 — Extras: Timer, Enganches,
   Avatares, Falencias, Repaso, Mentores, Chat/Duelos
   ═══════════════════════════════════════════════ */
(function(){
  "use strict";

  function init(){
    const t = window.CapEngine, ui = window.CapUI;
    if(!t || !ui){ setTimeout(init, 200); return; }
    setup(t, ui);
  }

  function setup(t, ui){

    /* ══════════════════════════════════════════════
       1. TEMPORIZADOR DE LECCIONES (segundos)
       ══════════════════════════════════════════════ */
    var timerEl = null, timerInterval = null, timerSeconds = 0;

    function startLessonTimer(){
      stopLessonTimer();
      timerSeconds = 0;
      timerEl = document.createElement("div");
      timerEl.className = "lesson-timer";
      timerEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="13" r="9"/><path d="M12 9v4l2.5 1.5"/><path d="M10 2h4"/></svg><span id="timer-val">0:00</span>';
      var topBar = document.getElementById("top");
      if(topBar) topBar.appendChild(timerEl);
      timerInterval = setInterval(function(){
        timerSeconds++;
        var m = Math.floor(timerSeconds / 60);
        var s = timerSeconds % 60;
        var span = document.getElementById("timer-val");
        if(span) span.textContent = m + ":" + (s < 10 ? "0" : "") + s;
      }, 1000);
    }

    function stopLessonTimer(){
      if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
      if(timerEl && timerEl.parentNode){ timerEl.remove(); timerEl = null; }
      return timerSeconds;
    }

    /* Hook: start timer when entering a lesson, stop on exit */
    var origRender = ui.render;
    var lastHash = "";
    ui.render = function(){
      origRender.apply(ui, arguments);
      var hash = location.hash.replace("#","").split(".")[0];
      if(hash !== lastHash){
        if(lastHash === "leccion" || lastHash === "batalla" || lastHash === "ejercicio"){
          var elapsed = stopLessonTimer();
          if(elapsed > 5 && t.bus) t.bus.emit("lesson-time", { seconds: elapsed, view: lastHash });
        }
        if(hash === "leccion" || hash === "batalla" || hash === "ejercicio"){
          startLessonTimer();
        }
        lastHash = hash;
      }
    };

    /* ══════════════════════════════════════════════
       2. ENGANCHES CON RECOMPENSAS INGENIOSAS
       ══════════════════════════════════════════════ */
    var HOOKS = {
      streaks: { key: "cap-streak", threshold: [3,7,14,30] },
      dailyBonus: { key: "cap-daily-bonus" },
      challenges: [
        { id:"speed_demon", name:"Demonio Veloz", desc:"Completa una leccion en menos de 60s", xp:50 },
        { id:"perfect_battle", name:"Batalla Perfecta", desc:"Gana sin un solo error", xp:80 },
        { id:"explorer", name:"Explorador", desc:"Visita todas las secciones en un dia", xp:60 },
        { id:"night_owl", name:"Buho Nocturno", desc:"Estudia despues de las 10pm", xp:30 },
        { id:"marathon", name:"Maratonista", desc:"Completa 5 lecciones seguidas", xp:100 },
        { id:"comeback", name:"Gran Regreso", desc:"Vuelve despues de 3 dias sin jugar", xp:40 }
      ]
    };

    /* Streak system */
    function getStreak(){
      try{
        var d = JSON.parse(localStorage.getItem(HOOKS.streaks.key) || "{}");
        return d;
      }catch(e){ return {}; }
    }
    function updateStreak(){
      var d = getStreak();
      var today = new Date().toDateString();
      if(d.last === today) return d;
      var yesterday = new Date(Date.now() - 86400000).toDateString();
      if(d.last === yesterday){
        d.count = (d.count || 0) + 1;
      } else {
        if(d.count >= 3 && d.last){
          /* Comeback bonus */
          checkChallenge("comeback");
        }
        d.count = 1;
      }
      d.last = today;
      localStorage.setItem(HOOKS.streaks.key, JSON.stringify(d));
      /* Streak milestones */
      for(var i = 0; i < HOOKS.streaks.threshold.length; i++){
        if(d.count === HOOKS.streaks.threshold[i]){
          var bonus = d.count * 10;
          t.addXP(bonus);
          if(ui.toast) ui.toast("Racha de " + d.count + " dias! +" + bonus + " XP");
          if(d.count >= 7 && ui.confetti) ui.confetti(60);
          break;
        }
      }
      return d;
    }

    /* Daily bonus */
    function checkDailyBonus(){
      var today = new Date().toDateString();
      var last = localStorage.getItem(HOOKS.dailyBonus.key);
      if(last !== today){
        localStorage.setItem(HOOKS.dailyBonus.key, today);
        t.addXP(15);
        if(ui.toast) ui.toast("Bono diario: +15 XP");
        updateStreak();
      }
    }

    /* Challenge tracker */
    function checkChallenge(id){
      var S = t.S;
      if(!S.challenges) S.challenges = {};
      if(S.challenges[id]) return;
      var ch = null;
      for(var i=0;i<HOOKS.challenges.length;i++){
        if(HOOKS.challenges[i].id === id){ ch = HOOKS.challenges[i]; break; }
      }
      if(!ch) return;
      S.challenges[id] = Date.now();
      t.addXP(ch.xp);
      if(ui.toast) ui.toast("Desafio: " + ch.name + " +" + ch.xp + " XP");
      if(ui.confetti) ui.confetti(50);
      if(t.bus) t.bus.emit("challenge", ch);
    }

    /* Check time-based challenges */
    if(t.bus){
      t.bus.on("lesson-time", function(data){
        if(data.seconds < 60) checkChallenge("speed_demon");
      });
    }

    /* Night owl check */
    var hour = new Date().getHours();
    if(hour >= 22 || hour < 5){
      setTimeout(function(){ checkChallenge("night_owl"); }, 5000);
    }

    /* Daily bonus on load */
    setTimeout(checkDailyBonus, 2000);

    /* ── Enganches View ── */
    function renderEnganches(el){
      var streak = getStreak();
      var S = t.S;
      var done = S.challenges || {};

      var html = '<div class="enganches-page">';
      html += '<h2 class="h2">Recompensas y Desafios</h2>';
      html += '<p class="lead muted">Completa desafios para ganar XP extra</p>';

      /* Streak card */
      html += '<div class="card" style="margin:1rem 0">';
      html += '<div class="row between"><span class="h3">Racha diaria</span>';
      html += '<span class="chip v">' + (streak.count || 0) + ' dias</span></div>';
      html += '<div class="bar big"><i style="width:' + Math.min(100, ((streak.count||0)/30)*100) + '%"></i></div>';
      html += '<div class="row" style="gap:1rem;margin-top:.5rem">';
      for(var i=0;i<HOOKS.streaks.threshold.length;i++){
        var th = HOOKS.streaks.threshold[i];
        var reached = (streak.count||0) >= th;
        html += '<div class="chip ' + (reached ? 'ok' : '') + '">' + th + 'd = +' + (th*10) + 'XP</div>';
      }
      html += '</div></div>';

      /* Challenges grid */
      html += '<h3 class="h3" style="margin-top:1.5rem">Desafios</h3>';
      html += '<div class="grid" style="margin-top:.5rem">';
      for(var j=0;j<HOOKS.challenges.length;j++){
        var ch = HOOKS.challenges[j];
        var completed = !!done[ch.id];
        html += '<div class="card ' + (completed ? '' : 'flat') + '">';
        html += '<div class="row between"><span class="h3">' + ch.name + '</span>';
        html += '<span class="chip ' + (completed ? 'ok' : 'v') + '">' + (completed ? 'Completado' : '+' + ch.xp + ' XP') + '</span></div>';
        html += '<p class="small muted">' + ch.desc + '</p>';
        html += '</div>';
      }
      html += '</div></div>';

      el.innerHTML = html;
    }
    ui.views.recompensas = function(el){ renderEnganches(el); };

    /* ══════════════════════════════════════════════
       3. PERSONALIZACIÓN DE AVATARES
       ══════════════════════════════════════════════ */
    var AVATAR_ITEMS = {
      pelo: [
        { id:"p0", name:"Clasico", svg:'<circle cx="50" cy="22" r="18" fill="#6342ff"/>'},
        { id:"p1", name:"Punk", svg:'<path d="M32 25 Q50 -5 68 25" fill="#ff3d9a"/>'},
        { id:"p2", name:"Largo", svg:'<ellipse cx="50" cy="30" rx="22" ry="25" fill="#ffd700"/>'},
        { id:"p3", name:"Afro", svg:'<circle cx="50" cy="20" r="25" fill="#2ecc71"/>'},
        { id:"p4", name:"Galactico", svg:'<circle cx="50" cy="22" r="20" fill="url(#grad-hair)"/>'}
      ],
      ropa: [
        { id:"r0", name:"Camiseta", svg:'<rect x="32" y="60" width="36" height="25" rx="4" fill="#3498db"/>'},
        { id:"r1", name:"Bata Lab", svg:'<rect x="30" y="58" width="40" height="30" rx="4" fill="#ecf0f1" stroke="#bdc3c7"/>'},
        { id:"r2", name:"Hoodie", svg:'<rect x="30" y="58" width="40" height="28" rx="8" fill="#9b59b6"/>'},
        { id:"r3", name:"Armadura", svg:'<rect x="32" y="58" width="36" height="28" rx="3" fill="#e67e22" stroke="#d35400"/>'},
        { id:"r4", name:"Espacial", svg:'<rect x="30" y="56" width="40" height="32" rx="6" fill="#2c3e50"/><circle cx="50" cy="72" r="6" fill="#00e5ff"/>'}
      ],
      accesorios: [
        { id:"a0", name:"Ninguno", svg:''},
        { id:"a1", name:"Lentes", svg:'<rect x="38" y="38" width="10" height="8" rx="3" fill="none" stroke="#fff" stroke-width="1.5"/><rect x="52" y="38" width="10" height="8" rx="3" fill="none" stroke="#fff" stroke-width="1.5"/><line x1="48" y1="42" x2="52" y2="42" stroke="#fff" stroke-width="1.5"/>'},
        { id:"a2", name:"Corona", svg:'<path d="M38 18 L42 10 L46 16 L50 8 L54 16 L58 10 L62 18Z" fill="#ffd700"/>'},
        { id:"a3", name:"Auriculares", svg:'<path d="M32 38 Q32 28 50 28 Q68 28 68 38" fill="none" stroke="#ff3d9a" stroke-width="3"/><circle cx="32" cy="40" r="4" fill="#ff3d9a"/><circle cx="68" cy="40" r="4" fill="#ff3d9a"/>'},
        { id:"a4", name:"Capa", svg:'<path d="M35 60 Q30 75 25 95 L75 95 Q70 75 65 60" fill="#c742ff" opacity=".7"/>'}
      ]
    };

    function getAvatarConfig(){
      try{ return JSON.parse(localStorage.getItem("cap-avatar") || '{"pelo":"p0","ropa":"r0","acc":"a0","color":"#6342ff"}'); }
      catch(e){ return {pelo:"p0",ropa:"r0",acc:"a0",color:"#6342ff"}; }
    }
    function saveAvatarConfig(cfg){
      localStorage.setItem("cap-avatar", JSON.stringify(cfg));
      if(t.bus) t.bus.emit("avatar-change", cfg);
    }

    function renderAvatarPreview(cfg){
      var pelo = AVATAR_ITEMS.pelo.find(function(x){ return x.id === cfg.pelo; }) || AVATAR_ITEMS.pelo[0];
      var ropa = AVATAR_ITEMS.ropa.find(function(x){ return x.id === cfg.ropa; }) || AVATAR_ITEMS.ropa[0];
      var acc = AVATAR_ITEMS.accesorios.find(function(x){ return x.id === cfg.acc; }) || AVATAR_ITEMS.accesorios[0];

      return '<svg viewBox="0 0 100 100" width="120" height="120">' +
        '<defs><linearGradient id="grad-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6342ff"/><stop offset="100%" stop-color="#ff3d9a"/></linearGradient></defs>' +
        (acc.id === "a4" ? acc.svg : '') +
        ropa.svg +
        '<circle cx="50" cy="40" r="16" fill="' + cfg.color + '"/>' +
        '<circle cx="44" cy="38" r="2.5" fill="#fff"/><circle cx="56" cy="38" r="2.5" fill="#fff"/>' +
        '<path d="M44 46 Q50 50 56 46" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>' +
        pelo.svg +
        (acc.id !== "a4" ? acc.svg : '') +
        '</svg>';
    }

    function renderAvatarCustomizer(el){
      var cfg = getAvatarConfig();
      var html = '<div class="avatar-customizer">';
      html += '<h2 class="h2">Personaliza tu Avatar</h2>';
      html += '<p class="lead muted">Elige peinado, ropa y accesorios</p>';

      html += '<div class="split" style="margin-top:1rem">';

      /* Preview */
      html += '<div class="card" style="text-align:center;padding:2rem">';
      html += '<div id="avatar-preview">' + renderAvatarPreview(cfg) + '</div>';
      html += '<div class="h3" style="margin-top:.5rem">Tu Avatar</div>';
      html += '</div>';

      /* Options */
      html += '<div class="stack">';

      /* Color */
      html += '<div class="card flat"><div class="h3">Color de piel</div>';
      html += '<div class="row" style="margin-top:.5rem;gap:.5rem">';
      var skinColors = ["#6342ff","#c742ff","#ff6b9d","#ffd700","#e67e22","#3498db","#2ecc71","#8e44ad","#e74c3c","#1abc9c"];
      for(var c=0;c<skinColors.length;c++){
        html += '<button class="avatar-color-btn' + (cfg.color === skinColors[c] ? ' selected' : '') + '" data-color="' + skinColors[c] + '" style="width:32px;height:32px;border-radius:50%;background:' + skinColors[c] + ';border:3px solid ' + (cfg.color === skinColors[c] ? '#fff' : 'transparent') + ';cursor:pointer"></button>';
      }
      html += '</div></div>';

      /* Categories */
      var cats = [
        { key:"pelo", label:"Peinado", items:AVATAR_ITEMS.pelo },
        { key:"ropa", label:"Ropa", items:AVATAR_ITEMS.ropa },
        { key:"acc", label:"Accesorios", items:AVATAR_ITEMS.accesorios }
      ];
      for(var ci=0;ci<cats.length;ci++){
        var cat = cats[ci];
        var current = cfg[cat.key];
        html += '<div class="card flat"><div class="h3">' + cat.label + '</div>';
        html += '<div class="row" style="margin-top:.5rem;gap:.4rem;flex-wrap:wrap">';
        for(var it=0;it<cat.items.length;it++){
          var item = cat.items[it];
          html += '<button class="btn sm avatar-item-btn' + (current === item.id ? ' primary' : '') + '" data-cat="' + cat.key + '" data-id="' + item.id + '">' + item.name + '</button>';
        }
        html += '</div></div>';
      }

      html += '</div></div></div>';

      el.innerHTML = html;

      /* Event delegation */
      el.addEventListener("click", function(e){
        var btn = e.target.closest(".avatar-item-btn");
        if(btn){
          cfg[btn.dataset.cat] = btn.dataset.id;
          saveAvatarConfig(cfg);
          renderAvatarCustomizer(el);
          return;
        }
        var colorBtn = e.target.closest(".avatar-color-btn");
        if(colorBtn){
          cfg.color = colorBtn.dataset.color;
          saveAvatarConfig(cfg);
          renderAvatarCustomizer(el);
        }
      });
    }
    ui.views.avatar = function(el){ renderAvatarCustomizer(el); };

    /* ══════════════════════════════════════════════
       4. MUESTRA TUS FALENCIAS
       ══════════════════════════════════════════════ */
    function renderFalencias(el){
      var S = t.S;
      var topics = S.topics || {};
      var errors = [];

      for(var topic in topics){
        var d = topics[topic];
        if(d && d.errors && d.errors > 0){
          errors.push({ topic: topic, errors: d.errors, total: d.total || d.errors, pct: d.total ? Math.round((d.errors / d.total) * 100) : 100 });
        }
      }

      errors.sort(function(a,b){ return b.pct - a.pct; });

      var html = '<div class="falencias-page">';
      html += '<h2 class="h2">Tus Falencias</h2>';
      html += '<p class="lead muted">Areas donde necesitas mejorar</p>';

      if(errors.length === 0){
        html += '<div class="card" style="text-align:center;padding:2rem">';
        html += '<div style="font-size:3rem;margin-bottom:1rem">&#x2728;</div>';
        html += '<div class="h3">Sin falencias registradas</div>';
        html += '<p class="muted small">Completa lecciones y batallas para que aparezcan tus areas de mejora</p>';
        html += '</div>';
      } else {
        html += '<div class="stack" style="margin-top:1rem">';
        for(var i=0;i<errors.length;i++){
          var err = errors[i];
          html += '<div class="card">';
          html += '<div class="row between"><span class="h3">' + err.topic + '</span>';
          html += '<span class="chip bad">' + err.pct + '% errores</span></div>';
          html += '<div class="bar"><i style="width:' + (100 - err.pct) + '%;background:linear-gradient(90deg,var(--bad),var(--warn))"></i></div>';
          html += '<p class="small muted">' + err.errors + ' errores de ' + err.total + ' intentos</p>';
          html += '<button class="btn sm" onclick="location.hash=\'#repaso.' + err.topic + '\'">Repasar tema</button>';
          html += '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
      el.innerHTML = html;
    }
    ui.views.falencias = function(el){ renderFalencias(el); };

    /* ══════════════════════════════════════════════
       5. REPASO CON TARJETAS Y EXAMEN CORTO
       ══════════════════════════════════════════════ */
    function renderRepaso(el){
      var S = t.S;
      var html = '<div class="repaso-page">';
      html += '<h2 class="h2">Repaso</h2>';
      html += '<p class="lead muted">Revisa temas vistos con tarjetas y examenes cortos</p>';

      /* Tarjetas de repaso */
      html += '<div class="tabs" style="margin-top:1rem">';
      html += '<button aria-selected="true" data-tab="tarjetas">Tarjetas</button>';
      html += '<button data-tab="examen">Examen Rapido</button>';
      html += '</div>';

      /* Flashcards */
      html += '<div id="repaso-content">';
      html += renderFlashcards(S);
      html += '</div>';
      html += '</div>';

      el.innerHTML = html;

      /* Tab switching */
      el.addEventListener("click", function(e){
        var tab = e.target.closest("[data-tab]");
        if(tab){
          var tabs = el.querySelectorAll(".tabs button");
          for(var i=0;i<tabs.length;i++) tabs[i].setAttribute("aria-selected", tabs[i] === tab ? "true" : "false");
          var content = document.getElementById("repaso-content");
          if(content){
            if(tab.dataset.tab === "tarjetas") content.innerHTML = renderFlashcards(S);
            else content.innerHTML = renderQuickExam(S);
          }
        }
        /* Flip card */
        var card = e.target.closest(".flashcard");
        if(card) card.classList.toggle("flipped");
      });
    }

    function renderFlashcards(S){
      var cards = [
        { q:"Que es una derivada?", a:"La derivada mide la tasa de cambio instantanea de una funcion." },
        { q:"Formula cuadratica", a:"x = (-b +/- sqrt(b^2 - 4ac)) / 2a" },
        { q:"Seno de 30 grados", a:"sen(30) = 1/2 = 0.5" },
        { q:"Integral de x^n", a:"x^(n+1) / (n+1) + C" },
        { q:"Teorema de Pitagoras", a:"a^2 + b^2 = c^2" },
        { q:"Derivada de sen(x)", a:"cos(x)" },
        { q:"Limite fundamental", a:"lim (x->0) sen(x)/x = 1" },
        { q:"Area del circulo", a:"A = pi * r^2" }
      ];
      var html = '<div class="flashcard-deck" style="margin-top:1rem">';
      for(var i=0;i<cards.length;i++){
        html += '<div class="flashcard" tabindex="0">';
        html += '<div class="fc-front"><div class="fc-num">' + (i+1) + '/' + cards.length + '</div><div class="fc-text">' + cards[i].q + '</div><div class="fc-hint">Toca para voltear</div></div>';
        html += '<div class="fc-back"><div class="fc-text">' + cards[i].a + '</div></div>';
        html += '</div>';
      }
      html += '</div>';
      return html;
    }

    function renderQuickExam(S){
      var questions = [
        { q:"La derivada de x^3 es:", opts:["3x^2","x^2","3x","2x^3"], correct:0 },
        { q:"sen(90) = ?", opts:["0","1","-1","0.5"], correct:1 },
        { q:"Integral de 2x dx:", opts:["x^2 + C","2x^2 + C","x + C","x^2/2 + C"], correct:0 },
        { q:"log(1) = ?", opts:["1","0","-1","infinito"], correct:1 },
        { q:"(a+b)^2 = ?", opts:["a^2 + b^2","a^2 + 2ab + b^2","2a + 2b","a^2 - b^2"], correct:1 }
      ];
      var html = '<div class="quick-exam" style="margin-top:1rem">';
      html += '<div class="card"><div class="h3">Examen Rapido</div>';
      html += '<p class="small muted">5 preguntas aleatorias</p></div>';

      for(var i=0;i<questions.length;i++){
        var q = questions[i];
        html += '<div class="card flat" style="margin-top:.5rem" data-qidx="' + i + '">';
        html += '<div class="h3" style="font-size:.95rem">' + (i+1) + '. ' + q.q + '</div>';
        html += '<div class="opts">';
        for(var j=0;j<q.opts.length;j++){
          html += '<button class="opt exam-opt" data-q="' + i + '" data-o="' + j + '" data-correct="' + q.correct + '">' + q.opts[j] + '</button>';
        }
        html += '</div></div>';
      }
      html += '</div>';
      return html;
    }
    ui.views.repaso = function(el){ renderRepaso(el); };

    /* Exam answer handling */
    document.addEventListener("click", function(e){
      var opt = e.target.closest(".exam-opt");
      if(!opt) return;
      var q = parseInt(opt.dataset.q);
      var o = parseInt(opt.dataset.o);
      var correct = parseInt(opt.dataset.correct);
      var parent = opt.closest("[data-qidx]");
      if(!parent) return;
      var opts = parent.querySelectorAll(".exam-opt");
      for(var i=0;i<opts.length;i++){
        opts[i].disabled = true;
        if(parseInt(opts[i].dataset.o) === correct) opts[i].classList.add("ok");
        else if(opts[i] === opt && o !== correct) opts[i].classList.add("bad");
      }
      if(o === correct){
        t.addXP(10);
        if(ui.toast) ui.toast("Correcto! +10 XP");
      }
    });

    /* ══════════════════════════════════════════════
       6. MENTORES (desde el inicio)
       ══════════════════════════════════════════════ */
    var MENTORES = [
      { id:"euler", name:"Euler", area:"Calculo", desc:"Maestro de las series y el analisis", icon:"&#x1F9D9;", tips:["Practica derivadas a diario","Las series son la base del calculo avanzado"] },
      { id:"gauss", name:"Gauss", area:"Algebra", desc:"El principe de las matematicas", icon:"&#x1F451;", tips:["Busca patrones en los numeros","La factorizacion es tu mejor herramienta"] },
      { id:"hypatia", name:"Hypatia", area:"Geometria", desc:"Pionera de la geometria y astronomia", icon:"&#x2B50;", tips:["Dibuja siempre los problemas","Los angulos esconden muchas respuestas"] },
      { id:"turing", name:"Turing", area:"Logica", desc:"Padre de la computacion moderna", icon:"&#x1F4BB;", tips:["Piensa paso a paso","Todo problema se puede descomponer"] },
      { id:"noether", name:"Noether", area:"Algebra abstracta", desc:"Revoluciono el algebra moderna", icon:"&#x1F52E;", tips:["Las estructuras abstractas simplifican todo","Busca las simetrias"] }
    ];

    function renderMentores(el){
      var S = t.S;
      var activeMentor = S.mentor || null;

      var html = '<div class="mentores-page">';
      html += '<h2 class="h2">Mentores</h2>';
      html += '<p class="lead muted">Elige un mentor desde el inicio. Te guiara en tu aventura.</p>';

      if(activeMentor){
        var m = MENTORES.find(function(x){ return x.id === activeMentor; });
        if(m){
          html += '<div class="card" style="margin:1rem 0;border-color:var(--violet)">';
          html += '<div class="row"><span style="font-size:2rem">' + m.icon + '</span>';
          html += '<div><div class="h3">' + m.name + ' <span class="chip v">Tu mentor</span></div>';
          html += '<div class="small muted">' + m.area + '</div></div></div>';
          html += '<div class="note">"' + m.tips[Math.floor(Math.random()*m.tips.length)] + '"</div>';
          html += '</div>';
        }
      }

      html += '<div class="grid" style="margin-top:1rem">';
      for(var i=0;i<MENTORES.length;i++){
        var me = MENTORES[i];
        var isActive = activeMentor === me.id;
        html += '<div class="card click' + (isActive ? '' : ' flat') + '">';
        html += '<div style="font-size:2.5rem;text-align:center">' + me.icon + '</div>';
        html += '<div class="h3" style="text-align:center">' + me.name + '</div>';
        html += '<div class="small muted" style="text-align:center">' + me.area + '</div>';
        html += '<p class="small">' + me.desc + '</p>';
        if(!isActive){
          html += '<button class="btn sm primary mentor-select" data-id="' + me.id + '">Elegir mentor</button>';
        } else {
          html += '<div class="chip ok" style="align-self:center">Mentor activo</div>';
        }
        html += '</div>';
      }
      html += '</div></div>';

      el.innerHTML = html;

      el.addEventListener("click", function(e){
        var btn = e.target.closest(".mentor-select");
        if(btn){
          t.S.mentor = btn.dataset.id;
          if(ui.toast) ui.toast("Mentor seleccionado!");
          renderMentores(el);
        }
      });
    }
    ui.views.mentores = function(el){ renderMentores(el); };

    /* ══════════════════════════════════════════════
       7. CHATS CON AMIGOS Y DUELOS
       ══════════════════════════════════════════════ */
    function renderChatDuelos(el){
      var html = '<div class="chat-duelos-page">';
      html += '<h2 class="h2">Chat y Duelos</h2>';

      html += '<div class="tabs"><button aria-selected="true" data-tab="duelos">Duelos VS</button><button data-tab="chat">Chat</button></div>';
      html += '<div id="cd-content">';
      html += renderDuelos();
      html += '</div></div>';

      el.innerHTML = html;

      el.addEventListener("click", function(e){
        var tab = e.target.closest("[data-tab]");
        if(tab){
          var tabs = el.querySelectorAll(".tabs button");
          for(var i=0;i<tabs.length;i++) tabs[i].setAttribute("aria-selected", tabs[i] === tab ? "true" : "false");
          var content = document.getElementById("cd-content");
          if(content){
            content.innerHTML = tab.dataset.tab === "duelos" ? renderDuelos() : renderChat();
          }
        }
        /* Quick duel */
        var duelBtn = e.target.closest(".start-duel");
        if(duelBtn){
          location.hash = "#batalla";
        }
      });
    }

    function renderDuelos(){
      return '<div class="stack" style="margin-top:1rem">' +
        '<div class="card">' +
          '<div class="h3">Duelo Rapido</div>' +
          '<p class="small muted">Reta a un rival aleatorio en una batalla matematica</p>' +
          '<button class="btn primary start-duel">Iniciar Duelo</button>' +
        '</div>' +
        '<div class="card flat">' +
          '<div class="h3">Historial de Duelos</div>' +
          '<div class="empty">Aun no tienes duelos. Inicia uno!</div>' +
        '</div>' +
      '</div>';
    }

    function renderChat(){
      return '<div class="stack" style="margin-top:1rem">' +
        '<div class="card">' +
          '<div class="chat" style="min-height:200px">' +
            '<div class="msg ai"><p>Bienvenido al chat de CAPICUA. Conecta con amigos para estudiar juntos.</p></div>' +
          '</div>' +
          '<div class="row" style="margin-top:.5rem">' +
            '<input type="text" placeholder="Escribe un mensaje..." style="flex:1">' +
            '<button class="btn sm primary">Enviar</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    ui.views.duelos = function(el){ renderChatDuelos(el); };

    /* ══════════════════════════════════════════════
       8. MASCOTAS — ACUARIO + SELVA
       ══════════════════════════════════════════════ */
    var HABITATS = {
      acuario: {
        name:"Acuario", icon:"&#x1F30A;", bg:"linear-gradient(180deg,#0a1628,#0d3b66,#1a6b8a)",
        animals:[
          {id:"pez_neon",name:"Pez Neon",emoji:"&#x1F420;",cost:0,desc:"Tu primer companero acuatico",skills:[
            {name:"Brillo Neon",desc:"Ilumina una pista en preguntas",unlock:1},
            {name:"Cardumen",desc:"+5% XP en modo batalla",unlock:3},
            {name:"Corriente Rapida",desc:"+3s en temporizador",unlock:5}
          ]},
          {id:"delfin",name:"Delfin",emoji:"&#x1F42C;",cost:200,desc:"Inteligente y agil",skills:[
            {name:"Eco Sonar",desc:"Elimina 1 respuesta incorrecta",unlock:1},
            {name:"Salto",desc:"+10% XP en lecciones",unlock:4},
            {name:"Danza Marina",desc:"Combo x2 en rachas de 3+",unlock:7}
          ]},
          {id:"pulpo",name:"Pulpo",emoji:"&#x1F419;",cost:500,desc:"8 tentaculos, 8 ideas",skills:[
            {name:"Tinta",desc:"Pista extra en simulacros",unlock:1},
            {name:"Camuflaje",desc:"Protege tu racha 1 vez",unlock:5},
            {name:"Cerebro Multiple",desc:"+15% XP en todo",unlock:10}
          ]},
          {id:"tortuga_marina",name:"Tortuga Marina",emoji:"&#x1F422;",cost:1000,desc:"Sabiduria ancestral",skills:[
            {name:"Caparazon",desc:"Segundo intento en pregunta",unlock:1},
            {name:"Corriente Oceano",desc:"+5s en examenes",unlock:6},
            {name:"Sabiduria Antigua",desc:"Doble XP en repaso",unlock:12}
          ]},
          {id:"tiburon",name:"Tiburon",emoji:"&#x1F988;",cost:2000,desc:"El depredador definitivo",skills:[
            {name:"Instinto",desc:"Marca la respuesta correcta 1/dia",unlock:1},
            {name:"Mandibula",desc:"Destroza al rival en duelos (+25% dmg)",unlock:8},
            {name:"Apex",desc:"+20% XP global, inmunidad a racha rota",unlock:15}
          ]}
        ]
      },
      selva: {
        name:"Selva", icon:"&#x1F333;", bg:"linear-gradient(180deg,#0a2a0a,#1a4d1a,#2d6b2d)",
        animals:[
          {id:"loro",name:"Loro",emoji:"&#x1F99C;",cost:0,desc:"Colorido y conversador",skills:[
            {name:"Repeticion",desc:"Repite la pregunta con pista",unlock:1},
            {name:"Vuelo Tropical",desc:"+5% XP en tarjetas",unlock:3},
            {name:"Cancion Selvatica",desc:"Bonus x1.5 en rachas",unlock:5}
          ]},
          {id:"mono",name:"Mono",emoji:"&#x1F412;",cost:200,desc:"Agil y curioso",skills:[
            {name:"Trepar",desc:"Salta una pregunta dificil",unlock:1},
            {name:"Banana Power",desc:"+10% XP general",unlock:4},
            {name:"Rey de la Selva",desc:"Combo x2 en ejercicios",unlock:7}
          ]},
          {id:"jaguar",name:"Jaguar",emoji:"&#x1F406;",cost:500,desc:"Velocidad y precision",skills:[
            {name:"Acecho",desc:"Elimina 1 respuesta incorrecta",unlock:1},
            {name:"Velocidad Felina",desc:"+7s en temporizador",unlock:5},
            {name:"Garras Letales",desc:"+20% dmg en duelos",unlock:10}
          ]},
          {id:"serpiente",name:"Serpiente",emoji:"&#x1F40D;",cost:1000,desc:"Astuta y precisa",skills:[
            {name:"Veneno",desc:"Penaliza al rival en duelo",unlock:1},
            {name:"Hipnosis",desc:"Revela patron en pregunta",unlock:6},
            {name:"Muda",desc:"Reinicia temporizador 1 vez",unlock:12}
          ]},
          {id:"aguila",name:"Aguila",emoji:"&#x1F985;",cost:2000,desc:"Vision suprema",skills:[
            {name:"Vista de Aguila",desc:"Marca respuesta correcta 1/dia",unlock:1},
            {name:"Planeo",desc:"+15% XP en todo",unlock:8},
            {name:"Grito del Cielo",desc:"+25% XP global, protege racha",unlock:15}
          ]}
        ]
      }
    };

    function getPetData(){
      var d = t.S.pets;
      if(!d) d = t.S.pets = { owned:["pez_neon","loro"], active:null, habitat:"acuario", petXP:{} };
      if(!d.petXP) d.petXP = {};
      return d;
    }

    function petLevel(id){
      var d = getPetData();
      var xp = d.petXP[id] || 0;
      return Math.floor(Math.sqrt(xp / 50)) + 1;
    }

    function findAnimal(id){
      for(var h in HABITATS){
        var animals = HABITATS[h].animals;
        for(var i=0;i<animals.length;i++) if(animals[i].id === id) return animals[i];
      }
      return null;
    }

    function renderMascota(el){
      var d = getPetData();
      var tab = d.habitat || "acuario";

      var html = '<div class="mascota-page">';
      html += '<h2 class="h2">Mascotas</h2>';

      /* Habitat tabs */
      html += '<div class="tabs">';
      for(var h in HABITATS){
        html += '<button data-htab="' + h + '" aria-selected="' + (h===tab) + '">' + HABITATS[h].icon + ' ' + HABITATS[h].name + '</button>';
      }
      html += '</div>';

      /* Active pet banner */
      if(d.active){
        var ap = findAnimal(d.active);
        if(ap){
          var alv = petLevel(d.active);
          var axp = d.petXP[d.active] || 0;
          var nextLvXp = alv * alv * 50;
          html += '<div class="card" style="margin:1rem 0;border-color:var(--violet);background:var(--panel)">';
          html += '<div class="row between"><div class="row"><span style="font-size:2.5rem">' + ap.emoji + '</span>';
          html += '<div><div class="h3">' + ap.name + ' <span class="chip v">Activa</span></div>';
          html += '<div class="small muted">Nivel ' + alv + ' &middot; ' + axp + '/' + nextLvXp + ' XP</div></div></div>';
          html += '<div class="row" style="gap:.3rem">';
          html += '<button class="btn sm pet-feed">Alimentar</button>';
          html += '<button class="btn sm pet-play">Jugar</button>';
          html += '<button class="btn sm pet-train">Entrenar</button>';
          html += '</div></div>';

          /* Skills */
          html += '<div class="card flat" style="margin-bottom:1rem"><div class="h3">Habilidades</div>';
          for(var si=0;si<ap.skills.length;si++){
            var sk = ap.skills[si];
            var unlocked = alv >= sk.unlock;
            html += '<div class="row between" style="opacity:' + (unlocked ? '1' : '.4') + ';margin-top:.4rem">';
            html += '<div><span class="small">' + (unlocked ? '&#x2705;' : '&#x1F512;') + ' ' + sk.name + '</span>';
            html += '<div class="small muted">' + sk.desc + '</div></div>';
            html += '<span class="chip ' + (unlocked ? 'ok' : '') + '">Nv.' + sk.unlock + '</span>';
            html += '</div>';
          }
          html += '</div>';
        }
      }

      /* Animal grid */
      var habitat = HABITATS[tab];
      html += '<div class="grid">';
      for(var ai=0;ai<habitat.animals.length;ai++){
        var an = habitat.animals[ai];
        var owned = d.owned.indexOf(an.id) !== -1;
        var isActive = d.active === an.id;
        var lvl = petLevel(an.id);
        html += '<div class="card' + (isActive ? '' : ' flat') + '" style="text-align:center">';
        html += '<div style="font-size:3rem">' + an.emoji + '</div>';
        html += '<div class="h3">' + an.name + '</div>';
        html += '<div class="small muted">' + an.desc + '</div>';
        if(owned){
          html += '<div class="small">Nv. ' + lvl + '</div>';
          if(!isActive) html += '<button class="btn sm primary pet-activate" data-id="' + an.id + '">Activar</button>';
          else html += '<span class="chip v">Activa</span>';
        } else {
          html += '<div class="small" style="margin-top:.3rem">';
          var canBuy = (t.S.pi || 0) >= an.cost;
          html += '<button class="btn sm ' + (canBuy ? 'primary' : '') + ' pet-buy" data-id="' + an.id + '" data-cost="' + an.cost + '"' + (canBuy ? '' : ' disabled') + '>' + an.cost + ' PI</button>';
          html += '</div>';
        }
        html += '</div>';
      }
      html += '</div></div>';
      el.innerHTML = html;

      /* Events */
      el.addEventListener("click", function handler(e){
        var htab = e.target.closest("[data-htab]");
        if(htab){ d.habitat = htab.dataset.htab; renderMascota(el); return; }

        var buyBtn = e.target.closest(".pet-buy");
        if(buyBtn){
          var cost = parseInt(buyBtn.dataset.cost);
          if((t.S.pi || 0) >= cost){
            t.S.pi -= cost;
            d.owned.push(buyBtn.dataset.id);
            if(ui.toast) ui.toast("Nueva mascota desbloqueada!");
            if(ui.confetti) ui.confetti(60);
            renderMascota(el);
          }
          return;
        }

        var actBtn = e.target.closest(".pet-activate");
        if(actBtn){ d.active = actBtn.dataset.id; renderMascota(el); return; }

        if(e.target.closest(".pet-feed")){
          if(!d.petXP[d.active]) d.petXP[d.active] = 0;
          d.petXP[d.active] += 10;
          if(ui.toast) ui.toast("Mascota alimentada! +10 XP mascota");
          renderMascota(el); return;
        }
        if(e.target.closest(".pet-play")){
          if(!d.petXP[d.active]) d.petXP[d.active] = 0;
          d.petXP[d.active] += 15;
          if(ui.toast) ui.toast("Mascota feliz! +15 XP mascota");
          renderMascota(el); return;
        }
        if(e.target.closest(".pet-train")){
          if(!d.petXP[d.active]) d.petXP[d.active] = 0;
          d.petXP[d.active] += 25;
          t.addXP(5);
          if(ui.toast) ui.toast("Entrenamiento! +25 XP mascota, +5 XP tuyo");
          renderMascota(el); return;
        }
      });
    }
    ui.views.mascota = function(el){ renderMascota(el); };

    /* ══════════════════════════════════════════════
       9. INYECTAR NAVEGACIÓN EXTRA
       ══════════════════════════════════════════════ */
    var extraNavItems = [
      { route:"mentores", label:"Mentores", icon:"users" },
      { route:"recompensas", label:"Recompensas", icon:"gift" },
      { route:"repaso", label:"Repaso", icon:"rotate-cw" },
      { route:"falencias", label:"Falencias", icon:"alert-triangle" },
      { route:"duelos", label:"Duelos", icon:"swords" },
      { route:"avatar", label:"Avatar", icon:"user" },
      { route:"mascota", label:"Mascota", icon:"heart" }
    ];

    function injectExtraNav(){
      var nav = document.querySelector("#side .nav");
      if(!nav) return;
      for(var i = 0; i < extraNavItems.length; i++){
        var item = extraNavItems[i];
        if(nav.querySelector('[data-r="' + item.route + '"]')) continue;
        var link = document.createElement("a");
        link.href = "#" + item.route;
        link.dataset.r = item.route;
        link.innerHTML = ui.ic(item.icon, 20) + item.label;
        var comunidad = nav.querySelector('[data-r="comunidad"]');
        if(comunidad) nav.insertBefore(link, comunidad);
        else nav.appendChild(link);
      }
    }

    /* Wrap render for nav injection */
    var prevRender = ui.render;
    ui.render = function(){
      prevRender.apply(ui, arguments);
      requestAnimationFrame(injectExtraNav);
    };
    setTimeout(injectExtraNav, 1200);

    /* ══════════════════════════════════════════════
       10. CAPI BAILA EN VICTORIA
       ══════════════════════════════════════════════ */
    function makeCapiDance(){
      var capi = document.querySelector("#companion .face svg, #companion .face");
      if(!capi) return;
      capi.classList.add("capi-dancing");
      setTimeout(function(){ capi.classList.remove("capi-dancing"); }, 3000);
    }

    if(t.bus){
      t.bus.on("xp", function(data){
        var amount = typeof data === "number" ? data : (data && data.amount) || 0;
        if(amount >= 20) makeCapiDance();
      });
      t.bus.on("levelup", makeCapiDance);
      t.bus.on("mastered", makeCapiDance);
    }

    /* ══════════════════════════════════════════════
       EXPORTS
       ══════════════════════════════════════════════ */
    window.CapExtras = {
      startTimer: startLessonTimer,
      stopTimer: stopLessonTimer,
      getStreak: getStreak,
      checkChallenge: checkChallenge,
      getAvatarConfig: getAvatarConfig,
      MENTORES: MENTORES,
      makeCapiDance: makeCapiDance
    };

    console.log("[CAPICUA] Extras v2.1 activos");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
