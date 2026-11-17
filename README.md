# Rajasthan Royals — IPL 2027 Auction Intelligence Dashboard

A data-driven scouting dashboard for evaluating IPL batting and bowling performances under pressure and translating those findings into conditional Rajasthan Royals auction priorities.

The application is designed as an **analysis and decision-support tool**, not an auction price predictor or an automated player-selection system. It brings validated player-level metrics, reliability diagnostics, squad context, shortlist decisions, and methodology into one navigable interface.

> **Important:** The dashboard reflects the data and project files bundled with this release. The squad directory is a 2026 reference, not an IPL 2027 retention list. Player availability, auction registration, nationality/domestic status, purse, and prices must be verified independently before any real auction decision.

---

## Contents

- [What the dashboard does](#what-the-dashboard-does)
- [Dashboard sections](#dashboard-sections)
- [How the analysis works](#how-the-analysis-works)
- [Data included](#data-included)
- [Technology stack](#technology-stack)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Data contract](#data-contract)
- [Refreshing the data](#refreshing-the-data)
- [Interpretation and limitations](#interpretation-and-limitations)
- [Development notes](#development-notes)

## What the dashboard does

The central question is not simply whether a player has a high career strike rate or has taken many wickets. It is whether that player performs better in defined high-pressure situations than in their own non-pressure baseline, after accounting for match context and uncertainty.

The dashboard helps analysts:

- Explore eligible IPL and T20I batting and bowling records.
- Compare pressure performance with a player's own baseline.
- Inspect the Pressure Performance Index (PPI), reliability score, sample size and bootstrap interval together.
- Identify players whose pressure results are supported by repeatable evidence versus players whose estimates are still uncertain.
- Review the auction shortlist, watchlist, role requirements and conditional auction scenarios.
- Understand the methodology, validation checks, data coverage and source limitations behind each recommendation.

The frontend **does not calculate the underlying player indexes**. It reads a precomputed JSON bundle exported by the analysis pipeline and presents those results.

## Dashboard sections

| Route | Section | Purpose |
|---|---|---|
| `/` | Overview | Executive summary, leading targets, discoveries, squad requirements, and dataset coverage. |
| `/explorer` | Explorer | Search and filter player records, open an individual player report. |
| `/pressure` | Pressure | Examine the distribution of pressure indexes and reliability, including interval-based views. |
| `/compare` | Compare | Compare players within the same role and format using pressure, reliability, and sample-size measures. |
| `/war-room` | War room | Review auction priorities, role-based scenarios, batting-order sensitivity, watchlist and 2026 squad directory. |
| `/reports` | Reports | Browse player scouting reports and their evidence, strengths, limitations and Royals fit. |
| `/reports/:group/:role/:id` | Player report | Inspect an individual player's record, pressure metrics, reliability, interval and auction note. |
| `/method` | Method | Read the metric definitions, pressure clauses, validation results, sources and known limitations. |

All sections use the same loaded data bundle so that the overview, explorer, comparison tools and reports remain consistent with one another.

## How the analysis works

### 1. Pressure-state identification

A delivery is marked as a pressure delivery when the match state at the **start of the ball** satisfies at least one of the following clauses:

- **Clause A — Hard chase:** Second innings, at least 12 balls remaining, required run rate of at least 10, and at least three wickets down.
- **Clause B — Late chase:** Second innings, fewer than 24 balls remaining, required run rate of at least 8, and runs are still required.
- **Clause C — Collapse:** Within the last five scheduled overs, with at least seven wickets already down.

These clauses are the project's pressure definition. Death overs, a low total, or the eventual result/margin are not interchangeable with the pressure flag.

### 2. Context-adjusted player baseline

The analysis accounts for match context such as:

- Competition format (IPL or T20I).
- Innings phase.
- Batting/bowling type.
- Opponent-strength band.

A player's pressure performance is evaluated against their own performance in other balls, rather than being treated as a raw career-rate leaderboard. For bowlers, the sign is oriented so that conceding fewer runs under pressure is positive.

### 3. Shrinkage and Pressure Performance Index

The pressure-versus-baseline gap is shrunk towards zero to reduce the influence of noisy estimates. The dashboard reports the resulting Pressure Performance Index:

```text
PPI = 50 + 50 × tanh(shrunk_gap / scale)
```

The scales used by the exported analysis are:

- Batting: 20 strike-rate points.
- Bowling: 1.0 economy run.

Interpretation:

- **50:** no estimated difference from the player's other balls.
- **Above 50:** better performance under the defined pressure states.
- **Below 50:** worse performance under the defined pressure states.

PPI is a within-format ranking measure. It should not be interpreted as a probability, a projected fantasy score, or a direct forecast of future performance.

### 4. Eligibility floor and uncertainty

The analysis applies a minimum evidence floor of:

- 60 pressure balls.
- 60 baseline balls.

The project also applies its innings eligibility requirement. Players who do not clear the decision floor can still appear in exploratory data, but should not be treated as equivalent to eligible players.

The player report includes a match-bootstrap interval for the raw gap. An interval that crosses zero means the direction of the estimated pressure effect is not clearly separated from zero within that interval.

### 5. Reliability is a separate measure

Reliability is a 0–100 score, separate from PPI. Its components are weighted as follows:

| Component | Weight |
|---|---:|
| Sample size | 30% |
| Bootstrap uncertainty | 25% |
| Season-to-season signs | 20% |
| Match-to-match consistency | 15% |
| Recency (share of pressure balls in 2025–26) | 10% |

A high PPI with weak reliability or a wide interval should be treated cautiously. Reliability is not the standard deviation and should not be used as a replacement for inspecting the underlying evidence.

## Data included

The bundled export reports the following coverage:

| Dataset measure | Value |
|---|---:|
| Trusted primary analysis balls | 198,340 |
| Pressure balls | 34,689 |
| Primary deliveries in the source set | 199,208 |
| Hard-chase clause A balls | 24,248 |
| Late-chase clause B balls | 10,255 |
| Collapse clause C balls | 10,833 |
| Eligible IPL batters | 59 |
| Eligible IPL bowlers | 86 |
| Player rows in exported bundle | 1,745 |
| Players in 2026 squad directory | 25 |

The JSON bundle also contains the shortlist, watchlist, scenarios, squad directory, source register, sensitivity summaries, and player-level metrics.

## Technology stack

- **React 19** — component-based user interface.
- **TypeScript 5** — typed application code and data contracts.
- **Vite 6** — development server and production bundler.
- **React Router 7** — client-side navigation.
- **Tailwind CSS 4** — utility-first styling through the Vite plugin.
- **Recharts 2** — analytical charts and visual comparisons.

## Getting started

### Prerequisites

- Node.js (use a current LTS release).
- npm, included with Node.js.

### Install dependencies

```bash
cd dashboard
npm install
```

### Start the development server

```bash
npm run dev
```

Vite normally serves the application at:

```text
http://localhost:5173
```

Open the local URL printed in the terminal. The application fetches its data from `/data/bundle.json` when it loads.

### Create and preview a production build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`. The preview server normally runs at:

```text
http://localhost:4173
```

The build command runs the TypeScript compiler in no-emit mode before creating the Vite production bundle.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server on port `5173`. |
| `npm run build` | Type-checks with `tsc --noEmit`, then creates the production build. |
| `npm run preview` | Serves the production build locally on port `4173`. |

There is no test or lint script defined in the current `package.json`.

## Refreshing the data

The original project README documents the export command as:

```bash
python3 analysis/export/export_dashboard.py
```

That command is expected to run from the **analysis workspace root**, after the analytical tables have been generated. It writes the dashboard bundle to:

```text
 dashboard/public/data/bundle.json
```

**Repository boundary:** the supplied dashboard ZIP contains the frontend and an exported bundle, but does not include the `analysis/` workspace or `analysis/export/export_dashboard.py`. The export command therefore cannot be run from this dashboard-only package unless the corresponding analysis workspace is available. Treat the bundled JSON as the supplied snapshot until the full analysis project is connected.

## Interpretation and limitations

The dashboard is intended to make evidence easier to inspect, not to remove uncertainty. Keep the following constraints in mind:

- **The 2027 auction pool is not confirmed by this dataset.** A player appearing in the analysis is not proof that they registered for the auction or will be available to RR.
- **The squad directory is from 2026.** It must not be described as a 2027 retention list.
- **No auction purse or player prices are included.** The dashboard cannot produce a defensible bid ceiling or budget allocation.
- **Nationality/domestic status is not present in the ball-level source file.** Do not infer an Indian/domestic-player quota classification from a player's name or team history.
- **No domestic tournament deliveries were added.** The analysis does not include SMAT or other domestic competition ball-by-ball data.
- **Bowling holdout stability is weak in this release.** The exported validation reports 49% sign agreement and a Spearman rank correlation of approximately 0.11 for the bowling holdout. Bowling rankings should not be used as a standalone bid order.
- **Batting validation is stronger, but not predictive certainty.** The batting holdout reports approximately 81% sign agreement and 0.32 rank correlation. These are stability checks, not a forecast-accuracy guarantee.
- **Death-over performance is a separate slice.** It is not the same as the pressure-state definition and should be evaluated independently when recruiting a death specialist.
- **Small samples remain small.** A high point estimate does not compensate for a thin pressure-ball sample or a confidence interval that crosses zero.

Before making an auction decision, cross-check the latest official retention list, auction registration list, player availability, role classification, overseas slots, team composition, and purse information.

## Development notes

- Pages are loaded with `React.lazy` and rendered inside a shared `Suspense` boundary.
- `DataProvider` fetches the bundle once and shares the result through React context.
- `AbortController` cancels the fetch if the provider unmounts before the request completes.
- `BrowserRouter` is used for client-side routing. Production hosting must be configured to serve `index.html` for application routes such as `/explorer` and `/reports/...` (SPA fallback), while keeping `/data/bundle.json` accessible as a static asset.
- The UI theme is defined in `src/index.css` and uses the project's navy, pink and gold palette.
- The current project has no automated test suite or lint command configured.

---

## Disclaimer

This project is an analytical scouting aid built from the included research outputs. It is not affiliated with, endorsed by, or an official publication of the Rajasthan Royals or the Indian Premier League. All auction recommendations are conditional on current squad composition, official player availability, rules and updated evidence.