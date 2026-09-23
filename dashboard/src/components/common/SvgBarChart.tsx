import { component$, useSignal, $ } from '@builder.io/qwik';

export interface BarConfig {
  key: string;
  name: string;
  color: string;
}

export interface SvgBarChartProps {
  data: any[];
  bars: BarConfig[];
  xKey?: string;
  yUnit?: string;
  height?: number;
  isStacked?: boolean;
  showLegend?: boolean;
  tooltipFormatter?: (val: any, name: string) => string;
}

export const SvgBarChart = component$<SvgBarChartProps>((props) => {
  const hoveredGroup = useSignal<number | null>(null);
  const mousePos = useSignal({ x: 0, y: 0 });

  const data = props.data || [];
  const bars = props.bars || [];
  const xKey = props.xKey || 'name';
  const yUnit = props.yUnit || '';
  const height = props.height || 256;
  const isStacked = !!props.isStacked;
  const showLegend = props.showLegend !== false;

  const svgWidth = 600;
  const legendHeight = showLegend && bars.length > 1 ? 30 : 0;
  const svgHeight = height - legendHeight;
  const margin = { top: 12, right: 15, bottom: 24, left: 42 };

  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  let max = 0;
  data.forEach((d) => {
    if (isStacked) {
      let sum = 0;
      bars.forEach((b) => {
        sum += Number(d[b.key] || 0);
      });
      if (sum > max) max = sum;
    } else {
      bars.forEach((b) => {
        const v = Number(d[b.key] || 0);
        if (v > max) max = v;
      });
    }
  });
  const maxVal = max > 0 ? max * 1.15 : 10;

  const yTicks: { value: number; y: number }[] = [];
  const step = maxVal / 4;
  for (let i = 0; i <= 4; i++) {
    const val = step * i;
    const y = margin.top + plotHeight - (val / maxVal) * plotHeight;
    yTicks.push({
      value: val >= 10 ? Math.round(val) : +val.toFixed(1),
      y
    });
  }

  const getBarHeight = (val: number) => {
    const clamped = Math.max(0, Math.min(maxVal, val));
    return (clamped / maxVal) * plotHeight;
  };

  const getStackedSegments = (item: any) => {
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
  };

  const groupWidth = data.length > 0 ? plotWidth / data.length : 0;
  const pad = groupWidth * 0.15;
  const availableWidth = groupWidth - pad * 2;
  const singleBarWidth = bars.length > 0 ? availableWidth / bars.length : 0;

  return (
    <div
      class="relative w-full h-full select-none flex flex-col justify-between"
      onMouseLeave$={$(() => {
        hoveredGroup.value = null;
      })}
    >
      <div class="w-full flex-1 min-h-0 relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          class="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Horizontal Grid Lines */}
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
                x={margin.left - 8}
                y={tick.y + 4}
                fill="#64748b"
                font-size="10"
                font-family="monospace"
                text-anchor="end"
              >
                {tick.value}{yUnit}
              </text>
            </g>
          ))}

          {/* Bottom X Axis Line */}
          <line
            x1={margin.left}
            y1={margin.top + plotHeight}
            x2={svgWidth - margin.right}
            y2={margin.top + plotHeight}
            stroke="#334155"
            stroke-width="1"
          />

          {/* Bars & X Labels */}
          {data.map((item, i) => {
            const groupCenterX = margin.left + i * groupWidth + groupWidth / 2;
            const isHovered = hoveredGroup.value === i;
            const groupLeft = margin.left + i * groupWidth + pad;

            return (
              <g key={i}>
                {isHovered && (
                  <rect
                    x={margin.left + i * groupWidth}
                    y={margin.top}
                    width={groupWidth}
                    height={plotHeight}
                    fill="#38bdf8"
                    opacity="0.04"
                    rx="4"
                  />
                )}

                {!isStacked ? (
                  // Grouped Bars Mode
                  bars.map((bar, bIdx) => {
                    const val = Number(item[bar.key] || 0);
                    const barX = groupLeft + bIdx * singleBarWidth;
                    const barW = Math.max(4, singleBarWidth - 2);
                    const barH = Math.max(1, getBarHeight(val));
                    const barY = margin.top + plotHeight - barH;
                    const color = item.color || bar.color || '#38bdf8';

                    return (
                      <rect
                        key={bIdx}
                        x={barX}
                        y={barY}
                        width={barW}
                        height={barH}
                        fill={color}
                        rx="3"
                        ry="3"
                        class="transition-opacity duration-150 cursor-pointer"
                        opacity={hoveredGroup.value !== null && !isHovered ? 0.6 : 0.95}
                        onMouseMove$={$((e: MouseEvent) => {
                          hoveredGroup.value = i;
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          mousePos.value = {
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top
                          };
                        })}
                      />
                    );
                  })
                ) : (
                  // Stacked Bars Mode
                  (() => {
                    const barW = Math.max(12, Math.min(36, groupWidth * 0.4));
                    const barX = groupCenterX - barW / 2;
                    const segments = getStackedSegments(item);

                    return segments.map((seg, sIdx) => {
                      if (seg.h <= 0) return null;
                      return (
                        <rect
                          key={sIdx}
                          x={barX}
                          y={seg.y}
                          width={barW}
                          height={seg.h}
                          fill={seg.color}
                          rx={seg.isTop ? 3 : 0}
                          ry={seg.isTop ? 3 : 0}
                          class="transition-opacity duration-150 cursor-pointer"
                          opacity={hoveredGroup.value !== null && !isHovered ? 0.6 : 0.95}
                          onMouseMove$={$((e: MouseEvent) => {
                            hoveredGroup.value = i;
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            mousePos.value = {
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top
                            };
                          })}
                        />
                      );
                    });
                  })()
                )}

                {/* X Axis Label */}
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
              </g>
            );
          })}
        </svg>

        {/* Interactive Tooltip Overlay */}
        {hoveredGroup.value !== null && data[hoveredGroup.value] && (() => {
          const item = data[hoveredGroup.value];
          return (
            <div
              class="absolute pointer-events-none z-50 bg-[#0f172a]/95 border border-[#334155] rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[180px] transition-all"
              style={{
                left: `${Math.min(Math.max(10, mousePos.value.x - 90), 380)}px`,
                top: `${Math.max(10, mousePos.value.y - 80)}px`
              }}
            >
              <div class="font-bold text-white mb-1.5 pb-1 border-b border-slate-800">
                {item[xKey]}
              </div>
              <div class="space-y-1">
                {bars.map((bar, idx) => {
                  const val = item[bar.key];
                  const color = item.color || bar.color || '#38bdf8';
                  return (
                    <div key={idx} class="flex items-center justify-between gap-3 text-[11px]">
                      <div class="flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-xs" style={{ backgroundColor: color }}></span>
                        <span class="text-slate-300">{bar.name}</span>
                      </div>
                      <span class="font-mono font-bold text-white">
                        {props.tooltipFormatter ? props.tooltipFormatter(val, bar.name) : `${val}${yUnit}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legend at Bottom */}
      {showLegend && bars.length > 1 && (
        <div class="flex items-center justify-center gap-4 mt-2 text-[11px] text-slate-400">
          {bars.map((bar, idx) => (
            <div key={idx} class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: bar.color }}></span>
              <span>{bar.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default SvgBarChart;
