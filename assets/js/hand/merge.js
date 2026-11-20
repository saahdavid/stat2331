/* Merge the multi-step questions into the course skills.

   Every skill keeps its id and title (so saved mastery carries over). Where a multi-step
   version exists, a fresh question is drawn from it about two times in three, and from the
   original single-answer generator otherwise, so students see more variety. */
(function (root) {
  'use strict';
  const C = root.Course, H = root.HandSets || {};
  if (!C || !C.questions) return;
  const SHARE = 0.65;

  // course skill id → multi-step generator id(s)
  const MAP = {
    1: { 'm1-types': ['m1-vartype'], 'm1-parameter': ['m1-paramstat'], 'm1-proportion': ['m1-relfreq'], 'm1-center': ['m1-center'], 'm1-sd': ['m1-sd'], 'm1-quartiles': ['m1-fivenum'], 'm1-fences': ['m1-outliers'], 'm1-shape': ['m1-shape'] },
    2: { 'm2-roles': ['m2-roles'], 'm2-rows': ['m2-twoway'], 'm2-r': ['m2-corr'], 'm2-predict': ['m2-predict'], 'm2-line': ['m2-line'], 'm2-r2': ['m2-r2'], 'm2-range': ['m2-extrap'], 'm2-lurking': ['m2-lurking'] },
    3: { 'm3-study': ['m3-study'], 'm3-sampling': ['m3-sampling'], 'm3-bias': ['m3-bias'], 'm3-design': ['m3-design'], 'm3-elements': ['m3-elements'], 'm3-treatments': ['m3-treatments'], 'm3-systematic': ['m3-systematic'] },
    4: { 'm4-table': ['m4-table'], 'm4-independent': ['m4-indep'], 'm4-tree': ['m4-tree'], 'm4-atleast': ['m4-atleast'], 'm4-without': ['m4-noreplace'], 'm4-discrete': ['m4-discrete'], 'm4-uniform': ['m4-uniform'] },
    5: { 'm5-empirical': ['m5-empirical'], 'm5-z': ['m5-z'], 'm5-normal': ['m5-normprob'], 'm5-inverse': ['m5-inverse'], 'm5-bins': ['m5-bins'], 'm5-binomial': ['m5-binom'], 'm5-moments': ['m5-binom-musd'], 'm5-approx': ['m5-approx'] },
    6: { 'm6-phat': ['m6-phat'], 'm6-minn': ['m6-minn'], 'm6-phatprob': ['m6-phatprob'], 'm6-xbarprob': ['m6-xbarprob'], 'm6-middle': ['m6-middle'], 'm6-clt': ['m6-clt'], 'm6-spread': ['m6-nchange'] },
    7: { 'm7-pci': ['m7-cip'], 'm7-tstar': ['m7-tstar'], 'm7-muci': ['m7-cimu'], 'm7-read': ['m7-interval'], 'm7-np': ['m7-n-p'], 'm7-nmu': ['m7-n-mu'], 'm7-interpret': ['m7-interp'], 'm7-margin': ['m7-margin'] },
    8: { 'm8-hypotheses': ['m8-hyp'], 'm8-ztest': ['m8-ztest'], 'm8-ttest': ['m8-ttest'], 'm8-decision': ['m8-decide'], 'm8-errors': ['m8-errors'], 'm8-power': ['m8-power'], 'm8-ci': ['m8-citest', 'm8-practical'], 'm8-pval': ['m8-pv'] }
  };

  // \( … \) and \[ … \] → the .math spans that Course.renderMath typesets
  const tex = s => s == null ? s : String(s)
    .replace(/\\\[([\s\S]*?)\\\]/g, (m, t) => `<span class="math display">${t}</span>`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (m, t) => `<span class="math">${t}</span>`);

  function solution(q) {
    let h = '';
    if (q.figure) h += `<figure class="hand-figure">${q.figure}</figure>`;
    const steps = Array.isArray(q.hand) ? q.hand : [q.hand];
    h += `<ol>${steps.map(s => `<li>${tex(s)}</li>`).join('')}</ol>`;
    if (q.after) h += `<div class="tip">${tex(q.after)}</div>`;
    return h;
  }

  function adapt(q) {
    return {
      multi: true,
      prompt: tex(q.prompt),
      parts: q.parts.map(p => Object.assign({}, p, {
        label: tex(p.label),
        options: p.options && p.options.map(tex),
        why: p.why && Object.fromEntries(Object.entries(p.why).map(([k, v]) => [k, tex(v)])),
        whyRight: tex(p.whyRight),
        mistakes: (p.mistakes || []).map(m => Object.assign({}, m, { msg: tex(m.msg) }))
      })),
      solution: solution(q),
      ti: q.ti ? tex(q.ti) : '',
      excel: q.excel ? tex(q.excel) : ''
    };
  }

  for (const [m, skills] of Object.entries(C.questions)) {
    const sets = H[m] || [], map = MAP[m] || {};
    for (const skill of skills) {
      const ids = map[skill.id];
      if (!ids) continue;
      const gens = ids.map(id => (sets.find(s => s.id === id) || {}).gen).filter(Boolean);
      if (!gens.length) continue;
      const original = skill.generate;
      skill.sources = { original, steps: gens.map(g => () => adapt(g())) };
      skill.generate = () => Math.random() < SHARE
        ? skill.sources.steps[Math.floor(Math.random() * gens.length)]()
        : original();
    }
  }
  C.tex = tex;
})(globalThis);
