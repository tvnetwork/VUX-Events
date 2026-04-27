/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, memo } from 'react';
import { collection, query, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Brain, Cpu, Coins, Music, Palette, Calendar as CalendarIcon, ArrowRight, Ghost, Zap, Globe, Flame } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatDate, cn } from '../lib/utils';
import { Countdown } from '../components/Countdown';
import { SiteConfigService } from '../services/SiteConfigService';

export function Discover({ onCreateClick, onEventClick }: { onCreateClick?: () => void, onEventClick?: (e: Event) => void }) {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<{id: string, label: string, icon: any, color: string}[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearbySort, setNearbySort] = useState(false);

  useEffect(() => {
    if (nearbySort && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setNearbySort(false);
        }
      );
    }
  }, [nearbySort]);

  useEffect(() => {
    SiteConfigService.getConfig().then(config => {
      const iconMap: Record<string, any> = {
        'tech': <Cpu className="w-5 h-5 text-blue-400" />,
        'ai': <Brain className="w-5 h-5 text-purple-400" />,
        'crypto': <Coins className="w-5 h-5 text-yellow-500" />,
        'music': <Music className="w-5 h-5 text-pink-400" />,
        'design': <Palette className="w-5 h-5 text-teal-400" />,
        'default': <Sparkles className="w-5 h-5 text-indigo-400" />
      };

      const cats = config.categories.map(c => ({
        id: c.toLowerCase(),
        label: c,
        icon: iconMap[c.toLowerCase()] || iconMap['default'],
        color: 'indigo'
      }));
      setCategories(cats);
    });
  }, []);

  useEffect(() => {
    // Only fetch published events for Discovery
    const q = query(collection(db, 'events'), where('status', '==', 'published'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setFeaturedEvents(docs);
      setLoading(false);
    }, (error) => {
      console.error('Discover onSnapshot error:', error);
      setLoading(false);
    });
    return unsubscribe;
  }, []); // Remove searchQuery from dependency as we filter client-side for now

  const allTags = useMemo(() => 
    Array.from(new Set(featuredEvents.flatMap(e => e.tags || []))).sort(),
    [featuredEvents]
  );

  const filteredEvents = useMemo(() => {
    return featuredEvents.filter(e => {
      const matchesSearch = (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (e.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (e.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(t => (e.tags || []).includes(t));

      // Handle private event filtering similar to previous logic but in useMemo
      const isVisible = !e.isPrivate || (searchQuery.length > 5 && (e.id.includes(searchQuery) || e.title.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesSearch && matchesTags && isVisible;
    });
  }, [featuredEvents, searchQuery, selectedTags]);

  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];
    if (nearbySort && userLocation) {
      sorted.sort((a, b) => {
        if (a.coordinates && b.coordinates) {
          const distA = calculateDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng);
          const distB = calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng);
          return distA - distB;
        }
        return 0;
      });
    }
    return sorted;
  }, [filteredEvents, nearbySort, userLocation]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-24 animate-in fade-in duration-1000 pb-32">
      <header className="space-y-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-indigo-500">
             <div className="w-12 h-[2px] bg-indigo-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">Global Directory</span>
          </div>
          <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">DISCOVER<br/>EVENTS</h1>
          <p className="text-white/70 max-w-sm text-sm font-bold leading-relaxed italic border-l-2 border-indigo-500/40 pl-6 uppercase tracking-wider md:block">
            Find and join the best communities, workshops, and social gatherings near you.
          </p>
        </div>

        <div className="relative max-w-5xl group mx-4">
          <div className="absolute inset-0 bg-indigo-600/5 blur-[100px] opacity-0 group-focus-within:opacity-100 transition-all duration-1000 pointer-events-none" />
          <Search className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 text-indigo-500/40 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search events, cities, or communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-20 md:h-28 pl-16 md:pl-24 pr-8 md:pr-12 bg-white/[0.01] border border-white/[0.03] rounded-[30px] md:rounded-[60px] outline-none focus:border-indigo-500/40 transition-all font-black italic text-xl md:text-3xl placeholder:text-white/5 uppercase tracking-tighter shadow-2xl"
          />
          <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-4">
             <button 
              onClick={() => setNearbySort(!nearbySort)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                nearbySort ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/40" : "bg-white/5 border-white/10 text-white/20 hover:text-white/40"
              )}
             >
                <MapPin className="w-3.5 h-3.5" />
                {nearbySort ? "NEARBY ACTIVE" : "FIND NEARBY"}
             </button>
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
            <Card key={cat.id} hover={true} className="p-8 flex flex-col items-center gap-6 cursor-pointer group border-white/[0.03] rounded-[40px] overflow-hidden relative shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-[2rem] bg-white/[0.01] flex items-center justify-center border border-white/5 group-hover:border-indigo-500/40 transition-all duration-500 group-hover:scale-110 shadow-xl">
                {cat.icon}
                </div>
                <div className="text-center">
                    <span className="text-xs font-black italic uppercase tracking-[0.2em] text-white/60 group-hover:text-indigo-400 transition-colors">{cat.label}</span>
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
                        : "bg-white/[0.01] text-white/50 border-white/[0.03] hover:border-indigo-500/40 hover:text-white"
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
             <h2 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter flex items-center gap-6 leading-none">
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]" /> 
                {selectedTags.length > 0 ? 'MATCHING EVENTS' : 'TOP EVENTS'}
             </h2>
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500/40 italic">
               {selectedTags.length > 0 ? `Displaying results for sync-tags: ${selectedTags.join(', ')}` : 'The most verified events in the substrate'}
             </p>
          </div>
          <button 
            onClick={() => setSelectedTags([])}
            className={cn(
              "text-[10px] font-black uppercase tracking-widest text-indigo-500/40 hover:text-indigo-400 transition-all pb-2 px-4 border-b-2 border-indigo-500/10 self-start md:self-end",
              selectedTags.length === 0 && "opacity-0 pointer-events-none translate-y-4"
            )}
          >
            RESET PROTOCOL
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-4">
          {loading ? (
             [1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-white/[0.01] border border-white/[0.05] rounded-[48px] animate-pulse" />
             ))
          ) : sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <DiscoverCard key={event.id} event={event} onClick={() => onEventClick?.(event)} />
            ))
          ) : (
            <div className="col-span-full py-48 text-center space-y-10 bg-white/[0.01] rounded-[60px] border border-dashed border-white/[0.05]">
               <Ghost className="w-20 h-20 text-white/5 mx-auto" />
               <div className="space-y-4">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white/30">Zero Signals Found</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Purge filters to restore synchronization with the grid</p>
               </div>
               <Button onClick={() => { setSelectedTags([]); setSearchQuery(''); }} variant="vux" className="h-20 px-12 text-lg">REBOOT GRID</Button>
            </div>
          )}
        </div>
      </section>

      <section className="relative h-[400px] md:h-[500px] rounded-[40px] md:rounded-[60px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex items-center justify-center text-center p-8 md:p-16 group mx-4">
        <div className="absolute inset-0 bg-[#0b0b0f] transition-all duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-transparent to-purple-500/10" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="relative z-10 space-y-8 md:space-y-12 max-w-2xl">
           <div className="w-20 h-20 md:w-28 md:h-28 rounded-[2.5rem] md:rounded-[3rem] bg-white text-black flex items-center justify-center mx-auto shadow-2xl transform -rotate-12 group-hover:rotate-0 transition-all duration-700 ease-out">
             <Globe className="w-10 h-10 md:w-14 md:h-14" />
           </div>
           <div className="space-y-4">
              <h3 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">ORGANIZE<br/>YOUR NEXT EVENT</h3>
              <p className="text-white/60 text-sm md:text-lg font-bold leading-relaxed italic uppercase tracking-widest">
                 Create your own event page and manage registrations effortlessly.
              </p>
           </div>
           <Button onClick={onCreateClick} variant="vux" size="lg" className="h-20 md:h-24 px-8 md:px-16 rounded-2xl md:rounded-3xl shadow-2xl shadow-indigo-600/30 gap-4 md:gap-6 group hover:scale-110 transition-all duration-500">
              <span className="text-lg md:text-xl font-black uppercase tracking-widest">CREATE EVENT</span>
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-3 transition-transform" />
           </Button>
        </div>
      </section>
    </div>
  );
}

