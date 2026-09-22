<script>
  import Header from './components/layout/Header.svelte';
  import PersistentTTRTimeline from './components/timeline/PersistentTTRTimeline.svelte';
  import OverviewView from './components/overview/OverviewView.svelte';
  import WorkforceScorecardView from './components/workforce/WorkforceScorecardView.svelte';
  import TokenWaterfallTrace from './components/telemetry/TokenWaterfallTrace.svelte';
  import AgentDetailView from './components/detail/AgentDetailView.svelte';
  import AgentFineTuneView from './components/finetune/AgentFineTuneView.svelte';
  import { dashboardState } from './state/dashboardState.svelte.js';

  const activeTab = $derived(dashboardState.activeTab);
</script>

<div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500/30">
  <!-- 1. Global Navigation Header -->
  <Header />

  <!-- 2. PERSISTENT TIMELINE CHART: Placed on top of all page tabs -->
  <PersistentTTRTimeline />

  <!-- 3. Main Dynamic Content: Switches between Overview, Workforce, Waterfall, Detail, Fine-Tune -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {#if activeTab === 'overview'}
      <OverviewView />
    {:else if activeTab === 'workforce'}
      <WorkforceScorecardView />
    {:else if activeTab === 'waterfall'}
      <TokenWaterfallTrace />
    {:else if activeTab === 'detail'}
      <AgentDetailView />
    {:else if activeTab === 'finetune'}
      <AgentFineTuneView />
    {/if}
  </main>

  <!-- 4. Footer -->
  <footer class="border-t border-slate-900 bg-slate-950/80 py-4 text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>NovaSmart AgentOps Platform &bull; Operating Observability &amp; Telemetry</span>
      </div>

      <div class="flex items-center gap-4 text-[11px]">
        <span>Time-to-Result (TTR) Engine</span>
        <span>&bull;</span>
        <span>Sankey Token Flow</span>
        <span>&bull;</span>
        <span>Hallucination &amp; Reprompt Guardrails</span>
      </div>
    </div>
  </footer>
</div>
