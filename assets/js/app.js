(function(){
 'use strict';
 const $=s=>document.querySelector(s);
 const storage={read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}},write(key,v){try{localStorage.setItem(key,JSON.stringify(v));return true;}catch{return false;}}};
 Course.storage=storage;
 Course.progress=()=>storage.read('stat2331-progress-v1',{});
 Course.escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 Course.renderMath=(el=document.body)=>{if(window.Mathify&&window.katex)Mathify.scan(el);el.querySelectorAll('.math:not([data-rendered])').forEach(node=>{if(window.katex){try{katex.render(node.textContent,node,{throwOnError:true,displayMode:node.classList.contains('display')||node.parentElement.classList.contains('formula')});node.dataset.rendered='true';}catch(e){node.classList.add('math-error');console.error(e);}}});};
 const savedTheme=storage.read('stat2331-theme',null),theme=savedTheme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;
 $('#theme-toggle')?.addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;storage.write('stat2331-theme',t);$('#theme-toggle').setAttribute('aria-pressed',String(t==='dark'));$('#theme-toggle').textContent=t==='dark'?'☀ Light':'◐ Dark';});
 if($('#theme-toggle')){$('#theme-toggle').setAttribute('aria-pressed',String(theme==='dark'));$('#theme-toggle').textContent=theme==='dark'?'☀ Light':'◐ Dark';}
 $('#menu-toggle')?.addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));});
 function progress(){const p=Course.progress();let total=0;for(let m=1;m<=8;m++){const skills=Course.questions[m]||[],done=skills.filter(s=>p[s.id]?.mastered).length;total+=done;document.querySelectorAll(`[data-progress="${m}"]`).forEach(el=>{el.textContent=`${done} / ${skills.length} skills`;});document.querySelectorAll(`[data-bar="${m}"]`).forEach(el=>el.style.width=`${done/skills.length*100}%`);}
  if($('#mastery-total'))$('#mastery-total').textContent=`${total} of 64 skills mastered`;
  if($('#mastery-percent'))$('#mastery-percent').textContent=`${Math.round(total/64*100)}%`;
  const last=storage.read('stat2331-last-module',1);if($('#resume')){$('#resume').href=`module-${last}.html#practice`;$('#resume').textContent=`${total?'Continue':'Start'} module ${last} →`;}
 }
 Course.refreshProgress=progress;progress();
 document.querySelectorAll('[data-module]').forEach(el=>{if(el.tagName==='MAIN')storage.write('stat2331-last-module',Number(el.dataset.module));});
 $('#export-progress')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({version:1,progress:Course.progress()},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='stat2331-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
 $('#import-progress')?.addEventListener('change',async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(data.version!==1||!data.progress||typeof data.progress!=='object')throw Error('Not a progress file.');const clean={};Object.values(Course.questions).flat().forEach(s=>{const v=data.progress[s.id];if(v)clean[s.id]={streak:Math.min(3,Math.max(0,Number(v.streak)||0)),mastered:v.mastered===true,attempts:Math.max(0,Number(v.attempts)||0)};});storage.write('stat2331-progress-v1',clean);progress();$('#progress-message').textContent='Progress imported.';}catch{$('#progress-message').textContent='Could not read this progress file.'}});
 $('#reset-progress')?.addEventListener('click',()=>{if(confirm('Reset all saved mastery on this browser?')){storage.write('stat2331-progress-v1',{});progress();$('#progress-message').textContent='Saved mastery reset.';}});
 if(!storage.write('stat2331-storage-check',true)){document.querySelectorAll('.save-note').forEach(el=>el.textContent='Browser storage is unavailable. This session works, but mastery will not persist.');}
 Course.renderMath();window.addEventListener('load',()=>Course.renderMath());
})();
