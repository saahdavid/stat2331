/* Ported from stat2331-learn: multi-step, hand-first questions with mistake diagnosis. */
/* Module 1 practice: Data Distributions */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw;
  const n = (x, d = 4) => S.num(x, d).replace("−", "-");   // number for TeX
  const list = a => a.map(v => n(v)).join(", ");

  // ---- variable types ----
  const TYPES = ["Categorical, nominal", "Categorical, ordinal", "Quantitative, discrete", "Quantitative, continuous"];
  const WHY = [
    "The values are names of groups with no natural order, so it is categorical and nominal.",
    "The values are groups that have a natural order, so it is categorical and ordinal.",
    "The values are counts: whole numbers with gaps between them. That makes it quantitative and discrete.",
    "The values are measurements that can fall anywhere in an interval, so it is quantitative and continuous."
  ];
  const VARS = [
    ["Blood type of a patient (A, B, AB, O)", 0], ["Major declared by a first-year student", 0],
    ["Zip code of a student's home address", 0, "Zip codes are numbers, but they are labels. Averaging them makes no sense, so the variable is categorical and nominal."],
    ["Brand of phone a student owns", 0], ["Whether a patient survived 20 years (yes or no)", 0], ["Jersey number of a basketball player", 0, "A jersey number is a label, not an amount, so it is categorical and nominal."],
    ["Letter grade in STAT 2331 (A, B, C, D, F)", 1], ["Satisfaction rating from very unsatisfied to very satisfied", 1],
    ["Class year (first-year, sophomore, junior, senior)", 1], ["T-shirt size (S, M, L, XL)", 1], ["Pain level reported as none, mild, moderate, or severe", 1],
    ["Number of text messages a student sent yesterday", 2], ["Number of siblings a student has", 2], ["Number of cars in a household", 2],
    ["Number of unprovoked shark attacks in a state since 1900", 2], ["Number of courses a student is taking this term", 2],
    ["Height of a student in inches", 3], ["Time to finish an exam, in minutes", 3], ["Birth weight of a newborn in grams", 3],
    ["Daily rainfall in Dallas, in inches", 3], ["Distance from home to campus in miles", 3], ["A driver's blood alcohol content", 3]
  ];
  function varType() {
    const [name, t, special] = R.pick(VARS);
    const why = {};
    TYPES.forEach((_, i) => { if (i !== t) why[i] = special || WHY[t]; });
    return {
      prompt: `<p>Classify this variable:</p><p><strong>${name}</strong></p>`,
      parts: [{ type: "choice", label: "Variable type", options: TYPES, answer: t, fixed: true, why }],
      hand: [
        "Ask whether averaging the values would make sense. If not, the variable is categorical; if so, it is quantitative.",
        "Categorical: are the groups in a natural order? Yes means ordinal, no means nominal. Quantitative: is it counted (discrete) or measured (continuous)?",
        special || WHY[t]
      ]
    };
  }

  // ---- parameter or statistic ----
  function paramStat() {
    const t = R.int(0, 6);
    let text, ans;
    const pct = R.int(12, 78), nn = R.int(4, 30) * 10;
    switch (t) {
      case 0: text = `A random sample of ${nn} SMU students finds that <strong>${pct}%</strong> have a part-time job.`; ans = 1; break;
      case 1: text = `The registrar's records for all ${R.int(10, 14)},${R.int(100, 999)} students enrolled this fall show that <strong>${pct}%</strong> are first-years.`; ans = 0; break;
      case 2: text = `In a poll of ${nn} randomly chosen likely voters, the mean age was <strong>${R.int(38, 56)}.${R.int(1, 9)} years</strong>.`; ans = 1; break;
      case 3: text = `A company records the salary of every one of its ${R.int(120, 480)} employees. The median salary is <strong>$${R.int(48, 96)},${R.int(100, 999)}</strong>.`; ans = 0; break;
      case 4: text = `An inspector pulls ${R.int(20, 60)} bolts at random from today's production run and finds a mean length of <strong>${R.int(48, 52)}.${R.int(10, 99)} mm</strong>.`; ans = 1; break;
      case 5: text = `A census of every household in a small town finds that <strong>${pct}%</strong> own a dog.`; ans = 0; break;
      default: text = `A researcher measures the cholesterol of ${R.int(30, 90)} randomly selected patients and reports a standard deviation of <strong>${R.int(25, 45)} mg/dL</strong>.`; ans = 1;
    }
    const why = ans ? "The number was computed from a sample, a part of the population, so it is a statistic."
      : "The number describes the entire population (every member was measured), so it is a parameter.";
    return {
      prompt: `<p>${text}</p><p>Is the bold number a parameter or a statistic?</p>`,
      parts: [{ type: "choice", label: "The bold number is a", options: ["Parameter", "Statistic"], answer: ans, fixed: true, why: { [1 - ans]: why } }],
      hand: ["Ask where the number came from: every member of the population, or a sample?", why]
    };
  }

  // ---- relative frequency ----
  const CATS = [
    { v: "favorite study spot", c: ["Fondren Library", "Dorm room", "Coffee shop", "Hughes-Trigg"] },
    { v: "primary way to get to campus", c: ["Walk", "Drive", "Bike or scooter", "DART"] },
    { v: "blood type", c: ["O", "A", "B", "AB"] },
    { v: "preferred exam format", c: ["Multiple choice", "Free response", "Mixed", "No preference"] }
  ];
  function relFreq() {
    const s = R.pick(CATS);
    const counts = s.c.map(() => R.int(8, 120));
    const total = S.sum(counts);
    const k = R.int(0, counts.length - 1);
    const prop = counts[k] / total;
    const other = counts[(k + 1) % counts.length];
    const rows = s.c.map((c, i) => `<tr><td>${c}</td><td>${counts[i]}</td></tr>`).join("");
    return {
      prompt: `<p>A random sample of students reported their ${s.v}.</p>
        <div class="table-scroll"><table class="data"><thead><tr><th>Category</th><th>Frequency</th></tr></thead><tbody>${rows}</tbody></table></div>
        <p>Find the sample size and the proportion of students in the category <strong>${s.c[k]}</strong>.</p>`,
      parts: [
        { type: "num", label: "Sample size \\(n\\)", answer: total, tol: 0.1, show: String(total) },
        { type: "num", label: T`Proportion \(\hat p\) for ${s.c[k]} (4 decimals)`, answer: prop, tol: 0.0006, show: S.fmt(prop, 4),
          mistakes: [
            { value: counts[k] / (total - counts[k]), msg: "You divided by the count of everyone <em>not</em> in the category. A proportion divides by the total." },
            { value: counts[k] / other, msg: "You divided by another category's count. A proportion divides by the total." },
            { value: prop * 100, tol: 0.06, msg: "That is the percent. A proportion is the decimal between 0 and 1, so divide by 100." }
          ] }
      ],
      hand: [
        T`Add the frequencies to get the total: \(n = ${counts.join(" + ")} = ${total}\).`,
        T`Divide the category count by the total: \(\hat p = \dfrac{${counts[k]}}{${total}} = ${S.fmt(prop, 4)}\), which is \(${S.fmt(prop * 100, 2)}\%\).`
      ]
    };
  }

  // ---- mean and median ----
  function center() {
    const size = R.int(7, 10);
    const data = Array.from({ length: size }, () => R.int(12, 58));
    if (R.coin(0.4)) data[R.int(0, size - 1)] = R.int(90, 140);
    const srt = S.sorted(data), m = S.mean(data), med = S.median(data);
    const mistakes = [];
    const mid = size % 2 ? data[(size - 1) / 2] : (data[size / 2 - 1] + data[size / 2]) / 2;
    if (mid !== med) mistakes.push({ value: mid, msg: "You took the middle of the list as given. Sort the data from smallest to largest first." });
    if (size % 2 === 0) {
      [srt[size / 2 - 1], srt[size / 2]].forEach(v => { if (v !== med) mistakes.push({ value: v, msg: "With an even number of values there are two middle values. Average them." }); });
    }
    const pos = size % 2 ? T`the value in position \(\frac{${size}+1}{2} = ${(size + 1) / 2}\)` : T`the average of the values in positions ${size / 2} and ${size / 2 + 1}`;
    return {
      prompt: `<p>Find the mean and the median of these ${size} observations:</p><p><strong>${list(data)}</strong></p>`,
      parts: [
        { type: "num", label: T`Mean \(\bar x\) (2 decimals)`, answer: m, tol: 0.006, show: S.fmt(m, 2),
          mistakes: [{ value: S.sum(data) / (size - 1), msg: "You divided by \\(n-1\\). The mean divides the sum by \\(n\\)." }] },
        { type: "num", label: T`Median \(\hat M\)`, answer: med, tol: 0.01, show: S.num(med, 2), mistakes }
      ],
      hand: [
        T`Sum: \(${data.join(" + ")} = ${S.sum(data)}\). Divide by \(n = ${size}\): \(\bar x = \frac{${S.sum(data)}}{${size}} = ${S.fmt(m, 2)}\).`,
        T`Sort: ${list(srt)}.`,
        T`Since \(n = ${size}\) is ${size % 2 ? "odd" : "even"}, the median is ${pos}: \(\hat M = ${n(med, 2)}\).`,
        Math.abs(m - med) > 4 ? T`The mean (${S.fmt(m, 2)}) and median (${n(med, 2)}) differ noticeably: an extreme value pulls the mean toward it, while the median resists.` : "The mean and median are close, which fits a roughly symmetric set of values."
      ],
      ti: `Enter the data in L1, then ${HandUI.keys("[STAT] [▶] {1:1-Var Stats}")}. Read ${HandUI.screen("x̄=" + S.fmt(m, 4))} and ${HandUI.screen("Med=" + S.num(med, 2))}.`,
      excel: HandUI.xl(`=AVERAGE(A1:A${size})`, S.fmt(m, 4)) + HandUI.xl(`=MEDIAN(A1:A${size})`, S.num(med, 2))
    };
  }

  // ---- standard deviation ----
  function stdev() {
    let data;
    do { data = Array.from({ length: 5 }, () => R.int(1, 20)); } while (S.sum(data) % 5 !== 0 || S.sd(data) === 0);
    const m = S.mean(data), dev = data.map(x => x - m), sq = dev.map(d => d * d), ss = S.sum(sq);
    const v = ss / 4, s = Math.sqrt(v);
    return {
      prompt: `<p>Find the sample variance and sample standard deviation of</p><p><strong>${list(data)}</strong></p>`,
      parts: [
        { type: "num", label: T`Variance \(s^2\) (2 decimals)`, answer: v, tol: 0.006, show: S.fmt(v, 2),
          mistakes: [
            { value: ss / 5, msg: "You divided by \\(n\\). For a sample, divide the sum of squared deviations by \\(n-1\\)." },
            { value: s, msg: "That is the standard deviation. The variance is before taking the square root." },
            { value: ss, msg: "That is the sum of squared deviations. Divide it by \\(n-1\\) to get the variance." }
          ] },
        { type: "num", label: T`Standard deviation \(s\) (2 decimals)`, answer: s, tol: 0.006, show: S.fmt(s, 2),
          mistakes: [
            { value: Math.sqrt(ss / 5), msg: "You divided by \\(n\\) before taking the square root. Use \\(n-1\\) for a sample." },
            { value: v, msg: "That is the variance. Take its square root to get \\(s\\)." }
          ] }
      ],
      hand: [
        T`Mean: \(\bar x = \frac{${S.sum(data)}}{5} = ${n(m)}\).`,
        `Deviations \\(x_i - \\bar x\\): ${dev.map(d => T`\(${n(d)}\)`).join(", ")}. They add to 0, which checks the mean.`,
        `Squared deviations: ${sq.map(d => n(d)).join(", ")}. Their sum is \\(${n(ss)}\\).`,
        T`Variance: \(s^2 = \frac{${n(ss)}}{5-1} = ${S.fmt(v, 4)}\).`,
        T`Standard deviation: \(s = \sqrt{${S.fmt(v, 4)}} = ${S.fmt(s, 4)}\).`
      ],
      ti: `In L1, ${HandUI.keys("[STAT] [▶] {1:1-Var Stats}")}. Use ${HandUI.screen("Sx=" + S.fmt(s, 4))}, not σx. Square it for the variance.`,
      excel: HandUI.xl("=VAR.S(A1:A5)", S.fmt(v, 4)) + HandUI.xl("=STDEV.S(A1:A5)", S.fmt(s, 4))
    };
  }

  // ---- five-number summary ----
  function fiveNum() {
    const size = R.int(9, 12);
    let data;
    do { data = Array.from({ length: size }, () => R.int(2, 75)); } while (new Set(data).size < size - 1);
    const q = S.quartiles(data), iqr = q.q3 - q.q1;
    const mistakes1 = [], mistakes3 = [];
    if (size % 2) {
      const h = (size - 1) / 2, s = q.sorted;
      const q1in = S.median(s.slice(0, h + 1)), q3in = S.median(s.slice(h));
      if (q1in !== q.q1) mistakes1.push({ value: q1in, msg: "With an odd \\(n\\), leave the median out of both halves before finding \\(Q_1\\)." });
      if (q3in !== q.q3) mistakes3.push({ value: q3in, msg: "With an odd \\(n\\), leave the median out of both halves before finding \\(Q_3\\)." });
    }
    const hu = Math.floor(size / 2);
    const rawLow = S.median(data.slice(0, hu));
    if (rawLow !== q.q1) mistakes1.push({ value: rawLow, msg: "It looks like you used the data in the given order. Sort it first." });
    return {
      prompt: `<p>Find the five-number summary pieces and the IQR for these ${size} values:</p><p><strong>${list(data)}</strong></p>`,
      parts: [
        { type: "num", label: T`\(Q_1\)`, answer: q.q1, tol: 0.01, show: S.num(q.q1), mistakes: mistakes1 },
        { type: "num", label: "Median", answer: q.med, tol: 0.01, show: S.num(q.med) },
        { type: "num", label: T`\(Q_3\)`, answer: q.q3, tol: 0.01, show: S.num(q.q3), mistakes: mistakes3 },
        { type: "num", label: "IQR", answer: iqr, tol: 0.01, show: S.num(iqr),
          mistakes: [{ value: q.max - q.min, msg: "That is the range (max − min). The IQR is \\(Q_3 - Q_1\\)." }] }
      ],
      hand: [
        T`Sort: ${list(q.sorted)}. Min \(= ${q.min}\), max \(= ${q.max}\).`,
        size % 2 ? T`\(n = ${size}\) is odd, so the median is the middle value: ${n(q.med)}. Leave it out of both halves.` : T`\(n = ${size}\) is even, so the median is the average of the two middle values: ${n(q.med)}.`,
        T`Lower half: ${list(q.lower)}. Its median is \(Q_1 = ${n(q.q1)}\).`,
        T`Upper half: ${list(q.upper)}. Its median is \(Q_3 = ${n(q.q3)}\).`,
        T`\(IQR = Q_3 - Q_1 = ${n(q.q3)} - ${n(q.q1)} = ${n(iqr)}\).`
      ],
      ti: `In L1, ${HandUI.keys("[STAT] [▶] {1:1-Var Stats}")}, then scroll down to ${HandUI.screen("Q1")}, ${HandUI.screen("Med")}, ${HandUI.screen("Q3")}. The TI uses the same halves method as above.`,
      excel: `${HandUI.xl(`=MEDIAN(A1:A${size})`, S.num(q.med))}<p style="margin:.4rem 0 0">Excel's <code>QUARTILE.INC</code> and <code>QUARTILE.EXC</code> interpolate, so their \\(Q_1\\) and \\(Q_3\\) may not match the by-hand method. Trust the hand method here.</p>`
    };
  }

  // ---- outliers ----
  function outliers() {
    const q1 = R.int(10, 40), iqr = R.int(4, 16), q3 = q1 + iqr;
    const high = R.coin(0.6);
    const mildLo = q1 - 1.5 * iqr, mildHi = q3 + 1.5 * iqr, extLo = q1 - 3 * iqr, extHi = q3 + 3 * iqr;
    const kind = R.int(0, 2);   // 0 none, 1 mild, 2 extreme
    let x;
    if (high) x = kind === 0 ? R.step(q3, mildHi - 0.5, 0.5) : kind === 1 ? R.step(mildHi + 0.5, extHi - 0.5, 0.5) : R.step(extHi + 0.5, extHi + 2 * iqr, 0.5);
    else x = kind === 0 ? R.step(mildLo + 0.5, q1, 0.5) : kind === 1 ? R.step(extLo + 0.5, mildLo - 0.5, 0.5) : R.step(extLo - 2 * iqr, extLo - 0.5, 0.5);
    const fence = high ? mildHi : mildLo, ext = high ? extHi : extLo;
    const cls = ["Not an outlier", "Mild outlier", "Extreme outlier"];
    const sideWord = high ? "upper" : "lower";
    return {
      prompt: T`<p>A data set has \(Q_1 = ${q1}\) and \(Q_3 = ${q3}\). Is the observation <strong>${n(x)}</strong> an outlier?</p>`,
      parts: [
        { type: "num", label: "IQR", answer: iqr, tol: 0.01, show: String(iqr) },
        { type: "num", label: `${high ? "Upper" : "Lower"} fence for mild outliers, \\(${high ? "Q_3 + 1.5\\,IQR" : "Q_1 - 1.5\\,IQR"}\\)`, answer: fence, tol: 0.01, show: n(fence),
          mistakes: [{ value: high ? q1 + 1.5 * iqr : q3 - 1.5 * iqr, msg: high ? "The upper fence starts from \\(Q_3\\), not \\(Q_1\\)." : "The lower fence starts from \\(Q_1\\), not \\(Q_3\\)." },
                     { value: high ? q3 + iqr : q1 - iqr, msg: "Multiply the IQR by 1.5 before adding or subtracting." }] },
        { type: "choice", label: `Classify ${n(x)}`, options: cls, answer: kind, fixed: true,
          why: Object.fromEntries([0, 1, 2].filter(i => i !== kind).map(i => [i, `Compare ${n(x)} with both ${sideWord} fences: ${n(fence)} (1.5 IQR) and ${n(ext)} (3 IQR).`])) }
      ],
      hand: [
        T`\(IQR = ${q3} - ${q1} = ${iqr}\).`,
        high ? T`Mild fence: \(Q_3 + 1.5(${iqr}) = ${q3} + ${n(1.5 * iqr)} = ${n(mildHi)}\). Extreme fence: \(Q_3 + 3(${iqr}) = ${q3} + ${3 * iqr} = ${n(extHi)}\).`
             : T`Mild fence: \(Q_1 - 1.5(${iqr}) = ${q1} - ${n(1.5 * iqr)} = ${n(mildLo)}\). Extreme fence: \(Q_1 - 3(${iqr}) = ${q1} - ${3 * iqr} = ${n(extLo)}\).`,
        kind === 0 ? `${n(x)} is inside the mild fence, so it is not an outlier.`
          : kind === 1 ? `${n(x)} is past the mild fence but not past the extreme fence, so it is a mild outlier.`
          : `${n(x)} is past the extreme fence, so it is an extreme outlier.`
      ]
    };
  }

  // ---- shape from mean and median ----
  const SHAPE_CTX = ["annual household incomes in a city (thousands of dollars)", "ages at death in a cemetery (years)", "exam scores in a large class",
    "minutes students spend on social media per day", "home prices in Dallas (thousands of dollars)", "hours of sleep the night before an exam"];
  function shape() {
    const ctx = R.pick(SHAPE_CTX);
    const kind = R.int(0, 2); // 0 right, 1 left, 2 symmetric
    const med = R.int(40, 200);
    const gap = Math.max(3, Math.round(med * R.int(10, 30) / 100));
    const mean = kind === 0 ? med + gap : kind === 1 ? med - gap : med + R.pick([-1, 0, 1]);
    const opts = ["Skewed right", "Skewed left", "Roughly symmetric"];
    const why = "Compare the mean with the median. The mean is pulled toward the long tail.";
    return {
      prompt: `<p>For a sample of ${ctx}, the mean is <strong>${mean}</strong> and the median is <strong>${med}</strong>.</p><p>What is the most likely shape of the distribution?</p>`,
      parts: [{ type: "choice", label: "Shape", options: opts, answer: kind, fixed: true, why: { 0: why, 1: why, 2: why } }],
      hand: [
        "The median sits at the center of the ordered data; the mean is pulled toward a long tail.",
        kind === 0 ? `The mean (${mean}) is well above the median (${med}), so a long right tail is pulling it up: skewed right.`
          : kind === 1 ? `The mean (${mean}) is well below the median (${med}), so a long left tail is pulling it down: skewed left.`
          : `The mean (${mean}) and median (${med}) are nearly equal, which fits a roughly symmetric distribution.`,
        kind === 2 ? "Report the mean and standard deviation." : "For skewed data, the median and IQR are the better summaries."
      ]
    };
  }

  HandKit.mount("#practice-app", {
    module: 1,
    skills: [
      { id: "m1-vartype", title: "Classify a variable", gen: varType },
      { id: "m1-paramstat", title: "Parameter or statistic", gen: paramStat },
      { id: "m1-relfreq", title: "Proportions from a frequency table", gen: relFreq },
      { id: "m1-center", title: "Mean and median", gen: center },
      { id: "m1-sd", title: "Standard deviation by hand", gen: stdev },
      { id: "m1-fivenum", title: "Five-number summary and IQR", gen: fiveNum },
      { id: "m1-outliers", title: "Outlier fences", gen: outliers },
      { id: "m1-shape", title: "Shape from mean and median", gen: shape }
    ]
  });
})();
