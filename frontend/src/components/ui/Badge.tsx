import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning';
}

const variantStyles = {
  default: 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300',
  primary: 'bg-blue-100/80 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300',
  success: 'bg-green-100/80 dark:bg-green-900/80 text-green-700 dark:text-green-300',
  danger: 'bg-red-100/80 dark:bg-red-900/80 text-red-700 dark:text-red-300',
  warning: 'bg-orange-100/80 dark:bg-orange-900/80 text-orange-700 dark:text-orange-300',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-sm',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