const DiscoverCard = memo(({ event, onClick }: { event: Event, onClick?: () => void }) => {
  return (
    <Card 
      onClick={onClick} 
      hover={true}
      className="p-0 overflow-hidden group cursor-pointer border-white/5 bg-white/[0.01] rounded-[40px] shadow-2xl"
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        <img 
          src={event.coverImageUrl} 
          className="w-full h-full object-cover grayscale-[0.5] brightness-50 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 transition-all duration-1000" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        <div className="absolute top-8 left-8 flex items-center gap-3">
           <Badge className="bg-black/60 backdrop-blur-xl border-white/10 text-white font-black italic tracking-widest px-4 py-2 rounded-2xl text-[10px]">
              {formatDate(event.date, { month: 'short', day: 'numeric' })}
           </Badge>
           <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <Countdown targetDate={event.date} compact className="text-orange-500" />
           </div>
        </div>

        <div className="absolute inset-x-8 bottom-8 space-y-6">
           <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                 {event.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[7px] font-black uppercase tracking-[0.2em] text-white/70 bg-white/5 px-2 py-1 rounded-lg border border-white/5 backdrop-blur-md">
                       {tag}
                    </span>
                 ))}
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">{event.category}</p>
                 <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-[0.9] line-clamp-2">{event.title}</h4>
              </div>
           </div>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/70 uppercase tracking-widest">
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
});

// Helper for distance calculations
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function MapPin({ className }: { className?: string }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
}
