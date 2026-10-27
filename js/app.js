(function () {
/* Presença Inteligente — dados fictícios e integração opcional com Supabase */
const $ = (id) => document.getElementById(id);
const seedStudents = [
  {id:"demo-1",name:"Ana Martins",class_name:"2º A",frequency:98},
  {id:"demo-2",name:"Bruno Lima",class_name:"2º A",frequency:72},
  {id:"demo-3",name:"Camila Rocha",class_name:"2º B",frequency:88},
  {id:"demo-4",name:"Diego Alves",class_name:"2º A",frequency:96},
  {id:"demo-5",name:"Eduarda Souza",class_name:"2º C",frequency:68},
  {id:"demo-6",name:"Felipe Costa",class_name:"2º B",frequency:91},
  {id:"demo-7",name:"Giovana Melo",class_name:"2º C",frequency:82},
  {id:"demo-8",name:"Heitor Nunes",class_name:"2º A",frequency:99},
  {id:"demo-9",name:"Isabela Freire",class_name:"2º B",frequency:74},
  {id:"demo-10",name:"João Pedro",class_name:"2º C",frequency:93},
  {id:"demo-11",name:"Larissa Gomes",class_name:"2º A",frequency:86},
  {id:"demo-12",name:"Mateus Ribeiro",class_name:"2º B",frequency:65}
];
let students = [...seedStudents];
let logs = [];
let followups = [
  {student_id:"demo-2",reason:"Dificuldade de transporte",action:"Verificar transporte e acesso",review_date:"2026-10-30",status:"Em andamento"},
  {student_id:"demo-5",reason:"Dificuldade de aprendizagem",action:"Apoio pedagógico",review_date:"2026-10-29",status:"Em andamento"}
];
let supabase = null, user = null;
const pageNames = {
 dashboard:["Visão geral","Sinais para agir cedo, com escuta e acolhimento."],
 students:["Estudantes","Consulte dados fictícios e sinais que merecem revisão."],
 attendance:["Frequência","Registre presenças e faltas para testar o protótipo."],
 followup:["Acompanhamento","Transforme o alerta em uma ação de apoio."],
 about:["Sobre o projeto","Objetivo, funcionamento e limites responsáveis."]
};
function escapeHTML(v){return String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(message){$("toast").textContent=message;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",2800);}
function go(page){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===page));document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===page));$("page-title").textContent=pageNames[page][0];$("page-subtitle").textContent=pageNames[page][1];renderAll();window.scrollTo(0,0);}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.goto)));
function level(s){return s.frequency<75?"high":s.frequency<90?"medium":"ok";}
function pill(s){const l=level(s);return l==="high"?'<span class="pill red">Atenção prioritária</span>':l==="medium"?'<span class="pill amber">Acompanhar</span>':'<span class="pill green">Estável</span>';}
function renderDashboard(){
  $("total").textContent=students.length;
  $("average").textContent=(students.length?Math.round(students.reduce((a,s)=>a+s.frequency,0)/students.length):0)+"%";
  $("attention").textContent=students.filter(s=>level(s)==="high").length;
  $("followup-total").textContent=followups.length;
  const weekly=[96,94,90,84];
  $("weekly").innerHTML=weekly.map((n,i)=>`<div class="barrow"><span>Semana ${i+1}</span><div class="track"><div class="fill ${n<88?"bad":n<92?"warn":""}" style="width:${n}%"></div></div><strong>${n}%</strong></div>`).join("");
  $("alerts").innerHTML=students.filter(s=>level(s)==="high").slice(0,4).map(s=>`<div class="alert"><span class="dot"></span><div><strong>${escapeHTML(s.name)} · ${s.frequency}% de frequência</strong><span class="muted small">Verificar contexto com cuidado</span></div></div>`).join("")||'<p class="muted small">Nenhum alerta de demonstração.</p>';
}
function renderStudents(){
 const q=($("student-search")?.value||"").toLowerCase(),f=$("student-filter")?.value||"all";
 const list=students.filter(s=>(s.name.toLowerCase().includes(q)||s.class_name.toLowerCase().includes(q))&&(f==="all"||level(s)===f));
 $("student-rows").innerHTML=list.map(s=>`<tr><td><span class="name">${escapeHTML(s.name)}</span><br><span class="muted small">Dado de demonstração</span></td><td>${escapeHTML(s.class_name)}</td><td><strong>${s.frequency}%</strong><div class="track" style="width:100px;margin-top:5px"><div class="fill ${level(s)==="high"?"bad":level(s)==="medium"?"warn":""}" style="width:${s.frequency}%"></div></div></td><td>${pill(s)}</td><td><button class="small" data-follow="${escapeHTML(s.id)}">Acompanhar</button></td></tr>`).join("")||'<tr><td colspan="5">Nenhum resultado.</td></tr>';
 document.querySelectorAll("[data-follow]").forEach(b=>b.addEventListener("click",()=>{$("follow-student").value=b.dataset.follow;go("followup");}));
}
function fillStudentOptions(){
 ["attendance-student","follow-student"].forEach(id=>{$(id).innerHTML=students.map(s=>`<option value="${escapeHTML(s.id)}">${escapeHTML(s.name)} — ${escapeHTML(s.class_name)}</option>`).join("");});
}
function renderLogs(){
 $("attendance-log").innerHTML=logs.length?logs.map(l=>`<div class="item"><div><strong>${escapeHTML(l.name)}</strong><span class="muted">${escapeHTML(l.date)}</span></div>${l.status==="present"?'<span class="pill green">Presente</span>':'<span class="pill red">Falta</span>'}</div>`).join(""):'<p class="muted small">Nenhum registro novo nesta sessão.</p>';
}
function renderFollowups(){
 $("followup-list").innerHTML=followups.map(f=>{const s=students.find(x=>x.id===f.student_id);return `<div class="item"><div><strong>${escapeHTML(s?.name||"Estudante")}</strong><span class="muted">${escapeHTML(f.reason)}</span><span class="muted">Ação: ${escapeHTML(f.action)}</span><span class="muted">Revisão: ${escapeHTML(f.review_date||"Não definida")}</span></div><span class="pill amber">${escapeHTML(f.status||"Aberto")}</span></div>`;}).join("")||'<p class="muted small">Nenhum acompanhamento registrado.</p>';
}
function renderAll(){renderDashboard();renderStudents();fillStudentOptions();renderLogs();renderFollowups();}
$("student-search").addEventListener("input",renderStudents);$("student-filter").addEventListener("change",renderStudents);
$("attendance-date").value=new Date().toISOString().slice(0,10);
$("review-date").value=new Date(Date.now()+7*86400000).toISOString().slice(0,10);

