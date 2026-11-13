/* Ported from stat2331-learn: multi-step, hand-first questions with mistake diagnosis. */
/* Module 6 practice: Sampling Distributions */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw, n = HandKit.tx;
  const f4 = x => S.fmt(x, 4);

  const PCTX = ["Bostonians who prefer the pizzeria's pizza", "saguaro cacti with nesting owls", "college-age Americans who vape", "adults who believe in evolution", "voters who support a bond measure", "SMU students who live on campus"];
  const MCTX = [
    { what: "weights of STAT 2331 students", unit: "pounds", mu: [145, 165, 0.1], sd: [30, 45, 0.1] },
    { what: "IQ scores of children with FAS", unit: "points", mu: [68, 72, 1], sd: [10, 14, 1] },
    { what: "adult dragonfly wingspans", unit: "inches", mu: [3.8, 4.2, 0.1], sd: [0.2, 0.3, 0.05] },
    { what: "daily screen time for teenagers", unit: "minutes", mu: [400, 480, 5], sd: [80, 140, 5] },
    { what: "fill amounts of soda bottles", unit: "mL", mu: [500, 510, 1], sd: [4, 10, 1] }
  ];
  const sentence = s => s[0].toUpperCase() + s.slice(1);

  // ---- mean, SD, and shape of p-hat ----
  function phatDist() {
    const p = R.int(5, 95) / 100, nn = R.pick([15, 20, 25, 30, 40, 50, 60, 80, 100, 150, 200, 400]);
    const sd = Math.sqrt(p * (1 - p) / nn);
    const ok = nn * p >= 10 && nn * (1 - p) >= 10;
    const ctx = R.pick(PCTX);
    return {
      prompt: `<p>Suppose ${Math.round(p * 100)}% of all ${ctx}. Take an SRS of ${nn} and let \\(\\hat p\\) be the sample proportion.</p>`,
      parts: [
        { type: "num", label: "\\(\\mu_{\\hat p}\\)", answer: p, tol: 0.0006, show: n(p) },
        { type: "num", label: "\\(\\sigma_{\\hat p}\\) (4 decimals)", answer: sd, tol: 0.0006, show: f4(sd),
          mistakes: [{ value: Math.sqrt(p * (1 - p)), msg: "Divide by \\(n\\) inside the square root: \\(\\sqrt{p(1-p)/n}\\)." }, { value: p * (1 - p) / nn, msg: "That is the variance. Take the square root." }, { value: Math.sqrt(nn * p * (1 - p)), msg: "That is the SD of the count \\(X\\). For the proportion, divide by \\(n\\): \\(\\sqrt{p(1-p)/n}\\)." }] },
        { type: "choice", label: "Can we use the normal approximation for \\(\\hat p\\)?", options: ["Yes: np ≥ 10 and n(1 − p) ≥ 10", "No: at least one of np, n(1 − p) is below 10"], answer: ok ? 0 : 1, fixed: true,
          why: { [ok ? 1 : 0]: `\\(np = ${n(nn * p)}\\) and \\(n(1-p) = ${n(nn * (1 - p))}\\). Both must be at least 10.` } }
      ],
      hand: [
        T`\(\mu_{\hat p} = p = ${n(p)}\). The sampling distribution is centered at the parameter.`,
        T`\(\sigma_{\hat p} = \sqrt{\dfrac{p(1-p)}{n}} = \sqrt{\dfrac{${n(p)}(${n(1 - p)})}{${nn}}} = ${f4(sd)}\).`,
        T`Check: \(np = ${nn}(${n(p)}) = ${n(nn * p)}\) and \(n(1-p) = ${n(nn * (1 - p))}\). ${ok ? "Both are at least 10, so \\(\\hat p\\) is approximately normal." : "At least one is below 10, so the normal approximation is not appropriate; use the binomial distribution for the count instead."}`
      ]
    };
  }

  // ---- minimum n ----
  function minN() {
    const p = R.int(5, 95) / 100;
    const n1 = 10 / p, n2 = 10 / (1 - p), need = Math.ceil(Math.max(n1, n2) - 1e-9);
    const small = Math.min(p, 1 - p);
    return {
      prompt: T`<p>The population proportion is \(p = ${n(p)}\). What is the smallest sample size for which the sampling distribution of \(\hat p\) is approximately normal?</p>`,
      parts: [{ type: "num", label: "Smallest \\(n\\)", answer: need, tol: 0.01, show: String(need),
        mistakes: [{ value: Math.ceil(Math.min(n1, n2) - 1e-9), msg: "Both conditions must hold, so use the larger of the two cutoffs." }, { value: Math.floor(Math.max(n1, n2)), msg: "Always round up. Rounding down leaves the condition just short of 10." }] }],
      hand: [
        T`Solve \(n(${n(p)}) \ge 10\): \(n \ge ${S.fmt(n1, 2)}\).`,
        T`Solve \(n(${n(1 - p)}) \ge 10\): \(n \ge ${S.fmt(n2, 2)}\).`,
        T`Both must hold, so take the larger, ${S.fmt(Math.max(n1, n2), 2)}, and round up: \(n = ${need}\). (It's always the smaller of \(p\) and \(1-p\), here ${n(small)}, that decides.)`
      ]
    };
  }

  // ---- probability for p-hat ----
  function phatProb() {
    let p, nn;
    do { p = R.int(10, 90) / 100; nn = R.pick([40, 50, 60, 80, 96, 100, 120, 150, 200, 250, 300]); } while (nn * p < 10 || nn * (1 - p) < 10);
    const sd = Math.sqrt(p * (1 - p) / nn);
    const type = R.pick(["lt", "gt", "bt"]);
    const z1 = R.int(-220, 120) / 100, z2 = Math.min(2.8, z1 + R.int(50, 200) / 100);
    const a = S.round(p + (type === "bt" ? z1 : R.pick([-1, 1]) * R.int(20, 240) / 100) * sd, 2), b = S.round(p + z2 * sd, 2);
    if (type === "bt" && b <= a) return phatProb();
    const N = HandKit.normalProb({ mu: p, sd, type, a, b, v: "\\hat p" });
    const wrongSd = Math.sqrt(p * (1 - p));
    const W = HandKit.normalProb({ mu: p, sd: wrongSd, type, a, b, v: "\\hat p" });
    const ctx = R.pick(PCTX);
    const phr = { lt: `less than ${n(a)}`, gt: `more than ${n(a)}`, bt: `between ${n(a)} and ${n(b)}` }[type];
    return {
      prompt: `<p>${Math.round(p * 100)}% of all ${ctx}. In an SRS of ${nn}, what is the probability the sample proportion is <strong>${phr}</strong>?</p>`,
      parts: [
        { type: "num", label: "\\(\\sigma_{\\hat p}\\) (4 decimals)", answer: sd, tol: 0.0006, show: f4(sd), mistakes: [{ value: wrongSd, msg: "Divide by \\(n\\) inside the square root." }] },
        { type: "num", label: `\\(${N.sym}\\) (4 decimals)`, answer: N.tab, alts: [N.exact], tol: 0.0025, show: `${f4(N.tab)} (table) or ${f4(N.exact)} (software)`,
          mistakes: [...N.mistakes, { value: W.exact, tol: 0.003, msg: "You standardized with \\(\\sqrt{p(1-p)}\\). Divide by \\(\\sigma_{\\hat p} = \\sqrt{p(1-p)/n}\\), the SD of the sampling distribution." }] }
      ],
      hand: [
        T`Check: \(np = ${n(nn * p)}\) and \(n(1-p) = ${n(nn * (1 - p))}\) are both at least 10, so \(\hat p \approx N(p, \sigma_{\hat p})\).`,
        T`\(\mu_{\hat p} = ${n(p)}\), \(\sigma_{\hat p} = \sqrt{${n(p)}(${n(1 - p)})/${nn}} = ${f4(sd)}\).`,
        ...N.steps
      ],
      figure: N.figure, after: N.after,
      ti: `Store ${HandUI.screen(`${n(p)}→A`)} and ${HandUI.screen(`√(${n(p)}*${n(1 - p)}/${nn})→B`)}, then ${HandUI.screen(type === "lt" ? `normalcdf(-E99,${n(a)},A,B)` : type === "gt" ? `normalcdf(${n(a)},E99,A,B)` : `normalcdf(${n(a)},${n(b)},A,B)`)} = ${f4(N.exact)}`,
      excel: `A1: <code>${n(p)}</code>, A2: <code>=SQRT(A1*(1-A1)/${nn})</code>` + HandUI.xl(type === "lt" ? `=NORM.DIST(${n(a)},A1,A2,TRUE)` : type === "gt" ? `=1-NORM.DIST(${n(a)},A1,A2,TRUE)` : `=NORM.DIST(${n(b)},A1,A2,TRUE)-NORM.DIST(${n(a)},A1,A2,TRUE)`, f4(N.exact))
    };
  }

  // ---- probability for x-bar ----
  function xbarProb() {
    const c = R.pick(MCTX);
    const mu = R.step(c.mu[0], c.mu[1], c.mu[2]), sig = R.step(c.sd[0], c.sd[1], c.sd[2]);
    const normalPop = R.coin(0.4);
    const nn = normalPop ? R.pick([4, 9, 16, 25]) : R.pick([30, 36, 40, 49, 64, 100]);
    const se = sig / Math.sqrt(nn);
    const type = R.pick(["lt", "gt", "bt"]);
    const z1 = R.int(-250, 100) / 100, z2 = Math.min(2.8, z1 + R.int(60, 220) / 100);
    const a = S.round(mu + (type === "bt" ? z1 : R.pick([-1, 1]) * R.int(30, 240) / 100) * se, 2), b = S.round(mu + z2 * se, 2);
    if (type === "bt" && b <= a) return xbarProb();
    const N = HandKit.normalProb({ mu, sd: se, type, a, b, v: "\\bar x" });
    const W = HandKit.normalProb({ mu, sd: sig, type, a, b, v: "\\bar x" });
    const phr = { lt: `less than ${n(a)}`, gt: `greater than ${n(a)}`, bt: `between ${n(a)} and ${n(b)}` }[type];
    return {
      prompt: `<p>${sentence(c.what)} ${normalPop ? "are normally distributed" : "have an unknown distribution shape"} with \\(\\mu = ${n(mu)}\\) and \\(\\sigma = ${n(sig)}\\) ${c.unit}. For an SRS of \\(n = ${nn}\\), what is the probability the sample mean is <strong>${phr}</strong> ${c.unit}?</p>`,
      parts: [
        { type: "num", label: "\\(\\sigma_{\\bar x}\\) (4 decimals)", answer: se, tol: Math.max(0.0006, se * 0.002), show: f4(se), mistakes: [{ value: sig / nn, msg: "Divide by \\(\\sqrt n\\), not \\(n\\)." }, { value: sig, msg: "That is the population SD. The sample mean varies less: \\(\\sigma/\\sqrt n\\)." }] },
        { type: "num", label: `\\(${N.sym}\\) (4 decimals)`, answer: N.tab, alts: [N.exact], tol: 0.0025, show: `${f4(N.tab)} (table) or ${f4(N.exact)} (software)`,
          mistakes: [...N.mistakes, { value: W.exact, tol: 0.003, msg: "You standardized with \\(\\sigma\\). For a sample mean, divide by \\(\\sigma_{\\bar x} = \\sigma/\\sqrt n\\)." }, { value: W.tab, tol: 0.003, msg: "You standardized with \\(\\sigma\\). For a sample mean, divide by \\(\\sigma_{\\bar x} = \\sigma/\\sqrt n\\)." }] }
      ],
      hand: [
        normalPop ? "The population is normal, so \\(\\bar x\\) is exactly normal for any \\(n\\)." : T`The population shape is unknown, but \(n = ${nn} \ge 30\), so by the CLT \(\bar x\) is approximately normal.`,
        T`\(\mu_{\bar x} = ${n(mu)}\) and \(\sigma_{\bar x} = \dfrac{${n(sig)}}{\sqrt{${nn}}} = ${f4(se)}\).`,
        ...N.steps
      ],
      figure: N.figure, after: N.after,
      ti: `Store ${HandUI.screen(`${n(mu)}→A`)} and ${HandUI.screen(`${n(sig)}/√(${nn})→B`)}, then ${HandUI.screen(type === "lt" ? `normalcdf(-E99,${n(a)},A,B)` : type === "gt" ? `normalcdf(${n(a)},E99,A,B)` : `normalcdf(${n(a)},${n(b)},A,B)`)} = ${f4(N.exact)}`,
      excel: `A1: <code>${n(mu)}</code>, A2: <code>=${n(sig)}/SQRT(${nn})</code>` + HandUI.xl(type === "lt" ? `=NORM.DIST(${n(a)},A1,A2,TRUE)` : type === "gt" ? `=1-NORM.DIST(${n(a)},A1,A2,TRUE)` : `=NORM.DIST(${n(b)},A1,A2,TRUE)-NORM.DIST(${n(a)},A1,A2,TRUE)`, f4(N.exact))
    };
  }

  // ---- middle C% of sample means or proportions ----
  function middle() {
    const C = R.pick([0.80, 0.90, 0.95, 0.99]);
    const zs = { 0.80: 1.282, 0.90: 1.645, 0.95: 1.960, 0.99: 2.576 }[C];
    const zt = { 0.80: 1.28, 0.90: 1.645, 0.95: 1.96, 0.99: 2.575 }[C];
    let center, se, label, setup, unit = "";
    if (R.coin()) {
      const c = R.pick(MCTX), mu = R.step(c.mu[0], c.mu[1], c.mu[2]), sig = R.step(c.sd[0], c.sd[1], c.sd[2]), nn = R.pick([36, 49, 64, 100]);
      center = mu; se = sig / Math.sqrt(nn); label = "\\bar x"; unit = c.unit;
      setup = { prompt: `${sentence(c.what)} have \\(\\mu = ${n(mu)}\\) and \\(\\sigma = ${n(sig)}\\) ${c.unit}. For SRSs of size ${nn}, between which two values do the <strong>middle ${Math.round(C * 100)}%</strong> of sample means fall?`,
        first: T`\(n = ${nn} \ge 30\), so by the CLT \(\bar x \approx N(${n(mu)},\ ${n(sig)}/\sqrt{${nn}}) = N(${n(mu)},\ ${f4(se)})\).` };
    } else {
      let p, nn; do { p = R.int(15, 85) / 100; nn = R.pick([60, 96, 100, 150, 200, 400]); } while (nn * p < 10 || nn * (1 - p) < 10);
      center = p; se = Math.sqrt(p * (1 - p) / nn); label = "\\hat p";
      setup = { prompt: `${Math.round(p * 100)}% of all ${R.pick(PCTX)}. For SRSs of size ${nn}, between which two values do the <strong>middle ${Math.round(C * 100)}%</strong> of sample proportions fall?`,
        first: T`\(np = ${n(nn * p)}\) and \(n(1-p) = ${n(nn * (1 - p))}\) are at least 10, so \(\hat p \approx N(${n(p)},\ ${f4(se)})\).` };
    }
    const lo = center - zs * se, hi = center + zs * se, tol = Math.max(0.0012, se * 0.012);
    return {
      prompt: `<p>${setup.prompt}</p>`,
      parts: [
        { type: "num", label: `Lower value (4 decimals)`, answer: lo, alts: [center - zt * se], tol, show: f4(lo) },
        { type: "num", label: `Upper value (4 decimals)`, answer: hi, alts: [center + zt * se], tol, show: f4(hi) }
      ],
      hand: [
        setup.first,
        `Middle ${Math.round(C * 100)}% leaves ${S.num((1 - C) / 2, 4)} in each tail, so \\(z = \\pm ${zs}\\) (bottom row of the t table, or \\(\\pm ${zt}\\) from the normal table).`,
        T`\(${n(center)} \pm ${zs}(${f4(se)})\) gives \((${f4(lo)},\ ${f4(hi)})\)${unit ? " " + unit : ""}.`
      ],
      ti: `${HandUI.screen(`invNorm(${n((1 - C) / 2, 4)},A,B)`)} and ${HandUI.screen(`invNorm(${n(1 - (1 - C) / 2, 4)},A,B)`)} with the mean in A and SD in B.`,
      excel: HandUI.xl(`=NORM.INV(${n((1 - C) / 2, 4)},A1,A2)`, f4(center - S.qnorm(1 - (1 - C) / 2) * se)) + HandUI.xl(`=NORM.INV(${n(1 - (1 - C) / 2, 4)},A1,A2)`, f4(center + S.qnorm(1 - (1 - C) / 2) * se))
    };
  }

  // ---- when is x-bar normal? ----
  function cltWhen() {
    const pops = [["normally distributed", true], ["strongly right-skewed", false], ["left-skewed", false], ["of unknown shape", false], ["bimodal", false], ["approximately normal", true]];
    const [shape, isNormal] = R.pick(pops);
    const nn = R.pick([5, 8, 10, 15, 20, 25, 30, 36, 50, 100]);
    const ans = isNormal ? 0 : nn >= 30 ? 1 : 2;
    const opts = ["Exactly (or very nearly) normal for any n", "Approximately normal by the CLT", "Unknown; we can't use the normal model"];
    const why = isNormal ? "A normal population gives a normal sampling distribution for \\(\\bar x\\) at every sample size." : nn >= 30 ? `The population isn't normal, but \\(n = ${nn} \\ge 30\\), so the CLT applies.` : `The population isn't normal and \\(n = ${nn} < 30\\), so the shape of the sampling distribution is unknown.`;
    return {
      prompt: `<p>A population is ${shape}. An SRS of size \\(n = ${nn}\\) is taken. What can we say about the sampling distribution of \\(\\bar x\\)?</p>`,
      parts: [{ type: "choice", label: "Sampling distribution of \\(\\bar x\\)", options: opts, answer: ans, fixed: true, why: Object.fromEntries([0, 1, 2].filter(i => i !== ans).map(i => [i, why])) }],
      hand: ["First ask whether the population is normal. If so, \\(\\bar x\\) is normal for every \\(n\\).", "If not, check \\(n\\): at least 30 means approximately normal (CLT); under 30 means unknown.", why]
    };
  }

  // ---- effect of n on spread ----
  function nChange() {
    const k = R.pick([4, 9, 16, 25, 100]), sig = R.int(6, 60), nn = R.pick([10, 16, 20, 25, 36]);
    const se1 = sig / Math.sqrt(nn), se2 = sig / Math.sqrt(nn * k);
    return {
      prompt: T`<p>A population has \(\sigma = ${sig}\). With samples of size ${nn}, \(\sigma_{\bar x} = ${f4(se1)}\). If the sample size is multiplied by ${k}, what is the new \(\sigma_{\bar x}\)?</p>`,
      parts: [{ type: "num", label: "New \\(\\sigma_{\\bar x}\\) (4 decimals)", answer: se2, tol: 0.0011, show: f4(se2),
        mistakes: [{ value: se1 / k, msg: `The SD shrinks by \\(\\sqrt{${k}} = ${Math.sqrt(k)}\\), not by ${k}.` }, { value: se1, msg: "A larger sample makes \\(\\bar x\\) less variable." }] }],
      hand: [T`\(\sigma_{\bar x} = \sigma/\sqrt n\). Multiplying \(n\) by ${k} divides \(\sigma_{\bar x}\) by \(\sqrt{${k}} = ${Math.sqrt(k)}\).`, T`\(${f4(se1)} / ${Math.sqrt(k)} = ${f4(se2)}\). Check: \(${sig}/\sqrt{${nn * k}} = ${f4(se2)}\).`]
    };
  }

  HandKit.mount("#practice-app", {
    module: 6,
    skills: [
      { id: "m6-phat", title: "Mean, SD, and shape of p̂", gen: phatDist },
      { id: "m6-minn", title: "Smallest n for a normal p̂", gen: minN },
      { id: "m6-phatprob", title: "Probabilities for p̂", gen: phatProb },
      { id: "m6-xbarprob", title: "Probabilities for x̄", gen: xbarProb },
      { id: "m6-middle", title: "Middle C% of a sampling distribution", gen: middle },
      { id: "m6-clt", title: "When is x̄ normal? (CLT)", gen: cltWhen },
      { id: "m6-nchange", title: "Sample size and spread", gen: nChange }
    ]
  });

})();
