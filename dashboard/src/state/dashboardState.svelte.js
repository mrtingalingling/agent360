import { INITIAL_AGENTS, generateTimelineData, generateSankeyData, MOCK_TRACES } from '../data/mockData.js';

export function createDashboardState() {
  let activeTab = $state('overview');
  let selectedAgentId = $state('promo-shadow');
  let agentActiveSubTab = $state('refine');
  let timeRange = $state('1h');
  let isStreaming = $state(true);
  let timelineMetric = $state('speed'); // 'speed' | 'quality' | 'value'
  let isLiveCloud = $state(true);
  let dataSourceMode = $state('cloud');

  // Wage simulator state
  let humanHourlyWage = $state(52.5);
  let simScaleMultiplier = $state(1.0);

  // Agents
  let agents = $state(JSON.parse(JSON.stringify(INITIAL_AGENTS)));

  // Timeline & Traces
  let timelineData = $state(generateTimelineData(24));
  let visibleTimelineAgents = $state(INITIAL_AGENTS.map(a => a.id));
  let recentTraces = $state(MOCK_TRACES);

  // Cloud & IAM State
  let cloudOverview = $state(null);
  let cloudLogs = $state([]);
  let cloudWaterfall = $state(null);
  let cloudConnectionStatus = $state('connected');
  let cloudData = $state({ errorFallbackActive: false });

  let iamConfigMap = $state({
    'promo-shadow': {
      agentId: 'promo-shadow',
      agentName: 'Promo Strategy Agent',
      serviceAccount: 'novasmart-customer-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      hasDedicatedIdentity: false,
      recommendedServiceAccount: 'promo-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      costCenter: 'Marketing Operations (CC-7402)',
      bigqueryScanCapGB: 10,
      maxScanBytesPerQuery: 10737418240,
      datasetAccessScope: 'dataViewer',
      dailyScanBudgetUSD: 5.00,
      cloudRunIngress: 'all',
      modelArmorEnabled: false,
      maxContainerInstances: 10,
      monthlyTokenBudgetUSD: 100,
      circuitBreakerThresholdPct: 90
    },
    'core-assistant': {
      agentId: 'core-assistant',
      agentName: 'Nova Core Assistant',
      serviceAccount: 'core-assistant-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      hasDedicatedIdentity: true,
      costCenter: 'Core Engineering (CC-1001)',
      bigqueryScanCapGB: 15,
      maxScanBytesPerQuery: 16106127360,
      datasetAccessScope: 'dataViewer',
      dailyScanBudgetUSD: 10.00,
      cloudRunIngress: 'internal-and-cloud-load-balancing',
      modelArmorEnabled: true,
      maxContainerInstances: 20,
      monthlyTokenBudgetUSD: 250,
      circuitBreakerThresholdPct: 90
    },
    'price-match': {
      agentId: 'price-match',
      agentName: 'Price Match Specialist',
      serviceAccount: 'pricing-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      hasDedicatedIdentity: true,
      costCenter: 'Retail Pricing (CC-3105)',
      bigqueryScanCapGB: 20,
      maxScanBytesPerQuery: 21474836480,
      datasetAccessScope: 'dataEditor',
      dailyScanBudgetUSD: 15.00,
      cloudRunIngress: 'internal-and-cloud-load-balancing',
      modelArmorEnabled: true,
      maxContainerInstances: 15,
      monthlyTokenBudgetUSD: 200,
      circuitBreakerThresholdPct: 85
    },
    'deep-research': {
      agentId: 'deep-research',
      agentName: 'Deep Research Analyst',
      serviceAccount: 'research-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      hasDedicatedIdentity: true,
      costCenter: 'Market Intelligence (CC-5201)',
      bigqueryScanCapGB: 50,
      maxScanBytesPerQuery: 53687091200,
      datasetAccessScope: 'dataViewer',
      dailyScanBudgetUSD: 30.00,
      cloudRunIngress: 'internal-and-cloud-load-balancing',
      modelArmorEnabled: true,
      maxContainerInstances: 8,
      monthlyTokenBudgetUSD: 400,
      circuitBreakerThresholdPct: 95
    },
    'customer-support': {
      agentId: 'customer-support',
      agentName: 'Support Dispatcher',
      serviceAccount: 'support-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      hasDedicatedIdentity: true,
      costCenter: 'Customer Experience (CC-2040)',
      bigqueryScanCapGB: 5,
      maxScanBytesPerQuery: 5368709120,
      datasetAccessScope: 'dataViewer',
      dailyScanBudgetUSD: 5.00,
      cloudRunIngress: 'all',
      modelArmorEnabled: true,
      maxContainerInstances: 25,
      monthlyTokenBudgetUSD: 150,
      circuitBreakerThresholdPct: 90
    },
    'workspace-agent': {
      agentId: 'workspace-agent',
      agentName: 'Workspace Assistant',
      serviceAccount: 'workspace-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com',
      hasDedicatedIdentity: true,
      costCenter: 'Corporate IT (CC-8801)',
      bigqueryScanCapGB: 10,
      maxScanBytesPerQuery: 10737418240,
      datasetAccessScope: 'dataViewer',
      dailyScanBudgetUSD: 5.00,
      cloudRunIngress: 'internal-and-cloud-load-balancing',
      modelArmorEnabled: true,
      maxContainerInstances: 10,
      monthlyTokenBudgetUSD: 100,
      circuitBreakerThresholdPct: 90
    }
  });

  // Derived: Workforce KPIs
  const workforceKPIs = $derived.by(() => {
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

    agents.forEach(a => {
      const wf = a.workforce;
      if (!wf) return;
      totalTasksCompleted += wf.tasksCompleted;
      totalHoursSaved += wf.humanLaborHoursSaved;
      totalLaborValueSaved += wf.humanLaborValueSaved;
      totalMarginPreserved += (wf.valuePreserved || 0);
      totalEconomicValue += wf.totalEconomicValue;
      totalCost += a.costEstimate;

      weightedFirstTimeRight += wf.firstTimeRightRate * wf.tasksCompleted;
      weightedAutonomous += wf.autonomousResolutionRate * wf.tasksCompleted;
      weightedEscalation += wf.escalationRate * wf.tasksCompleted;
      weightedSpeedup += wf.speedupMultiplier * wf.tasksCompleted;
    });

    const netFleetROI = totalCost > 0 ? Math.round((totalEconomicValue - totalCost) / totalCost) : 6650;
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
  const fleetKPIs = $derived.by(() => {
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
  const simulatedWorkforce = $derived.by(() => {
    const baseHours = (workforceKPIs.totalHoursSaved * simScaleMultiplier);
    const simulatedLaborSavings = baseHours * humanHourlyWage;
    const simulatedTotalValue = simulatedLaborSavings + (workforceKPIs.totalMarginPreserved * simScaleMultiplier);
    const simulatedCost = parseFloat(workforceKPIs.totalCost) * simScaleMultiplier;
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

  // Derived: Selected Agent
  const selectedAgent = $derived.by(() => {
    return agents.find(a => a.id === selectedAgentId) || agents[0];
  });

  // Derived: Sankey Data
  const sankeyData = $derived.by(() => {
    return generateSankeyData(agents);
  });

  // Actions
  function setActiveTab(tab) {
    activeTab = tab;
  }

  function selectAgent(agentId) {
    selectedAgentId = agentId;
    activeTab = 'detail';
  }

  function setTimelineMetric(metric) {
    timelineMetric = metric;
  }

  function setHumanHourlyWage(wage) {
    humanHourlyWage = wage;
  }

  function setSimScaleMultiplier(mult) {
    simScaleMultiplier = mult;
  }

  function applyCoachingPreset(agentId) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    if (!agent.parameters) {
      agent.parameters = {};
    }
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
  }

  function updateAgentIAMConfig(agentId, updates) {
    if (!iamConfigMap[agentId]) {
      iamConfigMap[agentId] = { agentId, ...updates };
    } else {
      iamConfigMap[agentId] = { ...iamConfigMap[agentId], ...updates };
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
      iamConfigMap[agentId] = {
        ...iamConfigMap[agentId],
        hasDedicatedIdentity: true,
        serviceAccount: 'promo-agent-sa@qwiklabs-gcp-02-26c698bb5fef.iam.gserviceaccount.com'
      };
    }
  }

  async function fetchCloudDataSafe(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Offline');
      const data = await res.json();
      return data;
    } catch {
      cloudData = { errorFallbackActive: true };
      return null;
    }
  }

  return {
    get activeTab() { return activeTab; },
    get selectedAgentId() { return selectedAgentId; },
    get selectedAgent() { return selectedAgent; },
    get agents() { return agents; },
    get timelineMetric() { return timelineMetric; },
    get isLiveCloud() { return isLiveCloud; },
    get isStreaming() { return isStreaming; },
    get timeRange() { return timeRange; },
    get timelineData() { return timelineData; },
    get visibleTimelineAgents() { return visibleTimelineAgents; },
    get recentTraces() { return recentTraces; },
    get workforceKPIs() { return workforceKPIs; },
    get fleetKPIs() { return fleetKPIs; },
    get simulatedWorkforce() { return simulatedWorkforce; },
    get sankeyData() { return sankeyData; },
    get humanHourlyWage() { return humanHourlyWage; },
    get simScaleMultiplier() { return simScaleMultiplier; },
    get cloudOverview() { return cloudOverview; },
    get cloudLogs() { return cloudLogs; },
    get cloudWaterfall() { return cloudWaterfall; },
    get cloudConnectionStatus() { return cloudConnectionStatus; },
    get cloudData() { return cloudData; },
    get agentActiveSubTab() { return agentActiveSubTab; },
    setAgentActiveSubTab: (sub) => { agentActiveSubTab = sub; },
    setActiveTab,
    selectAgent,
    setTimelineMetric,
    setHumanHourlyWage,
    setSimScaleMultiplier,
    applyCoachingPreset,
    updateAgentIAMConfig,
    getAgentIAMConfig,
    remediateAgentIdentity,
    fetchCloudDataSafe
  };
}

export const dashboardState = createDashboardState();

