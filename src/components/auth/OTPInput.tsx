import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
}

export function OTPInput({
  value,
  onChange,
  length = 6,
  disabled,
  isError,
  isSuccess,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount with slight delay for mobile keyboard stability
    const timer = setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 100);
    return () => clearTimeout(timer);
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
      if (pastedData.length < length) {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 max-w-full overflow-hidden" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          disabled={disabled}
          className={`w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-2xl font-bold rounded-xl outline-none transition-all duration-200 select-all disabled:opacity-50 ${
            isSuccess
              ? 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-300 ring-2 ring-emerald-500/20'
              : isError
                ? 'border border-rose-500/60 bg-rose-500/10 text-rose-300 ring-2 ring-rose-500/20'
                : 'border border-white/10 bg-white/[0.04] text-white hover:border-white/20 focus:border-blue-500/80 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/25'
          }`}
        />
      ))}
    </div>
  );
}
