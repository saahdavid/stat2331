const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const S=require('../assets/js/stats.js');
const ctx=vm.createContext({Stats:S,Math});
for(const f of ['shared',...Array.from({length:8},(_,i)=>`module-${i+1}`)])vm.runInContext(fs.readFileSync(`assets/js/questions/${f}.js`,'utf8'),ctx);
let generated=0;
for(const [m,skills] of Object.entries(ctx.Course.questions)){
 assert.equal(skills.length,8,`Module ${m}: 8 skills`);
 for(const skill of skills){const variants=new Set();for(let i=0;i<500;i++){
  const q=skill.generate();generated++;assert.ok(q.prompt&&q.solution&&q.ti&&q.excel,skill.id);
  assert.ok(!/undefined|NaN|Infinity/.test(JSON.stringify(q)),`${skill.id} has invalid output`);
  variants.add(q.prompt);
  if(q.choices){assert.ok(q.choices.length>=2);assert.equal(new Set(q.choices).size,q.choices.length);assert.equal(q.choices.filter(c=>c===q.answer).length,1);}
  else{assert.ok(Number.isFinite(q.answer),skill.id);assert.ok(q.tolerance>=0);for(const a of q.alternates||[])assert.ok(Number.isFinite(a));for(const x of q.mistakes)assert.ok(Number.isFinite(x.value));}
 }assert.ok(variants.size>=4,`${skill.id} must generate fresh variants`);}
}
assert.equal(S.summary([1,2,7,11,12,18,23,25,98,197]).join(','),'1,7,15,25,197');
assert.equal(S.summary([1,2,3,4,5,6,7,8,9]).join(','),'1,2.5,5,7.5,9');
assert.ok(Math.abs(S.sd([1,2,3,4,5])-Math.sqrt(2.5))<1e-12);
assert.equal(S.tableNormal(.857142),.8051);assert.equal(S.tableInverse(.95),1.645);assert.equal(S.tableInverse(.05),-1.645);
assert.equal(S.tableDF(39),30);assert.equal(S.tableDF(164),100);assert.equal(S.tCritical(39,.99),2.75);
assert.equal(S.tBracket(3.204,7).lower,.005);assert.equal(S.tBracket(3.204,7).upper,.01);
for(const [input,value] of [['11/200',.055],['0.48*0.52',.2496],['sqrt(0.25/100)',.05],['5.5%',.055],['(2+3)^2',25],['-2^2',-4],['2^-2',.25],['1e-3',.001]])assert.ok(Math.abs(S.parse(input)-value)<1e-12,input);
for(const input of ['alert(1)','globalThis','1/0','sqrt(-1)','2;3','2**3','constructor()','1e999'])assert.throws(()=>S.parse(input),undefined,input);
for(let i=0;i<=100;i++){const z=-5+i*.1;assert.ok(Math.abs(S.normalCDF(z)+S.normalCDF(-z)-1)<1e-12);}
console.log(`PASS: ${generated.toLocaleString()} generated questions across 64 skills; parser, quartiles, conventions, and numerical smoke checks.`);
