import React, { useState, useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
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
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

export function WorkforceScorecardView() {
  const { agents, workforceKPIs, goToAgent } = useDashboard();

  // Interactive What-If ROI Simulator State
  const [simHourlyWage, setSimHourlyWage] = useState(65);
  const [simScaleMultiplier, setSimScaleMultiplier] = useState(1.0);
  const [selectedAgentDetail, setSelectedAgentDetail] = useState(agents[1]); // Price match default

  // Dynamically compute what-if simulated annual numbers
  const simulatedROI = useMemo(() => {
    const baseTasks = workforceKPIs.totalTasksCompleted * simScaleMultiplier;
    const baseHours = (workforceKPIs.totalHoursSaved * simScaleMultiplier);
    const simulatedLaborSavings = baseHours * simHourlyWage;
    const simulatedTotalValue = simulatedLaborSavings + (workforceKPIs.totalMarginPreserved * simScaleMultiplier);
    const simulatedCost = parseFloat(workforceKPIs.totalCost) * simScaleMultiplier;
    const multiple = simulatedCost > 0 ? Math.round(simulatedTotalValue / simulatedCost) : 6650;
    const fteEquiv = +(baseHours / 1920).toFixed(1); // 1,920 annual working hours / FTE

    return {
      annualTasks: Math.round(baseTasks * 12),
      annualHoursSaved: Math.round(baseHours * 12),
      annualLaborValue: Math.round(simulatedTotalValue * 12),
      annualComputeCost: Math.round(simulatedCost * 12),
      annualFTE: +(fteEquiv * 12 / 12).toFixed(1),
      roiMultiple: multiple,
      netAnnualProfit: Math.round((simulatedTotalValue - simulatedCost) * 12)
    };
  }, [workforceKPIs, simHourlyWage, simScaleMultiplier]);

  // Chart data: Value Created vs Compute Cost per agent
  const valueVsCostData = agents.map(a => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. EXECUTIVE WORKFORCE HERO STRIP */}
      <div className="relative overflow-hidden glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    Digital Workforce ROI &amp; Performance Scorecard
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Managing AI Agents as Autonomous Employees: Quality, Velocity, Unit Economics &amp; Enterprise Payback
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-2 shadow-sm">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Fleet ROI: {workforceKPIs.netFleetROI.toLocaleString()}x Payback
              </span>
            </div>
          </div>

          {/* 4 Core Executive Metric Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {/* Metric 1: Net Economic Value Delivered */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Net Economic Value
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {workforceKPIs.netFleetROI}x Return
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  ${(workforceKPIs.totalEconomicValue / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total Compute Cost:</span>
                <span className="font-mono text-slate-300 font-semibold">${workforceKPIs.totalCost}</span>
              </div>
            </div>

            {/* Metric 2: Human Labor Liberated */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-sky-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-400" /> Human Labor Liberated
                </span>
                <span className="text-[10px] font-mono text-sky-400 font-bold">
                  {workforceKPIs.fteEquivalency} FTEs
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {workforceKPIs.totalHoursSaved.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-mono">hours saved</span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Equivalent Headcount:</span>
                <span className="font-mono text-sky-300 font-bold">+{workforceKPIs.fteEquivalency} Analysts</span>
              </div>
            </div>

            {/* Metric 3: First-Time Right Rate (FTRR) */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" /> First-Time Right Rate
                </span>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">
                  Quality Index
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono tracking-tight">
                  {workforceKPIs.fleetFirstTimeRightRate}%
                </span>
                <span className="text-xs text-slate-400">clean first-pass</span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Autonomous Resolution:</span>
                <span className="font-mono text-slate-200 font-bold">{workforceKPIs.fleetAutonomousResolution}%</span>
              </div>
            </div>

            {/* Metric 4: Unit Economics (Cost per Task) */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 group hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Cost Per Work Unit
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  99.9% Savings
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                  ${workforceKPIs.avgCostPerWorkUnit}
                </span>
                <span className="text-xs text-slate-400">/ task</span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Human Benchmark:</span>
                <span className="font-mono text-slate-400 line-through">${workforceKPIs.avgHumanCostPerWorkUnit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE DIGITAL EMPLOYEE LEADERBOARD & PERFORMANCE REVIEWS */}
      <section className="glass-panel rounded-2xl p-6 border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Digital Employee Roster &amp; Annual Review Board
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                Ranked by Business Value
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluates each AI agent against traditional employee KPIs: Speed-up factor, Quality (First-Time Right), Human Escalation rate, Unit Cost, and Total Financial ROI.
            </p>
          </div>
        </div>

        {/* Employee Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 font-semibold">Agent Employee &amp; Role</th>
                <th className="pb-3 font-semibold">Grade</th>
                <th className="pb-3 font-semibold">Throughput &amp; Speedup</th>
                <th className="pb-3 font-semibold">Work Quality (FTRR)</th>
                <th className="pb-3 font-semibold">Human Escalation</th>
                <th className="pb-3 font-semibold">Unit Cost (vs Human)</th>
                <th className="pb-3 font-semibold">Net Economic Value</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {agents.map((agent) => {
                const wf = agent.workforce || {};
                const isTopStar = wf.performanceGrade === 'A+';
                const isUnderperforming = wf.performanceGrade === 'C-';

                return (
                  <tr
                    key={agent.id}
                    onClick={() => setSelectedAgentDetail(agent)}
                    className={`hover:bg-slate-900/50 transition-colors cursor-pointer ${
                      selectedAgentDetail?.id === agent.id ? 'bg-slate-900/70 border-l-2 border-brand-500' : ''
                    }`}
                  >
                    {/* Employee Identity */}
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md flex-shrink-0"
                          style={{
                            backgroundColor: `${agent.color}20`,
                            border: `1px solid ${agent.color}40`,
                            color: agent.color
                          }}
                        >
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{agent.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block font-medium">
                            {wf.employeeTitle || agent.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="py-3.5 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-black font-mono ${
                          isTopStar
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isUnderperforming
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}
                      >
                        {wf.performanceGrade || 'A'}
                      </span>
                    </td>

                    {/* Velocity & Speedup */}
                    <td className="py-3.5 pr-3">
                      <div className="font-mono text-slate-200 font-semibold">
                        {(wf.tasksCompleted || agent.totalRuns).toLocaleString()} tasks
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> {wf.speedupMultiplier}x faster
                      </span>
                    </td>

                    {/* Quality: First-Time Right */}
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              wf.firstTimeRightRate > 90
                                ? 'bg-emerald-400'
                                : wf.firstTimeRightRate > 85
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                            style={{ width: `${wf.firstTimeRightRate}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200">{wf.firstTimeRightRate}%</span>
                      </div>
                      <span className="text-[10px] text-slate-500">one-shot resolution</span>
                    </td>

                    {/* Human Escalation */}
                    <td className="py-3.5 pr-3">
                      <span
                        className={`font-mono font-semibold ${
                          wf.escalationRate > 7 ? 'text-rose-400' : 'text-slate-300'
                        }`}
                      >
                        {wf.escalationRate}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">escalated to human</span>
                    </td>

                    {/* Cost per Work Unit */}
                    <td className="py-3.5 pr-3">
                      <span className="font-mono text-amber-300 font-bold">${wf.costPerWorkUnit}</span>
                      <span className="text-[10px] text-slate-500 line-through block">
                        ${wf.humanCostPerWorkUnit} human
                      </span>
                    </td>

                    {/* Net Economic Value */}
                    <td className="py-3.5 pr-3">
                      <div className="font-mono text-emerald-400 font-bold">
                        ${((wf.totalEconomicValue || 0) / 1000).toFixed(0)}k
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ROI: {Math.round(wf.netROI || 0).toLocaleString()}x
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 text-right space-x-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToAgent(agent.id, 'iam');
                        }}
                        className="px-2 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-600/40 text-indigo-300 font-medium text-[11px] transition-all border border-indigo-500/30 inline-flex items-center gap-1"
                        title="Configure GCP IAM & Quotas"
                      >
                        <Shield className="w-3 h-3 text-indigo-400" />
                        <span>IAM &amp; Caps</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToAgent(agent.id, 'refine');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-brand-600 text-slate-300 hover:text-white font-medium text-[11px] transition-all border border-slate-800 hover:border-brand-500 inline-flex items-center gap-1"
                      >
                        <span>Coach Agent</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. SPLIT SECTION: WHAT-IF CORPORATE ROI SIMULATOR & ECONOMIC VALUE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: What-If Corporate ROI Calculator (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Executive ROI &amp; Wage Scaling Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Model annualized corporate savings by adjusting blended human wage and fleet task scale.
              </p>
            </div>
          </div>

          {/* Slider 1: Human Blended Hourly Wage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Human Analyst Hourly Wage:</span>
              <span className="font-mono font-bold text-emerald-400">${simHourlyWage}/hour</span>
            </div>
            <input
              type="range"
              min="30"
              max="150"
              step="5"
              value={simHourlyWage}
              onChange={(e) => setSimHourlyWage(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$30 (Support)</span>
              <span>$65 (Blended Corp)</span>
              <span>$150 (Specialist / Legal)</span>
            </div>
          </div>

          {/* Slider 2: Scale Task Multiplier */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Workforce Adoption Multiplier:</span>
              <span className="font-mono font-bold text-sky-400">{simScaleMultiplier}x Workload</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={simScaleMultiplier}
              onChange={(e) => setSimScaleMultiplier(parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5x (Pilot)</span>
              <span>1.0x (Current)</span>
              <span>5.0x (Full Scale Enterprise)</span>
            </div>
          </div>

          {/* Annualized Projection Results Card */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
              <span>Projected Annual Corporate Impact</span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">12-Month Run Rate</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Annual Net Profit Unlocked:</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                ${(simulatedROI.netAnnualProfit / 1000000).toFixed(2)}M
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Human Hours Liberated:</span>
              <span className="font-mono font-bold text-slate-200">
                {simulatedROI.annualHoursSaved.toLocaleString()} hrs/year
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Headcount Capacity Added:</span>
              <span className="font-mono font-bold text-sky-300">
                +{simulatedROI.annualFTE} Full-Time Analysts
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-850">
              <span className="text-slate-400">Annual Compute Investment:</span>
              <span className="font-mono text-slate-300">
                ${simulatedROI.annualComputeCost.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic leading-snug">
            * Payback is calculated comparing agent autonomous execution against blended human payroll costs and margin loss prevented.
          </p>
        </div>

        {/* Right: Economic Value Generated Chart (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-400" />
                Economic Value Delivered by Agent ($ Thousands)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gross labor savings and margin protection generated per agent role
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Total: ${(workforceKPIs.totalEconomicValue / 1000000).toFixed(2)}M
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={valueVsCostData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="k" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(value) => [`$${value}k Value Delivered`, 'Economic Value']}
                />
                <Bar dataKey="economicValue" radius={[4, 4, 0, 0]}>
                  {valueVsCostData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Deep Research delivered $1.40M in strategic market synthesis value
            </span>
            <button
              onClick={() => goToAgent('deep-research', 'refine')}
              className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              Inspect Agent →
            </button>
          </div>
        </div>
      </div>

      {/* 4. DIGITAL EMPLOYEE PERFORMANCE REVIEW DOSSIER (DEEP DIVE) */}
      {selectedAgentDetail && (
        <section className="glass-panel rounded-2xl p-6 border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md"
                style={{
                  backgroundColor: `${selectedAgentDetail.color}20`,
                  border: `1px solid ${selectedAgentDetail.color}40`,
                  color: selectedAgentDetail.color
                }}
              >
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Performance Dossier: {selectedAgentDetail.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-500/20 text-brand-300">
                    {selectedAgentDetail.workforce?.employeeTitle}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Managerial Performance Review &amp; Competency Assessment
                </p>
              </div>
            </div>

            <button
              onClick={() => goToAgent(selectedAgentDetail.id, 'refine')}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
            >
              <span>Open Studio to Refine &amp; Coach</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Core Competencies */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-brand-400" />
                Employee Competency Ratings
              </h5>
              <div className="space-y-2.5">
                {(selectedAgentDetail.workforce?.competencies || []).map((comp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{comp.name}</span>
                      <span className="font-mono font-bold text-slate-200">{comp.score} / 100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          comp.score > 90 ? 'bg-emerald-400' : comp.score > 75 ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${comp.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Escalation Root Causes */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Human Escalation Triggers
              </h5>
              <div className="space-y-2">
                {(selectedAgentDetail.workforce?.escalationReasons || []).map((esc, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/60 border border-slate-850 rounded-xl p-2.5 text-xs flex items-center justify-between"
                  >
                    <span className="text-slate-300">{esc.reason}</span>
                    <span className="font-mono text-amber-400 font-semibold">{esc.pct}% ({esc.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Managerial Coaching Guidance */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Executive Coaching Note
              </h5>
              <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
                <p className="italic">
                  "{selectedAgentDetail.workforce?.coachingNotes}"
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Promotion Readiness:</span>
                  <span className="font-semibold text-emerald-400">Ready for Gemini 1.5 Flash Downgrade</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
