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
**Deliberately not changed:**
- Architecture and state management of `dashboardState.svelte.js` untouched.
- Charting, overview, IAM, and fine-tune views untouched.
**Uncertainties:** none

