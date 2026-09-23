import { createSignal, createMemo, Show, For } from 'solid-js';
import { dashboardState } from '../../state/dashboardState.js';
import { area, line, stack, curveMonotoneX } from 'd3-shape';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Zap,
  Filter,
  Layers,
  AlignJustify,
  TrendingUp,
  Minimize2,
  Maximize2,
  ShieldCheck,
  DollarSign
} from 'lucide-solid';

export function PersistentTTRTimeline() {
  const [isCollapsed, setIsCollapsed] = createSignal(false);
  const [chartMode, setChartMode] = createSignal('stacked'); // 'stacked' | 'lanes' | 'overlay'
  const [isCompact, setIsCompact] = createSignal(true);
  const [hoveredIndex, setHoveredIndex] = createSignal(null);
  const [mousePos, setMousePos] = createSignal({ x: 0, y: 0 });
  const [visibleTimelineAgents, setVisibleTimelineAgents] = createSignal(
    dashboardState.agents.map(a => a.id)
  );

  function toggleTimelineAgent(id) {
    if (visibleTimelineAgents().includes(id)) {
      if (visibleTimelineAgents().length > 1) {
        setVisibleTimelineAgents(visibleTimelineAgents().filter(x => x !== id));
      }
    } else {
      setVisibleTimelineAgents([...visibleTimelineAgents(), id]);
    }
  }

  const agents = () => dashboardState.agents;
  const timelineData = () => dashboardState.timelineData;
  const storyLens = () => dashboardState.timelineMetric;

  const displayData = createMemo(() => {
    const data = timelineData();
    const lens = storyLens();
    return data.map(pt => {
      const out = {
        time: pt.time,
        timestamp: pt.timestamp,
        anomalyDetected: pt.anomalyDetected,
        anomalyAgent: pt.anomalyAgent,
        anomalyReason: pt.anomalyReason
      };
      agents().forEach(a => {
        if (lens === 'quality') {
          out[a.id] = pt.quality ? pt.quality[a.id] : (a.id === 'promo-shadow' ? (pt.anomalyDetected ? 78 : 88) : 94);
        } else if (lens === 'value') {
          out[a.id] = pt.value ? pt.value[a.id] : (a.id === 'deep-research' ? 972 : 45);
        } else {
          out[a.id] = pt.speed ? pt.speed[a.id] : (typeof pt[a.id] === 'number' ? pt[a.id] : 1.5);
        }
      });
      return out;
    });
  });

  const lensConfig = createMemo(() => {
    switch (storyLens()) {
      case 'quality':
        return {
          title: 'First-Time Right (FTR) Quality Pulse',
          unit: '%',
          fleetSummary: `Fleet FTR: ${dashboardState.workforceKPIs?.firstTimeRightRate || 89.8}%`,
          iconColor: 'text-emerald-400',
          gradientBg: 'bg-emerald-500/10 border-emerald-500/20'
        };
      case 'value':
        return {
          title: 'Real-Time Economic Output ($/min)',
          unit: '$/m',
          fleetSummary: `Fleet ROI: ${(dashboardState.workforceKPIs?.netROI || 7700).toLocaleString()}x`,
          iconColor: 'text-amber-400',
          gradientBg: 'bg-amber-500/10 border-amber-500/20'
        };
      case 'speed':
      default:
        return {
          title: 'Time-to-Result (TTR) Response Velocity',
          unit: 's',
          fleetSummary: `Fleet Avg: ${dashboardState.fleetKPIs?.avgLatency || '1.20'}s`,
          iconColor: 'text-sky-400',
          gradientBg: 'bg-sky-500/10 border-sky-500/20'
        };
    }
  });

  const visibleAgentsList = createMemo(() => agents().filter(a => visibleTimelineAgents().includes(a.id)));
  const visibleAgentIds = createMemo(() => visibleAgentsList().map(a => a.id));

  // Chart dimensions & layout
  const svgWidth = 1000;
  const svgHeight = () => (isCompact() ? 160 : 220);
  const margin = { top: 10, right: 20, bottom: 25, left: 35 };
  const plotWidth = () => svgWidth - margin.left - margin.right;
  const plotHeight = () => svgHeight() - margin.top - margin.bottom;

  function getX(index) {
    const len = displayData().length;
    if (len <= 1) return margin.left;
    return margin.left + (index / (len - 1)) * plotWidth();
  }

  // Stacked Data computed via d3-shape stack
  const stackedSeries = createMemo(() => {
    const dData = displayData();
    const vIds = visibleAgentIds();
    if (!dData.length || !vIds.length) return [];
    if (chartMode() === 'stacked' && storyLens() !== 'quality') {
      try {
        const stackGen = stack().keys(vIds);
        return stackGen(dData);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Calculate Y min and max domains
  const yDomain = createMemo(() => {
    if (storyLens() === 'quality') {
      return { min: 60, max: 100 };
    }
    const series = stackedSeries();
    if (chartMode() === 'stacked' && series.length > 0) {
      const lastLayer = series[series.length - 1];
      let max = 0;
      lastLayer.forEach(d => {
        if (d[1] > max) max = d[1];
      });
      return { min: 0, max: Math.ceil(max * 1.1) || 24 };
    }
    let max = 0;
    const dData = displayData();
    const vIds = visibleAgentIds();
    dData.forEach(d => {
      vIds.forEach(id => {
        const v = Number(d[id] || 0);
        if (v > max) max = v;
      });
    });
    return { min: 0, max: Math.ceil(max * 1.15) || 10 };
  });

  function getY(val) {
    const domain = yDomain();
    const range = domain.max - domain.min || 1;
    const clamped = Math.max(domain.min, Math.min(domain.max, val));
    return margin.top + plotHeight() - ((clamped - domain.min) / range) * plotHeight();
  }

  const yTicks = createMemo(() => {
    const ticks = [];
    const domain = yDomain();
    const step = (domain.max - domain.min) / 4;
    for (let i = 0; i <= 4; i++) {
      const val = domain.min + step * i;
      ticks.push({
        val: val >= 10 ? Math.round(val) : +val.toFixed(1),
        y: getY(val)
      });
    }
    return ticks;
  });

  const xTicks = createMemo(() => {
    const dData = displayData();
    if (!dData.length) return [];
    const count = Math.min(12, dData.length);
    const step = Math.max(1, Math.floor(dData.length / count));
    const result = [];
    for (let i = 0; i < dData.length; i += step) {
      result.push({
        label: dData[i].time,
        x: getX(i)
      });
    }
    return result;
  });

  const referenceLine = createMemo(() => {
    const lens = storyLens();
    if (lens === 'quality') {
      return { val: 95, label: '95% FTR Target', color: '#f59e0b' };
    }
    if (lens === 'value') {
      return { val: 100, label: '$100/m Target', color: '#f59e0b' };
    }
    return { val: 1.5, label: '1.50s Enterprise SLA Benchmark', color: '#f59e0b' };
  });

  const areaPathGenerator = createMemo(() => {
    return area()
      .x((_, i) => getX(i))
      .y0(d => getY(d[0]))
      .y1(d => getY(d[1]))
      .curve(curveMonotoneX);
  });

  const lineTopGenerator = createMemo(() => {
    return line()
      .x((_, i) => getX(i))
      .y(d => getY(d[1]))
      .curve(curveMonotoneX);
  });

  function getOverlayPath(agentId) {
    const gen = line()
      .x((_, i) => getX(i))
      .y(d => getY(d[agentId] || 0))
      .curve(curveMonotoneX);
    return gen(displayData());
  }

  function getSparkAreaPath(agentId) {
    const dData = displayData();
    if (!dData.length) return '';
    const maxScale = storyLens() === 'quality' ? 100 : storyLens() === 'value' ? 1000 : 5;
    const sparkGen = area()
      .x((_, i) => (i / (dData.length - 1)) * 400)
      .y0(() => 24)
      .y1(d => Math.max(2, 24 - ((Number(d[agentId] || 0)) / maxScale) * 22))
      .curve(curveMonotoneX);
    return sparkGen(dData);
  }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (x - margin.left) / plotWidth()));
    const idx = Math.round(ratio * (displayData().length - 1));
    setHoveredIndex(idx);
    setMousePos({ x: e.clientX, y: e.clientY });
  }

  function handleMouseLeave() {
    setHoveredIndex(null);
  }

  return (
    <div class="bg-slate-900/70 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 transition-all duration-200">
      <div class="max-w-7xl mx-auto">
        {/* Header Banner */}
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-2">
          <div class="flex items-center gap-3">
            <div class={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${lensConfig().gradientBg}`}>
              <Show
                when={storyLens() === 'quality'}
                fallback={
                  <Show when={storyLens() === 'value'} fallback={<Clock class="w-4 h-4 text-sky-400" />}>
                    <DollarSign class="w-4 h-4 text-amber-400" />
                  </Show>
                }
              >
                <ShieldCheck class="w-4 h-4 text-emerald-400" />
              </Show>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <span>{lensConfig().title}</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </h2>
                <span class="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                  {lensConfig().fleetSummary}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            {/* Lens Switcher */}
            <div class="flex items-center bg-slate-950/90 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => dashboardState.setTimelineMetric('speed')}
                class={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  storyLens() === 'speed' ? 'bg-sky-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock class="w-3 h-3" />
                <span>Speed (s)</span>
              </button>
              <button
                onClick={() => dashboardState.setTimelineMetric('quality')}
                class={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  storyLens() === 'quality' ? 'bg-emerald-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck class="w-3 h-3" />
                <span>Quality (FTR %)</span>
              </button>
              <button
                onClick={() => dashboardState.setTimelineMetric('value')}
                class={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  storyLens() === 'value' ? 'bg-amber-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign class="w-3 h-3" />
                <span>Value ($/m)</span>
              </button>
            </div>

            {/* Mode Switcher */}
            <div class="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setChartMode('stacked')}
                class={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartMode() === 'stacked' ? 'bg-brand-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers class="w-3 h-3" />
                <span class="hidden sm:inline">Stacked</span>
              </button>
              <button
                onClick={() => setChartMode('lanes')}
                class={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartMode() === 'lanes' ? 'bg-brand-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlignJustify class="w-3 h-3" />
                <span>Stacked Lanes</span>
              </button>
              <button
                onClick={() => setChartMode('overlay')}
                class={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartMode() === 'overlay' ? 'bg-brand-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp class="w-3 h-3" />
                <span>Overlay</span>
              </button>
            </div>

            {/* Compact Toggle */}
            <button
              onClick={() => setIsCompact(!isCompact())}
              class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1 text-[11px]"
            >
              <Show when={isCompact()} fallback={<><Minimize2 class="w-3.5 h-3.5" /><span>Compress</span></>}>
                <Maximize2 class="w-3.5 h-3.5" />
                <span>Comfort</span>
              </Show>
            </button>

            {/* Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed())}
              class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Show when={isCollapsed()} fallback={<ChevronUp class="w-4 h-4" />}>
                <ChevronDown class="w-4 h-4" />
              </Show>
            </button>
          </div>
        </div>

        {/* Collapsible Chart Body */}
        <Show when={!isCollapsed()}>
          <div class="relative">
            {/* Filter chips */}
            <div class="flex items-center gap-1.5 flex-wrap pb-1.5 text-[11px]">
              <span class="text-slate-500 mr-1 flex items-center gap-1">
                <Filter class="w-3 h-3" /> Filter:
              </span>
              <For each={agents()}>
                {(agent) => {
                  const isVisible = () => visibleTimelineAgents().includes(agent.id);
                  return (
                    <button
                      onClick={() => toggleTimelineAgent(agent.id)}
                      class={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                        isVisible() ? 'bg-slate-800/90 text-slate-200 border-slate-700 shadow-xs' : 'bg-slate-950/40 text-slate-500 border-slate-850 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <span class="w-1.5 h-1.5 rounded-full" style={{ "background-color": isVisible() ? agent.color : '#64748b' }}></span>
                      <span class="truncate max-w-[85px]">{agent.name.split(' ')[0]}</span>
                    </button>
                  );
                }}
              </For>
            </div>

            {/* 1. STACKED AREA / OVERLAY SVG CHART */}
            <Show when={chartMode() === 'stacked' || chartMode() === 'overlay'}>
              <div
                class="w-full relative cursor-crosshair overflow-hidden rounded-lg bg-slate-950/40 border border-slate-800/60 pt-1"
                style={{ height: `${svgHeight()}px` }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight()}`}
                  class="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <For each={agents()}>
                      {(agent) => (
                        <linearGradient id={`grad-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stop-color={agent.color} stop-opacity="0.65" />
                          <stop offset="95%" stop-color={agent.color} stop-opacity="0.2" />
                        </linearGradient>
                      )}
                    </For>
                  </defs>

                  {/* Cartesian Grid Lines */}
                  <For each={yTicks()}>
                    {(tick) => (
                      <>
                        <line
                          x1={margin.left}
                          y1={tick.y}
                          x2={svgWidth - margin.right}
                          y2={tick.y}
                          stroke="#1e293b"
                          stroke-dasharray="3 3"
                        />
                        <text
                          x={margin.left - 6}
                          y={tick.y + 3}
                          text-anchor="end"
                          fill="#475569"
                          font-size="9"
                          font-family="monospace"
                        >
                          {tick.val}{lensConfig().unit}
                        </text>
                      </>
                    )}
                  </For>

                  {/* Bottom X Axis Line */}
                  <line
                    x1={margin.left}
                    y1={margin.top + plotHeight()}
                    x2={svgWidth - margin.right}
                    y2={margin.top + plotHeight()}
                    stroke="#334155"
                    stroke-width="1"
                  />

                  {/* X Axis Time Ticks */}
                  <For each={xTicks()}>
                    {(tick) => (
                      <text
                        x={tick.x}
                        y={margin.top + plotHeight() + 12}
                        text-anchor="middle"
                        fill="#475569"
                        font-size="9"
                        font-family="monospace"
                      >
                        {tick.label}
                      </text>
                    )}
                  </For>

                  {/* Reference Line SLA Benchmark */}
                  <Show when={referenceLine()}>
                    {(() => {
                      const ref = referenceLine();
                      const refY = getY(ref.val);
                      return (
                        <>
                          <line
                            x1={margin.left}
                            y1={refY}
                            x2={svgWidth - margin.right}
                            y2={refY}
                            stroke={ref.color}
                            stroke-dasharray="4 4"
                            stroke-opacity="0.7"
                          />
                          <text
                            x={svgWidth - margin.right - 8}
                            y={refY - 4}
                            fill={ref.color}
                            font-size="9"
                            text-anchor="end"
                            font-weight="bold"
                          >
                            {ref.label}
                          </text>
                        </>
                      );
                    })()}
                  </Show>

                  {/* Stacked Areas or Overlay Curves */}
                  <Show
                    when={chartMode() === 'stacked' && storyLens() !== 'quality' && stackedSeries().length > 0}
                    fallback={
                      <For each={visibleAgentsList()}>
                        {(agent) => (
                          <path
                            d={getOverlayPath(agent.id)}
                            fill="none"
                            stroke={agent.color}
                            stroke-width={agent.id === 'promo-shadow' ? '2' : '1.5'}
                            opacity="0.9"
                          />
                        )}
                      </For>
                    }
                  >
                    <For each={stackedSeries()}>
                      {(layer) => {
                        const agent = agents().find(a => a.id === layer.key);
                        return (
                          <Show when={agent}>
                            <path
                              d={areaPathGenerator()(layer)}
                              fill={`url(#grad-${agent.id})`}
                              opacity="0.85"
                            />
                            <path
                              d={lineTopGenerator()(layer)}
                              fill="none"
                              stroke={agent.color}
                              stroke-width="1.5"
                            />
                          </Show>
                        );
                      }}
                    </For>
                  </Show>

                  {/* Interactive Hover Crosshair */}
                  <Show when={hoveredIndex() !== null}>
                    {(() => {
                      const hIdx = hoveredIndex();
                      const hoverX = getX(hIdx);
                      return (
                        <>
                          <line
                            x1={hoverX}
                            y1={margin.top}
                            x2={hoverX}
                            y2={margin.top + plotHeight()}
                            stroke="#38bdf8"
                            stroke-dasharray="2 2"
                            stroke-width="1.5"
                          />
                          <Show
                            when={chartMode() === 'stacked' && storyLens() !== 'quality' && stackedSeries().length > 0}
                            fallback={
                              <For each={visibleAgentsList()}>
                                {(agent) => {
                                  const val = displayData()[hIdx]?.[agent.id];
                                  return (
                                    <Show when={val !== undefined}>
                                      <circle cx={hoverX} cy={getY(val)} r="3.5" fill={agent.color} stroke="#ffffff" stroke-width="1" />
                                    </Show>
                                  );
                                }}
                              </For>
                            }
                          >
                            <For each={stackedSeries()}>
                              {(layer) => {
                                const agent = agents().find(a => a.id === layer.key);
                                const pt = layer[hIdx];
                                return (
                                  <Show when={agent && pt}>
                                    <circle cx={hoverX} cy={getY(pt[1])} r="3.5" fill={agent.color} stroke="#ffffff" stroke-width="1" />
                                  </Show>
                                );
                              }}
                            </For>
                          </Show>
                        </>
                      );
                    })()}
                  </Show>
                </svg>

                {/* Floating Glass Tooltip */}
                <Show when={hoveredIndex() !== null && displayData()[hoveredIndex()]}>
                  {(() => {
                    const point = displayData()[hoveredIndex()];
                    const totalStacked = visibleAgentsList().reduce((acc, a) => acc + (typeof point[a.id] === 'number' ? point[a.id] : 0), 0);
                    const avgVal = (totalStacked / (visibleAgentsList().length || 1)).toFixed(1);

                    return (
                      <div
                        class="absolute pointer-events-none z-50 bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[240px]"
                        style={{
                          left: `${Math.min(Math.max(10, mousePos().x - 120), 720)}px`,
                          top: '10px'
                        }}
                      >
                        <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                          <div class="flex items-center gap-1.5 text-slate-300 font-mono font-medium">
                            <Show
                              when={storyLens() === 'quality'}
                              fallback={
                                <Show when={storyLens() === 'value'} fallback={<Clock class="w-3.5 h-3.5 text-sky-400" />}>
                                  <DollarSign class="w-3.5 h-3.5 text-amber-400" />
                                </Show>
                              }
                            >
                              <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
                            </Show>
                            <span>{point.time}</span>
                          </div>
                          <Show when={point.anomalyDetected}>
                            <span class="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-semibold flex items-center gap-1">
                              <Zap class="w-2.5 h-2.5 text-rose-400" /> Anomaly Dip
                            </span>
                          </Show>
                        </div>

                        <Show when={chartMode() === 'stacked'}>
                          <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-850 text-[11px] font-semibold text-slate-400">
                            <span>{storyLens() === 'quality' ? 'Fleet Average Quality:' : storyLens() === 'value' ? 'Total Fleet Output/Min:' : 'Cumulative Fleet Latency:'}</span>
                            <span class="font-mono text-brand-300">
                              {storyLens() === 'quality' ? `${avgVal}%` : storyLens() === 'value' ? `$${totalStacked.toLocaleString()}/min` : `${totalStacked.toFixed(2)}s`}
                            </span>
                          </div>
                        </Show>

                        <div class="space-y-1.5">
                          <For each={visibleAgentsList()}>
                            {(agent) => {
                              const val = point[agent.id];
                              return (
                                <div class="flex items-center justify-between gap-3">
                                  <div class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full flex-shrink-0" style={{ "background-color": agent.color }}></span>
                                    <span class="text-slate-300 truncate max-w-[130px]">{agent.name}</span>
                                  </div>
                                  <span class="font-mono font-semibold text-slate-100">
                                    {storyLens() === 'value' ? `$${val}/m` : `${val}${lensConfig().unit}`}
                                  </span>
                                </div>
                              );
                            }}
                          </For>
                        </div>

                        <Show when={point.anomalyDetected && point.anomalyReason}>
                          <div class="mt-2 pt-2 border-t border-slate-800 text-[11px] text-amber-300/90 flex items-start gap-1">
                            <AlertCircle class="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{point.anomalyReason}</span>
                          </div>
                        </Show>
                      </div>
                    );
                  })()}
                </Show>
              </div>
            </Show>

            {/* 2. STACKED MULTI-LANES MODE */}
            <Show when={chartMode() === 'lanes'}>
              <div class="space-y-1 pt-1">
                <For each={visibleAgentsList()}>
                  {(agent) => {
                    const lastVal = () => displayData()[displayData().length - 1]?.[agent.id] ?? (storyLens() === 'speed' ? agent.avgLatency : 90);
                    const isHigh = () => storyLens() === 'speed' ? lastVal() > 3.5 : lastVal() < 80;

                    return (
                      <div class="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-lg px-2.5 py-1 text-xs hover:border-slate-700 transition-colors">
                        <div class="w-28 sm:w-36 flex-shrink-0 flex items-center gap-1.5">
                          <span class="w-2 h-2 rounded-full flex-shrink-0" style={{ "background-color": agent.color }}></span>
                          <span class="font-semibold text-slate-200 truncate text-[11px]">
                            {agent.name.split(' ')[0]}
                          </span>
                        </div>

                        <div class="flex-1 h-6 min-w-[120px] relative">
                          <svg viewBox="0 0 400 24" class="w-full h-full overflow-hidden" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id={`lane-grad-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color={agent.color} stop-opacity="0.6" />
                                <stop offset="100%" stop-color={agent.color} stop-opacity="0.05" />
                              </linearGradient>
                            </defs>
                            <path
                              d={getSparkAreaPath(agent.id)}
                              fill={`url(#lane-grad-${agent.id})`}
                              stroke={agent.color}
                              stroke-width="1.5"
                            />
                          </svg>
                        </div>

                        <div class="w-20 text-right flex-shrink-0">
                          <span class={`font-mono text-xs font-bold ${isHigh() ? 'text-amber-400' : 'text-slate-200'}`}>
                            {storyLens() === 'value' ? `$${lastVal()}/m` : `${lastVal()}${lensConfig().unit}`}
                          </span>
                          <span class="text-[9px] text-slate-500 block font-mono">
                            {storyLens() === 'speed' ? `avg ${agent.avgLatency}s` : storyLens() === 'quality' ? `${agent.workforce?.firstTimeRightRate}% FTR` : `$${((agent.workforce?.totalEconomicValue || 0)/1000).toFixed(0)}k net`}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>

            {/* Quick Context Footer matching React */}
            <div class="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Fast / High FTR: Price Match &amp; Support
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Under Coaching: Promo Strategy Shadow
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  High Economic Value: Deep Research Analyst
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-400 font-mono">{displayData().length} samples</span>
                <span>&bull;</span>
                <span class="text-emerald-400 font-medium">Story Lens: {storyLens().toUpperCase()}</span>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
