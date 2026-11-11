import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Search, Bell, Plus, User, LogOut, Settings as SettingsIcon, Shield, Menu, X, LayoutDashboard, Compass, Settings2, ShieldCheck, UserCircle, LucideIcon, Code2, ListOrdered } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { cn, getAvatarUrl } from '../lib/utils';
import { Logo } from './Logo';
import { useLocation, useNavigate } from 'react-router-dom';

export function Sidebar({ onSearchClick, onCreateClick, onLoginClick }: { 
  onSearchClick: () => void;
  onCreateClick: () => void;
  onLoginClick?: () => void;
}) {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isAdmin = profile?.email?.toLowerCase() === 'oladoyeheritage445@gmail.com'.toLowerCase();

  const navItems: { path: string; label: string; icon: LucideIcon }[] = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/discover', label: 'Explore', icon: Compass },
    { path: '/waitlists', label: 'Waitlists', icon: ListOrdered },
    { path: '/profile', label: 'Profile', icon: UserCircle },
    { path: '/settings', label: 'Settings', icon: Settings2 },
    { path: '/developer', label: 'Developer', icon: Code2 },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: ShieldCheck });
  }

  const navigateTo = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
    setShowProfileMenu(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed Top (56px Kontyra Standard) */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-black/85 backdrop-blur-xl border-b border-white/[0.08] z-50 flex items-center justify-between px-4">
        <Logo size="sm" />
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-black/80 backdrop-blur-xl border-r border-white/[0.08] transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col",
        showMobileMenu ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-white/[0.08] mt-14 md:mt-0 cursor-pointer" onClick={() => navigateTo('/')}>
          <Logo size="sm" />
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
             const Icon = item.icon;
             // Check if exactly matching or if it's the root path.
             const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
             return (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  isActive 
                      ? 'bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/25 shadow-sm shadow-purple-500/10' 
                      : 'text-white/60 hover:bg-white/[0.04] hover:text-white border border-transparent'
                )}
              >
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-purple-400" : "text-white/40 group-hover:text-white/70")} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-purple-500 rounded-r-full shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                  />
                )}
              </button>
             );
          })}
        </div>

        <div className="p-4 border-t border-white/[0.08] space-y-3">
          <Button 
            variant="vux"
            onClick={onCreateClick}
            className="w-full shadow-lg shadow-purple-600/25 font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>

          {profile ? (
            <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors text-left border border-white/[0.04] hover:border-white/[0.08]"
                >
                    <Avatar 
                      src={profile.photoURL || getAvatarUrl(profile.email || 'user')} 
                      fallback={getAvatarUrl(profile.email || 'user')} 
                      size="sm" 
                    />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{profile.displayName || 'User'}</div>
                        <div className="text-xs text-white/40 truncate">{profile.email}</div>
                    </div>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-0 mb-2 w-full glass rounded-2xl border border-white/10 shadow-2xl py-2 z-50 bg-[#09090b]/95 backdrop-blur-xl"
                    >
                      <button
                        onClick={() => navigateTo('/profile')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4 text-purple-400" /> Profile Details
                      </button>
                      <button
                        onClick={() => navigateTo('/settings')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4 text-purple-400" /> Preferences
                      </button>
                      <div className="h-px bg-white/5 my-1" />
                      <button
                        onClick={() => { logout(); setShowProfileMenu(false); navigateTo('/'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          ) : (
            <Button variant="vux" className="w-full" onClick={onLoginClick}>Sign In</Button>
          )}
        </div>
      </nav>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
            className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
    </>
  );
}
