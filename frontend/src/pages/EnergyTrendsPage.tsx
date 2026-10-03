import { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  Zap,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  mockHourlyEnergy,
  mockWeeklyHistory,
  mockMonthlyHistory,
  mockMachineHistoryMap,
  mockMachines,
  mockLivePowerKw,
} from '../data/mockData';
import {
  fetchTodayEnergy,
  fetchHistoryEnergy,
  fetchMachines,
  fetchFactoryOverview,
} from '../services';
import { Machine, FactoryOverview } from '../types';

export function EnergyTrendsPage() {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('24H');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('overall');
  const [comparisonMode, setComparisonMode] = useState<'none' | 'today_yesterday' | 'compressor_compare'>('none');
  const [hourlyData, setHourlyData] = useState(mockHourlyEnergy);
  const [machines, setMachines] = useState<Machine[]>(mockMachines);
  const [overview, setOverview] = useState<FactoryOverview | null>(null);

  useEffect(() => {
    fetchMachines().then((res) => {
      if (res && res.length > 0) setMachines(res);
    });
    fetchFactoryOverview().then((res) => {
      if (res) setOverview(res);
    });
  }, []);

  useEffect(() => {
    const target = selectedMachineId === 'overall' ? undefined : selectedMachineId;
    if (timeRange === '24H') {
      fetchTodayEnergy(target).then((data) => {
        if (data && data.length > 0) {
          setHourlyData(data);
        }
      });
    } else {
      fetchHistoryEnergy(undefined, undefined, target).then((data) => {
        if (data && data.length > 0) {
          setHourlyData(data);
        }
      });
    }
  }, [selectedMachineId, timeRange]);

  // Live Power vs Accumulated Today (consistent across all dashboard & analytics views)
  const livePowerKw = machines.length > 0
    ? Math.round(machines.filter((m) => m.type !== 'Transformer').reduce((sum, m) => sum + m.power_kw, 0) * 10) / 10
    : mockLivePowerKw;
  const todayEnergyKwh = overview?.kpis?.energy_today_kwh ?? 9325.24;

  const currentMachineHistory =
    selectedMachineId === 'compressor_02'
      ? mockMachineHistoryMap.compressor_02
      : selectedMachineId === 'compressor_01'
      ? mockMachineHistoryMap.compressor_01
      : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <LineChartIcon className="w-5 h-5 text-cyan-400" />
            <span>Energy Consumption Trends & History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical consumption time-series, peak vs off-peak breakdown, and machine comparative analytics.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          {(['24H', '7D', '30D'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === range ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range === '24H' ? 'Last 24 Hours' : range === '7D' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Measurement Cards: LIVE POWER vs TODAY'S ENERGY */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: LIVE POWER (Current Demand) */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-medium">
            <span>Live Instantaneous Power</span>
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-white tracking-tight">{livePowerKw}</span>
            <span className="text-xs text-cyan-300 font-normal ml-1">kW</span>
          </div>
          <span className="text-[11px] text-slate-400">Current factory demand</span>
        </div>

        {/* Card 2: TODAY'S ENERGY (Accumulated since midnight) */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Today's Energy</span>
            <Zap className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-white tracking-tight">
              {todayEnergyKwh.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs text-slate-400 font-normal ml-1">kWh</span>
          </div>
          <span className="text-[11px] text-amber-400 font-medium">+1.6% vs yesterday</span>
        </div>

        {/* Card 3: Yesterday Total */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Yesterday Total</span>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-slate-200 tracking-tight">8,776</span>
            <span className="text-xs text-slate-400 font-normal ml-1">kWh</span>
          </div>
          <span className="text-[11px] text-slate-400">₹71,305 electricity cost</span>
        </div>

        {/* Card 4: This Week Total */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">This Week (7 Days)</span>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-slate-200 tracking-tight">61,420</span>
            <span className="text-xs text-slate-400 font-normal ml-1">kWh</span>
          </div>
          <span className="text-[11px] text-slate-400">Avg 8,774 kWh / day</span>
        </div>

        {/* Card 5: This Month Total */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400 font-medium">This Month Total</span>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-slate-200 tracking-tight">258,900</span>
            <span className="text-xs text-slate-400 font-normal ml-1">kWh</span>
          </div>
          <span className="text-[11px] text-slate-400">₹21.03 Lakhs incurred</span>
        </div>
      </div>

      {/* Main Chart Section: Overall Factory Historical Trend */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              {timeRange === '24H'
                ? '24-Hour Hourly Consumption (Actual vs Baseline)'
                : timeRange === '7D'
                ? '7-Day Daily Consumption & TOD Tariff Distribution'
                : '30-Day Weekly Aggregated Energy & Carbon Footprint'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated across all 9 connected machinery nodes.
            </p>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Actual kWh
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400" /> Expected baseline
            </span>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {timeRange === '24H' ? (
              <AreaChart data={hourlyData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickFormatter={(v: number) => `${Math.round(v)}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Area type="monotone" dataKey="actual_kwh" name="Actual Consumption" stroke="#06b6d4" strokeWidth={2} fill="url(#trendGrad)" />
                <Line type="monotone" dataKey="expected_kwh" name="Expected Baseline (Dashed)" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="6 4" dot={false} />
              </AreaChart>
            ) : timeRange === '7D' ? (
              <BarChart data={mockWeeklyHistory} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${Math.round(v)}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="peak_kwh" name="Peak Hours (08:00 - 18:00)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offpeak_kwh" name="Off-Peak Hours (Night)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={mockMonthlyHistory} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${Math.round(v)}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="actual_kwh" name="Actual Total kWh" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expected_kwh" name="Target Baseline" fill="#475569" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Machine-Level Energy Drilldown & Comparative Analytics */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Individual Equipment History & Comparison</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select specific machines to analyze load curves and compare performance against peer equipment.
            </p>
          </div>

          {/* Machine Selector Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Select Machine:</span>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="overall">Overall Factory (All 9 Machines)</option>
              {machines.map((m) => (
                <option key={m.machine_id} value={m.machine_id}>
                  {m.name} ({m.power_kw} kW)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium mr-1">Comparison Views:</span>
          <button
            onClick={() => setComparisonMode('none')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              comparisonMode === 'none' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Single Curve
          </button>
          <button
            onClick={() => setComparisonMode('today_yesterday')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              comparisonMode === 'today_yesterday' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today vs Yesterday
          </button>
          <button
            onClick={() => {
              setComparisonMode('compressor_compare');
              setSelectedMachineId('compressor_02');
            }}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              comparisonMode === 'compressor_compare' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Compressor #01 vs Compressor #02 (Anomaly)
          </button>
        </div>

        {/* Machine Drilldown Details Cards */}
        {selectedMachineId === 'compressor_02' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">PEAK DEMAND TODAY</span>
              <span className="font-semibold text-white text-sm">22.4 kW (12:00)</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">AVERAGE RUNNING LOAD</span>
              <span className="font-semibold text-white text-sm">20.2 kW (vs 15.2 baseline)</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">DAILY EXCESS ENERGY</span>
              <span className="font-semibold text-red-400 text-sm">74.0 kWh avoidable</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">DAILY EXCESS COST</span>
              <span className="font-semibold text-amber-400 text-sm">₹1,140 / day</span>
            </div>
          </div>
        )}

        {/* Machine History Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {comparisonMode === 'compressor_compare' ? (
              <AreaChart
                data={[
                  { time: '00:00', comp1: 14.5, comp2: 16.2 },
                  { time: '03:00', comp1: 14.2, comp2: 15.8 },
                  { time: '06:00', comp1: 15.2, comp2: 18.5 },
                  { time: '09:00', comp1: 18.4, comp2: 22.1 },
                  { time: '12:00', comp1: 18.2, comp2: 22.4 },
                  { time: '15:00', comp1: 18.5, comp2: 22.0 },
                  { time: '18:00', comp1: 16.0, comp2: 20.8 },
                  { time: '21:00', comp1: 14.8, comp2: 17.5 },
                ]}
                margin={{ top: 10, right: 15, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={[12, 26]}
                  tickFormatter={(v: number) => `${v}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Area type="monotone" dataKey="comp2" name="Compressor #02 (Anomalous, 35% higher)" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} />
                <Line type="monotone" dataKey="comp1" name="Compressor #01 (Normal Reference)" stroke="#10b981" strokeWidth={2} dot />
              </AreaChart>
            ) : currentMachineHistory ? (
              <AreaChart data={currentMachineHistory} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickFormatter={(v: number) => `${Math.round(v)}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="actual_kw" name="Actual kW Draw" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                <Line type="monotone" dataKey="expected_kw" name="Expected Baseline kW" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
              </AreaChart>
            ) : (
              <AreaChart data={mockHourlyEnergy} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickFormatter={(v: number) => `${Math.round(v)}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="actual_kwh" name="Plant Actual (kWh)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                <Line type="monotone" dataKey="expected_kwh" name="Expected Baseline" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
