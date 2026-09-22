import React, { useState, useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
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
  DollarSign,
  Activity
} from 'lucide-react';

export function PersistentTTRTimeline() {
  const {
    agents,
    timelineData,
    visibleTimelineAgents,
    toggleTimelineAgent,
    fleetKPIs,
    workforceKPIs,
    storyLens,
    setStoryLens
  } = useDashboard();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chartMode, setChartMode] = useState('stacked'); // 'stacked' | 'lanes' | 'overlay'
  const [isCompact, setIsCompact] = useState(true);

  // Adapt timeline points dynamically based on the active Story Lens
  const displayData = useMemo(() => {
    return timelineData.map(pt => {
      const out = {
        time: pt.time,
        timestamp: pt.timestamp,
        anomalyDetected: pt.anomalyDetected,
        anomalyAgent: pt.anomalyAgent,
        anomalyReason: pt.anomalyReason
      };
      agents.forEach(a => {
        if (storyLens === 'quality') {
          out[a.id] = pt.quality ? pt.quality[a.id] : 90;
        } else if (storyLens === 'value') {
          out[a.id] = pt.value ? pt.value[a.id] : 40;
        } else {
          out[a.id] = pt.speed ? pt.speed[a.id] : (typeof pt[a.id] === 'number' ? pt[a.id] : 1.5);
        }
      });
      return out;
    });
  }, [timelineData, agents, storyLens]);

  // Unit and label helpers
  const lensConfig = useMemo(() => {
    switch (storyLens) {
      case 'quality':
        return {
          title: 'First-Time Right (FTR) Quality Pulse',
          unit: '%',
          fleetSummary: `Fleet FTR: ${workforceKPIs.firstTimeRightRate}%`,
          icon: ShieldCheck,
          iconColor: 'text-emerald-400',
          gradientBg: 'bg-emerald-500/10 border-emerald-500/20'
        };
      case 'value':
        return {
          title: 'Real-Time Economic Output ($/min)',
          unit: '$/m',
          fleetSummary: `Fleet ROI: ${workforceKPIs.netROI.toLocaleString()}x`,
          icon: DollarSign,
          iconColor: 'text-amber-400',
          gradientBg: 'bg-amber-500/10 border-amber-500/20'
        };
      case 'speed':
      default:
        return {
          title: 'Time-to-Result (TTR) Response Velocity',
          unit: 's',
          fleetSummary: `Fleet Avg: ${fleetKPIs.avgLatency}s`,
          icon: Clock,
          iconColor: 'text-sky-400',
          gradientBg: 'bg-sky-500/10 border-sky-500/20'
        };
    }
  }, [storyLens, fleetKPIs, workforceKPIs]);

  // Custom sleek tooltip that handles multi-lens values
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0]?.payload;
    const totalStacked = payload.reduce((acc, curr) => acc + (typeof curr.value === 'number' ? curr.value : 0), 0);
    const avgVal = (totalStacked / (payload.length || 1)).toFixed(1);

    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[240px] z-50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono font-medium">
            <lensConfig.icon className={`w-3.5 h-3.5 ${lensConfig.iconColor}`} />
            <span>{label}</span>
          </div>
          {dataPoint?.anomalyDetected && (
            <span className="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-semibold flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-rose-400" /> Anomaly Dip
            </span>
          )}
        </div>

        {chartMode === 'stacked' && (
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-850 text-[11px] font-semibold text-slate-400">
            <span>{storyLens === 'quality' ? 'Fleet Average Quality:' : storyLens === 'value' ? 'Total Fleet Output/Min:' : 'Cumulative Fleet Latency:'}</span>
            <span className="font-mono text-brand-300">
              {storyLens === 'quality' ? `${avgVal}%` : storyLens === 'value' ? `$${totalStacked.toLocaleString()}/min` : `${totalStacked.toFixed(2)}s`}
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          {payload.map((entry) => {
            const agent = agents.find(a => a.id === entry.dataKey);
            if (!agent) return null;
            return (
              <div key={entry.dataKey} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-300 truncate max-w-[130px]">{agent.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-100">
                  {storyLens === 'value' ? `$${entry.value}/m` : `${entry.value}${lensConfig.unit}`}
                </span>
              </div>
            );
          })}
        </div>

        {dataPoint?.anomalyDetected && dataPoint?.anomalyReason && (
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-amber-300/90 flex items-start gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>{dataPoint.anomalyReason}</span>
          </div>
        )}
      </div>
    );
  };

  const visibleAgentsList = agents.filter(a => visibleTimelineAgents.includes(a.id));

  return (
    <div className="bg-slate-900/70 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 transition-all duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Banner Header: Title, Story Lens Switcher, Stack Controls, Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${lensConfig.gradientBg}`}>
              <lensConfig.icon className={`w-4 h-4 ${lensConfig.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  {lensConfig.title}
                </h2>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  {chartMode === 'stacked' ? 'Stacked Layers' : chartMode === 'lanes' ? 'Stacked Multi-Lanes' : 'Overlay Lines'}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                  {lensConfig.fleetSummary}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
            {/* Story Lens Switcher: Speed vs Quality vs Value */}
            <div className="flex items-center bg-slate-950/90 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setStoryLens('speed')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  storyLens === 'speed'
                    ? 'bg-sky-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Response Velocity in Seconds (Time-to-Result)"
              >
                <Clock className="w-3 h-3" />
                <span>Speed (s)</span>
              </button>

              <button
                onClick={() => setStoryLens('quality')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  storyLens === 'quality'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="First-Time Right Accuracy without reprompts or errors"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Quality (FTR %)</span>
              </button>

              <button
                onClick={() => setStoryLens('value')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  storyLens === 'value'
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Real-Time Economic Output delivered per minute"
              >
                <DollarSign className="w-3 h-3" />
                <span>Value ($/m)</span>
              </button>
            </div>

            {/* View Mode Switcher: Stacked vs Lanes vs Overlay */}
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setChartMode('stacked')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartMode === 'stacked'
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Stacked Area: Layered non-overlapping bands"
              >
                <Layers className="w-3 h-3" />
                <span className="hidden sm:inline">Stacked</span>
              </button>

              <button
                onClick={() => setChartMode('lanes')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartMode === 'lanes'
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Stacked Multi-Lanes: Clean isolated rows per agent"
              >
                <AlignJustify className="w-3 h-3" />
                <span>Stacked Lanes</span>
              </button>

              <button
                onClick={() => setChartMode('overlay')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartMode === 'overlay'
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Overlay Lines: Classic overlapping lines"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Overlay</span>
              </button>
            </div>

            {/* Compact / Comfort Toggle */}
            <button
              onClick={() => setIsCompact(!isCompact)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1 text-[11px]"
              title={isCompact ? 'Expand vertical space' : 'Compress vertical space'}
            >
              {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              <span>{isCompact ? 'Comfort' : 'Compress'}</span>
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand Timeline' : 'Collapse Timeline'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Chart Body */}
        {!isCollapsed && (
          <div className="relative">
            {/* Agent Visibility Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pb-1.5 text-[11px]">
              <span className="text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {agents.map((agent) => {
                const isVisible = visibleTimelineAgents.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    onClick={() => toggleTimelineAgent(agent.id)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                      isVisible
                        ? 'bg-slate-800/90 text-slate-200 border-slate-700 shadow-sm'
                        : 'bg-slate-950/40 text-slate-500 border-slate-850 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: isVisible ? agent.color : '#64748b' }}
                    />
                    <span className="truncate max-w-[85px]">{agent.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* 1. STACKED AREA MODE (Layered Non-Overlapping Bands) */}
            {chartMode === 'stacked' && (
              <div className={`w-full pt-1 transition-all ${isCompact ? 'h-36 sm:h-40' : 'h-48 sm:h-56'}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={displayData}
                    margin={{ top: 6, right: 12, left: -20, bottom: 0 }}
                  >
                    <defs>
                      {agents.map((agent) => (
                        <linearGradient key={`grad-${agent.id}`} id={`grad-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={agent.color} stopOpacity={0.65} />
                          <stop offset="95%" stopColor={agent.color} stopOpacity={0.2} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#475569"
                      fontSize={9}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      unit={lensConfig.unit}
                      domain={storyLens === 'quality' ? [60, 100] : [0, 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Stacked Areas in Reverse/Consistent Order so largest or most stable are on bottom */}
                    {agents.map((agent) => {
                      if (!visibleTimelineAgents.includes(agent.id)) return null;
                      return (
                        <Area
                          key={agent.id}
                          type="monotone"
                          dataKey={agent.id}
                          name={agent.name}
                          stackId={storyLens === 'quality' ? undefined : "1"}
                          stroke={agent.color}
                          strokeWidth={1.5}
                          fill={`url(#grad-${agent.id})`}
                          isAnimationActive={false}
                        />
                      );
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 2. STACKED MULTI-LANES MODE (Compact Horizon Strips Per Agent) */}
            {chartMode === 'lanes' && (
              <div className="space-y-1 pt-1">
                {visibleAgentsList.map((agent) => {
                  const lastVal = displayData[displayData.length - 1]?.[agent.id] ?? (storyLens === 'speed' ? agent.avgLatency : 90);
                  const isHigh = storyLens === 'speed' ? lastVal > 3.5 : lastVal < 80;

                  return (
                    <div
                      key={agent.id}
                      className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-lg px-2.5 py-1 text-xs hover:border-slate-700 transition-colors"
                    >
                      {/* Lane Identity */}
                      <div className="w-28 sm:w-36 flex-shrink-0 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: agent.color }}
                        />
                        <span className="font-semibold text-slate-200 truncate text-[11px]">
                          {agent.name.split(' ')[0]}
                        </span>
                      </div>

                      {/* Sparkline Lane (Compressed mini SVG Area) */}
                      <div className="flex-1 h-6 min-w-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={displayData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id={`lane-grad-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={agent.color} stopOpacity={0.6} />
                                <stop offset="100%" stopColor={agent.color} stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey={agent.id}
                              stroke={agent.color}
                              strokeWidth={1.5}
                              fill={`url(#lane-grad-${agent.id})`}
                              isAnimationActive={false}
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Value & Indicator */}
                      <div className="w-20 text-right flex-shrink-0">
                        <span className={`font-mono text-xs font-bold ${isHigh ? 'text-amber-400' : 'text-slate-200'}`}>
                          {storyLens === 'value' ? `$${lastVal}/m` : `${lastVal}${lensConfig.unit}`}
                        </span>
                        <span className="text-[9px] text-slate-500 block font-mono">
                          {storyLens === 'speed' ? `avg ${agent.avgLatency}s` : storyLens === 'quality' ? `${agent.workforce?.firstTimeRightRate}% FTR` : `$${(agent.workforce?.totalEconomicValue/1000).toFixed(0)}k net`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. OVERLAY LINES MODE (Original criss-crossing lines) */}
            {chartMode === 'overlay' && (
              <div className={`w-full pt-1 transition-all ${isCompact ? 'h-36 sm:h-40' : 'h-48 sm:h-56'}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={displayData}
                    margin={{ top: 6, right: 12, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#475569"
                      fontSize={9}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      unit={lensConfig.unit}
                      domain={storyLens === 'quality' ? [60, 100] : [0, 'dataMax + 1']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      y={storyLens === 'quality' ? 95 : storyLens === 'value' ? 100 : 3.5}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                      label={{
                        value: storyLens === 'quality' ? '95% FTR SLA' : storyLens === 'value' ? '$100/m Target' : '3.5s SLA',
                        fill: '#f59e0b',
                        fontSize: 9,
                        position: 'insideTopRight'
                      }}
                    />
                    {agents.map((agent) => {
                      if (!visibleTimelineAgents.includes(agent.id)) return null;
                      return (
                        <Line
                          key={agent.id}
                          type="monotone"
                          dataKey={agent.id}
                          name={agent.name}
                          stroke={agent.color}
                          strokeWidth={agent.id === 'promo-shadow' ? 2 : 1.5}
                          dot={false}
                          activeDot={{ r: 3.5, strokeWidth: 1, stroke: '#ffffff' }}
                          isAnimationActive={false}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Quick Context Footer */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Fast / High FTR: Price Match &amp; Support
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Under Coaching: Promo Strategy Shadow
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  High Economic Value: Deep Research Analyst
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">{displayData.length} samples</span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-medium">Story Lens: {storyLens.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
