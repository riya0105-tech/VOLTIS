import { useState } from 'react';
import {
  Zap,
  Wind,
  Flame,
  Fan,
  ArrowRight,
} from 'lucide-react';
import { Machine } from '../../types';
import { MachineTelemetryModal } from './MachineTelemetryModal';

interface EnergyDigitalTwinProps {
  machines: Machine[];
  onSelectMachine?: (machine: Machine) => void;
}

export function EnergyDigitalTwin({ machines, onSelectMachine }: EnergyDigitalTwinProps) {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  const getMachine = (id: string) => machines.find((m) => m.machine_id === id);

  const transformer = getMachine('transformer_01');
  const comp1 = getMachine('compressor_01');
  const comp2 = getMachine('compressor_02');
  const furnace = getMachine('furnace_01');
  const hvac = getMachine('hvac_01');
  const motor1 = getMachine('motor_01');
  const motor2 = getMachine('motor_02');
  const pump1 = getMachine('pump_01');
  const prodLine = getMachine('prod_line_01');

  const handleCardClick = (machine?: Machine) => {
    if (!machine) return;
    setSelectedMachine(machine);
    onSelectMachine?.(machine);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Energy Digital Twin</span>
            <span className="text-xs font-normal text-slate-400">• Plant Floor & Power Flow</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any machine node to inspect temperature, vibration, and sensor history.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Normal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Warning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" /> Anomaly
          </span>
        </div>
      </div>

      {/* 2D Factory Floor Visual Canvas */}
      <div className="rounded-2xl bg-[#090d16] border border-slate-800/90 p-5 lg:p-6 relative overflow-hidden">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-subtle-grid opacity-60 pointer-events-none" />

        {/* Level 1: Inflow Grid & Transformer Hub */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/70">
          {/* Substation Grid Source */}
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Power Source</div>
              <div className="text-xs font-semibold text-white">Surat 11 kV Grid Feed</div>
            </div>
          </div>

          {/* Flow Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Primary Inflow</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </div>

          {/* Main Step-Down Transformer Node */}
          {transformer && (
            <div
              onClick={() => handleCardClick(transformer)}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 cursor-pointer transition-all shadow-sm"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{transformer.name}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  <strong className="text-slate-200">{transformer.power_kw} kW</strong> active / {transformer.rated_power_kw} kW rated
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Level 2: Factory Floor Zones */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5 pt-6">
          {/* ZONE 1: WEAVING & PNEUMATICS */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-slate-400" />
                Weaving & Air Systems
              </span>
              <span className="text-[11px] text-slate-400">4 machines</span>
            </div>

            <div className="space-y-2.5">
              {/* Compressor #02: ANOMALY (Visibly highlighted with red gentle pulse) */}
              {comp2 && (
                <div
                  onClick={() => handleCardClick(comp2)}
                  className="p-3 rounded-xl bg-red-950/20 border border-red-500/60 subtle-pulse-red hover:border-red-400 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <span className="text-xs font-semibold text-white">{comp2.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                      Attention Needed
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 pt-0.5">
                    <span>
                      <strong className="text-white">{comp2.power_kw} kW</strong> (+35% excess)
                    </span>
                    <span className="text-red-400 font-medium">₹1,140/day waste</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-red-500/20">
                    <span>Temp: <strong className="text-amber-300">{comp2.temperature}°C</strong></span>
                    <span>Vibration: <strong className="text-red-300">{comp2.vibration} mm/s</strong></span>
                  </div>
                </div>
              )}

              {/* Compressor #01: Normal */}
              {comp1 && (
                <div
                  onClick={() => handleCardClick(comp1)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-xs font-medium text-white">{comp1.name}</div>
                      <div className="text-[11px] text-slate-400">{comp1.power_kw} kW • {comp1.temperature}°C</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 hover:text-slate-200">Inspect →</span>
                </div>
              )}

              {/* Motor #01: Normal */}
              {motor1 && (
                <div
                  onClick={() => handleCardClick(motor1)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-xs font-medium text-white">{motor1.name}</div>
                      <div className="text-[11px] text-slate-400">{motor1.power_kw} kW • Normal</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 hover:text-slate-200">Inspect →</span>
                </div>
              )}

              {/* Motor #02: Normal */}
              {motor2 && (
                <div
                  onClick={() => handleCardClick(motor2)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-xs font-medium text-white">{motor2.name}</div>
                      <div className="text-[11px] text-slate-400">{motor2.power_kw} kW • Normal</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 hover:text-slate-200">Inspect →</span>
                </div>
              )}
            </div>
          </div>

          {/* ZONE 2: DYEING & PRODUCTION */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-slate-400" />
                Dyeing & Production Lines
              </span>
              <span className="text-[11px] text-slate-400">2 machines</span>
            </div>

            <div className="space-y-2.5">
              {/* Electric Heat-Setting Furnace */}
              {furnace && (
                <div
                  onClick={() => handleCardClick(furnace)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-white">{furnace.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Normal</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Power: <strong className="text-white">{furnace.power_kw} kW</strong> / 80 kW</span>
                    <span className="text-slate-400">Temp: {furnace.temperature}°C</span>
                  </div>
                </div>
              )}

              {/* Automated High-Speed Loom Line 01 */}
              {prodLine && (
                <div
                  onClick={() => handleCardClick(prodLine)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-white">{prodLine.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Normal</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Power: <strong className="text-white">{prodLine.power_kw} kW</strong> / 95 kW</span>
                    <span className="text-emerald-400 font-medium">On Target</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ZONE 3: UTILITY & FACILITY */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Fan className="w-3.5 h-3.5 text-slate-400" />
                Utilities & Infrastructure
              </span>
              <span className="text-[11px] text-slate-400">2 machines</span>
            </div>

            <div className="space-y-2.5">
              {/* HVAC Chiller: WARNING */}
              {hvac && (
                <div
                  onClick={() => handleCardClick(hvac)}
                  className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="text-xs font-semibold text-white">{hvac.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      Warning
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Power: <strong className="text-white">{hvac.power_kw} kW</strong></span>
                    <span className="text-amber-400 font-medium">42 kWh/day avoidable</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-0.5">
                    Manual override active during night shift
                  </div>
                </div>
              )}

              {/* Effluent Water Recycling Pump */}
              {pump1 && (
                <div
                  onClick={() => handleCardClick(pump1)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-xs font-medium text-white">{pump1.name}</div>
                      <div className="text-[11px] text-slate-400">{pump1.power_kw} kW • Normal</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 hover:text-slate-200">Inspect →</span>
                </div>
              )}
            </div>
          </div>
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
