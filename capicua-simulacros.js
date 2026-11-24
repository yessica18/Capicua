/* ═══════════════════════════════════════════════
   CAPICUA 2.1 — Simulacros, Quizzes, Examenes
   + Capi Tutora Inteligente + Prueba Diagnostica
   + Guardado de progreso por usuario
   ═══════════════════════════════════════════════ */
(function(){
  "use strict";

  function init(){
    var t = window.CapEngine, ui = window.CapUI;
    if(!t || !ui){ setTimeout(init, 200); return; }
    setup(t, ui);
  }

  function setup(t, ui){

    /* ══════════════════════════════════════════════
       GUARDADO DE PROGRESO
       ══════════════════════════════════════════════ */
    var SAVE_KEY = "capicua-progreso-v2";

    function saveProgress(){
      try{
        var data = {
          xp: t.S.xp || 0,
          pi: t.S.pi || 0,
          level: t.level ? t.level() : 1,
          streak: t.S.streak || 0,
          mentor: t.S.mentor || null,
          pets: t.S.pets || null,
          examHistory: t.S.examHistory || [],
          diagnostico: t.S.diagnostico || null,
          topics: t.S.topics || {},
          avatar: localStorage.getItem("cap-avatar") || null,
          timestamp: Date.now()
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      }catch(e){}
    }

    function loadProgress(){
      try{
        var raw = localStorage.getItem(SAVE_KEY);
        if(!raw) return null;
        return JSON.parse(raw);
      }catch(e){ return null; }
    }

    /* Auto-save every 30s and on XP/level events */
    setInterval(saveProgress, 30000);
    if(t.bus){
      t.bus.on("xp", saveProgress);
      t.bus.on("levelup", saveProgress);
    }
    window.addEventListener("beforeunload", saveProgress);

    /* ══════════════════════════════════════════════
       BANCO DE PREGUNTAS POR MATERIA (ingenieria)
       ══════════════════════════════════════════════ */
    var BANCO = {
      aritmetica: [
        {q:"15 x 17 = ?", opts:["255","245","265","235"], c:0, dif:1},
        {q:"144 / 12 = ?", opts:["12","14","11","13"], c:0, dif:1},
        {q:"sqrt(196) = ?", opts:["14","12","16","13"], c:0, dif:1},
        {q:"2^8 = ?", opts:["256","128","512","64"], c:0, dif:2},
        {q:"MCD(24, 36) = ?", opts:["12","6","18","8"], c:0, dif:2},
        {q:"MCM(6, 8) = ?", opts:["24","48","12","16"], c:0, dif:2},
        {q:"3! + 4! = ?", opts:["30","28","26","32"], c:0, dif:3},
        {q:"Fraccion de 0.375", opts:["3/8","3/4","5/8","2/5"], c:0, dif:2}
      ],
      algebra: [
        {q:"Si 3x + 7 = 22, x = ?", opts:["5","4","6","3"], c:0, dif:1},
        {q:"(x+3)(x-3) = ?", opts:["x^2 - 9","x^2 + 9","x^2 - 6x","x^2 + 6"], c:0, dif:2},
        {q:"Factorizar x^2 - 5x + 6", opts:["(x-2)(x-3)","(x-1)(x-6)","(x+2)(x+3)","(x-2)(x+3)"], c:0, dif:2},
        {q:"log_2(32) = ?", opts:["5","4","6","3"], c:0, dif:2},
        {q:"Si f(x) = 2x^2 - 3, f(2) = ?", opts:["5","7","3","1"], c:0, dif:2},
        {q:"Suma de raices de x^2 - 7x + 12 = 0", opts:["7","12","3","4"], c:0, dif:3},
        {q:"|-5| + |3| = ?", opts:["8","2","-2","15"], c:0, dif:1},
        {q:"3^0 + 5^0 = ?", opts:["2","0","1","6"], c:0, dif:1}
      ],
      calculo: [
        {q:"d/dx (x^3) = ?", opts:["3x^2","x^2","3x^3","2x^3"], c:0, dif:1},
        {q:"Integral de 4x^3 dx", opts:["x^4 + C","4x^4 + C","x^3 + C","4x^2 + C"], c:0, dif:2},
        {q:"d/dx (sen x) = ?", opts:["cos x","-cos x","sen x","-sen x"], c:0, dif:1},
        {q:"lim(x->0) sen(x)/x = ?", opts:["1","0","infinito","-1"], c:0, dif:2},
        {q:"d/dx (e^x) = ?", opts:["e^x","xe^x","e^(x-1)","x*e"], c:0, dif:1},
        {q:"Integral de 1/x dx", opts:["ln|x| + C","1/x^2 + C","x + C","log x + C"], c:0, dif:2},
        {q:"d/dx (ln x) = ?", opts:["1/x","ln x","x","1/x^2"], c:0, dif:1},
        {q:"d/dx (x^2 * sen x)", opts:["2x*sen(x) + x^2*cos(x)","x^2*cos(x)","2x*sen(x)","2x*cos(x)"], c:0, dif:3}
      ],
      trigonometria: [
        {q:"sen(30) = ?", opts:["1/2","sqrt(3)/2","1","sqrt(2)/2"], c:0, dif:1},
        {q:"cos(60) = ?", opts:["1/2","sqrt(3)/2","0","1"], c:0, dif:1},
        {q:"tan(45) = ?", opts:["1","0","sqrt(2)","infinito"], c:0, dif:1},
        {q:"sen^2(x) + cos^2(x) = ?", opts:["1","0","2","sen(2x)"], c:0, dif:1},
        {q:"Periodo de sen(x)", opts:["2pi","pi","pi/2","4pi"], c:0, dif:2},
        {q:"cos(0) = ?", opts:["1","0","-1","1/2"], c:0, dif:1},
        {q:"sen(90) = ?", opts:["1","0","-1","1/2"], c:0, dif:1},
        {q:"tan(x) = ?", opts:["sen(x)/cos(x)","cos(x)/sen(x)","sen(x)*cos(x)","1/cos(x)"], c:0, dif:1}
      ],
      geometria: [
        {q:"Area de circulo radio 5", opts:["25pi","10pi","5pi","50pi"], c:0, dif:1},
        {q:"Volumen de esfera radio r", opts:["(4/3)pi*r^3","4pi*r^2","pi*r^3","(2/3)pi*r^3"], c:0, dif:2},
        {q:"Suma angulos triangulo", opts:["180","360","90","270"], c:0, dif:1},
        {q:"Perimetro cuadrado lado 8", opts:["32","64","16","24"], c:0, dif:1},
        {q:"Area trapecio", opts:["(B+b)*h/2","B*h","B*b/2","B+b+h"], c:0, dif:2},
        {q:"Diagonal del cuadrado lado a", opts:["a*sqrt(2)","2a","a*sqrt(3)","a/2"], c:0, dif:2},
        {q:"Angulo recto = ?", opts:["90","180","45","360"], c:0, dif:1},
        {q:"Diagonales de hexagono", opts:["9","6","12","8"], c:0, dif:3}
      ],
      fisica: [
        {q:"F = ?", opts:["m*a","m/a","m+a","m^a"], c:0, dif:1},
        {q:"Velocidad = ?", opts:["d/t","d*t","d+t","d-t"], c:0, dif:1},
        {q:"g en la Tierra aprox", opts:["9.8 m/s^2","10.2 m/s^2","8.5 m/s^2","11 m/s^2"], c:0, dif:1},
        {q:"E cinetica = ?", opts:["(1/2)mv^2","mv","mgh","mv^2"], c:0, dif:2},
        {q:"W = ?", opts:["F*d","F/d","F+d","F*t"], c:0, dif:1},
        {q:"Ohm: V = ?", opts:["I*R","I/R","I+R","R/I"], c:0, dif:1},
        {q:"Unidad de fuerza", opts:["Newton","Joule","Watt","Pascal"], c:0, dif:1},
        {q:"P = W/t. Unidad?", opts:["Watt","Joule","Newton","Volt"], c:0, dif:1}
      ],
      algebra_lineal: [
        {q:"Determinante de [[1,2],[3,4]]", opts:["-2","2","10","-10"], c:0, dif:2},
        {q:"Dimension de R^3", opts:["3","2","1","infinito"], c:0, dif:1},
        {q:"A * I = ? (I=identidad)", opts:["A","I","0","A^2"], c:0, dif:1},
        {q:"Traza de [[2,0],[0,5]]", opts:["7","10","2","5"], c:0, dif:1},
        {q:"Transpuesta de [[1,2],[3,4]]", opts:["[[1,3],[2,4]]","[[4,3],[2,1]]","[[1,2],[3,4]]","[[2,1],[4,3]]"], c:0, dif:2},
        {q:"Rango de una matriz 3x3 con det!=0", opts:["3","2","1","0"], c:0, dif:2},
        {q:"v1 y v2 son LI si:", opts:["No hay c1,c2 con c1v1+c2v2=0","v1=k*v2","det=0","Son paralelos"], c:0, dif:3},
        {q:"Eigenvalor de I (identidad)", opts:["1","0","-1","infinito"], c:0, dif:2}
      ],
      estadistica: [
        {q:"Media de {2,4,6,8}", opts:["5","4","6","20"], c:0, dif:1},
        {q:"Mediana de {1,3,5,7,9}", opts:["5","3","7","4"], c:0, dif:1},
        {q:"P(A u B) si mutuamente excl.", opts:["P(A)+P(B)","P(A)*P(B)","P(A)-P(B)","1"], c:0, dif:2},
        {q:"Desv. estandar mide:", opts:["Dispersion","Centro","Posicion","Forma"], c:0, dif:1},
        {q:"Varianza es:", opts:["sigma^2","sigma","mu","mu^2"], c:0, dif:2},
        {q:"Moda de {1,2,2,3,4}", opts:["2","3","2.4","1"], c:0, dif:1},
        {q:"Coef. correlacion va de:", opts:["-1 a 1","0 a 1","0 a inf","-inf a inf"], c:0, dif:2},
        {q:"Dist. Normal: media +/- 1 sigma abarca:", opts:["68%","95%","99%","50%"], c:0, dif:2}
      ],
      quimica: [
        {q:"Numero atomico del Hidrogeno", opts:["1","2","3","4"], c:0, dif:1},
        {q:"Formula del agua", opts:["H2O","HO2","H2O2","OH"], c:0, dif:1},
        {q:"pH neutro = ?", opts:["7","0","14","1"], c:0, dif:1},
        {q:"Mol = ? particulas", opts:["6.022x10^23","3.14x10^23","1x10^23","6.022x10^22"], c:0, dif:2},
        {q:"Gas noble mas ligero", opts:["Helio","Neon","Argon","Kripton"], c:0, dif:1},
        {q:"NaCl es un compuesto:", opts:["Ionico","Covalente","Metalico","Van der Waals"], c:0, dif:2},
        {q:"Ley de Lavoisier:", opts:["Conservacion de masa","Proporciones definidas","Volumenes","Dalton"], c:0, dif:2},
        {q:"Numero de Avogadro:", opts:["6.022x10^23","3.14x10^23","1.6x10^-19","9.8"], c:0, dif:1}
      ]
    };

    var MATERIAS = Object.keys(BANCO);

    /* ══════════════════════════════════════════════
       PRUEBA DIAGNOSTICA
       ══════════════════════════════════════════════ */
    function buildDiagnostico(){
      var questions = [];
      for(var mat in BANCO){
        var pool = BANCO[mat];
        /* 2 preguntas por materia de diferente dificultad */
        var easy = pool.filter(function(q){ return q.dif <= 1; });
        var hard = pool.filter(function(q){ return q.dif >= 2; });
        if(easy.length > 0) questions.push({ mat:mat, q:easy[Math.floor(Math.random()*easy.length)] });
        if(hard.length > 0) questions.push({ mat:mat, q:hard[Math.floor(Math.random()*hard.length)] });
      }
      return shuffle(questions);
    }

    function renderDiagnostico(el){
      var S = t.S;
      if(S.diagnostico && S.diagnostico.completed){
        return renderDiagnosticoResults(el, S.diagnostico);
      }

      var html = '<div class="simulacro-page">';
      html += '<h2 class="h2">Prueba Diagnostica</h2>';
      html += '<p class="lead muted">Evalua tus conocimientos para personalizar tu ruta de aprendizaje</p>';
      html += '<div class="card" style="text-align:center;padding:2rem">';
      html += '<div style="font-size:4rem;margin-bottom:1rem">&#x1F9EA;</div>';
      html += '<div class="h3">16 preguntas de 8 materias</div>';
      html += '<p class="small muted">Aritmetica, Algebra, Calculo, Trigonometria, Geometria, Fisica, Algebra Lineal, Estadistica, Quimica</p>';
      html += '<button class="btn primary start-diag" style="margin-top:1rem">Iniciar Diagnostico</button>';

      if(S.diagnostico && S.diagnostico.completed){
        html += '<button class="btn" style="margin-top:.5rem" onclick="window._viewDiagResults()">Ver resultados anteriores</button>';
      }

      html += '</div></div>';
      el.innerHTML = html;

      el.addEventListener("click", function(e){
        if(e.target.closest(".start-diag")){
          var questions = buildDiagnostico();
          S.diagSession = { questions:questions, answers:[], current:0, startTime:Date.now() };
          renderDiagQuestion(el);
        }
      });
    }

    function renderDiagQuestion(el){
      var S = t.S;
      var sess = S.diagSession;
      if(!sess) return;
      var idx = sess.current;
      if(idx >= sess.questions.length) return finishDiagnostico(el);

      var item = sess.questions[idx];
      var q = item.q;
      var total = sess.questions.length;

      var html = '<div class="simulacro-page">';
      html += '<div class="exam-header">';
      html += '<div class="eyebrow">Diagnostico &middot; ' + item.mat.replace(/_/g,' ') + '</div>';
      html += '<div class="exam-progress">';
      for(var i=0;i<total;i++){
        var cls = i < idx ? (sess.answers[i] ? 'done' : 'wrong') : (i === idx ? 'current' : '');
        html += '<i class="' + cls + '"></i>';
      }
      html += '</div>';
      html += '<div class="small muted">Pregunta ' + (idx+1) + ' de ' + total + '</div>';
      html += '</div>';

      html += '<div class="card" style="margin-top:1rem">';
      html += '<div class="exam-question">' + q.q + '</div>';
      html += '<div class="opts">';
      for(var j=0;j<q.opts.length;j++){
        html += '<button class="opt diag-answer" data-idx="' + j + '">' + q.opts[j] + '</button>';
      }
      html += '</div></div></div>';
      el.innerHTML = html;

      el.addEventListener("click", function handler(e){
        var btn = e.target.closest(".diag-answer");
        if(!btn) return;
        el.removeEventListener("click", handler);
        var aidx = parseInt(btn.dataset.idx);
        var correct = aidx === q.c;
        sess.answers.push(correct);

        var opts = el.querySelectorAll(".diag-answer");
        for(var k=0;k<opts.length;k++){
          opts[k].disabled = true;
          if(parseInt(opts[k].dataset.idx) === q.c) opts[k].classList.add("ok");
          else if(opts[k] === btn && !correct) opts[k].classList.add("bad");
        }

        setTimeout(function(){
          sess.current++;
          renderDiagQuestion(document.getElementById("view"));
        }, 600);
      });
    }

    function finishDiagnostico(el){
      var S = t.S;
      var sess = S.diagSession;
      var results = {};

      for(var i=0;i<sess.questions.length;i++){
        var mat = sess.questions[i].mat;
        if(!results[mat]) results[mat] = { correct:0, total:0 };
        results[mat].total++;
        if(sess.answers[i]) results[mat].correct++;
      }

      /* Determine level per subject */
      var levels = {};
      var recommendations = [];
      for(var m in results){
        var r = results[m];
        var pct = (r.correct / r.total) * 100;
        if(pct >= 80) levels[m] = "avanzado";
        else if(pct >= 50) levels[m] = "intermedio";
        else levels[m] = "basico";

        if(pct < 80) recommendations.push({ mat:m, level:levels[m], pct:Math.round(pct) });
      }
      recommendations.sort(function(a,b){ return a.pct - b.pct; });

      S.diagnostico = {
        completed: true,
        date: Date.now(),
        results: results,
        levels: levels,
        recommendations: recommendations
      };
      delete S.diagSession;
      saveProgress();

      t.addXP(50);
      if(ui.toast) ui.toast("Diagnostico completado! +50 XP");

      renderDiagnosticoResults(el, S.diagnostico);
    }

    function renderDiagnosticoResults(el, diag){
      var html = '<div class="simulacro-page">';
      html += '<h2 class="h2">Resultado Diagnostico</h2>';
      html += '<p class="small muted">' + new Date(diag.date).toLocaleDateString() + '</p>';

      /* Level per subject */
      html += '<div class="grid" style="margin-top:1rem">';
      var levelColors = { basico:"var(--bad)", intermedio:"var(--warn)", avanzado:"var(--ok)" };
      var levelIcons = { basico:"&#x1F7E5;", intermedio:"&#x1F7E8;", avanzado:"&#x1F7E9;" };
      for(var mat in diag.results){
        var r = diag.results[mat];
        var pct = Math.round((r.correct / r.total) * 100);
        var lvl = diag.levels[mat];
        html += '<div class="card flat">';
        html += '<div class="row between"><span class="h3" style="text-transform:capitalize">' + mat.replace(/_/g,' ') + '</span>';
        html += '<span class="chip" style="background:' + levelColors[lvl] + '">' + lvl + '</span></div>';
        html += '<div class="bar" style="margin-top:.3rem"><i style="width:' + pct + '%;background:' + levelColors[lvl] + '"></i></div>';
        html += '<div class="small muted">' + r.correct + '/' + r.total + ' (' + pct + '%)</div>';
        html += '</div>';
      }
      html += '</div>';

      /* Recommendations */
      if(diag.recommendations.length > 0){
        html += '<h3 class="h3" style="margin-top:1.5rem">Capi recomienda:</h3>';
        html += '<div class="stack tight" style="margin-top:.5rem">';
        for(var ri=0;ri<diag.recommendations.length;ri++){
          var rec = diag.recommendations[ri];
          html += '<div class="card flat"><div class="row between">';
          html += '<span style="text-transform:capitalize">' + rec.mat.replace(/_/g,' ') + ' (' + rec.level + ')</span>';
          html += '<button class="btn sm primary" onclick="location.hash=\'#simulacros.' + rec.mat + '\'">Practicar</button>';
          html += '</div></div>';
        }
        html += '</div>';
      }

      html += '<div class="row" style="margin-top:1.5rem;gap:.5rem;justify-content:center">';
      html += '<button class="btn" onclick="delete window.CapEngine.S.diagnostico;location.hash=\'#diagnostico\'">Repetir prueba</button>';
      html += '<button class="btn primary" onclick="location.hash=\'#simulacros\'">Ir a Simulacros</button>';
      html += '</div>';
      html += '</div>';
      el.innerHTML = html;
    }

    ui.views.diagnostico = function(el){ renderDiagnostico(el); };

    /* ══════════════════════════════════════════════
       SIMULACRO ENGINE
       ══════════════════════════════════════════════ */
    function shuffle(arr){
      var a = arr.slice();
      for(var i = a.length - 1; i > 0; i--){
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
      }
      return a;
    }

    function buildExam(materia, count){
      var pool = BANCO[materia] || [];
      var questions = shuffle(pool).slice(0, count || 5);
      return { materia: materia, questions: questions, answers: [], current: 0, startTime: Date.now(), timeLimit: count * 60 };
    }

    /* ══════════════════════════════════════════════
       SIMULACRO VIEW
       ══════════════════════════════════════════════ */
    var activeExam = null;
    var examTimerInterval = null;

    function renderSimulacros(el){
      /* Check if specific materia in hash */
      var hashParts = location.hash.replace("#","").split(".");
      if(hashParts[1] && BANCO[hashParts[1]]){
        activeExam = buildExam(hashParts[1], 5);
        return renderActiveExam(el);
      }

      if(activeExam) return renderActiveExam(el);

      var S = t.S;
      var history = S.examHistory || [];

      var html = '<div class="simulacro-page">';
      html += '<h2 class="h2">Simulacros y Examenes</h2>';
      html += '<p class="lead muted">Practica con examenes cronometrados</p>';

      /* Diagnostic banner */
      if(!S.diagnostico || !S.diagnostico.completed){
        html += '<div class="card" style="border-color:var(--violet);margin-bottom:1rem">';
        html += '<div class="row"><span style="font-size:2rem">&#x1F9EA;</span>';
        html += '<div><div class="h3">Prueba Diagnostica</div>';
        html += '<p class="small muted">Primero evalua tu nivel para recomendaciones personalizadas</p></div>';
        html += '<button class="btn sm primary" onclick="location.hash=\'#diagnostico\'">Hacer prueba</button></div>';
        html += '</div>';
      }

      /* Materia selector */
      html += '<div class="grid" style="margin-top:1rem">';
      var icons = {aritmetica:"#",algebra:"x",calculo:"dx",trigonometria:"sin",geometria:"tri",fisica:"F",algebra_lineal:"Ax",estadistica:"mu",quimica:"At"};
      var colors = {aritmetica:"#3498db",algebra:"#9b59b6",calculo:"#e67e22",trigonometria:"#2ecc71",geometria:"#e74c3c",fisica:"#f39c12",algebra_lineal:"#1abc9c",estadistica:"#e91e63",quimica:"#00bcd4"};

      for(var i=0;i<MATERIAS.length;i++){
        var mat = MATERIAS[i];
        var diagLevel = S.diagnostico && S.diagnostico.levels && S.diagnostico.levels[mat];
        html += '<div class="card click exam-start" data-mat="' + mat + '">';
        html += '<div class="glyph" style="width:48px;height:48px;background:' + colors[mat] + ';font-size:1rem;color:#fff;margin:0 auto">' + icons[mat] + '</div>';
        html += '<div class="h3" style="text-align:center;text-transform:capitalize;font-size:.9rem">' + mat.replace(/_/g,' ') + '</div>';
        if(diagLevel) html += '<div class="small" style="text-align:center"><span class="chip sm">' + diagLevel + '</span></div>';
        html += '<div class="small muted" style="text-align:center">' + BANCO[mat].length + ' preguntas</div>';
        html += '<div class="row" style="justify-content:center;gap:.3rem;margin-top:.5rem">';
        html += '<button class="btn sm exam-go" data-mat="' + mat + '" data-count="5">Quiz 5</button>';
        html += '<button class="btn sm exam-go" data-mat="' + mat + '" data-count="8">Parcial 8</button>';
        html += '</div></div>';
      }
      html += '</div>';

      /* Mixed exam */
      html += '<div class="card" style="margin-top:1rem;text-align:center">';
      html += '<div class="h3">Simulacro General</div>';
      html += '<p class="small muted">Preguntas de todas las materias</p>';
      html += '<button class="btn primary exam-go" data-mat="mixed" data-count="15">Iniciar (15 preguntas)</button>';
      html += '</div>';

      /* History */
      if(history.length > 0){
        html += '<h3 class="h3" style="margin-top:2rem">Historial</h3>';
        html += '<div class="stack tight" style="margin-top:.5rem">';
        for(var h=Math.max(0,history.length-8);h<history.length;h++){
          var rec = history[h];
          var pct = Math.round((rec.correct / rec.total) * 100);
          html += '<div class="card flat"><div class="row between">';
          html += '<span class="h3" style="text-transform:capitalize;font-size:.9rem">' + (rec.materia||"general").replace(/_/g,' ') + '</span>';
          html += '<span class="chip ' + (pct >= 70 ? 'ok' : pct >= 50 ? 'warn' : 'bad') + '">' + pct + '% (' + rec.correct + '/' + rec.total + ')</span>';
          html += '</div><div class="small muted">' + new Date(rec.date).toLocaleDateString() + ' &middot; ' + rec.time + 's</div></div>';
        }
        html += '</div>';
      }

      html += '</div>';
      el.innerHTML = html;

      el.addEventListener("click", function(e){
        var btn = e.target.closest(".exam-go");
        if(!btn) return;
        var mat = btn.dataset.mat;
        var count = parseInt(btn.dataset.count) || 5;
        if(mat === "mixed"){
          var allQ = [];
          for(var k in BANCO) allQ = allQ.concat(BANCO[k]);
          activeExam = { materia:"general", questions:shuffle(allQ).slice(0,count), answers:[], current:0, startTime:Date.now(), timeLimit:count*60 };
        } else {
          activeExam = buildExam(mat, count);
        }
        renderActiveExam(el);
      });
    }

    function renderActiveExam(el){
      var exam = activeExam;
      var q = exam.questions[exam.current];
      if(!q) q = exam.questions[0]; /* safety */
      var total = exam.questions.length;
      var elapsed = Math.floor((Date.now() - exam.startTime) / 1000);
      var remaining = Math.max(0, exam.timeLimit - elapsed);

      if(remaining <= 0 || exam.current >= total){
        return renderExamResults(el);
      }

      var min = Math.floor(remaining / 60);
      var sec = remaining % 60;

      var html = '<div class="simulacro-page">';
      html += '<div class="exam-header">';
      html += '<div class="eyebrow" style="text-transform:capitalize">' + (exam.materia||"").replace(/_/g,' ') + '</div>';
      html += '<div class="exam-timer">' + min + ':' + (sec < 10 ? '0' : '') + sec + '</div>';
      html += '<div class="exam-progress">';
      for(var i=0;i<total;i++){
        var cls = i < exam.current ? (exam.answers[i] ? 'done' : 'wrong') : (i === exam.current ? 'current' : '');
        html += '<i class="' + cls + '"></i>';
      }
      html += '</div>';
      html += '<div class="small muted">Pregunta ' + (exam.current + 1) + ' de ' + total + '</div>';
      html += '</div>';

      html += '<div class="card" style="margin-top:1rem">';
      html += '<div class="exam-question">' + q.q + '</div>';
      html += '<div class="opts">';
      for(var j=0;j<q.opts.length;j++){
        html += '<button class="opt exam-answer" data-idx="' + j + '">' + q.opts[j] + '</button>';
      }
      html += '</div></div></div>';

      el.innerHTML = html;

      if(examTimerInterval) clearInterval(examTimerInterval);
      examTimerInterval = setInterval(function(){
        var el2 = document.querySelector(".exam-timer");
        if(!el2){ clearInterval(examTimerInterval); return; }
        var e2 = Math.floor((Date.now() - exam.startTime) / 1000);
        var r2 = Math.max(0, exam.timeLimit - e2);
        if(r2 <= 0){
          clearInterval(examTimerInterval);
          renderExamResults(document.getElementById("view"));
          return;
        }
        var m2 = Math.floor(r2/60), s2 = r2%60;
        el2.textContent = m2 + ':' + (s2<10?'0':'') + s2;
        if(r2 < 30) el2.style.color = 'var(--bad)';
      }, 1000);

      el.addEventListener("click", function handler(e){
        var btn = e.target.closest(".exam-answer");
        if(!btn) return;
        el.removeEventListener("click", handler);
        var idx = parseInt(btn.dataset.idx);
        var correct = idx === q.c;
        exam.answers.push(correct);

        var opts = el.querySelectorAll(".exam-answer");
        for(var k=0;k<opts.length;k++){
          opts[k].disabled = true;
          if(parseInt(opts[k].dataset.idx) === q.c) opts[k].classList.add("ok");
          else if(opts[k] === btn && !correct) opts[k].classList.add("bad");
        }

        if(correct) t.addXP(15);

        setTimeout(function(){
          exam.current++;
          if(exam.current >= total) renderExamResults(document.getElementById("view"));
          else renderActiveExam(document.getElementById("view"));
        }, 700);
      });
    }

    function renderExamResults(el){
      if(examTimerInterval){ clearInterval(examTimerInterval); examTimerInterval = null; }
      var exam = activeExam;
      var correct = exam.answers.filter(function(a){ return a; }).length;
      var total = exam.questions.length;
      var pct = Math.round((correct / total) * 100);
      var elapsed = Math.floor((Date.now() - exam.startTime) / 1000);

      if(!t.S.examHistory) t.S.examHistory = [];
      t.S.examHistory.push({ materia: exam.materia, correct: correct, total: total, time: elapsed, date: Date.now() });

      var bonus = 0;
      if(pct >= 90) bonus = 100;
      else if(pct >= 70) bonus = 50;
      else if(pct >= 50) bonus = 20;
      if(bonus > 0){
        t.addXP(bonus);
        if(ui.toast) ui.toast("Examen: +" + bonus + " XP bonus!");
      }
      if(pct === 100 && ui.confetti) ui.confetti(120);

      saveProgress();

      var html = '<div class="simulacro-page">';
      html += '<div class="exam-results">';
      html += '<div class="exam-score">' + pct + '%</div>';
      html += '<div class="h2" style="margin-top:.5rem">' + correct + ' de ' + total + ' correctas</div>';
      html += '<div class="small muted" style="margin-top:.5rem">Tiempo: ' + elapsed + 's' + (bonus > 0 ? ' &middot; +' + bonus + ' XP bonus' : '') + '</div>';

      html += '<div class="exam-progress" style="max-width:300px;margin:1.5rem auto">';
      for(var i=0;i<total;i++){
        html += '<i class="' + (exam.answers[i] ? 'done' : 'wrong') + '"></i>';
      }
      html += '</div>';

      var wrongs = [];
      for(var j=0;j<total;j++){
        if(!exam.answers[j]) wrongs.push(exam.questions[j]);
      }
      if(wrongs.length > 0){
        html += '<div style="text-align:left;margin-top:1.5rem"><div class="h3">Repasa:</div>';
        for(var w=0;w<wrongs.length;w++){
          var wq = wrongs[w].q || wrongs[w];
          html += '<div class="card flat" style="margin-top:.5rem"><div class="small">' + (wq.q || wq) + '</div>';
          html += '<div class="small" style="color:var(--ok)">R: ' + (wq.opts ? wq.opts[wq.c] : '?') + '</div></div>';
        }
        html += '</div>';
      }

      html += '<div class="row" style="justify-content:center;gap:.5rem;margin-top:1.5rem">';
      html += '<button class="btn primary exam-retry">Reintentar</button>';
      html += '<button class="btn" onclick="location.hash=\'#simulacros\'">Volver</button>';
      html += '</div>';
      html += '</div></div>';
      el.innerHTML = html;

      el.addEventListener("click", function(e){
        if(e.target.closest(".exam-retry")){
          activeExam = buildExam(exam.materia, exam.questions.length);
          renderActiveExam(document.getElementById("view"));
        }
      });

      activeExam = null;
    }

    ui.views.simulacros = function(el){ renderSimulacros(el); };

    /* ══════════════════════════════════════════════
       CAPI — TUTORA INTELIGENTE
       Habla, escucha, responde, busca, enseña
       ══════════════════════════════════════════════ */

    /* Base de conocimiento de Capi */
    var CAPI_KB = {
      /* Matematicas */
      derivada: "La derivada mide el cambio instantaneo de una funcion. Reglas: d/dx(x^n)=n*x^(n-1), d/dx(sen x)=cos x, d/dx(cos x)=-sen x, d/dx(e^x)=e^x, d/dx(ln x)=1/x. Regla de la cadena: d/dx[f(g(x))]=f'(g(x))*g'(x). Regla del producto: d/dx[fg]=f'g+fg'.",
      integral: "La integral es la operacion inversa de la derivada. Integral de x^n dx = x^(n+1)/(n+1)+C. Integral de sen x = -cos x+C. Integral de cos x = sen x+C. Integral de e^x = e^x+C. Integral de 1/x = ln|x|+C. Por partes: integral(u dv) = uv - integral(v du).",
      limite: "El limite describe el valor al que se acerca f(x) cuando x tiende a un punto. Limites notables: lim(x->0) sen(x)/x=1, lim(x->inf)(1+1/x)^x=e. Regla de L'Hopital: si 0/0 o inf/inf, lim f/g = lim f'/g'.",
      pitagoras: "Teorema de Pitagoras: En un triangulo rectangulo, a^2+b^2=c^2, donde c es la hipotenusa. Usado en distancia entre puntos: d=sqrt((x2-x1)^2+(y2-y1)^2).",
      trigonometria: "Funciones: sen, cos, tan, csc, sec, cot. Identidades: sen^2+cos^2=1, 1+tan^2=sec^2, sen(2x)=2sen(x)cos(x). Valores: sen(30)=1/2, cos(30)=sqrt(3)/2, sen(45)=sqrt(2)/2, tan(45)=1, sen(60)=sqrt(3)/2, cos(60)=1/2.",
      ecuacion: "Para resolver ecuaciones: 1) Simplifica ambos lados 2) Agrupa terminos semejantes 3) Despeja la variable. Cuadratica: x=(-b+-sqrt(b^2-4ac))/(2a). Discriminante: b^2-4ac>0 (dos raices reales), =0 (una raiz), <0 (complejas).",
      factorizar: "Metodos: Factor comun, agrupacion, diferencia de cuadrados a^2-b^2=(a+b)(a-b), trinomio cuadrado perfecto, trinomio de la forma x^2+bx+c, formula general para ax^2+bx+c.",
      logaritmo: "log_b(x)=y significa b^y=x. Propiedades: log(xy)=log(x)+log(y), log(x/y)=log(x)-log(y), log(x^n)=n*log(x), log_b(1)=0, log_b(b)=1. Cambio de base: log_b(x)=ln(x)/ln(b).",
      area: "Rectangulo: b*h. Triangulo: b*h/2. Circulo: pi*r^2. Trapecio: (B+b)*h/2. Paralelogramo: b*h. Rombo: d1*d2/2. Sector circular: (theta/360)*pi*r^2.",
      volumen: "Cubo: a^3. Esfera: (4/3)pi*r^3. Cilindro: pi*r^2*h. Cono: (1/3)pi*r^2*h. Prisma: A_base*h. Piramide: (1/3)*A_base*h.",
      matriz: "Operaciones: suma (elemento a elemento), multiplicacion (fila por columna). Determinante 2x2: ad-bc. Inversa: A^(-1)=adj(A)/det(A). Propiedades: (AB)^T=B^T*A^T, det(AB)=det(A)*det(B).",
      vector: "Vector: magnitud y direccion. Suma: componente a componente. Producto punto: a*b=|a||b|cos(theta). Producto cruz: |a x b|=|a||b|sen(theta). Norma: |v|=sqrt(x^2+y^2+z^2).",
      probabilidad: "P(A)=casos favorables/total. P(A u B)=P(A)+P(B)-P(A n B). P(A|B)=P(A n B)/P(B). Independientes: P(A n B)=P(A)*P(B). Bayes: P(A|B)=P(B|A)*P(A)/P(B).",
      estadistica: "Media: suma/n. Mediana: valor central. Moda: mas frecuente. Varianza: E[(X-mu)^2]. Desviacion estandar: sqrt(varianza). Normal: 68-95-99.7 regla.",

      /* Fisica */
      newton: "Leyes de Newton: 1) Inercia: objeto en reposo permanece en reposo. 2) F=ma. 3) Accion-reaccion: F12=-F21. Peso: W=mg. Fuerza normal, friccion: f=mu*N.",
      energia: "E cinetica: Ec=(1/2)mv^2. E potencial gravitatoria: Ep=mgh. Conservacion: Ec1+Ep1=Ec2+Ep2. Trabajo: W=F*d*cos(theta). Potencia: P=W/t.",
      electricidad: "Ley de Ohm: V=IR. Resistencias en serie: R=R1+R2. Paralelo: 1/R=1/R1+1/R2. Potencia: P=VI=I^2R=V^2/R. Ley de Kirchhoff: suma V=0, suma I=0.",
      cinematica: "MRU: x=x0+vt. MRUA: v=v0+at, x=x0+v0*t+(1/2)at^2, v^2=v0^2+2a*dx. Caida libre: g=9.8m/s^2. Tiro parabolico: vx=constante, vy=v0y-gt.",

      /* Quimica */
      quimica: "Tabla periodica organiza elementos por numero atomico. Grupos: metales, no metales, metaloides. Enlaces: ionico (transferencia e-), covalente (comparten e-), metalico. Reacciones: sintesis, descomposicion, sustitucion, doble sustitucion.",
      mol: "Mol = 6.022x10^23 particulas (numero de Avogadro). Masa molar = masa atomica en g/mol. n = m/M. Volumen molar gas ideal a STP = 22.4 L/mol.",
      ph: "pH = -log[H+]. pH < 7 acido, pH = 7 neutro, pH > 7 basico. pOH = 14 - pH. Acidos fuertes: HCl, H2SO4, HNO3. Bases fuertes: NaOH, KOH.",

      /* General */
      consejo: "Tips de Capi: 1) Practica diario, aunque sean 10 minutos. 2) Los errores son oportunidades de aprender. 3) Resuelve problemas paso a paso. 4) Repasa tus falencias regularmente. 5) Los simulacros te preparan para parciales reales.",
      motivacion: "Cada problema resuelto te acerca a tu meta. No te rindas! Los mejores ingenieros se hicieron resolviendo muchos problemas. Tu esfuerzo hoy es tu exito de manana."
    };

    function capiRespond(msg){
      msg = msg.toLowerCase().trim();

      /* Status */
      if(msg.match(/como (estoy|voy)|mi progreso|mi nivel/)){
        var lvl = t.level ? t.level() : 1;
        var xp = t.S.xp || 0;
        var diag = t.S.diagnostico;
        var resp = "Llevas " + xp + " XP y estas en nivel " + lvl + ". ";
        if(diag && diag.completed){
          var debil = diag.recommendations[0];
          if(debil) resp += "Te recomiendo practicar " + debil.mat.replace(/_/g,' ') + " (nivel " + debil.level + "). ";
        }
        resp += lvl > 10 ? "Vas increible!" : lvl > 5 ? "Buen progreso!" : "Sigue practicando!";
        return resp;
      }

      /* Recommendations from diagnostic */
      if(msg.match(/que (estudi|practic|recomien|debo|hago)|recomienda/)){
        var diag2 = t.S.diagnostico;
        if(diag2 && diag2.completed && diag2.recommendations.length > 0){
          var recs = diag2.recommendations.slice(0,3);
          return "Segun tu diagnostico, enfocate en: " + recs.map(function(r){ return r.mat.replace(/_/g,' ') + " (" + r.level + ")"; }).join(", ") + ". Haz clic en Simulacros para practicar!";
        }
        return "Haz la Prueba Diagnostica primero para que pueda darte recomendaciones personalizadas. Ve a Diagnostico!";
      }

      /* Help */
      if(msg.match(/ayuda|que puedo|funciones|como funciona/)){
        return "Puedo ayudarte con: matematicas (derivadas, integrales, algebra...), fisica (Newton, energia...), programacion (complejidad, estructuras...), y mas. Tambien puedo ver tu progreso, recomendar temas, y hacer calculos. Preguntame lo que quieras!";
      }

      /* Math calculator */
      if(msg.match(/^[\d\s\+\-\*\/\^\(\)\.]+$/)){
        try{
          var expr = msg.replace(/\^/g,"**");
          var result = new Function("return " + expr)();
          if(typeof result === "number" && isFinite(result)){
            return "= " + result;
          }
        }catch(e){}
      }

      /* KB search */
      var bestMatch = null, bestScore = 0;
      for(var key in CAPI_KB){
        var keywords = key.split(/[_\s]+/);
        var score = 0;
        for(var ki=0;ki<keywords.length;ki++){
          if(msg.indexOf(keywords[ki]) !== -1) score += 2;
        }
        /* Also search content */
        var words = msg.split(/\s+/);
        for(var wi=0;wi<words.length;wi++){
          if(words[wi].length > 3 && CAPI_KB[key].toLowerCase().indexOf(words[wi]) !== -1) score++;
        }
        if(score > bestScore){ bestScore = score; bestMatch = key; }
      }

      if(bestMatch && bestScore >= 2){
        return CAPI_KB[bestMatch];
      }

      /* Greetings */
      if(msg.match(/^(hola|hey|hi|buenas|saludos|ey)/)) return "Hola! Soy Capi, tu tutora de matematicas e ingenieria. En que te ayudo?";
      if(msg.match(/gracias|thx|genial/)) return "De nada! Estoy aqui para ayudarte. Sigue aprendiendo!";
      if(msg.match(/chiste|broma|chistoso/)){
        var chistes = [
          "Por que el libro de mates estaba triste? Porque tenia muchos problemas!",
          "Que le dijo la integral a la derivada? No me descompongas!",
          "Por que el vector no fue a la fiesta? Porque no tenia la direccion!",
          "Que hace un algebra en el gimnasio? Resuelve sus problemas!"
        ];
        return chistes[Math.floor(Math.random()*chistes.length)];
      }

      /* Fallback */
      var fallbacks = [
        "Interesante! Intenta preguntarme sobre derivadas, integrales, algebra, fisica, probabilidad, o cualquier tema de ingenieria.",
        "No tengo esa respuesta exacta, pero puedo ayudarte con temas de matematicas, fisica y programacion. Que quieres aprender?",
        "Prueba ser mas especifico! Ejemplo: 'que es una derivada', 'explica probabilidad', 'calcula 15*23'"
      ];
      return fallbacks[Math.floor(Math.random()*fallbacks.length)];
    }

    function enhanceCapi(){
      var companion = document.getElementById("companion");
      if(!companion) return;
      var bubble = companion.querySelector(".bubble");
      if(!bubble || bubble.querySelector(".capi-input-wrap")) return;

      var inputWrap = document.createElement("div");
      inputWrap.className = "capi-input-wrap";
      inputWrap.innerHTML = '<div style="display:flex;gap:4px;margin-top:8px">' +
        '<input type="text" class="capi-input" placeholder="Preguntale a Capi..." style="flex:1;padding:6px 10px;border-radius:12px;border:1px solid var(--line2);background:var(--panel);font-size:.85rem;min-height:32px;color:var(--fg)">' +
        '<button class="btn sm capi-send" style="padding:4px 10px;min-height:32px">Enviar</button>' +
        '</div>';
      bubble.appendChild(inputWrap);

      var chatArea = document.createElement("div");
      chatArea.className = "capi-chat";
      chatArea.style.cssText = "max-height:220px;overflow-y:auto;margin-bottom:8px;font-size:.85rem;line-height:1.4";
      bubble.insertBefore(chatArea, inputWrap);

      var input = inputWrap.querySelector(".capi-input");
      var sendBtn = inputWrap.querySelector(".capi-send");

      function handleSend(){
        var msg = input.value.trim();
        if(!msg) return;
        input.value = "";

        chatArea.innerHTML += '<div style="text-align:right;margin:6px 0;padding:4px 8px;background:var(--violet);color:#fff;border-radius:10px 10px 2px 10px;display:inline-block;float:right;clear:both;max-width:85%">' + msg + '</div><div style="clear:both"></div>';

        var response = capiRespond(msg);
        chatArea.innerHTML += '<div style="margin:6px 0;padding:4px 8px;background:var(--panel2,var(--panel));border-radius:10px 10px 10px 2px;display:inline-block;max-width:85%">' + response + '</div>';
        chatArea.scrollTop = chatArea.scrollHeight;

        if(window.CapExtras && window.CapExtras.makeCapiDance) window.CapExtras.makeCapiDance();
      }

      sendBtn.addEventListener("click", handleSend);
      input.addEventListener("keydown", function(e){ if(e.key === "Enter") handleSend(); });

      setTimeout(function(){
        if(ui.say){
          var S = t.S;
          if(!S.diagnostico || !S.diagnostico.completed){
            ui.say("Hola! Haz la Prueba Diagnostica para personalizar tu ruta!");
          } else {
            ui.say("Hola! Preguntame lo que quieras sobre mates o ingenieria!");
          }
        }
      }, 3000);
    }

    /* Inject nav for simulacros + diagnostico */
    function injectSimNav(){
      var nav = document.querySelector("#side .nav");
      if(!nav) return;
      var items = [
        {route:"diagnostico", label:"Diagnostico", icon:"activity"},
        {route:"simulacros", label:"Simulacros", icon:"clipboard"}
      ];
      for(var i=0;i<items.length;i++){
        var it = items[i];
        if(nav.querySelector('[data-r="' + it.route + '"]')) continue;
        var link = document.createElement("a");
        link.href = "#" + it.route;
        link.dataset.r = it.route;
        link.innerHTML = ui.ic(it.icon,20) + it.label;
        var aventura = nav.querySelector('[data-r="aventura"]');
        if(aventura && aventura.nextSibling) nav.insertBefore(link, aventura.nextSibling);
        else nav.appendChild(link);
      }
    }

    /* Wrap render */
    var prevR = ui.render;
    ui.render = function(){
      prevR.apply(ui, arguments);
      requestAnimationFrame(function(){
        injectSimNav();
        enhanceCapi();
      });
    };
    setTimeout(function(){
      injectSimNav();
      enhanceCapi();
    }, 1500);

    /* Export */
    window.CapSimulacros = {
      BANCO: BANCO,
      buildExam: buildExam,
      saveProgress: saveProgress,
      loadProgress: loadProgress,
      capiRespond: capiRespond
    };

    console.log("[CAPICUA] Simulacros + Capi Tutora v2.1 activos");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
