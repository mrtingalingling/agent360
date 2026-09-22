<script>
  import { sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey';
  import { Info, Sparkles, Filter, CheckCircle2, AlertTriangle, RefreshCw, ShieldAlert } from '@lucide/svelte';

  let { data, height = 480, width = 980 } = $props();

  let hoveredNode = $state(null);
  let hoveredLink = $state(null);
  let mousePos = $state({ x: 0, y: 0 });
  let containerRef = $state(null);

  const pathGenerator = sankeyLinkHorizontal();

  const layout = $derived.by(() => {
    if (!data || !data.nodes || !data.links) return { nodes: [], links: [] };

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
      return { nodes: graph.nodes, links: graph.links };
    } catch (err) {
      console.error('Sankey generation error:', err);
      return { nodes: [], links: [] };
    }
  });

  const stages = [
    { label: '1. Traffic Ingress', desc: 'Client Request Sources', color: '#38bdf8' },
    { label: '2. Agent Estate', desc: 'Active Agent Runtimes', color: '#818cf8' },
    { label: '3. Token Types', desc: 'Input / Output / Cache / CoT', color: '#c084fc' },
    { label: '4. Operational Outcomes', desc: 'Success / Hallucination / Reprompt', color: '#34d399' },
  ];

  function handleMouseMove(e) {
    if (!containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
</script>

<div
  class="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl"
  bind:this={containerRef}
  onmousemove={handleMouseMove}
>
  <!-- Header & Stage Legend -->
  <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
    <div>
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-sky-400 to-indigo-500"></span>
          Sankey Flow Breakdown: Ingress → Agent Estate → Token Types → Outcomes
        </h3>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full">
          Full Spectrum Flow
        </span>
      </div>
      <p class="text-xs text-slate-400 mt-1">
        Visualizes end-to-end token allocation, model reasoning pipelines, and where hallucinations or reprompt loops originate.
      </p>
    </div>

    <!-- Stage Columns Label -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
      {#each stages as st, idx}
        <div class="bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
          <span class="font-semibold text-slate-200 block truncate">{st.label}</span>
          <span class="text-[10px] text-slate-400 truncate block">{st.desc}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- SVG Container -->
  <div class="relative w-full overflow-x-auto overflow-y-hidden pt-3">
    <svg
      viewBox={`0 0 ${width} ${height}`}
      class="w-full h-auto min-w-[850px] select-none"
      style="max-height: {height}px"
    >
      <defs>
        {#each layout.links as link, idx}
          {@const srcColor = link.source?.color || '#38bdf8'}
          {@const tgtColor = link.target?.color || '#818cf8'}
          <linearGradient
            id={`svelte-link-grad-${idx}`}
            gradientUnits="userSpaceOnUse"
            x1={link.source.x1}
            y1={link.y0}
            x2={link.target.x0}
            y2={link.y1}
          >
            <stop offset="0%" stop-color={srcColor} stop-opacity="0.65" />
            <stop offset="100%" stop-color={tgtColor} stop-opacity="0.65" />
          </linearGradient>
        {/each}
      </defs>

      <!-- Links (Flows) -->
      <g class="links" fill="none">
        {#each layout.links as link, idx}
          {@const isHovered = hoveredLink === idx}
          {@const isConnectedToNode = hoveredNode !== null && (link.source.index === hoveredNode || link.target.index === hoveredNode)}
          {@const isDimmed = (hoveredLink !== null && !isHovered) || (hoveredNode !== null && !isConnectedToNode)}
          <path
            d={pathGenerator(link)}
            stroke={`url(#svelte-link-grad-${idx})`}
            stroke-width={Math.max(1.8, link.width)}
            stroke-opacity={isHovered ? 0.95 : isConnectedToNode ? 0.85 : isDimmed ? 0.08 : 0.42}
            class="transition-all duration-200 cursor-pointer hover:stroke-opacity-95"
            onmouseenter={() => hoveredLink = idx}
            onmouseleave={() => hoveredLink = null}
          />
        {/each}
      </g>

      <!-- Nodes -->
      <g class="nodes">
        {#each layout.nodes as node, idx}
          {@const isHovered = hoveredNode === idx}
          {@const isSource = node.x0 < width / 2}
          {@const textX = isSource ? node.x1 + 8 : node.x0 - 8}
          {@const textAnchor = isSource ? 'start' : 'end'}
          {@const nodeHeight = Math.max(8, node.y1 - node.y0)}
          <g
            class="cursor-pointer transition-transform duration-150"
            onmouseenter={() => hoveredNode = idx}
            onmouseleave={() => hoveredNode = null}
          >
            <rect
              x={node.x0}
              y={node.y0}
              width={node.x1 - node.x0}
              height={nodeHeight}
              fill={node.color || '#38bdf8'}
              rx="4"
              class="transition-all duration-200 {isHovered ? 'filter drop-shadow(0 0 8px rgba(56, 189, 248, 0.7))' : ''}"
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
        {/each}
      </g>
    </svg>

    <!-- Floating tooltip on hover -->
    {#if hoveredLink !== null && layout.links[hoveredLink]}
      {@const activeLink = layout.links[hoveredLink]}
      <div
        class="absolute z-20 pointer-events-none bg-slate-950/95 border border-slate-700 rounded-lg p-2.5 text-xs shadow-2xl backdrop-blur-md"
        style="left: {Math.min(width - 240, Math.max(10, mousePos.x + 15))}px; top: {Math.max(10, mousePos.y - 20)}px;"
      >
        <div class="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <span class="w-2 h-2 rounded-full" style="background-color: {activeLink.source.color}"></span>
          <span>{activeLink.source.name}</span>
          <span class="text-slate-500">→</span>
          <span class="w-2 h-2 rounded-full" style="background-color: {activeLink.target.color}"></span>
          <span>{activeLink.target.name}</span>
        </div>
        <div class="flex items-center justify-between gap-4 text-[11px]">
          <span class="text-slate-400">Flow Volume:</span>
          <span class="font-mono font-bold text-brand-400">
            {activeLink.value.toFixed(1)}M tokens
          </span>
        </div>
        {#if activeLink.label}
          <div class="text-[10px] text-slate-400 mt-1 border-t border-slate-800 pt-1">
            {activeLink.label}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Legend Footer -->
  <div class="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
    <div class="flex items-center gap-4 flex-wrap">
      <span class="text-slate-300 font-medium">Outcome Flows:</span>
      <span class="flex items-center gap-1.5 text-[11px]">
        <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" /> Clean Success (74.8%)
      </span>
      <span class="flex items-center gap-1.5 text-[11px]">
        <RefreshCw class="w-3.5 h-3.5 text-orange-400" /> Reprompt Loop Resolved (15.5%)
      </span>
      <span class="flex items-center gap-1.5 text-[11px]">
        <AlertTriangle class="w-3.5 h-3.5 text-rose-400" /> Hallucination Intercepted (5.8%)
      </span>
      <span class="flex items-center gap-1.5 text-[11px]">
        <ShieldAlert class="w-3.5 h-3.5 text-slate-400" /> Policy Blocked (3.9%)
      </span>
    </div>

    <div class="text-[11px] text-slate-500 flex items-center gap-1">
      <Info class="w-3.5 h-3.5 text-slate-400" /> Hover any flow ribbon or node to isolate transmission paths
    </div>
  </div>
</div>
