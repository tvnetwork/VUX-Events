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
      "fixed top-0 inset-x-0 z-[60] transition-all duration-500 px-6",
      scrolled ? "py-4 bg-[#0b0b0f]/80 backdrop-blur-xl border-b border-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.5)]" : "py-10 bg-transparent"
    )}>
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="hover:scale-105 transition-transform">
          <Logo />
        </Link>

        {/* Center - Links */}
        <div className="hidden md:flex items-center gap-12">
          <Link to="/discover" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-indigo-400 transition-all">Explore</Link>
          <Link to="/upgrade" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-indigo-400 transition-all">Features</Link>
          <Link to="/pricing" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-indigo-400 transition-all">Pricing</Link>
        </div>

        {/* Auth CTA */}
        <div className="flex items-center gap-4">
            <Button 
                variant="vux"
                onClick={onAuthClick}
                className="px-10 h-14 text-sm font-black italic tracking-tighter uppercase rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/10"
            >
                Login
            </Button>
        </div>
      </div>
    </nav>
  );
}
