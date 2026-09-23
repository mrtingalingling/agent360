import { component$, useSignal, useContext, $ } from '@builder.io/qwik';
import { DashboardContext } from '../../state/dashboardState';
import { TokenWaterfallTrace } from '../telemetry/TokenWaterfallTrace';
import { AgentIAMControls } from '../iam/AgentIAMControls';
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
} from '../common/Icons';

export const AgentDetailView = component$(() => {
  const state = useContext(DashboardContext);
  const agents = state.agents;
  const selectedAgent = state.selectedAgent;
  const recentTraces = state.recentTraces;
  const cloudLogs = state.cloudLogs;

  const subTab = useSignal(state.agentActiveSubTab || 'refine');
  const draftSkills = useSignal<any[]>(JSON.parse(JSON.stringify(selectedAgent?.skills || [])));
  const draftRules = useSignal<any[]>(JSON.parse(JSON.stringify(selectedAgent?.rules || [])));
  const draftConfig = useSignal<any>(JSON.parse(JSON.stringify(selectedAgent?.fineTuneConfig || {})));
  const simulationResult = useSignal<any>(null);
  const isSimulating = useSignal(false);
  const testPrompt = useSignal(
    'Calculate promotional bundle for SKU-9014 with 20% loyalty markdown and verify inventory in regional warehouse'
  );

  const showAddSkillModal = useSignal(false);
  const newSkillName = useSignal('');
  const newSkillDesc = useSignal('');
  const newSkillRisk = useSignal('low');

  const showAddRuleModal = useSignal(false);
  const newRuleName = useSignal('');
  const newRuleDesc = useSignal('');
  const newRuleCat = useSignal('safety');

  const searchQuery = useSignal('');
  const directiveApplied = useSignal(false);

  const handleToggleSkill = $((skillId: string) => {
    draftSkills.value = draftSkills.value.map((s) =>
      s.id === skillId ? { ...s, enabled: !s.enabled } : s
    );
  });

  const handleToggleRule = $((ruleId: string) => {
    draftRules.value = draftRules.value.map((r) =>
      r.id === ruleId ? { ...r, enforced: !r.enforced } : r
    );
  });

  const handleCreateSkill = $(() => {
    if (!newSkillName.value) return;
    const newSkill = {
      id: `sk-custom-${Date.now().toString().slice(-4)}`,
      name: newSkillName.value.toLowerCase().replace(/\s+/g, '_'),
      description: newSkillDesc.value || 'Custom user-defined skill',
      enabled: true,
      riskLevel: newSkillRisk.value,
      runs: 0
    };
    draftSkills.value = [...draftSkills.value, newSkill];
    if (state.selectedAgent) {
      state.addAgentSkill(state.selectedAgent.id, newSkill);
    }
    newSkillName.value = '';
    newSkillDesc.value = '';
    newSkillRisk.value = 'low';
    showAddSkillModal.value = false;
  });

  const handleCreateRule = $(() => {
    if (!newRuleName.value) return;
    const newRule = {
      id: `rl-custom-${Date.now().toString().slice(-4)}`,
      name: newRuleName.value,
      description: newRuleDesc.value || 'Custom governance constraint',
      enforced: true,
      category: newRuleCat.value
    };
    draftRules.value = [...draftRules.value, newRule];
    if (state.selectedAgent) {
      state.addAgentRule(state.selectedAgent.id, newRule);
    }
    newRuleName.value = '';
    newRuleDesc.value = '';
    newRuleCat.value = 'safety';
    showAddRuleModal.value = false;
  });

  const handleRunSimulation = $(() => {
    isSimulating.value = true;
    setTimeout(() => {
      const ag = state.selectedAgent;
      if (ag) {
        const result = state.runBenchmarkSimulation(ag.id, draftConfig.value, draftRules.value);
        simulationResult.value = result;
      }
      isSimulating.value = false;
    }, 600);
  });

  const handleApplyCoachingDirective = $(() => {
    const ag = state.selectedAgent;
    if (!ag?.coachingDirective?.presetPatch) return;
    const patch = ag.coachingDirective.presetPatch;

    draftRules.value = draftRules.value.map((r) =>
      patch.ruleIdsToEnforce?.includes(r.id) ? { ...r, enforced: true } : r
    );

    draftConfig.value = {
      ...draftConfig.value,
      temperature: patch.temperature ?? draftConfig.value.temperature,
      groundingMode: patch.groundingMode ?? draftConfig.value.groundingMode,
      confidenceThreshold: patch.confidenceThreshold ?? draftConfig.value.confidenceThreshold
    };
    directiveApplied.value = true;

    isSimulating.value = true;
    setTimeout(() => {
      const result = state.runBenchmarkSimulation(ag.id, draftConfig.value, draftRules.value);
      simulationResult.value = result;
      isSimulating.value = false;
    }, 400);
  });

  const handleSaveAllRefinements = $(() => {
    const ag = state.selectedAgent;
    if (ag) {
      state.refineAgent(ag.id, {
        skills: draftSkills.value,
        rules: draftRules.value,
        fineTuneConfig: draftConfig.value
      });
      const result = state.runBenchmarkSimulation(ag.id, draftConfig.value, draftRules.value);
      simulationResult.value = result;
    }
  });

  const handleResetToCurrent = $(() => {
    const ag = state.selectedAgent;
    if (ag) {
      draftSkills.value = JSON.parse(JSON.stringify(ag.skills || []));
      draftRules.value = JSON.parse(JSON.stringify(ag.rules || []));
      draftConfig.value = JSON.parse(JSON.stringify(ag.fineTuneConfig || {}));
      simulationResult.value = null;
      directiveApplied.value = false;
    }
  });

  const agentTraces = selectedAgent
    ? recentTraces.filter((t: any) => t.agentId === selectedAgent.id)
    : [];

  return (
    <div class="space-y-6">
      {/* 1. Agent Selector Header Strip */}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {agents.map((agent: any) => {
          const isSelected = agent.id === state.selectedAgentId;
          return (
            <button
              key={agent.id}
              onClick$={$(() => {
                state.setSelectedAgentId(agent.id);
                const ag = state.agents.find((a: any) => a.id === agent.id);
                if (ag) {
                  draftSkills.value = JSON.parse(JSON.stringify(ag.skills || []));
                  draftRules.value = JSON.parse(JSON.stringify(ag.rules || []));
                  draftConfig.value = JSON.parse(JSON.stringify(ag.fineTuneConfig || {}));
                  simulationResult.value = null;
                  directiveApplied.value = false;
                }
              })}
              class={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/15 ring-1 ring-sky-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div class="flex items-center justify-between mb-2">
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: agent.color }}
                ></span>
                <span class="text-[10px] font-mono text-slate-500 truncate">
                  {agent.model.replace('gemini-', '')}
                </span>
              </div>
              <h4 class="text-xs font-bold text-slate-200 truncate">{agent.name}</h4>
              <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px]">
                <span class="text-slate-400 font-mono">{agent.avgLatency}s TTR</span>
                <span
                  class={`font-semibold ${
                    agent.errors?.hallucinationRate > 5.0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {agent.errors?.hallucinationRate}% Hal
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Selected Agent Header & Sub-Tabs Navigation */}
      {selectedAgent && (
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shrink-0"
                style={{
                  backgroundColor: `${selectedAgent.color}20`,
                  border: `1px solid ${selectedAgent.color}40`,
                  color: selectedAgent.color
                }}
              >
                {selectedAgent.name.charAt(0)}
              </div>
              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h2 class="text-lg font-bold text-white tracking-tight">{selectedAgent.name}</h2>
                  {selectedAgent.status === 'active' ? (
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                      <CheckCircle2 class="w-3.5 h-3.5" /> Healthy &amp; Active
                    </span>
                  ) : selectedAgent.status === 'warning' ? (
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                      <AlertCircle class="w-3.5 h-3.5" /> Warning &bull; Elevated Reprompts
                    </span>
                  ) : (
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle class="w-3.5 h-3.5" /> Degraded &bull; Refinement Required
                    </span>
                  )}
                  <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                    Model: {selectedAgent.model}
                  </span>
                  {selectedAgent.cloudService && (
                    <a
                      href={selectedAgent.cloudService.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                      title={`Live Cloud Run Endpoint: ${selectedAgent.cloudService.url}`}
                    >
                      <Server class="w-3 h-3 text-emerald-400" />
                      <span>
                        Cloud Run: {selectedAgent.cloudService.name} ({selectedAgent.cloudService.region})
                      </span>
                      <ExternalLink class="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}
                </div>
                <p class="text-xs text-slate-400 mt-1">{selectedAgent.role}</p>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div class="flex items-center gap-4 text-xs flex-wrap">
              {selectedAgent.workforce && (
                <div class="text-right border-r border-slate-800 pr-4">
                  <span class="text-emerald-400 text-[10px] block font-semibold">Employee Grade</span>
                  <span class="font-mono text-emerald-300 font-bold">
                    Grade {selectedAgent.workforce.performanceGrade} (
                    {Math.round(selectedAgent.workforce.netROI).toLocaleString()}x ROI)
                  </span>
                </div>
              )}
              <div class="text-right">
                <span class="text-slate-500 text-[10px] block">Runs &amp; Cost</span>
                <span class="font-mono text-slate-200 font-bold">
                  {selectedAgent.totalRuns.toLocaleString()} runs (${selectedAgent.costEstimate})
                </span>
              </div>
              <div class="text-right border-l border-slate-800 pl-4">
                <span class="text-slate-500 text-[10px] block">Latency (TTR)</span>
                <span class="font-mono text-sky-400 font-bold">{selectedAgent.avgLatency}s</span>
              </div>
              <div class="text-right border-l border-slate-800 pl-4">
                <span class="text-slate-500 text-[10px] block">Hallucination</span>
                <span
                  class={`font-mono font-bold ${
                    selectedAgent.errors?.hallucinationRate > 5 ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {selectedAgent.errors?.hallucinationRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Studio Sub-Navigation Bar */}
          <div class="flex items-center justify-between gap-4 pt-4 flex-wrap">
            <div class="flex items-center gap-2 flex-wrap">
              <button
                onClick$={$(() => {
                  subTab.value = 'refine';
                  state.setAgentActiveSubTab('refine');
                })}
                class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  subTab.value === 'refine'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Sliders class="w-3.5 h-3.5" />
                <span>Refine Agent (Skills, Rules, Model &amp; Prompts)</span>
              </button>

              <button
                onClick$={$(() => {
                  subTab.value = 'workforce';
                  state.setAgentActiveSubTab('workforce');
                })}
                class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  subTab.value === 'workforce'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Briefcase class="w-3.5 h-3.5" />
                <span>Employee Performance &amp; ROI</span>
                {selectedAgent.workforce && (
                  <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {selectedAgent.workforce.performanceGrade}
                  </span>
                )}
              </button>

              <button
                onClick$={$(() => {
                  subTab.value = 'telemetry';
                  state.setAgentActiveSubTab('telemetry');
                })}
                class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  subTab.value === 'telemetry'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Activity class="w-3.5 h-3.5" />
                <span>Error &amp; Token Telemetry</span>
              </button>

              <button
                onClick$={$(() => {
                  subTab.value = 'traces';
                  state.setAgentActiveSubTab('traces');
                })}
                class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  subTab.value === 'traces'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Clock class="w-3.5 h-3.5" />
                <span>Live Execution Traces</span>
              </button>

              <button
                onClick$={$(() => {
                  subTab.value = 'iam';
                  state.setAgentActiveSubTab('iam');
                })}
                class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  subTab.value === 'iam'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Shield class="w-3.5 h-3.5 text-indigo-400" />
                <span>Agent IAM &amp; Cost Controls</span>
                <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                  GCP IAM
                </span>
              </button>
            </div>

            <div class="text-[11px] text-slate-400 hidden sm:block">
              Targeting <span class="text-sky-400 font-semibold">{selectedAgent.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: REFINE */}
      {subTab.value === 'refine' && selectedAgent && (
        <div class="space-y-6">
          {/* Coaching Directive Anomaly Banner */}
          {selectedAgent.coachingDirective && (
            <div class="bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-xl backdrop-blur-md">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle class="w-3 h-3 text-rose-400" />
                      Active Coaching Alert
                    </span>
                    <span class="text-xs text-slate-400 font-mono">
                      Issued by:{' '}
                      <span class="text-slate-200 font-semibold">
                        {selectedAgent.coachingDirective.supervisor}
                      </span>
                    </span>
                  </div>
                  <h3 class="text-sm font-bold text-white">
                    {selectedAgent.coachingDirective.detectedAnomaly}
                  </h3>
                  <p class="text-xs text-slate-300">{selectedAgent.coachingDirective.instruction}</p>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick$={handleApplyCoachingDirective}
                    class="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
                  >
                    <Sliders class="w-4 h-4" />
                    <span>
                      {directiveApplied.value
                        ? '✓ Coaching Recommendations Applied & Simulated'
                        : 'Apply Coaching Recommendations (1-Click)'}
                    </span>
                  </button>
                </div>
              </div>

              {directiveApplied.value && (
                <div class="mt-3 pt-3 border-t border-rose-500/20 flex items-center justify-between text-xs text-emerald-300">
                  <span class="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 class="w-4 h-4 text-emerald-400" />
                    Enforced wholesale margin floor &amp; discount rules, lowered temperature to 0.20, and engaged strict grounding. Simulation run below.
                  </span>
                  <span class="font-mono text-[11px] text-slate-400">
                    Click &quot;Save &amp; Deploy Changes&quot; to push live
                  </span>
                </div>
              )}
            </div>
          )}

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Refinement Controls (7 cols) */}
            <div class="lg:col-span-7 space-y-6">
              {/* Section A: Skills */}
              <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <Wrench class="w-4 h-4 text-sky-400" />
                      Agent Skills &amp; Tool Capabilities (
                      {draftSkills.value.filter((s) => s.enabled).length}/{draftSkills.value.length} Active)
                    </h3>
                    <p class="text-[11px] text-slate-400 mt-0.5">
                      Toggle or assign executable tool definitions and MCP actions to this agent.
                    </p>
                  </div>
                  <button
                    onClick$={$(() => {
                      showAddSkillModal.value = true;
                    })}
                    class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus class="w-3.5 h-3.5 text-sky-400" /> Add Skill
                  </button>
                </div>

                {/* Skills List */}
                <div class="space-y-2.5">
                  {draftSkills.value.map((skill: any) => (
                    <div
                      key={skill.id}
                      class={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        skill.enabled
                          ? 'bg-slate-900/70 border-slate-800'
                          : 'bg-slate-950/40 border-slate-850 opacity-60'
                      }`}
                    >
                      <div class="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={skill.enabled}
                          onChange$={$(() => {
                            handleToggleSkill(skill.id);
                          })}
                          class="mt-1 w-4 h-4 accent-sky-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
                        />
                        <div>
                          <div class="flex items-center gap-2">
                            <code class="text-xs font-mono font-bold text-sky-300">{skill.name}</code>
                            <span
                              class={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
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
                              <span class="text-[10px] text-slate-500 font-mono">
                                ({skill.runs.toLocaleString()} runs)
                              </span>
                            )}
                          </div>
                          <p class="text-[11px] text-slate-400 mt-1 leading-snug">{skill.description}</p>
                        </div>
                      </div>

                      <button
                        onClick$={$(() => {
                          handleToggleSkill(skill.id);
                        })}
                        class={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          skill.enabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'
                        }`}
                      >
                        {skill.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Skill Modal/Form */}
                {showAddSkillModal.value && (
                  <form
                    onSubmit$={handleCreateSkill}
                    preventdefault:submit
                    class="bg-slate-950 border border-sky-500/40 rounded-xl p-3.5 space-y-3"
                  >
                    <div class="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                      <span>Register New Agent Skill</span>
                      <button
                        type="button"
                        onClick$={$(() => {
                          showAddSkillModal.value = false;
                        })}
                        class="text-slate-400 hover:text-white"
                      >
                        <X class="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label class="text-slate-400 text-[10px] block mb-1">
                          Skill Identifier (snake_case):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. verify_inventory_threshold"
                          value={newSkillName.value}
                          onInput$={$((e: Event) => {
                            newSkillName.value = (e.target as HTMLInputElement).value;
                          })}
                          class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label class="text-slate-400 text-[10px] block mb-1">Risk Profile:</label>
                        <select
                          value={newSkillRisk.value}
                          onChange$={$((e: Event) => {
                            newSkillRisk.value = (e.target as HTMLSelectElement).value;
                          })}
                          class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        >
                          <option value="low">Low (Read Only)</option>
                          <option value="medium">Medium (DB Write)</option>
                          <option value="high">High (Financial / Coupons)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label class="text-slate-400 text-[10px] block mb-1">
                        Description &amp; Parameter Contract:
                      </label>
                      <input
                        type="text"
                        placeholder="Validates product stock and returns warehouse availability map"
                        value={newSkillDesc.value}
                        onInput$={$((e: Event) => {
                          newSkillDesc.value = (e.target as HTMLInputElement).value;
                        })}
                        class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div class="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick$={$(() => {
                          showAddSkillModal.value = false;
                        })}
                        class="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        class="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Save Skill
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Section B: Rules */}
              <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <Shield class="w-4 h-4 text-emerald-400" />
                      Behavioral Guardrail Rules (
                      {draftRules.value.filter((r) => r.enforced).length}/{draftRules.value.length} Active)
                    </h3>
                    <p class="text-[11px] text-slate-400 mt-0.5">
                      Safety policies, boundary constraints, and compliance checks enforced during reasoning.
                    </p>
                  </div>
                  <button
                    onClick$={$(() => {
                      showAddRuleModal.value = true;
                    })}
                    class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus class="w-3.5 h-3.5 text-emerald-400" /> Add Rule
                  </button>
                </div>

                {/* Rules List */}
                <div class="space-y-2.5">
                  {draftRules.value.map((rule: any) => (
                    <div
                      key={rule.id}
                      class={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        rule.enforced
                          ? 'bg-slate-900/70 border-slate-800'
                          : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div class="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={rule.enforced}
                          onChange$={$(() => {
                            handleToggleRule(rule.id);
                          })}
                          class="mt-1 w-4 h-4 accent-emerald-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
                        />
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-slate-200">{rule.name}</span>
                            <span
                              class={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
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
                          <p class="text-[11px] text-slate-400 mt-1 leading-snug">{rule.description}</p>
                        </div>
                      </div>

                      <button
                        onClick$={$(() => {
                          handleToggleRule(rule.id);
                        })}
                        class={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors cursor-pointer ${
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

                {/* Add Rule Modal */}
                {showAddRuleModal.value && (
                  <form
                    onSubmit$={handleCreateRule}
                    preventdefault:submit
                    class="bg-slate-950 border border-emerald-500/40 rounded-xl p-3.5 space-y-3"
                  >
                    <div class="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                      <span>Create Governance Rule</span>
                      <button
                        type="button"
                        onClick$={$(() => {
                          showAddRuleModal.value = false;
                        })}
                        class="text-slate-400 hover:text-white"
                      >
                        <X class="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label class="text-slate-400 text-[10px] block mb-1">Rule Name:</label>
                        <input
                          type="text"
                          placeholder="e.g. Margin Threshold Guarantee"
                          value={newRuleName.value}
                          onInput$={$((e: Event) => {
                            newRuleName.value = (e.target as HTMLInputElement).value;
                          })}
                          class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                          required
                        />
                      </div>
                      <div>
                        <label class="text-slate-400 text-[10px] block mb-1">Policy Category:</label>
                        <select
                          value={newRuleCat.value}
                          onChange$={$((e: Event) => {
                            newRuleCat.value = (e.target as HTMLSelectElement).value;
                          })}
                          class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        >
                          <option value="safety">Safety (Hard Intercept)</option>
                          <option value="financial">Financial (Discount/Margin)</option>
                          <option value="privacy">Privacy &amp; DLP</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label class="text-slate-400 text-[10px] block mb-1">Constraint Logic:</label>
                      <input
                        type="text"
                        placeholder="e.g. Forbid any discount that yields product gross margin below 15%"
                        value={newRuleDesc.value}
                        onInput$={$((e: Event) => {
                          newRuleDesc.value = (e.target as HTMLInputElement).value;
                        })}
                        class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        required
                      />
                    </div>
                    <div class="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick$={$(() => {
                          showAddRuleModal.value = false;
                        })}
                        class="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Save Rule
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Section C: Model & Hyperparameters */}
              <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Cpu class="w-4 h-4 text-sky-400" />
                  Model Checkpoint &amp; Hyperparameter Overrides
                </h3>

                <div class="space-y-3">
                  <label class="text-xs text-slate-300 font-medium block">Active LLM Checkpoint:</label>
                  <div class="grid grid-cols-2 gap-2">
                    {[
                      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'Fast / Cost-Optimized' },
                      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Deep Reasoning & CoT' },
                      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Next-Gen Native Tools' },
                      { id: 'gemini-1.5-pro-tuned-v2', name: 'NovaSmart LoRA v2', tag: 'Fine-Tuned Domain Weights' }
                    ].map((m: any) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick$={$(() => {
                          draftConfig.value = { ...draftConfig.value, model: m.id };
                        })}
                        class={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          draftConfig.value.model === m.id
                            ? 'bg-sky-500/10 border-sky-500 text-white ring-1 ring-sky-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <span class="text-xs font-bold block">{m.name}</span>
                        <span class="text-[10px] text-slate-500 block mt-0.5">{m.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Temperature Slider */}
                <div class="space-y-1.5 pt-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-300 font-medium">Temperature (Randomness vs Grounded Factuality)</span>
                    <span class="font-mono font-bold text-sky-400">{draftConfig.value.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={draftConfig.value.temperature ?? 0.2}
                    onInput$={$((e: Event) => {
                      draftConfig.value = {
                        ...draftConfig.value,
                        temperature: parseFloat((e.target as HTMLInputElement).value)
                      };
                    })}
                    class="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
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
                      <span class="font-mono font-bold text-slate-200">{draftConfig.value.topP}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={draftConfig.value.topP ?? 0.8}
                      onInput$={$((e: Event) => {
                        draftConfig.value = {
                          ...draftConfig.value,
                          topP: parseFloat((e.target as HTMLInputElement).value)
                        };
                      })}
                      class="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-300 font-medium">Max Output Tokens</span>
                      <span class="font-mono font-bold text-slate-200">{draftConfig.value.maxOutputTokens}</span>
                    </div>
                    <input
                      type="range"
                      min="512"
                      max="8192"
                      step="512"
                      value={draftConfig.value.maxOutputTokens ?? 2048}
                      onInput$={$((e: Event) => {
                        draftConfig.value = {
                          ...draftConfig.value,
                          maxOutputTokens: parseInt((e.target as HTMLInputElement).value, 10)
                        };
                      })}
                      class="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Grounding Verification Mode */}
                <div class="space-y-1.5 pt-2">
                  <span class="text-xs text-slate-300 font-medium block">Grounding Mode:</span>
                  <div class="grid grid-cols-3 gap-2">
                    {['strict', 'balanced', 'permissive'].map((gm) => (
                      <button
                        key={gm}
                        type="button"
                        onClick$={$(() => {
                          draftConfig.value = { ...draftConfig.value, groundingMode: gm };
                        })}
                        class={`p-2 rounded-lg border text-center capitalize text-xs font-semibold transition-all cursor-pointer ${
                          draftConfig.value.groundingMode === gm
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
              <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl backdrop-blur-md">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <Code class="w-4 h-4 text-sky-400" />
                    System Prompt Instructions &amp; Persona
                  </h3>
                  <span class="text-[10px] font-mono text-slate-500">
                    {draftConfig.value.systemPrompt?.length || 0} characters
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={draftConfig.value.systemPrompt || ''}
                  onInput$={$((e: Event) => {
                    draftConfig.value = {
                      ...draftConfig.value,
                      systemPrompt: (e.target as HTMLTextAreaElement).value
                    };
                  })}
                  class="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-sky-500 leading-relaxed"
                  placeholder="Enter system instructions..."
                ></textarea>
              </div>
            </div>

            {/* Right Column: Simulation & Deployment (5 cols) */}
            <div class="lg:col-span-5 space-y-5">
              <div class="bg-slate-900/60 border border-sky-500/30 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <Sparkles class="w-4 h-4 text-sky-400" />
                      Interactive Refinement Simulator
                    </h3>
                    <p class="text-xs text-slate-400 mt-0.5">
                      Test the impact of your skill, rule, and model refinements before production release
                    </p>
                  </div>
                </div>

                {/* Evaluation Query Input */}
                <div class="space-y-1.5">
                  <label class="text-xs text-slate-300 font-medium">Synthetic Test Prompt:</label>
                  <textarea
                    rows={3}
                    value={testPrompt.value}
                    onInput$={$((e: Event) => {
                      testPrompt.value = (e.target as HTMLTextAreaElement).value;
                    })}
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500 font-sans"
                  ></textarea>
                </div>

                <button
                  type="button"
                  onClick$={handleRunSimulation}
                  disabled={isSimulating.value}
                  class="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSimulating.value ? (
                    <>
                      <RefreshCw class="w-4 h-4 animate-spin" />
                      <span>Running Simulation (n=1000)...</span>
                    </>
                  ) : (
                    <>
                      <Play class="w-4 h-4 fill-white" />
                      <span>Run Verification Benchmark</span>
                    </>
                  )}
                </button>

                {/* Simulation Result */}
                {simulationResult.value && (
                  <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div class="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                      <span>Simulated Performance Impact</span>
                      <span class="text-[10px] text-emerald-400 font-mono">1000 sample runs</span>
                    </div>

                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 flex items-center gap-1.5">
                        <AlertTriangle class="w-3.5 h-3.5 text-rose-400" /> Hallucination Rate:
                      </span>
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-slate-400 line-through">
                          {simulationResult.value.before.hallucinationRate}%
                        </span>
                        <span class="font-mono font-bold text-emerald-400">
                          {simulationResult.value.after.hallucinationRate}%
                        </span>
                        <span class="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                          -{simulationResult.value.impact.halReduction}% Risk
                        </span>
                      </div>
                    </div>

                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 flex items-center gap-1.5">
                        <RefreshCw class="w-3.5 h-3.5 text-orange-400" /> Reprompt Loops:
                      </span>
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-slate-400 line-through">
                          {simulationResult.value.before.repromptRate}%
                        </span>
                        <span class="font-mono font-bold text-emerald-400">
                          {simulationResult.value.after.repromptRate}%
                        </span>
                        <span class="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                          -{simulationResult.value.impact.repromptReduction}% Retries
                        </span>
                      </div>
                    </div>

                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 flex items-center gap-1.5">
                        <Clock class="w-3.5 h-3.5 text-sky-400" /> Time to Result:
                      </span>
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-slate-400 line-through">
                          {simulationResult.value.before.latency}s
                        </span>
                        <span class="font-mono font-bold text-white">
                          {simulationResult.value.after.latency}s
                        </span>
                        <span class="text-[10px] text-slate-400 font-mono">
                          ({simulationResult.value.impact.latencyDelta >= 0 ? '+' : ''}
                          {simulationResult.value.impact.latencyDelta}s)
                        </span>
                      </div>
                    </div>

                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 flex items-center gap-1.5">
                        <Coins class="w-3.5 h-3.5 text-amber-400" /> Tokens / Query:
                      </span>
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-slate-400 line-through">
                          {simulationResult.value.before.tokenPerQuery}
                        </span>
                        <span class="font-mono font-bold text-slate-200">
                          {simulationResult.value.after.tokenPerQuery}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div class="pt-2 border-t border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick$={handleSaveAllRefinements}
                    class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Save class="w-4 h-4" />
                    <span>Save &amp; Deploy Changes to Agent Fleet</span>
                  </button>

                  <button
                    type="button"
                    onClick$={handleResetToCurrent}
                    class="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800 cursor-pointer"
                  >
                    <RotateCcw class="w-3.5 h-3.5" />
                    <span>Reset Draft to Production State</span>
                  </button>
                </div>
              </div>

              {/* Guidance Note */}
              <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-400 shadow-xl backdrop-blur-md">
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
      )}

      {/* SUB-TAB 2: TELEMETRY */}
      {subTab.value === 'telemetry' && selectedAgent && (
        <div class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span class="flex items-center gap-1.5 font-medium">
                  <Coins class="w-4 h-4 text-sky-400" /> Total Tokens
                </span>
                <span class="font-mono text-slate-300">{selectedAgent.totalRuns.toLocaleString()} runs</span>
              </div>
              <div class="text-2xl font-black font-mono text-white">
                {(selectedAgent.tokens.total / 1000000).toFixed(2)}M
              </div>

              <div class="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden mt-3">
                <div
                  class="bg-indigo-500 h-full"
                  style={{ width: `${(selectedAgent.tokens.input / selectedAgent.tokens.total) * 100}%` }}
                ></div>
                <div
                  class="bg-emerald-500 h-full"
                  style={{ width: `${(selectedAgent.tokens.output / selectedAgent.tokens.total) * 100}%` }}
                ></div>
                <div
                  class="bg-amber-500 h-full"
                  style={{ width: `${(selectedAgent.tokens.cached / selectedAgent.tokens.total) * 100}%` }}
                ></div>
                <div
                  class="bg-pink-500 h-full"
                  style={{ width: `${(selectedAgent.tokens.reasoning / selectedAgent.tokens.total) * 100}%` }}
                ></div>
              </div>

              <div class="grid grid-cols-2 gap-1 mt-2.5 text-[10px] text-slate-400">
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  In: {(selectedAgent.tokens.input / 1000000).toFixed(1)}M
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Out: {(selectedAgent.tokens.output / 1000000).toFixed(1)}M
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Cache: {(selectedAgent.tokens.cached / 1000000).toFixed(1)}M
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                  CoT: {(selectedAgent.tokens.reasoning / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>

            <div class="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span class="flex items-center gap-1.5 font-medium">
                  <AlertTriangle class="w-4 h-4 text-rose-400" /> Hallucination Rate
                </span>
                <span class="font-mono text-rose-400">{selectedAgent.errors?.hallucinationCount} incidents</span>
              </div>
              <div class="text-2xl font-black font-mono text-rose-400">
                {selectedAgent.errors?.hallucinationRate}%
              </div>
              <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                <span>Grounding Score:</span>
                <span class="font-mono text-slate-200 font-bold">
                  {((selectedAgent.errors?.groundingScore || 0) * 100).toFixed(0)} / 100
                </span>
              </div>
            </div>

            <div class="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span class="flex items-center gap-1.5 font-medium">
                  <RefreshCw class="w-4 h-4 text-orange-400" /> Reprompt Rate
                </span>
                <span class="font-mono text-orange-400">{selectedAgent.errors?.repromptCount} loops</span>
              </div>
              <div class="text-2xl font-black font-mono text-orange-400">
                {selectedAgent.errors?.repromptRate}%
              </div>
              <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                <span>Avg Retries / Query:</span>
                <span class="font-mono text-slate-200 font-bold">
                  {selectedAgent.errors?.avgRepromptsPerQuery}x
                </span>
              </div>
            </div>

            <div class="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span class="flex items-center gap-1.5 font-medium">
                  <Clock class="w-4 h-4 text-sky-400" /> Time to Result
                </span>
                <span class="font-mono text-emerald-400">SLA Tracked</span>
              </div>
              <div class="text-2xl font-black font-mono text-white">
                {selectedAgent.avgLatency}s
              </div>
              <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                <span>Inference / Tool Split:</span>
                <span class="font-mono text-slate-200">
                  {(selectedAgent.avgLatency * 0.6).toFixed(1)}s / {(selectedAgent.avgLatency * 0.4).toFixed(1)}s
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
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
                  {selectedAgent.errors?.hallucinationExamples?.length || 0} Recent Logs
                </span>
              </div>

              <div class="space-y-3">
                {(selectedAgent.errors?.hallucinationExamples || []).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    class="bg-slate-950/70 border border-rose-500/20 rounded-xl p-3.5 space-y-2 hover:border-rose-500/40 transition-colors"
                  >
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                        Severity: {item.severity}
                      </span>
                      <span class="text-slate-500 font-mono">{item.detectedAt}</span>
                    </div>
                    <p class="text-xs text-slate-200 font-sans italic">&ldquo;{item.claim}&rdquo;</p>
                    <div class="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                      <span>Verifier Confidence Score:</span>
                      <span class="font-mono font-bold text-rose-300">
                        {(item.confidence * 100).toFixed(0)}% confident hallucinated
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
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
                  {selectedAgent.errors?.repromptRate}% of queries
                </span>
              </div>

              <div class="space-y-3">
                {(selectedAgent.errors?.repromptReasons || []).map((item: any, idx: number) => (
                  <div key={idx} class="space-y-1">
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
                ))}
              </div>
            </div>
          </div>

          <div class="pt-2">
            <TokenWaterfallTrace />
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TRACES */}
      {subTab.value === 'traces' && selectedAgent && (
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Clock class="w-4 h-4 text-sky-400" />
                Live Execution Traces &amp; Audit Trail for {selectedAgent.name}
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
                  value={searchQuery.value}
                  onInput$={$((e: Event) => {
                    searchQuery.value = (e.target as HTMLInputElement).value;
                  })}
                  class="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
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
              <tbody class="divide-y divide-slate-800/80">
                {agentTraces
                  .filter(
                    (t: any) =>
                      !searchQuery.value ||
                      t.prompt.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                      t.id.includes(searchQuery.value)
                  )
                  .map((trace: any) => (
                    <tr key={trace.id} class="hover:bg-slate-900/60 transition-colors">
                      <td class="py-2.5 font-mono text-sky-400 font-semibold">{trace.id}</td>
                      <td class="py-2.5 text-slate-400">{trace.timestamp}</td>
                      <td class="py-2.5 text-slate-200 max-w-xs truncate" title={trace.prompt}>
                        {trace.prompt}
                      </td>
                      <td class="py-2.5 font-mono text-slate-200">{trace.latency}s</td>
                      <td class="py-2.5 font-mono text-slate-400">
                        {trace.tokens.total}{' '}
                        <span class="text-[10px] text-slate-500">
                          (In:{trace.tokens.input} Out:{trace.tokens.output})
                        </span>
                      </td>
                      <td class="py-2.5 font-mono">
                        {trace.reprompts > 0 ? (
                          <span class="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-semibold">
                            {trace.reprompts} retries
                          </span>
                        ) : (
                          <span class="text-slate-500">0</span>
                        )}
                      </td>
                      <td class="py-2.5 font-mono text-slate-300">
                        {(trace.groundingConfidence * 100).toFixed(0)}%
                      </td>
                      <td class="py-2.5">
                        {trace.status === 'success' ? (
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Success
                          </span>
                        ) : (
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            Reprompt Loop
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Cloud Logs */}
          {cloudLogs && cloudLogs.length > 0 && (
            <div class="mt-6 pt-5 border-t border-slate-800">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <Server class="w-4 h-4 text-emerald-400" />
                  <h4 class="text-xs font-bold text-white uppercase tracking-wider">
                    Live Google Cloud Logging (Cloud Run Services: promo-agent-shadow / novasmart-mcp)
                  </h4>
                </div>
                <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {cloudLogs.length} live entries fetched via ADC
                </span>
              </div>

              <div class="bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5">
                {cloudLogs.map((log: any, idx: number) => (
                  <div key={idx} class="flex items-start gap-2 text-slate-300">
                    <span
                      class={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                        log.severity === 'WARNING' || log.severity === 'ERROR'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.severity || 'INFO'}
                    </span>
                    <span class="text-indigo-400 shrink-0">[{log.service}]</span>
                    <span class="text-slate-200 truncate flex-1" title={log.payload}>
                      {log.payload}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: WORKFORCE REVIEW (Strictly autonomous metrics, no human comparisons) */}
      {subTab.value === 'workforce' && selectedAgent && (
        <div class="space-y-6">
          <div class="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl backdrop-blur-md">
            <div class="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-lg"
                  style={{
                    backgroundColor: `${selectedAgent.color}20`,
                    border: `1px solid ${selectedAgent.color}40`,
                    color: selectedAgent.color
                  }}
                >
                  <Briefcase class="w-6 h-6" />
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-base font-bold text-white tracking-tight">
                      {selectedAgent.workforce?.employeeTitle || selectedAgent.role}
                    </h3>
                    <span
                      class={`px-2 py-0.5 rounded text-[11px] font-black font-mono ${
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
                  <p class="text-xs text-slate-400 mt-0.5">
                    Autonomous Employee Benchmark: Unit cost, First-time-right, and speedup multipliers
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <button
                  onClick$={$(() => {
                    subTab.value = 'refine';
                    state.setAgentActiveSubTab('refine');
                  })}
                  class="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
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
                  ${((selectedAgent.workforce?.totalEconomicValue || 0) / 1000).toFixed(0)}k
                </span>
                <span class="text-[10px] text-slate-500 block mt-1">
                  vs ${selectedAgent.costEstimate} compute spend (
                  {Math.round(selectedAgent.workforce?.netROI || 0).toLocaleString()}x ROI)
                </span>
              </div>

              <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span class="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5 text-sky-400" /> Operational Hours Delivered
                </span>
                <span class="text-2xl font-black font-mono text-sky-300">
                  {selectedAgent.workforce?.humanLaborHoursSaved?.toLocaleString() || 0}
                </span>
                <span class="text-[10px] text-slate-500 block mt-1">
                  hours saved across {selectedAgent.totalRuns.toLocaleString()} runs
                </span>
              </div>

              <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span class="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                  <Zap class="w-3.5 h-3.5 text-amber-400" /> Unit Cost (CPWU)
                </span>
                <span class="text-2xl font-black font-mono text-amber-400">
                  ${selectedAgent.workforce?.costPerWorkUnit}
                </span>
                <span class="text-[10px] text-slate-500 block mt-1">per autonomous task</span>
              </div>

              <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span class="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                  <CheckCircle2 class="w-3.5 h-3.5 text-indigo-400" /> First-Time Right Rate
                </span>
                <span class="text-2xl font-black font-mono text-indigo-300">
                  {selectedAgent.workforce?.firstTimeRightRate}%
                </span>
                <span class="text-[10px] text-slate-500 block mt-1">
                  {selectedAgent.workforce?.escalationRate}% escalation rate
                </span>
              </div>
            </div>
          </div>

          {/* Competencies */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Percent class="w-4 h-4 text-emerald-400" />
                Core Competencies &amp; Skill Mastery
              </h4>
              <div class="space-y-3">
                {(selectedAgent.workforce?.competencies || []).map((comp: any, idx: number) => (
                  <div key={idx} class="space-y-1">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-300">{comp.name}</span>
                      <span class="font-mono font-bold text-slate-200">{comp.score}/100</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        class={`h-full rounded-full ${
                          comp.score > 90
                            ? 'bg-emerald-400'
                            : comp.score > 75
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                        style={{ width: `${comp.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Users class="w-4 h-4 text-amber-400" />
                Supervisor Escalation Triggers
              </h4>
              <div class="space-y-2.5">
                {(selectedAgent.workforce?.escalationReasons || []).map((esc: any, idx: number) => (
                  <div
                    key={idx}
                    class="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span class="text-slate-200 font-medium block">{esc.reason}</span>
                      <span class="text-[10px] text-slate-500 font-mono">
                        {esc.count} incidents logged
                      </span>
                    </div>
                    <span class="font-mono text-amber-400 font-bold text-sm">{esc.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Award class="w-4 h-4 text-sky-400" />
                Supervisor Performance Coaching
              </h4>
              <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-3">
                <p class="italic leading-relaxed">&ldquo;{selectedAgent.workforce?.coachingNotes}&rdquo;</p>
                <div class="pt-3 border-t border-slate-800 text-[11px] space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Autonomous Reliability:</span>
                    <span class="font-mono text-emerald-400 font-bold">
                      {selectedAgent.workforce?.autonomousResolutionRate}%
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Execution Velocity:</span>
                    <span class="font-mono text-sky-400 font-bold">
                      {selectedAgent.workforce?.speedupMultiplier}x speedup
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick$={$(() => {
                  subTab.value = 'refine';
                  state.setAgentActiveSubTab('refine');
                })}
                class="w-full py-2 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Edit Skills &amp; Rules to Address Notes</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: IAM CONTROLS */}
      {subTab.value === 'iam' && selectedAgent && <AgentIAMControls agent={selectedAgent} />}
    </div>
  );
});
