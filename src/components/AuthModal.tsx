/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Key, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Button } from './ui/Button';
import { EmailStep } from './auth/EmailStep';
import { OTPModal } from './auth/OTPModal';
import { PasskeyButton } from './auth/PasskeyButton';
import { ModalShell } from './ui/ModalShell';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { signInWithGoogle, signInWithPasskey, registerPasskey, sendVerificationCode, verifyCode } = useAuth();

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
      setError('Please enter your email above to sign in with passkey');
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

      await new Promise(resolve => setTimeout(resolve, 800));

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
    <ModalShell
      onClose={onClose}
      badge={
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-medium text-blue-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>VUX Identity</span>
        </div>
      }
      title={setupPasskey ? 'Register Passkey' : showCodeStep ? undefined : 'Sign in to VUX Events'}
      subtitle={
        setupPasskey
          ? 'Add biometric authentication for seamless one-touch logins'
          : showCodeStep
            ? undefined
            : 'Access tickets, organizer tools, and community events'
      }
      maxWidth="md"
    >
      {error && !showCodeStep && !setupPasskey && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {setupPasskey ? (
          <motion.div
            key="setup-passkey"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-5 py-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/5">
              <Key className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-bold text-white">Faster, safer logins</h4>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Use your device's Touch ID, Face ID, or PIN for instant one-click authentication.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Button
                onClick={handleRegisterPasskey}
                disabled={passkeyLoading}
                variant="kontyra"
                className="w-full h-12 rounded-xl text-sm font-semibold gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98]"
              >
                {passkeyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Register Passkey</span>
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-zinc-400 hover:text-white transition-colors text-xs font-medium"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        ) : !showCodeStep ? (
          <motion.div
            key="sign-in-options"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Quick SSO Options */}
            <div className="space-y-2.5">
              {/* Kontyra SSO Button */}
              <button
                type="button"
                onClick={handleKontyra}
                disabled={loading || kontyraLoading}
                className="w-full h-12 px-4 rounded-xl flex items-center justify-between border border-blue-500/30 bg-gradient-to-r from-blue-600/15 via-indigo-600/20 to-blue-500/15 hover:border-blue-400/50 hover:bg-blue-600/25 active:scale-[0.98] transition-all duration-200 group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {kontyraLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  ) : (
                    <img
                      src="/kontyra-logo.svg"
                      alt="Kontyra"
                      className="w-4.5 h-4.5 shrink-0 rounded-sm object-contain"
                    />
                  )}
                  <span className="text-white text-xs sm:text-sm font-semibold">
                    Continue with Kontyra
                  </span>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  DevOS SSO
                </span>
              </button>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading || kontyraLoading}
                className="w-full h-12 px-4 rounded-xl flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 active:scale-[0.98] transition-all duration-200 text-zinc-900 font-semibold text-xs sm:text-sm shadow-sm cursor-pointer"
              >
                <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#0c0e17] px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  or email code
                </span>
              </div>
            </div>

            {/* Email Step */}
            <EmailStep
              email={email}
              setEmail={setEmail}
              onSubmit={handleEmailSubmit}
              loading={loading}
            />

            {/* Passkey Fallback */}
            <div className="pt-1">
              <PasskeyButton
                onClick={handlePasskeyStart}
                loading={passkeyLoading}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
    </ModalShell>
  );
}
