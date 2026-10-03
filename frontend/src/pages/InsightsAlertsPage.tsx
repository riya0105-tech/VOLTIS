import { useState, useEffect } from 'react';
import {
  AlertCircle,
  HelpCircle,
  Wrench,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { Alert, Recommendation, Machine } from '../types';
import { fetchAlerts, fetchRecommendations } from '../services/alertService';
import { fetchMachines } from '../services/machineService';
import { MachineTelemetryModal } from '../components/digital-twin/MachineTelemetryModal';

export function InsightsAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'WARNING' | 'ANOMALY' | 'RESOLVED'>('ALL');
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [acknowledgedList, setAcknowledgedList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAlerts(), fetchRecommendations(), fetchMachines()])
      .then(([a, r, m]) => {
        setAlerts(a);
        setRecommendations(r);
        setMachines(m);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedList((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleInspect = (machineId: string) => {
    const found = machines.find((m) => m.machine_id === machineId) || machines[0];
    if (found) setSelectedMachine(found);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return a.status === 'ACTIVE';
    if (statusFilter === 'RESOLVED') return a.status === 'RESOLVED';
    if (statusFilter === 'WARNING') return a.severity === 'WARNING';
    if (statusFilter === 'ANOMALY') return a.severity === 'ANOMALY' || a.severity === 'HIGH';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span>Plant Insights & Active Alerts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time equipment anomalies, plain-English diagnostic explanations, and prescribed maintenance actions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          {(['ALL', 'ACTIVE', 'ANOMALY', 'WARNING', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === st ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Alerts' : st === 'ACTIVE' ? 'Active (2)' : st === 'ANOMALY' ? 'High Priority (1)' : st === 'WARNING' ? 'Warnings (1)' : 'Resolved (0)'}
            </button>
          ))}
        </div>
      </div>

      {/* Natural Explanatory Overview Box */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
        <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white text-sm block">
            Why is energy consumption higher today?
          </span>
          <p>
            Factory electricity consumption is running approximately <strong className="text-amber-300">116 kWh above normal baseline</strong> today.
            The primary driver is <strong className="text-white">Air Compressor #02</strong> operating with 35% thermal excess draw due to suspected mechanical bearing friction and pneumatic line leakage.
            Additionally, the central HVAC chiller ran 2.3 hours idle during the night window due to a manual thermostat override.
          </p>
        </div>
      </div>

      {/* Main Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isAnomaly = alert.severity === 'ANOMALY' || alert.severity === 'HIGH';
            const isAcknowledged = acknowledgedList.includes(alert.id);
            const isExpanded = !!expandedDetails[alert.id];

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isAnomaly
                    ? 'bg-red-950/20 border-red-500/40 hover:border-red-500/60'
                    : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                }`}
              >
                {/* Alert Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        isAnomaly ? 'bg-red-400' : 'bg-amber-400'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white tracking-tight">
                          {alert.title === 'Motor #2 — Abnormal Consumption Detected'
                            ? 'Air Compressor #02 — Abnormal Consumption Detected'
                            : alert.title}
                        </h3>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isAnomaly ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isAnomaly ? 'High Priority' : 'Warning'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Equipment: {alert.machine_name || alert.machine_id}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <button
                      onClick={() => toggleAcknowledge(alert.id)}
                      className={`px-3 py-1 rounded-lg border transition-colors font-medium ${
                        isAcknowledged
                          ? 'bg-blue-950/60 border-blue-500/50 text-blue-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isAcknowledged ? '✓ Acknowledged' : 'Acknowledge'}
                    </button>
                    <button
                      onClick={() => handleInspect(alert.machine_id)}
                      className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-medium flex items-center gap-1 transition-colors"
                    >
                      Inspect Machine <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  {alert.description}
                </p>

                {/* Financial & Energy Impact Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">AVOIDABLE WASTE</span>
                    <span className={`font-semibold text-sm ${isAnomaly ? 'text-red-400' : 'text-amber-400'}`}>
                      {alert.estimated_waste_kwh} kWh / day
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">POTENTIAL FINANCIAL LOSS</span>
                    <span className="font-semibold text-white text-sm">
                      ₹{alert.estimated_cost.toLocaleString('en-IN')} / day
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">RECOMMENDED INTERVENTION</span>
                    <span className="font-medium text-slate-300 flex items-center gap-1 text-xs">
                      <Wrench className="w-3 h-3 text-slate-400" />
                      {isAnomaly ? 'Bearing lubrication & air audit' : 'Reset temperature schedule'}
                    </span>
                  </div>
                </div>

                {/* Collapsible Technical Sensor Telemetry */}
                <div>
                  <button
                    onClick={() => toggleExpand(alert.id)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span>Sensor readings & diagnostic telemetry</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">MEASURED TEMPERATURE</span>
                          <span className="font-semibold text-amber-300">{isAnomaly ? '72.5°C' : '27.3°C'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">VIBRATION LEVEL</span>
                          <span className={`font-semibold ${isAnomaly ? 'text-red-400' : 'text-slate-300'}`}>
                            {isAnomaly ? '4.8 mm/s' : '1.7 mm/s'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">BASELINE VARIANCE</span>
                          <span className="font-semibold text-slate-200">{isAnomaly ? '+35% above normal' : '+15% idle draw'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Prescribed Recommendations Section */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-tight flex items-center justify-between">
          <span>Prioritized Recommendations</span>
          <span className="text-xs font-normal text-emerald-400">Total Potential Savings: ₹1,790 / day</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{rec.machine_name}</span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Save ₹{rec.potential_saving.toLocaleString('en-IN')}/day
                </span>
              </div>
              <p className="text-xs text-slate-300">{rec.problem}</p>
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-slate-400 uppercase font-medium">Recommended Steps:</span>
                <ul className="space-y-1">
                  {rec.recommended_actions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Machine Telemetry Modal */}
      {selectedMachine && (
        <MachineTelemetryModal
          machine={selectedMachine}
          onClose={() => setSelectedMachine(null)}
        />
      )}
    </div>
  );
}
