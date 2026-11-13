/* Ported from stat2331-learn: multi-step, hand-first questions with mistake diagnosis. */
/* Module 3 practice: Producing Data */
(function () {
  "use strict";
  const R = HandKit.R;

  // Build a multiple-choice question from a scenario bank.
  function fromBank(bank, options, label, explainFn) {
    return function () {
      const [text, ans, why] = R.pick(bank);
      const msg = why;
      return {
        prompt: `<p>${text}</p>`,
        parts: [{ type: "choice", label, options, answer: ans, fixed: true, why: Object.fromEntries(options.map((_, i) => [i, msg])) }],
        hand: explainFn(ans, why)
      };
    };
  }

  const STUDY = ["Observational: retrospective", "Observational: cross-sectional", "Observational: prospective", "Experiment"];
  const STUDY_BANK = [
    ["Researchers mail a questionnaire to 76,000 middle and high school students asking about current drug use and whether their school drug-tests.", 1, "Nothing was assigned and the data are a snapshot of the present, so it is cross-sectional."],
    ["A researcher randomly assigns 60 identical pots to be kept at 75°F or 65°F and records how long tomato seeds take to sprout.", 3, "The researcher imposed the temperature, so this is an experiment."],
    ["Doctors review hospital records from the past 10 years to compare childhood vaccination histories of adults who did and did not develop asthma.", 0, "The researchers look back at past records without assigning anything, so it is retrospective."],
    ["A health agency enrolls 5,000 adults and follows them for 20 years, recording diet and whether they develop heart disease.", 2, "Subjects are followed into the future and nothing is assigned, so it is prospective."],
    ["Volunteers with high blood pressure are randomly given a new drug or the most popular existing drug, without knowing which, and blood pressure is measured after 8 weeks.", 3, "The researchers assigned the drugs, so this is an experiment."],
    ["A pollster calls 1,200 randomly selected adults this week and asks whom they plan to vote for.", 1, "Nothing is assigned and the data describe the present moment, so it is cross-sectional."],
    ["Patients with and without brain cancer are asked how much they used cell phones over the past decade.", 0, "Subjects report on their past behavior and nothing is assigned, so it is retrospective."],
    ["A company randomly shows half of its website visitors a new checkout page and the other half the old one, then compares purchase rates.", 3, "The company assigned which page each visitor saw, so this is an experiment."],
    ["A university tracks a cohort of first-year students through graduation, recording their study habits and final GPAs.", 2, "Students are followed forward in time with no treatment assigned, so it is prospective."]
  ];
  const studyType = fromBank(STUDY_BANK, STUDY, "Type of study", (a, why) => ["First ask: did the researcher assign a treatment? If yes, it is an experiment.", "If not, ask whether the study looks back (retrospective), at the present (cross-sectional), or forward (prospective).", why]);

  const SAMP = ["Simple random sample", "Systematic sample", "Stratified sample", "Cluster sample", "Convenience sample", "Voluntary response sample"];
  const SAMP_BANK = [
    ["A dean puts every student ID into software and randomly selects 200 of them.", 0, "Every student had the same chance and every group of 200 was equally likely: a simple random sample."],
    ["From an alphabetical list of 4,000 members, a club picks a random number from 1 to 20 and then selects every 20th name.", 1, "A random start followed by every kth name is systematic sampling."],
    ["A researcher randomly selects 50 first-years, 50 sophomores, 50 juniors, and 50 seniors.", 2, "The population was split into homogeneous groups (class years) and a random sample was taken from every group: stratified."],
    ["A city randomly chooses 12 of its 300 city blocks and surveys every household on those blocks.", 3, "Whole groups (blocks) were randomly chosen and everyone in them was surveyed: cluster sampling."],
    ["A student surveys the first 40 people who walk into the student center Monday morning.", 4, "The student chose whoever was easy to reach, with no randomization: a convenience sample."],
    ["A TV station asks viewers to text YES or NO to a question during the evening news.", 5, "People chose to participate on their own: a voluntary response sample."],
    ["An airline randomly selects 8 of its 150 daily flights and surveys every passenger on those flights.", 3, "Entire flights (clusters) were selected at random and everyone on them was surveyed."],
    ["A hospital splits its nurses by shift (day, evening, night) and randomly selects 20 from each shift.", 2, "A random sample from every shift is stratified sampling."],
    ["A news website posts an online poll and reports the results of the 25,000 people who clicked.", 5, "Respondents selected themselves, so it is a voluntary response sample."],
    ["A professor surveys the students in her own 8 a.m. section to learn about all SMU students' sleep habits.", 4, "She used a group that was convenient to reach, not a random sample of all students."],
    ["A quality inspector checks every 50th item off an assembly line, starting at a randomly chosen item among the first 50.", 1, "A random start and then every 50th item is systematic sampling."]
  ];
  const sampling = fromBank(SAMP_BANK, SAMP, "Sampling design", (a, why) => ["Ask who chose the subjects (chance, the researcher's convenience, or the subjects themselves) and whether groups were involved.", "Stratified: a few from every group. Cluster: everyone from a few groups.", why]);

  const BIAS = ["Undercoverage", "Nonresponse bias", "Response bias"];
  const BIAS_BANK = [
    ["A phone survey uses a list of landline numbers, so households with only cell phones can never be selected.", 0, "Part of the population was missing from the sample frame: undercoverage."],
    ["Of 2,000 randomly selected alumni sent a survey, only 340 returned it.", 1, "Most chosen subjects did not respond, so nonresponse bias is the concern."],
    ["A survey asks, 'Don't you agree that the dangerous new highway should be stopped?'", 2, "The leading wording pushes people toward one answer: response bias."],
    ["Students are asked, in front of their professor, how many hours they studied for the exam.", 2, "People may give a socially desirable answer instead of the truth: response bias."],
    ["A survey of 'all Dallas residents' is drawn from a list of registered voters.", 0, "Residents who aren't registered voters have no chance of being selected: undercoverage."],
    ["Many people chosen for a survey about income refuse to answer the income question.", 1, "Chosen subjects skipping the question is nonresponse."],
    ["The Literary Digest drew its 1936 sample from its subscriber list and telephone directories.", 0, "Voters without subscriptions or phones (often poorer) were left out of the frame: undercoverage."],
    ["Patients are asked, 'How many alcoholic drinks do you have per week?' on a signed form handed to their doctor.", 2, "People tend to under-report sensitive behavior when identified: response bias."],
    ["Researchers knock on randomly selected doors during weekday working hours; many households are not home.", 1, "Selected households could not be reached: nonresponse."]
  ];
  const bias = fromBank(BIAS_BANK, BIAS, "Main type of bias", (a, why) => ["Undercoverage: left out of the list. Nonresponse: chosen but didn't answer. Response: answered, but not truthfully or accurately.", why]);

  const DESIGN = ["Completely randomized", "Randomized block", "Matched pairs", "Crossover"];
  const DESIGN_BANK = [
    ["60 students are randomly split into two groups of 30; one group takes a practice exam and the other does not. Exam scores are compared.", 0, "All subjects were randomly assigned with no grouping first: completely randomized."],
    ["60 students are first separated into first-years and upper-level students; within each group, half are randomly assigned a practice exam.", 1, "Subjects were grouped first, then randomized within each group: a block design."],
    ["Twins are recruited; in each pair, a coin flip decides which twin gets the new reading program.", 2, "Similar subjects were paired and the treatment randomized within each pair: matched pairs."],
    ["Each patient takes drug A for a month and drug B for a month, in random order, with a two-week washout in between.", 3, "Every subject receives both treatments in random order: crossover."],
    ["Runners test two shoe brands: each runner wears brand A on one foot and brand B on the other, with the foot chosen at random.", 3, "Each subject gets both treatments (one on each foot): crossover."],
    ["Fields in 10 locations each get all six fertilizer-pesticide combinations, randomly assigned to plots within each field.", 1, "Treatments were randomized within each field (block): a block design."],
    ["Patients are paired by age and blood pressure; one in each pair is randomly given the new drug and the other a placebo.", 2, "Pairs of similar subjects with randomization inside each pair: matched pairs."],
    ["200 volunteers are randomly assigned to one of four diet plans, 50 per plan.", 0, "All volunteers were randomly assigned with no blocking: completely randomized."]
  ];
  const design = fromBank(DESIGN_BANK, DESIGN, "Experimental design", (a, why) => ["Ask whether subjects were grouped before randomizing (block), paired (matched pairs), or given every treatment themselves (crossover).", why]);

  const ELEM = ["Control", "Randomization", "Blinding", "Replication"];
  const ELEM_BANK = [
    ["A company gives its new drug to 200 patients with high blood pressure; 60% improve. There is no comparison group.", 0, "With no comparison group, we can't separate the drug's effect from the placebo effect or natural improvement."],
    ["A teacher lets students choose whether to use the new study app or not, then compares exam scores.", 1, "Students chose their own treatment, so motivated students may cluster in one group. Treatments should be assigned at random."],
    ["Patients know whether they received the new pain reliever or a sugar pill, and they rate their own pain.", 2, "Knowing the treatment can change how patients report pain. Neither subjects nor evaluators should know."],
    ["A new fertilizer is tested on one plot of corn while a second plot gets the old fertilizer.", 3, "One plot per treatment can't separate the fertilizer from natural plot-to-plot variation. Use many plots per treatment."],
    ["Doctors who know which patients got the new drug decide whether each patient 'improved.'", 2, "The evaluators' expectations can influence judgments: the study should be double-blind."],
    ["A gardener plants the new seed variety in the sunniest part of the yard and the old variety in the shade.", 1, "The gardener's assignment confounds sunlight with seed variety. Assign locations at random."],
    ["Two classrooms test a new curriculum: one class gets it, the other doesn't.", 3, "One class per treatment is too little replication; class-to-class differences could explain any result."]
  ];
  const elements = fromBank(ELEM_BANK, ELEM, "Which element of a good experiment is most clearly missing?", (a, why) => ["Check each element: is there a comparison group (control), chance assignment (randomization), hidden treatment labels (blinding), and many units per treatment (replication)?", why]);

  // ---- counting treatments and units (numeric) ----
  const FACTORS = [
    ["temperature", ["65°F", "75°F", "85°F"]], ["fertilizer type", ["A", "B"]], ["watering schedule", ["daily", "every other day", "weekly"]],
    ["dose", ["0 mg", "50 mg", "100 mg", "150 mg"]], ["study method", ["flashcards", "practice tests"]], ["music", ["none", "classical", "pop"]],
    ["light", ["full sun", "partial shade"]], ["pesticide schedule", ["1", "2", "3"]]
  ];
  function treatments() {
    const k = R.coin(0.7) ? 2 : 3;
    const fs = R.sample(FACTORS, k);
    const prod = fs.reduce((p, f) => p * f[1].length, 1);
    const reps = R.int(3, 12);
    const units = prod * reps;
    const desc = fs.map(f => `${f[0]} (${f[1].join(", ")})`).join(k === 2 ? " and " : ", ");
    const sumL = fs.reduce((s, f) => s + f[1].length, 0);
    return {
      prompt: `<p>An experiment studies the factors ${desc}. Every combination is used, and each combination is assigned to ${reps} experimental units.</p>`,
      parts: [
        { type: "num", label: "Number of treatments", answer: prod, tol: 0.01, show: String(prod), mistakes: [{ value: sumL, msg: "You added the levels. Treatments are combinations, so multiply the numbers of levels." }, { value: k, msg: "That is the number of factors. Treatments are the combinations of their levels." }] },
        { type: "num", label: "Total number of experimental units", answer: units, tol: 0.01, show: String(units), mistakes: [{ value: sumL * reps, msg: "Multiply the number of treatments (a product of levels) by the units per treatment." }] }
      ],
      hand: [
        `Count the levels: ${fs.map(f => `${f[0]} has ${f[1].length}`).join(", ")}.`,
        `Treatments are combinations: \\(${fs.map(f => f[1].length).join(" \\times ")} = ${prod}\\).`,
        `Each treatment gets ${reps} units: \\(${prod} \\times ${reps} = ${units}\\) experimental units.`
      ]
    };
  }

  // ---- systematic sampling by hand ----
  function systematic() {
    const k = R.pick([5, 8, 10, 12, 15, 20, 25, 40]);
    const nSel = R.pick([20, 25, 40, 50]);
    const N = k * nSel;
    const start = R.int(1, k);
    const j = R.int(3, 9);
    const id = start + (j - 1) * k;
    const ord = j === 3 ? "3rd" : j + "th";
    return {
      prompt: `<p>A list of ${N.toLocaleString()} customers is numbered 1 to ${N.toLocaleString()}. A systematic sample of ${nSel} is taken. The random starting number is <strong>${start}</strong>.</p>`,
      parts: [
        { type: "num", label: "Spacing \\(k\\)", answer: k, tol: 0.01, show: String(k), mistakes: [{ value: nSel / N, msg: "Divide the population size by the sample size: \\(k = N/n\\)." }] },
        { type: "num", label: `ID number of the ${ord} customer selected`, answer: id, tol: 0.01, show: String(id),
          mistakes: [{ value: start + j * k, msg: "The first customer is the starting number itself, so the jth is start + (j − 1)k." }, { value: j * k, msg: "Begin from the random start, not from 0." }] }
      ],
      hand: [
        `\\(k = N/n = ${N}/${nSel} = ${k}\\).`,
        `The selected IDs are ${start}, ${start + k}, ${start + 2 * k}, … adding ${k} each time.`,
        `The ${ord} is \\(${start} + (${j} - 1)(${k}) = ${id}\\).`
      ],
      ti: `Random start: ${HandUI.keys("[MATH] [◀] {5:randInt(}")} then ${HandUI.screen(`randInt(1,${k})`)}. For a simple random sample instead, ${HandUI.screen(`randInt(1,${N},${nSel})`)} lists ${nSel} IDs (check for repeats).`,
      excel: HandUI.xl(`=RANDBETWEEN(1,${k})`, "start") + HandUI.xl(`=$B$1+(ROW()-1)*${k}`, "IDs down a column")
    };
  }

  HandKit.mount("#practice-app", {
    module: 3,
    skills: [
      { id: "m3-study", title: "Observational study or experiment", gen: studyType },
      { id: "m3-sampling", title: "Name the sampling design", gen: sampling },
      { id: "m3-bias", title: "Identify the bias", gen: bias },
      { id: "m3-design", title: "Name the experimental design", gen: design },
      { id: "m3-elements", title: "What is the experiment missing?", gen: elements },
      { id: "m3-treatments", title: "Count treatments and units", gen: treatments },
      { id: "m3-systematic", title: "Systematic sampling by hand", gen: systematic }
    ]
  });
})();
