/* "Which method do I use?" — an interactive decision guide and a recognition drill (choose.html). */
(function () {
  'use strict';
  const tree = document.querySelector('#chooser'), drill = document.querySelector('#which-drill');
  if (!tree && !drill) return;
  const C = window.Course, render = el => C && C.renderMath && C.renderMath(el);
  const int = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = a => a[Math.floor(Math.random() * a.length)];

  const METHODS = {
    pci: { name: 'Confidence interval for a proportion p', link: 'module-7.html#proportion-ci',
      formula: '\\hat p \\pm z^*\\sqrt{\\dfrac{\\hat p(1-\\hat p)}{n}}', cond: 'A random sample, with at least 10 successes and 10 failures in the sample.',
      crit: 'z* row of the t-table, column (1 − C)/2. For 90%, 95%, 99%: 1.645, 1.960, 2.576.',
      ti: 'STAT ▸ TESTS ▸ A:1-PropZInt', excel: '=p̂ ± NORM.S.INV(1−(1−C)/2)*SQRT(p̂*(1−p̂)/n)', say: 'We are C% confident that the population proportion is between … and ….' },
    ptest: { name: 'Hypothesis test for a proportion p', link: 'module-8.html#proportion-test',
      formula: 'z=\\dfrac{\\hat p-p_0}{\\sqrt{p_0(1-p_0)/n}}', cond: 'A random sample, with np₀ ≥ 10 and n(1 − p₀) ≥ 10 (use p₀, the null value).',
      crit: 'z* row of the t-table, column α (one-sided) or α/2 (two-sided).', pv: 'From the normal table: the area beyond z in the direction of Hₐ (double it for ≠). Reject H₀ if p-value ≤ α.', ti: 'STAT ▸ TESTS ▸ 5:1-PropZTest (reports z and the p-value)', excel: '=NORM.S.INV(1−α) for z*; =1−NORM.S.DIST(z,TRUE) for an upper-tail p-value', say: 'There is / is not sufficient evidence at the α level that the proportion is greater than / less than / different from p₀.' },
    mci: { name: 'Confidence interval for a mean μ', link: 'module-7.html#mean-ci',
      formula: '\\bar x \\pm t^*\\dfrac{s}{\\sqrt n}', cond: 'A random sample, and no extreme skew or outliers.',
      crit: 't-table row df = n − 1 (next smaller row if not listed), column (1 − C)/2.', ti: 'STAT ▸ TESTS ▸ 8:TInterval', excel: '=CONFIDENCE.T(1−C, s, n) gives the margin', say: 'We are C% confident that the population mean is between … and ….' },
    mtest: { name: 'Hypothesis test for a mean μ', link: 'module-8.html#mean-test',
      formula: 't=\\dfrac{\\bar x-\\mu_0}{s/\\sqrt n}', cond: 'A random sample, and no extreme skew or outliers.',
      crit: 't-table row df = n − 1, column α (one-sided) or α/2 (two-sided).', pv: 'The exact area beyond t in the direction of Hₐ, with df = n − 1: tcdf on the TI-84 or T.DIST in Excel (T.DIST.2T for ≠). Reject H₀ if p-value ≤ α.', ti: 'STAT ▸ TESTS ▸ 2:T-Test (reports t and the p-value)', excel: '=T.INV(1−α, df) for t*; =T.DIST(t, df, TRUE) for a lower-tail p-value', say: 'There is / is not sufficient evidence at the α level that the mean is greater than / less than / different from μ₀.' },
    np: { name: 'Sample size for estimating p', link: 'module-7.html#sample-size',
      formula: 'n=\\left(\\dfrac{z^*}{m}\\right)^2 p^*(1-p^*)', cond: 'Use p* = 0.5 if there is no prior estimate. Always round up.',
      crit: 'z* for the confidence level (1.645, 1.960, 2.576).', ti: 'Arithmetic', excel: '=ROUNDUP((z/m)^2*p*(1−p),0)', say: 'Survey at least n people.' },
    nm: { name: 'Sample size for estimating μ', link: 'module-7.html#sample-size',
      formula: 'n=\\dfrac{4s^2}{m^2}', cond: '95% confidence (course rule, t* ≈ 2). Use a pilot s. Always round up.',
      crit: 'Built into the 4 (that is, 2²).', ti: 'Arithmetic', excel: '=ROUNDUP(4*s^2/m^2,0)', say: 'Take at least n observations.' }
  };
  const DIRS = { gt: 'Hₐ: greater than (>)', lt: 'Hₐ: less than (<)', ne: 'Hₐ: different from (≠)' };

  /* ---------- decision tree ---------- */
  if (tree) {
    const state = {};
    const Q = [
      { key: 'kind', q: 'What does each individual in the data give you?', opts: [['cat', 'A category: yes/no, success/failure, prefers A or B', 'That is a proportion problem: the parameter is p.'], ['num', 'A measured number: minutes, dollars, a score, a weight', 'That is a mean problem: the parameter is μ.']] },
      { key: 'goal', q: 'What does the question want?', opts: [['ci', 'A range of plausible values for the parameter (“estimate”, “with 95% confidence”)', 'A confidence interval.'], ['test', 'A verdict on a claim about one specific value (“is there evidence that…”, “test the claim…”)', 'A hypothesis test.'], ['n', 'How many to sample to reach a margin of error (“how large a sample…”)', 'A sample-size calculation.']] },
      { key: 'dir', q: 'Which way does the claim you are looking for evidence of point?', when: s => s.goal === 'test', opts: [['gt', 'More than, increased, higher, exceeds', 'Hₐ uses >.'], ['lt', 'Less than, decreased, lower, fewer (or a claim of “at least” that you doubt)', 'Hₐ uses <.'], ['ne', 'Different from, changed, is not', 'Hₐ uses ≠ (two-sided).']] }
    ];
    const methodKey = s => s.kind === 'cat' ? (s.goal === 'ci' ? 'pci' : s.goal === 'test' ? 'ptest' : 'np') : (s.goal === 'ci' ? 'mci' : s.goal === 'test' ? 'mtest' : 'nm');
    function draw() {
      const qs = Q.filter(x => !x.when || x.when(state));
      let html = '<ol class="chooser-steps">';
      for (const [i, x] of qs.entries()) {
        const ans = state[x.key];
        html += `<li class="chooser-q ${ans ? 'done' : ''}"><fieldset><legend>${x.q}</legend><div class="chooser-opts">${x.opts.map(([v, label]) => `<button type="button" data-k="${x.key}" data-v="${v}" aria-pressed="${ans === v}">${label}</button>`).join('')}</div>${ans ? `<p class="small chooser-note">${x.opts.find(o => o[0] === ans)[2]}</p>` : ''}</fieldset></li>`;
        if (!ans) break;
      }
      html += '</ol>';
      const done = qs.every(x => state[x.key]);
      if (done) {
        const m = METHODS[methodKey(state)];
        html += `<div class="chooser-result" role="status"><div class="eyebrow">Use this method</div><h3>${m.name}</h3>${state.dir ? `<p><strong>${DIRS[state.dir]}</strong>. Rejection region: ${state.dir === 'gt' ? 'TS ≥ critical value' : state.dir === 'lt' ? 'TS ≤ −critical value' : '|TS| ≥ critical value'}. p-value: ${state.dir === 'gt' ? 'the area to the right of TS' : state.dir === 'lt' ? 'the area to the left of TS' : 'twice the area beyond |TS|'}. Either method gives the same decision.</p>` : ''}<div class="formula"><span class="math">${m.formula}</span></div><dl class="chooser-facts"><dt>Conditions</dt><dd>${m.cond}</dd><dt>Critical value</dt><dd>${m.crit}</dd>${m.pv ? `<dt>p-value</dt><dd>${m.pv}</dd>` : ''}<dt>TI-84</dt><dd class="no-mathify">${m.ti}</dd><dt>Excel</dt><dd><code>${m.excel}</code></dd><dt>Conclusion</dt><dd>${m.say}</dd></dl><p><a href="${m.link}">Read this method in the notes →</a> · <button type="button" class="link-button" data-reset>Start over</button></p></div>`;
      }
      tree.innerHTML = html; render(tree);
    }
    tree.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-reset')) { for (const k in state) delete state[k]; draw(); tree.querySelector('button').focus(); return; }
      const k = b.dataset.k, i = Q.findIndex(x => x.key === k);
      state[k] = b.dataset.v; Q.slice(i + 1).forEach(x => delete state[x.key]);
      draw();
      const next = tree.querySelector('.chooser-q:not(.done) button') || tree.querySelector('.chooser-result h3');
      if (next) { if (next.tagName === 'H3') next.setAttribute('tabindex', '-1'); next.focus({ preventScroll: false }); }
    });
    draw();
  }

  /* ---------- recognition drill ---------- */
  const SCEN = [
    // proportion CI
    () => ({ m: 'pci', t: `A campus poll asks ${int(300, 900)} randomly chosen students whether they ate breakfast today. Estimate the percent of all students who did, with ${pick([90, 95, 99])}% confidence.`, why: 'Each student answers yes or no (a category), and the question wants a range of plausible values.' }),
    () => ({ m: 'pci', t: `In a random sample of ${int(150, 600)} phone owners, ${int(40, 70)}% had cracked screens. Give a range of plausible values for the proportion of all phone owners with cracked screens.`, why: 'Cracked or not is a category; “range of plausible values” means a confidence interval.' }),
    () => ({ m: 'pci', t: `A quality engineer inspects ${int(200, 500)} randomly chosen bolts and finds ${int(8, 30)} defective. What proportion of all bolts are defective? Answer with a ${pick([90, 95])}% interval.`, why: 'Defective or not is a category; an interval estimate is asked for.' }),
    // proportion test
    () => { const d = pick(['gt', 'lt', 'ne']), p0 = pick([20, 25, 40, 50, 60]); return { m: 'ptest', d, t: `A company says ${p0}% of its customers renew. A random sample of ${int(200, 500)} customers is used to see whether the renewal rate is ${d === 'gt' ? 'higher than' : d === 'lt' ? 'lower than' : 'different from'} ${p0}%.`, why: `Renew or not is a category, and the question asks for evidence about a specific claimed value (${p0}%). “${d === 'gt' ? 'Higher than' : d === 'lt' ? 'Lower than' : 'Different from'}” gives ${DIRS[d]}.` }; },
    () => ({ m: 'ptest', d: 'ne', t: `If people chose numbers truly at random, 10% would pick 7. In a random sample of ${int(150, 250)} people, is there evidence that the proportion choosing 7 is not 10%?`, why: 'Chose 7 or not is a category; “is there evidence … is not 10%” is a two-sided test.' }),
    () => ({ m: 'ptest', d: 'lt', t: `A poll of ${int(800, 1200)} randomly selected adults found 48% hold a certain view. A group claims fewer than half of all adults hold it. Can the claim be verified statistically?`, why: 'Holds the view or not is a category; “fewer than half” gives Hₐ: p < 0.5.' }),
    () => ({ m: 'ptest', d: 'gt', t: `A coin is flipped ${int(100, 300)} times to check whether it lands heads more often than half the time.`, why: 'Heads or tails is a category; “more often than half” gives Hₐ: p > 0.5.' }),
    // mean CI
    () => ({ m: 'mci', t: `A random sample of ${int(12, 40)} commuters reports their one-way commute time in minutes. Estimate the mean commute time of all commuters with ${pick([90, 95, 99])}% confidence.`, why: 'Commute time is a measured number, and the question wants an interval estimate of the mean.' }),
    () => ({ m: 'mci', t: `Researchers weigh ${int(15, 30)} randomly chosen bags of chips (grams). Give a range of plausible values for the average weight of all bags.`, why: 'Weight is measured, and a range of plausible values is a confidence interval for μ.' }),
    () => ({ m: 'mci', t: `For ${int(10, 25)} randomly selected days, a biologist measures dissolved oxygen (ppm) in a river. What is the river’s average oxygen level? Report a 90% interval.`, why: 'Oxygen level is a measured number; an interval estimate of the mean is requested.' }),
    // mean test
    () => { const d = pick(['gt', 'lt', 'ne']), mu = pick([30, 40, 500, 5, 25]); return { m: 'mtest', d, t: `A random sample of ${int(9, 30)} measurements is used to test whether the true mean is ${d === 'gt' ? 'greater than' : d === 'lt' ? 'less than' : 'different from'} ${mu} units.`, why: `The data are measurements, and the question is about a specific value of the mean. “${d === 'gt' ? 'Greater than' : d === 'lt' ? 'Less than' : 'Different from'}” gives ${DIRS[d]}.` }; },
    () => ({ m: 'mtest', d: 'lt', t: `Management claims entry-level workers earn at least $500 per week on average. A random sample of ${int(8, 15)} workers is collected to challenge the claim.`, why: 'Pay is a measured number. “At least $500” is the status quo, so it becomes H₀: μ = 500, and the challenge is Hₐ: μ < 500.' }),
    () => ({ m: 'mtest', d: 'ne', t: `The ideal fat intake is 30% of calories. For an SRS of ${int(100, 200)} nurses, test the claim that their average percent of calories from fat is not 30.`, why: 'Percent of calories is a measured number for each nurse; “is not 30” gives a two-sided test.' }),
    () => ({ m: 'mtest', d: 'gt', t: `A tutoring center says students who use it score higher than the department average of 72 on the final. Scores for a random sample of ${int(15, 40)} users are collected.`, why: 'A score is a measured number; “higher than 72” gives Hₐ: μ > 72.' }),
    // sample sizes
    () => ({ m: 'np', t: `A campaign wants to estimate the percent of voters who support a measure to within ±${pick([2, 3, 4])} percentage points with 95% confidence. How many voters should it survey?`, why: 'Support or not is a category, and the question asks how many to sample for a given margin of error.' }),
    () => ({ m: 'np', t: `How many students should be surveyed to estimate the proportion who use the library weekly within ±0.05, with 90% confidence and no prior estimate?`, why: 'A proportion, and a sample size for a target margin.' }),
    () => ({ m: 'nm', t: `A pilot study of fill weights gives s = ${int(6, 15)} grams. How many bags are needed to estimate the mean fill weight within ±${int(2, 4)} grams at 95% confidence?`, why: 'Weight is measured, and the question asks how many observations for a target margin: n = 4s²/m².' }),
    () => ({ m: 'nm', t: `To estimate average weekly study time within ±1 hour (95% confidence), how many students are needed if a pilot sample had s = ${int(3, 6)} hours?`, why: 'Study time is a measured number; a sample size for estimating μ.' })
  ];
  const ORDER = ['pci', 'ptest', 'mci', 'mtest', 'np', 'nm'];
  const LABEL = { pci: 'CI for p', ptest: 'Test for p', mci: 'CI for μ', mtest: 'Test for μ', np: 'Sample size for p', nm: 'Sample size for μ' };
  if (drill) {
    let cur = null, score = { right: 0, total: 0 }, last = -1;
    function next() {
      let k; do { k = Math.floor(Math.random() * SCEN.length); } while (k === last); last = k;
      cur = SCEN[k](); cur.pick = null; cur.dpick = null;
      drill.innerHTML = `<div class="question"><div class="small muted">Scenario ${score.total + 1}${score.total ? ` · ${score.right} of ${score.total} right so far` : ''}</div><p class="drill-text">${cur.t}</p>
        <fieldset class="drill-group"><legend class="small">Method</legend><div class="drill-opts">${ORDER.map(m => `<button type="button" data-m="${m}" aria-pressed="false">${LABEL[m]}</button>`).join('')}</div></fieldset>
        <fieldset class="drill-group" data-dir hidden><legend class="small">Direction of Hₐ</legend><div class="drill-opts">${Object.entries({ gt: '>', lt: '<', ne: '≠' }).map(([d, s]) => `<button type="button" data-d="${d}" aria-pressed="false">Hₐ uses ${s}</button>`).join('')}</div></fieldset>
        <div class="answer-row" style="margin-top:14px"><button class="primary" data-check disabled>Check</button></div><div class="drill-fb" aria-live="polite"></div></div>`;
      render(drill);
    }
    function sync() {
      drill.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === cur.pick)));
      drill.querySelectorAll('[data-d]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.d === cur.dpick)));
      const isTest = cur.pick === 'ptest' || cur.pick === 'mtest';
      drill.querySelector('[data-dir]').hidden = !isTest;
      drill.querySelector('[data-check]').disabled = !cur.pick || (isTest && !cur.dpick);
    }
    drill.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.m) { cur.pick = b.dataset.m; if (!(cur.pick === 'ptest' || cur.pick === 'mtest')) cur.dpick = null; sync(); }
      else if (b.dataset.d) { cur.dpick = b.dataset.d; sync(); }
      else if (b.hasAttribute('data-check')) {
        const okM = cur.pick === cur.m, okD = !cur.d || cur.dpick === cur.d, ok = okM && okD;
        score.total++; if (ok) score.right++;
        drill.querySelectorAll('.drill-opts button,[data-check]').forEach(x => { x.disabled = true; });
        const m = METHODS[cur.m];
        drill.querySelector('.drill-fb').innerHTML = `<div class="feedback ${ok ? 'correct' : ''}"><h4>${ok ? '✓ Right method.' : okM ? 'Right method, wrong direction.' : 'Not this one.'}</h4><p><strong>${m.name}${cur.d ? `, ${DIRS[cur.d]}` : ''}.</strong> ${cur.why}</p><div class="formula"><span class="math">${m.formula}</span></div><p class="small">${m.cond} <a href="${m.link}">See the notes →</a></p><button class="primary" data-next>Next scenario →</button></div>`;
        render(drill.querySelector('.drill-fb'));
      } else if (b.hasAttribute('data-next')) next();
    });
    next();
  }
  window.WhichMethod = { METHODS, SCEN };
})();
