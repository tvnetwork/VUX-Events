import { useAuth } from '../AuthContext';
import { LandingNavbar } from './LandingNavbar';
import { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal';
import { Footer } from './Footer';
import { useNavigate } from 'react-router-dom';
import { WatermarkBackground } from './WatermarkBackground';
import { motion, AnimatePresence } from 'motion/react';

interface PageShellProps {
  children: React.ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#07070a] text-white">
      {/* Background gradients to match new elegant layout */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <WatermarkBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <LandingNavbar 
          onAuthClick={() => setIsAuthOpen(true)}
        />
        
        <main className="flex-1 pt-24 pb-16">
          {children}
        </main>

        <Footer onAuthClick={() => setIsAuthOpen(true)} />
      </div>

      {isAuthOpen && (
        <AuthModal onClose={() => setIsAuthOpen(false)} />
      )}
    </div>
  );
}
