import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require(process.env.STAT2331_PLAYWRIGHT||'/Users/davidsaah/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');}
const base=process.env.STAT2331_URL||'http://127.0.0.1:2331';
const browser=await playwright.chromium.launch({...(process.env.STAT2331_BROWSER==='chromium'?{}:{channel:'chrome'}),headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await mkdir('test-results',{recursive:true});
try{
 const routes=['index.html',...Array.from({length:8},(_,i)=>`module-${i+1}.html`),'practice.html','labs.html','tables.html'];
 for(const route of routes){await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.Course);await page.waitForFunction(()=>window.katex!==undefined);await page.evaluate(()=>Course.renderMath());assert.equal(await page.locator('.math-error').count(),0,route);assert.equal(await page.locator('.math:not([data-rendered])').count(),0,route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' overflow');console.log('Page:',route);}
 // Stress every generator inside the real browser too.
 const count=await page.evaluate(()=>{let count=0;for(const skills of Object.values(Course.questions))for(const s of skills)for(let i=0;i<300;i++){const q=s.generate();if(/undefined|NaN|Infinity/.test(JSON.stringify(q)))throw Error(s.id);if(q.choices?!q.choices.includes(q.answer):!Number.isFinite(q.answer))throw Error(s.id);count++;}return count;});
 console.log('Browser-generated questions:',count);
 // Each skill is answered correctly and incorrectly through its visible controls.
 for(let m=1;m<=8;m++){
  await page.goto(`${base}/practice.html?module=${m}`,{waitUntil:'networkidle'});
  const ids=await page.evaluate(()=>Course.practiceInstances[0].skills.map(s=>s.id));
  for(const id of ids){await page.locator('.skill-select').selectOption(id);let q=await page.evaluate(()=>Course.practiceInstances[0].q);
   if(q.choices){await page.locator(`input[name=answer][value="${q.choices.indexOf(q.answer)}"]`).check();}else await page.locator('input[name=answer]').fill(String(q.answer));
   await page.getByRole('button',{name:'Check my answer',exact:true}).click();assert.equal(await page.locator('.feedback.correct').count(),1,id+' correct');
   await page.locator('[data-action=next]').click();q=await page.evaluate(()=>Course.practiceInstances[0].q);
   if(q.choices){await page.locator(`input[name=answer][value="${q.choices.findIndex(a=>a!==q.answer)}"]`).check();}else await page.locator('input[name=answer]').fill('999999999');
   await page.getByRole('button',{name:'Check my answer',exact:true}).click();assert.equal(await page.locator('.feedback:not(.correct)').count(),1,id+' wrong');assert.ok((await page.locator('.feedback').innerText()).includes('By hand'));assert.equal(await page.locator('.feedback .check').count(),2);}
 }
 console.log('PASS: all 64 skills answered correctly and incorrectly in the interface.');
 await page.goto(`${base}/practice.html?module=1`,{waitUntil:'networkidle'});
 await page.locator('.skill-select').selectOption('m1-proportion');
 for(let i=0;i<3;i++){const a=await page.evaluate(()=>Course.practiceInstances[0].q.answer);await page.locator('input[name=answer]').fill(`${a*100}%`);await page.getByRole('button',{name:'Check my answer',exact:true}).click();await page.locator('[data-action=next]').click();}
 await page.reload({waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>Course.progress()['m1-proportion'].mastered),true);
 await page.getByRole('button',{name:'Start mixed set · 6 questions',exact:true}).click();
 await page.getByRole('button',{name:'Show the worked solution',exact:true}).click();assert.equal(await page.evaluate(()=>Course.practiceInstances[0].queue.length),6);await page.locator('[data-action=next]').click();
 for(let i=0;i<6;i++){const q=await page.evaluate(()=>Course.practiceInstances[0].q);if(q.choices)await page.locator(`input[name=answer][value="${q.choices.indexOf(q.answer)}"]`).check();else await page.locator('input[name=answer]').fill(String(q.answer));await page.getByRole('button',{name:'Check my answer',exact:true}).click();await page.locator('[data-action=next]').click();}assert.ok((await page.locator('.feedback').innerText()).includes('Mixed set complete'));
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
 await page.locator('#t-mode').selectOption('statistic');await page.locator('#t-tail').selectOption('left');await page.locator('#t-value').fill('-3.204');await page.locator('#t-lookup').click();assert.ok((await page.locator('#t-result').innerText()).includes('0.005 < p < 0.01'));
 console.log('PASS: all lab buttons, point keyboard control, parameter warnings, and table lookups.');
 // Visual artifacts at both widths and themes.
 for(const width of [1440,390])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:1000});await page.evaluate(t=>localStorage.setItem('stat2331-theme',JSON.stringify(t)),theme);
  for(const route of ['index.html','module-6.html','labs.html','tables.html']){
   await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} overflow at ${width} ${theme}`);
   await page.screenshot({path:`test-results/${route.replace('.html','')}-${width}-${theme}.png`,fullPage:route==='index.html'});
  }
 }
 assert.deepEqual(errors,[],'No browser console or JavaScript errors');
 console.log('PASS: desktop and mobile; light and dark; rendered math; no JavaScript or console errors.');
 await writeFile('test-results/browser-summary.json',JSON.stringify({pages:12,skills:64,questions:count,labs:10,themes:2,widths:[1440,390],errors},null,2));
}finally{await browser.close();}
