<script>
  import { dashboardState } from '../../state/dashboardState.svelte.js';
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
    TrendingUp,
    Cloud,
    Server,
    ExternalLink,
    Zap,
    ChevronDown,
    Check
  } from '@lucide/svelte';

  let showCloudMenu = $state(false);
  let degradedAgents = $derived(
    dashboardState.agents.filter(a => a.status === 'degraded' || a.status === 'warning')
  );
</script>

<header class="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Brand & Fleet Health -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Cpu class="w-5 h-5 text-white" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base font-bold text-white tracking-tight">NovaSmart AgentOps</h1>
              <span class="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded">
                v2.4 GA (Svelte 5)
              </span>
            </div>
            <p class="text-xs text-slate-400">Operating Telemetry &amp; Observability Hub</p>
          </div>
        </div>

        <!-- Fleet Status Pill -->
        <div class="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900 border border-slate-800">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-slate-300 font-medium">6 Agents Monitored</span>
          </div>

          {#if degradedAgents.length > 0}
            <div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <AlertTriangle class="w-3 h-3 text-rose-400" />
              <span class="text-[11px] font-medium">{degradedAgents.length} Action Needed</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Time Range, Cloud Console Switcher, and Streaming Controls -->
      <div class="flex items-center gap-3">
        <!-- GOOGLE CLOUD CONSOLE STATUS BADGE & MODE SWITCHER -->
        <div class="relative">
          <button
            onclick={() => showCloudMenu = !showCloudMenu}
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-blue-950/60 text-blue-300 border-blue-500/40 hover:bg-blue-900/60 shadow-xs"
            title="Google Cloud Console Integration & Telemetry Source"
          >
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Cloud class="w-3.5 h-3.5" />
            </div>
            <span class="font-mono text-[11px] hidden sm:inline">
              GCP: qwiklabs-gcp-02...
            </span>
            <ChevronDown class="w-3 h-3 opacity-60" />
          </button>

          <!-- DROPDOWN POPOVER FOR CLOUD ESTATE DETAILS -->
          {#if showCloudMenu}
            <div class="absolute right-0 mt-2 w-84 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <div class="flex items-center gap-2">
                  <Cloud class="w-4 h-4 text-blue-400" />
                  <span class="text-xs font-bold text-white">Google Cloud Connection</span>
                </div>
                <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE ADC LINK
                </span>
              </div>

              <!-- Cloud Environment Metadata -->
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
                    3 (competitor_data, novasmart_pricing...)
                  </span>
                </div>
              </div>

              <!-- External Links to Console -->
              <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <a
                  href="https://console.cloud.google.com/home/dashboard?project=qwiklabs-gcp-02-26c698bb5fef"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                >
                  <span>Open GCP Console</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>
            </div>
          {/if}
        </div>

        <div class="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {#each ['1h', '6h', '24h', '7d'] as range}
            <button
              class="px-2.5 py-1 rounded font-medium transition-colors {dashboardState.timeRange === range ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}"
            >
              {range.toUpperCase()}
            </button>
          {/each}
        </div>

        <!-- Live Streaming Toggle -->
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10"
        >
          <Radio class="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span class="hidden sm:inline">LIVE STREAM</span>
        </button>
      </div>
    </div>

    <!-- Global Page Tabs Navigation -->
    <div class="flex items-center gap-2 border-t border-slate-850 pt-2 pb-0 overflow-x-auto">
      <button
        onclick={() => dashboardState.setActiveTab('overview')}
        class="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 {dashboardState.activeTab === 'overview' ? 'border-brand-500 text-brand-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}"
      >
        <Layers class="w-4 h-4" />
        <span>Fleet Mission Control</span>
      </button>

      <button
        onclick={() => dashboardState.setActiveTab('workforce')}
        class="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 {dashboardState.activeTab === 'workforce' ? 'border-emerald-500 text-emerald-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}"
      >
        <Briefcase class="w-4 h-4 text-emerald-400" />
        <span>Digital Workforce &amp; ROI</span>
        <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {dashboardState.workforceKPIs?.netFleetROI?.toLocaleString() || '6,650'}x ROI
        </span>
      </button>

      <button
        onclick={() => dashboardState.setActiveTab('waterfall')}
        class="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 {dashboardState.activeTab === 'waterfall' ? 'border-indigo-500 text-indigo-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}"
      >
        <Zap class="w-4 h-4 text-indigo-400" />
        <span>Token Telemetry &amp; Waterfall</span>
        <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Gantt FinOps
        </span>
      </button>

      <button
        onclick={() => dashboardState.setActiveTab('detail')}
        class="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 {dashboardState.activeTab === 'detail' ? 'border-brand-500 text-brand-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}"
      >
        <Activity class="w-4 h-4" />
        <span>Agent Coaching Studio</span>
        {#if degradedAgents.length > 0}
          <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
            {degradedAgents.length} Action Needed
          </span>
        {/if}
      </button>

      <button
        onclick={() => dashboardState.setActiveTab('finetune')}
        class="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 {dashboardState.activeTab === 'finetune' ? 'border-brand-500 text-brand-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}"
      >
        <Sliders class="w-4 h-4" />
        <span>Fleet Benchmark &amp; Sandbox</span>
        <span class="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
      </button>
    </div>
  </div>
</header>
