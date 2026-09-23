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
          <div className="relative z-10 w-full max-w-[440px] mx-auto">
            {/* Main Frosted Glass Card */}
            <div className="relative bg-[#0d0e17]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/[0.08] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden group hover:border-white/20 transition-all duration-500">
               {/* Ambient inner glow */}
               <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

               {/* Banner Image Preview */}
               <div className="h-44 w-full bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-blue-900/40 rounded-3xl mb-6 relative overflow-hidden flex flex-col justify-between p-4 border border-white/10 group-hover:scale-[1.01] transition-transform duration-500">
                  <div className="flex items-center justify-between z-10">
                     <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-300 backdrop-blur-md flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                       Featured Summit
                     </span>
                     <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                       Free Pass
                     </span>
                  </div>

                  <div className="z-10">
                     <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Global Tech Series</p>
                     <h3 className="text-xl font-black text-white italic tracking-tight uppercase leading-snug">VUX Decentralized 2026</h3>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e17] via-transparent to-transparent opacity-80" />
               </div>
               
               <div className="space-y-5 px-1">
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-1.5 text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        <span>Date & Time</span>
                      </div>
                      <p className="text-xs font-bold text-white">Tomorrow, 7:00 PM</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-1.5 text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">
                        <Globe className="w-3 h-3 text-blue-400" />
                        <span>Access</span>
                      </div>
                      <p className="text-xs font-bold text-white">Hybrid • Global Stream</p>
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
