/*  CAPICÚA — Supabase integration module
    Auth (email OTP), user profiles, progress sync, security (RLS)
    Loads Supabase JS SDK from CDN, connects to project.
*/
(function(){"use strict";

const SUPA_URL="https://mmiugrbjxclvtirakwzs.supabase.co";
const SUPA_KEY="sb_publishable_Du-8dHNrIPgUp6DJyfA2Mg_zNUSYrtD";
const SDK_URL="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";

let sb=null,ready=null,readyResolve=null;
ready=new Promise(r=>readyResolve=r);

/* ── Load SDK ── */
function loadSDK(){
  return new Promise((res,rej)=>{
    if(window.supabase&&window.supabase.createClient){res();return}
    const s=document.createElement("script");
    s.src=SDK_URL;s.async=true;
    s.onload=()=>res();
    s.onerror=()=>rej(new Error("No se pudo cargar Supabase SDK"));
    document.head.appendChild(s);
  });
}

/* ── Init ── */
async function init(){
  try{
    await loadSDK();
    sb=window.supabase.createClient(SUPA_URL,SUPA_KEY,{
      auth:{
        autoRefreshToken:true,
        persistSession:true,
        detectSessionInUrl:true,
        flowType:"pkce"
      }
    });
    // Listen for auth changes
    sb.auth.onAuthStateChange((ev,session)=>{
      CapiSupa.session=session;
      CapiSupa.user=session?.user||null;
      CapiSupa.authenticated=!!session?.user;
      if(window.CapEngine){
        const b=window.CapEngine.bus||window.CapEngine;
        if(b&&b.emit) b.emit("auth-change",{event:ev,user:CapiSupa.user});
      }
      if(ev==="SIGNED_IN"&&CapiSupa.user){
        ensureProfile().catch(()=>{});
        syncProgressFromCloud().catch(()=>{});
      }
    });
    // Check existing session
    const{data:{session}}=await sb.auth.getSession();
    CapiSupa.session=session;
    CapiSupa.user=session?.user||null;
    CapiSupa.authenticated=!!session?.user;
    CapiSupa.available=true;
    readyResolve(true);
  }catch(e){
    console.warn("CAPICÚA Supabase init error:",e);
    CapiSupa.available=false;
    readyResolve(false);
  }
}

/* ── Auth: Email OTP ── */
async function sendOTP(email){
  if(!sb)throw new Error("Supabase no disponible");
  const{error}=await sb.auth.signInWithOtp({
    email,
    options:{shouldCreateUser:true}
  });
  if(error)throw error;
  return true;
}

async function verifyOTP(email,token){
  if(!sb)throw new Error("Supabase no disponible");
  const{data,error}=await sb.auth.verifyOtp({
    email,token,type:"email"
  });
  if(error)throw error;
  return data;
}

async function signOut(){
  if(!sb)return;
  await sb.auth.signOut();
  CapiSupa.session=null;
  CapiSupa.user=null;
  CapiSupa.authenticated=false;
}

/* ── Profiles ── */
async function ensureProfile(){
  if(!sb||!CapiSupa.user)return null;
  const uid=CapiSupa.user.id;
  const{data:existing}=await sb.from("profiles").select("*").eq("id",uid).maybeSingle();
  if(existing)return existing;
  // Create profile from CapEngine state
  const eng=window.CapEngine;
  const state=eng?eng.S:null;
  const profile={
    id:uid,
    email:CapiSupa.user.email,
    username:state?.profile?.username||state?.profile?.name||CapiSupa.user.email?.split("@")[0]||"Estudiante",
    avatar:state?.profile?.avatar||null,
    pi_coins:state?.pi||0,
    level:state?.level||1,
    xp:state?.xp||0,
    created_at:new Date().toISOString()
  };
  const{data,error}=await sb.from("profiles").upsert(profile,{onConflict:"id"}).select().single();
  if(error)console.warn("Profile upsert error:",error);
  return data||profile;
}

async function updateProfile(updates){
  if(!sb||!CapiSupa.user)return null;
  const{data,error}=await sb.from("profiles").update(updates).eq("id",CapiSupa.user.id).select().single();
  if(error)throw error;
  return data;
}

async function getProfile(){
  if(!sb||!CapiSupa.user)return null;
  const{data}=await sb.from("profiles").select("*").eq("id",CapiSupa.user.id).maybeSingle();
  return data;
}

/* ── Progress sync ── */
async function saveProgress(state){
  if(!sb||!CapiSupa.user)return false;
  const payload={
    user_id:CapiSupa.user.id,
    state_json:typeof state==="string"?state:JSON.stringify(state),
    updated_at:new Date().toISOString()
  };
  const{error}=await sb.from("progress").upsert(payload,{onConflict:"user_id"});
  if(error){console.warn("Progress save error:",error);return false}
  return true;
}

async function loadProgress(){
  if(!sb||!CapiSupa.user)return null;
  const{data}=await sb.from("progress").select("state_json,updated_at").eq("user_id",CapiSupa.user.id).maybeSingle();
  if(!data||!data.state_json)return null;
  try{return{state:JSON.parse(data.state_json),updated:data.updated_at}}catch{return null}
}

async function syncProgressFromCloud(){
  if(!window.CapEngine)return;
  const cloud=await loadProgress();
  if(!cloud)return;
  const eng=window.CapEngine;
  const local=eng.S;
  // Compare timestamps - cloud wins if newer
  const cloudTime=new Date(cloud.updated).getTime();
  const localTime=local.updatedAt||0;
  if(cloudTime>localTime){
    // Merge cloud state into local
    try{
      const merged=Object.assign({},local,cloud.state);
      localStorage.setItem("capicua-estado-v1",JSON.stringify(merged));
      location.reload();
    }catch(e){console.warn("Cloud sync merge error:",e)}
  }
}

/* ── Leaderboard ── */
async function getLeaderboard(limit=20){
  if(!sb)return[];
  const{data}=await sb.from("profiles").select("username,avatar,pi_coins,level,xp").order("xp",{ascending:false}).limit(limit);
  return data||[];
}

/* ── Auth UI ── */
function showAuthModal(){
  const ui=window.CapUI;
  if(!ui)return;
  const esc=ui.esc||(s=>s);
  if(CapiSupa.authenticated){
    ui.modal(`<div class="stack tight" style="text-align:center">
      <span class="h2">Tu cuenta</span>
      <p>Conectada como <b>${esc(CapiSupa.user.email)}</b></p>
      <p class="small muted">Tu progreso se guarda en la nube automaticamente.</p>
      <div class="row" style="justify-content:center">
        <button class="btn" id="sb-logout">Cerrar sesion</button>
        <button class="btn primary" data-close>Listo</button>
      </div>
    </div>`,(el,close)=>{
      el.querySelector("#sb-logout").onclick=async()=>{
        await signOut();close();
        ui.toast("Sesion cerrada","Puedes iniciar sesion de nuevo cuando quieras.","i");
      };
    });
    return;
  }
  let step="email",currentEmail="";
  const render=(container,close)=>{
    if(step==="email"){
      container.innerHTML=`<div class="stack tight">
        <span class="h2">Iniciar sesion</span>
        <p class="small">Te enviaremos un codigo a tu correo para verificar tu identidad. Sin contrasena.</p>
        <form id="sb-form" class="stack tight" novalidate>
          <label class="lbl">Correo electronico
            <input id="sb-email" type="email" placeholder="tu@correo.com" required autocomplete="email" style="width:100%">
          </label>
          <p id="sb-err" class="small" style="color:var(--pink);display:none"></p>
          <div class="row">
            <button type="submit" class="btn primary lg" id="sb-send">Enviar codigo</button>
            <button type="button" class="btn" data-close>Cancelar</button>
          </div>
        </form>
      </div>`;
      const form=container.querySelector("#sb-form");
      const emailInput=container.querySelector("#sb-email");
      const errP=container.querySelector("#sb-err");
      const btn=container.querySelector("#sb-send");
      form.onsubmit=async(e)=>{
        e.preventDefault();
        const email=emailInput.value.trim();
        if(!email){errP.textContent="Escribe tu correo.";errP.style.display="";return}
        btn.disabled=true;btn.textContent="Enviando...";
        errP.style.display="none";
        try{
          await sendOTP(email);
          currentEmail=email;
          step="code";
          render(container,close);
        }catch(err){
          errP.textContent=err.message||"Error al enviar el codigo.";
          errP.style.display="";
          btn.disabled=false;btn.textContent="Enviar codigo";
        }
      };
    }else{
      container.innerHTML=`<div class="stack tight">
        <span class="h2">Verificar codigo</span>
        <p class="small">Enviamos un codigo de 6 digitos a <b>${currentEmail}</b>. Revisalo (tambien en spam).</p>
        <form id="sb-vform" class="stack tight" novalidate>
          <label class="lbl">Codigo de verificacion
            <input id="sb-code" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="123456" required autocomplete="one-time-code" style="width:100%;font-size:1.5rem;text-align:center;letter-spacing:.5em">
          </label>
          <p id="sb-verr" class="small" style="color:var(--pink);display:none"></p>
          <div class="row">
            <button type="submit" class="btn primary lg" id="sb-verify">Verificar</button>
            <button type="button" class="btn" id="sb-back">Cambiar correo</button>
          </div>
        </form>
      </div>`;
      const vform=container.querySelector("#sb-vform");
      const codeInput=container.querySelector("#sb-code");
      const verrP=container.querySelector("#sb-verr");
      const vbtn=container.querySelector("#sb-verify");
      container.querySelector("#sb-back").onclick=()=>{step="email";render(container,close)};
      vform.onsubmit=async(e)=>{
        e.preventDefault();
        const code=codeInput.value.trim();
        if(!code||code.length<6){verrP.textContent="El codigo tiene 6 digitos.";verrP.style.display="";return}
        vbtn.disabled=true;vbtn.textContent="Verificando...";
        verrP.style.display="none";
        try{
          await verifyOTP(currentEmail,code);
          close();
          const ui2=window.CapUI;
          if(ui2)ui2.toast("Bienvenida","Sesion iniciada correctamente.","ok");
          // Save current local progress to cloud
          if(window.CapEngine){
            const st=window.CapEngine.S;
            st._lastSave=new Date().toISOString();
            await saveProgress(st);
          }
        }catch(err){
          verrP.textContent=err.message||"Codigo incorrecto. Intentalo de nuevo.";
          verrP.style.display="";
          vbtn.disabled=false;vbtn.textContent="Verificar";
        }
      };
    }
  };
  ui.modal("",(el,close)=>render(el,close));
}

/* ── Hook into CapEngine save ── */
function hookSave(){
  if(!window.CapEngine)return;
  const eng=window.CapEngine;
  const origSave=eng.Store&&eng.Store.save;
  if(!origSave)return;
  let saveTimer=null;
  eng.Store.save=function(force){
    origSave.call(this,force);
    if(!CapiSupa.authenticated)return;
    // Debounce cloud saves
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>{
      try{
        const st=JSON.parse(JSON.stringify(eng.S));
        st._lastSave=new Date().toISOString();
        saveProgress(st).catch(()=>{});
      }catch(e){}
    },force?500:5000);
  };
}

/* ── Public API ── */
const CapiSupa={
  available:false,
  authenticated:false,
  session:null,
  user:null,
  ready,
  init,
  sendOTP,
  verifyOTP,
  signOut,
  getProfile,
  updateProfile,
  ensureProfile,
  saveProgress,
  loadProgress,
  getLeaderboard,
  showAuthModal,
  hookSave,
  get sb(){return sb}
};
window.CapiSupa=CapiSupa;

/* ── Consent gate ──
   "Rechazar" en el banner de cookies (capicua-consent='0') desactiva
   la conexion a la nube por defecto: el progreso solo se guarda local.
   Si el usuario decide iniciar sesion manualmente mas tarde, se activa
   la conexion en ese momento (accion explicita). */
function hasCloudConsent(){
  return localStorage.getItem("capicua-consent")!=="0";
}

let initStarted=false;
function startInit(){
  if(initStarted)return ready;
  initStarted=true;
  return init().then(hookSave);
}

const origShowAuthModal=showAuthModal;
CapiSupa.showAuthModal=function(){
  if(!initStarted){
    const ui=window.CapUI;
    if(ui&&ui.toast)ui.toast("Un momento","Conectando con tu cuenta...","i");
    startInit().then(()=>{
      if(!CapiSupa.available&&ui&&ui.toast){
        ui.toast("Sin conexion","No se pudo conectar. Intenta de nuevo en unos segundos.","!");
        return;
      }
      origShowAuthModal();
    });
    return;
  }
  origShowAuthModal();
};

// Auto-init when DOM ready, solo si hay consentimiento (o aun no se ha decidido)
function boot(){
  if(hasCloudConsent())startInit();
  else readyResolve(false);
}
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",boot);
}else{
  boot();
}

})();
