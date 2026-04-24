/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback } from 'react';

export function useOTP(length: number = 6) {
  const [digits, setDigits] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setInputRef = useCallback((el: HTMLInputElement | null, index: number) => {
    inputRefs.current[index] = el;
  }, []);

  const handleChange = (value: string, index: number) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    // Take only the last character if multiple are entered (handled by paste differently)
    const char = value.slice(-1);
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-focus next
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(data)) return;

    const newDigits = [...digits];
    data.split('').forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);

    // Focus last filled or next empty
    const nextIndex = Math.min(data.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const reset = () => {
    setDigits(new Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  const isComplete = digits.every(digit => digit !== '');
  const otpValue = digits.join('');

  return {
    digits,
    setInputRef,
    handleChange,
    handleKeyDown,
    handlePaste,
    reset,
    isComplete,
    otpValue
  };
}
