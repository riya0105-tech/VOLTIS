import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  AlertCircle,
  Clock,
  Zap,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  FactoryOverview,
  Machine,
  EnergyDataPoint,
  Alert,
  Recommendation,
} from '../types';
import {
  fetchFactoryOverview,
  fetchMachines,
  fetchTodayEnergy,
  fetchAlerts,
  fetchRecommendations,
  isUsingMockData,
  subscribeMockStatus,
  setUsingMockData,
} from '../services';
import { mockFactoryOverview } from '../data/mockData';
import { KPISection } from '../components/dashboard/KPISection';
import { EnergyDigitalTwin } from '../components/digital-twin/EnergyDigitalTwin';
import { AIAlertsPanel } from '../components/alerts/AIAlertsPanel';
import { EnergyTrendChart } from '../components/charts/EnergyTrendChart';
import { OptimizationPanel } from '../components/optimization/OptimizationPanel';
import { FactoryImpactSummary } from '../components/optimization/FactoryImpactSummary';
import { AICopilotPanel } from '../components/copilot/AICopilotPanel';

export function DashboardPage() {
  const [overview, setOverview] = useState<FactoryOverview | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [energyData, setEnergyData] = useState<EnergyDataPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [, setRecommendations] = useState<Recommendation[]>([]);
  const [isFallback, setIsFallback] = useState(isUsingMockData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  useEffect(() => {
    return subscribeMockStatus(setIsFallback);
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, machinesData, energyPoints, alertsData, recsData] =
        await Promise.all([
          fetchFactoryOverview('factory_001'),
          fetchMachines(),
          fetchTodayEnergy(),
          fetchAlerts(),
          fetchRecommendations(),
        ]);

      setOverview(overviewData);
      setMachines(machinesData);
      setEnergyData(energyPoints);
      setAlerts(alertsData);
      setRecommendations(recsData);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Successful factory overview from live backend prevents switching to Demo / Offline state
      if (overviewData && overviewData !== mockFactoryOverview) {
        setUsingMockData(false);
        setIsFallback(false);
      }
    } catch (err: unknown) {
      console.error('Failed to load dashboard data:', err);
      setError('Could not connect to live backend. Displaying demo plant telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived live power and energy metrics
  const livePowerKw = machines.length > 0
    ? Math.round(machines.filter((m) => m.type !== 'Transformer').reduce((sum, m) => sum + m.power_kw, 0) * 10) / 10
    : 265.9;
  const todayEnergyKwh = overview?.kpis?.energy_today_kwh ?? 8917.2;

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* A. Factory Health & Overview Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {overview?.factory?.name || 'Shree Textiles Pvt. Ltd.'}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Attention needed
            </span>
            {isFallback && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-850 text-slate-400 border border-slate-700">
                Demo / Offline data
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            2 energy issues are currently affecting efficiency. Shifting Batch B schedule to off-peak can save ₹20,400 today.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
          {lastRefreshed && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Updated {lastRefreshed}
            </span>
          )}
          <button
            onClick={loadDashboardData}
            disabled={loading}
            aria-label="Refresh telemetry"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error notice if needed */}
      {error && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="text-xs font-medium text-amber-200 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* B. Live Energy Clarity Banner (Clear kW vs kWh distinction) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 font-medium">Live Factory Power</span>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">kW</span>
            </div>
            <div className="text-lg font-bold text-white tracking-tight mt-0.5">
              {livePowerKw} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
            <span className="text-[11px] text-slate-400">Current real-time load</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-4 pt-3 sm:pt-0">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 font-medium">Today's Energy</span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">kWh</span>
            </div>
            <div className="text-lg font-bold text-white tracking-tight mt-0.5">
              {todayEnergyKwh.toLocaleString('en-IN', { maximumFractionDigits: 1 })} <span className="text-xs font-normal text-slate-400">kWh</span>
            </div>
            <span className="text-[11px] text-slate-400">Total consumed since 00:00</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-4 pt-3 sm:pt-0">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 font-medium">Peak Demand Today</span>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">Recorded</span>
            </div>
            <div className="text-lg font-bold text-white tracking-tight mt-0.5">
              482.5 <span className="text-xs font-normal text-slate-400">kW</span>
              <span className="text-xs text-slate-400 font-normal ml-1.5">at 14:15</span>
            </div>
            <span className="text-[11px] text-slate-400">Contract Demand: 450 kVA</span>
          </div>
        </div>
      </div>

      {/* C. KPI Summary */}
      <KPISection kpis={overview?.kpis} isLoading={loading} />

      {/* C. Energy Digital Twin (Spatial 2D Factory Floor & Power Flow) */}
      <EnergyDigitalTwin machines={machines} />

      {/* D. What Needs Attention & Why */}
      <AIAlertsPanel alerts={alerts} />

      {/* E. Energy Consumption Trend */}
      <EnergyTrendChart data={energyData} isLoading={loading} />

      {/* F. What-If Schedule Optimization */}
      <OptimizationPanel />

      {/* G. Factory Optimization Impact Summary */}
      <FactoryImpactSummary />

      {/* H. Conversational Floating AI Copilot */}
      <AICopilotPanel />
    </div>
  );
}
