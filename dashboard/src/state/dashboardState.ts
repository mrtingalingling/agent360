import { createContextId } from '@builder.io/qwik';
import { INITIAL_AGENTS, MOCK_TRACES, generateSankeyData, generateTimelineData } from '../data/mockData.js';

export const INITIAL_IAM_CONFIG = {
  'promo-shadow': {
    agentId: 'promo-shadow',
    hasDedicatedIdentity: false,
    serviceAccount: 'default-compute@developer.gserviceaccount.com',
    allowedTools: ['bq_query', 'catalog_read'],
    deniedTools: ['bq_export', 'cloud_storage_write', 'external_http'],
    bigqueryScanCapGB: 10,
    maxScanBytesPerQuery: 10737418240,
    maxContainerInstances: 5,
    concurrencyLimit: 20,
    memoryLimit: '1Gi',
    cpuLimit: '1000m',
    modelArmorEnabled: true,
    dlpInspectTemplate: 'projects/qwiklabs-gcp-02-26c698bb5fef/inspectTemplates/agent-dlp-rules',
    piiRedaction: true,
    promptInjectionDefense: 'strict',
    maxTokensPerMinute: 60000,
    maxRequestsPerMinute: 120,
    circuitBreakerThresholdUSD: 50
  },
  'fraud-detection': {
    agentId: 'fraud-detection',
    hasDedicatedIdentity: true,
    serviceAccount: 'fraud-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
    allowedTools: ['bq_query', 'vertex_ai_predict'],
    deniedTools: ['bq_export', 'external_http'],
    bigqueryScanCapGB: 20,
    maxScanBytesPerQuery: 21474836480,
    maxContainerInstances: 10,
    concurrencyLimit: 50,
    memoryLimit: '2Gi',
    cpuLimit: '2000m',
    modelArmorEnabled: true,
    dlpInspectTemplate: 'projects/qwiklabs-gcp-02-26c698bb5fef/inspectTemplates/agent-dlp-rules',
    piiRedaction: true,
    promptInjectionDefense: 'strict',
    maxTokensPerMinute: 120000,
    maxRequestsPerMinute: 300,
    circuitBreakerThresholdUSD: 100
  }
};

