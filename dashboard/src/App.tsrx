import { dashboardState } from './state/dashboardState.js';
import { Header } from './components/layout/Header.tsrx';
import { PersistentTTRTimeline } from './components/timeline/PersistentTTRTimeline.tsrx';
import { OverviewView } from './components/overview/OverviewView.tsrx';
import { WorkforceScorecardView } from './components/workforce/WorkforceScorecardView.tsrx';
import { TokenWaterfallTrace } from './components/telemetry/TokenWaterfallTrace.tsrx';
import { AgentDetailView } from './components/detail/AgentDetailView.tsrx';
import { AgentFineTuneView } from './components/finetune/AgentFineTuneView.tsrx';

export function App() @{
  const activeTab = () => dashboardState.activeTab;

  <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500/30">
    {/* 1. Global Navigation Header */}
    <Header />

    {/* 2. PERSISTENT TIMELINE CHART: Placed on top of all page tabs */}
    <PersistentTTRTimeline />

    {/* 3. Main Dynamic Content: Switches between Overview, Workforce, Waterfall, Detail, Fine-Tune */}
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      @if (activeTab() === 'overview') {
        <OverviewView />
      } @else if (activeTab() === 'workforce') {
        <WorkforceScorecardView />
      } @else if (activeTab() === 'waterfall') {
        <TokenWaterfallTrace />
      } @else if (activeTab() === 'detail') {
        <AgentDetailView />
      } @else if (activeTab() === 'finetune') {
        <AgentFineTuneView />
      }
    </main>

    {/* 4. Footer */}
    <footer class="border-t border-slate-900 bg-slate-950/80 py-4 text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>NovaSmart AgentOps Platform {"•"} Operating Observability &amp; Telemetry</span>
        </div>

        <div class="flex items-center gap-4 text-[11px]">
          <span>Time-to-Result (TTR) Engine</span>
          <span>{"•"}</span>
          <span>Token Flow Architecture</span>
          <span>{"•"}</span>
          <span>Hallucination &amp; Reprompt Guardrails</span>
        </div>
      </div>
    </footer>
  </div>
}

export default App;
