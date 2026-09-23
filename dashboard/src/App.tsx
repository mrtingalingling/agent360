import { component$, useContextProvider, useStore } from '@builder.io/qwik';
import { DashboardContext, createDashboardState } from './state/dashboardState';
import { Header } from './components/layout/Header';
import { PersistentTTRTimeline } from './components/timeline/PersistentTTRTimeline';
import { OverviewView } from './components/overview/OverviewView';
import { AgentDetailView } from './components/detail/AgentDetailView';
import { AgentFineTuneView } from './components/finetune/AgentFineTuneView';
import { WorkforceScorecardView } from './components/workforce/WorkforceScorecardView';
import { TokenWaterfallTrace } from './components/telemetry/TokenWaterfallTrace';

export const App = component$(() => {
  const state = createDashboardState((initial) => useStore(initial, { deep: true }));
  if (typeof window !== 'undefined') {
    (window as any).dashboardState = state;
  }
  useContextProvider(DashboardContext, state);

  return (
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500/30">
      {/* 1. Global Navigation Header */}
      <Header />

      {/* 2. PERSISTENT TIMELINE CHART: Placed on top of all page tabs */}
      <PersistentTTRTimeline />

      {/* 3. Main Dynamic Content: Switches between Overview, Workforce, Waterfall, Detail, Fine-Tune */}
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {state.activeTab === 'overview' && <OverviewView />}
        {state.activeTab === 'workforce' && <WorkforceScorecardView />}
        {state.activeTab === 'waterfall' && <TokenWaterfallTrace />}
        {state.activeTab === 'detail' && <AgentDetailView />}
        {state.activeTab === 'finetune' && <AgentFineTuneView />}
      </main>

      {/* 4. Footer */}
      <footer class="border-t border-slate-900 bg-slate-950/80 py-4 text-xs text-slate-500">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>NovaSmart AgentOps Platform &bull; Operating Observability &amp; Telemetry</span>
          </div>

          <div class="flex items-center gap-4 text-[11px]">
            <span>Time-to-Result (TTR) Engine</span>
            <span>&bull;</span>
            <span>Token Flow Architecture</span>
            <span>&bull;</span>
            <span>Hallucination &amp; Reprompt Guardrails</span>
          </div>
        </div>
      </footer>
    </div>
  );
});

export default App;
