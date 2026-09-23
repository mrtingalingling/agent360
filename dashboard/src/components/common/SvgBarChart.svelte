<script>
  let {
    data = [],
    xKey = 'name',
    bars = [],
    yUnit = '',
    height = 256,
    isStacked = false,
    tooltipFormatter = null,
    showLegend = true
  } = $props();

  let hoveredGroup = $state(null);
  let mousePos = $state({ x: 0, y: 0 });

  const svgWidth = 600;
  const legendHeight = $derived(showLegend && bars.length > 1 ? 30 : 0);
  const svgHeight = $derived(height - legendHeight);
  const margin = { top: 12, right: 15, bottom: 24, left: 42 };

  const plotWidth = $derived(svgWidth - margin.left - margin.right);
  const plotHeight = $derived(svgHeight - margin.top - margin.bottom);

  // Compute maximum value across data items
  const maxVal = $derived.by(() => {
    let max = 0;
    data.forEach(d => {
      if (isStacked) {
        let sum = 0;
        bars.forEach(b => {
          sum += Number(d[b.key] || 0);
        });
        if (sum > max) max = sum;
      } else {
        bars.forEach(b => {
          const v = Number(d[b.key] || 0);
          if (v > max) max = v;
        });
      }
    });
    return max > 0 ? max * 1.15 : 10;
  });

  // 4 Y-ticks
  const yTicks = $derived.by(() => {
    const ticks = [];
    const step = maxVal / 4;
    for (let i = 0; i <= 4; i++) {
      const val = step * i;
      const y = margin.top + plotHeight - (val / maxVal) * plotHeight;
      ticks.push({
        value: val >= 10 ? Math.round(val) : +val.toFixed(1),
        y
      });
    }
    return ticks;
  });

  function getBarHeight(val) {
    const clamped = Math.max(0, Math.min(maxVal, val));
    return (clamped / maxVal) * plotHeight;
  }

  function getStackedSegments(item) {
    let currentY = margin.top + plotHeight;
    return bars.map((bar, idx) => {
      const val = Number(item[bar.key] || 0);
      const h = getBarHeight(val);
      const y = currentY - h;
      currentY = y;
      return {
        bar,
        val,
        y,
        h,
        color: item.color || bar.color || '#38bdf8',
        isTop: idx === bars.length - 1
      };
    });
  }

  function handleMouseMove(e, index) {
    hoveredGroup = index;
    const rect = e.currentTarget.getBoundingClientRect();
    mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function handleMouseLeave() {
    hoveredGroup = null;
  }
</script>

<div class="relative w-full h-full select-none flex flex-col justify-between" onmouseleave={handleMouseLeave}>
  <div class="w-full flex-1 min-h-0 relative">
    <svg
      viewBox="0 0 {svgWidth} {svgHeight}"
      class="w-full h-full overflow-visible"
      preserveAspectRatio="none"
    >
    <!-- Cartesian Grid Lines (horizontal only, matching Recharts) -->
    {#each yTicks as tick}
      <line
        x1={margin.left}
        y1={tick.y}
        x2={svgWidth - margin.right}
        y2={tick.y}
        stroke="#1e293b"
        stroke-dasharray="3 3"
      />
      <text
        x={margin.left - 8}
        y={tick.y + 4}
        fill="#64748b"
        font-size="11"
        font-family="monospace"
        text-anchor="end"
      >
        {tick.value}{yUnit}
      </text>
    {/each}

    <!-- Bottom X Axis Line -->
    <line
      x1={margin.left}
      y1={margin.top + plotHeight}
      x2={svgWidth - margin.right}
      y2={margin.top + plotHeight}
      stroke="#334155"
      stroke-width="1"
    />

    <!-- Bars & X Labels -->
    {#if data.length > 0}
      {@const groupWidth = plotWidth / data.length}
      {@const barCount = bars.length}

      {#each data as item, i}
        {@const groupCenterX = margin.left + i * groupWidth + groupWidth / 2}
        {@const isHovered = hoveredGroup === i}

        <!-- Hover background highlight column -->
        {#if isHovered}
          <rect
            x={margin.left + i * groupWidth}
            y={margin.top}
            width={groupWidth}
            height={plotHeight}
            fill="#38bdf8"
            opacity="0.04"
            rx="4"
          />
        {/if}

        {#if isStacked}
          <!-- STACKED BARS MODE -->
          {@const barW = Math.max(12, Math.min(36, groupWidth * 0.4))}
          {@const barX = groupCenterX - barW / 2}
          {@const segments = getStackedSegments(item)}

          {#each segments as seg}
            {#if seg.h > 0}
              <rect
                x={barX}
                y={seg.y}
                width={barW}
                height={seg.h}
                fill={seg.color}
                rx={seg.isTop ? 3 : 0}
                ry={seg.isTop ? 3 : 0}
                class="transition-opacity duration-150 cursor-pointer"
                opacity={hoveredGroup !== null && !isHovered ? 0.6 : 0.95}
                onmousemove={(e) => handleMouseMove(e, i)}
              />
            {/if}
          {/each}
        {:else}
          <!-- GROUPED BARS MODE -->
          {@const pad = groupWidth * 0.15}
          {@const availableWidth = groupWidth - pad * 2}
          {@const singleBarWidth = availableWidth / barCount}
          {@const groupLeft = margin.left + i * groupWidth + pad}

          {#each bars as bar, bIdx}
            {@const val = Number(item[bar.key] || 0)}
            {@const barX = groupLeft + bIdx * singleBarWidth}
            {@const barW = Math.max(4, singleBarWidth - 2)}
            {@const barH = Math.max(1, getBarHeight(val))}
            {@const barY = margin.top + plotHeight - barH}
            {@const color = item.color || bar.color || '#38bdf8'}

            <rect
              x={barX}
              y={barY}
              width={barW}
              height={barH}
              fill={color}
              rx="3"
              ry="3"
              class="transition-opacity duration-150 cursor-pointer"
              opacity={hoveredGroup !== null && !isHovered ? 0.6 : 0.95}
              onmousemove={(e) => handleMouseMove(e, i)}
            />
          {/each}
        {/if}

        <!-- X Axis Label -->
        <text
          x={groupCenterX}
          y={margin.top + plotHeight + 18}
          fill="#64748b"
          font-size="11"
          font-family="sans-serif"
          text-anchor="middle"
        >
          {item[xKey]}
        </text>
      {/each}
    {/if}
  </svg>

  <!-- Interactive Tooltip Overlay Matching Recharts -->
  {#if hoveredGroup !== null && data[hoveredGroup]}
    {@const item = data[hoveredGroup]}
    <div
      class="absolute pointer-events-none z-50 bg-[#0f172a]/95 border border-[#334155] rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[180px] transition-all"
      style="left: {Math.min(Math.max(10, mousePos.x - 90), 380)}px; top: {Math.max(10, mousePos.y - 80)}px;"
    >
      <div class="font-bold text-white mb-1.5 pb-1 border-b border-slate-800">
        {item[xKey]}
      </div>
      <div class="space-y-1">
        {#each bars as bar}
          {@const val = item[bar.key]}
          {@const color = item.color || bar.color || '#38bdf8'}
          <div class="flex items-center justify-between gap-3 text-[11px]">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-xs" style="background-color: {color};"></span>
              <span class="text-slate-300">{bar.name}</span>
            </div>
            <span class="font-mono font-bold text-white">
              {tooltipFormatter ? tooltipFormatter(val, bar.name) : `${val}${yUnit}`}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  </div>

  <!-- Legend at Bottom matching Recharts -->
  {#if showLegend && bars.length > 1}
    <div class="flex items-center justify-center gap-4 mt-2 text-[11px] text-slate-400">
      {#each bars as bar}
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-xs" style="background-color: {bar.color};"></span>
          <span>{bar.name}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
