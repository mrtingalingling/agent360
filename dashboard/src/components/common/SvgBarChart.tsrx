import { track } from 'ripple';

export function SvgBarChart(props: {
  data?: any[];
  xKey?: string;
  bars?: any[];
  height?: number;
  stacked?: boolean;
  yUnit?: string;
  showLegend?: boolean;
  tooltipFormatter?: (val: any, name: string) => string;
}) @{
  const hoveredGroup = track<number | null>(null);
  const mousePos = track({ x: 0, y: 0 });

  const data = () => props.data || [];
  const xKey = () => props.xKey || 'name';
  const bars = () => props.bars || [];
  const height = () => props.height || 220;
  const isStacked = () => props.stacked || false;
  const yUnit = () => props.yUnit || '';
  const showLegend = () => props.showLegend !== false;

  const svgWidth = 520;
  const margin = { top: 20, right: 16, bottom: 32, left: 42 };
  const plotWidth = () => svgWidth - margin.left - margin.right;
  const plotHeight = () => height() - margin.top - margin.bottom;

  const maxValue = () => {
    const dList = data();
    const bList = bars();
    if (!dList.length || !bList.length) return 100;
    if (isStacked()) {
      return Math.max(
        ...dList.map(item => bList.reduce((sum, b) => sum + (Number(item[b.key]) || 0), 0)),
        10
      );
    }
    return Math.max(
      ...dList.flatMap(item => bList.map(b => Number(item[b.key]) || 0)),
      10
    );
  };

  const roundedMax = () => {
    const raw = maxValue() * 1.15;
    if (raw <= 10) return 10;
    if (raw <= 50) return Math.ceil(raw / 10) * 10;
    if (raw <= 100) return Math.ceil(raw / 20) * 20;
    if (raw <= 500) return Math.ceil(raw / 50) * 50;
    if (raw <= 1000) return Math.ceil(raw / 100) * 10;
    if (raw <= 10000) return Math.ceil(raw / 1000) * 1000;
    return Math.ceil(raw / 5000) * 5000;
  };

  const yTicks = () => {
    const max = roundedMax();
    return [
      { value: max, y: margin.top },
      { value: Math.round(max * 0.75), y: margin.top + plotHeight() * 0.25 },
      { value: Math.round(max * 0.5), y: margin.top + plotHeight() * 0.5 },
      { value: Math.round(max * 0.25), y: margin.top + plotHeight() * 0.75 },
      { value: 0, y: margin.top + plotHeight() }
    ];
  };

  const getBarHeight = (val: number) => {
    const max = roundedMax();
    return max > 0 ? (val / max) * plotHeight() : 0;
  };

  const getStackedSegments = (item: any) => {
    let currentY = margin.top + plotHeight();
    const bList = bars();
    return bList.map((bar, idx) => {
      const val = Number(item[bar.key] || 0);
      const h = getBarHeight(val);
      currentY -= h;
      return {
        key: bar.key,
        name: bar.name,
        val,
        color: item.color || bar.color || '#38bdf8',
        y: currentY,
        h,
        isTop: idx === bList.length - 1
      };
    });
  };

  const getGroupWidth = () => {
    const len = data().length;
    return len > 0 ? plotWidth() / len : 0;
  };

  const getGroupCenterX = (i: number) => {
    const gw = getGroupWidth();
    return margin.left + i * gw + gw / 2;
  };

  const getSingleBarWidth = () => {
    const bLen = bars().length || 1;
    const gw = getGroupWidth();
    const available = Math.min(gw * 0.75, 48);
    return Math.max(4, available / bLen);
  };

  const getGroupLeft = (i: number) => {
    const gw = getGroupWidth();
    const bLen = bars().length || 1;
    const groupTotalWidth = bLen * getSingleBarWidth();
    return margin.left + i * gw + (gw - groupTotalWidth) / 2;
  };

  const handleMouseMove = (e: MouseEvent, groupIndex: number) => {
    const rect = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
    if (rect) {
      mousePos.value = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    hoveredGroup.value = groupIndex;
  };

  <div class="w-full relative">
    <div class="relative overflow-visible">
      <svg
        viewBox={`0 0 ${svgWidth} ${height()}`}
        class="w-full overflow-visible"
        style={{ height: `${height()}px` }}
        onMouseLeave={() => { hoveredGroup.value = null; }}
      >
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
              x={margin.left - 8}
              y={tick.y + 4}
              fill="#64748b"
              font-size="10"
              font-family="monospace"
              text-anchor="end"
            >
              {tick.value}{yUnit()}
            </text>
          </g>
        }

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
        @if (data().length > 0) {
          @for (let item of data(); index i) {
            <g>
              @if (hoveredGroup.value === i) {
                <rect
                  x={margin.left + i * getGroupWidth()}
                  y={margin.top}
                  width={getGroupWidth()}
                  height={plotHeight()}
                  fill="#38bdf8"
                  opacity="0.04"
                  rx="4"
                />
              }

              @if (isStacked()) {
                @for (const seg of getStackedSegments(item)) {
                  @if (seg.h > 0) {
                    <rect
                      x={getGroupCenterX(i) - Math.max(12, Math.min(36, getGroupWidth() * 0.4)) / 2}
                      y={seg.y}
                      width={Math.max(12, Math.min(36, getGroupWidth() * 0.4))}
                      height={seg.h}
                      fill={seg.color}
                      rx={seg.isTop ? 3 : 0}
                      ry={seg.isTop ? 3 : 0}
                      class="transition-opacity duration-150 cursor-pointer"
                      opacity={hoveredGroup.value !== null && hoveredGroup.value !== i ? 0.6 : 0.95}
                      onMouseMove={(e: MouseEvent) => handleMouseMove(e, i)}
                    />
                  }
                }
              } @else {
                @for (let bar of bars(); index bIdx) {
                  <rect
                    x={getGroupLeft(i) + bIdx * getSingleBarWidth()}
                    y={margin.top + plotHeight() - Math.max(1, getBarHeight(Number(item[bar.key] || 0)))}
                    width={Math.max(4, getSingleBarWidth() - 2)}
                    height={Math.max(1, getBarHeight(Number(item[bar.key] || 0)))}
                    fill={item.color || bar.color || "#38bdf8"}
                    rx="3"
                    ry="3"
                    class="transition-opacity duration-150 cursor-pointer"
                    opacity={hoveredGroup.value !== null && hoveredGroup.value !== i ? 0.6 : 0.95}
                    onMouseMove={(e: MouseEvent) => handleMouseMove(e, i)}
                  />
                }
              }

              {/* X Axis Label */}
              <text
                x={getGroupCenterX(i)}
                y={margin.top + plotHeight() + 18}
                fill="#64748b"
                font-size="11"
                font-family="sans-serif"
                text-anchor="middle"
              >
                {item[xKey()]}
              </text>
            </g>
          }
        }
      </svg>

      {/* Tooltip Overlay */}
      @if (hoveredGroup.value !== null && data()[hoveredGroup.value]) {
        <div
          class="absolute pointer-events-none z-50 bg-[#0f172a]/95 border border-[#334155] rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[180px] transition-all"
          style={{
            left: `${Math.min(Math.max(10, mousePos.value.x - 90), 380)}px`,
            top: `${Math.max(10, mousePos.value.y - 80)}px`
          }}
        >
          <div class="font-bold text-white mb-1.5 pb-1 border-b border-slate-800">
            {data()[hoveredGroup.value!][xKey()]}
          </div>
          <div class="space-y-1">
            @for (const bar of bars()) {
              <div class="flex items-center justify-between gap-3 text-[11px]">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-xs" style={{ "background-color": data()[hoveredGroup.value!].color || bar.color || "#38bdf8" }}></span>
                  <span class="text-slate-300">{bar.name}</span>
                </div>
                <span class="font-mono font-bold text-white">
                  {props.tooltipFormatter ? props.tooltipFormatter(data()[hoveredGroup.value!][bar.key], bar.name) : `${data()[hoveredGroup.value!][bar.key]}${yUnit()}`}
                </span>
              </div>
            }
          </div>
        </div>
      }
    </div>

    {/* Legend */}
    @if (showLegend() && bars().length > 1) {
      <div class="flex items-center justify-center gap-4 mt-2 text-[11px] text-slate-400">
        @for (const bar of bars()) {
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-xs" style={{ 'background-color': bar.color }}></span>
            <span>{bar.name}</span>
          </div>
        }
      </div>
    }
  </div>
}
