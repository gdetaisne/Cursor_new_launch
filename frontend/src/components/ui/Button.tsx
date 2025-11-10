import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30',
  success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/30',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-lg shadow-yellow-600/25 hover:shadow-xl hover:shadow-yellow-600/30',
  secondary: 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/40 dark:border-gray-700/30 text-gray-900 dark:text-white hover:bg-white/90 dark:hover:bg-gray-800/90 shadow-lg',
  ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60',
};

const sizeStyles = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl font-medium',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-95',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

