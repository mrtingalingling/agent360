# NovaSmart AgentOps: Enterprise AI Workforce Observability & FinOps Governance

An enterprise-grade **Agent Operations, Observability, and Governance Platform** built for AI Platform & Security leaders managing multi-agent fleets on Google Cloud.

Treating AI agents as digital employees, NovaSmart AgentOps unifies **operational speed, work quality, economic ROI, microsecond token latency, and strict GCP IAM/FinOps governance** into a single cohesive, high-performance platform.

---

## 🌟 Key Platform Capabilities

### 1. Multi-Metric Story Lens Timeline (`PersistentTTRTimeline.svelte`)
- **Executive Pulse Monitoring**: Real-time fleet timeline powered by `d3-shape` monotone cubic splines (`curveMonotoneX`) with a 3-way lens switcher:
  - **Velocity Pulse (`Speed (s)`)**: Real-time Time-to-Result latency with a 1.50s Enterprise SLA Benchmark line and Cartesian grid.
  - **Quality Pulse (`Quality (FTR %)`)**: Fleet First-Time Right accuracy tracking with a 90% SLA Target.
  - **Economic Pulse (`Value ($/m)`)**: Real-time gross business value generation ($/min) across all active agents.
- **View Modes & Density**: Seamlessly switch between Stacked Spline Layers, Horizon Multi-Lanes (with per-agent sparklines), and Overlay Line Views.
- **Quick Context Footer**: Color-coded agent status strip showing high-velocity agents, agents under supervisory coaching, and sample window metrics.

### 2. Digital Workforce ROI & Scorecard (`WorkforceScorecardView.svelte`)
- **Autonomous Digital Workforce KPIs**:
  - **Net Economic Value Delivered**: $3.09M net delivered (7,703x ROI against $401.57 compute cost).
  - **Operational Hours Delivered**: 39,486 hours automated (95.6% autonomous resolution index).
  - **Work Quality Index**: 88.9% clean first-pass completion (First-Time Right).
  - **Unit Economics**: $0.0039 per task (< $0.01 compute efficiency).
- **Digital Employee Roster & Annual Review Board**:
  - Per-agent competency ratings, throughput & speedup multipliers, work quality (FTR %), escalation rates, and net economic value.
- **Interactive Wage & Scaling Simulator**:
  - Dynamically model enterprise savings across operational wage benchmarks ($30/hr to $150/hr) and workload adoption multipliers (0.5x to 5.0x), projecting annualized net impact and autonomous scaling capacity (+61.7x FTEs).
- **Executive Coaching Dossier**:
  - Managerial review, competency breakdowns (SKU grounding, latency, margin compliance), supervisor escalation triggers, and model promotion/downgrade readiness.

### 3. Token Lineage & D3 Sankey Architecture (`SankeyDiagram.svelte`)
- **Fleet Mission Control Token Flow**: Visualizes token lineage from Ingress Gateways (Web Storefront, Mobile Client, Enterprise B2B/A2A) $\to$ Agents $\to$ Token Breakdown (Input, Output, Gemini Context Cache, Reasoning) $\to$ Resolution Outcomes.
- **Outcome Classification**: Clean Success (74.8%), Reprompt Loop Resolved (15.5%), Hallucination Intercepted (5.8%), Policy Guardrail Refusal (3.9%).
- **Bidirectional Highlighting**: Hover any node or flow ribbon to isolate upstream ingress sources and downstream token consumption.

### 4. Universal Charting Engine & Overview Analytics (`SvgBarChart.svelte` & `OverviewView.svelte`)
- **1-to-1 Visual Fidelity**: Custom SVG charting engine matching enterprise Recharts aesthetic with zero third-party charting bloat:
  - **Token Type Breakdown by Agent**: Stacked multi-segment bars (Input, Output, Cached, Reasoning) with formatted axes and bottom legends.
  - **Error Rate Matrix**: Grouped comparative bars isolating Factual Hallucination % against Reprompt Loop Frequency with action threshold indicators.
  - **Economic Value Delivered**: Per-agent colored bar charts scaled in thousands of dollars ($k).
  - **Interactive Dark-Glass Tooltips**: Semi-transparent backdrop-blur hover inspect cards with precise unit metrics.

### 5. Sequential Gantt Waterfall & FinOps Engine (`TokenWaterfallTrace.svelte`)
- **Micro-Latency Decomposition**:
  - Breaks down each agent turn into 4 sequential phases:
    1. **Client Prep Latency** ($t_{\text{prep}}$): Local agent runtime orchestration overhead.
    2. **TTFT Server Prefill Latency** ($t_{\text{TTFT}}$): Time-to-first-token Gemini context ingestion.
    3. **Thinking / Reasoning Duration** ($t_{\text{think}}$): Gemini 2.0 Flash Thinking token generation.
    4. **Streaming Output Duration** ($t_{\text{stream}}$): Final response streaming duration.
