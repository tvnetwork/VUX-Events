import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function SSOCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error') || searchParams.get('message');

    if (errorParam) {
      setStatus('error');
      setErrorMessage(errorParam);
      return;
    }

    if (!token) {
      setStatus('error');
      setErrorMessage('No authentication token received from Kontyra Identity.');
      return;
    }

    const processAuth = async () => {
      try {
        await signInWithCustomToken(auth, token);
        setStatus('success');
        // Brief moment to show success state before redirecting
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 800);
      } catch (err: any) {
        console.error('Kontyra SSO sign-in failed:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to complete sign-in with the provided token.');
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-[#13141c]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl text-center shadow-2xl shadow-black/80 space-y-6"
      >
        {/* Brand / Logo */}
        <div className="w-16 h-16 mx-auto relative flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl border border-white/15 flex items-center justify-center shadow-lg shadow-blue-500/20">
            {status === 'loading' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
            {status === 'success' && <ShieldCheck className="w-8 h-8 text-emerald-400" />}
            {status === 'error' && <AlertCircle className="w-8 h-8 text-red-400" />}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-white italic tracking-tight uppercase">
            {status === 'loading' && 'Authenticating with Kontyra'}
            {status === 'success' && 'Welcome to VUX Events'}
            {status === 'error' && 'Authentication Failed'}
          </h2>
          <p className="text-xs text-white/50 font-medium">
            {status === 'loading' && 'Verifying your identity with Kontyra ecosystem...'}
            {status === 'success' && 'Signed in successfully. Redirecting you to your dashboard...'}
            {status === 'error' && (errorMessage || 'An error occurred during single sign-on.')}
          </p>
        </div>

        {status === 'error' && (
          <div className="pt-4">
            <Button
              variant="vux"
              onClick={() => navigate('/', { replace: true })}
              className="w-full h-12 text-xs font-bold"
            >
              Return to VUX Events
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
