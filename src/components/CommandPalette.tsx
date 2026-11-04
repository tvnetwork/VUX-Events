/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, Compass, Settings, Plus, X, Command, Sparkles } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types';
import { cn } from '../lib/utils';

export function CommandPalette({
  isOpen,
  onClose,
  onSelectEvent,
  onTabChange,
  onCreateClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent?: (event: Event) => void;
  onTabChange?: (tab: any) => void;
  onCreateClick?: () => void;
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'events'),
          where('status', '==', 'published'),
          limit(6)
        );
        const snap = await getDocs(q);
        const events = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Event))
          .filter(e => {
            const searchLower = (search || '').toLowerCase();
            const titleMatch = (e.title || '').toLowerCase().includes(searchLower);
            const tagMatch = (e.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
            return titleMatch || tagMatch;
          });
        setResults(events);
      } catch (e) {
        console.error('Command search error:', e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-3 sm:pt-[12vh] px-3 sm:px-4 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#07080f]/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl bg-[#0c0e17]/95 border border-white/[0.08] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden z-10 flex flex-col max-h-[85dvh] sm:max-h-[70vh]"
        >
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3 sm:py-3.5 border-b border-white/[0.06] shrink-0 gap-3">
            <Search className="w-5 h-5 text-zinc-400 shrink-0" />
            <input
              autoFocus
              placeholder="Search events, organizers, shortcuts..."
              className="bg-transparent border-none outline-none text-sm sm:text-base flex-1 text-white placeholder:text-zinc-500 font-normal"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[11px] font-mono text-zinc-400">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results / Navigation Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-3 space-y-3">
            {search ? (
              <div className="space-y-2">
                <div className="px-2 pt-1 text-[11px] uppercase font-semibold tracking-wider text-zinc-500">
                  {loading ? 'Searching...' : `Results (${results.length})`}
                </div>
                {results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => {
                          if (onSelectEvent) {
                            onSelectEvent(event);
                          } else if (onTabChange) {
                            onTabChange('events');
                          }
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] text-left transition-colors group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-white/5">
                          {event.coverImageUrl ? (
                            <img src={event.coverImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                              <Calendar className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-white group-hover:text-blue-400 transition-colors">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400 truncate">
                            <span>{event.location || 'Virtual'}</span>
                            {event.tags?.[0] && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                {event.tags[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  !loading && (
                    <div className="py-8 text-center space-y-1.5">
                      <Search className="w-7 h-7 text-zinc-600 mx-auto" />
                      <p className="text-sm text-zinc-400">No events found matching "{search}"</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-2 pt-1 text-[11px] uppercase font-semibold tracking-wider text-zinc-500">
                  Quick Actions
                </div>
                <div className="space-y-1">
                  <CommandItem
                    icon={<Plus className="w-4 h-4 text-blue-400" />}
                    label="Create New Event"
                    shortcut="C"
                    onClick={() => {
                      onCreateClick?.();
                      onClose();
                    }}
                  />
                  <CommandItem
                    icon={<Compass className="w-4 h-4 text-indigo-400" />}
                    label="Discover Communities & Events"
                    shortcut="D"
                    onClick={() => {
                      onTabChange?.('discover');
                      onClose();
                    }}
                  />
                  <CommandItem
                    icon={<Calendar className="w-4 h-4 text-emerald-400" />}
                    label="My Events & Passes"
                    shortcut="E"
                    onClick={() => {
                      onTabChange?.('events');
                      onClose();
                    }}
                  />
                  <CommandItem
                    icon={<Settings className="w-4 h-4 text-zinc-400" />}
                    label="Account Settings & Security"
                    shortcut="S"
                    onClick={() => {
                      onTabChange?.('settings');
                      onClose();
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function CommandItem({
  icon,
  label,
  shortcut,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors group cursor-pointer text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="text-xs sm:text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
          {label}
        </span>
      </div>
      {shortcut && (
        <span className="hidden sm:inline-block text-[11px] font-mono font-medium text-zinc-500 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-md">
          {shortcut}
        </span>
      )}
    </button>
  );
}
