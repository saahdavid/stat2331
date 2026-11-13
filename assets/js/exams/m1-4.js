/* Practice-exam bank, Modules 1–4. */
(function (root) {
  'use strict';
  const B = root.ExamBank, S = B.S, R = B.R, { o, n, tx, nums, table } = B;
  const data = (k, lo, hi) => Array.from({ length: k }, () => R.int(lo, hi));

  /* ================= Module 1 ================= */
  B.MC(1, 'm1-vartype', () => {
    const sets = [
      ['the number of text messages a student sent yesterday', 'a student’s ZIP code', 'a student’s major', 'whether a student lives on campus'],
      ['the weight of a newborn, in pounds', 'a hospital’s room number', 'the baby’s blood type', 'whether the birth was a C-section'],
      ['a car’s fuel economy, in miles per gallon', 'the car’s license-plate number', 'the car’s manufacturer', 'whether the car is electric'],
      ['the time a runner needs to finish a 5K, in minutes', 'the runner’s bib number', 'the runner’s age group (under 30, 30–49, 50+)', 'the runner’s home state']
    ];
    const [q, code, cat, bin] = R.pick(sets);
    return { stem: 'Which of these variables is quantitative?', options: [
      o(q, 4, 'Correct. It is a measured amount, so arithmetic such as an average makes sense.'),
      o(code, 1, 'It is written with digits, but the digits are labels. Averaging them means nothing, so it is categorical.'),
      o(cat, 0, 'This places each individual in a group. It is categorical.'),
      o(bin, 0, 'A yes/no variable places each individual in one of two groups. It is categorical.')] };
  });
  B.MC(1, 'm1-paramstat', () => {
    const n = R.pick([200, 250, 400, 500, 800]), pct = R.int(18, 72);
    const who = R.pick([['registered voters in Texas', 'support a proposed bond'], ['SMU undergraduates', 'work a paid job during the semester'], ['adults in Dallas County', 'own an electric vehicle']]);
    return { stem: `A random sample of ${n} ${who[0]} found that ${pct}% ${who[1]}. The number ${pct}% is`, options: [
      o(`a statistic, because it describes the ${n} people in the sample`, 4, 'Correct. A number computed from sample data is a statistic.'),
      o('a parameter, because it describes all ' + who[0], 2, 'The concept is right but reversed: a parameter describes the whole population, and nobody measured all of them. This number comes from the sample.'),
      o('the population', 1, 'The population is the group of people, not a number that describes them.'),
      o('the sample size', 0, `The sample size is ${n}, the number of people surveyed.`)] };
  });
  B.MC(1, 'm1-mean', () => {
    const k = R.pick([5, 6, 7]), x = data(k, 2, 30), sum = S.sum(x), mean = sum / k;
    return { stem: `Find the mean of these ${k} values: ${x.join(', ')}.`, numeric: true, options: nums([
      [mean, 4, `Correct: \\(\\bar x = ${sum}/${k}\\).`],
      [S.median(x), 1, 'That is the median, the middle of the sorted list. The question asks for the mean.'],
      [sum / (k - 1), 2, `The sum is right, but divide by n = ${k}, not n − 1. The n − 1 belongs in the standard deviation.`],
      [sum, 0, 'That is the sum. Divide it by the number of values.']], 2) };
  });
  B.MC(1, 'm1-median', () => {
    let x; do { x = data(R.pick([6, 8]), 1, 40); } while (new Set(x).size < x.length || S.median(x) === (x[x.length / 2 - 1] + x[x.length / 2]) / 2);
    const k = x.length, med = S.median(x), unsorted = (x[k / 2 - 1] + x[k / 2]) / 2;
    return { stem: `Find the median of these ${k} values: ${x.join(', ')}.`, numeric: true, options: nums([
      [med, 4, 'Correct: sort the values, then average the two middle ones.'],
      [unsorted, 2, 'You averaged the two middle values of the list as written. Sort the list first.'],
      [S.mean(x), 1, 'That is the mean. The median is the middle of the sorted list.'],
      [(k + 1) / 2, 0, 'That is the position of the median in the sorted list, not its value.']], 2) };
  });
  B.MC(1, 'm1-sd', () => {
    let x; do { x = data(5, 2, 20); } while (!Number.isInteger(S.mean(x)) || S.sd(x) === 0);
    const m = S.mean(x), ss = S.sum(x.map(v => (v - m) ** 2)), s = Math.sqrt(ss / 4);
    return { stem: `The values ${x.join(', ')} have mean \\(\\bar x = ${m}\\). Find the sample standard deviation \\(s\\).`, numeric: true, options: nums([
      [s, 4, `Correct: \\(\\sum(x-\\bar x)^2 = ${ss}\\), divide by \\(n-1=4\\), then take the square root.`],
      [Math.sqrt(ss / 5), 2, 'One slip: you divided by n = 5. The sample standard deviation divides by n − 1 = 4.'],
      [ss / 4, 1, 'That is the variance \\(s^2\\). Take its square root.'],
      [ss, 0, 'That is only the sum of squared deviations.']], 3) };
  });
  B.MC(1, 'm1-fence', () => {
    const q1 = R.int(20, 40), iqr = R.pick([8, 10, 12, 14, 16, 18]), q3 = q1 + iqr, med = q1 + R.int(3, iqr - 3);
    return { stem: `A data set has \\(Q_1 = ${q1}\\), median \\(= ${med}\\), and \\(Q_3 = ${q3}\\). Using the 1.5 × IQR rule, what is the upper fence?`, numeric: true, options: nums([
      [q3 + 1.5 * iqr, 4, `Correct: IQR = ${iqr}, and \\(Q_3 + 1.5(${iqr}) = ${q3 + 1.5 * iqr}\\).`],
      [q3 + iqr, 2, 'Right idea, one missing piece: add 1.5 × IQR to Q3, not 1 × IQR.'],
      [med + 1.5 * iqr, 1, 'Fences start from the quartiles, not the median.'],
      [q1 - 1.5 * iqr, 0, 'That is the lower fence.']], 1) };
  });
  B.MC(1, 'm1-resistant', () => ({ stem: R.pick(['A data set has one extremely large outlier. Which pair of measures is resistant to it?', 'Which pair of summaries should you report for a strongly skewed distribution?']), options: [
    o('the median and the IQR', 4, 'Correct. Both depend on positions in the sorted list, so extreme values barely move them.'),
    o('the median and the standard deviation', 2, 'Half right: the median is resistant, but the standard deviation is pulled by extreme values.'),
    o('the mean and the IQR', 2, 'Half right: the IQR is resistant, but the mean is pulled toward the outlier.'),
    o('the mean and the standard deviation', 0, 'Both are pulled strongly by an outlier.')] }));
  B.MC(1, 'm1-shape', () => {
    const med = R.int(40, 80), right = R.coin(), mean = med + (right ? 1 : -1) * R.int(6, 15);
    const what = R.pick(['home prices (in thousands of dollars)', 'commute times (in minutes)', 'exam scores', 'monthly phone bills (in dollars)']);
    return { stem: `For a large set of ${what}, the mean is ${mean} and the median is ${med}. The most likely shape of the distribution is`, options: [
      o(right ? 'skewed to the right' : 'skewed to the left', 4, `Correct. The mean is pulled toward the long tail, so the tail is on the ${right ? 'right' : 'left'}.`),
      o(right ? 'skewed to the left' : 'skewed to the right', 2, 'Right concept, wrong direction. The mean sits on the same side as the long tail.'),
      o('symmetric', 1, 'In a symmetric distribution the mean and median are close. These differ noticeably.'),
      o('Not enough information', 0, 'Comparing the mean and median is exactly the information that suggests the shape.', { last: true })] };
  });

  B.FR(1, 'm1-fivenum', () => {
    let x; do { x = data(R.pick([9, 11]), 10, 60); x.push(R.int(95, 130)); } while (new Set(x).size < 8);
    const q = S.quartiles(x), iqr = q.q3 - q.q1, uf = q.q3 + 1.5 * iqr, out = q.max > uf;
    const ctx = R.pick(['minutes students spent on a homework set', 'ages of guests at a party', 'pages in a sample of library books']);
    return {
      stem: `These are the ${ctx}:<br>${R.shuffle(x.slice()).join(', ')}`,
      parts: [
        { type: 'num', label: 'Median', answer: q.med, mistakes: [{ value: S.mean(x), msg: 'That is the mean.' }] },
        { type: 'num', label: '\\(Q_1\\)', answer: q.q1, mistakes: [] },
        { type: 'num', label: '\\(Q_3\\)', answer: q.q3, mistakes: [] },
        { type: 'num', label: 'IQR', answer: iqr, mistakes: [{ value: q.max - q.min, msg: 'That is the range. IQR = Q3 − Q1.' }] },
        { type: 'num', label: 'Upper fence', answer: uf, mistakes: [{ value: q.q3 + iqr, msg: 'Add 1.5 × IQR, not 1 × IQR.' }] }],
      written: { prompt: `Is the largest value, ${q.max}, an outlier? Explain using your numbers.`,
        keys: [`Compares ${q.max} with the upper fence ${n(uf)}.`, `Concludes correctly: it ${out ? 'is' : 'is not'} an outlier because it is ${out ? 'above' : 'below'} the fence.`],
        model: `The upper fence is ${n(q.q3)} + 1.5(${n(iqr)}) = ${n(uf)}. Since ${q.max} ${out ? '>' : '<'} ${n(uf)}, it ${out ? 'is' : 'is not'} an outlier by the 1.5 × IQR rule.` },
      solution: [`Sort the ${x.length} values: ${q.sorted.join(', ')}.`, `Median = ${n(q.med)}. Lower half: ${q.lower.join(', ')}, so \\(Q_1 = ${tx(q.q1)}\\). Upper half: ${q.upper.join(', ')}, so \\(Q_3 = ${tx(q.q3)}\\).`, `IQR = ${n(q.q3)} − ${n(q.q1)} = ${n(iqr)}.`, `Upper fence = ${n(q.q3)} + 1.5(${n(iqr)}) = ${n(uf)}.`],
      ti: 'STAT ▸ 1:Edit, enter the data in L1, then STAT ▸ CALC ▸ 1:1-Var Stats. Scroll down for Q1, Med, Q3.',
      excel: 'Excel’s QUARTILE.EXC and QUARTILE.INC can differ from the hand method; use MEDIAN on each half to match it.'
    };
  });
  B.FR(1, 'm1-meansd', () => {
    let x; do { x = data(R.pick([5, 6]), 4, 24); } while (!Number.isInteger(S.mean(x)) || S.sd(x) === 0);
    const m = S.mean(x), dev = x.map(v => v - m), ss = S.sum(dev.map(d => d * d)), k = x.length, s = Math.sqrt(ss / (k - 1));
    const ctx = R.pick([['hours of sleep reported by', 'students', 'hours'], ['cups of coffee per week for', 'employees', 'cups'], ['goals scored per season by', 'players', 'goals']]);
    return {
      stem: `These are the ${ctx[0]} ${k} ${ctx[1]}: ${x.join(', ')}.`,
      parts: [
        { type: 'num', label: 'Mean \\(\\bar x\\)', answer: m, mistakes: [{ value: S.median(x), msg: 'That is the median.' }] },
        { type: 'num', label: 'Sum of squared deviations \\(\\sum (x-\\bar x)^2\\)', answer: ss, mistakes: [{ value: 0, msg: 'The deviations themselves add to 0. Square each one first.' }] },
        { type: 'num', label: 'Sample standard deviation \\(s\\)', answer: s, mistakes: [{ value: Math.sqrt(ss / k), msg: `Divide by n − 1 = ${k - 1}, not n.` }, { value: ss / (k - 1), msg: 'That is the variance. Take the square root.' }] }],
      written: { prompt: 'Interpret the standard deviation in context.',
        keys: ['Describes s as a typical distance of the values from the mean.', `Uses the context and units (${ctx[2]}).`],
        model: `The ${ctx[1]}’ values typically differ from the mean of ${n(m)} ${ctx[2]} by about ${n(s, 2)} ${ctx[2]}.` },
      solution: [`\\(\\bar x = ${S.sum(x)}/${k} = ${m}\\).`, `Deviations: ${dev.join(', ')} (they add to 0).`, `Squares: ${dev.map(d => d * d).join(', ')}; sum = ${ss}.`, `\\(s^2 = ${ss}/${k - 1} = ${tx(ss / (k - 1))}\\), so \\(s = ${tx(s)}\\).`],
      ti: 'Enter the data in L1, then STAT ▸ CALC ▸ 1:1-Var Stats. Use Sx (not σx).', excel: '=AVERAGE(range) and =STDEV.S(range)'
    };
  });

  /* ================= Module 2 ================= */
  B.MC(2, 'm2-roles', () => {
    const [ex, resp] = R.pick([['hours of sleep the night before', 'exam score'], ['daily screen time', 'reported stress level'], ['the dose of a fertilizer', 'tomato yield'], ['outdoor temperature', 'electricity use']]);
    return { stem: `A study asks whether ${ex} helps explain ${resp}. Which is the explanatory variable?`, options: [
      o(ex, 4, 'Correct. The explanatory variable is the one used to explain or predict the other.'),
      o(resp, 2, 'Roles reversed: this is the response, the outcome being explained.'),
      o('both of them', 1, 'Each variable has one role in this question.'),
      o('Neither; roles exist only in experiments', 0, 'Observational studies also have explanatory and response variables.', { last: true })] };
  });
  B.MC(2, 'm2-corr', () => {
    const r = -R.step(0.75, 0.95, 0.01), [x, y] = R.pick([['car weight', 'fuel economy (mpg)'], ['hours of TV per week', 'GPA'], ['price', 'units sold']]);
    return { stem: `The correlation between ${x} and ${y} is \\(r = ${tx(r, 2)}\\). Which statement is best?`, options: [
      o(`There is a strong negative linear relationship: larger ${x} goes with smaller ${y}.`, 4, 'Correct: the sign gives the direction and the size gives the strength.'),
      o(`There is a strong positive linear relationship between ${x} and ${y}.`, 2, 'Strength is right, but a negative r means a negative (downhill) relationship.'),
      o(`Increasing ${x} causes ${y} to decrease.`, 1, 'The direction is right, but correlation alone does not show causation.'),
      o(`About ${Math.round(-r * 100)}% of the points lie on the line.`, 0, 'r measures strength and direction, not a percentage of points.')] };
  });
  B.MC(2, 'm2-slope', () => {
    const b1 = R.step(1.2, 4.8, 0.1), b0 = R.int(20, 60), [x, y, xu, yu] = R.pick([['hours studied', 'exam score', 'hour', 'points'], ['years of experience', 'salary (thousands of dollars)', 'year', 'thousand dollars'], ['temperature (°F)', 'ice cream sales (dollars)', 'degree', 'dollars']]);
    return { stem: `The least-squares line for predicting ${y} from ${x} is \\(\\hat y = ${b0} + ${tx(b1, 1)}x\\). What does the slope mean?`, options: [
      o(`For each additional ${xu}, predicted ${y.replace(/ \(.*\)/, '')} increases by ${n(b1, 1)} ${yu}.`, 4, 'Correct: the slope is the predicted change in y for a one-unit increase in x.'),
      o(`For each additional ${yu.replace(/s$/, '')} of ${y.replace(/ \(.*\)/, '')}, ${x.replace(/ \(.*\)/, '')} increases by ${n(b1, 1)}.`, 2, 'The idea of a rate is right, but the roles are reversed. The slope is change in y per unit of x.'),
      o(`When ${x.replace(/ \(.*\)/, '')} is 0, predicted ${y.replace(/ \(.*\)/, '')} is ${b0}.`, 1, 'That interprets the intercept, not the slope.'),
      o(`The correlation is ${n(b1, 1)}.`, 0, 'The slope is not the correlation; r is always between −1 and 1.')] };
  });
  B.MC(2, 'm2-predict', () => {
    const b0 = R.int(10, 60), b1 = R.step(0.5, 3.5, 0.1), x = R.int(5, 20), yhat = b0 + b1 * x;
    return { stem: `Use \\(\\hat y = ${b0} + ${tx(b1, 1)}x\\) to predict \\(y\\) when \\(x = ${x}\\).`, numeric: true, options: nums([
      [yhat, 4, `Correct: \\(${b0} + ${tx(b1, 1)}(${x}) = ${tx(yhat)}\\).`],
      [b1 * x, 2, 'You multiplied correctly but left out the intercept.'],
      [b1 + b0 * x, 1, 'The intercept and slope are switched. The slope multiplies x.'],
      [b0, 0, 'That is the intercept, the prediction only when x = 0.']], 2) };
  });
  B.MC(2, 'm2-resid', () => {
    const b0 = R.int(10, 40), b1 = R.step(1, 3, 0.5), x = R.int(4, 16), yhat = b0 + b1 * x, y = yhat + R.pick([-1, 1]) * R.int(2, 9);
    return { stem: `For the line \\(\\hat y = ${b0} + ${tx(b1, 1)}x\\), one individual has \\(x = ${x}\\) and \\(y = ${y}\\). What is the residual?`, numeric: true, options: nums([
      [y - yhat, 4, `Correct: residual = observed − predicted = ${y} − ${n(yhat)}.`],
      [yhat - y, 2, 'Right pieces, reversed order: residual = observed − predicted.'],
      [yhat, 1, 'That is the predicted value. Subtract it from the observed y.'],
      [y, 0, 'That is the observed value.']], 2) };
  });
  B.MC(2, 'm2-r2', () => {
    const r = R.step(0.6, 0.95, 0.01) * (R.coin() ? 1 : -1), r2 = r * r, [x, y] = R.pick([['study hours', 'exam score'], ['square footage', 'home price'], ['age', 'reaction time']]);
    return { stem: `The correlation between ${x} and ${y} is \\(r = ${tx(r, 2)}\\). Which statement about \\(R^2\\) is correct?`, options: [
      o(`About ${Math.round(r2 * 100)}% of the variation in ${y} is explained by the linear relationship with ${x}.`, 4, `Correct: \\(R^2 = (${tx(r, 2)})^2 = ${tx(r2, 4)}\\).`),
      o(`About ${Math.round(Math.abs(r) * 100)}% of the variation in ${y} is explained by the linear relationship with ${x}.`, 2, 'The interpretation is right, but square r first.'),
      o(`About ${Math.round(r2 * 100)}% of the points fall exactly on the regression line.`, 1, 'The number is right, but R² describes explained variation, not points on the line.'),
      o(`${x} causes about ${Math.round(r2 * 100)}% of ${y}.`, 0, 'R² does not measure causation.')] };
  });
  B.MC(2, 'm2-extrap', () => {
    const lo = R.int(2, 6), hi = lo + R.int(6, 12), x = hi + R.int(10, 25);
    return { stem: `A regression line was fit using values of \\(x\\) from ${lo} to ${hi}, with \\(r = 0.93\\). Should the line be used to predict \\(y\\) at \\(x = ${x}\\)?`, options: [
      o('No. That is extrapolation; the linear pattern may not continue outside the data.', 4, 'Correct: predictions outside the range of x in the data are unreliable.'),
      o('Yes, but only after checking that the residual at that point is small.', 1, 'There is no data point at that x, so there is no residual to check. The issue is extrapolation.'),
      o('Yes, because the correlation is strong.', 0, 'A strong r inside the data range says nothing about values far outside it.'),
      o('Yes, as long as the slope is positive.', 0, 'The sign of the slope does not make extrapolation safe.')] };
  });
  B.MC(2, 'm2-b1', () => {
    const r = R.step(0.5, 0.9, 0.05), sx = R.int(2, 8), sy = R.int(5, 25);
    return { stem: `For two variables, \\(r = ${tx(r, 2)}\\), \\(s_x = ${sx}\\), and \\(s_y = ${sy}\\). What is the slope of the least-squares line for predicting \\(y\\) from \\(x\\)?`, numeric: true, options: nums([
      [r * sy / sx, 4, `Correct: \\(b_1 = r\\,s_y/s_x = ${tx(r, 2)}(${sy}/${sx})\\).`],
      [r * sx / sy, 2, 'Right formula shape, ratio upside down: \\(b_1 = r\\,s_y/s_x\\).'],
      [sy / sx, 1, 'You left out r.'],
      [r, 0, 'That is the correlation, not the slope.']], 3) };
  });

  B.FR(2, 'm2-line', () => {
    const [xn, yn, xu, yu] = R.pick([['hours studied', 'exam score', 'hours', 'points'], ['daily high temperature', 'cold drinks sold', '°F', 'drinks'], ['years of experience', 'salary', 'years', 'thousand dollars']]);
    const xb = R.int(8, 20), yb = R.int(60, 90), sx = R.int(2, 6), sy = R.int(6, 15), r = R.step(0.6, 0.9, 0.05), b1 = S.round(r * sy / sx, 4), b0 = S.round(yb - b1 * xb, 4), x0 = xb + R.int(1, 4), yh = b0 + b1 * x0;
    return {
      stem: `For a sample relating ${xn} (\\(x\\)) to ${yn} (\\(y\\)): \\(\\bar x = ${xb}\\), \\(s_x = ${sx}\\), \\(\\bar y = ${yb}\\), \\(s_y = ${sy}\\), \\(r = ${tx(r, 2)}\\).`,
      parts: [
        { type: 'num', label: 'Slope \\(b_1\\)', answer: b1, tol: 0.006, mistakes: [{ value: r * sx / sy, msg: 'The ratio is upside down: use \\(s_y/s_x\\).' }] },
        { type: 'num', label: 'Intercept \\(b_0\\)', answer: b0, tol: 0.06, mistakes: [{ value: yb + b1 * xb, msg: 'Subtract: \\(b_0 = \\bar y - b_1\\bar x\\).' }] },
        { type: 'num', label: `Predicted ${yn} when \\(x = ${x0}\\)`, answer: yh, tol: 0.06, mistakes: [{ value: b1 * x0, msg: 'Add the intercept.' }] }],
      written: { prompt: 'Interpret the slope in context.',
        keys: [`States the change is per one-${xu.replace(/s$/, '')} increase in ${xn}.`, `Says predicted ${yn} increases by about ${n(b1, 2)} ${yu}.`],
        model: `For each additional ${xu.replace(/s$/, '')} of ${xn}, the predicted ${yn} increases by about ${n(b1, 2)} ${yu}.` },
      solution: [`\\(b_1 = r\\,\\dfrac{s_y}{s_x} = ${tx(r, 2)}\\cdot\\dfrac{${sy}}{${sx}} = ${tx(b1)}\\).`, `\\(b_0 = \\bar y - b_1\\bar x = ${yb} - ${tx(b1)}(${xb}) = ${tx(b0)}\\).`, `\\(\\hat y = ${tx(b0)} + ${tx(b1)}(${x0}) = ${tx(yh)}\\).`],
      ti: 'With raw data: STAT ▸ CALC ▸ 8:LinReg(a+bx) L1, L2.', excel: '=SLOPE(y_range, x_range) and =INTERCEPT(y_range, x_range)'
    };
  });
  B.FR(2, 'm2-twoway', () => {
    const [rowName, rows, colName, cols] = R.pick([['Class year', ['First-year', 'Senior'], 'Has a job', ['Yes', 'No']], ['Owns a pet', ['Pet owner', 'No pet'], 'Stress level', ['High', 'Low']], ['Commute', ['Drives', 'Walks or bikes'], 'Late to class this week', ['Yes', 'No']]]);
    const n1 = R.pick([80, 100, 120, 150]), n2 = R.pick([60, 80, 100, 125]);
    const a = Math.round(n1 * R.step(0.15, 0.55, 0.05)), c = Math.round(n2 * R.step(0.15, 0.55, 0.05));
    const p1 = a / n1, p2 = c / n2, assoc = Math.abs(p1 - p2) >= 0.05;
    return {
      stem: `A survey recorded two variables:` + table([rowName, cols[0], cols[1], 'Total'], [[rows[0], a, n1 - a, n1], [rows[1], c, n2 - c, n2]]),
      parts: [
        { type: 'num', label: `Proportion of ${rows[0]} with “${cols[0]}”`, answer: p1, mistakes: [{ value: a / (a + c), msg: `Divide by the ${rows[0]} row total, ${n1}.` }] },
        { type: 'num', label: `Proportion of ${rows[1]} with “${cols[0]}”`, answer: p2, mistakes: [{ value: c / (a + c), msg: `Divide by the ${rows[1]} row total, ${n2}.` }] }],
      written: { prompt: `Is there an association between ${rowName.toLowerCase()} and ${colName.toLowerCase()} in this sample? Explain.`,
        keys: ['Compares the two row proportions.', assoc ? 'Concludes there is an association because the proportions differ.' : 'Concludes there is little or no association because the proportions are nearly equal.'],
        model: `${n(p1, 3)} of ${rows[0]} versus ${n(p2, 3)} of ${rows[1]} answered “${cols[0]}”. ${assoc ? 'These differ, so the variables are associated.' : 'These are nearly the same, so there is little evidence of an association.'}` },
      solution: [`${rows[0]}: \\(${a}/${n1} = ${tx(p1)}\\).`, `${rows[1]}: \\(${c}/${n2} = ${tx(p2)}\\).`, 'Compare the row proportions: if the variables were unrelated, they would be about equal.'],
      ti: 'Arithmetic only.', excel: '=B2/D2 for each row.'
    };
  });

  /* ================= Module 3 ================= */
  B.MC(3, 'm3-study', () => {
    const obs = R.coin();
    const sc = obs ? R.pick(['Researchers survey 500 adults about how often they eat breakfast and record their cholesterol.', 'A school records which students joined a tutoring program by choice and compares their final grades.'])
      : R.pick(['Volunteers are randomly assigned to drink either green tea or water daily, and their blood pressure is measured after 8 weeks.', 'A farmer randomly assigns 40 plots to two fertilizers and measures the yield.']);
    return { stem: `${sc} This is`, options: obs ? [
      o('an observational study, because no treatment was assigned', 4, 'Correct. The researchers only recorded what people already did.'),
      o('an experiment, because a random sample was used', 1, 'Random sampling is not random assignment. Nobody was assigned a treatment.'),
      o('an experiment, because a response was measured', 0, 'Observational studies measure responses too.'),
      o('an observational study, because the subjects were people', 2, 'Right label, wrong reason: experiments can use people. The key is that no treatment was imposed.')] : [
      o('an experiment, because treatments were assigned', 4, 'Correct. The researchers imposed the treatments.'),
      o('an observational study, because there was no random sample', 1, 'Random sampling is not what makes an experiment; imposing treatments is.'),
      o('an observational study, because a response was measured', 0, 'Both kinds of studies measure a response.'),
      o('an experiment, because a response was measured', 2, 'Right label, wrong reason: imposing treatments is what makes it an experiment.')] };
  });
  B.MC(3, 'm3-design', () => {
    const k = R.pick(['strat', 'clust', 'sys', 'conv']);
    const st = { strat: 'A university lists its students by class year and randomly selects 50 from each year.', clust: 'A city randomly selects 10 of its 120 blocks and surveys every household on those blocks.', sys: 'A store lists its 2,000 receipts in order, picks a random start between 1 and 20, and takes every 20th receipt.', conv: 'A reporter interviews the first 30 shoppers who walk out of a mall.' }[k];
    const name = { strat: 'stratified random sample', clust: 'cluster sample', sys: 'systematic sample', conv: 'convenience sample' };
    const why = { strat: 'Every group (stratum) is sampled.', clust: 'Whole groups are chosen and everyone in them is surveyed.', sys: 'A random start, then every k-th unit.', conv: 'The easiest people to reach, not chosen by chance.' };
    const near = { strat: 'clust', clust: 'strat', sys: 'conv', conv: 'sys' }[k];
    const others = ['strat', 'clust', 'sys', 'conv'].filter(x => x !== k && x !== near);
    return { stem: `${st} What kind of sample is this?`, options: [
      o(name[k], 4, 'Correct. ' + why[k]),
      o(name[near], k === 'strat' || k === 'clust' ? 2 : 1, k === 'strat' ? 'Stratified and cluster sampling both use groups. In stratified sampling some units are chosen from every group; in cluster sampling some groups are chosen and everyone in them is used.' : k === 'clust' ? 'Both use groups, but here whole groups were chosen and everyone in them surveyed. That is cluster sampling.' : k === 'sys' ? 'The random start and fixed step make this systematic, not convenience.' : 'Nothing here is chosen by a random start; these are simply the easiest people to reach.'),
      o(name[others[0]], 0, `That does not match: ${why[others[0]].toLowerCase()}`),
      o('simple random sample', 1, 'In a simple random sample every set of n units is equally likely. That is not true here.')] };
  });
  B.MC(3, 'm3-bias', () => {
    const k = R.pick(['vol', 'nonresp', 'under', 'resp']);
    const st = { vol: 'A TV station asks viewers to text their opinion of a new law; 4,000 texts come in.', nonresp: 'A survey is mailed to 1,000 randomly chosen residents; only 160 return it.', under: 'A phone survey uses only landline numbers to estimate the opinions of all adults.', resp: 'Interviewers in uniforms ask employees whether they have ever broken a company safety rule.' }[k];
    const name = { vol: 'voluntary response bias', nonresp: 'nonresponse bias', under: 'undercoverage', resp: 'response bias' };
    const near = { vol: 'nonresp', nonresp: 'vol', under: 'nonresp', resp: 'nonresp' }[k];
    const rest = ['vol', 'nonresp', 'under', 'resp'].filter(x => x !== k && x !== near);
    return { stem: `${st} Which kind of bias is the biggest concern?`, options: [
      o(name[k], 4, 'Correct.'),
      o(name[near], 2, { vol: 'Close, but nobody was chosen first. People chose themselves, which is voluntary response.', nonresp: 'Close, but these people were chosen at random and then did not answer. That is nonresponse.', under: 'The problem happens before anyone answers: part of the population cannot be reached at all.', resp: 'People did answer, but the setting may push them toward an untrue answer.' }[k]),
      o(name[rest[0]], 1, 'That bias is not the main issue here.'),
      o(name[rest[1]], 0, 'That bias is not the main issue here.')] };
  });
  B.MC(3, 'm3-treatments', () => {
    const a = R.int(2, 4), b = R.int(2, 4), units = a * b * R.pick([5, 6, 8, 10]);
    const [f1, f2] = R.pick([['fertilizer type', 'watering schedule'], ['caffeine dose', 'amount of sleep'], ['font size', 'background color']]);
    return { stem: `An experiment uses ${units} subjects. Factor 1 is ${f1} with ${a} levels; factor 2 is ${f2} with ${b} levels. Every combination is used. How many treatments are there?`, numeric: true, options: nums([
      [a * b, 4, `Correct: each treatment is a combination, so ${a} × ${b} = ${a * b}.`],
      [a + b, 2, 'Treatments are combinations of levels, so multiply the numbers of levels.'],
      [units / (a * b), 1, 'That is the number of subjects per treatment.'],
      [2, 0, 'That is the number of factors.']], 0) };
  });
  B.MC(3, 'm3-principles', () => {
    const k = R.pick(['control', 'random', 'rep']);
    const st = { control: 'A researcher gives all 60 volunteers a new memory supplement and finds that their scores improve. There is no comparison group.', random: 'A teacher lets students choose whether to use a new study app or the textbook, then compares test scores.', rep: 'A gardener tests a new fertilizer on one tomato plant and an old fertilizer on another.' }[k];
    const name = { control: 'a control (comparison) group', random: 'random assignment', rep: 'replication (enough units per treatment)' };
    const rest = Object.keys(name).filter(x => x !== k);
    return { stem: `${st} Which principle of experimental design is most clearly missing?`, options: [
      o(name[k], 4, 'Correct.'),
      o(name[rest[0]], 1, 'That may also matter, but it is not the most obvious problem here.'),
      o(name[rest[1]], 1, 'That may also matter, but it is not the most obvious problem here.'),
      o('a random sample from the population', 0, 'Random sampling helps generalize; it does not fix the design flaw described.')] };
  });
  B.MC(3, 'm3-blind', () => ({ stem: 'In a double-blind experiment,', options: [
    o('neither the subjects nor the people who measure the response know who got which treatment', 4, 'Correct.'),
    o('the subjects do not know which treatment they got, but the evaluators do', 2, 'That is single-blind. Double-blind keeps both groups unaware.'),
    o('every subject receives a placebo at some point', 1, 'A placebo helps make blinding possible, but blinding is about who knows the assignments.'),
    o('the subjects are chosen at random from the population', 0, 'That is random sampling, not blinding.')] }));
  B.MC(3, 'm3-confound', () => {
    const [x, y, z] = R.pick([['coffee drinkers', 'had more heart problems', 'smoking (coffee drinkers smoked more)'], ['students who used the tutoring center', 'earned higher grades', 'motivation (motivated students seek help)'], ['towns with more firefighters at a fire', 'had more damage', 'the size of the fire']]);
    return { stem: `An observational study found that ${x} ${y}. Which is the best explanation for why this does not prove cause and effect?`, options: [
      o(`A lurking variable such as ${z} may explain the association.`, 4, 'Correct. Without random assignment, groups can differ in other ways.'),
      o('The association could be due to chance alone.', 2, 'That is possible, but the main issue in an observational study is confounding.'),
      o('The sample was not large enough.', 1, 'A larger sample would not remove a lurking variable.'),
      o('Correlation can never be computed for observational data.', 0, 'Correlation can be computed for any two quantitative variables.')] };
  });
  B.MC(3, 'm3-systematic', () => {
    const k = R.pick([10, 20, 25, 40]); let n0; do { n0 = R.int(20, 40); } while (n0 === k);
    const N = k * n0, s = R.int(1, k);
    const list = j => [0, 1, 2].map(i => s + i * j).join(', ');
    return { stem: `To choose a systematic sample of ${n0} from ${N} numbered records, a random start between 1 and ${k} gives ${s}. Which records are the first three chosen?`, options: [
      o(list(k), 4, `Correct: \\(k = ${N}/${n0} = ${k}\\), so start at ${s} and add ${k} each time.`),
      o(list(n0), 2, `The step is k = N/n = ${k}, not n = ${n0}.`),
      o([s + k, s + 2 * k, s + 3 * k].join(', '), 1, `The random start, ${s}, is itself the first record chosen.`),
      o([s, s + 1, s + 2].join(', '), 0, 'Consecutive records are not a systematic sample; step by k.')] };
  });

  B.FR(3, 'm3-experiment', () => {
    const N = R.pick([40, 50, 60, 80]), [tA, tB, resp] = R.pick([['a new reading app', 'regular homework', 'reading score'], ['a stretching routine', 'no stretching', 'flexibility'], ['a high-protein breakfast', 'a regular breakfast', 'attention score']]);
    const levels2 = R.int(2, 3);
    return {
      stem: `A researcher has ${N} volunteers and wants to compare ${tA} with ${tB} on ${resp}. Later she also wants to add a second factor, time of day, with ${levels2} levels.`,
      parts: [
        { type: 'num', label: 'With the first factor only, how many volunteers go in each group?', answer: N / 2, mistakes: [{ value: N, msg: 'Split the volunteers between the two treatments.' }] },
        { type: 'num', label: `After adding time of day (${levels2} levels), how many treatments are there?`, answer: 2 * levels2, mistakes: [{ value: 2 + levels2, msg: 'Treatments are combinations: multiply the numbers of levels.' }] },
        { type: 'choice', label: 'Why randomize the assignment?', options: ['So the groups are similar in everything except the treatment', 'So the results apply to all adults', 'So the volunteers do not know their treatment'], answer: 0, why: { 1: 'That comes from random sampling, not random assignment.', 2: 'That is blinding.' } }],
      written: { prompt: 'Describe how to randomly assign the volunteers to the two treatments (first factor only).',
        keys: ['Uses a chance mechanism: label the volunteers 1–' + N + ' and use a random number generator (or names in a hat).', `Puts ${N / 2} in each treatment and compares mean ${resp} between groups.`],
        model: `Label the volunteers 1 to ${N}. Use a random number generator to pick ${N / 2} different labels; those volunteers get ${tA}, and the rest get ${tB}. After the study, compare the mean ${resp} of the two groups.` },
      solution: [`Two treatments: ${N}/2 = ${N / 2} each.`, `With two factors, treatments = 2 × ${levels2} = ${2 * levels2}.`, 'Random assignment balances lurking variables across groups, so differences can be attributed to the treatment.'],
      ti: 'MATH ▸ PROB ▸ 5:randInt(1,' + N + ') to draw labels (skip repeats).', excel: `=RANDBETWEEN(1,${N}), or sort the list by =RAND() and take the first ${N / 2}.`
    };
  });
  B.FR(3, 'm3-sys', () => {
    const k = R.pick([12, 15, 20, 25]), n0 = R.int(20, 40), N = k * n0, s = R.int(1, k);
    return {
      stem: `A hospital wants a systematic sample of ${n0} patient records from ${N} records numbered 1 to ${N}.`,
      parts: [
        { type: 'num', label: 'Sampling interval \\(k\\)', answer: k, mistakes: [{ value: n0, msg: 'k = N/n.' }] },
        { type: 'num', label: `If the random start is ${s}, what is the 3rd record chosen?`, answer: s + 2 * k, mistakes: [{ value: s + 3 * k, msg: 'The start is the 1st record, so the 3rd is start + 2k.' }] },
        { type: 'num', label: 'What is the last record chosen?', answer: s + (n0 - 1) * k, mistakes: [{ value: s + n0 * k, msg: `The ${n0}th record is start + ${n0 - 1}k.` }] }],
      written: { prompt: 'Explain why a systematic sample is not a simple random sample.',
        keys: ['States that in an SRS every possible set of n records is equally likely.', 'Explains that here many sets are impossible, e.g. two neighboring records can never both be chosen.'],
        model: `In a simple random sample every set of ${n0} records has the same chance. Here, once the start is chosen the whole sample is fixed, so most sets (for example any set containing two neighboring records) have no chance at all.` },
      solution: [`\\(k = ${N}/${n0} = ${k}\\).`, `Records chosen: ${s}, ${s + k}, ${s + 2 * k}, …`, `Last: \\(${s} + (${n0}-1)(${k}) = ${s + (n0 - 1) * k}\\).`],
      ti: `randInt(1,${k}) for the start.`, excel: `=RANDBETWEEN(1,${k})`
    };
  });

  /* ================= Module 4 ================= */
  const twoWay = () => {
    const [A, Ac, Bn, Bc, ctx] = R.pick([['Athlete', 'Non-athlete', 'Drinks coffee', 'No coffee', 'students'], ['Under 30', '30 or older', 'Streams music', 'Does not stream', 'adults'], ['Commuter', 'Resident', 'Has a car', 'No car', 'students']]);
    const a = R.int(20, 60), b = R.int(20, 60), c = R.int(20, 80), d = R.int(20, 80);
    return { A, Ac, Bn, Bc, ctx, a, b, c, d, N: a + b + c + d,
      html: table(['', Bn, Bc, 'Total'], [[A, a, b, a + b], [Ac, c, d, c + d], ['Total', a + c, b + d, a + b + c + d]]) };
  };
  B.MC(4, 'm4-cond', () => {
    const t = twoWay();
    return { stem: `A survey of ${t.N} ${t.ctx}:` + t.html + `If a person is chosen at random, what is \\(P(\\text{${t.Bn}} \\mid \\text{${t.A}})\\)?`, numeric: true, options: nums([
      [t.a / (t.a + t.b), 4, `Correct: restrict to the ${t.A} row: ${t.a}/${t.a + t.b}.`],
      [t.a / (t.a + t.c), 2, `That is \\(P(\\text{${t.A}} \\mid \\text{${t.Bn}})\\); the condition is reversed.`],
      [t.a / t.N, 1, 'That is P(both). Given means divide by the row total.'],
      [(t.a + t.c) / t.N, 0, `That is \\(P(\\text{${t.Bn}})\\) for everyone.`]], 4) };
  });
  B.MC(4, 'm4-or', () => {
    const t = twoWay(), pA = (t.a + t.b) / t.N, pB = (t.a + t.c) / t.N, pAB = t.a / t.N;
    return { stem: `A survey of ${t.N} ${t.ctx}:` + t.html + `What is \\(P(\\text{${t.A}} \\text{ or } \\text{${t.Bn}})\\)?`, numeric: true, options: nums([
      [pA + pB - pAB, 4, 'Correct: add, then subtract the overlap counted twice.'],
      [pA + pB, 2, 'You counted the overlap twice. Subtract P(both).'],
      [pAB, 1, 'That is P(both), not P(either).'],
      [pA * pB, 0, 'Multiplying gives P(both) only for independent events, and the question asks for “or”.']], 4) };
  });
  B.MC(4, 'm4-indep', () => {
    const pA = R.step(0.2, 0.6, 0.05), indep = R.coin(), pAgB = indep ? pA : S.round(pA + R.pick([-1, 1]) * R.step(0.1, 0.2, 0.05), 2);
    return { stem: `For two events, \\(P(A) = ${tx(pA, 2)}\\) and \\(P(A \\mid B) = ${tx(pAgB, 2)}\\). Are \\(A\\) and \\(B\\) independent?`, options: indep ? [
      o('Yes, because P(A | B) equals P(A)', 4, 'Correct: knowing B does not change the chance of A.'),
      o('No, because P(A | B) equals P(A)', 2, 'Equal probabilities are exactly what independence means.'),
      o('No, because A and B can happen together', 1, 'Events that can occur together may still be independent; that describes “not disjoint”.'),
      o('Not enough information', 0, 'Comparing P(A | B) with P(A) is enough.', { last: true })] : [
      o('No, because P(A | B) differs from P(A)', 4, 'Correct: knowing B changes the chance of A.'),
      o('Yes, because P(A | B) differs from P(A)', 2, 'The comparison is right, but different values mean dependent.'),
      o('Yes, because both probabilities are less than 1', 0, 'That has nothing to do with independence.'),
      o('Not enough information', 1, 'Comparing P(A | B) with P(A) is enough.', { last: true })] };
  });
  B.MC(4, 'm4-atleast', () => {
    const p = R.step(0.05, 0.3, 0.05), k = R.int(3, 6), ans = 1 - (1 - p) ** k;
    const ctx = R.pick(['a free-throw miss', 'a defective part', 'a rainy day']);
    return { stem: `The chance of ${ctx} is ${n(p, 2)} each time, independently. In ${k} tries, what is the probability of at least one?`, numeric: true, options: nums([
      [ans, 4, `Correct: \\(1 - (1-${tx(p, 2)})^{${k}}\\).`],
      [1 - p ** k, 2, 'Right complement idea, wrong base: “none” means each try fails, probability 1 − p each time.'],
      [(1 - p) ** k, 1, 'That is P(none). Subtract it from 1.'],
      [p ** k, 0, 'That is P(every try).']], 4) };
  });
  B.MC(4, 'm4-tree', () => {
    const pA = R.step(0.2, 0.6, 0.05), b = R.step(0.5, 0.9, 0.05), c = R.step(0.1, 0.4, 0.05);
    const [A, Bx] = R.pick([['a customer uses a coupon', 'buys dessert'], ['a student studied', 'passes the quiz'], ['a part comes from Plant A', 'is defective']]);
    const ans = pA * b + (1 - pA) * c;
    return { stem: `\\(P(A) = ${tx(pA, 2)}\\), where \\(A\\) = ${A}. \\(P(B\\mid A) = ${tx(b, 2)}\\) and \\(P(B\\mid A^c) = ${tx(c, 2)}\\), where \\(B\\) = ${Bx}. Find \\(P(B)\\).`, numeric: true, options: nums([
      [ans, 4, `Correct: add both branches, \\(${tx(pA, 2)}(${tx(b, 2)}) + ${tx(1 - pA, 2)}(${tx(c, 2)})\\).`],
      [pA * b, 2, 'That is only the A branch. Add the branch through \\(A^c\\).'],
      [b + c, 1, 'Conditional probabilities must be weighted by P(A) and P(A^c) before adding.'],
      [(b + c) / 2, 0, 'Averaging ignores how likely each branch is.']], 4) };
  });
  B.MC(4, 'm4-norepl', () => {
    const r = R.int(4, 9), g = R.int(5, 12), N = r + g, ans = r / N * (r - 1) / (N - 1);
    return { stem: `A box has ${r} red and ${g} green marbles. Two are drawn without replacement. What is the probability both are red?`, numeric: true, options: nums([
      [ans, 4, `Correct: \\(\\dfrac{${r}}{${N}}\\cdot\\dfrac{${r - 1}}{${N - 1}}\\).`],
      [(r / N) ** 2, 2, 'That assumes replacement. After one red is drawn, there are fewer reds and fewer marbles.'],
      [r / N, 1, 'That is the chance for one draw.'],
      [2 * r / N, 0, 'Adding chances for two draws does not give P(both).']], 4) };
  });
  B.MC(4, 'm4-discrete', () => {
    const xs = [0, 1, 2, 3], p = [R.step(0.1, 0.3, 0.05), R.step(0.2, 0.35, 0.05), R.step(0.15, 0.3, 0.05)];
    const last = S.round(1 - S.sum(p), 2); if (last <= 0.04) return B.mc[4].find(q => q.id === 'm4-discrete').gen();
    const full = [...p, last], mu = S.sum(xs.map((x, i) => x * full[i])), mu0 = S.sum(p.map((q, i) => xs[i] * q));
    return { stem: `A random variable \\(X\\) has this distribution (one probability is missing):` + table(['x', 0, 1, 2, 3], [['P(X = x)', n(p[0], 2), n(p[1], 2), n(p[2], 2), '?']]) + 'Find the mean of \\(X\\).', numeric: true, options: nums([
      [mu, 4, `Correct: the missing probability is ${n(last, 2)}; then \\(\\mu = \\sum x\\,P(x)\\).`],
      [mu0, 2, `You left out the missing probability (${n(last, 2)}); probabilities must add to 1.`],
      [1.5, 1, 'That averages the x values without weighting them by probability.'],
      [6, 0, 'That is the sum of the x values.']], 2) };
  });
  B.MC(4, 'm4-uniform', () => {
    const c = R.pick([10, 12, 20, 30, 60]), a = R.int(1, c / 2), b = R.int(a + 2, c - 1);
    return { stem: `A waiting time \\(X\\) is uniform from 0 to ${c} minutes. Find \\(P(${a} < X < ${b})\\).`, numeric: true, options: nums([
      [(b - a) / c, 4, `Correct: area = width × height = \\((${b}-${a})\\cdot\\tfrac{1}{${c}}\\).`],
      [b / c, 2, `That is \\(P(X < ${b})\\). Subtract the part below ${a}.`],
      [1 / c, 1, 'That is the height of the density, not an area.'],
      [(b - a) / 100, 0, 'Divide by the total width of the distribution, not 100.']], 4) };
  });

  B.FR(4, 'm4-table', () => {
    const t = twoWay(), pA = (t.a + t.b) / t.N, pB = (t.a + t.c) / t.N, pAB = t.a / t.N, pAgB = t.a / (t.a + t.c);
    const indep = Math.abs(pAgB - pA) < 0.005;
    return {
      stem: `A random sample of ${t.N} ${t.ctx}:` + t.html + `Let \\(A\\) = “${t.A}” and \\(B\\) = “${t.Bn}”.`,
      parts: [
        { type: 'num', label: '\\(P(A)\\)', answer: pA },
        { type: 'num', label: '\\(P(A \\text{ and } B)\\)', answer: pAB, mistakes: [{ value: pA * pB, msg: 'Read the count in the A-and-B cell; multiplying assumes independence.' }] },
        { type: 'num', label: '\\(P(A \\mid B)\\)', answer: pAgB, mistakes: [{ value: t.a / (t.a + t.b), msg: 'That is P(B | A). Given B: divide by the B column total.' }] },
        { type: 'num', label: '\\(P(A \\text{ or } B)\\)', answer: pA + pB - pAB, mistakes: [{ value: pA + pB, msg: 'Subtract the overlap.' }] }],
      written: { prompt: 'Are A and B independent? Justify with your probabilities.',
        keys: ['Compares P(A | B) with P(A) (or P(A and B) with P(A)P(B)).', indep ? 'Concludes independent, since they are equal.' : 'Concludes not independent, since they differ.'],
        model: `P(A | B) = ${n(pAgB, 4)} while P(A) = ${n(pA, 4)}. ${indep ? 'They are equal, so A and B are independent.' : 'They differ, so knowing B changes the chance of A: A and B are not independent.'}` },
      solution: [`\\(P(A) = ${t.a + t.b}/${t.N} = ${tx(pA)}\\).`, `\\(P(A \\text{ and } B) = ${t.a}/${t.N} = ${tx(pAB)}\\).`, `\\(P(A\\mid B) = ${t.a}/${t.a + t.c} = ${tx(pAgB)}\\).`, `\\(P(A \\text{ or } B) = ${tx(pA)} + ${tx(pB)} - ${tx(pAB)} = ${tx(pA + pB - pAB)}\\).`],
      ti: 'Arithmetic only.', excel: '=cell/total for each probability.'
    };
  });
  B.FR(4, 'm4-screen', () => {
    const prev = R.pick([0.01, 0.02, 0.05]), sens = R.pick([0.9, 0.95, 0.98]), spec = R.pick([0.9, 0.92, 0.95]);
    const pos = prev * sens + (1 - prev) * (1 - spec), post = prev * sens / pos;
    return {
      stem: `A screening test for a disease: ${n(prev * 100)}% of people have the disease. The test is positive for ${n(sens * 100)}% of people with the disease and negative for ${n(spec * 100)}% of people without it.`,
      parts: [
        { type: 'num', label: 'P(positive)', answer: pos, mistakes: [{ value: prev * sens, msg: 'Add the false positives from the people without the disease.' }] },
        { type: 'num', label: 'P(disease | positive)', answer: post, mistakes: [{ value: sens, msg: 'That is P(positive | disease); the condition is reversed.' }] }],
      written: { prompt: 'Explain in plain words why P(disease | positive) is much smaller than the test’s sensitivity.',
        keys: ['Notes that the disease is rare, so most people tested do not have it.', 'Explains that false positives from that large healthy group outnumber the true positives.'],
        model: `Only ${n(prev * 100)}% have the disease. Even a small false-positive rate (${n((1 - spec) * 100)}%) applied to the ${n((1 - prev) * 100)}% who are healthy produces more positives than the true positives, so most positives are false alarms.` },
      solution: [`True positives: \\(${tx(prev)}(${tx(sens)}) = ${tx(prev * sens)}\\).`, `False positives: \\(${tx(1 - prev)}(${tx(1 - spec)}) = ${tx((1 - prev) * (1 - spec))}\\).`, `\\(P(+) = ${tx(pos)}\\).`, `\\(P(D\\mid +) = ${tx(prev * sens)}/${tx(pos)} = ${tx(post)}\\).`],
      ti: 'Arithmetic only.', excel: '=prev*sens/(prev*sens+(1-prev)*(1-spec))'
    };
  });
})(globalThis);
