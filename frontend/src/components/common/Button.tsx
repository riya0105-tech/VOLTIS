import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-md',
      sm: 'px-3 py-1.5 text-xs font-medium gap-2 rounded-lg',
      md: 'px-4 py-2 text-sm font-medium gap-2 rounded-lg',
      lg: 'px-5 py-2.5 text-base font-semibold gap-2.5 rounded-xl',
    };

    const variantStyles = {
      primary:
        'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-glow-cyan active:bg-cyan-600 border border-cyan-400/50',
      secondary:
        'bg-industrial-800 hover:bg-industrial-750 text-slate-200 border border-industrial-700/80 hover:border-slate-500 active:bg-industrial-850',
      danger:
        'bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40 hover:border-red-400 shadow-glow-red active:bg-red-500/30',
      outline:
        'bg-transparent hover:bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 hover:border-cyan-400',
      ghost:
        'bg-transparent hover:bg-industrial-800/80 text-slate-300 hover:text-slate-100 border border-transparent',
      success:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-glow-emerald active:bg-emerald-600 border border-emerald-400/50',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-industrial-950',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 mr-1.5 text-current opacity-80"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
        {!isLoading && iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
