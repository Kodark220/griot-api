import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-gradient-to-r from-gold-500 to-gold-400 text-white shadow-sm hover:shadow-md hover:from-gold-600 hover:to-gold-500 active:scale-[0.98]',
      destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
      outline: 'border border-gold-400/30 bg-white text-gold-600 hover:bg-gold-50 hover:border-gold-400/60',
      secondary: 'bg-gold-50 text-gold-600 hover:bg-gold-100',
      ghost: 'text-gold-600/60 hover:text-gold-500 hover:bg-gold-50',
      link: 'text-gold-500 underline-offset-4 hover:underline',
    };
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-12 rounded-xl px-8 text-base',
      icon: 'h-9 w-9',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant] || variants.default,
          sizes[size] || sizes.default,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
