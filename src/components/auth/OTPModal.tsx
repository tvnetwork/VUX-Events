import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, RefreshCcw, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { OTPInput } from './OTPInput';

interface OTPModalProps {
  email: string;
  onBack: () => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
}

export function OTPModal({ email, onBack, onVerify, onResend }: OTPModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, currentCode?: string) => {
    e?.preventDefault();
    const finalCode = currentCode || code;
    if (finalCode.length !== 6) return;

    setLoading(true);
    setError('');
    setIsSuccess(false);
    try {
      await onVerify(finalCode);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (newCode.length === 6) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      handleSubmit(undefined, newCode);
    }
  };

  const handleResendClick = async () => {
    setResending(true);
    setError('');
    setCode('');
    setIsSuccess(false);
    try {
      await onResend();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.replace(/\D/g, '').slice(0, 6);
      if (cleaned) {
        handleCodeChange(cleaned);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setError('Could not access clipboard. Please enter code manually.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Check your email
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed px-2">
          We sent a 6-digit confirmation code to{' '}
          <span className="text-white font-medium">{email}</span>
        </p>
      </div>

      {/* Code Input */}
      <div className="space-y-4">
        <div className="py-2">
          <OTPInput
            value={code}
            onChange={handleCodeChange}
            disabled={loading}
            isError={!!error}
            isSuccess={isSuccess}
          />
        </div>

        {/* Quick Paste Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handlePasteCode}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 active:bg-blue-500/20 transition-all"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Paste code</span>
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Success Feedback */}
        {isSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified successfully! Entering...</span>
          </div>
        )}

        {/* Action Button */}
        <Button
          type="button"
          onClick={(e) => handleSubmit(e)}
          variant="kontyra"
          disabled={code.length !== 6 || loading}
          className="w-full h-12 rounded-xl text-sm font-semibold shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify & Sign In'
          )}
        </Button>

        {/* Footer controls: Back + Resend */}
        <div className="flex items-center justify-between pt-1 text-xs text-zinc-400">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change email</span>
          </button>

          <button
            type="button"
            onClick={handleResendClick}
            disabled={resending}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors font-medium"
          >
            {resending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Resend code</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
