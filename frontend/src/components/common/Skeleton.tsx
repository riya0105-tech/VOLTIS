import { cn } from '../../utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const variantStyles = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-industrial-800/80 border border-industrial-750/30',
        variantStyles[variant],
        className
      )}
    />
  );
}
