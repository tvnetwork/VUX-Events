import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Search, Bell, Plus, User, LogOut, Settings as SettingsIcon, Shield, Menu, X, LayoutDashboard, Compass, Settings2, ShieldCheck, UserCircle, LucideIcon, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { cn } from '../lib/utils';
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
      {/* Mobile Menu Button - Fixed Top */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 bg-[#07070a]/90 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4">
        <Logo size="sm" />
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-[#07070a]/60 backdrop-blur-2xl border-r border-white/5 transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col",
        showMobileMenu ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center px-6 border-b border-white/5 mt-16 md:mt-0 cursor-pointer" onClick={() => navigateTo('/')}>
          <Logo size="sm" />
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
             const Icon = item.icon;
             // Check if exactly matching or if it's the root path.
             const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
             return (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative',
                  isActive 
                      ? 'bg-indigo-500/10 text-indigo-400' 
                      : 'text-white/60 hover:bg-white/[0.03] hover:text-white'
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "text-white/40 group-hover:text-white/60")} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full"
                  />
                )}
              </button>
             );
          })}
        </div>

        <div className="p-4 border-t border-white/5 space-y-4">
          <Button 
            onClick={onCreateClick}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white border-0 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>

          {profile ? (
            <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors text-left"
                >
                    <Avatar seed={profile.email || 'user'} size="sm" />
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
                      className="absolute bottom-full left-0 mb-2 w-full glass rounded-2xl border border-white/10 shadow-2xl py-2 z-50 bg-[#07070a]/90 backdrop-blur-xl"
                    >
                      <button
                        onClick={() => navigateTo('/profile')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" /> Profile Details
                      </button>
                      <button
                        onClick={() => navigateTo('/settings')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4" /> Preferences
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
