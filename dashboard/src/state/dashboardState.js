import { createSignal, createMemo, createRoot } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { INITIAL_AGENTS, generateTimelineData, generateSankeyData, MOCK_TRACES } from '../data/mockData.js';


function generateInitialWaterfall() {
  const turns = [];
  const baseTime = Date.now() - 1000 * 60 * 35; // 35 mins ago

  for (let i = 1; i <= 20; i++) {
    const turnTimestamp = new Date(baseTime + i * 105000).toISOString();
    const cachedTokens = Math.min(28000 + i * 3200, 142000);
    const uncachedPrompt = Math.floor(1200 + Math.sin(i) * 600 + 200);
    const totalPrompt = cachedTokens + uncachedPrompt;

    const isHeavyReasoning = i % 4 === 0 || i === 17;
    const thinkingTokens = isHeavyReasoning ? 1800 : 450;
    const contentTokens = 520;
    const outputTokens = thinkingTokens + contentTokens;
    const totalTokens = totalPrompt + outputTokens;

    const clientPrepMs = 110;
    const ttftLatencyMs = Math.floor(280 + (uncachedPrompt / 10));
    const thinkingMs = Math.floor(thinkingTokens * 0.42);
    const streamingMs = Math.floor(contentTokens * 0.38);
    const totalLatencyMs = clientPrepMs + ttftLatencyMs + thinkingMs + streamingMs;

    const cacheHitRate = Number(((cachedTokens / totalPrompt) * 100).toFixed(1));
    const dollarsSaved = Number(((cachedTokens / 1000000) * 0.1125).toFixed(4));
    const rawCostUsd = Number(((totalPrompt * 0.00015 / 1000) + (outputTokens * 0.00060 / 1000)).toFixed(4));
    const netCostUsd = Math.max(0.0001, Number((rawCostUsd - dollarsSaved).toFixed(4)));
    const tokensPerSecond = Number(((outputTokens / (totalLatencyMs / 1000))).toFixed(1));
    const contextSaturationPct = Number(((totalPrompt / 1048576) * 100).toFixed(2));

    turns.push({
      stepIndex: i,
      timestamp: turnTimestamp,
      agentId: i % 3 === 0 ? "promo-shadow" : (i % 2 === 0 ? "deep-research" : "price-match"),
      agentName: i % 3 === 0 ? "Promo Strategy Agent" : (i % 2 === 0 ? "Deep Research Analyst" : "Price Match Auditor"),
      model: i % 2 === 0 ? "gemini-2.0-flash-thinking" : "gemini-2.0-flash",
      latency: {
        clientPrepMs,
        ttftLatencyMs,
        thinkingMs,
        streamingMs,
        totalLatencyMs,
        clientPrepSec: Number((clientPrepMs / 1000).toFixed(3)),
        ttftSec: Number((ttftLatencyMs / 1000).toFixed(3)),
        thinkingSec: Number((thinkingMs / 1000).toFixed(3)),
        streamingSec: Number((streamingMs / 1000).toFixed(3)),
        totalLatencySec: Number((totalLatencyMs / 1000).toFixed(2)),
      },
      tokens: {
        cachedPromptTokens: cachedTokens,
        uncachedPromptTokens: uncachedPrompt,
        totalPromptTokens: totalPrompt,
        thinkingTokens,
        contentTokens,
        outputTokens,
        totalTokens,
      },
      finops: {
        cacheHitRate,
        dollarsSaved,
        rawCostUsd,
        netCostUsd,
        tokensPerSecond,
        contextSaturationPct,
      },
      status: (i === 11 || i === 17) ? "warning" : "success"
    });
  }

  return {
    windowSize: turns.length,
    geminiContextWindowLimit: 1048576,
    pricingModel: "Gemini 2.0 Flash / Flash-Thinking ($0.15/M prompt, $0.0375/M cached, $0.60/M output)",
    turns
  };
}

