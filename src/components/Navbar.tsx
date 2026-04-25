/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Search, Bell, Plus, User, LogOut, Settings as SettingsIcon, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { cn } from '../lib/utils';
import { Logo } from './Logo';
import { getAvatarUrl } from '../lib/utils';

export function Navbar({ activeTab, onTabChange, onSearchClick, onCreateClick, onLoginClick }: { 
  activeTab: string; 
  onTabChange: (tab: any) => void;
  onSearchClick: () => void;
  onCreateClick: () => void;
  onLoginClick?: () => void;
}) {
  const { profile, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isAdmin = profile?.email?.toLowerCase() === 'oladoyeheritage445@gmail.com'.toLowerCase();

  const navItems = [
    { id: 'events', label: 'ROADMAP' },
    { id: 'calendars', label: 'CALENDARS' },
    { id: 'discover', label: 'DIRECTORY' },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'ADMIN' });
  }

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/5 h-20 flex items-center justify-center px-4 lg:px-8">
      <div className="max-w-[1280px] w-full flex items-center justify-between">
        {/* Left: Logo */}
        <div className="cursor-pointer" onClick={() => onTabChange('events')}>
          <Logo className="gap-2 sm:gap-4" />
        </div>

        {/* Center: Navigation */}
        <div className="hidden md:flex items-center gap-2 h-full relative bg-white/[0.02] p-1 rounded-2xl border border-white/5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'relative px-5 py-2 text-[10px] font-bold tracking-[0.2em] transition-all rounded-xl',
                activeTab === item.id 
                    ? 'text-white bg-white/10 shadow-lg' 
                    : 'text-white/30 hover:text-white/60'
              )}
            >
              {item.label}
              {activeTab === item.id && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1 bg-white/[0.02] p-1 rounded-2xl border border-white/5">
            <Button variant="ghost" size="icon" onClick={onSearchClick} className="text-white/40 hover:text-white h-9 w-9">
                <Search className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white h-9 w-9 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            </Button>
          </div>

          <Button variant="primary" size="sm" onClick={onCreateClick} className="hidden lg:flex gap-2 h-9 rounded-xl text-xs font-bold px-5 shadow-xl shadow-purple-500/10">
            <Plus className="w-4 h-4" />
            <span>CREATE</span>
          </Button>

          <div className="relative pl-2 sm:pl-4 border-l border-white/5 h-10 flex items-center">
            {profile ? (
              <>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="focus:outline-none transition-transform active:scale-95 flex items-center gap-3 group"
                >
                  <div className="hidden xl:block text-right">
                      <p className="text-xs font-bold leading-none mb-1 group-hover:text-purple-300 transition-colors">{profile?.displayName?.split(' ')[0]}</p>
                      <p className="text-[10px] font-bold text-white/20 tracking-widest leading-none">VERIFIED</p>
                  </div>
                  <div className="relative">
                      <Avatar 
                        src={profile?.photoURL || getAvatarUrl(profile?.uid)} 
                        size="md"
                        className="ring-2 ring-white/5 group-hover:ring-purple-500/50 transition-all duration-300"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0b0b0f] rounded-full" />
                  </div>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0" onClick={() => setShowProfileMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 glass border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden"
                      >
                        <div className="px-3 py-2 mb-2 border-b border-white/5">
                          <p className="text-sm font-bold truncate">{profile?.displayName}</p>
                          <p className="text-xs text-white/40 truncate">{profile?.email}</p>
                        </div>
                        
                        <button 
                          onClick={() => { onTabChange('settings'); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 p-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </button>
                        
                        <button 
                          onClick={() => { onTabChange('settings'); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 p-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <SettingsIcon className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        
                        {isAdmin && (
                          <button 
                            onClick={() => { onTabChange('admin'); setShowProfileMenu(false); }}
                            className="w-full flex items-center gap-3 p-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl transition-colors mt-1 border-t border-white/5"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Admin Station</span>
                          </button>
                        )}
                        
                        <button 
                          onClick={() => { logout(); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 p-2 text-sm text-pink-400 hover:bg-pink-500/5 rounded-xl transition-colors mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={onLoginClick} 
                className="h-10 rounded-xl px-6 text-xs font-bold shadow-lg shadow-purple-500/10"
              >
                LOGIN
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
