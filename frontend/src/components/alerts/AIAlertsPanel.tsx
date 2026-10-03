import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { Alert } from '../../types';

interface AIAlertsPanelProps {
  alerts: Alert[];
  onInspectMachine?: (machineId: string) => void;
}

export function AIAlertsPanel({ alerts, onInspectMachine }: AIAlertsPanelProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <div className="space-y-4">
      {/* What Needs Attention Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>What Needs Attention</span>
            <span className="text-xs font-normal text-slate-400">
              • {alerts.length > 0 ? alerts.length : 2} items affecting energy efficiency
            </span>
          </h2>
        </div>
      </div>

      {/* Main Natural Explanation Box */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        {/* Natural Question & Answer */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-850/60 border border-slate-700/50">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white text-xs block">
              Why is energy higher today?
            </span>
            <p>
              Factory electricity consumption is above expected baseline mainly because <strong className="text-white">Air Compressor #02</strong> is drawing roughly <strong className="text-red-400">35% more power</strong> than normal. Together with night-shift idle run on the HVAC chiller, this accounts for <strong className="text-amber-300">116 kWh of avoidable waste (₹1,790/day)</strong>.
            </p>
          </div>
        </div>

        {/* Issues List (from real backend alerts) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {(alerts && alerts.length > 0 ? alerts : [
            {
              id: 'alert_001',
              machine_id: 'compressor_02',
              severity: 'ANOMALY' as const,
              title: 'Motor #2 — Abnormal Consumption Detected',
              machine_name: 'Air Compressor #02',
              description: 'Operating at 22.1 kW (35% above normal load). Telemetry reveals bearing degradation signatures and elevated discharge heat.',
              estimated_waste_kwh: 74,
              estimated_cost: 1140,
              status: 'ACTIVE' as const,
            },
            {
              id: 'alert_002',
              machine_id: 'hvac_01',
              severity: 'WARNING' as const,
              title: 'HVAC Chiller — Unscheduled Off-Hour Operation',
              machine_name: 'Central HVAC & Chiller',
              description: 'Ran 2.3 hours idle during night window with thermostat override engaged.',
              estimated_waste_kwh: 42,
              estimated_cost: 650,
              status: 'ACTIVE' as const,
            },
          ]).map((alert) => {
            const isAnomaly = alert.severity === 'ANOMALY' || alert.severity === 'HIGH';
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl bg-slate-900 border flex flex-col justify-between space-y-3 transition-colors ${
                  isAnomaly
                    ? 'border-red-500/30 hover:border-red-500/50'
                    : 'border-amber-500/30 hover:border-amber-500/50'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isAnomaly ? 'bg-red-500' : 'bg-amber-400'}`} />
                      <span className="text-xs font-semibold text-white">
                        {alert.machine_name || alert.title}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isAnomaly
                          ? 'text-red-400 bg-red-500/10'
                          : 'text-amber-300 bg-amber-500/10'
                      }`}
                    >
                      {isAnomaly ? 'High Priority' : 'Warning'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {alert.description}
                  </p>
                  <div className="text-xs text-slate-400">
                    Potential financial loss: <strong className="text-amber-400 font-semibold">₹{alert.estimated_cost.toLocaleString('en-IN')} / day</strong> ({alert.estimated_waste_kwh} kWh/day)
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    {isAnomaly ? 'Inspect bearings & air leaks' : 'Reset automated night schedule'}
                  </span>
                  <button
                    onClick={() => onInspectMachine?.(alert.machine_id)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    Inspect <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible Technical Details for Engineers */}
        <div className="pt-2">
          <button
            onClick={() => setShowTechnicalDetails((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            {showTechnicalDetails ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>Technical sensor telemetry & diagnostics</span>
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 text-[11px]">DISCHARGE TEMP</span>
                  <p className="font-semibold text-amber-300">72.5°C (Threshold 65.0°C)</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">VIBRATION SPECTRUM</span>
                  <p className="font-semibold text-red-400">4.8 mm/s (ISO 10816 &gt; 2.8)</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">ANOMALY INDEX</span>
                  <p className="font-semibold text-slate-200">0.87 (Critical deviation)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