export function createDashboardState() {
  return createRoot(() => {
    // Core reactive state
    const [activeTab, setActiveTab] = createSignal('overview');
    const [selectedAgentId, setSelectedAgentId] = createSignal('promo-shadow');
    const [agentActiveSubTab, setAgentActiveSubTab] = createSignal('refine');
    const [timelineMetric, setTimelineMetric] = createSignal('speed'); // 'speed' | 'quality' | 'value'
    const [timelineMode, setTimelineMode] = createSignal('stacked'); // 'stacked' | 'overlay' | 'lanes'
    const [chartDensity, setChartDensity] = createSignal('comfort'); // 'comfort' | 'compact'
    const [timeRange, setTimeRange] = createSignal('1h');
    const [isLiveCloud, setIsLiveCloud] = createSignal(true);
    const [isStreaming, setIsStreaming] = createSignal(true);
    const [humanHourlyWage, setHumanHourlyWage] = createSignal(65);
    const [simScaleMultiplier, setSimScaleMultiplier] = createSignal(1.0);
    const [cloudData, setCloudData] = createSignal({ errorFallbackActive: false });
    const [cloudOverview, setCloudOverview] = createSignal(null);
    const [cloudLogs, setCloudLogs] = createSignal([]);
    const [cloudWaterfall, setCloudWaterfall] = createSignal(generateInitialWaterfall());
    const [cloudConnectionStatus, setCloudConnectionStatus] = createSignal('connecting');

    // Deep reactive store for agents
    const [agents, setAgents] = createStore(JSON.parse(JSON.stringify(INITIAL_AGENTS)));
    const [timelineData, setTimelineData] = createStore(generateTimelineData(24));
    const [recentTraces] = createStore(MOCK_TRACES);

    // IAM config map
    const [iamConfigMap, setIamConfigMap] = createStore({
      'promo-shadow': {
        agentId: 'promo-shadow',
        hasDedicatedIdentity: false,
        serviceAccount: 'novasmart-customer-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
        bigqueryScanCapGB: 10,
        maxScanBytesPerQuery: 10737418240,
        modelArmorEnforced: true,
        egressRestricted: true,
        monthlySpendCeiling: 150,
        costCenter: 'CC-7402-MKTG'
      },
      'price-match': {
        agentId: 'price-match',
        hasDedicatedIdentity: true,
        serviceAccount: 'pricing-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
        bigqueryScanCapGB: 25,
        maxScanBytesPerQuery: 26843545600,
        modelArmorEnforced: true,
        egressRestricted: false,
        monthlySpendCeiling: 250,
        costCenter: 'CC-3105-PRICING'
      }
    });

    // Derived: Selected Agent
    const selectedAgent = createMemo(() => {
      return agents.find(a => a.id === selectedAgentId()) || agents[0];
    });

    // Derived: Workforce KPIs
    const workforceKPIs = createMemo(() => {
      let totalTasksCompleted = 0;
      let totalHoursSaved = 0;
      let totalLaborValueSaved = 0;
      let totalMarginPreserved = 0;
      let totalEconomicValue = 0;
      let totalCost = 0;
      let weightedFirstTimeRight = 0;
      let weightedAutonomous = 0;
      let weightedEscalation = 0;
      let weightedSpeedup = 0;

      agents.forEach(agent => {
        const wf = agent.workforce;
        if (!wf) return;
        const tasks = wf.tasksCompleted || 0;
        totalTasksCompleted += tasks;
        totalHoursSaved += (wf.humanLaborHoursSaved || 0);
        totalLaborValueSaved += (wf.humanLaborValueSaved || 0);
        totalMarginPreserved += (wf.valuePreserved || 0);
        totalEconomicValue += (wf.totalEconomicValue || 0);
        totalCost += (agent.costEstimate || 0);

        weightedFirstTimeRight += (wf.firstTimeRightRate || 90) * tasks;
        weightedAutonomous += (wf.autonomousResolutionRate || 95) * tasks;
        weightedEscalation += (wf.escalationRate || 5) * tasks;
        weightedSpeedup += (wf.speedupMultiplier || 500) * tasks;
      });

      const netFleetROI = totalCost > 0 ? Math.round((totalEconomicValue - totalCost) / totalCost) : 7700;
      const fteEquivalency = +(totalHoursSaved / 640).toFixed(1);
      const fleetFirstTimeRightRate = totalTasksCompleted > 0 ? +(weightedFirstTimeRight / totalTasksCompleted).toFixed(1) : 89.8;
      const fleetAutonomousResolution = totalTasksCompleted > 0 ? +(weightedAutonomous / totalTasksCompleted).toFixed(1) : 95.8;
      const fleetEscalationRate = totalTasksCompleted > 0 ? +(weightedEscalation / totalTasksCompleted).toFixed(1) : 4.2;
      const avgCostPerWorkUnit = totalTasksCompleted > 0 ? +(totalCost / totalTasksCompleted).toFixed(4) : 0.004;
      const avgHumanCostPerWorkUnit = totalTasksCompleted > 0 ? +(totalLaborValueSaved / totalTasksCompleted).toFixed(2) : 26.8;
      const avgSpeedupMultiplier = totalTasksCompleted > 0 ? Math.round(weightedSpeedup / totalTasksCompleted) : 840;

      return {
        totalTasksCompleted,
        totalHoursSaved,
        totalLaborValueSaved,
        totalMarginPreserved,
        totalEconomicValue,
        totalCost: totalCost.toFixed(2),
        totalComputeCost: totalCost,
        netFleetROI,
        netROI: netFleetROI,
        fteEquivalency,
        fleetFirstTimeRightRate,
        firstTimeRightRate: fleetFirstTimeRightRate,
        fleetAutonomousResolution,
        autonomousRate: fleetAutonomousResolution,
        fleetEscalationRate,
        avgEscalationRate: fleetEscalationRate,
        avgCostPerWorkUnit,
        costPerWorkUnit: avgCostPerWorkUnit,
        avgHumanCostPerWorkUnit,
        humanCostPerWorkUnit: avgHumanCostPerWorkUnit,
        avgSpeedupMultiplier
      };
    });

    // Derived: Fleet KPIs
    const fleetKPIs = createMemo(() => {
      let totalTokens = 0;
      let inputTokens = 0;
      let outputTokens = 0;
      let cachedTokens = 0;
      let reasoningTokens = 0;
      let totalRuns = 0;
      let weightedLatencySum = 0;
      let totalHallucinations = 0;
      let totalReprompts = 0;
      let totalCost = 0;

      agents.forEach(a => {
        totalTokens += a.tokens.total;
        inputTokens += a.tokens.input;
        outputTokens += a.tokens.output;
        cachedTokens += a.tokens.cached;
        reasoningTokens += a.tokens.reasoning;
        totalRuns += a.totalRuns;
        weightedLatencySum += a.avgLatency * a.totalRuns;
        totalHallucinations += a.errors.hallucinationCount;
        totalReprompts += a.errors.repromptCount;
        totalCost += a.costEstimate;
      });

      const avgLatency = totalRuns > 0 ? (weightedLatencySum / totalRuns).toFixed(2) : '1.20';
      const fleetHallucinationRate = totalRuns > 0 ? ((totalHallucinations / totalRuns) * 100).toFixed(2) : '0';
      const fleetRepromptRate = totalRuns > 0 ? ((totalReprompts / totalRuns) * 100).toFixed(2) : '0';
      const cacheHitRate = totalTokens > 0 ? ((cachedTokens / totalTokens) * 100).toFixed(1) : '0';

      return {
        totalTokens,
        inputTokens,
        outputTokens,
        cachedTokens,
        reasoningTokens,
        totalRuns,
        avgLatency,
        fleetHallucinationRate,
        fleetRepromptRate,
        totalCost: totalCost.toFixed(2),
        cacheHitRate
      };
    });

    // Derived: Simulated Workforce calculations
    const simulatedWorkforce = createMemo(() => {
      const baseHours = (workforceKPIs().totalHoursSaved * simScaleMultiplier());
      const simulatedLaborSavings = baseHours * humanHourlyWage();
      const simulatedTotalValue = simulatedLaborSavings + (workforceKPIs().totalMarginPreserved * simScaleMultiplier());
      const simulatedCost = parseFloat(workforceKPIs().totalCost) * simScaleMultiplier();
      const simulatedROI = simulatedCost > 0 ? Math.round((simulatedTotalValue - simulatedCost) / simulatedCost) : 0;
      const simulatedFTEs = +(baseHours / 640).toFixed(1);
      const annualizedNetSavings = Math.round(simulatedTotalValue * 12);

      return {
        simulatedLaborSavings,
        simulatedTotalValue,
        simulatedCost,
        simulatedROI,
        simulatedFTEs,
        annualizedNetSavings
      };
    });

    // Derived: Sankey Data
    const sankeyData = createMemo(() => {
      return generateSankeyData(agents);
    });

    // Actions
    function selectAgent(agentId, subTab = 'refine') {
      setSelectedAgentId(agentId);
      setAgentActiveSubTab(subTab);
      setActiveTab('detail');
    }

    function applyCoachingPreset(agentId) {
      setAgents(
        a => a.id === agentId,
        produce(agent => {
          if (!agent.parameters) agent.parameters = {};
          agent.parameters.temperature = 0.20;
          agent.parameters.groundingMode = 'strict';
          agent.parameters.confidenceThreshold = 0.90;

          agent.rules = agent.rules.map(r => {
            if (r.id === 'rl-ps-1' || r.id === 'rl-ps-2') {
              return { ...r, enabled: true, enforced: true };
            }
            return r;
          });

          agent.fineTuneConfig = {
            ...agent.fineTuneConfig,
            temperature: 0.20,
            groundingMode: 'strict',
            requireCitations: true
          };

          agent.errors.hallucinationRate = +(Math.max(0.4, agent.errors.hallucinationRate * 0.25)).toFixed(1);
          agent.errors.repromptRate = +(Math.max(1.5, agent.errors.repromptRate * 0.45)).toFixed(1);
          agent.status = 'active';
        })
      );
    }

    function updateAgentIAMConfig(agentId, updates) {
      if (!iamConfigMap[agentId]) {
        setIamConfigMap(agentId, { agentId, ...updates });
      } else {
        setIamConfigMap(agentId, updates);
      }
    }

    function getAgentIAMConfig(agentId) {
      return iamConfigMap[agentId] || {
        agentId,
        hasDedicatedIdentity: true,
        bigqueryScanCapGB: 10,
        maxScanBytesPerQuery: 10737418240
      };
    }

    function remediateAgentIdentity(agentId) {
      if (iamConfigMap[agentId]) {
        setIamConfigMap(agentId, {
          hasDedicatedIdentity: true,
          serviceAccount: 'promo-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com'
        });
      }
    }


    async function fetchCloudData() {
      try {
        const [overviewRes, logsRes, waterfallRes, iamRes] = await Promise.all([
          fetch("/api/cloud/overview").catch(() => null),
          fetch("/api/cloud/logs").catch(() => null),
          fetch("/api/cloud/waterfall").catch(() => null),
          fetch("/api/cloud/iam").catch(() => null)
        ]);

        if (overviewRes && overviewRes.ok) {
          const data = await overviewRes.json();
          setCloudOverview(data);
          setCloudConnectionStatus("connected");
        }
        if (logsRes && logsRes.ok) {
          const data = await logsRes.json();
          setCloudLogs(data.logs || []);
        }
        if (waterfallRes && waterfallRes.ok) {
          const data = await waterfallRes.json();
          if (data && data.turns && data.turns.length > 0) {
            setCloudWaterfall(data);
          }
        }
      } catch (err) {
        setCloudData({ errorFallbackActive: true });
      }
    }

    if (typeof window !== "undefined") {
      fetchCloudData();
      setInterval(fetchCloudData, 12000);
    }

    async function fetchCloudDataSafe(url) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Offline');
        const data = await res.json();
        return data;
      } catch {
        setCloudData({ errorFallbackActive: true });
        return null;
      }
    }

    return {
      // Signals / Accessors
      get activeTab() { return activeTab(); },
      setActiveTab,
      get selectedAgentId() { return selectedAgentId(); },
      setSelectedAgentId,
      get agentActiveSubTab() { return agentActiveSubTab(); },
      setAgentActiveSubTab,
      get timelineMetric() { return timelineMetric(); },
      setTimelineMetric,
      get timelineMode() { return timelineMode(); },
      setTimelineMode,
      get chartDensity() { return chartDensity(); },
      setChartDensity,
      get timeRange() { return timeRange(); },
      setTimeRange,
      get isLiveCloud() { return isLiveCloud(); },
      setIsLiveCloud,
      get isStreaming() { return isStreaming(); },
      setIsStreaming,
      get humanHourlyWage() { return humanHourlyWage(); },
      setHumanHourlyWage,
      get simScaleMultiplier() { return simScaleMultiplier(); },
      setSimScaleMultiplier,
      get cloudData() { return cloudData(); },
      get cloudOverview() { return cloudOverview(); },
      get cloudLogs() { return cloudLogs(); },
      get cloudWaterfall() { return cloudWaterfall(); },
      get cloudConnectionStatus() { return cloudConnectionStatus(); },

      // Stores & Memos
      agents,
      setAgents,
      timelineData,
      setTimelineData,
      recentTraces,
      get selectedAgent() { return selectedAgent(); },
      get workforceKPIs() { return workforceKPIs(); },
      get fleetKPIs() { return fleetKPIs(); },
      get simulatedWorkforce() { return simulatedWorkforce(); },
      get sankeyData() { return sankeyData(); },

      // Actions
      selectAgent,
      applyCoachingPreset,
      updateAgentIAMConfig,
      getAgentIAMConfig,
      remediateAgentIdentity,
      fetchCloudDataSafe
    };
  });
}

export const dashboardState = createDashboardState();
if (typeof window !== "undefined") {
  window.dashboardState = dashboardState;
}
