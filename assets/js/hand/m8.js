/* Ported from stat2331-learn: multi-step, hand-first questions with mistake diagnosis. */
/* Module 8 practice: Hypothesis Testing, Uses & Abuses */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw, n = HandKit.tx;
  const f4 = x => S.fmt(x, 4).replace("−", "-");
  const SYM = { gt: ">", lt: "<", ne: "\\ne" };
  const WORD = { gt: "greater than", lt: "less than", ne: "different from" };

  // ---- writing hypotheses ----
  const CLAIMS = [
    ["A company claims its batteries last <strong>more than</strong> 40 hours on average.", "\\mu", 40, "gt"],
    ["Management claims mean weekly pay is <strong>at least</strong> $500; workers suspect it is lower.", "\\mu", 500, "lt"],
    ["A researcher believes the proportion of adults who exercise daily has <strong>changed</strong> from 0.30.", "p", 0.3, "ne"],
    ["An advocacy group claims that pro-choice adults are <strong>in the minority</strong>.", "p", 0.5, "lt"],
    ["A biologist suspects mean oxygen in a river is <strong>below</strong> the 5.0 ppm fish need.", "\\mu", 5, "lt"],
    ["A teacher claims her students score <strong>higher than</strong> the state average of 72.", "\\mu", 72, "gt"],
    ["A pollster wants to know whether support for a measure <strong>differs from</strong> 50%.", "p", 0.5, "ne"],
    ["A coin is suspected of landing heads <strong>more than</strong> half the time.", "p", 0.5, "gt"],
    ["A cereal box claims a mean of 16 oz; inspectors want to check whether the true mean is <strong>different</strong>.", "\\mu", 16, "ne"],
    ["A website claims <strong>no more than</strong> 5% of orders arrive late; customers suspect the rate is higher.", "p", 0.05, "gt"]
  ];
  function hypotheses() {
    const [txt, par, v, dir] = R.pick(CLAIMS);
    const opts = ["gt", "lt", "ne"].map(d => T`\(H_0: ${par} = ${n(v)}\) versus \(H_a: ${par} ${SYM[d]} ${n(v)}\)`);
    const ans = ["gt", "lt", "ne"].indexOf(dir);
    const why = `The claim to find evidence for is that the parameter is ${WORD[dir]} ${n(v)}, so that goes in \\(H_a\\). \\(H_0\\) is the "=" statement.`;
    return {
      prompt: `<p>${txt}</p><p>Which hypotheses should be tested?</p>`,
      parts: [{ type: "choice", label: "Hypotheses", options: opts, answer: ans, fixed: true, why: Object.fromEntries([0, 1, 2].filter(i => i !== ans).map(i => [i, why])) }],
      hand: [`Identify the parameter: \\(${par}\\) (${par === "p" ? "a proportion" : "a mean"}). The null value is ${n(v)}.`, why, "Statements like 'at least' or 'no more than' are the status quo; the suspicion that contradicts them is the alternative."]
    };
  }

  // ---- one-proportion z test ----
  const ZCTX = [
    { what: "blindfolded practitioners identify the correct hand", p0: 0.5 }, { what: "people choose the number 7 from 1 to 10", p0: 0.1 },
    { what: "adults support the new transit plan", p0: 0.5 }, { what: "orders arrive late", p0: 0.05 }, { what: "students own a car", p0: 0.4 },
    { what: "customers redeem the coupon", p0: 0.25 }
  ];
  function zTest() {
    const c = R.pick(ZCTX), dir = R.pick(["gt", "lt", "ne"]), alpha = R.pick([0.01, 0.05, 0.1]);
    let nn; do { nn = R.pick([100, 150, 200, 250, 300, 400, 500, 800, 1000]); } while (nn * c.p0 < 10 || nn * (1 - c.p0) < 10);
    const se = Math.sqrt(c.p0 * (1 - c.p0) / nn);
    const shift = (dir === "lt" ? -1 : dir === "gt" ? 1 : R.pick([-1, 1])) * R.int(10, 320) / 100;
    let X = Math.round(nn * (c.p0 + shift * se));
    X = Math.max(1, Math.min(nn - 1, X));
    const ph = X / nn, z = (ph - c.p0) / se, zr = S.zRound(z);
    const left = S.tableArea(z);
    const pvT = dir === "gt" ? 1 - left : dir === "lt" ? left : 2 * (1 - S.tableArea(Math.abs(z)));
    const pvE = dir === "gt" ? 1 - S.pnorm(z) : dir === "lt" ? S.pnorm(z) : 2 * (1 - S.pnorm(Math.abs(z)));
    const reject = pvE <= alpha;
    const zWrong = (ph - c.p0) / Math.sqrt(ph * (1 - ph) / nn);
    const pvWrongSide = dir === "ne" ? (1 - S.pnorm(Math.abs(z))) : 1 - pvE;
    const figShade = dir === "gt" ? [[z, 4]] : dir === "lt" ? [[-4, z]] : [[-4, -Math.abs(z)], [Math.abs(z), 4]];
    return {
      prompt: `<p>Test whether the proportion of all cases where ${c.what} is <strong>${WORD[dir]} ${n(c.p0)}</strong>. In a random sample of ${nn}, ${X} cases qualify. Use \\(\\alpha = ${alpha}\\).</p>`,
      parts: [
        { type: "num", label: "Test statistic \\(z\\) (2 decimals)", answer: z, tol: 0.011, show: zr.toFixed(2),
          mistakes: [{ value: zWrong, tol: 0.011, msg: "You used \\(\\hat p\\) in the standard error. Tests assume \\(H_0\\), so use \\(\\sqrt{p_0(1-p_0)/n}\\)." }, { value: -z, tol: 0.011, msg: "Sign reversed: compute \\(\\hat p - p_0\\)." }] },
        { type: "num", label: "p-value (4 decimals)", answer: pvT, alts: [pvE], tol: 0.0025, show: `${f4(pvT)} (table) or ${f4(pvE)} (software)`,
          mistakes: [{ value: pvWrongSide, tol: 0.0025, msg: dir === "ne" ? "Two-sided: double the one-tail area." : `That is the area on the wrong side. \\(H_a\\) says "${WORD[dir]}," so the p-value is the ${dir === "gt" ? "right" : "left"} tail.` }] },
        { type: "choice", label: `Decision at \\(\\alpha = ${alpha}\\)`, options: ["Reject \\(H_0\\)", "Fail to reject \\(H_0\\)"], answer: reject ? 0 : 1, fixed: true,
          why: { [reject ? 1 : 0]: `Compare the p-value (${f4(pvE)}) with \\(\\alpha = ${alpha}\\): ${reject ? "it is smaller, so reject" : "it is larger, so fail to reject"}.` } }
      ],
      hand: [
        T`\(H_0: p = ${n(c.p0)}\) versus \(H_a: p ${SYM[dir]} ${n(c.p0)}\).`,
        T`Conditions: random sample; \(np_0 = ${n(nn * c.p0)}\) and \(n(1-p_0) = ${n(nn * (1 - c.p0))}\), both at least 10.`,
        T`\(\hat p = ${X}/${nn} = ${f4(ph)}\). \(z = \dfrac{${f4(ph)} - ${n(c.p0)}}{\sqrt{${n(c.p0)}(${n(1 - c.p0)})/${nn}}} = \dfrac{${f4(ph - c.p0)}}{${f4(se)}} = ${S.fmt(z, 4).replace("−", "-")} \approx ${zr.toFixed(2)}\).`,
        dir === "gt" ? T`p-value \(= P(Z \ge ${zr.toFixed(2)}) = 1 - ${f4(left)} = ${f4(pvT)}\).`
          : dir === "lt" ? T`p-value \(= P(Z \le ${zr.toFixed(2)}) = ${f4(pvT)}\).`
          : T`p-value \(= 2P(Z \ge ${Math.abs(zr).toFixed(2)}) = 2(1 - ${f4(S.tableArea(Math.abs(z)))}) = ${f4(pvT)}\).`,
        `${reject ? "p-value ≤ α" : "p-value > α"}: ${reject ? "reject" : "fail to reject"} \\(H_0\\).`,
        `There ${reject ? "is" : "is not"} sufficient evidence at the \\(\\alpha = ${alpha}\\) level that the proportion is ${WORD[dir]} ${n(c.p0)}.`
      ],
      figure: HandUI.zFig(figShade, { marks: [{ x: Math.max(-3.7, Math.min(3.7, z)), top: "z" }] }),
      after: Math.abs(z) > 3.49 ? "When |z| is beyond 3.49 the table can't go further: the p-value is essentially 0." : "",
      ti: `${HandUI.keys("[STAT] [▶] {5:1-PropZTest}")}: p0 = ${n(c.p0)}, x = ${X}, n = ${nn}, prop ${dir === "gt" ? ">" : dir === "lt" ? "<" : "≠"}p0. It reports z = ${S.fmt(z, 4)}, p = ${f4(pvE)}.`,
      excel: HandUI.xl(dir === "gt" ? `=1-NORM.S.DIST(${f4(z)},TRUE)` : dir === "lt" ? `=NORM.S.DIST(${f4(z)},TRUE)` : `=2*(1-NORM.S.DIST(ABS(${f4(z)}),TRUE))`, f4(pvE))
    };
  }

  // ---- one-sample t test with a bracketed p-value ----
  function bracket(tAbs, dfRow, twoSided) {
    const tails = S.T_TAIL, vals = tails.map(a => S.tTableValue(dfRow, a));
    const k = twoSided ? 2 : 1;
    const fmtA = a => S.num(a * k, 4);
    if (tAbs < vals[0]) return { text: `p-value > ${fmtA(tails[0])}`, lo: tails[0] * k, hi: 1 };
    for (let i = 0; i < vals.length - 1; i++) if (tAbs >= vals[i] && tAbs < vals[i + 1]) return { text: `${fmtA(tails[i + 1])} < p-value < ${fmtA(tails[i])}`, lo: tails[i + 1] * k, hi: tails[i] * k, i };
    return { text: `p-value < ${fmtA(tails[tails.length - 1])}`, lo: 0, hi: tails[tails.length - 1] * k };
  }
  function allBrackets(dfRow, twoSided) {
    const tails = S.T_TAIL, k = twoSided ? 2 : 1, out = [`p-value > ${S.num(tails[0] * k, 4)}`];
    for (let i = 0; i < tails.length - 1; i++) out.push(`${S.num(tails[i + 1] * k, 4)} < p-value < ${S.num(tails[i] * k, 4)}`);
    out.push(`p-value < ${S.num(tails[tails.length - 1] * k, 4)}`);
    return out;
  }
  const TCTX = [["mean oxygen level in a river", "ppm", 5, [0.1, 0.4], 2], ["mean percent of calories from fat", "%", 30, [5, 9], 2], ["mean weekly pay for entry-level workers", "dollars", 500, [10, 40], 1],
    ["mean fill amount of soda bottles", "mL", 500, [3, 8], 1], ["mean sweetness loss for a diet cola", "points", 0, [0.6, 1.4], 2], ["mean commute time", "minutes", 25, [5, 12], 1]];
  function tTest() {
    const [what, unit, mu0, sr, dec] = R.pick(TCTX), dir = R.pick(["gt", "lt", "ne"]), alpha = R.pick([0.01, 0.05, 0.1]);
    const df = R.pick([5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 17, 19, 20, 24, 25, 29, 30, 40, 50, 60]), nn = df + 1;
    const s = S.round(sr[0] + Math.random() * (sr[1] - sr[0]), dec + 1), se = s / Math.sqrt(nn);
    const tTarget = (dir === "lt" ? -1 : dir === "gt" ? 1 : R.pick([-1, 1])) * R.int(30, 450) / 100;
    const xbar = S.round(mu0 + tTarget * se, dec + 2);
    const t = (xbar - mu0) / se;
    const pv = dir === "gt" ? 1 - S.pt(t, df) : dir === "lt" ? S.pt(t, df) : 2 * (1 - S.pt(Math.abs(t), df));
    // the bracket only makes sense when t points in the direction of Ha
    const sameSide = dir === "ne" || (dir === "gt" ? t > 0 : t < 0);
    const B = bracket(Math.abs(t), df, dir === "ne");
    const options = allBrackets(df, dir === "ne");
    const ansIdx = options.indexOf(B.text);
    const reject = pv <= alpha;
    const near = [ansIdx - 1, ansIdx + 1, ansIdx + 2, ansIdx - 2].filter(i => i >= 0 && i < options.length).slice(0, 3);
    const choiceIdx = R.shuffle([ansIdx, ...near]);
    const row = S.tTableRow(df), vals = S.T_TAIL.map(a => S.tTableValue(row, a));
    let rowText;
    if (B.i != null) rowText = T`In row \(df = ${df}\), \(|t| = ${S.fmt(Math.abs(t), 3)}\) falls between ${vals[B.i].toFixed(3)} (tail ${S.num(S.T_TAIL[B.i], 4)}) and ${vals[B.i + 1].toFixed(3)} (tail ${S.num(S.T_TAIL[B.i + 1], 4)}).`;
    else if (B.lo === 0) rowText = T`In row \(df = ${df}\), \(|t| = ${S.fmt(Math.abs(t), 3)}\) is beyond the last entry ${vals[vals.length - 1].toFixed(3)} (tail 0.0005).`;
    else rowText = T`In row \(df = ${df}\), \(|t| = ${S.fmt(Math.abs(t), 3)}\) is below the first entry ${vals[0].toFixed(3)} (tail 0.25).`;
    if (!sameSide) return tTest();
    return {
      prompt: `<p>Test whether the ${what} is <strong>${WORD[dir]} ${mu0}</strong> ${unit}. A random sample of ${nn} gives \\(\\bar x = ${n(xbar, dec + 2)}\\) and \\(s = ${n(s)}\\); the data show no extreme skew or outliers. Use \\(\\alpha = ${alpha}\\).</p>`,
      parts: [
        { type: "num", label: "Test statistic \\(t\\) (3 decimals)", answer: t, tol: 0.006, show: S.fmt(t, 3),
          mistakes: [{ value: (xbar - mu0) / s, tol: 0.006, msg: "Divide by the standard error \\(s/\\sqrt n\\), not by \\(s\\)." }, { value: -t, tol: 0.006, msg: "Sign reversed: compute \\(\\bar x - \\mu_0\\)." }] },
        { type: "num", label: "Degrees of freedom", answer: df, tol: 0.01, show: String(df), mistakes: [{ value: nn, msg: "\\(df = n - 1\\)." }] },
        { type: "choice", label: "p-value from the t table", options: choiceIdx.map(i => options[i]), answer: choiceIdx.indexOf(ansIdx), fixed: true,
          why: Object.fromEntries(choiceIdx.map((_, j) => [j, rowText + (dir === "ne" ? " Two-sided, so double both tail areas." : "")])) },
        { type: "choice", label: `Decision at \\(\\alpha = ${alpha}\\)`, options: ["Reject \\(H_0\\)", "Fail to reject \\(H_0\\)"], answer: reject ? 0 : 1, fixed: true,
          why: { [reject ? 1 : 0]: `From the table, ${B.text}, which is ${reject ? "at most" : "more than"} \\(\\alpha = ${alpha}\\).` } }
      ],
      hand: [
        T`\(H_0: \mu = ${mu0}\) versus \(H_a: \mu ${SYM[dir]} ${mu0}\). Conditions: random sample; no extreme skew or outliers.`,
        T`\(t = \dfrac{${n(xbar, dec + 2)} - ${mu0}}{${n(s)}/\sqrt{${nn}}} = \dfrac{${f4(xbar - mu0)}}{${f4(se)}} = ${S.fmt(t, 3).replace("−", "-")}\), with \(df = ${nn} - 1 = ${df}\).`,
        rowText + (dir === "ne" ? " Two-sided, so double the tail areas." : ""),
        `So ${B.text.replace("p-value", "the p-value")}. (Software: ${f4(pv)}.)`,
        `${reject ? "This is at most" : "This is more than"} \\(\\alpha = ${alpha}\\), so ${reject ? "reject" : "fail to reject"} \\(H_0\\). There ${reject ? "is" : "is not"} sufficient evidence at the ${alpha} level that the ${what} is ${WORD[dir]} ${mu0} ${unit}.`
      ],
      figure: HandUI.tFig(df, dir === "gt" ? [[t, 4]] : dir === "lt" ? [[-4, t]] : [[-4, -Math.abs(t)], [Math.abs(t), 4]], { marks: [{ x: Math.max(-3.9, Math.min(3.9, t)), top: "t" }] }),
      ti: `${HandUI.keys("[STAT] [▶] {2:T-Test}")}, Stats: μ0 = ${mu0}, x̄ = ${n(xbar, dec + 2)}, Sx = ${n(s)}, n = ${nn}. Or ${HandUI.screen(dir === "gt" ? `tcdf(${S.fmt(t, 3)},E99,${df})` : dir === "lt" ? `tcdf(-E99,${S.fmt(t, 3)},${df})` : `2*tcdf(${S.fmt(Math.abs(t), 3)},E99,${df})`)} = ${f4(pv)}`,
      excel: HandUI.xl(dir === "gt" ? `=1-T.DIST(${S.fmt(t, 3)},${df},TRUE)` : dir === "lt" ? `=T.DIST(${S.fmt(t, 3).replace("−", "-")},${df},TRUE)` : `=T.DIST.2T(${S.fmt(Math.abs(t), 3)},${df})`, f4(pv))
    };
  }

  // ---- decision and conclusion from a p-value ----
  function decide() {
    const alpha = R.pick([0.01, 0.05, 0.1]);
    const pv = R.coin() ? S.round(alpha * R.int(5, 95) / 100, 4) : S.round(alpha + R.int(1, 40) / 100, 4);
    const reject = pv <= alpha;
    const [par, ctx, v, dir] = R.pick([["p", "proportion of defective chips", "0.02", "gt"], ["\\mu", "mean wait time", "15 minutes", "lt"], ["p", "proportion of voters who support the measure", "0.5", "ne"], ["\\mu", "mean battery life", "40 hours", "gt"]]);
    const opts = [
      `Reject H₀. There is sufficient evidence that the ${ctx} is ${WORD[dir]} ${v}.`,
      `Fail to reject H₀. There is not sufficient evidence that the ${ctx} is ${WORD[dir]} ${v}.`,
      `Reject H₀. This proves the ${ctx} is ${WORD[dir]} ${v}.`,
      `Accept H₀. The ${ctx} equals ${v}.`
    ];
    const ans = reject ? 0 : 1;
    return {
      prompt: `<p>A test of \\(H_0: ${par} = \\) ${v} versus \\(H_a: ${par} ${SYM[dir]}\\) ${v} gives a p-value of <strong>${S.num(pv, 4)}</strong>. Using \\(\\alpha = ${alpha}\\), which decision and conclusion are correct?</p>`,
      parts: [{ type: "choice", label: "Decision and conclusion", options: opts, answer: ans,
        why: { [1 - ans]: `Compare: ${S.num(pv, 4)} is ${reject ? "at most" : "greater than"} ${alpha}.`, 2: "A test never proves anything; it measures the strength of evidence.", 3: "We never 'accept' H₀. Not finding evidence against it is not proof that it is true." } }],
      hand: [`p-value ${S.num(pv, 4)} ${reject ? "≤" : ">"} α = ${alpha}, so ${reject ? "reject" : "fail to reject"} \\(H_0\\).`, "State the conclusion about \\(H_a\\), in context, without claiming proof."]
    };
  }

  // ---- Type I / Type II ----
  function errors() {
    const kind = R.int(0, 1);
    if (kind === 0) {
      const rejected = R.coin(), truthNull = R.coin();
      const ans = rejected ? (truthNull ? 0 : 2) : (truthNull ? 2 : 1);
      const opts = ["Type I error", "Type II error", "Correct decision"];
      const why = `Decision: ${rejected ? "reject" : "fail to reject"} \\(H_0\\). Truth: \\(H_0\\) is ${truthNull ? "true" : "false"}. ${ans === 0 ? "Rejecting a true null is a Type I error." : ans === 1 ? "Failing to reject a false null is a Type II error." : "The decision matches the truth."}`;
      const ctx = R.pick([["the mean percent fat is 30", "\\mu = 30"], ["a coin is fair", "p = 0.5"], ["the new drug has the same cure rate as the old one, 0.6", "p = 0.6"], ["mean fill is 16 oz", "\\mu = 16"]]);
      return {
        prompt: `<p>A study tests \\(H_0: ${ctx[1]}\\) (${ctx[0]}). The researchers <strong>${rejected ? "reject" : "fail to reject"}</strong> \\(H_0\\). Later, a census shows that \\(H_0\\) is actually <strong>${truthNull ? "true" : "false"}</strong>.</p>`,
        parts: [{ type: "choice", label: "The decision was", options: opts, answer: ans, fixed: true, why: Object.fromEntries([0, 1, 2].filter(i => i !== ans).map(i => [i, why])) }],
        hand: ["Type I: reject a true \\(H_0\\). Type II: fail to reject a false \\(H_0\\).", why]
      };
    }
    const rejected = R.coin();
    return {
      prompt: `<p>A test ${rejected ? "rejects" : "fails to reject"} \\(H_0\\). We don't know the truth. Which error could have been made?</p>`,
      parts: [{ type: "choice", label: "Possible error", options: ["Type I error only", "Type II error only", "Either type"], answer: rejected ? 0 : 1, fixed: true,
        why: { [rejected ? 1 : 0]: rejected ? "A Type II error requires failing to reject. Having rejected, only a Type I error is possible." : "A Type I error requires rejecting. Having failed to reject, only a Type II error is possible.", 2: "Each decision allows only one kind of error." } }],
      hand: [rejected ? "Rejecting \\(H_0\\) is wrong only if \\(H_0\\) is true: a Type I error." : "Failing to reject is wrong only if \\(H_0\\) is false: a Type II error."]
    };
  }

  // ---- power and beta ----
  function power() {
    const pw = R.int(50, 98) / 100, mu0 = R.int(10, 60), eff = R.int(2, 12), nn = R.pick([25, 36, 49, 64, 100]);
    const askBeta = R.coin();
    return {
      prompt: `<p>A test of \\(H_0: \\mu = ${mu0}\\) versus \\(H_a: \\mu > ${mu0}\\) uses \\(n = ${nn}\\) and \\(\\alpha = 0.05\\). If the true mean is ${mu0 + eff}, the power is ${n(pw)}.</p>`,
      parts: [
        { type: "num", label: askBeta ? "\\(\\beta = P(\\text{Type II error})\\)" : "Effect size \\(\\mu_a - \\mu_0\\)", answer: askBeta ? 1 - pw : eff, tol: 0.0006, show: askBeta ? n(1 - pw) : String(eff),
          mistakes: askBeta ? [{ value: 0.05, msg: "0.05 is α, the Type I error probability. β is 1 − power." }, { value: pw, msg: "That is the power. β = 1 − power." }] : [] },
        { type: "choice", label: "Interpretation of the power", options: [`If the true mean is ${mu0 + eff}, about ${Math.round(pw * 100)}% of all samples of size ${nn} would lead us to reject H₀.`,
          `There is a ${Math.round(pw * 100)}% chance that H₀ is false.`, `${Math.round(pw * 100)}% of samples will give a mean of ${mu0 + eff}.`, `The probability of a Type I error is ${n(pw)}.`], answer: 0,
          why: { 1: "Power is a probability about the test's decision, computed assuming a specific alternative is true.", 2: "Power is about rejecting H₀, not about the value of the sample mean.", 3: "The Type I error probability is α = 0.05." } }
      ],
      hand: [askBeta ? T`\(\beta = 1 - \text{power} = 1 - ${n(pw)} = ${n(1 - pw)}\).` : T`Effect size \(= \mu_a - \mu_0 = ${mu0 + eff} - ${mu0} = ${eff}\).`,
        `Power = P(reject \\(H_0\\) | the alternative \\(\\mu = ${mu0 + eff}\\) is true). Over many samples of ${nn}, about ${Math.round(pw * 100)}% would reject.`,
        "To raise power: increase \\(n\\), increase \\(\\alpha\\), or target a larger effect size."]
    };
  }

  // ---- CI and two-sided test ----
  function ciTest() {
    const isP = R.coin(), C = R.pick([90, 95, 99]), alpha = S.round(1 - C / 100, 2);
    const L = isP ? R.int(20, 60) / 100 : R.int(200, 600) / 10, w = isP ? R.int(6, 20) / 100 : R.int(10, 80) / 10, U = S.round(L + w, 3);
    const inside = R.coin();
    const v = inside ? S.round(L + w * R.int(15, 85) / 100, isP ? 2 : 1) : (R.coin() ? S.round(L - w * R.int(10, 60) / 100, isP ? 2 : 1) : S.round(U + w * R.int(10, 60) / 100, isP ? 2 : 1));
    const par = isP ? "p" : "\\mu";
    return {
      prompt: `<p>A ${C}% confidence interval for \\(${par}\\) is \\((${n(L)},\\ ${n(U)})\\). Test \\(H_0: ${par} = ${n(v)}\\) versus \\(H_a: ${par} \\ne ${n(v)}\\) at \\(\\alpha = ${alpha}\\).</p>`,
      parts: [
        { type: "choice", label: "Decision", options: ["Reject \\(H_0\\)", "Fail to reject \\(H_0\\)"], answer: inside ? 1 : 0, fixed: true, why: { [inside ? 0 : 1]: `${n(v)} is ${inside ? "inside" : "outside"} the interval, so it ${inside ? "is" : "is not"} a plausible value.` } },
        { type: "choice", label: "The p-value is", options: [`At most ${alpha}`, `Greater than ${alpha}`], answer: inside ? 1 : 0, fixed: true, why: { [inside ? 0 : 1]: "The decision and the p-value must agree: reject exactly when p-value ≤ α." } }
      ],
      hand: [`A two-sided test at \\(\\alpha = ${alpha}\\) matches a ${C}% confidence interval (\\(C = 1 - \\alpha\\)).`, `${n(v)} is ${inside ? "inside" : "outside"} \\((${n(L)},\\ ${n(U)})\\), so ${inside ? "fail to reject \\(H_0\\); the p-value is greater than" : "reject \\(H_0\\); the p-value is at most"} ${alpha}.`]
    };
  }

  // ---- practical significance ----
  const PRAC = [
    ["With 2,000 volunteers, a $1.50 headache pill brought relief 6.6 seconds faster on average than a $0.10 pill (p-value 0.045).", 1, "Statistically significant at 0.05, but 6.6 seconds isn't worth $1.40 more per pill."],
    ["With 50,000 students, a tutoring program raised mean exam scores by 0.2 points out of 100 (p-value < 0.001).", 1, "A tiny difference becomes 'significant' with a huge sample; 0.2 points doesn't matter in practice."],
    ["In 400 patients, a new drug lowered systolic blood pressure by 15 mm Hg more than placebo (p-value < 0.001).", 0, "The effect is both statistically significant and large enough to matter medically."],
    ["With 60 trial runs, a new route cut a delivery truck's mean time by 25 minutes per day (p-value 0.002).", 0, "Significant, and 25 minutes a day is a meaningful savings."],
    ["With 1 million web visitors, a button color raised click rate from 3.10% to 3.12% (p-value 0.01); changing it costs $200,000.", 1, "Statistically significant, but a 0.02-point gain isn't worth the cost."]
  ];
  function practical() {
    const [txt, ans, why] = R.pick(PRAC);
    return {
      prompt: `<p>${txt}</p><p>Is the result practically significant?</p>`,
      parts: [{ type: "choice", label: "Assessment", options: ["Statistically and practically significant", "Statistically significant but not practically significant"], answer: ans, fixed: true, why: { [1 - ans]: why } }],
      hand: ["Statistical significance: is the p-value below α? Practical significance: is the size of the difference big enough to matter to the people affected?", why]
    };
  }

  HandKit.mount("#practice-app", {
    module: 8,
    skills: [
      { id: "m8-hyp", title: "Writing hypotheses", gen: hypotheses },
      { id: "m8-ztest", title: "Test for a proportion (z test)", gen: zTest },
      { id: "m8-ttest", title: "Test for a mean (t test, table p-value)", gen: tTest },
      { id: "m8-decide", title: "Decision and conclusion", gen: decide },
      { id: "m8-errors", title: "Type I and Type II errors", gen: errors },
      { id: "m8-power", title: "Power and β", gen: power },
      { id: "m8-citest", title: "Using a CI to decide a test", gen: ciTest },
      { id: "m8-practical", title: "Practical significance", gen: practical }
    ]
  });
})();
