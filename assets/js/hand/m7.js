/* Ported from stat2331-learn: multi-step, hand-first questions with mistake diagnosis. */
/* Module 7 practice: Confidence Intervals */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw, n = HandKit.tx;
  const f4 = x => S.fmt(x, 4).replace("−", "-");
  const ZSTAR = { 0.90: 1.645, 0.95: 1.960, 0.99: 2.576 };
  const pc = C => Math.round(C * 100) + "%";

  const PCTX = [
    ["volunteers who notice more energy after drinking Verve", "volunteers", "notice more energy after drinking Verve"],
    ["adults who say they get enough sleep", "adults", "say they get enough sleep"],
    ["SMU students who use the campus gym weekly", "students", "use the campus gym weekly"],
    ["customers who would recommend the store", "customers", "would recommend the store"],
    ["registered voters who support a new stadium", "registered voters", "support a new stadium"],
    ["drivers who admit to texting while driving", "drivers", "admit to texting while driving"]];
  const MCTX = [["facial ratio of 'beautiful' people", "", [1.45, 1.6], [0.08, 0.14], 3], ["percent of calories from fat in nurses' diets", "%", [30, 38], [5, 9], 2],
    ["oxygen level in river water", "ppm", [4.6, 5.2], [0.12, 0.3], 3], ["weekly hours students spend on homework", "hours", [10, 20], [3, 7], 2], ["commute time for Dallas workers", "minutes", [22, 35], [6, 14], 1]];

  // ---- CI for a proportion ----
  function ciP() {
    const C = R.pick([0.90, 0.95, 0.99]), z = ZSTAR[C];
    let nn, X; do { nn = R.pick([60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 800, 1000]); X = R.int(Math.round(nn * 0.08), Math.round(nn * 0.92)); } while (X < 10 || nn - X < 10);
    const ph = X / nn, se = Math.sqrt(ph * (1 - ph) / nn), m = z * se;
    const [ctx, who, pred] = R.pick(PCTX);
    const otherZ = Object.values(ZSTAR).filter(v => v !== z);
    const tolE = Math.max(0.0012, m * 0.01);
    return {
      prompt: `<p>In an SRS of ${nn} ${who}, ${X} ${pred}. Construct a <strong>${pc(C)}</strong> confidence interval for the true proportion of all ${ctx}.</p>`,
      parts: [
        { type: "num", label: T`\(\hat p\) (4 decimals)`, answer: ph, tol: 0.0006, show: f4(ph) },
        { type: "num", label: "Margin of error \\(m\\) (4 decimals)", answer: m, tol: tolE, show: f4(m),
          mistakes: [{ value: z * Math.sqrt(ph * (1 - ph)), msg: "Divide by \\(n\\) inside the square root." }, ...otherZ.map(o => ({ value: o * se, tol: tolE, msg: `That margin uses \\(z^* = ${o}\\). For ${pc(C)} confidence use \\(z^* = ${z}\\).` })), { value: se, msg: "That is the standard error. Multiply it by \\(z^*\\)." }] },
        { type: "num", label: "Lower limit", answer: ph - m, tol: tolE, show: f4(ph - m) },
        { type: "num", label: "Upper limit", answer: ph + m, tol: tolE, show: f4(ph + m) }
      ],
      hand: [
        T`\(\hat p = \dfrac{${X}}{${nn}} = ${f4(ph)}\). Conditions: random sample; \(X = ${X} \ge 10\) successes and \(n - X = ${nn - X} \ge 10\) failures.`,
        T`\(SE = \sqrt{\dfrac{${f4(ph)}(${f4(1 - ph)})}{${nn}}} = ${f4(se)}\).`,
        T`For ${pc(C)} confidence, \(z^* = ${z}\). \(m = ${z}(${f4(se)}) = ${f4(m)}\).`,
        T`\(${f4(ph)} \pm ${f4(m)} = (${f4(ph - m)},\ ${f4(ph + m)})\).`,
        `We are ${pc(C)} confident that the true proportion of all ${ctx} is between ${S.fmt(ph - m, 3)} and ${S.fmt(ph + m, 3)}.`
      ],
      ti: `${HandUI.keys("[STAT] [▶] {A:1-PropZInt}")}: x = ${X}, n = ${nn}, C-Level = ${C}. Result ${HandUI.screen(`(${S.fmt(ph - m, 5)}, ${S.fmt(ph + m, 5)})`)}`,
      excel: `A1: <code>=${X}/${nn}</code>` + HandUI.xl(`=NORM.S.INV(${1 - (1 - C) / 2})*SQRT(A1*(1-A1)/${nn})`, f4(S.qnorm(1 - (1 - C) / 2) * se))
    };
  }

  // ---- t* from the table ----
  const TABLE_DF = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 40, 50, 60, 80, 100];
  function tStar() {
    const C = R.pick([0.80, 0.90, 0.95, 0.98, 0.99]);
    const useN = R.coin(0.6);
    const df = R.pick(TABLE_DF), nn = df + 1;
    const tail = (1 - C) / 2, t = S.tTableValue(df, tail);
    const wrongDf = S.T_DF.includes(nn) ? S.tTableValue(nn, tail) : null;
    const z = S.qnorm(1 - tail);
    return {
      prompt: useN ? `<p>You want a ${pc(C)} confidence interval for a mean from a sample of \\(n = ${nn}\\). What critical value \\(t^*\\) do you use?</p>` : `<p>Find \\(t^*\\) for ${pc(C)} confidence with \\(df = ${df}\\).</p>`,
      parts: [{ type: "num", label: T`\(t^*\) (3 decimals)`, answer: t, tol: 0.0015, show: t.toFixed(3),
        mistakes: [...(wrongDf != null && useN ? [{ value: wrongDf, msg: "Use \\(df = n - 1\\), not \\(n\\)." }] : []), { value: z, tol: 0.002, msg: "That is \\(z^*\\). For a mean with \\(s\\), use the \\(t\\) table row for your df." },
          { value: S.tTableValue(df, 1 - C), tol: 0.0015, msg: `That column puts all of α = ${S.num(1 - C, 2)} in one tail. Use the column for upper-tail area α/2 = ${S.num(tail, 3)} (bottom row ${pc(C)}).` }] }],
      hand: [useN ? T`\(df = n - 1 = ${nn} - 1 = ${df}\).` : T`\(df = ${df}\).`,
        T`For ${pc(C)} confidence, the two tails hold \(\alpha = ${S.num(1 - C, 2)}\), so each tail has \(${S.num(tail, 3)}\). Find the column whose bottom row reads ${pc(C)} (upper-tail area ${S.num(tail, 3)}).`,
        T`Row \(df = ${df}\), that column: \(t^* = ${t.toFixed(3)}\). (For comparison, \(z^* = ${z.toFixed(3)}\); \(t^*\) is larger because the \(t\) distribution has heavier tails.)`],
      ti: HandUI.screen(`invT(${S.num(1 - tail, 4)},${df})`) + ` = ${S.qt(1 - tail, df).toFixed(4)}`,
      excel: HandUI.xl(`=T.INV(${S.num(1 - tail, 4)},${df})`, S.qt(1 - tail, df).toFixed(4))
    };
  }

  // ---- CI for a mean ----
  function ciMu() {
    const C = R.pick([0.90, 0.95, 0.99]);
    const [ctx, unit, mr, sr, dec] = R.pick(MCTX);
    const df = R.pick(TABLE_DF.filter(d => d >= 7)), nn = df + 1;
    const xbar = S.round(mr[0] + Math.random() * (mr[1] - mr[0]), dec), s = S.round(sr[0] + Math.random() * (sr[1] - sr[0]), dec + 1);
    const tail = (1 - C) / 2, t = S.tTableValue(df, tail), se = s / Math.sqrt(nn), m = t * se;
    const tol = Math.max(0.0012, m * 0.006);
    const z = ZSTAR[C];
    return {
      prompt: `<p>An SRS of ${nn} gives a mean ${ctx} of \\(\\bar x = ${n(xbar)}\\)${unit ? " " + unit : ""} with \\(s = ${n(s)}\\). The data show no extreme skew or outliers. Construct a <strong>${pc(C)}</strong> confidence interval for the true mean.</p>`,
      parts: [
        { type: "num", label: T`\(t^*\) (3 decimals)`, answer: t, tol: 0.0015, show: t.toFixed(3), mistakes: [{ value: z, tol: 0.002, msg: "That is \\(z^*\\). With \\(s\\) in place of \\(\\sigma\\), use \\(t^*\\) with \\(df = n-1\\)." }] },
        { type: "num", label: "Margin of error \\(m\\) (4 decimals)", answer: m, tol, show: f4(m),
          mistakes: [{ value: t * s, tol, msg: "Use the standard error \\(s/\\sqrt n\\), not \\(s\\)." }, { value: z * se, tol, msg: `That margin uses \\(z^* = ${z}\\). Means use \\(t^* = ${t.toFixed(3)}\\).` }] },
        { type: "num", label: "Lower limit", answer: xbar - m, tol, show: f4(xbar - m) },
        { type: "num", label: "Upper limit", answer: xbar + m, tol, show: f4(xbar + m) }
      ],
      hand: [
        "Conditions: an SRS (independence), and no extreme skew or outliers (normality is reasonable for \\(t\\) procedures).",
        T`\(df = ${nn} - 1 = ${df}\). For ${pc(C)}, the table gives \(t^* = ${t.toFixed(3)}\).`,
        T`\(SE = \dfrac{${n(s)}}{\sqrt{${nn}}} = ${f4(se)}\), so \(m = ${t.toFixed(3)}(${f4(se)}) = ${f4(m)}\).`,
        T`\(${n(xbar)} \pm ${f4(m)} = (${f4(xbar - m)},\ ${f4(xbar + m)})\).`,
        `We are ${pc(C)} confident that the true mean ${ctx} is between ${f4(xbar - m)} and ${f4(xbar + m)}${unit ? " " + unit : ""}.`
      ],
      ti: `${HandUI.keys("[STAT] [▶] {8:TInterval}")}, Inpt: Stats, x̄ = ${n(xbar)}, Sx = ${n(s)}, n = ${nn}, C-Level = ${C}.`,
      excel: HandUI.xl(`=CONFIDENCE.T(${S.num(1 - C, 2)},${n(s)},${nn})`, f4(m)) + "<p style='margin:.3rem 0 0'>Add and subtract this margin from x̄.</p>"
    };
  }

  // ---- point estimate and margin from an interval ----
  function fromInterval() {
    const isP = R.coin();
    const center = isP ? R.int(15, 85) / 100 : R.int(200, 900) / 10, m = isP ? R.int(10, 90) / 1000 : R.int(5, 60) / 10;
    const L = S.round(center - m, 3), U = S.round(center + m, 3);
    return {
      prompt: `<p>A 95% confidence interval for ${isP ? "a population proportion \\(p\\)" : "a population mean \\(\\mu\\)"} is \\((${n(L)},\\ ${n(U)})\\).</p>`,
      parts: [
        { type: "num", label: isP ? T`Point estimate \(\hat p\)` : T`Point estimate \(\bar x\)`, answer: center, tol: 0.0006, show: n(center), mistakes: [{ value: U - L, msg: "That is the width. The point estimate is the midpoint, \\((L+U)/2\\)." }] },
        { type: "num", label: "Margin of error \\(m\\)", answer: m, tol: 0.0006, show: n(m), mistakes: [{ value: U - L, msg: "That is the width, \\(2m\\). Divide by 2." }] }
      ],
      hand: [T`The interval is centered at the estimate: \(\dfrac{${n(L)} + ${n(U)}}{2} = ${n(center)}\).`, T`The margin is half the width: \(\dfrac{${n(U)} - ${n(L)}}{2} = ${n(m)}\).`]
    };
  }

  // ---- sample size ----
  function sampleSize(kind) {
    if (kind ? kind === "p" : R.coin()) {
      const C = R.pick([0.90, 0.95, 0.99]), z = ZSTAR[C], m = R.pick([0.01, 0.02, 0.025, 0.03, 0.04, 0.05]);
      const guess = R.coin(0.4) ? null : R.int(10, 90) / 100, p = guess == null ? 0.5 : guess;
      const raw = z * z * p * (1 - p) / (m * m), need = Math.ceil(raw - 1e-9);
      return {
        prompt: `<p>How large a sample is needed to estimate a proportion to within \\(m = ${n(m)}\\) with ${pc(C)} confidence? ${guess == null ? "There is no prior estimate of \\(p\\)." : `A pilot study gave \\(\\hat p = ${n(guess)}\\).`}</p>`,
        parts: [{ type: "num", label: "Sample size \\(n\\)", answer: need, tol: 0.01, show: String(need),
          mistakes: [{ value: Math.floor(raw), msg: "Always round up; rounding down gives a margin slightly bigger than the target." }, { value: Math.ceil(z * Math.sqrt(p * (1 - p)) / m), msg: "Square both \\(z^*\\) and \\(m\\): \\(n = (z^*)^2\\hat p(1-\\hat p)/m^2\\)." }] }],
        hand: [guess == null ? "No estimate is available, so use the conservative \\(\\hat p = 0.5\\)." : T`Use \(\hat p = ${n(guess)}\).`,
          T`\(n = \dfrac{(${z})^2(${n(p)})(${n(1 - p)})}{(${n(m)})^2} = ${S.fmt(raw, 3)}\).`, `Round up: \\(n = ${need}\\).`]
      };
    }
    const s = R.int(3, 40), m = R.pick([0.5, 1, 1.5, 2, 2.5, 3]);
    const raw = 4 * s * s / (m * m), need = Math.ceil(raw - 1e-9);
    return {
      prompt: T`<p>A pilot study suggests \(s = ${s}\). How many observations are needed to estimate the mean to within \(m = ${n(m)}\) with 95% confidence?</p>`,
      parts: [{ type: "num", label: "Sample size \\(n\\)", answer: need, tol: 0.01, show: String(need),
        mistakes: [{ value: Math.floor(raw), msg: "Always round up." }, { value: Math.ceil(2 * s / m), msg: "Square the ratio: \\(n = (2s/m)^2 = 4s^2/m^2\\)." }, { value: Math.ceil(1.96 * 1.96 * s * s / (m * m) - 1e-9), msg: "The course formula for a mean uses \\(t^* \\approx 2\\): \\(n = 4s^2/m^2\\)." }] }],
      hand: [T`At 95% confidence \(t^* \approx 2\), so \(m = 2s/\sqrt n\) gives \(n = 4s^2/m^2\).`, T`\(n = \dfrac{4(${s})^2}{(${n(m)})^2} = ${S.fmt(raw, 3)}\).`, `Round up: \\(n = ${need}\\).`]
    };
  }

  // ---- interpretation ----
  function interpret() {
    const [ctx] = R.pick(PCTX);
    const L = R.int(20, 60) / 100, U = S.round(L + R.int(6, 16) / 100, 2), C = R.pick([90, 95, 99]);
    const opts = [
      `We are ${C}% confident that the true proportion of all ${ctx} is between ${n(L)} and ${n(U)}.`,
      `There is a ${C}% probability that the true proportion is between ${n(L)} and ${n(U)}.`,
      `${C}% of the people in the sample fall between ${n(L)} and ${n(U)}.`,
      `${C}% of all sample proportions will fall between ${n(L)} and ${n(U)}.`
    ];
    const why = { 1: "After the interval is computed, the parameter is either in it or not; the probability is about the method, so we say 'confident.'", 2: "The interval is about the population parameter, not about individual people in the sample.", 3: "Different samples give different intervals; the interval estimates the parameter, it doesn't contain a fixed share of sample proportions." };
    return {
      prompt: `<p>A ${C}% confidence interval for the proportion of ${ctx} is \\((${n(L)},\\ ${n(U)})\\). Which interpretation is correct?</p>`,
      parts: [{ type: "choice", label: "Interpretation", options: opts, answer: 0, why }],
      hand: ["A correct interpretation names the confidence level, the parameter in context, and the interval.", `In repeated sampling, ${C}% of intervals made this way capture the true proportion. That is what "${C}% confident" means.`]
    };
  }

  // ---- what changes the margin? ----
  function marginChange() {
    const cases = [
      ["The sample size is increased from 100 to 400.", 0, "The SE has \\(\\sqrt n\\) in the denominator, so a bigger \\(n\\) makes the margin smaller (here, half as big)."],
      ["The confidence level is raised from 90% to 99%.", 1, "Higher confidence needs a larger critical value, so the margin grows."],
      ["The confidence level is lowered from 95% to 90%.", 0, "A smaller critical value gives a smaller margin."],
      ["The sample size is cut from 400 to 100.", 1, "Fewer observations mean a larger SE, so a wider interval."],
      ["A new sample of the same size has a larger standard deviation \\(s\\).", 1, "A larger \\(s\\) makes the SE, and so the margin, bigger."]
    ];
    const [txt, ans, why] = R.pick(cases);
    return {
      prompt: `<p>Everything else stays the same. ${txt} What happens to the margin of error?</p>`,
      parts: [{ type: "choice", label: "The margin of error", options: ["Gets smaller", "Gets larger", "Stays the same"], answer: ans, fixed: true, why: { 0: why, 1: why, 2: why } }],
      hand: ["\\(m = (\\text{critical value}) \\times SE\\). Ask how the change affects each piece.", why]
    };
  }

  HandKit.mount("#practice-app", {
    module: 7,
    skills: [
      { id: "m7-cip", title: "Confidence interval for p", gen: ciP },
      { id: "m7-tstar", title: "Reading t* from the table", gen: tStar },
      { id: "m7-cimu", title: "Confidence interval for μ", gen: ciMu },
      { id: "m7-interval", title: "Estimate and margin from an interval", gen: fromInterval },
      { id: "m7-n", title: "Sample size for a target margin", gen: sampleSize },
      { id: "m7-n-p", title: "Sample size for p", gen: () => sampleSize("p") },
      { id: "m7-n-mu", title: "Sample size for μ", gen: () => sampleSize("mu") },
      { id: "m7-interp", title: "Interpreting a confidence interval", gen: interpret },
      { id: "m7-margin", title: "What changes the margin of error", gen: marginChange }
    ]
  });

})();
