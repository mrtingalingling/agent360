import { track } from 'ripple';
import { dashboardState } from '../../state/dashboardState.js';
import { area, line, stack, curveMonotoneX } from 'd3-shape';
import {
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AlertCircleIcon,
  ZapIcon,
  FilterIcon,
  LayersIcon,
  AlignJustifyIcon,
  TrendingUpIcon,
  Minimize2Icon,
  Maximize2Icon,
  ShieldCheckIcon,
  DollarSignIcon
} from '../common/Icons.tsrx';

export function PersistentTTRTimeline() @{
  const isCollapsed = track(false);
  const chartMode = track<'stacked' | 'lanes' | 'overlay'>('stacked');
  const isCompact = track(true);
  const hoveredIndex = track<number | null>(null);
  const mousePos = track({ x: 0, y: 0 });
  const visibleTimelineAgents = track<string[]>(
    dashboardState.agents.map(a => a.id)
  );

  function toggleTimelineAgent(id: string) {
    const current = visibleTimelineAgents.value;
    if (current.includes(id)) {
      if (current.length > 1) {
        visibleTimelineAgents.value = current.filter(x => x !== id);
      }
    } else {
      visibleTimelineAgents.value = [...current, id];
    }
  }

  const agents = () => dashboardState.agents;
  const timelineData = () => dashboardState.timelineData;
  const storyLens = () => dashboardState.timelineMetric;

  const displayData = () => {
    const data = timelineData();
    const lens = storyLens();
    return data.map((pt: any) => {
      const out: any = {
        time: pt.time,
        timestamp: pt.timestamp,
        anomalyDetected: pt.anomalyDetected,
        anomalyAgent: pt.anomalyAgent,
        anomalyReason: pt.anomalyReason
      };
      agents().forEach((a: any) => {
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
  };

  const lensConfig = () => {
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
  };

  const visibleAgentsList = () => agents().filter((a: any) => visibleTimelineAgents.value.includes(a.id));
  const visibleAgentIds = () => visibleAgentsList().map((a: any) => a.id);

  const svgWidth = 1000;
  const svgHeight = () => (isCompact.value ? 160 : 220);
  const margin = { top: 10, right: 20, bottom: 25, left: 35 };
  const plotWidth = () => svgWidth - margin.left - margin.right;
  const plotHeight = () => svgHeight() - margin.top - margin.bottom;

  function getX(index: number) {
    const len = displayData().length;
    if (len <= 1) return margin.left;
    return margin.left + (index / (len - 1)) * plotWidth();
  }

  const stackedSeries = () => {
    const dData = displayData();
    const vIds = visibleAgentIds();
    if (!dData.length || !vIds.length) return [];
    if (chartMode.value === 'stacked' && storyLens() !== 'quality') {
      try {
        const stackGen = stack().keys(vIds);
        return stackGen(dData);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const yDomain = () => {
    if (storyLens() === 'quality') {
      return { min: 60, max: 100 };
    }
    const series = stackedSeries();
    if (chartMode.value === 'stacked' && series.length > 0) {
      const lastLayer = series[series.length - 1];
      let max = 0;
      lastLayer.forEach((d: any) => {
        if (d[1] > max) max = d[1];
      });
      return { min: 0, max: Math.ceil(max * 1.1) || 24 };
    }
    let max = 0;
    const dData = displayData();
    const vIds = visibleAgentIds();
    dData.forEach((d: any) => {
      vIds.forEach((id: string) => {
        const v = Number(d[id] || 0);
        if (v > max) max = v;
      });
    });
    return { min: 0, max: Math.ceil(max * 1.15) || 10 };
  };

  function getY(val: number) {
    const domain = yDomain();
    const range = domain.max - domain.min || 1;
    const clamped = Math.max(domain.min, Math.min(domain.max, val));
    return margin.top + plotHeight() - ((clamped - domain.min) / range) * plotHeight();
  }

  const yTicks = () => {
    const ticks: any[] = [];
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
  };

  const xTicks = () => {
    const dData = displayData();
    if (!dData.length) return [];
    const count = Math.min(12, dData.length);
    const step = Math.max(1, Math.floor(dData.length / count));
    const result: any[] = [];
    for (let i = 0; i < dData.length; i += step) {
      result.push({
        label: dData[i].time,
        x: getX(i)
      });
    }
    return result;
  };

  const referenceLine = () => {
    const lens = storyLens();
    if (lens === 'quality') {
      return { val: 95, label: '95% FTR Target', color: '#f59e0b' };
    }
    if (lens === 'value') {
      return { val: 100, label: '$100/m Target', color: '#f59e0b' };
    }
    return { val: 1.5, label: '1.50s Enterprise SLA Benchmark', color: '#f59e0b' };
  };

  const areaPathGenerator = () => {
    return area<any>()
      .x((_, i) => getX(i))
      .y0(d => getY(d[0]))
      .y1(d => getY(d[1]))
      .curve(curveMonotoneX);
  };

  const lineTopGenerator = () => {
    return line<any>()
      .x((_, i) => getX(i))
      .y(d => getY(d[1]))
      .curve(curveMonotoneX);
  };

  function getOverlayPath(agentId: string) {
    const gen = line<any>()
      .x((_, i) => getX(i))
      .y(d => getY(d[agentId] || 0))
      .curve(curveMonotoneX);
    return gen(displayData()) || '';
  }

  function getSparkAreaPath(agentId: string) {
    const dData = displayData();
    if (!dData.length) return '';
    const maxScale = storyLens() === 'quality' ? 100 : storyLens() === 'value' ? 1000 : 5;
    const sparkGen = area<any>()
      .x((_, i) => (i / (dData.length - 1)) * 400)
      .y0(() => 24)
      .y1(d => Math.max(2, 24 - ((Number(d[agentId] || 0)) / maxScale) * 22))
      .curve(curveMonotoneX);
    return sparkGen(dData) || '';
  }

  function handleMouseMove(e: MouseEvent) {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (x - margin.left) / plotWidth()));
    const idx = Math.round(ratio * (displayData().length - 1));
    hoveredIndex.value = idx;
    mousePos.value = { x: e.clientX, y: e.clientY };
  }

  function handleMouseLeave() {
    hoveredIndex.value = null;
  }

  <div class="bg-slate-900/70 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 transition-all duration-200">
    <div class="max-w-7xl mx-auto">
      {/* Header Banner */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-2">
        <div class="flex items-center gap-3">
          <div class={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${lensConfig().gradientBg}`}>
            @if (storyLens() === 'quality') {
              <ShieldCheckIcon class="w-4 h-4 text-emerald-400" />
            } @else if (storyLens() === 'value') {
              <DollarSignIcon class="w-4 h-4 text-amber-400" />
            } @else {
              <ClockIcon class="w-4 h-4 text-sky-400" />
            }
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

        {/* Action Controls */}
        <div class="flex items-center gap-2 flex-wrap">
          {/* Story Lens Toggle */}
          <div class="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => dashboardState.setTimelineMetric('speed')}
              class={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
                storyLens() === 'speed' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClockIcon class="w-3 h-3" />
              <span>Speed (TTR)</span>
            </button>
            <button
              onClick={() => dashboardState.setTimelineMetric('quality')}
              class={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
                storyLens() === 'quality' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheckIcon class="w-3 h-3" />
              <span>Quality (FTR)</span>
            </button>
            <button
              onClick={() => dashboardState.setTimelineMetric('value')}
              class={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
                storyLens() === 'value' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSignIcon class="w-3 h-3" />
              <span>Value ($/m)</span>
            </button>
          </div>

          {/* Chart View Modes */}
          <div class="hidden sm:flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => { chartMode.value = 'stacked'; }}
              class={`p-1.5 rounded transition-colors ${chartMode.value === 'stacked' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Stacked Area Fill"
            >
              <LayersIcon class="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { chartMode.value = 'lanes'; }}
              class={`p-1.5 rounded transition-colors ${chartMode.value === 'lanes' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Individual Agent Lanes"
            >
              <AlignJustifyIcon class="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { chartMode.value = 'overlay'; }}
              class={`p-1.5 rounded transition-colors ${chartMode.value === 'overlay' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Direct Overlay Lines"
            >
              <TrendingUpIcon class="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Size & Collapse Toggles */}
          <button
            onClick={() => { isCompact.value = !isCompact.value; }}
            class="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hidden sm:block"
            title={isCompact.value ? 'Expand Height' : 'Compact Height'}
          >
            @if (isCompact.value) {
              <Maximize2Icon class="w-3.5 h-3.5" />
            } @else {
              <Minimize2Icon class="w-3.5 h-3.5" />
            }
          </button>

          <button
            onClick={() => { isCollapsed.value = !isCollapsed.value; }}
            class="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
            title={isCollapsed.value ? 'Expand Timeline' : 'Collapse Timeline'}
          >
            @if (isCollapsed.value) {
              <ChevronDownIcon class="w-3.5 h-3.5" />
            } @else {
              <ChevronUpIcon class="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      @if (!isCollapsed.value) {
        <div>
          {/* Agent Filter Pill Tags */}
          <div class="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 text-xs">
            <span class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
              <FilterIcon class="w-3 h-3" /> Fleet:
            </span>
            @for (const agent of agents()) {
              <button
                onClick={() => toggleTimelineAgent(agent.id)}
                class={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium transition-all ${
                  visibleTimelineAgents.value.includes(agent.id)
                    ? 'bg-slate-800/90 text-slate-200 border-slate-700 shadow-xs'
                    : 'bg-slate-950/40 text-slate-600 border-slate-900 opacity-60'
                }`}
              >
                <span
                  class="w-2 h-2 rounded-full"
                  style={{
                    'background-color': visibleTimelineAgents.value.includes(agent.id) ? agent.color : '#475569'
                  }}
                ></span>
                <span>{agent.name.split(' ')[0]}</span>
                @if (agent.id === 'promo-shadow') {
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                }
              </button>
            }
          </div>

          {/* 1. STACKED / OVERLAY CHART MODE */}
          @if (chartMode.value !== 'lanes') {
            <div class="relative w-full bg-slate-950/60 rounded-xl border border-slate-800/80 p-2 overflow-visible">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight()}`}
                class="w-full overflow-visible"
                style={{ height: `${svgHeight()}px` }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  @for (const agent of visibleAgentsList()) {
                    <linearGradient id={`stream-grad-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color={agent.color} stop-opacity="0.75" />
                      <stop offset="100%" stop-color={agent.color} stop-opacity="0.15" />
                    </linearGradient>
                  }
                </defs>

                {/* Y Axis Gridlines & Labels */}
                @for (const tick of yTicks()) {
                  <g>
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
                      {tick.val}{lensConfig().unit}
                    </text>
                  </g>
                }

                {/* X Axis Gridlines & Time Labels */}
                @for (const tick of xTicks()) {
                  <g>
                    <line
                      x1={tick.x}
                      y1={margin.top}
                      x2={tick.x}
                      y2={margin.top + plotHeight()}
                      stroke="#1e293b"
                      stroke-dasharray="2 2"
                      stroke-width="1"
                    />
                    <text
                      x={tick.x}
                      y={margin.top + plotHeight() + 14}
                      fill="#64748b"
                      font-size="9"
                      font-family="monospace"
                      text-anchor="middle"
                    >
                      {tick.label}
                    </text>
                  </g>
                }

                {/* Reference SLA / Target Benchmark Line */}
                @if (referenceLine().val >= yDomain().min && referenceLine().val <= yDomain().max) {
                  <g>
                    <line
                      x1={margin.left}
                      y1={getY(referenceLine().val)}
                      x2={svgWidth - margin.right}
                      y2={getY(referenceLine().val)}
                      stroke={referenceLine().color}
                      stroke-width="1.5"
                      stroke-dasharray="5 4"
                      opacity="0.8"
                    />
                    <text
                      x={svgWidth - margin.right - 4}
                      y={getY(referenceLine().val) - 4}
                      fill={referenceLine().color}
                      font-size="9"
                      font-weight="bold"
                      font-family="monospace"
                      text-anchor="end"
                    >
                      {referenceLine().label}
                    </text>
                  </g>
                }

                {/* STACKED AREA LAYERS */}
                @if (chartMode.value === "stacked" && storyLens() !== "quality") {
                  @for (const series of stackedSeries()) {
                    <g class="transition-opacity duration-200">
                      @if (areaPathGenerator()(series)) {
                        <path
                          d={areaPathGenerator()(series)}
                          fill={`url(#stream-grad-${series.key})`}
                          opacity="0.85"
                        />
                      }
                      @if (lineTopGenerator()(series)) {
                        <path
                          d={lineTopGenerator()(series)}
                          fill="none"
                          stroke={agents().find((a: any) => a.id === series.key)?.color || "#38bdf8"}
                          stroke-width="1.5"
                          opacity="0.9"
                        />
                      }
                    </g>
                  }
                } @else {
                  {/* OVERLAY LINE CHARTS */}
                  @for (const agent of visibleAgentsList()) {
                    <g>
                      @if (getOverlayPath(agent.id)) {
                        <path
                          d={getOverlayPath(agent.id)}
                          fill="none"
                          stroke={agent.color}
                          stroke-width="2"
                          opacity="0.85"
                        />
                      }
                    </g>
                  }
                }

                {/* Anomalies Pulse Markers */}
                @for (let pt of displayData(); index i) {
                  @if (pt.anomalyDetected) {
                    <g>
                      <circle cx={getX(i)} cy={getY(pt[pt.anomalyAgent] || pt.gemini || 0)} r="8" fill="#f43f5e" opacity="0.3" class="animate-ping" />
                      <circle cx={getX(i)} cy={getY(pt[pt.anomalyAgent] || pt.gemini || 0)} r="4" fill="#f43f5e" stroke="#fff" stroke-width="1.5" />
                    </g>
                  }
                }

                {/* Interactive Crosshair Line */}
                @if (hoveredIndex.value !== null) {
                  <g>
                    <line
                      x1={getX(hoveredIndex.value!)}
                      y1={margin.top}
                      x2={getX(hoveredIndex.value!)}
                      y2={margin.top + plotHeight()}
                      stroke="#e2e8f0"
                      stroke-width="1"
                      stroke-dasharray="3 3"
                    />
                    <circle cx={getX(hoveredIndex.value!)} cy={margin.top + 2} r="3" fill="#38bdf8" />
                  </g>
                }
              </svg>

              {/* Interactive Tooltip Card */}
              @if (hoveredIndex.value !== null && displayData()[hoveredIndex.value!]) {
                <div
                  class="absolute pointer-events-none z-50 bg-[#0f172a]/95 border border-[#334155] rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[210px] transition-all"
                  style={{
                    left: getX(hoveredIndex.value!) > svgWidth * 0.65 ? `${Math.max(10, getX(hoveredIndex.value!) * 0.95 - 230)}px` : `${getX(hoveredIndex.value!) * 0.95 + 20}px`,
                    top: "10px"
                  }}
                >
                  <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <div class="flex items-center gap-1.5 text-slate-300 font-mono font-medium">
                      @if (storyLens() === "quality") {
                        <ShieldCheckIcon class="w-3.5 h-3.5 text-emerald-400" />
                      } @else if (storyLens() === "value") {
                        <DollarSignIcon class="w-3.5 h-3.5 text-amber-400" />
                      } @else {
                        <ClockIcon class="w-3.5 h-3.5 text-sky-400" />
                      }
                      <span>{displayData()[hoveredIndex.value!].time}</span>
                    </div>
                    @if (displayData()[hoveredIndex.value!].anomalyDetected) {
                      <span class="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-semibold flex items-center gap-1">
                        <ZapIcon class="w-2.5 h-2.5 text-rose-400" /> Anomaly Dip
                      </span>
                    }
                  </div>

                  @if (chartMode.value === "stacked") {
                    <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-850 text-[11px] font-semibold text-slate-400">
                      <span>{storyLens() === "quality" ? "Fleet Average Quality:" : storyLens() === "value" ? "Total Fleet Output/Min:" : "Cumulative Fleet Latency:"}</span>
                      <span class="font-mono text-brand-300">
                        {storyLens() === "quality"
                          ? `${(visibleAgentsList().reduce((acc: number, a: any) => acc + (Number(displayData()[hoveredIndex.value!][a.id]) || 0), 0) / (visibleAgentsList().length || 1)).toFixed(1)}%`
                          : storyLens() === "value"
                            ? `$${visibleAgentsList().reduce((acc: number, a: any) => acc + (Number(displayData()[hoveredIndex.value!][a.id]) || 0), 0).toLocaleString()}/min`
                            : `${visibleAgentsList().reduce((acc: number, a: any) => acc + (Number(displayData()[hoveredIndex.value!][a.id]) || 0), 0).toFixed(2)}s`
                        }
                      </span>
                    </div>
                  }

                  <div class="space-y-1.5">
                    @for (const agent of visibleAgentsList()) {
                      <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full flex-shrink-0" style={{ "background-color": agent.color }}></span>
                          <span class="text-slate-300 truncate max-w-[130px]">{agent.name}</span>
                        </div>
                        <span class="font-mono font-semibold text-slate-100">
                          {storyLens() === "value" ? `$${displayData()[hoveredIndex.value!][agent.id]}/m` : `${displayData()[hoveredIndex.value!][agent.id]}${lensConfig().unit}`}
                        </span>
                      </div>
                    }
                  </div>

                  @if (displayData()[hoveredIndex.value!].anomalyDetected && displayData()[hoveredIndex.value!].anomalyReason) {
                    <div class="mt-2 pt-2 border-t border-slate-800 text-[11px] text-amber-300/90 flex items-start gap-1">
                      <AlertCircleIcon class="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{displayData()[hoveredIndex.value!].anomalyReason}</span>
                    </div>
                  }
                </div>
              }
            </div>
          }

          {/* 2. STACKED MULTI-LANES MODE */}
          @if (chartMode.value === "lanes") {
            <div class="space-y-1 pt-1">
              @for (const agent of visibleAgentsList()) {
                <div class="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-lg px-2.5 py-1 text-xs hover:border-slate-700 transition-colors">
                  <div class="w-28 sm:w-36 flex-shrink-0 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full flex-shrink-0" style={{ "background-color": agent.color }}></span>
                    <span class="font-semibold text-slate-200 truncate text-[11px]">
                      {agent.name.split(" ")[0]}
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
                    <span class={`font-mono text-xs font-bold ${
                      (storyLens() === "speed" ? (displayData()[displayData().length - 1]?.[agent.id] ?? agent.avgLatency) > 3.5 : (displayData()[displayData().length - 1]?.[agent.id] ?? 90) < 80)
                        ? "text-amber-400"
                        : "text-slate-200"
                    }`}>
                      {storyLens() === "value"
                        ? `$${displayData()[displayData().length - 1]?.[agent.id] ?? 0}/m`
                        : `${displayData()[displayData().length - 1]?.[agent.id] ?? (storyLens() === "speed" ? agent.avgLatency : 90)}${lensConfig().unit}`
                      }
                    </span>
                    <span class="text-[9px] text-slate-500 block font-mono">
                      {storyLens() === "speed" ? `avg ${agent.avgLatency}s` : storyLens() === "quality" ? `${agent.workforce?.firstTimeRightRate}% FTR` : `$${((agent.workforce?.totalEconomicValue || 0)/1000).toFixed(0)}k net`}
                    </span>
                  </div>
                </div>
              }
            </div>
          }

          {/* Quick Context Footer */}
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
              <span>{"•"}</span>
              <span class="text-emerald-400 font-medium">Story Lens: {storyLens().toUpperCase()}</span>
            </div>
          </div>
        </div>
      }
    </div>
  </div>
}
