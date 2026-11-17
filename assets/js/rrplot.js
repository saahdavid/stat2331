/* Animated rejection region for a z or t test (Module 8).
   RRPlot.svg(opts) returns a <div class="rr-anim" data-rr='…'> with the finished picture inside;
   in the browser every such div is upgraded automatically into a step-by-step animation:
     1 curve under H₀ → 2 rejection region (area α) → 3 critical value → 4 test statistic slides in → 5 verdict.
   opts: { dist: 'z' | 't', df, dir: 'gt' | 'lt' | 'ne', crit, ts (optional), alpha }
   Works in Node too (the build expands placeholders in the notes into the finished picture). */
(function (root) {
  'use strict';
  const lgamma = x => {
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1; let a = c[0]; const t = x + g + 0.5; for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  };
  const dnorm = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  const dt = (x, v) => Math.exp(lgamma((v + 1) / 2) - lgamma(v / 2) - 0.5 * Math.log(v * Math.PI) - (v + 1) / 2 * Math.log(1 + x * x / v));
  const minus = s => String(s).replace('-', '−');
  const fix3 = v => minus(v.toFixed(3));
  const tsText = v => minus(Number(v.toFixed(Math.abs(v) >= 10 ? 3 : 4)).toString());
  const sub = n => String(n).split('').map(ch => '₀₁₂₃₄₅₆₇₈₉'[ch] || ch).join('');
  const ROWS = [...Array.from({ length: 30 }, (_, i) => i + 1), 40, 50, 60, 80, 100, 1000];
  const tableRow = df => ROWS.filter(r => r <= df).pop();
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function norm(o) {
    const dist = o.dist === 't' ? 't' : 'z', df = o.df != null ? Number(o.df) : null, dir = o.dir || 'gt';
    const crit = Math.abs(Number(o.crit)), ts = o.ts == null || o.ts === '' ? null : Number(o.ts), alpha = o.alpha != null ? String(o.alpha) : null;
    const inRR = ts == null ? null : dir === 'gt' ? ts >= crit : dir === 'lt' ? ts <= -crit : Math.abs(ts) >= crit;
    return { dist, df, dir, crit, ts, alpha, inRR };
  }

  /* ---------- geometry: a broken axis keeps the region readable when |TS| is far out ---------- */
  const H = 250, BASE = 182, TOP = 66, LIM = 4.2;
  function layout(o) {
    const far = o.ts != null && Math.abs(o.ts) > LIM;
    const side = far ? Math.sign(o.ts) : 0;
    const W = o.W || 640, inset = W < 500 ? 70 : 92, L = side < 0 ? 36 + inset : 36, R = side > 0 ? W - 36 - inset : W - 36;
    const X = v => {
      if (Math.abs(v) <= LIM || !far) return L + (Math.max(-LIM, Math.min(LIM, v)) + LIM) / (2 * LIM) * (R - L);
      const tsX = side > 0 ? W - 36 : 36, brk = side > 0 ? R + 24 : L - 24;
      const f = (Math.abs(v) - LIM) / (Math.abs(o.ts) - LIM);
      return side > 0 ? Math.min(tsX, brk + f * (tsX - brk)) : Math.max(tsX, brk - f * (brk - tsX));
    };
    return { far, side, L, R, X, W };
  }

  /* ---------- one frame; s = {curve, shade, crit, ts, verdict} each 0..1 ---------- */
  function frame(o, s) {
    const { far, side, L, R, X, W } = layout(o), small = W < 500;
    const pdf = o.dist === 't' && o.df && o.df < 1000 ? x => dt(x, o.df) : dnorm;
    const peak = pdf(0), Y = v => BASE - pdf(v) / peak * (BASE - TOP);
    const path = (a, b, k) => { let d = ''; for (let i = 0; i <= k; i++) { const v = a + (b - a) * i / k; d += `${i ? 'L' : 'M'}${X(v).toFixed(1)},${Y(v).toFixed(1)}`; } return d; };
    let out = '';
    // region (sweeps outward from the critical value)
    const regions = o.dir === 'gt' ? [[o.crit, LIM]] : o.dir === 'lt' ? [[-o.crit, -LIM]] : [[-o.crit, -LIM], [o.crit, LIM]];
    if (s.shade > 0) for (const [a, b] of regions) {
      const e = a + (b - a) * s.shade, lo = Math.min(a, e), hi = Math.max(a, e);
      out += `<path class="rrp-shade${s.verdict > 0 && o.inRR ? ' rrp-hit' : ''}" d="${path(lo, hi, 40)}L${X(hi).toFixed(1)},${BASE}L${X(lo).toFixed(1)},${BASE}Z"/>`;
    }
    // curve (drawn left to right)
    if (s.curve > 0) out += `<path class="rrp-curve" d="${path(-LIM, -LIM + 2 * LIM * s.curve, Math.max(2, Math.round(180 * s.curve)))}"/>`;
    // axis, ticks, break
    out += `<line class="rrp-axis" x1="${L - 6}" y1="${BASE}" x2="${R + 6}" y2="${BASE}"/>`;
    for (let v = -4; v <= 4; v++) out += `<line class="rrp-tick" x1="${X(v).toFixed(1)}" y1="${BASE}" x2="${X(v).toFixed(1)}" y2="${BASE + 5}"/><text class="rrp-ticklabel" x="${X(v).toFixed(1)}" y="${BASE + 20}" text-anchor="middle">${minus(v)}</text>`;
    if (far) {
      const bx = side > 0 ? R + 12 : L - 12, tx = side > 0 ? W - 36 : 36;
      out += `<path class="rrp-break" d="M${bx - 6},${BASE + 7}L${bx},${BASE - 7}M${bx + 2},${BASE + 7}L${bx + 8},${BASE - 7}"/>`;
      out += `<line class="rrp-axis" x1="${side > 0 ? bx + 10 : tx - 4}" y1="${BASE}" x2="${side > 0 ? tx + 4 : bx - 10}" y2="${BASE}"/>`;
      out += `<text class="rrp-ticklabel rrp-far" x="${tx}" y="${BASE + 20}" text-anchor="middle">${tsText(o.ts)}</text>`;
    } else out += `<path class="rrp-arrow" d="M${R + 6},${BASE - 4}L${R + 14},${BASE}L${R + 6},${BASE + 4}Z"/>`;
    // labels for the two decisions
    if (s.shade > 0.6) {
      const op = Math.min(1, (s.shade - 0.6) / 0.4).toFixed(2);
      const rx = o.dir === 'lt' ? X(-(o.crit + LIM) / 2) : X((o.crit + LIM) / 2);
      out += `<g opacity="${op}"><text class="rrp-region" x="${rx.toFixed(1)}" y="${(BASE - 62).toFixed(1)}" text-anchor="middle">Reject H₀</text>`;
      if (o.dir === 'ne') out += `<text class="rrp-region" x="${X(-(o.crit + LIM) / 2).toFixed(1)}" y="${(BASE - 62).toFixed(1)}" text-anchor="middle">Reject H₀</text>`;
      const fx = o.dir === 'gt' ? X((-LIM + o.crit) / 2 - 0.4) : o.dir === 'lt' ? X((LIM - o.crit) / 2 + 0.4) : X(0);
      out += `<text class="rrp-keep" x="${fx.toFixed(1)}" y="${(TOP - 26).toFixed(1)}" text-anchor="middle">Fail to reject H₀</text>`;
      const ax = o.dir === 'lt' ? X(-o.crit - 0.25) : X(o.crit + 0.25);
      out += `<text class="rrp-area" x="${ax.toFixed(1)}" y="${(BASE - 40).toFixed(1)}" text-anchor="${o.dir === 'lt' ? 'end' : 'start'}">${o.dir === 'ne' ? 'α/2 each' : 'area α'}${o.alpha && o.dir !== 'ne' ? ' = ' + o.alpha : ''}</text></g>`;
    }
    // critical value(s): line drops from the top
    if (s.crit > 0) {
      const cs = o.dir === 'gt' ? [o.crit] : o.dir === 'lt' ? [-o.crit] : [-o.crit, o.crit];
      for (const c of cs) {
        const y0 = TOP - 18, y1 = y0 + (BASE - y0) * s.crit, near = o.ts != null && s.ts > 0 && Math.abs(X(o.ts) - X(c)) < 64, right = near ? X(o.ts) < X(c) : c > 0;
        out += `<line class="rrp-crit" x1="${X(c).toFixed(1)}" y1="${y0}" x2="${X(c).toFixed(1)}" y2="${y1.toFixed(1)}"/>`;
        if (s.crit > 0.7) out += `<text class="rrp-critlabel" x="${(X(c) + (right ? 6 : -6)).toFixed(1)}" y="${y0 + 12}" text-anchor="${right ? 'start' : 'end'}">${c < 0 ? '−' : ''}${o.dist === 't' ? 't*' : 'z*'} = ${fix3(c)}</text>`;
      }
    }
    // test statistic slides from 0
    if (o.ts != null && s.ts > 0) {
      const e = s.ts < 1 ? 1 - Math.pow(1 - s.ts, 3) : 1, v = o.ts * e, x = X(v);
      const cls = s.verdict > 0 ? (o.inRR ? 'rrp-ts rrp-ts-reject' : 'rrp-ts rrp-ts-keep') : 'rrp-ts';
      const anchor = x > W - 80 ? 'end' : x < 80 ? 'start' : 'middle';
      out += `<line class="${cls}" x1="${x.toFixed(1)}" y1="${TOP - 34}" x2="${x.toFixed(1)}" y2="${BASE}"/><circle class="${cls}" cx="${x.toFixed(1)}" cy="${BASE}" r="5"/>`;
      out += `<text class="rrp-tslabel" x="${x.toFixed(1)}" y="${TOP - 40}" text-anchor="${anchor}">TS = ${s.ts >= 1 ? tsText(o.ts) : minus(v.toFixed(2))}</text>`;
    }
    // distribution name
    out += `<text class="rrp-dist" x="${L}" y="${small ? TOP + 34 : TOP - 2}">${o.dist === 't' && o.df && o.df < 1000 ? 't' + sub(o.df) : 'Z'}</text>`;
    // verdict badge
    if (o.ts != null && s.verdict > 0) {
      const msg = o.inRR ? (small ? 'In the rejection region → reject H₀' : 'TS is in the rejection region → reject H₀') : (small ? 'Not in the region → fail to reject H₀' : 'TS is not in the rejection region → fail to reject H₀'), bw = Math.min(410, W - 16);
      out += `<g opacity="${Math.min(1, s.verdict * 2).toFixed(2)}"><rect class="rrp-badge ${o.inRR ? 'rrp-badge-reject' : 'rrp-badge-keep'}" x="${W / 2 - bw / 2}" y="${BASE + 30}" width="${bw}" height="28" rx="14"/><text class="rrp-badgetext" x="${W / 2}" y="${BASE + 49}" text-anchor="middle">${msg}</text></g>`;
    }
    return out;
  }

  function aria(o) {
    return `${o.dist === 't' && o.df ? 't distribution with ' + o.df + ' degrees of freedom' : 'Standard normal curve'}. Rejection region ${o.dir === 'gt' ? 'to the right of ' + fix3(o.crit) : o.dir === 'lt' ? 'to the left of ' + fix3(-o.crit) : 'beyond ' + fix3(-o.crit) + ' and ' + fix3(o.crit)} is shaded${o.ts == null ? '' : `; the test statistic ${tsText(o.ts)} is ${o.inRR ? 'in' : 'not in'} the rejection region, so ${o.inRR ? 'reject' : 'fail to reject'} H₀`}.`;
  }
  const FULL = { curve: 1, shade: 1, crit: 1, ts: 1, verdict: 1 };
  function picture(o, s) { return `<svg class="rrp" viewBox="0 0 ${o.W || 640} ${H}" role="img" aria-label="${esc(aria(o))}">${frame(o, s || FULL)}</svg>`; }
  function svg(raw) {
    const o = norm(raw);
    return `<div class="rr-anim" data-rr='${esc(JSON.stringify(o))}'>${picture(o)}</div>`;
  }

  /* ---------- the five steps, in words ---------- */
  function steps(o) {
    const tableCol = o.dir === 'ne' ? `column α/2${o.alpha ? ' = ' + Number((Number(o.alpha) / 2).toFixed(4)) : ''}` : `column α${o.alpha ? ' = ' + o.alpha : ''}`;
    const row = o.dist === 't' ? `row df = ${tableRow(o.df)}${tableRow(o.df) !== o.df ? ` (df = ${o.df} is not listed, so the next smaller row)` : ''}` : 'z* row';
    const sym = o.dist === 't' ? 't*' : 'z*';
    const rule = o.dir === 'gt' ? `TS ≥ ${fix3(o.crit)}` : o.dir === 'lt' ? `TS ≤ ${fix3(-o.crit)}` : `|TS| ≥ ${fix3(o.crit)}`;
    const list = [
      `Assume H₀ is true. Then the test statistic follows ${o.dist === 't' ? 'the t distribution with df = ' + o.df : 'the standard normal Z'}.`,
      `Shade the rejection region: the most extreme ${o.dir === 'ne' ? 'α, split α/2 into each tail' : 'α in the ' + (o.dir === 'gt' ? 'upper' : 'lower') + ' tail'} (the direction of Hₐ).`,
      `Critical value from the t-table: ${row}, ${tableCol}, so ${sym} = ${fix3(o.crit)}. Reject H₀ if ${rule}.`
    ];
    if (o.ts != null) {
      list.push(`Compute the test statistic: TS = ${tsText(o.ts)}.`);
      list.push(o.inRR ? `TS = ${tsText(o.ts)} is in the rejection region, so reject H₀.` : `TS = ${tsText(o.ts)} is not in the rejection region, so fail to reject H₀.`);
    }
    return list;
  }

  /* ---------- browser animation ---------- */
  const PHASES = ['curve', 'shade', 'crit', 'ts', 'verdict'], DUR = { curve: 900, shade: 1200, crit: 700, ts: 1500, verdict: 600 }, PAUSE = 350;
  function mount(el) {
    if (el.dataset.mounted) return; el.dataset.mounted = '1';
    let o; try { o = JSON.parse(el.dataset.rr); } catch (e) { return; }
    if (el.clientWidth && el.clientWidth < 480) o.W = 400;
    const W = o.W || 640, n = o.ts != null ? 5 : 3, words = steps(o), reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.innerHTML = `<div class="rr-stage"><svg class="rrp" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria(o))}"></svg></div>
      <div class="rr-controls"><button type="button" class="rr-play">▶ Play</button><button type="button" class="rr-step">Next step ›</button><span class="rr-count small muted" aria-live="polite"></span></div>
      <ol class="rr-steps">${words.map(w => `<li>${esc(w)}</li>`).join('')}</ol>`;
    const svgEl = el.querySelector('svg'), play = el.querySelector('.rr-play'), stepBtn = el.querySelector('.rr-step'), count = el.querySelector('.rr-count'), items = [...el.querySelectorAll('.rr-steps li')];
    let state = { curve: 0, shade: 0, crit: 0, ts: 0, verdict: 0 }, done = 0, raf = null, started = false;
    const draw = () => { svgEl.innerHTML = frame(o, state); items.forEach((li, i) => { li.classList.toggle('on', i < done); li.classList.toggle('now', i === done - 1); }); count.textContent = `Step ${done} of ${n}`; };
    const finishTo = k => { for (let i = 0; i < k; i++) state[PHASES[i]] = 1; for (let i = k; i < 5; i++) state[PHASES[i]] = 0; done = k; draw(); };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = null; };
    function animate(from, to, cb) {
      stop(); if (reduce) { finishTo(to); cb && cb(); return; }
      let i = from; const runPhase = () => {
        if (i >= to) { cb && cb(); return; }
        const ph = PHASES[i], t0 = performance.now(); done = i + 1;
        const tick = now => { state[ph] = Math.min(1, (now - t0) / DUR[ph]); draw(); if (state[ph] < 1) raf = requestAnimationFrame(tick); else { i++; raf = null; setTimeout(runPhase, i < to ? PAUSE : 0); } };
        raf = requestAnimationFrame(tick);
      };
      runPhase();
    }
    const label = () => { play.textContent = done >= n ? '↻ Replay' : started ? '▶ Play the rest' : '▶ Play'; stepBtn.disabled = done >= n; };
    play.addEventListener('click', () => { started = true; const from = done >= n ? 0 : done; if (from === 0) finishTo(0); play.disabled = true; animate(from, n, () => { play.disabled = false; label(); }); });
    stepBtn.addEventListener('click', () => { started = true; if (done >= n) return; play.disabled = true; stepBtn.disabled = true; animate(done, done + 1, () => { play.disabled = false; label(); }); });
    finishTo(0); label();
    // play automatically the first time it scrolls into view
    if ('IntersectionObserver' in root) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); if (!started) play.click(); } }, { threshold: 0.5 });
      io.observe(el);
    } else play.click();
    el.rrFinish = () => { stop(); finishTo(n); play.disabled = false; label(); };
  }
  function mountAll(scope) { (scope || root.document).querySelectorAll('.rr-anim:not([data-mounted])').forEach(mount); }

  const api = { svg, picture, steps, mount, mountAll, dnorm, dt, norm };
  root.RRPlot = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.document) {
    const start = () => { mountAll(); new MutationObserver(() => mountAll()).observe(root.document.body, { childList: true, subtree: true }); };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start); else start();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
