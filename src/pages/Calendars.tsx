/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../AuthContext';
import { Event } from '../types';
import { Calendar as CalendarIcon, Plus, Sparkles, Box, ArrowRight, Settings, Info, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';

export function Calendars({ onEditEvent, onTabChange }: { onEditEvent?: (e: Event) => void, onTabChange?: (tab: 'events' | 'calendars' | 'discover' | 'settings' | 'admin') => void }) {
  const { user, profile } = useAuth();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [suggestedEvents, setSuggestedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (!user) return;

    // My hosted events
    const qMy = query(collection(db, 'events'), where('hostId', '==', user.uid), limit(10));
    const unsubMy = onSnapshot(qMy, (snap) => {
      setMyEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    }, (error) => {
      console.error('Calendars unsubMy error:', error);
    });

    // Suggested events (just some public ones)
    const qSug = query(collection(db, 'events'), limit(8));
    const unsubSug = onSnapshot(qSug, (snap) => {
      setSuggestedEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
      setLoading(false);
    }, (error) => {
      console.error('Calendars unsubSug error:', error);
      setLoading(false);
    });

    return () => {
      unsubMy();
      unsubSug();
    };
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto space-y-24 animate-in fade-in duration-1000 pb-32">
      <header className="relative py-16 px-4 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-purple-500">
              <div className="w-10 h-px bg-purple-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">My Dashboard</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter leading-[0.8] uppercase flex flex-col">
            <span>MY</span>
            <span className="text-white/20">ACTIVITY</span>
          </h1>
          <p className="text-white/40 max-w-sm text-sm font-medium leading-relaxed italic border-l border-white/10 pl-6">
            Manage your events and schedule here. You are currently hosting {myEvents.length} events.
          </p>
        </div>

        <div className="flex items-center gap-6 p-8 rounded-[40px] bg-white/[0.01] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Profile</p>
                <div className="text-xl font-black italic tracking-tighter uppercase whitespace-nowrap">{profile?.displayName || 'Traveler'}</div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest italic">Status: Active</span>
                </div>
            </div>
            <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white/20 group-hover:rotate-90 group-hover:text-white transition-all duration-700" />
            </div>
        </div>
      </header>

      <section className="space-y-12">
        <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                <Box className="w-5 h-5 text-purple-400" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">MY HOSTED EVENTS</h2>
            </div>
            <div className="h-px flex-1 bg-white/5 ml-8" />
        </div>
        
        {myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
            {myEvents.map((event, i) => (
                <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <Card className="p-0 flex flex-col sm:flex-row items-stretch cursor-pointer border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10 transition-all group rounded-[40px] overflow-hidden shadow-2xl">
                        <div className="w-full sm:w-48 h-48 sm:h-auto overflow-hidden relative grayscale-[0.6] group-hover:grayscale-0 transition-all duration-1000">
                            <img src={event.coverImageUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                        </div>
                        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between gap-8">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-purple-600/10 text-purple-400 border-none text-[8px] font-black tracking-widest px-3 py-1 uppercase italic">{event.category}</Badge>
                                </div>
                                <h4 className="font-black italic text-2xl tracking-tighter truncate text-white uppercase group-hover:text-purple-400 transition-colors">{event.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                                    <span>LOCATION</span>
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                    <span>{formatDate(event.date, { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black italic tracking-widest text-white/20 uppercase truncate max-w-[120px]">{event.location}</p>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditEvent?.(event);
                                    }}
                                    className="h-10 px-6 rounded-2xl text-[9px] font-black uppercase tracking-widest border-white/10 group-hover:bg-white group-hover:text-black transition-all"
                                >
                                    Edit Event
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
            </div>
        ) : (
            <div className="px-4">
                <Card className="py-32 border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center space-y-10 rounded-[4rem]">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-[3rem] bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/1) group-hover:rotate-12 transition-transform duration-700">
                            <CalendarIcon className="w-12 h-12 text-white/5" />
                        </div>
                        <div className="absolute inset-0 blur-3xl bg-purple-500/10 rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter">NO EVENTS YET</h3>
                        <p className="text-white/20 max-w-xs mx-auto text-sm font-medium leading-relaxed italic">
                            You haven't created any events yet. Start hosting today to build your community.
                        </p>
                    </div>
                    <Button className="h-16 px-12 rounded-2xl shadow-2xl shadow-purple-500/20 text-[10px] font-black uppercase tracking-[0.3em] gap-3 bg-purple-600 hover:bg-purple-500 border-none">
                        <Plus className="w-5 h-5" />
                        Create an Event
                    </Button>
                </Card>
            </div>
        )}
      </section>
      
      {suggestedEvents.length > 0 && (
        <section className="space-y-12">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">RECOMMENDED FOR YOU</h2>
            </div>
            <div className="h-px flex-1 bg-white/5 ml-8" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            {suggestedEvents.map((event, i) => (
              <motion.div key={event.id} whileHover={{ y: -8 }}>
                <Card className="p-5 flex flex-col gap-6 cursor-pointer group bg-white/[0.01] border-white/5 hover:bg-white/[0.03] transition-all rounded-[32px] shadow-2xl">
                    <div className="aspect-square rounded-3xl overflow-hidden relative">
                    <img src={event.coverImageUrl} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 brightness-[0.4] group-hover:brightness-100" />
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-black/40 backdrop-blur-md border-white/10 text-[9px] font-black italic tracking-[0.2em] px-3 py-1 rounded-xl uppercase">
                            SCANNED
                        </Badge>
                    </div>
                    </div>
                    <div className="space-y-1 flex-1 px-2">
                    <h4 className="font-black italic text-lg tracking-tighter truncate group-hover:text-purple-400 transition-colors uppercase leading-none">{event.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest italic group-hover:text-white/40 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        <span>{event.location}</span>
                    </div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full text-xs font-black italic uppercase tracking-widest h-12 rounded-2xl bg-white/[0.02] group-hover:bg-white group-hover:text-black transition-all border border-white/5">
                        View Event
                    </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Grid Utility Footer */}
      <footer className="px-4">
         <div className="p-12 rounded-[48px] bg-white/[0.01] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center shadow-inner">
                  <Info className="w-7 h-7 text-purple-500" />
               </div>
               <div className="space-y-1">
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">COMMUNITY GUIDELINES</h4>
                  <p className="text-xs text-white/30 font-medium italic">Discover established communities or start your own to scale your presence.</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <Button 
                variant="ghost" 
                onClick={() => setShowStats(!showStats)}
                className={cn(
                  "h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5",
                  showStats && "bg-white/10 text-purple-400 border-purple-500/20"
                )}
               >
                 {showStats ? 'Close Summary' : 'Stats'}
               </Button>
               <Button 
                onClick={() => onTabChange?.('discover')}
                className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-white/90 group"
               >
                  <span>Find Communities</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
               </Button>
            </div>
         </div>

         {showStats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { label: 'Events Hosted', value: myEvents.length, icon: CalendarIcon },
                { label: 'Total Scanned', value: suggestedEvents.length, icon: Box },
                { label: 'Protocol Level', value: '02', icon: Zap }
              ].map((stat, i) => (
                <Card key={i} className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">{stat.label}</p>
                    <p className="text-2xl font-black italic tracking-tighter uppercase">{stat.value}</p>
                  </div>
                </Card>
              ))}
            </motion.div>
         )}
      </footer>
    </div>
  );
}
