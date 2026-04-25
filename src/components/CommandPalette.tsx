/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, Compass, Settings, Plus, X, Command } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types';
import { cn } from '../lib/utils';

export function CommandPalette({ isOpen, onClose, onTabChange, onCreateClick }: {
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: any) => void;
  onCreateClick: () => void;
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // Toggle
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!search) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'events'),
          where('status', '==', 'published'),
          limit(5)
        );
        const snap = await getDocs(q);
        const events = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Event))
          .filter(e => (e.title || '').toLowerCase().includes((search || '').toLowerCase()));
        setResults(events);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#0b0b0f]/60 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="glass w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center p-4 border-b border-white/5">
            <Search className="w-5 h-5 text-white/30 mr-3" />
            <input
              autoFocus
              placeholder="Search events, commands..."
              className="bg-transparent border-none outline-none text-lg flex-1 text-white placeholder:text-white/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex items-center gap-1 glass px-2 py-1 rounded-md text-[10px] font-bold text-white/40">
              <Command className="w-3 h-3" />
              <span>ESC</span>
            </div>
          </div>

          <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {search ? (
              <div className="space-y-4 p-2">
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 px-2">Results</p>
                {results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map(event => (
                      <button
                        key={event.id}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-left transition-colors group"
                        onClick={() => { onTabChange('events'); onClose(); }}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                          <img src={event.coverImageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate text-white">{event.title}</p>
                          <p className="text-xs text-white/40 truncate">{event.location}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <Search className="w-8 h-8 text-white/5 mx-auto" />
                    <p className="text-sm text-white/30">No matching events found.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 p-2">
                <section className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 px-2 leading-none mb-4">Shortcuts</p>
                  <CommandItem 
                    icon={<Plus className="w-4 h-4" />} 
                    label="Create Event" 
                    shortcut="C"
                    onClick={() => { onCreateClick(); onClose(); }} 
                  />
                  <CommandItem 
                    icon={<Compass className="w-4 h-4" />} 
                    label="Discover Communities" 
                    shortcut="D"
                    onClick={() => { onTabChange('discover'); onClose(); }} 
                  />
                  <CommandItem 
                    icon={<Calendar className="w-4 h-4" />} 
                    label="View My Events" 
                    shortcut="E"
                    onClick={() => { onTabChange('events'); onClose(); }} 
                  />
                  <CommandItem 
                    icon={<Settings className="w-4 h-4" />} 
                    label="Open Settings" 
                    shortcut="S"
                    onClick={() => { onTabChange('settings'); onClose(); }} 
                  />
                </section>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CommandItem({ icon, label, shortcut, onClick }: { icon: React.ReactNode, label: string, shortcut?: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{label}</span>
      </div>
      {shortcut && (
        <span className="text-[10px] font-bold text-white/20 glass px-2 py-0.5 rounded-md">{shortcut}</span>
      )}
    </button>
  );
}
