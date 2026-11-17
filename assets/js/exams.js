/* Practice exams: a cumulative final and one quiz per module.
   Multiple choice is scored 4/2/1/0. Free response: computation steps are checked
   automatically (4 points); the written part is self-scored with a two-key rubric (4 points). */
(function () {
  'use strict';
  const host = document.querySelector('#exam-root');
  if (!host || !window.ExamBank) return;
  const B = window.ExamBank, C = window.Course, E = C.escape, T = s => C.tex ? C.tex(s) : s, KEY = 'stat2331-exams-v1';
  const titles = C.titles, LET = 'ABCD';
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const EXAMS = { final: { id: 'final', title: 'Final exam', sub: 'Modules 1–8', minutes: 120,
    build: () => {
      const mc = []; for (let m = 1; m <= 8; m++) mc.push(...shuffle(B.mc[m].slice()).slice(0, 3));
      const fr = [[1, 2], [3, 4], [5, 6], [7], [8]].map(g => { const pool = g.flatMap(m => B.fr[m]); return pool[Math.floor(Math.random() * pool.length)]; });
      return [...mc, ...fr];
    } } };
  for (let m = 1; m <= 8; m++) EXAMS['m' + m] = { id: 'm' + m, title: `Module ${m} quiz`, sub: titles[m - 1], minutes: 35, module: m,
    build: () => [...shuffle(B.mc[m].slice()), ...B.fr[m]] };
  const counts = ex => ex.id === 'final' ? { mc: 24, fr: 5 } : { mc: 8, fr: 2 };
  const maxPts = ex => { const c = counts(ex); return c.mc * 4 + c.fr * 8; };

  const history = () => C.storage.read(KEY, { attempts: [] });
  const save = h => { h.attempts = h.attempts.slice(-60); C.storage.write(KEY, h); };

  let state = null, timer = null;
  const leaveGuard = e => { e.preventDefault(); e.returnValue = ''; };

  /* ---------- menu ---------- */
  function menu() {
    stop(); state = null;
    const h = history();
    const stat = id => { const a = h.attempts.filter(x => x.exam === id); if (!a.length) return 'Not attempted yet'; const best = Math.max(...a.map(x => x.pct)); return `${a.length} attempt${a.length > 1 ? 's' : ''} · best ${best}%`; };
    const card = (ex, wide) => { const c = counts(ex); return `<article class="exam-card ${wide ? 'wide' : ''}"><div class="eyebrow">${ex.sub}</div><h2>${ex.title}</h2><p>${c.mc} multiple choice · ${c.fr} free response · ${maxPts(ex)} points · suggested ${ex.minutes >= 60 ? ex.minutes / 60 + ' hours' : ex.minutes + ' minutes'}</p><p class="small muted exam-stat">${stat(ex.id)}</p><button class="primary" data-start="${ex.id}">Start ${ex.id === 'final' ? 'the final' : 'quiz'}</button></article>`; };
    host.innerHTML = `<div class="page-intro"><div class="eyebrow">Practice exams</div><h1>Rehearse exam day.</h1><p>Answer every question first, then submit to see your score. Each attempt is a new version with fresh numbers, so you can retake as often as you like.</p></div>
    <div class="exam-timing"><label class="exam-check"><input type="checkbox" id="exam-timed"> Time me</label><span class="small muted">A countdown uses the suggested time and submits automatically when it reaches zero.</span></div>
    <div class="exam-grid">${card(EXAMS.final, true)}${[1, 2, 3, 4, 5, 6, 7, 8].map(m => card(EXAMS['m' + m])).join('')}</div>
    <section class="exam-how"><h2>How scoring works</h2><div class="exam-how-grid"><div><h3>Multiple choice · 4 points each</h3><p>The best answer earns 4. Some other choices earn partial credit: <strong>2</strong> for a near miss (the right idea reversed, or one slip), <strong>1</strong> for partial understanding, <strong>0</strong> otherwise. After you submit, every choice is explained.</p></div><div><h3>Free response · 8 points each</h3><p>Your computation steps are checked automatically (4 points). Then you score your written answer yourself with the rubric (4 points): both keys earn 4, one key earns 2, accurate but incomplete earns 1.</p></div></div><p class="small muted">Work on paper with your calculator and the <a href="tables.html">tables</a>, just as on the exam. Results stay in this browser.</p></section>`;
    host.querySelectorAll('[data-start]').forEach(b => b.addEventListener('click', () => start(b.dataset.start, host.querySelector('#exam-timed').checked)));
    window.scrollTo(0, 0);
  }

  /* ---------- taking ---------- */
  function start(id, timed) {
    const ex = EXAMS[id];
    const items = ex.build().map(it => {
      const q = it.gen(), kind = q.options ? 'mc' : 'fr';
      if (kind === 'mc') {
        const fixedLast = q.options.filter(o => o.last), rest = q.options.filter(o => !o.last);
        q.shown = q.numeric ? q.options.slice() : [...shuffle(rest), ...fixedLast];
      }
      return { kind, m: it.m, id: it.id, q, ans: null };
    });
    state = { ex, items, timed, deadline: timed ? Date.now() + ex.minutes * 60000 : null, started: Date.now() };
    window.addEventListener('beforeunload', leaveGuard);
    renderExam();
  }
  function itemHtml(it, i) {
    const q = it.q, head = `<div class="exam-q-head"><span class="exam-q-num">${i + 1}</span><span class="small muted">Module ${it.m} · ${it.kind === 'mc' ? '4 points' : '8 points · free response'}</span></div>`;
    if (it.kind === 'mc') return `<li class="exam-item" id="exam-q-${i}" data-i="${i}">${head}<fieldset><legend class="exam-stem">${T(q.stem)}</legend><div class="choices">${q.shown.map((o, k) => `<label class="choice"><input type="radio" name="q${i}" value="${k}"><span><b class="exam-letter">${LET[k]}</b> ${T(o.t)}</span></label>`).join('')}</div></fieldset></li>`;
    const parts = q.parts.map((p, k) => {
      const lab = `<span class="part-step">Step ${k + 1}</span>${T(p.label)}`;
      if (p.type === 'choice') return `<fieldset class="part" data-k="${k}"><legend class="part-label">${lab}</legend><div class="choices">${p.options.map((op, j) => `<label class="choice"><input type="radio" name="q${i}p${k}" value="${j}"><span>${T(op)}</span></label>`).join('')}</div><div class="part-fb"></div></fieldset>`;
      return `<div class="part" data-k="${k}"><label class="part-label" for="q${i}p${k}">${lab}</label><div class="part-input"><input id="q${i}p${k}" autocomplete="off" spellcheck="false" placeholder="number or arithmetic"></div><div class="part-fb"></div></div>`;
    }).join('');
    return `<li class="exam-item" id="exam-q-${i}" data-i="${i}">${head}<div class="exam-stem">${T(q.stem)}</div>${parts}<div class="part exam-written"><label class="part-label" for="q${i}w"><span class="part-step">Written</span>${T(q.written.prompt)}</label><textarea id="q${i}w" rows="4" placeholder="Write your answer in complete sentences."></textarea></div></li>`;
  }
  function renderExam() {
    const s = state;
    host.innerHTML = `<div class="exam-bar" role="region" aria-label="Exam status"><div><strong>${s.ex.title}</strong><span class="small muted"> · ${s.ex.sub}</span></div><div class="exam-bar-right"><span class="exam-progress" aria-live="polite"></span>${s.timed ? '<span class="exam-timer" role="timer" aria-live="off"></span>' : ''}<button class="primary" data-action="submit">Submit exam</button></div></div>
    <p class="small muted exam-note">Answer on paper first, then enter your answers. Number inputs accept arithmetic such as <code>11/200</code> or <code>sqrt(0.25/100)</code>. Nothing is graded until you submit.</p>
    <ol class="exam-items">${s.items.map(itemHtml).join('')}</ol>
    <div class="exam-confirm" hidden role="alertdialog" aria-labelledby="exam-confirm-msg"><p id="exam-confirm-msg"></p><div class="answer-row"><button data-action="keep">Keep working</button><button class="primary" data-action="confirm">Submit exam</button></div></div>
    <div class="exam-foot"><button class="primary" data-action="submit">Submit exam</button><button data-action="quit">Leave without submitting</button></div>`;
    C.renderMath(host);
    host.oninput = progress; host.onchange = progress;
    host.onclick = e => {
      const a = e.target.closest('button') && e.target.closest('button').dataset.action;
      if (a === 'submit') askSubmit();
      if (a === 'keep') host.querySelector('.exam-confirm').hidden = true;
      if (a === 'confirm') submit(false);
      if (a === 'quit') { if (host.querySelector('[data-action=quit]').dataset.sure) { window.removeEventListener('beforeunload', leaveGuard); menu(); } else { const b = host.querySelector('[data-action=quit]'); b.dataset.sure = 1; b.textContent = 'Click again to leave (answers are not saved)'; } }
    };
    progress();
    if (s.timed) { tick(); timer = setInterval(tick, 1000); }
    window.scrollTo(0, 0);
  }
  function answered(i) {
    const it = state.items[i], li = host.querySelector(`#exam-q-${i}`);
    if (it.kind === 'mc') return !!li.querySelector('input:checked');
    const parts = [...li.querySelectorAll('.part[data-k]')].every(p => p.querySelector('input:checked') || (p.querySelector('input:not([type=radio])') && p.querySelector('input:not([type=radio])').value.trim()));
    return parts && li.querySelector('textarea').value.trim() !== '';
  }
  function progress() {
    if (!state || state.done) return;
    const n = state.items.filter((_, i) => answered(i)).length, el = host.querySelector('.exam-progress');
    if (el) el.textContent = `${n} of ${state.items.length} answered`;
  }
  function tick() {
    const el = host.querySelector('.exam-timer'); if (!el || !state) return;
    const left = Math.max(0, state.deadline - Date.now()), m = Math.floor(left / 60000), sec = Math.floor(left / 1000) % 60;
    el.textContent = `${m}:${String(sec).padStart(2, '0')} left`; el.classList.toggle('low', left < 5 * 60000);
    if (left <= 0) submit(true);
  }
  const stop = () => { if (timer) clearInterval(timer); timer = null; };
  function askSubmit() {
    const blank = state.items.map((_, i) => i).filter(i => !answered(i));
    if (!blank.length) return submit(false);
    const box = host.querySelector('.exam-confirm');
    box.querySelector('p').textContent = `${blank.length} question${blank.length > 1 ? 's are' : ' is'} not fully answered (${blank.slice(0, 8).map(i => '#' + (i + 1)).join(', ')}${blank.length > 8 ? ', …' : ''}). Blank answers score 0. Submit anyway?`;
    box.hidden = false; box.querySelector('[data-action=confirm]').focus();
  }

  /* ---------- grading ---------- */
  function parseNum(raw, answer) {
    if (!raw.trim()) return null;
    let v; try { v = Stats.parse(raw); } catch (e) { return null; }
    if (/%\s*$/.test(raw) && Math.abs(answer) > 1) v *= 100;
    return v;
  }
  function gradeFR(it, li) {
    const q = it.q, res = q.parts.map((p, k) => {
      const el = li.querySelector(`.part[data-k="${k}"]`);
      if (p.type === 'choice') { const s = el.querySelector('input:checked'); const pick = s ? Number(s.value) : null; return { pick, ok: pick === p.answer }; }
      const raw = el.querySelector('input').value, v = parseNum(raw, p.answer), tol = p.tol != null ? p.tol : Math.max(0.0015, Math.abs(p.answer) * 0.005);
      const close = (a, b, t) => Math.abs(a - b) <= t + 1e-12;
      const ok = v != null && (close(v, p.answer, tol) || (p.alts || []).some(a => close(v, a, tol)));
      const mis = v != null && !ok ? (p.mistakes || []).find(m => close(v, m.value, m.tol != null ? m.tol : tol)) : null;
      return { raw, v, ok, mis };
    });
    return { parts: res, steps: Math.round(4 * res.filter(r => r.ok).length / res.length), written: li.querySelector('textarea').value };
  }
  function submit(timeUp) {
    if (!state || state.done) return;
    stop(); window.removeEventListener('beforeunload', leaveGuard);
    state.done = true; state.timeUp = timeUp; state.minutes = Math.round((Date.now() - state.started) / 60000);
    state.items.forEach((it, i) => {
      const li = host.querySelector(`#exam-q-${i}`);
      if (it.kind === 'mc') { const s = li.querySelector('input:checked'); it.pick = s ? Number(s.value) : null; it.pts = it.pick == null ? 0 : it.q.shown[it.pick].tier; }
      else { it.g = gradeFR(it, li); it.self = null; }
    });
    const h = history(); state.attemptIndex = h.attempts.length;
    h.attempts.push({ exam: state.ex.id, date: new Date().toISOString(), pct: 0 }); save(h);
    logMistakes();
    review(); record();
  }
  function logMistakes() {
    if (!C.mistakes) return;
    state.items.forEach((it, i) => {
      const msgs = [];
      if (it.kind === 'mc') { if (it.pick == null || it.pts === 4) return; msgs.push(it.q.shown[it.pick].why); }
      else {
        it.g.parts.forEach((r, k) => { const p = it.q.parts[k]; if (r.ok) return; const m = p.type === 'choice' ? (p.why || {})[r.pick] : r.mis && r.mis.msg; if (m) msgs.push(`${p.label}: ${m}`); });
        if (it.g.parts.every(r => r.ok)) return;
      }
      C.mistakes.log({ source: 'exam', module: it.m, skill: 'exam', title: `${state.ex.title}, question ${i + 1}`, msgs });
    });
  }
  function studyPlan(t) {
    const weak = Object.entries(t.byM).map(([m, v]) => ({ m: Number(m), pc: Math.round(100 * v.p / v.max) })).filter(x => x.pc < 80).sort((a, b) => a.pc - b.pc).slice(0, 3);
    if (!weak.length) return `<h2>What to study next</h2><p>Every module scored 80% or better. Try a new version, or the <a href="exams.html">final</a> if you have not taken it yet.</p>`;
    const missed = m => state.items.map((it, i) => ({ it, i })).filter(({ it }) => it.m === m && (it.kind === 'mc' ? it.pts < 4 : it.g.steps + (it.self == null ? 4 : it.self) < 8)).map(({ i }) => `<a href="#exam-q-${i}">${i + 1}</a>`);
    return `<h2>What to study next</h2><p class="small muted">Your weakest modules on this attempt, lowest first.</p><ol class="study-list">${weak.map(w => { const q = missed(w.m); return `<li><strong>Module ${w.m}. ${titles[w.m - 1]}</strong> · ${w.pc}%${q.length ? `<br><span class="small">Questions to revisit: ${q.join(', ')}</span>` : ''}<br><span class="small"><a href="module-${w.m}.html">Reread the notes</a> · <a href="practice.html?module=${w.m}">Practice the skills</a>${state.ex.id === 'm' + w.m ? '' : ` · <button type="button" class="linkish" data-quiz="m${w.m}">Take the Module ${w.m} quiz</button>`}</span></li>`; }).join('')}</ol><p class="small"><a href="mistakes.html">See every mistake you have made so far</a></p>`;
  }
  function totals() {
    let auto = 0, written = 0, pending = 0; const byM = {};
    for (const it of state.items) {
      const add = (m, p, max) => { byM[m] = byM[m] || { p: 0, max: 0 }; byM[m].p += p; byM[m].max += max; };
      if (it.kind === 'mc') { auto += it.pts; add(it.m, it.pts, 4); }
      else { auto += it.g.steps; written += it.self || 0; if (it.self == null) pending++; add(it.m, it.g.steps + (it.self || 0), 8); }
    }
    return { auto, written, pending, total: auto + written, max: maxPts(state.ex), byM };
  }
  function record() {
    const t = totals(), h = history(), a = h.attempts[state.attemptIndex];
    if (a) { Object.assign(a, { pct: Math.round(100 * t.total / t.max), points: t.total, max: t.max, pending: t.pending }); save(h); }
  }

  /* ---------- review ---------- */
  const tierWord = { 4: 'Full credit', 2: 'Near miss', 1: 'Partial understanding', 0: 'No credit' };
  function reviewItem(it, i) {
    const q = it.q, head = `<div class="exam-q-head"><span class="exam-q-num">${i + 1}</span><span class="small muted">Module ${it.m}</span><span class="exam-score ${it.kind === 'mc' ? 't' + it.pts : ''}" data-score="${i}"></span></div>`;
    if (it.kind === 'mc') {
      const best = q.shown.findIndex(o => o.tier === 4);
      return `<li class="exam-item reviewed" id="exam-q-${i}">${head}<div class="exam-stem">${T(q.stem)}</div><ul class="exam-options">${q.shown.map((o, k) => `<li class="exam-option ${k === it.pick ? 'picked' : ''} ${k === best ? 'best' : ''}"><div><b class="exam-letter">${LET[k]}</b> ${T(o.t)}</div><div class="exam-tier t${o.tier}">${o.tier} pt${o.tier === 1 ? '' : 's'}${k === it.pick ? ' · your answer' : ''}</div>${k === it.pick || k === best ? `<p class="small">${T(o.why)}</p>` : `<details><summary class="small">Why ${o.tier} point${o.tier === 1 ? '' : 's'}?</summary><p class="small">${T(o.why)}</p></details>`}</li>`).join('')}</ul>${it.pick == null ? '<p class="small"><strong>No answer was chosen.</strong></p>' : ''}<p class="small exam-links">Review: <a href="module-${it.m}.html">Module ${it.m} notes</a> · <a href="practice.html?module=${it.m}">practice</a></p></li>`;
    }
    const g = it.g, parts = q.parts.map((p, k) => {
      const r = g.parts[k], ans = p.type === 'choice' ? T(p.options[p.answer]) : (p.show || Number(Number(p.answer).toFixed(4)).toString());
      const yours = p.type === 'choice' ? (r.pick == null ? '—' : T(p.options[r.pick])) : (r.raw && r.raw.trim() ? E(r.raw) : '—');
      const note = r.ok ? '' : p.type === 'choice' ? ((p.why || {})[r.pick] || '') : (r.mis ? r.mis.msg : '');
      return `<div class="part ${r.ok ? 'right' : 'wrong'}"><div class="part-label"><span class="part-step">Step ${k + 1}</span>${T(p.label)}</div><div class="part-fb"><strong>${r.ok ? '✓ Correct' : '✗ Not yet'}</strong> Your answer: ${yours}${r.ok ? '' : ` · Answer: <strong>${ans}</strong>`}${note ? `<br><span>${T(note)}</span>` : ''}</div></div>`;
    }).join('');
    const w = q.written;
    return `<li class="exam-item reviewed" id="exam-q-${i}">${head}<div class="exam-stem">${T(q.stem)}</div>${parts}
      <div class="feedback"><h4>Steps: ${g.steps} of 4 points</h4><strong>By hand</strong><ol>${q.solution.map(s => `<li>${T(s)}</li>`).join('')}</ol>${q.figure || ''}${q.ti || q.excel ? `<div class="checks">${q.ti ? `<div class="check"><strong>TI-84 check</strong>${E(q.ti)}</div>` : ''}${q.excel ? `<div class="check"><strong>Excel check</strong><code>${E(q.excel)}</code></div>` : ''}</div>` : ''}</div>
      <div class="exam-rubric"><h4>Written: score yourself</h4><p class="small muted">${T(w.prompt)}</p><div class="exam-yours"><strong>Your answer</strong><p>${g.written.trim() ? E(g.written).replace(/\n/g, '<br>') : '<em>No answer written.</em>'}</p></div>
      <div class="exam-keys"><strong>Rubric</strong><ol><li><b>Key 1.</b> ${T(w.keys[0])}</li><li><b>Key 2.</b> ${T(w.keys[1])}</li></ol><p class="small"><b>4</b> both keys · <b>2</b> one key · <b>1</b> accurate but incomplete · <b>0</b> inaccurate or blank</p></div>
      <div class="exam-model"><strong>Model answer</strong><p>${T(w.model)}</p></div>
      <div class="exam-self" role="group" aria-label="Score your written answer for question ${i + 1}">${[4, 2, 1, 0].map(v => `<button type="button" data-self="${i}" data-v="${v}" aria-pressed="false">${v}</button>`).join('')}<span class="small muted">${g.written.trim() ? 'Pick the score your answer earns.' : 'A blank answer earns 0.'}</span></div></div>
      <p class="small exam-links">Review: <a href="module-${it.m}.html">Module ${it.m} notes</a> · <a href="practice.html?module=${it.m}">practice</a></p></li>`;
  }
  function review() {
    const s = state; host.oninput = host.onchange = null;
    s.items.forEach(it => { if (it.kind === 'fr' && !it.g.written.trim()) it.self = 0; });
    host.innerHTML = `<div class="page-intro"><div class="eyebrow">${s.ex.title} · results</div><h1 class="exam-total"></h1><p class="exam-summary"></p>${s.timeUp ? '<p class="exam-timeup"><strong>Time is up.</strong> Your exam was submitted automatically.</p>' : ''}<div class="answer-row"><button class="primary" data-action="retake">Take a new version</button><button data-action="menu">All practice exams</button></div></div>
    <section class="exam-plan tip"></section>
    <section class="exam-breakdown"><h2>By module</h2><div class="table-scroll"><table><thead><tr><th>Module</th><th>Points</th><th>Score</th><th></th></tr></thead><tbody class="exam-bm"></tbody></table></div></section>
    <ol class="exam-items">${s.items.map(reviewItem).join('')}</ol>`;
    host.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.action === 'retake') start(s.ex.id, s.timed);
      if (b.dataset.action === 'menu') menu();
      if (b.dataset.quiz) start(b.dataset.quiz, s.timed);
      if (b.dataset.self != null) { const it = s.items[Number(b.dataset.self)]; it.self = Number(b.dataset.v); updateScores(); record(); }
    };
    updateScores(); C.renderMath(host); window.scrollTo(0, 0);
  }
  function updateScores() {
    const t = totals(), s = state;
    host.querySelector('.exam-total').textContent = `${t.total} / ${t.max} points (${Math.round(100 * t.total / t.max)}%)`;
    host.querySelector('.exam-summary').textContent = t.pending
      ? `Multiple choice and computation steps: ${t.auto} points. ${t.pending} written answer${t.pending > 1 ? 's' : ''} still to score; scroll to each free-response question and pick a score.`
      : `All parts scored. Completed in about ${s.minutes} minute${s.minutes === 1 ? '' : 's'}.`;
    host.querySelector('.exam-bm').innerHTML = Object.entries(t.byM).map(([m, v]) => { const pc = Math.round(100 * v.p / v.max); return `<tr><td>${m}. ${titles[m - 1]}</td><td>${v.p} / ${v.max}</td><td><span class="exam-bar-meter" style="--w:${pc}%"></span> ${pc}%</td><td><a href="practice.html?module=${m}">Practice</a></td></tr>`; }).join('');
    host.querySelector('.exam-plan').innerHTML = studyPlan(t);
    s.items.forEach((it, i) => {
      const el = host.querySelector(`[data-score="${i}"]`);
      if (it.kind === 'mc') el.textContent = `${it.pts} / 4 · ${tierWord[it.pts]}`;
      else el.textContent = `${it.g.steps + (it.self || 0)} / 8${it.self == null ? ' · written not scored yet' : ''}`;
      host.querySelectorAll(`[data-self="${i}"]`).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.v) === it.self)));
    });
  }

  C.exams = { EXAMS, get state() { return state; }, start, submit, menu };
  menu();
})();
