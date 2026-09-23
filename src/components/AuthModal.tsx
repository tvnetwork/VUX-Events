/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Key, Mail } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Button } from './ui/Button';
import { EmailStep } from './auth/EmailStep';
import { OTPModal } from './auth/OTPModal';
import { WatermarkBackground } from './WatermarkBackground';
import { PasskeyButton } from './auth/PasskeyButton';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { signInWithGoogle, signInWithPasskey, registerPasskey, sendVerificationCode, verifyCode, addPasskey } = useAuth();

  const [email, setEmail] = useState('');
  const [showCodeStep, setShowCodeStep] = useState(false);
  const [setupPasskey, setSetupPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [kontyraLoading, setKontyraLoading] = useState(false);
  const [error, setError] = useState('');

  const handleKontyra = () => {
    setKontyraLoading(true);
    try {
      const appId = import.meta.env.VITE_KONTYRA_APP_ID || 'vux-events';
      const kontyraAuthUrl = import.meta.env.VITE_KONTYRA_AUTH_URL || 'https://accounts.kontyra.name.ng/auth';
      const returnUrl = encodeURIComponent(`${window.location.origin}/sso-callback`);
      window.location.href = `${kontyraAuthUrl}?targetApp=${appId}&returnUrl=${returnUrl}`;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Kontyra sign in');
      setKontyraLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setPasskeyLoading(true);
    try {
      await registerPasskey();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to setup passkey');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handlePasskeyStart = async () => {
    if (!email) {
      setError('Please enter your email to sign in with passkey');
      return;
    }
    
    setPasskeyLoading(true);
    try {
      await signInWithPasskey(email);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Passkey login failed');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await sendVerificationCode(email);
      setShowCodeStep(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      await verifyCode(email, code);
      
      // Wait a moment for AuthProvider to sync profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user has a passkey
      const profileRef = doc(db, 'users', email);
      const profileSnap = await getDoc(profileRef);
      const userData = profileSnap.data() as UserProfile;
      
      if (!userData?.passkeys || userData.passkeys.length === 0) {
        setSetupPasskey(true);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await sendVerificationCode(email);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0b0b0f]/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto custom-scrollbar"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
        className="bg-[#0e0f17]/90 backdrop-blur-2xl border border-white/[0.08] w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 relative shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden my-auto"
      >
        {/* Subtle ambient gradient highlights */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-indigo-600/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center justify-between pb-6 relative z-20">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/50">VUX Secure Gateway</span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative z-10">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 shadow-xl shadow-indigo-950/50">
                <Mail className="w-7 h-7 text-indigo-400" />
             </div>
             <h2 className="text-3xl font-black italic uppercase tracking-tight text-white leading-none mb-2">ACCESS PLATFORM</h2>
             <p className="text-[11px] text-white/40 font-medium">Continue with your preferred authentication method</p>
          </div>

          {error && !showCodeStep && !setupPasskey && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl px-4 py-2.5 rounded-2xl">
                <p className="text-[11px] text-red-400 font-bold text-center">
                  {error}
                </p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {setupPasskey ? (
              <motion.div
                key="setup-passkey"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center space-y-6 py-6"
              >
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
                  <div className="relative w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-amber-500/20">
                    <Key className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Upgrade Security</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed px-6">
                    Unlock faster logins using your device's biometrics or pin.
                  </p>
                </div>

                <div className="space-y-3 pt-6">
                  <Button 
                    onClick={handleRegisterPasskey}
                    disabled={passkeyLoading}
                    variant="passkey"
                    className="w-full h-14 text-base font-bold gap-3"
                  >
                    {passkeyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                    <span>Register this Device</span>
                  </Button>
                  <button 
                    onClick={onClose}
                    className="w-full py-3 text-white/20 hover:text-white/40 transition-colors text-xs font-black uppercase tracking-[0.2em]"
                  >
                    Skip for now
                  </button>
                </div>
              </motion.div>
            ) : !showCodeStep ? (
              <motion.div
                key="email-step"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <EmailStep 
                  email={email}
                  setEmail={setEmail}
                  onSubmit={handleEmailSubmit}
                  loading={loading}
                />
                
                <div className="space-y-4 pt-6">
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.06]"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#0e0f17] px-3 text-[9px] font-black text-white/30 uppercase tracking-[0.25em]">
                        Or Connect Instantly
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {/* Google Button */}
                    <Button 
                      onClick={handleGoogle}
                      disabled={loading || kontyraLoading}
                      variant="ghost"
                      className="w-full h-13.5 bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-md shadow-white/5 active:scale-[0.99]"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Continue with Google</span>
                    </Button>

                    {/* Kontyra Button */}
                    <Button 
                      onClick={handleKontyra}
                      disabled={loading || kontyraLoading}
                      variant="kontyra"
                      className="w-full h-13.5 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-between px-5 transition-all duration-200 border border-blue-500/25 bg-gradient-to-r from-blue-600/15 via-indigo-600/20 to-blue-500/15 hover:border-blue-400/40 hover:bg-blue-600/25 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        {kontyraLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-blue-400 shrink-0" />
                        ) : (
                          <img 
                            src="/kontyra-logo.svg" 
                            alt="Kontyra" 
                            className="w-5 h-5 shrink-0 rounded-md object-contain shadow-sm"
                          />
                        )}
                        <span>Sign in with Kontyra</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        SSO
                      </span>
                    </Button>
                    
                    <PasskeyButton 
                      onClick={handlePasskeyStart}
                      loading={passkeyLoading}
                    />

                    <div className="px-6 py-4 bg-white/[0.02] border border-white/[0.03] rounded-2xl">
                      <p className="text-[10px] text-white/20 font-bold italic text-center uppercase tracking-widest leading-relaxed">
                        No passkey? Use email, then enable biometrics in 
                        <span className="text-white/40 ml-1">Settings</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <OTPModal 
                  email={email}
                  onBack={() => setShowCodeStep(false)}
                  onVerify={handleVerifyOTP}
                  onResend={handleResend}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      </motion.div>
    </motion.div>
  );
}
