import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Calendar, Users, Globe, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { SiteConfigService } from '../services/SiteConfigService';

export function Hero({ onStartClick }: { onStartClick: () => void }) {
  const navigate = useNavigate();
  const [tagline, setTagline] = useState('Modern events for modern communities.');

  useEffect(() => {
    SiteConfigService.getConfig().then(config => {
      setTagline(config.tagline);
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-32 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full delay-700" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
        {/* Left Side */}
        <div className="space-y-10 text-left max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 shadow-2xl shadow-indigo-500/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Event Management</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-6"
          >
            <h1 className="text-7xl md:text-9xl font-black leading-[0.8] tracking-tighter italic uppercase group">
              Simple <br />
              <span className="text-white">Events </span>
              <span className="text-indigo-500 inline-block">Made Easy.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-bold italic uppercase tracking-wider max-w-lg border-l-4 border-indigo-500/40 pl-8">
              {tagline}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-6 pt-6"
          >
            <Button
              variant="vux"
              onClick={onStartClick}
              className="w-full sm:w-auto h-24 px-16 text-2xl font-black italic tracking-widest uppercase rounded-3xl shadow-2xl shadow-indigo-600/30 transition-all hover:scale-110 active:scale-95 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/discover')}
              className="text-white/70 hover:text-white font-black uppercase tracking-[0.3em] italic text-sm group h-16 px-8 rounded-2xl border border-transparent hover:border-white/5"
            >
                Explore Events
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex items-center gap-12 pt-16 hidden md:flex"
          >
            <span className="text-[10px] font-black tracking-[0.5em] text-white/60 uppercase italic">Trusted by Leading Platforms</span>
            <div className="flex gap-10 text-white/5">
                <Globe className="w-8 h-8 hover:text-indigo-500/40 transition-colors" />
                <Users className="w-8 h-8 hover:text-indigo-500/40 transition-colors" />
                <Calendar className="w-8 h-8 hover:text-indigo-500/40 transition-colors" />
            </div>
          </motion.div>
        </div>

        {/* Right Side - Floating UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="relative group hidden lg:block"
        >
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              rotateZ: [0, 1, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            {/* Main Mockup Card - High fidelity upgrade */}
            <div className="bg-black/40 backdrop-blur-3xl rounded-[4rem] border border-white/[0.03] p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden aspect-[4/5.5] w-[480px] mx-auto relative group-hover:border-indigo-500/20 transition-all duration-700">
               {/* Inner glow */}
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent pointer-events-none" />
               
               <div className="h-64 w-full bg-indigo-500/5 rounded-[3rem] mb-10 relative overflow-hidden flex items-center justify-center group/img">
                    <Logo size="lg" showText={false} className="opacity-10 scale-150 transition-transform duration-1000 group-hover/img:scale-[1.7]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-10">
                        <div className="h-5 w-32 bg-indigo-500/40 mb-4 rounded-full" />
                        <div className="h-12 w-64 bg-white rounded-2xl" />
                    </div>
               </div>
               
               <div className="space-y-10 px-6">
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                        <Users className="w-8 h-8 text-indigo-500/40" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-5 w-40 bg-white/10 rounded-full" />
                        <div className="h-3 w-56 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-3 w-full bg-white/5 rounded-full" />
                    <div className="h-3 w-4/5 bg-white/5 rounded-full" />
                  </div>
                  <div className="pt-8 flex gap-4">
                    <div className="h-16 flex-1 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center">
                        <div className="h-4 w-12 bg-white/20 rounded-full" />
                    </div>
                    <div className="h-16 flex-[1.5] bg-white text-black font-black uppercase tracking-widest rounded-[2rem] flex items-center justify-center text-sm shadow-2xl shadow-indigo-500/20">
                        JOIN EVENT
                    </div>
                  </div>
               </div>
            </div>

            {/* Decorative Tags/Status */}
            <motion.div 
               animate={{ x: [0, 15, 0], y: [0, 10, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute -top-16 -right-12 glass p-6 py-4 rounded-[1.5rem] border border-white/10 shadow-2xl backdrop-blur-2xl bg-black/60"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-[1rem] flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Attendees</div>
                        <div className="text-xl font-black italic tracking-tighter">1,248 GUESTS</div>
                    </div>
                </div>
            </motion.div>

            <motion.div 
               animate={{ x: [0, -15, 0], y: [0, -10, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
               className="absolute -bottom-12 -left-16 glass p-6 py-4 rounded-[1.5rem] border border-white/10 shadow-2xl backdrop-blur-2xl bg-black/60"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-[1rem] flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Security</div>
                        <div className="text-xl font-black italic tracking-tighter">VERIFIED ACCESS</div>
                    </div>
                </div>
            </motion.div>
          </motion.div>

          {/* Immersive background aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-indigo-500/5 blur-[150px] rounded-full -z-10 animate-pulse" />
        </motion.div>
      </div>
    </section>
  );
}
