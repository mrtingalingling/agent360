import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
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
  TrendingDown,
  TrendingUp,
  Coins,
  Clock,
  Code,
  Zap,
  Info
} from 'lucide-react';

export function AgentFineTuneView() {
  const {
    agents,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    updateAgentFineTuneConfig,
    runBenchmarkSimulation
  } = useDashboard();

  // Local draft configuration state
  const [draftConfig, setDraftConfig] = useState({ ...selectedAgent.fineTuneConfig });
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [customTestPrompt, setCustomTestPrompt] = useState(
    'Calculate promotional bundle for SKU-9014 with 20% loyalty markdown and verify inventory in regional warehouse'
  );

  // Sync draft config when selected agent changes
  useEffect(() => {
    setDraftConfig({ ...selectedAgent.fineTuneConfig });
    setSimulationResult(null);
  }, [selectedAgentId, selectedAgent]);

  const handleSliderChange = (field, value) => {
    setDraftConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const result = runBenchmarkSimulation(selectedAgent.id, draftConfig);
      setSimulationResult(result);
      setIsSimulating(false);
    }, 600);
  };

  const handleApplyConfig = () => {
    updateAgentFineTuneConfig(selectedAgent.id, draftConfig);
    // Auto-run simulation to show updated stats
    const result = runBenchmarkSimulation(selectedAgent.id, draftConfig);
    setSimulationResult(result);
  };

  const handleResetDefaults = () => {
    setDraftConfig({ ...selectedAgent.fineTuneConfig });
    setSimulationResult(null);
  };

  // Temperature risk assessment
  const getTemperatureBadge = (temp) => {
    if (temp <= 0.2) {
      return (
        <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> High Grounding (Minimal Hallucination Risk)
        </span>
      );
    } else if (temp <= 0.45) {
      return (
        <span className="text-sky-400 font-semibold text-[11px] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Balanced Enterprise Reasoning
        </span>
      );
    } else {
      return (
        <span className="text-rose-400 font-semibold text-[11px] flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> Elevated Hallucination Risk!
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Selector Header */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-400" />
                Agent Fine-Tuning &amp; Guardrail Configuration Console
              </h2>
              <span className="px-2 py-0.5 text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full font-semibold">
                Parameter Optimization
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Adjust model checkpoints, sampling temperatures, grounding guardrails, and reprompting loop policies to eliminate hallucinations.
            </p>
          </div>

          {/* Agent Picker Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Target Agent:</span>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-brand-500"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Agent Quick Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedAgent.color }}
            />
            <span className="font-bold text-slate-200">{selectedAgent.name}</span>
            <span className="text-slate-400 font-mono">Current Model: {selectedAgent.model}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">
              Current Hallucination:{' '}
              <span className={`font-mono font-bold ${selectedAgent.errors.hallucinationRate > 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                {selectedAgent.errors.hallucinationRate}%
              </span>
            </span>
            <span className="text-slate-400">
              Current Reprompt:{' '}
              <span className={`font-mono font-bold ${selectedAgent.errors.repromptRate > 8 ? 'text-orange-400' : 'text-slate-200'}`}>
                {selectedAgent.errors.repromptRate}%
              </span>
            </span>
            <span className="text-slate-400">
              Grounding Score:{' '}
              <span className="font-mono font-bold text-emerald-400">
                {(selectedAgent.errors.groundingScore * 100).toFixed(0)}%
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Form: Controls & Benchmark Test Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Sliders & Toggles (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Model Architecture & Checkpoint */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-3.5 h-3.5 text-brand-400" />
              1. Foundation Model Architecture &amp; Checkpoint
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSliderChange('model', m.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    draftConfig.model === m.id
                      ? 'bg-brand-500/10 border-brand-500 ring-1 ring-brand-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{m.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Sampling Hyperparameters */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-brand-400" />
                2. Sampling Hyperparameters
              </h3>
              {getTemperatureBadge(draftConfig.temperature)}
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Temperature (Randomness vs Factuality)</span>
                <span className="font-mono font-bold text-brand-400">{draftConfig.temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={draftConfig.temperature}
                onChange={(e) => handleSliderChange('temperature', parseFloat(e.target.value))}
                className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.0 (Strictly Deterministic)</span>
                <span>0.5 (Balanced)</span>
                <span>1.0 (Highly Creative)</span>
              </div>
            </div>

            {/* Top-P and Top-K Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Top-P (Nucleus Sampling)</span>
                  <span className="font-mono font-bold text-slate-200">{draftConfig.topP}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={draftConfig.topP}
                  onChange={(e) => handleSliderChange('topP', parseFloat(e.target.value))}
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
                  onChange={(e) => handleSliderChange('maxOutputTokens', parseInt(e.target.value))}
                  className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Grounding & Hallucination Prevention Shield */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              3. Grounding Verification &amp; Hallucination Shield
            </h3>

            {/* Grounding Mode Radios */}
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-medium block">Grounding Mode:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'strict', label: 'Strict (100% Grounded)', desc: 'Blocks any claim without direct DB citation' },
                  { id: 'balanced', label: 'Balanced (Contextual)', desc: 'Enforces citations on prices & catalog facts' },
                  { id: 'permissive', label: 'Permissive (High Risk)', desc: 'Standard self-consistency validation' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleSliderChange('groundingMode', mode.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      draftConfig.groundingMode === mode.id
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold block">{mode.label}</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-1">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hallucination Intercept Threshold Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Hallucination Intercept Threshold</span>
                <span className="font-mono font-bold text-rose-400">{(draftConfig.hallucinationThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.99"
                step="0.01"
                value={draftConfig.hallucinationThreshold}
                onChange={(e) => handleSliderChange('hallucinationThreshold', parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Responses with confidence score below this threshold are intercepted before client delivery.
              </span>
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="font-medium text-slate-200 block">Require Direct Source Citations</span>
                <span className="text-[11px] text-slate-400">Append BigQuery/catalog row IDs to verified responses</span>
              </div>
              <input
                type="checkbox"
                checked={draftConfig.requireCitations}
                onChange={(e) => handleSliderChange('requireCitations', e.target.checked)}
                className="w-4 h-4 accent-brand-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 4: Reprompting Loop Policy */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
              4. Reprompting &amp; Self-Correction Strategy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Max Reprompt Attempts</span>
                  <span className="font-mono font-bold text-orange-400">{draftConfig.maxReprompts} loops</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={draftConfig.maxReprompts}
                  onChange={(e) => handleSliderChange('maxReprompts', parseInt(e.target.value))}
                  className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-300 font-medium block">Reprompt Error Mode:</span>
                <select
                  value={draftConfig.repromptStrategy}
                  onChange={(e) => handleSliderChange('repromptStrategy', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 font-medium"
                >
                  <option value="schema-reminder">Structured JSON Schema Reminder</option>
                  <option value="chain-of-thought">Chain-of-Thought Backtrack</option>
                  <option value="deterministic-fallback">Deterministic Human Fallback</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: System Instruction Editor */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-brand-400" />
                5. System Instructions &amp; Guardrail Directives
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                {draftConfig.systemPrompt.length} chars
              </span>
            </div>

            <textarea
              rows={4}
              value={draftConfig.systemPrompt}
              onChange={(e) => handleSliderChange('systemPrompt', e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Benchmark Simulation & Production Deployment (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Simulation Test Bench */}
          <div className="glass-panel rounded-2xl p-5 border-brand-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  Interactive Benchmark Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test draft tuning parameters against historical query workloads
                </p>
              </div>
            </div>

            {/* Test Prompt Input */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-300 font-medium">Evaluation Prompt:</span>
              <textarea
                rows={3}
                value={customTestPrompt}
                onChange={(e) => setCustomTestPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-sans"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Synthetic Benchmark...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Run Simulated Benchmark &amp; Impact Analysis
                </>
              )}
            </button>

            {/* Simulation Comparison Results Card */}
            {simulationResult ? (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                  <span>Projected Operational Impact</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Simulated n=1000 runs</span>
                </div>

                {/* Metric 1: Hallucination Risk Delta */}
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

                {/* Metric 2: Reprompt Frequency Delta */}
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

                {/* Metric 3: Time to Result (Latency) */}
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

                {/* Metric 4: Token Efficiency */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" /> Tokens / Query:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 line-through">
                      {simulationResult.before.tokenPerQuery}
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {simulationResult.after.tokenPerQuery}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
                Click &ldquo;Run Simulated Benchmark&rdquo; to test your parameter adjustments against synthetic queries before deploying.
              </div>
            )}

            {/* Action Buttons: Deploy to Fleet & Reset */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={handleApplyConfig}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" />
                Deploy Parameters to Live Fleet
              </button>

              <button
                onClick={handleResetDefaults}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Current Presets
              </button>
            </div>
          </div>

          {/* Quick Help Guide */}
          <div className="glass-panel rounded-2xl p-4 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Info className="w-4 h-4 text-brand-400" />
              Optimization Guidance for NovaSmart
            </div>
            <p className="leading-relaxed text-[11px]">
              For agents handling numeric prices or catalog discount codes (such as the <strong>Promo Strategy Agent</strong>), set Temperature &le; 0.2 and Grounding Mode to <strong>Strict</strong>. This enforces direct competitor database validation and eradicates unauthorized discounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
