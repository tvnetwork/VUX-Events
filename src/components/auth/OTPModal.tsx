import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, RefreshCcw, ClipboardCheck } from 'lucide-react';
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
      // Auto-submit and blur to close keyboard
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      handleSubmit(undefined, newCode);
    }
  };

  const handleResendClick = async () => {
    setResending(true);
    setError('');
    setCode(''); // Clear input on resend
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
      setError('Could not access clipboard. Please paste manually.');
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <Mail className="w-10 h-10 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-white italic tracking-tight uppercase mb-2">Check your inbox</h3>
        <p className="text-white/40 text-sm font-medium leading-relaxed px-6">
          Paste the 6-digit verification code we've sent to <span className="text-white font-black">{email}</span>
        </p>
      </div>

      <div className="space-y-8">
        <div className="relative group">
          <OTPInput 
            value={code} 
            onChange={handleCodeChange} 
            disabled={loading}
            isError={!!error}
            isSuccess={isSuccess}
          />
          <button
            type="button"
            onClick={handlePasteCode}
            className="absolute -right-14 top-1/2 -translate-y-1/2 p-2.5 text-white/20 hover:text-indigo-400 transition-all bg-white/[0.03] hover:bg-white/[0.08] rounded-xl opacity-0 group-hover:opacity-100 hidden md:flex border border-white/[0.03]"
            title="Paste from clipboard"
          >
            <ClipboardCheck className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handlePasteCode}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-xs font-black uppercase tracking-widest mx-auto md:hidden"
        >
          <ClipboardCheck className="w-4 h-4" />
          Paste code from clipboard
        </button>

        {error && (
          <p className="text-red-400 text-[10px] text-center font-black uppercase tracking-[0.2em] bg-red-400/5 py-3 rounded-xl border border-red-400/10 animate-shake">
            {error}
          </p>
        )}

        <div className="space-y-6">
          <Button
            type="submit"
            onClick={(e) => handleSubmit(e)}
            variant="email"
            disabled={code.length !== 6 || loading}
            className="w-full h-15 text-lg font-black rounded-2xl shadow-2xl shadow-indigo-500/10"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify Account'}
          </Button>

          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-white/20 hover:text-white/40 transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              <ArrowLeft className="w-3 h-3" />
              Change email
            </button>

            <button
              type="button"
              onClick={handleResendClick}
              disabled={resending}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
              Resend code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
