import { createSignal, createEffect, Show, For } from 'solid-js';
import { dashboardState } from '../../state/dashboardState.js';
import {
  Sliders,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Play,
  RotateCcw,
  Save,
  CheckCircle2,
  Clock,
  Code,
  Info,
  Coins
} from 'lucide-solid';

export function AgentFineTuneView() {
  const agents = () => dashboardState.agents;
  const selectedAgent = () => dashboardState.selectedAgent;
  const selectedAgentId = () => dashboardState.selectedAgentId;

  const [draftConfig, setDraftConfig] = createSignal({});
  const [simulationResult, setSimulationResult] = createSignal(null);
  const [isSimulating, setIsSimulating] = createSignal(false);
  const [customTestPrompt, setCustomTestPrompt] = createSignal(
    'Calculate promotional bundle for SKU-9014 with 20% loyalty markdown and verify inventory in regional warehouse'
  );

  createEffect(() => {
    const ag = selectedAgent();
    if (ag) {
      setDraftConfig({ ...ag.fineTuneConfig });
      setSimulationResult(null);
    }
  });

  function handleSliderChange(field, value) {
    setDraftConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function handleRunSimulation() {
    setIsSimulating(true);
    setTimeout(() => {
      const ag = selectedAgent();
      if (ag) {
        const result = dashboardState.runBenchmarkSimulation(ag.id, draftConfig());
        setSimulationResult(result);
      }
      setIsSimulating(false);
    }, 600);
  }

  function handleApplyConfig() {
    const ag = selectedAgent();
    if (ag) {
      dashboardState.updateAgentFineTuneConfig(ag.id, draftConfig());
      const result = dashboardState.runBenchmarkSimulation(ag.id, draftConfig());
      setSimulationResult(result);
    }
  }

  function handleResetDefaults() {
    const ag = selectedAgent();
    if (ag) {
      setDraftConfig({ ...ag.fineTuneConfig });
      setSimulationResult(null);
    }
  }

  return (
    <div class="space-y-6">
      {/* Agent Selector Header */}
      <div class="glass-panel rounded-2xl p-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <Sliders class="w-4 h-4 text-brand-400" />
              <h2 class="text-base font-bold text-white tracking-tight">
                Agent Fine-Tuning &amp; Guardrail Configuration Console
              </h2>
              <span class="px-2 py-0.5 text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full font-semibold">
                Parameter Optimization
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Adjust model checkpoints, sampling temperatures, grounding guardrails, and reprompting loop policies to eliminate hallucinations.
            </p>
          </div>

          {/* Agent Picker Dropdown */}
          <div class="flex items-center gap-2">
            <label for="target-agent-select" class="text-xs text-slate-400 font-medium">Target Agent:</label>
            <select
              id="target-agent-select"
              value={selectedAgentId()}
              onChange={(e) => dashboardState.setSelectedAgentId(e.target.value)}
              class="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-brand-500"
            >
              <For each={agents()}>
                {(a) => (
                  <option value={a.id}>
                    {a.name} ({a.status.toUpperCase()})
                  </option>
                )}
              </For>
            </select>
          </div>
        </div>

        {/* Selected Agent Quick Status Banner */}
        <Show when={selectedAgent()}>
          {(() => {
            const ag = selectedAgent();
            return (
              <div class="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs">
                <div class="flex items-center gap-3">
                  <span
                    class="w-3 h-3 rounded-full"
                    style={{ "background-color": ag.color }}
                  ></span>
                  <span class="font-bold text-slate-200">{ag.name}</span>
                  <span class="text-slate-400 font-mono">Current Model: {ag.model}</span>
                </div>
                <div class="flex items-center gap-4 text-[11px]">
                  <span class="text-slate-400">
                    Current Hallucination:{' '}
                    <span class={`font-mono font-bold ${ag.errors?.hallucinationRate > 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {ag.errors?.hallucinationRate}%
                    </span>
                  </span>
                  <span class="text-slate-400">
                    Current Reprompt:{' '}
                    <span class={`font-mono font-bold ${ag.errors?.repromptRate > 8 ? 'text-orange-400' : 'text-slate-200'}`}>
                      {ag.errors?.repromptRate}%
                    </span>
                  </span>
                  <span class="text-slate-400">
                    Grounding Score:{' '}
                    <span class="font-mono font-bold text-emerald-400">
                      {((ag.errors?.groundingScore || 0) * 100).toFixed(0)}%
                    </span>
                  </span>
                </div>
              </div>
            );
          })()}
        </Show>
      </div>

      {/* Main Form: Controls & Benchmark Test Bench */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Sliders & Toggles (7 cols) */}
        <div class="lg:col-span-7 space-y-5">
          {/* Section 1: Model Architecture & Checkpoint */}
          <div class="glass-panel rounded-2xl p-5 space-y-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu class="w-3.5 h-3.5 text-brand-400" />
              1. Foundation Model Architecture &amp; Checkpoint
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <For each={[
                { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Sub-second latency, lightweight, high cost efficiency', badge: 'Recommended for High QPS' },
                { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Deep multi-step reasoning, complex structured output', badge: 'Complex Workflows' },
                { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Preview)', desc: 'Next-gen multimodal, native tool calling speed', badge: 'Ultra Fast' },
                { id: 'gemini-1.5-pro-tuned-v2', name: 'NovaSmart Fine-Tuned LoRA v2', desc: 'Domain-adapted on NovaSmart pricing & catalog telemetry', badge: 'Domain Specific' }
              ]}>
                {(m) => (
                  <button
                    type="button"
                    onClick={() => handleSliderChange('model', m.id)}
                    class={`p-3 rounded-xl border text-left transition-all ${draftConfig().model === m.id ? 'bg-brand-500/10 border-brand-500 ring-1 ring-brand-500 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'}`}
                  >
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-bold">{m.name}</span>
                      <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {m.badge}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400 leading-tight">{m.desc}</p>
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* Section 2: Sampling Hyperparameters */}
          <div class="glass-panel rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sliders class="w-3.5 h-3.5 text-brand-400" />
                2. Sampling Hyperparameters
              </h3>
              <Show
                when={draftConfig().temperature <= 0.2}
                fallback={
                  <Show
                    when={draftConfig().temperature <= 0.45}
                    fallback={
                      <span class="text-rose-400 font-semibold text-[11px] flex items-center gap-1">
                        <AlertTriangle class="w-3.5 h-3.5" /> Elevated Hallucination Risk!
                      </span>
                    }
                  >
                    <span class="text-sky-400 font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle2 class="w-3.5 h-3.5" /> Balanced Enterprise Reasoning
                    </span>
                  </Show>
                }
              >
                <span class="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                  <ShieldCheck class="w-3.5 h-3.5" /> High Grounding (Minimal Hallucination Risk)
                </span>
              </Show>
            </div>

            {/* Temperature Slider */}
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-300 font-medium">Temperature (Randomness vs Factuality)</span>
                <span class="font-mono font-bold text-brand-400">{draftConfig().temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={draftConfig().temperature || 0.2}
                onInput={(e) => handleSliderChange('temperature', parseFloat(e.target.value))}
                class="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.0 (Strictly Deterministic)</span>
                <span>0.5 (Balanced)</span>
                <span>1.0 (Highly Creative)</span>
              </div>
            </div>

            {/* Top-P and Max Tokens Grid */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-300 font-medium">Top-P (Nucleus Sampling)</span>
                  <span class="font-mono font-bold text-slate-200">{draftConfig().topP}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={draftConfig().topP || 0.8}
                  onInput={(e) => handleSliderChange('topP', parseFloat(e.target.value))}
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
                  onInput={(e) => handleSliderChange('maxOutputTokens', parseInt(e.target.value, 10))}
                  class="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Grounding & Hallucination Prevention Shield */}
          <div class="glass-panel rounded-2xl p-5 space-y-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
              3. Grounding Verification &amp; Hallucination Shield
            </h3>

            {/* Grounding Mode Buttons */}
            <div class="space-y-2">
              <span class="text-xs text-slate-300 font-medium block">Grounding Mode:</span>
              <div class="grid grid-cols-3 gap-2">
                <For each={[
                  { id: 'strict', label: 'Strict (100% Grounded)', desc: 'Blocks any claim without direct DB citation' },
                  { id: 'balanced', label: 'Balanced (Contextual)', desc: 'Enforces citations on prices & catalog facts' },
                  { id: 'permissive', label: 'Permissive (High Risk)', desc: 'Standard self-consistency validation' }
                ]}>
                  {(mode) => (
                    <button
                      type="button"
                      onClick={() => handleSliderChange('groundingMode', mode.id)}
                      class={`p-2.5 rounded-xl border text-left transition-all ${draftConfig().groundingMode === mode.id ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-500/50' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'}`}
                    >
                      <span class="text-xs font-bold block">{mode.label}</span>
                      <span class="text-[10px] text-slate-500 leading-tight block mt-1">{mode.desc}</span>
                    </button>
                  )}
                </For>
              </div>
            </div>

            {/* Hallucination Intercept Threshold Slider */}
            <div class="space-y-1.5 pt-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-300 font-medium">Hallucination Intercept Threshold</span>
                <span class="font-mono font-bold text-rose-400">{((draftConfig().hallucinationThreshold || 0.8) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.99"
                step="0.01"
                value={draftConfig().hallucinationThreshold || 0.85}
                onInput={(e) => handleSliderChange('hallucinationThreshold', parseFloat(e.target.value))}
                class="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span class="text-[10px] text-slate-500 block">
                Responses with confidence score below this threshold are intercepted before client delivery.
              </span>
            </div>

            {/* Toggles */}
            <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div>
                <span class="font-medium text-slate-200 block">Require Direct Source Citations</span>
                <span class="text-[11px] text-slate-400">Append BigQuery/catalog row IDs to verified responses</span>
              </div>
              <input
                type="checkbox"
                checked={draftConfig().requireCitations || false}
                onChange={(e) => handleSliderChange('requireCitations', e.target.checked)}
                class="w-4 h-4 accent-brand-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 4: Reprompting Loop Policy */}
          <div class="glass-panel rounded-2xl p-5 space-y-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <RefreshCw class="w-3.5 h-3.5 text-orange-400" />
              4. Reprompting &amp; Self-Correction Strategy
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-300 font-medium">Max Reprompt Attempts</span>
                  <span class="font-mono font-bold text-orange-400">{draftConfig().maxReprompts || 2} loops</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={draftConfig().maxReprompts || 2}
                  onInput={(e) => handleSliderChange('maxReprompts', parseInt(e.target.value, 10))}
                  class="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div class="space-y-1.5">
                <label for="reprompt-strategy-select" class="text-xs text-slate-300 font-medium block">Reprompt Error Mode:</label>
                <select
                  id="reprompt-strategy-select"
                  value={draftConfig().repromptStrategy || 'schema-reminder'}
                  onChange={(e) => handleSliderChange('repromptStrategy', e.target.value)}
                  class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 font-medium"
                >
                  <option value="schema-reminder">Structured JSON Schema Reminder</option>
                  <option value="chain-of-thought">Chain-of-Thought Backtrack</option>
                  <option value="deterministic-fallback">Deterministic Human Fallback</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: System Instruction Editor */}
          <div class="glass-panel rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Code class="w-3.5 h-3.5 text-brand-400" />
                5. System Instructions &amp; Guardrail Directives
              </h3>
              <span class="text-[10px] font-mono text-slate-500">
                {draftConfig().systemPrompt?.length || 0} chars
              </span>
            </div>

            <textarea
              rows={4}
              value={draftConfig().systemPrompt || ''}
              onInput={(e) => handleSliderChange('systemPrompt', e.target.value)}
              class="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed"
            ></textarea>
          </div>
        </div>

        {/* Right Column: Benchmark Simulation & Production Deployment (5 cols) */}
        <div class="lg:col-span-5 space-y-5">
          {/* Simulation Test Bench */}
          <div class="glass-panel rounded-2xl p-5 border-brand-500/30 shadow-xl space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <Sparkles class="w-4 h-4 text-brand-400" />
                  Interactive Benchmark Simulator
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">
                  Test draft tuning parameters against historical query workloads
                </p>
              </div>
            </div>

            {/* Test Prompt Input */}
            <div class="space-y-1.5">
              <span class="text-xs text-slate-300 font-medium">Evaluation Prompt:</span>
              <textarea
                rows={3}
                value={customTestPrompt()}
                onInput={(e) => setCustomTestPrompt(e.target.value)}
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-sans"
              ></textarea>
            </div>

            {/* Run Button */}
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
                    <span>Run Simulated Benchmark &amp; Impact Analysis</span>
                  </>
                }
              >
                <RefreshCw class="w-4 h-4 animate-spin" />
                <span>Running Synthetic Benchmark...</span>
              </Show>
            </button>

            {/* Simulation Comparison Results Card */}
            <Show
              when={simulationResult()}
              fallback={
                <div class="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
                  Click &ldquo;Run Simulated Benchmark&rdquo; to test your parameter adjustments against synthetic queries before deploying.
                </div>
              }
            >
              {(() => {
                const res = simulationResult();
                return (
                  <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div class="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                      <span>Projected Operational Impact</span>
                      <span class="text-[10px] text-emerald-400 font-mono">Simulated n=1000 runs</span>
                    </div>

                    {/* Metric 1: Hallucination Risk Delta */}
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

                    {/* Metric 2: Reprompt Frequency Delta */}
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

                    {/* Metric 3: Time to Result (Latency) */}
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

                    {/* Metric 4: Token Efficiency */}
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
                onClick={handleApplyConfig}
                class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Save class="w-4 h-4" />
                <span>Deploy Parameters to Live Fleet</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                class="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Reset to Current Presets</span>
              </button>
            </div>
          </div>

          {/* Quick Help Guide */}
          <div class="glass-panel rounded-2xl p-4 space-y-2 text-xs text-slate-400">
            <div class="flex items-center gap-2 text-slate-300 font-semibold">
              <Info class="w-4 h-4 text-brand-400" />
              <span>Optimization Guidance for NovaSmart</span>
            </div>
            <p class="leading-relaxed text-[11px]">
              For agents handling numeric prices or catalog discount codes (such as the <strong>Promo Strategy Agent</strong>), set Temperature &le; 0.2 and Grounding Mode to <strong>Strict</strong>. This enforces direct competitor database validation and eradicates unauthorized discounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
