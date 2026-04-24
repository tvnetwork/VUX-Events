/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowLeft, Loader2, RefreshCw, Clipboard } from 'lucide-react';
import { motion } from 'motion/react';
import { OTPInput } from './OTPInput';
import { Button } from '../ui/Button';
import { useOTP } from '../../hooks/useOTP';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface OTPModalProps {
  email: string;
  onBack: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
}

export function OTPModal({ email, onBack, onVerify, onResend }: OTPModalProps) {
  const { 
    digits, 
    setInputRef, 
    handleChange, 
    handleKeyDown, 
    handlePaste, 
    isComplete, 
    otpValue 
  } = useOTP(6);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [resending, setResending] = useState(false);
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  // Auto-submit when complete
  useEffect(() => {
    if (isComplete && !loading) {
      handleVerify();
    }
  }, [isComplete]);

  const handleVerify = async () => {
    setLoading(true);
    setError(false);
    try {
      await onVerify(otpValue);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend();
    } finally {
      setResending(false);
    }
  };

  const handleManualPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardError(null);
      if (/^\d{6}$/.test(text)) {
        // Create a synthetic event for the handlePaste logic
        const dummyEvent = {
          preventDefault: () => {},
          clipboardData: {
            getData: () => text
          }
        } as unknown as React.ClipboardEvent;
        handlePaste(dummyEvent);
      }
    } catch (err: any) {
      console.error("Paste failed", err);
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        setClipboardError("Clipboard access is restricted in the preview iframe. Please use Ctrl+V/Cmd+V while focused on the input or open in a new tab.");
      } else {
        setClipboardError("Paste failed. Please enter the code manually.");
      }
    }
  };

  // Mask email for display
  const maskEmail = (str: string) => {
    const [name, domain] = str.split('@');
    return `${name.slice(0, 3)}***@${domain}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <header className="relative flex flex-col items-center text-center space-y-4">
        <button 
          onClick={onBack}
          className="absolute left-0 top-0 p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="pt-4 space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Enter Code</h2>
          <p className="text-white/40 text-sm font-medium">
            We sent a 6-digit code to <span className="text-white/60">{maskEmail(email)}</span>
          </p>
        </div>
      </header>

      <div className="space-y-6">
        <OTPInput 
          digits={digits}
          setInputRef={setInputRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          error={error}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={handleManualPaste}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors"
            >
              <Clipboard className="w-3 h-3" />
              Paste Code
            </button>
            <button 
              onClick={handleResend}
              disabled={resending}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3 h-3", resending && "animate-spin")} />
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          {clipboardError && (
            <p className="px-2 text-[10px] font-bold text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
              {clipboardError}
            </p>
          )}
        </div>

        <Button
          onClick={handleVerify}
          disabled={!isComplete || loading}
          className={cn(
            "w-full h-14 text-base font-black bg-white text-black hover:bg-white/90 rounded-2xl shadow-xl transition-all",
            error && "bg-red-500 text-white hover:bg-red-600"
          )}
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : error ? (
            'Try Again'
          ) : (
            'Verify & Sign In'
          )}
        </Button>
      </div>

      <div className="pt-4 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10 italic">
          High-Entropy Verification System
        </p>
      </div>
    </div>
  );
}
