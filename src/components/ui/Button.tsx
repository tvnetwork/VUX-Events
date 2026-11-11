/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';
import { ReactNode } from 'react';

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'outline' | 'google' | 'passkey' | 'email' | 'vux' | 'kontyra' | 'purple' | 'coral';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'xs';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-white text-black hover:bg-white/90 shadow-md active:scale-[0.98]',
      purple: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40 border border-purple-400/30 active:scale-[0.98]',
      coral: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 hover:shadow-rose-500/40 border border-rose-400/30 active:scale-[0.98]',
      secondary: 'bg-white/10 text-white hover:bg-white/15 hover:shadow-lg hover:shadow-white/5 border border-white/10 active:scale-[0.98]',
      ghost: 'bg-transparent text-white/80 hover:text-white hover:bg-white/5 active:scale-[0.98]',
      glass: 'glass hover:bg-white/10 text-white hover:shadow-xl hover:shadow-black/20 active:scale-[0.98]',
      google: 'bg-white text-gray-800 hover:bg-gray-50 border border-whiteShadow shadow-lg shadow-black/5 hover:shadow-xl active:scale-[0.98]',
      passkey: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-white hover:bg-amber-500/20 shadow-lg shadow-amber-900/10 active:scale-[0.98]',
      kontyra: 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 shadow-lg shadow-purple-900/10 active:scale-[0.98]',
      email: 'bg-purple-600 text-white hover:bg-purple-500 shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.98]',
      vux: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-[0_20px_50px_-10px_rgba(168,85,247,0.45)] border border-purple-400/30 active:scale-[0.98]',
      outline: 'border border-white/10 bg-transparent text-white/90 hover:text-white hover:bg-white/5 hover:border-white/20 active:scale-[0.98]',
    };

    const sizes = {
      xs: 'px-2 py-1 text-[10px] rounded-lg',
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-4 py-2 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-2xl',
      icon: 'p-2 rounded-xl',
    };

    const isPremium = ['vux', 'email', 'passkey', 'google', 'kontyra', 'purple'].includes(variant);

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-white/20 relative overflow-hidden',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isPremium && (
          <motion.div
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none -skew-x-12"
          />
        )}
        {children as ReactNode}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
