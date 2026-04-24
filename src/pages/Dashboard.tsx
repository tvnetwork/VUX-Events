/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event, RSVP } from '../types';
import { useAuth } from '../AuthContext';
import { MapPin, Users, Calendar as CalendarIcon, ChevronRight, Clock, Map as MapIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar, AvatarStack } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { PixelAssembly } from '../components/effects/PixelAssembly';

export function Dashboard({ onEventClick, onCreateClick }: { onEventClick: (e: Event) => void, onCreateClick: () => void }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  // Simple grouping by date for the timeline
  const groupedEvents: { [key: string]: Event[] } = {};
  events.forEach(e => {
    const date = new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    if (!groupedEvents[date]) groupedEvents[date] = [];
    groupedEvents[date].push(e);
  });

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100]"
          >
            <PixelAssembly onComplete={() => setShowIntro(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "max-w-4xl mx-auto space-y-12 transition-all duration-1000",
        showIntro ? "opacity-0 scale-95 blur-xl pointer-events-none" : "opacity-100 scale-100 blur-0"
      )}>
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-white/40 font-medium animate-pulse">Loading your timeline...</p>
          </div>
        ) : (
          <>
            <header className="flex items-center justify-between">
              <h1 className="text-4xl font-bold tracking-tight">Your Roadmap</h1>
              <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">Filter</Button>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">Sort</Button>
              </div>
            </header>

            <div className="relative pl-10 md:pl-24">
              {/* Continuous Timeline Line */}
              <div className="absolute left-[20px] md:left-[47px] top-4 bottom-4 w-px bg-white/10" />

              <div className="space-y-16">
                {Object.keys(groupedEvents).length > 0 ? (
                  Object.entries(groupedEvents).map(([date, dateEvents]) => (
                    <TimelineSection 
                      key={date} 
                      date={date} 
                      events={dateEvents} 
                      onEventClick={onEventClick} 
                    />
                  ))
                ) : (
                  <EmptyState onCreateClick={onCreateClick} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function TimelineSection({ date, events, onEventClick }: { date: string, events: Event[], onEventClick: (e: Event) => void }) {
  return (
    <div className="relative space-y-8">
      {/* Date Marker */}
      <div className="absolute -left-[50px] md:-left-[94px] top-6 flex flex-col items-center">
        <span className="text-[10px] font-bold uppercase tracking-tighter text-white/40 mb-1 leading-none">{date.split(' ')[0]}</span>
        <span className="text-xl font-bold leading-none">{date.split(' ')[1]}</span>
      </div>

      {events.map((event, idx) => (
        <TimelineItem key={event.id} event={event} onClick={() => onEventClick(event)} />
      ))}
    </div>
  );
}

function TimelineItem({ event, onClick }: { event: Event, onClick: () => void }) {
  const [attendees, setAttendees] = useState<RSVP[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'events', event.id, 'rsvps'), 
      where('status', '==', 'approved')
    );
    getDocs(q).then(snap => {
      setAttendees(snap.docs.map(doc => doc.data() as RSVP));
    });
  }, [event.id]);

  return (
    <div className="relative group">
      {/* Circle on Timeline */}
      <div className="absolute -left-[35px] md:-left-[52px] top-[26px] w-2.5 h-2.5 rounded-full bg-[#1a1023] border-2 border-white/20 group-hover:border-purple-400 group-hover:scale-125 transition-all z-10" />

      <Card 
        hover 
        onClick={onClick}
        className="group relative cursor-pointer p-0 overflow-hidden flex flex-col sm:flex-row items-stretch border-white/5 bg-white/[0.02]"
      >
        <div className="flex-1 p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
             <Badge variant="glass" className="bg-purple-500/10 text-purple-400 border-purple-500/10">
                {event.status === 'published' ? 'Confirmed' : event.status}
             </Badge>
             <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Clock className="w-3 h-3" />
                <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">{event.title}</h3>
            <div className="flex items-center gap-2 text-sm text-white/40">
                <span>By</span>
                <span className="text-white/70 font-semibold">{event.hostName || 'VUX Host'}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                    <MapIcon className="w-3 h-3" />
                    <span>{event.location}</span>
                </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
             <div className="flex items-center gap-3">
                <AvatarStack>
                    {attendees.slice(0, 3).map((a, i) => (
                        <Avatar 
                            key={i} 
                            size="sm" 
                            src={a.userPhotoURL} 
                            fallback={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${a.userId}&backgroundColor=ffcc00`} 
                        />
                    ))}
                    {attendees.length > 3 && (
                        <div className="w-6 h-6 rounded-full glass border border-white/10 flex items-center justify-center text-[8px] font-bold text-white/40">
                            +{attendees.length - 3}
                        </div>
                    )}
                </AvatarStack>
                <span className="text-xs text-white/40 font-medium">
                    {attendees.length > 0 ? `${attendees.length} members going` : 'Be the first to join'}
                </span>
             </div>
             <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Thumbnail preview */}
        <div className="w-full sm:w-48 h-48 sm:h-auto overflow-hidden shrink-0 border-l border-white/10">
            <img 
                src={event.coverImageUrl} 
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" 
            />
        </div>
      </Card>
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="py-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-white/10">
        <CalendarIcon className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Your timeline is clear</h3>
        <p className="text-white/40 max-w-sm mx-auto">
          Start hosting your own gatherings or discover amazing events happening near you.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button onClick={onCreateClick} size="lg" className="px-8 shadow-xl shadow-white/5">Create My First Event</Button>
        <Button variant="secondary" size="lg" className="px-8 bg-transparent">Browse Events</Button>
      </div>
    </div>
  );
}
