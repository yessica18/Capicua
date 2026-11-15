/* CAPICÚA — versión final: intro, baile, membresías, pagos, barra lateral, voz */
(function(){"use strict";
/* ▼▼ CONFIGURA AQUÍ A DÓNDE VA EL DINERO ▼▼ */
const PAY_CONFIG={
  beneficiary:"TU NOMBRE O EMPRESA",          // titular que recibe el dinero
  colombia:{gateway:"Wompi",  account:"Cuenta Bancolombia/Nequi del titular", publicKey:""},
  international:{gateway:"Stripe / PayPal", account:"Cuenta bancaria del titular (payout Stripe)", publicKey:""},
  backendUrl:""   // URL de tu servidor que confirma el cobro y guarda en tu base de datos real
};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const norm=s=>(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
const UI=()=>window.CapUI,ENG=()=>window.CapEngine;

/* 1 ─ INTRO: Capi en modelo 3D corriendo abajo + bienvenida */
function mountCapi3DRunner(capiEl){
  if(!capiEl)return;
  const width=130,height=156;
  capiEl.innerHTML=`<div class="cf-capi-3d-box" style="position:relative;width:${width}px;height:${height}px;display:flex;align-items:flex-end;justify-content:center;">
    <canvas class="cf-capi-canvas" width="${width*2}" height="${height*2}" style="position:absolute;left:0;top:0;width:${width}px;height:${height}px;display:none;pointer-events:none;"></canvas>
    <img class="avatar3d-img cf-capi-snap" width="${width}" height="${height}" alt="Capi 3D" style="width:${width}px;height:${height}px;object-fit:contain;filter:drop-shadow(0 10px 18px rgba(0,0,0,0.5));display:block;" draggable="false">
  </div>`;
  const canvas=capiEl.querySelector(".cf-capi-canvas");
  const img=capiEl.querySelector(".cf-capi-snap");
  const getCfg=()=>{
    const W3=window.CapW3;
    if(W3&&W3.capiaCfg)return W3.capiaCfg("exploradora","feliz");
    return{capia:true,expr:"feliz",style:"style-exploradora",outfitHex:"#1fd1c1",acc:"acc-flor",iris:"#ff9f1a"};
  };
  const applySnapshot=()=>{
    try{
      const W3=window.CapW3;
      if(W3&&W3.ok&&W3.snapshot){
        const snap=W3.snapshot("chibi",getCfg(),width);
        if(snap){img.src=snap;return true;}
      }
    }catch(e){}
    return false;
  };
  if(!applySnapshot()){
    try{
      const snapCache=localStorage.getItem("capicua-snaps-v8");
      if(snapCache){
        const parsed=JSON.parse(snapCache);
        const keys=Object.keys(parsed.s||{});
        const capiKey=keys.find(k=>k.includes('"capia":true')||k.includes('exploradora'));
        if(capiKey&&parsed.s[capiKey])img.src=parsed.s[capiKey];
      }
    }catch(e){}
    let retries=0;
    const interval=setInterval(()=>{
      retries++;
      if(applySnapshot()||retries>30)clearInterval(interval);
    },100);
  }
  const init3DCanvas=()=>{
    try{
      const THREE=window.THREE;
      const W3=window.CapW3;
      if(!THREE||!W3||!W3.chibi)return false;
      const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(width,height,false);
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(30,width/height,0.1,50);
      camera.position.set(0,1.35,4.9);
      camera.lookAt(0,1.18,0);
      const hemi=new THREE.HemisphereLight(0xfff4fb,0xb9c6ff,0.7);
      scene.add(hemi);
      const dir=new THREE.DirectionalLight(0xffffff,0.8);
      dir.position.set(3,6,5);
      scene.add(dir);
      const rim=new THREE.DirectionalLight(0xc9a3ff,0.55);
      rim.position.set(-4,3,-4);
      scene.add(rim);
      const model=W3.chibi(getCfg());
      model.rotation.y=0.35;
      scene.add(model);
      canvas.style.display="block";
      img.style.display="none";
      let animId;
      const t0=performance.now();
      const loop=now=>{
        if(!capiEl.isConnected){
          cancelAnimationFrame(animId);
          renderer.dispose();
          return;
        }
        animId=requestAnimationFrame(loop);
        const elapsed=(now-t0)*0.001;
        if(elapsed<2.4){
          const cycle=elapsed*15;
          if(model.userData&&model.userData.limbs){
            const{legL,legR,armL,armR}=model.userData.limbs;
            if(legL)legL.rotation.x=Math.sin(cycle)*0.7;
            if(legR)legR.rotation.x=-Math.sin(cycle)*0.7;
            if(armL)armL.rotation.x=-Math.sin(cycle)*0.7;
            if(armR)armR.rotation.x=Math.sin(cycle)*0.7;
          }
          model.position.y=Math.abs(Math.sin(cycle*2))*0.07;
          model.rotation.y=0.45;
        }else{
          const idleTime=elapsed-2.4;
          if(model.userData&&model.userData.limbs){
            const{legL,legR,armL,armR}=model.userData.limbs;
            if(legL)legL.rotation.x*=0.8;
            if(legR)legR.rotation.x*=0.8;
            if(armL)armL.rotation.x*=0.8;
            if(armR){
              armR.rotation.x=0;
              armR.rotation.z=Math.PI*0.7+Math.sin(idleTime*6)*0.28;
            }
          }
          model.position.y=Math.sin(idleTime*2.5)*0.025;
          model.rotation.y=0.2+Math.sin(idleTime*1.5)*0.06;
        }
        renderer.render(scene,camera);
      };
      animId=requestAnimationFrame(loop);
      return true;
    }catch(err){return false;}
  };
  if(!init3DCanvas()){
    let canvasRetries=0;
    const canvasInterval=setInterval(()=>{
      canvasRetries++;
      if(init3DCanvas()||canvasRetries>25)clearInterval(canvasInterval);
    },120);
  }
}

function intro(){
  if(sessionStorage.cfIntro||!UI()||!UI().capiaIcon){return}
  sessionStorage.cfIntro=1;
  const d=document.createElement("div");d.className="cf-intro";
  d.innerHTML=`<button class="btn sm cf-skip" type="button">Saltar intro</button>
  <div class="cf-hero"><div class="cf-ava">${UI().capiaIcon(120)}</div>
  <div class="cf-word">${UI().wordmark?UI().wordmark(64):"CAPICÚA"}</div>
  <p class="cf-sub">EL UNIVERSO DEL SABER</p>
  <button class="btn primary lg cf-go" type="button">¡Empezar la aventura!</button><p class="cf-ps">PRESS START</p></div>
  <div class="cf-run"><div class="cf-bub" hidden>¡Bienvenida a CAPICÚA! Soy Capi, tu tutora.</div><div class="cf-capi"></div></div>`;
  document.body.appendChild(d);
  const runCapi=d.querySelector(".cf-capi");
  if(runCapi)mountCapi3DRunner(runCapi);
  const bub=$(".cf-bub",d);setTimeout(()=>{bub.hidden=false;try{UI().say&&UI().say("¡Bienvenida a CAPICÚA! Soy Capi, tu tutora.")}catch(e){}},2600);
  const close=()=>{d.classList.add("out");try{speechSynthesis.cancel()}catch(e){}setTimeout(()=>d.remove(),500)};
  $(".cf-skip",d).onclick=close;$(".cf-go",d).onclick=close;
}

/* 2 ─ BAILE DE CAPI EN LA VICTORIA */
function dance(modal){
  if(modal.dataset.cfd||!/ganador|ganadora|victoria/i.test(modal.textContent))return;
  modal.dataset.cfd=1;if(!UI()||!UI().capiaIcon)return;
  const w=document.createElement("div");w.className="cf-dance";
  w.innerHTML=`<span class="n n1">♪</span><span class="n n2">♫</span><div class="cf-d">${UI().capiaIcon(84)}</div><span class="n n3">♬</span><span class="n n4">♪</span>`;
  const t=$("h1,h2,.h1,.h2",modal);t?t.parentNode.insertBefore(w,t):modal.prepend(w);
  try{
    if(window.CapVictory && window.CapVictory.confetti){
      window.CapVictory.confetti(5000);
    } else if(UI().confetti){
      UI().confetti(80);
    }
    const studentName = (window.CapAccount && CapAccount.getCurrentUser && CapAccount.getCurrentUser() && (CapAccount.getCurrentUser().name || CapAccount.getCurrentUser().username)) || "Campeón";
    if(window.CapVictory && window.CapVictory.speak){
      const phrases = window.CapVictory.getPhrases ? window.CapVictory.getPhrases() : [];
      const phrase = phrases.length ? phrases[Math.floor(Math.random()*phrases.length)].replace(/\{name\}/g, studentName) : ("¡Increíble victoria, " + studentName + "!");
      window.CapVictory.speak(phrase);
    }
  }catch(e){}
}

/* 3 ─ MEMBRESÍAS: mismos planes del vídeo */
const PERKS={
 orbita:["Los 12 mundos, todas las lecciones y jefes","Capi, mentores, diagnóstico y ruta","Combate, cofres, premios e insignias","Laboratorios, aula y juego con amigos","1 simulacro de parcial por semana","12 tarjetas de repaso por sesión"],
 chispa:["Simulacros de parcial ilimitados (10 preguntas)","20 tarjetas de repaso por sesión","Premio de victoria ×1,25","1 escudo de racha por semana: un día sin estudiar no la rompe","Línea de vida +10 PV y 2 curitas semanales","Insignia Chispa y aro celeste"],
 cometa:["Simulacros de hasta 20 preguntas","Informe de errores con la solución paso a paso","30 tarjetas de repaso por sesión","Premio de victoria ×1,5","Segunda oportunidad: una vez al día recuperas media vida al quedar al límite","2 escudos de racha y botiquín semanal","Línea de vida +25 PV e insignia Cometa"],
 nova:["Simulacros de hasta 30 preguntas","Plan de repaso automático: tus temas débiles pasan a tarjetas","Premio de victoria ×2","Segunda oportunidad hasta 3 veces al día","3 escudos de racha, botiquín completo y línea de vida +40 PV","Insignia Nova y aro dorado"]};
function plans(){const M=window.CapMembers;if(!M||M.__f)return;M.__f=1;
 M.PLANS.forEach(p=>{if(PERKS[p.id])p.perks=PERKS[p.id];if(p.id==="orbita")p.name="Órbita";p.tag=({orbita:"PARA SIEMPRE",chispa:"PARA EMPEZAR",cometa:"LA MÁS ELEGIDA",nova:"TODO CAPICÚA"})[p.id]})}
function memText(){const t=$(".mem-title"),d=$(".mem-desc");if(t)t.textContent="Membresías";const s=$(".mem-support");if(s)s.textContent="APOYA A CAPICÚA";
 if(d&&!d.dataset.cf){d.dataset.cf=1;d.textContent="El plan Órbita es gratis para siempre: mundos, lecciones, jefes, Capi y salas no se bloquean nunca. Las membresías cuestan menos que un tinto y sirven para preparar parciales: más simulacros, informe de errores con solución, repaso automático de tus temas débiles y segunda oportunidad en combate. Nunca compran respuestas."}
 const m=$(".mem-demo");if(m&&!m.dataset.cf){m.dataset.cf=1;m.innerHTML="<strong>Pagos:</strong> elige tu país y método. El destino del dinero se muestra antes de pagar. Mientras no conectes tu pasarela (Wompi/Stripe) el pago es simulado y queda en el registro de pagos. Datos mínimos según la Ley 1581 de 2012."}}

/* 4 ─ PAGOS: país, internacional, base de datos, destino */
const COUNTRIES={CO:["Colombia","COP",1,["Nequi","PSE","Tarjeta"]],MX:["México","MXN",.0045,["Tarjeta","OXXO / SPEI","PayPal"]],PE:["Perú","PEN",.00092,["Tarjeta","Yape","PayPal"]],CL:["Chile","CLP",.23,["Tarjeta","Webpay","PayPal"]],AR:["Argentina","ARS",.25,["Tarjeta","Mercado Pago","PayPal"]],EC:["Ecuador","USD",.00025,["Tarjeta","PayPal"]],PA:["Panamá","USD",.00025,["Tarjeta","PayPal"]],BR:["Brasil","BRL",.0014,["Tarjeta","Pix","PayPal"]],ES:["España","EUR",.00023,["Tarjeta","Bizum","PayPal"]],US:["Estados Unidos","USD",.00025,["Tarjeta","PayPal","Apple/Google Pay"]],XX:["Otro país","USD",.00025,["Tarjeta","PayPal"]]};
const fmt=(n,c)=>new Intl.NumberFormat("es-CO",{style:"currency",currency:c,maximumFractionDigits:c==="COP"||c==="CLP"?0:2}).format(n);
let db;function openDB(){return db||(db=new Promise(r=>{try{const q=indexedDB.open("capicua_pagos",1);q.onupgradeneeded=()=>q.result.createObjectStore("pagos",{keyPath:"ref"});q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)}catch(e){r(null)}}))}
async function savePay(rec){try{const l=JSON.parse(localStorage.cfPagos||"[]");l.push(rec);localStorage.cfPagos=JSON.stringify(l)}catch(e){}
 const d=await openDB();if(d)d.transaction("pagos","readwrite").objectStore("pagos").put(rec);
 if(PAY_CONFIG.backendUrl)fetch(PAY_CONFIG.backendUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(rec)}).catch(()=>{})}
const allPays=()=>{try{return JSON.parse(localStorage.cfPagos||"[]")}catch(e){return[]}};
function checkout(planId){
  const M=window.CapMembers,p=M.PLANS.find(x=>x.id===planId),S=ENG().S,per=S.memberPeriod||"monthly";
  const total=per==="annual"?p.annualTotal:per==="semestral"?p.semestralTotal:p.monthly,perN={monthly:"Mensual",semestral:"Semestral",annual:"Anual"}[per];
  UI().modal(`<div class="cf-pay"><p class="h2">${p.icon} ${p.name} · ${perN}</p>
  <label class="lbl">País<select id="cfC">${Object.entries(COUNTRIES).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join("")}</select></label>
  <p class="cf-tot" id="cfT"></p><div class="cf-meth" id="cfM"></div>
  <p class="cf-dest" id="cfD"></p>
  <label class="row small"><input type="checkbox" id="cfOk"> Acepto los términos y el aviso de privacidad (Ley 1581 de 2012).</label>
  <p class="cf-note">Pago simulado: no se descuenta dinero. Recibirás un comprobante de demostración.</p>
  <div class="row"><button class="btn primary" id="cfPay" disabled>Pagar</button><button class="btn" data-close>Cancelar</button></div></div>`,el=>{
   let meth="";const c=$("#cfC",el);
   const draw=()=>{const [n,cur,rate,ms]=COUNTRIES[c.value],amt=total*rate,co=c.value==="CO",g=co?PAY_CONFIG.colombia:PAY_CONFIG.international;
    $("#cfT",el).innerHTML=`Total a pagar: <b>${fmt(amt,cur)}</b>${co?" (IVA incluido)":` <small>≈ ${fmt(total,"COP")} · tasa de referencia, la final la fija tu banco</small>`}`;
    meth=ms[0];$("#cfM",el).innerHTML=ms.map((m,i)=>`<button type="button" class="cf-m${i?"":" on"}" data-m="${m}">${m}</button>`).join("");
    $$(".cf-m",el).forEach(b=>b.onclick=()=>{meth=b.dataset.m;$$(".cf-m",el).forEach(x=>x.classList.toggle("on",x===b))});
    $("#cfD",el).innerHTML=`🏦 El dinero se dirige a <b>${PAY_CONFIG.beneficiary}</b> · ${g.account} · procesado por <b>${g.gateway}</b>.`;
    $("#cfPay",el).textContent="Pagar "+fmt(amt,cur)};
   c.onchange=draw;draw();
   $("#cfOk",el).onchange=e=>$("#cfPay",el).disabled=!e.target.checked;
   $("#cfPay",el).onclick=async()=>{
     const [n,cur,rate]=COUNTRIES[c.value];
     let serverCheckout=null;
     if(window.CapSupabase&&window.CapSupabase.payments){
       serverCheckout=await window.CapSupabase.payments.createCheckout(p.id,per,c.value);
     }
     const ref=(serverCheckout&&serverCheckout.reference)||"CAP-"+Date.now().toString(36).toUpperCase();
     const isSandbox=!(serverCheckout&&!serverCheckout.sandbox);
     const rec={
       ref,
       fecha:new Date().toISOString(),
       plan:p.id,
       periodo:per,
       pais:n,
       metodo:meth,
       moneda:cur,
       monto:+(total*rate).toFixed(2),
       montoCOP:total,
       destino:PAY_CONFIG.beneficiary,
       estado:isSandbox?"sandbox-aprobado":"verificado-servidor"
     };
     await savePay(rec);
     S.membership=p.id;
     if(window.CapSupabase&&window.CapSupabase.store){
       window.CapSupabase.store.queueSync(S);
     }
     try{UI().confetti(80)}catch(e){}
     UI().render();
     UI().modal(`<div class="cf-pay"><p class="h2">¡Gracias por apoyar a CAPICÚA!</p><p>Tu plan <b>${p.name}</b> ya está activo.</p><p class="small">Comprobante <b>${ref}</b><br>${n} · ${meth} · ${fmt(rec.monto,cur)}<br>Destino: ${rec.destino} · Estado: ${rec.estado}</p><div class="row"><button class="btn primary" data-close>Listo</button><button class="btn" id="cfH">Ver mis pagos</button></div></div>`,e2=>{$("#cfH",e2).onclick=history});
   }})}
function history(){const l=allPays().reverse();
  UI().modal(`<div class="cf-pay"><p class="h2">Mis pagos</p>${l.length?`<div class="cf-tbl">${l.map(r=>`<p><b>${r.ref}</b> · ${r.plan} ${r.periodo} · ${r.pais} · ${r.metodo} · ${fmt(r.monto,r.moneda)} · ${r.estado}</p>`).join("")}</div>`:"<p>Aún no hay pagos.</p>"}<div class="row"><button class="btn" id="cfX">Exportar CSV</button><button class="btn" data-close>Cerrar</button></div></div>`,el=>{
   $("#cfX",el).onclick=()=>{const k=["ref","fecha","plan","periodo","pais","metodo","moneda","monto","montoCOP","destino","estado"],csv=[k.join(",")].concat(allPays().map(r=>k.map(x=>JSON.stringify(r[x]??"")).join(","))).join("\n"),a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="capicua-pagos.csv";a.click()}})}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".mem-btn.choose");if(b){e.stopImmediatePropagation();e.preventDefault();checkout(b.dataset.plan)}},true);

