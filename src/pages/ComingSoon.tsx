import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Timer } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="space-y-16 text-center max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <Logo size="lg" />
        </motion.div>

        <div className="space-y-8">
            <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 shadow-2xl shadow-indigo-500/10 mx-auto"
            >
                <Timer className="w-3.5 h-3.5" />
                <span>Feature Under Construction</span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-6"
            >
                <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8]">
                    COMING <br />
                    <span className="text-indigo-500">SOON.</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-bold italic uppercase tracking-wider max-w-lg mx-auto">
                    We are currently building this node. Synchronization with the main grid is imminent.
                </p>
            </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="pt-12"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-white/40 hover:text-white font-black uppercase tracking-[0.3em] italic text-sm group h-20 px-12 rounded-3xl border border-white/5 hover:border-indigo-500/20"
          >
            <ArrowLeft className="w-4 h-4 mr-4 group-hover:-translate-x-2 transition-transform" />
            Back to Synchronization
          </Button>
        </motion.div>
      </div>

      <div className="absolute bottom-12 text-[10px] font-black tracking-[0.5em] text-white/10 uppercase italic">
        ESTABLISHING CONNECTION // PLEASE STAND BY
      </div>
    </div>
  );
}
