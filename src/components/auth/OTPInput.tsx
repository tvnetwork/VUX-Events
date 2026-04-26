import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
}

export function OTPInput({ value, onChange, length = 6, disabled, isError, isSuccess }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    
    // Handle multi-character input (paste/autofill/browser suggestions)
    if (val.length > 1) {
      const combined = val.replace(/\D/g, '').slice(0, length);
      if (combined) {
        onChange(combined);
        const nextTarget = Math.min(combined.length, length - 1);
        inputRefs.current[nextTarget]?.focus();
      }
      return;
    }

    if (isNaN(Number(val))) return;

    const newValue = value.split('');
    newValue[index] = val.slice(-1);
    const combinedValue = newValue.join('');
    onChange(combinedValue);

    // Move to next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      // Only focus next input if we didn't fill the whole thing
      if (pastedData.length < length) {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          disabled={disabled}
          className={`w-12 h-15 text-center text-2xl font-black bg-white/[0.03] border-2 rounded-2xl text-white focus:outline-none transition-all disabled:opacity-50 ${
            isSuccess 
              ? 'border-green-500/50 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]' 
              : isError 
                ? 'border-red-500/50 bg-red-500/10 focus:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                : 'border-white/[0.05] focus:border-indigo-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)]'
          }`}
        />
      ))}
    </div>
  );
}
