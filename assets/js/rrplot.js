/* Rejection-region picture for a z or t test, in the style of the Module 8 slides:
   the curve, the shaded rejection region (area α), the critical value(s), and the test statistic.
   RRPlot.svg({ dist: 'z' | 't', df, dir: 'gt' | 'lt' | 'ne', crit, ts, alpha })
   Works in the browser (window.RRPlot) and in Node (the build expands notes placeholders). */
(function (root) {
  'use strict';
  const lgamma = x => { // Lanczos
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1; let a = c[0]; const t = x + g + 0.5; for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  };
  const dnorm = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  const dt = (x, v) => Math.exp(lgamma((v + 1) / 2) - lgamma(v / 2) - 0.5 * Math.log(v * Math.PI) - (v + 1) / 2 * Math.log(1 + x * x / v));
  const fmt = (v, d = 3) => { const s = Number(v.toFixed(d)).toString(); return s.replace('-', '−'); };
  const fix3 = v => v.toFixed(3).replace('-', '−');
  const sub = n => String(n).split('').map(ch => '₀₁₂₃₄₅₆₇₈₉'[ch] || ch).join('');

  function svg(o) {
    const dist = o.dist || 'z', df = o.df, dir = o.dir || 'gt', crit = Math.abs(o.crit), ts = o.ts == null ? null : Number(o.ts);
    const pdf = dist === 't' && df < 1000 ? x => dt(x, df) : dnorm;
    const W = 640, H = 230, L = 30, Rt = 610, base = 170, top = 52;
    let lo = -4, hi = 4;
    if (ts != null) { if (ts > hi - 0.6) hi = ts + 0.9; if (ts < lo + 0.6) lo = ts - 0.9; }
    const X = v => L + (v - lo) / (hi - lo) * (Rt - L), peak = pdf(0), Y = v => base - pdf(v) / peak * (base - top);
    const curvePts = (a, b, k = 160) => { let s = ''; for (let i = 0; i <= k; i++) { const v = a + (b - a) * i / k; s += `${i ? 'L' : 'M'}${X(v).toFixed(1)},${Y(v).toFixed(1)}`; } return s; };
    const shade = (a, b) => `<path class="rrp-shade" d="${curvePts(a, b, 60)}L${X(b).toFixed(1)},${base}L${X(a).toFixed(1)},${base}Z"/>`;
    const sym = dist === 't' ? 't*' : 'z*';
    let out = '';
    if (dir !== 'lt') out += shade(crit, hi);
    if (dir !== 'gt') out += shade(lo, -crit);
    out += `<path class="rrp-curve" d="${curvePts(lo, hi)}"/>`;
    out += `<line class="rrp-axis" x1="${L}" y1="${base}" x2="${Rt}" y2="${base}"/><path class="rrp-axis-arrow" d="M${Rt},${base - 4}L${Rt + 8},${base}L${Rt},${base + 4}Z"/>`;
    // ticks
    const span = hi - lo, step = span <= 10 ? 1 : span <= 20 ? 3 : span <= 40 ? 5 : 10;
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) {
      out += `<line class="rrp-tick" x1="${X(v).toFixed(1)}" y1="${base}" x2="${X(v).toFixed(1)}" y2="${base + 5}"/><text class="rrp-ticklabel" x="${X(v).toFixed(1)}" y="${base + 20}" text-anchor="middle">${fmt(v, 0)}</text>`;
    }
    // critical values
    const crits = dir === 'gt' ? [crit] : dir === 'lt' ? [-crit] : [-crit, crit];
    crits.forEach(c => {
      out += `<line class="rrp-crit" x1="${X(c).toFixed(1)}" y1="${Math.min(Y(c) - 26, base - 30).toFixed(1)}" x2="${X(c).toFixed(1)}" y2="${base}"/>`;
      const near = ts != null && Math.abs(X(ts) - X(c)) < 60, right = near ? X(ts) < X(c) : c > 0;
      const lx = Math.max(L + 30, Math.min(Rt - 30, X(c) + (right ? 6 : -6)));
      out += `<text class="rrp-critlabel" x="${lx.toFixed(1)}" y="${(Math.min(Y(c) - 30, base - 34)).toFixed(1)}" text-anchor="${right ? 'start' : 'end'}">${fix3(c)}</text>`;
    });
    // test statistic
    if (ts != null) {
      const x = X(ts), anchor = x > Rt - 70 ? 'end' : x < L + 70 ? 'start' : 'middle';
      out += `<line class="rrp-ts" x1="${x.toFixed(1)}" y1="34" x2="${x.toFixed(1)}" y2="${base}"/><text class="rrp-tslabel" x="${x.toFixed(1)}" y="26" text-anchor="${anchor}">TS = ${fmt(ts, Math.abs(ts) >= 10 ? 2 : 3)}</text>`;
    }
    // distribution name and region labels
    out += `<text class="rrp-dist" x="${L + 4}" y="${top - 18}">${dist === 't' ? (df >= 1000 ? 'Z' : 't' + sub(df)) : 'Z'}</text>`;
    out += `<text class="rrp-note" x="${(L + Rt) / 2}" y="${base + 44}" text-anchor="middle">Shaded: rejection region (${dir === 'ne' ? 'both tails, ' : ''}area ${o.alpha != null ? 'α = ' + o.alpha : 'α'}). Reject H₀ if ${dir === 'gt' ? `TS ≥ ${fix3(crit)}` : dir === 'lt' ? `TS ≤ ${fix3(-crit)}` : `|TS| ≥ ${fix3(crit)}`}.</text>`;
    const inRR = ts == null ? null : dir === 'gt' ? ts >= crit : dir === 'lt' ? ts <= -crit : Math.abs(ts) >= crit;
    const aria = `${dist === 't' ? 't distribution with ' + df + ' degrees of freedom' : 'Standard normal curve'}; rejection region ${dir === 'gt' ? 'to the right of ' + fmt(crit) : dir === 'lt' ? 'to the left of ' + fmt(-crit) : 'beyond ' + fmt(-crit) + ' and ' + fmt(crit)} is shaded${ts == null ? '' : `; the test statistic ${fmt(ts)} is ${inRR ? 'in' : 'not in'} the rejection region`}.`;
    return `<svg class="rrp" viewBox="0 0 ${W} ${H}" role="img" aria-label="${aria}">${out}</svg>`;
  }
  const api = { svg, dnorm, dt };
  root.RRPlot = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
