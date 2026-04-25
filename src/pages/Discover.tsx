/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Brain, Cpu, Coins, Music, Palette, Calendar as CalendarIcon, ArrowRight, Ghost, Zap, Globe, Flame } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatDate, cn } from '../lib/utils';

export function Discover({ onCreateClick, onEventClick }: { onCreateClick?: () => void, onEventClick?: (e: Event) => void }) {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'events'), limit(9));
    const unsubscribe = onSnapshot(q, (snap) => {
      setFeaturedEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
      setLoading(false);
    }, (error) => {
      console.error('Discover onSnapshot error:', error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const categories = [
    { id: 'tech', label: 'Tech', icon: <Cpu className="w-5 h-5 text-blue-400" />, color: 'blue' },
    { id: 'ai', label: 'AI', icon: <Brain className="w-5 h-5 text-purple-400" />, color: 'purple' },
    { id: 'crypto', label: 'Web3', icon: <Coins className="w-5 h-5 text-yellow-500" />, color: 'yellow' },
    { id: 'music', label: 'Social', icon: <Music className="w-5 h-5 text-pink-400" />, color: 'pink' },
    { id: 'design', label: 'Art', icon: <Palette className="w-5 h-5 text-teal-400" />, color: 'teal' },
  ];

  return (
    <div className="space-y-24 animate-in fade-in duration-1000 pb-32">
      <header className="space-y-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-purple-500">
             <div className="w-10 h-px bg-purple-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Discover</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">DISCOVER<br/>EVENTS</h1>
          <p className="text-white/40 max-w-sm text-sm font-medium leading-relaxed italic border-l border-white/10 pl-6">
            Find and join live events, communities, and workshops happening near you.
          </p>
        </div>

        <div className="relative max-w-4xl group">
          <div className="absolute inset-0 bg-purple-500/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-purple-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search events, cities, or communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-24 pl-20 pr-10 bg-white/[0.01] border border-white/5 rounded-[48px] outline-none focus:border-purple-500/50 transition-all font-black italic text-2xl placeholder:text-white/5 uppercase tracking-tighter"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
             <Badge className="bg-white/5 border-white/10 text-white/20 text-[10px] py-1">CTRL+K</Badge>
          </div>
        </div>
      </header>

      <section className="space-y-10">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Categories</h2>
           <div className="w-[1px] h-4 bg-white/5 mx-4 flex-1" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
            {categories.map((cat) => (
            <Card key={cat.id} className="p-8 flex flex-col items-center gap-6 cursor-pointer group hover:bg-white/[0.04] border-white/5 transition-all duration-700 rounded-[32px] overflow-hidden relative">
                <div className={`absolute top-0 right-0 w-16 h-16 bg-${cat.color}-500/5 blur-xl group-hover:bg-${cat.color}-500/20 transition-colors duration-700`} />
                <div className="w-16 h-16 rounded-[2rem] bg-white/[0.02] flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all duration-500">
                {cat.icon}
                </div>
                <div className="text-center space-y-1">
                    <span className="text-xs font-black italic uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{cat.label}</span>
                </div>
            </Card>
            ))}
        </div>
      </section>

      <section className="space-y-12">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-2">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                <Zap className="w-8 h-8 text-yellow-400" /> 
                TRENDING EVENTS
             </h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Most popular events right now</p>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-purple-400 transition-colors pb-1 border-b border-white/5">View Full Feed</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {loading ? (
             [1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-white/[0.01] border border-white/5 rounded-[40px] animate-pulse" />
             ))
          ) : (
            featuredEvents.map((event) => (
              <DiscoverCard key={event.id} event={event} onClick={() => onEventClick?.(event)} />
            ))
          )}
        </div>
      </section>

      <section className="relative h-[400px] rounded-[48px] overflow-hidden shadow-2xl flex items-center justify-center text-center p-12">
        <div className="absolute inset-0 bg-[#0b0b0f]" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 space-y-8 max-w-xl">
           <div className="w-20 h-20 rounded-[2.5rem] bg-white text-black flex items-center justify-center mx-auto shadow-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-500">
             <Globe className="w-10 h-10" />
           </div>
           <div className="space-y-3">
              <h3 className="text-4xl font-black italic uppercase tracking-tighter">START YOUR OWN COMMUNITY</h3>
              <p className="text-white/40 text-sm font-medium leading-relaxed italic">
                 VUX is better together. Start your own group to host recurring events and grow your community.
              </p>
           </div>
           <Button onClick={onCreateClick} size="lg" className="h-16 px-12 rounded-2xl shadow-2xl shadow-purple-500/20 gap-3 border border-purple-500/20 group">
              <span className="font-black italic uppercase tracking-widest">Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </Button>
        </div>
      </section>
    </div>
  );
}

function DiscoverCard({ event, onClick }: { event: Event, onClick?: () => void }) {
  return (
    <Card 
      onClick={onClick} 
      className="p-0 overflow-hidden group cursor-pointer border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-700 rounded-[40px] shadow-2xl"
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        <img 
          src={event.coverImageUrl} 
          className="w-full h-full object-cover grayscale-[0.5] brightness-50 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 transition-all duration-1000" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        <div className="absolute top-8 left-8 flex items-center gap-3">
           <Badge className="bg-black/60 backdrop-blur-xl border-white/10 text-white font-black italic tracking-widest px-4 py-2 rounded-2xl text-[10px]">
              {formatDate(event.date, { month: 'short', day: 'numeric' })}
           </Badge>
           <div className="p-2 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-500">
              <Flame className="w-4 h-4 fill-orange-500" />
           </div>
        </div>

        <div className="absolute inset-x-8 bottom-8 space-y-6">
           <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{event.category}</p>
              <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none line-clamp-2">{event.title}</h4>
           </div>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                 <MapPin className="w-3 h-3" />
                 <span>{event.location}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                 <ArrowRight className="w-5 h-5 text-white" />
              </div>
           </div>
        </div>
      </div>
    </Card>
  );
}

function MapPin({ className }: { className?: string }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
}
