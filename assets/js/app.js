(function(){
 'use strict';
 const $=s=>document.querySelector(s);
 const storage={read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}},write(key,v){try{localStorage.setItem(key,JSON.stringify(v));return true;}catch{return false;}}};
 Course.storage=storage;
 Course.progress=()=>storage.read('stat2331-progress-v1',{});
 Course.tex=Course.tex||(s=>s==null?s:String(s).replace(/\\\[([\s\S]*?)\\\]/g,(m,x)=>`<span class="math display">${x}</span>`).replace(/\\\(([\s\S]*?)\\\)/g,(m,x)=>`<span class="math">${x}</span>`));
 Course.mistakes={key:'stat2331-mistakes-v1',read(){return storage.read(this.key,[]);},log(e){const all=this.read();all.push(Object.assign({at:Date.now()},e));storage.write(this.key,all.slice(-300));},clear(){storage.write(this.key,[]);}};
 Course.review={DAY:864e5,isDue:v=>!!(v&&v.mastered&&v.due&&v.due<=Date.now())};
 {const p=storage.read('stat2331-progress-v1',{});let ch=false;for(const v of Object.values(p))if(v&&v.mastered&&!v.due){v.interval=3;v.due=Date.now()+3*864e5;ch=true;}if(ch)storage.write('stat2331-progress-v1',p);}
 Course.escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 Course.renderMath=(el=document.body)=>{if(window.Mathify&&window.katex)Mathify.scan(el);el.querySelectorAll('.math:not([data-rendered])').forEach(node=>{if(window.katex){try{katex.render(node.textContent,node,{throwOnError:true,displayMode:node.classList.contains('display')||node.parentElement.classList.contains('formula')});node.dataset.rendered='true';}catch(e){node.classList.add('math-error');console.error(e);}}});};
 const savedTheme=storage.read('stat2331-theme',null),theme=savedTheme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;
 $('#theme-toggle')?.addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;storage.write('stat2331-theme',t);$('#theme-toggle').setAttribute('aria-pressed',String(t==='dark'));$('#theme-toggle').textContent=t==='dark'?'☀ Light':'◐ Dark';});
 if($('#theme-toggle')){$('#theme-toggle').setAttribute('aria-pressed',String(theme==='dark'));$('#theme-toggle').textContent=theme==='dark'?'☀ Light':'◐ Dark';}
 $('#menu-toggle')?.addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));});
 function progress(){const p=Course.progress();let total=0;for(let m=1;m<=8;m++){const skills=Course.questions[m]||[],done=skills.filter(s=>p[s.id]?.mastered).length;total+=done;document.querySelectorAll(`[data-progress="${m}"]`).forEach(el=>{el.textContent=`${done} / ${skills.length} skills`;});document.querySelectorAll(`[data-bar="${m}"]`).forEach(el=>el.style.width=`${done/skills.length*100}%`);}
  if($('#mastery-total'))$('#mastery-total').textContent=`${total} of 64 skills mastered`;
  if($('#mastery-percent')){const pct=Math.round(total/64*100);$('#mastery-percent').textContent=`${pct}%`;$('#mastery-percent').style.setProperty('--p',total/64*100);$('#mastery-percent').setAttribute('aria-label',`${pct}% of skills mastered`);}
  if($('#review-panel')){const due=[];for(let m=1;m<=8;m++){const list=(Course.questions[m]||[]).filter(sk=>Course.review.isDue(p[sk.id]));if(list.length)due.push([m,list]);}const n=due.reduce((a,[,l])=>a+l.length,0),rp=$('#review-panel');rp.hidden=!n;if(n)rp.innerHTML=`<div><strong>↻ ${n} mastered skill${n===1?' is':'s are'} due for a quick review</strong><p class="small muted">A short check now keeps them sharp for the exam. Each review you pass pushes the next one further out.</p></div><div class="review-links">${due.map(([m,l])=>`<a class="button" href="practice.html?module=${m}&review=1">Module ${m} · ${l.length}</a>`).join('')}</div>`;}
  const last=storage.read('stat2331-last-module',1);if($('#resume')){$('#resume').href=`module-${last}.html#practice`;$('#resume').textContent=`${total?'Continue':'Start'} module ${last} →`;}
 }
 Course.refreshProgress=progress;progress();
 document.querySelectorAll('[data-module]').forEach(el=>{if(el.tagName==='MAIN')storage.write('stat2331-last-module',Number(el.dataset.module));});
 // Moving progress between devices: a short code (one digit per skill: 2·streak + mastered) inside a link.
 const SKILLS=()=>Object.keys(Course.questions).sort((a,b)=>a-b).flatMap(m=>Course.questions[m].map(s=>s.id));
 const encode=()=>{const p=Course.progress();return 'v1.'+SKILLS().map(id=>{const v=p[id]||{};return String(Math.min(3,Math.max(0,v.streak|0))*2+(v.mastered?1:0));}).join('').replace(/0+$/,'');};
 const decode=raw=>{const m=/(?:progress=)?(v1\.[0-7]*)/.exec(String(raw||'').trim());if(!m)return null;const digits=m[1].slice(3),ids=SKILLS(),out={};ids.forEach((id,i)=>{const d=Number(digits[i]||0);if(d)out[id]={streak:d>>1,mastered:!!(d&1),attempts:0};});return out;};
 const linkFor=()=>{const u=new URL('index.html',location.href);u.search='';u.hash='';u.searchParams.set('progress',encode());return u.href;};
 const countM=p=>Object.values(p).filter(v=>v&&v.mastered).length;
 const merge=incoming=>{const p=Course.progress();for(const [id,v] of Object.entries(incoming)){const o=p[id]||{streak:0,mastered:false,attempts:0};p[id]={streak:Math.max(o.streak||0,v.streak),mastered:!!(o.mastered||v.mastered),attempts:o.attempts||0,interval:o.interval||(v.mastered?3:undefined),due:o.due||(v.mastered?Date.now()+3*864e5:undefined)};}storage.write('stat2331-progress-v1',p);progress();};
 const msg=t=>{if($('#progress-message'))$('#progress-message').textContent=t;};
 $('#copy-progress-link')?.addEventListener('click',()=>{const link=linkFor(),box=$('#progress-link-box'),inp=$('#progress-link');inp.value=link;box.hidden=false;const done=()=>msg(`Link copied. It holds ${countM(Course.progress())} mastered skill${countM(Course.progress())===1?'':'s'}. Send it to yourself, then open it on your other device.`);const fallback=()=>{inp.focus();inp.select();msg('Your link is selected below. Press Ctrl+C (or ⌘C on a Mac) to copy it.');};try{navigator.clipboard.writeText(link).then(done,fallback);}catch{fallback();}});
 $('#progress-link')?.addEventListener('focus',e=>e.target.select());
 $('#restore-form')?.addEventListener('submit',e=>{e.preventDefault();const data=decode($('#restore-input').value);if(!data){msg('That does not look like a progress link. Paste the whole link you copied, starting with https://.');return;}merge(data);msg(`Progress restored: ${countM(Course.progress())} of 64 skills mastered.`);$('#restore-input').value='';});
 // Opening a progress link: ask before changing anything.
 {const q=new URLSearchParams(location.search).get('progress');if(q){const data=decode(q);const clean=()=>{const u=new URL(location.href);u.searchParams.delete('progress');history.replaceState(null,'',u.pathname+u.search+u.hash);};
  if(data){const n=countM(data),bar=document.createElement('div');bar.className='restore-banner';bar.setAttribute('role','alertdialog');bar.setAttribute('aria-labelledby','restore-banner-msg');bar.innerHTML=`<p id="restore-banner-msg"><strong>Restore your progress?</strong> This link holds ${n} mastered skill${n===1?'':'s'}. It will be added to anything already saved in this browser.</p><div class="answer-row"><button class="primary" data-r="yes">Restore my progress</button><button data-r="no">Not now</button></div>`;
   const main=document.querySelector('main')||document.body;main.prepend(bar);bar.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.r==='yes'){merge(data);bar.innerHTML=`<p><strong>Progress restored.</strong> ${countM(Course.progress())} of 64 skills mastered in this browser.</p>`;}else bar.remove();clean();});}
  else clean();}}
 $('#reset-progress')?.addEventListener('click',()=>{const c=$('#reset-confirm');c.hidden=false;$('#reset-cancel').focus();});
 $('#reset-cancel')?.addEventListener('click',()=>{$('#reset-confirm').hidden=true;$('#reset-progress').focus();});
 $('#reset-yes')?.addEventListener('click',()=>{storage.write('stat2331-progress-v1',{});progress();$('#reset-confirm').hidden=true;msg('Saved mastery reset.');});
 if(!storage.write('stat2331-storage-check',true)){document.querySelectorAll('.save-note').forEach(el=>el.textContent='Browser storage is unavailable. This session works, but mastery will not persist.');}
 Course.renderMath();window.addEventListener('load',()=>Course.renderMath());
})();
