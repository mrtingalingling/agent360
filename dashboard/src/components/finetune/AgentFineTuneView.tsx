import { component$, useSignal, useContext, $ } from '@builder.io/qwik';
import { DashboardContext } from '../../state/dashboardState';
import {
  Sliders,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Play,
  RotateCcw,
  Save,
  CheckCircle2,
  Clock,
  Coins,
  Info
} from '../common/Icons';

export const AgentFineTuneView = component$(() => {
  const state = useContext(DashboardContext);
  const agents = state.agents;
  const selectedAgent = state.selectedAgent;

  const draftConfig = useSignal<any>({ ...(selectedAgent?.fineTuneConfig || {}) });
  const simulationResult = useSignal<any>(null);
  const isSimulating = useSignal(false);
  const customTestPrompt = useSignal(
    'Calculate promotional bundle for SKU-9014 with 20% loyalty markdown and verify inventory in regional warehouse'
  );

  const handleSliderChange = $((field: string, value: any) => {
    draftConfig.value = {
      ...draftConfig.value,
      [field]: value
    };
  });

  const handleRunSimulation = $(() => {
    isSimulating.value = true;
    setTimeout(() => {
      const ag = state.selectedAgent;
      if (ag) {
        const result = state.runBenchmarkSimulation(ag.id, draftConfig.value);
        simulationResult.value = result;
      }
      isSimulating.value = false;
    }, 600);
  });

  const handleApplyConfig = $(() => {
    const ag = state.selectedAgent;
    if (ag) {
      state.updateAgentFineTuneConfig(ag.id, draftConfig.value);
      const result = state.runBenchmarkSimulation(ag.id, draftConfig.value);
      simulationResult.value = result;
    }
  });

  const handleResetDefaults = $(() => {
    const ag = state.selectedAgent;
    if (ag) {
      draftConfig.value = { ...ag.fineTuneConfig };
      simulationResult.value = null;
    }
  });

  return (
    <div class="space-y-6">
      {/* Agent Selector Header */}
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <Sliders class="w-4 h-4 text-sky-400" />
              <h2 class="text-base font-bold text-white tracking-tight">
                Agent Fine-Tuning &amp; Guardrail Configuration Console
              </h2>
              <span class="px-2 py-0.5 text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full font-semibold">
                Parameter Optimization
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Adjust model checkpoints, sampling temperatures, grounding guardrails, and reprompting loop policies to eliminate hallucinations.
            </p>
          </div>

          {/* Agent Picker Dropdown */}
          <div class="flex items-center gap-2">
            <label class="text-xs text-slate-400 font-medium">Target Agent:</label>
            <select
              value={state.selectedAgentId}
              onChange$={$((e: Event) => {
                const targetId = (e.target as HTMLSelectElement).value;
                state.setSelectedAgentId(targetId);
                const ag = state.agents.find((a: any) => a.id === targetId);
                if (ag) {
                  draftConfig.value = { ...ag.fineTuneConfig };
                  simulationResult.value = null;
                }
              })}
              class="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 font-medium focus:outline-hidden focus:border-sky-500"
            >
              {agents.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Agent Quick Status Banner */}
        {selectedAgent && (
          <div class="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs">
            <div class="flex items-center gap-3">
              <span
                class="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedAgent.color }}
              ></span>
              <span class="font-bold text-slate-200">{selectedAgent.name}</span>
              <span class="text-slate-400 font-mono">Current Model: {selectedAgent.model}</span>
            </div>
            <div class="flex items-center gap-4 text-[11px]">
              <span class="text-slate-400">
                Current Hallucination:{' '}
                <span
                  class={`font-mono font-bold ${
                    selectedAgent.errors?.hallucinationRate > 5 ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {selectedAgent.errors?.hallucinationRate}%
                </span>
              </span>
              <span class="text-slate-400">
                Current Reprompt:{' '}
                <span
                  class={`font-mono font-bold ${
                    selectedAgent.errors?.repromptRate > 8 ? 'text-orange-400' : 'text-slate-200'
                  }`}
                >
                  {selectedAgent.errors?.repromptRate}%
                </span>
              </span>
              <span class="text-slate-400">
                Grounding Score:{' '}
                <span class="font-mono font-bold text-emerald-400">
                  {((selectedAgent.errors?.groundingScore || 0) * 100).toFixed(0)}%
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Form: Controls & Benchmark Test Bench */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Sliders & Toggles (7 cols) */}
        <div class="lg:col-span-7 space-y-5">
          {/* Section 1: Model Architecture & Checkpoint */}
          <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu class="w-3.5 h-3.5 text-sky-400" />
              1. Foundation Model Architecture &amp; Checkpoint
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'gemini-1.5-flash',
                  name: 'Gemini 1.5 Flash',
                  desc: 'Sub-second latency, lightweight, high cost efficiency',
                  badge: 'Recommended for High QPS'
                },
                {
                  id: 'gemini-1.5-pro',
                  name: 'Gemini 1.5 Pro',
                  desc: 'Deep multi-step reasoning, complex structured output',
                  badge: 'Complex Workflows'
                },
                {
                  id: 'gemini-2.0-flash',
                  name: 'Gemini 2.0 Flash (Preview)',
                  desc: 'Next-gen multimodal, native tool calling speed',
                  badge: 'Ultra Fast'
                },
                {
                  id: 'gemini-1.5-pro-tuned-v2',
                  name: 'NovaSmart Fine-Tuned LoRA v2',
                  desc: 'Domain-adapted on NovaSmart pricing & catalog telemetry',
                  badge: 'Domain Specific'
                }
              ].map((m: any) => (
                <button
                  key={m.id}
                  type="button"
                  onClick$={$(() => {
                    handleSliderChange('model', m.id);
                  })}
                  class={`p-3 rounded-xl border text-left transition-all ${
                    draftConfig.value.model === m.id
                      ? 'bg-sky-500/10 border-sky-500 ring-1 ring-sky-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold">{m.name}</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {m.badge}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 leading-tight">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Sampling Hyperparameters */}
          <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sliders class="w-3.5 h-3.5 text-sky-400" />
                2. Sampling Hyperparameters
              </h3>
              {draftConfig.value.temperature <= 0.2 ? (
                <span class="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                  <ShieldCheck class="w-3.5 h-3.5" /> High Grounding (Minimal Hallucination Risk)
                </span>
              ) : draftConfig.value.temperature <= 0.45 ? (
                <span class="text-sky-400 font-semibold text-[11px] flex items-center gap-1">
                  <CheckCircle2 class="w-3.5 h-3.5" /> Balanced Enterprise Reasoning
                </span>
              ) : (
                <span class="text-rose-400 font-semibold text-[11px] flex items-center gap-1">
                  <AlertTriangle class="w-3.5 h-3.5" /> Elevated Hallucination Risk!
                </span>
              )}
            </div>

            {/* Temperature Slider */}
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-300 font-medium">Temperature (Randomness vs Factuality)</span>
                <span class="font-mono font-bold text-sky-400">{draftConfig.value.temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={draftConfig.value.temperature ?? 0.2}
                onInput$={$((e: Event) => {
                  handleSliderChange('temperature', parseFloat((e.target as HTMLInputElement).value));
                })}
                class="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
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
                  <span class="font-mono font-bold text-slate-200">{draftConfig.value.topP}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={draftConfig.value.topP ?? 0.8}
                  onInput$={$((e: Event) => {
                    handleSliderChange('topP', parseFloat((e.target as HTMLInputElement).value));
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
                    handleSliderChange('maxOutputTokens', parseInt((e.target as HTMLInputElement).value, 10));
                  })}
                  class="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Grounding & Hallucination Prevention Shield */}
          <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
              3. Grounding Verification &amp; Hallucination Shield
            </h3>

            {/* Grounding Mode Buttons */}
            <div class="space-y-2">
              <span class="text-xs text-slate-300 font-medium block">Grounding Mode:</span>
              <div class="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'strict',
                    label: 'Strict (100% Grounded)',
                    desc: 'Blocks any claim without direct DB citation'
                  },
                  {
                    id: 'balanced',
                    label: 'Balanced (Contextual)',
                    desc: 'Enforces citations on prices & catalog facts'
                  },
                  {
                    id: 'permissive',
                    label: 'Permissive (High Risk)',
                    desc: 'Standard self-consistency validation'
                  }
                ].map((mode: any) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick$={$(() => {
                      handleSliderChange('groundingMode', mode.id);
                    })}
                    class={`p-2.5 rounded-xl border text-left transition-all ${
                      draftConfig.value.groundingMode === mode.id
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span class="text-xs font-bold block">{mode.label}</span>
                    <span class="text-[10px] text-slate-500 leading-tight block mt-1">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hallucination Intercept Threshold Slider */}
            <div class="space-y-1.5 pt-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-300 font-medium">Hallucination Intercept Threshold</span>
                <span class="font-mono font-bold text-rose-400">
                  {((draftConfig.value.hallucinationThreshold || 0.8) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.99"
                step="0.01"
                value={draftConfig.value.hallucinationThreshold ?? 0.85}
                onInput$={$((e: Event) => {
                  handleSliderChange('hallucinationThreshold', parseFloat((e.target as HTMLInputElement).value));
                })}
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
                checked={draftConfig.value.requireCitations || false}
                onChange$={$((e: Event) => {
                  handleSliderChange('requireCitations', (e.target as HTMLInputElement).checked);
                })}
                class="w-4 h-4 accent-sky-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Benchmark Simulation (5 cols) */}
        <div class="lg:col-span-5 space-y-5">
          <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Play class="w-3.5 h-3.5 text-sky-400" />
              Benchmark Simulator &amp; Impact Analysis
            </h3>

            <div class="space-y-1.5">
              <span class="text-xs text-slate-300 font-medium">Evaluation Prompt:</span>
              <textarea
                rows={3}
                value={customTestPrompt.value}
                onInput$={$((e: Event) => {
                  customTestPrompt.value = (e.target as HTMLTextAreaElement).value;
                })}
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500 font-sans"
              ></textarea>
            </div>

            {/* Run Button */}
            <button
              type="button"
              onClick$={handleRunSimulation}
              disabled={isSimulating.value}
              class="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSimulating.value ? (
                <>
                  <RefreshCw class="w-4 h-4 animate-spin" />
                  <span>Running Synthetic Benchmark...</span>
                </>
              ) : (
                <>
                  <Play class="w-4 h-4 fill-white" />
                  <span>Run Simulated Benchmark &amp; Impact Analysis</span>
                </>
              )}
            </button>

            {/* Simulation Comparison Results Card */}
            {simulationResult.value ? (
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
                      {simulationResult.value.before.hallucinationRate}%
                    </span>
                    <span class="font-mono font-bold text-emerald-400">
                      {simulationResult.value.after.hallucinationRate}%
                    </span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                      -{simulationResult.value.impact.halReduction}% Risk
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
                      {simulationResult.value.before.repromptRate}%
                    </span>
                    <span class="font-mono font-bold text-emerald-400">
                      {simulationResult.value.after.repromptRate}%
                    </span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                      -{simulationResult.value.impact.repromptReduction}% Retries
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

                {/* Metric 4: Token Efficiency */}
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
            ) : (
              <div class="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
                Click &ldquo;Run Simulated Benchmark&rdquo; to test your parameter adjustments against synthetic queries before deploying.
              </div>
            )}

            {/* Action Buttons: Deploy to Fleet & Reset */}
            <div class="pt-2 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick$={handleApplyConfig}
                class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Save class="w-4 h-4" />
                <span>Deploy Parameters to Live Fleet</span>
              </button>

              <button
                type="button"
                onClick$={handleResetDefaults}
                class="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800 cursor-pointer"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Reset to Current Presets</span>
              </button>
            </div>
          </div>

          {/* Quick Help Guide */}
          <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-400 shadow-xl backdrop-blur-md">
            <div class="flex items-center gap-2 text-slate-300 font-semibold">
              <Info class="w-4 h-4 text-sky-400" />
              <span>Optimization Guidance for NovaSmart</span>
            </div>
            <p class="leading-relaxed text-[11px]">
              For agents handling numeric prices or catalog discount codes (such as the{' '}
              <strong>Promo Strategy Agent</strong>), set Temperature &le; 0.2 and Grounding Mode to{' '}
              <strong>Strict</strong>. This enforces direct competitor database validation and eradicates unauthorized discounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
