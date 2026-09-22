import React from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Header } from './components/layout/Header';
import { PersistentTTRTimeline } from './components/timeline/PersistentTTRTimeline';
import { OverviewView } from './components/overview/OverviewView';
import { AgentDetailView } from './components/detail/AgentDetailView';
import { AgentFineTuneView } from './components/finetune/AgentFineTuneView';
import { WorkforceScorecardView } from './components/workforce/WorkforceScorecardView';
import TokenWaterfallTrace from './components/telemetry/TokenWaterfallTrace';
import { Shield, Sparkles, Terminal, Activity } from 'lucide-react';

function DashboardContent() {
  const { activeTab } = useDashboard();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500/30">
      {/* 1. Global Navigation Header */}
      <Header />

      {/* 2. PERSISTENT TIMELINE CHART: Placed on top of all page tabs */}
      <PersistentTTRTimeline />

      {/* 3. Main Dynamic Content: Switches between Overview, Workforce, Waterfall, Detail, Fine-Tune */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && <OverviewView />}
        {activeTab === 'workforce' && <WorkforceScorecardView />}
        {activeTab === 'waterfall' && <TokenWaterfallTrace />}
        {activeTab === 'detail' && <AgentDetailView />}
        {activeTab === 'finetune' && <AgentFineTuneView />}
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>NovaSmart AgentOps Platform &bull; Operating Observability &amp; Telemetry</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Time-to-Result (TTR) Engine</span>
            <span>&bull;</span>
            <span>Sankey Token Flow</span>
            <span>&bull;</span>
            <span>Hallucination &amp; Reprompt Guardrails</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default App;
