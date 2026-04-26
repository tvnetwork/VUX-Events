import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="space-y-12 text-center max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-12"
        >
          <Logo size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="space-y-6"
        >
          <h1 className="text-[12rem] md:text-[20rem] font-black leading-[0.7] tracking-tighter italic uppercase text-white/5 select-none relative">
            404
            <span className="absolute inset-0 flex items-center justify-center text-5xl md:text-7xl text-indigo-500 font-black italic tracking-tighter uppercase whitespace-nowrap">
              Lost in Space
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/40 leading-relaxed font-bold italic uppercase tracking-wider max-w-lg mx-auto">
            The page you are looking for has been moved or drifted out of orbit.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12"
        >
          <Button
            variant="vux"
            onClick={() => navigate('/')}
            className="h-20 px-12 text-lg font-black italic tracking-widest uppercase rounded-3xl shadow-2xl shadow-indigo-600/30 transition-all hover:scale-110 active:scale-95 group"
          >
            <Home className="w-6 h-6 mr-3" />
            <span>Return Home</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-white/40 hover:text-white font-black uppercase tracking-[0.3em] italic text-sm group h-16 px-8 rounded-2xl border border-transparent hover:border-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </div>

      <div className="absolute bottom-12 text-[10px] font-black tracking-[0.5em] text-white/10 uppercase italic">
        VUX EVENT MANAGEMENT PROTOCOL // ERROR 404
      </div>
    </div>
  );
}
