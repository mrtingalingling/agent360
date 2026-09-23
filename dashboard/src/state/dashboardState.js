import { track } from 'ripple';
import { INITIAL_AGENTS, MOCK_TRACES, generateSankeyData, generateTimelineData } from '../data/mockData.js';

const INITIAL_IAM_CONFIG = {
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

function generateInitialWaterfall() {
  const turns = [];
  const agents = ['promo-shadow', 'fraud-detection', 'customer-support', 'inventory-procurement', 'personalization-engine'];
  const baseTime = Date.now() - 3600000;

  for (let i = 0; i < 20; i++) {
    const agentId = agents[i % agents.length];
    const isPromo = agentId === 'promo-shadow';
    const isFraud = agentId === 'fraud-detection';

    const clientLatency = 12 + Math.floor(Math.random() * 10);
    const prefillLatency = isPromo ? (180 + Math.floor(Math.random() * 80)) : (90 + Math.floor(Math.random() * 40));
    const thinkingLatency = isPromo ? (340 + Math.floor(Math.random() * 120)) : (140 + Math.floor(Math.random() * 70));
    const decodeLatency = 160 + Math.floor(Math.random() * 90);
    const duration = clientLatency + prefillLatency + thinkingLatency + decodeLatency;

    const inputTokens = isPromo ? (14000 + Math.floor(Math.random() * 4000)) : (4000 + Math.floor(Math.random() * 2000));
    const cachedTokens = isPromo ? 0 : Math.floor(inputTokens * 0.45);
    const outputTokens = 450 + Math.floor(Math.random() * 250);
    const reasoningTokens = isPromo ? (300 + Math.floor(Math.random() * 200)) : 100;
    const totalTokens = inputTokens + outputTokens + reasoningTokens;

    turns.push({
      turnId: `turn-${1000 + i}`,
      agentId,
      timestamp: new Date(baseTime + i * 180000).toISOString(),
      duration,
      status: (isPromo && i % 4 === 0) ? 'error' : 'success',
      errorMessage: (isPromo && i % 4 === 0) ? 'BigQuery scan quota exceeded limit (10GB cap)' : null,
      phases: {
        client: { name: 'Client Preparation', duration: clientLatency, offset: 0, color: '#38bdf8' },
        prefill: { name: 'TTFT & Prompt Prefill', duration: prefillLatency, offset: clientLatency, color: '#818cf8' },
        thinking: { name: 'Reasoning & Planning', duration: thinkingLatency, offset: clientLatency + prefillLatency, color: '#c084fc' },
        decode: { name: 'Token Generation & Streaming', duration: decodeLatency, offset: clientLatency + prefillLatency + thinkingLatency, color: '#34d399' }
      },
      tokens: {
        total: totalTokens,
        input: inputTokens,
        cached: cachedTokens,
        output: outputTokens,
        reasoning: reasoningTokens,
        contextSaturation: +(totalTokens / 1000000 * 100).toFixed(2),
        cost: +((inputTokens * 0.00000125) + (outputTokens * 0.000005) - (cachedTokens * 0.0000008)).toFixed(5)
      }
    });
  }
  return { turns };
}

export function createDashboardState() {
  const activeTab = track('overview');
  const selectedAgentId = track('promo-shadow');
  const agentActiveSubTab = track('refine');
  const timelineMetric = track('speed');
  const timelineMode = track('stacked');
  const chartDensity = track('detailed');
  const timeRange = track('24H');
  const isLiveCloud = track(true);
  const isStreaming = track(true);
  const humanHourlyWage = track(65);
  const simScaleMultiplier = track(1.0);

  const cloudData = track({ errorFallbackActive: false });
  const cloudOverview = track(null);
  const cloudLogs = track([]);
  const cloudConnectionStatus = track('connected');
  const cloudWaterfall = track(generateInitialWaterfall());

  const agents = track(JSON.parse(JSON.stringify(INITIAL_AGENTS)));
  const timelineData = track(generateTimelineData(24));
  const recentTraces = track(JSON.parse(JSON.stringify(MOCK_TRACES)));
  const iamConfigMap = track(JSON.parse(JSON.stringify(INITIAL_IAM_CONFIG)));

  function setActiveTab(tab) {
    activeTab.value = tab;
  }

  function setSelectedAgentId(id) {
    selectedAgentId.value = id;
  }

  function setAgentActiveSubTab(subTab) {
    agentActiveSubTab.value = subTab;
  }

  function setTimelineMetric(metric) {
    timelineMetric.value = metric;
  }

  function setTimelineMode(mode) {
    timelineMode.value = mode;
  }

  function setChartDensity(density) {
    chartDensity.value = density;
  }

  function setTimeRange(range) {
    timeRange.value = range;
  }

  function setIsLiveCloud(live) {
    isLiveCloud.value = live;
  }

  function setIsStreaming(streaming) {
    isStreaming.value = streaming;
  }

  function setHumanHourlyWage(wage) {
    humanHourlyWage.value = Number(wage);
  }

  function setSimScaleMultiplier(mult) {
    simScaleMultiplier.value = Number(mult);
  }

  function selectAgent(agentId, subTab = 'refine') {
    selectedAgentId.value = agentId;
    agentActiveSubTab.value = subTab;
    activeTab.value = 'detail';
  }

  function applyCoachingPreset(agentId) {
    const currentAgents = agents.value;
    const nextAgents = currentAgents.map(agent => {
      if (agent.id === agentId) {
        const copy = JSON.parse(JSON.stringify(agent));
        if (!copy.parameters) copy.parameters = {};
        copy.parameters.temperature = 0.20;
        copy.parameters.groundingMode = 'strict';
        copy.parameters.confidenceThreshold = 0.90;

        copy.rules = copy.rules.map(r => {
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
    agents.value = nextAgents;
  }

  function updateAgentIAMConfig(agentId, updates) {
    const current = iamConfigMap.value;
    const existing = current[agentId] || { agentId };
    iamConfigMap.value = {
      ...current,
      [agentId]: { ...existing, ...updates }
    };
  }

  function getAgentIAMConfig(agentId) {
    return iamConfigMap.value[agentId] || {
      agentId,
      hasDedicatedIdentity: true,
      bigqueryScanCapGB: 10,
      maxScanBytesPerQuery: 10737418240
    };
  }

  function remediateAgentIdentity(agentId) {
    const current = iamConfigMap.value;
    if (current[agentId]) {
      iamConfigMap.value = {
        ...current,
        [agentId]: {
          ...current[agentId],
          hasDedicatedIdentity: true,
          serviceAccount: 'promo-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com'
        }
      };
    }
  }

  async function fetchCloudData() {
    try {
      const [overviewRes, logsRes, waterfallRes] = await Promise.all([
        fetch("/api/cloud/overview").catch(() => null),
        fetch("/api/cloud/logs").catch(() => null),
        fetch("/api/cloud/waterfall").catch(() => null)
      ]);

      if (overviewRes && overviewRes.ok) {
        const data = await overviewRes.json();
        cloudOverview.value = data;
        cloudConnectionStatus.value = "connected";
      }
      if (logsRes && logsRes.ok) {
        const data = await logsRes.json();
        cloudLogs.value = data.logs || [];
      }
      if (waterfallRes && waterfallRes.ok) {
        const data = await waterfallRes.json();
        if (data && data.turns && data.turns.length > 0) {
          cloudWaterfall.value = data;
        }
      }
    } catch {
      cloudData.value = { errorFallbackActive: true };
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
      cloudData.value = { errorFallbackActive: true };
      return null;
    }
  }

  return {
    get activeTab() { return activeTab.value; },
    setActiveTab,
    get selectedAgentId() { return selectedAgentId.value; },
    setSelectedAgentId,
    get agentActiveSubTab() { return agentActiveSubTab.value; },
    setAgentActiveSubTab,
    get timelineMetric() { return timelineMetric.value; },
    setTimelineMetric,
    get timelineMode() { return timelineMode.value; },
    setTimelineMode,
    get chartDensity() { return chartDensity.value; },
    setChartDensity,
    get timeRange() { return timeRange.value; },
    setTimeRange,
    get isLiveCloud() { return isLiveCloud.value; },
    setIsLiveCloud,
    get isStreaming() { return isStreaming.value; },
    setIsStreaming,
    get humanHourlyWage() { return humanHourlyWage.value; },
    setHumanHourlyWage,
    get simScaleMultiplier() { return simScaleMultiplier.value; },
    setSimScaleMultiplier,

    get cloudData() { return cloudData.value; },
    get cloudOverview() { return cloudOverview.value; },
    get cloudLogs() { return cloudLogs.value; },
    get cloudWaterfall() { return cloudWaterfall.value; },
    get cloudConnectionStatus() { return cloudConnectionStatus.value; },

    get agents() { return agents.value; },
    get timelineData() { return timelineData.value; },
    get recentTraces() { return recentTraces.value; },

    get selectedAgent() {
      return agents.value.find(a => a.id === selectedAgentId.value) || agents.value[0];
    },

    get workforceKPIs() {
      const ags = agents.value;
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

      ags.forEach(agent => {
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

      agents.value.forEach(a => {
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
      const baseHours = (this.workforceKPIs.totalHoursSaved * simScaleMultiplier.value);
      const simulatedLaborSavings = baseHours * humanHourlyWage.value;
      const simulatedTotalValue = simulatedLaborSavings + (this.workforceKPIs.totalMarginPreserved * simScaleMultiplier.value);
      const simulatedCost = parseFloat(this.workforceKPIs.totalCost) * simScaleMultiplier.value;
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
      return generateSankeyData(agents.value);
    },

    selectAgent,
    applyCoachingPreset,
    updateAgentIAMConfig,
    getAgentIAMConfig,
    remediateAgentIdentity,
    fetchCloudDataSafe
  };
}

export const dashboardState = createDashboardState();
if (typeof window !== "undefined") {
  window.dashboardState = dashboardState;
}
