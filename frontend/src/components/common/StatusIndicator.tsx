import { cn } from '../../utils/cn';
import { MachineStatus } from '../../types';

export interface StatusIndicatorProps {
  status: MachineStatus | 'ONLINE' | 'OFFLINE';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  size = 'sm',
  showLabel = false,
  className,
}: StatusIndicatorProps) {
  const sizeMap = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3.5 w-3.5',
  };

  const getColors = () => {
    switch (status) {
      case 'NORMAL':
      case 'ONLINE':
        return {
          bg: 'bg-emerald-500',
          glow: 'shadow-[0_0_8px_rgba(16,185,129,0.8)]',
          ping: false,
          label: 'text-emerald-400',
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-400',
          glow: 'shadow-[0_0_8px_rgba(245,158,11,0.8)]',
          ping: true,
          label: 'text-amber-400',
        };
      case 'ANOMALY':
        return {
          bg: 'bg-red-500',
          glow: 'shadow-[0_0_12px_rgba(239,68,68,0.9)]',
          ping: true,
          label: 'text-red-400',
        };
      case 'OFFLINE':
      default:
        return {
          bg: 'bg-slate-500',
          glow: 'shadow-none',
          ping: false,
          label: 'text-slate-400',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex shrink-0">
        {colors.ping && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              colors.bg
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full',
            sizeMap[size],
            colors.bg,
            colors.glow
          )}
        />
      </span>
      {showLabel && (
        <span className={cn('text-xs font-mono font-medium tracking-wide uppercase', colors.label)}>
          {status}
        </span>
      )}
    </div>
  );
}
