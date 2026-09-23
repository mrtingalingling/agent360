import { track } from 'ripple';
import { dashboardState } from '../../state/dashboardState.js';
import {
  ZapIcon,
  ClockIcon,
  SparklesIcon,
  DatabaseIcon,
  TrendingDownIcon,
  GaugeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CpuIcon,
  CoinsIcon,
  ServerIcon
} from '../common/Icons.tsrx';

export function TokenWaterfallTrace() @{
  const cloudWaterfall = () => dashboardState.cloudWaterfall;
  const turns = () => cloudWaterfall()?.turns || [];

  const selectedTurnIdx = track(19);

  const currentTurn = () => {
    const list = turns();
    if (!list.length) return null;
    const idx = selectedTurnIdx.value;
    return list[idx] || list[list.length - 1] || null;
  };

  const macroStats = () => {
    const list = turns();
    if (!list.length) return { totalTokens: 0, cachedTokens: 0, dollarsSaved: 0, avgTtftMs: 0, avgTokensPerSec: 0, avgCacheHitRate: 0 };
    let totalTok = 0;
    let cachedTok = 0;
    let saved = 0;
    let sumTtft = 0;
    let sumTps = 0;
    let sumHitRate = 0;

    list.forEach((t: any) => {
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
      avgTtftMs: Math.round(sumTtft / list.length),
      avgTokensPerSec: Number((sumTps / list.length).toFixed(1)),
      avgCacheHitRate: Number((sumHitRate / list.length).toFixed(1)),
    };
  };

  const maxLatency = () => {
    const list = turns();
    return list.length ? Math.max(...list.map((t: any) => t.latency.totalLatencyMs), 1600) : 1600;
  };

  @if (turns().length === 0) {
    <div class="glass-panel rounded-2xl p-8 text-center border border-slate-800">
      <ServerIcon class="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-pulse" />
      <p class="text-sm font-medium text-slate-200">Connecting to telemetry waterfall stream...</p>
      <p class="text-xs text-slate-400 mt-1">Collecting execution turns and TTFT prefill traces</p>
    </div>
  } @else {
    <div class="space-y-6">
      {/* SECTION HEADER WITH ATTRIBUTION & ARCHITECTURE BADGE */}
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-md border border-slate-800">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                <ZapIcon class="w-5 h-5 text-indigo-400" />
              </span>
              <div>
                <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Sequential Gantt Waterfall & Context Bloat Engine
                  <span class="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    agy_token_observability pattern
                  </span>
                </h3>
                <p class="text-xs text-slate-300 mt-0.5">
                  Turn-by-turn latency decomposition (Client Prep {"→"} TTFT Server Prefill {"→"} Thinking Reasoning {"→"} Streaming Output) & Gemini Prompt Cache FinOps.
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <CoinsIcon class="w-4 h-4 text-emerald-400" />
            <span class="text-slate-300">Cache Discount:</span>
            <span class="font-semibold text-emerald-400 font-mono">-$0.1125 / M tokens (75% off)</span>
          </div>
        </div>

        {/* 4 MACRO FINOPS KPI CARDS */}
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div class="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
            <div class="text-[11px] text-slate-400 flex items-center gap-1">
              <GaugeIcon class="w-3.5 h-3.5 text-blue-400" /> Avg TTFT Server Prefill
            </div>
            <div class="text-lg font-bold font-mono text-white mt-0.5">
              {macroStats().avgTtftMs} <span class="text-xs font-normal text-slate-400">ms</span>
            </div>
            <div class="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingDownIcon class="w-3 h-3" /> Sub-400ms target
            </div>
          </div>

          <div class="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
            <div class="text-[11px] text-slate-400 flex items-center gap-1">
              <SparklesIcon class="w-3.5 h-3.5 text-purple-400" /> Prompt Cache Hit Rate
            </div>
            <div class="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {macroStats().avgCacheHitRate}%
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">
              {(macroStats().cachedTokens / 1000).toFixed(0)}k cached tokens
            </div>
          </div>

          <div class="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
            <div class="text-[11px] text-slate-400 flex items-center gap-1">
              <CoinsIcon class="w-3.5 h-3.5 text-emerald-400" /> FinOps Dollars Saved
            </div>
            <div class="text-lg font-bold font-mono text-emerald-300 mt-0.5">
              +${macroStats().dollarsSaved}
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">
              Direct cache absorption credit
            </div>
          </div>

          <div class="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
            <div class="text-[11px] text-slate-400 flex items-center gap-1">
              <ZapIcon class="w-3.5 h-3.5 text-amber-400" /> Generation Velocity
            </div>
            <div class="text-lg font-bold font-mono text-white mt-0.5">
              {macroStats().avgTokensPerSec} <span class="text-xs font-normal text-slate-400">tok/s</span>
            </div>
            <div class="text-[10px] text-indigo-300 mt-0.5">
              Streaming throughput speed
            </div>
          </div>
        </div>
      </div>

      {/* SEQUENTIAL GANTT WATERFALL CHART */}
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClockIcon class="w-4 h-4 text-indigo-600" />
              Turn Execution Waterfall (Sequential Latency Stages)
            </h4>
            <p class="text-xs text-slate-500 mt-0.5">
              Click any turn bar below to inspect granular tokenomics and prompt context anatomy.
            </p>
          </div>

          {/* Color Legend */}
          <div class="flex flex-wrap items-center gap-3 text-xs">
            <span class="flex items-center gap-1.5 text-slate-600">
              <span class="w-3 h-3 rounded-xs bg-sky-400 inline-block"></span> Client Prep
            </span>
            <span class="flex items-center gap-1.5 text-slate-600">
              <span class="w-3 h-3 rounded-xs bg-blue-600 inline-block"></span> TTFT Prefill
            </span>
            <span class="flex items-center gap-1.5 text-slate-600">
              <span class="w-3 h-3 rounded-xs bg-purple-600 inline-block"></span> Thinking/Reasoning
            </span>
            <span class="flex items-center gap-1.5 text-slate-600">
              <span class="w-3 h-3 rounded-xs bg-amber-500 inline-block"></span> Streaming Output
            </span>
          </div>
        </div>

        {/* WATERFALL GANTT ROWS */}
        <div class="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-2">
          @for (let turn of turns(); index idx) {
            <div
              onClick={() => { selectedTurnIdx.value = idx; }}
              class={`group cursor-pointer rounded-lg p-2 transition-all border ${
                idx === selectedTurnIdx.value
                  ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20"
                  : "hover:bg-slate-50 border-slate-100 hover:border-slate-200"
              }`}
            >
              <div class="flex items-center justify-between text-xs mb-1.5 font-mono">
                <div class="flex items-center gap-2">
                  <span class={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    idx === selectedTurnIdx.value ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    Turn #{turn.stepIndex}
                  </span>
                  <span class="text-slate-600 font-sans font-medium">{turn.agentName}</span>
                  <span class="text-[10px] text-slate-400 font-mono">({turn.model})</span>
                </div>

                <div class="flex items-center gap-3">
                  <span class="text-[11px] text-slate-500">
                    Tokens: <strong class="text-slate-800 font-mono">{turn.tokens.totalTokens.toLocaleString()}</strong>
                  </span>
                  <span class="text-[11px] text-emerald-600">
                    Cache: <strong class="font-mono">{turn.finops.cacheHitRate}%</strong>
                  </span>
                  <span class="text-[11px] font-bold text-slate-800 font-mono">
                    {turn.latency.totalLatencySec}s
                  </span>
                </div>
              </div>

              {/* Gantt Bar */}
              <div class="w-full bg-slate-100 h-4 rounded-xs overflow-hidden flex items-center relative">
                <div
                  style={{ width: `${(turn.latency.clientPrepMs / maxLatency()) * 100}%` }}
                  class="h-full bg-sky-400 hover:bg-sky-500 transition-colors"
                  title={`Client Prep: ${turn.latency.clientPrepMs}ms`}
                ></div>
                <div
                  style={{ width: `${(turn.latency.ttftLatencyMs / maxLatency()) * 100}%` }}
                  class="h-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  title={`TTFT Server Prefill: ${turn.latency.ttftLatencyMs}ms`}
                ></div>
                <div
                  style={{ width: `${(turn.latency.thinkingMs / maxLatency()) * 100}%` }}
                  class="h-full bg-purple-600 hover:bg-purple-700 transition-colors"
                  title={`Reasoning: ${turn.latency.thinkingMs}ms`}
                ></div>
                <div
                  style={{ width: `${(turn.latency.streamingMs / maxLatency()) * 100}%` }}
                  class="h-full bg-amber-500 hover:bg-amber-600 transition-colors"
                  title={`Streaming: ${turn.latency.streamingMs}ms`}
                ></div>
              </div>
            </div>
          }
        </div>
      </div>

      {/* SELECTED TURN DEEP DIVE INSPECTION PANEL */}
      @if (currentTurn()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: Context Window Bloat */}
          <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <DatabaseIcon class="w-4 h-4 text-purple-600" />
                  <h4 class="text-sm font-bold text-slate-900">
                    Context Window Bloat &amp; Saturation
                  </h4>
                </div>
                <span class="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Turn #{currentTurn().stepIndex}
                </span>
              </div>

              {/* Context Saturation Gauge Bar */}
              <div class="space-y-1.5 mt-4">
                <div class="flex justify-between text-xs">
                  <span class="font-medium text-slate-700">Prompt Context Window Depth (1M Capacity):</span>
                  <span class="font-mono font-bold text-slate-900">
                    {currentTurn().tokens.totalPromptTokens.toLocaleString()} / 1,048,576 tokens
                  </span>
                </div>
                <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(currentTurn().tokens.cachedPromptTokens / 1048576) * 100}%` }}
                    class="bg-emerald-500 h-full"
                    title={`Cached Prompt: ${currentTurn().tokens.cachedPromptTokens.toLocaleString()} tokens`}
                  ></div>
                  <div
                    style={{ width: `${(currentTurn().tokens.uncachedPromptTokens / 1048576) * 100}%` }}
                    class="bg-blue-600 h-full"
                    title={`New Prompt: ${currentTurn().tokens.uncachedPromptTokens.toLocaleString()} tokens`}
                  ></div>
                </div>
                <div class="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span class="text-emerald-600 font-medium">
                    {"•"} {(currentTurn().tokens.cachedPromptTokens / 1000).toFixed(0)}k Cached ({currentTurn().finops.cacheHitRate}%)
                  </span>
                  <span class="text-blue-600 font-medium">
                    {"•"} {(currentTurn().tokens.uncachedPromptTokens / 1000).toFixed(1)}k New Prompt
                  </span>
                  <span class="font-mono text-slate-500">
                    {currentTurn().finops.contextSaturationPct}% Saturation
                  </span>
                </div>
              </div>

              {/* Token Anatomy Breakdown */}
              <div class="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span class="text-slate-500 block text-[11px]">Thinking / Reasoning:</span>
                  <span class="text-sm font-bold font-mono text-purple-700">
                    {currentTurn().tokens.thinkingTokens.toLocaleString()} tokens
                  </span>
                  <span class="text-[10px] text-slate-400 block mt-0.5">
                    {currentTurn().latency.thinkingMs}ms execution
                  </span>
                </div>

                <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span class="text-slate-500 block text-[11px]">Output Content:</span>
                  <span class="text-sm font-bold font-mono text-amber-600">
                    {currentTurn().tokens.contentTokens.toLocaleString()} tokens
                  </span>
                  <span class="text-[10px] text-slate-400 block mt-0.5">
                    {currentTurn().latency.streamingMs}ms execution
                  </span>
                </div>
              </div>
            </div>

            {/* FinOps Cache Discount Callout */}
            <div class="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <CoinsIcon class="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span class="font-bold">Prompt Cache Savings Applied:</span> Reused {currentTurn().tokens.cachedPromptTokens.toLocaleString()} cached tokens, saving <strong class="text-emerald-700">${currentTurn().finops.dollarsSaved}</strong> on this turn alone. Net turn cost: <strong class="font-mono">${currentTurn().finops.netCostUsd}</strong> (vs ${currentTurn().finops.rawCostUsd} raw).
              </div>
            </div>
          </div>

          {/* RIGHT: Latency Breakdown */}
          <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <CpuIcon class="w-4 h-4 text-indigo-600" />
                  <h4 class="text-sm font-bold text-slate-900">
                    Stage-by-Stage Latency Breakdown
                  </h4>
                </div>
                <span class="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Velocity: {currentTurn().finops.tokensPerSecond} tok/s
                </span>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between p-2.5 rounded-lg bg-sky-50/50 border border-sky-100 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    <span class="font-medium text-slate-700">1. Client Prep (Local Agent Runtime)</span>
                  </div>
                  <span class="font-mono font-bold text-sky-800">
                    {currentTurn().latency.clientPrepMs} ms
                  </span>
                </div>

                <div class="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span class="font-medium text-slate-700">2. TTFT Server Prefill (Context Ingestion)</span>
                  </div>
                  <span class="font-mono font-bold text-blue-800">
                    {currentTurn().latency.ttftLatencyMs} ms
                  </span>
                </div>

                <div class="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/50 border border-purple-100 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span class="font-medium text-slate-700">3. Thinking / Reasoning Duration (Flash Thinking)</span>
                  </div>
                  <span class="font-mono font-bold text-purple-800">
                    {currentTurn().latency.thinkingMs} ms
                  </span>
                </div>

                <div class="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span class="font-medium text-slate-700">4. Streaming Output Duration</span>
                  </div>
                  <span class="font-mono font-bold text-amber-800">
                    {currentTurn().latency.streamingMs} ms
                  </span>
                </div>
              </div>
            </div>

            {/* Total Latency Sum */}
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500 font-medium">Total Turn Time-to-Result (TTR):</span>
              <div class="text-right">
                <span class="text-base font-bold font-mono text-slate-900">
                  {currentTurn().latency.totalLatencySec}s
                </span>
                <span class="text-[11px] text-slate-400 block font-mono">
                  ({currentTurn().latency.totalLatencyMs} ms cumulative)
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  }
}
