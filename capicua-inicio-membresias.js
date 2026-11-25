/* ═══════════════════════════════════════════════
   CAPICUA — Seccion de Membresias en Inicio
   Muestra los 4 planes (Orbita, Chispa, Cometa, Nova)
   con su signo y beneficios. Usa los datos reales de
   window.CapMembers.PLANS; no duplica informacion.
   ═══════════════════════════════════════════════ */
(function(){
  "use strict";

  /* ── SIGNOS (SVG, sin emojis) ── */
  var SIGNS = {
    orbita: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">'
          + '<circle cx="12" cy="12" r="4.6"/>'
          + '<ellipse cx="12" cy="12" rx="10.6" ry="4.2" transform="rotate(-28 12 12)"/></svg>',
    chispa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
          + '<path d="M11.4 1.8l1.9 6.1 6.1 1.9-6.1 1.9-1.9 6.1-1.9-6.1L3.4 9.8l6.1-1.9z"/>'
          + '<circle cx="18.6" cy="17.8" r="1.9"/><circle cx="5.4" cy="18.4" r="1.2"/></svg>',
    cometa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">'
          + '<circle cx="16.6" cy="7.4" r="3.9" fill="currentColor" stroke="none"/>'
          + '<path d="M12.6 11.4L3.2 20.8"/><path d="M10.2 9.6L5.4 14.4"/><path d="M14.4 14.2L9.6 19"/></svg>',
    nova:   '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
          + '<path d="M12 1l1.95 7.05L21 10l-7.05 1.95L12 19l-1.95-7.05L3 10l7.05-1.95z"/>'
          + '<path d="M18.9 15.1l.62 2.27 2.28.63-2.28.62-.62 2.28-.63-2.28-2.27-.62 2.27-.63z" opacity=".8"/>'
          + '<path d="M4.6 14.9l.45 1.65 1.65.45-1.65.45-.45 1.65-.45-1.65L2.5 17l1.65-.45z" opacity=".6"/></svg>'
  };

  /* ── NOMBRES CON TILDE ── */
  var NICE_NAME = { orbita:"Órbita", chispa:"Chispa", cometa:"Cometa", nova:"Nova" };

  function fmtCOP(n){
    if(!n) return "Gratis";
    try { return "$" + n.toLocaleString("es-CO"); }
    catch(e){ return "$" + n; }
  }

  function esc(s){
    return String(s == null ? "" : s)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  /* ── CSS ── */
  function injectCSS(){
    if(document.getElementById("mem-home-css")) return;
    var st = document.createElement("style");
    st.id = "mem-home-css";
    st.textContent = [
      '.mem-home-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:.85rem;align-items:start}',
      '.mem-home-card{display:flex;flex-direction:column;gap:.7rem;text-decoration:none;color:inherit;',
        'border-top:3px solid var(--mc,#6342ff);transition:transform .18s ease,box-shadow .18s ease}',
      '.mem-home-card:hover,.mem-home-card:focus-visible{transform:translateY(-4px);',
        'box-shadow:0 14px 30px rgba(10,5,40,.42)}',
      '.mem-home-head{display:flex;align-items:center;gap:.65rem}',
      '.mem-home-sign{flex:none;width:44px;height:44px;display:grid;place-items:center;border-radius:14px;',
        'color:var(--mc,#6342ff);background:color-mix(in srgb,var(--mc,#6342ff) 16%,transparent);',
        'border:1px solid color-mix(in srgb,var(--mc,#6342ff) 42%,transparent)}',
      '.mem-home-sign svg{width:26px;height:26px;display:block}',
      '.mem-home-card.is-current .mem-home-sign{box-shadow:0 0 0 3px color-mix(in srgb,var(--mc,#6342ff) 28%,transparent)}',
      '.mem-home-name{margin:0;line-height:1.15}',
      '.mem-home-price{margin:0;font-weight:800;font-size:1.05rem;color:var(--mc,#6342ff)}',
      '.mem-home-price span{font-weight:600;font-size:.8rem;opacity:.75;color:inherit}',
      '.mem-home-perks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.4rem}',
      '.mem-home-perks li{display:flex;gap:.45rem;align-items:flex-start;font-size:.82rem;line-height:1.35;opacity:.92}',
      '.mem-home-perks li::before{content:"";flex:none;width:7px;height:7px;margin-top:.42rem;border-radius:50%;',
        'background:var(--mc,#6342ff)}',
      '.mem-home-tagpill{align-self:flex-start;font-size:.66rem;font-weight:800;letter-spacing:.07em;',
        'padding:.2rem .5rem;border-radius:999px;color:var(--mc,#6342ff);',
        'background:color-mix(in srgb,var(--mc,#6342ff) 15%,transparent)}',
      '.mem-home-current{font-size:.7rem;font-weight:800;letter-spacing:.06em;color:var(--mc,#6342ff)}',
      '@media (max-width:620px){.mem-home-grid{grid-template-columns:1fr}.mem-home-perks li{font-size:.8rem}}'
    ].join("");
    document.head.appendChild(st);
  }

  /* ── MARKUP DE UNA TARJETA ── */
  function card(plan, current){
    var id   = plan.id;
    var name = NICE_NAME[id] || plan.name;
    var sign = SIGNS[id] || SIGNS.orbita;
    var isCur = (id === current);
    var price = plan.monthly ? fmtCOP(plan.monthly) + ' <span>/ mes</span>' : 'Gratis';
    var perks = (plan.perks || []).map(function(p){
      return '<li>' + esc(p) + '</li>';
    }).join("");

    return '<a class="card dots rv mem-home-card' + (isCur ? ' is-current' : '') + '" href="#membresias"'
      + ' style="--mc:' + esc(plan.border || '#6342ff') + '"'
      + ' aria-label="Membresia ' + esc(name) + ', ver planes">'
      + '<div class="mem-home-head">'
        + '<span class="mem-home-sign">' + sign + '</span>'
        + '<div><span class="mem-home-tagpill">' + esc(plan.tag || '') + '</span>'
        + '<p class="h3 mem-home-name">' + esc(name) + '</p></div>'
      + '</div>'
      + '<p class="mem-home-price">' + price + '</p>'
      + (isCur ? '<p class="mem-home-current">TU PLAN ACTUAL</p>' : '')
      + '<ul class="mem-home-perks">' + perks + '</ul>'
      + '</a>';
  }

  /* ── SECCION COMPLETA ── */
  function buildSection(ui){
    var M = window.CapMembers;
    var plans = (M && M.PLANS) || [];
    if(!plans.length) return null;
    var current = (M.membership && M.membership()) || "orbita";

    var sec = document.createElement("div");
    sec.className = "section";
    sec.id = "sec-membresias";
    sec.innerHTML =
      '<div class="row between">'
        + '<p class="h2">Membresías</p>'
        + '<a class="btn sm" href="#membresias">Ver planes</a>'
      + '</div>'
      + '<p class="small muted" style="margin:.1rem 0 .9rem">'
        + 'Cuatro formas de viajar por CAPICÚA. Órbita es gratis para siempre; las demás suman vida, escudos y recompensas.'
      + '</p>'
      + '<div class="mem-home-grid">'
        + plans.map(function(p){ return card(p, current); }).join("")
      + '</div>';
    return sec;
  }

  /* ── INIT ── */
  function init(){
    var t = window.CapEngine, ui = window.CapUI;
    if(!t || !ui || !ui.views || typeof ui.views.inicio !== "function" || !window.CapMembers){
      setTimeout(init, 200); return;
    }

    injectCSS();

    var orig = ui.views.inicio;
    if(orig.__memHomeWrapped) return;

    var wrapped = function(el, param){
      orig.call(this, el, param);
      try{
        if(!el || el.querySelector("#sec-membresias")) return;
        var sec = buildSection(ui);
        if(sec) el.appendChild(sec);
      }catch(e){ /* nunca romper el inicio */ }
    };
    wrapped.__memHomeWrapped = true;
    ui.views.inicio = wrapped;

    /* si ya estamos en inicio, re-renderizar para que aparezca */
    try{
      var h = (location.hash || "").replace("#","").split(".")[0];
      if((h === "inicio" || h === "") && ui.render) ui.render();
    }catch(e){}

    console.log("[CAPICUA] Membresias en inicio activas");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
