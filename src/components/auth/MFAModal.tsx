import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, ArrowRight, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../AuthContext';

export function MFAModal() {
  const { verifyMFACode, logout, profile } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const isValid = await verifyMFACode(code);
      if (!isValid) {
        setError('Invalid security code. Please check your authenticator app.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred during verification.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b0b0f] p-6 overflow-hidden">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent top-1/4 animate-scan" />
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent top-2/4 animate-scan-slow" />
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent top-3/4 animate-scan" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute -inset-1 blur-3xl bg-blue-500/10 rounded-[3rem] pointer-events-none" />
        
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[3rem] p-10 md:p-12 space-y-10 relative overflow-hidden">
          {/* Progress ring background */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

          <header className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mx-auto shadow-2xl shadow-blue-500/10 relative group">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Shield className="w-10 h-10 text-blue-400 relative z-10" />
            </div>
            <div className="space-y-3">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Neural Sync Required</h2>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">Identity Verification Protocol Active</p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/60 block text-center">Enter 6-digit Security Core</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-blue-500/40 transition-colors" />
                <Input 
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="bg-white/[0.03] border-white/5 focus:border-blue-500/40 h-20 rounded-[1.5rem] italic font-black text-2xl sm:text-3xl tracking-[0.3em] sm:tracking-[0.4em] text-center pl-6 pr-6 shadow-inner"
                  autoFocus
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-red-400 text-center uppercase tracking-widest"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button 
              type="submit"
              disabled={code.length !== 6 || loading}
              variant="vux"
              className="w-full h-20 rounded-[1.5rem] gap-4 shadow-2xl shadow-blue-500/20"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="font-black uppercase tracking-[0.2em]">Verify Identity</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </Button>
          </form>

          <footer className="pt-4 text-center">
            <button 
              onClick={() => logout()}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCcw className="w-3 h-3" />
              Switch Terminal Profile
            </button>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
