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
      whileHover={hover ? { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'glass-card p-6',
        className
      )}
      {...props}
    />
  );
}
