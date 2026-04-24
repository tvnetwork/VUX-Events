/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cn } from '../../lib/utils';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

export function Avatar({ className, size = 'md', fallback, alt, ...props }: AvatarProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  return (
    <div className={cn('relative inline-block overflow-hidden rounded-full glass border border-white/10 shrink-0', sizes[size], className)}>
      <img
        {...props}
        alt={alt || ''}
        className="h-full w-full object-cover"
        onError={(e) => {
          if (fallback) {
            e.currentTarget.src = fallback;
          }
        }}
      />
    </div>
  );
}

export function AvatarStack({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex -space-x-2 overflow-hidden', className)}>
      {children}
    </div>
  );
}
