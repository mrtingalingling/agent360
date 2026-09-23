import { createSignal, createMemo, For, Show } from 'solid-js';

export default function SvgBarChart(props) {
  const [hoveredGroup, setHoveredGroup] = createSignal(null);
  const [mousePos, setMousePos] = createSignal({ x: 0, y: 0 });

  const data = () => props.data || [];
  const bars = () => props.bars || [];
  const xKey = () => props.xKey || 'name';
  const yUnit = () => props.yUnit || '';
  const height = () => props.height || 256;
  const isStacked = () => !!props.isStacked;
  const showLegend = () => props.showLegend !== false;

  const svgWidth = 600;
  const legendHeight = () => (showLegend() && bars().length > 1 ? 30 : 0);
  const svgHeight = () => height() - legendHeight();
  const margin = { top: 12, right: 15, bottom: 24, left: 42 };

  const plotWidth = () => svgWidth - margin.left - margin.right;
  const plotHeight = () => svgHeight() - margin.top - margin.bottom;

  const maxVal = createMemo(() => {
    let max = 0;
    const dList = data();
    const bList = bars();
    const stacked = isStacked();
    dList.forEach(d => {
      if (stacked) {
        let sum = 0;
        bList.forEach(b => { sum += Number(d[b.key] || 0); });
        if (sum > max) max = sum;
      } else {
        bList.forEach(b => {
          const v = Number(d[b.key] || 0);
          if (v > max) max = v;
        });
      }
    });
    return max > 0 ? max * 1.15 : 10;
  });

  const yTicks = createMemo(() => {
    const ticks = [];
    const max = maxVal();
    const pH = plotHeight();
    const step = max / 4;
    for (let i = 0; i <= 4; i++) {
      const val = step * i;
      const y = margin.top + pH - (val / max) * pH;
      ticks.push({
        value: val >= 10 ? Math.round(val) : +val.toFixed(1),
        y
      });
    }
    return ticks;
  });

  function getBarHeight(val) {
    const max = maxVal();
    const pH = plotHeight();
    const clamped = Math.max(0, Math.min(max, val));
    return (clamped / max) * pH;
  }

  function getStackedSegments(item) {
    let currentY = margin.top + plotHeight();
    const bList = bars();
    return bList.map((bar, idx) => {
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
        isTop: idx === bList.length - 1
      };
    });
  }

  function handleMouseMove(e, index) {
    setHoveredGroup(index);
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }

  function handleMouseLeave() {
    setHoveredGroup(null);
  }

  return (
    <div class="relative w-full h-full select-none flex flex-col justify-between" onMouseLeave={handleMouseLeave}>
      <div class="w-full flex-1 min-h-0 relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight()}`}
          class="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
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
                  x={margin.left - 8}
                  y={tick.y + 4}
                  fill="#64748b"
                  font-size="11"
                  font-family="monospace"
                  text-anchor="end"
                >
                  {tick.value}{yUnit()}
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

          {/* Bars & X Labels */}
          <Show when={data().length > 0}>
            {(() => {
              const dList = data();
              const groupWidth = plotWidth() / dList.length;
              const barCount = bars().length;

              return (
                <For each={dList}>
                  {(item, i) => {
                    const groupCenterX = margin.left + i() * groupWidth + groupWidth / 2;
                    const isHovered = () => hoveredGroup() === i();

                    return (
                      <>
                        <Show when={isHovered()}>
                          <rect
                            x={margin.left + i() * groupWidth}
                            y={margin.top}
                            width={groupWidth}
                            height={plotHeight()}
                            fill="#38bdf8"
                            opacity="0.04"
                            rx="4"
                          />
                        </Show>

                        <Show
                          when={isStacked()}
                          fallback={
                            // Grouped Bars Mode
                            (() => {
                              const pad = groupWidth * 0.15;
                              const availableWidth = groupWidth - pad * 2;
                              const singleBarWidth = availableWidth / barCount;
                              const groupLeft = margin.left + i() * groupWidth + pad;

                              return (
                                <For each={bars()}>
                                  {(bar, bIdx) => {
                                    const val = Number(item[bar.key] || 0);
                                    const barX = groupLeft + bIdx() * singleBarWidth;
                                    const barW = Math.max(4, singleBarWidth - 2);
                                    const barH = Math.max(1, getBarHeight(val));
                                    const barY = margin.top + plotHeight() - barH;
                                    const color = item.color || bar.color || '#38bdf8';

                                    return (
                                      <rect
                                        x={barX}
                                        y={barY}
                                        width={barW}
                                        height={barH}
                                        fill={color}
                                        rx="3"
                                        ry="3"
                                        class="transition-opacity duration-150 cursor-pointer"
                                        opacity={hoveredGroup() !== null && !isHovered() ? 0.6 : 0.95}
                                        onMouseMove={(e) => handleMouseMove(e, i())}
                                      />
                                    );
                                  }}
                                </For>
                              );
                            })()
                          }
                        >
                          {/* Stacked Bars Mode */}
                          {(() => {
                            const barW = Math.max(12, Math.min(36, groupWidth * 0.4));
                            const barX = groupCenterX - barW / 2;
                            const segments = getStackedSegments(item);

                            return (
                              <For each={segments}>
                                {(seg) => (
                                  <Show when={seg.h > 0}>
                                    <rect
                                      x={barX}
                                      y={seg.y}
                                      width={barW}
                                      height={seg.h}
                                      fill={seg.color}
                                      rx={seg.isTop ? 3 : 0}
                                      ry={seg.isTop ? 3 : 0}
                                      class="transition-opacity duration-150 cursor-pointer"
                                      opacity={hoveredGroup() !== null && !isHovered() ? 0.6 : 0.95}
                                      onMouseMove={(e) => handleMouseMove(e, i())}
                                    />
                                  </Show>
                                )}
                              </For>
                            );
                          })()}
                        </Show>

                        {/* X Axis Label */}
                        <text
                          x={groupCenterX}
                          y={margin.top + plotHeight() + 18}
                          fill="#64748b"
                          font-size="11"
                          font-family="sans-serif"
                          text-anchor="middle"
                        >
                          {item[xKey()]}
                        </text>
                      </>
                    );
                  }}
                </For>
              );
            })()}
          </Show>
        </svg>

        {/* Interactive Tooltip Overlay */}
        <Show when={hoveredGroup() !== null && data()[hoveredGroup()]}>
          {(() => {
            const item = data()[hoveredGroup()];
            return (
              <div
                class="absolute pointer-events-none z-50 bg-[#0f172a]/95 border border-[#334155] rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[180px] transition-all"
                style={{
                  left: `${Math.min(Math.max(10, mousePos().x - 90), 380)}px`,
                  top: `${Math.max(10, mousePos().y - 80)}px`
                }}
              >
                <div class="font-bold text-white mb-1.5 pb-1 border-b border-slate-800">
                  {item[xKey()]}
                </div>
                <div class="space-y-1">
                  <For each={bars()}>
                    {(bar) => {
                      const val = item[bar.key];
                      const color = item.color || bar.color || '#38bdf8';
                      return (
                        <div class="flex items-center justify-between gap-3 text-[11px]">
                          <div class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-xs" style={{ "background-color": color }}></span>
                            <span class="text-slate-300">{bar.name}</span>
                          </div>
                          <span class="font-mono font-bold text-white">
                            {props.tooltipFormatter ? props.tooltipFormatter(val, bar.name) : `${val}${yUnit()}`}
                          </span>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            );
          })()}
        </Show>
      </div>

      {/* Legend at Bottom */}
      <Show when={showLegend() && bars().length > 1}>
        <div class="flex items-center justify-center gap-4 mt-2 text-[11px] text-slate-400">
          <For each={bars()}>
            {(bar) => (
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-xs" style={{ "background-color": bar.color }}></span>
                <span>{bar.name}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
