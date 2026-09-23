import { track } from 'ripple';
import { dashboardState } from '../../state/dashboardState.js';
import {
  ShieldIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  LockIcon,
  UnlockIcon,
  KeyRoundIcon,
  DatabaseIcon,
  DollarSignIcon,
  ServerIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  ZapIcon,
  CloudIcon
} from '../common/Icons.tsrx';

export function AgentIAMControls(props: { agent: any }) @{
  const cloudIAMData = () => dashboardState.cloudIAMData;
  const cloudOverview = () => dashboardState.cloudOverview;

  const isSaving = track(false);
  const saveSuccess = track(false);

  function getInitialForm() {
    const ag = props.agent;
    if (!ag) return {};
    const current = cloudIAMData()?.agents?.[ag.id];
    if (current) {
      return JSON.parse(JSON.stringify(current));
    }
    return {
      agentId: ag.id,
      agentName: ag.name,
      serviceAccount: `${ag.id}-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com`,
      identityType: ag.id === 'promo-shadow' ? 'shared' : 'dedicated',
      costCenter: 'General Operations (CC-1000)',
      roles: ['roles/run.invoker', 'roles/bigquery.dataViewer'],
      bigqueryQuota: {
        maxScanBytesPerQueryGB: 10,
        dailyCostBudgetUSD: 15.00,
        scope: 'read_only',
        allowedDatasets: ['novasmart_pricing'],
        autoCancelHeavyQueries: true
      },
      ingressControl: {
        policy: 'authorized_only',
        upstreamInvokers: ['novasmart-store-portal'],
        modelArmorScreening: true,
        maxInstances: 5,
        rateLimitReqPerSec: 25
      },
      finopsBudget: {
        monthlyCeilingUSD: 100.00,
        currentSpendUSD: 35.00,
        hardStopCircuitBreaker: true,
        tokenThrottleThresholdPct: 90
      },
      lastSyncedAt: new Date().toISOString()
    };
  }

  const formData = track<any>(getInitialForm());

  const projectId = () => cloudOverview()?.gcp?.projectId || 'qwiklabs-gcp-02-26c698bb5fef';
  const serviceAccountsList = () => cloudIAMData()?.gcpServiceAccounts || [
    { email: 'promo-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com', displayName: 'Promo agent (marketing-ops)' },
    { email: 'novasmart-customer-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com', displayName: 'NovaSmart Shared Customer SA (Shared - Legacy)' },
    { email: 'test-agent-caller@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com', displayName: 'Test Agent Caller SA' },
    { email: 'novasmart-deployer-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com', displayName: 'Serverless Deployer SA' },
    { email: 'antigravity-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com', displayName: 'Antigravity SA (Admin)' }
  ];

  const isShared = () =>
    formData.value.serviceAccount?.includes('customer-sa') ||
    formData.value.serviceAccount?.includes('shared') ||
    formData.value.identityType === 'shared';

  const budgetPct = () =>
    Math.min(100, Math.round(((formData.value.finopsBudget?.currentSpendUSD || 0) / (formData.value.finopsBudget?.monthlyCeilingUSD || 100)) * 100));

  async function handleSave() {
    isSaving.value = true;
    saveSuccess.value = false;
    try {
      const res = await dashboardState.updateAgentIAMConfig(props.agent.id, JSON.parse(JSON.stringify(formData.value)));
      if (res && res.success) {
        saveSuccess.value = true;
        setTimeout(() => { saveSuccess.value = false; }, 4000);
      }
    } finally {
      isSaving.value = false;
    }
  }

  function applyRemediationPreset() {
    const dedicatedSA = props.agent.id === 'promo-shadow'
      ? `promo-agent-sa@${projectId()}.iam.gserviceaccount.com`
      : `${props.agent.id}-dedicated-sa@${projectId()}.iam.gserviceaccount.com`;

    formData.value = {
      ...formData.value,
      serviceAccount: dedicatedSA,
      identityType: 'dedicated',
      roles: ['roles/run.invoker', 'roles/bigquery.dataViewer'],
      bigqueryQuota: {
        ...formData.value.bigqueryQuota,
        maxScanBytesPerQueryGB: 5,
        scope: 'read_only',
        autoCancelHeavyQueries: true
      },
      ingressControl: {
        ...formData.value.ingressControl,
        policy: 'authorized_only',
        modelArmorScreening: true,
        maxInstances: 5
      },
      finopsBudget: {
        ...formData.value.finopsBudget,
        hardStopCircuitBreaker: true,
        tokenThrottleThresholdPct: 85
      }
    };
  }

  <div class="space-y-6">
    {/* HEADER & IDENTITY SUMMARY CARD */}
    <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <ShieldIcon class="w-4 h-4 text-indigo-400" />
            </div>
            <h2 class="text-base font-bold text-white">
              Agent IAM Identity &amp; FinOps Governance
            </h2>
            @if (isShared()) {
              <span class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse">
                <ShieldAlertIcon class="w-3.5 h-3.5" />
                Shared Identity (Audit Contamination Risk)
              </span>
            } @else {
              <span class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <ShieldCheckIcon class="w-3.5 h-3.5" />
                Dedicated Identity (Least Privilege)
              </span>
            }
          </div>
          <p class="text-xs text-slate-400 mt-1">
            GCP Service Account, BigQuery scan caps, Cloud Run invocation barriers, and token spending ceilings for <span class="text-slate-200 font-semibold">{props.agent.name}</span>.
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (isShared()) {
            <button
              onClick={applyRemediationPreset}
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-xs"
            >
              <ZapIcon class="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-Remediate to Dedicated SA</span>
            </button>
          }

          <a
            href={`https://console.cloud.google.com/iam-admin/iam?project=${projectId()}`}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
          >
            <CloudIcon class="w-3.5 h-3.5 text-blue-400" />
            <span>GCP IAM Console</span>
            <ExternalLinkIcon class="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* IDENTITY WARNING OR SUCCESS BANNER */}
      @if (isShared()) {
        <div class="mt-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangleIcon class="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div class="text-xs text-rose-200 leading-relaxed">
            <span class="font-bold text-rose-100">Separation of Duties Alert:</span> This agent currently runs under the shared credential <code class="bg-rose-900/60 px-1 py-0.5 rounded font-mono text-[11px]">{formData.value.serviceAccount}</code>. In BigQuery data access logs, regulatory compliance cannot attribute specific queries or costs to this agent versus other workloads. Switch to a dedicated identity to enforce non-repudiation and department-level cost allocation.
          </div>
        </div>
      } @else {
        <div class="mt-4 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-200">
          <div class="flex items-center gap-2">
            <CheckCircle2Icon class="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Non-Repudiation Verified:</strong> Cloud Run invocations and BigQuery access are uniquely signed by <code class="bg-emerald-950/60 px-1 py-0.5 rounded font-mono text-[11px]">{formData.value.serviceAccount}</code>.
            </span>
          </div>
          <span class="text-[11px] font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/20">
            Audit Trail: OK
          </span>
        </div>
      }
    </div>

    {/* 4 CORE GOVERNANCE CONTROLS GRID */}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. SERVICE ACCOUNT & IDENTITY MAPPING */}
      <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <KeyRoundIcon class="w-4 h-4 text-indigo-400" />
            <h3 class="text-sm font-bold text-white">Google Cloud IAM Principal</h3>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
            M1 Least Privilege
          </span>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 font-medium mb-1">
              Attached GCP Service Account Email
            </label>
            <select
              value={formData.value.serviceAccount}
              onChange={(e: any) => {
                const val = e.target.value;
                const isDed = !val.includes('customer-sa') && !val.includes('shared');
                formData.value = {
                  ...formData.value,
                  serviceAccount: val,
                  identityType: isDed ? 'dedicated' : 'shared'
                };
              }}
              class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-brand-500"
            >
              @for (const sa of serviceAccountsList()) {
                <option value={sa.email}>{sa.displayName} ({sa.email})</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-slate-400 font-medium mb-1">Cost Center Allocation</label>
            <input
              type="text"
              value={formData.value.costCenter}
              onInput={(e: any) => {
                formData.value = { ...formData.value, costCenter: e.target.value };
              }}
              class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono"
            />
          </div>

          {/* Bound Roles */}
          <div>
            <label class="block text-slate-400 font-medium mb-1.5">Granted Cloud IAM Roles</label>
            <div class="flex flex-wrap gap-1.5">
              @for (const role of formData.value.roles || []) {
                <span class="px-2 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-[10px] text-slate-300">
                  {role}
                </span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* 2. BIGQUERY DATA SCAN & QUERY BUDGET */}
      <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <DatabaseIcon class="w-4 h-4 text-purple-400" />
            <h3 class="text-sm font-bold text-white">BigQuery Query FinOps Quota</h3>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
            M4 Data Guard
          </span>
        </div>

        <div class="space-y-4 text-xs">
          {/* Max Bytes Scanned Slider */}
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <span class="text-slate-300 font-medium">Max Data Scanned Per Query</span>
              <span class="font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
                {formData.value.bigqueryQuota.maxScanBytesPerQueryGB} GB (~${(formData.value.bigqueryQuota.maxScanBytesPerQueryGB * 0.00625).toFixed(4)})
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={formData.value.bigqueryQuota.maxScanBytesPerQueryGB}
              onInput={(e: any) => {
                formData.value = {
                  ...formData.value,
                  bigqueryQuota: {
                    ...formData.value.bigqueryQuota,
                    maxScanBytesPerQueryGB: Number(e.target.value)
                  }
                };
              }}
              class="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1 GB (Strict)</span>
              <span>10 GB (Recommended)</span>
              <span>50 GB (High Volume)</span>
            </div>
          </div>

          {/* Scope & Auto-Cancel Switches */}
          <div class="grid grid-cols-2 gap-3 pt-1">
            <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div class="font-semibold text-slate-200">Dataset IAM</div>
                <div class="text-[10px] text-slate-400">{formData.value.bigqueryQuota.scope === 'read_only' ? 'Read-Only (dataViewer)' : 'Read-Write (dataEditor)'}</div>
              </div>
              <button
                onClick={() => {
                  formData.value = {
                    ...formData.value,
                    bigqueryQuota: {
                      ...formData.value.bigqueryQuota,
                      scope: formData.value.bigqueryQuota.scope === 'read_only' ? 'read_write' : 'read_only'
                    }
                  };
                }}
                class={`px-2 py-1 rounded text-[11px] font-bold ${formData.value.bigqueryQuota.scope === 'read_only' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}
              >
                {formData.value.bigqueryQuota.scope === 'read_only' ? 'LOCKED' : 'EDIT'}
              </button>
            </div>

            <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div class="font-semibold text-slate-200">Auto-Cancel</div>
                <div class="text-[10px] text-slate-400">Cancel heavy queries</div>
              </div>
              <input
                type="checkbox"
                checked={formData.value.bigqueryQuota.autoCancelHeavyQueries}
                onChange={(e: any) => {
                  formData.value = {
                    ...formData.value,
                    bigqueryQuota: {
                      ...formData.value.bigqueryQuota,
                      autoCancelHeavyQueries: e.target.checked
                    }
                  };
                }}
                class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. CLOUD RUN INGRESS & MODEL ARMOR GATEWAY */}
      <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <ServerIcon class="w-4 h-4 text-emerald-400" />
            <h3 class="text-sm font-bold text-white">Cloud Run Ingress &amp; Model Armor</h3>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            M2 &amp; M3 Gateways
          </span>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <span class="block text-slate-300 font-medium mb-1.5">
              Service Invocation Ingress Boundary (`roles/run.invoker`)
            </span>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  formData.value = {
                    ...formData.value,
                    ingressControl: {
                      ...formData.value.ingressControl,
                      policy: 'authorized_only'
                    }
                  };
                }}
                class={`p-2.5 rounded-lg border text-left transition-all ${formData.value.ingressControl.policy === 'authorized_only' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <div class="flex items-center gap-1.5 font-bold">
                  <LockIcon class="w-3.5 h-3.5 text-emerald-400" />
                  <span>Authorized Callers</span>
                </div>
                <p class="text-[10px] text-slate-400 mt-0.5">
                  mTLS &amp; IAM signed (Blocks rogue callers)
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  formData.value = {
                    ...formData.value,
                    ingressControl: {
                      ...formData.value.ingressControl,
                      policy: 'public'
                    }
                  };
                }}
                class={`p-2.5 rounded-lg border text-left transition-all ${formData.value.ingressControl.policy === 'public' ? 'bg-rose-950/60 border-rose-500/50 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <div class="flex items-center gap-1.5 font-bold">
                  <UnlockIcon class="w-3.5 h-3.5 text-rose-400" />
                  <span>Public (allUsers)</span>
                </div>
                <p class="text-[10px] text-rose-300/80 mt-0.5">
                  Denial-of-Wallet &amp; flood risk
                </p>
              </button>
            </div>
          </div>

          {/* Model Armor Shield Toggle */}
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <ShieldCheckIcon class="w-4 h-4 text-brand-400" />
                <span class="font-bold text-white">Agent Gateway / Model Armor Shield</span>
              </div>
              <p class="text-[11px] text-slate-400">
                Pre-screens prompt injection before LLM ingestion. Prevents adversarial token burn loops.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.value.ingressControl.modelArmorScreening}
              onChange={(e: any) => {
                formData.value = {
                  ...formData.value,
                  ingressControl: {
                    ...formData.value.ingressControl,
                    modelArmorScreening: e.target.checked
                  }
                };
              }}
              class="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 accent-brand-500 cursor-pointer"
            />
          </div>

          {/* Max Instance Scaling Limit */}
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <span class="text-slate-300 font-medium">Cloud Run Max Instances Cap</span>
              <span class="font-mono font-bold text-slate-200">
                {formData.value.ingressControl.maxInstances} instances (max ~${(formData.value.ingressControl.maxInstances * 3.5).toFixed(1)}/mo)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={formData.value.ingressControl.maxInstances}
              onInput={(e: any) => {
                formData.value = {
                  ...formData.value,
                  ingressControl: {
                    ...formData.value.ingressControl,
                    maxInstances: Number(e.target.value)
                  }
                };
              }}
              class="w-full accent-brand-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. TOKEN SPENDING BUDGET & CIRCUIT BREAKER */}
      <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <DollarSignIcon class="w-4 h-4 text-amber-400" />
            <h3 class="text-sm font-bold text-white">Token Budget &amp; Hard-Stop Circuit Breaker</h3>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            FinOps Envelope
          </span>
        </div>

        <div class="space-y-4 text-xs">
          {/* Monthly Budget Slider */}
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <span class="text-slate-300 font-medium">Monthly Token Spending Ceiling</span>
              <span class="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                ${Number(formData.value.finopsBudget.monthlyCeilingUSD).toFixed(2)} / mo
              </span>
            </div>
            <input
              type="range"
              min="25"
              max="500"
              step="5"
              value={formData.value.finopsBudget.monthlyCeilingUSD}
              onInput={(e: any) => {
                formData.value = {
                  ...formData.value,
                  finopsBudget: {
                    ...formData.value.finopsBudget,
                    monthlyCeilingUSD: Number(e.target.value)
                  }
                };
              }}
              class="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Current Spend vs Ceiling Meter */}
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Current Monthly Consumption:</span>
              <div class="flex items-center gap-1.5">
                <span class="font-mono font-bold text-amber-400">
                  ${Number(formData.value.finopsBudget.currentSpendUSD).toFixed(2)}
                </span>
                <span class="text-slate-500">/ ${Number(formData.value.finopsBudget.monthlyCeilingUSD).toFixed(2)}</span>
                <span class="text-[11px] font-bold text-slate-300">({budgetPct()}%)</span>
              </div>
            </div>

            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                class={`h-full rounded-full transition-all ${budgetPct() > 85 ? 'bg-rose-500' : budgetPct() > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${budgetPct()}%` }}
              ></div>
            </div>
          </div>

          {/* Circuit Breaker Switch */}
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <div class="font-bold text-white flex items-center gap-1.5">
                <ZapIcon class="w-3.5 h-3.5 text-amber-400" />
                <span>Hard-Stop Circuit Breaker</span>
              </div>
              <p class="text-[10px] text-slate-400 mt-0.5">
                Halts agent execution if spend hits {formData.value.finopsBudget.tokenThrottleThresholdPct}% of budget.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.value.finopsBudget.hardStopCircuitBreaker}
              onChange={(e: any) => {
                formData.value = {
                  ...formData.value,
                  finopsBudget: {
                    ...formData.value.finopsBudget,
                    hardStopCircuitBreaker: e.target.checked
                  }
                };
              }}
              class="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>

    {/* FOOTER ACTIONS BAR */}
    <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <CloudIcon class="w-4 h-4 text-blue-400" />
        <span>Last Policy Sync: <span class="font-mono text-slate-200">{new Date(formData.value.lastSyncedAt).toLocaleTimeString()}</span></span>
        @if (saveSuccess.value) {
          <span class="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2Icon class="w-3.5 h-3.5" />
            Policy Synced to GCP Console!
          </span>
        }
      </div>

      <div class="flex items-center gap-3">
        <button
          onClick={() => {
            formData.value = getInitialForm();
          }}
          class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          Reset
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving.value}
          class="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
        >
          @if (isSaving.value) {
            <>
              <RefreshCwIcon class="w-3.5 h-3.5 animate-spin" />
              <span>Applying to Google Cloud IAM...</span>
            </>
          } @else {
            <>
              <ShieldCheckIcon class="w-4 h-4" />
              <span>Apply &amp; Sync IAM Policy to Google Cloud</span>
            </>
          }
        </button>
      </div>
    </div>
  </div>
}
