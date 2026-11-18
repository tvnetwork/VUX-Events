import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutGrid, ChevronRight, ExternalLink } from 'lucide-react';

interface EcosystemApp {
  id: string;
  name: string;
  tagline: string;
  url: string;
  badge: string;
  color: string;
  icon: React.ElementType;
}

interface MobileNavbarProps {
  appName: string;
  ecosystemApps: EcosystemApp[];
  onSignIn?: () => void;
  isAuthenticated: boolean;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({
  appName,
  ecosystemApps,
  onSignIn,
  isAuthenticated,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);

  return (
    <div className="md:hidden fixed top-0 left-0 w-full z-40 bg-zinc-950/80 backdrop-blur-2xl border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden bg-white/5 border border-white/10 shadow-lg">
          <img src="/logo.svg" alt={appName} className="w-5 h-5 object-contain" />
        </div>
        <span className="text-base font-extrabold tracking-widest text-white uppercase">{appName}</span>
      </div>

      <div className="flex items-center gap-2">
        {!isAuthenticated && onSignIn && (
          <button
            onClick={onSignIn}
            className="px-3 py-1.5 bg-white text-black font-bold text-xs rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Sign In
          </button>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setAppSwitcherOpen(!appSwitcherOpen)}
            className="p-2 text-zinc-300 hover:text-white bg-white/5 rounded-xl border border-white/10 active:scale-95 transition-all"
            title="Kontyra Ecosystem Apps"
          >
            <LayoutGrid className="w-4 h-4 text-blue-400" />
          </button>

          {appSwitcherOpen && (
            <div className="absolute right-0 top-full mt-2 w-[320px] rounded-3xl bg-zinc-950/98 border border-white/15 shadow-2xl backdrop-blur-2xl p-4 z-50">
              <div className="flex items-center justify-between px-1 pb-3 mb-2 border-b border-white/5">
                <span className="text-[11px] font-mono uppercase font-bold text-zinc-300 tracking-wider">
                  Ecosystem Apps
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {ecosystemApps.map((app) => {
                  const Icon = app.icon;
                  return (
                    <a
                      key={app.id}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center text-white shrink-0`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded bg-white/5 text-zinc-400">
                          {app.badge}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{app.name}</p>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white bg-white/5 rounded-xl border border-white/10 active:scale-95 transition-transform"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
