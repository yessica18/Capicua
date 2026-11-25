/* ═══════════════════════════════════════════════
   CAPICUA — Organizador de la barra de inicio
   Deja en la barra solo lo esencial (10 accesos en
   3 bloques) y manda el resto a "Ver todas las
   secciones". Nada se elimina: todas las vistas
   siguen funcionando y son alcanzables.
   Tambien arregla los iconos vacios y las tildes.
   ═══════════════════════════════════════════════ */
(function(){
  "use strict";

  /* ── 1. BARRA PRINCIPAL: bloques y orden ── */
  var PRIMARY = [
    { head: null,          routes: ["inicio"] },
    { head: "Aprender",    routes: ["aventura", "aprender", "capia"] },
    { head: "Practicar",   routes: ["repaso", "simulacros", "juegos"] },
    { head: "Mi espacio",  routes: ["perfil", "comunidad", "membresias"] }
  ];

  /* ── 2. MENU COMPLETO: todo lo demas, agrupado ── */
  var CATALOG = [
    { head: "Mi ruta",    routes: ["inicio", "aventura", "aprender", "capia", "cerebro"] },
    { head: "Practicar",  routes: ["repaso", "simulacros", "diagnostico", "misiones", "parcial", "falencias", "laboratorios"] },
    { head: "Explorar",   routes: ["universo", "historia", "sabios", "consejo", "codice", "bestiario", "buscar"] },
    { head: "Jugar",      routes: ["juegos", "duelos", "acuario"] },
    { head: "Comunidad",  routes: ["comunidad", "foro", "mentores"] },
    { head: "Mi espacio", routes: ["perfil", "avatar", "recompensas", "membresias", "calendario", "novedades"] }
  ];

  /* Rutas que NO se muestran en ningun menu por ser
     repetidas de otra (siguen funcionando por URL). */
  var HIDDEN_DUPES = { mascota: "acuario" };

  /* ── 3. ETIQUETAS CORREGIDAS ── */
  var LABELS = {
    diagnostico: "Diagnóstico",
    membresias: "Membresías",
    simulacros: "Simulacros",
    acuario: "Santuario de mascotas",
    historia: "Viaje en el tiempo",
    cerebro: "Mi plan inteligente",
    consejo: "Consejo de los Sabios",
    foro: "Foro por asignatura",
    bestiario: "Enemigos",
    capia: "Capi"
  };

  /* ── 4. ICONOS QUE FALTABAN (salian vacios) ── */
  var SVG = {
    diagnostico: '<path d="M3 12h3l2.5-6 3 12 2.5-6h3"/><path d="M17 12h4"/>',
    simulacros:  '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9z"/><path d="M9 11h6M9 15h4"/>',
    repaso:      '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>',
    falencias:   '<path d="M12 4l9 16H3z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
    duelos:      '<path d="M4 4l7 7M4 8V4h4"/><path d="M20 4l-7 7M20 8V4h-4"/><path d="M9 15l6 6M15 15l-6 6"/>',
    recompensas: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13"/><path d="M12 8S10 3 7.5 4.5 9 8 12 8zM12 8s2-5 4.5-3.5S15 8 12 8z"/>',
    membresias:  '<circle cx="12" cy="9" r="5"/><path d="M9.5 13.5L8 22l4-2.3 4 2.3-1.5-8.5"/>',
    mascota:     '<path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9z"/>',
    acuario:     '<path d="M3 12c3-5 9-6 13-3l5-3v12l-5-3c-4 3-10 2-13-3z"/><circle cx="8" cy="11" r="1"/>',
    mentores:    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    avatar:      '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
  };

  /* ── 5. COLORES DEL CHIP (degradado) ── */
  var COLORS = {
    inicio:["#ff3d9a","#8b3dff"], aventura:["#ffc81a","#ff2d7a"], aprender:["#ffc81a","#ff7a1a"],
    capia:["#8b3dff","#ff3d9a"],  repaso:["#1fd1c1","#2f6bff"],  simulacros:["#2f6bff","#8b3dff"],
    juegos:["#ff5c93","#5fd3f0"], perfil:["#ff3d9a","#ffc81a"],  comunidad:["#7cf06a","#1fd1c1"],
    membresias:["#ffc81a","#ff7a1a"], diagnostico:["#1fd1c1","#7cf06a"], misiones:["#ff7a1a","#ff3d9a"],
    parcial:["#8b3dff","#2f6bff"], falencias:["#ff7a1a","#ff2d7a"], laboratorios:["#1fd1c1","#7cf06a"],
    universo:["#2f6bff","#1fd1c1"], historia:["#8b3dff","#5fd3f0"], sabios:["#ffc81a","#8b3dff"],
    consejo:["#ffc81a","#2f6bff"], codice:["#2f6bff","#8b3dff"],   bestiario:["#ff3d9a","#0c1240"],
    buscar:["#1fd1c1","#2f6bff"],  duelos:["#ff2d7a","#8b3dff"],   acuario:["#5fd3f0","#2f6bff"],
    mascota:["#5fd3f0","#2f6bff"], foro:["#7cf06a","#2f6bff"],     mentores:["#8b3dff","#1fd1c1"],
    avatar:["#ff3d9a","#5fd3f0"],  recompensas:["#ffc81a","#7cf06a"], calendario:["#2f6bff","#ff3d9a"],
    novedades:["#ffc81a","#ff3d9a"], cerebro:["#8b3dff","#ffc81a"]
  };
  var DEF = ["#8b3dff","#ff3d9a"];

  /* Orden plano de la barra principal */
  var PRIMARY_ROUTES = [];
  PRIMARY.forEach(function(b){ b.routes.forEach(function(r){ PRIMARY_ROUTES.push(r); }); });

  var busy = false, queued = false;

  function esc(s){
    return String(s == null ? "" : s)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function svgWrap(inner){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"'
         + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  function injectCSS(){
    if(document.getElementById("nav-org-css")) return;
    var st = document.createElement("style");
    st.id = "nav-org-css";
    st.textContent = [
      '.navhead{margin:.85rem 0 .3rem;padding:0 .65rem;font-size:.63rem;font-weight:800;',
        'letter-spacing:.12em;text-transform:uppercase;opacity:.5;line-height:1}',
      '.navhead:first-child{margin-top:.2rem}',
      '.nav a[data-nav-off]{display:none!important}',
      '#navAll{display:flex;align-items:center;gap:.7rem;width:100%;margin-top:.9rem;',
        'padding:.5rem .6rem;border-radius:14px;border:1px dashed var(--line2,rgba(255,255,255,.18));',
        'background:transparent;color:var(--fg2);font-weight:800;font-size:.9rem;font-family:inherit;',
        'cursor:pointer;text-align:left;transition:background .15s,color .15s}',
      '#navAll:hover{background:var(--panel2);color:var(--fg)}',
      '#navAll svg{flex:none;width:20px;height:20px}',
      '.navall-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:.5rem;margin:.2rem 0 1rem}',
      '.navall-grid a{display:flex;align-items:center;gap:.6rem;padding:.6rem .7rem;border-radius:14px;',
        'text-decoration:none;color:inherit;background:var(--panel2,rgba(255,255,255,.05));',
        'border:1px solid var(--line2,rgba(255,255,255,.1));font-weight:700;font-size:.86rem;',
        'transition:transform .15s,background .15s}',
      '.navall-grid a:hover{transform:translateY(-2px);background:var(--glow,rgba(139,61,255,.18))}',
      '.navall-head{margin:.9rem 0 .1rem;font-size:.66rem;font-weight:800;letter-spacing:.12em;',
        'text-transform:uppercase;opacity:.55}'
    ].join("");
    document.head.appendChild(st);
  }

  function navEl(){ return document.querySelector("#side .nav"); }

  /* Mapa ruta -> <a> de la barra */
  function linkMap(nav){
    var map = {};
    var as = nav.querySelectorAll("a[data-r]");
    for(var i = 0; i < as.length; i++){
      var r = as[i].dataset.r;
      if(!map[r]) map[r] = as[i];
      else as[i].remove();           /* repetido: fuera */
    }
    return map;
  }

  /* Deja el <a> con chip de color, icono y etiqueta */
  function dressLink(a, route){
    var label = LABELS[route] || (a.dataset.navLabel || a.textContent.trim());
    a.dataset.navLabel = label;

    var c = COLORS[route] || DEF;
    var chip = a.querySelector("span.ni");
    var svg  = a.querySelector("svg");
    var inner = svg ? svg.innerHTML.trim() : "";

    if(!inner) inner = SVG[route] || "";
    if(!inner) inner = '<circle cx="12" cy="12" r="8"/>';

    var want = '<span class="ni" style="--c1:' + c[0] + ';--c2:' + c[1] + '">'
             + svgWrap(inner) + '</span>' + esc(label);

    /* Solo tocar el DOM si hace falta */
    if(!chip || a.innerHTML !== want) a.innerHTML = want;
  }

  /* ── 6. MODAL "VER TODAS LAS SECCIONES" ── */
  function openAll(){
    var ui = window.CapUI;
    if(!ui || !ui.modal) return;
    var nav = navEl();
    var map = nav ? linkMap(nav) : {};

    var html = '<div class="row between"><p class="h2">Todo CAPICÚA</p>'
             + '<button class="iconbtn" data-close aria-label="Cerrar">'
             + svgWrap('<path d="M6 6l12 12M18 6L6 18"/>') + '</button></div>';

    CATALOG.forEach(function(block){
      var items = block.routes.filter(function(r){
        return !HIDDEN_DUPES[r] && (map[r] || (window.CapUI.views && window.CapUI.views[r]));
      });
      if(!items.length) return;
      html += '<p class="navall-head">' + esc(block.head) + '</p><div class="navall-grid">';
      items.forEach(function(r){
        var c = COLORS[r] || DEF;
        var a = map[r];
        var label = LABELS[r] || (a ? (a.dataset.navLabel || a.textContent.trim()) : r);
        var svg = a && a.querySelector("svg");
        var inner = (svg && svg.innerHTML.trim()) || SVG[r] || '<circle cx="12" cy="12" r="8"/>';
        html += '<a href="#' + r + '" data-close>'
              + '<span class="ni" style="--c1:' + c[0] + ';--c2:' + c[1] + '">'
              + svgWrap(inner) + '</span>' + esc(label) + '</a>';
      });
      html += '</div>';
    });

    ui.modal(html);
  }

  /* ── 7. APLICAR ORGANIZACION ── */
  function apply(){
    var nav = navEl();
    if(!nav) return;

    var map = linkMap(nav);
    var order = [];

    /* a) encabezados + orden de lo esencial */
    PRIMARY.forEach(function(block, bi){
      var present = block.routes.filter(function(r){ return map[r]; });
      if(!present.length) return;
      if(block.head){
        var id = "navhead-" + bi;
        var h = nav.querySelector('[data-navhead="' + id + '"]');
        if(!h){
          h = document.createElement("p");
          h.className = "navhead";
          h.dataset.navhead = id;
          h.textContent = block.head;
        }
        order.push(h);
      }
      present.forEach(function(r){ order.push(map[r]); });
    });

    /* b) el resto: queda en el DOM pero oculto de la barra */
    Object.keys(map).forEach(function(r){
      if(PRIMARY_ROUTES.indexOf(r) === -1){
        map[r].setAttribute("data-nav-off", "1");
        order.push(map[r]);
      } else {
        map[r].removeAttribute("data-nav-off");
      }
      dressLink(map[r], r);
    });

    /* c) boton "Ver todas las secciones": va al final del orden */
    var btn = document.getElementById("navAll");
    if(!btn){
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "navAll";
      btn.innerHTML = svgWrap('<path d="M4 6h16M4 12h16M4 18h16"/>') + "Ver todas las secciones";
      btn.addEventListener("click", function(e){ e.preventDefault(); openAll(); });
    }
    order.push(btn);

    /* d) reordenar solo si cambio algo (si no, no se toca el DOM) */
    var cur = [].slice.call(nav.children);
    var same = cur.length === order.length && order.every(function(n, i){ return cur[i] === n; });
    if(!same){
      var frag = document.createDocumentFragment();
      order.forEach(function(n){ frag.appendChild(n); });
      nav.appendChild(frag);
    }

    /* e) el boton "Mas" del movil abre el mismo menu completo */
    var more = document.getElementById("moreNav");
    if(more && !more.dataset.navOrg){
      more.dataset.navOrg = "1";
      more.onclick = function(e){ if(e) e.preventDefault(); openAll(); };
    }
  }

  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        queued = false;
        if(busy) return;
        busy = true;
        try { apply(); } catch(e){ /* nunca romper la barra */ }
        busy = false;
      });
    });
  }

  /* ── 8. ENGANCHES ── */
  function init(){
    var ui = window.CapUI;
    if(!ui || !ui.render){ setTimeout(init, 200); return; }

    injectCSS();

    if(!ui.render.__navOrg){
      var prev = ui.render;
      var wrapped = function(){
        var out = prev.apply(ui, arguments);
        schedule();
        return out;
      };
      wrapped.__navOrg = true;
      ui.render = wrapped;
    }

    if(ui.shell && !ui.shell.__navOrg){
      var prevShell = ui.shell;
      var ws = function(){
        var out = prevShell.apply(ui, arguments);
        schedule();
        return out;
      };
      ws.__navOrg = true;
      ui.shell = ws;
    }

    /* Cualquier modulo que inyecte enlaces despues: se reordena solo */
    var side = document.getElementById("side");
    if(side && window.MutationObserver && !side.dataset.navObs){
      side.dataset.navObs = "1";
      new MutationObserver(function(){ if(!busy) schedule(); })
        .observe(side, { childList: true, subtree: true });
    }

    schedule();
    setTimeout(schedule, 1400);
    setTimeout(schedule, 2200);

    window.CapNav = { apply: apply, openAll: openAll, primary: PRIMARY, catalog: CATALOG };
    console.log("[CAPICUA] Barra de inicio organizada");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
