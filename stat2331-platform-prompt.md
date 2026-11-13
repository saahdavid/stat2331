# Prompt: STAT 2331 Online Learning Platform

*Current version, combining the original request, the animation follow-up, and the conventions settled while building it. Paste everything below the line into a new conversation, with the eight module PDFs attached.*

---

I'm Dr. David Saah, Assistant Teaching Professor in the Department of Statistics and Data Science at SMU. I teach STAT 2331, Introduction to Statistical Methods. I already have a GitHub repo of interactive demos for my upper-level course (saahdavid/stat4340-demos). I want a **new, separate repository** for my STAT 2331 students that covers **Modules 1 through 8** so they can learn more effectively.

The attached PDFs are my filled-in lecture notes for each module:

1. Data Distributions
2. Data Relationships
3. Producing Data
4. Probability Basics
5. Normal & Binomial Distributions
6. Sampling Distributions
7. Confidence Intervals
8. Hypothesis Testing, Uses & Abuses

Read all eight before building. Use my examples, notation, and wording wherever possible, so the site matches what students see in class.

## Who it's for and what matters most

These are introductory students, not the advanced students in STAT 4340. The site should be **more detailed than my slides but still easy to follow**.

- **Working by hand comes first.** That is how students solve problems on my exams. Every method must be shown as the steps a student would write on paper.
- **TI-84 and Excel come second.** After each hand method, give the TI-84 keystrokes and the Excel formulas so students can check their work.
- **Students should learn by doing and by watching.** Include dynamic practice and animated simulations (both described below).

## What to build

A static website I can host free on GitHub Pages. It needs no server and no build step to serve. Deliver it as a complete git repository (zipped) that I can push to a new GitHub repo, with a README explaining how to publish and edit it.

### 1. A notes page for each module

Each page should have:

- A short introduction and a list of learning objectives.
- Clear explanations, with every formula in a highlighted box.
- Worked examples taken from my PDFs, solved step by step by hand.
- "Common mistakes" callouts.
- TI-84 and Excel sections.
- A summary.
- A practice section at the end.

Render the math properly (KaTeX). Include a sidebar table of contents and previous/next links between modules.

### 2. Dynamic practice (the most important part)

Questions must **not be static**:

- **New numbers every time.** Every question is generated fresh.
- **Diagnose wrong answers.** If the student's wrong answer matches a known common mistake, explain that specific mistake. Examples:
  - dividing by n instead of n − 1
  - forgetting the complement ("greater than" needs 1 − table value)
  - using σ instead of σ/√n
  - using p̂ instead of p₀ in a test's standard error
  - forgetting to double the tail for a two-sided test
  - wrong denominator in a conditional or row proportion
  - swapping slope and intercept
  - rounding a sample size down
- **Then show and retry.** After any miss, show the full worked solution by hand (with a picture where it helps), then give a **fresh question of the same kind** to try again.
- **Mastery:** three correct in a row masters a skill. Show progress on each skill and on the home page, saved in the student's own browser.
- **Mixed sets:** a mixed-set mode with 6 questions across the module. Missed skills come back with new numbers before the set ends.
- **Flexible input:** accept arithmetic (`11/200`, `0.48*0.52`, `sqrt(0.25/100)`) and percentages.
- **Normal probabilities:** accept both the table answer (z rounded to two decimals) and the exact software answer, and explain the difference.
- **Check methods:** each solution ends with the TI-84 and Excel steps.

Aim for 7–8 skills per module, covering every calculation and key concept in the notes. Examples of what I expect:

- **Module 1:** classify variables; parameter vs. statistic; proportions; mean and median; SD by hand; five-number summary and IQR; outlier fences; shape from mean vs. median.
- **Module 2:** explanatory vs. response; row proportions; interpreting R; predictions and residuals; the regression line from summary statistics; R²; interpolation vs. extrapolation; lurking variables.
- **Module 3:** observational study vs. experiment; sampling designs; bias types; experimental designs; elements of a good experiment; counting treatments; systematic sampling.
- **Module 4:** probabilities from two-way tables; independence; tree diagrams and reversing a condition; "at least one"; sampling without replacement; discrete random variables; uniform areas.
- **Module 5:** 68-95-99.7 rule; z-scores; normal probabilities with the table; inverse normal; BINS; binomial probabilities by hand; binomial mean and SD; normal approximation.
- **Module 6:** mean, SD, and shape of p̂; smallest n; probabilities for p̂ and x̄; middle C%; when x̄ is normal (CLT); sample size and spread.
- **Module 7:** CI for p; reading t* from the table; CI for μ; estimate and margin from an interval; sample size; interpreting a CI; what changes the margin.
- **Module 8:** writing hypotheses; z test for p; t test for μ; decision and conclusion; Type I/II errors; power and β; using a CI to decide a test; practical significance.

### 3. Animated labs

My students need to **see** the ideas happen: samples actually being drawn, statistics dropping into a distribution as it builds, not just a final answer appearing.

Every lab uses the same controls:

- **Take 1** (slow, every step visible)
- **Take 10**
- **Play / Pause** (runs continuously)
- **Add 1000 instantly**
- A **Speed** slider
- **Start over**

Every lab also shows the simulation next to the theory from my notes, and warns when a condition fails (such as np < 10). Place each lab next to the notes it illustrates, and add a Labs page that lists them all. Build these ten:

