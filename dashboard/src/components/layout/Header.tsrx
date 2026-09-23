import { track } from 'ripple';
import { dashboardState } from '../../state/dashboardState.js';
import {
  ActivityIcon,
  CpuIcon,
  LayersIcon,
  SlidersIcon,
  RadioIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  BriefcaseIcon,
  CloudIcon,
  ExternalLinkIcon,
  ZapIcon,
  ChevronDownIcon
} from '../common/Icons.tsrx';

export function Header() @{
  const showCloudMenu = track(false);

  const degradedAgents = () => dashboardState.agents.filter(a => a.status === 'degraded' || a.status === 'warning');

  <header class="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        {/* Brand & Fleet Health */}
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <CpuIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-base font-bold text-white tracking-tight">NovaSmart AgentOps</h1>
                <span class="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded">
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
                <span class={`animate-ping absolute inline-flex h-full w-full rounded-full ${dashboardState.isStreaming ? 'bg-emerald-400' : 'bg-slate-500'} opacity-75`}></span>
                <span class={`relative inline-flex rounded-full h-2 w-2 ${dashboardState.isStreaming ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
              </span>
              <span class="text-slate-300 font-medium">{dashboardState.agents.length} Agents Monitored</span>
            </div>

            @if (degradedAgents().length > 0) {
              <div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
                <AlertTriangleIcon class="w-3 h-3 text-rose-400" />
                <span class="text-[11px] font-medium">{degradedAgents().length} Action Needed</span>
              </div>
            }
          </div>
        </div>

        {/* Global Controls */}
        <div class="flex items-center gap-3">
          {/* GCP Connection Status Dropdown */}
          <div class="relative">
            <button
              onClick={() => { showCloudMenu.value = !showCloudMenu.value; }}
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
              title="Google Cloud Project: qwiklabs-gcp-02-26c698bb5fef"
            >
              <CloudIcon class="w-3.5 h-3.5 text-emerald-400" />
              <span class="hidden sm:inline font-mono text-[11px]">gcp:qwiklabs-02</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <ChevronDownIcon class="w-3 h-3 text-emerald-400 opacity-70" />
            </button>

            @if (showCloudMenu.value) {
              <div
                class="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div class="flex items-center gap-2">
                    <div class="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <CheckCircle2Icon class="w-4 h-4" />
                    </div>
                    <div>
                      <h4 class="text-xs font-semibold text-white">Google Cloud Connected</h4>
                      <p class="text-[10px] text-slate-400">Real-time telemetry proxy</p>
                    </div>
                  </div>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    LIVE ADC LINK
                  </span>
                </div>

                <div class="mt-3.5 space-y-2 text-xs">
                  <div class="flex justify-between items-center text-slate-400">
                    <span>Project:</span>
                    <span class="font-mono text-slate-200 text-[11px]">
                      qwiklabs-gcp-02-26c698bb5fef
                    </span>
                  </div>
                  <div class="flex justify-between items-center text-slate-400">
                    <span>Cloud Run Services:</span>
                    <span class="font-mono font-bold text-emerald-400">
                      4 Active
                    </span>
                  </div>
                  <div class="flex justify-between items-center text-slate-400">
                    <span>Agent Registry:</span>
                    <span class="font-mono font-bold text-indigo-400">
                      1 Registered (us-central1)
                    </span>
                  </div>
                  <div class="flex justify-between items-center text-slate-400">
                    <span>BigQuery Datasets:</span>
                    <span class="font-mono text-slate-300">
                      3 (competitor_data, customer_data...)
                    </span>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <a
                    href="https://console.cloud.google.com/home/dashboard?project=qwiklabs-gcp-02-26c698bb5fef"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                  >
                    <span>Open GCP Console</span>
                    <ExternalLinkIcon class="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => { showCloudMenu.value = false; }}
                    class="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    <RefreshCwIcon class="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            @for (const range of ['1h', '6h', '24h', '7d']) {
              <button
                onClick={() => dashboardState.setTimeRange(range)}
                class={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dashboardState.timeRange === range
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range.toUpperCase()}
              </button>
            }
          </div>

          {/* Live Streaming Toggle */}
          <button
            onClick={() => dashboardState.setIsStreaming(!dashboardState.isStreaming)}
            class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              dashboardState.isStreaming
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-xs shadow-emerald-500/10'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={dashboardState.isStreaming ? 'Pause Real-Time Telemetry' : 'Resume Real-Time Telemetry'}
          >
            <RadioIcon class={`w-3.5 h-3.5 ${dashboardState.isStreaming ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span class="hidden sm:inline">{dashboardState.isStreaming ? 'LIVE STREAM' : 'STREAM PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Global Page Tabs Navigation */}
      <div class="flex items-center gap-2 border-t border-slate-850 pt-2 pb-0 overflow-x-auto">
        <button
          onClick={() => dashboardState.setActiveTab('overview')}
          class={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 ${
            dashboardState.activeTab === 'overview'
              ? 'border-brand-500 text-brand-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <LayersIcon class="w-4 h-4" />
          <span>Fleet Mission Control</span>
        </button>

        <button
          onClick={() => dashboardState.setActiveTab('workforce')}
          class={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 ${
            dashboardState.activeTab === 'workforce'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <BriefcaseIcon class="w-4 h-4 text-emerald-400" />
          <span>Digital Workforce &amp; ROI</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {dashboardState.workforceKPIs?.netFleetROI?.toLocaleString() || '7,703'}x ROI
          </span>
        </button>

        <button
          onClick={() => dashboardState.setActiveTab('waterfall')}
          class={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 ${
            dashboardState.activeTab === 'waterfall'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <ZapIcon class="w-4 h-4 text-indigo-400" />
          <span>Token Telemetry &amp; Waterfall</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Gantt FinOps
          </span>
        </button>

        <button
          onClick={() => dashboardState.setActiveTab('detail')}
          class={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 ${
            dashboardState.activeTab === 'detail'
              ? 'border-brand-500 text-brand-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <ActivityIcon class="w-4 h-4" />
          <span>Agent Coaching Studio</span>
          @if (degradedAgents().length > 0) {
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
              {degradedAgents().length} Action Needed
            </span>
          }
        </button>

        <button
          onClick={() => dashboardState.setActiveTab('finetune')}
          class={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 ${
            dashboardState.activeTab === 'finetune'
              ? 'border-brand-500 text-brand-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <SlidersIcon class="w-4 h-4" />
          <span>Fleet Benchmark &amp; Sandbox</span>
          <span class="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
        </button>
      </div>
    </div>
  </header>
}
