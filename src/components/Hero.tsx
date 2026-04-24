import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Calendar, Users, Globe } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export function Hero({ onStartClick }: { onStartClick: () => void }) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-pink-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-[1280px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left Side */}
        <div className="space-y-8 text-left max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-purple-400"
          >
            <Sparkles className="w-3 h-3" />
            <span>The new standard for community</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight">
              Delightful events <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                start here.
              </span>
            </h1>
            <p className="text-xl text-white/40 leading-relaxed font-medium max-w-lg">
              Create event pages, invite guests, and sell tickets with the modern toolkit for high-impact communities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <Button
              onClick={onStartClick}
              className="w-full sm:w-auto px-10 py-8 text-xl font-bold rounded-2xl bg-white text-black hover:bg-white/90 shadow-[0_0_50px_rgba(168,85,247,0.3)] transition-all hover:scale-[1.02]"
            >
              Create Your First Event
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/discover')}
              className="text-white/40 hover:text-white font-bold group"
            >
                Discover Events
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex items-center gap-8 pt-12 grayscale opacity-30 select-none hidden md:flex"
          >
            <span className="text-sm font-black tracking-widest">TRUSTED BY THE BEST</span>
            <div className="flex gap-8">
                <Globe className="w-6 h-6" />
                <Users className="w-6 h-6" />
                <Calendar className="w-6 h-6" />
            </div>
          </motion.div>
        </div>

        {/* Right Side - Floating UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative group hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            {/* Main Mockup Card */}
            <div className="bg-[#1a1a24] rounded-[2.5rem] border border-white/10 p-4 shadow-2xl overflow-hidden aspect-[4/5] w-[440px] mx-auto">
               <div className="h-48 w-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center">
                    <Logo size="lg" showText={false} className="opacity-20" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                        <div className="h-4 w-24 bg-white/10 rounded-full mb-3" />
                        <div className="h-8 w-48 bg-white/20 rounded-lg" />
                    </div>
               </div>
               <div className="space-y-6 px-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10" />
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-white/10 rounded-full" />
                        <div className="h-3 w-48 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-white/5 rounded-full" />
                    <div className="h-3 w-full bg-white/5 rounded-full" />
                    <div className="h-3 w-2/3 bg-white/5 rounded-full" />
                  </div>
                  <div className="pt-4 flex gap-2">
                    <div className="h-10 flex-1 bg-white/[0.03] border border-white/5 rounded-xl" />
                    <div className="h-10 flex-1 bg-white text-black font-bold rounded-xl flex items-center justify-center text-xs">RSVP</div>
                  </div>
               </div>
            </div>

            {/* Secondary Floating Elements */}
            <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute -top-12 -right-8 glass p-4 rounded-2xl border border-white/10 shadow-xl"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-xs font-bold">+128 Guests</div>
                </div>
            </motion.div>

            <motion.div 
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
               className="absolute -bottom-8 -left-8 glass p-4 rounded-2xl border border-white/10 shadow-xl"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-xs font-bold">12 Active Events</div>
                </div>
            </motion.div>
          </motion.div>

          {/* Decorative halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-500/5 blur-[120px] rounded-full -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
