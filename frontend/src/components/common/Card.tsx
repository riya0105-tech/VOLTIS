import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'accentCyan' | 'accentEmerald' | 'accentAmber' | 'accentRed';
  header?: ReactNode;
  footer?: ReactNode;
  glow?: boolean;
  hoverable?: boolean;
}

export function Card({
  children,
  className,
  variant = 'default',
  header,
  footer,
  glow = false,
  hoverable = false,
}: CardProps) {
  const variantStyles = {
    default: 'bg-industrial-900/90 border-industrial-800 text-slate-100',
    elevated: 'bg-industrial-850 border-industrial-750 shadow-card-dark text-slate-100',
    glass: 'bg-industrial-900/60 backdrop-blur-md border-industrial-800/80 text-slate-100',
    accentCyan: 'bg-industrial-900/90 border-t-2 border-t-cyan-500 border-x-industrial-800 border-b-industrial-800',
    accentEmerald: 'bg-industrial-900/90 border-t-2 border-t-emerald-500 border-x-industrial-800 border-b-industrial-800',
    accentAmber: 'bg-industrial-900/90 border-t-2 border-t-amber-500 border-x-industrial-800 border-b-industrial-800',
    accentRed: 'bg-industrial-900/90 border-t-2 border-t-red-500 border-x-industrial-800 border-b-industrial-800',
  };

  const glowStyles = glow ? {
    accentCyan: 'shadow-glow-cyan',
    accentEmerald: 'shadow-glow-emerald',
    accentAmber: 'shadow-glow-amber',
    accentRed: 'shadow-glow-red',
    default: 'shadow-glow-cyan',
    elevated: 'shadow-glow-cyan',
    glass: 'shadow-glow-cyan',
  }[variant] : '';

  return (
    <div
      className={cn(
        'relative rounded-xl border p-5 transition-all duration-200',
        variantStyles[variant],
        glowStyles,
        hoverable && 'hover:border-industrial-700 hover:bg-industrial-850/80',
        className
      )}
    >
      {header && (
        <div className="mb-4 pb-3 border-b border-industrial-800/80 flex items-center justify-between gap-3">
          {header}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-3 border-t border-industrial-800/80">
          {footer}
        </div>
      )}
    </div>
  );
}
