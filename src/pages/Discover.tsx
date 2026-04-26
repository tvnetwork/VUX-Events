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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'events'), limit(20));
    const unsubscribe = onSnapshot(q, (snap) => {
      setFeaturedEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
      setLoading(false);
    }, (error) => {
      console.error('Discover onSnapshot error:', error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const allTags = Array.from(new Set(featuredEvents.flatMap(e => e.tags || []))).sort();

  const filteredEvents = featuredEvents.filter(e => {
    const matchesSearch = (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (e.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (e.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(t => (e.tags || []).includes(t));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

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
          <div className="flex items-center gap-4 text-indigo-500">
             <div className="w-12 h-[2px] bg-indigo-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">Global Directory</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">DISCOVER<br/>NODES</h1>
          <p className="text-white/40 max-w-sm text-sm font-bold leading-relaxed italic border-l-2 border-indigo-500/40 pl-6 uppercase tracking-wider">
            Synchronize with live events, decentralized communities, and collaborative workshops.
          </p>
        </div>

        <div className="relative max-w-5xl group">
          <div className="absolute inset-0 bg-indigo-600/5 blur-[100px] opacity-0 group-focus-within:opacity-100 transition-all duration-1000 pointer-events-none" />
          <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-indigo-500/40 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search events, cities, or communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-28 pl-24 pr-12 bg-white/[0.01] border border-white/[0.03] rounded-[60px] outline-none focus:border-indigo-500/40 transition-all font-black italic text-3xl placeholder:text-white/5 uppercase tracking-tighter shadow-2xl"
          />
          <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4">
             <Badge className="bg-white/5 border-white/10 text-white/20 text-[10px] py-1.5 px-3 font-mono">SYS.FIND</Badge>
          </div>
        </div>
      </header>

      <section className="space-y-12">
        <div className="flex items-center justify-between px-4">
           <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-indigo-500/40">Category Selection</h2>
           <div className="h-[2px] flex-1 bg-gradient-to-r from-indigo-500/40 to-transparent mx-6" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((cat) => (
            <Card key={cat.id} className="p-8 flex flex-col items-center gap-6 cursor-pointer group hover:bg-white/[0.03] border-white/[0.03] transition-all duration-700 rounded-[40px] overflow-hidden relative shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-[2rem] bg-white/[0.01] flex items-center justify-center border border-white/5 group-hover:border-indigo-500/40 transition-all duration-500 group-hover:scale-110 shadow-xl">
                {cat.icon}
                </div>
                <div className="text-center">
                    <span className="text-xs font-black italic uppercase tracking-[0.2em] text-white/30 group-hover:text-indigo-400 transition-colors">{cat.label}</span>
                </div>
            </Card>
            ))}
        </div>

        {allTags.length > 0 && (
          <div className="space-y-8 pt-8">
             <div className="flex items-center justify-between px-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-indigo-500/40">Pulse Signals</h2>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-indigo-500/40 to-transparent mx-6" />
             </div>
             <div className="flex flex-wrap gap-3 px-4">
                {allTags.map(tag => (
                   <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border relative overflow-hidden",
                      selectedTags.includes(tag) 
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-2xl shadow-indigo-600/40" 
                        : "bg-white/[0.01] text-white/20 border-white/[0.03] hover:border-indigo-500/40 hover:text-white"
                    )}
                   >
                      <span className="relative z-10">#{tag}</span>
                   </button>
                ))}
             </div>
          </div>
        )}
      </section>

      <section className="space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
          <div className="space-y-4">
             <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter flex items-center gap-6 leading-none">
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]" /> 
                {selectedTags.length > 0 ? 'SIGNAL MATCH' : 'PRIME NODES'}
             </h2>
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500/40 italic">
               {selectedTags.length > 0 ? `Displaying results for sync-tags: ${selectedTags.join(', ')}` : 'The most verified events in the substrate'}
             </p>
          </div>
          <button 
            onClick={() => setSelectedTags([])}
            className={cn(
              "text-[10px] font-black uppercase tracking-widest text-indigo-500/40 hover:text-indigo-400 transition-all pb-2 px-4 border-b-2 border-indigo-500/10",
              selectedTags.length === 0 && "opacity-0 pointer-events-none translate-y-4"
            )}
          >
            RESET PROTOCOL
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
          {loading ? (
             [1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-white/[0.01] border border-white/[0.05] rounded-[48px] animate-pulse" />
             ))
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <DiscoverCard key={event.id} event={event} onClick={() => onEventClick?.(event)} />
            ))
          ) : (
            <div className="col-span-full py-48 text-center space-y-10 bg-white/[0.01] rounded-[60px] border border-dashed border-white/[0.05]">
               <Ghost className="w-20 h-20 text-white/5 mx-auto" />
               <div className="space-y-4">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white/10">Zero Signals Found</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/5">Purge filters to restore synchronization with the grid</p>
               </div>
               <Button onClick={() => { setSelectedTags([]); setSearchQuery(''); }} variant="vux" className="h-20 px-12 text-lg">REBOOT GRID</Button>
            </div>
          )}
        </div>
      </section>

      <section className="relative h-[500px] rounded-[60px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex items-center justify-center text-center p-16 group">
        <div className="absolute inset-0 bg-[#0b0b0f] transition-all duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-transparent to-purple-500/10" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="relative z-10 space-y-12 max-w-2xl">
           <div className="w-28 h-28 rounded-[3rem] bg-white text-black flex items-center justify-center mx-auto shadow-2xl transform -rotate-12 group-hover:rotate-0 transition-all duration-700 ease-out">
             <Globe className="w-14 h-14" />
           </div>
           <div className="space-y-4">
              <h3 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">ARCHITECT<br/>YOUR WORLD</h3>
              <p className="text-white/30 text-lg font-bold leading-relaxed italic uppercase tracking-widest">
                 Instantiate your own community node and govern your recurring syncs.
              </p>
           </div>
           <Button onClick={onCreateClick} variant="vux" size="lg" className="h-24 px-16 rounded-3xl shadow-2xl shadow-indigo-600/30 gap-6 group hover:scale-110 transition-all duration-500">
              <span className="text-xl font-black uppercase tracking-widest">INITIATE NODE</span>
              <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
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
           <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                 {event.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[7px] font-black uppercase tracking-[0.2em] text-white/40 bg-white/5 px-2 py-1 rounded-lg border border-white/5 backdrop-blur-md">
                       {tag}
                    </span>
                 ))}
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{event.category}</p>
                 <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-[0.9] line-clamp-2">{event.title}</h4>
              </div>
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
