import { createSignal, Show, For, onMount } from 'solid-js';
import { dashboardState } from '../../state/dashboardState.js';
import { 
  X, 
  Cloud, 
  Server, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  Key, 
  Sparkles, 
  Building2,
  Check,
  Cpu
} from 'lucide-solid';

export function CloudConnectionModal() {
  const [activeTab, setActiveTab] = createSignal('switch'); // 'switch' | 'custom'
  const [formData, setFormData] = createSignal({
    name: 'Enterprise Customer Ops (Prod)',
    projectId: 'enterprise-agent-prod-us',
    projectNumber: '104857692019',
    geminiEngineId: 'customer-care-engine',
    geminiEnterpriseAppId: 'projects/104857692019/locations/global/collections/default_collection/engines/customer-care-engine',
    agentRegistryLocation: 'us-central1',
    telemetryDataset: 'agent_analytics_prod',
    cloudRunRegion: 'us-central1'
  });
  const [diagnosticsResult, setDiagnosticsResult] = createSignal(null);
  const [isRunningTest, setIsRunningTest] = createSignal(false);
  const [saveSuccess, setSaveSuccess] = createSignal(false);

  const currentEnv = () => dashboardState.currentEnvironment;
  const environments = () => dashboardState.environments;

  async function handleRunDiagnostics() {
    setIsRunningTest(true);
    setDiagnosticsResult(null);
    setSaveSuccess(false);
    const result = await dashboardState.testCloudConnection(formData());
    setDiagnosticsResult(result);
    setIsRunningTest(false);
    setTimeout(() => {
      const el = document.getElementById('diagnostics-container');
      if (el && el.parentElement) {
        el.parentElement.scrollTop = el.parentElement.scrollHeight;
      }
    }, 50);
  }

  function handleSaveAndConnect() {
    dashboardState.saveCustomEnvironment({
      ...formData(),
      status: 'connected'
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      dashboardState.setIsConnectionModalOpen(false);
    }, 1000);
  }

  function handleSelectPreset(envId) {
    dashboardState.switchEnvironment(envId);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      dashboardState.setIsConnectionModalOpen(false);
    }, 600);
  }

  return (
    <Show when={dashboardState.isConnectionModalOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div 
          class="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Cloud class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <span>Google Cloud &amp; Gemini Enterprise Connection</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Console Companion
                  </span>
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">
                  Connect Agent 360 to your organization's Gemini Enterprise app, Agent Registry, and Cloud Run estate.
                </p>
              </div>
            </div>

            <button
              onClick={() => dashboardState.setIsConnectionModalOpen(false)}
              class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div class="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('switch')}
              class={`pb-3 font-semibold transition-colors relative flex items-center gap-2 ${
                activeTab() === 'switch'
                  ? 'text-brand-400 border-b-2 border-brand-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 class="w-4 h-4" />
              <span>Environment Profiles ({environments().length})</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              class={`pb-3 font-semibold transition-colors relative flex items-center gap-2 ${
                activeTab() === 'custom'
                  ? 'text-brand-400 border-b-2 border-brand-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles class="w-4 h-4" />
              <span>Connect Custom Gemini Enterprise</span>
            </button>
          </div>

          {/* Body Content */}
          <div id="cloud-modal-body" class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            <Show when={activeTab() === 'switch'}>
              {/* Presets List */}
              <div class="space-y-3">
                <p class="text-slate-400">
                  Select an active Google Cloud environment profile to inspect live agent operations, telemetry, and economics:
                </p>

                <div class="space-y-2.5">
                  <For each={environments()}>
                    {(env) => {
                      const isCurrent = () => env.id === currentEnv().id;
                      return (
                        <div
                          onClick={() => handleSelectPreset(env.id)}
                          class={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isCurrent()
                              ? 'bg-blue-950/40 border-blue-500/60 shadow-md ring-1 ring-blue-500/40'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                        >
                          <div class="flex items-center gap-3">
                            <div class={`w-3 h-3 rounded-full shrink-0 ${isCurrent() ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                            <div>
                              <div class="flex items-center gap-2">
                                <span class="font-bold text-white text-sm">{env.name}</span>
                                <Show when={isCurrent()}>
                                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    ACTIVE LINK
                                  </span>
                                </Show>
                                <Show when={env.isPreset}>
                                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                                    PRESET
                                  </span>
                                </Show>
                              </div>
                              <div class="flex items-center gap-4 text-slate-400 font-mono text-[11px] mt-1 flex-wrap">
                                <span>Project: <strong class="text-slate-200">{env.projectId}</strong></span>
                                <span>Engine: <strong class="text-slate-200">{env.geminiEngineId}</strong></span>
                                <span>Region: <strong class="text-slate-200">{env.agentRegistryLocation || 'us-central1'}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div class="flex items-center gap-2">
                            <Show when={isCurrent()}>
                              <span class="flex items-center gap-1 text-emerald-400 font-bold">
                                <Check class="w-4 h-4" /> Connected
                              </span>
                            </Show>
                            <Show when={!isCurrent()}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSelectPreset(env.id); }}
                                class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                              >
                                Switch To
                              </button>
                            </Show>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>

                <div class="pt-4 flex justify-end">
                  <button
                    onClick={() => setActiveTab('custom')}
                    class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
                  >
                    <Sparkles class="w-4 h-4" />
                    <span>+ Connect New Gemini Enterprise Environment</span>
                  </button>
                </div>
              </div>
            </Show>

            <Show when={activeTab() === 'custom'}>
              {/* Custom Connection Form */}
              <div class="space-y-4">
                <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 flex items-start gap-3">
                  <ShieldCheck class="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div class="text-[11px] text-blue-200/90 leading-relaxed">
                    <strong>Zero Private Key Risk:</strong> Agent 360 connects via Google Cloud Application Default Credentials (ADC), Identity-Aware Proxy (IAP), or Google Identity Services OAuth. No JSON service account private keys are ever stored on the client.
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-slate-300 font-semibold mb-1">
                      Environment Display Name
                    </label>
                    <input
                      type="text"
                      value={formData().name}
                      onInput={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Production Support Ops"
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label class="block text-slate-300 font-semibold mb-1">
                      Google Cloud Project ID <span class="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData().projectId}
                      onInput={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                      placeholder="e.g. enterprise-agent-prod"
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-brand-500 font-mono"
                    />
                  </div>

                  <div>
                    <label class="block text-slate-300 font-semibold mb-1">
                      Gemini Enterprise Engine / App ID
                    </label>
                    <input
                      type="text"
                      value={formData().geminiEngineId}
                      onInput={(e) => setFormData(prev => ({ ...prev, geminiEngineId: e.target.value }))}
                      placeholder="e.g. customer-care-engine"
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-brand-500 font-mono"
                    />
                  </div>

                  <div>
                    <label class="block text-slate-300 font-semibold mb-1">
                      Agent Registry Region
                    </label>
                    <select
                      value={formData().agentRegistryLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, agentRegistryLocation: e.target.value }))}
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-brand-500"
                    >
                      <option value="us-central1">us-central1 (Iowa)</option>
                      <option value="us-east1">us-east1 (S. Carolina)</option>
                      <option value="europe-west1">europe-west1 (Belgium)</option>
                      <option value="asia-northeast1">asia-northeast1 (Tokyo)</option>
                      <option value="global">global</option>
                    </select>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-slate-300 font-semibold mb-1">
                      Full Gemini Enterprise App Resource Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData().geminiEnterpriseAppId}
                      onInput={(e) => setFormData(prev => ({ ...prev, geminiEnterpriseAppId: e.target.value }))}
                      placeholder="projects/{PROJECT_NUMBER}/locations/global/collections/default_collection/engines/{ENGINE_ID}"
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-brand-500 font-mono text-[11px]"
                    />
                    <div class="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Found in Google Cloud Console &rarr; Gemini Enterprise &rarr; Apps &rarr; Configuration</span>
                      <a
                        href={`https://console.cloud.google.com/gen-app-builder/engines?project=${formData().projectId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <span>Open Gemini Enterprise Studio</span>
                        <ExternalLink class="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <label class="block text-slate-300 font-semibold mb-1">
                      BigQuery Agent Analytics Dataset
                    </label>
                    <input
                      type="text"
                      value={formData().telemetryDataset}
                      onInput={(e) => setFormData(prev => ({ ...prev, telemetryDataset: e.target.value }))}
                      placeholder="e.g. agent_analytics_prod"
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-brand-500 font-mono"
                    />
                  </div>

                  <div>
                    <label class="block text-slate-300 font-semibold mb-1">
                      Primary Cloud Run Region
                    </label>
                    <input
                      type="text"
                      value={formData().cloudRunRegion}
                      onInput={(e) => setFormData(prev => ({ ...prev, cloudRunRegion: e.target.value }))}
                      placeholder="e.g. us-central1"
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-brand-500 font-mono"
                    />
                  </div>
                </div>

                {/* Diagnostics Check Runner */}
                <div id="diagnostics-container" class="mt-6 pt-4 border-t border-slate-800">
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <h4 class="font-bold text-white flex items-center gap-2">
                        <Cpu class="w-4 h-4 text-emerald-400" />
                        <span>Pre-Flight Connection Diagnostics</span>
                      </h4>
                      <p class="text-[11px] text-slate-400">
                        Verify Discovery Engine API, Agent Registry catalog, and IAM permissions before connecting.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunDiagnostics}
                      disabled={isRunningTest()}
                      class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Show when={isRunningTest()} fallback={<RefreshCw class="w-3.5 h-3.5" />}>
                        <RefreshCw class="w-3.5 h-3.5 animate-spin text-brand-400" />
                      </Show>
                      <span>{isRunningTest() ? 'Verifying Estate...' : 'Run Diagnostics'}</span>
                    </button>
                  </div>

                  <Show when={diagnosticsResult()}>
                    <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <For each={diagnosticsResult()?.diagnostics || []}>
                        {(diag) => (
                          <div class="flex items-start gap-2.5 text-[11px]">
                            <Show 
                              when={diag.status === 'passed'}
                              fallback={<AlertTriangle class="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                            >
                              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            </Show>
                            <div>
                              <div class="font-semibold text-slate-200">{diag.name}</div>
                              <div class="text-slate-400 font-mono text-[10px]">{diag.detail}</div>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </div>
            </Show>
          </div>

          {/* Footer Actions */}
          <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span class="text-slate-400 text-xs">
                Active: <strong class="text-slate-200">{currentEnv()?.name}</strong>
              </span>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                onClick={() => dashboardState.setIsConnectionModalOpen(false)}
                class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              >
                Close
              </button>

              <Show when={activeTab() === 'custom'}>
                <button
                  type="button"
                  onClick={handleSaveAndConnect}
                  class={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg ${
                    saveSuccess()
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20'
                  }`}
                >
                  <Show when={saveSuccess()} fallback={<Cloud class="w-4 h-4" />}>
                    <Check class="w-4 h-4" />
                  </Show>
                  <span>{saveSuccess() ? 'Connected!' : 'Save & Connect Environment'}</span>
                </button>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
