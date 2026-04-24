import { Mail, Instagram, Twitter, Smartphone, Apple, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer({ onAuthClick }: { onAuthClick?: () => void }) {
  return (
    <footer className="pt-32 pb-16 px-6 relative z-10">
      <div className="max-w-[1280px] mx-auto space-y-24">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 border-t border-white/5 pt-24">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <Logo />
            <p className="text-white/30 text-sm max-w-[240px] leading-relaxed font-medium">
              The modern standard for delightful community events.
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/discover" className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer">Discover</Link></li>
                <li><button onClick={onAuthClick} className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-left">Pricing</button></li>
                <li><a href="mailto:vuxevents@gmail.com" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Legal</h4>
              <ul className="space-y-4">
                <li><Link to="/terms" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/security" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Security</Link></li>
                <li><Link to="/dmca" className="text-sm font-bold text-white/40 hover:text-white transition-colors">DMCA</Link></li>
              </ul>
            </div>
          </div>

          {/* Social / App Column */}
          <div className="md:col-span-4 space-y-8 md:text-right">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Connect</h4>
            <div className="flex flex-wrap md:justify-end gap-6">
                <a href="mailto:vuxevents@gmail.com" className="text-white/40 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
                <a href="https://x.com/vuxevents" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="https://instagram.com/vuxevents" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="https://facebook.com/vuxevents" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:row items-center justify-center gap-4 text-center pt-8">
            <button 
                onClick={onAuthClick}
                className="group inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer"
            >
                Host your event with VUX Events 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest pt-4">
                © 2026 VUX EVENTS INC.
            </p>
        </div>
      </div>
    </footer>
  );
}
