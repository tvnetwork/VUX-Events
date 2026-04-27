import { Mail, Instagram, X, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer({ onAuthClick }: { onAuthClick?: () => void }) {
  return (
    <footer className="pt-48 pb-20 px-6 relative z-10 overflow-hidden">
      {/* Decorative background flash */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-500/5 blur-[200px] -z-10 rounded-full" />
      
      <div className="max-w-[1400px] mx-auto space-y-32">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20 md:gap-8 border-t border-white/[0.03] pt-32">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-10">
            <Logo />
            <p className="text-white/70 text-lg max-w-[320px] leading-relaxed font-bold italic uppercase tracking-wider">
              The modern platform for high-impact community events.
            </p>
            <div className="flex items-center gap-6 pt-4 text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500/40">
                <div className="w-12 h-px bg-indigo-500/20" />
                <span>VUX EVENTS</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-12">
            <div className="space-y-10">
              <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-white/70">Product</h4>
              <ul className="space-y-6">
                <li><Link to="/discover" className="text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-indigo-400 transition-all cursor-pointer">Explore</Link></li>
                <li><Link to="/pricing" className="text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-indigo-400 transition-all cursor-pointer">Pricing</Link></li>
                <li><Link to="/help" className="text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-indigo-400 transition-all">Support</Link></li>
              </ul>
            </div>
            <div className="space-y-10">
              <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-white/70">Company</h4>
              <ul className="space-y-6">
                <li><Link to="/terms" className="text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-indigo-400 transition-all">Terms</Link></li>
                <li><Link to="/privacy" className="text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-indigo-400 transition-all">Privacy</Link></li>
                <li><Link to="/security" className="text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-indigo-400 transition-all">Security</Link></li>
              </ul>
            </div>
          </div>

          {/* Social / App Column */}
          <div className="md:col-span-3 space-y-10 md:text-right">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-white/70">Connect</h4>
            <div className="flex flex-wrap md:justify-end gap-10">
                <a href="mailto:vuxevents@gmail.com" className="text-white/70 hover:text-indigo-400 transition-all" title="Email"><Mail className="w-6 h-6" /></a>
                <a href="https://x.com/vuxevents" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-indigo-400 transition-all" title="X (Twitter)"><X className="w-6 h-6" /></a>
                <a href="https://instagram.com/vuxevents" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-indigo-400 transition-all" title="Instagram"><Instagram className="w-6 h-6" /></a>
                <a href="https://vuxevents.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-indigo-400 transition-all" title="Website"><Globe className="w-6 h-6" /></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center pt-20 border-t border-white/[0.02]">
            <button 
                onClick={onAuthClick}
                className="group inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all cursor-pointer italic"
            >
                START HOSTING EVENTS 
                <span className="group-hover:translate-x-3 transition-transform text-indigo-500">→</span>
            </button>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] italic">
                © 2026 VUX EVENTS INC // ALL RIGHTS RESERVED
            </p>
        </div>
      </div>
    </footer>
  );
}
