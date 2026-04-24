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
      "fixed top-0 inset-x-0 z-[60] transition-all duration-300 px-6",
      scrolled ? "py-4 bg-[#0b0b0f]/80 backdrop-blur-md border-b border-white/5 shadow-2xl" : "py-8 bg-transparent"
    )}>
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* Center - Links (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/discover" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Explore Events</Link>
          <a href="#" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Calendars</a>
          <a href="#" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Pricing</a>
        </div>

        {/* Auth CTA */}
        <div className="flex items-center gap-2">
            <Button 
                onClick={onAuthClick}
                className="px-6 font-bold bg-white text-black hover:bg-white/90 rounded-xl shadow-lg shadow-white/5"
            >
                Sign In
            </Button>
        </div>
      </div>
    </nav>
  );
}
