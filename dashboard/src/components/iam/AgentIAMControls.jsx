import React, { useState, useEffect } from 'react';
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
  Sliders, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  Zap, 
  Cloud, 
  Cpu, 
  FileText, 
  Users,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function AgentIAMControls({ agent }) {
  const { 
    cloudIAMData, 
    cloudOverview, 
    updateAgentIAMConfig, 
    fetchCloudData, 
    isCloudLoading,
    dataSourceMode 
  } = useDashboard();

  // Local state for configuration form
  const currentIAM = cloudIAMData?.agents?.[agent.id] || {
    agentId: agent.id,
    agentName: agent.name,
    serviceAccount: `${agent.id}-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com`,
    identityType: agent.id === 'support-triage' ? 'shared' : 'dedicated',
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

  const [formData, setFormData] = useState(currentIAM);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    if (cloudIAMData?.agents?.[agent.id]) {
      setFormData(cloudIAMData.agents[agent.id]);
    }
  }, [cloudIAMData, agent.id]);

  const projectId = cloudOverview?.gcp?.projectId || 'qwiklabs-gcp-02-26c698bb5fef';
  const serviceAccountsList = cloudIAMData?.gcpServiceAccounts || [
    { email: 'promo-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com', displayName: 'Promo agent (marketing-ops)' },
    { email: 'novasmart-customer-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com', displayName: 'NovaSmart Shared Customer SA (Shared - Legacy)' },
    { email: 'test-agent-caller@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com', displayName: 'Test Agent Caller SA' },
    { email: 'novasmart-deployer-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com', displayName: 'Serverless Agent Deployer SA' },
    { email: 'antigravity-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com', displayName: 'Antigravity SA (Admin)' }
  ];

  const isShared = formData.serviceAccount?.includes('customer-sa') || formData.serviceAccount?.includes('shared');
  const budgetPct = Math.min(100, Math.round((formData.finopsBudget.currentSpendUSD / formData.finopsBudget.monthlyCeilingUSD) * 100));

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await updateAgentIAMConfig(agent.id, formData);
      if (res && res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const applyRemediationPreset = () => {
    setActivePreset('strict_least_privilege');
    const dedicatedSA = agent.id === 'promo-shadow' 
      ? `promo-agent-sa@${projectId}.iam.gserviceaccount.com`
      : `${agent.id}-dedicated-sa@${projectId}.iam.gserviceaccount.com`;

    setFormData(prev => ({
      ...prev,
      serviceAccount: dedicatedSA,
      identityType: 'dedicated',
      roles: ['roles/run.invoker', 'roles/bigquery.dataViewer'],
      bigqueryQuota: {
        ...prev.bigqueryQuota,
        maxScanBytesPerQueryGB: 5,
        scope: 'read_only',
        autoCancelHeavyQueries: true
      },
      ingressControl: {
        ...prev.ingressControl,
        policy: 'authorized_only',
        modelArmorScreening: true,
        maxInstances: 5
      },
      finopsBudget: {
        ...prev.finopsBudget,
        hardStopCircuitBreaker: true,
        tokenThrottleThresholdPct: 85
      }
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER & IDENTITY SUMMARY CARD */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
              <h2 className="text-base font-bold text-white">
                Agent IAM Identity &amp; FinOps Governance
              </h2>
              {isShared ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Shared Identity (Audit Contamination Risk)
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Dedicated Identity (Least Privilege)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              GCP Service Account, BigQuery scan caps, Cloud Run invocation barriers, and token spending ceilings for <span className="text-slate-200 font-semibold">{agent.name}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isShared && (
              <button
                onClick={applyRemediationPreset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-Remediate to Dedicated SA</span>
              </button>
            )}

            <a
              href={`https://console.cloud.google.com/iam-admin/iam?project=${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              <span>GCP IAM Console</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* IDENTITY WARNING OR SUCCESS BANNER */}
        {isShared ? (
          <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200 leading-relaxed">
              <span className="font-bold text-rose-100">Separation of Duties Alert:</span> This agent currently runs under the shared credential <code className="bg-rose-900/60 px-1 py-0.5 rounded font-mono text-[11px]">{formData.serviceAccount}</code>. In BigQuery data access logs, regulatory compliance cannot attribute specific queries or costs to this agent versus other workloads. Switch to a dedicated identity to enforce non-repudiation and department-level cost allocation.
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Non-Repudiation Verified:</strong> Cloud Run invocations and BigQuery access are uniquely signed by <code className="bg-emerald-950/60 px-1 py-0.5 rounded font-mono text-[11px]">{formData.serviceAccount}</code>.
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/20">
              Audit Trail: OK
            </span>
          </div>
        )}
      </div>

      {/* 4 STRATEGIC CONTROL CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. IAM SERVICE ACCOUNT & COST CENTER */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">GCP Service Account &amp; Cost Center</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              M1 Identity Control
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Active GCP Service Account Principal
              </label>
              <select
                value={formData.serviceAccount}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    serviceAccount: val,
                    identityType: val.includes('shared') || val.includes('customer-sa') ? 'shared' : 'dedicated'
                  }));
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              >
                {serviceAccountsList.map((sa, i) => (
                  <option key={i} value={sa.email}>
                    {sa.displayName} ({sa.email.split('@')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Department Cost Center Allocation
              </label>
              <input
                type="text"
                value={formData.costCenter}
                onChange={(e) => setFormData(prev => ({ ...prev, costCenter: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Bound IAM Roles (Least Privilege Scope)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {formData.roles.map((r, i) => (
                  <span key={i} className="px-2 py-1 bg-indigo-950/50 text-indigo-300 border border-indigo-500/30 rounded text-[11px] font-mono">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. BIGQUERY QUOTAS & DATA FINOPS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">BigQuery Quotas &amp; Data Scan Caps</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              Runaway Query Guard
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Scan Limit Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-medium">Max Scan Bytes Per Query</span>
                <span className="font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                  {formData.bigqueryQuota.maxScanBytesPerQueryGB} GB ($0.0{(formData.bigqueryQuota.maxScanBytesPerQueryGB * 0.00625).toFixed(3)} cap)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={formData.bigqueryQuota.maxScanBytesPerQueryGB}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    bigqueryQuota: { ...prev.bigqueryQuota, maxScanBytesPerQueryGB: val }
                  }));
                }}
                className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enforces BigQuery <code className="text-slate-300">maximum_bytes_billed</code>. Blocks queries exceeding {formData.bigqueryQuota.maxScanBytesPerQueryGB} GB to stop $62.50+ multi-TB accidental scans.
              </p>
            </div>

            {/* Daily BQ Budget */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-medium">Daily BigQuery Cost Limit</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${formData.bigqueryQuota.dailyCostBudgetUSD.toFixed(2)} / day
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={formData.bigqueryQuota.dailyCostBudgetUSD}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    bigqueryQuota: { ...prev.bigqueryQuota, dailyCostBudgetUSD: val }
                  }));
                }}
                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Scope & Auto-Cancel Switches */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Dataset IAM</div>
                  <div className="text-[10px] text-slate-400">{formData.bigqueryQuota.scope === 'read_only' ? 'Read-Only (dataViewer)' : 'Read-Write (dataEditor)'}</div>
                </div>
                <button
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    bigqueryQuota: {
                      ...prev.bigqueryQuota,
                      scope: prev.bigqueryQuota.scope === 'read_only' ? 'read_write' : 'read_only'
                    }
                  }))}
                  className={`px-2 py-1 rounded text-[11px] font-bold ${
                    formData.bigqueryQuota.scope === 'read_only'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {formData.bigqueryQuota.scope === 'read_only' ? 'LOCKED' : 'EDIT'}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Auto-Cancel</div>
                  <div className="text-[10px] text-slate-400">Cancel heavy queries</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.bigqueryQuota.autoCancelHeavyQueries}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bigqueryQuota: { ...prev.bigqueryQuota, autoCancelHeavyQueries: e.target.checked }
                  }))}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. CLOUD RUN INGRESS & MODEL ARMOR GATEWAY */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Cloud Run Ingress &amp; Model Armor</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              M2 &amp; M3 Gateways
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Ingress Policy Selection */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Service Invocation Ingress Boundary (`roles/run.invoker`)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    ingressControl: { ...prev.ingressControl, policy: 'authorized_only' }
                  }))}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    formData.ingressControl.policy === 'authorized_only'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Authorized Callers</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    mTLS &amp; IAM signed (Blocks rogue callers)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    ingressControl: { ...prev.ingressControl, policy: 'public' }
                  }))}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    formData.ingressControl.policy === 'public'
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Unlock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Public (allUsers)</span>
                  </div>
                  <p className="text-[10px] text-rose-300/80 mt-0.5">
                    Denial-of-Wallet &amp; flood risk
                  </p>
                </button>
              </div>
            </div>

            {/* Model Armor Shield Toggle */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span className="font-bold text-white">Agent Gateway / Model Armor Shield</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pre-screens prompt injection before LLM ingestion. Prevents adversarial token burn loops.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.ingressControl.modelArmorScreening}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  ingressControl: { ...prev.ingressControl, modelArmorScreening: e.target.checked }
                }))}
                className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 accent-brand-500 cursor-pointer"
              />
            </div>

            {/* Max Instance Scaling Limit */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-medium">Cloud Run Max Instances Cap</span>
                <span className="font-mono font-bold text-slate-200">
                  {formData.ingressControl.maxInstances} instances (max ~${(formData.ingressControl.maxInstances * 3.5).toFixed(1)}/mo)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={formData.ingressControl.maxInstances}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    ingressControl: { ...prev.ingressControl, maxInstances: val }
                  }));
                }}
                className="w-full accent-brand-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. TOKEN SPENDING BUDGET & CIRCUIT BREAKER */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Token Budget &amp; Hard-Stop Circuit Breaker</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              FinOps Envelope
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Monthly Budget Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-medium">Monthly Token Spending Ceiling</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  ${formData.finopsBudget.monthlyCeilingUSD.toFixed(2)} / mo
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="500"
                step="5"
                value={formData.finopsBudget.monthlyCeilingUSD}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    finopsBudget: { ...prev.finopsBudget, monthlyCeilingUSD: val }
                  }));
                }}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Current Spend vs Ceiling Meter */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Monthly Consumption:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-amber-400">
                    ${formData.finopsBudget.currentSpendUSD.toFixed(2)}
                  </span>
                  <span className="text-slate-500">/ ${formData.finopsBudget.monthlyCeilingUSD.toFixed(2)}</span>
                  <span className="text-[11px] font-bold text-slate-300">({budgetPct}%)</span>
                </div>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetPct > 85 ? 'bg-rose-500' : budgetPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
            </div>

            {/* Circuit Breaker Switch */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hard-Stop Circuit Breaker</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Halts agent execution if spend hits {formData.finopsBudget.tokenThrottleThresholdPct}% of budget.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.finopsBudget.hardStopCircuitBreaker}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  finopsBudget: { ...prev.finopsBudget, hardStopCircuitBreaker: e.target.checked }
                }))}
                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS BAR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Cloud className="w-4 h-4 text-blue-400" />
          <span>Last Policy Sync: <span className="font-mono text-slate-200">{new Date(formData.lastSyncedAt).toLocaleTimeString()}</span></span>
          {saveSuccess && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              Policy Synced to GCP Console!
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (cloudIAMData?.agents?.[agent.id]) {
                setFormData(cloudIAMData.agents[agent.id]);
              }
            }}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Reset
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Applying to Google Cloud IAM...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Apply &amp; Sync IAM Policy to Google Cloud</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
