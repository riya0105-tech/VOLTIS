import { Zap, IndianRupee, TrendingDown, Cloud, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FactoryKPIs } from '../../types';

interface KPISectionProps {
  kpis?: FactoryKPIs;
  isLoading?: boolean;
}

export function KPISection({ kpis, isLoading = false }: KPISectionProps) {
  const energyToday = kpis?.energy_today_kwh ?? 8917.2;
  const costToday = kpis?.cost_today ?? 72452.25;
  const intensity = kpis?.energy_intensity ?? 4.05;
  const co2 = kpis?.co2_tonnes ?? 7.31;
  const production = kpis?.production_units ?? 2200;
  const productionTarget = 2500;
  const productionPct = Math.round((production / productionTarget) * 1000) / 10;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Today's Energy */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Today's Energy</span>
          <Zap className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="my-1.5">
          <span className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            {energyToday.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
          </span>
          <span className="text-xs text-slate-400 font-medium ml-1">kWh</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center text-amber-400 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +1.6%
          </span>
          <span className="truncate">vs baseline</span>
        </div>
      </div>

      {/* 2. Cost Today */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Cost Today</span>
          <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="my-1.5">
          <span className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            ₹{Math.round(costToday).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-amber-400 font-medium">+₹1,140 excess</span>
          <span>₹8.12/kWh</span>
        </div>
      </div>

      {/* 3. Energy Intensity */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Energy Intensity</span>
          <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="my-1.5">
          <span className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            {intensity.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-medium ml-1">kWh/unit</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center text-emerald-400 font-medium">
            <ArrowDownRight className="w-3 h-3 mr-0.5" /> -2.1%
          </span>
          <span>Target 3.80</span>
        </div>
      </div>

      {/* 4. CO2 Emissions */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>CO₂ Emissions</span>
          <Cloud className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="my-1.5">
          <span className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            {co2.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-medium ml-1">tonnes</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>0.82 kg/kWh</span>
          <span>Grid carbon</span>
        </div>
      </div>

      {/* 5. Production Output */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Production</span>
          <Package className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="my-1.5">
          <span className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            {production.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400 font-medium ml-1">units</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-slate-300 font-medium">{productionPct}% of target</span>
          <span>Target: {productionTarget.toLocaleString('en-IN')} units</span>
        </div>
      </div>
    </div>
  );
}
