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
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderColor: 'rgba(168, 85, 247, 0.3)'
      } : undefined}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'glass-card p-6 border border-white/[0.08]',
        className
      )}
      {...props}
    />
  );
}
