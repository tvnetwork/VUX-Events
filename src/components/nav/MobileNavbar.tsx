import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LayoutGrid, Terminal, Shield, Sparkles, Compass, Ticket, ListOrdered, Code2 } from 'lucide-react';

export interface EcosystemApp {
  id: string;
  name: string;
  tagline: string;
  url: string;
  badge: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ECOSYSTEM_APPS: EcosystemApp[] = [
  {
    id: 'vux',
    name: 'VUX Events',
    tagline: 'Ticketing & Event Engine',
    url: 'https://vux.kontyra.name.ng',
    badge: 'Live',
    color: 'from-purple-500 to-indigo-600',
    icon: Sparkles,
  },
  {
    id: 'kontyra-account',
    name: 'Kontyra ID',
    tagline: 'Identity & SSO Gateway',
    url: 'https://account.kontyra.name.ng',
    badge: 'Auth',
    color: 'from-blue-500 to-cyan-600',
    icon: Shield,
  },
  {
    id: 'devos',
    name: 'DevOS',
    tagline: 'Cloud IDE & Execution Sandbox',
    url: 'https://devos.kontyra.name.ng',
    badge: 'Dev',
    color: 'from-emerald-500 to-teal-600',
    icon: Terminal,
  },
];

interface MobileNavbarProps {
  appName: string;
  ecosystemApps?: EcosystemApp[];
  onSignIn?: () => void;
  isAuthenticated: boolean;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({
  appName,
  ecosystemApps = ECOSYSTEM_APPS,
  onSignIn,
  isAuthenticated,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);

  return (
    <div className="md:hidden fixed top-0 left-0 w-full z-40 bg-zinc-950/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden bg-white/5 border border-white/10 shadow-lg">
            <img src="/logo.svg" alt={appName} className="w-5 h-5 object-contain" />
          </div>
          <span className="text-base font-extrabold tracking-widest text-white uppercase">{appName}</span>
        </Link>

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
              onClick={() => {
                setAppSwitcherOpen(!appSwitcherOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="p-2 text-zinc-300 hover:text-white bg-white/5 rounded-xl border border-white/10 active:scale-95 transition-all"
              title="Kontyra Ecosystem Apps"
            >
              <LayoutGrid className="w-4 h-4 text-blue-400" />
            </button>

            {appSwitcherOpen && (
              <div className="absolute right-0 top-full mt-2 w-[300px] rounded-2xl bg-zinc-950/98 border border-white/15 shadow-2xl backdrop-blur-2xl p-4 z-50">
                <div className="flex items-center justify-between px-1 pb-3 mb-2 border-b border-white/5">
                  <span className="text-[11px] font-mono uppercase font-bold text-zinc-300 tracking-wider">
                    Ecosystem Apps
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                  {ecosystemApps.map((app) => {
                    const Icon = app.icon;
                    return (
                      <a
                        key={app.id}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center text-white shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white truncate">{app.name}</p>
                            <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded bg-white/5 text-zinc-400">
                              {app.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 truncate">{app.tagline}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              if (appSwitcherOpen) setAppSwitcherOpen(false);
            }}
            className="p-2 text-white bg-white/5 rounded-xl border border-white/10 active:scale-95 transition-transform"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="px-4 py-3 border-t border-white/10 bg-zinc-950/95 space-y-2">
          <Link
            to="/discover"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Explore Events</span>
          </Link>
          <Link
            to="/tickets"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Ticket className="w-4 h-4 text-blue-400" />
            <span>My Tickets</span>
          </Link>
          <Link
            to="/waitlists"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ListOrdered className="w-4 h-4 text-amber-400" />
            <span>Waitlists</span>
          </Link>
          <Link
            to="/developer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Developer</span>
          </Link>
        </div>
      )}
    </div>
  );
};
