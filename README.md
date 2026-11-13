# STAT 2331 · The course notebook

A hand-first learning site for Dr. David Saah’s Introduction to Statistical Methods at SMU. The site serves directly from this repository as plain HTML, CSS, and JavaScript. There is **no server, account system, database, or required build step for students**.

Student URL after GitHub Pages is enabled: **https://saahdavid.github.io/stat2331/**

## What students can use

| Module | Eight practice skills | Animated labs |
| --- | --- | --- |
| 1. Data Distributions | Variable types; parameters/statistics; proportions; mean/median; sample SD; quartiles/IQR; fences; shape/resistance | Resistant or not? |
| 2. Data Relationships | Explanatory/response; row proportions; R; predictions/residuals; line from summaries; R²; interpolation/extrapolation; lurking variables/residual patterns | Least squares by hand and by eye |
| 3. Producing Data | Study types; sampling designs; bias; experimental designs; good experiment elements; treatment counts; systematic positions; inference scope/ethics | Why we randomize |
| 4. Probability Basics | Joint/conditional table probabilities; unions/complements; independence; trees/reversing conditions; at least one; without replacement; discrete mean/SD; uniform areas | Law of Large Numbers |
| 5. Normal & Binomial | Empirical Rule; z scores; normal areas; inverse normal; BINS; exact/cumulative binomial; binomial mean/SD; normal approximation | Building a binomial distribution |
| 6. Sampling Distributions | p̂ center/spread; minimum n; p̂ probabilities; x̄ probabilities; middle ranges; CLT; n/spread; three distributions/unbiasedness | Sampling distribution of p̂; sample means and CLT |
| 7. Confidence Intervals | Proportion CI; t* lookup; mean CI; estimate/margin; n for p; n for μ; confidence interpretation; margin changes | Repeated confidence intervals |
| 8. Hypothesis Testing + Uses & Abuses | Hypotheses; proportion z test; mean t test/table p brackets; tails; decision/conclusion; Type I/II; power/β; CI decisions/practical significance | p-value under H₀; Type I error and power |

Each module contains explanations, highlighted formulas, worked examples, common mistakes, TI-84 checks, Excel formulas, a table of contents, previous/next links, and practice. The normal and t tables have lookup helpers; the reference page also contains a formula sheet.

The source material is the instructor's eight filled lecture notes (not included in this repository). Examples include shark attacks, pesticides in foods, car weight/MPG, soybean experiments, diabetes complications, dragonfly wingspans, the Boston pizzeria, Verve, facial ratios, nurses’ diets, therapeutic touch, and river oxygen. The site expands the hand arithmetic and clarifies several mathematical details rather than copying incidental slide errors. In particular, it distinguishes exact software t values from the course’s smaller-df table values and explains the limits of proportion CI/test equivalence.

## Practice and saved mastery

- Questions are generated with fresh values and scenario variants. Conceptual questions change numerical context and/or scenario; they are not numerical exercises disguised as arithmetic.
- Enter a decimal, a percentage, or arithmetic such as `11/200`, `0.48*0.52`, `sqrt(0.25/100)`, or `(2+3)^2`. A small recursive-descent parser handles these inputs; it never evaluates JavaScript.
- Wrong answers that match a known mistake receive a targeted diagnosis. Every miss or requested solution shows the complete hand solution and TI-84/Excel checks. The next question has new numbers in the same skill.
- Three consecutive correct answers master a skill. A miss resets the current streak; an earned mastery badge stays earned. Looking at a solution counts as an attempt and resets the streak.
- Mixed mode starts with six distinct skills from the module. A missed skill is appended for a fresh retry before the set finishes. A set may therefore contain more than six questions.
- Normal-probability exercises accept the rounded table result and the full-precision software result. Solutions explain their difference. Some confidence-interval exercises accept the exact software endpoint as well as the conservative table endpoint.
- Mastery is saved under `stat2331-progress-v1` in the student’s own browser. It is not sent anywhere and does not sync across devices. Students can export/import a JSON backup on the home page. Clearing browser data removes it. This is ungraded formative practice, not a secure assessment or instructor gradebook.

