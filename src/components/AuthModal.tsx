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
import { usePasskey } from '../hooks/usePasskey';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { signInWithGoogle, signInWithPasskey, sendVerificationCode, verifyCode, addPasskey } = useAuth();
  const { isAuthenticating: passkeyLoading, authenticate: authWithPasskey, register: registerPasskey } = usePasskey();

  const [email, setEmail] = useState('');
  const [showCodeStep, setShowCodeStep] = useState(false);
  const [setupPasskey, setSetupPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    try {
      const passkey = await registerPasskey(email, email.split('@')[0]);
      if (passkey) {
        await addPasskey(passkey);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to setup passkey');
    }
  };

  const handlePasskeyStart = async () => {
    if (!email) {
      setError('Please enter your email to sign in with passkey');
      return;
    }
    
    setLoading(true);
    try {
      // Perform WebAuthn authentication via server (which handles the profile lookup)
      await signInWithPasskey(email, authWithPasskey, null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Passkey login failed');
    } finally {
      setLoading(false);
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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#16161e]/60 glass border border-white/10 w-full max-w-md rounded-[2rem] p-4 relative shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar my-auto"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <WatermarkBackground />
        </div>
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors z-20"
        >
          <X className="w-5 h-5 text-white/20 hover:text-white" />
        </button>

        <div className="p-4 relative">
          <div className="text-center mb-10 pt-4">
             <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 ring-4 ring-indigo-500/5">
                <Mail className="w-8 h-8 text-indigo-400" />
             </div>
             <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">ACCESS<br/>VERIFIED</h2>
             <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] italic leading-none">Authentication Pipeline: Active</p>
          </div>

          {error && !showCodeStep && !setupPasskey && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-full px-8 z-[110]"
            >
              <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl px-4 py-2 rounded-xl">
                <p className="text-[10px] text-red-400 font-black uppercase tracking-[0.2em] text-center">
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
                
                <div className="space-y-6 pt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.03]"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#16161e] px-4 text-[10px] font-black text-white/10 uppercase tracking-[0.3em] backdrop-blur-xl">
                        Universal Access
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Button 
                      onClick={handleGoogle}
                      disabled={loading}
                      variant="vux"
                      className="w-full h-16 flex items-center justify-center gap-4 transition-all font-black text-sm shadow-xl shadow-indigo-500/10"
                    >
                      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>SYNC WITH GOOGLE</span>
                    </Button>
                    
                    <PasskeyButton 
                      onClick={handlePasskeyStart}
                      loading={passkeyLoading}
                      // PasskeyButton should internally use the same style/variant if possible, 
                      // but I'll ensure it looks consistent.
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
