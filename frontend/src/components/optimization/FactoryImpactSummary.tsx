import { Zap, IndianRupee, Cloud, CheckCircle } from 'lucide-react';

interface FactoryImpactSummaryProps {
  energyReductionPercent?: number;
  costSavingInr?: number;
  co2ReductionPercent?: number;
}

export function FactoryImpactSummary({
  energyReductionPercent = 11.69,
  costSavingInr = 20400,
  co2ReductionPercent = 11.88,
}: FactoryImpactSummaryProps) {
  const monthlyCostSaving = costSavingInr * 30;

  return (
    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-0.5">
        <h3 className="text-xs font-semibold text-white">
          Net Optimization Impact
        </h3>
        <p className="text-xs text-slate-400">
          Estimated returns from shifting heavy loom batches to off-peak hours.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">
            <strong className="text-white">1,450 kWh</strong> saved / day ({energyReductionPercent}%)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">
            <strong className="text-white">₹{costSavingInr.toLocaleString('en-IN')}</strong> / day (₹{(monthlyCostSaving / 100000).toFixed(1)}L / month)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Cloud className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300">
            <strong className="text-white">1.2 tonnes</strong> CO₂ avoided ({co2ReductionPercent}%)
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>No production reduction</span>
        </div>
      </div>
    </div>
  );
}
