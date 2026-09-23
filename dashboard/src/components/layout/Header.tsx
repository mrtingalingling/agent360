import { component$, useSignal, useContext, $ } from '@builder.io/qwik';
import { DashboardContext } from '../../state/dashboardState';
import {
  Activity,
  Cpu,
  Layers,
  Sliders,
  Radio,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  Cloud,
  ExternalLink,
  Zap,
  ChevronDown
} from '../common/Icons';

export const Header = component$(() => {
  const state = useContext(DashboardContext);
  const showCloudMenu = useSignal(false);

  const degradedAgents = state.agents.filter(
    (a: any) => a.status === 'degraded' || a.status === 'warning'
  );

  return (
    <header class="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          {/* Brand & Fleet Health */}
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Cpu class="w-5 h-5 text-white" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-base font-bold text-white tracking-tight">NovaSmart AgentOps</h1>
                  <span class="px-1.5 py-0.5 text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded">
                    v2.4 GA
                  </span>
                </div>
                <p class="text-xs text-slate-400">Operating Telemetry &amp; Observability Hub</p>
              </div>
            </div>

            {/* Fleet Status Pill */}
            <div class="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
              <div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900 border border-slate-800">
                <span class="relative flex h-2 w-2">
                  <span
                    class={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                      state.isStreaming ? 'bg-emerald-400' : 'bg-slate-500'
                    } opacity-75`}
                  ></span>
                  <span
                    class={`relative inline-flex rounded-full h-2 w-2 ${
                      state.isStreaming ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  ></span>
                </span>
                <span class="text-slate-300 font-medium">6 Agents Monitored</span>
              </div>

              {degradedAgents.length > 0 && (
                <div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <AlertTriangle class="w-3 h-3 text-rose-400" />
                  <span class="text-[11px] font-medium">{degradedAgents.length} Action Needed</span>
                </div>
              )}
            </div>
          </div>

          {/* Time Range, Cloud Console Switcher, and Streaming Controls */}
          <div class="flex items-center gap-3">
            {/* GOOGLE CLOUD CONSOLE STATUS BADGE & MODE SWITCHER */}
            <div class="relative">
              <button
                onClick$={$(() => {
                  showCloudMenu.value = !showCloudMenu.value;
                })}
                class={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  state.isLiveCloud
                    ? 'bg-blue-950/60 text-blue-300 border-blue-500/40 hover:bg-blue-900/60 shadow-xs'
                    : 'bg-purple-950/60 text-purple-300 border-purple-500/40 hover:bg-purple-900/60 shadow-xs'
                }`}
                title="Google Cloud Console Integration & Telemetry Source"
              >
                <div class="flex items-center gap-1.5">
                  <span
                    class={`w-2 h-2 rounded-full ${
                      state.isLiveCloud && state.cloudConnectionStatus === 'connected'
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-purple-400'
                    }`}
                  />
                  <Cloud class="w-3.5 h-3.5" />
                </div>
                <span class="font-mono text-[11px] hidden sm:inline">
                  {state.isLiveCloud ? 'GCP: qwiklabs-gcp-02...' : 'Simulation Mode'}
                </span>
                <ChevronDown class="w-3 h-3 opacity-60" />
              </button>

              {/* DROPDOWN POPOVER FOR CLOUD ESTATE DETAILS */}
              {showCloudMenu.value && (
                <div class="absolute right-0 mt-2 w-84 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div class="flex items-center gap-2">
                      <Cloud class="w-4 h-4 text-blue-400" />
                      <span class="text-xs font-bold text-white">Google Cloud Connection</span>
                    </div>
                    <span
                      class={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        state.cloudConnectionStatus === 'connected'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {state.cloudConnectionStatus === 'connected' ? 'LIVE ADC LINK' : 'OFFLINE'}
                    </span>
                  </div>

                  {/* Mode Switcher Buttons */}
                  <div class="grid grid-cols-2 gap-2 mt-3 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick$={$(() => {
                        state.setIsLiveCloud(true);
                      })}
                      class={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                        state.isLiveCloud
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Cloud class="w-3.5 h-3.5" />
                      <span>Live GCP Cloud</span>
                    </button>
                    <button
                      onClick$={$(() => {
                        state.setIsLiveCloud(false);
                      })}
                      class={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                        !state.isLiveCloud
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles class="w-3.5 h-3.5" />
                      <span>Simulation</span>
                    </button>
                  </div>

                  {/* Cloud Environment Metadata */}
                  <div class="mt-3.5 space-y-2 text-xs">
                    <div class="flex justify-between items-center text-slate-400">
                      <span>Project:</span>
                      <span class="font-mono text-slate-200 text-[11px]">
                        {state.cloudOverview?.gcp?.projectId || 'qwiklabs-gcp-02-26c698bb5fef'}
                      </span>
                    </div>
                    <div class="flex justify-between items-center text-slate-400">
                      <span>Cloud Run Services:</span>
                      <span class="font-mono font-bold text-emerald-400">
                        {state.cloudOverview?.cloudRun?.total || 4} Active
                      </span>
                    </div>
                    <div class="flex justify-between items-center text-slate-400">
                      <span>Agent Registry:</span>
                      <span class="font-mono font-bold text-indigo-400">
                        {state.cloudOverview?.agentRegistry?.total || 1} Registered (us-central1)
                      </span>
                    </div>
                    <div class="flex justify-between items-center text-slate-400">
                      <span>BigQuery Datasets:</span>
                      <span class="font-mono text-slate-300">
                        {state.cloudOverview?.bigquery?.datasets?.length || 3} (
                        {state.cloudOverview?.bigquery?.datasets?.join(', ') || 'competitor_data...'})
                      </span>
                    </div>
                  </div>

                  {/* External Links to Console */}
                  <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <a
                      href={
                        state.cloudOverview?.gcp?.consoleUrl ||
                        'https://console.cloud.google.com/home/dashboard?project=qwiklabs-gcp-02-26c698bb5fef'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                    >
                      <span>Open GCP Console</span>
                      <ExternalLink class="w-3 h-3" />
                    </a>
                    <button
                      onClick$={$(() => {
                        state.fetchCloudData();
                      })}
                      class="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      title="Refresh telemetry from GCP APIs"
                    >
                      <RefreshCw class="w-3 h-3" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div class="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              {['1h', '6h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick$={$(() => state.setTimeRange(range.toUpperCase()))}
                  class={`px-2.5 py-1 rounded font-medium transition-colors ${
                    state.timeRange.toLowerCase() === range
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Live Streaming Toggle */}
            <button
              onClick$={$(() => state.setIsStreaming(!state.isStreaming))}
              class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                state.isStreaming
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={state.isStreaming ? 'Pause Real-Time Telemetry' : 'Resume Real-Time Telemetry'}
            >
              <Radio class={`w-3.5 h-3.5 ${state.isStreaming ? 'text-emerald-400 animate-pulse' : ''}`} />
              <span class="hidden sm:inline">{state.isStreaming ? 'LIVE STREAM' : 'STREAM PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* Global Page Tabs Navigation */}
        <div class="flex items-center gap-2 border-t border-slate-800/80 pt-2 pb-0 overflow-x-auto">
          <button
            data-tab="overview"
            onClick$={$(() => {
              state.activeTab = 'overview';
              state.setActiveTab('overview');
            })}
            class={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all shrink-0 ${
              state.activeTab === 'overview'
                ? 'border-sky-500 text-sky-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Layers class="w-4 h-4" />
            <span>Fleet Mission Control</span>
          </button>

          <button
            data-tab="workforce"
            onClick$={$(() => {
              state.activeTab = 'workforce';
              state.setActiveTab('workforce');
            })}
            class={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all shrink-0 ${
              state.activeTab === 'workforce'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Briefcase class="w-4 h-4 text-emerald-400" />
            <span>Digital Workforce &amp; ROI</span>
            <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {state.workforceKPIs?.netFleetROI?.toLocaleString() || '6,650'}x ROI
            </span>
          </button>

          {/* 3RD TAB: TOKEN TELEMETRY & GANTT WATERFALL */}
          <button
            data-tab="waterfall"
            onClick$={$(() => {
              state.activeTab = 'waterfall';
              state.setActiveTab('waterfall');
            })}
            class={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all shrink-0 ${
              state.activeTab === 'waterfall'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Zap class="w-4 h-4 text-indigo-400" />
            <span>Token Telemetry &amp; Waterfall</span>
            <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Gantt FinOps
            </span>
          </button>

          <button
            data-tab="detail"
            onClick$={$(() => {
              state.activeTab = 'detail';
              state.setActiveTab('detail');
            })}
            class={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all shrink-0 ${
              state.activeTab === 'detail'
                ? 'border-sky-500 text-sky-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Activity class="w-4 h-4" />
            <span>Agent Coaching Studio</span>
            {degradedAgents.length > 0 && (
              <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                {degradedAgents.length} Action Needed
              </span>
            )}
          </button>

          <button
            data-tab="finetune"
            onClick$={$(() => {
              state.activeTab = 'finetune';
              state.setActiveTab('finetune');
            })}
            class={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all shrink-0 ${
              state.activeTab === 'finetune'
                ? 'border-sky-500 text-sky-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Sliders class="w-4 h-4" />
            <span>Fleet Benchmark &amp; Sandbox</span>
            <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
          </button>
        </div>
      </div>
    </header>
  );
});
