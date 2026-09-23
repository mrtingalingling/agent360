# Repository Edit Log

This file records discrete functional changes made to the repository. Each future change appends an entry here following the established format.

## 2026-09-22T20:41:30Z — refactor/svelte-5
**What changed:** Replaced React 18 dashboard framework with Svelte 5 (`svelte@^5.57.1`, `@sveltejs/vite-plugin-svelte`, `@lucide/svelte`). Ported state store to reactive Svelte 5 runes (`$state`, `$derived.by`). Ported all 8 view and layout components (`Header.svelte`, `PersistentTTRTimeline.svelte`, `SankeyDiagram.svelte`, `OverviewView.svelte`, `WorkforceScorecardView.svelte`, `AgentIAMControls.svelte`, `TokenWaterfallTrace.svelte`, `AgentFineTuneView.svelte`, `AgentDetailView.svelte`, `App.svelte`). Switched charting from Recharts to high-performance native SVG elements and D3 Sankey. Added Vitest unit test suite covering 10 truth-table interaction rows. Removed legacy React dependencies and JSX files.
**Why:** User request to replace React with the Svelte 5 framework in a new branch adhering to the `reviewable-diffs` protocol.
**Files touched:**
- `dashboard/package.json`
- `dashboard/package-lock.json`
- `dashboard/vite.config.js`
- `dashboard/index.html`
- `dashboard/src/main.js`
- `dashboard/src/App.svelte`
- `dashboard/src/state/dashboardState.svelte.js`
- `dashboard/src/components/layout/Header.svelte`
- `dashboard/src/components/timeline/PersistentTTRTimeline.svelte`
- `dashboard/src/components/overview/SankeyDiagram.svelte`
- `dashboard/src/components/overview/OverviewView.svelte`
- `dashboard/src/components/workforce/WorkforceScorecardView.svelte`
- `dashboard/src/components/iam/AgentIAMControls.svelte`
- `dashboard/src/components/telemetry/TokenWaterfallTrace.svelte`
- `dashboard/src/components/finetune/AgentFineTuneView.svelte`
- `dashboard/src/components/detail/AgentDetailView.svelte`
- `dashboard/tests/dashboardState.test.js`
- `REPO_EDIT_LOG.md`
- Deleted: `dashboard/src/App.jsx`, `dashboard/src/main.jsx`, `dashboard/src/context/DashboardContext.jsx`, `dashboard/src/components/layout/Header.jsx`, `dashboard/src/components/timeline/PersistentTTRTimeline.jsx`, `dashboard/src/components/overview/SankeyDiagram.jsx`, `dashboard/src/components/overview/OverviewView.jsx`, `dashboard/src/components/workforce/WorkforceScorecardView.jsx`, `dashboard/src/components/iam/AgentIAMControls.jsx`, `dashboard/src/components/telemetry/TokenWaterfallTrace.jsx`, `dashboard/src/components/finetune/AgentFineTuneView.jsx`, `dashboard/src/components/detail/AgentDetailView.jsx`
**Tests added:** 10 unit tests in `dashboard/tests/dashboardState.test.js` covering all truth table rows (10/10 passed).
**Deliberately not changed:**
- `server/cloudServer.js` (Express backend serving live Google Cloud ADC and BigQuery telemetry left untouched).
- CSS classes and Tailwind design system in `dashboard/src/index.css` preserved exactly.
- Mock telemetry data fixtures in `dashboard/src/data/mockData.js` preserved exactly.
**Uncertainties:** none

## 2026-09-22T21:22:00Z — refactor/svelte-5
**What changed:** Dropped "& Sankey" from tab name ("Fleet Mission Control"). Removed all human comparison text and benchmark metrics from the Digital Workforce tab (`WorkforceScorecardView.svelte`), including human labor liberated metric, human cost strikethrough, human escalation table headers/cells, simulator human wage and FTE analyst comparison, and dossier human escalation triggers.
**Why:** User request: "on both branches, remove the parts that compare with human on the workforce tab, and drop the word sankey on the tab name".
**Files touched:**
- `dashboard/src/components/layout/Header.svelte`
- `dashboard/src/components/workforce/WorkforceScorecardView.svelte`
- `REPO_EDIT_LOG.md`
**Tests:** 10/10 Vitest tests passed (`npm test`). Build succeeded with 0 errors (`npm run build`).
## 2026-09-23T01:14:00Z — refactor/svelte-5
**What changed:** Re-engineered charting across Svelte 5 dashboard to achieve 1-to-1 visual fidelity with the original React Recharts aesthetic.
1. `PersistentTTRTimeline.svelte`: Upgraded SVG rendering to use `d3-shape` cubic monotone spline interpolation (`curveMonotoneX`) and `stack()`. Re-introduced horizontal Cartesian grid lines (`strokeDasharray="3 3" stroke="#1e293b"`), Y-axis unit ticks and labels, bottom baseline with X-axis time labels, SLA benchmark dashed reference line (`#f59e0b`), interactive crosshair cursor line, and bottom context footer strip (`24 samples • Story Lens`).
2. `SvgBarChart.svelte`: Created reusable component reproducing Recharts `<BarChart>` styling, including horizontal Cartesian grid, formatted Y-axis ticks, X-axis labels, interactive dark-glass hover tooltip, bottom legend badges, and support for both grouped and stacked bars with rounded top corners.
3. `OverviewView.svelte`: Replaced flexbox bar placeholders with `SvgBarChart` for "Token Type Breakdown by Agent" (stacked 4-token types) and "Error Rate Matrix" (grouped hallucination vs. reprompting).
4. `WorkforceScorecardView.svelte`: Replaced flexbox bar placeholders with `SvgBarChart` for "Economic Value Delivered by Agent ($ Thousands)" with per-agent color accents.
5. `Header.svelte`: Aligned version badge text to `v2.4 GA` (matching React exactly).
**Why:** User request: "I like the look on the main version more, see if you can make the svelte version UI look 1-to-1 with react".
**Files touched:**
- `dashboard/src/components/common/SvgBarChart.svelte`
- `dashboard/src/components/layout/Header.svelte`
- `dashboard/src/components/timeline/PersistentTTRTimeline.svelte`
- `dashboard/src/components/overview/OverviewView.svelte`
- `dashboard/src/components/workforce/WorkforceScorecardView.svelte`
- `REPO_EDIT_LOG.md`
**Tests:** 10/10 Vitest tests passed (`npm test`). Build succeeded with 0 errors in 7.14s (`npm run build`). Dev server running and verified via CDP screenshots.
**Deliberately not changed:**
- State machine in `dashboardState.svelte.js` untouched.
- Unit test suite untouched.
**Uncertainties:** none


