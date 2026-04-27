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
    <div className="relative min-h-screen bg-gradient-to-br from-[#0b0b0f] via-[#0d0d1a] to-[#0b0b0f] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <Helmet>
        <title>VUX Events | Modern Event Management Platform</title>
        <meta name="description" content="The modern standard for community events. Create, promote, and manage high-impact events with ease." />
        <meta property="og:title" content="VUX Events | Modern Event Management" />
        <meta property="og:description" content="Transform your community gatherings into high-impact events with our modern platform." />
        <meta property="og:type" content="website" />
      </Helmet>
      <WatermarkBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <AnnouncementBanner />
        <LandingNavbar onAuthClick={() => setIsAuthOpen(true)} />
        
        <main>
          <Hero onStartClick={() => setIsAuthOpen(true)} />

          {/* Features Bento Section */}
          <section className="py-32 px-6 relative">
            <div className="max-w-[1400px] mx-auto space-y-24">
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-3 text-indigo-500">
                  <div className="w-10 h-px bg-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Features</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                  Built for your <br />
                  <span className="text-indigo-500">Community.</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
                {/* Large Featured Card */}
                <div className="md:col-span-8 group relative overflow-hidden rounded-[3rem] border border-white/[0.03] bg-white/[0.01] p-12 flex flex-col justify-end hover:bg-white/[0.02] transition-all duration-700">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-8">
                       <QrCode className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter">Digital Ticketing</h3>
                    <p className="text-white/60 text-lg font-bold uppercase tracking-wider italic leading-relaxed max-w-md">
                      Secure digital tickets for every attendee. Fast check-in process at the door with real-time status updates.
                    </p>
                  </div>
                </div>

                {/* Vertical Card */}
                <div className="md:col-span-4 group relative overflow-hidden rounded-[3rem] border border-white/[0.03] bg-white/[0.01] p-12 flex flex-col justify-between hover:bg-indigo-500/[0.03] transition-all duration-700">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="space-y-6 pt-16">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Secure & Trusted</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 leading-loose">
                      Industry-standard security protecting your community data and financial transactions at every step.
                    </p>
                  </div>
                </div>

                {/* Horizontal Card */}
                <div className="md:col-span-12 lg:col-span-6 group relative overflow-hidden rounded-[3rem] border border-white/[0.03] bg-white/[0.01] p-12 flex gap-10 items-center hover:bg-white/[0.02] transition-all duration-700">
                  <div className="w-24 h-24 shrink-0 rounded-[2rem] bg-indigo-500/5 flex items-center justify-center border border-white/5">
                    <Globe className="w-10 h-10 text-indigo-500/40" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Automated Notifications</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                      Keep your guests updated with automated emails and scheduled notifications for every event update.
                    </p>
                  </div>
                </div>

                {/* Square Card */}
                <div className="md:col-span-12 lg:col-span-6 group relative overflow-hidden rounded-[3rem] border border-white/[0.03] bg-white/[0.01] p-12 flex gap-10 items-center hover:bg-white/[0.02] transition-all duration-700">
                  <div className="w-24 h-24 shrink-0 rounded-[2rem] bg-indigo-500/5 flex items-center justify-center border border-white/5">
                    <Users className="w-10 h-10 text-indigo-500/40" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Growth Insights</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                      Understand your audience growth and engagement patterns with easy-to-read data visualizations.
                    </p>
                  </div>
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
