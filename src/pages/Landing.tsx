import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { QrCode, ShieldCheck, Globe, Users } from 'lucide-react';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';
import { LandingNavbar } from '../components/LandingNavbar';
import { AuthModal } from '../components/AuthModal';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { WatermarkBackground } from '../components/WatermarkBackground';

export function Landing() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#07070a] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      <Helmet>
        <title>VUX Events | Modern Event Management Platform</title>
        <meta name="description" content="The modern standard for community events. Create, promote, and manage high-impact events with ease." />
        <meta property="og:title" content="VUX Events | Modern Event Management" />
        <meta property="og:description" content="Transform your community gatherings into high-impact events with our modern platform." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* Dynamic ambient background is now partially handled by Hero, but Watermark remains for texture */}
      <WatermarkBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <AnnouncementBanner />
        <LandingNavbar onAuthClick={() => setIsAuthOpen(true)} />
        
        <main>
          <Hero onStartClick={() => setIsAuthOpen(true)} />

          {/* Social Proof & Metrics Ribbon */}
          <section className="border-y border-white/[0.06] bg-[#090a10]/50 backdrop-blur-xl py-10 relative z-20">
            <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-black italic tracking-tight text-white">45K+</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Verified Attendees</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">1,200+</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Global Events Hosted</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-black italic tracking-tight text-white">&lt;0.5s</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Door Check-in Latency</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-black italic tracking-tight text-emerald-400">99.98%</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Network Uptime</p>
              </div>
            </div>
          </section>

          {/* Modern Bento Grid Features Section */}
          <section className="py-32 px-6 relative z-20">
            <div className="max-w-[1200px] mx-auto space-y-20">
              <div className="space-y-4 max-w-2xl text-center mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                  Architecture & Features
                </div>
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tight text-white uppercase leading-none">
                  Built for scale. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                    Engineered for trust.
                  </span>
                </h2>
                <p className="text-white/50 text-base font-light leading-relaxed">
                  A high-velocity platform orchestrating ticketing, authentication, attendee workflows, and developer APIs in one cohesive ecosystem.
                </p>
              </div>

              {/* Bento Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bento Card 1 - Large 2-column feature */}
                <div className="md:col-span-2 relative bg-[#0d0e17]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-8 md:p-10 overflow-hidden group hover:border-white/20 transition-all duration-500 flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="space-y-4 max-w-md relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">High-Speed FastPass QR</h3>
                    <p className="text-white/50 text-sm leading-relaxed font-light">
                      Sub-second gate check-ins with tamper-resistant dynamic QR codes. Native support for device cameras, offline caching, and automated pass validations.
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-semibold text-white/70">Hardware & Browser Scanner Support</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                      Zero Friction
                    </span>
                  </div>
                </div>

                {/* Bento Card 2 - Kontyra & Biometrics */}
                <div className="relative bg-[#0d0e17]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-8 md:p-10 overflow-hidden group hover:border-white/20 transition-all duration-500 flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Kontyra Identity SSO</h3>
                    <p className="text-white/50 text-sm leading-relaxed font-light">
                      Zero passwords required. Sign in seamlessly with your Kontyra ecosystem credentials, Google, or device biometrics via FIDO2 passkeys.
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between relative z-10">
                    <span className="text-xs font-semibold text-white/70">Unified Ecosystem</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                      FIDO2 & OAuth
                    </span>
                  </div>
                </div>

                {/* Bento Card 3 - Real-time RSVP & Analytics */}
                <div className="relative bg-[#0d0e17]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-8 md:p-10 overflow-hidden group hover:border-white/20 transition-all duration-500 flex flex-col justify-between">
                  <div className="space-y-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Capacity & Waitlists</h3>
                    <p className="text-white/50 text-sm leading-relaxed font-light">
                      Automated waitlist management that moves eager attendees into confirmed slots as soon as capacity opens up, with instant email dispatch.
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between relative z-10">
                    <span className="text-xs font-semibold text-white/70">Autonomous Dispatch</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Auto-RSVP
                    </span>
                  </div>
                </div>

                {/* Bento Card 4 - Developer Webhooks & API (2 columns) */}
                <div className="md:col-span-2 relative bg-[#0d0e17]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-8 md:p-10 overflow-hidden group hover:border-white/20 transition-all duration-500 flex flex-col justify-between">
                  <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                  <div className="space-y-4 max-w-lg relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Globe className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Global Webhooks & Developer Hub</h3>
                    <p className="text-white/50 text-sm leading-relaxed font-light">
                      Build your own event experiences on top of our hardened API. Stream attendee check-ins directly into your CRM, Discord, Slack, or custom database in real-time.
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3 font-mono text-xs text-white/50 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                      <span className="text-purple-400">POST</span>
                      <span>/api/external/events/:id/rsvps</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                      HMAC Signed
                    </span>
                  </div>
                </div>
              </div>

              {/* Call-to-action Card */}
              <div className="relative rounded-[3rem] overflow-hidden p-10 md:p-16 border border-white/10 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#0d0e17]/80 backdrop-blur-2xl text-center space-y-6">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent pointer-events-none" />
                <h3 className="text-3xl md:text-5xl font-black text-white italic tracking-tight uppercase max-w-xl mx-auto leading-tight relative z-10">
                  Ready to host an unforgettable experience?
                </h3>
                <p className="text-white/60 text-base max-w-lg mx-auto font-light relative z-10">
                  Launch your event page in under 2 minutes. Free for community organizers.
                </p>
                <div className="pt-4 relative z-10 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="h-14 px-8 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 font-black text-xs uppercase tracking-wider shadow-2xl shadow-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer onAuthClick={() => setIsAuthOpen(true)} />
      </div>

      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal onClose={() => setIsAuthOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
