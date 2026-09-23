import { describe, it, expect, beforeEach } from 'vitest';
import { createDashboardState } from '../src/state/dashboardState.js';

describe('SolidJS Dashboard State Truth Table Suite', () => {
  let state;

  beforeEach(() => {
    state = createDashboardState();
  });

  // Row 1: Initial state defaults
  it('test_initial_state_defaults', () => {
    expect(state.activeTab).toBe('overview');
    expect(state.agents.length).toBe(6);
    expect(state.timelineMetric).toBe('speed');
    expect(state.isLiveCloud).toBe(true);
    expect(state.selectedAgentId).toBe('promo-shadow');
    expect(state.workforceKPIs.totalTasksCompleted).toBeGreaterThan(0);
    expect(state.workforceKPIs.fteEquivalency).toBeGreaterThan(0);
  });

  // Row 2: Tab switching to workforce
  it('test_tab_switching_workforce', () => {
    state.setActiveTab('workforce');
    expect(state.activeTab).toBe('workforce');
  });

  // Row 3: Tab switching to detail with specific agent
  it('test_tab_switching_agent_detail', () => {
    state.selectAgent('customer-support');
    expect(state.selectedAgentId).toBe('customer-support');
    expect(state.activeTab).toBe('detail');
  });

  // Row 4: Story lens switch to quality
  it('test_timeline_lens_switch_quality', () => {
    state.setTimelineMetric('quality');
    expect(state.timelineMetric).toBe('quality');
  });

  // Row 5: Story lens switch to value
  it('test_timeline_lens_switch_value', () => {
    state.setTimelineMetric('value');
    expect(state.timelineMetric).toBe('value');
  });

  // Row 6: Wage simulator recalculation
  it('test_wage_simulator_recalculation', () => {
    const initialSimValue = state.simulatedWorkforce.annualizedNetSavings;
    state.setHumanHourlyWage(100);
    state.setSimScaleMultiplier(2.0);
    expect(state.simulatedWorkforce.annualizedNetSavings).toBeGreaterThan(initialSimValue);
    expect(state.simulatedWorkforce.simulatedFTEs).toBeGreaterThan(state.workforceKPIs.fteEquivalency);
  });

  // Row 7: Supervisory preset click on promo-shadow
  it('test_coaching_preset_application', () => {
    state.selectAgent('promo-shadow');
    state.applyCoachingPreset('promo-shadow');
    const agent = state.agents.find(a => a.id === 'promo-shadow');
    expect(agent.parameters.temperature).toBe(0.20);
    expect(agent.parameters.groundingMode).toBe('strict');
    expect(agent.parameters.confidenceThreshold).toBe(0.90);
    expect(agent.rules.find(r => r.id === 'rl-ps-1').enabled).toBe(true);
    expect(agent.rules.find(r => r.id === 'rl-ps-2').enabled).toBe(true);
  });

  // Row 8: IAM scan cap slider
  it('test_iam_bq_scan_cap_slider', () => {
    state.updateAgentIAMConfig('promo-shadow', {
      bigqueryScanCapGB: 25,
      maxScanBytesPerQuery: 26843545600
    });
    const iam = state.getAgentIAMConfig('promo-shadow');
    expect(iam.bigqueryScanCapGB).toBe(25);
    expect(iam.maxScanBytesPerQuery).toBe(26843545600);
  });

  // Row 9: IAM identity remediation
  it('test_iam_remediate_service_account', () => {
    const initialIam = state.getAgentIAMConfig('promo-shadow');
    expect(initialIam.hasDedicatedIdentity).toBe(false);

    state.remediateAgentIdentity('promo-shadow');
    const updatedIam = state.getAgentIAMConfig('promo-shadow');
    expect(updatedIam.hasDedicatedIdentity).toBe(true);
    expect(updatedIam.serviceAccount).toContain('promo-agent-sa');
  });

  // Row 10: Cloud sync polling graceful fallback
  it('test_cloud_polling_graceful_fallback', async () => {
    // Calling refreshWithFallback when backend is offline
    await state.fetchCloudDataSafe('http://localhost:9999/invalid-endpoint');
    // Ensure state remains valid and mock agents are intact
    expect(state.agents.length).toBe(6);
    expect(state.cloudData.errorFallbackActive).toBe(true);
  });
});
