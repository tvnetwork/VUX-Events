import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Key, Check, ArrowRight, Loader2, Copy, AlertCircle, QrCode } from 'lucide-react';
import { Button } from '../ui/Button';
import { OTPInput } from './OTPInput';
import { useAuth } from '../../AuthContext';
import { cn } from '../../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin, generateSecret, generateURI } from 'otplib';

const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

export function TwoFactorSetup({ onComplete, onCancel }: { onComplete: () => void, onCancel: () => void }) {
  const { user, profile, updateProfileData } = useAuth();
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [setupMethod, setSetupMethod] = useState<'qr' | 'manual'>('qr');

  useEffect(() => {
    if (!secret) {
      const newSecret = generateSecret();
      setSecret(newSecret);
      const userEmail = user?.email || 'user';
      const otpauth = generateURI({
        issuer: 'VUX Events',
        label: userEmail,
        secret: newSecret
      });
      setQrUrl(otpauth);
    }
  }, []);

  const handleVerify = async (currentCode?: string) => {
    const finalCode = currentCode || code;
    if (finalCode.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      const result = await totp.verify(finalCode, {
        secret: secret
      });
      if (result.valid) {
        await updateProfileData({
          security: {
            ...profile?.security,
            twoFactorEnabled: true,
            twoFactorSecret: secret,
            backupCodes: []
          }
        });
        setStep(3);
      } else {
        setError('Verification failed. Code is invalid or has expired.');
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
      handleVerify(newCode);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Set Up Authenticator</h3>
                <p className="text-xs text-zinc-400">Scan the QR code or enter the secret key manually</p>
              </div>
            </div>

            {/* Toggle tabs */}
            <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setSetupMethod('qr')}
                className={cn(
                  'flex-1 py-2 text-xs font-semibold rounded-lg transition-all',
                  setupMethod === 'qr'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                Scan QR Code
              </button>
              <button
                type="button"
                onClick={() => setSetupMethod('manual')}
                className={cn(
                  'flex-1 py-2 text-xs font-semibold rounded-lg transition-all',
                  setupMethod === 'manual'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                Manual Key
              </button>
            </div>

            {/* Content box */}
            <div className="bg-white/[0.02] p-4 sm:p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[240px] text-center">
              <AnimatePresence mode="wait">
                {setupMethod === 'qr' ? (
                  <motion.div
                    key="qr"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 bg-white rounded-xl shadow-lg border border-white/20 inline-block"
                  >
                    {qrUrl && <QRCodeSVG value={qrUrl} size={150} level="H" includeMargin={false} />}
                  </motion.div>
                ) : (
                  <motion.div
                    key="manual"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-3 w-full"
                  >
                    <p className="text-xs text-zinc-400">Enter this secret into your authenticator app:</p>
                    <div
                      onClick={copyToClipboard}
                      className="bg-white/[0.05] border border-white/10 hover:border-blue-500/40 rounded-xl py-3 px-4 cursor-pointer hover:bg-white/[0.08] transition-all group flex items-center justify-between gap-2"
                    >
                      <code className="text-xs sm:text-sm font-mono font-bold tracking-widest text-blue-300 break-all select-all">
                        {secret}
                      </code>
                      <button
                        type="button"
                        className="p-1 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copied && (
                      <p className="text-xs font-semibold text-emerald-400">
                        Copied to clipboard!
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-[11px] text-zinc-500 mt-3">
                Works with Google Authenticator, Authy, 1Password, or Apple Passwords
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                onClick={onCancel}
                variant="ghost"
                className="flex-1 h-11 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => setStep(2)}
                variant="kontyra"
                className="flex-1 h-11 rounded-xl text-xs font-semibold gap-1.5 shadow-lg shadow-blue-900/20"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Confirm Verification Code</h3>
                <p className="text-xs text-zinc-400">Enter the 6-digit code currently shown in your app</p>
              </div>
            </div>

            <div className="py-2">
              <OTPInput
                value={code}
                onChange={handleCodeChange}
                disabled={loading}
                isError={!!error}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-300 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                onClick={() => setStep(1)}
                variant="ghost"
                className="flex-1 h-11 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => handleVerify()}
                disabled={code.length !== 6 || loading}
                variant="kontyra"
                className="flex-1 h-11 rounded-xl text-xs font-semibold gap-1.5 shadow-lg shadow-blue-900/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Activate 2FA</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">Two-Factor Authentication Enabled</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Your account is now protected. You'll be asked for a security code whenever you sign in.
              </p>
            </div>

            <Button
              type="button"
              onClick={onComplete}
              variant="kontyra"
              className="w-full h-11 rounded-xl text-xs font-semibold shadow-lg shadow-blue-900/20"
            >
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
