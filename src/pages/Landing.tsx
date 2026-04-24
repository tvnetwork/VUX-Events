import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';
import { LandingNavbar } from '../components/LandingNavbar';
import { AuthModal } from '../components/AuthModal';
import { WatermarkBackground } from '../components/WatermarkBackground';

export function Landing() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0b0b0f] via-[#1a1023] to-[#0b0b0f] text-white selection:bg-purple-500/30 overflow-x-hidden">
      <WatermarkBackground />
      <div className="relative z-10">
        <LandingNavbar onAuthClick={() => setIsAuthOpen(true)} />
        
        <main>
          <Hero onStartClick={() => setIsAuthOpen(true)} />
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