- **1M Context Window Saturation Gauge**: Visualizes token accumulation against Gemini's 1,048,576 token limit.
- **Gemini Prompt Cache FinOps Calculator**: Quantifies exact dollar savings from Gemini's 75% prompt cache discount ($0.1125 / M tokens saved).

### 6. Live Google Cloud Console Integration (`server/cloudServer.js`)
- Directly connected to active Google Cloud project (`qwiklabs-gcp-02-26c698bb5fef`):
  - **Cloud Run Services**: Live inspection of active containerized agents (`promo-agent-shadow`, `novasmart-mcp`, `novasmart-store-portal`).
  - **Agent Registry**: Integration with Google Cloud Agent Registry in `us-central1`.
  - **BigQuery Datasets**: Maps enterprise tables (`competitor_data`, `customer_data`, `novasmart_pricing`).
  - **Cloud Logging**: Real-time stdout/stderr log stream streaming from Cloud Run into the Agent Coaching Studio.

### 7. Agent IAM & FinOps Governance Console (`AgentIAMControls.svelte`)
- **GCP Service Account & Identity Separation**:
  - Maps each agent to dedicated least-privilege GCP Service Accounts (`promo-agent-sa@...`).
  - Flags shared credential risks (`novasmart-customer-sa`) with 1-click **Auto-Remediate to Dedicated SA**.
  - Departmental cost center attribution (`Marketing Operations CC-7402`, `Retail Pricing CC-3105`) for audit non-repudiation and chargebacks.
- **BigQuery Query Scan Caps (`maximum_bytes_billed`)**:
  - Configurable scan cap slider (1 GB to 50 GB) with live dollar ceilings ($0.0625/10GB) preventing runaway scan bills ($62.50+).
  - Dataset IAM role toggles (`roles/bigquery.dataViewer` vs `roles/bigquery.dataEditor`).
- **Cloud Run Ingress & Model Armor Gateway Boundaries**:
  - Ingress enforcement (`roles/run.invoker`) blocking unauthorized upstream callers.
  - Model Armor / Agent Gateway pre-screening to stop adversarial prompt injection and token burn loops.
  - Container scaling limits (max instances cap) to bound monthly compute expenses.
- **Token Spending Ceilings & Circuit Breaker**:
  - Monthly spending ceiling sliders ($25 to $500/mo) and hard-stop circuit breakers at configurable capacity thresholds.
- **1-Click Sync**:
  - "Apply & Sync IAM Policy to Google Cloud" with automated audit trail logging (`iam.serviceAccounts.setIamPolicy`).

---

## ⚡ Performance & Lightweight Architecture

| Metric | React 18 (Legacy) | Svelte 5 (Current) | Improvement |
|---|---|---|---|
| **JavaScript Bundle (Raw)** | 797.46 kB | **327.57 kB** | **−58.9% payload reduction** |
| **JavaScript (Gzip Transfer)** | 208.99 kB | **91.18 kB** | **−56.4% transfer size** |
| **Total Production Assets** | 842.67 kB | **372.77 kB** | **−55.8% overall weight** |
| **JS Heap Memory** | 8.75 MB | **4.22 MB** | **−51.8% memory footprint** |
| **DOM Tree Complexity** | 1,448 nodes | **1,230 nodes** | **−15.1% DOM nodes** |
| **Vite Chunk Budget** | ⚠️ Over 500 kB limit |  Clean compile (327 kB) | Zero build warnings |
| **Vulnerabilities (`npm audit`)** | 2 vulnerabilities | **0 vulnerabilities** | Clean supply chain |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node v20 & v24)
- **Google Cloud SDK (`gcloud`)**: Configured with Application Default Credentials (ADC) for live cloud features.

### Installation

```bash
cd dashboard
npm install
```

### Running Locally

1. **Start the Google Cloud Proxy Backend**:
```bash
node server/cloudServer.js
# Running on http://localhost:5174
```

2. **Start the Vite Dev Server**:
```bash
npm run dev
# Dashboard accessible at http://localhost:5173/
```

### Automated Testing

Run the Vitest truth-table regression suite:

```bash
npm test
# 10/10 unit tests covering state transitions, tab navigation, FinOps calculations, and IAM remediation
```

### Production Build

```bash
npm run build
# Compiles optimized Svelte 5 production bundle into dist/ (327 kB)
```

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: Svelte 5, Fine-Grained Runes (`$state`, `$derived.by`), Vite 5, Tailwind CSS, `@lucide/svelte`, `d3-shape`, `d3-sankey`.
- **Backend / Proxy**: Node.js, Express, Google Cloud Logging API, Cloud Run API, BigQuery API.
- **Testing**: Vitest (`tests/dashboardState.test.js`).
- **Governance**: Google Cloud IAM, Model Armor, Agent Gateway, OpenTelemetry Tracing.