## Using the labs

All ten labs offer **Take 1**, **Take 10**, **Play/Pause**, **Add 1000 instantly**, **Speed**, and **Start over**. Parameter changes reset prior runs. Take 1 shows drawing, computation, and placement; faster modes accumulate repetitions. Reduced-motion preferences remove gliding while preserving the sampling steps.

The first two labs allow pointer dragging and arrow-key adjustment of focused points. Regression also allows clicking to add points and adding an influential point. The randomization lab compares random assignment with biased selection. The LLN lab supports up to five parallel runs. Confidence intervals are clickable and keyboard selectable to show their calculation.

Numerical assumptions are visible beside the simulation:

- The 1000-person p̂ population is sampled **with replacement**, preserving independent Bernoulli draws. A large without-replacement sample would require a finite-population adjustment.
- CLT populations all have mean 0 and SD 1. Their shared horizontal scale makes narrowing visible. The displayed plotting window clips very remote values; numerical means still use the original values.
- The confidence lab uses a Wald z interval for p, with count warnings, or the exact-df t interval from an independent normal population for μ. Wald coverage is approximate and may differ from the requested level.
- The p-value simulation approaches an **exact discrete binomial tail**, whereas the lecture z calculation is a normal approximation without continuity correction. For therapeutic touch, 52/100 gives an exact right tail of about .3822 versus the lecture normal value .3446. The lab explains this distinction.
- The power lab repeats the right-sided proportion z test. Discreteness can make the actual Type I rate differ from nominal α; the exact rejection probability for the implemented rule is shown.

## Course conventions

- Quartiles are half-medians, excluding the overall median from both halves for odd n (TI-84 convention). Excel QUARTILE functions may differ.
- Sample variance divides by **n−1**. Use **Sx** for sample SD; use **σx** for a full probability distribution.
- Normal-table entries are **left areas**, with z rounded to two decimals and entries to four decimals. Beyond ±3.49, use essentially 0 or 1. Inverse ties use midpoint z (for example .95 → 1.645).
- z*: 80% = 1.282; 90% = 1.645; 95% = 1.960; 99% = 2.576.
- t-table upper tails run from .25 to .0005. Rows: 1–30, 40, 50, 60, 80, 100, 1000, plus a z* row and central-confidence row. Use the next **smaller listed df** when necessary. Software checks use actual df.
- Normal approximation to the binomial requires np≥10 and n(1−p)≥10. Use **no continuity correction**.
- Proportion CIs require random data and at least 10 observed successes and failures. Mean intervals/tests require random data and no extreme skew or extreme outliers.
- Planned n for p uses `(z*)² p̂(1−p̂)/m²`, with .5 if no estimate exists. Planned n for μ at 95% uses the course approximation `4s²/m²`. **Always round up**.
- H₀ uses equality. Proportion-test expected counts and SE use p₀. t-test p-values are bracketed from the table, with exact checks shown. Say **reject** or **fail to reject**, and conclude in terms of Hₐ in context.

## Publish with GitHub Pages

The finished HTML pages are already committed. GitHub Pages can serve them unchanged.

### Browser upload

1. Create a public GitHub repository (this project uses `saahdavid/stat2331`). If it already exists, open it.
2. Unzip the delivery archive. Upload its **contents**, not the enclosing folder, using **Add file → Upload files**. Include `index.html`, all module pages, `assets/`, and `.nojekyll`. Commit the files.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose **main** and **/(root)**, then **Save**.
6. Wait for GitHub’s Pages deployment to finish. The URL appears in Pages settings; for this repository it is `https://saahdavid.github.io/stat2331/`.

### Command line

For a new checkout from the zip:

