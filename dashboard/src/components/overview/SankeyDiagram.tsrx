import { track } from 'ripple';
import { sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey';
import {
  InfoIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  RefreshCwIcon,
  ShieldAlertIcon
} from '../common/Icons.tsrx';

export function SankeyDiagram(props: {
  data?: any;
  height?: number;
  width?: number;
}) @{
  const hoveredNode = track<number | null>(null);
  const hoveredLink = track<number | null>(null);
  const mousePos = track({ x: 0, y: 0 });

  const height = () => props.height || 480;
  const width = () => props.width || 980;

  const sankeyGraph = () => {
    const data = props.data;
    if (!data || !data.nodes || !data.links) return { sankeyNodes: [], sankeyLinks: [] };

    const nodes = data.nodes.map((d: any) => ({ ...d }));
    const links = data.links.map((d: any) => ({ ...d }));

    const sankeyGenerator = sankey<any, any>()
      .nodeId((_, i) => i)
      .nodeAlign(sankeyJustify)
      .nodeWidth(16)
      .nodePadding(20)
      .extent([
        [40, 48],
        [width() - 40, height() - 32]
      ]);

    try {
      const graph = sankeyGenerator({ nodes, links });
      return { sankeyNodes: graph.nodes, sankeyLinks: graph.links };
    } catch (err) {
      console.error('Sankey generation error:', err);
      return { sankeyNodes: [], sankeyLinks: [] };
    }
  };

  const pathGenerator = sankeyLinkHorizontal();

  const handleMouseMove = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mousePos.value = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const stages = [
    { label: '1. Traffic Ingress', desc: 'Client Request Sources', color: '#38bdf8' },
    { label: '2. Agent Estate', desc: 'Active Agent Runtimes', color: '#818cf8' },
    { label: '3. Token Types', desc: 'Input / Output / Cache / CoT', color: '#c084fc' },
    { label: '4. Operational Outcomes', desc: 'Success / Hallucination / Reprompt', color: '#34d399' },
  ];

  <div class="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl" onMouseMove={handleMouseMove}>
    {/* Header & Stage Legend */}
    <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-xs bg-gradient-to-r from-sky-400 to-indigo-500"></span>
            Flow Breakdown: Ingress {"→"} Agent Estate {"→"} Token Types {"→"} Outcomes
          </h3>
          <span class="px-2 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full">
            Full Spectrum Flow
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-1">
          Visualizes end-to-end token allocation, model reasoning pipelines, and where hallucinations or reprompt loops originate.
        </p>
      </div>

      {/* Stage Columns Label */}
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        @for (const st of stages) {
          <div class="bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
            <span class="font-semibold text-slate-200 block truncate">{st.label}</span>
            <span class="text-[10px] text-slate-400 truncate block">{st.desc}</span>
          </div>
        }
      </div>
    </div>

    {/* SVG Container */}
    <div class="relative w-full overflow-x-auto overflow-y-hidden pt-3">
      <svg
        viewBox={`0 0 ${width()} ${height()}`}
        class="w-full h-auto min-w-[850px] select-none"
        style={{ 'max-height': `${height()}px` }}
      >
        <defs>
          @for (let link of sankeyGraph().sankeyLinks; index idx) {
            <linearGradient
              id={`link-grad-${idx}`}
              gradientUnits="userSpaceOnUse"
              x1={link.source.x1}
              y1={link.y0}
              x2={link.target.x0}
              y2={link.y1}
            >
              <stop offset="0%" stop-color={link.source?.color || "#38bdf8"} stop-opacity="0.65" />
              <stop offset="100%" stop-color={link.target?.color || "#818cf8"} stop-opacity="0.65" />
            </linearGradient>
          }
        </defs>

        {/* Links (Flows) */}
        <g class="links" fill="none">
          @for (let link of sankeyGraph().sankeyLinks; index idx) {
            <path
              d={pathGenerator(link)}
              stroke={`url(#link-grad-${idx})`}
              stroke-width={Math.max(1.8, link.width)}
              stroke-opacity={
                hoveredLink.value === idx
                  ? 0.95
                  : (hoveredNode.value !== null && (link.source.index === hoveredNode.value || link.target.index === hoveredNode.value))
                    ? 0.85
                    : (hoveredLink.value !== null || hoveredNode.value !== null)
                      ? 0.08
                      : 0.42
              }
              class="transition-all duration-200 cursor-pointer hover:stroke-opacity-95"
              onMouseEnter={() => { hoveredLink.value = idx; }}
              onMouseLeave={() => { hoveredLink.value = null; }}
            />
          }
        </g>

        {/* Nodes */}
        <g class="nodes">
          @for (let node of sankeyGraph().sankeyNodes; index idx) {
            <g
              class="cursor-pointer transition-transform duration-150"
              onMouseEnter={() => { hoveredNode.value = idx; }}
              onMouseLeave={() => { hoveredNode.value = null; }}
            >
              <rect
                x={node.x0}
                y={node.y0}
                width={node.x1 - node.x0}
                height={Math.max(8, node.y1 - node.y0)}
                fill={node.color || "#38bdf8"}
                rx={4}
                class={`transition-all duration-200 ${
                  hoveredNode.value === idx ? "filter drop-shadow(0 0 8px rgba(56, 189, 248, 0.7))" : ""
                }`}
              />

              <text
                x={node.x0 < width() / 2 ? node.x1 + 8 : node.x0 - 8}
                y={node.y0 + Math.max(8, node.y1 - node.y0) / 2 - 3}
                text-anchor={node.x0 < width() / 2 ? "start" : "end"}
                class="text-[11px] font-semibold fill-slate-200 tracking-tight"
                dominant-baseline="middle"
              >
                {node.name}
              </text>
              <text
                x={node.x0 < width() / 2 ? node.x1 + 8 : node.x0 - 8}
                y={node.y0 + Math.max(8, node.y1 - node.y0) / 2 + 11}
                text-anchor={node.x0 < width() / 2 ? "start" : "end"}
                class="text-[9.5px] font-mono fill-slate-400"
                dominant-baseline="middle"
              >
                {node.value ? `${node.value.toFixed(1)}M tokens` : ""}
              </text>
            </g>
          }
        </g>
      </svg>

      {/* Link Floating Tooltip */}
      @if (hoveredLink.value !== null && sankeyGraph().sankeyLinks[hoveredLink.value!]) {
        <div
          class="absolute z-20 pointer-events-none bg-slate-950/95 border border-slate-700 rounded-lg p-2.5 text-xs shadow-2xl backdrop-blur-md"
          style={{
            left: `${Math.min(width() - 240, Math.max(10, mousePos.value.x + 15))}px`,
            top: `${Math.max(10, mousePos.value.y - 20)}px`
          }}
        >
          <div class="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <span class="w-2 h-2 rounded-full" style={{ "background-color": sankeyGraph().sankeyLinks[hoveredLink.value!].source?.color || "#38bdf8" }}></span>
            <span>{sankeyGraph().sankeyLinks[hoveredLink.value!].source?.name}</span>
            <span class="text-slate-500">{"→"}</span>
            <span class="w-2 h-2 rounded-full" style={{ "background-color": sankeyGraph().sankeyLinks[hoveredLink.value!].target?.color || "#818cf8" }}></span>
            <span>{sankeyGraph().sankeyLinks[hoveredLink.value!].target?.name}</span>
          </div>
          <div class="flex items-center justify-between gap-4 text-[11px]">
            <span class="text-slate-400">Flow Volume:</span>
            <span class="font-mono font-bold text-brand-400">
              {sankeyGraph().sankeyLinks[hoveredLink.value!].value.toFixed(1)}M tokens
            </span>
          </div>
          @if (sankeyGraph().sankeyLinks[hoveredLink.value!].label) {
            <div class="text-[10px] text-slate-400 mt-1 border-t border-slate-800 pt-1">
              {sankeyGraph().sankeyLinks[hoveredLink.value!].label}
            </div>
          }
        </div>
      }
    </div>

    {/* Sankey Legend Footer */}
    <div class="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
      <div class="flex items-center gap-4 flex-wrap">
        <span class="text-slate-300 font-medium">Outcome Flows:</span>
        <span class="flex items-center gap-1.5 text-[11px]">
          <CheckCircle2Icon class="w-3.5 h-3.5 text-emerald-400" /> Clean Success (74.8%)
        </span>
        <span class="flex items-center gap-1.5 text-[11px]">
          <RefreshCwIcon class="w-3.5 h-3.5 text-orange-400" /> Reprompt Loop Resolved (15.5%)
        </span>
        <span class="flex items-center gap-1.5 text-[11px]">
          <AlertTriangleIcon class="w-3.5 h-3.5 text-rose-400" /> Hallucination Intercepted (5.8%)
        </span>
        <span class="flex items-center gap-1.5 text-[11px]">
          <ShieldAlertIcon class="w-3.5 h-3.5 text-slate-400" /> Policy Blocked (3.9%)
        </span>
      </div>

      <div class="text-[11px] text-slate-500 flex items-center gap-1">
        <InfoIcon class="w-3.5 h-3.5 text-slate-400" /> Hover any flow ribbon or node to isolate transmission paths
      </div>
    </div>
  </div>
}
