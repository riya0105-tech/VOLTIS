import { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
    isGood?: boolean; // e.g., down is good for energy/cost, up is good for production
  };
  context?: string;
  icon?: ReactNode;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'blue' | 'indigo';
  className?: string;
  isLoading?: boolean;
}

export function KPICard({
  title,
  value,
  unit,
  trend,
  context,
  icon,
  accentColor = 'cyan',
  className,
  isLoading = false,
}: KPICardProps) {
  const accentBorders = {
    cyan: 'border-t-cyan-500 hover:shadow-glow-cyan/30',
    emerald: 'border-t-emerald-500 hover:shadow-glow-emerald/30',
    amber: 'border-t-amber-500 hover:shadow-glow-amber/30',
    blue: 'border-t-blue-500 hover:shadow-glow-cyan/20',
    indigo: 'border-t-indigo-500 hover:shadow-glow-cyan/20',
  };

  const accentIcons = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-industrial-800 bg-industrial-900/90 p-5 animate-pulse">
        <div className="flex justify-between items-start mb-3">
          <div className="h-4 w-24 bg-industrial-800 rounded" />
          <div className="h-9 w-9 bg-industrial-800 rounded-lg" />
        </div>
        <div className="h-8 w-32 bg-industrial-800 rounded mb-3" />
        <div className="h-3 w-40 bg-industrial-800 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-industrial-800 bg-industrial-900/95 p-5',
        'border-t-2 transition-all duration-200 hover:border-industrial-700 hover:bg-industrial-850/90',
        accentBorders[accentColor],
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105',
              accentIcons[accentColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-mono-num">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-slate-400 uppercase">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 mt-2 border-t border-industrial-800/60 text-xs">
        {trend && (
          <div
            className={cn(
              'inline-flex items-center gap-1 font-mono font-medium',
              trend.direction === 'neutral'
                ? 'text-slate-400'
                : trend.isGood ?? (trend.direction === 'down')
                ? 'text-emerald-400'
                : 'text-amber-400'
            )}
          >
            {trend.direction === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trend.direction === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend.direction === 'neutral' && <Minus className="w-3 h-3" />}
            <span>{trend.value}</span>
            {trend.label && <span className="text-slate-500 font-sans ml-0.5">{trend.label}</span>}
          </div>
        )}
        {context && (
          <span className="text-[11px] text-slate-500 truncate max-w-[180px]" title={context}>
            {context}
          </span>
        )}
      </div>
    </div>
  );
}
