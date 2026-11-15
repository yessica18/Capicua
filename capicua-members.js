/* ═══════════════════════════════════════════════
   CAPICUA 2.1 — Membresías (referencia video)
   ═══════════════════════════════════════════════ */
(function(){
  "use strict";

  function init(){
    const t = window.CapEngine, ui = window.CapUI;
    if(!t || !ui){ setTimeout(init, 200); return; }
    setup(t, ui);
  }

  function setup(t, ui){

    /* ── PLANES ── */
    const PLANS = [
      { id:"orbita", name:"Orbita", tag:"PARA SIEMPRE", icon:"🌍", border:"#6342ff",
        monthly:0, semestral:0, annual:0, annualTotal:0, semestralTotal:0,
        perks:[
          "Los 12 mundos, lecciones y jefes",
          "Capi, mentores y diagnostico",
          "Combate, cofres e insignias de juego",
          "Laboratorios, tarjetas y aula"
        ]},
      { id:"chispa", name:"Chispa", tag:"PARA EMPEZAR", icon:"✨", border:"#00bfff",
        monthly:1900, semestral:1615, annual:1330,
        semestralTotal:9690, annualTotal:16000,
        perks:[
          "Insignia Chispa y aro celeste en tu perfil",
          "Linea de vida +10 PV",
          "1 escudo de racha cada semana",
          "Botiquin semanal: 2 curitas",
          "100 monedas π cada mes"
        ]},
      { id:"cometa", name:"Cometa", tag:"LA MAS ELEGIDA", icon:"☄️", border:"#ff6b9d",
        monthly:3900, semestral:3315, annual:2730,
        semestralTotal:19890, annualTotal:32800,
        perks:[
          "Todo lo de Chispa",
          "Insignia Cometa y aro rosa",
          "Linea de vida +25 PV",
          "2 escudos de racha cada semana",
          "Botiquin semanal: 3 curitas y 1 venda",
          "Tu mentor bloquea 1 ataque extra por leccion"
        ]},
      { id:"nova", name:"Nova", tag:"TODO CAPICUA", icon:"🌟", border:"#ffd700",
        monthly:6900, semestral:5865, annual:4830,
        semestralTotal:35190, annualTotal:58000,
        perks:[
          "Todo lo de Cometa",
          "Insignia Nova y aro dorado",
          "Linea de vida +40 PV",
          "3 escudos de racha cada semana",
          "Botiquin semanal: 4 curitas y 2 vendas",
          "Tu mentor bloquea 2 ataques extra por leccion",
          "Cofre de leccion con una mejora de rareza garantizada"
        ]}
    ];

    /* ── INSIGNIAS ── */
    const BADGES = [
      {id:"contragolpe", name:"Primer contragolpe", icon:"⚡", desc:"Devolver un ataque enemigo", color:"#00e5ff"},
      {id:"reflejos",    name:"Reflejos de acero",  icon:"⚔️",  desc:"Devolver 50 ataques",       color:"#42a5f5"},
      {id:"relampago",   name:"Relampago",           icon:"⚡", desc:"Diez respuestas en menos de 5 s", color:"#ffeb3b"},
      {id:"intocable",   name:"Intocable",           icon:"💎", desc:"Terminar una leccion sin golpe", color:"#76ff03"},
      {id:"muralla",     name:"Muralla",             icon:"🛡️", desc:"Cinco lecciones sin perder vida",  color:"#ff9800"},
      {id:"sabio",       name:"Bajo el ala del sabio",icon:"🧙", desc:"Vinculo nivel 3 con un mentor",  color:"#ce93d8"},
      {id:"aprendiz",    name:"Aprendiz veloz",      icon:"📚", desc:"Completar 10 lecciones",  color:"#4fc3f7"},
      {id:"explorador",  name:"Explorador",          icon:"🧭", desc:"Visitar todos los mundos",  color:"#a5d6a7"},
      {id:"persistente", name:"Persistente",         icon:"🔥", desc:"Racha de 7 dias",  color:"#ff7043"},
      {id:"dedicado",    name:"Dedicado",            icon:"⭐", desc:"Racha de 30 dias",  color:"#ffd54f"},
      {id:"estratega",   name:"Estratega",           icon:"🎯", desc:"Ganar 5 duelos",  color:"#e040fb"},
      {id:"creador",     name:"Creador",             icon:"🎨", desc:"Personalizar avatar completo",  color:"#f48fb1"},
      {id:"cientifico",  name:"Cientifico",          icon:"🔬", desc:"Completar 3 laboratorios",  color:"#80cbc4"},
      {id:"maestro",     name:"Maestro",             icon:"👑", desc:"Alcanzar nivel 25",  color:"#ffd700"},
      {id:"leyenda",     name:"Leyenda",             icon:"🏆", desc:"Derrotar al jefe final",  color:"#ff6e40"},
      {id:"coleccionista",name:"Coleccionista",      icon:"🗃️", desc:"Obtener 50 cofres",  color:"#9575cd"},
      {id:"social",      name:"Social",              icon:"🤝", desc:"Agregar 5 amigos",  color:"#4dd0e1"},
      {id:"perfeccion",  name:"Perfeccion",          icon:"💯", desc:"100 % en un examen",  color:"#e6ee9c"},
      {id:"guardian",    name:"Guardian",             icon:"🌟", desc:"Completar todas las misiones",  color:"#fff176"}
    ];

    /* ── HELPERS ── */
    function state(){ return t.S; }
    function membership(){ return state().membership || "orbita"; }
    function earnedBadges(){
      var a = state().achievements || {};
      return BADGES.filter(function(b){ return a[b.id]; });
    }

    function fmtCOP(n){
      if(n === 0) return "$0";
      return "$" + n.toLocaleString("es-CO");
    }

    /* ── REDEEM CODE ── */
    function redeemCode(code){
      if(!code) return;
      code = code.trim().toUpperCase();
      var used = state().usedCodes || [];
      if(used.indexOf(code) !== -1){
        if(ui.toast) ui.toast("Ya usaste este codigo");
        return;
      }
      /* demo codes */
      var rewards = {
        "CAPI888":  {xp:200, pi:50, msg:"200 XP y 50 π"},
        "CAPICUA":  {xp:100, pi:20, msg:"100 XP y 20 π"},
        "ESTRELLA": {xp:500, pi:100, msg:"500 XP y 100 π"},
        "BIENVENIDA":{xp:50,  pi:10, msg:"50 XP y 10 π"}
      };
      var r = rewards[code];
      if(!r){
        if(ui.toast) ui.toast("Codigo no valido");
        return;
      }
      if(t.addXP) t.addXP(r.xp);
      if(t.addPI) t.addPI(r.pi);
      if(!state().usedCodes) state().usedCodes = [];
      state().usedCodes.push(code);
      if(ui.toast) ui.toast("Canjeado: " + r.msg);
      if(ui.confetti) ui.confetti(40);
      ui.render();
    }

    /* ── SELECT MEMBERSHIP (demo) ── */
    function selectPlan(planId){
      if(planId === "orbita") return;
      state().membership = planId;
      if(ui.toast) ui.toast("Membresia " + planId + " activada (demo)");
      if(ui.confetti) ui.confetti(60);
      ui.render();
    }

    /* ── RENDER ── */
    function renderMembership(el){
      var cur = membership();
      var period = state().memberPeriod || "monthly";
      var earned = earnedBadges();

      var h = '<div class="membership-page">';

      /* Header */
      h += '<p class="mem-support">APOYA A CAPICUA</p>';
      h += '<h2 class="mem-title">Membresias</h2>';
      h += '<p class="mem-desc">Aprender es y sera <strong>gratis</strong>: mundos, lecciones, jefes, Capi y salas no se bloquean nunca. Las membresias cuestan menos que un tinto y suman vida, escudos, botiquin, monedas π e insignias. Nunca compran respuestas.</p>';

      /* Period tabs */
      h += '<div class="mem-periods">';
      h += '<button class="mem-period' + (period === "monthly" ? " active" : "") + '" data-period="monthly">Mensual</button>';
      h += '<button class="mem-period' + (period === "semestral" ? " active" : "") + '" data-period="semestral">Semestral -15 %</button>';
      h += '<button class="mem-period' + (period === "annual" ? " active" : "") + '" data-period="annual">Anual -30 %</button>';
      h += '</div>';

      /* Cards */
      h += '<div class="mem-grid">';
      for(var i = 0; i < PLANS.length; i++){
        var p = PLANS[i];
        var isCurrent = p.id === cur;
        var price = period === "annual" ? p.annual : period === "semestral" ? p.semestral : p.monthly;
        var totalLabel = "";
        if(p.monthly > 0){
          if(period === "annual")
            totalLabel = "Pago unico de " + fmtCOP(p.annualTotal) + " por 12 meses, IVA incluido";
          else if(period === "semestral")
            totalLabel = "Pago unico de " + fmtCOP(p.semestralTotal) + " por 6 meses, IVA incluido";
          else
            totalLabel = "IVA incluido. Cancela cuando quieras.";
        }

        h += '<div class="mem-card' + (isCurrent ? ' current' : '') + '" style="--mem-border:' + p.border + '">';
        h += '<span class="mem-tag">' + p.tag + '</span>';
        h += '<div class="mem-plan-name">' + (p.icon ? p.icon + ' ' : '') + p.name + '</div>';
        h += '<div class="mem-price">' + fmtCOP(price) + (p.monthly > 0 ? ' <small>COP / mes</small>' : '') + '</div>';
        if(totalLabel) h += '<div class="mem-billing">' + totalLabel + '</div>';

        h += '<ul class="mem-perks">';
        for(var j = 0; j < p.perks.length; j++){
          h += '<li>' + p.perks[j] + '</li>';
        }
        h += '</ul>';

        if(p.id === "orbita"){
          h += '<button class="mem-btn included" disabled>Incluido</button>';
        } else if(isCurrent){
          h += '<button class="mem-btn included" disabled>Activo</button>';
        } else {
          h += '<button class="mem-btn choose" data-plan="' + p.id + '">Elegir ' + p.name + '</button>';
        }
        h += '</div>';
      }
      h += '</div>';

      /* Code redemption */
      h += '<div class="mem-code-box">';
      h += '<p class="mem-code-title">Tienes un codigo?</p>';
      h += '<div class="mem-code-row">';
      h += '<input class="mem-code-input" placeholder="Ej.: CAPI888" maxlength="20">';
      h += '<button class="mem-code-btn">Canjear</button>';
      h += '</div></div>';

      /* Demo notice */
      h += '<div class="mem-demo">';
      h += '<strong>Modo demostracion:</strong> el pago es simulado y no se cobra dinero real. ';
      h += 'Para cobrar de verdad (Nequi, PSE o tarjeta con Wompi) hace falta un servidor que confirme cada pago; ';
      h += 'mientras tanto la membresia se guarda solo en este navegador. ';
      h += 'Datos minimos segun la Ley 1581 de 2012: no pedimos documentos ni datos de pago.';
      h += '</div>';

      /* Badges */
      h += '<div class="mem-badges">';
      h += '<h3 class="mem-badges-title">Tus insignias <span class="mem-badge-count">' + earned.length + ' de ' + BADGES.length + '</span></h3>';
      h += '<div class="mem-badge-grid">';
      for(var k = 0; k < BADGES.length; k++){
        var b = BADGES[k];
        var has = earned.some(function(e){ return e.id === b.id; });
        h += '<div class="mem-badge' + (has ? ' earned' : '') + '" title="' + b.desc + '">';
        h += '<div class="mem-badge-icon" style="' + (has ? 'background:' + b.color : '') + '">' + b.icon + '</div>';
        h += '<div class="mem-badge-name">' + b.name + '</div>';
        h += '<div class="mem-badge-desc">' + b.desc + '</div>';
        h += '</div>';
      }
      h += '</div></div>';

      h += '</div>';
      el.innerHTML = h;

      /* ── EVENTS ── */
      /* Period tabs */
      var tabs = el.querySelectorAll('.mem-period');
      for(var ti = 0; ti < tabs.length; ti++){
        tabs[ti].addEventListener('click', function(){
          state().memberPeriod = this.dataset.period;
          renderMembership(el);
        });
      }
      /* Choose plan */
      var btns = el.querySelectorAll('.mem-btn.choose');
      for(var bi = 0; bi < btns.length; bi++){
        btns[bi].addEventListener('click', function(){
          selectPlan(this.dataset.plan);
        });
      }
      /* Redeem code */
      var codeBtn = el.querySelector('.mem-code-btn');
      var codeInput = el.querySelector('.mem-code-input');
      if(codeBtn && codeInput){
        codeBtn.addEventListener('click', function(){
          redeemCode(codeInput.value);
        });
        codeInput.addEventListener('keydown', function(e){
          if(e.key === 'Enter') redeemCode(codeInput.value);
        });
      }
    }

    /* ── REGISTER VIEW ── */
    ui.views.membresias = function(el){ renderMembership(el); };

    /* ── INJECT NAV LINK ── */
    function injectNav(){
      var nav = document.querySelector("#side .nav");
      if(!nav) return;
      if(nav.querySelector('[data-r="membresias"]')) return;
      var link = document.createElement("a");
      link.href = "#membresias";
      link.dataset.r = "membresias";
      link.innerHTML = ui.ic("medal",20) + "Membresias";
      var comunidad = nav.querySelector('[data-r="comunidad"]');
      if(comunidad) nav.insertBefore(link, comunidad);
      else nav.appendChild(link);
    }

    /* ── INJECT PROFILE BADGE ── */
    function injectBadge(){
      var profile = document.querySelector(".profile-head, .profile-info, .avatar-name");
      if(!profile) return;
      if(profile.querySelector(".profile-tier-badge")) return;
      var plan = PLANS.filter(function(p){ return p.id === membership(); })[0] || PLANS[0];
      var badge = document.createElement("div");
      badge.className = "profile-tier-badge";
      badge.innerHTML = (plan.icon || '') + ' ' + plan.name;
      badge.style.cursor = "pointer";
      badge.onclick = function(){ ui.go("membresias"); };
      profile.appendChild(badge);
    }

    /* ── WRAP RENDER ── */
    var origRender = ui.render;
    ui.render = function(){
      origRender.apply(ui, arguments);
      requestAnimationFrame(function(){
        injectNav();
        injectBadge();
      });
    };

    setTimeout(function(){
      injectNav();
      injectBadge();
    }, 1000);

    /* ── EXPORT ── */
    window.CapMembers = {
      PLANS: PLANS,
      BADGES: BADGES,
      membership: membership,
      earnedBadges: earnedBadges,
      selectPlan: selectPlan,
      redeemCode: redeemCode,
      renderMembership: renderMembership
    };

    console.log("[CAPICUA] Membresias v2.1 (video ref) activas");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
