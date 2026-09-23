import { component$, useSignal, useContext, $ } from '@builder.io/qwik';
import { DashboardContext } from '../../state/dashboardState';
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
} from '../common/Icons';

export const PersistentTTRTimeline = component$(() => {
  const state = useContext(DashboardContext);

  const isCollapsed = useSignal(false);
  const chartMode = useSignal<'stacked' | 'lanes' | 'overlay'>('stacked');
  const isCompact = useSignal(true);
  const hoveredIndex = useSignal<number | null>(null);
  const mousePos = useSignal({ x: 0, y: 0 });

  const visibleTimelineAgents = useSignal<string[]>(
    state.agents.map((a: any) => a.id)
  );

  const toggleTimelineAgent = $((id: string) => {
    if (visibleTimelineAgents.value.includes(id)) {
      if (visibleTimelineAgents.value.length > 1) {
        visibleTimelineAgents.value = visibleTimelineAgents.value.filter((x) => x !== id);
      }
    } else {
      visibleTimelineAgents.value = [...visibleTimelineAgents.value, id];
    }
  });

  const agents = state.agents;
  const timelineData = state.timelineData;
  const storyLens = state.timelineMetric;

  // Adapt timeline points dynamically based on the active Story Lens
  const displayData = timelineData.map((pt: any) => {
    const out: any = {
      time: pt.time,
      timestamp: pt.timestamp,
      anomalyDetected: pt.anomalyDetected,
      anomalyAgent: pt.anomalyAgent,
      anomalyReason: pt.anomalyReason
    };
    agents.forEach((a: any) => {
      if (storyLens === 'quality') {
        out[a.id] = pt.quality ? pt.quality[a.id] : (a.id === 'promo-shadow' ? (pt.anomalyDetected ? 78 : 88) : 94);
      } else if (storyLens === 'value') {
        out[a.id] = pt.value ? pt.value[a.id] : (a.id === 'deep-research' ? 972 : 45);
      } else {
        out[a.id] = pt.speed ? pt.speed[a.id] : (typeof pt[a.id] === 'number' ? pt[a.id] : 1.5);
      }
    });
    return out;
  });

  const lensConfig = (() => {
    switch (storyLens) {
      case 'quality':
        return {
          title: 'First-Time Right (FTR) Quality Pulse',
          unit: '%',
          fleetSummary: `Fleet FTR: ${state.workforceKPIs?.firstTimeRightRate || 89.8}%`,
          iconColor: 'text-emerald-400',
          gradientBg: 'bg-emerald-500/10 border-emerald-500/20'
        };
      case 'value':
        return {
          title: 'Real-Time Economic Output ($/min)',
          unit: '$/m',
          fleetSummary: `Fleet ROI: ${(state.workforceKPIs?.netROI || 7700).toLocaleString()}x`,
          iconColor: 'text-amber-400',
          gradientBg: 'bg-amber-500/10 border-amber-500/20'
        };
      case 'speed':
      default:
        return {
          title: 'Time-to-Result (TTR) Response Velocity',
          unit: 's',
          fleetSummary: `Fleet Avg: ${state.fleetKPIs?.avgLatency || '1.20'}s`,
          iconColor: 'text-sky-400',
          gradientBg: 'bg-sky-500/10 border-sky-500/20'
        };
    }
  })();

  const visibleAgentsList = agents.filter((a: any) => visibleTimelineAgents.value.includes(a.id));
  const visibleAgentIds = visibleAgentsList.map((a: any) => a.id);

  // Layout dimensions
  const svgWidth = 1000;
  const svgHeight = isCompact.value ? 160 : 220;
  const margin = { top: 10, right: 20, bottom: 25, left: 35 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const getX = (index: number) => {
    const len = displayData.length;
    if (len <= 1) return margin.left;
    return margin.left + (index / (len - 1)) * plotWidth;
  };

  // Stacked Data computed via d3-shape stack
  let stackedSeries: any[] = [];
  if (displayData.length && visibleAgentIds.length && chartMode.value === 'stacked' && storyLens !== 'quality') {
    try {
      const stackGen = stack().keys(visibleAgentIds);
      stackedSeries = stackGen(displayData);
    } catch {
      stackedSeries = [];
    }
  }

  // Calculate Y min and max domains
  let yMin = 0;
  let yMax = 10;
  if (storyLens === 'quality') {
    yMin = 60;
    yMax = 100;
  } else if (chartMode.value === 'stacked' && stackedSeries.length > 0) {
    const lastLayer = stackedSeries[stackedSeries.length - 1];
    let maxVal = 0;
    lastLayer.forEach((d: any) => {
      if (d[1] > maxVal) maxVal = d[1];
    });
    yMin = 0;
    yMax = Math.ceil(maxVal * 1.1) || 24;
  } else {
    let maxVal = 0;
    displayData.forEach((d: any) => {
      visibleAgentIds.forEach((id: string) => {
        const v = Number(d[id] || 0);
        if (v > maxVal) maxVal = v;
      });
    });
    yMin = 0;
    yMax = Math.ceil(maxVal * 1.15) || 10;
  }

  const getY = (val: number) => {
    const range = yMax - yMin || 1;
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return margin.top + plotHeight - ((clamped - yMin) / range) * plotHeight;
  };

  const yTicks: { val: number; y: number }[] = [];
  const yStep = (yMax - yMin) / 4;
  for (let i = 0; i <= 4; i++) {
    const val = yMin + yStep * i;
    yTicks.push({
      val: val >= 10 ? Math.round(val) : +val.toFixed(1),
      y: getY(val)
    });
  }

  const xTicks: { label: string; x: number }[] = [];
  if (displayData.length) {
    const count = Math.min(12, displayData.length);
    const step = Math.max(1, Math.floor(displayData.length / count));
    for (let i = 0; i < displayData.length; i += step) {
      xTicks.push({
        label: displayData[i].time,
        x: getX(i)
      });
    }
  }

  const referenceLine = (() => {
    if (storyLens === 'quality') {
      return { val: 95, label: '95% FTR Target', color: '#f59e0b' };
    }
    if (storyLens === 'value') {
      return { val: 100, label: '$100/m Target', color: '#f59e0b' };
    }
    return { val: 1.5, label: '1.50s Enterprise SLA Benchmark', color: '#f59e0b' };
  })();

  const areaPathGenerator = area<any>()
    .x((_, i) => getX(i))
    .y0((d) => getY(d[0]))
    .y1((d) => getY(d[1]))
    .curve(curveMonotoneX);

  const lineTopGenerator = line<any>()
    .x((_, i) => getX(i))
    .y((d) => getY(d[1]))
    .curve(curveMonotoneX);

  const getOverlayPath = (agentId: string) => {
    const gen = line<any>()
      .x((_, i) => getX(i))
      .y((d) => getY(d[agentId] || 0))
      .curve(curveMonotoneX);
    return gen(displayData) || '';
  };

  const getSparkAreaPath = (agentId: string) => {
    if (!displayData.length) return '';
    const maxScale = storyLens === 'quality' ? 100 : storyLens === 'value' ? 1000 : 5;
    const sparkGen = area<any>()
      .x((_, i) => (i / (displayData.length - 1)) * 400)
      .y0(() => 24)
      .y1((d) => Math.max(2, 24 - (Number(d[agentId] || 0) / maxScale) * 22))
      .curve(curveMonotoneX);
    return sparkGen(displayData) || '';
  };

  return (
    <div class="bg-slate-900/70 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 transition-all duration-200">
      <div class="max-w-7xl mx-auto">
        {/* Header Banner */}
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-2">
          <div class="flex items-center gap-3">
            <div class={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${lensConfig.gradientBg}`}>
              {storyLens === 'quality' ? (
                <ShieldCheck class="w-4 h-4 text-emerald-400" />
              ) : storyLens === 'value' ? (
                <DollarSign class="w-4 h-4 text-amber-400" />
              ) : (
                <Clock class="w-4 h-4 text-sky-400" />
              )}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <span>{lensConfig.title}</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </h2>
                <span class="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                  {lensConfig.fleetSummary}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            {/* Lens Switcher */}
            <div class="flex items-center bg-slate-950/90 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick$={$(() => state.setTimelineMetric('speed'))}
                class={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  storyLens === 'speed' ? 'bg-sky-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock class="w-3 h-3" />
                <span>Speed (s)</span>
              </button>
              <button
                onClick$={$(() => state.setTimelineMetric('quality'))}
                class={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  storyLens === 'quality' ? 'bg-emerald-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck class="w-3 h-3" />
                <span>Quality (FTR %)</span>
              </button>
              <button
                onClick$={$(() => state.setTimelineMetric('value'))}
                class={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  storyLens === 'value' ? 'bg-amber-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign class="w-3 h-3" />
                <span>Value ($/m)</span>
              </button>
            </div>

            {/* Mode Switcher */}
            <div class="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick$={$(() => {
                  chartMode.value = 'stacked';
                })}
                class={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartMode.value === 'stacked' ? 'bg-sky-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers class="w-3 h-3" />
                <span>Stacked Area</span>
              </button>
              <button
                onClick$={$(() => {
                  chartMode.value = 'lanes';
                })}
                class={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartMode.value === 'lanes' ? 'bg-sky-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlignJustify class="w-3 h-3" />
                <span>Agent Horizon Lanes</span>
              </button>
              <button
                onClick$={$(() => {
                  chartMode.value = 'overlay';
                })}
                class={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartMode.value === 'overlay' ? 'bg-sky-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp class="w-3 h-3" />
                <span>Overlay Curves</span>
              </button>
            </div>

            {/* Collapse/Expand Toggle */}
            <button
              onClick$={$(() => {
                isCollapsed.value = !isCollapsed.value;
              })}
              class="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title={isCollapsed.value ? 'Expand Timeline' : 'Collapse Timeline'}
            >
              {isCollapsed.value ? <ChevronDown class="w-3.5 h-3.5" /> : <ChevronUp class="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Body */}
        {!isCollapsed.value && (
          <div class="mt-2 space-y-2">
            {/* Filter Pills for Agents */}
            <div class="flex items-center gap-1.5 flex-wrap text-[11px] pb-1 border-b border-slate-800/60">
              <span class="text-slate-400 flex items-center gap-1 mr-1">
                <Filter class="w-3 h-3" />
                Filter Agents:
              </span>
              {agents.map((a: any) => {
                const isVis = visibleTimelineAgents.value.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick$={() => toggleTimelineAgent(a.id)}
                    class={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all ${
                      isVis
                        ? 'bg-slate-800/90 text-slate-200 border-slate-700 shadow-xs'
                        : 'bg-slate-950/40 text-slate-400 border-slate-800/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span
                      class="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isVis ? a.color : '#475569' }}
                    />
                    <span>{a.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* 1. STACKED AREA / OVERLAY CURVES SVG */}
            {chartMode.value !== 'lanes' && (
              <div
                class="relative w-full overflow-hidden rounded-xl bg-slate-950/80 border border-slate-800/80 p-2"
                onMouseLeave$={$(() => {
                  hoveredIndex.value = null;
                })}
              >
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  class="w-full overflow-visible"
                  style={{ height: `${svgHeight}px` }}
                  preserveAspectRatio="none"
                  onMouseMove$={$((e: MouseEvent) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const ratio = Math.max(0, Math.min(1, (x - margin.left) / plotWidth));
                    const idx = Math.round(ratio * (displayData.length - 1));
                    hoveredIndex.value = idx;
                    mousePos.value = { x: e.clientX, y: e.clientY };
                  })}
                >
                  <defs>
                    {visibleAgentsList.map((agent: any) => (
                      <linearGradient key={agent.id} id={`grad-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color={agent.color} stop-opacity="0.55" />
                        <stop offset="100%" stop-color={agent.color} stop-opacity="0.05" />
                      </linearGradient>
                    ))}
                  </defs>

                  {/* Horizontal Grid lines */}
                  {yTicks.map((tick, i) => (
                    <g key={i}>
                      <line
                        x1={margin.left}
                        y1={tick.y}
                        x2={svgWidth - margin.right}
                        y2={tick.y}
                        stroke="#1e293b"
                        stroke-dasharray="3 3"
                        stroke-width="1"
                      />
                      <text
                        x={margin.left - 6}
                        y={tick.y + 3}
                        fill="#64748b"
                        font-size="9"
                        font-family="monospace"
                        text-anchor="end"
                      >
                        {tick.val}{lensConfig.unit}
                      </text>
                    </g>
                  ))}

                  {/* X Axis Time Labels */}
                  {xTicks.map((tick, i) => (
                    <text
                      key={i}
                      x={tick.x}
                      y={margin.top + plotHeight + 16}
                      fill="#64748b"
                      font-size="9"
                      font-family="monospace"
                      text-anchor="middle"
                    >
                      {tick.label}
                    </text>
                  ))}

                  {/* Reference SLA/Target Line */}
                  <line
                    x1={margin.left}
                    y1={getY(referenceLine.val)}
                    x2={svgWidth - margin.right}
                    y2={getY(referenceLine.val)}
                    stroke={referenceLine.color}
                    stroke-width="1.5"
                    stroke-dasharray="4 4"
                    opacity="0.8"
                  />
                  <text
                    x={svgWidth - margin.right - 4}
                    y={getY(referenceLine.val) - 4}
                    fill={referenceLine.color}
                    font-size="9"
                    font-family="sans-serif"
                    font-weight="600"
                    text-anchor="end"
                  >
                    {referenceLine.label}
                  </text>

                  {/* Chart Rendering */}
                  {chartMode.value === 'stacked' && storyLens !== 'quality' ? (
                    // Stacked Area
                    stackedSeries.map((layer: any) => {
                      const agent = agents.find((a: any) => a.id === layer.key);
                      if (!agent) return null;
                      const areaD = areaPathGenerator(layer) || '';
                      const lineD = lineTopGenerator(layer) || '';
                      return (
                        <g key={layer.key}>
                          <path d={areaD} fill={`url(#grad-${agent.id})`} opacity="0.85" />
                          <path d={lineD} fill="none" stroke={agent.color} stroke-width="1.5" />
                        </g>
                      );
                    })
                  ) : (
                    // Overlay Lines
                    visibleAgentsList.map((agent: any) => {
                      const d = getOverlayPath(agent.id);
                      return (
                        <path
                          key={agent.id}
                          d={d}
                          fill="none"
                          stroke={agent.color}
                          stroke-width="2"
                          opacity="0.9"
                        />
                      );
                    })
                  )}

                  {/* Anomaly Callout Markers */}
                  {displayData.map((d: any, idx: number) => {
                    if (!d.anomalyDetected) return null;
                    const cx = getX(idx);
                    const agentVal = d[d.anomalyAgent] || 0;
                    const cy = getY(agentVal);
                    return (
                      <g key={idx}>
                        <circle cx={cx} cy={cy} r="5" fill="#f43f5e" stroke="#ffffff" stroke-width="2" />
                        <line
                          x1={cx}
                          y1={margin.top}
                          x2={cx}
                          y2={margin.top + plotHeight}
                          stroke="#f43f5e"
                          stroke-width="1"
                          stroke-dasharray="2 2"
                          opacity="0.5"
                        />
                      </g>
                    );
                  })}

                  {/* Hover Cursor Bar */}
                  {hoveredIndex.value !== null && (
                    <line
                      x1={getX(hoveredIndex.value)}
                      y1={margin.top}
                      x2={getX(hoveredIndex.value)}
                      y2={margin.top + plotHeight}
                      stroke="#94a3b8"
                      stroke-width="1"
                      stroke-dasharray="3 3"
                    />
                  )}
                </svg>

                {/* Sleek Dark-Glass Tooltip */}
                {hoveredIndex.value !== null && displayData[hoveredIndex.value] && (() => {
                  const point = displayData[hoveredIndex.value];
                  const totalStacked = visibleAgentsList.reduce(
                    (acc: number, curr: any) => acc + (typeof point[curr.id] === 'number' ? point[curr.id] : 0),
                    0
                  );
                  const avgVal = (totalStacked / (visibleAgentsList.length || 1)).toFixed(1);

                  return (
                    <div
                      class="absolute pointer-events-none z-50 bg-[#0f172a]/95 border border-[#334155] rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[220px] transition-all"
                      style={{
                        left: `${Math.min(Math.max(10, mousePos.value.x - 110), 750)}px`,
                        top: '10px'
                      }}
                    >
                      <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <div class="flex items-center gap-1.5 text-slate-300 font-mono font-medium">
                          {storyLens === 'quality' ? (
                            <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
                          ) : storyLens === 'value' ? (
                            <DollarSign class="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Clock class="w-3.5 h-3.5 text-sky-400" />
                          )}
                          <span>{point.time}</span>
                        </div>
                        {point.anomalyDetected && (
                          <span class="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-semibold flex items-center gap-1">
                            <Zap class="w-2.5 h-2.5 text-rose-400" /> Anomaly Dip
                          </span>
                        )}
                      </div>

                      {chartMode.value === 'stacked' && (
                        <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                          <span>
                            {storyLens === 'quality'
                              ? 'Fleet Average Quality:'
                              : storyLens === 'value'
                              ? 'Total Fleet Output/Min:'
                              : 'Cumulative Fleet Latency:'}
                          </span>
                          <span class="font-mono text-sky-300">
                            {storyLens === 'quality'
                              ? `${avgVal}%`
                              : storyLens === 'value'
                              ? `$${totalStacked.toLocaleString()}/min`
                              : `${totalStacked.toFixed(2)}s`}
                          </span>
                        </div>
                      )}

                      <div class="space-y-1.5">
                        {visibleAgentsList.map((agent: any) => {
                          const val = point[agent.id];
                          return (
                            <div key={agent.id} class="flex items-center justify-between gap-3">
                              <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: agent.color }}></span>
                                <span class="text-slate-300 truncate max-w-[130px]">{agent.name}</span>
                              </div>
                              <span class="font-mono font-semibold text-slate-100">
                                {storyLens === 'value' ? `$${val}/m` : `${val}${lensConfig.unit}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {point.anomalyDetected && point.anomalyReason && (
                        <div class="mt-2 pt-2 border-t border-slate-800 text-[11px] text-amber-300/90 flex items-start gap-1">
                          <AlertCircle class="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{point.anomalyReason}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. STACKED MULTI-LANES MODE */}
            {chartMode.value === 'lanes' && (
              <div class="space-y-1 pt-1">
                {visibleAgentsList.map((agent: any) => {
                  const lastVal = displayData[displayData.length - 1]?.[agent.id] ?? (storyLens === 'speed' ? agent.avgLatency : 90);
                  const isHigh = storyLens === 'speed' ? lastVal > 3.5 : lastVal < 80;

                  return (
                    <div
                      key={agent.id}
                      class="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-lg px-2.5 py-1 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div class="w-28 sm:w-36 shrink-0 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: agent.color }}></span>
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

                      <div class="w-20 text-right shrink-0">
                        <span class={`font-mono text-xs font-bold ${isHigh ? 'text-amber-400' : 'text-slate-200'}`}>
                          {storyLens === 'value' ? `$${lastVal}/m` : `${lastVal}${lensConfig.unit}`}
                        </span>
                        <span class="text-[9px] text-slate-500 block font-mono">
                          {storyLens === 'speed'
                            ? `avg ${agent.avgLatency}s`
                            : storyLens === 'quality'
                            ? `${agent.workforce?.firstTimeRightRate}% FTR`
                            : `$${((agent.workforce?.totalEconomicValue || 0) / 1000).toFixed(0)}k net`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
                <span class="text-slate-400 font-mono">{displayData.length} samples</span>
                <span>&bull;</span>
                <span class="text-emerald-400 font-medium">Story Lens: {storyLens.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
