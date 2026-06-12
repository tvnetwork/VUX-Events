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

          {/* Features Glassmorphic Section */}
          <section className="py-24 px-6 relative z-20">
            <div className="max-w-[1200px] mx-auto space-y-16">
              <div className="space-y-4 max-w-2xl text-center mx-auto">
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
                  Everything you need to scale.
                </h2>
                <p className="text-white/60 text-lg font-light leading-relaxed">
                  A powerful suite of tools designed to automate the heavy lifting of event management, so you can focus on building your community.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature Card 1 */}
                <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                     <QrCode className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Digital Ticketing</h3>
                  <p className="text-white/50 text-sm leading-relaxed font-light">
                    Generate secure, scannable QR codes for every attendee instantly. Speed up your door check-ins with our native tools.
                  </p>
                </div>

                {/* Feature Card 2 */}
                <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Enterprise Security</h3>
                  <p className="text-white/50 text-sm leading-relaxed font-light">
                    Protect your community data with industry-leading encryption. We prioritize your privacy and transactional security above all.
                  </p>
                </div>

                {/* Feature Card 3 */}
                <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Global Webhooks</h3>
                  <p className="text-white/50 text-sm leading-relaxed font-light">
                    Sync data directly to your own infrastructure. Our robust webhook system ensures your app stays updated in real-time.
                  </p>
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