/* 5 ─ BARRA LATERAL: sin repetidos y por secciones */
const GROUPS=[["Empieza",["inicio","aventura","universo","historia","cerebro"]],["Aprende",["aprender","misiones","laboratorios","parcial","simulacro","simulacros","tarjetas","libro"]],["Juega",["juegos","acuario","calendario","capia","sabios","consejo","bestiario","codice"]],["Tú",["perfil","progreso","membresias","comunidad","foro"]],["Más",["buscar","novedades"]]];
let busy=false;
function nav(){
  const n=$("#side .nav");
  if(!n||busy||n.dataset.cf==="grouped")return;
  const directLinks=n.querySelectorAll(":scope > a");
  if(directLinks.length===0)return;
  busy=true;
  const seen=new Set(),items=[...directLinks].filter(a=>{const k=norm(a.textContent),r=a.dataset.r||k;if(seen.has(k)||seen.has("r:"+r))return false;seen.add(k);seen.add("r:"+r);return true});
  const used=new Set();n.innerHTML="";
  GROUPS.forEach(([t,ids])=>{const mine=items.filter(a=>!used.has(a)&&ids.some(i=>norm(a.dataset.r||"").startsWith(i)));
   if(t==="Más")items.forEach(a=>{if(!used.has(a)&&!mine.includes(a)&&!GROUPS.some(g=>g[1].some(i=>norm(a.dataset.r||"").startsWith(i))))mine.push(a)});
   if(!mine.length)return;mine.forEach(a=>used.add(a));
   const d=document.createElement("details");d.className="cf-grp";d.open=t!=="Más";d.innerHTML=`<summary>${t}</summary>`;mine.forEach(a=>d.appendChild(a));n.appendChild(d)});
  n.dataset.cf="grouped";busy=false}

