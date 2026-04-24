/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Search, Bell, Plus, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

export function Navbar({ activeTab, onTabChange, onSearchClick, onCreateClick }: { 
  activeTab: string; 
  onTabChange: (tab: any) => void;
  onSearchClick: () => void;
  onCreateClick: () => void;
}) {
  const { profile, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { id: 'events', label: 'Events' },
    { id: 'calendars', label: 'Calendars' },
    { id: 'discover', label: 'Discover' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/5 h-16 flex items-center justify-center px-4 lg:px-8">
      <div className="max-w-[1280px] w-full flex items-center justify-between">
        {/* Left: Logo */}
        <div className="cursor-pointer" onClick={() => onTabChange('events')}>
          <Logo className="gap-2 sm:gap-3" />
        </div>

        {/* Center: Navigation */}
        <div className="flex items-center gap-1 sm:gap-4 h-full relative">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'relative px-4 py-2 text-sm font-medium transition-colors',
                activeTab === item.id ? 'text-white' : 'text-white/50 hover:text-white'
              )}
            >
              {item.label}
              {activeTab === item.id && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-white rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={onSearchClick} className="text-white/70">
            <Search className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-white/70 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-[#1a1023]" />
          </Button>

          <Button variant="primary" size="sm" onClick={onCreateClick} className="hidden sm:flex gap-2">
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </Button>

          <div className="relative ml-2">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="focus:outline-none transition-transform active:scale-95"
            >
              <Avatar 
                src={profile?.photoURL || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${profile?.uid}&backgroundColor=c084fc`} 
                size="md"
              />
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
          </div>
        </div>
      </div>
    </nav>
  );
}
