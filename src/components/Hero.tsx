import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Calendar, Users, Globe, ShieldCheck, ChevronRight } from 'lucide-react';
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
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-32 overflow-hidden">
      {/* Background glassmorphic aurora glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left Side - Sleek Typography */}
        <div className="space-y-8 text-left max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-medium text-indigo-300 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>The next generation of event management</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-semibold leading-[1.1] tracking-tight text-white">
              Elevate your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">community events.</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-lg font-light">
              {tagline} A seamless, white-label API and beautiful RSVP interfaces designed for the modern web.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <Button
              onClick={onStartClick}
              className="w-full sm:w-auto h-12 px-8 text-sm font-medium rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              Start Building <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/discover')}
              className="w-full sm:w-auto h-12 px-8 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2"
            >
              Explore Platform <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        {/* Right Side - Glassmorphism UI Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="relative hidden lg:block"
        >
          <div className="relative z-10 w-full max-w-[420px] mx-auto">
            {/* Main Frosted Glass Card */}
            <div className="bg-white/[0.02] backdrop-blur-lg rounded-3xl border border-white/10 p-6 shadow-2xl">
               <div className="h-48 w-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl mb-8 relative overflow-hidden flex items-center justify-center border border-white/5">
                    <Logo size="md" showText={false} className="opacity-50" />
               </div>
               
               <div className="space-y-6 px-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 w-32 bg-white/20 rounded-md" />
                        <div className="h-3 w-48 bg-white/10 rounded-md" />
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="h-2 w-full bg-white/10 rounded-full" />
                    <div className="h-2 w-5/6 bg-white/10 rounded-full" />
                    <div className="h-2 w-4/6 bg-white/10 rounded-full" />
                  </div>
                  
                  <div className="pt-6 flex gap-3">
                    <div className="h-10 flex-[2] bg-white text-black text-xs font-semibold rounded-xl flex items-center justify-center shadow-lg">
                        Confirm RSVP
                    </div>
                    <div className="h-10 flex-1 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center">
                        <div className="h-2 w-8 bg-white/30 rounded-full" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Floating Elements */}
            <motion.div 
               animate={{ y: [0, -10, 0] }} 
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -right-12 top-20 bg-white/[0.05] backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-3"
            >
               <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                   <ShieldCheck className="w-4 h-4 text-emerald-400" />
               </div>
               <div>
                   <div className="text-xs font-medium text-white">Verified Ticket</div>
                   <div className="text-[10px] text-white/50">Secured via API</div>
               </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
