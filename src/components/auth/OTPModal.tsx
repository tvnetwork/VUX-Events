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
        setCode(cleaned);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setError('Could not access clipboard. Please paste manually.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Check your email</h3>
        <p className="text-white/50 text-sm">
          We've sent a 6-digit code to <span className="text-white">{email}</span>
        </p>
      </div>

      <div className="space-y-6">
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
            className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-purple-400 transition-colors bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            title="Paste from clipboard"
          >
            <ClipboardCheck className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handlePasteCode}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium mx-auto md:hidden"
        >
          <ClipboardCheck className="w-4 h-4" />
          Paste code from clipboard
        </button>

        {error && (
          <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Button
            type="submit"
            disabled={code.length !== 6 || loading}
            className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
          </Button>

          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Change email
            </button>

            <button
              type="button"
              onClick={handleResendClick}
              disabled={resending}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm disabled:opacity-50"
            >
              {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              Resend code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
