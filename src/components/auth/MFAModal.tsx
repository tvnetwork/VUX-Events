import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, ArrowRight, Loader2, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { OTPInput } from './OTPInput';
import { useAuth } from '../../AuthContext';
import { ModalShell } from '../ui/ModalShell';

export function MFAModal() {
  const { verifyMFACode, logout } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, currentCode?: string) => {
    e?.preventDefault();
    const finalCode = currentCode || code;
    if (finalCode.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      const isValid = await verifyMFACode(finalCode);
      if (!isValid) {
        setError('Invalid verification code. Please check your authenticator app.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
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

  return (
    <ModalShell
      onClose={() => logout()}
      showCloseButton={false}
      badge={
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-medium text-blue-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Security Verification</span>
        </div>
      }
      title="Two-Factor Authentication"
      subtitle="Enter the 6-digit code from your authenticator app to continue."
      maxWidth="md"
    >
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
        <div className="py-2">
          <OTPInput
            value={code}
            onChange={handleCodeChange}
            disabled={loading}
            isError={!!error}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={code.length !== 6 || loading}
          variant="kontyra"
          className="w-full h-12 rounded-xl text-sm font-semibold shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying code...</span>
            </>
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => logout()}
            className="text-xs text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign in with a different account</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