```sh
git init -b main
git add .
git commit -m "Build STAT 2331 student learning platform"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

If this checkout already has its Git remote, use `git add .`, commit, and `git push`. Enable Pages using the browser steps above. Links are relative, so hosting under a repository path works. Future pushes update the published site.

GitHub documentation: [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Edit notes and add questions

```text
src/module-N.html               Editable module content fragments
src/tables.html                 Reference-page content
scripts/build.mjs              Shared page shell and static page generator
assets/css/style.css           Themes, typography, graph-paper design, responsive rules
assets/js/stats.js              Numerical core and arithmetic parser
assets/js/questions/shared.js   Question helpers and course metadata
assets/js/questions/module-N.js Eight skill generators per module
assets/js/practice.js           Input, feedback, mastery, mixed sets
assets/js/labs/engine.js        Shared controls, animation loop, SVG helpers
assets/js/labs/module-N.js      Module-specific simulation logic
assets/js/tables.js             Normal/t lookup helpers
tests/                         Numerical, generator, and browser checks
```

1. Edit the appropriate `src/module-N.html` fragment. Use a section with `<h2 id="unique-id">Heading</h2>`; the sidebar TOC is generated from those headings.
2. Put TeX in `<span class="math">...</span>` and display formulas inside `<div class="formula">...</div>`. KaTeX is loaded from a CDN. Use HTML entities such as `&lt;` for comparison signs in HTML source.
3. Rebuild the checked-in pages with **`node scripts/build.mjs`** (or `npm run build`). This uses only Node built-ins; no dependency installation is needed. Rebuilding is only an authoring convenience, not a student runtime requirement.
4. Review locally with `python3 -m http.server 2331 --bind 127.0.0.1`, then visit `http://127.0.0.1:2331`.
5. Commit the fragments **and** regenerated HTML.

To add a skill, append `skill('stable-id','Title',()=>question)` to that module’s generator array. A numerical question needs `prompt`, numeric `answer`, HTML `solution`, `ti`, `excel`, `mistakes`, and `tolerance`. Use `Course.Q.num` to build one. Optional `alternates` accepts additional valid numerical answers; `picture` adds a normal shading or tree illustration. Use `Course.Q.choice` for a unique set of categorical choices containing the correct answer. Keep IDs stable so saved mastery survives edits. If changing the total number of skills, update the home-page total in `assets/js/app.js` and the tests’ eight-skills expectations.

To add a lab, register it in `Course.labs` in its module file. Provide parameters, a sample generator, SVG draw function, theoretical explanation, and optional condition warning. Add `<div data-lab="your-id"></div>` beside the relevant notes and an entry in the build script’s Labs list.

## Run the checks

Basic generator and core checks need Node only:

```sh
node scripts/build.mjs
node tests/core.cjs
```

The core test generates 500 questions per skill (32,000 total), checks finite answers and valid unique choices, and exercises quartiles, table conventions, and safe input parsing.

For SciPy cross-checks:

```sh
python3 -m pip install scipy
python3 tests/crosscheck.py
```

This compares all distinct normal-table entries, all t critical-value cells, inverse/CDF functions, and binomial cases. `STAT2331_NODE` can point to a particular Node executable.

For real browser checks:

```sh
npm install
npx playwright install chromium
python3 -m http.server 2331 --bind 127.0.0.1
# In another terminal:
STAT2331_BROWSER=chromium node tests/browser.mjs
```

Without `STAT2331_BROWSER=chromium`, the test uses installed Google Chrome. `STAT2331_URL` overrides the local test URL. The browser suite loads all 12 pages, checks rendered math and console errors, generates another 300 questions per skill in-browser, answers each skill correctly and incorrectly, verifies persistence/mixed retries, presses every lab control, tests lookup helpers, and takes desktop/mobile light/dark screenshots in ignored `test-results/`.

Only KaTeX and Google Fonts load from external CDNs; the course logic, charts, and data are in the repository. If the math CDN is blocked, formulas remain readable as TeX and the exercises still operate, but typeset math needs that network resource. The site makes no analytics requests or student-data submissions.
