import { Mail, Instagram, X, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer({ onAuthClick }: { onAuthClick?: () => void }) {
  return (
    <footer className="pt-32 pb-16 px-6 relative z-10 overflow-hidden">
      {/* Decorative background flash */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-600/10 blur-[200px] -z-10 rounded-full" />
      
      <div className="max-w-[1400px] mx-auto space-y-20">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 border-t border-white/[0.08] pt-20">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <Logo />
            <p className="text-white/70 text-base max-w-[340px] leading-relaxed font-semibold">
              The modern platform for high-impact community events, seamless check-ins, and cryptographic ticketing.
            </p>
            <div className="flex items-center gap-4 pt-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">
                <div className="w-8 h-px bg-purple-500/30" />
                <span>VUX EVENTS</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/60">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/discover" className="text-xs font-semibold text-white/70 hover:text-purple-300 transition-colors">Explore Events</Link></li>
                <li><Link to="/pricing" className="text-xs font-semibold text-white/70 hover:text-purple-300 transition-colors">Pricing</Link></li>
                <li><Link to="/help" className="text-xs font-semibold text-white/70 hover:text-purple-300 transition-colors">Support Desk</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/60">Trust & Legal</h4>
              <ul className="space-y-4">
                <li><Link to="/terms" className="text-xs font-semibold text-white/70 hover:text-purple-300 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-xs font-semibold text-white/70 hover:text-purple-300 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/security" className="text-xs font-semibold text-white/70 hover:text-purple-300 transition-colors">Security & Passkeys</Link></li>
              </ul>
            </div>
          </div>

          {/* Connect Column */}
          <div className="md:col-span-3 space-y-6 md:text-right">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/60">Connect</h4>
            <div className="flex flex-wrap md:justify-end gap-5">
                <a href="mailto:vuxevents@gmail.com" className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/60 hover:text-purple-400 hover:border-purple-500/30 transition-all" title="Email"><Mail className="w-5 h-5" /></a>
                <a href="https://x.com/vuxevents" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/60 hover:text-purple-400 hover:border-purple-500/30 transition-all" title="X (Twitter)"><X className="w-5 h-5" /></a>
                <a href="https://instagram.com/vuxevents" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/60 hover:text-purple-400 hover:border-purple-500/30 transition-all" title="Instagram"><Instagram className="w-5 h-5" /></a>
                <a href="https://vuxevents.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/60 hover:text-purple-400 hover:border-purple-500/30 transition-all" title="Website"><Globe className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center pt-8 border-t border-white/[0.04]">
            <button 
                onClick={onAuthClick}
                className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-purple-300 hover:text-white transition-all cursor-pointer"
            >
                Start Hosting Events 
                <span className="group-hover:translate-x-1.5 transition-transform text-purple-400">→</span>
            </button>
            <p className="text-[11px] font-medium text-white/40 tracking-wider">
                © 2026 VUX EVENTS INC. ALL RIGHTS RESERVED.
            </p>
        </div>
      </div>
    </footer>
  );
}
