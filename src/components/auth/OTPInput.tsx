/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface OTPInputProps {
  digits: string[];
  setInputRef: (el: HTMLInputElement | null, index: number) => void;
  onChange: (value: string, index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  error?: boolean;
}

export function OTPInput({ 
  digits, 
  setInputRef, 
  onChange, 
  onKeyDown, 
  onPaste,
  error 
}: OTPInputProps) {
  return (
    <div className="flex justify-between gap-2 max-w-[340px] mx-auto">
      {digits.map((digit, index) => (
        <motion.input
          key={index}
          ref={(el) => setInputRef(el, index)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(e.target.value, index)}
          onKeyDown={(e) => onKeyDown(e, index)}
          onPaste={onPaste}
          whileFocus={{ scale: 1.05 }}
          className={cn(
            "w-12 h-14 text-center text-xl font-semibold bg-white/5 border border-white/10 rounded-xl outline-none transition-all",
            "focus:border-purple-400/50 focus:ring-4 focus:ring-purple-400/10",
            error && "border-red-400/50 bg-red-400/5",
            digit && !error && "border-white/20 bg-white/[0.08]"
          )}
        />
      ))}
    </div>
  );
}
