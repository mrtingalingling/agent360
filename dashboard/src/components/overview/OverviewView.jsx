import React, { useState, useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { SankeyDiagram } from './SankeyDiagram';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Coins,
  Cpu,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  Zap,
  CheckCircle2,
  Sliders,
  Database,
  ShieldCheck,
  Wrench,
  BookOpen,
  ChevronRight,
  Filter,
  Eye,
  Briefcase,
  ArrowRight,
  LayoutGrid,
  List,
  DollarSign,
  Users,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function OverviewView() {
  const { agents, fleetKPIs, workforceKPIs, sankeyData, goToAgent, cloudIAMData } = useDashboard();
  
  // Roster display mode: 'grid' cards vs 'table' leaderboard
  const [rosterMode, setRosterMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'action' | 'star'
  const [showSimulator, setShowSimulator] = useState(false);

  // Wage Simulator state
  const [simHourlyWage, setSimHourlyWage] = useState(65); // default $65/hr
  const [simScaleMultiplier, setSimScaleMultiplier] = useState(1.0); // 1x to 5x

  // Dynamic simulation calculations
  const simAnnualValues = useMemo(() => {
    const baseHoursSavedPerYear = (workforceKPIs?.totalHoursSaved || 34979) * 4;
    const scaledHoursSaved = Math.round(baseHoursSavedPerYear * simScaleMultiplier);
    const scaledGrossSavings = Math.round(scaledHoursSaved * simHourlyWage);
    const scaledComputeCost = Math.round((fleetKPIs?.totalCost || 400.37) * 4 * simScaleMultiplier);
    const scaledNetValue = scaledGrossSavings - scaledComputeCost;
    const scaledROI = scaledComputeCost > 0 ? (scaledNetValue / scaledComputeCost).toFixed(0) : 0;
    const scaledFTE = (scaledHoursSaved / 2000).toFixed(1);

    return {
      hoursSaved: scaledHoursSaved,
      grossSavings: scaledGrossSavings,
      computeCost: scaledComputeCost,
      netValue: scaledNetValue,
      roi: scaledROI,
      fteAdded: scaledFTE
    };
  }, [workforceKPIs, fleetKPIs, simHourlyWage, simScaleMultiplier]);

  // Prepare stacked bar data for Token Types per agent
  const tokenBreakdownData = agents.map(a => ({
    name: a.name.split(' ')[0],
    fullName: a.name,
    Input: +(a.tokens.input / 1000000).toFixed(2),
    Output: +(a.tokens.output / 1000000).toFixed(2),
    Cached: +(a.tokens.cached / 1000000).toFixed(2),
    Reasoning: +(a.tokens.reasoning / 1000000).toFixed(2),
    total: +(a.tokens.total / 1000000).toFixed(2)
  }));

  // Error rate data: Hallucination % vs Reprompt %
  const errorRateData = agents.map(a => ({
    name: a.name.split(' ')[0],
    fullName: a.name,
    agentId: a.id,
    'Hallucination Rate': a.errors.hallucinationRate,
    'Reprompt Rate': a.errors.repromptRate,
    status: a.status
  }));

  const filteredAgents = agents.filter(agent => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'action') return agent.status === 'degraded' || agent.workforce?.performanceGrade === 'C-';
    if (filterStatus === 'star') return agent.workforce?.performanceGrade === 'A+' || agent.workforce?.performanceGrade === 'A';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          ACT 1: THE EXECUTIVE HERO STRIP (4 BALANCED PILLARS)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Enterprise Value & Net ROI */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group border-emerald-500/20">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Net Economic Value &amp; ROI
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              {Math.round(workforceKPIs?.netFleetROI || workforceKPIs?.netROI || 6650).toLocaleString()}x ROI
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              ${((workforceKPIs?.totalEconomicValue || 2660000) / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs text-slate-400 font-mono">net delivered</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Inference Spend:</span>
            <span className="font-mono text-slate-300 font-bold">${Number(workforceKPIs?.totalComputeCost || workforceKPIs?.totalCost || 400.37).toFixed(2)} total</span>
          </div>
        </div>

        {/* Pillar 2: Human Labor Liberated */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group border-sky-500/20">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-sky-300">
              <Clock className="w-4 h-4 text-sky-400" /> Human Labor Liberated
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">
              {workforceKPIs?.fteEquivalency || 54.6} FTEs
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {(workforceKPIs?.totalHoursSaved || 34979).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">hours saved</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Work Units Completed:</span>
            <span className="font-mono text-slate-300 font-bold">{(workforceKPIs?.totalTasksCompleted || 99400).toLocaleString()} tasks</span>
          </div>
        </div>

        {/* Pillar 3: Work Quality & Accuracy */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group border-indigo-500/20">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> First-Time Right Rate
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              {workforceKPIs?.fleetAutonomousResolution || workforceKPIs?.autonomousRate || 95.8}% Auto
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-300 font-mono tracking-tight">
              {workforceKPIs?.fleetFirstTimeRightRate || workforceKPIs?.firstTimeRightRate || 89.8}%
            </span>
            <span className="text-xs text-slate-400">clean one-shot</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Human Escalation Rate:</span>
            <span className="font-mono text-amber-300 font-bold">{workforceKPIs?.fleetEscalationRate || workforceKPIs?.avgEscalationRate || 4.2}% fleet avg</span>
          </div>
        </div>

        {/* Pillar 4: Unit Economics & Response Velocity */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group border-amber-500/20">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Zap className="w-4 h-4 text-amber-400" /> Unit Cost &amp; Velocity
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
              {fleetKPIs?.avgLatency || 1.20}s TTR
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              ${workforceKPIs?.avgCostPerWorkUnit || workforceKPIs?.costPerWorkUnit || '0.0040'}
            </span>
            <span className="text-xs text-slate-400 font-mono">per task</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Human Baseline Cost:</span>
            <span className="font-mono text-slate-400 line-through">${workforceKPIs?.avgHumanCostPerWorkUnit || workforceKPIs?.humanCostPerWorkUnit || '26.80'} human</span>
          </div>
        </div>
      </div>

      {/* Fleet IAM & FinOps Governance Status Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Fleet IAM &amp; FinOps Governance</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {cloudIAMData?.complianceSummary?.identityCompliancePct || 83}% Isolated Identities
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                BigQuery Quotas Enforced
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              5 of 6 active agents bound to dedicated least-privilege GCP Service Accounts. BigQuery query scan caps active at 5–25 GB to protect corporate budgets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => goToAgent('promo-shadow', 'iam')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all shadow-sm"
          >
            <span>Configure Agent IAM &amp; Cost Caps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          INTERACTIVE WHAT-IF CORPORATE WAGE SIMULATOR DRAWER
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 shadow-xl transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  Corporate ROI &amp; Wage Scaling Simulator
                </h4>
                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Interactive Forecast
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Model annualized enterprise savings based on blended employee wages and autonomous task scaling.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto border border-slate-700"
          >
            <span>{showSimulator ? 'Close Simulator' : 'Adjust Wage & Scale Sliders'}</span>
            {showSimulator ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Simulator Controls */}
        {showSimulator && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {/* Slider 1: Hourly Wage Benchmark */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Blended Human Payroll Benchmark:</span>
                <span className="font-mono text-emerald-400 text-sm font-bold">${simHourlyWage}/hr</span>
              </div>
              <input
                type="range"
                min="30"
                max="150"
                step="5"
                value={simHourlyWage}
                onChange={(e) => setSimHourlyWage(+e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$30/hr (Tier-1 CX)</span>
                <span>$65/hr (Blended)</span>
                <span>$150/hr (Specialist)</span>
              </div>
            </div>

            {/* Slider 2: Fleet Adoption Multiplier */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Workforce Adoption Multiplier:</span>
                <span className="font-mono text-sky-400 text-sm font-bold">{simScaleMultiplier.toFixed(1)}x Scale</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={simScaleMultiplier}
                onChange={(e) => setSimScaleMultiplier(+e.target.value)}
                className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5x (Pilot)</span>
                <span>1.0x (Current)</span>
                <span>5.0x (Enterprise Rollout)</span>
              </div>
            </div>

            {/* Live Projected Annual Output */}
            <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block mb-1">
                  Projected Annual Enterprise Output
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-emerald-300">
                    ${(simAnnualValues.netValue / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-xs text-slate-400 font-mono">annual net profit</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-emerald-500/20 font-mono">
                <span>+{simAnnualValues.hoursSaved.toLocaleString()} hrs</span>
                <span className="text-emerald-400 font-bold">{simAnnualValues.fteAdded} FTEs added</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ACT 2: 360° DIGITAL WORKFORCE ROSTER (GRID vs TABLE)
      ───────────────────────────────────────────────────────────── */}
      <section className="glass-panel rounded-2xl p-6 border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-400" />
                360° Digital Workforce Roster &amp; Operations Command
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full">
                6 Active Digital Employees
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select any agent to inspect its operational telemetry or open its Coaching Studio to refine skills, rules, models, and prompts.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All (6)
              </button>
              <button
                onClick={() => setFilterStatus('star')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === 'star'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Star Performers (5)
              </button>
              <button
                onClick={() => setFilterStatus('action')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === 'action'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Under Coaching (1)
              </button>
            </div>

            {/* View Mode Switcher: Grid Cards vs Leaderboard Table */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setRosterMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  rosterMode === 'grid'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid Radar View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRosterMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  rosterMode === 'table'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Executive Leaderboard Table"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2A. EXECUTIVE LEADERBOARD TABLE VIEW */}
        {rosterMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Digital Employee &amp; Role</th>
                  <th className="pb-3 text-center">Grade</th>
                  <th className="pb-3 text-right">Liberated Labor</th>
                  <th className="pb-3 text-right">FTR Rate</th>
                  <th className="pb-3 text-right">Speedup</th>
                  <th className="pb-3 text-right">Unit Cost</th>
                  <th className="pb-3 text-right">Net Value Delivered</th>
                  <th className="pb-3 text-center pr-2">Coaching</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredAgents.map((agent) => {
                  const isDegraded = agent.status === 'degraded' || agent.workforce?.performanceGrade === 'C-';

                  return (
                    <tr
                      key={agent.id}
                      className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                      onClick={() => goToAgent(agent.id, 'refine')}
                    >
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
                            style={{
                              backgroundColor: `${agent.color}20`,
                              border: `1px solid ${agent.color}40`,
                              color: agent.color
                            }}
                          >
                            <Cpu className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 group-hover:text-brand-300 transition-colors block">
                              {agent.workforce?.employeeTitle || agent.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {agent.name} &bull; {agent.model}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-black font-mono ${
                            agent.workforce?.performanceGrade === 'A+'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : agent.workforce?.performanceGrade === 'C-'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {agent.workforce?.performanceGrade || 'A'}
                        </span>
                      </td>

                      <td className="py-3.5 text-right font-mono">
                        <span className="text-slate-200 font-bold block">
                          {agent.workforce?.humanLaborHoursSaved?.toLocaleString() || 0} hrs
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {((agent.workforce?.humanLaborHoursSaved || 0) / 2000).toFixed(1)} FTEs
                        </span>
                      </td>

                      <td className="py-3.5 text-right font-mono">
                        <span className="text-slate-200 font-bold">
                          {agent.workforce?.firstTimeRightRate}%
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {agent.errors.hallucinationRate}% hall.
                        </span>
                      </td>

                      <td className="py-3.5 text-right font-mono text-sky-400 font-bold">
                        {agent.workforce?.speedupMultiplier}x
                      </td>

                      <td className="py-3.5 text-right font-mono">
                        <span className="text-amber-400 font-semibold block">
                          ${agent.workforce?.costPerWorkUnit}
                        </span>
                        <span className="text-[10px] text-slate-500 line-through">
                          ${agent.workforce?.humanCostPerWorkUnit}
                        </span>
                      </td>

                      <td className="py-3.5 text-right font-mono">
                        <span className="text-emerald-400 font-bold text-sm block">
                          ${((agent.workforce?.totalEconomicValue || 0) / 1000).toFixed(0)}k
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {Math.round(agent.workforce?.netROI || 0).toLocaleString()}x ROI
                        </span>
                      </td>

                      <td className="py-3.5 text-center pr-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            goToAgent(agent.id, 'refine');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all mx-auto ${
                            isDegraded
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20'
                              : 'bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/40'
                          }`}
                        >
                          <span>{isDegraded ? 'Coach' : 'Tune'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* 2B. 360° AGENT CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => {
              const unenforcedRules = agent.rules.filter(r => !r.enforced);
              const activeSkillsCount = agent.skills.filter(s => s.enabled).length;
              const isDegraded = agent.status === 'degraded' || agent.workforce?.performanceGrade === 'C-';

              return (
                <div
                  key={agent.id}
                  onClick={() => goToAgent(agent.id, 'refine')}
                  className={`group relative bg-slate-950/70 border rounded-2xl p-4 transition-all duration-200 hover:shadow-xl cursor-pointer flex flex-col justify-between ${
                    isDegraded
                      ? 'border-rose-500/40 hover:border-rose-500 shadow-rose-500/5'
                      : 'border-slate-800 hover:border-brand-500/60 hover:shadow-brand-500/10'
                  }`}
                >
                  <div>
                    {/* Top Row: Avatar, Status & Model */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md"
                          style={{
                            backgroundColor: `${agent.color}20`,
                            border: `1px solid ${agent.color}40`,
                            color: agent.color
                          }}
                        >
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                            {agent.workforce?.employeeTitle || agent.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">{agent.role}</span>
                        </div>
                      </div>

                      {/* Status Pill */}
                      {agent.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                          Healthy
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0 animate-pulse">
                          Under Review
                        </span>
                      )}
                    </div>

                    {/* Model & Latency Row */}
                    <div className="flex items-center justify-between text-[11px] bg-slate-900/60 rounded-lg px-2.5 py-1.5 mb-2.5 border border-slate-850">
                      <span className="font-mono text-slate-400">Model: {agent.model}</span>
                      <span className="font-mono text-slate-200 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-400" /> {agent.avgLatency}s TTR
                      </span>
                    </div>

                    {/* Digital Employee Role & ROI Badge */}
                    {agent.workforce && (
                      <div className="flex items-center justify-between text-[10px] bg-emerald-950/30 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300 font-medium">Grade:</span>
                          <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            agent.workforce.performanceGrade === 'A+' ? 'bg-emerald-500/20 text-emerald-300' :
                            agent.workforce.performanceGrade === 'C-' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {agent.workforce.performanceGrade}
                          </span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">
                          ${((agent.workforce.totalEconomicValue || 0) / 1000).toFixed(0)}k Value ({Math.round(agent.workforce.netROI).toLocaleString()}x ROI)
                        </span>
                      </div>
                    )}

                    {/* Token Breakdown Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Tokens: {(agent.tokens.total / 1000000).toFixed(1)}M</span>
                        <span className="font-mono text-slate-300">${agent.costEstimate}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 flex overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full"
                          style={{ width: `${(agent.tokens.input / agent.tokens.total) * 100}%` }}
                          title="Input"
                        />
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${(agent.tokens.output / agent.tokens.total) * 100}%` }}
                          title="Output"
                        />
                        <div
                          className="bg-amber-500 h-full"
                          style={{ width: `${(agent.tokens.cached / agent.tokens.total) * 100}%` }}
                          title="Cached"
                        />
                        <div
                          className="bg-pink-500 h-full"
                          style={{ width: `${(agent.tokens.reasoning / agent.tokens.total) * 100}%` }}
                          title="Reasoning"
                        />
                      </div>
                    </div>

                    {/* Dual Error Profile Strip */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                      <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                        <span className="text-[10px] text-slate-400 block">Hallucination Rate:</span>
                        <span
                          className={`font-mono font-bold ${
                            agent.errors.hallucinationRate > 5.0
                              ? 'text-rose-400'
                              : agent.errors.hallucinationRate > 3.0
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {agent.errors.hallucinationRate}%
                        </span>
                      </div>

                      <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                        <span className="text-[10px] text-slate-400 block">Reprompt Rate:</span>
                        <span
                          className={`font-mono font-bold ${
                            agent.errors.repromptRate > 8.0 ? 'text-orange-400' : 'text-slate-200'
                          }`}
                        >
                          {agent.errors.repromptRate}%
                        </span>
                      </div>
                    </div>

                    {/* Skills & Rules Posture Badges */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-850">
                      <span className="flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-brand-400" />
                        {activeSkillsCount}/{agent.skills.length} Skills Active
                      </span>

                      {unenforcedRules.length > 0 ? (
                        <span className="flex items-center gap-1 text-rose-400 font-semibold">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          {unenforcedRules.length} Rule Disabled
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          All Rules Enforced
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Direct Action Link */}
                  <div className="mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-between text-[11px]">
                    <span className="text-brand-400 font-semibold group-hover:underline flex items-center gap-1">
                      {isDegraded ? 'Coach & Refine Agent' : 'Open Agent Studio'} <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isDegraded ? 'Priority Fix' : 'Fine-Tune'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sankey Breakdown Section */}
      <section>
        <SankeyDiagram data={sankeyData} height={460} width={980} />
      </section>

      {/* Split Section: Token Type Breakdown Charts & Error Rate Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Type Breakdown: Stacked Bar Chart */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Coins className="w-4 h-4 text-brand-400" />
                Token Type Breakdown by Agent
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Input, Output, Cached Context &amp; Chain-of-Thought Reasoning tokens (Millions)
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Total: {(fleetKPIs.totalTokens / 1000000).toFixed(1)}M</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tokenBreakdownData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="M" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(value, name) => [`${value}M tokens`, name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconSize={8}
                />
                <Bar dataKey="Input" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Output" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Cached" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Reasoning" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Deep Research consumes 4.7M reasoning tokens (55% of fleet total)
            </span>
            <button
              onClick={() => goToAgent('deep-research', 'telemetry')}
              className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              Inspect Details →
            </button>
          </div>
        </div>

        {/* Error Rate Analysis: Hallucination vs Reprompting Matrix */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Error Rate Matrix: Hallucination vs. Reprompting
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of factual hallucination percentage and reprompting loop frequency
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
              Action Threshold: &gt;5%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={errorRateData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(value, name) => [`${value}%`, name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconSize={8}
                />
                <Bar dataKey="Hallucination Rate" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Reprompt Rate" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold text-[11px]">
                Promo Agent: 7.2% Hallucination &amp; 11.8% Reprompts
              </span>
            </div>
            <button
              onClick={() => goToAgent('promo-shadow', 'refine')}
              className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5" /> Refine Promo Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
