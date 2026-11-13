/* Ported from stat2331-learn: multi-step, hand-first questions with mistake diagnosis. */
/* Module 2 practice: Data Relationships */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw;
  const n = (x, d = 4) => S.num(x, d).replace("−", "-");

  // ---- explanatory vs response ----
  const PAIRS = [
    ["Hours studied for an exam", "Exam score"], ["Dose of a pain reliever (mg)", "Time to relief (minutes)"],
    ["Amount of fertilizer applied", "Corn yield per acre"], ["Whether a person smokes", "Whether the person survives 20 years"],
    ["Daily gasoline used by cars in a city", "Air pollution level (ppm)"], ["Type of diet plan (A, B, or C)", "Weight lost in 6 weeks"],
    ["Car weight (pounds)", "Gas mileage (MPG)"], ["Gestational age at birth (weeks)", "Birth weight (grams)"],
    ["Number of hours of sleep", "Reaction time on a driving test"], ["Price of a product", "Number of units sold"],
    ["Outside temperature", "Ice cream sales"], ["Years of education", "Annual income"]
  ];
  function roles() {
    const [x, y] = R.pick(PAIRS);
    const flip = R.coin();
    const opts = flip ? [y, x] : [x, y];
    const ans = flip ? 1 : 0;
    return {
      prompt: `<p>A study records two variables:</p><ul><li>${opts[0]}</li><li>${opts[1]}</li></ul><p>Which one is the explanatory variable?</p>`,
      parts: [{ type: "choice", label: "Explanatory variable", options: opts, answer: ans, fixed: true,
        why: { [1 - ans]: `That is the outcome being measured, so it is the response. The explanatory variable is the one that may influence it: ${x.toLowerCase()}.` } }],
      hand: [
        "Ask which variable could plausibly influence or explain the other.",
        `${x} may affect ${y.toLowerCase()}, not the other way around. So ${x.toLowerCase()} is explanatory (\\(x\\)) and ${y.toLowerCase()} is the response (\\(y\\)).`
      ]
    };
  }

  // ---- two-way table ----
  const TABLES = [
    { ex: "Class year", rows: ["First year", "Senior"], resp: ["Has a job", "No job"], what: "have a job" },
    { ex: "Food type", rows: ["Conventional", "Organic"], resp: ["Pesticide found", "None found"], what: "have pesticide residue" },
    { ex: "Treatment", rows: ["New drug", "Placebo"], resp: ["Improved", "Did not improve"], what: "improved" },
    { ex: "Living situation", rows: ["On campus", "Off campus"], resp: ["Eats breakfast", "Skips breakfast"], what: "eat breakfast" },
    { ex: "Seat location", rows: ["Front half", "Back half"], resp: ["Passed", "Failed"], what: "passed" }
  ];
  function twoWay() {
    const t = R.pick(TABLES);
    const assoc = R.coin(0.55);
    const pA = R.int(20, 80) / 100;
    const pB = assoc ? Math.min(0.95, Math.max(0.05, pA + R.pick([-1, 1]) * R.int(18, 35) / 100)) : pA + R.int(-3, 3) / 100;
    const nA = R.int(8, 30) * 5, nB = R.int(8, 30) * 5;
    const aYes = Math.round(nA * pA), bYes = Math.round(nB * pB);
    const rA = aYes / nA, rB = bYes / nB;
    const realAssoc = Math.abs(rA - rB) >= 0.1;
    const rowHtml = (name, y, tot) => `<tr><td>${name}</td><td>${y}</td><td>${tot - y}</td><td>${tot}</td></tr>`;
    const grand = nA + nB;
    return {
      prompt: `<p>The table classifies subjects by ${t.ex.toLowerCase()} (explanatory, rows) and outcome (response, columns).</p>
        <div class="table-scroll"><table class="data"><thead><tr><th>${t.ex}</th><th>${t.resp[0]}</th><th>${t.resp[1]}</th><th>Total</th></tr></thead>
        <tbody>${rowHtml(t.rows[0], aYes, nA)}${rowHtml(t.rows[1], bYes, nB)}<tr><td><strong>Total</strong></td><td>${aYes + bYes}</td><td>${grand - aYes - bYes}</td><td>${grand}</td></tr></tbody></table></div>
        <p>What proportion of each group ${t.what}? Is there an association?</p>`,
      parts: [
        { type: "num", label: `Proportion of ${t.rows[0]} who ${t.what} (4 decimals)`, answer: rA, tol: 0.0006, show: S.fmt(rA, 4),
          mistakes: [{ value: aYes / grand, msg: "You divided by the grand total. The group is the row, so divide by the row total." },
                     { value: aYes / (aYes + bYes), msg: "You divided by the column total. That answers a different question: of those who " + t.what + ", what share were " + t.rows[0] + "?" }] },
        { type: "num", label: `Proportion of ${t.rows[1]} who ${t.what} (4 decimals)`, answer: rB, tol: 0.0006, show: S.fmt(rB, 4),
          mistakes: [{ value: bYes / grand, msg: "You divided by the grand total. Divide by the row total." },
                     { value: bYes / (aYes + bYes), msg: "You divided by the column total. Divide by the row total." }] },
        { type: "choice", label: "Do the data suggest an association?", options: ["Yes, the row proportions differ noticeably", "No, the row proportions are about the same"], answer: realAssoc ? 0 : 1, fixed: true,
          why: { [realAssoc ? 1 : 0]: `Compare ${S.fmt(rA, 3)} with ${S.fmt(rB, 3)}. ${realAssoc ? "A gap of " + S.fmt(Math.abs(rA - rB), 3) + " is a real difference between groups." : "They are within a few percentage points of each other."}` } }
      ],
      hand: [
        T`${t.rows[0]}: \(\dfrac{${aYes}}{${nA}} = ${S.fmt(rA, 4)}\).`,
        T`${t.rows[1]}: \(\dfrac{${bYes}}{${nB}} = ${S.fmt(rB, 4)}\).`,
        realAssoc ? `The proportions differ by about ${Math.round(Math.abs(rA - rB) * 100)} percentage points, so ${t.ex.toLowerCase()} and the outcome appear associated.`
          : `The proportions differ by only about ${Math.round(Math.abs(rA - rB) * 100)} percentage points, so there is little evidence of an association.`
      ],
      after: "Rule for this course: use the explanatory variable's row totals as denominators. A difference of roughly 10 percentage points or more is a noticeable difference in these practice problems."
    };
  }

  // ---- correlation properties ----
  function corrProps() {
    const r = R.pick([-1, 1]) * R.int(30, 95) / 100;
    const kind = R.int(0, 4);
    let q, opts, ans, explain;
    const rs = n(r, 2), negs = n(-r, 2);
    if (kind === 0) { q = `Weight is converted from pounds to kilograms. What is the new correlation?`; opts = [rs, negs, n(r / 2.2, 2), "0"]; ans = 0; explain = "Changing units does not change \\(R\\)."; }
    else if (kind === 1) { q = `We switch which variable is on the \\(x\\) axis and which is on the \\(y\\) axis. What is the new correlation?`; opts = [rs, negs, n(1 / r, 2), "1"]; ans = 0; explain = "\\(R\\) treats \\(x\\) and \\(y\\) symmetrically, so switching them leaves it unchanged."; }
    else if (kind === 2) { q = `Which describes this relationship?`; const dir = r > 0 ? "positive" : "negative", str = Math.abs(r) >= 0.8 ? "strong" : Math.abs(r) >= 0.5 ? "moderate" : "weak";
      const all = [`${str[0].toUpperCase() + str.slice(1)} and ${dir}`, `${str[0].toUpperCase() + str.slice(1)} and ${dir === "positive" ? "negative" : "positive"}`, "No relationship of any kind", "Perfectly linear"];
      opts = all; ans = 0; explain = `The sign of \\(R\\) gives the direction (${dir}); its distance from 0 gives the strength (${str}).`; }
    else if (kind === 3) { q = `The correlation is near 0 for another pair of variables. Which conclusion is justified?`; opts = ["There is no linear relationship, though a curved one is possible", "There is no relationship of any kind", "The variables are causally unrelated", "The data contain an error"]; ans = 0; explain = "\\(R\\) only measures linear association. A strong curve can still give \\(R\\) near 0."; }
    else { q = `One extreme outlier is added far from the trend. What can happen to \\(R\\)?`; opts = ["It can change a lot, even change sign, because R is not resistant", "Nothing; R is resistant to outliers", "It always moves closer to 1", "It always becomes exactly 0"]; ans = 0; explain = "\\(R\\) is built from means and standard deviations, so a single outlier can move it a lot."; }
    return {
      prompt: `<p>A scatterplot of two quantitative variables shows a linear pattern with \\(R = ${rs}\\).</p><p>${q}</p>`,
      parts: [{ type: "choice", label: "Answer", options: opts, answer: ans, why: Object.fromEntries(opts.map((_, i) => [i, explain])) }],
      hand: [explain]
    };
  }

  // ---- prediction and residual ----
  const LINES = [
    { x: "car weight (pounds)", y: "MPG", b0: [40, 50], b1: [-0.008, -0.004], xr: [2400, 5600], yd: 1 },
    { x: "hours studied", y: "exam score", b0: [45, 60], b1: [3, 6], xr: [1, 10], yd: 1 },
    { x: "gestational age (weeks)", y: "birth weight (grams)", b0: [-1000, -850], b1: [60, 80], xr: [23, 35], yd: 0 },
    { x: "square footage (hundreds)", y: "home price ($ thousands)", b0: [20, 80], b1: [8, 15], xr: [10, 40], yd: 0 }
  ];
  function predict() {
    const L = R.pick(LINES);
    const dec = L.b1[1] - L.b1[0] < 0.01 ? 4 : 2;
    const b0 = R.step(L.b0[0], L.b0[1], 0.5), b1 = S.round(L.b1[0] + Math.random() * (L.b1[1] - L.b1[0]), dec);
    const intX = Number.isInteger(L.xr[0]) && L.xr[1] - L.xr[0] > 100;
    const x = intX ? R.int(L.xr[0] / 10, L.xr[1] / 10) * 10 : R.int(L.xr[0], L.xr[1]);
    const yhat = b0 + b1 * x;
    const spread = Math.max(1, Math.abs(yhat) * 0.08);
    let y = S.round(yhat + (R.coin() ? 1 : -1) * (0.3 + Math.random()) * spread, L.yd);
    if (y === S.round(yhat, L.yd)) y += 1;
    const e = y - yhat;
    const sgn = b1 < 0 ? "-" : "+";
    return {
      prompt: T`<p>The least-squares line relating ${L.y} (\(y\)) to ${L.x} (\(x\)) is</p>\[\hat y = ${n(b0)} ${sgn} ${n(Math.abs(b1))}x\]<p>The data cover \(x\) from ${L.xr[0]} to ${L.xr[1]}. One observation has \(x = ${x}\) and \(y = ${n(y)}\).</p>`,
      parts: [
        { type: "num", label: T`Predicted value \(\hat y\) (2 decimals)`, answer: yhat, tol: Math.max(0.006, Math.abs(yhat) * 0.0005), show: S.fmt(yhat, 2),
          mistakes: [{ value: b1 + b0 * x, msg: "You swapped the slope and the intercept. Multiply \\(x\\) by the slope \\(b_1\\), then add the intercept \\(b_0\\)." }] },
        { type: "num", label: T`Residual \(e = y - \hat y\) (2 decimals)`, answer: e, tol: Math.max(0.006, Math.abs(yhat) * 0.0005), show: S.fmt(e, 2),
          mistakes: [{ value: -e, msg: "The sign is flipped. A residual is observed minus predicted: \\(y - \\hat y\\)." }] },
        { type: "choice", label: "Where is this point relative to the line?", options: ["Above the line", "Below the line"], answer: e > 0 ? 0 : 1, fixed: true,
          why: { [e > 0 ? 1 : 0]: `The residual is ${e > 0 ? "positive" : "negative"}, so the observed \\(y\\) is ${e > 0 ? "above" : "below"} the predicted value.` } }
      ],
      hand: [
        T`Substitute \(x = ${x}\): \(\hat y = ${n(b0)} ${sgn} ${n(Math.abs(b1))}(${x}) = ${S.fmt(yhat, 4)}\).`,
        T`Residual: \(e = y - \hat y = ${n(y)} - ${S.fmt(yhat, 4).replace("−", "-")} = ${S.fmt(e, 4).replace("−", "-")}\).`,
        `The residual is ${e > 0 ? "positive, so the point lies above the line: the actual value was higher than predicted" : "negative, so the point lies below the line: the actual value was lower than predicted"}.`,
        `Since \\(x = ${x}\\) is inside the observed range, this is interpolation, so the prediction is legitimate.`
      ],
      ti: `Type the arithmetic directly: ${HandUI.screen(`${n(b0)}${sgn}${n(Math.abs(b1))}*${x}`)} gives ${S.fmt(yhat, 4)}. Store it with ${HandUI.keys("[STO▶] [ALPHA] [A]")} so the residual is ${HandUI.screen(`${n(y)}-A`)}.`,
      excel: HandUI.xl(`=${n(b0)}${sgn}${n(Math.abs(b1))}*${x}`, S.fmt(yhat, 4)) + HandUI.xl(`=${n(y)}-C2`, S.fmt(e, 4)) + "<p style='margin:.3rem 0 0'>(with the prediction in cell C2)</p>"
    };
  }

  // ---- slope and intercept from summary statistics ----
  function lineByHand() {
    const xbar = R.int(10, 60), sx = R.int(2, 12), ybar = R.int(40, 200), sy = R.int(5, 40);
    const r = R.pick([-1, 1]) * R.int(40, 95) / 100;
    const b1 = r * sy / sx, b0 = ybar - b1 * xbar;
    const wrongSlope = r * sx / sy;
    return {
      prompt: T`<p>For a sample, \(\bar x = ${xbar}\), \(s_x = ${sx}\), \(\bar y = ${ybar}\), \(s_y = ${sy}\), and \(R = ${n(r, 2)}\).</p><p>Find the least-squares regression line \(\hat y = b_0 + b_1 x\).</p>`,
      parts: [
        { type: "num", label: T`Slope \(b_1\) (4 decimals)`, answer: b1, tol: 0.0006 + Math.abs(b1) * 0.001, show: S.fmt(b1, 4),
          mistakes: [{ value: wrongSlope, msg: "You flipped the ratio. The slope is \\(R\\,s_y/s_x\\): the response's spread goes on top." },
                     { value: r, msg: "That is \\(R\\) itself. Multiply it by \\(s_y/s_x\\)." }] },
        { type: "num", label: T`Intercept \(b_0\) (2 decimals)`, answer: b0, tol: 0.02 + Math.abs(b0) * 0.001, show: S.fmt(b0, 2),
          mistakes: [{ value: ybar + b1 * xbar, msg: "Subtract: \\(b_0 = \\bar y - b_1\\bar x\\)." },
                     { value: xbar - b1 * ybar, msg: "You swapped \\(\\bar x\\) and \\(\\bar y\\). Use \\(b_0 = \\bar y - b_1\\bar x\\)." }] }
      ],
      hand: [
        T`Slope: \(b_1 = R\,\dfrac{s_y}{s_x} = ${n(r, 2)} \times \dfrac{${sy}}{${sx}} = ${S.fmt(b1, 4).replace("−", "-")}\).`,
        T`Intercept: \(b_0 = \bar y - b_1\bar x = ${ybar} - (${S.fmt(b1, 4).replace("−", "-")})(${xbar}) = ${S.fmt(b0, 4).replace("−", "-")}\).`,
        T`The line: \(\hat y = ${S.fmt(b0, 2).replace("−", "-")} ${b1 < 0 ? "-" : "+"} ${S.fmt(Math.abs(b1), 4)}x\). The slope has the same sign as \(R\), as it must.`
      ],
      after: "Keep at least four decimals in the slope before computing the intercept. Rounding the slope early can shift the intercept noticeably."
    };
  }

  // ---- R squared ----
  function rSquared() {
    const r1 = R.pick([-1, 1]) * R.int(45, 95) / 100;
    let r2v; do { r2v = R.pick([-1, 1]) * R.int(45, 95) / 100; } while (Math.abs(Math.abs(r2v) - Math.abs(r1)) < 0.05);
    const ctx = R.pick([["final exam score", "hours studied", "homework average"], ["home price", "square footage", "lot size"], ["MPG", "car weight", "engine size"], ["blood pressure", "age", "daily sodium intake"]]);
    const R2 = r1 * r1, better = r1 * r1 > r2v * r2v ? 0 : 1;
    return {
      prompt: T`<p>Two simple regression models predict ${ctx[0]}. Using ${ctx[1]}, the correlation is \(R = ${n(r1, 2)}\). Using ${ctx[2]}, it is \(R = ${n(r2v, 2)}\).</p>`,
      parts: [
        { type: "num", label: T`\(R^2\) for the ${ctx[1]} model (4 decimals)`, answer: R2, tol: 0.0006, show: S.fmt(R2, 4),
          mistakes: [{ value: Math.abs(r1), msg: "That is \\(|R|\\). Square the correlation to get \\(R^2\\)." }, { value: 2 * r1, msg: "Square \\(R\\), don't double it." }, { value: R2 * 100, tol: 0.06, msg: "That is \\(R^2\\) as a percent. Enter it as a decimal." }] },
        { type: "choice", label: "Which model explains more of the variation?", options: [`The ${ctx[1]} model`, `The ${ctx[2]} model`], answer: better, fixed: true,
          why: { [1 - better]: `Compare \\(R^2\\): ${S.fmt(r1 * r1, 3)} versus ${S.fmt(r2v * r2v, 3)}. A negative \\(R\\) can still be strong; square it before comparing.` } }
      ],
      hand: [
        T`\(R^2 = (${n(r1, 2)})^2 = ${S.fmt(R2, 4)}\). So ${S.fmt(R2 * 100, 2)}% of the variation in ${ctx[0]} is explained by the linear regression on ${ctx[1]}.`,
        T`For ${ctx[2]}: \(R^2 = (${n(r2v, 2)})^2 = ${S.fmt(r2v * r2v, 4)}\).`,
        `The model with the higher \\(R^2\\) is better: the ${better ? ctx[2] : ctx[1]} model. The sign of \\(R\\) does not matter for this comparison.`
      ]
    };
  }

  // ---- interpolation vs extrapolation ----
  function extrap() {
    const lo = R.int(10, 40), hi = lo + R.int(15, 50);
    const inside = R.coin();
    const x = inside ? R.int(lo + 1, hi - 1) : R.coin() ? hi + R.int(5, 30) : Math.max(0, lo - R.int(5, 15));
    const ctx = R.pick(["ages of adult participants (years)", "daily temperatures (°F)", "weekly study hours", "engine sizes (hundreds of cc)"]);
    return {
      prompt: `<p>A regression line was fit to data with \\(x\\) values (${ctx}) from ${lo} to ${hi}. Someone uses it to predict \\(y\\) at \\(x = ${x}\\).</p>`,
      parts: [{ type: "choice", label: "This prediction is", options: ["Interpolation, a legitimate use of the line", "Extrapolation, a risky use of the line"], answer: inside ? 0 : 1, fixed: true,
        why: { [inside ? 1 : 0]: `${x} is ${inside ? "inside" : "outside"} the observed range ${lo} to ${hi}.` } }],
      hand: [`Compare \\(x = ${x}\\) with the observed range ${lo} to ${hi}.`,
        inside ? "It is inside the range, so this is interpolation." : "It is outside the range, so this is extrapolation: the linear trend may not continue there."]
    };
  }

  // ---- lurking variables ----
  const LURK = [
    ["Towns with more churches also have more bars.", "Town population", ["The number of priests", "The price of beer", "The day of the week"]],
    ["Ice cream sales and drowning deaths rise and fall together.", "Hot weather (season)", ["The price of ice cream", "Swimming pool depth", "The brand of ice cream"]],
    ["Students who own more books get higher grades.", "Family income or parents' education", ["The color of the book covers", "The number of pages per book", "The students' shoe size"]],
    ["Cities with more firefighters have more fire damage.", "City size", ["Firefighters' ages", "The type of fire truck", "Hydrant color"]],
    ["People who carry lighters are more likely to get lung cancer.", "Smoking", ["Lighter brand", "Pocket size", "Height"]],
    ["Children with bigger shoe sizes read at a higher level.", "Age", ["Shoe brand", "Number of siblings", "Favorite color"]]
  ];
  function lurking() {
    const [fact, right, wrongs] = R.pick(LURK);
    const opts = [right, ...wrongs];
    return {
      prompt: `<p>${fact}</p><p>Which is the most plausible lurking variable that explains this association?</p>`,
      parts: [{ type: "choice", label: "Lurking variable", options: opts, answer: 0,
        why: Object.fromEntries(wrongs.map((_, i) => [i + 1, `A lurking variable must plausibly affect <em>both</em> variables. ${right} does.`])) }],
      hand: ["Look for something outside the study that could drive both variables at once.", `${right} increases both, creating an association without either variable causing the other. This is common response.`]
    };
  }

  HandKit.mount("#practice-app", {
    module: 2,
    skills: [
      { id: "m2-roles", title: "Explanatory or response", gen: roles },
      { id: "m2-twoway", title: "Row proportions in a two-way table", gen: twoWay },
      { id: "m2-corr", title: "Interpreting correlation", gen: corrProps },
      { id: "m2-predict", title: "Predictions and residuals", gen: predict },
      { id: "m2-line", title: "Regression line from summary statistics", gen: lineByHand },
      { id: "m2-r2", title: "R² and comparing models", gen: rSquared },
      { id: "m2-extrap", title: "Interpolation or extrapolation", gen: extrap },
      { id: "m2-lurking", title: "Lurking variables", gen: lurking }
    ]
  });
})();