1. **Resistant or not? (M1):** drag data values; the mean and SD chase outliers while the median and IQR stay put.
2. **Least squares by hand and by eye (M2):** drag or add points. Show the residuals and the squared residuals, add an influential point, and display b₁ = R·s_y/s_x and b₀ = ȳ − b₁x̄ with the live numbers.
3. **Why we randomize (M3):** a researcher hand-picks the treatment group versus random assignment, with the distribution of group differences under randomization.
4. **Law of Large Numbers (M4):** trials play out one at a time, with up to five runs settling toward p.
5. **Building a binomial distribution (M5):** n trials flip, X is counted and stacked, and the result is compared with the exact binomial probabilities and the normal curve.
6. **Sampling distribution of p̂ (M6):** sample n people from a visible population of 1000. Each p̂ drops onto a building plot that becomes a bell when np ≥ 10 and n(1 − p) ≥ 10.
7. **Sampling distribution of x̄ and the CLT (M6):** choose a skewed-right, skewed-left, uniform, bimodal, or normal population. Sampled values fall out of the curve and x̄ drops into a histogram. Use a shared scale so the narrowing by σ/√n is visible.
8. **What "95% confident" means (M7):** intervals for p (z) or μ (t) grow out from their estimates. Blue intervals capture the true value and red ones miss, with a running capture rate. Tapping an interval shows its by-hand calculation.
9. **What a p-value really is (M8):** simulate under H₀ (default: therapeutic touch, 52 of 100). Samples as extreme as the observed one turn red; red ÷ total is the p-value, compared with the formula.
10. **Type I error and power (M8):** run the same test repeatedly. The rejection rate matches α when H₀ is true and equals the power when it is false.

### 4. Reference pages

- A **tables page** with the Standard Normal Table and the t table, plus a formula sheet. Lookup helpers highlight the row, column, and entry for a typed z, a typed area, df with a confidence level, or df with a test statistic (bracketing the p-value).
- A **home page** with the eight modules, each student's saved progress, and links to the labs and tables.

## Course conventions to follow exactly

- **Quartiles:** median of each half, leaving the median out of both halves when n is odd (the TI-84 method). Note that Excel's QUARTILE functions can differ.
- **Sample SD:** divide by n − 1. On the TI, use Sx, not σx (but use σx for a probability distribution's SD).
- **Normal table:** it gives left areas. Round z to two decimals and use 4-decimal entries. Beyond ±3.49 the area is essentially 0 or 1. An area exactly halfway between two entries (0.95) uses the midpoint z = 1.645.
- **Critical values:** z* = 1.282, 1.645, 1.960, 2.576 for 80/90/95/99%.
- **t table:**
  - Upper-tail areas .25 down to .0005.
  - df rows 1–30, 40, 50, 60, 80, 100, 1000.
  - A z* row and a confidence-level row.
  - If df isn't listed, use the next **smaller** df.
- **Normal approximation to the binomial** when np ≥ 10 and n(1 − p) ≥ 10, with **no continuity correction**.
- **Proportion intervals:** the condition is at least 10 successes and 10 failures. **Mean intervals:** random data and no extreme skew or outliers.
- **Sample size:**
  - for p: n = (z*)²·p̂(1 − p̂)/m², using 0.5 with no estimate
  - for μ at 95%: n = 4s²/m²
  - always round up
- **Hypothesis tests:**
  - H₀ always uses "="; translate "at least / at most" claims accordingly.
  - The test SE for p uses p₀.
  - t-test p-values are **bracketed from the t table**, with the exact value shown in the TI/Excel check.
  - Say "reject" or "fail to reject," never "accept."
  - Conclusions are stated in context, in terms of Hₐ.

## Design

- **A worksheet feel:** graph-paper practice sheets, "red pencil" correction notes for mistakes, highlighter for formulas to memorize, and TI-84 keys drawn as keycaps with a calculator-screen style.
- **Fonts:** a readable serif for the notes (Source Serif 4) and a highly legible sans for the interface (Atkinson Hyperlegible).
- Light and dark themes with a toggle.
- Works well on phones.
- Keyboard accessible, and respects "reduce motion" (animations step instead of glide).

## Technical requirements

- Plain HTML, CSS, and JavaScript. KaTeX and Google Fonts from CDNs; everything else in the repo.
- Write the notes as editable source fragments (`src/module-N.html`), plus a small script that builds the final module pages with the shared header, table of contents, and scripts.
- Put the numerical core (normal, t, and binomial functions plus the table lookups) in its own file.
- Keep each module's question generators and labs in separate files, so I can add questions later.

## Testing before you hand it over

- **Browser test (Playwright):**
  - Load every page and fail on any JavaScript error or unrendered math.
  - Generate hundreds of questions per skill and check for finite answers, valid choices, and no "undefined" or "NaN".
  - Answer each skill through the real interface, confirming right answers are marked right and wrong answers are caught with a solution.
  - Press every lab button, including Play and Pause.
- **Cross-check:** check the distribution functions and every table entry against SciPy.
- **Visual check:** look at the pages and labs at desktop and phone width, in light and dark mode, and fix anything that overlaps or is clipped.

## README

Include:

- What's on the site, with each module's skills and labs.
- How the practice and the labs work.
- The course conventions above.
- Step-by-step instructions for publishing on GitHub Pages (browser upload and command line).
- How to edit the notes and add questions.
- How to run the tests.
