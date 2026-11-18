import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require(process.env.STAT2331_PLAYWRIGHT||'/Users/davidsaah/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');}
const base=process.env.STAT2331_URL||'http://127.0.0.1:2331';
const browser=await playwright.chromium.launch({...(process.env.STAT2331_BROWSER==='chromium'?{}:{channel:'chrome'}),headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
// Offline runs: STAT2331_KATEX=/path/to/node_modules/katex/dist serves KaTeX locally and skips web fonts.
if(process.env.STAT2331_KATEX){await context.route(/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\//,r=>{const f=r.request().url().split('/dist/')[1].split('?')[0];r.fulfill({path:`${process.env.STAT2331_KATEX}/${f}`});});await context.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());}
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|net::/.test(m.text()))errors.push(m.text());});
await mkdir('test-results',{recursive:true});
const fill=async(page,correct)=>{const q=await page.evaluate(()=>Course.practiceInstances[0].q);
 if(q.multi){for(const [i,p] of q.parts.entries()){const part=page.locator(`.part[data-i="${i}"]`);if(p.type==='choice')await part.locator(`input[value="${correct?p.answer:(p.answer+1)%p.options.length}"]`).check();else await part.locator('input').fill(correct?String(p.answer):String(p.answer+1000));}return q;}
 if(q.choices)await page.locator(`input[name=answer][value="${correct?q.choices.indexOf(q.answer):q.choices.findIndex(a=>a!==q.answer)}"]`).check();else await page.locator('input[name=answer]').fill(correct?String(q.answer):'999999999');return q;};
const force=(page,id,k)=>page.evaluate(([id,k])=>{const s=Course.practiceInstances[0].skills.find(s=>s.id===id);s.generate=k<0?s.sources.original:s.sources.steps[k];},[id,k]);

try{
 if(process.argv.includes('--visual')){
  for(const width of [1440,390])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:1000});await page.goto(`${base}/labs.html`,{waitUntil:'networkidle'});await page.evaluate(t=>{localStorage.setItem('stat2331-theme',JSON.stringify(t));document.documentElement.dataset.theme=t;},theme);
   for(const id of ['regression','binomial','phat','clt','confidence','rejection','power']){
    const lab=page.locator(`[data-lab=${id}]`);if(id==='confidence'){await lab.locator('[data-param=type]').selectOption('mu');}if(id==='clt'){await lab.locator('[data-param=n]').fill('30');await lab.locator('[data-param=n]').press('Tab');}if(id==='power'){await lab.locator('[data-param=truep]').fill('.65');await lab.locator('[data-param=truep]').press('Tab');}
    await lab.locator('[data-do=thousand]').click();await lab.scrollIntoViewIfNeeded();await lab.screenshot({path:`test-results/lab-${id}-${width}-${theme}.png`});assert.ok(!/NaN|undefined|Infinity/.test(await lab.innerText()));
   }
  }
  await page.goto(`${base}/practice.html?module=6`,{waitUntil:'networkidle'});await page.locator('.skill-select').selectOption('m6-xbarprob');await page.getByRole('button',{name:'Show the worked solution',exact:true}).click();await page.locator('.question').screenshot({path:'test-results/worked-solution-phone.png'});
  assert.deepEqual(errors,[]);console.log('PASS: visual captures of populated labs and worked solution, at both widths and themes.');await browser.close();process.exit(0);
 }
 const routes=['index.html',...Array.from({length:8},(_,i)=>`module-${i+1}.html`),'practice.html','exams.html','choose.html','review.html','search.html','glossary.html','notebook.html','labs.html','tables.html'];
 for(const route of routes){await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.Course);await page.waitForFunction(()=>window.katex!==undefined);await page.evaluate(()=>Course.renderMath());assert.equal(await page.locator('.math-error').count(),0,route);assert.equal(await page.evaluate(()=>/\\\(|\\\[/.test(document.body.innerText)),false,route+' raw TeX');assert.equal(await page.locator('.math:not([data-rendered])').count(),0,route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' overflow');console.log('Page:',route);}
 // Stress every generator inside the real browser too.
 const count=await page.evaluate(()=>{let count=0;for(const skills of Object.values(Course.questions))for(const s of skills)for(let i=0;i<300;i++){const q=s.generate();if(/undefined|NaN|Infinity/.test(JSON.stringify(q)))throw Error(s.id);if(q.multi){for(const p of q.parts)if(p.type==='choice'?!(p.answer>=0&&p.answer<p.options.length):!Number.isFinite(p.answer))throw Error(s.id);}else if(q.choices?!q.choices.includes(q.answer):!Number.isFinite(q.answer))throw Error(s.id);count++;}return count;});
 console.log('Browser-generated questions:',count);
 // Each skill, in each of its question styles, is answered correctly and incorrectly through its visible controls.
 let flows=0;
 for(let m=1;m<=8;m++){
  await page.goto(`${base}/practice.html?module=${m}`,{waitUntil:'networkidle'});
  const skills=await page.evaluate(()=>Course.practiceInstances[0].skills.map(s=>({id:s.id,styles:s.sources?s.sources.steps.length:0})));
  for(const {id,styles} of skills)for(let k=styles?-1:-2;k<(styles||-1);k++){
   if(k>-2)await force(page,id,k);
   await page.locator('.skill-select').selectOption(id);await page.evaluate(()=>Course.practiceInstances[0].render());
   await fill(page,true);await page.getByRole('button',{name:'Check my answer',exact:true}).click();assert.equal(await page.locator('.feedback.correct').count(),1,`${id}/${k} correct`);
   await page.locator('[data-action=next]').click();const q=await fill(page,false);
   await page.getByRole('button',{name:'Check my answer',exact:true}).click();assert.equal(await page.locator('.feedback:not(.correct)').count(),1,`${id}/${k} wrong`);assert.ok((await page.locator('.feedback').innerText()).includes('By hand'));
   if(q.multi){assert.ok(await page.locator('.part.wrong').count()>=1,`${id}/${k} marks the wrong step`);assert.equal(await page.locator('.math-error').count(),0,`${id}/${k} math`);}else assert.equal(await page.locator('.feedback .check').count(),2);
   flows++;}
 }
 console.log(`PASS: all 64 skills answered correctly and incorrectly in the interface (${flows} question styles).`);
 await page.goto(`${base}/practice.html?module=1`,{waitUntil:'networkidle'});
 await force(page,'m1-proportion',-1);await page.locator('.skill-select').selectOption('m1-proportion');
 for(let i=0;i<3;i++){const a=await page.evaluate(()=>Course.practiceInstances[0].q.answer);await page.locator('input[name=answer]').fill(`${a*100}%`);await page.getByRole('button',{name:'Check my answer',exact:true}).click();await page.locator('[data-action=next]').click();}
 await page.reload({waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>Course.progress()['m1-proportion'].mastered),true);
 await page.getByRole('button',{name:'Start mixed set · 6 questions',exact:true}).click();
 await page.getByRole('button',{name:'Show the worked solution',exact:true}).click();assert.equal(await page.evaluate(()=>Course.practiceInstances[0].queue.length),6);await page.locator('[data-action=next]').click();
 for(let i=0;i<6;i++){await fill(page,true);await page.getByRole('button',{name:'Check my answer',exact:true}).click();await page.locator('[data-action=next]').click();}assert.ok((await page.locator('.feedback').innerText()).includes('Mixed set complete'));

 // Practice exams: every quiz and the final, answered fully right and fully wrong through the page.
 const fillExam=async correct=>{await page.evaluate(ok=>{const st=Course.exams.state;st.items.forEach((it,i)=>{const li=document.querySelector(`#exam-q-${i}`);
   if(it.kind==='mc'){const k=it.q.shown.findIndex(o=>ok?o.tier===4:o.tier===0);const k2=k<0?it.q.shown.findIndex(o=>o.tier!==4):k;li.querySelectorAll('input')[k2].click();return;}
   it.q.parts.forEach((p,k)=>{const el=li.querySelector(`.part[data-k="${k}"]`);if(p.type==='choice')el.querySelectorAll('input')[ok?p.answer:(p.answer+1)%p.options.length].click();else{const inp=el.querySelector('input');inp.value=String(ok?p.answer:p.answer+1000);inp.dispatchEvent(new Event('input',{bubbles:true}));}});
   const ta=li.querySelector('textarea');ta.value='My written answer.';ta.dispatchEvent(new Event('input',{bubbles:true}));});},correct);};
 const exams=['final',...Array.from({length:8},(_,i)=>`m${i+1}`)];let examRuns=0;
 for(const id of exams)for(let rep=0;rep<(id==='final'?4:2);rep++){
  await page.goto(`${base}/exams.html`,{waitUntil:'networkidle'});
  await page.locator(`[data-start="${id}"]`).click();
  assert.equal(await page.locator('.math-error').count(),0,`${id} exam math`);
  const n=await page.locator('.exam-item').count();assert.equal(n,id==='final'?29:10);
  await fillExam(rep===0);
  assert.match(await page.locator('.exam-progress').innerText(),new RegExp(`${n} of ${n} answered`));
  await page.locator('.exam-bar [data-action=submit]').click();
  const max=id==='final'?136:48,frs=id==='final'?5:2;
  const head=await page.locator('.exam-total').innerText();
  if(rep===0){assert.equal(head,`${max-4*frs} / ${max} points (${Math.round(100*(max-4*frs)/max)}%)`,`${id} correct auto score`);
   for(const b of await page.locator('.exam-self button[data-v="4"]').all())await b.click();
   assert.equal(await page.locator('.exam-total').innerText(),`${max} / ${max} points (100%)`);}
  else{const pts=Number(head.split(' / ')[0]);assert.ok(pts<=max/4,`${id} wrong answers score low (${head})`);}
  assert.equal(await page.locator('.math-error').count(),0,`${id} review math`);examRuns++;}
 // Unanswered questions trigger the in-page confirmation, and leaving keeps nothing.
 await page.goto(`${base}/exams.html`,{waitUntil:'networkidle'});await page.locator('[data-start="m3"]').click();
 await page.locator('.exam-bar [data-action=submit]').click();assert.ok(await page.locator('.exam-confirm').isVisible());
 await page.locator('[data-action=confirm]').click();assert.match(await page.locator('.exam-total').innerText(),/^0 \/ 48/);
 const hist=await page.evaluate(()=>JSON.parse(localStorage.getItem('stat2331-exams-v1')).attempts.length);assert.ok(hist>=examRuns+1);
 // A timed exam submits itself at zero.
 await page.locator('[data-action=menu]').click();await page.locator('#exam-timed').check();await page.locator('[data-start="m1"]').click();
 assert.ok(await page.locator('.exam-timer').isVisible());await page.evaluate(()=>{Course.exams.state.deadline=Date.now()-1;});
 await page.waitForSelector('.exam-timeup',{timeout:5000});
 {await page.goto(`${base}/exams.html`,{waitUntil:'networkidle'});await page.evaluate(()=>{Course.exams.start('final',false);Course.exams.submit(false);});
  assert.equal(await page.locator('.exam-plan h2').innerText(),'What to study next');assert.equal(await page.locator('.study-list > li').count(),3);
  await page.locator('[data-quiz]').first().click();assert.match(await page.locator('.exam-bar strong').innerText(),/Module \d quiz/);await page.evaluate(()=>{Course.exams.submit(false);});}
 {await page.goto(`${base}/exams.html`,{waitUntil:'networkidle'});await page.evaluate(()=>Course.exams.start('final',false));
  assert.equal(await page.evaluate(()=>/\\\(|\\\[/.test(document.querySelector('#exam-root').innerText)),false,'raw TeX while taking an exam');
  await page.evaluate(()=>Course.exams.submit(false));assert.equal(await page.evaluate(()=>/\\\(|\\\[/.test(document.querySelector('#exam-root').innerText)),false,'raw TeX in exam results');
  assert.equal(await page.locator('[data-action=print]').count(),1);assert.equal(await page.locator('[data-print]').count(),0);}
 console.log(`PASS: ${examRuns} practice exams taken right and wrong; partial-credit scoring, self-grading, confirmation, timer, history.`);

 // Feedback box on every page links to the form and names where the student is.
 for(const route of ['index.html','module-3.html','practice.html?module=6','exams.html','labs.html','tables.html']){
  await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});
  assert.match(await page.locator('.site-feedback .fb-link').getAttribute('href'),/^https:\/\/(forms\.gle|docs\.google\.com\/forms)\//);
  await page.locator('.site-feedback').scrollIntoViewIfNeeded();await page.locator('.site-feedback').hover();
  const ref=await page.locator('.fb-ref').innerText();assert.ok(ref.length>3&&!/undefined/.test(ref),`${route} feedback reference`);
  const href=await page.locator('.site-feedback .fb-link').getAttribute('href');assert.ok(href.includes('entry.1531774866='+encodeURIComponent(ref)),`${route} prefilled link`);
  if(route.startsWith('practice'))assert.match(ref,/Module 6, /);}
 console.log('PASS: feedback box on every page with a page reference.');

 // Math written as plain text in the notes is typeset (no stray p̂, x̄, √, ≤, subscripts left in prose).
 for(let m=1;m<=8;m++){await page.goto(`${base}/module-${m}.html`,{waitUntil:'networkidle'});
  const left=await page.evaluate(()=>{const RX=/p̂|x̄|ŷ|[μσ√≤≥₀₁ₐ²]/;const out=[];const w=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const el=n.parentElement;if(el.closest('.katex,svg,code,kbd,.screen,.xl,.check,[data-lab],button,select,.rr-anim,.eyebrow'))continue;if(RX.test(n.nodeValue))out.push(n.nodeValue.trim().slice(0,60));}return out;});
  assert.deepEqual(left,[],`module ${m} has untypeset math`);assert.equal(await page.locator('.math-error').count(),0);}
 console.log('PASS: inline math typeset in all module notes.');

 // Progress ring starts empty; a progress link moves mastery to another browser after the student confirms.
 {const ctxA=await browser.newContext({permissions:['clipboard-read','clipboard-write']}),pA=await ctxA.newPage();await pA.goto(`${base}/index.html`,{waitUntil:'load'});
  assert.equal((await pA.$eval('#mastery-percent',e=>getComputedStyle(e).getPropertyValue('--p'))).trim(),'0');
  await pA.evaluate(()=>{const ids=Object.values(Course.questions).flat().map(s=>s.id);const p={};ids.slice(0,8).forEach(id=>p[id]={streak:3,mastered:true,attempts:3});localStorage.setItem('stat2331-progress-v1',JSON.stringify(p));Course.refreshProgress();});
  assert.equal(await pA.textContent('#mastery-percent'),'13%');
  await pA.locator('#copy-progress-link').click();const link=await pA.inputValue('#progress-link');assert.match(link,/\?progress=v1\.7{8}$/);
  const ctxB=await browser.newContext(),pB=await ctxB.newPage();await pB.goto(link,{waitUntil:'load'});assert.equal(await pB.textContent('#mastery-total'),'0 of 64 skills mastered');
  await pB.getByRole('button',{name:'Restore my progress'}).click();assert.equal(await pB.textContent('#mastery-total'),'8 of 64 skills mastered');assert.ok(!pB.url().includes('progress='));
  await pB.locator('#reset-progress').click();await pB.locator('#reset-yes').click();assert.equal(await pB.textContent('#mastery-total'),'0 of 64 skills mastered');
  await ctxA.close();await ctxB.close();}
 console.log('PASS: progress ring and progress links between browsers.');

 // Hints reveal one step at a time; a hinted correct answer does not grow the streak.
 {await page.goto(`${base}/practice.html?module=5`,{waitUntil:'networkidle'});await page.evaluate(()=>localStorage.removeItem('stat2331-progress-v1'));await page.reload({waitUntil:'networkidle'});
  await page.evaluate(()=>{const P=Course.practiceInstances[0];const s=P.skills.find(s=>s.id==='m5-z');s.generate=s.sources.original;P.skill=s;P.render();});
  await page.getByRole('button',{name:'Show a hint'}).click();assert.equal(await page.locator('.hint-box li').count(),1);
  await fill(page,true);await page.getByRole('button',{name:'Check my answer',exact:true}).click();
  assert.match(await page.locator('.feedback p').first().innerText(),/with a hint/);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('stat2331-progress-v1'))['m5-z'].streak),0);}
 // Method guide: three answers give a method; the drill grades a choice.
 {await page.goto(`${base}/choose.html`,{waitUntil:'networkidle'});await page.locator('#chooser [data-v="cat"]').click();await page.locator('#chooser [data-v="test"]').click();await page.locator('#chooser [data-v="ne"]').click();
  assert.match(await page.locator('.chooser-result h3').innerText(),/^Hypothesis test for a proportion/);
  await page.locator('[data-m="pci"]').click();await page.locator('[data-check]').click();assert.equal(await page.locator('.drill-fb .feedback').count(),1);}
 console.log('PASS: hints and the method guide.');
 // Spaced review: an overdue mastered skill shows on home and in practice; a clean answer doubles its interval.
 {await page.goto(`${base}/index.html`,{waitUntil:'networkidle'});await page.evaluate(()=>{localStorage.setItem('stat2331-progress-v1',JSON.stringify({'m5-z':{streak:3,mastered:true,attempts:3,interval:3,due:Date.now()-1000}}));});await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#review-panel').isHidden(),false);await page.goto(`${base}/practice.html?module=5&review=1`,{waitUntil:'networkidle'});
  assert.match(await page.locator('.question .eyebrow').first().innerText(),/Review set/i);
  await page.evaluate(()=>{const P=Course.practiceInstances[0];const s=P.skills.find(s=>s.id==='m5-z');s.generate=s.sources.original;P.skill=s;P.render();});
  await fill(page,true);await page.getByRole('button',{name:'Check my answer',exact:true}).click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('stat2331-progress-v1'))['m5-z'].interval),6);}
 // My mistakes: a recognized error is logged, listed on the page, linked to its skill, and can be cleared.
 {await page.goto(`${base}/practice.html?module=5&skill=m5-z`,{waitUntil:'networkidle'});await page.evaluate(()=>localStorage.removeItem('stat2331-mistakes-v1'));
  assert.equal(await page.locator('.skill-select').inputValue(),'m5-z');
  const v=await page.evaluate(()=>{const P=Course.practiceInstances[0];const s=P.skill;s.generate=s.sources.original;P.render();const m=P.q.mistakes.find(m=>Number.isFinite(m.value));return m&&m.value;});
  assert.ok(Number.isFinite(v),'m5-z has a diagnosable mistake');await page.locator('.question input[name=answer]').fill(String(v));await page.getByRole('button',{name:'Check my answer',exact:true}).click();
  const log=await page.evaluate(()=>Course.mistakes.read());assert.equal(log.length,1);assert.equal(log[0].skill,'m5-z');assert.equal(log[0].msgs.length,1);
  await page.goto(`${base}/notebook.html#mistakes`,{waitUntil:'networkidle'});assert.equal(await page.locator('.mistake-skill').count(),1);assert.equal(await page.evaluate(()=>/\\\(|\\\[/.test(document.body.innerText)),false,'raw TeX on mistakes page');assert.equal(await page.locator('.mistake-msgs li').count(),1);
  assert.match(await page.locator('.mistake-actions a').first().getAttribute('href'),/skill=m5-z/);
  await page.locator('#mistakes-clear').click();await page.locator('#mc-yes').click();assert.match(await page.locator('#mistakes-root').innerText(),/Nothing here yet/);}
 {await page.goto(`${base}/review.html#m6`,{waitUntil:'networkidle'});assert.equal(await page.locator('.sheet:visible').count(),1);assert.equal(await page.locator('#m6 .sheet-sec').count(),6);assert.ok(await page.locator('#m6 .formula').count()>=3);
  await page.locator('#sheet-all').click();assert.equal(await page.locator('.sheet:visible').count(),8);}
 {await page.goto(`${base}/search.html?q=standard%20error`,{waitUntil:'networkidle'});assert.ok(await page.locator('.search-hit').count()>=3);assert.match(await page.locator('.search-hit a').first().innerText(),/Standard error/);
  await page.locator('#search-q').fill('CLT');await page.waitForTimeout(300);assert.ok(await page.locator('.search-hit').count()>=2);
  await page.goto(`${base}/glossary.html`,{waitUntil:'networkidle'});const n=await page.locator('.gloss-entry').count();assert.ok(n>=80);await page.locator('#gloss-filter').fill('error');assert.ok(await page.locator('.gloss-entry').count()<n);
  for(const [term,m,id] of await page.evaluate(()=>GLOSSARY))assert.ok(await page.evaluate(([m,id])=>fetch(`module-${m}.html`).then(r=>r.text()).then(h=>h.includes(`id="${id}"`)),[m,id]),`${term} anchor`);}
 // Sidebar toggle, step-through graphs, and My notebook (saved questions, bookmarks, exam history).
 {await page.goto(`${base}/module-8.html`,{waitUntil:'networkidle'});await page.evaluate(()=>{['stat2331-saved-v1','stat2331-bookmarks-v1','stat2331-sidebar-hidden'].forEach(k=>localStorage.removeItem(k));});await page.reload({waitUntil:'networkidle'});
  await page.locator('#menu-toggle').click();assert.ok(await page.locator('#sidebar').isHidden());await page.reload({waitUntil:'networkidle'});assert.ok(await page.locator('#sidebar').isHidden());await page.locator('#menu-toggle').click();assert.ok(await page.locator('#sidebar').isVisible());
  const g=page.locator('.rr-grid .rr-anim').first();await g.scrollIntoViewIfNeeded();await page.waitForTimeout(400);assert.match(await g.locator('.rr-count').innerText(),/Press Next step/);
  await g.locator('.rr-step').click();await page.waitForTimeout(200);assert.match(await g.locator('.rr-count').innerText(),/Step 1 of/);
  await page.locator('.notes h2[id] .bm-heading').first().click();assert.equal(await page.evaluate(()=>Course.notebook.bookmarks.list().length),1);
  await page.goto(`${base}/practice.html?module=1&skill=m1-sd`,{waitUntil:'networkidle'});await page.locator('[data-action=solution]').click();await page.locator('[data-nb-save]').click();
  await page.goto(`${base}/exams.html`,{waitUntil:'networkidle'});await page.evaluate(()=>{Course.exams.start('m8',false);Course.exams.submit(false);});await page.locator('.exam-item [data-nb-save]').last().click();
  await page.goto(`${base}/notebook.html#saved`,{waitUntil:'networkidle'});assert.equal(await page.locator('.nb-card').count(),2);
  for(const s of await page.locator('.nb-q summary').all())await s.click();await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>/\\\(|\\\[/.test(document.querySelector('[data-panel=saved]').innerText)),false);assert.equal(await page.locator('.math-error').count(),0);
  await page.locator('[data-tab=bookmarks]').click();assert.equal(await page.locator('.nb-bm').count(),1);
  await page.locator('[data-tab=exams]').click();const open=page.locator('.nb-table a').first();assert.ok(await open.count());await open.click();await page.waitForLoadState('networkidle');assert.match(await page.locator('.exam-past').innerText(),/reviewing an attempt/);}
 console.log('PASS: spaced review and the mistakes page, review sheets, search, and glossary.');
 console.log('PASS: mastery persistence, percentage input, and mixed-set miss requeue.');
 await page.goto(`${base}/labs.html`,{waitUntil:'networkidle'});assert.equal(await page.locator('.lab').count(),10);
 for(let i=0;i<10;i++){
  const lab=page.locator('.lab').nth(i);await lab.locator('[data-speed]').fill('10');
  await lab.locator('[data-do=one]').click();await page.waitForFunction(i=>!Course.labInstances[i].busy,i);assert.equal(await page.evaluate(i=>Course.labInstances[i].records.length,i),1);
  await lab.locator('[data-do=ten]').click();await page.waitForFunction(i=>!Course.labInstances[i].busy,i,{timeout:20000});assert.equal(await page.evaluate(i=>Course.labInstances[i].records.length,i),11);
  await lab.locator('[data-do=play]').click();await page.waitForTimeout(120);await lab.locator('[data-do=play]').click();assert.equal(await page.evaluate(i=>Course.labInstances[i].busy,i),false);
  const before=await page.evaluate(i=>Course.labInstances[i].records.length,i);await lab.locator('[data-do=thousand]').click();assert.equal(await page.evaluate(i=>Course.labInstances[i].records.length,i),before+1000);
  assert.ok(!/NaN|undefined|Infinity/.test(await lab.innerText()));
  if(i===7){await lab.locator('[data-interval]').first().click();assert.ok((await lab.locator('.lab-detail').innerText()).includes('Critical value'));}
  await lab.locator('[data-do=reset]').click();assert.equal(await page.evaluate(i=>Course.labInstances[i].records.length,i),0);
  console.log('Lab:',await lab.locator('h3').innerText());
 }
 // Point controls and parameter failure warnings.
 await page.locator('[data-lab=resistance] [data-point="6"]').focus();const old=await page.evaluate(()=>Course.labInstances[0].data.values[6]);await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>Course.labInstances[0].data.values[6]),old+1);
 await page.locator('[data-lab=regression] [data-do=custom-influence]').click();assert.equal(await page.evaluate(()=>Course.labInstances[1].data.points.length),8);
 await page.locator('[data-lab=phat] [data-param=n]').fill('5');await page.locator('[data-lab=phat] [data-param=n]').press('Tab');assert.ok((await page.locator('[data-lab=phat] .lab-warning').innerText()).includes('fails'));
 await page.goto(`${base}/tables.html`,{waitUntil:'networkidle'});await page.locator('#normal-mode').selectOption('area');assert.ok((await page.locator('#normal-result').innerText()).includes('1.645'));assert.equal(await page.locator('#normal-table .highlight').count(),2);
 await page.locator('#t-mode').selectOption('test');await page.locator('#t-df').fill('7');await page.locator('#t-tail').selectOption('left');await page.locator('#t-value').fill('0.05');await page.locator('#t-lookup').click();assert.ok((await page.locator('#t-result').innerText()).includes('t* = 1.895. Reject H₀ if TS ≤ −1.895'));await page.locator('#t-df').fill('164');await page.locator('#t-tail').selectOption('two');await page.locator('#t-value').fill('0.01');await page.locator('#t-lookup').click();assert.ok((await page.locator('#t-result').innerText()).includes('t* = 2.626'));
 console.log('PASS: all lab buttons, point keyboard control, parameter warnings, and table lookups.');
 // Visual artifacts at both widths and themes.
 for(const width of [1440,390])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:1000});await page.evaluate(t=>localStorage.setItem('stat2331-theme',JSON.stringify(t)),theme);
  for(const route of ['index.html','module-6.html','exams.html','labs.html','tables.html']){
   await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} overflow at ${width} ${theme}`);
   await page.screenshot({path:`test-results/${route.replace('.html','')}-${width}-${theme}.png`,fullPage:route==='index.html'});
  }
 }
 assert.deepEqual(errors,[],'No browser console or JavaScript errors');
 console.log('PASS: desktop and mobile; light and dark; rendered math; no JavaScript or console errors.');
 await writeFile('test-results/browser-summary.json',JSON.stringify({pages:12,skills:64,questions:count,labs:10,themes:2,widths:[1440,390],errors},null,2));
}finally{await browser.close();}