$("save-attendance").addEventListener("click",async()=>{
 const id=$("attendance-student").value,s=students.find(x=>x.id===id),date=$("attendance-date").value,status=$("attendance-status").value;
 if(!s||!date){toast("Selecione estudante e data.");return;}
 if(supabase&&user&&!id.startsWith("demo-")){
   const {error}=await supabase.from("attendance").insert({student_id:id,attendance_date:date,status});
   if(error){$("attendance-message").textContent="Não foi possível salvar no banco: "+error.message;return;}
 } else if(supabase&&user&&id.startsWith("demo-")){
   $("attendance-message").textContent="Selecione um estudante criado no banco para persistir o registro. Este registro será mantido apenas nesta sessão.";
 }
 logs.unshift({name:s.name,date,status});
 $("attendance-message").textContent=`Registro de demonstração adicionado: ${s.name}, ${status==="present"?"presente":"falta"} em ${date}.`;
 renderLogs();toast("Registro adicionado.");
});
$("save-followup").addEventListener("click",async()=>{
 const student_id=$("follow-student").value,s=students.find(x=>x.id===student_id),reason=$("reason").value,action=$("action").value,review_date=$("review-date").value;
 if(!s||!review_date){toast("Escolha estudante e data de revisão.");return;}
 if(supabase&&user&&!student_id.startsWith("demo-")){
   const {error}=await supabase.from("followups").insert({student_id,reason,action,review_date});
   if(error){$("followup-message").textContent="Não foi possível salvar no banco: "+error.message;return;}
 }
 followups.unshift({student_id,reason,action,review_date,status:"Novo"});
 $("followup-message").textContent="Acompanhamento adicionado à demonstração.";
 renderFollowups();renderDashboard();toast("Acompanhamento registrado.");
});
async function loadFromDatabase(){
 if(!supabase||!user)return;
 const {data:rows,error}=await supabase.from("students").select("id,full_name,class_name").order("full_name");
 if(error){$("auth-status").textContent="Conectado, mas não foi possível carregar estudantes: "+error.message;return;}
 if(rows&&rows.length){students=rows.map(s=>({id:s.id,name:s.full_name,class_name:s.class_name,frequency:90}));}
 const {data:ats}=await supabase.from("attendance").select("student_id,status");
 if(ats&&ats.length){const counts={};ats.forEach(a=>{counts[a.student_id]??={p:0,t:0};counts[a.student_id].t++;if(a.status==="present")counts[a.student_id].p++;});students=students.map(s=>counts[s.id]?.t?{...s,frequency:Math.round(100*counts[s.id].p/counts[s.id].t)}:s);}
 const {data:fs}=await supabase.from("followups").select("student_id,reason,action,review_date,status").order("created_at",{ascending:false});
 if(fs)followups=fs;
 $("auth-status").textContent="Conectado ao Supabase como "+user.email+".";
 renderAll();
}
async function initAuth(){
 const cfg=window.PI_CONFIG||{};
 if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY||!window.supabase){
   $("auth-status").textContent="Modo local: configure js/config.js para conectar ao Supabase. As alterações ficam na sessão do navegador.";
   $("login-btn").disabled=true;$("signup-btn").disabled=true;return;
 }
 supabase=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 const {data:{session}}=await supabase.auth.getSession();user=session?.user||null;updateAuthUI();await loadFromDatabase();
 supabase.auth.onAuthStateChange(async(_event,session)=>{user=session?.user||null;updateAuthUI();await loadFromDatabase();});
}
function updateAuthUI(){
 $("logout-btn").classList.toggle("hidden",!user);
 $("login-btn").classList.toggle("hidden",!!user);$("signup-btn").classList.toggle("hidden",!!user);
 if(user)$("auth-status").textContent="Sessão autenticada: "+user.email;
}
$("login-btn").addEventListener("click",async()=>{
 if(!supabase)return;
 const {error}=await supabase.auth.signInWithPassword({email:$("email").value,password:$("password").value});
 $("auth-status").textContent=error?"Falha ao entrar: "+error.message:"Login realizado.";
});
$("signup-btn").addEventListener("click",async()=>{
 if(!supabase)return;
 const {error}=await supabase.auth.signUp({email:$("email").value,password:$("password").value});
 $("auth-status").textContent=error?"Falha ao criar conta: "+error.message:"Cadastro enviado. Se a confirmação por e-mail estiver ativa, confirme o endereço antes de entrar.";
});
$("logout-btn").addEventListener("click",async()=>{if(supabase)await supabase.auth.signOut();user=null;updateAuthUI();});
renderAll();initAuth();
  })();
  
