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

  // ---- critical values (z* row and t rows of the course t-table) ----
  const ZSTAR = a => S.round(S.qnorm(1 - a), 3);
  const zCrit = (alpha, dir) => ZSTAR(dir === "ne" ? alpha / 2 : alpha);
  const tCrit = (df, alpha, dir) => S.tTableValue(S.tTableRow(df), dir === "ne" ? alpha / 2 : alpha);
  const RULE = (dir, c) => dir === "gt" ? `\\(\\text{TS} \\ge ${c}\\)` : dir === "lt" ? `\\(\\text{TS} \\le -${c}\\)` : `\\(|\\text{TS}| \\ge ${c}\\)`;
  const IN_RR = (ts, dir, c) => dir === "gt" ? ts >= c : dir === "lt" ? ts <= -c : Math.abs(ts) >= c;
  const RR_SHADE = (dir, c, hi) => dir === "gt" ? [[c, hi]] : dir === "lt" ? [[-hi, -c]] : [[-hi, -c], [c, hi]];
  const COL = (alpha, dir) => dir === "ne" ? `column \\(\\alpha/2 = ${n(alpha / 2)}\\)` : `column \\(\\alpha = ${alpha}\\)`;

  // ---- p-values (normal table for z; t-table interval plus the exact value for t) ----
  const PV = (dist, ts, dir, df) => { const o = RRPlot.norm({ dist, df, dir, ts, crit: 1 }); return dist === "z" ? o.p : RRPlot.pValue(o); };
  const TB = (ts, dir, df) => RRPlot.bracket(RRPlot.norm({ dist: "t", df, dir, ts, crit: 1 }));
  const P4 = v => v < 0.0001 ? "less than 0.0001" : v.toFixed(4);
  const PFORM = (dir, T, ts) => dir === "gt" ? `\\(P(${T} \\ge ${ts})\\)` : dir === "lt" ? `\\(P(${T} \\le ${ts})\\)` : `\\(2P(${T} \\ge ${String(ts).replace("-", "")})\\)`;
  const BR = b => b.lo <= 0 ? `p-value < ${n(b.hi)}` : b.hi >= 1 ? `p-value > ${n(b.lo)}` : `${n(b.lo)} < p-value < ${n(b.hi)}`;
  function zPvPart(z, dir) {
    const zr = S.round(z, 2), p = PV("z", zr, dir), left = S.round(1 - RRPlot.upper(zr, "z"), 4), tail = Math.min(left, 1 - left), mis = [];
    if (dir === "ne") mis.push({ value: tail, tol: 0.00051, msg: "Two-sided: double the tail area." }); else if (2 * p <= 1) mis.push({ value: 2 * p, tol: 0.00051, msg: "One-sided: do not double the tail area." });
    if (dir === "gt" && Math.abs(left - p) > 0.001) mis.push({ value: left, tol: 0.00051, msg: "That is the left area. For \\(H_a\\) with >, the p-value is the area to the right: 1 − left area." });
    if (dir === "lt" && Math.abs(1 - left - p) > 0.001) mis.push({ value: 1 - left, tol: 0.00051, msg: "For \\(H_a\\) with <, the p-value is the area to the left of z: the table value itself." });
    return { p, zr, left, part: { type: "num", method: "pv", label: "p-value (normal table, 4 decimals)", answer: p, tol: 0.00051, show: P4(p), mistakes: mis } };
  }
  function tPvPart(t, dir, df) {
    const b = TB(t, dir, df), exact = PV("t", t, dir, df), mis = [];
    if (dir === "ne") mis.push({ lo: b.lo / 2, hi: b.hi / 2, msg: "Two-sided: double both tail areas." }, { value: exact / 2, msg: "Two-sided: double the one-tail area." });
    else if (b.hi * 2 <= 1) mis.push({ lo: b.lo * 2, hi: b.hi * 2, msg: "One-sided: do not double the tail areas." });
    return { b, exact, part: { type: "pint", method: "pv", label: "p-value: between which two t-table areas? (or the exact value)", lo: b.lo, hi: b.hi, exact, mistakes: mis } };
  }
  const DEC = (method, reject, alpha, detail) => ({ type: "choice", method, label: `Decision at \\(\\alpha = ${alpha}\\)`, options: ["Reject \\(H_0\\)", "Fail to reject \\(H_0\\)"], answer: reject ? 0 : 1, fixed: true, why: { [reject ? 1 : 0]: detail } });

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
    const ph = X / nn, z = (ph - c.p0) / se, zs = zCrit(alpha, dir), reject = IN_RR(z, dir, zs), pz = zPvPart(z, dir);
    if ((pz.p <= alpha) !== reject) return zTest();  // table rounding put z on the boundary: draw again
    const zWrong = (ph - c.p0) / Math.sqrt(ph * (1 - ph) / nn), zsOther = zCrit(alpha, dir === "ne" ? "gt" : "ne");
    return {
      prompt: `<p>Test whether the proportion of all cases where ${c.what} is <strong>${WORD[dir]} ${n(c.p0)}</strong>. In a random sample of ${nn}, ${X} cases qualify. Use \\(\\alpha = ${alpha}\\).</p>`,
      parts: [
        { type: "num", label: "Test statistic \\(z\\) (2 decimals)", answer: z, tol: 0.011, show: S.fmt(z, 2),
          mistakes: [{ value: zWrong, tol: 0.011, msg: "You used \\(\\hat p\\) in the standard error. Tests assume \\(H_0\\), so use \\(\\sqrt{p_0(1-p_0)/n}\\)." }, { value: -z, tol: 0.011, msg: "Sign reversed: compute \\(\\hat p - p_0\\)." }] },
        { type: "num", method: "cv", label: "Critical value \\(z^*\\) (from the \\(z^*\\) row)", answer: zs, tol: 0.0015, show: zs.toFixed(3),
          mistakes: [{ value: zsOther, tol: 0.0015, msg: dir === "ne" ? "Two-sided: use column \\(\\alpha/2\\), not \\(\\alpha\\)." : "One-sided: use column \\(\\alpha\\), not \\(\\alpha/2\\)." }, { value: -zs, tol: 0.0015, msg: "Enter \\(z^*\\) as a positive number; the minus sign goes in the rejection rule." }] },
        DEC("cv", reject, alpha, `Rejection region: ${RULE(dir, zs.toFixed(3))}. \\(z = ${S.fmt(z, 2).replace("−", "-")}\\) is ${reject ? "in" : "not in"} it, so ${reject ? "reject" : "fail to reject"}.`),
        pz.part,
        DEC("pv", reject, alpha, `p-value = ${P4(pz.p)} is ${reject ? "at most" : "greater than"} \\(\\alpha = ${alpha}\\), so ${reject ? "reject" : "fail to reject"}.`)
      ],
      hand: [
        T`\(H_0: p = ${n(c.p0)}\) versus \(H_a: p ${SYM[dir]} ${n(c.p0)}\).`,
        T`Conditions: random sample; \(np_0 = ${n(nn * c.p0)}\) and \(n(1-p_0) = ${n(nn * (1 - c.p0))}\), both at least 10.`,
        T`\(\hat p = ${X}/${nn} = ${f4(ph)}\). \(z = \dfrac{${f4(ph)} - ${n(c.p0)}}{\sqrt{${n(c.p0)}(${n(1 - c.p0)})/${nn}}} = \dfrac{${f4(ph - c.p0)}}{${f4(se)}} = ${S.fmt(z, 4).replace("−", "-")}\).`,
        `<strong>Critical-value method:</strong> \\(z^*\\) row, ${COL(alpha, dir)}, so \\(z^* = ${zs.toFixed(3)}\\). Reject \\(H_0\\) if ${RULE(dir, zs.toFixed(3))}. \\(z = ${S.fmt(z, 2).replace("−", "-")}\\) is ${reject ? "" : "not "}in the rejection region.`,
        `<strong>p-value method:</strong> p-value = ${PFORM(dir, "Z", pz.zr.toFixed(2))}. The normal table gives a left area of ${pz.left.toFixed(4)} at \\(z = ${pz.zr.toFixed(2)}\\), so p-value = ${dir === "gt" ? `1 − ${pz.left.toFixed(4)} = ` : dir === "ne" ? `2 × ${Math.min(pz.left, 1 - pz.left).toFixed(4)} = ` : ""}${P4(pz.p)}, which is ${reject ? "at most" : "greater than"} \\(\\alpha = ${alpha}\\).`,
        `Either way, ${reject ? "reject" : "fail to reject"} \\(H_0\\).`,
        `There ${reject ? "is" : "is not"} sufficient evidence at the \\(\\alpha = ${alpha}\\) level that the proportion is ${WORD[dir]} ${n(c.p0)}.`
      ],
      figure: RRPlot.svg({ dist: "z", dir, crit: zs, ts: S.round(z, 2), alpha }),
      after: "Both methods always give the same decision. Use the switch above the steps to answer with either one.",
      ti: `${HandUI.keys("[STAT] [▶] {5:1-PropZTest}")}: p0 = ${n(c.p0)}, x = ${X}, n = ${nn}, prop ${dir === "gt" ? ">" : dir === "lt" ? "<" : "≠"}p0. It reports z = ${S.fmt(z, 4)}. ${HandUI.screen(`invNorm(${n(1 - (dir === "ne" ? alpha / 2 : alpha))})`)} = ${zs.toFixed(3)}.`,
      excel: HandUI.xl(`=NORM.S.INV(${n(1 - (dir === "ne" ? alpha / 2 : alpha))})`, zs.toFixed(3))
    };
  }

  // ---- one-sample t test with a critical value from the t-table ----
  const TCTX = [["mean oxygen level in a river", "ppm", 5, [0.1, 0.4], 2], ["mean percent of calories from fat", "%", 30, [5, 9], 2], ["mean weekly pay for entry-level workers", "dollars", 500, [10, 40], 1],
    ["mean fill amount of soda bottles", "mL", 500, [3, 8], 1], ["mean sweetness loss for a diet cola", "points", 0, [0.6, 1.4], 2], ["mean commute time", "minutes", 25, [5, 12], 1]];
  function tTest() {
    const [what, unit, mu0, sr, dec] = R.pick(TCTX), dir = R.pick(["gt", "lt", "ne"]), alpha = R.pick([0.01, 0.05, 0.1]);
    const df = R.pick([5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 17, 19, 20, 24, 25, 29, 30, 34, 45, 64, 99, 164]), nn = df + 1;
    const s = S.round(sr[0] + Math.random() * (sr[1] - sr[0]), dec + 1), se = s / Math.sqrt(nn);
    const tTarget = (dir === "lt" ? -1 : dir === "gt" ? 1 : R.pick([-1, 1])) * R.int(30, 450) / 100;
    const xbar = S.round(mu0 + tTarget * se, dec + 2);
    const t = (xbar - mu0) / se, row = S.tTableRow(df), ts = tCrit(df, alpha, dir), reject = IN_RR(t, dir, ts), pt = tPvPart(t, dir, df);
    if ((pt.exact <= alpha) !== reject || (pt.b.lo < alpha && alpha < pt.b.hi)) return tTest();  // unlisted df put t on the boundary: draw again
    const tsOther = tCrit(df, alpha, dir === "ne" ? "gt" : "ne"), tsN = S.tTableValue(S.tTableRow(nn), dir === "ne" ? alpha / 2 : alpha), zs = zCrit(alpha, dir);
    const tMis = [{ value: tsOther, tol: 0.0015, msg: dir === "ne" ? "Two-sided: use column \\(\\alpha/2\\), not \\(\\alpha\\)." : "One-sided: use column \\(\\alpha\\), not \\(\\alpha/2\\)." }, { value: zs, tol: 0.0015, msg: "That is \\(z^*\\). For a mean with \\(s\\), use the row \\(df = n - 1\\)." }];
    if (Math.abs(tsN - ts) > 0.0005) tMis.push({ value: tsN, tol: 0.0015, msg: "That row is \\(df = n\\). Use \\(df = n - 1\\)." });
    return {
      prompt: `<p>Test whether the ${what} is <strong>${WORD[dir]} ${mu0}</strong> ${unit}. A random sample of ${nn} gives \\(\\bar x = ${n(xbar, dec + 2)}\\) and \\(s = ${n(s)}\\); the data show no extreme skew or outliers. Use \\(\\alpha = ${alpha}\\).</p>`,
      parts: [
        { type: "num", label: "Test statistic \\(t\\) (3 decimals)", answer: t, tol: 0.006, show: S.fmt(t, 3),
          mistakes: [{ value: (xbar - mu0) / s, tol: 0.006, msg: "Divide by the standard error \\(s/\\sqrt n\\), not by \\(s\\)." }, { value: -t, tol: 0.006, msg: "Sign reversed: compute \\(\\bar x - \\mu_0\\)." }] },
        { type: "num", label: "Degrees of freedom", answer: df, tol: 0.01, show: String(df), mistakes: [{ value: nn, msg: "\\(df = n - 1\\)." }] },
        { type: "num", method: "cv", label: "Critical value \\(t^*\\) from the t-table", answer: ts, tol: 0.0015, show: ts.toFixed(3), mistakes: tMis },
        DEC("cv", reject, alpha, `Rejection region: ${RULE(dir, ts.toFixed(3))}. \\(t = ${S.fmt(t, 3).replace("−", "-")}\\) is ${reject ? "in" : "not in"} it.`),
        pt.part,
        DEC("pv", reject, alpha, `${BR(pt.b)} (exactly ${P4(pt.exact)}), which is ${reject ? "at most" : "greater than"} \\(\\alpha = ${alpha}\\).`)
      ],
      hand: [
        T`\(H_0: \mu = ${mu0}\) versus \(H_a: \mu ${SYM[dir]} ${mu0}\). Conditions: random sample; no extreme skew or outliers.`,
        T`\(t = \dfrac{${n(xbar, dec + 2)} - ${mu0}}{${n(s)}/\sqrt{${nn}}} = \dfrac{${f4(xbar - mu0)}}{${f4(se)}} = ${S.fmt(t, 3).replace("−", "-")}\), with \(df = ${nn} - 1 = ${df}\).`,
        `<strong>Critical-value method:</strong> row \\(df = ${row}\\)${row !== df ? ` (${df} is not in the table, so use the next smaller row)` : ""}, ${COL(alpha, dir)}: \\(t^* = ${ts.toFixed(3)}\\). Reject \\(H_0\\) if ${RULE(dir, ts.toFixed(3))}. \\(t = ${S.fmt(t, 3).replace("−", "-")}\\) is ${reject ? "" : "not "}in the rejection region.`,
        `<strong>p-value method:</strong> p-value = ${PFORM(dir, "T", S.fmt(t, 3).replace("−", "-"))}. In row \\(df = ${pt.b.row}\\), find where ${S.fmt(Math.abs(t), 3)} falls among the table values${dir === "ne" ? " and double the column areas" : ""}: ${BR(pt.b)}. Exactly, p-value = ${P4(pt.exact)}. It is ${reject ? "at most" : "greater than"} \\(\\alpha = ${alpha}\\).`,
        `Either way, ${reject ? "reject" : "fail to reject"} \\(H_0\\). There ${reject ? "is" : "is not"} sufficient evidence at the ${alpha} level that the ${what} is ${WORD[dir]} ${mu0} ${unit}.`
      ],
      figure: RRPlot.svg({ dist: "t", df, dir, crit: ts, ts: S.round(t, 3), alpha }),
      ti: `${HandUI.keys("[STAT] [▶] {2:T-Test}")}, Stats: μ0 = ${mu0}, x̄ = ${n(xbar, dec + 2)}, Sx = ${n(s)}, n = ${nn}; it reports t and p = ${P4(pt.exact)}. ${HandUI.screen(`invT(${n(1 - (dir === "ne" ? alpha / 2 : alpha))},${df})`)} uses the exact df${row !== df ? ", so it differs slightly from the table row" : ""}.`,
      excel: HandUI.xl(`=T.INV(${n(1 - (dir === "ne" ? alpha / 2 : alpha))},${row})`, ts.toFixed(3))
    };
  }

  // ---- decision and conclusion from the rejection region ----
  function decide() {
    const alpha = R.pick([0.01, 0.05, 0.1]);
    const [par, ctx, v, dir] = R.pick([["p", "proportion of defective chips", "0.02", "gt"], ["\\mu", "mean wait time", "15 minutes", "lt"], ["p", "proportion of voters who support the measure", "0.5", "ne"], ["\\mu", "mean battery life", "40 hours", "gt"]]);
    const isP = par === "p", nn = isP ? R.pick([200, 400, 500, 800]) : R.pick([10, 13, 16, 21, 26]), df = nn - 1;
    const c = isP ? zCrit(alpha, dir) : tCrit(df, alpha, dir);
    const mag = S.round(c + R.pick([-1, 1]) * R.pick([0.12, 0.35, 0.7, 1.1]), 2), sign = dir === "lt" ? -1 : dir === "gt" ? 1 : R.pick([-1, 1]);
    const ts = S.round(sign * Math.max(0.05, mag), 2), reject = IN_RR(ts, dir, c), pp = isP ? zPvPart(ts, dir) : tPvPart(ts, dir, df), pval = isP ? pp.p : pp.exact;
    if ((pval <= alpha) !== reject || (!isP && pp.b.lo < alpha && alpha < pp.b.hi)) return decide();
    const opts = [
      `Reject H₀. There is sufficient evidence that the ${ctx} is ${WORD[dir]} ${v}.`,
      `Fail to reject H₀. There is not sufficient evidence that the ${ctx} is ${WORD[dir]} ${v}.`,
      `Reject H₀. This proves the ${ctx} is ${WORD[dir]} ${v}.`,
      `Accept H₀. The ${ctx} equals ${v}.`
    ];
    const ans = reject ? 0 : 1;
    return {
      prompt: `<p>A test of \\(H_0: ${par} = \\) ${v} versus \\(H_a: ${par} ${SYM[dir]}\\) ${v} uses ${isP ? `a random sample of ${nn} and gives \\(z = ${ts}\\)` : `a random sample of ${nn} (\\(df = ${df}\\)) and gives \\(t = ${ts}\\)`}. Use \\(\\alpha = ${alpha}\\).</p>`,
      parts: [
        { type: "num", method: "cv", label: `Critical value \\(${isP ? "z^*" : "t^*"}\\)`, answer: c, tol: 0.0015, show: c.toFixed(3),
          mistakes: [{ value: isP ? zCrit(alpha, dir === "ne" ? "gt" : "ne") : tCrit(df, alpha, dir === "ne" ? "gt" : "ne"), tol: 0.0015, msg: dir === "ne" ? "Two-sided: use column \\(\\alpha/2\\)." : "One-sided: use column \\(\\alpha\\)." }] },
        { type: "choice", method: "cv", label: "Decision and conclusion", options: opts, answer: ans,
          why: { [1 - ans]: `Rejection region: ${RULE(dir, c.toFixed(3))}. The test statistic ${ts} is ${reject ? "in" : "not in"} it.`, 2: "A test never proves anything; it measures the strength of evidence.", 3: "We never 'accept' H₀. Not finding evidence against it is not proof that it is true." } },
        pp.part,
        { type: "choice", method: "pv", label: "Decision and conclusion", options: opts, answer: ans,
          why: { [1 - ans]: `p-value ${isP ? "= " + P4(pp.p) : ": " + BR(pp.b)} is ${reject ? "at most" : "greater than"} \\(\\alpha = ${alpha}\\).`, 2: "A test never proves anything; it measures the strength of evidence.", 3: "We never 'accept' H₀. Not finding evidence against it is not proof that it is true." } }],
      hand: [`Critical value: ${isP ? "\\(z^*\\) row" : `row \\(df = ${S.tTableRow(df)}\\)${S.tTableRow(df) !== df ? " (next smaller listed df)" : ""}`}, ${COL(alpha, dir)}, so ${isP ? "\\(z^*\\)" : "\\(t^*\\)"} \\(= ${c.toFixed(3)}\\). Reject \\(H_0\\) if ${RULE(dir, c.toFixed(3))}.`,
        `The test statistic ${ts} is ${reject ? "" : "not "}in the rejection region, so ${reject ? "reject" : "fail to reject"} \\(H_0\\).`,
        `<strong>p-value method:</strong> p-value = ${PFORM(dir, isP ? "Z" : "T", ts)}${isP ? ` = ${P4(pp.p)} (normal table, left area ${pp.left.toFixed(4)})` : `: in row \\(df = ${pp.b.row}\\), ${BR(pp.b)}; exactly ${P4(pp.exact)}`}. It is ${reject ? "at most" : "greater than"} \\(\\alpha = ${alpha}\\): the same decision.`,
        "State the conclusion about \\(H_a\\), in context, without claiming proof."],
      figure: RRPlot.svg({ dist: isP ? "z" : "t", df, dir, crit: c, ts, alpha })
    };
  }

  // ---- p-value and decision ----
  function pvalue() {
    const isP = R.coin(), dir = R.pick(["gt", "lt", "ne"]), alpha = R.pick([0.01, 0.05, 0.1]);
    const nn = isP ? R.pick([100, 200, 300, 500]) : R.pick([6, 9, 11, 13, 16, 21, 26, 31, 41]), df = nn - 1;
    const sign = dir === "lt" ? -1 : dir === "gt" ? 1 : R.pick([-1, 1]), ts = S.round(sign * R.int(isP ? 30 : 40, isP ? 330 : 420) / 100, isP ? 2 : 3);
    const T = isP ? "Z" : "T", c = isP ? zCrit(alpha, dir) : tCrit(df, alpha, dir), reject = IN_RR(ts, dir, c);
    const pp = isP ? zPvPart(ts, dir) : tPvPart(ts, dir, df), pval = isP ? pp.p : pp.exact;
    if ((pval <= alpha) !== reject || (!isP && pp.b.lo < alpha && alpha < pp.b.hi)) return pvalue();
    const sym = isP ? "p" : "\\mu", tsS = String(ts).replace("-", "−");
    const areas = [`${PFORM("gt", T, ts)}, the area to the right of TS`, `${PFORM("lt", T, ts)}, the area to the left of TS`, `${PFORM("ne", T, ts)}, both tails`];
    const ans = ["gt", "lt", "ne"].indexOf(dir);
    pp.part.method = undefined;
    return {
      prompt: `<p>A test of \\(H_0: ${sym} = ${sym}_0\\) versus \\(H_a: ${sym} ${SYM[dir]} ${sym}_0\\) uses ${isP ? `a random sample of ${nn}` : `a random sample of ${nn} (\\(df = ${df}\\))`} and gives the test statistic ${isP ? "z" : "t"} = ${tsS}. Use \\(\\alpha = ${alpha}\\).</p>`,
      parts: [
        { type: "choice", label: "Which area is the p-value?", options: areas, answer: ans, fixed: true,
          why: Object.fromEntries([0, 1, 2].filter(i => i !== ans).map(i => [i, i === 2 ? "Only a two-sided \\(H_a\\) (≠) uses both tails." : dir === "ne" ? "\\(H_a\\) is ≠, so the p-value counts both tails: double one tail." : `The p-value follows the direction of \\(H_a\\): ${dir === "gt" ? "> means the area to the right" : "< means the area to the left"}.`])) },
        pp.part,
        DEC(undefined, reject, alpha, `p-value ${isP ? "= " + P4(pp.p) : ": " + BR(pp.b)} is ${reject ? "at most" : "greater than"} \\(\\alpha = ${alpha}\\).`)
      ],
      hand: [
        `\\(H_a\\) has ${dir === "gt" ? ">" : dir === "lt" ? "<" : "≠"}, so p-value = ${PFORM(dir, T, ts)}${dir === "ne" ? ": double the tail beyond |TS|" : ""}.`,
        isP ? `Normal table: the left area at \\(z = ${pp.zr.toFixed(2)}\\) is ${pp.left.toFixed(4)}, so p-value = ${dir === "gt" ? `1 − ${pp.left.toFixed(4)} = ` : dir === "ne" ? `2 × ${Math.min(pp.left, 1 - pp.left).toFixed(4)} = ` : ""}${P4(pp.p)}.`
          : `t-table, row \\(df = ${pp.b.row}\\)${pp.b.row !== df ? ` (${df} is not listed, so the next smaller row)` : ""}: ${S.fmt(Math.abs(ts), 3)} falls between the table values for the column areas that give ${BR(pp.b)}${dir === "ne" ? " after doubling" : ""}. Exactly (tcdf or T.DIST), p-value = ${P4(pp.exact)}.`,
        `p-value ${reject ? "≤" : ">"} \\(\\alpha = ${alpha}\\), so ${reject ? "reject" : "fail to reject"} \\(H_0\\). The critical-value method agrees: ${isP ? "\\(z^*\\)" : "\\(t^*\\)"} = ${c.toFixed(3)}, and TS is ${reject ? "" : "not "}in the rejection region.`
      ],
      figure: RRPlot.svg({ dist: isP ? "z" : "t", df: isP ? null : df, dir, crit: c, ts, alpha, mode: "pv" }),
      ti: isP ? `${HandUI.screen(dir === "gt" ? `normalcdf(${ts},1E99)` : dir === "lt" ? `normalcdf(-1E99,${ts})` : `2*normalcdf(${Math.abs(ts)},1E99)`)} = ${P4(PV("z", ts, dir) )} (unrounded z, so it can differ slightly from the table).`
        : `${HandUI.screen(dir === "gt" ? `tcdf(${ts},1E99,${df})` : dir === "lt" ? `tcdf(-1E99,${ts},${df})` : `2*tcdf(${Math.abs(ts)},1E99,${df})`)} = ${P4(pp.exact)}.`,
      excel: isP ? HandUI.xl(dir === "gt" ? `=1-NORM.S.DIST(${pp.zr.toFixed(2)},TRUE)` : dir === "lt" ? `=NORM.S.DIST(${pp.zr.toFixed(2)},TRUE)` : `=2*(1-NORM.S.DIST(${Math.abs(pp.zr).toFixed(2)},TRUE))`, P4(pp.p))
        : HandUI.xl(dir === "gt" ? `=T.DIST.RT(${ts},${df})` : dir === "lt" ? `=T.DIST(${ts},${df},TRUE)` : `=T.DIST.2T(${Math.abs(ts)},${df})`, P4(pp.exact))
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
        { type: "choice", label: "Will the test statistic fall in the rejection region?", options: ["Yes", "No"], answer: inside ? 1 : 0, fixed: true, why: { [inside ? 0 : 1]: "The test and the interval give the same decision: the TS is in the rejection region exactly when we reject." } }
      ],
      hand: [`A two-sided test at \\(\\alpha = ${alpha}\\) matches a ${C}% confidence interval (\\(C = 1 - \\alpha\\)).`, `${n(v)} is ${inside ? "inside" : "outside"} \\((${n(L)},\\ ${n(U)})\\), so ${inside ? "fail to reject \\(H_0\\): the test statistic would not fall in the rejection region" : "reject \\(H_0\\): the test statistic would fall in the rejection region"}.`]
    };
  }

  // ---- practical significance ----
  const PRAC = [
    ["With 2,000 volunteers, a $1.50 headache pill brought relief 6.6 seconds faster on average than a $0.10 pill (the test statistic fell in the rejection region at α = 0.05).", 1, "Statistically significant, but 6.6 seconds isn't worth $1.40 more per pill."],
    ["With 50,000 students, a tutoring program raised mean exam scores by 0.2 points out of 100 (the test statistic fell far into the rejection region).", 1, "A tiny difference becomes 'significant' with a huge sample; 0.2 points doesn't matter in practice."],
    ["In 400 patients, a new drug lowered systolic blood pressure by 15 mm Hg more than placebo (the test statistic fell far into the rejection region).", 0, "The effect is both statistically significant and large enough to matter medically."],
    ["With 60 trial runs, a new route cut a delivery truck's mean time by 25 minutes per day (the test statistic fell in the rejection region at α = 0.05).", 0, "Significant, and 25 minutes a day is a meaningful savings."],
    ["With 1 million web visitors, a button color raised click rate from 3.10% to 3.12% (the test statistic fell in the rejection region at α = 0.05); changing it costs $200,000.", 1, "Statistically significant, but a 0.02-point gain isn't worth the cost."]
  ];
  function practical() {
    const [txt, ans, why] = R.pick(PRAC);
    return {
      prompt: `<p>${txt}</p><p>Is the result practically significant?</p>`,
      parts: [{ type: "choice", label: "Assessment", options: ["Statistically and practically significant", "Statistically significant but not practically significant"], answer: ans, fixed: true, why: { [1 - ans]: why } }],
      hand: ["Statistical significance: does the test statistic fall in the rejection region? Practical significance: is the size of the difference big enough to matter to the people affected?", why]
    };
  }

  HandKit.mount("#practice-app", {
    module: 8,
    skills: [
      { id: "m8-hyp", title: "Writing hypotheses", gen: hypotheses },
      { id: "m8-ztest", title: "Test for a proportion (z test)", gen: zTest },
      { id: "m8-ttest", title: "Test for a mean (t test, critical value)", gen: tTest },
      { id: "m8-decide", title: "Decision and conclusion", gen: decide },
      { id: "m8-errors", title: "Type I and Type II errors", gen: errors },
      { id: "m8-power", title: "Power and β", gen: power },
      { id: "m8-citest", title: "Using a CI to decide a test", gen: ciTest },
      { id: "m8-practical", title: "Practical significance", gen: practical },
      { id: "m8-pv", title: "p-value and decision", gen: pvalue }
    ]
  });
})();
