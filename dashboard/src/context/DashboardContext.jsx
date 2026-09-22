import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_AGENTS, generateTimelineData, generateSankeyData, MOCK_TRACES } from '../data/mockData';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState('promo-shadow');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'detail' | 'finetune'
  const [agentActiveSubTab, setAgentActiveSubTab] = useState('refine'); // 'refine' | 'telemetry' | 'traces'
  const [timeRange, setTimeRange] = useState('1h');
  const [isStreaming, setIsStreaming] = useState(true);
  const [timelineData, setTimelineData] = useState(() => generateTimelineData(24));
  const [visibleTimelineAgents, setVisibleTimelineAgents] = useState(() =>
    INITIAL_AGENTS.map(a => a.id)
  );
  const [recentTraces, setRecentTraces] = useState(MOCK_TRACES);
  const [saveNotification, setSaveNotification] = useState(null);
  const [storyLens, setStoryLens] = useState('speed'); // 'speed' | 'quality' | 'value'

  // Cloud Console Connection Mode: 'cloud' | 'simulation'
  const [dataSourceMode, setDataSourceMode] = useState('cloud');
  const [cloudOverview, setCloudOverview] = useState(null);
  const [cloudLogs, setCloudLogs] = useState([]);
  const [cloudWaterfall, setCloudWaterfall] = useState(null);
  const [cloudIAMData, setCloudIAMData] = useState(null);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [cloudConnectionStatus, setCloudConnectionStatus] = useState('connecting'); // 'connected' | 'disconnected' | 'connecting'

  const fetchCloudData = useCallback(async () => {
    try {
      setIsCloudLoading(true);
      const [overviewRes, logsRes, waterfallRes, iamRes] = await Promise.all([
        fetch('/api/cloud/overview').catch(() => null),
        fetch('/api/cloud/logs').catch(() => null),
        fetch('/api/cloud/waterfall').catch(() => null),
        fetch('/api/cloud/iam').catch(() => null)
      ]);

      if (overviewRes && overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setCloudOverview(overviewData);
        setCloudConnectionStatus('connected');
      } else {
        setCloudConnectionStatus('disconnected');
      }

      if (logsRes && logsRes.ok) {
        const logsData = await logsRes.json();
        setCloudLogs(logsData.logs || []);
      }

      if (waterfallRes && waterfallRes.ok) {
        const waterfallData = await waterfallRes.json();
        setCloudWaterfall(waterfallData);
      }

      if (iamRes && iamRes.ok) {
        const iamData = await iamRes.json();
        setCloudIAMData(iamData);
      }
    } catch (err) {
      console.warn('Cloud API fetch error:', err);
      setCloudConnectionStatus('disconnected');
    } finally {
      setIsCloudLoading(false);
    }
  }, []);

  // Poll cloud data periodically if in cloud mode
  useEffect(() => {
    fetchCloudData();
    const interval = setInterval(() => {
      if (dataSourceMode === 'cloud' && isStreaming) {
        fetchCloudData();
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchCloudData, dataSourceMode, isStreaming]);

  const remediateInCloud = useCallback(async (payload) => {
    try {
      const res = await fetch('/api/cloud/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const record = await res.json();
        fetchCloudData();
        return record;
      }
    } catch (e) {
      console.error('Failed to trigger cloud remediation:', e);
    }
    return null;
  }, [fetchCloudData]);

  const updateAgentIAMConfig = useCallback(async (agentId, updates) => {
    try {
      const res = await fetch('/api/cloud/iam/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, ...updates })
      });
      if (res.ok) {
        const result = await res.json();
        setCloudIAMData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            agents: {
              ...prev.agents,
              [agentId]: result.updatedAgent
            }
          };
        });
        return result;
      }
    } catch (e) {
      console.error('Failed to update agent IAM config:', e);
    }
    return null;
  }, []);

  // Selected agent object
  const selectedAgent = useMemo(() => {
    const found = agents.find(a => a.id === selectedAgentId) || agents[0];
    // Enrich with live Cloud Run URL if in cloud mode
    if (dataSourceMode === 'cloud' && cloudOverview?.cloudRun?.services) {
      const cloudService = cloudOverview.cloudRun.services.find(s => 
        s.name.includes(found.id) || (found.id === 'promo-shadow' && s.name.includes('promo-agent-shadow'))
      );
      if (cloudService) {
        return {
          ...found,
          cloudService
        };
      }
    }
    return found;
  }, [agents, selectedAgentId, dataSourceMode, cloudOverview]);

  // Navigate directly to a specific agent's tab and sub-section
  const goToAgent = useCallback((agentId, subTab = 'refine') => {
    setSelectedAgentId(agentId);
    setAgentActiveSubTab(subTab);
    setActiveTab('detail');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  }, []);

  // Aggregate Fleet KPIs
  const fleetKPIs = useMemo(() => {
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
  }, [agents]);

  // Aggregate Digital Workforce & ROI KPIs (Treating Agents as Employees)
  const workforceKPIs = useMemo(() => {
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
  }, [agents]);

  // Sankey data dynamic computation
  const sankeyData = useMemo(() => {
    return generateSankeyData(agents);
  }, [agents]);

  // Real-time streaming simulation: appends a fresh point every 4 seconds when isStreaming is active
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setTimelineData(prev => {
        const last = prev[prev.length - 1];
        const nextTimestamp = (last ? last.timestamp : Date.now()) + 30000;
        const timeLabel = new Date(nextTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const randomJitter = (base, amp = 0.25) => +(base + (Math.random() - 0.5) * amp).toFixed(2);
        const spike = Math.random() < 0.15;

        const newPoint = {
          time: timeLabel,
          timestamp: nextTimestamp,
          'core-assistant': randomJitter(1.35),
          'price-match': randomJitter(0.85),
          'deep-research': randomJitter(spike ? 7.2 : 5.4, 0.9),
          'customer-support': randomJitter(1.10),
          'promo-shadow': randomJitter(spike ? 3.9 : 1.95, 0.5),
          'workspace-agent': randomJitter(3.6, 0.5),
          anomalyDetected: spike,
          anomalyAgent: spike ? 'Promo Strategy Shadow Agent' : null,
          anomalyReason: spike ? 'Reprompting Loop (Triggered by margin check)' : null,
        };

        const sliceStart = prev.length > 28 ? 1 : 0;
        return [...prev.slice(sliceStart), newPoint];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Toggle timeline agent visibility
  const toggleTimelineAgent = useCallback((agentId) => {
    setVisibleTimelineAgents(prev => {
      if (prev.includes(agentId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(id => id !== agentId);
      } else {
        return [...prev, agentId];
      }
    });
  }, []);

  // Toggle Agent Skill
  const toggleAgentSkill = useCallback((agentId, skillId) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id !== agentId) return agent;
      const updatedSkills = agent.skills.map(sk => {
        if (sk.id === skillId) {
          return { ...sk, enabled: !sk.enabled };
        }
        return sk;
      });
      return { ...agent, skills: updatedSkills };
    }));
  }, []);

  // Add Agent Skill
  const addAgentSkill = useCallback((agentId, newSkill) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id !== agentId) return agent;
      const skillObj = {
        id: `sk-${Date.now().toString().slice(-4)}`,
        name: newSkill.name,
        description: newSkill.description,
        enabled: true,
        riskLevel: newSkill.riskLevel || 'low',
        runs: 0
      };
      return { ...agent, skills: [...agent.skills, skillObj] };
    }));
  }, []);

  // Toggle Agent Rule
  const toggleAgentRule = useCallback((agentId, ruleId) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id !== agentId) return agent;
      const updatedRules = agent.rules.map(rl => {
        if (rl.id === ruleId) {
          return { ...rl, enforced: !rl.enforced };
        }
        return rl;
      });

      // Recalculate health: if critical rules are enforced, improve status
      const unenforcedSafetyRules = updatedRules.filter(r => r.category === 'safety' && !r.enforced);
      const isStatusDegraded = unenforcedSafetyRules.length > 0 || agent.errors.hallucinationRate > 6.0;

      return {
        ...agent,
        rules: updatedRules,
        status: isStatusDegraded ? 'degraded' : agent.errors.repromptRate > 8.0 ? 'warning' : 'active'
      };
    }));
  }, []);

  // Add Agent Rule
  const addAgentRule = useCallback((agentId, newRule) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id !== agentId) return agent;
      const ruleObj = {
        id: `rl-${Date.now().toString().slice(-4)}`,
        name: newRule.name,
        description: newRule.description,
        enforced: true,
        category: newRule.category || 'safety'
      };
      return { ...agent, rules: [...agent.rules, ruleObj] };
    }));
  }, []);

  // Comprehensive Agent Refinement (Skills, Rules, Model Options, System Prompt, Reprompt Policy)
  const refineAgent = useCallback((agentId, updates) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id !== agentId) return agent;

      const newConfig = { ...agent.fineTuneConfig, ...updates.fineTuneConfig };
      const newSkills = updates.skills || agent.skills;
      const newRules = updates.rules || agent.rules;

      // Calculate simulated performance improvements based on fine-tune parameters
      const tempFactor = (newConfig.temperature - 0.1) * 2;
      const groundingDiscount = newConfig.groundingMode === 'strict' ? 0.45 : newConfig.groundingMode === 'balanced' ? 0.75 : 1.1;
      const citationDiscount = newConfig.requireCitations ? 0.7 : 1.0;
      
      // Check if safety rules are enforced
      const allSafetyEnforced = newRules.filter(r => r.category === 'safety').every(r => r.enforced);
      const safetyRuleDiscount = allSafetyEnforced ? 0.6 : 1.2;

      const newHallucinationRate = +(Math.max(0.4, agent.errors.hallucinationRate * groundingDiscount * citationDiscount * safetyRuleDiscount * (1 + tempFactor * 0.25))).toFixed(1);
      const newRepromptRate = +(Math.max(1.5, agent.errors.repromptRate * (newConfig.repromptStrategy === 'schema-reminder' ? 0.65 : 0.85))).toFixed(1);
      const newGroundingScore = +(Math.min(0.99, agent.errors.groundingScore + (newConfig.groundingMode === 'strict' ? 0.06 : 0.02))).toFixed(2);

      const status = (!allSafetyEnforced || newHallucinationRate > 5.5) ? 'degraded' : (newHallucinationRate > 3.5 || newRepromptRate > 7.5) ? 'warning' : 'active';

      return {
        ...agent,
        status,
        model: newConfig.model,
        skills: newSkills,
        rules: newRules,
        errors: {
          ...agent.errors,
          hallucinationRate: newHallucinationRate,
          repromptRate: newRepromptRate,
          groundingScore: newGroundingScore,
        },
        fineTuneConfig: newConfig
      };
    }));

    setSaveNotification({
      title: 'Agent Refinements Deployed to Fleet',
      message: `Updated skills, guardrail rules, model options, and system prompt for ${agentId}. Live telemetry updated.`,
      timestamp: Date.now()
    });

    setTimeout(() => {
      setSaveNotification(null);
    }, 4500);
  }, []);

  // Run benchmark simulation for fine-tuning comparisons
  const runBenchmarkSimulation = useCallback((agentId, config, rules = []) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return null;

    const baseLat = agent.avgLatency;
    const baseHal = agent.errors.hallucinationRate;
    const baseRep = agent.errors.repromptRate;

    const safetyBonus = rules.every(r => r.enforced) ? -20 : 0;
    const latencyDelta = config.model.includes('flash') ? -0.35 : config.groundingMode === 'strict' ? +0.25 : -0.1;
    const halReduction = (config.groundingMode === 'strict' ? -42 : config.groundingMode === 'balanced' ? -22 : +15) + safetyBonus;
    const repromptReduction = config.repromptStrategy === 'schema-reminder' ? -35 : -15;
    const tokenSavings = config.requireCitations ? +8 : -14;

    return {
      before: {
        latency: baseLat,
        hallucinationRate: baseHal,
        repromptRate: baseRep,
        tokenPerQuery: Math.round(agent.tokens.total / agent.totalRuns),
      },
      after: {
        latency: +(Math.max(0.5, baseLat + latencyDelta)).toFixed(2),
        hallucinationRate: +(Math.max(0.4, baseHal * (1 + halReduction / 100))).toFixed(1),
        repromptRate: +(Math.max(1.2, baseRep * (1 + repromptReduction / 100))).toFixed(1),
        tokenPerQuery: Math.round((agent.tokens.total / agent.totalRuns) * (1 + tokenSavings / 100)),
      },
      impact: {
        halReduction: Math.abs(halReduction),
        isHalBetter: halReduction < 0,
        repromptReduction: Math.abs(repromptReduction),
        isRepromptBetter: repromptReduction < 0,
        latencyDelta: +(latencyDelta).toFixed(2),
        isLatencyFaster: latencyDelta <= 0
      }
    };
  }, [agents]);

  const value = {
    agents,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    activeTab,
    setActiveTab,
    agentActiveSubTab,
    setAgentActiveSubTab,
    goToAgent,
    timeRange,
    setTimeRange,
    isStreaming,
    setIsStreaming,
    timelineData,
    visibleTimelineAgents,
    toggleTimelineAgent,
    recentTraces,
    fleetKPIs,
    workforceKPIs,
    sankeyData,
    toggleAgentSkill,
    addAgentSkill,
    toggleAgentRule,
    addAgentRule,
    refineAgent,
    updateAgentFineTuneConfig: (agentId, cfg) => refineAgent(agentId, { fineTuneConfig: cfg }),
    runBenchmarkSimulation,
    saveNotification,
    storyLens,
    setStoryLens,
    dataSourceMode,
    setDataSourceMode,
    cloudOverview,
    cloudLogs,
    cloudWaterfall,
    cloudIAMData,
    isCloudLoading,
    cloudConnectionStatus,
    fetchCloudData,
    remediateInCloud,
    updateAgentIAMConfig,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
