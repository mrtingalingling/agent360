import { track } from 'ripple';
import { dashboardState } from '../../state/dashboardState.js';
import { SvgBarChart } from '../common/SvgBarChart.tsrx';
import {
  BriefcaseIcon,
  TrendingUpIcon,
  DollarSignIcon,
  AwardIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  UsersIcon,
  ZapIcon,
  ChevronRightIcon,
  ShieldIcon,
  SparklesIcon,
  SlidersIcon,
  CpuIcon,
  BarChart3Icon,
  PercentIcon,
  ArrowRightIcon
} from '../common/Icons.tsrx';

export function WorkforceScorecardView() @{
  const agents = () => dashboardState.agents;
  const workforceKPIs = () => dashboardState.workforceKPIs;
  const simulatedWorkforce = () => dashboardState.simulatedWorkforce;
  const humanHourlyWage = () => dashboardState.humanHourlyWage;
  const simScaleMultiplier = () => dashboardState.simScaleMultiplier;

  const selectedAgentDetail = track<any>(dashboardState.agents[1] || dashboardState.agents[0] || null);

  const valueVsCostData = () => {
    return agents().map((a: any) => {
      const wf = a.workforce || {};
      return {
        name: a.name.split(' ')[0],
        fullName: a.name,
        agentId: a.id,
        economicValue: Math.round((wf.totalEconomicValue || 0) / 1000), // in Thousands USD
        computeCost: Math.round(a.costEstimate),
        netROI: wf.netROI || 1000,
        grade: wf.performanceGrade || 'A',
        color: a.color
      };
    });
  };

  function goToAgent(agentId: string, subTab = 'refine') {
    dashboardState.selectAgent(agentId, subTab);
  }

  <div class="space-y-6">
    {/* 1. EXECUTIVE WORKFORCE HERO STRIP */}
    <div class="relative overflow-hidden glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
      <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div class="absolute bottom-0 left-1/3 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <BriefcaseIcon class="w-5 h-5" />
              </div>
              <div>
                <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Digital Workforce ROI &amp; Performance Scorecard
                </h1>
                <p class="text-xs text-slate-400 mt-0.5">
                  Managing AI Agents as Autonomous Employees: Quality, Velocity, Unit Economics &amp; Enterprise Payback
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-2 shadow-xs">
              <TrendingUpIcon class="w-4 h-4 text-emerald-400" />
              Fleet ROI: {(workforceKPIs()?.netFleetROI || 7700).toLocaleString()}x Payback
            </span>
          </div>
        </div>

        {/* 4 Core Executive Metric Pillars */}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Metric 1: Net Economic Value Delivered */}
          <div class="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-emerald-500/40 transition-all">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span class="flex items-center gap-1.5">
                <DollarSignIcon class="w-4 h-4 text-emerald-400" /> Net Economic Value
              </span>
              <span class="text-[10px] font-mono text-emerald-400 font-bold">
                {workforceKPIs()?.netFleetROI}x Return
              </span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                ${((workforceKPIs()?.totalEconomicValue || 2660000) / 1000000).toFixed(2)}M
              </span>
            </div>
            <div class="mt-2.5 pt-2.5 border-t border-slate-855 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Total Compute Cost:</span>
              <span class="font-mono text-slate-300 font-semibold">${workforceKPIs()?.totalCost}</span>
            </div>
          </div>

          {/* Metric 2: Operational Labor Delivered */}
          <div class="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-sky-500/40 transition-all">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span class="flex items-center gap-1.5">
                <UsersIcon class="w-4 h-4 text-sky-400" /> Operational Hours Delivered
              </span>
              <span class="text-[10px] font-mono text-sky-400 font-bold">
                {workforceKPIs()?.fleetAutonomousResolution}% Auto
              </span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {(workforceKPIs()?.totalHoursSaved || 34979).toLocaleString()}
              </span>
              <span class="text-xs text-slate-400 font-mono">hours automated</span>
            </div>
            <div class="mt-2.5 pt-2.5 border-t border-slate-855 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Autonomous Resolution:</span>
              <span class="font-mono text-sky-300 font-bold">{workforceKPIs()?.fleetAutonomousResolution}% First-Pass</span>
            </div>
          </div>

          {/* Metric 3: First-Time Right Rate (FTRR) */}
          <div class="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-indigo-500/40 transition-all">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span class="flex items-center gap-1.5">
                <CheckCircle2Icon class="w-4 h-4 text-indigo-400" /> First-Time Right Rate
              </span>
              <span class="text-[10px] font-mono text-indigo-400 font-bold">
                Quality Index
              </span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black text-indigo-400 font-mono tracking-tight">
                {workforceKPIs()?.fleetFirstTimeRightRate}%
              </span>
              <span class="text-xs text-slate-400">clean first-pass</span>
            </div>
            <div class="mt-2.5 pt-2.5 border-t border-slate-855 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Autonomous Resolution:</span>
              <span class="font-mono text-slate-200 font-bold">{workforceKPIs()?.fleetAutonomousResolution}%</span>
            </div>
          </div>

          {/* Metric 4: Unit Economics (Cost per Task) */}
          <div class="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-amber-500/40 transition-all">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span class="flex items-center gap-1.5">
                <ZapIcon class="w-4 h-4 text-amber-400" /> Cost Per Work Unit
              </span>
              <span class="text-[10px] font-mono text-emerald-400 font-bold">
                High Efficiency
              </span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                ${workforceKPIs()?.avgCostPerWorkUnit}
              </span>
              <span class="text-xs text-slate-400">/ task</span>
            </div>
            <div class="mt-2.5 pt-2.5 border-t border-slate-855 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Fleet Compute Efficiency:</span>
              <span class="font-mono text-slate-300 font-semibold">&lt; $0.01 / task</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 2. THE DIGITAL EMPLOYEE LEADERBOARD & PERFORMANCE REVIEWS */}
    <section class="glass-panel rounded-2xl p-6 border-slate-800 shadow-xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
        <div>
          <div class="flex items-center gap-2">
            <AwardIcon class="w-5 h-5 text-amber-400" />
            <h3 class="text-base font-bold text-white tracking-tight">
              Digital Employee Roster &amp; Annual Review Board
            </h3>
            <span class="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
              Ranked by Business Value
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Evaluates each AI agent against operational KPIs: Speed-up factor, Quality (First-Time Right), Escalation rate, Unit Cost, and Total Financial ROI.
          </p>
        </div>
      </div>

      {/* Employee Roster Table */}
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 text-[11px]">
              <th class="pb-3 font-semibold">Agent Employee &amp; Role</th>
              <th class="pb-3 font-semibold">Grade</th>
              <th class="pb-3 font-semibold">Throughput &amp; Speedup</th>
              <th class="pb-3 font-semibold">Work Quality (FTRR)</th>
              <th class="pb-3 font-semibold">Escalation Rate</th>
              <th class="pb-3 font-semibold">Unit Cost</th>
              <th class="pb-3 font-semibold">Net Economic Value</th>
              <th class="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-850">
            @for (const agent of agents()) {
              <tr
                onClick={() => { selectedAgentDetail.value = agent; }}
                class={`hover:bg-slate-900/50 transition-colors cursor-pointer ${selectedAgentDetail.value?.id === agent.id ? "bg-slate-900/70 border-l-2 border-brand-500" : ""}`}
              >
                <td class="py-3.5 pr-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md flex-shrink-0"
                      style={{
                        "background-color": `${agent.color}20`,
                        border: `1px solid ${agent.color}40`,
                        color: agent.color
                      }}
                    >
                      <CpuIcon class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-white text-xs">{agent.name}</span>
                      </div>
                      <span class="text-[11px] text-slate-400 block font-medium">
                        {agent.workforce?.employeeTitle || agent.role}
                      </span>
                    </div>
                  </div>
                </td>

                <td class="py-3.5">
                  <span
                    class={`px-2 py-0.5 rounded text-xs font-black font-mono ${
                      agent.workforce?.performanceGrade === "A+" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                      agent.workforce?.performanceGrade === "C-" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                      "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {agent.workforce?.performanceGrade || "A"}
                  </span>
                </td>

                <td class="py-3.5 font-mono">
                  <span class="text-white font-bold block">{agent.workforce?.speedupMultiplier || 500}x faster</span>
                  <span class="text-[10px] text-slate-400">
                    {(agent.workforce?.tasksCompleted || 0).toLocaleString()} tasks
                  </span>
                </td>

                <td class="py-3.5 font-mono">
                  <div class="flex items-center gap-2">
                    <span class="text-slate-200 font-bold">{agent.workforce?.firstTimeRightRate}%</span>
                    <div class="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                      <div
                        class={`h-full rounded-full ${agent.workforce?.firstTimeRightRate >= 95 ? "bg-emerald-400" : agent.workforce?.firstTimeRightRate >= 90 ? "bg-amber-400" : "bg-rose-400"}`}
                        style={{ width: `${agent.workforce?.firstTimeRightRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <span class="text-[10px] text-slate-500 block">
                    Escalations: {agent.workforce?.escalationRate}%
                  </span>
                </td>

                <td class="py-3.5 font-mono text-slate-300">
                  <span class="font-bold block">${agent.workforce?.costPerWorkUnit || "0.005"}</span>
                  <span class="text-[10px] text-slate-500">per unit</span>
                </td>

                <td class="py-3.5 font-mono">
                  <span class="text-emerald-400 font-black text-sm block">
                    ${((agent.workforce?.totalEconomicValue || 0) / 1000).toFixed(0)}k
                  </span>
                  <span class="text-[10px] text-emerald-500/90 font-medium">
                    {Math.round(agent.workforce?.netROI || 0).toLocaleString()}x Net ROI
                  </span>
                </td>

                <td class="py-3.5 text-right">
                  <button
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      goToAgent(agent.id, "refine");
                    }}
                    class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 border border-slate-700"
                  >
                    <span>Inspect</span>
                    <ChevronRightIcon class="w-3 h-3" />
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    {/* 3. SCALING SIMULATOR & VALUE CHARTS */}
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: What-If Simulator (5 cols) */}
      <div class="lg:col-span-5 glass-panel rounded-2xl p-5 space-y-4">
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
          <SlidersIcon class="w-4 h-4 text-emerald-400" />
          <h3 class="text-sm font-bold text-white tracking-wide">
            Enterprise Scale &amp; Adoption Modeler
          </h3>
        </div>

        <p class="text-xs text-slate-400">
          Simulate enterprise net savings when scaling digital employee workloads across departments.
        </p>

        {/* Sliders */}
        <div class="space-y-4 pt-1">
          {/* Slider 1: Adoption Scale */}
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-300 font-medium">Workforce Adoption Scale:</span>
              <span class="font-mono font-bold text-brand-400">{simScaleMultiplier()}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.25"
              value={simScaleMultiplier()}
              onInput={(e: any) => dashboardState.setSimScaleMultiplier(Number(e.target.value))}
              class="w-full accent-brand-500 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5x (Pilot)</span>
              <span>1.0x (Current)</span>
              <span>5.0x (Full Scale Enterprise)</span>
            </div>
          </div>

          {/* Annualized Projection Results Card */}
          <div class="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
              <span>Projected Annual Corporate Impact</span>
              <span class="text-[10px] text-emerald-400 font-mono font-semibold">12-Month Run Rate</span>
            </div>

            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400">Annual Net Profit Unlocked:</span>
              <span class="font-mono font-black text-emerald-400 text-sm">
                ${(simulatedWorkforce().annualizedNetSavings / 1000000).toFixed(2)}M
              </span>
            </div>

            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400">Autonomous Scaling Factor:</span>
              <span class="font-mono font-bold text-sky-300">
                +{simulatedWorkforce().simulatedFTEs}x FTE Capacity
              </span>
            </div>

            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-855">
              <span class="text-slate-400">Annual Compute Investment:</span>
              <span class="font-mono text-slate-300">
                ${Math.round(simulatedWorkforce().simulatedCost * 12).toLocaleString()}
              </span>
            </div>
          </div>

          <p class="text-[11px] text-slate-500 italic leading-snug">
            * Payback is calculated based on autonomous task throughput, compute efficiency, and operational margin protection.
          </p>
        </div>
      </div>

      {/* Right: Economic Value Generated Chart (7 cols) */}
      <div class="lg:col-span-7 glass-panel rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <BarChart3Icon class="w-4 h-4 text-brand-400" />
              Economic Value Delivered by Agent ($ Thousands)
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Gross labor savings and margin protection generated per agent role
            </p>
          </div>
          <span class="text-xs font-mono text-emerald-400 font-bold">
            Total: ${(workforceKPIs()?.totalEconomicValue / 1000000).toFixed(2)}M
          </span>
        </div>

        <div class="h-64 w-full">
          <SvgBarChart
            data={valueVsCostData()}
            xKey="name"
            bars={[{ key: 'economicValue', name: 'Economic Value', color: '#38bdf8' }]}
            yUnit="k"
            height={256}
            stacked={false}
            showLegend={false}
            tooltipFormatter={(val) => `$${val}k Value Delivered`}
          />
        </div>

        <div class="mt-2 pt-3 border-t border-slate-855 flex items-center justify-between text-xs text-slate-400">
          <span class="flex items-center gap-1.5">
            <SparklesIcon class="w-3.5 h-3.5 text-purple-400" />
            Deep Research delivered $1.40M in strategic market synthesis value
          </span>
          <button
            onClick={() => goToAgent('deep-research', 'refine')}
            class="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
          >
            Inspect Agent {"→"}
          </button>
        </div>
      </div>
    </div>

    {/* 4. DIGITAL EMPLOYEE PERFORMANCE REVIEW DOSSIER (DEEP DIVE) */}
    @if (selectedAgentDetail.value) {
      <section class="glass-panel rounded-2xl p-6 border-slate-800">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md"
              style={{
                "background-color": `${selectedAgentDetail.value.color}20`,
                border: `1px solid ${selectedAgentDetail.value.color}40`,
                color: selectedAgentDetail.value.color
              }}
            >
              <CpuIcon class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <span>Performance Dossier: {selectedAgentDetail.value.name}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-500/20 text-brand-300">
                  {selectedAgentDetail.value.workforce?.employeeTitle}
                </span>
              </h4>
              <p class="text-xs text-slate-400">
                Managerial Performance Review &amp; Competency Assessment
              </p>
            </div>
          </div>

          <button
            onClick={() => goToAgent(selectedAgentDetail.value.id, "refine")}
            class="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
          >
            <span>Open Studio to Refine &amp; Coach</span>
            <ArrowRightIcon class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Core Competencies */}
          <div class="space-y-3">
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <PercentIcon class="w-3.5 h-3.5 text-brand-400" />
              Employee Competency Ratings
            </h5>
            <div class="space-y-2.5">
              @for (const comp of selectedAgentDetail.value.workforce?.competencies || []) {
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-300 font-medium">{comp.name}</span>
                    <span class="font-mono font-bold text-slate-200">{comp.score} / 100</span>
                  </div>
                  <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      class={`h-full rounded-full ${comp.score > 90 ? "bg-emerald-400" : comp.score > 75 ? "bg-amber-400" : "bg-rose-400"}`}
                      style={{ width: `${comp.score}%` }}
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>

          {/* Column 2: Escalation Root Causes */}
          <div class="space-y-3">
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <AlertTriangleIcon class="w-3.5 h-3.5 text-amber-400" />
              Supervisor Escalation Triggers
            </h5>
            <div class="space-y-2">
              @for (const esc of selectedAgentDetail.value.workforce?.escalationReasons || []) {
                <div class="bg-slate-950/60 border border-slate-855 rounded-xl p-2.5 text-xs flex items-center justify-between">
                  <span class="text-slate-300">{esc.reason}</span>
                  <span class="font-mono text-amber-400 font-semibold">{esc.pct}% ({esc.count})</span>
                </div>
              }
            </div>
          </div>

          {/* Column 3: Managerial Coaching Guidance */}
          <div class="space-y-3">
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <AwardIcon class="w-3.5 h-3.5 text-emerald-400" />
              Executive Coaching Note
            </h5>
            <div class="bg-slate-950/80 border border-slate-855 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
              <p class="italic">
                {"“"}{selectedAgentDetail.value.workforce?.coachingNotes}{"”"}
              </p>
              <div class="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Promotion Readiness:</span>
                <span class="font-semibold text-emerald-400">Ready for Gemini 1.5 Flash Downgrade</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    }
  </div>
}
