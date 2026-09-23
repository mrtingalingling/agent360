import { createSignal, createMemo, Show, For } from 'solid-js';
import { dashboardState } from '../../state/dashboardState.js';
import { SankeyDiagram } from './SankeyDiagram.jsx';
import SvgBarChart from '../common/SvgBarChart.jsx';
import {
  Coins,
  Cpu,
  AlertTriangle,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Wrench,
  ChevronRight,
  Briefcase,
  ArrowRight,
  LayoutGrid,
  List,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Cloud,
  ExternalLink
} from 'lucide-solid';

export function OverviewView() {
  const [rosterMode, setRosterMode] = createSignal('grid'); // 'grid' | 'table'
  const [filterStatus, setFilterStatus] = createSignal('all'); // 'all' | 'action' | 'star'
  const [showSimulator, setShowSimulator] = createSignal(false);

  const agents = () => dashboardState.agents;
  const fleetKPIs = () => dashboardState.fleetKPIs;
  const workforceKPIs = () => dashboardState.workforceKPIs;
  const simulatedWorkforce = () => dashboardState.simulatedWorkforce;
  const sankeyData = () => dashboardState.sankeyData;
  const humanHourlyWage = () => dashboardState.humanHourlyWage;

  const filteredAgents = createMemo(() => {
    const list = agents();
    const status = filterStatus();
    return list.filter(agent => {
      if (status === 'all') return true;
      if (status === 'action') return agent.status === 'degraded' || agent.workforce?.performanceGrade === 'C-';
      if (status === 'star') return agent.workforce?.performanceGrade === 'A+' || agent.workforce?.performanceGrade === 'A';
      return true;
    });
  });

  const tokenBreakdownData = createMemo(() => {
    return agents().map(a => ({
      name: a.name.split(' ')[0],
      fullName: a.name,
      Input: +(a.tokens.input / 1000000).toFixed(2),
      Output: +(a.tokens.output / 1000000).toFixed(2),
      Cached: +(a.tokens.cached / 1000000).toFixed(2),
      Reasoning: +(a.tokens.reasoning / 1000000).toFixed(2),
      total: +(a.tokens.total / 1000000).toFixed(2)
    }));
  });

  const errorRateData = createMemo(() => {
    return agents().map(a => ({
      name: a.name.split(' ')[0],
      fullName: a.name,
      agentId: a.id,
      'Hallucination Rate': a.errors.hallucinationRate,
      'Reprompt Rate': a.errors.repromptRate,
      status: a.status
    }));
  });

  function goToAgent(agentId, subTab = 'refine') {
    dashboardState.selectAgent(agentId, subTab);
  }

  return (
    <div class="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          ACT 1: THE EXECUTIVE HERO STRIP (4 BALANCED PILLARS)
      ───────────────────────────────────────────────────────────── */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Enterprise Value & Net ROI */}
        <div class="glass-panel rounded-2xl p-5 relative overflow-hidden group border-emerald-500/20">
          <div class="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span class="flex items-center gap-1.5 text-emerald-300">
              <DollarSign class="w-4 h-4 text-emerald-400" /> Net Economic Value &amp; ROI
            </span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              {Math.round(workforceKPIs()?.netFleetROI || 7700).toLocaleString()}x ROI
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-white font-mono tracking-tight">
              ${((workforceKPIs()?.totalEconomicValue || 2660000) / 1000000).toFixed(2)}M
            </span>
            <span class="text-xs text-slate-400 font-mono">net delivered</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Inference Spend:</span>
            <span class="font-mono text-slate-300 font-bold">${Number(workforceKPIs()?.totalComputeCost || 400.37).toFixed(2)} total</span>
          </div>
        </div>

        {/* Pillar 2: Operational Capacity & Value Added */}
        <div class="glass-panel rounded-2xl p-5 relative overflow-hidden group border-sky-500/20">
          <div class="absolute -right-4 -bottom-4 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all"></div>
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span class="flex items-center gap-1.5 text-sky-300">
              <Clock class="w-4 h-4 text-sky-400" /> Operational Capacity Added
            </span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">
              +{workforceKPIs()?.fteEquivalency || 54.6} FTE Capacity
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-white font-mono tracking-tight">
              {(workforceKPIs()?.totalHoursSaved || 34979).toLocaleString()}
            </span>
            <span class="text-xs text-slate-400 font-mono">hours automated</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Work Units Completed:</span>
            <span class="font-mono text-slate-300 font-bold">{(workforceKPIs()?.totalTasksCompleted || 99400).toLocaleString()} tasks</span>
          </div>
        </div>

        {/* Pillar 3: Work Quality & Accuracy */}
        <div class="glass-panel rounded-2xl p-5 relative overflow-hidden group border-indigo-500/20">
          <div class="absolute -right-4 -bottom-4 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span class="flex items-center gap-1.5 text-indigo-300">
              <ShieldCheck class="w-4 h-4 text-indigo-400" /> Quality &amp; Autonomy
            </span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              {workforceKPIs()?.fleetAutonomousResolution || 95.8}% Auto
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-indigo-300 font-mono tracking-tight">
              {workforceKPIs()?.fleetFirstTimeRightRate || 89.8}%
            </span>
            <span class="text-xs text-slate-400">clean one-shot</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Supervisor Escalation Rate:</span>
            <span class="font-mono text-amber-300 font-bold">{workforceKPIs()?.fleetEscalationRate || 4.2}% fleet avg</span>
          </div>
        </div>

        {/* Pillar 4: Unit Economics & Response Velocity */}
        <div class="glass-panel rounded-2xl p-5 relative overflow-hidden group border-amber-500/20">
          <div class="absolute -right-4 -bottom-4 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span class="flex items-center gap-1.5 text-amber-300">
              <Zap class="w-4 h-4 text-amber-400" /> Unit Cost &amp; Velocity
            </span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
              {fleetKPIs()?.avgLatency || '1.20'}s TTR
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-amber-400 font-mono tracking-tight">
              ${workforceKPIs()?.avgCostPerWorkUnit || '0.0040'}
            </span>
            <span class="text-xs text-slate-400 font-mono">per task</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Target Value Benchmark:</span>
            <span class="font-mono text-emerald-400/90 font-bold">${workforceKPIs()?.avgHumanCostPerWorkUnit || '26.80'} value/task</span>
          </div>
        </div>
      </div>

      {/* Fleet IAM & FinOps Governance Status Bar */}
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck class="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-white uppercase tracking-wider">Fleet IAM &amp; FinOps Governance</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                83% Isolated Identities
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                BigQuery Quotas Enforced
              </span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">
              5 of 6 active agents bound to dedicated least-privilege GCP Service Accounts. BigQuery query scan caps active at 5–25 GB to protect corporate budgets.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => goToAgent('promo-shadow', 'iam')}
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all shadow-xs"
          >
            <span>Configure Agent IAM &amp; Cost Caps</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          INTERACTIVE WHAT-IF CORPORATE WAGE SIMULATOR DRAWER
      ───────────────────────────────────────────────────────────── */}
      <div class="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 shadow-xl transition-all">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Sliders class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-bold text-white">
                  Corporate ROI &amp; Wage Scaling Simulator
                </h4>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Interactive Forecast
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Model annualized enterprise value added based on operational wage benchmarks and autonomous task scaling.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSimulator(!showSimulator())}
            class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto border border-slate-700"
          >
            <span>{showSimulator() ? 'Close Simulator' : 'Adjust Wage & Scale Sliders'}</span>
            <Show when={showSimulator()} fallback={<ChevronDown class="w-3.5 h-3.5" />}>
              <ChevronUp class="w-3.5 h-3.5" />
            </Show>
          </button>
        </div>

        {/* Expandable Simulator Controls */}
        <Show when={showSimulator()}>
          <div class="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-slate-300">Operational Wage Benchmark:</span>
                <span class="font-mono text-emerald-400 text-sm font-bold">${humanHourlyWage()}/hr</span>
              </div>
              <input
                type="range"
                min="30"
                max="150"
                step="5"
                value={humanHourlyWage()}
                onInput={(e) => dashboardState.setHumanHourlyWage(Number(e.target.value))}
                class="w-full accent-emerald-500 cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$30/hr (Tier 1 Support)</span>
                <span>$65/hr (Blended Avg)</span>
                <span>$150/hr (Senior Analyst)</span>
              </div>
            </div>

            <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-slate-300">Autonomous Adoption Scale Multiplier:</span>
                <span class="font-mono text-brand-400 text-sm font-bold">{dashboardState.simScaleMultiplier}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.25"
                value={dashboardState.simScaleMultiplier}
                onInput={(e) => dashboardState.setSimScaleMultiplier(Number(e.target.value))}
                class="w-full accent-brand-500 cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5x (Pilot)</span>
                <span>1.0x (Current)</span>
                <span>5.0x (Enterprise Rollout)</span>
              </div>
            </div>

            <div class="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <span class="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block mb-1">
                  Projected Annual Enterprise Output
                </span>
                <div class="flex items-baseline gap-2">
                  <span class="text-2xl font-black font-mono text-emerald-300">
                    ${(simulatedWorkforce().annualizedNetSavings / 1000000).toFixed(2)}M
                  </span>
                  <span class="text-xs text-slate-400 font-mono">annual net value added</span>
                </div>
              </div>
              <div class="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-emerald-500/20 font-mono">
                <span>ROI: {simulatedWorkforce().simulatedROI.toLocaleString()}x</span>
                <span class="text-emerald-400 font-bold">+{simulatedWorkforce().simulatedFTEs} FTE Capacity</span>
              </div>
            </div>
          </div>
        </Show>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ACT 2: 360° DIGITAL WORKFORCE ROSTER (GRID vs TABLE)
      ───────────────────────────────────────────────────────────── */}
      <section class="glass-panel rounded-2xl p-6 border-slate-800 shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Briefcase class="w-5 h-5 text-brand-400" />
                360° Digital Workforce Roster &amp; Operations Command
              </h3>
              <span class="px-2 py-0.5 text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full">
                6 Active Digital Employees
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Select any agent to inspect its operational telemetry or open its Coaching Studio to refine skills, rules, models, and prompts.
            </p>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            {/* Filter Chips */}
            <div class="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                class={`px-3 py-1 rounded-lg font-medium transition-colors ${filterStatus() === 'all' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All (6)
              </button>
              <button
                onClick={() => setFilterStatus('star')}
                class={`px-3 py-1 rounded-lg font-medium transition-colors ${filterStatus() === 'star' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Star Performers (5)
              </button>
              <button
                onClick={() => setFilterStatus('action')}
                class={`px-3 py-1 rounded-lg font-medium transition-colors ${filterStatus() === 'action' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Under Coaching (1)
              </button>
            </div>

            {/* Mode Switcher */}
            <div class="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setRosterMode('grid')}
                class={`p-1.5 rounded-lg transition-colors ${rosterMode() === 'grid' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
                title="Grid Radar View"
              >
                <LayoutGrid class="w-4 h-4" />
              </button>
              <button
                onClick={() => setRosterMode('table')}
                class={`p-1.5 rounded-lg transition-colors ${rosterMode() === 'table' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
                title="Executive Leaderboard Table"
              >
                <List class="w-4 h-4" />
              </button>
            </div>

            {/* Quick Gemini Enterprise Deep Link */}
            <a
              href={dashboardState.getConsoleDeepLinks().geminiEnterprise}
              target="_blank"
              rel="noopener noreferrer"
              class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 text-xs font-semibold transition-all shadow-xs"
              title="Open Gemini Enterprise App Studio in Google Cloud Console"
            >
              <Cloud class="w-3.5 h-3.5 text-indigo-400" />
              <span>Gemini Enterprise Studio</span>
              <ExternalLink class="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        <Show
          when={rosterMode() === 'table'}
          fallback={
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <For each={filteredAgents()}>
                {(agent) => {
                  const unenforcedRules = () => agent.rules.filter(r => !r.enforced);
                  const activeSkillsCount = () => agent.skills.filter(s => s.enabled).length;
                  const isDegraded = () => agent.status === 'degraded' || agent.workforce?.performanceGrade === 'C-';

                  return (
                    <div
                      onClick={() => goToAgent(agent.id, 'refine')}
                      class={`group relative bg-slate-950/70 border rounded-2xl p-4 transition-all duration-200 hover:shadow-xl cursor-pointer flex flex-col justify-between ${
                        isDegraded()
                          ? 'border-rose-500/40 hover:border-rose-500 shadow-rose-500/5'
                          : 'border-slate-800 hover:border-brand-500/60 hover:shadow-brand-500/10'
                      }`}
                    >
                      <div>
                        <div class="flex items-start justify-between gap-2 mb-3">
                          <div class="flex items-center gap-2.5">
                            <div
                              class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md"
                              style={{
                                "background-color": `${agent.color}20`,
                                border: `1px solid ${agent.color}40`,
                                color: agent.color
                              }}
                            >
                              <Cpu class="w-5 h-5" />
                            </div>
                            <div>
                              <h4 class="text-xs font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                                {agent.workforce?.employeeTitle || agent.name}
                              </h4>
                              <span class="text-[10px] text-slate-400 block line-clamp-1">{agent.role}</span>
                            </div>
                          </div>

                          <Show
                            when={agent.status === 'active'}
                            fallback={
                              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0 animate-pulse">
                                Under Review
                              </span>
                            }
                          >
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                              Healthy
                            </span>
                          </Show>
                        </div>

                        {/* Model & Latency */}
                        <div class="flex items-center justify-between text-[11px] bg-slate-900/60 rounded-lg px-2.5 py-1.5 mb-2.5 border border-slate-850">
                          <span class="font-mono text-slate-400">Model: {agent.model}</span>
                          <span class="font-mono text-slate-200 font-semibold flex items-center gap-1">
                            <Clock class="w-3 h-3 text-sky-400" /> {agent.avgLatency}s TTR
                          </span>
                        </div>

                        {/* ROI Badge */}
                        <Show when={agent.workforce}>
                          <div class="flex items-center justify-between text-[10px] bg-emerald-950/30 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 mb-3">
                            <div class="flex items-center gap-1.5">
                              <span class="text-slate-300 font-medium">Grade:</span>
                              <span class={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                agent.workforce.performanceGrade === 'A+' ? 'bg-emerald-500/20 text-emerald-300' :
                                agent.workforce.performanceGrade === 'C-' ? 'bg-rose-500/20 text-rose-300' :
                                'bg-indigo-500/20 text-indigo-300'
                              }`}>
                                {agent.workforce.performanceGrade}
                              </span>
                            </div>
                            <span class="font-mono text-emerald-400 font-bold">
                              ${((agent.workforce.totalEconomicValue || 0) / 1000).toFixed(0)}k Value ({Math.round(agent.workforce.netROI).toLocaleString()}x ROI)
                            </span>
                          </div>
                        </Show>

                        {/* Token Breakdown Bar */}
                        <div class="mb-3">
                          <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span>Tokens: {(agent.tokens.total / 1000000).toFixed(1)}M</span>
                            <span class="font-mono text-slate-300">${agent.costEstimate}</span>
                          </div>
                          <div class="w-full h-1.5 rounded-full bg-slate-800 flex overflow-hidden">
                            <div class="bg-indigo-500 h-full" style={{ width: `${(agent.tokens.input / agent.tokens.total) * 100}%` }} title="Input"></div>
                            <div class="bg-emerald-500 h-full" style={{ width: `${(agent.tokens.output / agent.tokens.total) * 100}%` }} title="Output"></div>
                            <div class="bg-amber-500 h-full" style={{ width: `${(agent.tokens.cached / agent.tokens.total) * 100}%` }} title="Cached"></div>
                            <div class="bg-pink-500 h-full" style={{ width: `${(agent.tokens.reasoning / agent.tokens.total) * 100}%` }} title="Reasoning"></div>
                          </div>
                        </div>

                        {/* Dual Error Profile Strip */}
                        <div class="grid grid-cols-2 gap-2 text-[11px] mb-3">
                          <div class="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                            <span class="text-[10px] text-slate-400 block">Hallucination Rate:</span>
                            <span class={`font-mono font-bold ${
                              agent.errors.hallucinationRate > 5.0 ? 'text-rose-400' :
                              agent.errors.hallucinationRate > 3.0 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {agent.errors.hallucinationRate}%
                            </span>
                          </div>
                          <div class="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                            <span class="text-[10px] text-slate-400 block">Reprompt Rate:</span>
                            <span class={`font-mono font-bold ${agent.errors.repromptRate > 8.0 ? 'text-orange-400' : 'text-slate-200'}`}>
                              {agent.errors.repromptRate}%
                            </span>
                          </div>
                        </div>

                        {/* Rules & Skills Posture */}
                        <div class="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-850">
                          <span class="flex items-center gap-1">
                            <Wrench class="w-3 h-3 text-brand-400" />
                            {activeSkillsCount()}/{agent.skills.length} Skills Active
                          </span>
                          <Show
                            when={unenforcedRules().length > 0}
                            fallback={
                              <span class="flex items-center gap-1 text-emerald-400 font-medium">
                                <ShieldCheck class="w-3 h-3 text-emerald-400" />
                                All Rules Enforced
                              </span>
                            }
                          >
                            <span class="flex items-center gap-1 text-rose-400 font-semibold">
                              <AlertTriangle class="w-3 h-3 text-rose-400" />
                              {unenforcedRules().length} Rule Disabled
                            </span>
                          </Show>
                        </div>
                      </div>

                      {/* Action Link */}
                      <div class="mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-between text-[11px]">
                        <span class="text-brand-400 font-semibold group-hover:underline flex items-center gap-1">
                          {isDegraded() ? 'Coach & Refine Agent' : 'Open Agent Studio'} <ChevronRight class="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </span>
                        <span class="text-[10px] text-slate-500 font-mono">
                          {isDegraded() ? 'Priority Fix' : 'Fine-Tune'}
                        </span>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          }
        >
          {/* Table Mode */}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th class="pb-3 pl-2">Digital Employee &amp; Role</th>
                  <th class="pb-3 text-center">Grade</th>
                  <th class="pb-3 text-right">Capacity Added</th>
                  <th class="pb-3 text-right">FTR Rate</th>
                  <th class="pb-3 text-right">Speedup</th>
                  <th class="pb-3 text-right">Unit Cost</th>
                  <th class="pb-3 text-right">Net Value Delivered</th>
                  <th class="pb-3 text-center pr-2">Coaching</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-850">
                <For each={filteredAgents()}>
                  {(agent) => {
                    const isDegraded = () => agent.status === 'degraded' || agent.workforce?.performanceGrade === 'C-';

                    return (
                      <tr
                        class="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                        onClick={() => goToAgent(agent.id, 'refine')}
                      >
                        <td class="py-3.5 pl-2">
                          <div class="flex items-center gap-3">
                            <div
                              class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
                              style={{
                                "background-color": `${agent.color}20`,
                                border: `1px solid ${agent.color}40`,
                                color: agent.color
                              }}
                            >
                              <Cpu class="w-4 h-4" />
                            </div>
                            <div>
                              <span class="font-bold text-slate-200 group-hover:text-brand-300 transition-colors block">
                                {agent.workforce?.employeeTitle || agent.name}
                              </span>
                              <span class="text-[10px] text-slate-500 font-mono">
                                {agent.name} &bull; {agent.model}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td class="py-3.5 text-center">
                          <span
                            class={`px-2 py-0.5 rounded text-xs font-black font-mono ${
                              agent.workforce?.performanceGrade === 'A+' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              agent.workforce?.performanceGrade === 'C-' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse' :
                              'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {agent.workforce?.performanceGrade || 'A'}
                          </span>
                        </td>

                        <td class="py-3.5 text-right font-mono">
                          <span class="text-slate-200 font-bold block">
                            {agent.workforce?.humanLaborHoursSaved?.toLocaleString() || 0} hrs
                          </span>
                          <span class="text-[10px] text-slate-500">
                            +{((agent.workforce?.humanLaborHoursSaved || 0) / 2000).toFixed(1)} FTE cap.
                          </span>
                        </td>

                        <td class="py-3.5 text-right font-mono">
                          <span class="text-slate-200 font-bold">
                            {agent.workforce?.firstTimeRightRate}%
                          </span>
                          <span class="text-[10px] text-slate-500 block">
                            {agent.errors.hallucinationRate}% hall.
                          </span>
                        </td>

                        <td class="py-3.5 text-right font-mono text-slate-200">
                          {agent.workforce?.speedupMultiplier || 500}x
                        </td>

                        <td class="py-3.5 text-right font-mono text-slate-300">
                          ${agent.workforce?.costPerWorkUnit || '0.005'}
                        </td>

                        <td class="py-3.5 text-right font-mono">
                          <span class="text-emerald-400 font-bold text-sm block">
                            ${((agent.workforce?.totalEconomicValue || 0) / 1000).toFixed(0)}k
                          </span>
                          <span class="text-[10px] text-slate-500">
                            {Math.round(agent.workforce?.netROI || 0).toLocaleString()}x ROI
                          </span>
                        </td>

                        <td class="py-3.5 text-center pr-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); goToAgent(agent.id, 'refine'); }}
                            class={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all mx-auto ${
                              isDegraded()
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20'
                                : 'bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/40'
                            }`}
                          >
                            <span>{isDegraded() ? 'Coach' : 'Tune'}</span>
                            <ChevronRight class="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  }}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </section>

      {/* Sankey Breakdown Section */}
      <section>
        <SankeyDiagram data={sankeyData()} height={460} width={980} />
      </section>

      {/* Split Charts Section */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Token Breakdown */}
        <div class="glass-panel rounded-2xl p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Coins class="w-4 h-4 text-brand-400" />
                Token Type Breakdown by Agent
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                Input, Output, Cached Context &amp; Chain-of-Thought Reasoning tokens (Millions)
              </p>
            </div>
            <span class="text-[11px] font-mono text-slate-400">Total: {(fleetKPIs().totalTokens / 1000000).toFixed(1)}M</span>
          </div>

          <div class="h-64 w-full">
            <SvgBarChart
              data={tokenBreakdownData()}
              xKey="name"
              bars={[
                { key: 'Input', name: 'Input', color: '#6366f1' },
                { key: 'Output', name: 'Output', color: '#10b981' },
                { key: 'Cached', name: 'Cached', color: '#f59e0b' },
                { key: 'Reasoning', name: 'Reasoning', color: '#ec4899' }
              ]}
              yUnit="M"
              height={256}
              isStacked={true}
              tooltipFormatter={(val, _) => `${val}M tokens`}
            />
          </div>

          <div class="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-pink-400" /> Deep Research consumes 4.7M reasoning tokens (55% of fleet total)
            </span>
            <button
              onClick={() => goToAgent('deep-research', 'telemetry')}
              class="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              Inspect Details →
            </button>
          </div>
        </div>

        {/* Chart 2: Error Rate Matrix */}
        <div class="glass-panel rounded-2xl p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <AlertTriangle class="w-4 h-4 text-rose-400" />
                Error Rate Matrix: Hallucination vs. Reprompting
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                Comparison of factual hallucination percentage and reprompting loop frequency
              </p>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
              Action Threshold: &gt;5%
            </span>
          </div>

          <div class="h-64 w-full">
            <SvgBarChart
              data={errorRateData()}
              xKey="name"
              bars={[
                { key: 'Hallucination Rate', name: 'Hallucination Rate', color: '#f43f5e' },
                { key: 'Reprompt Rate', name: 'Reprompt Rate', color: '#f97316' }
              ]}
              yUnit="%"
              height={256}
              isStacked={false}
              tooltipFormatter={(val, _) => `${val}%`}
            />
          </div>

          <div class="mt-3 pt-3 border-t border-slate-800 text-xs flex items-center justify-between">
            <span class="text-slate-400 text-[11px]">
              Promo Strategy Shadow exceeds error threshold (12.4% loops)
            </span>
            <button
              onClick={() => goToAgent('promo-shadow', 'refine')}
              class="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sliders class="w-3.5 h-3.5" /> Refine Promo Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
