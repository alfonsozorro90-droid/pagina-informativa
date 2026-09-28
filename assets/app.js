'use strict';
(() => {
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = reduced.matches;
let animationFrame = 0;
function setMotion(paused) {
  motionPaused = paused;
  document.documentElement.classList.toggle('motion-off', paused);
  document.documentElement.classList.toggle('js-motion', !paused);
  $('#motion-toggle').setAttribute('aria-pressed', String(paused));
  $('#motion-toggle').setAttribute('aria-label', paused ? 'Activar animaciones' : 'Pausar animaciones');
  $('#motion-toggle').title = paused ? 'Activar animaciones' : 'Pausar animaciones';
  $('#motion-toggle').textContent = paused ? '▷' : 'Ⅱ';
}
setMotion(motionPaused);
$('#motion-toggle').addEventListener('click', () => {setMotion(!motionPaused); startCanvas();});
reduced.addEventListener('change', e => {setMotion(e.matches); startCanvas();});
const menu = $('#main-nav');
$('#menu-toggle').addEventListener('click', () => {
 const open = menu.classList.toggle('open'); $('#menu-toggle').setAttribute('aria-expanded', String(open));
});
$$('a',menu).forEach(a => a.addEventListener('click', () => {menu.classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');}));
document.addEventListener('keydown', e => {if(e.key==='Escape'){menu.classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');}});
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}), {threshold:.06});
$$('.reveal').forEach(el => revealObserver.observe(el));
let scrollQueued=false;
function readProgress(){const total=document.documentElement.scrollHeight-window.innerHeight;$('#read-progress').style.width=`${total > 0 ? window.scrollY / total * 100 : 0}%`;scrollQueued=false;}
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(readProgress);}},{passive:true});
readProgress();

// Both tab sets support keyboard arrows, Home and End, as well as touch.
function setupTabKeys(container, selector, activate, vertical=false) {
 container.addEventListener('keydown', e => {
  const tabs = $$(selector,container); const at=tabs.indexOf(document.activeElement); if(at<0)return;
  let next=at;
  if(e.key===(vertical?'ArrowDown':'ArrowRight'))next=(at+1)%tabs.length;
  else if(e.key===(vertical?'ArrowUp':'ArrowLeft'))next=(at-1+tabs.length)%tabs.length;
  else if(e.key==='Home')next=0; else if(e.key==='End')next=tabs.length-1; else return;
  e.preventDefault();activate(next);tabs[next].focus();
 });
}
$('#route-stations').innerHTML = SYNAP.stages.map((s,i)=>`<button class="station" role="tab" id="stage-${i}" aria-controls="route-detail" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-stage="${i}"><span class="station-num">0${i+1}</span><span class="station-label">${s.title}</span>${s.pc?'<span class="pc-badge">P.C. ⊙</span>':'<span aria-hidden="true">↗</span>'}</button>`).join('');
function setStage(index){
 const s=SYNAP.stages[index];
 $$('.station').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
 const panel=$('#route-detail'); panel.setAttribute('aria-labelledby',`stage-${index}`);
 panel.innerHTML=`<span class="step-counter" aria-hidden="true">0${index+1}</span><span class="small-tag">${s.label}</span><h3>${s.title}.</h3><p class="route-desc">${s.description}</p><div class="route-fact"><strong>¿Quién participa?</strong><p>${s.responsible}</p></div><div class="route-fact"><strong>${index===1?'Qué se revisa':'Qué queda como soporte'}</strong><p>${s.evidence}</p></div><div class="route-foot"><span>${s.tip}</span><button id="next-stage" aria-label="${index===5?'Volver a la primera etapa':'Explorar la siguiente etapa'}">${index===5?'↺':'→'}</button></div>`;
 $('#next-stage').addEventListener('click',()=>{setStage((index+1)%6);$('#next-stage').focus({preventScroll:true});});
}
$$('.station').forEach(b=>b.addEventListener('click',()=>setStage(Number(b.dataset.stage))));
setupTabKeys($('#route-stations'),'.station',setStage,true);setStage(0);
$('#type-tabs').innerHTML=SYNAP.types.map((t,i)=>`<button class="type-tab" role="tab" id="type-${i}" aria-controls="type-content" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-type="${i}"><span>${t.code==='SIGE'?'＋':t.code}</span>${t.name}</button>`).join('');
function setType(index){const t=SYNAP.types[index];$$('.type-tab').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});$('#type-content').setAttribute('aria-labelledby',`type-${index}`);$('#type-content').innerHTML=`<span class="type-big" aria-hidden="true">${t.code==='SIGE'?'＋':t.code}</span><span class="small-tag">${t.code==='SIGE'?'OTRAS FORMAS DE ORGANIZAR EL CONOCIMIENTO':`TIPO DOCUMENTAL / ${t.code}`}</span><h3>${t.name}.</h3><p>${t.desc}</p><div class="example"><span>EJEMPLO PARA ENTENDERLO</span><p>${t.example}</p></div><div class="type-minimum"><strong>Qué debe tener:</strong> ${t.minimum}</div>`;}
$$('.type-tab').forEach(b=>b.addEventListener('click',()=>setType(Number(b.dataset.type))));setupTabKeys($('#type-tabs'),'.type-tab',setType);setType(0);
const versionStates=[
 '<div class="version-card"><b>V4</b><div><strong>Aprobada y publicada</strong><small>Esta es la versión que debes consultar.</small></div><span class="status good">Vigente</span></div><p>La consulta en el aplicativo te permite trabajar con la información vigente.</p>',
 '<div class="version-card"><b>V4</b><div><strong>Sigue siendo la vigente</strong><small>Continúa disponible para uso.</small></div></div><div class="version-card pending"><b>V5</b><div><strong>En revisión</strong><small>Aún no sustituye a la versión publicada.</small></div></div><p>Nuevo no significa aprobado: sigue usando la V4.</p>',
 '<div class="version-card"><b>V5</b><div><strong>Aprobada y publicada</strong><small>Ahora es la versión para trabajar.</small></div></div><div class="version-card archived"><b>V4</b><div><strong>Obsoleta</strong><small>Referencia histórica, no para ejecutar actividades.</small></div></div><p>El Listado Maestro se actualiza y el cambio se comunica con F5 Actualízate.</p>'
];
function setVersion(index){$$('[data-version]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.version)===index)));$('#version-scene').innerHTML=versionStates[index];}
$$('[data-version]').forEach(b=>b.addEventListener('click',()=>setVersion(Number(b.dataset.version))));setVersion(0);
function setCode(index){$$('[data-code]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.code)===index)));$('#code-explanation').innerHTML=`<h3>${SYNAP.code[index].title}</h3><p>${SYNAP.code[index].desc}</p>`;}
$$('[data-code]').forEach(b=>b.addEventListener('click',()=>setCode(Number(b.dataset.code))));setCode(0);
$('#acronyms').innerHTML=[['Procesos',SYNAP.processes],['Subprocesos',SYNAP.subprocesses]].map(([title,items])=>`<div><h3>${title}</h3><dl>${items.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></div>`).join('');

// Games run only in memory: no registration, personal data or external requests.
const dialog=$('#game-dialog'); const gameContent=$('#game-content');
let game='cases',question=0,score=0,answered=false,order=[],pool=[],gameTrigger=null;
function shuffled(items){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function startGame(kind){game=kind;question=0;score=0;answered=false;order=[];pool=shuffled([0,1,2,3,4,5]);if(pool.every((v,i)=>v===i))pool.reverse();renderGame();}
$$('[data-game]').forEach(button=>button.addEventListener('click',()=>{gameTrigger=button;startGame(button.dataset.game);dialog.showModal();document.body.classList.add('modal-open');$('#close-game').focus();}));
$('#close-game').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');$('#confetti').replaceChildren();if(gameTrigger)gameTrigger.focus({preventScroll:true});});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
function progress(total){return `<div class="game-progress" aria-label="Tarjeta ${question+1} de ${total}">${Array.from({length:total},(_,i)=>`<i class="${i<question?'done':''}"></i>`).join('')}</div>`;}
function renderGame(){
 answered=false;
 if(game==='order'){renderOrder();return;}
 const isCase=game==='cases',list=isCase?SYNAP.cases:SYNAP.classifications,q=list[question];
 gameContent.innerHTML=`<h2 id="game-title">${isCase?'Detective de versiones':'¿Guía o evidencia?'}</h2>${!isCase?'<p>Todos son documentos en sentido amplio. Clasifica según su propósito: orientar o dejar evidencia.</p>':''}${progress(list.length)}<span class="question-number">${isCase?'CASO':'TARJETA'} ${question+1} / ${list.length}</span>${isCase?`<p class="question-text">${q.question}</p>`:`<div class="sort-card">${q.text}</div>`}<div class="game-options ${isCase?'':'sort-options'}">${(isCase?q.answers:['Orienta / prepara','Evidencia / registro']).map((a,i)=>`<button data-answer="${i}">${a}</button>`).join('')}</div><div id="game-feedback" aria-live="polite"></div>`;
 $$('[data-answer]',gameContent).forEach(b=>b.addEventListener('click',()=>{
  if(answered)return;answered=true;const choice=Number(b.dataset.answer),ok=choice===q.correct;if(ok)score++;
  $$('[data-answer]',gameContent).forEach(answer=>{answer.disabled=true;if(Number(answer.dataset.answer)===q.correct)answer.classList.add('correct');else if(answer===b)answer.classList.add('incorrect');});
  $('#game-feedback').innerHTML=`<div class="feedback ${ok?'':'wrong'}"><strong>${ok?'¡Conexión correcta!':'Una pista para la próxima.'}</strong><p>${q.explain}</p></div><button class="button lime game-next" id="next-question">${question===list.length-1?'Ver mi resultado':'Siguiente '+(isCase?'caso':'tarjeta')} <span>→</span></button>`;
  $('#next-question').addEventListener('click',()=>{question++;if(question>=list.length)showResult(list.length);else renderGame();focusGameHeading();});
 }));
}
function focusGameHeading(){const heading=$('#game-title');heading.tabIndex=-1;heading.focus({preventScroll:true});dialog.scrollTop=0;}
function renderOrder(){
 gameContent.innerHTML=`<h2 id="game-title">Conecta la ruta</h2><p>Toca las etapas en el orden correcto. Puedes quitar una con × y volver a elegirla. No necesitas arrastrar.</p><div class="order-pool">${pool.map(i=>`<button data-pick="${i}" ${order.includes(i)?'disabled':''}>${SYNAP.stages[i].title}</button>`).join('')}</div><p class="question-number" style="margin-top:25px">TU RUTA · ${order.length} / 6</p>${order.length?`<ol class="order-selected">${order.map((n,i)=>`<li><span>0${i+1}</span>${SYNAP.stages[n].title}<button data-remove="${i}" aria-label="Quitar ${SYNAP.stages[n].title}">×</button></li>`).join('')}</ol>`:'<div class="order-empty">Tu primera conexión empieza aquí.</div>'}<div class="order-controls" style="margin-top:22px"><button class="button lime" id="check-order" ${order.length<6?'disabled':''}>Comprobar ruta <span>→</span></button><button class="button secondary" id="reset-order">Empezar de nuevo</button></div><div id="game-feedback" aria-live="polite"></div>`;
 $$('[data-pick]').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.pick);if(order.includes(n)||order.length>=6)return;order.push(n);renderOrder();const target=$('[data-pick]:not(:disabled)')||$('#check-order');target.focus({preventScroll:true});}));
 $$('[data-remove]').forEach(b=>b.addEventListener('click',()=>{const removed=order.splice(Number(b.dataset.remove),1)[0];renderOrder();$(`[data-pick="${removed}"]`).focus({preventScroll:true});}));
 $('#reset-order').addEventListener('click',()=>{order=[];renderOrder();$('[data-pick]').focus({preventScroll:true});});
 $('#check-order').addEventListener('click',()=>{
  score=order.filter((v,i)=>v===i).length;
  if(score===6){showResult(6);focusGameHeading();return;}
  $('#game-feedback').innerHTML=`<div class="feedback wrong"><strong>${score} de 6 etapas están en su lugar.</strong><p>Recuerda: primero surge la necesidad, luego se analiza. La publicación va antes de la socialización y el seguimiento cierra el recorrido.</p><details style="margin-top:15px"><summary>Ver la ruta explicada <span>+</span></summary><ol class="answer-route">${SYNAP.stages.map(s=>`<li>${s.title}</li>`).join('')}</ol></details></div>`;
 });
}
function showResult(total){
 const perfect=score===total;gameContent.innerHTML=`<div class="game-result"><div class="score-ring"><strong>${score}/${total}</strong><small>${game==='order'?'CONEXIONES':'ACIERTOS'}</small></div><h2 id="game-title">${perfect?'¡Todo conectado!':'Cada intento conecta más.'}</h2><p>${perfect?'Ya reconoces las conexiones clave. Lleva esa idea al día a día: consulta lo vigente y comparte los cambios.':'Lo valioso es entender el porqué. Puedes repetir el reto o volver a explorar la ruta para reforzar lo aprendido.'}</p><div class="result-actions"><button class="button lime" id="replay">Volver a jugar <span>↺</span></button><button class="button secondary" id="back-explore">Seguir explorando</button></div><p class="fineprint" style="margin-top:22px">Resultado de práctica, sin registro ni certificación.</p></div>`;
 $('#replay').addEventListener('click',()=>{startGame(game);focusGameHeading();});$('#back-explore').addEventListener('click',()=>dialog.close());
 if(perfect&&!motionPaused){const wrap=document.createElement('div');wrap.className='celebration';wrap.setAttribute('aria-hidden','true');for(let i=0;i<35;i++){const p=document.createElement('i');p.style.cssText=`position:fixed;pointer-events:none;top:-25px;left:${Math.random()*100}%;width:7px;height:13px;background:${['#d8ff71','#8aaeff','#ff8d8b'][i%3]};--drift:${Math.random()*160-80}px;animation:confetti ${1.3+Math.random()}s ease-in ${Math.random()*.3}s forwards;`;wrap.append(p);}dialog.append(wrap);setTimeout(()=>wrap.remove(),3000);}
}

// Project a mathematical torus and orbit lines from 3D into the canvas.
// Entirely local, resolution-aware, and paused off screen or in another tab.
const canvas=$('#universe-canvas'),ctx=canvas.getContext('2d');
let cw=0,ch=0,dpr=1,visible=true,last=0,time=0,mouseX=0,mouseY=0,aimX=0,aimY=0;
function resizeCanvas(){const bounds=canvas.getBoundingClientRect();cw=bounds.width;ch=bounds.height;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(cw*dpr);canvas.height=Math.round(ch*dpr);if(ctx){ctx.setTransform(dpr,0,0,dpr,0,0);drawUniverse();}}
function project(x,y,z,ax,ay,az){let yy=y*Math.cos(ax)-z*Math.sin(ax),zz=y*Math.sin(ax)+z*Math.cos(ax);let xx=x*Math.cos(ay)+zz*Math.sin(ay);zz=-x*Math.sin(ay)+zz*Math.cos(ay);const nx=xx*Math.cos(az)-yy*Math.sin(az),ny=xx*Math.sin(az)+yy*Math.cos(az);const perspective=700/(700+zz);return [cw/2+nx*perspective,ch/2+ny*perspective,zz,perspective];}
function drawUniverse(){
 if(!ctx||!cw||!ch)return;
 ctx.clearRect(0,0,cw,ch);
 const radius=Math.min(cw*.36,ch*.34),tube=radius*.24;
 const glow=ctx.createRadialGradient(cw*.53,ch*.5,20,cw*.53,ch*.5,radius*1.6);glow.addColorStop(0,'rgba(19,44,84,.02)');glow.addColorStop(.6,'rgba(54,101,210,.07)');glow.addColorStop(1,'rgba(8,16,30,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,cw,ch);
 for(let i=0;i<60;i++){const x=((Math.sin(i*93.31)*.5+.5)*cw),y=((Math.cos(i*73.13)*.5+.5)*ch);ctx.fillStyle=`rgba(166,197,242,${.13+((i%4)/16)})`;ctx.beginPath();ctx.arc(x,y,i%9===0?1.4:.65,0,Math.PI*2);ctx.fill();}
 const ax=.57+mouseY*.25,ay=.23+mouseX*.22,az=-.43+Math.sin(time*.14)*.08;
 // Fine longitudinal threads create the dimensional ring.
 for(let j=0;j<18;j++){
  const v=j/18*Math.PI*2;ctx.beginPath();
  for(let i=0;i<=150;i++){const u=i/150*Math.PI*2;const r=radius+tube*Math.cos(v+u*2+time*.18);const p=project(r*Math.cos(u),r*Math.sin(u),tube*Math.sin(v+u*2+time*.18),ax,ay,az);if(i===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}
  ctx.strokeStyle=j%3===0?'rgba(174,218,121,.32)':'rgba(103,151,236,.23)';ctx.lineWidth=.65;ctx.stroke();
 }
 for(let i=0;i<85;i++){
  const u=i/85*Math.PI*2;ctx.beginPath();for(let j=0;j<=20;j++){const v=j/20*Math.PI*2;const r=radius+tube*Math.cos(v+u*2+time*.18);const p=project(r*Math.cos(u),r*Math.sin(u),tube*Math.sin(v+u*2+time*.18),ax,ay,az);if(!j)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}ctx.strokeStyle='rgba(129,177,224,.17)';ctx.lineWidth=.6;ctx.stroke();
 }
 for(let orbit=0;orbit<2;orbit++){
  ctx.beginPath();for(let i=0;i<=180;i++){const u=i/180*Math.PI*2;const p=project(radius*1.44*Math.cos(u),radius*1.44*Math.sin(u),0,1.02+orbit*.3,.35,-.7+orbit*1.65);if(!i)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}ctx.strokeStyle=orbit?'rgba(137,172,241,.23)':'rgba(202,238,148,.3)';ctx.lineWidth=.8;ctx.stroke();
  for(let n=0;n<3;n++){const u=time*(orbit?-.2:.17)+n*2.1;const p=project(radius*1.44*Math.cos(u),radius*1.44*Math.sin(u),0,1.02+orbit*.3,.35,-.7+orbit*1.65);ctx.shadowBlur=15;ctx.shadowColor=orbit?'#8aaeff':'#d8ff71';ctx.fillStyle=orbit?'#9dbbff':'#d8ff71';ctx.beginPath();ctx.arc(p[0],p[1],2.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
 }
 for(let i=0;i<18;i++){const u=i/18*Math.PI*2+time*.035,v=i*1.67;const r=radius+tube*Math.cos(v+u*2+time*.18);const p=project(r*Math.cos(u),r*Math.sin(u),tube*Math.sin(v+u*2+time*.18),ax,ay,az);ctx.fillStyle=i%4===0?'#d8ff71':'#8cbaee';ctx.beginPath();ctx.arc(p[0],p[1],1.2,0,Math.PI*2);ctx.fill();}
}
function canvasLoop(timestamp){animationFrame=0;if(motionPaused||!visible||document.hidden)return;if(timestamp-last>32){time+=.032;mouseX+=(aimX-mouseX)*.04;mouseY+=(aimY-mouseY)*.04;drawUniverse();last=timestamp;}animationFrame=requestAnimationFrame(canvasLoop);}
function startCanvas(){cancelAnimationFrame(animationFrame);animationFrame=0;if(motionPaused){drawUniverse();return;}if(visible&&!document.hidden)animationFrame=requestAnimationFrame(canvasLoop);}
$('#universe').addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();aimX=(e.clientX-r.left)/r.width-.5;aimY=(e.clientY-r.top)/r.height-.5;});
$('#universe').addEventListener('pointerleave',()=>{aimX=0;aimY=0;});
new ResizeObserver(resizeCanvas).observe(canvas);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;startCanvas();},{threshold:0}).observe(canvas);
document.addEventListener('visibilitychange',startCanvas);
resizeCanvas();startCanvas();
})();
