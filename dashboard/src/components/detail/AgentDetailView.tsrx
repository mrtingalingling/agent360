import { track } from 'ripple';
import { dashboardState } from '../../state/dashboardState.js';
import { TokenWaterfallTrace } from '../telemetry/TokenWaterfallTrace.tsrx';
import { AgentIAMControls } from '../iam/AgentIAMControls.tsrx';
import {
  CoinsIcon,
  CpuIcon,
  ClockIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  SlidersIcon,
  ShieldIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ChevronRightIcon,
  SearchIcon,
  CodeIcon,
  WrenchIcon,
  PlusIcon,
  PlayIcon,
  SaveIcon,
  RotateCcwIcon,
  SparklesIcon,
  ActivityIcon,
  XIcon,
  BriefcaseIcon,
  AwardIcon,
  DollarSignIcon,
  UsersIcon,
  PercentIcon,
  ServerIcon,
  ExternalLinkIcon,
  ZapIcon
} from '../common/Icons.tsrx';

export function AgentDetailView() @{
  const agents = () => dashboardState.agents;
  const selectedAgent = () => dashboardState.selectedAgent;
  const selectedAgentId = () => dashboardState.selectedAgentId;
  const ag = new Proxy({}, {
    get(_, prop) {
      const current = dashboardState.selectedAgent;
      return current ? (current as any)[prop] : undefined;
    }
  }) as any;
  const recentTraces = () => dashboardState.recentTraces;
  const cloudLogs = () => dashboardState.cloudLogs;

  const subTab = () => dashboardState.agentActiveSubTab || 'refine';
  const setSubTab = (val: string) => dashboardState.setAgentActiveSubTab(val);

  function getDraftSkills() {
    const ag = selectedAgent();
    return ag?.skills ? JSON.parse(JSON.stringify(ag.skills)) : [];
  }

  function getDraftRules() {
    const ag = selectedAgent();
    return ag?.rules ? JSON.parse(JSON.stringify(ag.rules)) : [];
  }

  function getDraftConfig() {
    const ag = selectedAgent();
    return ag?.fineTuneConfig ? JSON.parse(JSON.stringify(ag.fineTuneConfig)) : {};
  }

  const draftSkills = track<any[]>(getDraftSkills());
  const draftRules = track<any[]>(getDraftRules());
  const draftConfig = track<any>(getDraftConfig());
  const simulationResult = track<any>(null);
  const isSimulating = track(false);
  const testPrompt = track(
    'Calculate promotional bundle for SKU-9014 with 20% loyalty markdown and verify inventory in regional warehouse'
  );

  const showAddSkillModal = track(false);
  const newSkillForm = track({ name: '', description: '', riskLevel: 'low' });

  const showAddRuleModal = track(false);
  const newRuleForm = track({ name: '', description: '', category: 'safety' });

  const searchQuery = track('');
  const directiveApplied = track(false);

  function handleSelectAgent(id: string) {
    dashboardState.setSelectedAgentId(id);
    const ag = dashboardState.selectedAgent;
    if (ag) {
      draftSkills.value = JSON.parse(JSON.stringify(ag.skills || []));
      draftRules.value = JSON.parse(JSON.stringify(ag.rules || []));
      draftConfig.value = JSON.parse(JSON.stringify(ag.fineTuneConfig || {}));
      simulationResult.value = null;
      directiveApplied.value = false;
    }
  }

  function handleToggleSkill(skillId: string) {
    draftSkills.value = draftSkills.value.map((s: any) =>
      s.id === skillId ? { ...s, enabled: !s.enabled } : s
    );
  }

  function handleToggleRule(ruleId: string) {
    draftRules.value = draftRules.value.map((r: any) =>
      r.id === ruleId ? { ...r, enforced: !r.enforced } : r
    );
  }

  function handleCreateSkill(e: any) {
    e.preventDefault();
    const form = newSkillForm.value;
    if (!form.name) return;
    const newSkill = {
      id: `sk-custom-${Date.now().toString().slice(-4)}`,
      name: form.name.toLowerCase().replace(/\s+/g, '_'),
      description: form.description || 'Custom user-defined skill',
      enabled: true,
      riskLevel: form.riskLevel,
      runs: 0
    };
    draftSkills.value = [...draftSkills.value, newSkill];
    dashboardState.addAgentSkill(selectedAgent().id, newSkill);
    newSkillForm.value = { name: '', description: '', riskLevel: 'low' };
    showAddSkillModal.value = false;
  }

  function handleCreateRule(e: any) {
    e.preventDefault();
    const form = newRuleForm.value;
    if (!form.name) return;
    const newRule = {
      id: `rl-custom-${Date.now().toString().slice(-4)}`,
      name: form.name,
      description: form.description || 'Custom governance constraint',
      enforced: true,
      category: form.category
    };
    draftRules.value = [...draftRules.value, newRule];
    dashboardState.addAgentRule(selectedAgent().id, newRule);
    newRuleForm.value = { name: '', description: '', category: 'safety' };
    showAddRuleModal.value = false;
  }

  function handleRunSimulation() {
    isSimulating.value = true;
    setTimeout(() => {
      const ag = selectedAgent();
      if (ag) {
        const result = dashboardState.runBenchmarkSimulation(ag.id, draftConfig.value, draftRules.value);
        simulationResult.value = result;
      }
      isSimulating.value = false;
    }, 600);
  }

  function handleApplyCoachingDirective() {
    const ag = selectedAgent();
    if (!ag?.coachingDirective?.presetPatch) return;
    const patch = ag.coachingDirective.presetPatch;

    draftRules.value = draftRules.value.map((r: any) =>
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
      const result = dashboardState.runBenchmarkSimulation(ag.id, draftConfig.value, draftRules.value);
      simulationResult.value = result;
      isSimulating.value = false;
    }, 400);
  }

  function handleSaveAllRefinements() {
    const ag = selectedAgent();
    if (ag) {
      dashboardState.refineAgent(ag.id, {
        skills: draftSkills.value,
        rules: draftRules.value,
        fineTuneConfig: draftConfig.value
      });
      const result = dashboardState.runBenchmarkSimulation(ag.id, draftConfig.value, draftRules.value);
      simulationResult.value = result;
    }
  }

  function handleResetToCurrent() {
    const ag = selectedAgent();
    if (ag) {
      draftSkills.value = JSON.parse(JSON.stringify(ag.skills || []));
      draftRules.value = JSON.parse(JSON.stringify(ag.rules || []));
      draftConfig.value = JSON.parse(JSON.stringify(ag.fineTuneConfig || {}));
      simulationResult.value = null;
      directiveApplied.value = false;
    }
  }

  const agentTraces = () => {
    const ag = selectedAgent();
    if (!ag) return [];
    return recentTraces().filter((t: any) => t.agentId === ag.id);
  };

  <div class="space-y-6">
    {/* 1. Agent Selector Header Strip */}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      @for (const agent of agents()) {
        <button
          onClick={() => handleSelectAgent(agent.id)}
          class={`p-3 rounded-xl border text-left transition-all ${
            agent.id === selectedAgentId()
              ? "bg-slate-900 border-brand-500 shadow-lg shadow-brand-500/15 ring-1 ring-brand-500"
              : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40"
          }`}
        >
          <div class="flex items-center justify-between mb-2">
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ "background-color": agent.color }}
            ></span>
            <span class="text-[10px] font-mono text-slate-500 truncate">{agent.model.replace("gemini-", "")}</span>
          </div>
          <h4 class="text-xs font-bold text-slate-200 truncate">{agent.name}</h4>
          <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px]">
            <span class="text-slate-400 font-mono">{agent.avgLatency}s TTR</span>
            <span class={`font-semibold ${agent.errors?.hallucinationRate > 5.0 ? "text-rose-400" : "text-slate-400"}`}>
              {agent.errors?.hallucinationRate}% Hal
            </span>
          </div>
        </button>
      }
    </div>

    {/* 2. Selected Agent Header & Sub-Tabs Navigation */}
    @if (selectedAgent()) {
      <div class="glass-panel rounded-2xl p-6">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                  style={{
                    'background-color': `${ag.color}20`,
                    border: `1px solid ${ag.color}40`,
                    color: ag.color
                  }}
                >
                  <CpuIcon class="w-6 h-6" />
                </div>
                <div>
                  <div class="flex items-center gap-3 flex-wrap">
                    <h2 class="text-xl font-black text-white tracking-tight">{ag.name}</h2>
                    <span class={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      ag.status === 'optimal' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      ag.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                    }`}>
                      {ag.status}
                    </span>
                    <span class="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-800">
                      {ag.model}
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mt-1 max-w-2xl">{ag.role}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="text-right">
                  <div class="text-xs text-slate-400">Monthly Run Volume</div>
                  <div class="text-base font-mono font-bold text-white">{ag.totalRuns.toLocaleString()} queries</div>
                </div>
              </div>
            </div>

            {/* Sub-Tabs Navigation Bar */}
            <div class="flex flex-wrap items-center justify-between gap-3 pt-4">
              <div class="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => { setSubTab('refine'); }}
                  class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab() === 'refine' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                >
                  <SlidersIcon class="w-3.5 h-3.5" />
                  <span>Refine Agent (Skills, Rules, Model &amp; Prompts)</span>
                </button>

                <button
                  onClick={() => { setSubTab('workforce'); }}
                  class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab() === 'workforce' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                >
                  <BriefcaseIcon class="w-3.5 h-3.5" />
                  <span>Employee Performance &amp; ROI</span>
                  @if (ag.workforce) {
                    <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {ag.workforce.performanceGrade}
                    </span>
                  }
                </button>

                <button
                  onClick={() => { setSubTab('telemetry'); }}
                  class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab() === 'telemetry' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                >
                  <ActivityIcon class="w-3.5 h-3.5" />
                  <span>Error &amp; Token Telemetry</span>
                </button>

                <button
                  onClick={() => { setSubTab('traces'); }}
                  class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab() === 'traces' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                >
                  <ClockIcon class="w-3.5 h-3.5" />
                  <span>Live Execution Traces</span>
                </button>

                <button
                  onClick={() => { setSubTab('iam'); }}
                  class={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab() === 'iam' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                >
                  <ShieldIcon class="w-3.5 h-3.5 text-indigo-400" />
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
    }

    {/* SUB-TAB CONTENTS */}
    @if (subTab() === "refine" && selectedAgent()) {
      <div class="space-y-6">
            @if (ag.coachingDirective) {
              <div class="bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900/90 border border-rose-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div class="space-y-1.5">
                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                        <AlertTriangleIcon class="w-3.5 h-3.5" /> Supervisory Coaching Directive
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
                      <SlidersIcon class="w-4 h-4" />
                      <span>{directiveApplied.value ? '✓ Coaching Recommendations Applied & Simulated' : 'Apply Coaching Recommendations (1-Click)'}</span>
                    </button>
                  </div>
                </div>

                @if (directiveApplied.value) {
                  <div class="mt-3 pt-3 border-t border-rose-500/20 flex items-center justify-between text-xs text-emerald-300">
                    <span class="flex items-center gap-1.5 font-medium">
                      <CheckCircle2Icon class="w-4 h-4 text-emerald-400" />
                      Enforced wholesale margin floor &amp; discount rules, lowered temperature to 0.20, and engaged strict grounding. Simulation run below.
                    </span>
                    <span class="font-mono text-[11px] text-slate-400">Click &quot;Save &amp; Deploy Changes&quot; to push live</span>
                  </div>
                }
              </div>
            }

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Refinement Controls (7 cols) */}
              <div class="lg:col-span-7 space-y-6">
                {/* Section A: Skills */}
                <div class="glass-panel rounded-2xl p-5 space-y-4">
                  <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <WrenchIcon class="w-4 h-4 text-brand-400" />
                        Agent Skills &amp; Tool Capabilities ({draftSkills.value.filter((s: any) => s.enabled).length}/{draftSkills.value.length} Active)
                      </h3>
                      <p class="text-[11px] text-slate-400 mt-0.5">
                        Toggle or assign executable tool definitions and MCP actions to this agent.
                      </p>
                    </div>
                    <button
                      onClick={() => { showAddSkillModal.value = true; }}
                      class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <PlusIcon class="w-3.5 h-3.5 text-brand-400" /> Add Skill
                    </button>
                  </div>

                  {/* Skills List */}
                  <div class="space-y-2.5">
                    @for (const skill of draftSkills.value) {
                      <div
                        class={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${skill.enabled ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'}`}
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
                              <span class="text-xs font-bold font-mono text-slate-200">{skill.name}</span>
                              <span
                                class={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                                  skill.riskLevel === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                  skill.riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}
                              >
                                {skill.riskLevel} risk
                              </span>
                            </div>
                            <p class="text-[11px] text-slate-400 mt-1 leading-snug">{skill.description}</p>
                          </div>
                        </div>

                        <span class="text-[10px] font-mono text-slate-500 shrink-0 mt-1">
                          {skill.runs?.toLocaleString() || 0} calls
                        </span>
                      </div>
                    }
                  </div>

                  {/* Add Skill Modal */}
                  @if (showAddSkillModal.value) {
                    <form onSubmit={handleCreateSkill} class="bg-slate-950 border border-brand-500/40 rounded-xl p-3.5 space-y-3">
                      <div class="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                        <span>Define New Agent Skill / Tool</span>
                        <button type="button" onClick={() => { showAddSkillModal.value = false; }} class="text-slate-400 hover:text-white">
                          <XIcon class="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label for="new-skill-name" class="text-slate-400 text-[10px] block mb-1">Skill Identifier / Function Name:</label>
                          <input
                            id="new-skill-name"
                            type="text"
                            placeholder="e.g. check_inventory_levels"
                            value={newSkillForm.value.name}
                            onInput={(e: any) => { newSkillForm.value = { ...newSkillForm.value, name: e.target.value }; }}
                            class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label for="new-skill-risk" class="text-slate-400 text-[10px] block mb-1">Execution Risk Level:</label>
                          <select
                            id="new-skill-risk"
                            value={newSkillForm.value.riskLevel}
                            onChange={(e: any) => { newSkillForm.value = { ...newSkillForm.value, riskLevel: e.target.value }; }}
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
                          value={newSkillForm.value.description}
                          onInput={(e: any) => { newSkillForm.value = { ...newSkillForm.value, description: e.target.value }; }}
                          class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>
                      <div class="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => { showAddSkillModal.value = false; }}
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
                  }
                </div>

                {/* Section B: Rules */}
                <div class="glass-panel rounded-2xl p-5 space-y-4">
                  <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <ShieldIcon class="w-4 h-4 text-emerald-400" />
                        Behavioral Guardrail Rules ({draftRules.value.filter((r: any) => r.enforced).length}/{draftRules.value.length} Active)
                      </h3>
                      <p class="text-[11px] text-slate-400 mt-0.5">
                        Safety policies, boundary constraints, and compliance checks enforced during reasoning.
                      </p>
                    </div>
                    <button
                      onClick={() => { showAddRuleModal.value = true; }}
                      class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <PlusIcon class="w-3.5 h-3.5 text-emerald-400" /> Add Rule
                    </button>
                  </div>

                  {/* Rules List */}
                  <div class="space-y-2.5">
                    @for (const rule of draftRules.value) {
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
                    }
                  </div>

                  {/* Add Rule Modal */}
                  @if (showAddRuleModal.value) {
                    <form onSubmit={handleCreateRule} class="bg-slate-950 border border-emerald-500/40 rounded-xl p-3.5 space-y-3">
                      <div class="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                        <span>Create Governance Rule</span>
                        <button type="button" onClick={() => { showAddRuleModal.value = false; }} class="text-slate-400 hover:text-white">
                          <XIcon class="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label for="new-rule-name" class="text-slate-400 text-[10px] block mb-1">Rule Name:</label>
                          <input
                            id="new-rule-name"
                            type="text"
                            placeholder="e.g. Margin Threshold Guarantee"
                            value={newRuleForm.value.name}
                            onInput={(e: any) => { newRuleForm.value = { ...newRuleForm.value, name: e.target.value }; }}
                            class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                            required
                          />
                        </div>
                        <div>
                          <label for="new-rule-category" class="text-slate-400 text-[10px] block mb-1">Category:</label>
                          <select
                            id="new-rule-category"
                            value={newRuleForm.value.category}
                            onChange={(e: any) => { newRuleForm.value = { ...newRuleForm.value, category: e.target.value }; }}
                            class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                          >
                            <option value="safety">Safety</option>
                            <option value="privacy">Privacy</option>
                            <option value="compliance">Compliance</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label for="new-rule-desc" class="text-slate-400 text-[10px] block mb-1">Rule Enforcement Logic:</label>
                        <input
                          id="new-rule-desc"
                          type="text"
                          placeholder="Rejects generated discount if net transaction margin is under 15%"
                          value={newRuleForm.value.description}
                          onInput={(e: any) => { newRuleForm.value = { ...newRuleForm.value, description: e.target.value }; }}
                          class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>
                      <div class="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => { showAddRuleModal.value = false; }}
                          class="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                        >
                          Save Rule
                        </button>
                      </div>
                    </form>
                  }
                </div>

                {/* Section C: Sampling Hyperparameters */}
                <div class="glass-panel rounded-2xl p-5 space-y-4">
                  <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <SlidersIcon class="w-4 h-4 text-brand-400" />
                      Sampling Hyperparameters &amp; Grounding Policy
                    </h3>
                  </div>

                  {/* Temperature Slider */}
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-300 font-medium">Temperature</span>
                      <span class="font-mono font-bold text-brand-400">{draftConfig.value.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={draftConfig.value.temperature || 0.2}
                      onInput={(e: any) => { draftConfig.value = { ...draftConfig.value, temperature: parseFloat(e.target.value) }; }}
                      class="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0.0 (Deterministic)</span>
                      <span>0.5 (Balanced)</span>
                      <span>1.0 (Creative)</span>
                    </div>
                  </div>

                  {/* Top-P and Max Tokens Grid */}
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-slate-300 font-medium">Top-P</span>
                        <span class="font-mono font-bold text-slate-200">{draftConfig.value.topP}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={draftConfig.value.topP || 0.8}
                        onInput={(e: any) => { draftConfig.value = { ...draftConfig.value, topP: parseFloat(e.target.value) }; }}
                        class="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
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
                        value={draftConfig.value.maxOutputTokens || 2048}
                        onInput={(e: any) => { draftConfig.value = { ...draftConfig.value, maxOutputTokens: parseInt(e.target.value, 10) }; }}
                        class="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Grounding Verification Mode */}
                  <div class="space-y-1.5 pt-2">
                    <span class="text-xs text-slate-300 font-medium block">Grounding Mode:</span>
                    <div class="grid grid-cols-3 gap-2">
                      @for (const gm of ['strict', 'balanced', 'permissive']) {
                        <button
                          type="button"
                          onClick={() => { draftConfig.value = { ...draftConfig.value, groundingMode: gm }; }}
                          class={`p-2 rounded-lg border text-center capitalize text-xs font-semibold transition-all ${draftConfig.value.groundingMode === gm ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                          {gm}
                        </button>
                      }
                    </div>
                  </div>
                </div>

                {/* Section D: System Prompt Directives */}
                <div class="glass-panel rounded-2xl p-5 space-y-3">
                  <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <CodeIcon class="w-4 h-4 text-brand-400" />
                      System Prompt Instructions &amp; Persona
                    </h3>
                    <span class="text-[10px] font-mono text-slate-500">
                      {draftConfig.value.systemPrompt?.length || 0} characters
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={draftConfig.value.systemPrompt || ''}
                    onInput={(e: any) => { draftConfig.value = { ...draftConfig.value, systemPrompt: e.target.value }; }}
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
                        <SparklesIcon class="w-4 h-4 text-brand-400" />
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
                      value={testPrompt.value}
                      onInput={(e: any) => { testPrompt.value = e.target.value; }}
                      class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-sans"
                    ></textarea>
                  </div>

                  {/* Run Simulation Button */}
                  <button
                    type="button"
                    onClick={handleRunSimulation}
                    disabled={isSimulating.value}
                    class="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
                  >
                    @if (isSimulating.value) {
                      <>
                        <RefreshCwIcon class="w-4 h-4 animate-spin" />
                        <span>Simulating Workload Impact...</span>
                      </>
                    } @else {
                      <>
                        <PlayIcon class="w-4 h-4 fill-white" />
                        <span>Run Synthetic Benchmark &amp; Impact Analysis</span>
                      </>
                    }
                  </button>

                  {/* Simulation Comparison Results Card */}
                  @if (simulationResult.value) {
                    <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                          <div class="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                            <span>Projected Operational Impact</span>
                            <span class="text-[10px] text-emerald-400 font-mono">Based on tuned parameters</span>
                          </div>

                          {/* Hallucination */}
                          <div class="flex items-center justify-between text-xs">
                            <span class="text-slate-400 flex items-center gap-1.5">
                              <AlertTriangleIcon class="w-3.5 h-3.5 text-rose-400" /> Hallucination Rate:
                            </span>
                            <div class="flex items-center gap-2">
                              <span class="font-mono text-slate-400 line-through">
                                {simulationResult.value.before.hallucinationRate}%
                              </span>
                              <span class="font-mono font-bold text-emerald-400">
                                {simulationResult.value.after.hallucinationRate}%
                              </span>
                              <span class="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                                -{simulationResult.value.impact.halReduction}%
                              </span>
                            </div>
                          </div>

                          {/* Reprompt */}
                          <div class="flex items-center justify-between text-xs">
                            <span class="text-slate-400 flex items-center gap-1.5">
                              <RefreshCwIcon class="w-3.5 h-3.5 text-orange-400" /> Reprompt Loops:
                            </span>
                            <div class="flex items-center gap-2">
                              <span class="font-mono text-slate-400 line-through">
                                {simulationResult.value.before.repromptRate}%
                              </span>
                              <span class="font-mono font-bold text-emerald-400">
                                {simulationResult.value.after.repromptRate}%
                              </span>
                              <span class="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                                -{simulationResult.value.impact.repromptReduction}%
                              </span>
                            </div>
                          </div>

                          {/* Latency */}
                          <div class="flex items-center justify-between text-xs">
                            <span class="text-slate-400 flex items-center gap-1.5">
                              <ClockIcon class="w-3.5 h-3.5 text-sky-400" /> Latency:
                            </span>
                            <div class="flex items-center gap-2">
                              <span class="font-mono text-slate-400 line-through">
                                {simulationResult.value.before.latency}s
                              </span>
                              <span class="font-mono font-bold text-white">
                                {simulationResult.value.after.latency}s
                              </span>
                            </div>
                          </div>
                        </div>
                  } @else {
                    <div class="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
                      Click "Run Synthetic Benchmark" to test your adjusted skills, rules, and hyperparameters against real historical scenarios.
                    </div>
                  }

                  {/* Save and Reset Actions */}
                  <div class="pt-2 border-t border-slate-800 space-y-2">
                    <button
                      type="button"
                      onClick={handleSaveAllRefinements}
                      class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                    >
                      <SaveIcon class="w-4 h-4" />
                      <span>Save &amp; Deploy Changes to Agent Fleet</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetToCurrent}
                      class="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
                    >
                      <RotateCcwIcon class="w-3.5 h-3.5" />
                      <span>Discard Changes &amp; Revert to Live</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
    } @else if (subTab() === "workforce" && selectedAgent()) {
      <div class="space-y-6">
            <div class="glass-panel rounded-2xl p-6 border-emerald-500/30 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-lg"
                    style={{
                      'background-color': `${ag.color}20`,
                      border: `1px solid ${ag.color}40`,
                      color: ag.color
                    }}
                  >
                    <BriefcaseIcon class="w-6 h-6" />
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
                    onClick={() => { setSubTab('refine'); }}
                    class="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
                  >
                    <span>Apply Coaching &amp; Refine</span>
                    <ChevronRightIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4-Card Strip */}
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <span class="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                    <DollarSignIcon class="w-3.5 h-3.5 text-emerald-400" /> Economic Value Created
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
                    <ClockIcon class="w-3.5 h-3.5 text-sky-400" /> Operational Hours Delivered
                  </span>
                  <span class="text-2xl font-black font-mono text-sky-300">
                    {ag.workforce?.humanLaborHoursSaved?.toLocaleString() || 0}
                  </span>
                  <span class="text-[10px] text-slate-500 block mt-1">
                    hours saved across {ag.totalRuns.toLocaleString()} runs
                  </span>
                </div>

                <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <span class="text-slate-400 text-xs font-semibold block mb-1 flex items-center gap-1">
                    <ZapIcon class="w-3.5 h-3.5 text-amber-400" /> Unit Cost (CPWU)
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
                    <CheckCircle2Icon class="w-3.5 h-3.5 text-indigo-400" /> First-Time Right Rate
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
                  <PercentIcon class="w-4 h-4 text-emerald-400" />
                  Core Competencies &amp; Skill Mastery
                </h4>
                <div class="space-y-3">
                  @for (const comp of ag.workforce?.competencies || []) {
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
                  }
                </div>
              </div>

              <div class="glass-panel rounded-2xl p-5 space-y-4">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <UsersIcon class="w-4 h-4 text-amber-400" />
                  Supervisor Escalation Triggers
                </h4>
                <div class="space-y-2.5">
                  @for (const esc of ag.workforce?.escalationReasons || []) {
                    <div class="bg-slate-950/60 border border-slate-850 rounded-xl p-3 text-xs flex items-center justify-between">
                      <div>
                        <span class="text-slate-200 font-medium block">{esc.reason}</span>
                        <span class="text-[10px] text-slate-500 font-mono">{esc.count} incidents logged</span>
                      </div>
                      <span class="font-mono text-amber-400 font-bold text-sm">{esc.pct}%</span>
                    </div>
                  }
                </div>
              </div>

              <div class="glass-panel rounded-2xl p-5 space-y-4">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <AwardIcon class="w-4 h-4 text-brand-400" />
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
                  onClick={() => { setSubTab("refine"); }}
                  class="w-full py-2 px-3 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/40 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <span>Edit Skills &amp; Rules to Address Notes</span>
                  <ChevronRightIcon class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
    } @else if (subTab() === "telemetry" && selectedAgent()) {
      <div class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Tokens */}
              <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span class="flex items-center gap-1.5 font-medium">
                    <CoinsIcon class="w-4 h-4 text-brand-400" /> Total Tokens
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

              {/* Metric 2: Hallucination */}
              <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span class="flex items-center gap-1.5 font-medium">
                    <AlertTriangleIcon class="w-4 h-4 text-rose-400" /> Hallucination Rate
                  </span>
                  <span class="font-mono text-rose-400">{ag.errors?.hallucinationCount} caught</span>
                </div>
                <div class={`text-2xl font-black font-mono ${ag.errors?.hallucinationRate > 5.0 ? 'text-rose-400' : 'text-white'}`}>
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
                    <RefreshCwIcon class="w-4 h-4 text-orange-400" /> Reprompt Rate
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
                    <ClockIcon class="w-4 h-4 text-sky-400" /> Time to Result
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
                      <AlertTriangleIcon class="w-4 h-4 text-rose-400" />
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
                  @for (const item of ag.errors?.hallucinationExamples || []) {
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
                  }
                </div>
              </div>

              <div class="glass-panel rounded-2xl p-5">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div>
                    <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <RefreshCwIcon class="w-4 h-4 text-orange-400" />
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
                  @for (const item of ag.errors?.repromptReasons || []) {
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
                  }
                </div>
              </div>
            </div>

            <div class="pt-2">
              <TokenWaterfallTrace />
            </div>
          </div>
    } @else if (subTab() === "traces" && selectedAgent()) {
      <div class="glass-panel rounded-2xl p-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <ClockIcon class="w-4 h-4 text-brand-400" />
                  Live Execution Traces &amp; Audit Trail for {ag.name}
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">
                  Query executions, tool invocations, and reprompting diagnostics
                </p>
              </div>

              <div class="flex items-center gap-2">
                <div class="relative">
                  <SearchIcon class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter queries..."
                    value={searchQuery.value}
                    onInput={(e: any) => { searchQuery.value = e.target.value; }}
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
                  @for (const trace of agentTraces().filter((t: any) => !searchQuery.value || t.prompt.toLowerCase().includes(searchQuery.value.toLowerCase()) || t.id.includes(searchQuery.value))) {
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
                        @if (trace.reprompts > 0) {
                          <span class="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-semibold">
                            {trace.reprompts} retries
                          </span>
                        } @else {
                          <span class="text-slate-500">0</span>
                        }
                      </td>
                      <td class="py-2.5 font-mono text-slate-300">
                        {(trace.groundingConfidence * 100).toFixed(0)}%
                      </td>
                      <td class="py-2.5">
                        @if (trace.status === 'success') {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Success
                          </span>
                        } @else {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            Reprompt Loop
                          </span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            {/* Cloud Logs */}
            @if (cloudLogs() && cloudLogs().length > 0) {
              <div class="mt-6 pt-5 border-t border-slate-800">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <ServerIcon class="w-4 h-4 text-emerald-400" />
                    <h4 class="text-xs font-bold text-white uppercase tracking-wider">
                      Live Google Cloud Logging (Cloud Run Services: promo-agent-shadow / novasmart-mcp)
                    </h4>
                  </div>
                  <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {cloudLogs().length} live entries fetched via ADC
                  </span>
                </div>

                <div class="bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5">
                  @for (const log of cloudLogs()) {
                    <div class="flex items-start gap-2 text-slate-300">
                      <span class={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${log.severity === 'WARNING' || log.severity === 'ERROR' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'}`}>
                        {log.severity || 'INFO'}
                      </span>
                      <span class="text-indigo-400 shrink-0">[{log.service}]</span>
                      <span class="text-slate-200 truncate flex-1" title={log.payload}>{log.payload}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
    } @else if (subTab() === "iam") {
      @if (selectedAgent()) {
        <AgentIAMControls agent={selectedAgent()} />
      }
    }
  </div>
}
