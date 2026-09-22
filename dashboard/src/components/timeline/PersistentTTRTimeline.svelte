<script>
  import { dashboardState } from '../../state/dashboardState.svelte.js';
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
  } from '@lucide/svelte';

  let isCollapsed = $state(false);
  let chartMode = $state('stacked'); // 'stacked' | 'lanes' | 'overlay'
  let isCompact = $state(true);
  let hoveredIndex = $state(null);
  let mousePos = $state({ x: 0, y: 0 });

  const agents = $derived(dashboardState.agents);
  const timelineData = $derived(dashboardState.timelineData);
  const visibleTimelineAgents = $derived(dashboardState.visibleTimelineAgents);
  const storyLens = $derived(dashboardState.timelineMetric);

  const displayData = $derived.by(() => {
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
          out[a.id] = pt.quality ? pt.quality[a.id] : (a.id === 'promo-shadow' ? (pt.anomalyDetected ? 78 : 88) : 94);
        } else if (storyLens === 'value') {
          out[a.id] = pt.value ? pt.value[a.id] : (a.id === 'deep-research' ? 972 : 45);
        } else {
          out[a.id] = pt.speed ? pt.speed[a.id] : (typeof pt[a.id] === 'number' ? pt[a.id] : 1.5);
        }
      });
      return out;
    });
  });

  const lensConfig = $derived.by(() => {
    switch (storyLens) {
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
          fleetSummary: `Fleet ROI: ${(dashboardState.workforceKPIs?.netROI || 6650).toLocaleString()}x`,
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

  // Calculate SVG coordinates
  const svgWidth = 1000;
  const svgHeight = $derived(isCompact ? 140 : 200);

  function getX(index, total) {
    if (total <= 1) return 40;
    return 40 + (index / (total - 1)) * (svgWidth - 60);
  }

  function getY(val, min = 0, max = 10) {
    const range = max - min || 1;
    const clamped = Math.max(min, Math.min(max, val));
    return svgHeight - 25 - ((clamped - min) / range) * (svgHeight - 45);
  }

  function createAreaPath(agentId, data) {
    if (!data.length) return '';
    const points = data.map((d, i) => {
      const val = d[agentId] || 0;
      const maxVal = storyLens === 'quality' ? 100 : storyLens === 'value' ? 1200 : 8;
      const minVal = storyLens === 'quality' ? 60 : 0;
      return `${getX(i, data.length)},${getY(val, minVal, maxVal)}`;
    });

    const firstX = getX(0, data.length);
    const lastX = getX(data.length - 1, data.length);
    const baseY = svgHeight - 20;

    return `M ${firstX},${baseY} L ${points.join(' L ')} L ${lastX},${baseY} Z`;
  }

  function createLinePath(agentId, data) {
    if (!data.length) return '';
    const points = data.map((d, i) => {
      const val = d[agentId] || 0;
      const maxVal = storyLens === 'quality' ? 100 : storyLens === 'value' ? 1200 : 8;
      const minVal = storyLens === 'quality' ? 60 : 0;
      return `${getX(i, data.length)},${getY(val, minVal, maxVal)}`;
    });
    return `M ${points.join(' L ')}`;
  }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (x - 40) / (rect.width - 60)));
    const idx = Math.round(ratio * (displayData.length - 1));
    hoveredIndex = idx;
    mousePos = { x: e.clientX, y: e.clientY };
  }

  function handleMouseLeave() {
    hoveredIndex = null;
  }
</script>

