<script>
  import { dashboardState } from '../../state/dashboardState.svelte.js';
  import SvgBarChart from '../common/SvgBarChart.svelte';
  import {
    Briefcase,
    TrendingUp,
    DollarSign,
    Clock,
    Award,
    CheckCircle2,
    AlertTriangle,
    Users,
    Zap,
    ArrowUpRight,
    ChevronRight,
    ShieldAlert,
    Shield,
    Sparkles,
    Sliders,
    Cpu,
    BarChart3,
    Percent,
    Layers,
    ArrowRight
  } from '@lucide/svelte';

  const agents = $derived(dashboardState.agents);
  const workforceKPIs = $derived(dashboardState.workforceKPIs);
  const simulatedWorkforce = $derived(dashboardState.simulatedWorkforce);
  const humanHourlyWage = $derived(dashboardState.humanHourlyWage);
  const simScaleMultiplier = $derived(dashboardState.simScaleMultiplier);

  let selectedAgentDetail = $state(null);

  $effect(() => {
    if (!selectedAgentDetail && agents.length > 1) {
      selectedAgentDetail = agents[1];
    }
  });

  const valueVsCostData = $derived.by(() => {
    return agents.map(a => {
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
  });

  function goToAgent(agentId, subTab = 'refine') {
    dashboardState.selectAgent(agentId);
    dashboardState.setAgentActiveSubTab(subTab);
  }
</script>

<div class="space-y-6 animate-in fade-in duration-200">
  <!-- 1. EXECUTIVE WORKFORCE HERO STRIP -->
  <div class="relative overflow-hidden glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
    <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
    <div class="absolute bottom-0 left-1/3 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Briefcase class="w-5 h-5" />
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
          <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-2 shadow-sm">
            <TrendingUp class="w-4 h-4 text-emerald-400" />
            Fleet ROI: {(workforceKPIs?.netFleetROI || 6650).toLocaleString()}x Payback
          </span>
        </div>
      </div>

      <!-- 4 Core Executive Metric Pillars -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <!-- Metric 1: Net Economic Value Delivered -->
        <div class="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-emerald-500/40 transition-all">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span class="flex items-center gap-1.5">
              <DollarSign class="w-4 h-4 text-emerald-400" /> Net Economic Value
            </span>
            <span class="text-[10px] font-mono text-emerald-400 font-bold">
              {workforceKPIs?.netFleetROI}x Return
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ${((workforceKPIs?.totalEconomicValue || 2660000) / 1000000).toFixed(2)}M
            </span>
          </div>
          <div class="mt-2.5 pt-2.5 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Total Compute Cost:</span>
            <span class="font-mono text-slate-300 font-semibold">${workforceKPIs?.totalCost}</span>
          </div>
        </div>

        <!-- Metric 2: Operational Labor Delivered -->
        <div class="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-sky-500/40 transition-all">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span class="flex items-center gap-1.5">
              <Users class="w-4 h-4 text-sky-400" /> Operational Hours Delivered
            </span>
            <span class="text-[10px] font-mono text-sky-400 font-bold">
              {workforceKPIs?.fleetAutonomousResolution}% Auto
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {(workforceKPIs?.totalHoursSaved || 34979).toLocaleString()}
            </span>
            <span class="text-xs text-slate-400 font-mono">hours automated</span>
          </div>
          <div class="mt-2.5 pt-2.5 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Autonomous Resolution:</span>
            <span class="font-mono text-sky-300 font-bold">{workforceKPIs?.fleetAutonomousResolution}% First-Pass</span>
          </div>
        </div>

        <!-- Metric 3: First-Time Right Rate (FTRR) -->
        <div class="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-indigo-500/40 transition-all">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span class="flex items-center gap-1.5">
              <CheckCircle2 class="w-4 h-4 text-indigo-400" /> First-Time Right Rate
            </span>
            <span class="text-[10px] font-mono text-indigo-400 font-bold">
              Quality Index
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-black text-indigo-400 font-mono tracking-tight">
              {workforceKPIs?.fleetFirstTimeRightRate}%
            </span>
            <span class="text-xs text-slate-400">clean first-pass</span>
          </div>
          <div class="mt-2.5 pt-2.5 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Autonomous Resolution:</span>
            <span class="font-mono text-slate-200 font-bold">{workforceKPIs?.fleetAutonomousResolution}%</span>
          </div>
        </div>

        <!-- Metric 4: Unit Economics (Cost per Task) -->
        <div class="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-amber-500/40 transition-all">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span class="flex items-center gap-1.5">
              <Zap class="w-4 h-4 text-amber-400" /> Cost Per Work Unit
            </span>
            <span class="text-[10px] font-mono text-emerald-400 font-bold">
              High Efficiency
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
              ${workforceKPIs?.avgCostPerWorkUnit}
            </span>
            <span class="text-xs text-slate-400">/ task</span>
          </div>
          <div class="mt-2.5 pt-2.5 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fleet Compute Efficiency:</span>
            <span class="font-mono text-slate-300 font-semibold">&lt; $0.01 / task</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 2. THE DIGITAL EMPLOYEE LEADERBOARD & PERFORMANCE REVIEWS -->
  <section class="glass-panel rounded-2xl p-6 border-slate-800 shadow-xl">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
      <div>
        <div class="flex items-center gap-2">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Award class="w-5 h-5 text-amber-400" />
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

    <!-- Employee Roster Table -->
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
          {#each agents as agent}
            {@const wf = agent.workforce || {}}
            {@const isTopStar = wf.performanceGrade === 'A+'}
            {@const isUnderperforming = wf.performanceGrade === 'C-'}
            <tr
              onclick={() => selectedAgentDetail = agent}
              class="hover:bg-slate-900/50 transition-colors cursor-pointer {selectedAgentDetail?.id === agent.id ? 'bg-slate-900/70 border-l-2 border-brand-500' : ''}"
            >
              <td class="py-3.5 pr-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md flex-shrink-0"
                    style="background-color: {agent.color}20; border: 1px solid {agent.color}40; color: {agent.color};"
                  >
                    <Cpu class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-white text-xs">{agent.name}</span>
                    </div>
                    <span class="text-[11px] text-slate-400 block font-medium">
                      {wf.employeeTitle || agent.role}
                    </span>
                  </div>
                </div>
              </td>

              <td class="py-3.5 pr-3">
                <span
                  class="px-2 py-0.5 rounded text-[11px] font-black font-mono {isTopStar ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : isUnderperforming ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'}"
                >
                  {wf.performanceGrade || 'A'}
                </span>
              </td>

              <td class="py-3.5 pr-3">
                <div class="font-mono text-slate-200 font-semibold">
                  {(wf.tasksCompleted || agent.totalRuns).toLocaleString()} tasks
                </div>
                <span class="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                  <Zap class="w-2.5 h-2.5" /> {wf.speedupMultiplier}x faster
                </span>
              </td>

              <td class="py-3.5 pr-3">
                <div class="flex items-center gap-2">
                  <div class="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full {wf.firstTimeRightRate > 90 ? 'bg-emerald-400' : wf.firstTimeRightRate > 85 ? 'bg-amber-400' : 'bg-rose-400'}"
                      style="width: {wf.firstTimeRightRate}%"
                    ></div>
                  </div>
                  <span class="font-mono font-bold text-slate-200">{wf.firstTimeRightRate}%</span>
                </div>
                <span class="text-[10px] text-slate-500">one-shot resolution</span>
              </td>

              <td class="py-3.5 pr-3">
                <span class="font-mono font-semibold {wf.escalationRate > 7 ? 'text-rose-400' : 'text-slate-300'}">
                  {wf.escalationRate}%
                </span>
                <span class="text-[10px] text-slate-500 block">escalation rate</span>
              </td>

              <td class="py-3.5 pr-3">
                <span class="font-mono text-amber-300 font-bold">${wf.costPerWorkUnit}</span>
                <span class="text-[10px] text-slate-500 block">per task</span>
              </td>

              <td class="py-3.5 pr-3">
                <div class="font-mono text-emerald-400 font-bold">
                  ${((wf.totalEconomicValue || 0) / 1000).toFixed(0)}k
                </div>
                <span class="text-[10px] text-slate-400 font-mono">
                  ROI: {Math.round(wf.netROI || 0).toLocaleString()}x
                </span>
              </td>

              <td class="py-3.5 text-right space-x-1.5">
                <button
                  onclick={(e) => { e.stopPropagation(); goToAgent(agent.id, 'iam'); }}
                  class="px-2 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-600/40 text-indigo-300 font-medium text-[11px] transition-all border border-indigo-500/30 inline-flex items-center gap-1"
                  title="Configure GCP IAM & Quotas"
                >
                  <Shield class="w-3 h-3 text-indigo-400" />
                  <span>IAM &amp; Caps</span>
                </button>
                <button
                  onclick={(e) => { e.stopPropagation(); goToAgent(agent.id, 'refine'); }}
                  class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-brand-600 text-slate-300 hover:text-white font-medium text-[11px] transition-all border border-slate-800 hover:border-brand-500 inline-flex items-center gap-1"
                >
                  <span>Coach Agent</span>
                  <ChevronRight class="w-3 h-3" />
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <!-- 3. SPLIT SECTION: SIMULATOR & ECONOMIC VALUE CHART -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Left: What-If Corporate ROI Calculator (5 cols) -->
    <div class="lg:col-span-5 glass-panel rounded-2xl p-5 border-emerald-500/30 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Sliders class="w-4 h-4 text-emerald-400" />
            Executive ROI &amp; Wage Scaling Simulator
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Model annualized corporate economic value by adjusting operational labor benchmark and fleet task scale.
          </p>
        </div>
      </div>

      <!-- Slider 1: Operational Blended Hourly Wage -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-300 font-medium">Operational Wage Benchmark:</span>
          <span class="font-mono font-bold text-emerald-400">${humanHourlyWage}/hour</span>
        </div>
        <input
          type="range"
          min="30"
          max="150"
          step="5"
          value={humanHourlyWage}
          oninput={(e) => dashboardState.setHumanHourlyWage(+e.target.value)}
          class="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div class="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>$30 (Support)</span>
          <span>$52.50 (Blended Corp)</span>
          <span>$150 (Specialist / Legal)</span>
        </div>
      </div>

      <!-- Slider 2: Scale Task Multiplier -->
      <div class="space-y-1.5 pt-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-300 font-medium">Workforce Adoption Multiplier:</span>
          <span class="font-mono font-bold text-sky-400">{simScaleMultiplier}x Workload</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="5.0"
          step="0.5"
          value={simScaleMultiplier}
          oninput={(e) => dashboardState.setSimScaleMultiplier(+e.target.value)}
          class="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div class="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0.5x (Pilot)</span>
          <span>1.0x (Current)</span>
          <span>5.0x (Full Scale Enterprise)</span>
        </div>
      </div>

      <!-- Annualized Projection Results Card -->
      <div class="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 space-y-3">
        <div class="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
          <span>Projected Annual Corporate Impact</span>
          <span class="text-[10px] text-emerald-400 font-mono font-semibold">12-Month Run Rate</span>
        </div>

        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400">Annual Net Profit Unlocked:</span>
          <span class="font-mono font-black text-emerald-400 text-sm">
            ${(simulatedWorkforce.annualizedNetSavings / 1000000).toFixed(2)}M
          </span>
        </div>

        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400">Autonomous Scaling Factor:</span>
          <span class="font-mono font-bold text-sky-300">
            +{simulatedWorkforce.simulatedFTEs}x FTE Capacity
          </span>
        </div>

        <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-850">
          <span class="text-slate-400">Annual Compute Investment:</span>
          <span class="font-mono text-slate-300">
            ${Math.round(simulatedWorkforce.simulatedCost * 12).toLocaleString()}
          </span>
        </div>
      </div>

      <p class="text-[11px] text-slate-500 italic leading-snug">
        * Payback is calculated based on autonomous task throughput, compute efficiency, and operational margin protection.
      </p>
    </div>

    <!-- Right: Economic Value Generated Chart (7 cols) -->
    <div class="lg:col-span-7 glass-panel rounded-2xl p-5 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <BarChart3 class="w-4 h-4 text-brand-400" />
            Economic Value Delivered by Agent ($ Thousands)
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Gross labor savings and margin protection generated per agent role
          </p>
        </div>
        <span class="text-xs font-mono text-emerald-400 font-bold">
          Total: ${(workforceKPIs?.totalEconomicValue / 1000000).toFixed(2)}M
        </span>
      </div>

      <div class="h-64 w-full">
        <SvgBarChart
          data={valueVsCostData}
          xKey="name"
          bars={[{ key: 'economicValue', name: 'Economic Value' }]}
          yUnit="k"
          height={256}
          isStacked={false}
          showLegend={false}
          tooltipFormatter={(val) => `$${val}k Value Delivered`}
        />
      </div>

      <div class="mt-2 pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
        <span class="flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-purple-400" />
          Deep Research delivered $1.40M in strategic market synthesis value
        </span>
        <button
          onclick={() => goToAgent('deep-research', 'refine')}
          class="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
        >
          Inspect Agent →
        </button>
      </div>
    </div>
  </div>

  <!-- 4. DIGITAL EMPLOYEE PERFORMANCE REVIEW DOSSIER (DEEP DIVE) -->
  {#if selectedAgentDetail}
    <section class="glass-panel rounded-2xl p-6 border-slate-800">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md"
            style="background-color: {selectedAgentDetail.color}20; border: 1px solid {selectedAgentDetail.color}40; color: {selectedAgentDetail.color};"
          >
            <Cpu class="w-5 h-5" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <span>Performance Dossier: {selectedAgentDetail.name}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-500/20 text-brand-300">
                {selectedAgentDetail.workforce?.employeeTitle}
              </span>
            </h4>
            <p class="text-xs text-slate-400">
              Managerial Performance Review &amp; Competency Assessment
            </p>
          </div>
        </div>

        <button
          onclick={() => goToAgent(selectedAgentDetail.id, 'refine')}
          class="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
        >
          <span>Open Studio to Refine &amp; Coach</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Column 1: Core Competencies -->
        <div class="space-y-3">
          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Percent class="w-3.5 h-3.5 text-brand-400" />
            Employee Competency Ratings
          </h5>
          <div class="space-y-2.5">
            {#each (selectedAgentDetail.workforce?.competencies || []) as comp}
              <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-300 font-medium">{comp.name}</span>
                  <span class="font-mono font-bold text-slate-200">{comp.score} / 100</span>
                </div>
                <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full {comp.score > 90 ? 'bg-emerald-400' : comp.score > 75 ? 'bg-amber-400' : 'bg-rose-400'}"
                    style="width: {comp.score}%"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Column 2: Escalation Root Causes -->
        <div class="space-y-3">
          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <AlertTriangle class="w-3.5 h-3.5 text-amber-400" />
            Supervisor Escalation Triggers
          </h5>
          <div class="space-y-2">
            {#each (selectedAgentDetail.workforce?.escalationReasons || []) as esc}
              <div class="bg-slate-950/60 border border-slate-850 rounded-xl p-2.5 text-xs flex items-center justify-between">
                <span class="text-slate-300">{esc.reason}</span>
                <span class="font-mono text-amber-400 font-semibold">{esc.pct}% ({esc.count})</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Column 3: Managerial Coaching Guidance -->
        <div class="space-y-3">
          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Award class="w-3.5 h-3.5 text-emerald-400" />
            Executive Coaching Note
          </h5>
          <div class="bg-slate-950/80 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
            <p class="italic">
              "{selectedAgentDetail.workforce?.coachingNotes}"
            </p>
            <div class="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Promotion Readiness:</span>
              <span class="font-semibold text-emerald-400">Ready for Gemini 1.5 Flash Downgrade</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}
</div>
