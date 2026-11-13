/* Ported from stat2331-learn: multi-step, hand-first questions with mistake diagnosis. */
/* Module 4 practice: Probability Basics */
(function () {
  "use strict";
  const S = HandStats, R = HandKit.R, T = String.raw;
  const n = (x, d = 4) => S.num(x, d).replace("−", "-");
  const f4 = x => S.fmt(x, 4);

  const CTX = [
    { A: "used Treatment 1", Ac: "used Treatment 2", B: "had complications", Bc: "no complications", rowH: "Treatment", r: ["Treatment 1", "Treatment 2"], c: ["Complications", "None"] },
    { A: "is a first-year", Ac: "is an upperclassman", B: "lives on campus", Bc: "lives off campus", rowH: "Class", r: ["First-year", "Upperclassman"], c: ["On campus", "Off campus"] },
    { A: "was audited", Ac: "was not audited", B: "earns $100,000 or more", Bc: "earns less", rowH: "Audit", r: ["Audited", "Not audited"], c: ["$100k+", "Under $100k"] },
    { A: "tested positive", Ac: "tested negative", B: "has the condition", Bc: "does not", rowH: "Test", r: ["Positive", "Negative"], c: ["Condition", "No condition"] }
  ];
  function table2x2(indep) {
    let a, b, c, d;
    if (indep) {
      const pA = R.pick([0.2, 0.25, 0.4, 0.5, 0.6]), pB = R.pick([0.2, 0.25, 0.4, 0.6, 0.75]), N = R.pick([400, 800]);
      a = Math.round(N * pA * pB); b = Math.round(N * pA) - a; c = Math.round(N * pB) - a; d = N - a - b - c;
    } else { a = R.int(5, 60); b = R.int(10, 90); c = R.int(10, 90); d = R.int(20, 160); }
    return { a, b, c, d, N: a + b + c + d };
  }
  function tableHtml(ctx, t) {
    return `<div class="table-scroll"><table class="data"><thead><tr><th>${ctx.rowH}</th><th>${ctx.c[0]}</th><th>${ctx.c[1]}</th><th>Total</th></tr></thead><tbody>
      <tr><td>${ctx.r[0]}</td><td>${t.a}</td><td>${t.b}</td><td>${t.a + t.b}</td></tr>
      <tr><td>${ctx.r[1]}</td><td>${t.c}</td><td>${t.d}</td><td>${t.c + t.d}</td></tr>
      <tr><td><strong>Total</strong></td><td>${t.a + t.c}</td><td>${t.b + t.d}</td><td>${t.N}</td></tr></tbody></table></div>`;
  }

  // ---- probabilities from a two-way table ----
  function tableProbs() {
    const ctx = R.pick(CTX), t = table2x2(false);
    const pA = (t.a + t.b) / t.N, pB = (t.a + t.c) / t.N, pAB = t.a / t.N, pU = pA + pB - pAB, pBgA = t.a / (t.a + t.b);
    return {
      prompt: `<p>A randomly selected subject from this table is chosen. Let \\(A\\) = the subject ${ctx.A} and \\(B\\) = the subject ${ctx.B}.</p>${tableHtml(ctx, t)}`,
      parts: [
        { type: "num", label: T`\(P(A \cap B)\)`, answer: pAB, tol: 0.0006, show: f4(pAB), mistakes: [{ value: pA * pB, msg: "\\(P(A)P(B)\\) only equals \\(P(A\\cap B)\\) when the events are independent. Read the cell where both happen." }] },
        { type: "num", label: T`\(P(A \cup B)\)`, answer: pU, tol: 0.0006, show: f4(pU), mistakes: [{ value: pA + pB, msg: "You counted the overlap twice. Subtract \\(P(A\\cap B)\\)." }] },
        { type: "num", label: T`\(P(B \mid A)\)`, answer: pBgA, tol: 0.0006, show: f4(pBgA),
          mistakes: [{ value: t.a / (t.a + t.c), msg: "That is \\(P(A\\mid B)\\). In \\(P(B\\mid A)\\) the given group is \\(A\\), so divide by A's total." }, { value: pAB, msg: "That is the joint probability. Given \\(A\\), divide by A's total, not the grand total." }] }
      ],
      hand: [
        T`\(P(A) = \frac{${t.a + t.b}}{${t.N}} = ${f4(pA)}\), \(P(B) = \frac{${t.a + t.c}}{${t.N}} = ${f4(pB)}\).`,
        T`\(P(A\cap B)\) is the cell where both happen: \(\frac{${t.a}}{${t.N}} = ${f4(pAB)}\).`,
        T`Addition rule: \(P(A\cup B) = ${f4(pA)} + ${f4(pB)} - ${f4(pAB)} = ${f4(pU)}\). (Count check: \(\frac{${t.a + t.b + t.c}}{${t.N}}\), everything except the "neither" cell.)`,
        T`Conditional: restrict to the ${t.a + t.b} subjects in \(A\): \(P(B\mid A) = \frac{${t.a}}{${t.a + t.b}} = ${f4(pBgA)}\).`
      ]
    };
  }

  // ---- independence check ----
  function independence() {
    const ctx = R.pick(CTX), ind = R.coin(0.45), t = table2x2(ind);
    const pA = (t.a + t.b) / t.N, pB = (t.a + t.c) / t.N, pAB = t.a / t.N;
    const isInd = Math.abs(pAB - pA * pB) < 1e-9;
    return {
      prompt: `<p>Let \\(A\\) = the subject ${ctx.A} and \\(B\\) = the subject ${ctx.B}. Are \\(A\\) and \\(B\\) independent?</p>${tableHtml(ctx, t)}`,
      parts: [
        { type: "num", label: T`\(P(A)\,P(B)\) (4 decimals)`, answer: pA * pB, tol: 0.0006, show: f4(pA * pB), mistakes: [{ value: pAB, msg: "That is \\(P(A\\cap B)\\). Multiply the two separate probabilities to compare against it." }] },
        { type: "choice", label: "Conclusion", options: ["Independent: P(A ∩ B) = P(A)P(B)", "Not independent: P(A ∩ B) ≠ P(A)P(B)"], answer: isInd ? 0 : 1, fixed: true,
          why: { [isInd ? 1 : 0]: `Compare \\(P(A\\cap B) = ${f4(pAB)}\\) with \\(P(A)P(B) = ${f4(pA * pB)}\\).` } }
      ],
      hand: [
        T`\(P(A) = \frac{${t.a + t.b}}{${t.N}} = ${f4(pA)}\) and \(P(B) = \frac{${t.a + t.c}}{${t.N}} = ${f4(pB)}\).`,
        T`\(P(A)P(B) = ${f4(pA)} \times ${f4(pB)} = ${f4(pA * pB)}\).`,
        T`\(P(A\cap B) = \frac{${t.a}}{${t.N}} = ${f4(pAB)}\).`,
        isInd ? "They are equal, so the events are independent." : "They differ, so the events are not independent."
      ],
      after: T`Equivalent check: \(P(B\mid A) = ${f4(t.a / (t.a + t.b))}\) versus \(P(B) = ${f4(pB)}\). Independence means knowing \(A\) doesn't change the probability of \(B\).`
    };
  }

  // ---- tree diagram ----
  const TREES = [
    { A: "a student is a commuter", B: "the student is late to an 8 a.m. class" },
    { A: "a part comes from Factory 1 (otherwise Factory 2)", B: "the part is defective" },
    { A: "a person has the disease", B: "the person tests positive" },
    { A: "an email is spam", B: "the email contains the word 'free'" }
  ];
  function tree() {
    const tr = R.pick(TREES);
    const pA = R.int(10, 60) / 100, pBA = R.int(50, 95) / 100, pBAc = R.int(2, 30) / 100;
    const pB = pA * pBA + (1 - pA) * pBAc, pAgB = pA * pBA / pB;
    return {
      prompt: T`<p>Let \(A\) = ${tr.A} and \(B\) = ${tr.B}. Suppose \(P(A) = ${n(pA)}\), \(P(B\mid A) = ${n(pBA)}\), and \(P(B\mid A^c) = ${n(pBAc)}\).</p>`,
      parts: [
        { type: "num", label: T`\(P(B)\) (4 decimals)`, answer: pB, tol: 0.0006, show: f4(pB),
          mistakes: [{ value: pA * pBA, msg: "That is only one path, \\(P(A\\cap B)\\). Add the path through \\(A^c\\) too." }, { value: pBA + pBAc, msg: "Multiply each conditional probability by its branch probability before adding." }] },
        { type: "num", label: T`\(P(A \mid B)\) (4 decimals)`, answer: pAgB, tol: 0.0006, show: f4(pAgB),
          mistakes: [{ value: pBA, msg: "That is \\(P(B\\mid A)\\). Reversing the condition requires \\(P(A\\cap B)/P(B)\\)." }, { value: pA * pBA, msg: "That is \\(P(A\\cap B)\\). Divide it by \\(P(B)\\)." }] }
      ],
      hand: [
        T`First branches: \(P(A) = ${n(pA)}\), \(P(A^c) = ${n(1 - pA)}\).`,
        T`Multiply along each path ending in \(B\): \(P(A\cap B) = ${n(pA)}(${n(pBA)}) = ${f4(pA * pBA)}\) and \(P(A^c\cap B) = ${n(1 - pA)}(${n(pBAc)}) = ${f4((1 - pA) * pBAc)}\).`,
        T`Add the paths: \(P(B) = ${f4(pA * pBA)} + ${f4((1 - pA) * pBAc)} = ${f4(pB)}\).`,
        T`Reverse the condition: \(P(A\mid B) = \dfrac{P(A\cap B)}{P(B)} = \dfrac{${f4(pA * pBA)}}{${f4(pB)}} = ${f4(pAgB)}\).`
      ]
    };
  }

  // ---- "at least one" with independence ----
  function atLeastOne() {
    const p = R.int(3, 30) / 100, k = R.int(3, 8);
    const ctx = R.pick([["a randomly chosen light bulb is defective", "bulbs"], ["a randomly chosen person has type O-negative blood", "people"], ["a free throw is missed", "free throws"], ["a randomly chosen email is spam", "emails"]]);
    const ans = 1 - Math.pow(1 - p, k);
    return {
      prompt: `<p>The probability that ${ctx[0]} is ${n(p)}. Assume independence. If ${k} ${ctx[1]} are selected, what is the probability that <strong>at least one</strong> of them has this property?</p>`,
      parts: [{ type: "num", label: "Probability (4 decimals)", answer: ans, tol: 0.0006, show: f4(ans),
        mistakes: [{ value: k * p, msg: "Adding \\(p\\) for each trial overcounts; the events aren't disjoint. Use the complement: 1 − P(none)." },
                   { value: Math.pow(1 - p, k), msg: "That is P(none). The complement of 'at least one' is 'none', so subtract it from 1." },
                   { value: Math.pow(p, k), msg: "That is P(all of them). 'At least one' = 1 − P(none)." }] }],
      hand: [
        T`The complement of "at least one" is "none." Each one lacks the property with probability \(1 - ${n(p)} = ${n(1 - p)}\).`,
        T`By independence, \(P(\text{none}) = (${n(1 - p)})^{${k}} = ${f4(Math.pow(1 - p, k))}\).`,
        T`\(P(\text{at least one}) = 1 - ${f4(Math.pow(1 - p, k))} = ${f4(ans)}\).`
      ],
      ti: HandUI.screen(`1-(1-${n(p)})^${k}`), excel: HandUI.xl(`=1-(1-${n(p)})^${k}`, f4(ans))
    };
  }

  // ---- discrete distribution ----
  function discrete() {
    const k = R.int(4, 5), start = R.int(0, 1);
    const xs = Array.from({ length: k }, (_, i) => start + i);
    const miss = R.int(0, k - 1);
    let ps, others;
    do { ps = xs.map(() => R.int(1, 9) * 5); others = S.sum(ps.filter((_, i) => i !== miss)); } while (others > 95 || others < 55);
    ps[miss] = 100 - others;
    ps = ps.map(p => p / 100);
    const known = ps.slice(); known[miss] = null;
    const mu = S.sum(xs.map((x, i) => x * ps[i]));
    const v = S.sum(xs.map((x, i) => (x - mu) ** 2 * ps[i])), sd = Math.sqrt(v);
    const cut = xs[R.int(1, k - 2)];
    const pGreater = S.sum(xs.map((x, i) => x > cut ? ps[i] : 0));
    const pGE = pGreater + ps[xs.indexOf(cut)];
    const ctx = R.pick(["the number of pets in a household", "the number of courses a student drops in a year", "the number of cars a family owns", "the number of times a student visits the gym in a week"]);
    return {
      prompt: `<p>Let \\(X\\) = ${ctx}. Its probability distribution is below, with one probability missing.</p>
        <div class="table-scroll"><table class="data"><thead><tr><th>\\(x\\)</th>${xs.map(x => `<th>${x}</th>`).join("")}</tr></thead><tbody><tr><td>\\(P(X=x)\\)</td>${known.map(p => `<td>${p === null ? "?" : n(p)}</td>`).join("")}</tr></tbody></table></div>`,
      parts: [
        { type: "num", label: T`Missing probability \(P(X = ${xs[miss]})\)`, answer: ps[miss], tol: 0.0006, show: n(ps[miss]) },
        { type: "num", label: T`\(P(X > ${cut})\)`, answer: pGreater, tol: 0.0006, show: n(pGreater), mistakes: [{ value: pGE, msg: `"Greater than ${cut}" does not include ${cut}. That answer is \\(P(X \\ge ${cut})\\).` }] },
        { type: "num", label: T`Mean \(\mu_X\) (4 decimals)`, answer: mu, tol: 0.0006, show: f4(mu), mistakes: [{ value: S.mean(xs), msg: "You averaged the \\(x\\) values. Weight each value by its probability: \\(\\sum x p\\)." }] },
        { type: "num", label: T`Standard deviation \(\sigma_X\) (4 decimals)`, answer: sd, tol: 0.0011, show: f4(sd), mistakes: [{ value: v, msg: "That is the variance. Take its square root." }] }
      ],
      hand: [
        T`Probabilities add to 1: \(P(X=${xs[miss]}) = 1 - (${known.filter(p => p !== null).map(p => n(p)).join(" + ")}) = ${n(ps[miss])}\).`,
        T`\(P(X > ${cut}) = ${xs.filter(x => x > cut).map(x => `P(X=${x})`).join(" + ")} = ${xs.filter(x => x > cut).map(x => n(ps[xs.indexOf(x)])).join(" + ")} = ${n(pGreater)}\).`,
        T`\(\mu = ${xs.map((x, i) => `${x}(${n(ps[i])})`).join(" + ")} = ${f4(mu)}\).`,
        T`\(\sigma^2 = ${xs.map((x, i) => `(${x} - ${f4(mu)})^2(${n(ps[i])})`).join(" + ")} = ${f4(v)}\).`,
        T`\(\sigma = \sqrt{${f4(v)}} = ${f4(sd)}\).`
      ],
      ti: `L1: ${xs.join(", ")}; L2: ${ps.map(p => n(p)).join(", ")}. Then ${HandUI.keys("[STAT] [▶] {1:1-Var Stats}")} with List L1, FreqList L2. Read ${HandUI.screen("x̄=" + f4(mu))} and ${HandUI.screen("σx=" + f4(sd))}.`,
      excel: HandUI.xl(`=SUMPRODUCT(A2:A${k + 1},B2:B${k + 1})`, f4(mu)) + HandUI.xl(`=SQRT(SUMPRODUCT((A2:A${k + 1}-D2)^2,B2:B${k + 1}))`, f4(sd))
    };
  }

  // ---- uniform distribution ----
  function uniform() {
    const a = R.int(0, 10), b = a + R.pick([4, 5, 8, 10, 20]);
    let c = R.int(a, b - 1), d = R.int(c + 1, b);
    const h = 1 / (b - a), p = (d - c) * h;
    const outside = R.coin(0.3);
    const ans = outside ? 1 - p : p;
    return {
      prompt: T`<p>\(X\) is uniformly distributed on the interval from ${a} to ${b}.</p>`,
      parts: [
        { type: "num", label: "Height of the density curve (4 decimals)", answer: h, tol: 0.0006, show: f4(h), mistakes: [{ value: b - a, msg: "The height times the base must equal 1, so height = 1/base." }] },
        { type: "num", label: outside ? T`\(P(X < ${c} \text{ or } X > ${d})\)` : T`\(P(${c} < X < ${d})\)`, answer: ans, tol: 0.0006, show: f4(ans),
          mistakes: outside ? [{ value: p, msg: "That is the area between. You want the area outside, so subtract from 1." }] : [] }
      ],
      hand: [
        T`Total area is 1 over a base of \(${b} - ${a} = ${b - a}\), so the height is \(1/${b - a} = ${f4(h)}\).`,
        T`Area between ${c} and ${d}: \((${d} - ${c})(${f4(h)}) = ${f4(p)}\).`,
        outside ? T`Outside is the complement: \(1 - ${f4(p)} = ${f4(1 - p)}\).` : "That rectangle's area is the probability."
      ],
      figure: HandUI.curve({ pdf: x => (x >= a && x <= b ? 1 : 0), from: a - (b - a) * 0.15, to: b + (b - a) * 0.15, shade: outside ? [[a, c], [d, b]] : [[c, d]], ticks: [a, c, d, b].filter((v, i, arr) => arr.indexOf(v) === i).map(x => ({ x, label: String(x) })) })
    };
  }

  // ---- sampling without replacement ----
  function noReplace() {
    const N = R.pick([20, 25, 30, 40, 50, 100]), m = R.int(4, Math.min(12, N / 2)), k = R.pick([2, 3]);
    let ans = 1; const fr = [];
    for (let i = 0; i < k; i++) { ans *= (m - i) / (N - i); fr.push(T`\frac{${m - i}}{${N - i}}`); }
    const ctx = R.pick([["students in a seminar", "are left-handed"], ["light bulbs in a box", "are defective"], ["employees in an office", "are on the safety committee"]]);
    return {
      prompt: `<p>There are ${N} ${ctx[0]}; ${m} of them ${ctx[1]}. If ${k} are chosen at random <strong>without replacement</strong>, what is the probability that all ${k} ${ctx[1]}?</p>`,
      parts: [{ type: "num", label: "Probability (4 decimals)", answer: ans, tol: Math.max(0.00006, ans * 0.01), show: S.fmt(ans, 5),
        mistakes: [{ value: Math.pow(m / N, k), msg: "Without replacement, each draw changes what is left: the numerator and denominator both drop by 1 each time." }] }],
      hand: [
        "Multiply the conditional probabilities draw by draw (general multiplication rule). The draws are dependent.",
        T`\(${fr.join(" \cdot ")} = ${S.fmt(ans, 6)}\).`
      ]
    };
  }

  HandKit.mount("#practice-app", {
    module: 4,
    skills: [
      { id: "m4-table", title: "Probabilities from a two-way table", gen: tableProbs },
      { id: "m4-indep", title: "Checking independence", gen: independence },
      { id: "m4-tree", title: "Tree diagrams and reversing a condition", gen: tree },
      { id: "m4-atleast", title: "At least one (complement rule)", gen: atLeastOne },
      { id: "m4-noreplace", title: "Sampling without replacement", gen: noReplace },
      { id: "m4-discrete", title: "Discrete random variables", gen: discrete },
      { id: "m4-uniform", title: "Uniform distribution areas", gen: uniform }
    ]
  });

})();
