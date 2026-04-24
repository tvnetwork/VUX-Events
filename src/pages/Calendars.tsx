/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../AuthContext';
import { Event } from '../types';
import { Calendar as CalendarIcon, Plus, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function Calendars() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [suggestedEvents, setSuggestedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // My hosted events
    const qMy = query(collection(db, 'events'), where('hostId', '==', user.uid), limit(5));
    const unsubMy = onSnapshot(qMy, (snap) => {
      setMyEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    });

    // Suggested events (just some public ones)
    const qSug = query(collection(db, 'events'), limit(4));
    const unsubSug = onSnapshot(qSug, (snap) => {
      setSuggestedEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
      setLoading(false);
    });

    return () => {
      unsubMy();
      unsubSug();
    };
  }, [user]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Your Universe</h1>
        <p className="text-white/40 max-w-lg leading-relaxed">
          Manage the communities you lead and discover new ones to join.
        </p>
      </header>

      {myEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myEvents.map(event => (
            <Card key={event.id} hover className="p-6 flex items-center gap-6 cursor-pointer">
              <div className="w-16 h-16 rounded-2xl overflow-hidden glass border border-white/10 shrink-0">
                <img src={event.coverImageUrl} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg truncate">{event.title}</h4>
                <p className="text-sm text-white/40">Hosting • {new Date(event.date).toLocaleDateString()}</p>
              </div>
              <Button variant="secondary" size="sm">Manage</Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-20 border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/20">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">No events hosted yet</h3>
            <p className="text-sm text-white/40 max-w-[280px]">
              Host your first event to start building your personal roadmap.
            </p>
          </div>
          <Button className="gap-2 shadow-2xl shadow-purple-500/20">
            <Plus className="w-4 h-4" />
            Create My First Event
          </Button>
        </Card>
      )}
      
      {suggestedEvents.length > 0 && (
        <section className="space-y-6 pt-12">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white/40 uppercase tracking-widest text-[10px]">
            <Sparkles className="w-4 h-4 text-purple-400" /> Suggested for you
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestedEvents.map(event => (
              <Card key={event.id} hover className="p-4 flex flex-col gap-4 cursor-pointer group">
                <div className="h-24 rounded-xl overflow-hidden relative">
                   <img src={event.coverImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="space-y-1">
                   <h4 className="font-bold text-sm truncate">{event.title}</h4>
                   <p className="text-[10px] text-white/30 uppercase tracking-widest">{event.location}</p>
                </div>
                <Button variant="secondary" size="sm" className="w-full text-[10px] h-8">View Details</Button>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
