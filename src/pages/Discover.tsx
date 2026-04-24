/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types';
import { motion } from 'motion/react';
import { Search, Sparkles, Brain, Cpu, Coins, Music, Palette, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export function Discover({ onCreateClick }: { onCreateClick?: () => void }) {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'events'), limit(6));
    const unsubscribe = onSnapshot(q, (snap) => {
      setFeaturedEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const categories = [
    { id: 'tech', label: 'Tech', icon: <Cpu className="w-5 h-5 text-blue-400" /> },
    { id: 'ai', label: 'AI', icon: <Brain className="w-5 h-5 text-purple-400" /> },
    { id: 'crypto', label: 'Crypto', icon: <Coins className="w-5 h-5 text-yellow-500" /> },
    { id: 'music', label: 'Music', icon: <Music className="w-5 h-5 text-pink-400" /> },
    { id: 'design', label: 'Design', icon: <Palette className="w-5 h-5 text-teal-400" /> },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Explore VUX Events</h1>
          <p className="text-white/40 max-w-lg leading-relaxed">
            Discover high-signal events and communities tailored to your interests.
          </p>
        </div>

        <div className="relative max-w-2xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search events, communities, or cities..."
            className="w-full h-16 pl-14 pr-6 bg-white/[0.03] border border-white/10 rounded-[2rem] outline-none focus:border-purple-500/50 transition-all font-medium text-lg placeholder:text-white/10"
          />
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} hover className="p-4 flex flex-col items-center gap-3 cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-colors">
              {cat.icon}
            </div>
            <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">{cat.label}</span>
          </Card>
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" /> Trending Events
          </h2>
          <button className="text-sm font-semibold text-purple-400 hover:text-purple-300">View all</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredEvents.length > 0 ? (
            featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            [1, 2, 3].map(i => (
              <div key={i} className="h-64 glass rounded-3xl animate-pulse" />
            ))
          )}
        </div>
      </section>

      <section className="py-20 text-center space-y-6 bg-white/5 rounded-3xl border border-white/5 mx-auto max-w-2xl px-8">
        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
          <CalendarIcon className="w-8 h-8 text-purple-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Host your own community</h3>
          <p className="text-white/40">Create a page and start inviting members to your curated events.</p>
        </div>
        <Button size="lg" className="px-10" onClick={onCreateClick}>Create Event</Button>
      </section>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <Card hover className="p-0 overflow-hidden group cursor-pointer border-white/5">
      <div className="h-40 overflow-hidden relative">
        <img src={event.coverImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] to-transparent opacity-60" />
        <div className="absolute top-4 left-4">
           <Badge variant="glass" className="bg-black/60 border-white/10 text-white/80">
              {new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
           </Badge>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h4 className="font-bold text-lg mb-1 line-clamp-1">{event.title}</h4>
          <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{event.description.replace(/[#*`]/g, '')}</p>
        </div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
              <span>{event.location}</span>
           </div>
           <Button variant="secondary" size="sm">Register</Button>
        </div>
      </div>
    </Card>
  );
}

function Badge({ children, variant = 'primary', className }: { children: React.ReactNode, variant?: 'primary' | 'glass', className?: string }) {
    const variants = {
        primary: 'bg-white/10 text-white/70 border-white/5',
        glass: 'glass border-white/10 text-white/70'
    };
    return (
        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border", variants[variant], className)}>
            {children}
        </span>
    );
}
