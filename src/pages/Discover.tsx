import { useState, useEffect, useMemo, memo } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types';
import { motion } from 'motion/react';
import { Search, Sparkles, Brain, Cpu, Coins, Music, Palette, ArrowRight, Ghost, Globe, Flame } from 'lucide-react';
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
  }, []);

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
    <div className="space-y-16 animate-in fade-in duration-700 pb-32">
      <header className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">Discover Events</h1>
          <p className="text-white/50 max-w-lg text-sm md:text-base leading-relaxed">
            Find and join the best communities, workshops, and social gatherings near you.
          </p>
        </div>

        <div className="relative w-full max-w-3xl group">
          <div className="absolute inset-0 bg-indigo-600/5 blur-[40px] opacity-0 group-focus-within:opacity-100 transition-all duration-700 pointer-events-none" />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search events, cities, or communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-14 pr-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl outline-none focus:border-indigo-500/40 transition-all text-sm md:text-base text-white placeholder:text-white/30 shadow-lg"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2">
             <button 
              onClick={() => setNearbySort(!nearbySort)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                nearbySort ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25" : "bg-white/5 border border-white/10 text-white/50 hover:text-white"
              )}
             >
                <MapPin className="w-3.5 h-3.5" />
                {nearbySort ? "Nearby" : "Find Nearby"}
             </button>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
           <h2 className="text-sm font-medium text-white">Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
            <Card key={cat.id} hover={true} className="p-6 flex flex-col items-center gap-4 cursor-pointer group bg-white/[0.02] backdrop-blur-xl border-white/10 rounded-2xl relative overflow-hidden transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:border-indigo-500/30 transition-all duration-300">
                  {cat.icon}
                </div>
                <div className="text-center">
                    <span className="text-xs font-medium text-white/60 group-hover:text-indigo-400 transition-colors">{cat.label}</span>
                </div>
            </Card>
            ))}
        </div>

        {allTags.length > 0 && (
          <div className="space-y-4 pt-6">
             <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-sm font-medium text-white">Tags</h2>
             </div>
             <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                   <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 border",
                      selectedTags.includes(tag) 
                        ? "bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20" 
                        : "bg-white/[0.02] text-white/50 border-white/10 hover:border-white/20 hover:text-white"
                    )}
                   >
                      #{tag}
                   </button>
                ))}
             </div>
          </div>
        )}
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
           <h2 className="text-sm font-medium text-white flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" /> 
              {selectedTags.length > 0 ? 'Matching Events' : 'Top Events'}
           </h2>
           <button 
             onClick={() => setSelectedTags([])}
             className={cn(
               "text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-all",
               selectedTags.length === 0 && "opacity-0 pointer-events-none"
             )}
           >
             Clear Filters
           </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             [1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-white/[0.02] border border-white/10 rounded-3xl animate-pulse" />
             ))
          ) : sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <DiscoverCard key={event.id} event={event} onClick={() => onEventClick?.(event)} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center space-y-6 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
               <Ghost className="w-12 h-12 text-white/20 mx-auto" />
               <div className="space-y-2">
                  <h3 className="text-xl font-medium text-white/80">No Events Found</h3>
                  <p className="text-sm text-white/40">Try adjusting your filters or search query.</p>
               </div>
               <Button onClick={() => { setSelectedTags([]); setSearchQuery(''); }} variant="outline" className="h-10 px-6 text-xs border-white/10">Clear Search</Button>
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mt-16 group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 space-y-4 max-w-md text-center md:text-left">
           <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Organize your next event</h3>
           <p className="text-white/50 text-sm leading-relaxed">
              Create your own event page and manage registrations effortlessly.
           </p>
        </div>
        <Button onClick={onCreateClick} className="relative z-10 h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 font-medium whitespace-nowrap shadow-xl">
           Create Event
        </Button>
      </section>
    </div>
  );
}

const DiscoverCard = memo(({ event, onClick }: { event: Event, onClick?: () => void }) => {
  return (
    <Card 
      onClick={onClick} 
      hover={true}
      className="p-0 overflow-hidden group cursor-pointer border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-3xl shadow-xl"
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        <img 
          src={event.coverImageUrl} 
          className="w-full h-full object-cover grayscale-[0.3] brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105 transition-all duration-700" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
           <Badge className="bg-black/40 backdrop-blur-md border border-white/10 text-white font-medium px-3 py-1.5 rounded-full text-xs">
              {formatDate(event.date, { month: 'short', day: 'numeric' })}
           </Badge>
           <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-orange-400" />
              <Countdown targetDate={event.date} compact className="text-orange-400 text-xs font-medium" />
           </div>
        </div>

        <div className="absolute inset-x-6 bottom-6 space-y-4">
           <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                 {event.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] font-medium text-white/70 bg-white/[0.05] px-2 py-1 rounded-md border border-white/10 backdrop-blur-sm">
                       {tag}
                    </span>
                 ))}
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-medium text-indigo-400 uppercase tracking-wider">{event.category}</p>
                 <h4 className="text-xl font-semibold tracking-tight text-white leading-tight line-clamp-2">{event.title}</h4>
              </div>
           </div>
           <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                 <MapPin className="w-3.5 h-3.5" />
                 <span className="truncate max-w-[150px]">{event.location}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                 <ArrowRight className="w-4 h-4 text-white" />
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