/* 6 ─ VOZ: botón fijo "Habla con Capi" */
function mic(){if($(".cf-mic")||!UI())return;
  const b=document.createElement("button");b.type="button";b.className="cf-mic";b.setAttribute("aria-label","Hablar con Capi");b.innerHTML="🎤 <span>Habla con Capi</span>";
  b.onclick=()=>{const m=$("#capiMic, #mic, #tVoice");if(m)return m.click();UI().go("capia.conversar");setTimeout(()=>{const m2=$("#capiMic, #mic, #tVoice");m2?m2.click():alert("Tu navegador no ofrece reconocimiento de voz. Usa Chrome, Edge o Safari en https.")},900)};
  document.body.appendChild(b)}

/* ── arranque limpio y sin loops de mutación ── */
function tick(){
  plans();
  memText();
  nav();
  mic();
  $$(".modal, [role=dialog]").forEach(dance);
  const b=$(".mem-support");
  if(b&&!$(".cf-hist")){
    const x=document.createElement("button");x.className="btn sm cf-hist";x.textContent="Mis pagos";x.onclick=history;b.after(x);
  }
}

window.addEventListener("DOMContentLoaded",tick);
window.addEventListener("load",()=>{setTimeout(intro,300);tick()});
window.addEventListener("hashchange",()=>setTimeout(tick,100));

// Observar únicamente apertura de modales en modal-root para baile de victoria
const modalRoot=document.getElementById("modal-root");
if(modalRoot){
  new MutationObserver(()=>$$(".modal, [role=dialog]",modalRoot).forEach(dance)).observe(modalRoot,{childList:true,subtree:true});
}
})();
