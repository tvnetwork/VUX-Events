/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
}

export function Card({ className, hover = false, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { 
        y: -4,
        scale: 1.01, 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.15)'
      } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'glass-card p-6 border border-white/5',
        className
      )}
      {...props}
    />
  );
}
