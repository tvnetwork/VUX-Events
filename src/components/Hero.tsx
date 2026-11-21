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
    <section className="relative min-h-[84vh] flex items-center pt-28 pb-20 sm:pb-28 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 top-12 size-[28rem] rounded-full bg-[#9c5c4d]/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left Side - Sleek Typography */}
        <div className="space-y-8 text-left max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#d88c74]/25 bg-[#d88c74]/[0.08] px-4 py-2 text-xs font-semibold text-[#e9ad99]"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Modern event planning made simple</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-6"
          >
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#f6f0e9] sm:text-6xl lg:text-[5.25rem]">
              Good things happen <span className="text-[#e4a08a]">when we gather.</span>
            </h1>
            <p className="max-w-lg text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              From the first invite to the final encore, make every moment of your event feel effortless.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <Button
              variant="vux"
              onClick={onStartClick}
              className="w-full sm:w-auto h-12 px-8 text-sm font-semibold rounded-full shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              Create an Event <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/discover')}
              className="w-full sm:w-auto h-12 px-8 text-sm font-medium text-white/80 hover:text-white rounded-full hover:bg-white/[0.06] border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              Find Events <ChevronRight className="w-4 h-4" />
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
          <div className="relative z-10 w-full max-w-[440px] mx-auto">
            {/* Main Frosted Glass Card */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[#211c1e] p-5 shadow-[0_36px_100px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:-translate-y-1 sm:p-7">
               {/* Ambient inner glow */}
               <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

               {/* Banner Image Preview */}
               <div className="h-44 w-full bg-gradient-to-br from-purple-900/50 via-indigo-950/40 to-black rounded-3xl mb-6 relative overflow-hidden flex flex-col justify-between p-4 border border-white/10 group-hover:scale-[1.01] transition-transform duration-500">
                  <div className="flex items-center justify-between z-10">
                     <span className="px-3 py-1 rounded-full bg-black/70 border border-purple-500/30 text-[9px] font-black uppercase tracking-widest text-purple-300 backdrop-blur-md flex items-center gap-1.5 shadow-sm shadow-purple-500/20">
                       <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                       Featured Summit
                     </span>
                     <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-[9px] font-black uppercase tracking-wider text-rose-300">
                       Free Pass
                     </span>
                  </div>

                  <div className="z-10">
                     <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Global Tech Series</p>
                     <h3 className="text-xl font-black text-white italic tracking-tight uppercase leading-snug">VUX Decentralized 2026</h3>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-80" />
               </div>
               
               <div className="space-y-5 px-1">
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center gap-1.5 text-white/50 text-[9px] font-black uppercase tracking-widest mb-1">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        <span>Date & Time</span>
                      </div>
                      <p className="text-xs font-semibold text-white">Tomorrow, 7:00 PM</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center gap-1.5 text-white/50 text-[9px] font-black uppercase tracking-widest mb-1">
                        <Globe className="w-3 h-3 text-purple-400" />
                        <span>Access</span>
                      </div>
                      <p className="text-xs font-semibold text-white">Hybrid • Global Stream</p>
                    </div>
                  </div>

                  {/* Attendees & Capacity */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border-2 border-[#0d0e17] flex items-center justify-center text-[10px] font-black text-white">H</div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 border-2 border-[#0d0e17] flex items-center justify-center text-[10px] font-black text-white">A</div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 border-2 border-[#0d0e17] flex items-center justify-center text-[10px] font-black text-white">V</div>
                      </div>
                      <span className="text-[11px] font-semibold text-white/70">+580 Confirmed</span>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      94% Capacity
                    </span>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="pt-2 flex gap-3">
                    <button 
                      onClick={onStartClick}
                      className="h-12 flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
                    >
                      <span>Claim Free RSVP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
               </div>
            </div>

            {/* Floating Badge 1 - Kontyra / Security */}
            <motion.div 
               animate={{ y: [0, -8, 0] }} 
               transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -right-8 -top-6 bg-[#12131d]/90 backdrop-blur-2xl border border-white/[0.08] p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-30"
            >
               <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
                   <ShieldCheck className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                   <div className="text-[11px] font-bold text-white leading-tight">Kontyra SSO Verified</div>
                   <div className="text-[9px] text-white/40 font-medium">Single-sign on active</div>
               </div>
            </motion.div>

            {/* Floating Badge 2 - QR Ticketing */}
            <motion.div 
               animate={{ y: [0, 8, 0] }} 
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute -left-8 -bottom-6 bg-[#12131d]/90 backdrop-blur-2xl border border-white/[0.08] p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-30"
            >
               <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                   <Sparkles className="w-5 h-5 text-emerald-400" />
               </div>
               <div>
                   <div className="text-[11px] font-bold text-white leading-tight">Instant QR Check-in</div>
                   <div className="text-[9px] text-white/40 font-medium">Real-time attendee sync</div>
               </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
