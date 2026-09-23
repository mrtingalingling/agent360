import { component$, useStore, useSignal, useContext, $ } from '@builder.io/qwik';
import { DashboardContext } from '../../state/dashboardState';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Database,
  DollarSign,
  Server,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Zap,
  Cloud
} from '../common/Icons';

export interface AgentIAMControlsProps {
  agent: any;
}

export const AgentIAMControls = component$<AgentIAMControlsProps>((props) => {
  const state = useContext(DashboardContext);
  const cloudIAMData = state.cloudIAMData;
  const cloudOverview = state.cloudOverview;

  const isSaving = useSignal(false);
  const saveSuccess = useSignal(false);

  const initialIAM = cloudIAMData?.agents?.[props.agent.id] || {
    agentId: props.agent.id,
    agentName: props.agent.name,
    serviceAccount: props.agent.id === 'promo-shadow'
      ? 'novasmart-customer-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com'
      : `${props.agent.id}-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com`,
    identityType: props.agent.id === 'promo-shadow' ? 'shared' : 'dedicated',
    costCenter: 'General Operations (CC-1000)',
    roles: ['roles/run.invoker', 'roles/bigquery.dataViewer'],
    bigqueryQuota: {
      maxScanBytesPerQueryGB: 10,
      dailyCostBudgetUSD: 15.0,
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
      monthlyCeilingUSD: 100.0,
      currentSpendUSD: 35.0,
      hardStopCircuitBreaker: true,
      tokenThrottleThresholdPct: 90
    },
    lastSyncedAt: new Date().toISOString()
  };

  const formData = useStore<any>(JSON.parse(JSON.stringify(initialIAM)), { deep: true });

  const projectId = cloudOverview?.gcp?.projectId || 'qwiklabs-gcp-02-26c698bb5fef';
  const serviceAccountsList = cloudIAMData?.gcpServiceAccounts || [
    {
      email: 'promo-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      displayName: 'Promo agent (marketing-ops)'
    },
    {
      email: 'novasmart-customer-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      displayName: 'NovaSmart Shared Customer SA (Shared - Legacy)'
    },
    {
      email: 'test-agent-caller@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      displayName: 'Test Agent Caller SA'
    },
    {
      email: 'novasmart-deployer-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      displayName: 'Serverless Deployer SA'
    },
    {
      email: 'antigravity-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      displayName: 'Antigravity SA (Admin)'
    }
  ];

  const isShared =
    formData.serviceAccount?.includes('customer-sa') ||
    formData.serviceAccount?.includes('shared') ||
    formData.identityType === 'shared';

  const budgetPct = Math.min(
    100,
    Math.round(
      (formData.finopsBudget.currentSpendUSD / formData.finopsBudget.monthlyCeilingUSD) * 100
    )
  );

  const handleSave = $(async () => {
    isSaving.value = true;
    saveSuccess.value = false;
    try {
      const res = await state.updateAgentIAMConfig(
        props.agent.id,
        JSON.parse(JSON.stringify(formData))
      );
      if (res && res.success) {
        saveSuccess.value = true;
        setTimeout(() => {
          saveSuccess.value = false;
        }, 4000);
      }
    } finally {
      isSaving.value = false;
    }
  });

  const applyRemediationPreset = $(() => {
    const dedicatedSA =
      props.agent.id === 'promo-shadow'
        ? `promo-agent-sa@${projectId}.iam.gserviceaccount.com`
        : `${props.agent.id}-dedicated-sa@${projectId}.iam.gserviceaccount.com`;

    formData.serviceAccount = dedicatedSA;
    formData.identityType = 'dedicated';
    formData.roles = ['roles/run.invoker', 'roles/bigquery.dataViewer'];
    formData.bigqueryQuota.maxScanBytesPerQueryGB = 5;
    formData.bigqueryQuota.scope = 'read_only';
    formData.bigqueryQuota.autoCancelHeavyQueries = true;
    formData.ingressControl.policy = 'authorized_only';
    formData.ingressControl.modelArmorScreening = true;
    formData.ingressControl.maxInstances = 5;
    formData.finopsBudget.hardStopCircuitBreaker = true;
    formData.finopsBudget.tokenThrottleThresholdPct = 85;
  });

  return (
    <div class="space-y-6">
      {/* HEADER & IDENTITY SUMMARY CARD */}
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Shield class="w-4 h-4 text-indigo-400" />
              </div>
              <h2 class="text-base font-bold text-white">
                Agent IAM Identity &amp; FinOps Governance
              </h2>
              {isShared ? (
                <span class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse">
                  <ShieldAlert class="w-3.5 h-3.5" />
                  Shared Identity (Audit Contamination Risk)
                </span>
              ) : (
                <span class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck class="w-3.5 h-3.5" />
                  Dedicated Identity (Least Privilege)
                </span>
              )}
            </div>
            <p class="text-xs text-slate-400 mt-1">
              GCP Service Account, BigQuery scan caps, Cloud Run invocation barriers, and token spending ceilings for{' '}
              <span class="text-slate-200 font-semibold">{props.agent.name}</span>.
            </p>
          </div>

          <div class="flex items-center gap-2">
            {isShared && (
              <button
                onClick$={applyRemediationPreset}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-xs"
              >
                <Zap class="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-Remediate to Dedicated SA</span>
              </button>
            )}

            <a
              href={`https://console.cloud.google.com/iam-admin/iam?project=${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
            >
              <Cloud class="w-3.5 h-3.5 text-blue-400" />
              <span>GCP IAM Console</span>
              <ExternalLink class="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* IDENTITY WARNING OR SUCCESS BANNER */}
        {isShared ? (
          <div class="mt-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-start gap-3">
            <AlertTriangle class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div class="text-xs text-rose-200 leading-relaxed">
              <span class="font-bold text-rose-100">Separation of Duties Alert:</span> This agent currently runs under the shared credential{' '}
              <code class="bg-rose-900/60 px-1 py-0.5 rounded font-mono text-[11px]">{formData.serviceAccount}</code>. In BigQuery data access logs, regulatory compliance cannot attribute specific queries or costs to this agent versus other workloads. Switch to a dedicated identity to enforce non-repudiation and department-level cost allocation.
            </div>
          </div>
        ) : (
          <div class="mt-4 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-200">
            <div class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Non-Repudiation Verified:</strong> Cloud Run invocations and BigQuery access are uniquely signed by{' '}
                <code class="bg-emerald-950/60 px-1 py-0.5 rounded font-mono text-[11px]">{formData.serviceAccount}</code>.
              </span>
            </div>
            <span class="text-[11px] font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/20">
              Audit Trail: OK
            </span>
          </div>
        )}
      </div>

      {/* 4 STRATEGIC CONTROL CARDS GRID */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. IAM SERVICE ACCOUNT & COST CENTER */}
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <Key class="w-4 h-4 text-sky-400" />
              <h3 class="text-sm font-bold text-white">GCP Service Account &amp; Cost Center</h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              M1 Identity Control
            </span>
          </div>

          <div class="space-y-3.5 text-xs">
            <div>
              <label class="block text-slate-300 font-medium mb-1.5">
                Active GCP Service Account Principal
              </label>
              <select
                value={formData.serviceAccount}
                onChange$={$((e: Event) => {
                  formData.serviceAccount = (e.target as HTMLSelectElement).value;
                })}
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
              >
                {serviceAccountsList.map((sa: any, idx: number) => (
                  <option key={idx} value={sa.email}>
                    {sa.displayName} ({sa.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label class="block text-slate-300 font-medium mb-1.5">Internal Cost Center Code</label>
              <input
                type="text"
                value={formData.costCenter}
                onInput$={$((e: Event) => {
                  formData.costCenter = (e.target as HTMLInputElement).value;
                })}
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label class="block text-slate-300 font-medium mb-1.5">Bound Cloud IAM Roles</label>
              <div class="space-y-1.5">
                {formData.roles.map((role: string, idx: number) => (
                  <div
                    key={idx}
                    class="flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300"
                  >
                    <span>{role}</span>
                    <span class="text-emerald-400 font-semibold">Granted</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. BIGQUERY SCAN QUOTAS */}
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <Database class="w-4 h-4 text-emerald-400" />
              <h3 class="text-sm font-bold text-white">BigQuery Scan Budget &amp; Quota Caps</h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              FinOps Shield
            </span>
          </div>

          <div class="space-y-4 text-xs">
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-slate-300 font-medium">Max Query Scan Cap per Run</span>
                <span class="font-mono font-bold text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">
                  {formData.bigqueryQuota.maxScanBytesPerQueryGB} GB ($
                  {(formData.bigqueryQuota.maxScanBytesPerQueryGB * 0.00625).toFixed(3)})
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={formData.bigqueryQuota.maxScanBytesPerQueryGB}
                onInput$={$((e: Event) => {
                  formData.bigqueryQuota.maxScanBytesPerQueryGB = Number(
                    (e.target as HTMLInputElement).value
                  );
                })}
                class="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 GB ($0.006)</span>
                <span>25 GB ($0.156)</span>
                <span>50 GB ($0.312)</span>
              </div>
            </div>

            <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span class="font-bold text-white block">Auto-Cancel Heavy Unindexed Queries</span>
                <span class="text-[11px] text-slate-400">
                  Abort dry-run scans exceeding cap before BigQuery execution.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.bigqueryQuota.autoCancelHeavyQueries}
                onChange$={$((e: Event) => {
                  formData.bigqueryQuota.autoCancelHeavyQueries = (
                    e.target as HTMLInputElement
                  ).checked;
                })}
                class="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. INGRESS ACCESS BARRIER & MODEL ARMOR */}
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <Server class="w-4 h-4 text-sky-400" />
              <h3 class="text-sm font-bold text-white">Ingress Control &amp; Gateway Armor</h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Cloud Run Protection
            </span>
          </div>

          <div class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-300 font-medium mb-1.5">Ingress Invocation Barrier</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick$={$(() => {
                    formData.ingressControl.policy = 'authorized_only';
                  })}
                  class={`p-2.5 rounded-xl border text-left transition-all ${
                    formData.ingressControl.policy === 'authorized_only'
                      ? 'bg-sky-950/60 border-sky-500 text-sky-200'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div class="flex items-center gap-1.5 font-bold">
                    <Lock class="w-3.5 h-3.5 text-sky-400" />
                    <span>Authorized Only</span>
                  </div>
                  <p class="text-[10px] text-slate-400 mt-0.5">
                    Requires IAM `roles/run.invoker`
                  </p>
                </button>

                <button
                  type="button"
                  onClick$={$(() => {
                    formData.ingressControl.policy = 'all_users';
                  })}
                  class={`p-2.5 rounded-xl border text-left transition-all ${
                    formData.ingressControl.policy === 'all_users'
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div class="flex items-center gap-1.5 font-bold">
                    <Unlock class="w-3.5 h-3.5 text-rose-400" />
                    <span>Public (allUsers)</span>
                  </div>
                  <p class="text-[10px] text-rose-300/80 mt-0.5">
                    Denial-of-Wallet risk
                  </p>
                </button>
              </div>
            </div>

            <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <ShieldCheck class="w-4 h-4 text-sky-400" />
                  <span class="font-bold text-white">Agent Gateway / Model Armor Shield</span>
                </div>
                <p class="text-[11px] text-slate-400">
                  Pre-screens prompt injection before LLM ingestion. Prevents adversarial token burn loops.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.ingressControl.modelArmorScreening}
                onChange$={$((e: Event) => {
                  formData.ingressControl.modelArmorScreening = (
                    e.target as HTMLInputElement
                  ).checked;
                })}
                class="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-slate-300 font-medium">Cloud Run Max Instances Cap</span>
                <span class="font-mono font-bold text-slate-200">
                  {formData.ingressControl.maxInstances} instances (max ~$
                  {(formData.ingressControl.maxInstances * 3.5).toFixed(1)}/mo)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={formData.ingressControl.maxInstances}
                onInput$={$((e: Event) => {
                  formData.ingressControl.maxInstances = Number(
                    (e.target as HTMLInputElement).value
                  );
                })}
                class="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. TOKEN SPENDING BUDGET & CIRCUIT BREAKER */}
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <DollarSign class="w-4 h-4 text-amber-400" />
              <h3 class="text-sm font-bold text-white">Token Budget &amp; Hard-Stop Circuit Breaker</h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              FinOps Envelope
            </span>
          </div>

          <div class="space-y-4 text-xs">
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-slate-300 font-medium">Monthly Token Spending Ceiling</span>
                <span class="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  ${Number(formData.finopsBudget.monthlyCeilingUSD).toFixed(2)} / mo
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="500"
                step="5"
                value={formData.finopsBudget.monthlyCeilingUSD}
                onInput$={$((e: Event) => {
                  formData.finopsBudget.monthlyCeilingUSD = Number(
                    (e.target as HTMLInputElement).value
                  );
                })}
                class="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-slate-400">Current Monthly Consumption:</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-bold text-amber-400">
                    ${Number(formData.finopsBudget.currentSpendUSD).toFixed(2)}
                  </span>
                  <span class="text-slate-500">
                    / ${Number(formData.finopsBudget.monthlyCeilingUSD).toFixed(2)}
                  </span>
                  <span class="text-[11px] font-bold text-slate-300">({budgetPct}%)</span>
                </div>
              </div>

              <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  class={`h-full rounded-full transition-all ${
                    budgetPct > 85 ? 'bg-rose-500' : budgetPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetPct}%` }}
                ></div>
              </div>
            </div>

            <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div class="font-bold text-white flex items-center gap-1.5">
                  <Zap class="w-3.5 h-3.5 text-amber-400" />
                  <span>Hard-Stop Circuit Breaker</span>
                </div>
                <p class="text-[10px] text-slate-400 mt-0.5">
                  Halts agent execution if spend hits {formData.finopsBudget.tokenThrottleThresholdPct}% of budget.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.finopsBudget.hardStopCircuitBreaker}
                onChange$={$((e: Event) => {
                  formData.finopsBudget.hardStopCircuitBreaker = (
                    e.target as HTMLInputElement
                  ).checked;
                })}
                class="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS BAR */}
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <Cloud class="w-4 h-4 text-blue-400" />
          <span>
            Last Policy Sync:{' '}
            <span class="font-mono text-slate-200">
              {new Date(formData.lastSyncedAt).toLocaleTimeString()}
            </span>
          </span>
          {saveSuccess.value && (
            <span class="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle class="w-3.5 h-3.5" />
              Policy Synced to GCP Console!
            </span>
          )}
        </div>

        <div class="flex items-center gap-3">
          <button
            onClick$={$(() => {
              const currentAgentIAM = cloudIAMData?.agents?.[props.agent.id];
              if (currentAgentIAM) {
                Object.assign(formData, JSON.parse(JSON.stringify(currentAgentIAM)));
              }
            })}
            class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Reset
          </button>

          <button
            onClick$={handleSave}
            disabled={isSaving.value}
            class="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving.value ? (
              <>
                <RefreshCw class="w-3.5 h-3.5 animate-spin" />
                <span>Applying to Google Cloud IAM...</span>
              </>
            ) : (
              <>
                <ShieldCheck class="w-4 h-4" />
                <span>Apply &amp; Sync IAM Policy to Google Cloud</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
