import { createSignal, createMemo, createEffect, Show, For, Switch, Match } from 'solid-js';
import { dashboardState } from '../../state/dashboardState.js';
import { TokenWaterfallTrace } from '../telemetry/TokenWaterfallTrace.jsx';
import { AgentIAMControls } from '../iam/AgentIAMControls.jsx';
import {
  Coins,
  Cpu,
  Clock,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Shield,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Search,
  Code,
  Wrench,
  Plus,
  Play,
  Save,
  RotateCcw,
  Sparkles,
  Activity,
  X,
  Briefcase,
  Award,
  DollarSign,
  Users,
  Percent,
  Server,
  ExternalLink,
  Zap
} from 'lucide-solid';

export function AgentDetailView() {
  const agents = () => dashboardState.agents;
  const selectedAgent = () => dashboardState.selectedAgent;
  const selectedAgentId = () => dashboardState.selectedAgentId;
  const agentActiveSubTab = () => dashboardState.agentActiveSubTab;
  const recentTraces = () => dashboardState.recentTraces;
  const cloudLogs = () => dashboardState.cloudLogs;

  const [subTab, setSubTab] = createSignal('refine');
  const [draftSkills, setDraftSkills] = createSignal([]);
  const [draftRules, setDraftRules] = createSignal([]);
  const [draftConfig, setDraftConfig] = createSignal({});
  const [simulationResult, setSimulationResult] = createSignal(null);
  const [isSimulating, setIsSimulating] = createSignal(false);
  const [testPrompt, setTestPrompt] = createSignal(
    'Calculate promotional bundle for SKU-9014 with 20% loyalty markdown and verify inventory in regional warehouse'
  );

  const [showAddSkillModal, setShowAddSkillModal] = createSignal(false);
  const [newSkillForm, setNewSkillForm] = createSignal({ name: '', description: '', riskLevel: 'low' });

  const [showAddRuleModal, setShowAddRuleModal] = createSignal(false);
  const [newRuleForm, setNewRuleForm] = createSignal({ name: '', description: '', category: 'safety' });

  const [searchQuery, setSearchQuery] = createSignal('');
  const [directiveApplied, setDirectiveApplied] = createSignal(false);

  // Sync draft state whenever selected agent changes
  createEffect(() => {
    const ag = selectedAgent();
    if (ag) {
      setDraftSkills(JSON.parse(JSON.stringify(ag.skills || [])));
      setDraftRules(JSON.parse(JSON.stringify(ag.rules || [])));
      setDraftConfig(JSON.parse(JSON.stringify(ag.fineTuneConfig || {})));
      setSimulationResult(null);
      setDirectiveApplied(false);
    }
  });

  // Sync external subTab changes
  createEffect(() => {
    const active = agentActiveSubTab();
    if (active) {
      setSubTab(active);
    }
  });

  function handleToggleSkill(skillId) {
    setDraftSkills(prev => prev.map(s => s.id === skillId ? { ...s, enabled: !s.enabled } : s));
  }

  function handleToggleRule(ruleId) {
    setDraftRules(prev => prev.map(r => r.id === ruleId ? { ...r, enforced: !r.enforced } : r));
  }

  function handleCreateSkill(e) {
    e.preventDefault();
    const form = newSkillForm();
    if (!form.name) return;
    const newSkill = {
      id: `sk-custom-${Date.now().toString().slice(-4)}`,
      name: form.name.toLowerCase().replace(/\s+/g, '_'),
      description: form.description || 'Custom user-defined skill',
      enabled: true,
      riskLevel: form.riskLevel,
      runs: 0
    };
    setDraftSkills(prev => [...prev, newSkill]);
    dashboardState.addAgentSkill(selectedAgent().id, newSkill);
    setNewSkillForm({ name: '', description: '', riskLevel: 'low' });
    setShowAddSkillModal(false);
  }

  function handleCreateRule(e) {
    e.preventDefault();
    const form = newRuleForm();
    if (!form.name) return;
    const newRule = {
      id: `rl-custom-${Date.now().toString().slice(-4)}`,
      name: form.name,
      description: form.description || 'Custom governance constraint',
      enforced: true,
      category: form.category
    };
    setDraftRules(prev => [...prev, newRule]);
    dashboardState.addAgentRule(selectedAgent().id, newRule);
    setNewRuleForm({ name: '', description: '', category: 'safety' });
    setShowAddRuleModal(false);
  }

  function handleRunSimulation() {
    setIsSimulating(true);
    setTimeout(() => {
      const ag = selectedAgent();
      if (ag) {
        const result = dashboardState.runBenchmarkSimulation(ag.id, draftConfig(), draftRules());
        setSimulationResult(result);
      }
      setIsSimulating(false);
    }, 600);
  }

  function handleApplyCoachingDirective() {
    const ag = selectedAgent();
    if (!ag?.coachingDirective?.presetPatch) return;
    const patch = ag.coachingDirective.presetPatch;
    
    // Apply rules
    setDraftRules(prev => prev.map(r => 
      patch.ruleIdsToEnforce?.includes(r.id) ? { ...r, enforced: true } : r
    ));

    // Apply config
    setDraftConfig(prev => ({
      ...prev,
      temperature: patch.temperature ?? prev.temperature,
      groundingMode: patch.groundingMode ?? prev.groundingMode,
      confidenceThreshold: patch.confidenceThreshold ?? prev.confidenceThreshold
    }));
    setDirectiveApplied(true);

    // Automatically run benchmark simulation with updated draft
    setIsSimulating(true);
    setTimeout(() => {
      const result = dashboardState.runBenchmarkSimulation(ag.id, draftConfig(), draftRules());
      setSimulationResult(result);
      setIsSimulating(false);
    }, 400);
  }

  function handleSaveAllRefinements() {
    const ag = selectedAgent();
    if (ag) {
      dashboardState.refineAgent(ag.id, {
        skills: draftSkills(),
        rules: draftRules(),
        fineTuneConfig: draftConfig()
      });
      const result = dashboardState.runBenchmarkSimulation(ag.id, draftConfig(), draftRules());
      setSimulationResult(result);
    }
  }

  function handleResetToCurrent() {
    const ag = selectedAgent();
    if (ag) {
      setDraftSkills(JSON.parse(JSON.stringify(ag.skills || [])));
      setDraftRules(JSON.parse(JSON.stringify(ag.rules || [])));
      setDraftConfig(JSON.parse(JSON.stringify(ag.fineTuneConfig || {})));
      setSimulationResult(null);
      setDirectiveApplied(false);
    }
  }

  const agentTraces = createMemo(() => {
    const ag = selectedAgent();
    if (!ag) return [];
    return recentTraces().filter(t => t.agentId === ag.id);
  });

  return (
    <div class="space-y-6">
      {/* 1. Agent Selector Header Strip */}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <For each={agents()}>
          {(agent) => {
            const isSelected = () => agent.id === selectedAgentId();
            return (
              <button
                onClick={() => dashboardState.setSelectedAgentId(agent.id)}
                class={`p-3 rounded-xl border text-left transition-all ${
                  isSelected()
                    ? 'bg-slate-900 border-brand-500 shadow-lg shadow-brand-500/15 ring-1 ring-brand-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div class="flex items-center justify-between mb-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ "background-color": agent.color }}
                  ></span>
                  <span class="text-[10px] font-mono text-slate-500 truncate">{agent.model.replace('gemini-', '')}</span>
                </div>
                <h4 class="text-xs font-bold text-slate-200 truncate">{agent.name}</h4>
                <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px]">
                  <span class="text-slate-400 font-mono">{agent.avgLatency}s TTR</span>
                  <span class={`font-semibold ${agent.errors?.hallucinationRate > 5.0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {agent.errors?.hallucinationRate}% Hal
                  </span>
                </div>
              </button>
            );
          }}
        </For>
      </div>

      {/* 2. Selected Agent Header & Sub-Tabs Navigation */}
      <Show when={selectedAgent()}>
        {(() => {
          const ag = selectedAgent();
          return (
            <div class="glass-panel rounded-2xl p-6">
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div class="flex items-start gap-4">
                  <div
                    class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                    style={{
                      "background-color": `${ag.color}20`,
                      border: `1px solid ${ag.color}40`,
                      color: ag.color
                    }}
                  >
                    <Cpu class="w-6 h-6" />
                  </div>
                  <div>
                    <div class="flex items-center gap-3 flex-wrap">
                      <h2 class="text-lg font-bold text-white tracking-tight">{ag.name}</h2>
                      <Show
                        when={ag.status === 'active'}
                        fallback={
                          <Show
                            when={ag.status === 'warning'}
                            fallback={
                              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 animate-pulse">
                                <AlertTriangle class="w-3.5 h-3.5" /> Degraded &bull; Refinement Required
                              </span>
                            }
                          >
                            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                              <AlertCircle class="w-3.5 h-3.5" /> Warning &bull; Elevated Reprompts
                            </span>
                          </Show>
                        }
                      >
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                          <CheckCircle2 class="w-3.5 h-3.5" /> Healthy &amp; Active
                        </span>
                      </Show>
                      <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                        Model: {ag.model}
                      </span>
                      <Show when={ag.cloudService}>
                        <a
                          href={ag.cloudService.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                          title={`Live Cloud Run Endpoint: ${ag.cloudService.url}`}
                        >
                          <Server class="w-3 h-3 text-emerald-400" />
                          <span>Cloud Run: {ag.cloudService.name} ({ag.cloudService.region})</span>
                          <ExternalLink class="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </Show>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">{ag.role}</p>
                  </div>
                </div>

                {/* Quick Metrics Strip */}
                <div class="flex items-center gap-4 text-xs flex-wrap">
                  <Show when={ag.workforce}>
                    <div class="text-right border-r border-slate-800 pr-4">
                      <span class="text-emerald-400 text-[10px] block font-semibold">Employee Grade</span>
                      <span class="font-mono text-emerald-300 font-bold">Grade {ag.workforce.performanceGrade} ({Math.round(ag.workforce.netROI).toLocaleString()}x ROI)</span>
                    </div>
                  </Show>
                  <div class="text-right">
                    <span class="text-slate-500 text-[10px] block">Runs &amp; Cost</span>
                    <span class="font-mono text-slate-200 font-bold">{ag.totalRuns.toLocaleString()} runs (${ag.costEstimate})</span>
                  </div>
                  <div class="text-right border-l border-slate-800 pl-4">
                    <span class="text-slate-500 text-[10px] block">Latency (TTR)</span>
                    <span class="font-mono text-sky-400 font-bold">{ag.avgLatency}s</span>
                  </div>
                  <div class="text-right border-l border-slate-800 pl-4">
                    <span class="text-slate-500 text-[10px] block">Hallucination</span>
                    <span class={`font-mono font-bold ${ag.errors?.hallucinationRate > 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {ag.errors?.hallucinationRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Studio Sub-Navigation Bar */}
              <div class="flex items-center justify-between gap-4 pt-4 flex-wrap">
                <div class="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setSubTab('refine'); dashboardState.setAgentActiveSubTab('refine'); }}
                    class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab() === 'refine' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                  >
                    <Sliders class="w-3.5 h-3.5" />
                    <span>Refine Agent (Skills, Rules, Model &amp; Prompts)</span>
                  </button>

                  <button
                    onClick={() => { setSubTab('workforce'); dashboardState.setAgentActiveSubTab('workforce'); }}
                    class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab() === 'workforce' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                  >
                    <Briefcase class="w-3.5 h-3.5" />
                    <span>Employee Performance &amp; ROI</span>
                    <Show when={ag.workforce}>
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        {ag.workforce.performanceGrade}
                      </span>
                    </Show>
                  </button>

                  <button
                    onClick={() => { setSubTab('telemetry'); dashboardState.setAgentActiveSubTab('telemetry'); }}
                    class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab() === 'telemetry' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                  >
                    <Activity class="w-3.5 h-3.5" />
                    <span>Error &amp; Token Telemetry</span>
                  </button>

                  <button
                    onClick={() => { setSubTab('traces'); dashboardState.setAgentActiveSubTab('traces'); }}
                    class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab() === 'traces' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                  >
                    <Clock class="w-3.5 h-3.5" />
                    <span>Live Execution Traces</span>
                  </button>

                  <button
                    onClick={() => { setSubTab('iam'); dashboardState.setAgentActiveSubTab('iam'); }}
                    class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab() === 'iam' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                  >
                    <Shield class="w-3.5 h-3.5 text-indigo-400" />
                    <span>Agent IAM &amp; Cost Controls</span>
                    <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                      GCP IAM
                    </span>
                  </button>
                </div>

                <div class="text-[11px] text-slate-400 hidden sm:block">
                  Targeting <span class="text-brand-400 font-semibold">{ag.name}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </Show>

      {/* SUB-TAB CONTENTS */}
      <Switch>
        {/* 3. SUB-TAB 1: REFINE AGENT */}
        <Match when={subTab() === 'refine'}>
          {(() => {
            const ag = selectedAgent();
            if (!ag) return null;
            return (
              <div class="space-y-6">
                <Show when={ag.coachingDirective}>
                  <div class="bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900/90 border border-rose-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div class="space-y-1.5">
                        <div class="flex items-center gap-2">
                          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                            <AlertTriangle class="w-3.5 h-3.5" /> Supervisory Coaching Directive
                          </span>
                          <span class="text-xs text-slate-400 font-mono">
                            Issued by: <span class="text-slate-200 font-semibold">{ag.coachingDirective.supervisor}</span>
                          </span>
                        </div>
                        <h3 class="text-sm font-bold text-white">
                          {ag.coachingDirective.detectedAnomaly}
                        </h3>
                        <p class="text-xs text-slate-300">
                          {ag.coachingDirective.instruction}
                        </p>
                      </div>

                      <div class="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={handleApplyCoachingDirective}
                          class="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
                        >
                          <Sliders class="w-4 h-4" />
                          <span>{directiveApplied() ? '✓ Coaching Recommendations Applied & Simulated' : 'Apply Coaching Recommendations (1-Click)'}</span>
                        </button>
                      </div>
                    </div>

                    <Show when={directiveApplied()}>
                      <div class="mt-3 pt-3 border-t border-rose-500/20 flex items-center justify-between text-xs text-emerald-300">
                        <span class="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 class="w-4 h-4 text-emerald-400" />
                          Enforced wholesale margin floor &amp; discount rules, lowered temperature to 0.20, and engaged strict grounding. Simulation run below.
                        </span>
                        <span class="font-mono text-[11px] text-slate-400">Click &quot;Save &amp; Deploy Changes&quot; to push live</span>
                      </div>
                    </Show>
                  </div>
                </Show>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Refinement Controls (7 cols) */}
                  <div class="lg:col-span-7 space-y-6">
                    {/* Section A: Skills */}
                    <div class="glass-panel rounded-2xl p-5 space-y-4">
                      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                            <Wrench class="w-4 h-4 text-brand-400" />
                            Agent Skills &amp; Tool Capabilities ({draftSkills().filter(s => s.enabled).length}/{draftSkills().length} Active)
                          </h3>
                          <p class="text-[11px] text-slate-400 mt-0.5">
                            Toggle or assign executable tool definitions and MCP actions to this agent.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAddSkillModal(true)}
                          class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <Plus class="w-3.5 h-3.5 text-brand-400" /> Add Skill
                        </button>
                      </div>

                      {/* Skills List */}
                      <div class="space-y-2.5">
                        <For each={draftSkills()}>
                          {(skill) => (
                            <div
                              class={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${skill.enabled ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-950/40 border-slate-850 opacity-60'}`}
                            >
                              <div class="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={skill.enabled}
                                  onChange={() => handleToggleSkill(skill.id)}
                                  class="mt-1 w-4 h-4 accent-brand-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
                                />
                                <div>
                                  <div class="flex items-center gap-2">
                                    <code class="text-xs font-mono font-bold text-brand-300">{skill.name}</code>
                                    <span
                                      class={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                                        skill.riskLevel === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                        skill.riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      }`}
                                    >
                                      {skill.riskLevel} risk
                                    </span>
                                    <Show when={skill.runs !== undefined}>
                                      <span class="text-[10px] text-slate-500 font-mono">({skill.runs.toLocaleString()} runs)</span>
                                    </Show>
                                  </div>
                                  <p class="text-[11px] text-slate-400 mt-1 leading-snug">{skill.description}</p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleToggleSkill(skill.id)}
                                class={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${skill.enabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'}`}
                              >
                                {skill.enabled ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>
                          )}
                        </For>
                      </div>

                      {/* Add Skill Modal/Form */}
                      <Show when={showAddSkillModal()}>
                        <form onSubmit={handleCreateSkill} class="bg-slate-950 border border-brand-500/40 rounded-xl p-3.5 space-y-3">
                          <div class="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                            <span>Register New Agent Skill</span>
                            <button type="button" onClick={() => setShowAddSkillModal(false)} class="text-slate-400 hover:text-white">
                              <X class="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label for="new-skill-name" class="text-slate-400 text-[10px] block mb-1">Skill Identifier (snake_case):</label>
                              <input
                                id="new-skill-name"
                                type="text"
                                placeholder="e.g. verify_inventory_threshold"
                                value={newSkillForm().name}
                                onInput={(e) => setNewSkillForm(prev => ({ ...prev, name: e.target.value }))}
                                class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                                required
                              />
                            </div>
                            <div>
                              <label for="new-skill-risk" class="text-slate-400 text-[10px] block mb-1">Execution Risk Level:</label>
                              <select
                                id="new-skill-risk"
                                value={newSkillForm().riskLevel}
                                onChange={(e) => setNewSkillForm(prev => ({ ...prev, riskLevel: e.target.value }))}
                                class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                              >
                                <option value="low">Low (Read-only)</option>
                                <option value="medium">Medium (DB updates)</option>
                                <option value="high">High (Financial / Coupons)</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label for="new-skill-desc" class="text-slate-400 text-[10px] block mb-1">Description &amp; Parameter Contract:</label>
                            <input
                              id="new-skill-desc"
                              type="text"
                              placeholder="Validates product stock and returns warehouse availability map"
                              value={newSkillForm().description}
                              onInput={(e) => setNewSkillForm(prev => ({ ...prev, description: e.target.value }))}
                              class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                            />
                          </div>
                          <div class="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowAddSkillModal(false)}
                              class="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              class="px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                            >
                              Save Skill
                            </button>
                          </div>
                        </form>
                      </Show>
                    </div>

                    {/* Section B: Rules */}
                    <div class="glass-panel rounded-2xl p-5 space-y-4">
                      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                            <Shield class="w-4 h-4 text-emerald-400" />
                            Behavioral Guardrail Rules ({draftRules().filter(r => r.enforced).length}/{draftRules().length} Active)
                          </h3>
                          <p class="text-[11px] text-slate-400 mt-0.5">
                            Safety policies, boundary constraints, and compliance checks enforced during reasoning.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAddRuleModal(true)}
                          class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <Plus class="w-3.5 h-3.5 text-emerald-400" /> Add Rule
                        </button>
                      </div>

                      {/* Rules List */}
                      <div class="space-y-2.5">
                        <For each={draftRules()}>
                          {(rule) => (
                            <div
                              class={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${rule.enforced ? 'bg-slate-900/70 border-slate-800' : 'bg-rose-950/20 border-rose-500/30'}`}
                            >
                              <div class="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={rule.enforced}
                                  onChange={() => handleToggleRule(rule.id)}
                                  class="mt-1 w-4 h-4 accent-emerald-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
                                />
                                <div>
                                  <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-slate-200">{rule.name}</span>
                                    <span
                                      class={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                                        rule.category === 'safety' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                        rule.category === 'privacy' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                        'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                      }`}
                                    >
                                      {rule.category}
                                    </span>
                                  </div>
                                  <p class="text-[11px] text-slate-400 mt-1 leading-snug">{rule.description}</p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleToggleRule(rule.id)}
                                class={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${rule.enforced ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10 animate-pulse'}`}
                              >
                                {rule.enforced ? 'Enforced' : 'DISABLED'}
                              </button>
                            </div>
                          )}
                        </For>
                      </div>

                      {/* Add Rule Modal */}
                      <Show when={showAddRuleModal()}>
                        <form onSubmit={handleCreateRule} class="bg-slate-950 border border-emerald-500/40 rounded-xl p-3.5 space-y-3">
                          <div class="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                            <span>Create Governance Rule</span>
                            <button type="button" onClick={() => setShowAddRuleModal(false)} class="text-slate-400 hover:text-white">
                              <X class="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label for="new-rule-name" class="text-slate-400 text-[10px] block mb-1">Rule Name:</label>
                              <input
                                id="new-rule-name"
                                type="text"
                                placeholder="e.g. Margin Threshold Guarantee"
                                value={newRuleForm().name}
                                onInput={(e) => setNewRuleForm(prev => ({ ...prev, name: e.target.value }))}
                                class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                                required
                              />
                            </div>
                            <div>
                              <label for="new-rule-category" class="text-slate-400 text-[10px] block mb-1">Policy Category:</label>
                              <select
                                id="new-rule-category"
                                value={newRuleForm().category}
                                onChange={(e) => setNewRuleForm(prev => ({ ...prev, category: e.target.value }))}
                                class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                              >
                                <option value="safety">Safety (Hard Intercept)</option>
                                <option value="business">Business Policy</option>
                                <option value="privacy">Privacy &amp; PII</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label for="new-rule-desc" class="text-slate-400 text-[10px] block mb-1">Policy Directive &amp; Invariant:</label>
                            <input
                              id="new-rule-desc"
                              type="text"
                              placeholder="Block output if item margin drops below 12% without senior manager clearance"
                              value={newRuleForm().description}
                              onInput={(e) => setNewRuleForm(prev => ({ ...prev, description: e.target.value }))}
                              class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                            />
                          </div>
                          <div class="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowAddRuleModal(false)}
                              class="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                            >
                              Enforce Rule
                            </button>
                          </div>
                        </form>
                      </Show>
                    </div>

                    {/* Section C: Model Architecture */}
                    <div class="glass-panel rounded-2xl p-5 space-y-4">
                      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Cpu class="w-4 h-4 text-brand-400" />
                        Model Options &amp; Hyperparameters
                      </h3>

                      {/* Model Choice */}
                      <div class="space-y-1.5">
                        <span class="text-xs text-slate-300 font-medium block">Underlying Model Checkpoint:</span>
                        <div class="grid grid-cols-2 gap-2">
                          <For each={[
                            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'High QPS & Fast TTR' },
                            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Deep Reasoning & CoT' },
                            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Next-Gen Native Tools' },
                            { id: 'gemini-1.5-pro-tuned-v2', name: 'NovaSmart LoRA v2', tag: 'Fine-Tuned Domain Weights' }
                          ]}>
                            {(m) => (
                              <button
                                type="button"
                                onClick={() => setDraftConfig(prev => ({ ...prev, model: m.id }))}
                                class={`p-2.5 rounded-xl border text-left transition-all ${draftConfig().model === m.id ? 'bg-brand-500/10 border-brand-500 text-white ring-1 ring-brand-500' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'}`}
                              >
                                <span class="text-xs font-bold block">{m.name}</span>
                                <span class="text-[10px] text-slate-500 block mt-0.5">{m.tag}</span>
                              </button>
                            )}
                          </For>
                        </div>
                      </div>

                      {/* Temperature Slider */}
                      <div class="space-y-1.5 pt-2">
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-slate-300 font-medium">Temperature (Randomness vs Grounded Factuality)</span>
                          <span class="font-mono font-bold text-brand-400">{draftConfig().temperature}</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.05"
                          value={draftConfig().temperature || 0.2}
                          onInput={(e) => setDraftConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                          class="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>0.0 (Deterministic)</span>
                          <span>0.3 (Recommended)</span>
                          <span>1.0 (Creative / High Risk)</span>
                        </div>
                      </div>

                      {/* Top-P & Max Tokens */}
                      <div class="grid grid-cols-2 gap-4 pt-1">
                        <div class="space-y-1.5">
                          <div class="flex items-center justify-between text-xs">
                            <span class="text-slate-300 font-medium">Top-P Sampling</span>
                            <span class="font-mono font-bold text-slate-200">{draftConfig().topP}</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={draftConfig().topP || 0.8}
                            onInput={(e) => setDraftConfig(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                            class="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div class="space-y-1.5">
                          <div class="flex items-center justify-between text-xs">
                            <span class="text-slate-300 font-medium">Max Output Tokens</span>
                            <span class="font-mono font-bold text-slate-200">{draftConfig().maxOutputTokens}</span>
                          </div>
                          <input
                            type="range"
                            min="512"
                            max="8192"
                            step="512"
                            value={draftConfig().maxOutputTokens || 2048}
                            onInput={(e) => setDraftConfig(prev => ({ ...prev, maxOutputTokens: parseInt(e.target.value, 10) }))}
                            class="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Grounding Verification Mode */}
                      <div class="space-y-1.5 pt-2">
                        <span class="text-xs text-slate-300 font-medium block">Grounding Mode:</span>
                        <div class="grid grid-cols-3 gap-2">
                          <For each={['strict', 'balanced', 'permissive']}>
                            {(gm) => (
                              <button
                                type="button"
                                onClick={() => setDraftConfig(prev => ({ ...prev, groundingMode: gm }))}
                                class={`p-2 rounded-lg border text-center capitalize text-xs font-semibold transition-all ${draftConfig().groundingMode === gm ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                              >
                                {gm}
                              </button>
                            )}
                          </For>
                        </div>
                      </div>
                    </div>

                    {/* Section D: System Prompt Directives */}
                    <div class="glass-panel rounded-2xl p-5 space-y-3">
                      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                          <Code class="w-4 h-4 text-brand-400" />
                          System Prompt Instructions &amp; Persona
                        </h3>
                        <span class="text-[10px] font-mono text-slate-500">
                          {draftConfig().systemPrompt?.length || 0} characters
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={draftConfig().systemPrompt || ''}
                        onInput={(e) => setDraftConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                        class="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed"
                        placeholder="Enter system instructions..."
                      ></textarea>
                    </div>
                  </div>

                  {/* Right Column: Simulation & Deployment (5 cols) */}
                  <div class="lg:col-span-5 space-y-5">
                    <div class="glass-panel rounded-2xl p-5 border-brand-500/30 shadow-xl space-y-4">
                      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            <Sparkles class="w-4 h-4 text-brand-400" />
                            Interactive Refinement Simulator
                          </h3>
                          <p class="text-xs text-slate-400 mt-0.5">
                            Test the impact of your skill, rule, and model refinements before production release
                          </p>
                        </div>
                      </div>

                      {/* Evaluation Query Input */}
                      <div class="space-y-1.5">
                        <span class="text-xs text-slate-300 font-medium">Evaluation Prompt:</span>
                        <textarea
                          rows={3}
                          value={testPrompt()}
                          onInput={(e) => setTestPrompt(e.target.value)}
                          class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-sans"
                        ></textarea>
                      </div>

                      {/* Run Simulation Button */}
                      <button
                        type="button"
                        onClick={handleRunSimulation}
                        disabled={isSimulating()}
                        class="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
                      >
                        <Show
                          when={isSimulating()}
                          fallback={
                            <>
                              <Play class="w-4 h-4 fill-white" />
                              <span>Run Synthetic Benchmark &amp; Impact Analysis</span>
                            </>
                          }
                        >
                          <RefreshCw class="w-4 h-4 animate-spin" />
                          <span>Simulating Workload Impact...</span>
                        </Show>
                      </button>

                      {/* Simulation Comparison Results Card */}
                      <Show
                        when={simulationResult()}
                        fallback={
                          <div class="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
                            Click &ldquo;Run Synthetic Benchmark&rdquo; to test your adjusted skills, rules, and hyperparameters against real historical scenarios.
                          </div>
                        }
                      >
                        {(() => {
                          const res = simulationResult();
                          return (
                            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                              <div class="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                                <span>Projected Operational Impact</span>
                                <span class="text-[10px] text-emerald-400 font-mono">Based on tuned parameters</span>
                              </div>

                              {/* Hallucination */}
                              <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400 flex items-center gap-1.5">
                                  <AlertTriangle class="w-3.5 h-3.5 text-rose-400" /> Hallucination Rate:
                                </span>
                                <div class="flex items-center gap-2">
                                  <span class="font-mono text-slate-400 line-through">
                                    {res.before.hallucinationRate}%
                                  </span>
                                  <span class="font-mono font-bold text-emerald-400">
                                    {res.after.hallucinationRate}%
                                  </span>
                                  <span class="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                                    -{res.impact.halReduction}% Risk
                                  </span>
                                </div>
                              </div>

                              {/* Reprompt */}
                              <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400 flex items-center gap-1.5">
                                  <RefreshCw class="w-3.5 h-3.5 text-orange-400" /> Reprompt Loops:
                                </span>
                                <div class="flex items-center gap-2">
                                  <span class="font-mono text-slate-400 line-through">
                                    {res.before.repromptRate}%
                                  </span>
                                  <span class="font-mono font-bold text-emerald-400">
                                    {res.after.repromptRate}%
                                  </span>
                                  <span class="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                                    -{res.impact.repromptReduction}% Retries
                                  </span>
                                </div>
                              </div>

                              {/* Latency */}
                              <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400 flex items-center gap-1.5">
                                  <Clock class="w-3.5 h-3.5 text-sky-400" /> Time to Result:
                                </span>
                                <div class="flex items-center gap-2">
                                  <span class="font-mono text-slate-400 line-through">
                                    {res.before.latency}s
                                  </span>
                                  <span class="font-mono font-bold text-white">
                                    {res.after.latency}s
                                  </span>
                                  <span class="text-[10px] text-slate-400 font-mono">
                                    ({res.impact.latencyDelta >= 0 ? '+' : ''}{res.impact.latencyDelta}s)
                                  </span>
                                </div>
                              </div>

                              {/* Token Efficiency */}
                              <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400 flex items-center gap-1.5">
                                  <Coins class="w-3.5 h-3.5 text-amber-400" /> Tokens / Query:
                                </span>
                                <div class="flex items-center gap-2">
                                  <span class="font-mono text-slate-400 line-through">
                                    {res.before.tokenPerQuery}
                                  </span>
                                  <span class="font-mono font-bold text-slate-200">
                                    {res.after.tokenPerQuery}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </Show>

                      {/* Action Buttons: Deploy to Fleet & Reset */}
                      <div class="pt-2 border-t border-slate-800 space-y-2">
                        <button
                          type="button"
                          onClick={handleSaveAllRefinements}
                          class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <Save class="w-4 h-4" />
                          <span>Save &amp; Deploy Changes to Agent Fleet</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetToCurrent}
                          class="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
                        >
                          <RotateCcw class="w-3.5 h-3.5" />
                          <span>Reset Draft to Production State</span>
                        </button>
                      </div>
                    </div>

                    {/* Guidance Note */}
                    <div class="glass-panel rounded-2xl p-4 space-y-2 text-xs text-slate-400">
                      <div class="flex items-center gap-2 text-slate-300 font-semibold">
                        <Shield class="w-4 h-4 text-emerald-400" />
                        <span>Recommended Next Step</span>
                      </div>
                      <p class="leading-relaxed text-[11px]">
                        Enforcing all safety rules (e.g. <em>Wholesale Margin Floor</em> or <em>25% Discount Cap</em>) immediately protects your agent against critical hallucinated concessions and drops the fleet error rate into healthy thresholds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Match>

        {/* 4. SUB-TAB 2: ERROR & TOKEN TELEMETRY */}
        <Match when={subTab() === 'telemetry'}>
          {(() => {
            const ag = selectedAgent();
            if (!ag) return null;
            return (
              <div class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Metric 1: Tokens */}
                  <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                    <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span class="flex items-center gap-1.5 font-medium">
                        <Coins class="w-4 h-4 text-brand-400" /> Total Tokens
                      </span>
                      <span class="font-mono text-slate-300">{ag.totalRuns.toLocaleString()} runs</span>
                    </div>
                    <div class="text-2xl font-black font-mono text-white">
                      {(ag.tokens.total / 1000000).toFixed(2)}M
                    </div>

                    <div class="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden mt-3">
                      <div
                        class="bg-indigo-500 h-full"
                        style={{ width: `${(ag.tokens.input / ag.tokens.total) * 100}%` }}
                        title="Input Tokens"
                      ></div>
                      <div
                        class="bg-emerald-500 h-full"
                        style={{ width: `${(ag.tokens.output / ag.tokens.total) * 100}%` }}
                        title="Output Tokens"
                      ></div>
                      <div
                        class="bg-amber-500 h-full"
                        style={{ width: `${(ag.tokens.cached / ag.tokens.total) * 100}%` }}
                        title="Cached Tokens"
                      ></div>
                      <div
                        class="bg-pink-500 h-full"
                        style={{ width: `${(ag.tokens.reasoning / ag.tokens.total) * 100}%` }}
                        title="Reasoning Tokens"
                      ></div>
                    </div>

                    <div class="grid grid-cols-2 gap-1 mt-2.5 text-[10px] text-slate-400">
                      <span class="flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        In: {(ag.tokens.input / 1000000).toFixed(1)}M
                      </span>
                      <span class="flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Out: {(ag.tokens.output / 1000000).toFixed(1)}M
                      </span>
                      <span class="flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Cache: {(ag.tokens.cached / 1000000).toFixed(1)}M
                      </span>
                      <span class="flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                        CoT: {(ag.tokens.reasoning / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>

                  {/* Metric 2: Hallucination Rate */}
                  <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                    <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span class="flex items-center gap-1.5 font-medium">
                        <AlertTriangle class="w-4 h-4 text-rose-400" /> Hallucination Rate
                      </span>
                      <span class="font-mono text-rose-400">{ag.errors?.hallucinationCount} incidents</span>
                    </div>
                    <div class="text-2xl font-black font-mono text-rose-400">
                      {ag.errors?.hallucinationRate}%
                    </div>
                    <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                      <span>Grounding Score:</span>
                      <span class="font-mono text-slate-200 font-bold">
                        {((ag.errors?.groundingScore || 0) * 100).toFixed(0)} / 100
                      </span>
                    </div>
                  </div>

                  {/* Metric 3: Reprompt Rate */}
                  <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                    <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span class="flex items-center gap-1.5 font-medium">
                        <RefreshCw class="w-4 h-4 text-orange-400" /> Reprompt Rate
                      </span>
                      <span class="font-mono text-orange-400">{ag.errors?.repromptCount} loops</span>
                    </div>
                    <div class="text-2xl font-black font-mono text-orange-400">
                      {ag.errors?.repromptRate}%
                    </div>
                    <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                      <span>Avg Retries / Query:</span>
                      <span class="font-mono text-slate-200 font-bold">
                        {ag.errors?.avgRepromptsPerQuery}x
                      </span>
                    </div>
                  </div>

                  {/* Metric 4: TTR */}
                  <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                    <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span class="flex items-center gap-1.5 font-medium">
                        <Clock class="w-4 h-4 text-sky-400" /> Time to Result
                      </span>
                      <span class="font-mono text-emerald-400">SLA Tracked</span>
                    </div>
                    <div class="text-2xl font-black font-mono text-white">
                      {ag.avgLatency}s
                    </div>
                    <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                      <span>Inference / Tool Split:</span>
                      <span class="font-mono text-slate-200">
                        {(ag.avgLatency * 0.6).toFixed(1)}s / {(ag.avgLatency * 0.4).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deep Dive */}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div class="glass-panel rounded-2xl p-5">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                      <div>
                        <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                          <AlertTriangle class="w-4 h-4 text-rose-400" />
                          Hallucination Detections &amp; Grounding Drift
                        </h3>
                        <p class="text-xs text-slate-400 mt-0.5">
                          Claims intercepted by real-time grounding and fact verification
                        </p>
                      </div>
                      <span class="text-xs font-mono text-rose-400 font-semibold">
                        {ag.errors?.hallucinationExamples?.length || 0} Recent Logs
                      </span>
                    </div>

                    <div class="space-y-3">
                      <For each={ag.errors?.hallucinationExamples || []}>
                        {(item) => (
                          <div class="bg-slate-950/70 border border-rose-500/20 rounded-xl p-3.5 space-y-2 hover:border-rose-500/40 transition-colors">
                            <div class="flex items-center justify-between text-[11px]">
                              <span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                                Severity: {item.severity}
                              </span>
                              <span class="text-slate-500 font-mono">{item.detectedAt}</span>
                            </div>
                            <p class="text-xs text-slate-200 font-sans italic">
                              "{item.claim}"
                            </p>
                            <div class="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                              <span>Verifier Confidence Score:</span>
                              <span class="font-mono font-bold text-rose-300">{(item.confidence * 100).toFixed(0)}% confident hallucinated</span>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>

                  <div class="glass-panel rounded-2xl p-5">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                      <div>
                        <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                          <RefreshCw class="w-4 h-4 text-orange-400" />
                          Reprompting Drivers &amp; Error Taxonomy
                        </h3>
                        <p class="text-xs text-slate-400 mt-0.5">
                          Root causes forcing the runtime or user to reprompt and retry
                        </p>
                      </div>
                      <span class="text-xs font-mono text-orange-400 font-semibold">
                        {ag.errors?.repromptRate}% of queries
                      </span>
                    </div>

                    <div class="space-y-3">
                      <For each={ag.errors?.repromptReasons || []}>
                        {(item) => (
                          <div class="space-y-1">
                            <div class="flex items-center justify-between text-xs">
                              <span class="text-slate-300 font-medium">{item.reason}</span>
                              <div class="flex items-center gap-2">
                                <span class="font-mono text-slate-400">{item.count} events</span>
                                <span class="font-mono font-semibold text-orange-400">{item.percentage}%</span>
                              </div>
                            </div>
                            <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                class="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </div>

                <div class="pt-2">
                  <TokenWaterfallTrace />
                </div>
              </div>
            );
          })()}
        </Match>

        {/* 5. SUB-TAB 3: LIVE TRACES */}
        <Match when={subTab() === 'traces'}>
          {(() => {
            const ag = selectedAgent();
            if (!ag) return null;
            return (
              <div class="glass-panel rounded-2xl p-5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
                  <div>
                    <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <Clock class="w-4 h-4 text-brand-400" />
                      Live Execution Traces &amp; Audit Trail for {ag.name}
                    </h3>
                    <p class="text-xs text-slate-400 mt-0.5">
                      Query executions, tool invocations, and reprompting diagnostics
                    </p>
                  </div>

                  <div class="flex items-center gap-2">
                    <div class="relative">
                      <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Filter queries..."
                        value={searchQuery()}
                        onInput={(e) => setSearchQuery(e.target.value)}
                        class="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th class="pb-2.5 font-semibold">Trace ID</th>
                        <th class="pb-2.5 font-semibold">Timestamp</th>
                        <th class="pb-2.5 font-semibold">User Prompt / Query</th>
                        <th class="pb-2.5 font-semibold">TTR Latency</th>
                        <th class="pb-2.5 font-semibold">Tokens</th>
                        <th class="pb-2.5 font-semibold">Reprompts</th>
                        <th class="pb-2.5 font-semibold">Grounding</th>
                        <th class="pb-2.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-850">
                      <For each={agentTraces().filter(t => !searchQuery() || t.prompt.toLowerCase().includes(searchQuery().toLowerCase()) || t.id.includes(searchQuery()))}>
                        {(trace) => (
                          <tr class="hover:bg-slate-900/60 transition-colors">
                            <td class="py-2.5 font-mono text-brand-400 font-semibold">{trace.id}</td>
                            <td class="py-2.5 text-slate-400">{trace.timestamp}</td>
                            <td class="py-2.5 text-slate-200 max-w-xs truncate" title={trace.prompt}>
                              {trace.prompt}
                            </td>
                            <td class="py-2.5 font-mono text-slate-200">{trace.latency}s</td>
                            <td class="py-2.5 font-mono text-slate-400">
                              {trace.tokens.total} <span class="text-[10px] text-slate-500">(In:{trace.tokens.input} Out:{trace.tokens.output})</span>
                            </td>
                            <td class="py-2.5 font-mono">
                              <Show
                                when={trace.reprompts > 0}
                                fallback={<span class="text-slate-500">0</span>}
                              >
                                <span class="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-semibold">
                                  {trace.reprompts} retries
                                </span>
                              </Show>
                            </td>
                            <td class="py-2.5 font-mono text-slate-300">
                              {(trace.groundingConfidence * 100).toFixed(0)}%
                            </td>
                            <td class="py-2.5">
                              <Show
                                when={trace.status === 'success'}
                                fallback={
                                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                    Reprompt Loop
                                  </span>
                                }
                              >
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Success
                                </span>
                              </Show>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>

                {/* Cloud Logs */}
                <Show when={cloudLogs() && cloudLogs().length > 0}>
                  <div class="mt-6 pt-5 border-t border-slate-800">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <Server class="w-4 h-4 text-emerald-400" />
                        <h4 class="text-xs font-bold text-white uppercase tracking-wider">
                          Live Google Cloud Logging (Cloud Run Services: promo-agent-shadow / novasmart-mcp)
                        </h4>
                      </div>
                      <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {cloudLogs().length} live entries fetched via ADC
                      </span>
                    </div>

                    <div class="bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5">
                      <For each={cloudLogs()}>
                        {(log) => (
                          <div class="flex items-start gap-2 text-slate-300">
                            <span class={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${log.severity === 'WARNING' || log.severity === 'ERROR' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'}`}>
                              {log.severity || 'INFO'}
                            </span>
                            <span class="text-indigo-400 shrink-0">[{log.service}]</span>
                            <span class="text-slate-200 truncate flex-1" title={log.payload}>{log.payload}</span>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>
              </div>
            );
          })()}
        </Match>

        {/* 6. SUB-TAB 4: WORKFORCE REVIEW */}
        <Match when={subTab() === 'workforce'}>
          {(() => {
            const ag = selectedAgent();
            if (!ag) return null;
            return (
              <div class="space-y-6">
                <div class="glass-panel rounded-2xl p-6 border-emerald-500/30 relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-lg"
                        style={{
                          "background-color": `${ag.color}20`,
                          border: `1px solid ${ag.color}40`,
                          color: ag.color
                        }}
                      >
                        <Briefcase class="w-6 h-6" />
                      </div>
                      <div>
                        <div class="flex items-center gap-2 flex-wrap">
                          <h3 class="text-base font-bold text-white tracking-tight">
                            {ag.workforce?.employeeTitle || ag.role}
                          </h3>
                          <span
                            class={`px-2 py-0.5 rounded text-[11px] font-black font-mono ${
                              ag.workforce?.performanceGrade === 'A+' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                              ag.workforce?.performanceGrade === 'C-' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' :
                              'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            }`}
                          >
                            Grade {ag.workforce?.performanceGrade || 'A'}
                          </span>
                        </div>
                        <p class="text-xs text-slate-400 mt-0.5">
                          Autonomous Employee Benchmark: Unit cost, First-time-right, and speedup multipliers
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-3">
                      <button
                        onClick={() => { setSubTab('refine'); dashboardState.setAgentActiveSubTab('refine'); }}
                        class="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
                      >
                        <span>Apply Coaching &amp; Refine</span>
                        <ChevronRight class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 4-Card Strip */}
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                    <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                      <span class="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                        <DollarSign class="w-3.5 h-3.5 text-emerald-400" /> Economic Value Created
                      </span>
                      <span class="text-2xl font-black font-mono text-emerald-400">
                        ${((ag.workforce?.totalEconomicValue || 0) / 1000).toFixed(0)}k
                      </span>
                      <span class="text-[10px] text-slate-500 block mt-1">
                        vs ${ag.costEstimate} compute spend ({Math.round(ag.workforce?.netROI || 0).toLocaleString()}x ROI)
                      </span>
                    </div>

                    <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                      <span class="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                        <Clock class="w-3.5 h-3.5 text-sky-400" /> Operational Hours Delivered
                      </span>
                      <span class="text-2xl font-black font-mono text-sky-300">
                        {ag.workforce?.humanLaborHoursSaved?.toLocaleString() || 0}
                      </span>
                      <span class="text-[10px] text-slate-500 block mt-1">
                        hours automated across {ag.totalRuns.toLocaleString()} runs
                      </span>
                    </div>

                    <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                      <span class="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                        <Zap class="w-3.5 h-3.5 text-amber-400" /> Unit Cost (CPWU)
                      </span>
                      <span class="text-2xl font-black font-mono text-amber-400">
                        ${ag.workforce?.costPerWorkUnit}
                      </span>
                      <span class="text-[10px] text-slate-500 block mt-1">
                        per autonomous task
                      </span>
                    </div>

                    <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                      <span class="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                        <CheckCircle2 class="w-3.5 h-3.5 text-indigo-400" /> First-Time Right Rate
                      </span>
                      <span class="text-2xl font-black font-mono text-indigo-300">
                        {ag.workforce?.firstTimeRightRate}%
                      </span>
                      <span class="text-[10px] text-slate-500 block mt-1">
                        {ag.workforce?.escalationRate}% escalation rate
                      </span>
                    </div>
                  </div>
                </div>

                {/* Competencies */}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div class="glass-panel rounded-2xl p-5 space-y-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                      <Percent class="w-4 h-4 text-emerald-400" />
                      Core Competencies &amp; Skill Mastery
                    </h4>
                    <div class="space-y-3">
                      <For each={ag.workforce?.competencies || []}>
                        {(comp) => (
                          <div class="space-y-1">
                            <div class="flex items-center justify-between text-xs">
                              <span class="text-slate-300">{comp.name}</span>
                              <span class="font-mono font-bold text-slate-200">{comp.score}/100</span>
                            </div>
                            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                class={`h-full rounded-full ${comp.score > 90 ? 'bg-emerald-400' : comp.score > 75 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                style={{ width: `${comp.score}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>

                  <div class="glass-panel rounded-2xl p-5 space-y-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                      <Users class="w-4 h-4 text-amber-400" />
                      Supervisor Escalation Triggers
                    </h4>
                    <div class="space-y-2.5">
                      <For each={ag.workforce?.escalationReasons || []}>
                        {(esc) => (
                          <div class="bg-slate-950/60 border border-slate-850 rounded-xl p-3 text-xs flex items-center justify-between">
                            <div>
                              <span class="text-slate-200 font-medium block">{esc.reason}</span>
                              <span class="text-[10px] text-slate-500 font-mono">{esc.count} incidents logged</span>
                            </div>
                            <span class="font-mono text-amber-400 font-bold text-sm">{esc.pct}%</span>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>

                  <div class="glass-panel rounded-2xl p-5 space-y-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                      <Award class="w-4 h-4 text-brand-400" />
                      Supervisor Performance Coaching
                    </h4>
                    <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-3">
                      <p class="italic leading-relaxed">
                        "{ag.workforce?.coachingNotes}"
                      </p>
                      <div class="pt-3 border-t border-slate-800 text-[11px] space-y-1.5">
                        <div class="flex items-center justify-between">
                          <span class="text-slate-400">Autonomous Reliability:</span>
                          <span class="font-mono text-emerald-400 font-bold">{ag.workforce?.autonomousResolutionRate}%</span>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-slate-400">Execution Velocity:</span>
                          <span class="font-mono text-sky-400 font-bold">{ag.workforce?.speedupMultiplier}x speedup</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => { setSubTab('refine'); dashboardState.setAgentActiveSubTab('refine'); }}
                      class="w-full py-2 px-3 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/40 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <span>Edit Skills &amp; Rules to Address Notes</span>
                      <ChevronRight class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </Match>

        {/* 7. SUB-TAB 5: IAM & FINOPS GOVERNANCE CONTROLS */}
        <Match when={subTab() === 'iam'}>
          <Show when={selectedAgent()}>
            <AgentIAMControls agent={selectedAgent()} />
          </Show>
        </Match>
      </Switch>
    </div>
  );
}
