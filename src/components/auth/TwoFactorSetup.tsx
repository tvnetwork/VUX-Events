import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Smartphone, Key, Check, ArrowRight, Loader2, Copy, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../AuthContext';
import { cn } from '../../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin, generateSecret, generateURI } from 'otplib';

// Initialize TOTP with standard Authenticator settings
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

  const handleVerify = async () => {
    if (code.length !== 6) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await totp.verify(code, {
        secret: secret
      });
      if (result.valid) {
        await updateProfileData({
          security: {
            ...profile?.security,
            twoFactorEnabled: true,
            twoFactorSecret: secret,
            backupCodes: [] // In a real app, generate backup codes here
          }
        });
        setStep(3);
      } else {
        setError('Verification failed. The code is incorrect or expired.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Smartphone className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">Setup Authenticator</h3>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">Choose your preferred setup method below.</p>
                </div>
              </div>
            </div>

            <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/5">
              <button 
                onClick={() => setSetupMethod('qr')}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                  setupMethod === 'qr' ? "bg-white/10 text-white shadow-xl" : "text-white/20 hover:text-white/40"
                )}
              >
                Scan QR Code
              </button>
              <button 
                onClick={() => setSetupMethod('manual')}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                  setupMethod === 'manual' ? "bg-white/10 text-white shadow-xl" : "text-white/20 hover:text-white/40"
                )}
              >
                Enter Key Manually
              </button>
            </div>

            <div className="bg-white/5 p-4 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border border-white/5 flex flex-col items-center gap-8 group min-h-[300px] sm:min-h-[340px] justify-center">
              <AnimatePresence mode="wait">
                {setupMethod === 'qr' ? (
                  <motion.div 
                    key="qr"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-3 sm:p-4 bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-blue-500/10 border-4 border-transparent group-hover:border-blue-500/20 transition-all text-center"
                  >
                    {qrUrl && <QRCodeSVG value={qrUrl} size={160} level="H" includeMargin={true} className="sm:w-[180px] sm:h-[180px]" />}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="manual"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6 w-full text-center"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 mx-auto mb-2">
                      <Key className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500/40" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] sm:text-xs text-white/40 font-medium italic">Type this secret key into your authenticator app:</p>
                       <div 
                         onClick={copyToClipboard}
                         className="bg-white/10 border border-white/10 rounded-2xl py-4 sm:py-6 px-4 cursor-pointer hover:bg-white/20 transition-all group/key active:scale-95 overflow-hidden"
                       >
                         <code className="text-lg sm:text-2xl font-black tracking-[0.2em] sm:tracking-[0.3em] text-white font-mono break-all">{secret}</code>
                       </div>
                       {copied && (
                         <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black uppercase text-blue-400 tracking-widest pt-2">
                           Copied to clipboard!
                         </motion.p>
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-2 text-center">
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-relaxed">
                  {setupMethod === 'qr' ? "Scan with Google Authenticator or Authy" : "Account Name: VUX Events"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button onClick={onCancel} variant="ghost" className="order-2 sm:order-1 flex-1 rounded-2xl h-14 sm:h-16 border border-white/5 uppercase tracking-widest text-[10px] font-black">Cancel</Button>
              <Button onClick={() => setStep(2)} variant="vux" className="order-1 sm:order-2 flex-2 rounded-2xl h-14 sm:h-16 uppercase tracking-widest text-[10px] font-black gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-xl shadow-blue-500/5">
                <Key className="w-6 h-6 text-blue-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">Verify Code</h3>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">Enter the current 6-digit code.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <LockIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-blue-500/40" />
                <Input 
                   type="text"
                   maxLength={6}
                   value={code}
                   onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                   placeholder="000 000"
                   className="bg-white/[0.02] border-white/5 h-20 rounded-[1.5rem] italic font-black text-2xl sm:text-3xl tracking-[0.3em] sm:tracking-[0.5em] text-center"
                   autoFocus
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{error}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button onClick={() => setStep(1)} variant="ghost" className="order-2 sm:order-1 flex-1 rounded-2xl h-14 sm:h-16 border border-white/5 uppercase tracking-widest text-[10px] font-black">Back</Button>
              <Button 
                onClick={handleVerify} 
                disabled={code.length !== 6 || loading}
                variant="vux" 
                className="order-1 sm:order-2 flex-2 rounded-2xl h-14 sm:h-16 uppercase tracking-widest text-[10px] font-black gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Enable 2FA</>}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-8"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mx-auto animate-bounce-slow">
              <Check className="w-12 h-12 text-emerald-400" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">Security Hardened</h3>
              <p className="text-[10px] text-emerald-400/60 font-black uppercase tracking-[0.3em]">Neural Verification Protocol Initialized</p>
            </div>

            <p className="text-xs text-white/30 leading-relaxed max-w-xs mx-auto">
              Your account is now protected with two-factor authentication. You will be prompted for a verification code whenever you access this terminal.
            </p>

            <Button onClick={onComplete} variant="vux" className="w-full h-18 rounded-2xl uppercase tracking-widest text-[10px] font-black">
              Return to Interface
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
