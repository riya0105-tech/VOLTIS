import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
} from 'recharts';
import { TrendingUp, AlertCircle, X } from 'lucide-react';
import { EnergyDataPoint } from '../../types';

interface EnergyTrendChartProps {
  data: EnergyDataPoint[];
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: EnergyDataPoint;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0].payload;
  const actual = dataPoint.actual_kwh;
  const expected = dataPoint.expected_kwh;
  const diff = actual - expected;
  const percentDiff = ((diff / expected) * 100).toFixed(1);

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-3 text-xs">
      <div className="font-semibold text-white pb-1.5 mb-1.5 border-b border-slate-800 flex justify-between gap-4">
        <span>Time: {label}</span>
        <span className="text-slate-400 font-normal">₹{Math.round(dataPoint.cost).toLocaleString('en-IN')}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4 text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> Actual:
          </span>
          <span className="font-semibold text-white">{actual} kWh</span>
        </div>
        <div className="flex justify-between gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400" /> Expected baseline:
          </span>
          <span>{expected} kWh</span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 text-[11px]">
          <span className="text-slate-400">Variance:</span>
          <span className={diff > 0 ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
            {diff > 0 ? `+${diff.toFixed(1)} kWh (+${percentDiff}%)` : `${diff.toFixed(1)} kWh (${percentDiff}%)`}
          </span>
        </div>
      </div>
    </div>
  );
}

export function EnergyTrendChart({ data, isLoading = false }: EnergyTrendChartProps) {
  const [selectedAnomalyWindow, setSelectedAnomalyWindow] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="h-72 rounded-2xl bg-slate-900 border border-slate-800 p-6 flex items-center justify-center animate-pulse">
        <span className="text-xs text-slate-500">Loading energy consumption trend...</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Energy Consumption Trend</span>
            <span className="text-xs font-normal text-slate-400">• Past 24 Hours</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Actual consumption vs normal factory baseline.
          </p>
        </div>

        {/* Interactive Anomaly Marker Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedAnomalyWindow((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedAnomalyWindow
                ? 'bg-red-500/20 border-red-500 text-red-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span>09:00 - 16:00 Compressor surge</span>
          </button>
        </div>
      </div>

      {/* Explanatory Anomaly Drawer if clicked */}
      {selectedAnomalyWindow && (
        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-slate-200 flex items-start justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white">
                What happened between 09:00 and 16:00?
              </span>
              <p className="text-slate-300 leading-relaxed">
                During this daytime window, energy consumption peaked at 462 kWh/h (vs 415 kWh baseline).
                Air Compressor #02 ran continuously under load with bearing degradation and pneumatic leakage,
                generating 74 kWh of avoidable consumption and adding ₹1,140 in daytime tariff expenses.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedAnomalyWindow(false)}
            aria-label="Close anomaly note"
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recharts Container */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />

            <XAxis
              dataKey="timestamp"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 20', 'dataMax + 20']}
              tickFormatter={(v: number) => `${Math.round(v)}`}
              width={45}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              height={32}
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
            />

            {/* Subtle Peak TOD Tariff Band */}
            <ReferenceArea
              x1="08:00"
              x2="18:00"
              strokeOpacity={0.2}
              fill="#f59e0b"
              fillOpacity={0.04}
              label={{
                value: 'Peak Tariff Window',
                fill: '#f59e0b',
                fontSize: 10,
                position: 'insideTopLeft',
              }}
            />

            {/* Actual Energy Area */}
            <Area
              type="monotone"
              dataKey="actual_kwh"
              name="Actual Consumption"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#actualGradient)"
            />

            {/* Expected Baseline Line (Distinct muted dashed line) */}
            <Line
              type="monotone"
              dataKey="expected_kwh"
              name="Expected Baseline"
              stroke="#cbd5e1"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
