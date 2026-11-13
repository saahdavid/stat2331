/* Ported from stat2331-learn: multi-step, hand-first questions with mistake diagnosis. */
/* Module 5 practice: Normal & Binomial Distributions */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw, n = HandKit.tx;
  const f4 = x => S.fmt(x, 4);

  const NCTX = [
    { what: "adult dragonfly wingspans", unit: "inches", mu: [3.5, 4.5, 0.25], sd: [0.2, 0.4, 0.05] },
    { what: "SAT math scores", unit: "points", mu: [500, 560, 10], sd: [90, 120, 5] },
    { what: "adult female heights", unit: "inches", mu: [63, 66, 0.5], sd: [2.5, 3.5, 0.5] },
    { what: "pregnancy lengths", unit: "days", mu: [264, 270, 1], sd: [14, 18, 1] },
    { what: "commute times for SMU students", unit: "minutes", mu: [20, 35, 1], sd: [4, 9, 1] },
    { what: "systolic blood pressure for young adults", unit: "mm Hg", mu: [110, 125, 1], sd: [8, 15, 1] }
  ];
  function pickNormal() {
    const c = R.pick(NCTX);
    const mu = R.step(c.mu[0], c.mu[1], c.mu[2]), sd = R.step(c.sd[0], c.sd[1], c.sd[2]);
    return { c, mu, sd };
  }
  // a value whose z lands on a 2-decimal grid point, so the hand method is clean
  const valAt = (mu, sd, z) => S.round(mu + z * sd, 4);

  // ---- empirical rule ----
  const AREA_TO = { 1: 0.34, 2: 0.475, 3: 0.4985 };
  function empirical() {
    const { c, mu, sd } = pickNormal();
    if (R.coin(0.4)) {
      const k = R.int(1, 3), pct = { 1: "68%", 2: "95%", 3: "99.7%" }[k];
      return {
        prompt: `<p>${c.what[0].toUpperCase() + c.what.slice(1)} are approximately normal with mean ${n(mu)} and standard deviation ${n(sd)} ${c.unit}.</p><p>The middle ${pct} fall between which two values?</p>`,
        parts: [
          { type: "num", label: "Lower value", answer: mu - k * sd, tol: sd * 0.01, show: n(mu - k * sd), mistakes: [{ value: mu - sd, msg: `Use ${k} standard deviation${k > 1 ? "s" : ""} for ${pct}.` }] },
          { type: "num", label: "Upper value", answer: mu + k * sd, tol: sd * 0.01, show: n(mu + k * sd), mistakes: [{ value: mu + sd, msg: `Use ${k} standard deviation${k > 1 ? "s" : ""} for ${pct}.` }] }
        ],
        hand: [`${pct} fall within ${k} standard deviation${k > 1 ? "s" : ""} of the mean.`, T`\(\mu \pm ${k}\sigma = ${n(mu)} \pm ${k}(${n(sd)})\), which gives ${n(mu - k * sd)} to ${n(mu + k * sd)} ${c.unit}.`]
      };
    }
    // proportion between μ−aσ and μ+bσ, or above μ−aσ
    const kind = R.int(0, 1);
    if (kind === 0) {
      const a = R.int(1, 3), b = R.int(1, 3);
      const ans = AREA_TO[a] + AREA_TO[b];
      return {
        prompt: `<p>${c.what[0].toUpperCase() + c.what.slice(1)} are approximately \\(N(${n(mu)}, ${n(sd)})\\). Using the 68-95-99.7 rule, what proportion fall between ${n(mu - a * sd)} and ${n(mu + b * sd)} ${c.unit}?</p>`,
        parts: [{ type: "num", label: "Proportion", answer: ans, tol: 0.0006, show: S.num(ans, 4) }],
        hand: [T`${n(mu - a * sd)} is \(${a}\sigma\) below the mean and ${n(mu + b * sd)} is \(${b}\sigma\) above it.`,
          T`From the mean to \(${a}\sigma\) below: half of ${{ 1: "0.68", 2: "0.95", 3: "0.997" }[a]} = ${AREA_TO[a]}. From the mean to \(${b}\sigma\) above: ${AREA_TO[b]}.`,
          T`Add the two pieces: \(${AREA_TO[a]} + ${AREA_TO[b]} = ${S.num(ans, 4)}\).`]
      };
    }
    const a = R.int(1, 3), above = R.coin();
    const ans = above ? 0.5 + AREA_TO[a] : 0.5 - AREA_TO[a];
    const x = mu - a * sd;
    return {
      prompt: `<p>${c.what[0].toUpperCase() + c.what.slice(1)} are approximately \\(N(${n(mu)}, ${n(sd)})\\). Using the 68-95-99.7 rule, what proportion are ${above ? "above" : "below"} ${n(x)} ${c.unit}?</p>`,
      parts: [{ type: "num", label: "Proportion", answer: ans, tol: 0.0006, show: S.num(ans, 4), mistakes: [{ value: 1 - ans, msg: `Check the direction: you found the proportion ${above ? "below" : "above"} the value.` }] }],
      hand: [T`${n(x)} is \(${a}\sigma\) below the mean.`, T`Between it and the mean: \(${AREA_TO[a]}\). Half the distribution is above the mean: 0.5.`,
        above ? T`Above ${n(x)}: \(${AREA_TO[a]} + 0.5 = ${S.num(ans, 4)}\).` : T`Below ${n(x)}: \(0.5 - ${AREA_TO[a]} = ${S.num(ans, 4)}\).`]
    };
  }

  // ---- z-scores ----
  function zscore() {
    const { c, mu, sd } = pickNormal();
    const z = R.pick([-1, 1]) * R.int(5, 280) / 100;
    const x = valAt(mu, sd, z);
    const zz = (x - mu) / sd;
    if (R.coin(0.35)) {
      return {
        prompt: `<p>${c.what[0].toUpperCase() + c.what.slice(1)} have mean ${n(mu)} and standard deviation ${n(sd)} ${c.unit}. What value has \\(z = ${n(z, 2)}\\)?</p>`,
        parts: [{ type: "num", label: `Value (${c.unit})`, answer: x, tol: Math.max(0.006, sd * 0.002), show: n(x), mistakes: [{ value: mu - z * sd, msg: "Check the sign: a positive z is above the mean." }, { value: z * sd, msg: "Add the mean: \\(x = \\mu + z\\sigma\\)." }] }],
        hand: [T`\(x = \mu + z\sigma = ${n(mu)} + (${n(z, 2)})(${n(sd)}) = ${n(x)}\) ${c.unit}.`]
      };
    }
    return {
      prompt: `<p>${c.what[0].toUpperCase() + c.what.slice(1)} have mean ${n(mu)} and standard deviation ${n(sd)} ${c.unit}. One observation is ${n(x)} ${c.unit}.</p>`,
      parts: [
        { type: "num", label: "\\(z\\)-score (2 decimals)", answer: zz, tol: 0.006, show: zz.toFixed(2),
          mistakes: [{ value: (mu - x) / sd, msg: "The sign is reversed. Compute \\(x - \\mu\\), not \\(\\mu - x\\)." }, { value: (x - mu) / (sd * sd), msg: "Divide by the standard deviation, not the variance." }, { value: x - mu, msg: "Divide the difference by \\(\\sigma\\)." }] },
        { type: "choice", label: "Interpretation", options: [`${n(Math.abs(zz), 2)} standard deviations above the mean`, `${n(Math.abs(zz), 2)} standard deviations below the mean`], answer: zz > 0 ? 0 : 1, fixed: true,
          why: { [zz > 0 ? 1 : 0]: `The value is ${zz > 0 ? "larger" : "smaller"} than the mean, so z is ${zz > 0 ? "positive" : "negative"}.` } }
      ],
      hand: [T`\(z = \dfrac{x-\mu}{\sigma} = \dfrac{${n(x)} - ${n(mu)}}{${n(sd)}} = ${zz.toFixed(2)}\).`,
        `The observation is ${n(Math.abs(zz), 2)} standard deviations ${zz > 0 ? "above" : "below"} the mean${Math.abs(zz) > 2 ? ", which is fairly unusual" : ""}.`]
    };
  }

  // ---- normal probabilities ----
  function normalProbQ() {
    const { c, mu, sd } = pickNormal();
    const type = R.pick(["lt", "gt", "bt", "out"]);
    const z1 = R.int(-250, 150) / 100;
    const z2 = Math.min(3, z1 + R.int(40, 200) / 100);
    const a = valAt(mu, sd, type === "lt" || type === "gt" ? R.pick([-1, 1]) * R.int(5, 260) / 100 : z1);
    const b = valAt(mu, sd, z2);
    const N = HandKit.normalProb({ mu, sd, type, a, b });
    const phr = { lt: `less than ${n(a)}`, gt: `greater than ${n(a)}`, bt: `between ${n(a)} and ${n(b)}`, out: `less than ${n(a)} or greater than ${n(b)}` }[type];
    return {
      prompt: `<p>${c.what[0].toUpperCase() + c.what.slice(1)} are approximately normal with \\(\\mu = ${n(mu)}\\) and \\(\\sigma = ${n(sd)}\\) ${c.unit}. What is the probability a randomly chosen value is <strong>${phr}</strong> ${c.unit}?</p>`,
      parts: [{ type: "num", label: `\\(${N.sym}\\) (4 decimals)`, answer: N.tab, alts: [N.exact], tol: 0.0015, show: `${f4(N.tab)} (table) or ${f4(N.exact)} (software)`, mistakes: N.mistakes }],
      hand: [`Write it in symbols: \\(${N.sym}\\). Draw the curve and shade that area (picture above).`, ...N.steps],
      figure: N.figure, after: N.after, ti: N.ti, excel: N.excel
    };
  }

  // ---- inverse normal ----
  function inverseQ() {
    const { c, mu, sd } = pickNormal();
    const kind = R.int(0, 2);
    if (kind === 2) {
      const C = R.pick([0.80, 0.90, 0.95, 0.99]);
      const tail = (1 - C) / 2;
      const zs = { 0.80: 1.282, 0.90: 1.645, 0.95: 1.960, 0.99: 2.576 }[C];
      const lo = mu - zs * sd, hi = mu + zs * sd, loE = mu - S.qnorm(1 - tail) * sd, hiE = mu + S.qnorm(1 - tail) * sd;
      const tol = Math.max(0.006, sd * 0.012);
      return {
        prompt: `<p>${c.what[0].toUpperCase() + c.what.slice(1)} are \\(N(${n(mu)}, ${n(sd)})\\). Between what two values do the <strong>middle ${Math.round(C * 100)}%</strong> fall?</p>`,
        parts: [
          { type: "num", label: `Lower value (${c.unit})`, answer: lo, alts: [loE], tol, show: `${S.fmt(loE, 3)}` },
          { type: "num", label: `Upper value (${c.unit})`, answer: hi, alts: [hiE], tol, show: `${S.fmt(hiE, 3)}` }
        ],
        hand: [`The middle ${Math.round(C * 100)}% leaves ${S.num(1 - C, 3)} in the tails, ${S.num(tail, 4)} in each.`,
          T`The upper value has area ${S.num(1 - tail, 4)} to its left, so \(z = ${zs}\) (from the table, or the \(z^*\) row of the t table). The lower value uses \(z = -${zs}\).`,
          T`\(\mu \pm z\sigma = ${n(mu)} \pm ${zs}(${n(sd)})\), which gives \((${S.fmt(lo, 3)},\ ${S.fmt(hi, 3)})\).`],
        ti: `${HandUI.screen(`invNorm(${n(tail, 4)},${n(mu)},${n(sd)})`)} and ${HandUI.screen(`invNorm(${n(1 - tail, 4)},${n(mu)},${n(sd)})`)}`,
        excel: HandUI.xl(`=NORM.INV(${n(tail, 4)},${n(mu)},${n(sd)})`, S.fmt(loE, 4)) + HandUI.xl(`=NORM.INV(${n(1 - tail, 4)},${n(mu)},${n(sd)})`, S.fmt(hiE, 4)),
        after: "The answer to an inverse question is a value of the variable, not a probability."
      };
    }
    const pct = R.pick([5, 10, 15, 20, 25, 30, 70, 75, 80, 85, 90, 95, 99]);
    const top = kind === 1;
    const left = top ? 1 - pct / 100 : pct / 100;
    const I = HandKit.inverseNormal({ mu, sd, left });
    const wording = top ? `the cutoff for the <strong>top ${pct}%</strong>` : `the <strong>${pct}th percentile</strong>`;
    return {
      prompt: `<p>${c.what[0].toUpperCase() + c.what.slice(1)} are \\(N(${n(mu)}, ${n(sd)})\\). Find ${wording}.</p>`,
      parts: [{ type: "num", label: `Value (${c.unit})`, answer: I.xT, alts: [I.xE], tol: Math.max(0.006, sd * 0.012), show: `${S.fmt(I.xT, 3)} (table) or ${S.fmt(I.xE, 3)} (software)`,
        mistakes: top ? [{ value: mu + S.qnorm(pct / 100) * sd, tol: sd * 0.012, msg: `The top ${pct}% has ${pct}% to its <em>right</em>, so look up ${S.num(1 - pct / 100, 2)} to its left.` }]
                      : [{ value: mu + S.qnorm(1 - pct / 100) * sd, tol: sd * 0.012, msg: `The ${pct}th percentile has ${pct}% of values to its left. Look up ${S.num(pct / 100, 2)}.` }] }],
      hand: [top ? `The top ${pct}% lies to the right of the cutoff, so the area to its left is \\(1 - ${S.num(pct / 100, 2)} = ${S.num(left, 2)}\\).` : `The ${pct}th percentile has area ${S.num(left, 2)} to its left.`, ...I.steps],
      ti: I.ti, excel: I.excel, after: "The answer is a value of the variable, not a probability.",
      figure: HandUI.normalFig(mu, sd, top ? [[I.xE, mu + 4 * sd]] : [[mu - 4 * sd, I.xE]])
    };
  }

  // ---- BINS ----
  const BINS = [
    ["A fair die is rolled 10 times and X counts the number of sixes.", 0, "Two outcomes (six or not), independent rolls, fixed n = 10, constant p = 1/6. All four conditions hold."],
    ["A basketball player shoots free throws until she misses, and X counts the shots taken.", 1, "The number of trials is not fixed in advance (the N condition fails)."],
    ["From your 20 close friends, 4 of whom are left-handed, you pick 6 at random and X counts lefties.", 1, "The population is tiny, so each pick changes the chance for the next (independence and constant p fail)."],
    ["An SRS of 30 adults is taken from a large country where 11% are malnourished; X counts malnourished adults.", 0, "Two outcomes, a large population makes trials nearly independent, n = 30 fixed, p = 0.11 constant."],
    ["X records the amount of rainfall on each of 30 days.", 1, "Rainfall amounts aren't success/failure outcomes (the B condition fails), and X isn't a count of successes."],
    ["A weighted coin that lands heads 75% of the time is tossed 4 times; X counts heads.", 0, "Binary, independent tosses, n = 4, p = 0.75 fixed."],
    ["Cards are dealt one at a time without replacement from a 52-card deck until 5 are dealt; X counts hearts.", 1, "Without replacement from 52 cards, the chance of a heart changes after each card (S and I fail)."],
    ["A quiz has 12 multiple-choice questions with 4 options each; a student guesses on every question and X counts correct answers.", 0, "Right or wrong, guesses independent, n = 12, p = 0.25 on each."],
    ["A student keeps texting friends until one replies; X counts texts sent.", 1, "The number of trials isn't fixed (N fails)."]
  ];
  function bins() {
    const [text, ans, why] = R.pick(BINS);
    return {
      prompt: `<p>${text}</p><p>Is \\(X\\) a binomial random variable?</p>`,
      parts: [{ type: "choice", label: "Binomial setting?", options: ["Yes, all four BINS conditions hold", "No, at least one condition fails"], answer: ans, fixed: true, why: { [1 - ans]: why } }],
      hand: ["Check BINS: Binary outcomes, Independent trials, fixed Number of trials, same probability of Success.", why]
    };
  }

  // ---- binomial probabilities by hand ----
  const BCTX = [
    { one: "a basketball player makes a free throw", many: "free throws", verb: "are made" },
    { one: "a guessed quiz answer is correct", many: "guessed answers", verb: "are correct" },
    { one: "a randomly chosen adult has type O blood", many: "randomly chosen adults", verb: "have type O blood" },
    { one: "a seed germinates", many: "seeds", verb: "germinate" },
    { one: "a customer buys the extended warranty", many: "customers", verb: "buy the warranty" }
  ];
  function binomQ() {
    const nn = R.int(5, 12), p = R.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9]);
    const ctx = R.pick(BCTX);
    const kind = R.pick(["eq", "le", "lt", "ge", "gt"]);
    let k = kind === "lt" ? R.int(1, 3) : kind === "le" ? R.int(0, 2) : kind === "ge" ? R.int(nn - 2, nn) : kind === "gt" ? R.int(nn - 3, nn - 1) : R.int(0, nn);
    const pdf = j => S.binompdf(nn, p, j);
    let terms, ans, sym, words, wrongs = [];
    if (kind === "eq") { terms = [k]; ans = pdf(k); sym = `P(X = ${k})`; words = `exactly ${k}`; }
    if (kind === "le") { terms = range(0, k); ans = S.binomcdf(nn, p, k); sym = `P(X \\le ${k})`; words = `at most ${k}`; wrongs.push({ value: S.binomcdf(nn, p, k - 1), msg: `"At most ${k}" includes ${k}.` }); }
    if (kind === "lt") { terms = range(0, k - 1); ans = S.binomcdf(nn, p, k - 1); sym = `P(X < ${k}) = P(X \\le ${k - 1})`; words = `fewer than ${k}`; wrongs.push({ value: S.binomcdf(nn, p, k), msg: `"Fewer than ${k}" does not include ${k}; stop at ${k - 1}.` }); }
    if (kind === "ge") { terms = range(k, nn); ans = 1 - S.binomcdf(nn, p, k - 1); sym = `P(X \\ge ${k})`; words = `at least ${k}`; wrongs.push({ value: 1 - S.binomcdf(nn, p, k), msg: `"At least ${k}" includes ${k}. That answer is P(X > ${k}).` }); }
    if (kind === "gt") { terms = range(k + 1, nn); ans = 1 - S.binomcdf(nn, p, k); sym = `P(X > ${k}) = P(X \\ge ${k + 1})`; words = `more than ${k}`; wrongs.push({ value: 1 - S.binomcdf(nn, p, k - 1), msg: `"More than ${k}" does not include ${k}.` }); }
    wrongs.push({ value: 1 - ans, msg: "That is the complement of what was asked." });
    const termTex = j => T`\binom{${nn}}{${j}}(${n(p)})^{${j}}(${n(1 - p)})^{${nn - j}} = ${S.choose(nn, j)}(${S.fmt(Math.pow(p, j), 6)})(${S.fmt(Math.pow(1 - p, nn - j), 6)}) = ${S.fmt(pdf(j), 4)}`;
    const steps = [`Check BINS: success/failure, independent ${ctx.many}, \\(n = ${nn}\\) fixed, \\(p = ${n(p)}\\) each time. So \\(X \\sim \\text{Binomial}(${nn}, ${n(p)})\\).`,
      `Translate "${words}": \\(${sym}\\) ${terms.length > 1 ? `\\(= ${terms.map(j => `P(${j})`).join(" + ")}\\)` : ""}.`];
    terms.forEach(j => steps.push(T`\(P(X=${j}) = ${termTex(j)}\)`));
    if (terms.length > 1) steps.push(`Add: \\(${terms.map(j => S.fmt(pdf(j), 4)).join(" + ")} = ${S.fmt(ans, 4)}\\).`);
    const ti = kind === "eq" ? HandUI.screen(`binompdf(${nn},${n(p)},${k})`) : kind === "le" ? HandUI.screen(`binomcdf(${nn},${n(p)},${k})`) : kind === "lt" ? HandUI.screen(`binomcdf(${nn},${n(p)},${k - 1})`) : kind === "ge" ? HandUI.screen(`1-binomcdf(${nn},${n(p)},${k - 1})`) : HandUI.screen(`1-binomcdf(${nn},${n(p)},${k})`);
    const xl = kind === "eq" ? `=BINOM.DIST(${k},${nn},${n(p)},FALSE)` : kind === "le" ? `=BINOM.DIST(${k},${nn},${n(p)},TRUE)` : kind === "lt" ? `=BINOM.DIST(${k - 1},${nn},${n(p)},TRUE)` : kind === "ge" ? `=1-BINOM.DIST(${k - 1},${nn},${n(p)},TRUE)` : `=1-BINOM.DIST(${k},${nn},${n(p)},TRUE)`;
    return {
      prompt: `<p>The probability that ${ctx.one} is ${n(p)}, independently each time. Out of ${nn} ${ctx.many}, what is the probability that the number that ${ctx.verb} is <strong>${words}</strong>?</p>`,
      parts: [{ type: "num", label: `\\(${sym}\\) (4 decimals)`, answer: ans, tol: 0.0006, show: f4(ans), mistakes: wrongs }],
      hand: steps,
      ti: `${HandUI.keys("[2nd] [VARS]")} then binompdf or binomcdf: ${ti} = ${f4(ans)}`, excel: HandUI.xl(xl, f4(ans)),
      after: terms.length > 3 ? "When there are many terms, check whether the complement needs fewer. Here the technology lines confirm the sum." : ""
    };
  }
  function range(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }

  // ---- binomial mean and SD ----
  function binomMoments() {
    const nn = R.int(20, 400), p = R.int(5, 95) / 100;
    const mu = nn * p, sd = Math.sqrt(nn * p * (1 - p));
    return {
      prompt: T`<p>\(X \sim \text{Binomial}(${nn}, ${n(p)})\). Find the mean and standard deviation of \(X\).</p>`,
      parts: [
        { type: "num", label: T`\(\mu\)`, answer: mu, tol: 0.006, show: n(mu) },
        { type: "num", label: T`\(\sigma\) (4 decimals)`, answer: sd, tol: 0.0011, show: f4(sd),
          mistakes: [{ value: nn * p * (1 - p), msg: "That is the variance. Take the square root." }, { value: Math.sqrt(nn * p), msg: "Include \\(1-p\\): \\(\\sigma = \\sqrt{np(1-p)}\\)." }, { value: Math.sqrt(p * (1 - p) / nn), msg: "That is the standard deviation of \\(\\hat p\\) (Module 6). For the count \\(X\\), use \\(\\sqrt{np(1-p)}\\)." }] }
      ],
      hand: [T`\(\mu = np = ${nn}(${n(p)}) = ${n(mu)}\).`, T`\(\sigma = \sqrt{np(1-p)} = \sqrt{${nn}(${n(p)})(${n(1 - p)})} = \sqrt{${f4(nn * p * (1 - p))}} = ${f4(sd)}\).`]
    };
  }

  // ---- normal approximation ----
  function normalApprox() {
    let nn, p;
    do { nn = R.int(60, 600); p = R.int(10, 80) / 100; } while (nn * p < 10 || nn * (1 - p) < 10);
    const mu = nn * p, sd = Math.sqrt(nn * p * (1 - p));
    const above = R.coin();
    const k = Math.round(mu + R.pick([-1, 1]) * R.int(30, 220) / 100 * sd);
    const N = HandKit.normalProb({ mu, sd, type: above ? "gt" : "lt", a: k });
    const ctx = R.pick(["voters who support a ballot measure", "customers who pay with a phone", "students who own a car", "adults who exercise regularly"]);
    return {
      prompt: `<p>In a large population, ${Math.round(p * 100)}% of people are ${ctx}. An SRS of ${nn} people is taken. Use the normal approximation to find the probability that ${above ? "at least" : "at most"} ${k} of them are.</p>`,
      parts: [
        { type: "num", label: "\\(\\mu = np\\)", answer: mu, tol: 0.006, show: n(mu) },
        { type: "num", label: "\\(\\sigma = \\sqrt{np(1-p)}\\) (4 decimals)", answer: sd, tol: 0.0011, show: f4(sd), mistakes: [{ value: nn * p * (1 - p), msg: "That is the variance; take the square root." }] },
        { type: "num", label: `\\(P(X ${above ? "\\ge" : "\\le"} ${k})\\) (4 decimals)`, answer: N.tab, alts: [N.exact], tol: 0.0025, show: `${f4(N.tab)} (table) or ${f4(N.exact)} (software)`, mistakes: N.mistakes }
      ],
      hand: [
        T`Check: \(np = ${n(mu)} \ge 10\) and \(n(1-p) = ${n(nn - mu)} \ge 10\), so \(X \approx N(\mu, \sigma)\).`,
        T`\(\mu = ${nn}(${n(p)}) = ${n(mu)}\) and \(\sigma = \sqrt{${nn}(${n(p)})(${n(1 - p)})} = ${f4(sd)}\). Keep these decimals.`,
        ...N.steps
      ],
      figure: N.figure, ti: `${HandUI.keys("[2nd] [VARS] {2:normalcdf(}")}<br>${HandUI.screen(above ? `normalcdf(${k},E99,${f4(mu)},${f4(sd)})` : `normalcdf(-E99,${k},${f4(mu)},${f4(sd)})`)} = ${f4(N.exact)}`,
      excel: HandUI.xl(above ? `=1-NORM.DIST(${k},${f4(mu)},${f4(sd)},TRUE)` : `=NORM.DIST(${k},${f4(mu)},${f4(sd)},TRUE)`, f4(N.exact)),
      after: "This course uses the normal approximation without a continuity correction. The exact binomial answer is a little different."
    };
  }

  HandKit.mount("#practice-app", {
    module: 5,
    skills: [
      { id: "m5-empirical", title: "68-95-99.7 rule", gen: empirical },
      { id: "m5-z", title: "z-scores", gen: zscore },
      { id: "m5-normprob", title: "Normal probabilities with the table", gen: normalProbQ },
      { id: "m5-inverse", title: "Inverse normal (percentiles and cutoffs)", gen: inverseQ },
      { id: "m5-bins", title: "Is it binomial? (BINS)", gen: bins },
      { id: "m5-binom", title: "Binomial probabilities by hand", gen: binomQ },
      { id: "m5-binom-musd", title: "Binomial mean and SD", gen: binomMoments },
      { id: "m5-approx", title: "Normal approximation to the binomial", gen: normalApprox }
    ]
  });
})();
