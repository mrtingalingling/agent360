import React, { useState, useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  Zap,
  Clock,
  Sparkles,
  Layers,
  Database,
  ArrowRight,
  TrendingDown,
  Gauge,
  Info,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Coins,
  ShieldAlert,
  Server
} from 'lucide-react';

export default function TokenWaterfallTrace() {
  const { cloudWaterfall, isCloudLoading, selectedAgent } = useDashboard();
  const [selectedTurnIdx, setSelectedTurnIdx] = useState(19); // default latest turn

  const turns = cloudWaterfall?.turns || [];
  const currentTurn = turns[selectedTurnIdx] || turns[turns.length - 1] || null;

  // Macro metrics across window
  const macroStats = useMemo(() => {
    if (!turns.length) return { totalTokens: 0, cachedTokens: 0, dollarsSaved: 0, avgTtftMs: 0, avgTokensPerSec: 0, avgCacheHitRate: 0 };
    let totalTok = 0;
    let cachedTok = 0;
    let saved = 0;
    let sumTtft = 0;
    let sumTps = 0;
    let sumHitRate = 0;

    turns.forEach(t => {
      totalTok += t.tokens.totalTokens;
      cachedTok += t.tokens.cachedPromptTokens;
      saved += t.finops.dollarsSaved;
      sumTtft += t.latency.ttftLatencyMs;
      sumTps += t.finops.tokensPerSecond;
      sumHitRate += t.finops.cacheHitRate;
    });

    return {
      totalTokens: totalTok,
      cachedTokens: cachedTok,
      dollarsSaved: Number(saved.toFixed(3)),
      avgTtftMs: Math.round(sumTtft / turns.length),
      avgTokensPerSec: Number((sumTps / turns.length).toFixed(1)),
      avgCacheHitRate: Number((sumHitRate / turns.length).toFixed(1)),
    };
  }, [turns]);

  if (!turns.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
        <Server className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-pulse" />
        <p className="text-sm font-medium text-slate-700">Connecting to telemetry waterfall stream...</p>
        <p className="text-xs text-slate-400 mt-1">Collecting execution turns and TTFT prefill traces</p>
      </div>
    );
  }

  const maxLatency = Math.max(...turns.map(t => t.latency.totalLatencyMs), 1600);

  return (
    <div className="space-y-6">
      {/* SECTION HEADER WITH ATTRIBUTION & ARCHITECTURE BADGE */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                <Zap className="w-5 h-5 text-indigo-400" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Sequential Gantt Waterfall & Context Bloat Engine
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    agy_token_observability pattern
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Turn-by-turn latency decomposition (Client Prep → TTFT Server Prefill → Thinking Reasoning → Streaming Output) & Gemini Prompt Cache FinOps.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Cache Discount:</span>
            <span className="font-semibold text-emerald-400 font-mono">-$0.1125 / M tokens (75% off)</span>
          </div>
        </div>

        {/* 4 MACRO FINOPS KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-blue-400" /> Avg TTFT Server Prefill
            </div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              {macroStats.avgTtftMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingDown className="w-3 h-3" /> Sub-400ms target
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Prompt Cache Hit Rate
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {macroStats.avgCacheHitRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {(macroStats.cachedTokens / 1000).toFixed(0)}k cached tokens
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-400" /> FinOps Dollars Saved
            </div>
            <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
              +${macroStats.dollarsSaved}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Direct cache absorption credit
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Generation Velocity
            </div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              {macroStats.avgTokensPerSec} <span className="text-xs font-normal text-slate-400">tok/s</span>
            </div>
            <div className="text-[10px] text-indigo-300 mt-0.5">
              Streaming throughput speed
            </div>
          </div>
        </div>
      </div>

      {/* SEQUENTIAL GANTT WATERFALL CHART */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Turn Execution Waterfall (Sequential Latency Stages)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any turn bar below to inspect granular tokenomics and prompt context anatomy.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-sky-400 inline-block"></span> Client Prep
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block"></span> TTFT Prefill
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-purple-600 inline-block"></span> Thinking/Reasoning
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block"></span> Streaming Output
            </span>
          </div>
        </div>

        {/* WATERFALL GANTT ROWS */}
        <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-2">
          {turns.map((turn, idx) => {
            const isSelected = idx === selectedTurnIdx;
            const prepPct = (turn.latency.clientPrepMs / maxLatency) * 100;
            const ttftPct = (turn.latency.ttftLatencyMs / maxLatency) * 100;
            const thinkPct = (turn.latency.thinkingMs / maxLatency) * 100;
            const streamPct = (turn.latency.streamingMs / maxLatency) * 100;

            return (
              <div
                key={turn.stepIndex}
                onClick={() => setSelectedTurnIdx(idx)}
                className={`group cursor-pointer rounded-lg p-2 transition-all border ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      Turn #{turn.stepIndex}
                    </span>
                    <span className="text-slate-600 font-sans font-medium">{turn.agentName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({turn.model})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500">
                      Tokens: <strong className="text-slate-800 font-mono">{turn.tokens.totalTokens.toLocaleString()}</strong>
                    </span>
                    <span className="text-[11px] text-emerald-600">
                      Cache: <strong className="font-mono">{turn.finops.cacheHitRate}%</strong>
                    </span>
                    <span className="text-[11px] font-bold text-slate-800 font-mono">
                      {turn.latency.totalLatencySec}s
                    </span>
                  </div>
                </div>

                {/* The Horizontal Gantt Bar */}
                <div className="w-full bg-slate-100 h-4 rounded-sm overflow-hidden flex items-center relative">
                  {/* Segment 1: Client Prep */}
                  <div
                    style={{ width: `${prepPct}%` }}
                    className="h-full bg-sky-400 hover:bg-sky-500 transition-colors"
                    title={`Client Prep: ${turn.latency.clientPrepMs}ms`}
                  />
                  {/* Segment 2: TTFT Server Prefill */}
                  <div
                    style={{ width: `${ttftPct}%` }}
                    className="h-full bg-blue-600 hover:bg-blue-700 transition-colors"
                    title={`TTFT Server Prefill: ${turn.latency.ttftLatencyMs}ms`}
                  />
                  {/* Segment 3: Thinking / Reasoning */}
                  <div
                    style={{ width: `${thinkPct}%` }}
                    className="h-full bg-purple-600 hover:bg-purple-700 transition-colors"
                    title={`Thinking / Reasoning: ${turn.latency.thinkingMs}ms (${turn.tokens.thinkingTokens} tokens)`}
                  />
                  {/* Segment 4: Streaming Output */}
                  <div
                    style={{ width: `${streamPct}%` }}
                    className="h-full bg-amber-500 hover:bg-amber-600 transition-colors"
                    title={`Streaming Output: ${turn.latency.streamingMs}ms (${turn.tokens.contentTokens} tokens)`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Turn Selector Navigation Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={() => setSelectedTurnIdx(prev => Math.max(0, prev - 1))}
            disabled={selectedTurnIdx === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-medium"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous Turn
          </button>
          <span className="font-mono text-slate-600">
            Inspecting Turn <strong className="text-slate-900 font-bold">{selectedTurnIdx + 1}</strong> of {turns.length}
          </span>
          <button
            onClick={() => setSelectedTurnIdx(prev => Math.min(turns.length - 1, prev + 1))}
            disabled={selectedTurnIdx === turns.length - 1}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-medium"
          >
            Next Turn <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SELECTED TURN DEEP DIVE INSPECTION PANEL */}
      {currentTurn && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: Context Window Bloat & Gemini Cache Absorption */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Context Window Bloat & Saturation
                  </h4>
                </div>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Turn #{currentTurn.stepIndex}
                </span>
              </div>

              {/* Progress gauge for 1M context limit */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Prompt Size / 1M Limit:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {currentTurn.tokens.totalPromptTokens.toLocaleString()} / 1,048,576 tokens
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  {/* Cached Portion */}
                  <div
                    style={{ width: `${(currentTurn.tokens.cachedPromptTokens / 1048576) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Cached Prompt: ${currentTurn.tokens.cachedPromptTokens.toLocaleString()} tokens`}
                  />
                  {/* New Prompt Portion */}
                  <div
                    style={{ width: `${(currentTurn.tokens.uncachedPromptTokens / 1048576) * 100}%` }}
                    className="bg-blue-600 h-full"
                    title={`New Prompt: ${currentTurn.tokens.uncachedPromptTokens.toLocaleString()} tokens`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span className="text-emerald-600 font-medium">
                    ● {(currentTurn.tokens.cachedPromptTokens / 1000).toFixed(0)}k Cached ({currentTurn.finops.cacheHitRate}%)
                  </span>
                  <span className="text-blue-600 font-medium">
                    ● {(currentTurn.tokens.uncachedPromptTokens / 1000).toFixed(1)}k New Prompt
                  </span>
                  <span className="font-mono text-slate-500">
                    {currentTurn.finops.contextSaturationPct}% Saturation
                  </span>
                </div>
              </div>

              {/* Token Anatomy Breakdown */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Thinking / Reasoning:</span>
                  <span className="text-sm font-bold font-mono text-purple-700">
                    {currentTurn.tokens.thinkingTokens.toLocaleString()} tokens
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {currentTurn.latency.thinkingMs}ms execution
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Output Content:</span>
                  <span className="text-sm font-bold font-mono text-amber-600">
                    {currentTurn.tokens.contentTokens.toLocaleString()} tokens
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {currentTurn.latency.streamingMs}ms execution
                  </span>
                </div>
              </div>
            </div>

            {/* FinOps Cache Discount Callout */}
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <Coins className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Prompt Cache Savings Applied:</span> Reused {currentTurn.tokens.cachedPromptTokens.toLocaleString()} cached tokens, saving <strong className="text-emerald-700">${currentTurn.finops.dollarsSaved}</strong> on this turn alone. Net turn cost: <strong className="font-mono">${currentTurn.finops.netCostUsd}</strong> (vs ${currentTurn.finops.rawCostUsd} raw).
              </div>
            </div>
          </div>

          {/* RIGHT: Granular Latency Decomposition */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Stage-by-Stage Latency Breakdown
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Velocity: {currentTurn.finops.tokensPerSecond} tok/s
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. Client Prep */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-sky-50/50 border border-sky-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    <span className="font-medium text-slate-700">1. Client Prep (Local Agent Runtime)</span>
                  </div>
                  <span className="font-mono font-bold text-sky-800">
                    {currentTurn.latency.clientPrepMs} ms
                  </span>
                </div>

                {/* 2. TTFT Server Prefill */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span className="font-medium text-slate-700">2. TTFT Server Prefill (Context Ingestion)</span>
                  </div>
                  <span className="font-mono font-bold text-blue-800">
                    {currentTurn.latency.ttftLatencyMs} ms
                  </span>
                </div>

                {/* 3. Thinking Reasoning */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/50 border border-purple-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span className="font-medium text-slate-700">3. Thinking / Reasoning Duration (Flash Thinking)</span>
                  </div>
                  <span className="font-mono font-bold text-purple-800">
                    {currentTurn.latency.thinkingMs} ms
                  </span>
                </div>

                {/* 4. Streaming Output */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="font-medium text-slate-700">4. Streaming Output Duration</span>
                  </div>
                  <span className="font-mono font-bold text-amber-800">
                    {currentTurn.latency.streamingMs} ms
                  </span>
                </div>
              </div>
            </div>

            {/* Total Latency Sum */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Total Turn Time-to-Result (TTR):</span>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-slate-900">
                  {currentTurn.latency.totalLatencySec}s
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  ({currentTurn.latency.totalLatencyMs} ms cumulative)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
