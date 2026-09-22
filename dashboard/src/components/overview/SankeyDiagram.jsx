import React, { useMemo, useState, useRef } from 'react';
import { sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey';
import { Info, Sparkles, Filter, CheckCircle2, AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

export function SankeyDiagram({ data, height = 480, width = 980 }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Compute layout with d3-sankey
  const { sankeyNodes, sankeyLinks } = useMemo(() => {
    if (!data || !data.nodes || !data.links) return { sankeyNodes: [], sankeyLinks: [] };

    // Deep clone to avoid mutating state
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    const sankeyGenerator = sankey()
      .nodeId((d, i) => i)
      .nodeAlign(sankeyJustify)
      .nodeWidth(16)
      .nodePadding(20)
      .extent([
        [40, 48],
        [width - 40, height - 32]
      ]);

    try {
      const graph = sankeyGenerator({ nodes, links });
      return { sankeyNodes: graph.nodes, sankeyLinks: graph.links };
    } catch (err) {
      console.error('Sankey generation error:', err);
      return { sankeyNodes: [], sankeyLinks: [] };
    }
  }, [data, width, height]);

  const pathGenerator = sankeyLinkHorizontal();

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const stages = [
    { label: '1. Traffic Ingress', desc: 'Client Request Sources', color: '#38bdf8' },
    { label: '2. Agent Estate', desc: 'Active Agent Runtimes', color: '#818cf8' },
    { label: '3. Token Types', desc: 'Input / Output / Cache / CoT', color: '#c084fc' },
    { label: '4. Operational Outcomes', desc: 'Success / Hallucination / Reprompt', color: '#34d399' },
  ];

  return (
    <div className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl" ref={containerRef} onMouseMove={handleMouseMove}>
      {/* Header & Stage Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-sky-400 to-indigo-500"></span>
              Sankey Flow Breakdown: Ingress → Agent Estate → Token Types → Outcomes
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full">
              Full Spectrum Flow
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizes end-to-end token allocation, model reasoning pipelines, and where hallucinations or reprompt loops originate.
          </p>
        </div>

        {/* Stage Columns Label */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {stages.map((st, idx) => (
            <div key={idx} className="bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
              <span className="font-semibold text-slate-200 block truncate">{st.label}</span>
              <span className="text-[10px] text-slate-400 truncate block">{st.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-x-auto overflow-y-hidden pt-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[850px] select-none"
          style={{ maxHeight: `${height}px` }}
        >
          <defs>
            {sankeyLinks.map((link, idx) => {
              const srcColor = link.source?.color || '#38bdf8';
              const tgtColor = link.target?.color || '#818cf8';
              return (
                <linearGradient
                  key={`grad-${idx}`}
                  id={`link-grad-${idx}`}
                  gradientUnits="userSpaceOnUse"
                  x1={link.source.x1}
                  y1={link.y0}
                  x2={link.target.x0}
                  y2={link.y1}
                >
                  <stop offset="0%" stopColor={srcColor} stopOpacity={0.65} />
                  <stop offset="100%" stopColor={tgtColor} stopOpacity={0.65} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Links (Flows) */}
          <g className="links" fill="none">
            {sankeyLinks.map((link, idx) => {
              const isHovered = hoveredLink === idx;
              const isConnectedToNode =
                hoveredNode !== null &&
                (link.source.index === hoveredNode || link.target.index === hoveredNode);
              const isDimmed =
                (hoveredLink !== null && !isHovered) ||
                (hoveredNode !== null && !isConnectedToNode);

              return (
                <path
                  key={idx}
                  d={pathGenerator(link)}
                  stroke={`url(#link-grad-${idx})`}
                  strokeWidth={Math.max(1.8, link.width)}
                  strokeOpacity={isHovered ? 0.95 : isConnectedToNode ? 0.85 : isDimmed ? 0.08 : 0.42}
                  className="transition-all duration-200 cursor-pointer hover:stroke-opacity-95"
                  onMouseEnter={() => setHoveredLink(idx)}
                  onMouseLeave={() => setHoveredLink(null)}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {sankeyNodes.map((node, idx) => {
              const isHovered = hoveredNode === idx;
              const isSource = node.x0 < width / 2;
              const textX = isSource ? node.x1 + 8 : node.x0 - 8;
              const textAnchor = isSource ? 'start' : 'end';
              const nodeHeight = Math.max(8, node.y1 - node.y0);

              return (
                <g
                  key={idx}
                  className="cursor-pointer transition-transform duration-150"
                  onMouseEnter={() => setHoveredNode(idx)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Node Rect */}
                  <rect
                    x={node.x0}
                    y={node.y0}
                    width={node.x1 - node.x0}
                    height={nodeHeight}
                    fill={node.color || '#38bdf8'}
                    rx={4}
                    className={`transition-all duration-200 ${
                      isHovered ? 'filter drop-shadow(0 0 8px rgba(56, 189, 248, 0.7))' : ''
                    }`}
                  />

                  {/* Node Title & Value */}
                  <text
                    x={textX}
                    y={node.y0 + nodeHeight / 2 - 3}
                    textAnchor={textAnchor}
                    className="text-[11px] font-semibold fill-slate-200 tracking-tight"
                    dominantBaseline="middle"
                  >
                    {node.name}
                  </text>
                  <text
                    x={textX}
                    y={node.y0 + nodeHeight / 2 + 11}
                    textAnchor={textAnchor}
                    className="text-[9.5px] font-mono fill-slate-400"
                    dominantBaseline="middle"
                  >
                    {node.value ? `${node.value.toFixed(1)}M tokens` : ''}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Link Floating Tooltip */}
        {hoveredLink !== null && sankeyLinks[hoveredLink] && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-950/95 border border-slate-700 rounded-lg p-2.5 text-xs shadow-2xl backdrop-blur-md"
            style={{
              left: Math.min(width - 240, Math.max(10, mousePos.x + 15)),
              top: Math.max(10, mousePos.y - 20)
            }}
          >
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sankeyLinks[hoveredLink].source.color }}></span>
              <span>{sankeyLinks[hoveredLink].source.name}</span>
              <span className="text-slate-500">→</span>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sankeyLinks[hoveredLink].target.color }}></span>
              <span>{sankeyLinks[hoveredLink].target.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="text-slate-400">Flow Volume:</span>
              <span className="font-mono font-bold text-brand-400">
                {sankeyLinks[hoveredLink].value.toFixed(1)}M tokens
              </span>
            </div>
            {sankeyLinks[hoveredLink].label && (
              <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-800 pt-1">
                {sankeyLinks[hoveredLink].label}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sankey Legend Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-300 font-medium">Outcome Flows:</span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Clean Success (74.8%)
          </span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <RefreshCw className="w-3.5 h-3.5 text-orange-400" /> Reprompt Loop Resolved (15.5%)
          </span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Hallucination Intercepted (5.8%)
          </span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Policy Blocked (3.9%)
          </span>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" /> Hover any flow ribbon or node to isolate transmission paths
        </div>
      </div>
    </div>
  );
}
