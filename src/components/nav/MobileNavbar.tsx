import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSafeAvatarUrl } from '../../lib/utils';
import {
  Menu,
  X,
  LayoutGrid,
  ChevronRight,
  ExternalLink,
  User as UserIcon,
  LogOut,
  Terminal,
  ShieldCheck,
  BookOpen,
  Feather,
  Sparkles,
  Zap,
  Activity,
  Building2,
  Compass,
  Ticket,
  ListOrdered,
  Code2,
  LayoutDashboard,
  Settings2,
} from 'lucide-react';

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
    id: 'accounts',
    name: 'Kontyra Accounts',
    tagline: 'Single Sign-On, Passkeys & Cloud ID',
    url: 'https://accounts.kontyra.name.ng',
    badge: 'Identity',
    color: 'from-emerald-500 to-teal-700',
    icon: ShieldCheck,
  },
  {
    id: 'devos',
    name: 'DevOS Platform',
    tagline: 'Cloud Code Sandboxes & DevOS Execution',
    url: 'https://devos.kontyra.name.ng',
    badge: 'Cloud IDE',
    color: 'from-blue-600 to-indigo-700',
    icon: Terminal,
  },
  {
    id: 'reastudia',
    name: 'REASTUDIA',
    tagline: 'Serialized Web Novels & Reading Sanctuary',
    url: 'https://reastudia.kontyra.name.ng',
    badge: 'Reading',
    color: 'from-amber-500 to-yellow-600',
    icon: BookOpen,
  },
  {
    id: 'novelora',
    name: 'Novelora',
    tagline: 'Literary Publishing & Author Studio',
    url: 'https://novelora.kontyra.name.ng',
    badge: 'Studio',
    color: 'from-amber-600 to-yellow-700',
    icon: Feather,
  },
  {
    id: 'kora',
    name: 'Kora AI',
    tagline: 'Neural Agent & Model Intelligence',
    url: 'https://kora.kontyra.name.ng',
    badge: 'AI Agent',
    color: 'from-purple-600 to-pink-600',
    icon: Sparkles,
  },
  {
    id: 'vux',
    name: 'VUX Events',
    tagline: 'Developer Summits, Community & Tickets',
    url: 'https://vux.kontyra.name.ng',
    badge: 'Events',
    color: 'from-pink-500 to-rose-600',
    icon: Zap,
  },
  {
    id: 'api',
    name: 'Platform Gateway',
    tagline: 'High-Throughput REST Engine & OAuth',
    url: 'https://api.kontyra.name.ng',
    badge: 'API v1',
    color: 'from-cyan-500 to-blue-600',
    icon: Activity,
  },
  {
    id: 'docs',
    name: 'Documentation',
    tagline: 'API Reference, SDK Guides & Manuals',
    url: 'https://docs.kontyra.name.ng',
    badge: 'Docs',
    color: 'from-zinc-700 to-zinc-900',
    icon: BookOpen,
  },
  {
    id: 'blog',
    name: 'Engineering Blog',
    tagline: 'Architecture, Releases & Systems',
    url: 'https://blog.kontyra.name.ng',
    badge: 'Blog',
    color: 'from-amber-500 to-yellow-600',
    icon: Building2,
  },
];

