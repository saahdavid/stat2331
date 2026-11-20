/* Practice-exam bank, Modules 5–8. */
(function (root) {
  'use strict';
  const B = root.ExamBank, S = B.S, R = B.R, { o, n, tx, nums } = B;
  const zs = { 0.90: 1.645, 0.95: 1.96, 0.99: 2.576 };

  /* ================= Module 5 ================= */
  B.MC(5, 'm5-empirical', () => {
    const mu = R.int(50, 100), s = R.int(4, 12), k = R.pick([1, 2]);
    const ctx = R.pick(['test scores', 'battery lifetimes (hours)', 'adult heights (cm)']);
    const tail = k === 1 ? 16 : 2.5, wrong2 = k === 1 ? 32 : 5, band = k === 1 ? 34 : 47.5;
    return { stem: `${ctx[0].toUpperCase() + ctx.slice(1)} are approximately normal with mean ${mu} and SD ${s}. About what percent are above ${mu + k * s}?`, numeric: true, options: nums([
      [tail, 4, `Correct: ${k === 1 ? '68' : '95'}% lie within ${k} SD of the mean, leaving ${100 - (k === 1 ? 68 : 95)}% split equally between the two tails.`],
      [wrong2, 2, 'That is both tails together. Only the upper tail is asked for.'],
      [band, 1, 'That is the area between the mean and that value.'],
      [k === 1 ? 68 : 95, 0, `That is the middle ${k === 1 ? 68 : 95}%, not the tail.`]], 2, v => n(v, 1) + '%') };
  });
  B.MC(5, 'm5-z', () => {
    const mu = R.int(60, 90), s = R.int(4, 12), x = mu + R.pick([-1, 1]) * R.int(3, 2 * s);
    return { stem: `A value of ${x} comes from a distribution with mean ${mu} and standard deviation ${s}. What is its z-score?`, numeric: true, options: nums([
      [(x - mu) / s, 4, `Correct: \\(z = (${x}-${mu})/${s}\\).`],
      [(mu - x) / s, 2, 'The subtraction is reversed: z = (x − μ)/σ.'],
      [(x - mu) / (s * s), 1, 'Divide by the standard deviation, not the variance.'],
      [x / s, 0, 'Subtract the mean before dividing.']], 2) };
  });
  B.MC(5, 'm5-normprob', () => {
    const mu = R.int(60, 100), s = R.int(5, 15), gt = R.coin(), a = mu + R.pick([-1, 1]) * R.step(0.3, 2, 0.1) * s, P = B.normal(mu, s, gt ? 'gt' : 'lt', S.round(a, 1));
    return { stem: `\\(X\\) is normal with \\(\\mu = ${mu}\\) and \\(\\sigma = ${s}\\). Using the table, find \\(P(X ${gt ? '>' : '<'} ${tx(a, 1)})\\).`, numeric: true, options: nums([
      [P.p, 4, `Correct: \\(z = ${tx(P.za, 2)}\\); the table gives a left area of ${n(P.ta)}${gt ? ', so subtract from 1' : ''}.`],
      [P.flip, 2, gt ? 'That is the left area. For “greater than”, subtract it from 1.' : 'That is the right tail. The table already gives the left area.'],
      [Math.abs(P.za) < 1 ? Math.abs(P.za) : NaN, 1, 'That is the size of the z-score, not a probability. Look the z-score up in the table.'],
      [0.5, 0, 'Half the area lies on each side of the mean, but the cut point is not the mean.']], 4) };
  });
  B.MC(5, 'm5-inverse', () => {
    const mu = R.int(400, 600), s = R.int(50, 110), pct = R.pick([90, 95, 80]), z = S.tableZ(pct / 100), zw = pct === 95 ? 1.28 : 1.645;
    return { stem: `Scores are normal with mean ${mu} and SD ${s}. About what score marks the ${pct}th percentile?`, numeric: true, options: nums([
      [mu + z * s, 4, `Correct: the table area ${n(pct / 100, 2)} gives \\(z = ${tx(z, 3)}\\); \\(x = ${mu} + ${tx(z, 3)}(${s})\\).`],
      [mu - z * s, 2, 'Right z, wrong sign: the ' + pct + 'th percentile is above the mean.'],
      [mu + zw * s, 1, `That z belongs to the ${pct === 95 ? 90 : 95}th percentile.`],
      [mu + (pct / 100) * s, 0, 'The percentile is an area; convert it to a z-score with the table first.']], 1) };
  });
  B.MC(5, 'm5-bins', () => {
    const ok = R.coin();
    const good = R.pick(['A fair die is rolled 12 times; X = number of sixes.', 'A basketball player who makes 80% of free throws shoots 10, independently; X = number made.']);
    const bad = R.pick([['Cards are dealt without replacement from a deck until an ace appears; X = number of cards dealt.', 'There is no fixed number of trials.'], ['A student answers 10 questions; X = total minutes spent.', 'X is not a count of successes.']]);
    return ok ? { stem: 'Which setting is binomial?', options: [
      o(good, 4, 'Correct: fixed n, independent trials, two outcomes, the same p each time (BINS).'),
      o(bad[0], 2, bad[1]),
      o('A bag of 5 red and 5 blue marbles; draw until a red appears; X = number of draws.', 1, 'No fixed number of trials.'),
      o('Heights of 20 randomly chosen students; X = their mean height.', 0, 'This is a measurement, not a count of successes.')] }
      : { stem: `Consider: ${bad[0]} Is X binomial?`, options: [
        o('No. ' + bad[1], 4, 'Correct. A binomial setting needs all four BINS conditions.'),
        o('Yes, because each trial has two outcomes.', 1, 'Two outcomes is only one of the four conditions.'),
        o('Yes, because the trials are random.', 0, 'Randomness alone does not make a setting binomial.'),
        o('No, because the probability of success is not 0.5.', 2, 'The conclusion is right, but p does not have to be 0.5.')] };
  });
  B.MC(5, 'm5-binom', () => {
    const k0 = R.int(5, 8), p = R.step(0.2, 0.6, 0.1), k = R.int(1, k0 - 1), c = S.choose(k0, k);
    return { stem: `\\(X\\) is binomial with \\(n = ${k0}\\) and \\(p = ${tx(p, 1)}\\). Find \\(P(X = ${k})\\).`, numeric: true, options: nums([
      [c * p ** k * (1 - p) ** (k0 - k), 4, `Correct: \\(\\binom{${k0}}{${k}}(${tx(p, 1)})^{${k}}(${tx(1 - p, 1)})^{${k0 - k}}\\), with \\(\\binom{${k0}}{${k}} = ${c}\\).`],
      [p ** k * (1 - p) ** (k0 - k), 2, `That is the chance of one particular order. Multiply by the ${c} possible orders.`],
      [S.binomcdf(k0, p, k), 1, `That is \\(P(X \\le ${k})\\).`],
      [p ** k, 0, 'Include the failures and the number of orders.']], 4) };
  });
  B.MC(5, 'm5-binomsd', () => {
    const k0 = R.pick([50, 80, 100, 120, 200]), p = R.step(0.1, 0.6, 0.05);
    return { stem: `For a binomial distribution with \\(n = ${k0}\\) and \\(p = ${tx(p, 2)}\\), what is the standard deviation?`, numeric: true, options: nums([
      [Math.sqrt(k0 * p * (1 - p)), 4, `Correct: \\(\\sqrt{np(1-p)}\\).`],
      [k0 * p * (1 - p), 2, 'That is the variance. Take the square root.'],
      [Math.sqrt(k0 * p), 1, 'Include the factor (1 − p).'],
      [k0 * p, 0, 'That is the mean.']], 3) };
  });
  B.MC(5, 'm5-approx', () => {
    const k0 = R.pick([40, 60, 100, 150]), p = R.pick([0.05, 0.1, 0.15, 0.2, 0.3]), ok = k0 * p >= 10 && k0 * (1 - p) >= 10;
    return { stem: `Can the normal approximation be used for a binomial count with \\(n = ${k0}\\) and \\(p = ${tx(p, 2)}\\)?`, options: ok ? [
      o(`Yes: \\(np = ${tx(k0 * p)}\\) and \\(n(1-p) = ${tx(k0 * (1 - p))}\\) are both at least 10.`, 4, 'Correct.'),
      o(`No: \\(np = ${tx(k0 * p)}\\) is less than 30.`, 1, 'The course condition is at least 10, not 30.'),
      o('Yes, because n is at least 30.', 2, 'The conclusion is right, but the check is np ≥ 10 and n(1 − p) ≥ 10.'),
      o('No, because p is not 0.5.', 0, 'p does not have to be 0.5.')] : [
      o(`No: \\(np = ${tx(k0 * p)}\\) is less than 10.`, 4, 'Correct.'),
      o('Yes, because n is at least 30.', 1, 'Sample size alone is not the condition; check np and n(1 − p).'),
      o(`Yes: \\(n(1-p) = ${tx(k0 * (1 - p))}\\) is at least 10.`, 2, 'Both counts must be at least 10, not just one.'),
      o('No, because p is not 0.5.', 0, 'The conclusion is right for the wrong reason; p does not have to be 0.5.')] };
  });

  B.FR(5, 'm5-normal', () => {
    const mu = R.int(60, 90), s = R.int(5, 12), a = mu + R.int(3, 12), lo = mu - R.int(3, 10), hi = mu + R.int(3, 10), pct = R.pick([90, 95, 80]);
    const ctx = R.pick([['commute times', 'minutes'], ['exam scores', 'points'], ['delivery times', 'minutes']]);
    const P1 = B.normal(mu, s, 'gt', a), P2 = B.normal(mu, s, 'bt', lo, hi), z = S.tableZ(pct / 100);
    return {
      stem: `${ctx[0][0].toUpperCase() + ctx[0].slice(1)} are approximately normal with mean ${mu} ${ctx[1]} and standard deviation ${s} ${ctx[1]}.`,
      parts: [
        { type: 'num', label: `z-score for ${a}`, answer: (a - mu) / s, tol: 0.006 },
        { type: 'num', label: `P(X > ${a})`, answer: P1.p, alts: [P1.exact], tol: 0.0015, mistakes: [{ value: P1.ta, msg: 'That is the left area; subtract from 1.' }] },
        { type: 'num', label: `P(${lo} < X < ${hi})`, answer: P2.p, alts: [P2.exact], tol: 0.0015, mistakes: [{ value: P2.tb, msg: `That is P(X < ${hi}); subtract the area below ${lo}.` }] },
        { type: 'num', label: `${pct}th percentile`, answer: mu + z * s, alts: [mu + S.qnorm(pct / 100) * s], tol: 0.06, mistakes: [{ value: mu - z * s, msg: 'This percentile is above the mean: add z × σ.' }] }],
      written: { prompt: `Explain what your answer to P(X > ${a}) means in context.`,
        keys: ['Describes it as the proportion (or percent) of individuals above the value.', `Uses the context and the value ${a} ${ctx[1]}.`],
        model: `About ${n(P1.p * 100, 2)}% of ${ctx[0]} are longer/higher than ${a} ${ctx[1]}.` },
      solution: [`\\(z = (${a}-${mu})/${s} = ${tx((a - mu) / s)}\\approx ${tx(P1.za, 2)}\\); table ${n(P1.ta)}; \\(P = 1 - ${tx(P1.ta)} = ${tx(P1.p)}\\).`, `\\(z\\) values ${tx(P2.za, 2)} and ${tx(P2.zb, 2)}: \\(${tx(P2.tb)} - ${tx(P2.ta)} = ${tx(P2.p)}\\).`, `Area ${n(pct / 100, 2)} → \\(z = ${tx(z, 3)}\\); \\(x = ${mu} + ${tx(z, 3)}(${s}) = ${tx(mu + z * s, 2)}\\).`],
      ti: `normalcdf(${a},1E99,${mu},${s}); normalcdf(${lo},${hi},${mu},${s}); invNorm(${n(pct / 100, 2)},${mu},${s})`,
      excel: `=1-NORM.DIST(${a},${mu},${s},TRUE); =NORM.INV(${n(pct / 100, 2)},${mu},${s})`
    };
  });
  B.FR(5, 'm5-binomial', () => {
    const k0 = R.int(6, 10), p = R.step(0.1, 0.4, 0.05), ctx = R.pick([['patients', 'respond to a treatment'], ['customers', 'use a coupon'], ['seeds', 'germinate']]);
    const p0 = (1 - p) ** k0, p1 = k0 * p * (1 - p) ** (k0 - 1);
    return {
      stem: `${k0} randomly selected ${ctx[0]} are observed independently. Each has probability ${n(p, 2)} to ${ctx[1]}. Let \\(X\\) = the number who ${ctx[1]}.`,
      parts: [
        { type: 'num', label: '\\(P(X = 0)\\)', answer: p0, mistakes: [{ value: p ** k0, msg: 'For X = 0 every one fails: use 1 − p.' }] },
        { type: 'num', label: '\\(P(X = 1)\\)', answer: p1, mistakes: [{ value: p * (1 - p) ** (k0 - 1), msg: `Multiply by \\(\\binom{${k0}}{1} = ${k0}\\) orders.` }] },
        { type: 'num', label: '\\(P(X \\ge 2)\\)', answer: 1 - p0 - p1, mistakes: [{ value: 1 - p0, msg: 'That is P(X ≥ 1). Also subtract P(X = 1).' }] },
        { type: 'num', label: 'Mean \\(\\mu\\)', answer: k0 * p },
        { type: 'num', label: 'Standard deviation \\(\\sigma\\)', answer: Math.sqrt(k0 * p * (1 - p)), mistakes: [{ value: k0 * p * (1 - p), msg: 'Take the square root.' }] }],
      written: { prompt: 'Explain why X has a binomial distribution.',
        keys: [`Names a fixed number of trials (n = ${k0}) that are independent.`, `Names two outcomes per trial with the same probability of success (p = ${n(p, 2)}).`],
        model: `There are a fixed ${k0} independent trials, each ${ctx[0].replace(/s$/, '')} either does or does not ${ctx[1]}, and the success probability is ${n(p, 2)} every time, so X counts successes in a binomial setting.` },
      solution: [`\\(P(X=0) = (${tx(1 - p, 2)})^{${k0}} = ${tx(p0)}\\).`, `\\(P(X=1) = ${k0}(${tx(p, 2)})(${tx(1 - p, 2)})^{${k0 - 1}} = ${tx(p1)}\\).`, `\\(P(X\\ge 2) = 1 - ${tx(p0)} - ${tx(p1)} = ${tx(1 - p0 - p1)}\\).`, `\\(\\mu = np = ${tx(k0 * p)}\\); \\(\\sigma = \\sqrt{np(1-p)} = ${tx(Math.sqrt(k0 * p * (1 - p)))}\\).`],
      ti: `binompdf(${k0},${n(p, 2)},0); 1-binomcdf(${k0},${n(p, 2)},1)`, excel: `=BINOM.DIST(0,${k0},${n(p, 2)},FALSE); =1-BINOM.DIST(1,${k0},${n(p, 2)},TRUE)`
    };
  });

  /* ================= Module 6 ================= */
  B.MC(6, 'm6-sdphat', () => {
    const p = R.step(0.2, 0.7, 0.05), k = R.pick([100, 150, 200, 400, 500]);
    return { stem: `Samples of size \\(n = ${k}\\) are taken from a population with \\(p = ${tx(p, 2)}\\). What is the standard deviation of \\(\\hat p\\)?`, numeric: true, options: nums([
      [Math.sqrt(p * (1 - p) / k), 4, 'Correct: \\(\\sqrt{p(1-p)/n}\\).'],
      [p * (1 - p) / k, 2, 'That is the variance. Take the square root.'],
      [Math.sqrt(p * (1 - p)), 1, 'Divide by n inside the square root.'],
      [p, 0, 'That is the mean of \\(\\hat p\\).']], 4) };
  });
  B.MC(6, 'm6-sdxbar', () => {
    const s = R.int(6, 30), k = R.pick([16, 25, 36, 49, 64, 100]);
    return { stem: `A population has \\(\\sigma = ${s}\\). What is the standard deviation of \\(\\bar x\\) for samples of size ${k}?`, numeric: true, options: nums([
      [s / Math.sqrt(k), 4, `Correct: \\(\\sigma/\\sqrt n = ${s}/${Math.sqrt(k)}\\).`],
      [s / k, 2, 'Divide by √n, not n.'],
      [s, 1, 'That is the SD of individual values; averages vary less.'],
      [s * s / k, 0, 'That is the variance of x̄.']], 3) };
  });
  B.MC(6, 'm6-nchange', () => ({ stem: R.pick(['If the sample size is multiplied by 4, the standard deviation of \\(\\bar x\\)', 'Quadrupling the sample size makes the standard deviation of \\(\\hat p\\)']), options: [
    o('is cut in half', 4, 'Correct: SD has √n in the denominator, and √4 = 2.'),
    o('is cut to one-fourth', 2, 'The SD shrinks, but by √4, not 4.'),
    o('stays the same', 1, 'The mean stays the same; the SD shrinks.'),
    o('doubles', 0, 'Larger samples vary less, not more.')] }));
  B.MC(6, 'm6-minn', () => {
    const p = R.pick([0.05, 0.1, 0.2, 0.25, 0.8, 0.9]), m = Math.min(p, 1 - p), ans = B.ceil(10 / m);
    return { stem: `For \\(p = ${tx(p, 2)}\\), what is the smallest sample size for which the sampling distribution of \\(\\hat p\\) is approximately normal?`, numeric: true, options: nums([
      [ans, 4, `Correct: need \\(np \\ge 10\\) and \\(n(1-p) \\ge 10\\); the smaller of p and 1 − p is ${n(m, 2)}, so \\(n \\ge 10/${tx(m, 2)}\\).`],
      [B.ceil(10 / Math.max(p, 1 - p)), 2, 'That satisfies only one of the two conditions. Use the smaller of p and 1 − p.'],
      [30, 1, 'The n ≥ 30 guideline is for means, not proportions.'],
      [10, 0, 'The condition is on the expected counts np and n(1 − p), not on n.']], 0) };
  });
  B.MC(6, 'm6-xbarprob', () => {
    const mu = R.int(60, 90), s = R.int(8, 16), k = R.pick([16, 25, 36, 64]), x = mu + R.int(2, 5), se = s / Math.sqrt(k), P = B.normal(mu, se, 'gt', x), Pi = B.normal(mu, s, 'gt', x);
    return { stem: `A population has \\(\\mu = ${mu}\\) and \\(\\sigma = ${s}\\). For a random sample of ${k}, find \\(P(\\bar x > ${x})\\).`, numeric: true, options: nums([
      [P.p, 4, `Correct: \\(z = (${x}-${mu})/(${s}/\\sqrt{${k}}) = ${tx(P.za, 2)}\\).`],
      [Pi.p, 2, 'You used σ instead of σ/√n. Averages vary less than individuals.'],
      [P.flip, 1, 'That is the left area. Subtract from 1 for “greater than”.'],
      [Pi.flip, 0, 'Two problems: σ instead of σ/√n, and the wrong tail.']], 4) };
  });
  B.MC(6, 'm6-phatprob', () => {
    const p = R.step(0.3, 0.6, 0.05), k = R.pick([100, 200, 300]), c = S.round(p + R.step(0.03, 0.07, 0.01), 2), se = Math.sqrt(p * (1 - p) / k), P = B.normal(p, se, 'gt', c), seW = Math.sqrt(c * (1 - c) / k), Pw = B.normal(p, seW, 'gt', c);
    return { stem: `In a population, \\(p = ${tx(p, 2)}\\). For a random sample of ${k}, find \\(P(\\hat p > ${tx(c, 2)})\\).`, numeric: true, options: nums([
      [P.p, 4, `Correct: SD = \\(\\sqrt{${tx(p, 2)}(${tx(1 - p, 2)})/${k}} = ${tx(se)}\\), \\(z = ${tx(P.za, 2)}\\).`],
      [Pw.p, 2, 'Use the population p in the standard deviation, not the cutoff value.'],
      [P.flip, 1, 'That is the left area.'],
      [S.round(1 - c, 2), 0, 'Probabilities for \\(\\hat p\\) come from its sampling distribution, not from 1 − cutoff.']], 4) };
  });
  B.MC(6, 'm6-clt', () => ({ stem: 'A population is strongly right-skewed with mean μ and SD σ. Which statement about the sample mean \\(\\bar x\\) for random samples of size 50 is true?', options: [
    o('Its distribution is approximately normal, centered at μ, with SD σ/√50.', 4, 'Correct: the Central Limit Theorem applies for a large n.'),
    o('Its distribution is approximately normal, centered at μ, with SD σ.', 2, 'Shape and center are right, but the SD is σ/√n.'),
    o('Its distribution is strongly right-skewed, like the population.', 1, 'That describes small samples. With n = 50 the CLT makes x̄ approximately normal.'),
    o('Its distribution is centered above μ because the population is skewed.', 0, 'x̄ is unbiased: its mean is μ for any shape.')] }));
  B.MC(6, 'm6-unbiased', () => ({ stem: 'What does it mean that \\(\\hat p\\) is an unbiased estimator of \\(p\\)?', options: [
    o('The mean of the sampling distribution of p̂ equals p.', 4, 'Correct: on average over all samples, p̂ hits p.'),
    o('Every sample gives p̂ equal to p.', 2, 'Close: it is the average over all samples that equals p; individual samples vary.'),
    o('Larger samples give p̂ values closer to p.', 1, 'True, but that describes variability, not bias.'),
    o('The sample was chosen without any bias in the questions.', 0, 'That is about survey design, not the estimator’s sampling distribution.')] }));

  B.FR(6, 'm6-phat', () => {
    const p = R.step(0.3, 0.7, 0.05), k = R.pick([100, 150, 200, 250]), c = S.round(p - R.step(0.03, 0.08, 0.01), 2), se = Math.sqrt(p * (1 - p) / k), P = B.normal(p, se, 'lt', c);
    const ctx = R.pick(['of adults own a smart speaker', 'of students commute by car', 'of voters support a measure']);
    return {
      stem: `Suppose ${n(p * 100)}% ${ctx}. A random sample of ${k} is taken.`,
      parts: [
        { type: 'num', label: 'Mean of \\(\\hat p\\)', answer: p },
        { type: 'num', label: 'Standard deviation of \\(\\hat p\\)', answer: se, tol: 0.0006, mistakes: [{ value: p * (1 - p) / k, msg: 'Take the square root.' }] },
        { type: 'num', label: `\\(P(\\hat p < ${tx(c, 2)})\\)`, answer: P.p, alts: [P.exact], tol: 0.0015, mistakes: [{ value: P.flip, msg: 'That is the right tail; “less than” is the table area itself.' }] }],
      written: { prompt: 'Explain why a normal model is appropriate for the sampling distribution of p̂ here.',
        keys: [`Checks np = ${n(k * p)} and n(1 − p) = ${n(k * (1 - p))} are both at least 10.`, 'Concludes the sampling distribution of p̂ is approximately normal.'],
        model: `np = ${k}(${n(p, 2)}) = ${n(k * p)} and n(1 − p) = ${n(k * (1 - p))} are both at least 10, so the sampling distribution of p̂ is approximately normal.` },
      solution: [`Mean = p = ${n(p, 2)}.`, `SD = \\(\\sqrt{${tx(p, 2)}(${tx(1 - p, 2)})/${k}} = ${tx(se)}\\).`, `\\(z = (${tx(c, 2)} - ${tx(p, 2)})/${tx(se)} = ${tx((c - p) / se)}\\approx ${tx(P.za, 2)}\\); table area ${n(P.ta)}.`],
      ti: `normalcdf(-1E99,${n(c, 2)},${n(p, 2)},${n(se)})`, excel: `=NORM.DIST(${n(c, 2)},${n(p, 2)},SQRT(${n(p, 2)}*${n(1 - p, 2)}/${k}),TRUE)`
    };
  });
  B.FR(6, 'm6-xbar', () => {
    const mu = R.int(100, 200), s = R.int(15, 40), k = R.pick([25, 36, 49, 64, 100]), se = s / Math.sqrt(k), x = Math.round(mu - R.step(0.5, 2, 0.25) * se), P = B.normal(mu, se, 'lt', x);
    const ctx = R.pick([['monthly phone bills', 'dollars'], ['commute times', 'minutes'], ['package weights', 'grams']]);
    return {
      stem: `${ctx[0][0].toUpperCase() + ctx[0].slice(1)} have mean ${mu} ${ctx[1]} and standard deviation ${s} ${ctx[1]}. A random sample of ${k} is taken.`,
      parts: [
        { type: 'num', label: 'Standard deviation of \\(\\bar x\\)', answer: se, mistakes: [{ value: s / k, msg: 'Divide by √n.' }] },
        { type: 'num', label: `\\(P(\\bar x < ${x})\\)`, answer: P.p, alts: [P.exact], tol: 0.0015, mistakes: [{ value: B.normal(mu, s, 'lt', x).p, msg: 'Use σ/√n, not σ.' }] },
        { type: 'num', label: 'Lower end of the middle 95% of sample means', answer: mu - 1.96 * se, tol: 0.06, mistakes: [{ value: mu - 1.96 * s, msg: 'Use σ/√n.' }] },
        { type: 'num', label: 'Upper end of the middle 95% of sample means', answer: mu + 1.96 * se, tol: 0.06 }],
      written: { prompt: 'Explain why the sample mean varies less than individual values.',
        keys: ['Explains that averaging lets high and low values offset each other.', 'Connects this to the SD of x̄ being σ/√n, smaller than σ.'],
        model: `In a sample, unusually high and low values tend to cancel out, so averages stay closer to μ. That is why the SD of x̄ is σ/√n = ${n(se, 3)}, much smaller than σ = ${s}.` },
      solution: [`SD of \\(\\bar x\\) = \\(${s}/\\sqrt{${k}} = ${tx(se)}\\).`, `\\(z = (${x}-${mu})/${tx(se)} = ${tx((x - mu) / se)}\\approx ${tx(P.za, 2)}\\); table ${n(P.ta)}.`, `Middle 95%: \\(${mu} \\pm 1.96(${tx(se)})\\) = (${n(mu - 1.96 * se, 2)}, ${n(mu + 1.96 * se, 2)}).`],
      ti: `normalcdf(-1E99,${x},${mu},${n(se)})`, excel: `=NORM.DIST(${x},${mu},${s}/SQRT(${k}),TRUE)`
    };
  });

  /* ================= Module 7 ================= */
  B.MC(7, 'm7-zstar', () => {
    const c = R.pick([0.90, 0.95, 0.99]);
    return { stem: `What critical value \\(z^*\\) is used for a ${c * 100}% confidence interval for a proportion?`, numeric: true, options: nums([
      [zs[c], 4, `Correct: the middle ${c * 100}% leaves ${n((1 - c) / 2, 3)} in each tail.`],
      [c === 0.95 ? 1.645 : c === 0.90 ? 1.282 : 2.326, 2, 'That z puts all of the leftover area in one tail. Split it between the two tails.'],
      [c === 0.99 ? 1.96 : 2.576, 1, 'That z belongs to a different confidence level.'],
      [c, 0, 'The confidence level is an area, not a z value.']], 3) };
  });
  B.MC(7, 'm7-tstar', () => {
    const k = R.pick([12, 15, 20, 25, 35, 45]), c = R.pick([0.90, 0.95, 0.99]), df = k - 1, row = S.tTableRow(df), tail = (1 - c) / 2;
    const t = S.tTableValue(row, tail), tn = S.tTableValue(S.tTableRow(k), tail), t1 = S.tTableValue(row, 1 - c);
    return { stem: `Using the t table, find \\(t^*\\) for a ${c * 100}% confidence interval for μ with a sample of size ${k}.`, numeric: true, options: nums([
      [t, 4, `Correct: df = ${df}${row !== df ? `; the table has no ${df} row, so use the next smaller df, ${row}` : ''}, upper-tail area ${n(tail, 3)}.`],
      [tn === t ? zs[c] : tn, 2, tn === t ? 'That is z*. Use t* because σ is unknown.' : `Use df = n − 1 = ${df}, not n.`],
      [t1, 1, `That uses tail area ${n(1 - c, 2)}. Split ${n(1 - c, 2)} between two tails.`],
      [tn === t ? c * 2 : zs[c], 0, tn === t ? 'The confidence level is not a critical value.' : 'That is z*. Use t* because σ is unknown.']], 3) };
  });
  B.MC(7, 'm7-cip', () => {
    const k = R.pick([200, 300, 400, 500]), x = R.int(Math.round(k * 0.25), Math.round(k * 0.65)), ph = x / k, se = Math.sqrt(ph * (1 - ph) / k);
    const iv = z => `(${n(ph - z * se, 3)}, ${n(ph + z * se, 3)})`;
    return { stem: `In a random sample of ${k} adults, ${x} said yes. Which is the 95% confidence interval for the population proportion?`, numeric: true, options: nums([
      [ph - 1.96 * se, 4, `Correct: \\(\\hat p = ${tx(ph, 3)}\\), SE = ${n(se, 4)}, margin = 1.96 × SE.`],
      [ph - 1.645 * se, 2, 'That uses z* = 1.645, the 90% value.'],
      [ph - 1.96 * Math.sqrt(0.25 / k), 1, 'The SE should use p̂, not 0.5. (p = 0.5 is only used for planning sample size.)'],
      [ph - 1.96 * se * Math.sqrt(k), 0, 'The SE divides by n inside the square root.']], 3, v => `(${n(v, 3)}, ${n(2 * ph - v, 3)})`) };
  });
  B.MC(7, 'm7-interp', () => {
    const lo = R.int(20, 40), hi = lo + R.int(4, 10), ctx = R.pick(['mean commute time of all employees (minutes)', 'mean weekly study time of all students (hours)']);
    return { stem: `A 95% confidence interval for the ${ctx} is (${lo}, ${hi}). Which interpretation is correct?`, options: [
      o(`We are 95% confident that the ${ctx.split(' (')[0]} is between ${lo} and ${hi}.`, 4, 'Correct: the confidence is in the method that produced the interval.'),
      o(`There is a 95% probability that the ${ctx.split(' (')[0]} is between ${lo} and ${hi}.`, 2, 'Close, but μ is fixed; it is either in this interval or not. The 95% describes how often the method works.'),
      o(`95% of sample means fall between ${lo} and ${hi}.`, 1, 'A confidence interval is about the population mean, not sample means.'),
      o(`95% of individuals have values between ${lo} and ${hi}.`, 0, 'The interval estimates a mean; individuals vary much more.')] };
  });
  B.MC(7, 'm7-margin', () => {
    const lo = R.step(20, 60, 0.1), m = R.step(1, 8, 0.1), hi = S.round(lo + 2 * m, 1);
    return { stem: `A confidence interval is (${n(lo, 1)}, ${n(hi, 1)}). What is the margin of error?`, numeric: true, options: nums([
      [m, 4, 'Correct: half the width, (upper − lower)/2.'],
      [2 * m, 2, 'That is the full width. The margin is half of it.'],
      [lo + m, 1, 'That is the center (the estimate), not the margin.'],
      [lo, 0, 'That is the lower endpoint.']], 1) };
  });
  B.MC(7, 'm7-shrink', () => ({ stem: 'Which change makes a confidence interval for μ narrower, all else equal?', options: [
    o('increasing the sample size', 4, 'Correct: the SE has √n in the denominator.'),
    o('increasing the confidence level', 2, 'The confidence level matters, but in the other direction: higher confidence needs a wider interval.'),
    o('using a larger population', 1, 'Population size does not appear in the margin.'),
    o('having more variable data', 0, 'More variability makes the interval wider.')] }));
  B.MC(7, 'm7-np', () => {
    const m = R.pick([0.02, 0.03, 0.04, 0.05]), c = R.pick([0.90, 0.95, 0.99]), z = zs[c], ans = B.ceil((z / m) ** 2 * 0.25);
    return { stem: `How large a sample is needed to estimate a proportion within ±${n(m, 2)} with ${c * 100}% confidence, with no prior estimate of p?`, numeric: true, options: nums([
      [ans, 4, `Correct: \\(n = (${tx(z, 3)}/${tx(m, 2)})^2(0.5)(0.5)\\), rounded up.`],
      [Math.floor((z / m) ** 2 * 0.25), 2, 'Always round sample sizes up, so the margin is met.'],
      [B.ceil((zs[c === 0.95 ? 0.90 : 0.95] / m) ** 2 * 0.25), 1, 'That uses the critical value for a different confidence level.'],
      [B.ceil((z / m) ** 2), 0, 'Include p*(1 − p*) = 0.25.']], 0) };
  });
  B.MC(7, 'm7-nmu', () => {
    const s = R.int(8, 25), m = R.int(2, 5), ans = B.ceil(4 * s * s / (m * m));
    return { stem: `A pilot study gives \\(s = ${s}\\). About how many observations are needed to estimate μ within ±${m} with 95% confidence? (Use the course rule.)`, numeric: true, options: nums([
      [ans, 4, `Correct: \\(n = 4s^2/m^2 = 4(${s * s})/${m * m}\\), rounded up.`],
      [B.ceil(4 * s * s / m), 2, 'Square the margin as well.'],
      [B.ceil(s * s / (m * m)), 1, 'The 4 comes from t* ≈ 2, squared.'],
      [B.ceil(2 * s / m), 0, 'Square the whole ratio (2s/m).']], 0) };
  });

  B.FR(7, 'm7-cimu', () => {
    const k = R.pick([12, 15, 18, 20, 25, 30]), c = R.pick([0.90, 0.95, 0.99]), xb = S.round(R.step(20, 80, 0.1), 1), s = S.round(R.step(3, 12, 0.1), 1);
    const df = k - 1, row = S.tTableRow(df), t = S.tTableValue(row, (1 - c) / 2), se = s / Math.sqrt(k), m = t * se;
    const ctx = R.pick([['the mean sleep time of all students', 'hours'], ['the mean weight of all bags from a machine', 'ounces'], ['the mean response time of all users', 'seconds']]);
    return {
      stem: `To estimate ${ctx[0]}, a random sample of ${k} gives \\(\\bar x = ${tx(xb, 1)}\\) and \\(s = ${tx(s, 1)}\\) ${ctx[1]}. The data show no strong skew or outliers. Build a ${c * 100}% confidence interval.`,
      parts: [
        { type: 'num', label: 'Degrees of freedom', answer: df, mistakes: [{ value: k, msg: 'df = n − 1.' }] },
        { type: 'num', label: '\\(t^*\\) from the table', answer: t, tol: 0.0015, mistakes: [{ value: zs[c], msg: 'That is z*; σ is unknown, so use t*.' }] },
        { type: 'num', label: 'Standard error \\(s/\\sqrt n\\)', answer: se, tol: 0.0015, mistakes: [{ value: s / k, msg: 'Divide by √n.' }] },
        { type: 'num', label: 'Lower endpoint', answer: xb - m, tol: 0.02 },
        { type: 'num', label: 'Upper endpoint', answer: xb + m, tol: 0.02 }],
      written: { prompt: 'Interpret the interval in context.',
        keys: [`States ${c * 100}% confidence that the interval captures the population mean (not sample means or individuals).`, `Uses the context (${ctx[0]}) and the endpoints with units.`],
        model: `We are ${c * 100}% confident that ${ctx[0]} is between ${n(xb - m, 2)} and ${n(xb + m, 2)} ${ctx[1]}.` },
      solution: [`df = ${df}${row !== df ? `; table row ${row} (next smaller df)` : ''}; \\(t^* = ${tx(t, 3)}\\).`, `SE = \\(${tx(s, 1)}/\\sqrt{${k}} = ${tx(se)}\\).`, `Margin = \\(${tx(t, 3)}(${tx(se)}) = ${tx(m)}\\).`, `\\(${tx(xb, 1)} \\pm ${tx(m)}\\) = (${n(xb - m, 2)}, ${n(xb + m, 2)}).`],
      ti: `STAT ▸ TESTS ▸ 8:TInterval (Stats): x̄=${n(xb, 1)}, Sx=${n(s, 1)}, n=${k}, C-Level=${c}. (Its t* uses df = ${df} exactly.)`, excel: `=CONFIDENCE.T(${n(1 - c, 2)},${n(s, 1)},${k}) gives the margin.`
    };
  });
  B.FR(7, 'm7-cip', () => {
    const k = R.pick([300, 400, 500, 600, 800]), x = R.int(Math.round(k * 0.3), Math.round(k * 0.7)), c = R.pick([0.90, 0.95, 0.99]), z = zs[c];
    const ph = x / k, se = Math.sqrt(ph * (1 - ph) / k), m = z * se, claim = S.round(R.coin() ? ph - R.step(0.01, 0.08, 0.01) : ph + R.step(0.01, 0.08, 0.01), 2), inside = claim > ph - m && claim < ph + m;
    const ctx = R.pick(['adults who say they read a print book last year', 'customers who would recommend the store', 'students who use the campus gym']);
    return {
      stem: `In a random sample of ${k}, ${x} were ${ctx}. A news story claims the population proportion is ${n(claim, 2)}. Build a ${c * 100}% confidence interval.`,
      parts: [
        { type: 'num', label: '\\(\\hat p\\)', answer: ph },
        { type: 'num', label: 'Standard error', answer: se, tol: 0.0006, mistakes: [{ value: Math.sqrt(0.25 / k), msg: 'Use p̂ in the SE, not 0.5.' }] },
        { type: 'num', label: 'Margin of error', answer: m, tol: 0.0015, mistakes: [{ value: (c === 0.95 ? 1.645 : 1.96) * se, msg: `Use z* = ${z} for ${c * 100}%.` }] },
        { type: 'num', label: 'Lower endpoint', answer: ph - m, tol: 0.0015 },
        { type: 'num', label: 'Upper endpoint', answer: ph + m, tol: 0.0015 }],
      written: { prompt: `Is the claim of ${n(claim, 2)} plausible? Explain using the interval.`,
        keys: [`Checks whether ${n(claim, 2)} lies inside the interval.`, inside ? 'Concludes the claim is plausible (inside the interval).' : 'Concludes the claim is not plausible (outside the interval).'],
        model: `The interval is (${n(ph - m, 3)}, ${n(ph + m, 3)}). ${n(claim, 2)} ${inside ? 'is inside it, so it is a plausible value for the population proportion.' : 'is outside it, so the data give evidence against the claim.'}` },
      solution: [`\\(\\hat p = ${x}/${k} = ${tx(ph)}\\). Conditions: ${x} and ${k - x} are both at least 10.`, `SE = \\(\\sqrt{${tx(ph)}(${tx(1 - ph)})/${k}} = ${tx(se)}\\).`, `Margin = \\(${z}(${tx(se)}) = ${tx(m)}\\).`, `Interval: (${n(ph - m, 4)}, ${n(ph + m, 4)}).`],
      ti: `STAT ▸ TESTS ▸ A:1-PropZInt: x=${x}, n=${k}, C-Level=${c}`, excel: `=${n(ph)}-${z}*SQRT(${n(ph)}*(1-${n(ph)})/${k})`
    };
  });

  /* ================= Module 8 ================= */
  const zc = (a, two) => S.round(S.qnorm(1 - (two ? a / 2 : a)), 3);
  const tc = (df, a, two) => S.tTableValue(S.tTableRow(df), two ? a / 2 : a);
  const rr = (dir, c) => dir === '>' ? `TS ≥ ${c}` : dir === '<' ? `TS ≤ −${c}` : `|TS| ≥ ${c}`;
  const RP = () => root.RRPlot;
  const zp = (z, dir) => RP().norm({ dist: 'z', dir, ts: S.round(z, 2), crit: 1 }).p;                 // normal-table p-value
  const tpx = (t, dir, df) => RP().pValue(RP().norm({ dist: 't', df, dir, ts: t, crit: 1 }));          // exact t p-value
  const tbr = (t, dir, df) => RP().bracket(RP().norm({ dist: 't', df, dir, ts: t, crit: 1 }));         // t-table interval
  const P4 = v => v < 0.0001 ? 'less than 0.0001' : n(v, 4);
  const BRK = b => b.lo <= 0 ? `p-value < ${n(b.hi)}` : b.hi >= 1 ? `p-value > ${n(b.lo)}` : `${n(b.lo)} < p-value < ${n(b.hi)}`;
  B.MC(8, 'm8-hyp', () => {
    const p0 = R.pick([0.25, 0.3, 0.4, 0.5, 0.6]), up = R.coin(), ph = S.round(p0 + (up ? 1 : -1) * 0.04, 2);
    const ctx = R.pick(['a company claims that the proportion of satisfied customers has increased from', 'a researcher suspects the proportion of left-handed students differs from', 'a coach believes the proportion of injuries has decreased from']);
    const dir = ctx.includes('increased') ? '>' : ctx.includes('decreased') ? '<' : '\\ne';
    const rev = dir === '>' ? '<' : dir === '<' ? '>' : '>';
    return { stem: `Before collecting data, ${ctx} ${n(p0, 2)}. A sample gives \\(\\hat p = ${tx(ph, 2)}\\). Which hypotheses fit?`, options: [
      o(`\\(H_0: p = ${tx(p0, 2)}\\), \\(H_a: p ${dir} ${tx(p0, 2)}\\)`, 4, 'Correct: H₀ states “no change” with =; Hₐ is the claim being tested, decided before seeing data.'),
      o(`\\(H_0: p = ${tx(p0, 2)}\\), \\(H_a: p ${rev} ${tx(p0, 2)}\\)`, 2, 'The structure is right, but Hₐ points the wrong way for this claim.'),
      o(`\\(H_0: \\hat p = ${tx(p0, 2)}\\), \\(H_a: \\hat p ${dir} ${tx(p0, 2)}\\)`, 1, 'Hypotheses are about the population p, not the sample p̂.'),
      o(`\\(H_0: p ${dir} ${tx(p0, 2)}\\), \\(H_a: p = ${tx(p0, 2)}\\)`, 0, 'The equal sign belongs in H₀.')] };
  });
  B.MC(8, 'm8-zstat', () => {
    const p0 = R.pick([0.3, 0.4, 0.5, 0.6]), k = R.pick([200, 300, 400, 500]), ph = S.round(p0 + R.pick([-1, 1]) * R.step(0.03, 0.07, 0.01), 2);
    const z = (ph - p0) / Math.sqrt(p0 * (1 - p0) / k);
    return { stem: `Test \\(H_0: p = ${tx(p0, 1)}\\) with \\(n = ${k}\\) and \\(\\hat p = ${tx(ph, 2)}\\). What is the test statistic?`, numeric: true, options: nums([
      [z, 4, `Correct: the SE uses \\(p_0\\): \\(\\sqrt{${tx(p0, 1)}(${tx(1 - p0, 1)})/${k}}\\).`],
      [(ph - p0) / Math.sqrt(ph * (1 - ph) / k), 2, 'In a test, the SE uses p₀ (we assume H₀ is true), not p̂.'],
      [(ph - p0) / (p0 * (1 - p0) / k), 1, 'Take the square root in the SE.'],
      [ph - p0, 0, 'Divide the difference by the standard error.']], 2) };
  });
  B.MC(8, 'm8-pval', () => {
    const a = R.pick([0.10, 0.05, 0.01]), side = R.pick(['>', '<', '\\ne']), two = side === '\\ne', c = zc(a, two), other = zc(a, !two);
    const dirTxt = side === '\\ne' ? '≠' : side;
    return { stem: `A z test of \\(H_a: p ${side} p_0\\) uses \\(\\alpha = ${a}\\). Which rejection region is correct?`, options: [
      o(`Reject H₀ if ${rr(dirTxt, c.toFixed(3))}`, 4, two ? `Correct: two-sided, so z* row, column α/2 = ${n(a / 2)}.` : `Correct: one-sided, so z* row, column α = ${a}${side === '<' ? ', with the region in the lower tail' : ''}.`),
      o(`Reject H₀ if ${rr(dirTxt, other.toFixed(3))}`, 2, two ? 'Right tail(s), wrong column: a two-sided test splits α, so use column α/2.' : 'Right direction, wrong column: a one-sided test puts all of α in one tail, so use column α.'),
      o(`Reject H₀ if ${rr(side === '<' ? '>' : side === '>' ? '<' : '>', c.toFixed(3))}`, 1, 'The critical value is right, but the region must point the way Hₐ points.'),
      o(`Reject H₀ if ${rr(dirTxt, a)}`, 0, 'α is the area of the rejection region, not the critical value.')] };
  });
  B.MC(8, 'm8-decide', () => {
    const a = R.pick([0.05, 0.01]), k = R.pick([9, 12, 16, 21]), df = k - 1, c = tc(df, a, false), inside = R.coin();
    const ts = S.round(inside ? c + R.step(0.2, 1.5, 0.05) : c - R.step(0.15, Math.min(1.2, c - 0.1), 0.05), 2);
    return { stem: `A test of \\(H_0: \\mu = 50\\) versus \\(H_a: \\mu > 50\\) with \\(n = ${k}\\) gives \\(t = ${tx(ts, 2)}\\) at \\(\\alpha = ${a}\\). The critical value is \\(t^* = ${tx(c, 3)}\\) (df = ${df}). What is the conclusion?`, options: inside ? [
      o('Reject H₀. There is convincing evidence that μ > 50.', 4, `Correct: TS = ${n(ts, 2)} ≥ ${n(c, 3)}, so it is in the rejection region.`),
      o('Reject H₀. This proves that μ > 50.', 2, 'Right decision, but a test gives evidence, not proof.'),
      o('Fail to reject H₀. There is not enough evidence that μ > 50.', 0, `The TS ${n(ts, 2)} is beyond t* = ${n(c, 3)}: it is in the rejection region.`),
      o('Accept H₀. The mean is 50.', 0, 'Never “accept” H₀, and here the TS is in the rejection region.')] : [
      o('Fail to reject H₀. There is not convincing evidence that μ > 50.', 4, `Correct: TS = ${n(ts, 2)} < ${n(c, 3)}, so it is not in the rejection region.`),
      o('Accept H₀. The data show that μ = 50.', 2, 'Right decision, wrong wording: failing to reject does not show H₀ is true.'),
      o('Reject H₀, because the test statistic is positive.', 0, `A positive TS is not enough; it must reach t* = ${n(c, 3)}.`),
      o('Reject H₀. There is convincing evidence that μ > 50.', 0, `The TS ${n(ts, 2)} has not reached t* = ${n(c, 3)}.`)] };
  });
  B.MC(8, 'm8-errors', () => {
    const [h0, ha] = R.pick([['the new drug is no better than the old one', 'the new drug is better'], ['the machine is filling bags correctly', 'the machine is underfilling bags'], ['the coin is fair', 'the coin is biased']]);
    const t1 = R.coin();
    return { stem: `H₀: ${h0}. Hₐ: ${ha}. Which describes a ${t1 ? 'Type I' : 'Type II'} error?`, options: [
      o(t1 ? `Concluding that ${ha} when in fact ${h0}.` : `Failing to conclude that ${ha} when in fact it is true.`, 4, t1 ? 'Correct: rejecting a true H₀.' : 'Correct: failing to reject a false H₀.'),
      o(t1 ? `Failing to conclude that ${ha} when in fact it is true.` : `Concluding that ${ha} when in fact ${h0}.`, 2, `That is a ${t1 ? 'Type II' : 'Type I'} error; the two are swapped.`),
      o(`Concluding that ${ha} when it is true.`, 1, 'That is a correct decision, not an error.'),
      o('Making an arithmetic mistake in the test statistic.', 0, 'Type I and II errors are about wrong conclusions, not calculation slips.')] };
  });
  B.MC(8, 'm8-power', () => ({ stem: 'Which change increases the power of a test, all else equal?', options: [
    o('increasing the sample size', 4, 'Correct: larger samples make real effects easier to detect.'),
    o('decreasing α from 0.05 to 0.01', 2, 'α affects power, but lowering it reduces power.'),
    o('using a two-sided test instead of a one-sided test', 1, 'A two-sided test spreads α over two tails, which lowers power for a given direction.'),
    o('increasing the variability of the data', 0, 'More noise makes effects harder to detect.')] }));
  B.MC(8, 'm8-tbracket', () => {
    const k = R.pick([9, 12, 15, 20, 25, 41, 65, 165]), df = k - 1, row = S.tTableRow(df), a = R.pick([0.10, 0.05, 0.01]), side = R.pick(['>', '<', '\\ne']), two = side === '\\ne';
    const c = tc(df, a, two), wrongCol = tc(df, a, !two), zstar = zc(a, two), up = S.tTableValue(S.T_DF.find(d => d > row) || row, two ? a / 2 : a);
    return { stem: `A t test of \\(H_a: \\mu ${side} \\mu_0\\) uses a sample of \\(n = ${k}\\) and \\(\\alpha = ${a}\\). Using the t-table, what is the critical value \\(t^*\\)?`, numeric: true, options: nums([
      [c, 4, `Correct: row df = ${row}${row !== df ? ` (${df} is not listed, so the next smaller df)` : ''}, column ${two ? 'α/2 = ' + n(a / 2) : 'α = ' + a}.`],
      [wrongCol, 2, two ? 'A two-sided test uses column α/2, not α.' : 'A one-sided test uses column α, not α/2.'],
      [row !== df && up !== c ? up : zstar, 1, row !== df && up !== c ? `df = ${df} is not listed: use the next smaller row (${row}), not the next larger.` : 'That is z*. For a mean with s, use the t row for df = n − 1.'],
      [a, 0, 'α is the area of the rejection region, not the critical value.']], 3, v => n(v, 3)) };
  });
  B.MC(8, 'm8-pvz', () => {
    const side = R.pick(['>', '<', '\\ne']), z = S.round((side === '<' ? -1 : side === '>' ? 1 : R.pick([-1, 1])) * R.step(0.6, 2.9, 0.01), 2);
    const dir = side === '>' ? 'gt' : side === '<' ? 'lt' : 'ne', p = zp(z, dir), left = S.round(1 - RP().upper(z, 'z'), 4), tail = Math.min(left, 1 - left);
    const opts = [[p, 4, `Correct: ${side === '\\ne' ? `two-sided, so double the tail beyond |z|: 2(${n(tail, 4)}) = ${n(p, 4)}` : side === '>' ? `the area to the right of z: 1 − ${n(left, 4)} = ${n(p, 4)}` : `the area to the left of z: ${n(p, 4)}`}.`]];
    opts.push(side === '\\ne' ? [tail, 2, 'That is one tail. A two-sided p-value counts both tails, so double it.'] : [Math.min(1, 2 * p), 2, 'One-sided: do not double the tail area.']);
    opts.push([side === '\\ne' ? 1 - tail : 1 - p, 1, side === '>' ? 'That is the left area. For Hₐ with >, take the area to the right.' : side === '<' ? 'That is the area to the right. For Hₐ with <, take the area to the left.' : 'That is the area between the tails, not beyond them.']);
    opts.push([Math.abs(z), 0, 'That is the test statistic, not an area.']);
    return { stem: `A z test for a proportion has \\(H_a: p ${side} p_0\\) and test statistic \\(z = ${tx(z, 2)}\\). Using the normal table, what is the p-value?`, numeric: true, options: nums(opts, 4, v => n(v, 4)) };
  });
  B.MC(8, 'm8-pvt', () => {
    const k = R.pick([8, 11, 13, 16, 21, 26, 31]), df = k - 1, side = R.pick(['>', '<', '\\ne']), dir = side === '>' ? 'gt' : side === '<' ? 'lt' : 'ne';
    let t, b; do { t = S.round((side === '<' ? -1 : side === '>' ? 1 : R.pick([-1, 1])) * R.step(0.8, 3.6, 0.001), 3); b = tbr(t, dir, df); } while (b.lo <= 0 || b.hi >= 0.25 * (dir === 'ne' ? 2 : 1) - 1e-9);
    const two = dir === 'ne', half = { lo: b.lo / 2, hi: b.hi / 2 }, dbl = { lo: b.lo * 2, hi: b.hi * 2 };
    const fmt = x => `between ${n(x.lo)} and ${n(x.hi)}`;
    const wrongRow = tbr(t, dir, k);  // using df = n
    const options = [
      o(fmt(b), 4, `Correct: row df = ${b.row}${b.row !== df ? ` (${df} is not listed, so the next smaller row)` : ''}; |t| = ${n(Math.abs(t), 3)} falls between the table values for those ${two ? 'column areas, doubled for a two-sided test' : 'column areas'}. Exactly, p-value = ${P4(tpx(t, dir, df))}.`),
      o(fmt(two ? half : dbl), 2, two ? 'Those are the one-tail areas. A two-sided p-value doubles them.' : 'One-sided: do not double the column areas.'),
      (() => { const f = two ? 2 : 1, TT = [0.25, 0.2, 0.15, 0.1, 0.05, 0.025, 0.02, 0.01, 0.005, 0.0025, 0.001, 0.0005].map(x => S.round(x * f, 6)), j = TT.findIndex(x => Math.abs(x - b.hi) < 1e-9), useRow = S.tTableRow(k) !== b.row && (wrongRow.lo !== b.lo || wrongRow.hi !== b.hi);
        return useRow ? o(fmt(wrongRow), 1, 'That uses row df = n. Use df = n − 1.') : o(fmt({ lo: TT[j], hi: TT[j - 1] }), 1, `Off by one column: in row df = ${b.row}, |t| = ${n(Math.abs(t), 3)} is beyond the table value for ${n(TT[j] / f)}${two ? ' (one tail)' : ''}, so the p-value is below ${n(b.hi)}.`); })(),
      o(`between ${n(1 - b.hi)} and ${n(1 - b.lo)}`, 0, 'Those are areas on the other side of the test statistic; the p-value is the tail beyond it.')];
    if (new Set(options.map(x => x.t)).size < 4) return B.mc[8].find(x => x.id === 'm8-pvt').gen();
    return { stem: `A t test of \\(H_a: \\mu ${side} \\mu_0\\) uses a sample of \\(n = ${k}\\) and gives \\(t = ${tx(t, 3)}\\). From the t-table, the p-value is…`, options };
  });
  B.MC(8, 'm8-practical', () => ({ stem: R.pick(['A study of 50,000 adults finds a new diet lowers weight by an average of 0.2 pound, and the test statistic falls far into the rejection region. Which statement is best?', 'With 80,000 students, an app raises test scores by 0.3 point out of 100, and the test statistic falls in the rejection region at α = 0.01. Which statement is best?']), options: [
    o('The result is statistically significant but may not be practically important.', 4, 'Correct: huge samples detect tiny effects.'),
    o('The result is practically important because the test statistic is so extreme.', 2, 'An extreme TS measures evidence against H₀, not the size of the effect.'),
    o('The result is not statistically significant because the effect is small.', 1, 'Small effects can be statistically significant with large n.'),
    o('The study proves the effect is large.', 0, 'Nothing here shows a large effect.')] }));

  B.FR(8, 'm8-ztest', () => {
    const p0 = R.pick([0.2, 0.25, 0.3, 0.4, 0.5]), k = R.pick([200, 250, 400, 500]), ph = S.round(p0 + R.step(0.02, 0.08, 0.01), 2), x = Math.round(ph * k);
    const a = R.pick([0.05, 0.01, 0.10]), phat = x / k, se = Math.sqrt(p0 * (1 - p0) / k), z = (phat - p0) / se, c = zc(a, false), rej = z >= c, pv = zp(z, 'gt'), zr = S.round(z, 2);
    if ((pv <= a) !== rej) return B.fr[8].find(f => f.id === 'm8-ztest').gen();
    const ctx = R.pick(['shoppers who use self-checkout', 'adults who work from home at least one day a week', 'students who own a tablet']);
    return {
      stem: `Last year ${n(p0 * 100)}% of ${ctx}. This year a random sample of ${k} finds ${x}. Test whether the proportion has increased, at \\(\\alpha = ${a}\\).`,
      parts: [
        { type: 'choice', label: 'Alternative hypothesis', options: [`\\(H_a: p > ${tx(p0, 2)}\\)`, `\\(H_a: p \\ne ${tx(p0, 2)}\\)`, `\\(H_a: \\hat p > ${tx(p0, 2)}\\)`], answer: 0, fixed: true, why: { 1: 'The claim is an increase, so Hₐ is one-sided.', 2: 'Hypotheses are about p, not p̂.' } },
        { type: 'num', label: '\\(\\hat p\\)', answer: phat },
        { type: 'num', label: 'Test statistic \\(z\\)', answer: z, tol: 0.02, mistakes: [{ value: (phat - p0) / Math.sqrt(phat * (1 - phat) / k), msg: 'Use p₀ in the SE.' }] },
        { type: 'num', method: 'cv', label: 'Critical value \\(z^*\\)', answer: c, tol: 0.0015, mistakes: [{ value: zc(a, true), msg: 'Hₐ is one-sided: use column α, not α/2.' }] },
        { type: 'num', method: 'pv', label: 'p-value (normal table, 4 decimals)', answer: pv, tol: 0.00051, show: P4(pv), mistakes: [{ value: S.round(1 - pv, 4), tol: 0.00051, msg: 'That is the left area. Hₐ has >, so the p-value is the area to the right: 1 − left area.' }, { value: Math.min(1, 2 * pv), tol: 0.00051, msg: 'One-sided: do not double the tail area.' }] }],
      written: { prompt: 'Using the critical value or the p-value (your choice), state your decision and your conclusion in context.',
        keys: [`Decides correctly with either method: TS = ${n(z, 2)} is ${rej ? 'in' : 'not in'} the rejection region TS ≥ ${n(c, 3)}, or the p-value ${P4(pv)} is ${rej ? 'at most' : 'greater than'} α = ${a}; so ${rej ? 'reject' : 'fail to reject'} H₀.`, `States the conclusion about Hₐ in context: there ${rej ? 'is' : 'is not'} sufficient evidence the proportion of ${ctx} has increased.`],
        model: `Critical value: reject H₀ if TS ≥ ${n(c, 3)}; TS = ${n(z, 2)} is ${rej ? '' : 'not '}in the rejection region. (Or: p-value = P(Z ≥ ${n(zr, 2)}) = ${P4(pv)}, which is ${rej ? 'at most' : 'greater than'} ${a}.) So we ${rej ? 'reject' : 'fail to reject'} H₀. There ${rej ? 'is' : 'is not'} sufficient evidence at the ${a} level that the proportion of ${ctx} has increased from ${n(p0, 2)}.` },
      solution: [`\\(H_0: p = ${tx(p0, 2)}\\), \\(H_a: p > ${tx(p0, 2)}\\).`, `Conditions: \\(np_0 = ${tx(k * p0)}\\) and \\(n(1-p_0) = ${tx(k * (1 - p0))}\\) are at least 10; random sample.`, `\\(\\hat p = ${x}/${k} = ${tx(phat)}\\); SE = \\(\\sqrt{${tx(p0, 2)}(${tx(1 - p0, 2)})/${k}} = ${tx(se)}\\).`, `\\(z = (${tx(phat)} - ${tx(p0, 2)})/${tx(se)} = ${tx(z, 2)}\\).`, `<strong>Critical value:</strong> upper-tailed, \\(\\alpha = ${a}\\): \\(z^*\\) row, column ${a}, so \\(z^* = ${tx(c, 3)}\\). Reject if TS ≥ ${n(c, 3)}; ${n(z, 2)} ${rej ? '≥' : '<'} ${n(c, 3)}.`, `<strong>p-value:</strong> \\(P(Z \\ge ${tx(zr, 2)}) = 1 - ${tx(S.round(1 - pv, 4), 4)} = ${P4(pv)}\\) from the normal table, which is ${rej ? 'at most' : 'greater than'} \\(\\alpha = ${a}\\).`, `Either way: ${rej ? 'reject' : 'fail to reject'} H₀.`],
      figure: root.RRPlot ? root.RRPlot.svg({ dist: 'z', dir: 'gt', crit: c, ts: S.round(z, 2), alpha: a }) : '',
      ti: `STAT ▸ TESTS ▸ 5:1-PropZTest: p0=${n(p0, 2)}, x=${x}, n=${k}, prop>p0 (reports z and the p-value). invNorm(${n(1 - a)}) = ${n(c, 3)}.`, excel: `=NORM.S.INV(${n(1 - a)}) gives z*; =1-NORM.S.DIST(${n(zr, 2)},TRUE) gives the p-value`
    };
  });
  B.FR(8, 'm8-ttest', () => {
    const k = R.pick([9, 12, 15, 16, 20, 25]), mu0 = R.int(40, 80), s = S.round(R.step(4, 12, 0.1), 1), df = k - 1, a = R.pick([0.05, 0.01, 0.10]);
    const xb = S.round(mu0 - R.step(0.4, 1.0, 0.05) * s * 2.6 / Math.sqrt(k), 1), se = s / Math.sqrt(k), t = (xb - mu0) / se;
    const row = S.tTableRow(df), c = tc(df, a, false), rej = t <= -c, px = tpx(t, 'lt', df), br = tbr(t, 'lt', df);
    if ((px <= a) !== rej || (br.lo < a && a < br.hi)) return B.fr[8].find(f => f.id === 'm8-ttest').gen();
    const ctx = R.pick([['mean battery life', 'hours'], ['mean fill weight', 'grams'], ['mean delivery time', 'minutes']]);
    return {
      stem: `A company claims the ${ctx[0]} is ${mu0} ${ctx[1]}. A consumer group suspects it is less. A random sample of ${k} gives \\(\\bar x = ${tx(xb, 1)}\\) and \\(s = ${tx(s, 1)}\\). The data show no strong skew. Test at \\(\\alpha = ${a}\\).`,
      parts: [
        { type: 'num', label: 'Standard error', answer: se, tol: 0.0015, mistakes: [{ value: s / k, msg: 'Divide by √n.' }] },
        { type: 'num', label: 'Test statistic \\(t\\)', answer: t, tol: 0.006, mistakes: [{ value: -t, msg: 't = (x̄ − μ₀)/SE; keep the sign.' }] },
        { type: 'num', label: 'Degrees of freedom', answer: df, mistakes: [{ value: k, msg: 'df = n − 1.' }] },
        { type: 'num', method: 'cv', label: 'Critical value \\(t^*\\) from the t-table', answer: c, tol: 0.0015, mistakes: [{ value: tc(df, a, true), msg: 'Hₐ is one-sided: use column α, not α/2.' }, { value: zc(a, false), msg: 'That is z*; use the t row for df = n − 1.' }] },
        { type: 'pint', method: 'pv', label: 'p-value: between which two t-table areas? (or the exact value)', lo: br.lo, hi: br.hi, exact: px, mistakes: br.hi * 2 <= 1 ? [{ lo: br.lo * 2, hi: br.hi * 2, msg: 'One-sided: do not double the column areas.' }] : [] }],
      written: { prompt: 'Using the critical value or the p-value (your choice), state your decision and your conclusion in context.',
        keys: [`Decides correctly with either method: TS = ${n(t, 3)} is ${rej ? 'in' : 'not in'} the rejection region TS ≤ −${n(c, 3)}, or the p-value (${BRK(br)}) is ${rej ? 'at most' : 'greater than'} α = ${a}; so ${rej ? 'reject' : 'fail to reject'} H₀.`, `Concludes in context about Hₐ: there ${rej ? 'is' : 'is not'} sufficient evidence that the ${ctx[0]} is less than ${mu0} ${ctx[1]}.`],
        model: `Critical value: reject H₀ if TS ≤ −${n(c, 3)}; TS = ${n(t, 3)} is ${rej ? '' : 'not '}in the rejection region. (Or: from the t-table, ${BRK(br)}, exactly ${P4(px)}, which is ${rej ? 'at most' : 'greater than'} ${a}.) So we ${rej ? 'reject' : 'fail to reject'} H₀. There ${rej ? 'is' : 'is not'} sufficient evidence at the ${a} level that the ${ctx[0]} is less than ${mu0} ${ctx[1]}.` },
      solution: [`\\(H_0: \\mu = ${mu0}\\), \\(H_a: \\mu < ${mu0}\\).`, `SE = \\(${tx(s, 1)}/\\sqrt{${k}} = ${tx(se)}\\).`, `\\(t = (${tx(xb, 1)} - ${mu0})/${tx(se)} = ${tx(t, 3)}\\), df = ${df}.`, `<strong>Critical value:</strong> lower-tailed, \\(\\alpha = ${a}\\): row df = ${row}, column ${a}, so \\(t^* = ${tx(c, 3)}\\). Reject if TS ≤ −${n(c, 3)}; ${n(t, 3)} ${rej ? '≤' : '>'} −${n(c, 3)}.`, `<strong>p-value:</strong> \\(P(T \\le ${tx(t, 3)})\\). In row df = ${br.row}, ${n(Math.abs(t), 3)} falls between the table values for ${BRK(br)}; exactly ${P4(px)}. It is ${rej ? 'at most' : 'greater than'} \\(\\alpha = ${a}\\).`, `Either way: ${rej ? 'reject' : 'fail to reject'} H₀.`],
      figure: root.RRPlot ? root.RRPlot.svg({ dist: 't', df, dir: 'lt', crit: c, ts: S.round(t, 3), alpha: a }) : '',
      ti: `STAT ▸ TESTS ▸ 2:T-Test (Stats): μ0=${mu0}, x̄=${n(xb, 1)}, Sx=${n(s, 1)}, n=${k}, μ<μ0 (reports t). invT(${n(a)},${df}) = −${n(c, 3)}; tcdf(-1E99,${n(t, 3)},${df}) = ${P4(px)}.`, excel: `=T.INV(${n(a)},${df}) gives −t*; =T.DIST(${n(t, 3)},${df},TRUE) gives the p-value`
    };
  });
})(globalThis);
