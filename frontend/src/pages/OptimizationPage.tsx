import { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { OptimizationScenario } from '../types';
import { simulateOptimization, approveOptimization } from '../services/optimizationService';
import { Button } from '../components/common';

const schedulableJobs = [
  {
    id: 'job-1',
    machine: 'Automated High-Speed Loom Line 01 (Batch B)',
    importance: 'CRITICAL',
    requiredHours: '20 hrs/day',
    currentWindow: '09:00 – 17:00 (Peak Tariff Window)',
    suggestedWindow: '22:00 – 06:00 (Night Off-Peak)',
    shiftable: true,
    estimatedSavingInr: 20400,
    energyCutKwh: 1450,
  },
  {
    id: 'job-2',
    machine: 'Air Compressor #01 (Line 1 Auxiliary)',
    importance: 'IMPORTANT',
    requiredHours: '8 hrs/day',
    currentWindow: '10:00 – 16:00 (Peak Tariff Window)',
    suggestedWindow: '22:00 – 04:00 (Night Off-Peak)',
    shiftable: true,
    estimatedSavingInr: 3200,
    energyCutKwh: 240,
  },
  {
    id: 'job-3',
    machine: 'Effluent Water Recycling Pump #01',
    importance: 'NON_IMPORTANT',
    requiredHours: '6 hrs/day',
    currentWindow: '12:00 – 18:00 (Peak Daytime Tariff)',
    suggestedWindow: '23:00 – 05:00 (Deep Off-Peak)',
    shiftable: true,
    estimatedSavingInr: 1800,
    energyCutKwh: 160,
  },
];

export function OptimizationPage() {
  const [selectedJobId, setSelectedJobId] = useState('job-1');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const [scenario, setScenario] = useState<OptimizationScenario>({
    scenario_name: 'Shift Loom Batch B to Off-Peak (22:00)',
    current: {
      energy_kwh: 12400.0,
      cost: 118000.0,
      co2_tonnes: 10.1,
      production_units: 2200.0,
    },
    optimized: {
      energy_kwh: 10950.0,
      cost: 97600.0,
      co2_tonnes: 8.9,
      production_units: 2200.0,
    },
    energy_reduction_percent: 11.69,
    co2_reduction_percent: 11.88,
  });

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateOptimization({
        scenario_name: 'Move Batch B to Off-Peak',
        batch_id: 'B-102',
        new_start_time: '22:00',
      });
      setScenario(res);
      setIsApproved(false);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveOptimization({ scenario_id: scenario.scenario_id || 'scenario_001' });
      setIsApproved(true);
    } finally {
      setIsApproving(false);
    }
  };

  const selectedJob = schedulableJobs.find((j) => j.id === selectedJobId) || schedulableJobs[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span>Time-of-Use (TOU) Schedule Optimization Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate rescheduling high-demand machines to off-peak tariff hours without penalizing production targets.
          </p>
        </div>

        <div className="text-xs font-medium text-slate-400">
          Surat TOD Peak Surcharge: <strong className="text-amber-400 font-semibold">+20%</strong> • Night Rebate: <strong className="text-emerald-400 font-semibold">-15%</strong>
        </div>
      </div>

      {/* Schedulable Jobs & Equipment List */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-tight flex items-center justify-between">
          <span>Candidate Work Orders for Off-Peak Rescheduling</span>
          <span className="text-xs font-normal text-slate-400">Select job to simulate</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {schedulableJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => {
                setSelectedJobId(job.id);
                setIsApproved(false);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                selectedJobId === job.id
                  ? 'bg-slate-800/90 border-emerald-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded ${
                      job.importance === 'CRITICAL'
                        ? 'bg-rose-500/15 text-rose-300'
                        : job.importance === 'IMPORTANT'
                        ? 'bg-blue-500/15 text-blue-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {job.importance === 'CRITICAL' ? 'Critical Machine' : job.importance === 'IMPORTANT' ? 'Important' : 'Non-Important'}
                  </span>
                  <span className="text-emerald-400 font-medium">+₹{job.estimatedSavingInr.toLocaleString('en-IN')}/day</span>
                </div>
                <h3 className="text-xs font-semibold text-white">{job.machine}</h3>
              </div>

              <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                <div>Current: <strong className="text-slate-300">{job.currentWindow}</strong></div>
                <div>Proposed: <strong className="text-emerald-400">{job.suggestedWindow}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Job Simulation Canvas */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Simulation Scenario: {selectedJob.machine}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Moving operations from peak window to off-peak tariff slot (22:00 – 06:00).
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulate}
            isLoading={isSimulating}
          >
            Re-Calculate Scenario
          </Button>
        </div>

        {/* Side-by-side Current vs Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-300">Current Schedule (Simulation)</span>
              <span className="text-[11px] text-slate-400">Normal daytime rates</span>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Scenario baseline — separate from today's live consumption.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[11px] block">SIMULATION BASELINE ENERGY</span>
                <span className="text-base font-semibold text-white">
                  {scenario.current.energy_kwh.toLocaleString('en-IN')} kWh
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[11px] block">DAILY ELECTRICITY COST</span>
                <span className="text-base font-semibold text-white">
                  ₹{scenario.current.cost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[11px] block">CARBON FOOTPRINT</span>
                <span className="text-base font-semibold text-white">
                  {scenario.current.co2_tonnes} tonnes
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[11px] block">PRODUCTION VOLUME</span>
                <span className="text-base font-semibold text-white">
                  {scenario.current.production_units} units
                </span>
              </div>
            </div>
          </div>

          {/* Optimized */}
          <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/40 space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-emerald-500/30">
              <span className="font-semibold text-emerald-300">Simulated Off-Peak Schedule (22:00 Start)</span>
              <span className="text-[11px] text-emerald-400 font-semibold">-11.69% Energy</span>
            </div>

            <p className="text-[11px] text-emerald-400/80 italic">
              Simulation scenario — batch shifted into 22:00 off-peak tariff window.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30">
                <span className="text-slate-400 text-[11px] block">SIMULATED OPTIMIZED ENERGY</span>
                <span className="text-base font-semibold text-emerald-400">
                  {scenario.optimized.energy_kwh.toLocaleString('en-IN')} kWh (-1,450 kWh)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30">
                <span className="text-slate-400 text-[11px] block">DAILY ELECTRICITY COST</span>
                <span className="text-base font-semibold text-emerald-400">
                  ₹{scenario.optimized.cost.toLocaleString('en-IN')} (-₹20,400)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30">
                <span className="text-slate-400 text-[11px] block">CARBON FOOTPRINT</span>
                <span className="text-base font-semibold text-emerald-400">
                  {scenario.optimized.co2_tonnes} tonnes (-1.2t)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30">
                <span className="text-slate-400 text-[11px] block">PRODUCTION IMPACT</span>
                <span className="text-base font-semibold text-white">
                  2,200 units (No reduction)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Strip */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Simulation only — does not trigger remote physical machine controls.</span>
          </div>

          <div>
            {isApproved ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Schedule committed in simulation</span>
              </div>
            ) : (
              <Button
                variant="success"
                size="sm"
                onClick={handleApprove}
                isLoading={isApproving}
              >
                Approve Schedule in Simulation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
