/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalShellProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

const maxWidthMap = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
};

export function ModalShell({
  isOpen = true,
  onClose,
  title,
  subtitle,
  badge,
  icon,
  children,
  className,
  maxWidth = 'md',
  showCloseButton = true,
}: ModalShellProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#07080f]/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'relative w-full max-h-[92dvh] sm:max-h-[88vh]',
              'flex flex-col',
              'bg-[#0c0e17]/95 border-t sm:border border-white/[0.08]',
              'rounded-t-[28px] sm:rounded-2xl',
              'shadow-[0_-10px_40px_rgba(0,0,0,0.8)] sm:shadow-[0_25px_70px_rgba(0,0,0,0.85)]',
              'backdrop-blur-2xl z-10',
              'overflow-hidden',
              maxWidthMap[maxWidth],
              className
            )}
          >
            {/* Subtle top edge highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

            {/* Mobile Sheet Handle Bar */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.2 rounded-full bg-white/20" />
            </div>

            {/* Header (if provided) */}
            {(title || badge || icon || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-4 sm:pt-6 pb-2 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-blue-400">
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {badge}
                    </div>
                    {title && (
                      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate mt-0.5">
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="shrink-0 w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-150"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 sm:py-5 pb-8 sm:pb-6 space-y-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
