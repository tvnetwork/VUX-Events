/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'outline' | 'glass';
}

export function Badge({ className, variant = 'glass', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variant === 'glass' ? 'glass text-white/90' : 'border border-white/10 text-white/70',
        className
      )}
      {...props}
    />
  );
}