export interface MobileNavbarProps {
  appName?: string;
  appBadge?: string;
  accentColor?: string;
  ecosystemApps?: EcosystemApp[];
  user?: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  isAuthenticated: boolean;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({
  appName = 'VUX',
  appBadge = 'Events',
  accentColor = '#E60082',
  ecosystemApps = ECOSYSTEM_APPS,
  user,
  onSignIn,
  onSignOut,
  isAuthenticated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close app switcher on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setAppSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Explore Events', path: '/discover', icon: Compass },
    { label: 'My Tickets', path: '/tickets', icon: Ticket },
    { label: 'Waitlists', path: '/waitlists', icon: ListOrdered },
    { label: 'Settings', path: '/settings', icon: Settings2 },
    { label: 'Developer API', path: '/developer', icon: Code2 },
  ];

  return (
    <>
      {/* Kontyra Standard 08: 56px Mobile Header Bar (< 768px) */}
      <header className="md:hidden sticky top-0 z-40 h-14 w-full bg-black/85 backdrop-blur-xl border-b border-white/[0.08] px-4 flex items-center justify-between">
        {/* Brand Lockup */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden bg-white/5 border border-white/10 shadow-lg">
            <img src="/logo.svg" alt={appName} className="w-5 h-5 object-contain" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold tracking-wider text-white uppercase">{appName}</span>
            {appBadge && (
              <span
                className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md border"
                style={{
                  color: accentColor,
                  borderColor: `${accentColor}33`,
                  backgroundColor: `${accentColor}15`,
                }}
              >
                {appBadge}
              </span>
            )}
          </div>
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {!isAuthenticated && onSignIn && (
            <button
              onClick={onSignIn}
              className="px-3 py-1.5 bg-white text-black font-bold text-xs rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Sign In
            </button>
          )}

          {/* 9-Dot Bento App Switcher */}
          <div className="relative" ref={switcherRef}>
            <button
              type="button"
              onClick={() => {
                setAppSwitcherOpen(!appSwitcherOpen);
                if (isOpen) setIsOpen(false);
              }}
              className="p-2 text-zinc-300 hover:text-white bg-white/5 rounded-xl border border-white/10 active:scale-95 transition-all"
              title="Kontyra Ecosystem Apps"
            >
              <LayoutGrid className="w-4 h-4 text-zinc-300" />
            </button>

            {appSwitcherOpen && (
              <div className="absolute right-0 top-full mt-2 w-[320px] rounded-2xl bg-zinc-950/98 border border-white/15 shadow-2xl backdrop-blur-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-1 pb-3 mb-2 border-b border-white/5">
                  <span className="text-[11px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
                    Kontyra Ecosystem
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                    Live
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[340px] overflow-y-auto">
                  {ecosystemApps.map((app) => {
                    const Icon = app.icon;
                    const isCurrent = app.id === 'vux';
                    return (
                      <a
                        key={app.id}
                        href={app.url}
                        target={isCurrent ? undefined : '_blank'}
                        rel={isCurrent ? undefined : 'noopener noreferrer'}
                        onClick={() => setAppSwitcherOpen(false)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-white/10 border-white/20'
                            : 'bg-white/[0.02] hover:bg-white/[0.08] border-white/5'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center text-white shrink-0`}
                        >
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
                        <ExternalLink className="w-3 h-3 text-zinc-600 shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Asymmetric Pulse Dash Menu Trigger */}
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              if (appSwitcherOpen) setAppSwitcherOpen(false);
            }}
            className="p-2 rounded-xl text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            aria-label={isOpen ? "Close navigation drawer" : "Open navigation drawer"}
          >
            {isOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <div className="w-6 h-5 flex flex-col justify-center items-end gap-1.5 group">
                <span className="w-5 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-6" />
                <span className="w-3.5 h-[2px] rounded-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-300 group-hover:w-5 relative">
                  <span className="absolute -left-1.5 -top-[2px] w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
                </span>
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Vercel-Style Bottom-Sheet Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet Body */}
          <div className="relative w-full max-h-[85vh] bg-[#07090e]/95 backdrop-blur-2xl border-t border-white/15 rounded-t-[32px] overflow-y-auto shadow-2xl p-6 pb-12 flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-white/20 hover:bg-white/30 rounded-full mx-auto mb-6 shrink-0" />

            {/* Top Row */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5">
                  <img src="/logo.svg" alt={appName} className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-white uppercase tracking-wider">{appName}</span>
                  <span className="text-[10px] text-zinc-400 block -mt-0.5">Kontyra Ecosystem</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="py-4 space-y-2">
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider px-1">
                Navigation
              </p>
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                          : 'text-zinc-300 hover:text-white bg-white/[0.02] hover:bg-white/5 border border-white/5'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-white/5 shrink-0">
                        <Icon
                          className="w-4 h-4"
                          style={{ color: isActive ? accentColor : undefined }}
                        />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Ecosystem Portals Quick Access */}
            <div className="py-3 space-y-2 border-t border-white/10">
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider px-1">
                Kontyra Portals
              </p>
              <div className="grid grid-cols-2 gap-2">
                {apps.slice(0, 4).map((app) => (
                  <a
                    key={app.id}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <img src={app.icon} alt={app.name} className="w-3.5 h-3.5 object-contain" />
                      </div>
                      <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white truncate">
                        {app.name}
                      </span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Bottom User / Session Section */}
            <div className="pt-4 mt-auto border-t border-white/10 shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                      {user?.avatarUrl ? (
                        <img 
                          src={getSafeAvatarUrl(user.avatarUrl, user.name || 'User')} 
                          alt={user.name || 'User'} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getSafeAvatarUrl(null, user.name || 'User');
                          }}
                        />
                      ) : (
                        <UserIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user?.name || 'Kontyra User'}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  {onSignOut && (
                    <button
                      onClick={() => {
                        onSignOut();
                        setIsOpen(false);
                      }}
                      className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-colors shrink-0"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                onSignIn && (
                  <button
                    onClick={() => {
                      onSignIn();
                      setIsOpen(false);
                    }}
                    className="w-full py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors shadow-lg"
                  >
                    Sign In with Kontyra
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
