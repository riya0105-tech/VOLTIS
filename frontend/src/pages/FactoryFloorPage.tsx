import { useState, useEffect } from 'react';
import {
  Layers,
  Clock,
  Zap,
  IndianRupee,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Wind,
  Fan,
  RotateCw,
  Droplets,
  Activity,
} from 'lucide-react';
import { Machine, MachineStatus } from '../types';
import { fetchMachines } from '../services/machineService';
import { MachineTelemetryModal } from '../components/digital-twin/MachineTelemetryModal';
import { EnergyDigitalTwin } from '../components/digital-twin/EnergyDigitalTwin';

type TOUFilter = 'ALL' | 'CRITICAL_FIXED' | 'CRITICAL_SHIFTABLE' | 'IMPORTANT_SHIFTABLE' | 'NON_CRITICAL_SHIFTABLE';

function getMachineTOUClassification(m: Machine): {
  id: TOUFilter;
  label: string;
  badgeStyle: string;
} {
  const imp = m.tou_info?.importance ?? 'IMPORTANT';
  const shiftable = m.tou_info?.shiftable ?? false;

  if (imp === 'CRITICAL') {
    if (!shiftable) {
      return {
        id: 'CRITICAL_FIXED',
        label: 'Critical — Fixed',
        badgeStyle: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
      };
    }
    return {
      id: 'CRITICAL_SHIFTABLE',
      label: 'Critical — Shiftable',
      badgeStyle: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    };
  }

  if (imp === 'IMPORTANT') {
    return {
      id: 'IMPORTANT_SHIFTABLE',
      label: shiftable ? 'Important — Shiftable' : 'Important — Fixed',
      badgeStyle: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    };
  }

  return {
    id: 'NON_CRITICAL_SHIFTABLE',
    label: shiftable ? 'Non-critical — Shiftable' : 'Non-critical — Fixed',
    badgeStyle: 'bg-slate-800 text-slate-300 border border-slate-700',
  };
}

export function FactoryFloorPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [touFilter, setTouFilter] = useState<TOUFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MachineStatus>('ALL');
  const [viewMode, setViewMode] = useState<'spatial' | 'table'>('table');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMachines()
      .then((data) => setMachines(data))
      .finally(() => setLoading(false));
  }, []);

  const getMachineIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'transformer':
        return Zap;
      case 'compressor':
        return Wind;
      case 'furnace':
        return Flame;
      case 'hvac':
        return Fan;
      case 'motor':
        return RotateCw;
      case 'pump':
        return Droplets;
      case 'production line':
        return Layers;
      default:
        return Activity;
    }
  };

  const filteredMachines = machines.filter((m) => {
    if (touFilter !== 'ALL') {
      const cls = getMachineTOUClassification(m);
      if (cls.id !== touFilter) return false;
    }
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Factory Floor & Machinery Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detailed equipment status, Time-of-Use (TOU) scheduling constraints, and real-time electrical demand.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Machine Schedule Grid
          </button>
          <button
            onClick={() => setViewMode('spatial')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              viewMode === 'spatial' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2D Power Flow Canvas
          </button>
        </div>
      </div>

      {viewMode === 'spatial' ? (
        <EnergyDigitalTwin machines={machines} onSelectMachine={(m) => setSelectedMachine(m)} />
      ) : (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            {/* TOU Classification Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium mr-1">Classification:</span>
              {[
                { id: 'ALL', label: 'All (9)' },
                { id: 'CRITICAL_FIXED', label: 'Critical — Fixed (3)' },
                { id: 'CRITICAL_SHIFTABLE', label: 'Critical — Shiftable (1)' },
                { id: 'IMPORTANT_SHIFTABLE', label: 'Important — Shiftable (4)' },
                { id: 'NON_CRITICAL_SHIFTABLE', label: 'Non-critical — Shiftable (1)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTouFilter(tab.id as TOUFilter)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    touFilter === tab.id
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-400 font-medium">Status:</span>
              {(['ALL', 'ANOMALY', 'WARNING', 'NORMAL'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'ANOMALY' ? 'Needs Attention (1)' : st === 'WARNING' ? 'Warning (1)' : 'Normal (7)'}
                </button>
              ))}
            </div>
          </div>

          {/* Machine Details Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMachines.map((m) => {
                const Icon = getMachineIcon(m.type);
                const isAnomaly = m.status === 'ANOMALY';
                const isWarning = m.status === 'WARNING';
                const tou = m.tou_info;
                const classification = getMachineTOUClassification(m);

                return (
                  <div
                    key={m.machine_id}
                    onClick={() => setSelectedMachine(m)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isAnomaly
                        ? 'bg-red-950/20 border-red-500/50 hover:border-red-400'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-2 rounded-xl border ${
                              isAnomaly
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : isWarning
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white tracking-tight">{m.name}</h3>
                            <p className="text-[11px] text-slate-400">{m.production_association}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isAnomaly
                                ? 'bg-red-500/20 text-red-300'
                                : isWarning
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/10 text-emerald-400'
                            }`}
                          >
                            {m.status === 'ANOMALY' ? 'Needs Attention' : m.status === 'WARNING' ? 'Warning' : 'Normal'}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${classification.badgeStyle}`}>
                            {classification.label}
                          </span>
                        </div>
                      </div>

                      {/* Power & Thermal Row */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs mt-3">
                        <div>
                          <span className="text-slate-500 text-[10px] block">POWER DRAW</span>
                          <span className="font-semibold text-white">{m.power_kw} kW</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">TEMPERATURE</span>
                          <span className={m.temperature > 70 ? 'font-semibold text-red-400' : 'text-slate-200'}>
                            {m.temperature}°C
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">VIBRATION</span>
                          <span className={m.vibration > 3.5 ? 'font-semibold text-red-400' : 'text-slate-200'}>
                            {m.vibration} mm/s
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* TOU Scheduling Details */}
                    {tou && (
                      <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Operating Hours:
                          </span>
                          <span>
                            <strong className="text-white">{tou.current_hours_day}h</strong> / {tou.required_hours_day}h req
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Preferred Window:</span>
                          <span className="font-medium text-slate-200 text-right">{tou.preferred_tou_window}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Shiftability:</span>
                          <span className={`font-semibold ${tou.shiftable ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {tou.shiftable ? 'Shiftable to off-peak' : 'Fixed continuous load'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <IndianRupee className="w-3 h-3 text-slate-400" />
                            Est. Daily Cost:
                          </span>
                          <span className="font-semibold text-white">
                            ₹{tou.daily_cost_inr.toLocaleString('en-IN')} ({tou.daily_energy_kwh} kWh)
                          </span>
                        </div>

                        {tou.shift_restriction_notes && (
                          <div className="text-[11px] text-slate-400 italic pt-0.5">
                            Note: {tou.shift_restriction_notes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">ID: {m.machine_id}</span>
                      <span className="text-cyan-400 font-medium flex items-center gap-0.5 hover:underline">
                        View Telemetry <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
