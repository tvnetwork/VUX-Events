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
      // If no email entered, we could try a generic discovery, 
      // but for this implementation we'll ask for email first or show an error
      setError('Please enter your email to sign in with passkey');
      return;
    }
    
    setLoading(true);
    try {
      // 1. Fetch user profile to get their passkey credential
      const profileRef = doc(db, 'users', email);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        throw new Error('No account found for this email.');
      }
      
      const userData = profileSnap.data() as UserProfile;
      if (!userData.passkeys || userData.passkeys.length === 0) {
        throw new Error('No passkey found for this account.');
      }

      // 2. Perform WebAuthn authentication and Firebase login
      await signInWithPasskey(email, authWithPasskey, userData.passkeys[0]);
      
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
      setError(err.message || 'Failed to send login link');
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
      className="fixed inset-0 z-[100] bg-[#0b0b0f]/80 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#16161e]/60 glass border border-white/10 w-full max-w-md rounded-[2rem] p-4 relative shadow-2xl overflow-hidden"
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

        <div className="p-4">
          <AnimatePresence mode="wait">
            {setupPasskey ? (
              <motion.div
                key="setup-passkey"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <Key className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Enable Passkey?</h3>
                  <p className="text-white/50 text-sm leading-relaxed px-4">
                    Secure your account with biometrics. No password needed for your next visit.
                  </p>
                </div>
                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handleRegisterPasskey}
                    disabled={passkeyLoading}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold gap-2"
                  >
                    {passkeyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    <span>Activate Passkey</span>
                  </Button>
                  <button 
                    onClick={onClose}
                    className="w-full py-3 text-white/30 hover:text-white/60 transition-colors text-sm font-medium"
                  >
                    Maybe later
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
                
                <div className="space-y-4 pt-4">
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-white/20">
                      <span className="bg-transparent px-4 backdrop-blur-md">Alternative</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={handleGoogle}
                      disabled={loading}
                      className="w-full h-12 flex items-center justify-center gap-3 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-bold text-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                    
                    <PasskeyButton 
                      onClick={handlePasskeyStart}
                      loading={passkeyLoading}
                    />
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

        {error && !showCodeStep && (
          <p className="px-8 pb-6 text-xs text-red-400 font-bold uppercase tracking-widest text-center animate-bounce">
            {error}
          </p>
        )}

        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      </motion.div>
    </motion.div>
  );
}
