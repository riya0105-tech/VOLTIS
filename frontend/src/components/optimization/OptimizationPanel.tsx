import { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  Zap,
  IndianRupee,
  Cloud,
  Package,
} from 'lucide-react';
import { simulateOptimization, approveOptimization } from '../../services/optimizationService';
import { Button } from '../common';

const scheduleOptions = [
  { time: '18:00', label: '18:00 (Peak Shift)', energyCut: 0, costSave: 0, co2Cut: 0, energyKwh: 12400, cost: 118000, co2: 10.1 },
  { time: '20:00', label: '20:00 (Mid-Peak)', energyCut: 5.8, costSave: 10200, co2Cut: 6.0, energyKwh: 11680, cost: 107800, co2: 9.5 },
  { time: '22:00', label: '22:00 (Off-Peak Recommended)', energyCut: 11.69, costSave: 20400, co2Cut: 11.88, energyKwh: 10950, cost: 97600, co2: 8.9 },
  { time: '23:30', label: '23:30 (Deep Off-Peak)', energyCut: 13.2, costSave: 23100, co2Cut: 13.4, energyKwh: 10760, cost: 94900, co2: 8.7 },
];

export function OptimizationPanel() {
  const [sliderIndex, setSliderIndex] = useState(2); // default to 22:00
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [scenarioId, setScenarioId] = useState('scenario_001');

  const currentOption = scheduleOptions[sliderIndex];

  const handleSliderChange = async (index: number) => {
    setSliderIndex(index);
    setIsApproved(false);
    const selected = scheduleOptions[index];
    try {
      const res = await simulateOptimization({
        scenario_name: `Move Batch B to ${selected.label}`,
        batch_id: 'B-102',
        new_start_time: selected.time,
      });
      if (res?.scenario_id) {
        setScenarioId(res.scenario_id);
      }
    } catch (err) {
      console.warn('Simulation API call failed, keeping local state:', err);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveOptimization({ scenario_id: scenarioId });
      setIsApproved(true);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>What-If Schedule Optimization</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore shifting batch schedules from high-tariff daytime hours to night-time off-peak.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Batch: <strong className="text-white">Heavy Loom Batch B</strong>
        </div>
      </div>

      {/* Interactive Time Slider */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Production Start Time:</span>
          <span className="text-emerald-400 font-semibold text-sm">
            {currentOption.label}
          </span>
        </div>

        {/* Range Slider */}
        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min={0}
            max={scheduleOptions.length - 1}
            value={sliderIndex}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 px-1">
            {scheduleOptions.map((opt, i) => (
              <span
                key={opt.time}
                onClick={() => handleSliderChange(i)}
                className={`cursor-pointer transition-colors ${
                  i === sliderIndex ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
                }`}
              >
                {opt.time}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Simulated Outcomes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Energy Cut */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-slate-400" /> Energy
          </span>
          <div className="my-1">
            <span className="text-lg lg:text-xl font-semibold text-white">
              {currentOption.energyCut > 0 ? `-${currentOption.energyCut}%` : '0%'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {currentOption.energyKwh.toLocaleString('en-IN')} kWh / day
          </span>
        </div>

        {/* Metric 2: Cost Savings */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> Cost Savings
          </span>
          <div className="my-1">
            <span className="text-lg lg:text-xl font-semibold text-emerald-400">
              {currentOption.costSave > 0 ? `₹${currentOption.costSave.toLocaleString('en-IN')}` : '₹0'}
            </span>
            <span className="text-xs text-slate-400 font-normal ml-1">/ day</span>
          </div>
          <span className="text-[11px] text-slate-400">
            ₹{currentOption.cost.toLocaleString('en-IN')} total cost
          </span>
        </div>

        {/* Metric 3: CO2 Cut */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-slate-400" /> Carbon Cut
          </span>
          <div className="my-1">
            <span className="text-lg lg:text-xl font-semibold text-white">
              {currentOption.co2Cut > 0 ? `-${currentOption.co2Cut}%` : '0%'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {currentOption.co2} tonnes total
          </span>
        </div>

        {/* Metric 4: Production */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-slate-400" /> Production
          </span>
          <div className="my-1">
            <span className="text-lg lg:text-xl font-semibold text-white">
              2,200 <span className="text-xs font-normal text-slate-400">units</span>
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            No production reduction
          </span>
        </div>
      </div>

      {/* Action / Approval Bar */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Simulation only — no physical machine control commands are sent.</span>
        </div>

        <div>
          {isApproved ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Schedule saved in simulation</span>
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
  );
}
