import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'gold';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-gold-500/10 text-gold-500 border border-gold-400/20',
    secondary: 'bg-gold-100 text-gold-600',
    destructive: 'bg-red-100 text-red-600 border border-red-200',
    outline: 'border border-gold-400/30 text-gold-600',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    gold: 'bg-gradient-to-r from-gold-500/10 to-gold-400/10 text-gold-500 border border-gold-400/20',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
