/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'outline' | 'glass' | 'purple' | 'coral' | 'emerald' | 'gradient';
}

export function Badge({ className, variant = 'glass', ...props }: BadgeProps) {
  const variantStyles = {
    glass: 'glass text-white/90 border border-white/10',
    outline: 'border border-white/10 text-white/70 bg-transparent',
    purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10',
    coral: 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm shadow-rose-500/10',
    emerald: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10',
    gradient: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border border-purple-500/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/30',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
