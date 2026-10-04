import { useState, useEffect } from 'react';
import {
  Leaf,
  Cloud,
  TrendingDown,
  Info,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { fetchFactoryOverview } from '../services';
import { FactoryOverview } from '../types';

export function CarbonReportPage() {
  const [viewWindow, setViewWindow] = useState<'weekly' | 'monthly'>('weekly');
  const [overview, setOverview] = useState<FactoryOverview | null>(null);

  useEffect(() => {
    fetchFactoryOverview('factory_001').then((res) => {
      if (res) setOverview(res);
    });
  }, []);

  const todayCo2Tonnes = overview?.kpis?.co2_tonnes ?? 7.65;
  const weeklyCo2Tonnes = 50.4;
  const monthlyCo2Tonnes = 212.3;
  const dailyAvoidedCo2 = 1.19;

  const weeklyCarbonData = [
    { day: 'Mon', current: 7.08, optimized: 6.24 },
    { day: 'Tue', current: 7.14, optimized: 6.30 },
    { day: 'Wed', current: 7.29, optimized: 6.42 },
    { day: 'Thu', current: 7.18, optimized: 6.33 },
    { day: 'Fri', current: 7.31, optimized: 6.42 },
    { day: 'Sat', current: 6.66, optimized: 5.92 },
    { day: 'Sun', current: 5.26, optimized: 4.80 },
  ];

  const monthlyCarbonData = [
    { period: 'Week 1', current: 48.5, optimized: 42.8 },
    { period: 'Week 2', current: 49.6, optimized: 43.7 },
    { period: 'Week 3', current: 50.4, optimized: 44.4 },
    { period: 'Week 4', current: 48.3, optimized: 42.6 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span>Carbon Accounting & Emissions Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking Scope 2 grid electricity greenhouse gas emissions (GHG) and reductions achieved through off-peak optimization.
          </p>
        </div>

        {/* CEA Grid Factor Tag */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            Emission factor used: <strong className="text-emerald-400">0.82 kg CO₂ / kWh</strong> (CEA Baseline)
          </span>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Today's CO2 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-slate-400" /> Today's Emissions
          </span>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-white tracking-tight">{todayCo2Tonnes}</span>
            <span className="text-xs text-slate-400 font-normal ml-1">tonnes CO₂</span>
          </div>
          <span className="text-[11px] text-slate-400">8,917.2 kWh consumed</span>
        </div>

        {/* Card 2: Daily Avoidable CO2 */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
          <span className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> Daily Reduction Potential
          </span>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-emerald-400 tracking-tight">-{dailyAvoidedCo2}</span>
            <span className="text-xs text-emerald-300 font-normal ml-1">tonnes / day</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">-11.88% with Batch B off-peak</span>
        </div>

        {/* Card 3: Weekly Total */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400">This Week Total</span>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-slate-200 tracking-tight">{weeklyCo2Tonnes}</span>
            <span className="text-xs text-slate-400 font-normal ml-1">tonnes</span>
          </div>
          <span className="text-[11px] text-slate-400">Avg 7.2 tonnes / day</span>
        </div>

        {/* Card 4: Monthly Total */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400">This Month Total</span>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-slate-200 tracking-tight">{monthlyCo2Tonnes}</span>
            <span className="text-xs text-slate-400 font-normal ml-1">tonnes</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 block">35.7 tonnes estimated annual reduction</span>
            <span className="text-[10px] text-slate-500 block">Based on simulated optimization scenario</span>
          </div>
        </div>
      </div>

      {/* Comparative Carbon Chart: Current vs Optimized Footprint */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Carbon Footprint: Current Baseline vs Optimized Schedule
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Demonstrates the direct carbon reduction enabled by shifting operations from peak thermal generation hours.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setViewWindow('weekly')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                viewWindow === 'weekly' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7-Day View
            </button>
            <button
              onClick={() => setViewWindow('monthly')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                viewWindow === 'monthly' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4-Week Monthly View
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={viewWindow === 'weekly' ? weeklyCarbonData : monthlyCarbonData}
              margin={{ top: 10, right: 15, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey={viewWindow === 'weekly' ? 'day' : 'period'} stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={36}
                tickFormatter={(v: number) => `${v}t`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar dataKey="current" name="Current Carbon Footprint (tonnes)" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="optimized" name="Optimized Carbon Footprint (tonnes)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy to Carbon Calculation Methodology Strip */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Calculation basis: <strong className="text-white">CO₂ (kg) = Electricity (kWh) × 0.82 kg/kWh</strong>. Emission factor used: 0.82 kg CO₂/kWh (CEA Baseline Database).
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 font-medium shrink-0">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Scope 2 calculation basis</span>
        </div>
      </div>
    </div>
  );
}
