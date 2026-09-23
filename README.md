# NovaSmart AgentOps: Enterprise AI Workforce Observability & FinOps Governance (RippleJS Edition)

An enterprise-grade **Agent Operations, Observability, and Governance Platform** built for AI Platform & Security leaders managing multi-agent fleets on Google Cloud, re-engineered in **Ripple (Ripple-TS / TSRX)** with 1-to-1 visual, structural, and behavioral parity with the React, Svelte 5, and SolidJS editions.

Treating AI agents as digital employees, NovaSmart AgentOps unifies **operational speed, work quality, economic ROI, microsecond token latency, and strict GCP IAM/FinOps governance** into a single cohesive narrative.

---

## 🌟 Key Platform Capabilities

### 1. Multi-Metric Story Lens Timeline (`PersistentTTRTimeline.tsrx`)
- **Executive Pulse Monitoring**: Real-time fleet timeline with a 3-way lens switcher:
  - **Velocity Pulse (`Speed (s)`)**: Real-time Time-to-Result latency with a 1.50s Enterprise SLA Benchmark.
  - **Quality Pulse (`Quality (FTR %)`)**: Fleet First-Time Right accuracy tracking with a 90% SLA Target.
  - **Economic Pulse (`Value ($/m)`)**: Real-time gross business value generation ($/min) across all active agents.
- **View Density Controls**: Seamlessly switch between Stacked Gradient Bands, Horizon Multi-Lanes, and Overlay views with Comfort or Compressed vertical footprints.
- **Native D3 Spline Math**: Direct SVG cubic spline paths generated via `d3-shape` (`curveMonotoneX`) and reactive track primitives.

### 2. Digital Workforce P&L & Autonomous Scaling Modeler (`OverviewView.tsrx` & `WorkforceScorecardView.tsrx`)
- **Agents as Digital Employees**:
  - Net Economic Value Delivered ($3.09M net, 7,700x+ ROI against $401.57 compute cost).
  - Operational Hours Automated (39,400+ hours saved, 61.7 FTEs added).
  - Autonomous Resolution (95.6%) and First-Time Right (88.9%) quality ratings.
  - Unit Economics ($0.0039 per task compute cost).
- **Interactive Enterprise Scale & Adoption Modeler**:
  - Dynamically model enterprise net savings across adoption scale (0.5x to 5.0x) with real-time annualized corporate profit forecasting ($32.38M net profit).

### 3. Token Lineage & Flow Architecture (`SankeyDiagram.tsrx`)
- Complete visual token flow: Traffic Ingress $\to$ Agent Estate $\to$ Token Types (Input, Output, Gemini Prompt Cache, Reasoning) $\to$ Operational Outcomes.
- Tracks reasoning token density (Gemini 2.0 Flash Thinking) and error vectors (hallucination vs reprompt loops) rendered via `d3-sankey` with dynamic SVG gradient flows.

### 4. Sequential Gantt Waterfall & FinOps Engine (`TokenWaterfallTrace.tsrx`)
- **Micro-Latency Decomposition**:
  - Breaks down each agent turn into 4 sequential phases:
    1. **Client Prep Latency** ($t_{\text{prep}}$): Local agent runtime orchestration overhead.
    2. **TTFT Server Prefill Latency** ($t_{\text{TTFT}}$): Time-to-first-token Gemini context ingestion.
    3. **Thinking / Reasoning Duration** ($t_{\text{think}}$): Gemini 2.0 Flash Thinking token generation.
    4. **Streaming Output Duration** ($t_{\text{stream}}$): Final response streaming duration.
- **1M Context Window Saturation Gauge**: Visualizes token accumulation against Gemini's 1,048,576 token limit.
- **Gemini Prompt Cache FinOps Calculator**: Quantifies exact dollar savings from Gemini's 75% prompt cache discount ($0.1125 / M tokens saved).

### 5. Live Google Cloud Console Integration (`server/cloudServer.js`)
- Directly connected to active Google Cloud project (`qwiklabs-gcp-02-26c698bb5fef`):
  - **Cloud Run Services**: Live inspection of active containerized agents (`promo-agent-shadow`, `novasmart-mcp`, `novasmart-store-portal`).
  - **Agent Registry**: Integration with Google Cloud Agent Registry in `us-central1`.
  - **BigQuery Datasets**: Maps enterprise tables (`competitor_data`, `customer_data`, `novasmart_pricing`).
  - **Cloud Logging**: Real-time stdout/stderr log stream streaming from Cloud Run into the Agent Coaching Studio.

### 6. Agent IAM & FinOps Governance Console (`AgentIAMControls.tsrx`)
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

## 🏗️ Architecture & Tech Stack

- **Framework**: Ripple (`ripple` ^0.1.2 + `@tsrx/core` ^0.1.2) with `@ripple-ts/vite-plugin`.
- **Language**: TypeScript (`.tsrx` and `.ts`).
- **State Management**: Fine-grained reactive signals (`track`) with zero-overhead proxy accessors.
- **Visualizations**: Direct SVG rendering powered by D3 primitives (`d3-shape`, `d3-sankey`, `d3-array`).
- **Styling**: Tailwind CSS with dark glassmorphism design system.
- **Backend / Cloud Proxy**: Node.js, Express, Google Cloud Logging API, Cloud Run API, BigQuery API.
- **Testing**: Vitest with comprehensive 10-row Truth Table regression suite.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
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

### Running Tests

```bash
npm test
# Runs 10/10 Vitest regression test suite verifying state mutations and fallbacks
```

### Production Build

```bash
npm run build
# Compiles Ripple TSRX templates into optimized production bundle in dist/
```