export function generateInitialWaterfall() {
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

export function createDashboardState(storeWrapper?: (obj: any) => any) {
  let state: any = {
    activeTab: 'overview',
    selectedAgentId: 'promo-shadow',
    agentActiveSubTab: 'refine',
    timelineMetric: 'speed',
    timelineMode: 'stacked',
    chartDensity: 'detailed',
    timeRange: '24H',
    isLiveCloud: true,
    isStreaming: true,
    humanHourlyWage: 65,
    simScaleMultiplier: 1.0,

    cloudData: { errorFallbackActive: false },
    cloudOverview: null,
    cloudLogs: [],
    cloudConnectionStatus: 'connected',
    cloudWaterfall: generateInitialWaterfall(),

    agents: JSON.parse(JSON.stringify(INITIAL_AGENTS)),
    timelineData: generateTimelineData(24),
    recentTraces: JSON.parse(JSON.stringify(MOCK_TRACES)),
    iamConfigMap: JSON.parse(JSON.stringify(INITIAL_IAM_CONFIG)),

    setActiveTab(tab: string) {
      state.activeTab = tab;
    },
    setSelectedAgentId(id: string) {
      state.selectedAgentId = id;
    },
    setAgentActiveSubTab(subTab: string) {
      state.agentActiveSubTab = subTab;
    },
    setTimelineMetric(metric: string) {
      state.timelineMetric = metric;
    },
    setTimelineMode(mode: string) {
      state.timelineMode = mode;
    },
    setChartDensity(density: string) {
      state.chartDensity = density;
    },
    setTimeRange(range: string) {
      state.timeRange = range;
    },
    setIsLiveCloud(live: boolean) {
      state.isLiveCloud = live;
    },
    setIsStreaming(streaming: boolean) {
      state.isStreaming = streaming;
    },
    setHumanHourlyWage(wage: number) {
      state.humanHourlyWage = Number(wage);
    },
    setSimScaleMultiplier(mult: number) {
      state.simScaleMultiplier = Number(mult);
    },

    selectAgent(agentId: string, subTab: string = 'refine') {
      state.selectedAgentId = agentId;
      state.agentActiveSubTab = subTab;
      state.activeTab = 'detail';
    },

    applyCoachingPreset(agentId: string) {
      state.agents = state.agents.map((agent: any) => {
        if (agent.id === agentId) {
          const copy = JSON.parse(JSON.stringify(agent));
          if (!copy.parameters) copy.parameters = {};
          copy.parameters.temperature = 0.20;
          copy.parameters.groundingMode = 'strict';
          copy.parameters.confidenceThreshold = 0.90;

          copy.rules = copy.rules.map((r: any) => {
            if (r.id === 'rl-ps-1' || r.id === 'rl-ps-2') {
              return { ...r, enabled: true, enforced: true };
            }
            return r;
          });

          copy.fineTuneConfig = {
            ...copy.fineTuneConfig,
            temperature: 0.20,
            groundingMode: 'strict',
            requireCitations: true
          };

          copy.errors.hallucinationRate = +(Math.max(0.4, copy.errors.hallucinationRate * 0.25)).toFixed(1);
          copy.errors.repromptRate = +(Math.max(1.5, copy.errors.repromptRate * 0.45)).toFixed(1);
          copy.status = 'active';
          return copy;
        }
        return agent;
      });
    },

    updateAgentIAMConfig(agentId: string, updates: any) {
      const existing = state.iamConfigMap[agentId] || { agentId };
      state.iamConfigMap = {
        ...state.iamConfigMap,
        [agentId]: { ...existing, ...updates }
      };
    },

    getAgentIAMConfig(agentId: string) {
      return state.iamConfigMap[agentId] || {
        agentId,
        hasDedicatedIdentity: true,
        bigqueryScanCapGB: 10,
        maxScanBytesPerQuery: 10737418240
      };
    },

    remediateAgentIdentity(agentId: string) {
      if (state.iamConfigMap[agentId]) {
        state.iamConfigMap = {
          ...state.iamConfigMap,
          [agentId]: {
            ...state.iamConfigMap[agentId],
            hasDedicatedIdentity: true,
            serviceAccount: 'promo-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com'
          }
        };
      }
    },

    async fetchCloudData() {
      try {
        const [overviewRes, logsRes, waterfallRes] = await Promise.all([
          fetch("/api/cloud/overview").catch(() => null),
          fetch("/api/cloud/logs").catch(() => null),
          fetch("/api/cloud/waterfall").catch(() => null)
        ]);

        if (overviewRes && overviewRes.ok) {
          const data = await overviewRes.json();
          state.cloudOverview = data;
          state.cloudConnectionStatus = "connected";
        }
        if (logsRes && logsRes.ok) {
          const data = await logsRes.json();
          state.cloudLogs = data.logs || [];
        }
        if (waterfallRes && waterfallRes.ok) {
          const data = await waterfallRes.json();
          if (data && data.turns && data.turns.length > 0) {
            state.cloudWaterfall = data;
          }
        }
      } catch {
        state.cloudData = { errorFallbackActive: true };
      }
    },

    async fetchCloudDataSafe(url: string) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Offline');
        const data = await res.json();
        return data;
      } catch {
        state.cloudData = { errorFallbackActive: true };
        return null;
      }
    },

    get selectedAgent() {
      return state.agents.find((a: any) => a.id === state.selectedAgentId) || state.agents[0];
    },

    get workforceKPIs() {
      const ags = state.agents;
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

      ags.forEach((agent: any) => {
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
    },

    get fleetKPIs() {
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

      state.agents.forEach((a: any) => {
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
    },

    get simulatedWorkforce() {
      const baseHours = (state.workforceKPIs.totalHoursSaved * state.simScaleMultiplier);
      const simulatedLaborSavings = baseHours * state.humanHourlyWage;
      const simulatedTotalValue = simulatedLaborSavings + (state.workforceKPIs.totalMarginPreserved * state.simScaleMultiplier);
      const simulatedCost = parseFloat(state.workforceKPIs.totalCost) * state.simScaleMultiplier;
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
    },

    get sankeyData() {
      return generateSankeyData(state.agents);
    }
  };

  if (storeWrapper) {
    state = storeWrapper(state);
  }

  return state;
}

export type DashboardState = ReturnType<typeof createDashboardState>;
export const DashboardContext = createContextId<DashboardState>('dashboard-state');
