import { component$, useSignal, $ } from '@builder.io/qwik';
import { sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey';

export interface SankeyProps {
  data: any;
  height?: number;
  width?: number;
}

export const SankeyDiagram = component$<SankeyProps>((props) => {
  const hoveredNode = useSignal<number | null>(null);
  const hoveredLink = useSignal<number | null>(null);
  const mousePos = useSignal({ x: 0, y: 0 });

  const width = props.width || 980;
  const height = props.height || 480;

  // Compute layout with d3-sankey
  let sankeyNodes: any[] = [];
  let sankeyLinks: any[] = [];

  if (props.data && props.data.nodes && props.data.links) {
    const nodes = props.data.nodes.map((d: any) => ({ ...d }));
    const links = props.data.links.map((d: any) => ({ ...d }));

    const sankeyGenerator = sankey<any, any>()
      .nodeId((d: any, i: number) => i)
      .nodeAlign(sankeyJustify)
      .nodeWidth(16)
      .nodePadding(20)
      .extent([
        [40, 48],
        [width - 40, height - 32]
      ]);

    try {
      const graph = sankeyGenerator({ nodes, links });
      sankeyNodes = graph.nodes;
      sankeyLinks = graph.links;
    } catch (err) {
      console.error('Sankey generation error:', err);
    }
  }

  const pathGenerator = sankeyLinkHorizontal();

  const stages = [
    { label: '1. Traffic Ingress', desc: 'Client Request Sources', color: '#38bdf8' },
    { label: '2. Agent Estate', desc: 'Active Agent Runtimes', color: '#818cf8' },
    { label: '3. Token Types', desc: 'Input / Output / Cache / CoT', color: '#c084fc' },
    { label: '4. Operational Outcomes', desc: 'Success / Hallucination / Reprompt', color: '#34d399' }
  ];

  return (
    <div
      class="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl"
      onMouseMove$={$((e: MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        mousePos.value = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      })}
    >
      {/* Header & Stage Legend */}
      <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-xs bg-gradient-to-r from-sky-400 to-indigo-500"></span>
              Flow Breakdown: Ingress → Agent Estate → Token Types → Outcomes
            </h3>
            <span class="px-2 py-0.5 text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
              Full Spectrum Flow
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Visualizes end-to-end token allocation, model reasoning pipelines, and where hallucinations or reprompt loops originate.
          </p>
        </div>

        {/* Stage Columns Label */}
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {stages.map((st, idx) => (
            <div key={idx} class="bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
              <span class="font-semibold text-slate-200 block truncate">{st.label}</span>
              <span class="text-[10px] text-slate-400 truncate block">{st.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Container */}
      <div class="relative w-full overflow-x-auto overflow-y-hidden pt-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          class="w-full h-auto min-w-[850px] select-none"
          style={{ maxHeight: `${height}px` }}
        >
          <defs>
            {sankeyLinks.map((link: any, idx: number) => {
              const srcColor = link.source?.color || '#38bdf8';
              const tgtColor = link.target?.color || '#818cf8';
              return (
                <linearGradient
                  key={idx}
                  id={`link-grad-${idx}`}
                  gradientUnits="userSpaceOnUse"
                  x1={link.source.x1}
                  y1={link.y0}
                  x2={link.target.x0}
                  y2={link.y1}
                >
                  <stop offset="0%" stop-color={srcColor} stop-opacity="0.65" />
                  <stop offset="100%" stop-color={tgtColor} stop-opacity="0.65" />
                </linearGradient>
              );
            })}
          </defs>

          {/* Links (Flows) */}
          <g class="links" fill="none">
            {sankeyLinks.map((link: any, idx: number) => {
              const isHovered = hoveredLink.value === idx;
              const isConnectedToNode =
                hoveredNode.value !== null &&
                (link.source.index === hoveredNode.value || link.target.index === hoveredNode.value);
              const isDimmed =
                (hoveredLink.value !== null && !isHovered) ||
                (hoveredNode.value !== null && !isConnectedToNode);

              return (
                <path
                  key={idx}
                  d={pathGenerator(link) || ''}
                  stroke={`url(#link-grad-${idx})`}
                  stroke-width={Math.max(1.8, link.width)}
                  stroke-opacity={isHovered ? 0.95 : isConnectedToNode ? 0.85 : isDimmed ? 0.08 : 0.42}
                  class="transition-all duration-200 cursor-pointer hover:stroke-opacity-95"
                  onMouseEnter$={$(() => {
                    hoveredLink.value = idx;
                  })}
                  onMouseLeave$={$(() => {
                    hoveredLink.value = null;
                  })}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g class="nodes">
            {sankeyNodes.map((node: any, idx: number) => {
              const isHovered = hoveredNode.value === idx;
              const isSource = node.x0 < width / 2;
              const textX = isSource ? node.x1 + 8 : node.x0 - 8;
              const textAnchor = isSource ? 'start' : 'end';
              const nodeHeight = Math.max(8, node.y1 - node.y0);

              return (
                <g
                  key={idx}
                  class="cursor-pointer transition-transform duration-150"
                  onMouseEnter$={$(() => {
                    hoveredNode.value = idx;
                  })}
                  onMouseLeave$={$(() => {
                    hoveredNode.value = null;
                  })}
                >
                  <rect
                    x={node.x0}
                    y={node.y0}
                    width={node.x1 - node.x0}
                    height={nodeHeight}
                    fill={node.color || '#38bdf8'}
                    rx={4}
                    class={`transition-all duration-200 ${
                      isHovered ? 'filter drop-shadow(0 0 8px rgba(56, 189, 248, 0.7))' : ''
                    }`}
                  />

                  <text
                    x={textX}
                    y={node.y0 + nodeHeight / 2 - 3}
                    text-anchor={textAnchor}
                    class="text-[11px] font-semibold fill-slate-200 tracking-tight"
                    dominant-baseline="middle"
                  >
                    {node.name}
                  </text>
                  <text
                    x={textX}
                    y={node.y0 + nodeHeight / 2 + 11}
                    text-anchor={textAnchor}
                    class="text-[9.5px] font-mono fill-slate-400"
                    dominant-baseline="middle"
                  >
                    {node.value ? `${node.value.toFixed(1)}M tokens` : ''}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Link Floating Tooltip */}
        {hoveredLink.value !== null && sankeyLinks[hoveredLink.value] && (() => {
          const link = sankeyLinks[hoveredLink.value];
          return (
            <div
              class="absolute z-20 pointer-events-none bg-slate-950/95 border border-slate-700 rounded-lg p-2.5 text-xs shadow-2xl backdrop-blur-md"
              style={{
                left: `${Math.min(width - 240, Math.max(10, mousePos.value.x + 15))}px`,
                top: `${Math.max(10, mousePos.value.y - 20)}px`
              }}
            >
              <div class="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                <span class="w-2 h-2 rounded-full" style={{ backgroundColor: link.source.color }}></span>
                <span>{link.source.name}</span>
                <span class="text-slate-500">→</span>
                <span class="w-2 h-2 rounded-full" style={{ backgroundColor: link.target.color }}></span>
                <span>{link.target.name}</span>
              </div>
              <div class="flex items-center justify-between gap-4 text-[11px]">
                <span class="text-slate-400">Flow Volume:</span>
                <span class="font-mono font-bold text-sky-400">
                  {link.value.toFixed(1)}M tokens
                </span>
              </div>
            </div>
          );
        })()}

        {/* Node Hover Tooltip */}
        {hoveredNode.value !== null && sankeyNodes[hoveredNode.value] && (() => {
          const node = sankeyNodes[hoveredNode.value];
          return (
            <div
              class="absolute z-20 pointer-events-none bg-slate-950/95 border border-slate-700 rounded-lg p-2.5 text-xs shadow-2xl backdrop-blur-md"
              style={{
                left: `${Math.min(width - 220, Math.max(10, mousePos.value.x + 15))}px`,
                top: `${Math.max(10, mousePos.value.y - 20)}px`
              }}
            >
              <div class="flex items-center gap-1.5 font-bold text-slate-100 mb-1">
                <span class="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }}></span>
                <span>{node.name}</span>
              </div>
              <div class="flex items-center justify-between gap-3 text-[11px]">
                <span class="text-slate-400">Aggregated Volume:</span>
                <span class="font-mono font-bold text-sky-400">
                  {node.value ? `${node.value.toFixed(1)}M tokens` : '0M'}
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
});
