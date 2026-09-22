import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  Activity,
  Cpu,
  Layers,
  Sliders,
  Radio,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  Cloud,
  Server,
  ExternalLink,
  Zap,
  ChevronDown,
  Check
} from 'lucide-react';

export function Header() {
  const {
    activeTab,
    setActiveTab,
    timeRange,
    setTimeRange,
    isStreaming,
    setIsStreaming,
    fleetKPIs,
    workforceKPIs,
    agents,
    saveNotification,
    dataSourceMode,
    setDataSourceMode,
    cloudOverview,
    isCloudLoading,
    cloudConnectionStatus,
    refreshCloudData
  } = useDashboard();

  const [showCloudMenu, setShowCloudMenu] = useState(false);
  const degradedAgents = agents.filter(a => a.status === 'degraded' || a.status === 'warning');

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Toast Notification */}
      {saveNotification && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{saveNotification.title}:</span>
            <span>{saveNotification.message}</span>
          </div>
          <span className="text-emerald-400/70 font-mono text-[10px]">Active In Fleet</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Fleet Health */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-white tracking-tight">NovaSmart AgentOps</h1>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded">
                    v2.4 GA
                  </span>
                </div>
                <p className="text-xs text-slate-400">Operating Telemetry &amp; Observability Hub</p>
              </div>
            </div>

            {/* Fleet Status Pill */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900 border border-slate-800">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isStreaming ? 'bg-emerald-400' : 'bg-slate-500'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isStreaming ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                </span>
                <span className="text-slate-300 font-medium">6 Agents Monitored</span>
              </div>

              {degradedAgents.length > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span className="text-[11px] font-medium">{degradedAgents.length} Action Needed</span>
                </div>
              )}
            </div>
          </div>

          {/* Time Range, Cloud Console Switcher, and Streaming Controls */}
          <div className="flex items-center gap-3">
            {/* GOOGLE CLOUD CONSOLE STATUS BADGE & MODE SWITCHER */}
            <div className="relative">
              <button
                onClick={() => setShowCloudMenu(!showCloudMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  dataSourceMode === 'cloud'
                    ? 'bg-blue-950/60 text-blue-300 border-blue-500/40 hover:bg-blue-900/60 shadow-xs'
                    : 'bg-purple-950/60 text-purple-300 border-purple-500/40 hover:bg-purple-900/60 shadow-xs'
                }`}
                title="Google Cloud Console Integration & Telemetry Source"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    dataSourceMode === 'cloud' && cloudConnectionStatus === 'connected'
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-purple-400'
                  }`} />
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <span className="font-mono text-[11px] hidden sm:inline">
                  {dataSourceMode === 'cloud' ? 'GCP: qwiklabs-gcp-02...' : 'Simulation Mode'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* DROPDOWN POPOVER FOR CLOUD ESTATE DETAILS */}
              {showCloudMenu && (
                <div className="absolute right-0 mt-2 w-84 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">Google Cloud Connection</span>
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                      cloudConnectionStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {cloudConnectionStatus === 'connected' ? 'LIVE ADC LINK' : 'OFFLINE'}
                    </span>
                  </div>

                  {/* Mode Switcher Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-3 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setDataSourceMode('cloud')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                        dataSourceMode === 'cloud'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>Live GCP Cloud</span>
                    </button>
                    <button
                      onClick={() => setDataSourceMode('simulation')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                        dataSourceMode === 'simulation'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Simulation</span>
                    </button>
                  </div>

                  {/* Cloud Environment Metadata */}
                  <div className="mt-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Project:</span>
                      <span className="font-mono text-slate-200 text-[11px]">
                        {cloudOverview?.gcp?.projectId || 'qwiklabs-gcp-02-26c698bb5fef'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Cloud Run Services:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {cloudOverview?.cloudRun?.total || 4} Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Agent Registry:</span>
                      <span className="font-mono font-bold text-indigo-400">
                        {cloudOverview?.agentRegistry?.total || 1} Registered (us-central1)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>BigQuery Datasets:</span>
                      <span className="font-mono text-slate-300">
                        {cloudOverview?.bigquery?.datasets?.length || 3} ({cloudOverview?.bigquery?.datasets?.join(', ') || 'competitor_data...'})
                      </span>
                    </div>
                  </div>

                  {/* External Links to Console */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <a
                      href={cloudOverview?.gcp?.consoleUrl || `https://console.cloud.google.com/home/dashboard?project=qwiklabs-gcp-02-26c698bb5fef`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                    >
                      <span>Open GCP Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => { refreshCloudData(); }}
                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      title="Refresh telemetry from GCP APIs"
                    >
                      <RefreshCw className={`w-3 h-3 ${isCloudLoading ? 'animate-spin text-blue-400' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              {['1h', '6h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Live Streaming Toggle */}
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isStreaming
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={isStreaming ? 'Pause Real-Time Telemetry' : 'Resume Real-Time Telemetry'}
            >
              <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'text-emerald-400 animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{isStreaming ? 'LIVE STREAM' : 'STREAM PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* Global Page Tabs Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-850 pt-2 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Fleet Mission Control</span>
          </button>

          <button
            onClick={() => setActiveTab('workforce')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'workforce'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Digital Workforce &amp; ROI</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {workforceKPIs?.netFleetROI?.toLocaleString() || '6,650'}x ROI
            </span>
          </button>

          {/* NEW 5TH TAB: TOKEN TELEMETRY & GANTT WATERFALL */}
          <button
            onClick={() => setActiveTab('waterfall')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'waterfall'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Token Telemetry &amp; Waterfall</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Gantt FinOps
            </span>
          </button>

          <button
            onClick={() => setActiveTab('detail')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'detail'
                ? 'border-brand-500 text-brand-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Agent Coaching Studio</span>
            {degradedAgents.length > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                {degradedAgents.length} Action Needed
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('finetune')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'finetune'
                ? 'border-brand-500 text-brand-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Fleet Benchmark &amp; Sandbox</span>
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
