import { track } from 'ripple';
import { dashboardState } from '../../state/dashboardState.js';
import { SankeyDiagram } from './SankeyDiagram.tsrx';
import { SvgBarChart } from '../common/SvgBarChart.tsrx';
import {
  CoinsIcon,
  CpuIcon,
  AlertTriangleIcon,
  ClockIcon,
  SparklesIcon,
  ZapIcon,
  CheckCircle2Icon,
  SlidersIcon,
  ShieldCheckIcon,
  WrenchIcon,
  ChevronRightIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  GridIcon,
  ListIcon,
  DollarSignIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '../common/Icons.tsrx';

export function OverviewView() @{
  const rosterMode = track<'grid' | 'table'>('grid');
  const filterStatus = track<'all' | 'action' | 'star'>('all');
  const showSimulator = track(false);

  const agents = () => dashboardState.agents;
  const fleetKPIs = () => dashboardState.fleetKPIs;
  const workforceKPIs = () => dashboardState.workforceKPIs;
  const simulatedWorkforce = () => dashboardState.simulatedWorkforce;
  const sankeyData = () => dashboardState.sankeyData;
  const humanHourlyWage = () => dashboardState.humanHourlyWage;

  const filteredAgents = () => {
    const list = agents();
    const status = filterStatus.value;
    return list.filter((agent: any) => {
      if (status === 'all') return true;
      if (status === 'action') return agent.status === 'degraded' || agent.workforce?.performanceGrade === 'C-';
      if (status === 'star') return agent.workforce?.performanceGrade === 'A+' || agent.workforce?.performanceGrade === 'A';
      return true;
    });
  };

  const tokenBreakdownData = () => {
    return agents().map((a: any) => ({
      name: a.name.split(' ')[0],
      fullName: a.name,
      Input: +(a.tokens.input / 1000000).toFixed(2),
      Output: +(a.tokens.output / 1000000).toFixed(2),
      Cached: +(a.tokens.cached / 1000000).toFixed(2),
      Reasoning: +(a.tokens.reasoning / 1000000).toFixed(2),
      total: +(a.tokens.total / 1000000).toFixed(2)
    }));
  };

  const errorRateData = () => {
    return agents().map((a: any) => ({
      name: a.name.split(' ')[0],
      fullName: a.name,
      agentId: a.id,
      'Hallucination Rate': a.errors.hallucinationRate,
      'Reprompt Rate': a.errors.repromptRate,
      status: a.status
    }));
  };

  function goToAgent(agentId: string, subTab = 'refine') {
    dashboardState.selectAgent(agentId, subTab);
  }

  <div class="space-y-6">
    {/* ACT 1: THE EXECUTIVE HERO STRIP (4 BALANCED PILLARS) */}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pillar 1: Enterprise Value & Net ROI */}
      <div class="glass-panel rounded-2xl p-5 relative overflow-hidden group border-emerald-500/20">
        <div class="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span class="flex items-center gap-1.5 text-emerald-300">
            <DollarSignIcon class="w-4 h-4 text-emerald-400" /> Net Economic Value &amp; ROI
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

      {/* Pillar 2: Human Labor Liberated */}
      <div class="glass-panel rounded-2xl p-5 relative overflow-hidden group border-sky-500/20">
        <div class="absolute -right-4 -bottom-4 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all"></div>
        <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span class="flex items-center gap-1.5 text-sky-300">
            <ClockIcon class="w-4 h-4 text-sky-400" /> Human Labor Liberated
          </span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">
            {workforceKPIs()?.fteEquivalency || 54.6} FTEs
          </span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-black text-white font-mono tracking-tight">
            {(workforceKPIs()?.totalHoursSaved || 34979).toLocaleString()}
          </span>
          <span class="text-xs text-slate-400 font-mono">hours saved</span>
        </div>
        <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Enterprise Tasks Completed:</span>
          <span class="font-mono text-slate-300 font-bold">{(workforceKPIs()?.totalTasksCompleted || 102920).toLocaleString()}</span>
        </div>
      </div>

      {/* Pillar 3: Quality & Autonomy */}
      <div class="glass-panel rounded-2xl p-5 relative overflow-hidden group border-indigo-500/20">
        <div class="absolute -right-4 -bottom-4 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
        <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span class="flex items-center gap-1.5 text-indigo-300">
            <ShieldCheckIcon class="w-4 h-4 text-indigo-400" /> Quality &amp; Autonomy
          </span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
            {workforceKPIs()?.fleetAutonomousResolution || 95.8}% Auto
          </span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-black text-white font-mono tracking-tight">
            {workforceKPIs()?.fleetFirstTimeRightRate || 89.8}%
          </span>
          <span class="text-xs text-slate-400 font-mono">First-Time Right</span>
        </div>
        <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Human Escalation Rate:</span>
          <span class="font-mono text-slate-300 font-bold">{workforceKPIs()?.fleetEscalationRate || 4.2}%</span>
        </div>
      </div>

      {/* Pillar 4: Unit Economics & Velocity */}
      <div class="glass-panel rounded-2xl p-5 relative overflow-hidden group border-amber-500/20">
        <div class="absolute -right-4 -bottom-4 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
        <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span class="flex items-center gap-1.5 text-amber-300">
            <ZapIcon class="w-4 h-4 text-amber-400" /> Unit Economics &amp; Velocity
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
          <span>Human Baseline Cost:</span>
          <span class="font-mono text-slate-400 line-through">${workforceKPIs()?.avgHumanCostPerWorkUnit || '26.80'} human</span>
        </div>
      </div>
    </div>

    {/* Fleet IAM & FinOps Governance Status Bar */}
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheckIcon class="w-5 h-5 text-indigo-400" />
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
          <ArrowRightIcon class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* INTERACTIVE WHAT-IF CORPORATE WAGE SIMULATOR DRAWER */}
    <div class="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 shadow-xl transition-all">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <SlidersIcon class="w-4 h-4" />
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
              Model annualized enterprise savings based on blended employee wages and autonomous task scaling.
            </p>
          </div>
        </div>

        <button
          onClick={() => { showSimulator.value = !showSimulator.value; }}
          class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto border border-slate-700"
        >
          <span>{showSimulator.value ? 'Close Simulator' : 'Adjust Wage & Scale Sliders'}</span>
          @if (showSimulator.value) {
            <ChevronUpIcon class="w-3.5 h-3.5" />
          } @else {
            <ChevronDownIcon class="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Expandable Simulator Controls */}
      @if (showSimulator.value) {
        <div class="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div class="flex items-center justify-between text-xs font-semibold">
              <span class="text-slate-300">Blended Human Payroll Benchmark:</span>
              <span class="font-mono text-emerald-400 text-sm font-bold">${humanHourlyWage()}/hr</span>
            </div>
            <input
              type="range"
              min="30"
              max="150"
              step="5"
              value={humanHourlyWage()}
              onInput={(e: any) => dashboardState.setHumanHourlyWage(Number(e.target.value))}
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
              onInput={(e: any) => dashboardState.setSimScaleMultiplier(Number(e.target.value))}
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
                <span class="text-xs text-slate-400 font-mono">annual net savings</span>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-emerald-500/20 font-mono">
              <span>Simulated FTEs: <strong class="text-white">{simulatedWorkforce().simulatedFTEs}</strong></span>
              <span>Projected ROI: <strong class="text-emerald-400">{simulatedWorkforce().simulatedROI}x</strong></span>
            </div>
          </div>
        </div>
      }
    </div>

    {/* ACT 2: 360° DIGITAL WORKFORCE ROSTER */}
    <section class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BriefcaseIcon class="w-5 h-5 text-emerald-400" />
            360° Digital Workforce Roster &amp; Operational Posture
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Fleet agents evaluated as digital workers: economic contributions, performance grade, and active supervisory policies.
          </p>
        </div>

        <div class="flex items-center gap-2">
          {/* Status Filter */}
          <div class="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => { filterStatus.value = 'all'; }}
              class={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterStatus.value === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({agents().length})
            </button>
            <button
              onClick={() => { filterStatus.value = 'action'; }}
              class={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterStatus.value === 'action' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Needs Review
            </button>
            <button
              onClick={() => { filterStatus.value = 'star'; }}
              class={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterStatus.value === 'star' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Top Performers
            </button>
          </div>

          {/* View Toggle */}
          <div class="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => { rosterMode.value = 'grid'; }}
              class={`p-1.5 rounded transition-colors ${rosterMode.value === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Grid Cards"
            >
              <GridIcon class="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { rosterMode.value = 'table'; }}
              class={`p-1.5 rounded transition-colors ${rosterMode.value === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Detailed Table"
            >
              <ListIcon class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Mode */}
      @if (rosterMode.value === "grid") {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (const agent of filteredAgents()) {
            <div
              onClick={() => goToAgent(agent.id, "refine")}
              class={`group relative bg-slate-950/70 border rounded-2xl p-4 transition-all duration-200 hover:shadow-xl cursor-pointer flex flex-col justify-between ${
                agent.status === "degraded" || agent.workforce?.performanceGrade === "C-"
                  ? "border-rose-500/40 hover:border-rose-500 shadow-rose-500/5"
                  : "border-slate-800 hover:border-brand-500/60 hover:shadow-brand-500/10"
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
                      <CpuIcon class="w-5 h-5" />
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                        {agent.workforce?.employeeTitle || agent.name}
                      </h4>
                      <span class="text-[10px] text-slate-400 block line-clamp-1">{agent.role}</span>
                    </div>
                  </div>

                  @if (agent.status === "active") {
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                      Healthy
                    </span>
                  } @else {
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0 animate-pulse">
                      Under Review
                    </span>
                  }
                </div>

                {/* Model & Latency */}
                <div class="flex items-center justify-between text-[11px] bg-slate-900/60 rounded-lg px-2.5 py-1.5 mb-2.5 border border-slate-850">
                  <span class="font-mono text-slate-400">Model: {agent.model}</span>
                  <span class="font-mono text-slate-200 font-semibold flex items-center gap-1">
                    <ClockIcon class="w-3 h-3 text-sky-400" /> {agent.avgLatency}s TTR
                  </span>
                </div>

                {/* ROI Badge */}
                @if (agent.workforce) {
                  <div class="flex items-center justify-between text-[10px] bg-emerald-950/30 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 mb-3">
                    <div class="flex items-center gap-1.5">
                      <span class="text-slate-300 font-medium">Grade:</span>
                      <span class={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        agent.workforce.performanceGrade === "A+" ? "bg-emerald-500/20 text-emerald-300" :
                        agent.workforce.performanceGrade === "C-" ? "bg-rose-500/20 text-rose-300" :
                        "bg-indigo-500/20 text-indigo-300"
                      }`}>
                        {agent.workforce.performanceGrade}
                      </span>
                    </div>
                    <span class="font-mono text-emerald-400 font-bold">
                      ${((agent.workforce.totalEconomicValue || 0) / 1000).toFixed(0)}k Net Value
                    </span>
                  </div>
                }

                {/* Token Consumption Strip */}
                <div class="space-y-1 mb-3">
                  <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Token Velocity:</span>
                    <span class="text-slate-200 font-semibold">{(agent.tokens.total / 1000000).toFixed(1)}M tokens</span>
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
                      agent.errors.hallucinationRate > 5.0 ? "text-rose-400" :
                      agent.errors.hallucinationRate > 3.0 ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {agent.errors.hallucinationRate}%
                    </span>
                  </div>
                  <div class="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                    <span class="text-[10px] text-slate-400 block">Reprompt Rate:</span>
                    <span class={`font-mono font-bold ${agent.errors.repromptRate > 8.0 ? "text-orange-400" : "text-slate-200"}`}>
                      {agent.errors.repromptRate}%
                    </span>
                  </div>
                </div>

                {/* Rules & Skills Posture */}
                <div class="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-850">
                  <span class="flex items-center gap-1">
                    <WrenchIcon class="w-3 h-3 text-brand-400" />
                    {agent.skills.filter((s: any) => s.enabled).length}/{agent.skills.length} Skills Active
                  </span>
                  @if (agent.rules.filter((r: any) => !r.enforced).length > 0) {
                    <span class="flex items-center gap-1 text-rose-400 font-semibold animate-pulse">
                      <AlertTriangleIcon class="w-3 h-3 text-rose-400" />
                      {agent.rules.filter((r: any) => !r.enforced).length} Unenforced Rules
                    </span>
                  } @else {
                    <span class="flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheckIcon class="w-3 h-3 text-emerald-400" />
                      All Rules Enforced
                    </span>
                  }
                </div>
              </div>

              <div class="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between">
                <span class="text-[11px] text-brand-400 group-hover:text-brand-300 font-medium flex items-center gap-1">
                  <span>{agent.status === "degraded" || agent.workforce?.performanceGrade === "C-" ? "Coach & Remediate" : "Inspect Dossier"}</span>
                  <ChevronRightIcon class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <button
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    goToAgent(agent.id, "iam");
                  }}
                  class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                >
                  IAM &amp; Quota {"→"}
                </button>
              </div>
            </div>
          }
        </div>
      }

      {/* Table Mode */}
      @if (rosterMode.value === "table") {
        <div class="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th class="py-3 px-4">Agent Role</th>
                <th class="py-3 text-center">Grade</th>
                <th class="py-3 text-right">Labor Saved</th>
                <th class="py-3 text-right">Quality (FTR)</th>
                <th class="py-3 text-right">Speedup</th>
                <th class="py-3 text-right">Unit Cost</th>
                <th class="py-3 text-right">Net Value</th>
                <th class="py-3 text-center pr-4">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-850">
              @for (const agent of filteredAgents()) {
                <tr
                  onClick={() => goToAgent(agent.id, "refine")}
                  class="hover:bg-slate-900/40 cursor-pointer transition-colors"
                >
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{
                          "background-color": `${agent.color}20`,
                          border: `1px solid ${agent.color}40`,
                          color: agent.color
                        }}
                      >
                        <CpuIcon class="w-4 h-4" />
                      </div>
                      <div>
                        <span class="font-bold text-white text-xs block">{agent.workforce?.employeeTitle || agent.name}</span>
                        <span class="text-[10px] text-slate-400 font-mono">
                          {agent.role} {"•"} {agent.model}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td class="py-3.5 text-center">
                    <span
                      class={`px-2 py-0.5 rounded text-xs font-black font-mono ${
                        agent.workforce?.performanceGrade === "A+" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                        agent.workforce?.performanceGrade === "C-" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse" :
                        "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {agent.workforce?.performanceGrade || "A"}
                    </span>
                  </td>

                  <td class="py-3.5 text-right font-mono">
                    <span class="text-slate-200 font-bold block">
                      {agent.workforce?.humanLaborHoursSaved?.toLocaleString() || 0} hrs
                    </span>
                    <span class="text-[10px] text-slate-500">
                      {((agent.workforce?.humanLaborHoursSaved || 0) / 2000).toFixed(1)} FTEs
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
                    ${agent.workforce?.costPerWorkUnit || "0.005"}
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
                      onClick={(e: MouseEvent) => { e.stopPropagation(); goToAgent(agent.id, "refine"); }}
                      class={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all mx-auto ${
                        agent.status === "degraded" || agent.workforce?.performanceGrade === "C-"
                          ? "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
                          : "bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/40"
                      }`}
                    >
                      <span>{agent.status === "degraded" || agent.workforce?.performanceGrade === "C-" ? "Coach" : "Tune"}</span>
                      <ChevronRightIcon class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>

    {/* Flow Breakdown Section (no "sankey" word) */}
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
              <CoinsIcon class="w-4 h-4 text-brand-400" />
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
            stacked={true}
            tooltipFormatter={(val, _) => `${val}M tokens`}
          />
        </div>

        <div class="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <SparklesIcon class="w-3.5 h-3.5 text-pink-400" /> Deep Research consumes 4.7M reasoning tokens (55% of fleet total)
          </span>
          <button
            onClick={() => goToAgent('deep-research', 'telemetry')}
            class="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
          >
            Inspect Details {"→"}
          </button>
        </div>
      </div>

      {/* Chart 2: Error Rate Matrix */}
      <div class="glass-panel rounded-2xl p-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <AlertTriangleIcon class="w-4 h-4 text-rose-400" />
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
            stacked={false}
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
            <SlidersIcon class="w-3.5 h-3.5" /> Refine Promo Agent
          </button>
        </div>
      </div>
    </div>
  </div>
}
