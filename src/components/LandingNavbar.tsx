import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

export function LandingNavbar({ onAuthClick }: { onAuthClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-4 inset-x-0 z-[60] transition-all duration-500 px-4 sm:px-6 flex justify-center",
    )}>
      <div className={cn(
        "max-w-[1000px] w-full flex items-center justify-between px-6 transition-all duration-500",
        scrolled 
          ? "py-3 bg-black/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-full" 
          : "py-6 bg-transparent"
      )}>
        {/* Logo */}
        <Link to="/" className="hover:scale-105 transition-transform flex-shrink-0">
          <Logo size="sm" showText={true} />
        </Link>

        {/* Center - Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/discover" className="text-xs font-semibold text-white/70 hover:text-white transition-colors">Explore</Link>
          <Link to="/upgrade" className="text-xs font-semibold text-white/70 hover:text-white transition-colors">Features</Link>
          <Link to="/pricing" className="text-xs font-semibold text-white/70 hover:text-white transition-colors">Pricing</Link>
        </div>

        {/* Auth CTA */}
        <div className="flex items-center gap-4">
            <Button 
                variant="vux"
                onClick={onAuthClick}
                className="px-6 h-10 text-xs font-semibold rounded-full shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2"
            >
                Get Started
            </Button>
        </div>
      </div>
    </nav>
  );
}
