import { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { MachineStatus, AlertSeverity, AlertStatus, RiskLevel } from '../../types';

export type BadgeType =
  | MachineStatus
  | AlertSeverity
  | AlertStatus
  | RiskLevel
  | 'cyan'
  | 'emerald'
  | 'amber'
  | 'red'
  | 'slate'
  | 'indigo';

export interface BadgeProps {
  children?: ReactNode;
  variant?: BadgeType;
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'cyan',
  size = 'sm',
  pulse = false,
  className,
  dot = false,
}: BadgeProps) {
  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-xs font-mono font-medium gap-1.5',
    md: 'px-2.5 py-1 text-xs font-mono font-semibold gap-2',
  };

  const getVariantStyles = (type: BadgeType): { badge: string; dot: string } => {
    switch (type) {
      case 'NORMAL':
      case 'LOW':
      case 'emerald':
        return {
          badge: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-glow-emerald/20',
          dot: 'bg-emerald-400',
        };
      case 'WARNING':
      case 'MEDIUM':
      case 'amber':
        return {
          badge: 'bg-amber-950/60 border-amber-500/40 text-amber-300 shadow-glow-amber/20',
          dot: 'bg-amber-400',
        };
      case 'ANOMALY':
      case 'HIGH':
      case 'CRITICAL':
      case 'red':
        return {
          badge: 'bg-red-950/70 border-red-500/50 text-red-300 shadow-glow-red/30',
          dot: 'bg-red-400',
        };
      case 'ACTIVE':
        return {
          badge: 'bg-red-950/70 border-red-500/50 text-red-300 shadow-glow-red/30',
          dot: 'bg-red-400',
        };
      case 'ACKNOWLEDGED':
        return {
          badge: 'bg-blue-950/60 border-blue-500/40 text-blue-300',
          dot: 'bg-blue-400',
        };
      case 'RESOLVED':
        return {
          badge: 'bg-industrial-800 border-industrial-700 text-slate-400',
          dot: 'bg-slate-400',
        };
      case 'OFFLINE':
      case 'slate':
        return {
          badge: 'bg-industrial-850 border-industrial-700 text-slate-400',
          dot: 'bg-slate-500',
        };
      case 'cyan':
        return {
          badge: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-glow-cyan/20',
          dot: 'bg-cyan-400',
        };
      case 'indigo':
        return {
          badge: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300',
          dot: 'bg-indigo-400',
        };
      default:
        return {
          badge: 'bg-industrial-800 border-industrial-700 text-slate-300',
          dot: 'bg-slate-400',
        };
    }
  };

  const style = getVariantStyles(variant);
  const shouldPulse = pulse || variant === 'ANOMALY' || variant === 'CRITICAL' || variant === 'ACTIVE';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border tracking-wider uppercase select-none',
        sizeStyles[size],
        style.badge,
        className
      )}
    >
      {(dot || shouldPulse) && (
        <span className="relative flex h-2 w-2">
          {shouldPulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                style.dot
              )}
            />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', style.dot)} />
        </span>
      )}
      <span>{children ?? variant}</span>
    </span>
  );
}
