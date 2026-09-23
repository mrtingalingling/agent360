# NovaSmart AgentOps: Enterprise AI Workforce Observability & FinOps Governance

An enterprise-grade **Agent Operations, Observability, and Governance Platform** built for AI Platform & Security leaders managing multi-agent fleets on Google Cloud.

Treating AI agents as digital employees, NovaSmart AgentOps unifies **operational speed, work quality, economic ROI, microsecond token latency, and strict GCP IAM/FinOps governance** into a single cohesive narrative.

---

## 🌟 Key Platform Capabilities

### 1. Multi-Metric Story Lens Timeline (`PersistentTTRTimeline.jsx`)
- **Executive Pulse Monitoring**: Real-time fleet timeline with a 3-way lens switcher:
  - **Velocity Pulse (`Speed (s)`)**: Real-time Time-to-Result latency with a 1.50s Enterprise SLA Benchmark.
  - **Quality Pulse (`Quality (FTR %)`)**: Fleet First-Time Right accuracy tracking with a 90% SLA Target.
  - **Economic Pulse (`Value ($/m)`)**: Real-time gross business value generation ($/min) across all active agents.
- **View Density Controls**: Seamlessly switch between Stacked Gradient Bands, Horizon Multi-Lanes, and Overlay views with Comfort or Compressed vertical footprints.

### 2. Digital Workforce P&L & Corporate Wage Simulator (`OverviewView.jsx` & `WorkforceScorecardView.jsx`)
- **Agents as Digital Employees**:
  - Net Economic Value Delivered ($3.09M net, 7,700x+ ROI against $401.57 compute cost).
  - Operational Capacity Added (39,400+ operational hours automated, +61.7 FTE capacity generated).
  - Autonomous Resolution (95.6%) and First-Time Right (88.9%) quality ratings.
  - Unit Economics ($0.0039 per task vs $29.07 target value benchmark).
- **Interactive What-If Wage Simulator**:
  - Dynamically model enterprise value added across operational wage benchmarks ($30/hr to $150/hr) and fleet adoption scale (0.5x to 5.0x).

### 3. Token Lineage & D3 Sankey Architecture (`SankeyDiagram.jsx`)
- Complete visual token flow: Ingress Gateways $\to$ Agents $\to$ Token Breakdown (Input, Output, Gemini Prompt Cache, Reasoning) $\to$ Resolution Outcomes.
- Tracks reasoning token density (Gemini 2.0 Flash Thinking) and error vectors (hallucination vs reprompt loops).

### 4. Sequential Gantt Waterfall & FinOps Engine (`TokenWaterfallTrace.jsx`)
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

### 6. Agent IAM & FinOps Governance Console (`AgentIAMControls.jsx`)
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

2. **Start the Vite Frontend**:
```bash
npm run dev
# Dashboard accessible at http://localhost:5173/
```

### Production Build

```bash
npm run build
# Outputs optimized production bundle into dist/
```

### Running Unit Tests

```bash
npm test
# Executes 10-row Truth Table regression suite with Vitest
```

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: SolidJS 1.9, Vite 5 (`vite-plugin-solid`), Tailwind CSS 3, Lucide Solid, D3 Shape, D3 Sankey, Vitest.
- **State Management**: Fine-grained reactive store (`createRoot`, `createSignal`, `createMemo`, `createStore`) with zero Virtual DOM overhead.
- **Backend / Proxy**: Node.js, Express, Google Cloud Logging API, Cloud Run API, BigQuery API.
- **Governance**: Google Cloud IAM, Model Armor, Agent Gateway, OpenTelemetry Tracing.