<div class="bg-slate-900/70 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 transition-all duration-200">
  <div class="max-w-7xl mx-auto">
    <!-- Header Banner -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-2">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 {lensConfig.gradientBg}">
          {#if storyLens === 'quality'}
            <ShieldCheck class="w-4 h-4 text-emerald-400" />
          {:else if storyLens === 'value'}
            <DollarSign class="w-4 h-4 text-amber-400" />
          {:else}
            <Clock class="w-4 h-4 text-sky-400" />
          {/if}
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              {lensConfig.title}
            </h2>
            <span class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {chartMode === 'stacked' ? 'Stacked Layers' : chartMode === 'lanes' ? 'Stacked Multi-Lanes' : 'Overlay Lines'}
            </span>
            <span class="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {lensConfig.fleetSummary}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
        <!-- Lens Switcher -->
        <div class="flex items-center bg-slate-950/90 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onclick={() => dashboardState.setTimelineMetric('speed')}
            class="flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all {storyLens === 'speed' ? 'bg-sky-600 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'}"
          >
            <Clock class="w-3 h-3" />
            <span>Speed (s)</span>
          </button>
          <button
            onclick={() => dashboardState.setTimelineMetric('quality')}
            class="flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all {storyLens === 'quality' ? 'bg-emerald-600 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'}"
          >
            <ShieldCheck class="w-3 h-3" />
            <span>Quality (FTR %)</span>
          </button>
          <button
            onclick={() => dashboardState.setTimelineMetric('value')}
            class="flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all {storyLens === 'value' ? 'bg-amber-600 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'}"
          >
            <DollarSign class="w-3 h-3" />
            <span>Value ($/m)</span>
          </button>
        </div>

        <!-- Mode Switcher -->
        <div class="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onclick={() => chartMode = 'stacked'}
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all {chartMode === 'stacked' ? 'bg-brand-600 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'}"
          >
            <Layers class="w-3 h-3" />
            <span class="hidden sm:inline">Stacked</span>
          </button>
          <button
            onclick={() => chartMode = 'lanes'}
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all {chartMode === 'lanes' ? 'bg-brand-600 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'}"
          >
            <AlignJustify class="w-3 h-3" />
            <span>Stacked Lanes</span>
          </button>
          <button
            onclick={() => chartMode = 'overlay'}
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all {chartMode === 'overlay' ? 'bg-brand-600 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'}"
          >
            <TrendingUp class="w-3 h-3" />
            <span>Overlay</span>
          </button>
        </div>

        <!-- Compact Toggle -->
        <button
          onclick={() => isCompact = !isCompact}
          class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1 text-[11px]"
        >
          {#if isCompact}
            <Maximize2 class="w-3.5 h-3.5" />
            <span>Comfort</span>
          {:else}
            <Minimize2 class="w-3.5 h-3.5" />
            <span>Compress</span>
          {/if}
        </button>

        <!-- Collapse Toggle -->
        <button
          onclick={() => isCollapsed = !isCollapsed}
          class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          {#if isCollapsed}
            <ChevronDown class="w-4 h-4" />
          {:else}
            <ChevronUp class="w-4 h-4" />
          {/if}
        </button>
      </div>
    </div>

    <!-- Collapsible Chart Body -->
    {#if !isCollapsed}
      <div class="relative">
        <!-- Filter chips -->
        <div class="flex items-center gap-1.5 flex-wrap pb-1.5 text-[11px]">
          <span class="text-slate-500 mr-1 flex items-center gap-1">
            <Filter class="w-3 h-3" /> Filter:
          </span>
          {#each agents as agent}
            {@const isVisible = visibleTimelineAgents.includes(agent.id)}
            <button
              class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all {isVisible ? 'bg-slate-800/90 text-slate-200 border-slate-700 shadow-sm' : 'bg-slate-950/40 text-slate-500 border-slate-850 opacity-60 hover:opacity-100'}"
            >
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: {isVisible ? agent.color : '#64748b'}"></span>
              <span class="truncate max-w-[85px]">{agent.name.split(' ')[0]}</span>
            </button>
          {/each}
        </div>

        <!-- SVG Timeline Chart -->
        {#if chartMode === 'stacked' || chartMode === 'overlay'}
          <div
            class="w-full relative cursor-crosshair overflow-hidden rounded-lg bg-slate-950/40 border border-slate-800/60"
            style="height: {svgHeight}px;"
            onmousemove={handleMouseMove}
            onmouseleave={handleMouseLeave}
          >
            <svg
              viewBox="0 0 {svgWidth} {svgHeight}"
              class="w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                {#each agents as agent}
                  <linearGradient id="svelte-grad-{agent.id}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color={agent.color} stop-opacity="0.6" />
                    <stop offset="95%" stop-color={agent.color} stop-opacity="0.1" />
                  </linearGradient>
                {/each}
              </defs>

              <!-- Grid horizontal lines -->
              <line x1="40" y1={svgHeight - 20} x2={svgWidth - 20} y2={svgHeight - 20} stroke="#334155" stroke-width="1" />
              <line x1="40" y1={svgHeight * 0.5} x2={svgWidth - 20} y2={svgHeight * 0.5} stroke="#1e293b" stroke-dasharray="3 3" />
              <line x1="40" y1={svgHeight * 0.25} x2={svgWidth - 20} y2={svgHeight * 0.25} stroke="#1e293b" stroke-dasharray="3 3" />

              <!-- Benchmark SLA Reference Line -->
              {#if storyLens === 'speed'}
                {@const slaY = getY(1.5, 0, 8)}
                <line x1="40" y1={slaY} x2={svgWidth - 20} y2={slaY} stroke="#f43f5e" stroke-dasharray="4 4" stroke-width="1.5" opacity="0.8" />
                <text x={svgWidth - 25} y={slaY - 4} fill="#f43f5e" font-size="9" text-anchor="end" font-weight="bold">1.50s Enterprise SLA Benchmark</text>
              {:else if storyLens === 'quality'}
                {@const ftrY = getY(90, 60, 100)}
                <line x1="40" y1={ftrY} x2={svgWidth - 20} y2={ftrY} stroke="#10b981" stroke-dasharray="4 4" stroke-width="1.5" opacity="0.8" />
                <text x={svgWidth - 25} y={ftrY - 4} fill="#10b981" font-size="9" text-anchor="end" font-weight="bold">90% FTR Quality Target</text>
              {/if}

              <!-- Paths -->
              {#each agents as agent}
                {#if visibleTimelineAgents.includes(agent.id)}
                  {#if chartMode === 'stacked'}
                    <path
                      d={createAreaPath(agent.id, displayData)}
                      fill="url(#svelte-grad-{agent.id})"
                      stroke={agent.color}
                      stroke-width="1.5"
                      opacity="0.85"
                    />
                  {:else}
                    <path
                      d={createLinePath(agent.id, displayData)}
                      fill="none"
                      stroke={agent.color}
                      stroke-width="2"
                      opacity="0.9"
                    />
                  {/if}
                {/if}
              {/each}

              <!-- Hover cursor vertical line -->
              {#if hoveredIndex !== null}
                {@const hoverX = getX(hoveredIndex, displayData.length)}
                <line x1={hoverX} y1="10" x2={hoverX} y2={svgHeight - 20} stroke="#38bdf8" stroke-dasharray="2 2" stroke-width="1.5" />
              {/if}
            </svg>

            <!-- Interactive Tooltip Overlay -->
            {#if hoveredIndex !== null && displayData[hoveredIndex]}
              {@const point = displayData[hoveredIndex]}
              <div
                class="absolute pointer-events-none bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[220px] z-50"
                style="top: 10px; left: {Math.min(mousePos.x - 50, window.innerWidth - 260)}px;"
              >
                <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <span class="text-slate-300 font-mono font-medium">{point.time}</span>
                  {#if point.anomalyDetected}
                    <span class="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-semibold flex items-center gap-1">
                      <Zap class="w-2.5 h-2.5 text-rose-400" /> Anomaly Dip
                    </span>
                  {/if}
                </div>
                <div class="space-y-1">
                  {#each agents as a}
                    {#if visibleTimelineAgents.includes(a.id)}
                      <div class="flex items-center justify-between gap-3 text-[11px]">
                        <div class="flex items-center gap-1.5">
                          <span class="w-2 h-2 rounded-full" style="background-color: {a.color}"></span>
                          <span class="text-slate-300 truncate max-w-[120px]">{a.name}</span>
                        </div>
                        <span class="font-mono font-bold text-slate-100">
                          {point[a.id]}{lensConfig.unit}
                        </span>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <!-- Stacked Multi-Lanes Mode -->
          <div class="space-y-1.5 pt-1">
            {#each agents as agent}
              {#if visibleTimelineAgents.includes(agent.id)}
                <div class="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div class="w-32 flex items-center gap-1.5 text-xs">
                    <span class="w-2 h-2 rounded-full" style="background-color: {agent.color}"></span>
                    <span class="font-medium truncate text-slate-200">{agent.name}</span>
                  </div>
                  <div class="flex-1 h-8">
                    <svg viewBox="0 0 500 32" class="w-full h-full" preserveAspectRatio="none">
                      <path
                        d={createLinePath(agent.id, displayData)}
                        fill="none"
                        stroke={agent.color}
                        stroke-width="1.8"
                      />
                    </svg>
                  </div>
                  <div class="w-20 text-right font-mono text-xs font-semibold text-slate-200">
                    {displayData[displayData.length - 1]?.[agent.id] || '1.2'}{lensConfig.unit}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
