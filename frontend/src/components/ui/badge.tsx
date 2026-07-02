import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gold-500/10 text-gold-500 border border-gold-400/20',
        secondary: 'bg-gold-100 text-gold-600',
        destructive: 'bg-red-100 text-red-600 border border-red-200',
        outline: 'border border-gold-400/30 text-gold-600',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200',
        gold: 'bg-gradient-to-r from-gold-500/10 to-gold-400/10 text-gold-500 border border-gold-400/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
