import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import TokenWaterfallTrace from '../telemetry/TokenWaterfallTrace';
import AgentIAMControls from '../iam/AgentIAMControls';
import {
  Coins,
  Cpu,
  Clock,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Search,
  Filter,
  Code,
  Wrench,
  BookOpen,
  Plus,
  Play,
  Save,
  RotateCcw,
  Sparkles,
  Activity,
  Check,
  X,
  Briefcase,
  Award,
  DollarSign,
  Users,
  Percent,
  TrendingUp,
  Server,
  ExternalLink,
  Key
} from 'lucide-react';

export function AgentDetailView() {
  const {
    agents,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    agentActiveSubTab,
    setAgentActiveSubTab,
    toggleAgentSkill,
    addAgentSkill,
    toggleAgentRule,
    addAgentRule,
    refineAgent,
    runBenchmarkSimulation,
    recentTraces,
    cloudLogs,
    dataSourceMode,
    cloudOverview
  } = useDashboard();

  // Sub-navigation inside Specific Agent Tab: 'refine' | 'telemetry' | 'traces'
  const [subTab, setSubTab] = useState(agentActiveSubTab || 'refine');

  // Local draft state for refining options
  const [draftSkills, setDraftSkills] = useState([...selectedAgent.skills]);
  const [draftRules, setDraftRules] = useState([...selectedAgent.rules]);
  const [draftConfig, setDraftConfig] = useState({ ...selectedAgent.fineTuneConfig });
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [testPrompt, setTestPrompt] = useState(
    'Calculate promotional bundle for SKU-9014 with 20% loyalty markdown and verify inventory in regional warehouse'
  );

  // New Skill / Rule modal or drawer state
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillForm, setNewSkillForm] = useState({ name: '', description: '', riskLevel: 'low' });

  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState({ name: '', description: '', category: 'safety' });

  const [searchQuery, setSearchQuery] = useState('');
  const [directiveApplied, setDirectiveApplied] = useState(false);

  // Sync draft state whenever selected agent changes
  useEffect(() => {
    setDraftSkills([...selectedAgent.skills]);
    setDraftRules([...selectedAgent.rules]);
    setDraftConfig({ ...selectedAgent.fineTuneConfig });
    setSimulationResult(null);
    setDirectiveApplied(false);
  }, [selectedAgentId, selectedAgent]);

  // Sync external subTab changes
  useEffect(() => {
    if (agentActiveSubTab) {
      setSubTab(agentActiveSubTab);
    }
  }, [agentActiveSubTab]);

  const handleToggleSkill = (skillId) => {
    setDraftSkills(prev => prev.map(s => s.id === skillId ? { ...s, enabled: !s.enabled } : s));
  };

  const handleToggleRule = (ruleId) => {
    setDraftRules(prev => prev.map(r => r.id === ruleId ? { ...r, enforced: !r.enforced } : r));
  };

  const handleCreateSkill = (e) => {
    e.preventDefault();
    if (!newSkillForm.name) return;
    const newSkill = {
      id: `sk-custom-${Date.now().toString().slice(-4)}`,
      name: newSkillForm.name.toLowerCase().replace(/\s+/g, '_'),
      description: newSkillForm.description || 'Custom user-defined skill',
      enabled: true,
      riskLevel: newSkillForm.riskLevel,
      runs: 0
    };
    setDraftSkills(prev => [...prev, newSkill]);
    addAgentSkill(selectedAgent.id, newSkill);
    setNewSkillForm({ name: '', description: '', riskLevel: 'low' });
    setShowAddSkillModal(false);
  };

  const handleCreateRule = (e) => {
    e.preventDefault();
    if (!newRuleForm.name) return;
    const newRule = {
      id: `rl-custom-${Date.now().toString().slice(-4)}`,
      name: newRuleForm.name,
      description: newRuleForm.description || 'Custom governance constraint',
      enforced: true,
      category: newRuleForm.category
    };
    setDraftRules(prev => [...prev, newRule]);
    addAgentRule(selectedAgent.id, newRule);
    setNewRuleForm({ name: '', description: '', category: 'safety' });
    setShowAddRuleModal(false);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const result = runBenchmarkSimulation(selectedAgent.id, draftConfig, draftRules);
      setSimulationResult(result);
      setIsSimulating(false);
    }, 600);
  };

  const handleApplyCoachingDirective = () => {
    if (!selectedAgent.coachingDirective?.presetPatch) return;
    const patch = selectedAgent.coachingDirective.presetPatch;
    
    // Apply rules
    const updatedRules = draftRules.map(r => 
      patch.ruleIdsToEnforce?.includes(r.id) ? { ...r, enforced: true } : r
    );
    setDraftRules(updatedRules);

    // Apply config
    const updatedConfig = {
      ...draftConfig,
      temperature: patch.temperature ?? draftConfig.temperature,
      groundingMode: patch.groundingMode ?? draftConfig.groundingMode,
      confidenceThreshold: patch.confidenceThreshold ?? draftConfig.confidenceThreshold
    };
    setDraftConfig(updatedConfig);
    setDirectiveApplied(true);

    // Automatically run benchmark simulation with updated draft
    setIsSimulating(true);
    setTimeout(() => {
      const result = runBenchmarkSimulation(selectedAgent.id, updatedConfig, updatedRules);
      setSimulationResult(result);
      setIsSimulating(false);
    }, 400);
  };

  const handleSaveAllRefinements = () => {
    refineAgent(selectedAgent.id, {
      skills: draftSkills,
      rules: draftRules,
      fineTuneConfig: draftConfig
    });
    // Run benchmark simulation to show updated projected impact
    const result = runBenchmarkSimulation(selectedAgent.id, draftConfig, draftRules);
    setSimulationResult(result);
  };

  const handleResetToCurrent = () => {
    setDraftSkills([...selectedAgent.skills]);
    setDraftRules([...selectedAgent.rules]);
    setDraftConfig({ ...selectedAgent.fineTuneConfig });
    setSimulationResult(null);
    setDirectiveApplied(false);
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Healthy &amp; Active
        </span>
      );
    } else if (status === 'warning') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" /> Warning &bull; Elevated Reprompts
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" /> Degraded &bull; Refinement Required
        </span>
      );
    }
  };

  const agentTraces = recentTraces.filter(t => t.agentId === selectedAgent.id);

  return (
    <div className="space-y-6">
      {/* 1. Agent Selector Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {agents.map((agent) => {
          const isSelected = agent.id === selectedAgentId;
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-brand-500 shadow-lg shadow-brand-500/15 ring-1 ring-brand-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: agent.color }}
                />
                <span className="text-[10px] font-mono text-slate-500 truncate">{agent.model.replace('gemini-', '')}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 truncate">{agent.name}</h4>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px]">
                <span className="text-slate-400 font-mono">{agent.avgLatency}s TTR</span>
                <span
                  className={`font-semibold ${
                    agent.errors.hallucinationRate > 5.0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {agent.errors.hallucinationRate}% Hal
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Selected Agent Header & Sub-Tabs Navigation */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{
                backgroundColor: `${selectedAgent.color}20`,
                border: `1px solid ${selectedAgent.color}40`,
                color: selectedAgent.color
              }}
            >
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-tight">{selectedAgent.name}</h2>
                {getStatusBadge(selectedAgent.status)}
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                  Model: {selectedAgent.model}
                </span>
                {selectedAgent.cloudService && (
                  <a
                    href={selectedAgent.cloudService.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                    title={`Live Cloud Run Endpoint: ${selectedAgent.cloudService.url}`}
                  >
                    <Server className="w-3 h-3 text-emerald-400" />
                    <span>Cloud Run: {selectedAgent.cloudService.name} ({selectedAgent.cloudService.region})</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedAgent.role}</p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-4 text-xs flex-wrap">
            {selectedAgent.workforce && (
              <div className="text-right border-r border-slate-800 pr-4">
                <span className="text-emerald-400 text-[10px] block font-semibold">Employee Grade</span>
                <span className="font-mono text-emerald-300 font-bold">Grade {selectedAgent.workforce.performanceGrade} ({Math.round(selectedAgent.workforce.netROI).toLocaleString()}x ROI)</span>
              </div>
            )}
            <div className="text-right">
              <span className="text-slate-500 text-[10px] block">Runs &amp; Cost</span>
              <span className="font-mono text-slate-200 font-bold">{selectedAgent.totalRuns.toLocaleString()} runs (${selectedAgent.costEstimate})</span>
            </div>
            <div className="text-right border-l border-slate-800 pl-4">
              <span className="text-slate-500 text-[10px] block">Latency (TTR)</span>
              <span className="font-mono text-sky-400 font-bold">{selectedAgent.avgLatency}s</span>
            </div>
            <div className="text-right border-l border-slate-800 pl-4">
              <span className="text-slate-500 text-[10px] block">Hallucination</span>
              <span className={`font-mono font-bold ${selectedAgent.errors.hallucinationRate > 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                {selectedAgent.errors.hallucinationRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Studio Sub-Navigation Bar */}
        <div className="flex items-center justify-between gap-4 pt-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setSubTab('refine'); setAgentActiveSubTab('refine'); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'refine'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Refine Agent (Skills, Rules, Model &amp; Prompts)</span>
            </button>

            <button
              onClick={() => { setSubTab('workforce'); setAgentActiveSubTab('workforce'); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'workforce'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Employee Performance &amp; ROI</span>
              {selectedAgent.workforce && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  {selectedAgent.workforce.performanceGrade}
                </span>
              )}
            </button>

            <button
              onClick={() => { setSubTab('telemetry'); setAgentActiveSubTab('telemetry'); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'telemetry'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Error &amp; Token Telemetry</span>
            </button>

            <button
              onClick={() => { setSubTab('traces'); setAgentActiveSubTab('traces'); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'traces'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Live Execution Traces</span>
            </button>

            <button
              onClick={() => { setSubTab('iam'); setAgentActiveSubTab('iam'); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'iam'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Agent IAM &amp; Cost Controls</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                GCP IAM
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            Targeting <span className="text-brand-400 font-semibold">{selectedAgent.name}</span>
          </div>
        </div>
      </div>

      {/* 3. SUB-TAB 1: REFINE AGENT (SKILLS, RULES, MODEL OPTIONS, SYSTEM PROMPTS) */}
      {subTab === 'refine' && (
        <div className="space-y-6">
          {/* Supervisory Coaching Directive Banner (If agent has active coaching directive) */}
          {selectedAgent.coachingDirective && (
            <div className="bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900/90 border border-rose-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" /> Supervisory Coaching Directive
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Issued by: <span className="text-slate-200 font-semibold">{selectedAgent.coachingDirective.supervisor}</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {selectedAgent.coachingDirective.detectedAnomaly}
                  </h3>
                  <p className="text-xs text-slate-300">
                    <span className="text-amber-400 font-semibold">Recommended Intervention:</span> {selectedAgent.coachingDirective.actionPlan}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={handleApplyCoachingDirective}
                    disabled={directiveApplied}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                      directiveApplied
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-600/25 active:scale-95'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>{directiveApplied ? '✓ Coaching Recommendations Applied & Simulated' : 'Apply Coaching Recommendations (1-Click)'}</span>
                  </button>
                </div>
              </div>

              {directiveApplied && (
                <div className="mt-3 pt-3 border-t border-rose-500/20 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Enforced wholesale margin floor &amp; discount rules, lowered temperature to 0.20, and engaged strict grounding. Simulation run below.
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">Click &quot;Save &amp; Deploy Changes&quot; to push live</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Refinement Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section A: Agent Skills Refinement */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-brand-400" />
                    Agent Skills &amp; Tool Capabilities ({draftSkills.filter(s => s.enabled).length}/{draftSkills.length} Active)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Toggle or assign executable tool definitions and MCP actions to this agent.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSkillModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-400" /> Add Skill
                </button>
              </div>

              {/* Skills List */}
              <div className="space-y-2.5">
                {draftSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      skill.enabled
                        ? 'bg-slate-900/70 border-slate-800'
                        : 'bg-slate-950/40 border-slate-850 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={skill.enabled}
                        onChange={() => handleToggleSkill(skill.id)}
                        className="mt-1 w-4 h-4 accent-brand-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-bold text-brand-300">{skill.name}</code>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                              skill.riskLevel === 'high'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : skill.riskLevel === 'medium'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {skill.riskLevel} risk
                          </span>
                          {skill.runs !== undefined && (
                            <span className="text-[10px] text-slate-500 font-mono">({skill.runs.toLocaleString()} runs)</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{skill.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSkill(skill.id)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                        skill.enabled
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-slate-500 bg-slate-800'
                      }`}
                    >
                      {skill.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Skill Modal/Form */}
              {showAddSkillModal && (
                <form onSubmit={handleCreateSkill} className="bg-slate-950 border border-brand-500/40 rounded-xl p-3.5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                    <span>Register New Agent Skill</span>
                    <button type="button" onClick={() => setShowAddSkillModal(false)} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 text-[10px] block mb-1">Skill Identifier (snake_case):</label>
                      <input
                        type="text"
                        placeholder="e.g. verify_inventory_threshold"
                        value={newSkillForm.name}
                        onChange={(e) => setNewSkillForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] block mb-1">Execution Risk Level:</label>
                      <select
                        value={newSkillForm.riskLevel}
                        onChange={(e) => setNewSkillForm(prev => ({ ...prev, riskLevel: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      >
                        <option value="low">Low (Read-only)</option>
                        <option value="medium">Medium (DB updates)</option>
                        <option value="high">High (Financial / Coupons)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-1">Description &amp; Parameter Contract:</label>
                    <input
                      type="text"
                      placeholder="Validates product stock and returns warehouse availability map"
                      value={newSkillForm.description}
                      onChange={(e) => setNewSkillForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddSkillModal(false)}
                      className="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                    >
                      Save Skill
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Section B: Governance Rules & Guardrails Refinement */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    Enforced Governance Rules &amp; Guardrails ({draftRules.filter(r => r.enforced).length}/{draftRules.length} Enforced)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Define hard bounds, safety invariants, and compliance policies enforced at runtime.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddRuleModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add Rule
                </button>
              </div>

              {/* Rules List */}
              <div className="space-y-2.5">
                {draftRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      rule.enforced
                        ? 'bg-slate-900/70 border-slate-800'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={rule.enforced}
                        onChange={() => handleToggleRule(rule.id)}
                        className="mt-1 w-4 h-4 accent-emerald-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{rule.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                              rule.category === 'safety'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : rule.category === 'privacy'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            }`}
                          >
                            {rule.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{rule.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                        rule.enforced
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-rose-400 bg-rose-500/10 animate-pulse'
                      }`}
                    >
                      {rule.enforced ? 'Enforced' : 'DISABLED'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Rule Modal/Form */}
              {showAddRuleModal && (
                <form onSubmit={handleCreateRule} className="bg-slate-950 border border-emerald-500/40 rounded-xl p-3.5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                    <span>Create Governance Rule</span>
                    <button type="button" onClick={() => setShowAddRuleModal(false)} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 text-[10px] block mb-1">Rule Name:</label>
                      <input
                        type="text"
                        placeholder="e.g. Margin Threshold Guarantee"
                        value={newRuleForm.name}
                        onChange={(e) => setNewRuleForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] block mb-1">Policy Category:</label>
                      <select
                        value={newRuleForm.category}
                        onChange={(e) => setNewRuleForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      >
                        <option value="safety">Safety (Hard Intercept)</option>
                        <option value="business">Business Policy</option>
                        <option value="privacy">Privacy &amp; PII</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-1">Policy Directive &amp; Invariant:</label>
                    <input
                      type="text"
                      placeholder="Block output if item margin drops below 12% without senior manager clearance"
                      value={newRuleForm.description}
                      onChange={(e) => setNewRuleForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddRuleModal(false)}
                      className="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Enforce Rule
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Section C: Model Architecture & Sampling Options */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Cpu className="w-4 h-4 text-brand-400" />
                Model Options &amp; Hyperparameters
              </h3>

              {/* Model Choice */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Underlying Model Checkpoint:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'High QPS & Fast TTR' },
                    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Deep Reasoning & CoT' },
                    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Next-Gen Native Tools' },
                    { id: 'gemini-1.5-pro-tuned-v2', name: 'NovaSmart LoRA v2', tag: 'Fine-Tuned Domain Weights' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDraftConfig(prev => ({ ...prev, model: m.id }))}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        draftConfig.model === m.id
                          ? 'bg-brand-500/10 border-brand-500 text-white ring-1 ring-brand-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold block">{m.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{m.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Temperature (Randomness vs Grounded Factuality)</span>
                  <span className="font-mono font-bold text-brand-400">{draftConfig.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={draftConfig.temperature}
                  onChange={(e) => setDraftConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.0 (Deterministic)</span>
                  <span>0.3 (Recommended)</span>
                  <span>1.0 (Creative / High Risk)</span>
                </div>
              </div>

              {/* Top-P & Max Tokens */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Top-P Sampling</span>
                    <span className="font-mono font-bold text-slate-200">{draftConfig.topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={draftConfig.topP}
                    onChange={(e) => setDraftConfig(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                    className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Max Output Tokens</span>
                    <span className="font-mono font-bold text-slate-200">{draftConfig.maxOutputTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="512"
                    max="8192"
                    step="512"
                    value={draftConfig.maxOutputTokens}
                    onChange={(e) => setDraftConfig(prev => ({ ...prev, maxOutputTokens: parseInt(e.target.value) }))}
                    className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Grounding Verification Mode */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs text-slate-300 font-medium block">Grounding Mode:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['strict', 'balanced', 'permissive'].map((gm) => (
                    <button
                      key={gm}
                      type="button"
                      onClick={() => setDraftConfig(prev => ({ ...prev, groundingMode: gm }))}
                      className={`p-2 rounded-lg border text-center capitalize text-xs font-semibold transition-all ${
                        draftConfig.groundingMode === gm
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {gm}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section D: System Prompt Directives */}
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Code className="w-4 h-4 text-brand-400" />
                  System Prompt Instructions &amp; Persona
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  {draftConfig.systemPrompt?.length || 0} characters
                </span>
              </div>
              <textarea
                rows={5}
                value={draftConfig.systemPrompt}
                onChange={(e) => setDraftConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed"
                placeholder="Enter system instructions..."
              />
            </div>
          </div>

          {/* Right Column: Simulation & Deployment (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Simulation Test Bench */}
            <div className="glass-panel rounded-2xl p-5 border-brand-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    Interactive Refinement Simulator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Test the impact of your skill, rule, and model refinements before production release
                  </p>
                </div>
              </div>

              {/* Evaluation Query Input */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-300 font-medium">Evaluation Prompt:</span>
                <textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              {/* Run Simulation Button */}
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Simulating Workload Impact...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Run Synthetic Benchmark &amp; Impact Analysis
                  </>
                )}
              </button>

              {/* Simulation Comparison Results Card */}
              {simulationResult ? (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                    <span>Projected Operational Impact</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Based on tuned parameters</span>
                  </div>

                  {/* Hallucination */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Hallucination Rate:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 line-through">
                        {simulationResult.before.hallucinationRate}%
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {simulationResult.after.hallucinationRate}%
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                        -{simulationResult.impact.halReduction}% Risk
                      </span>
                    </div>
                  </div>

                  {/* Reprompts */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-orange-400" /> Reprompt Loops:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 line-through">
                        {simulationResult.before.repromptRate}%
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {simulationResult.after.repromptRate}%
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                        -{simulationResult.impact.repromptReduction}% Retries
                      </span>
                    </div>
                  </div>

                  {/* Latency */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" /> Time to Result:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 line-through">
                        {simulationResult.before.latency}s
                      </span>
                      <span className="font-mono font-bold text-white">
                        {simulationResult.after.latency}s
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({simulationResult.impact.latencyDelta >= 0 ? '+' : ''}{simulationResult.impact.latencyDelta}s)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
                  Run simulated benchmark to evaluate how your skills, rules, and model tweaks improve reliability and response time.
                </div>
              )}

              {/* Action Buttons: Save & Apply Refinements */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={handleSaveAllRefinements}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  Save &amp; Deploy Refinements to Agent
                </button>

                <button
                  onClick={handleResetToCurrent}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Stored State
                </button>
              </div>
            </div>

            {/* Governance Hint Card */}
            <div className="glass-panel rounded-2xl p-4 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Governance &amp; Refinement Summary
              </div>
              <p className="leading-relaxed text-[11px]">
                Enforcing all safety rules (e.g. <em>Wholesale Margin Floor</em> or <em>25% Discount Cap</em>) immediately protects your agent against critical hallucinated concessions and drops the fleet error rate into healthy thresholds.
              </p>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* 4. SUB-TAB 2: ERROR & TOKEN TELEMETRY */}
      {subTab === 'telemetry' && (
        <div className="space-y-6">
          {/* 4 Core Metric Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Token Usage & Type Distribution */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Coins className="w-4 h-4 text-brand-400" /> Total Tokens
                </span>
                <span className="font-mono text-slate-300">{selectedAgent.totalRuns.toLocaleString()} runs</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {(selectedAgent.tokens.total / 1000000).toFixed(2)}M
              </div>

              {/* Token Type Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden mt-3">
                <div
                  className="bg-indigo-500 h-full"
                  style={{ width: `${(selectedAgent.tokens.input / selectedAgent.tokens.total) * 100}%` }}
                  title="Input Tokens"
                />
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${(selectedAgent.tokens.output / selectedAgent.tokens.total) * 100}%` }}
                  title="Output Tokens"
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(selectedAgent.tokens.cached / selectedAgent.tokens.total) * 100}%` }}
                  title="Cached Tokens"
                />
                <div
                  className="bg-pink-500 h-full"
                  style={{ width: `${(selectedAgent.tokens.reasoning / selectedAgent.tokens.total) * 100}%` }}
                  title="Reasoning Tokens"
                />
              </div>

              <div className="grid grid-cols-2 gap-1 mt-2.5 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  In: {(selectedAgent.tokens.input / 1000000).toFixed(1)}M
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Out: {(selectedAgent.tokens.output / 1000000).toFixed(1)}M
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Cache: {(selectedAgent.tokens.cached / 1000000).toFixed(1)}M
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                  CoT: {(selectedAgent.tokens.reasoning / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>

            {/* Metric 2: Hallucination Rate */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Hallucination Rate
                </span>
                <span className="font-mono text-rose-400">{selectedAgent.errors.hallucinationCount} incidents</span>
              </div>
              <div className="text-2xl font-black font-mono text-rose-400">
                {selectedAgent.errors.hallucinationRate}%
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                <span>Grounding Score:</span>
                <span className="font-mono text-slate-200 font-bold">
                  {(selectedAgent.errors.groundingScore * 100).toFixed(0)} / 100
                </span>
              </div>
            </div>

            {/* Metric 3: Reprompting Frequency */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <RefreshCw className="w-4 h-4 text-orange-400" /> Reprompt Rate
                </span>
                <span className="font-mono text-orange-400">{selectedAgent.errors.repromptCount} loops</span>
              </div>
              <div className="text-2xl font-black font-mono text-orange-400">
                {selectedAgent.errors.repromptRate}%
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                <span>Avg Retries / Query:</span>
                <span className="font-mono text-slate-200 font-bold">
                  {selectedAgent.errors.avgRepromptsPerQuery}x
                </span>
              </div>
            </div>

            {/* Metric 4: Time to Result Velocity */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-sky-400" /> Time to Result
                </span>
                <span className="font-mono text-emerald-400">SLA Tracked</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {selectedAgent.avgLatency}s
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                <span>Inference / Tool Split:</span>
                <span className="font-mono text-slate-200">
                  {(selectedAgent.avgLatency * 0.6).toFixed(1)}s / {(selectedAgent.avgLatency * 0.4).toFixed(1)}s
                </span>
              </div>
            </div>
          </div>

          {/* Deep-Dive Analysis Split: Hallucination Log & Reprompt Triggers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hallucination Intercept Log */}
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Hallucination Detections &amp; Grounding Drift
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Claims intercepted by real-time grounding and fact verification
                  </p>
                </div>
                <span className="text-xs font-mono text-rose-400 font-semibold">
                  {selectedAgent.errors.hallucinationExamples.length} Recent Logs
                </span>
              </div>

              <div className="space-y-3">
                {selectedAgent.errors.hallucinationExamples.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/70 border border-rose-500/20 rounded-xl p-3.5 space-y-2 hover:border-rose-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                        Severity: {item.severity}
                      </span>
                      <span className="text-slate-500 font-mono">{item.detectedAt}</span>
                    </div>
                    <p className="text-xs text-slate-200 font-sans italic">
                      "{item.claim}"
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                      <span>Verifier Confidence Score:</span>
                      <span className="font-mono font-bold text-rose-300">{(item.confidence * 100).toFixed(0)}% confident hallucinated</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reprompting Drivers & Loop Breakdown */}
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-orange-400" />
                    Reprompting Drivers &amp; Error Taxonomy
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Root causes forcing the runtime or user to reprompt and retry
                  </p>
                </div>
                <span className="text-xs font-mono text-orange-400 font-semibold">
                  {selectedAgent.errors.repromptRate}% of queries
                </span>
              </div>

              <div className="space-y-3">
                {selectedAgent.errors.repromptReasons.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{item.reason}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">{item.count} events</span>
                        <span className="font-mono font-semibold text-orange-400">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Granular Gantt Latency Waterfall & Context Bloat Trace (agy_token_observability) */}
          <div className="pt-2">
            <TokenWaterfallTrace />
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 3: LIVE EXECUTION TRACES */}
      {subTab === 'traces' && (
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                Live Execution Traces &amp; Audit Trail for {selectedAgent.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Query executions, tool invocations, and reprompting diagnostics
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter queries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2.5 font-semibold">Trace ID</th>
                  <th className="pb-2.5 font-semibold">Timestamp</th>
                  <th className="pb-2.5 font-semibold">User Prompt / Query</th>
                  <th className="pb-2.5 font-semibold">TTR Latency</th>
                  <th className="pb-2.5 font-semibold">Tokens</th>
                  <th className="pb-2.5 font-semibold">Reprompts</th>
                  <th className="pb-2.5 font-semibold">Grounding</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {agentTraces
                  .filter(t => !searchQuery || t.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.includes(searchQuery))
                  .map((trace) => (
                    <tr key={trace.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2.5 font-mono text-brand-400 font-semibold">{trace.id}</td>
                      <td className="py-2.5 text-slate-400">{trace.timestamp}</td>
                      <td className="py-2.5 text-slate-200 max-w-xs truncate" title={trace.prompt}>
                        {trace.prompt}
                      </td>
                      <td className="py-2.5 font-mono text-slate-200">{trace.latency}s</td>
                      <td className="py-2.5 font-mono text-slate-400">
                        {trace.tokens.total} <span className="text-[10px] text-slate-500">(In:{trace.tokens.input} Out:{trace.tokens.output})</span>
                      </td>
                      <td className="py-2.5 font-mono">
                        {trace.reprompts > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-semibold">
                            {trace.reprompts} retries
                          </span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="py-2.5 font-mono text-slate-300">
                        {(trace.groundingConfidence * 100).toFixed(0)}%
                      </td>
                      <td className="py-2.5">
                        {trace.status === 'success' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Success
                          </span>
                        )}
                        {trace.status === 'reprompt_loop' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            Reprompt Loop
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Live Google Cloud Logging Stream */}
          {cloudLogs && cloudLogs.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Google Cloud Logging (Cloud Run Services: promo-agent-shadow / novasmart-mcp)
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {cloudLogs.length} live entries fetched via ADC
                </span>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5">
                {cloudLogs.map((log, idx) => (
                  <div key={log.insertId || idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-slate-500 shrink-0 select-none">{log.timestamp?.substring(11, 19)}</span>
                    <span className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                      log.severity === 'WARNING' || log.severity === 'ERROR' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {log.severity || 'INFO'}
                    </span>
                    <span className="text-indigo-400 shrink-0">[{log.service}]</span>
                    <span className="text-slate-200 truncate flex-1" title={log.payload}>{log.payload}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SUB-TAB 4: DIGITAL EMPLOYEE PERFORMANCE & ROI REVIEW */}
      {subTab === 'workforce' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Employee P&L Hero Card */}
          <div className="glass-panel rounded-2xl p-6 border-emerald-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-lg"
                  style={{
                    backgroundColor: `${selectedAgent.color}20`,
                    border: `1px solid ${selectedAgent.color}40`,
                    color: selectedAgent.color
                  }}
                >
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {selectedAgent.workforce?.employeeTitle || selectedAgent.role}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-black font-mono ${
                        selectedAgent.workforce?.performanceGrade === 'A+'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : selectedAgent.workforce?.performanceGrade === 'C-'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      Grade {selectedAgent.workforce?.performanceGrade || 'A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Benchmarked against human employee standard: {selectedAgent.workforce?.humanMinutesPerTask} mins/task @ ${selectedAgent.workforce?.hourlyWageBenchmark}/hr payroll rate
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSubTab('refine'); setAgentActiveSubTab('refine'); }}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
                >
                  <span>Apply Coaching &amp; Refine</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Employee P&L 4-Card Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span className="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Economic Value Created
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ${((selectedAgent.workforce?.totalEconomicValue || 0) / 1000).toFixed(0)}k
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  vs ${selectedAgent.costEstimate} compute spend ({Math.round(selectedAgent.workforce?.netROI || 0).toLocaleString()}x ROI)
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span className="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Human Labor Liberated
                </span>
                <span className="text-2xl font-black font-mono text-sky-300">
                  {selectedAgent.workforce?.humanLaborHoursSaved?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  hours saved across {selectedAgent.totalRuns.toLocaleString()} runs
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span className="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Unit Cost (CPWU)
                </span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  ${selectedAgent.workforce?.costPerWorkUnit}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1 line-through">
                  ${selectedAgent.workforce?.humanCostPerWorkUnit} human baseline
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span className="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> First-Time Right Rate
                </span>
                <span className="text-2xl font-black font-mono text-indigo-300">
                  {selectedAgent.workforce?.firstTimeRightRate}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {selectedAgent.workforce?.escalationRate}% escalated to human manager
                </span>
              </div>
            </div>
          </div>

          {/* Competency Ratings, Escalation Causes & Coaching Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Core Competency Ratings */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Percent className="w-4 h-4 text-emerald-400" />
                Core Competencies &amp; Skill Mastery
              </h4>
              <div className="space-y-3">
                {(selectedAgent.workforce?.competencies || []).map((comp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{comp.name}</span>
                      <span className="font-mono font-bold text-slate-200">{comp.score}/100</span>
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
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Users className="w-4 h-4 text-amber-400" />
                Human Supervisor Escalation Triggers
              </h4>
              <div className="space-y-2.5">
                {(selectedAgent.workforce?.escalationReasons || []).map((esc, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="text-slate-200 font-medium block">{esc.reason}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{esc.count} incidents logged</span>
                    </div>
                    <span className="font-mono text-amber-400 font-bold text-sm">{esc.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Managerial Coaching Guidance */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Award className="w-4 h-4 text-brand-400" />
                Supervisor Performance Coaching
              </h4>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-3">
                <p className="italic leading-relaxed">
                  "{selectedAgent.workforce?.coachingNotes}"
                </p>
                <div className="pt-3 border-t border-slate-800 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Autonomous Reliability:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedAgent.workforce?.autonomousResolutionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Execution Velocity:</span>
                    <span className="font-mono text-sky-400 font-bold">{selectedAgent.workforce?.speedupMultiplier}x vs Human</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setSubTab('refine'); setAgentActiveSubTab('refine'); }}
                className="w-full py-2 px-3 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/40 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>Edit Skills &amp; Rules to Address Notes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 5: AGENT IAM & FINOPS GOVERNANCE CONTROLS */}
      {subTab === 'iam' && (
        <AgentIAMControls agent={selectedAgent} />
      )}
    </div>
  );
}
