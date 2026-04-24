/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Users, CheckCircle2, Loader2, ChevronLeft, Share2, Heart, Clock, Ticket } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, query, collection, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Event, RSVP } from '../types';
import { formatDate, cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar, AvatarStack } from './ui/Avatar';
import { Card } from './ui/Card';
import { AddToCalendar } from './AddToCalendar';
import confetti from 'canvas-confetti';

export function EventDetails({ event, onClose, onManage }: { event: Event, onClose: () => void, onManage?: (e: Event) => void }) {
  const { user, profile } = useAuth();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isRSVPLoading, setIsRSVPLoading] = useState(false);
  const [userRSVP, setUserRSVP] = useState<RSVP | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'events', event.id, 'rsvps'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rsvpList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVP));
      setRsvps(rsvpList);
      if (user) {
        const found = rsvpList.find(r => r.userId === user.uid);
        setUserRSVP(found || null);
      }
    });

    return unsubscribe;
  }, [event.id, user]);

  const handleRSVP = async () => {
    if (!user || !profile || !event) return;
    setIsRSVPLoading(true);
    try {
      const rsvpId = user.uid;
      const rsvpData: RSVP = {
        id: rsvpId,
        eventId: event.id,
        userId: user.uid,
        userEmail: user.email || '',
        userDisplayName: profile.displayName,
        userPhotoURL: profile.photoURL,
        status: event.isApprovalRequired ? 'pending' : 'approved',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'events', event.id, 'rsvps', rsvpId), {
        ...rsvpData,
        createdAt: serverTimestamp()
      });

      // Celebration effect
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#ffffff']
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsRSVPLoading(false);
    }
  };

  const isHost = user?.uid === event.hostId;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0b0b0f] overflow-y-auto custom-scrollbar"
    >
      {/* Background Ambience */}
      <div className="fixed inset-0 -z-10 bg-[#0b0b0f]">
        <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden opacity-30">
            <img src={event.coverImageUrl} className="w-full h-full object-cover blur-[100px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b0b0f]" />
        </div>
      </div>

      <nav className="sticky top-0 z-50 glass border-b border-white/5 h-16 flex items-center justify-center px-4 lg:px-8 px-6">
        <div className="max-w-[1280px] w-full flex items-center justify-between">
           <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Back to roadmap</span>
           </Button>
           <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Share2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><Heart className="w-4 h-4" /></Button>
           </div>
        </div>
      </nav>

      <div className="max-w-[1280px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-16">
            <div className="space-y-8">
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden glass border border-white/10 shadow-2xl">
                    <img src={event.coverImageUrl} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="glass" className="bg-purple-500/10 text-purple-400 border-purple-500/10 px-3 py-1">
                            {event.status === 'published' ? 'Upcoming' : event.status}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-white/40">
                             <Clock className="w-4 h-4" />
                             <span>{new Date(event.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">{event.title}</h1>
                </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none prose-p:text-white/70 prose-headings:text-white prose-strong:text-white transition-opacity">
                <ReactMarkdown>{event.description}</ReactMarkdown>
            </div>

            {/* Attendees Section */}
            <section className="space-y-8 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-1">Attendees</h3>
                        <p className="text-sm text-white/40">{rsvps.filter(r => r.status === 'approved').length} confirmed guests</p>
                    </div>
                    {rsvps.length > 0 && <AvatarStack>
                        {rsvps.slice(0, 5).map(r => (
                            <Avatar key={r.id} src={r.userPhotoURL} size="md" fallback={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${r.userId}&backgroundColor=c084fc`} />
                        ))}
                    </AvatarStack>}
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {rsvps.filter(r => r.status === 'approved').map(rsvp => (
                        <div key={rsvp.id} className="flex items-center gap-2 glass px-3 py-2 rounded-xl border-white/5 transition-all hover:bg-white/5 cursor-default">
                             <Avatar size="sm" src={rsvp.userPhotoURL} fallback={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${rsvp.userId}&backgroundColor=c084fc`} />
                             <span className="text-sm font-semibold">{rsvp.userDisplayName}</span>
                        </div>
                    ))}
                    {rsvps.filter(r => r.status === 'approved').length === 0 && (
                        <p className="text-white/20 italic text-sm">No confirmed attendees yet.</p>
                    )}
                </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="sticky top-24 p-8 space-y-8 overflow-visible">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Date & Time</p>
                                <p className="text-sm font-semibold">{new Date(event.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Location</p>
                                <p className="text-sm font-semibold line-clamp-1">{event.location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Ticket Options</p>
                        <div className="space-y-2">
                            {(event.ticketTypes || [{ name: 'Free Admission', price: 0 }]).map((tier, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Ticket className="w-4 h-4 text-white/20" />
                                        <span className="text-sm font-semibold">{tier.name}</span>
                                    </div>
                                    <span className="text-sm font-bold">{tier.price === 0 ? 'Free' : `$${tier.price}`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {userRSVP ? (
                        <div className={cn(
                            "p-6 rounded-2xl border flex flex-col items-center gap-3 text-center",
                            userRSVP.status === 'approved' ? "bg-green-500/10 border-green-500/20" : 
                            userRSVP.status === 'pending' ? "bg-yellow-500/10 border-yellow-500/20" : 
                            "bg-red-500/10 border-red-500/20"
                        )}>
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                userRSVP.status === 'approved' ? "bg-green-500 shadow-lg shadow-green-500/20" : "bg-white/5"
                            )}>
                                 {userRSVP.status === 'approved' ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Clock className="w-5 h-5 text-white/20" />}
                            </div>
                            <div>
                                <p className="font-bold">{userRSVP.status === 'approved' ? "You're Going!" : "Registration Sent"}</p>
                                <p className="text-xs text-white/40 mt-1">
                                    {userRSVP.status === 'approved' ? "You are on the list for this event." : "Wait for the host to review your request."}
                                </p>
                            </div>
                            {userRSVP.status === 'approved' && (
                                <AddToCalendar event={event} className="w-full pt-4 border-t border-white/5" />
                            )}
                        </div>
                    ) : (
                        <Button 
                            onClick={handleRSVP} 
                            disabled={isRSVPLoading}
                            className="w-full py-6 text-lg tracking-tight"
                        >
                            {isRSVPLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Register for Event'}
                        </Button>
                    )}

                    {isHost && onManage && (
                        <Button 
                            variant="secondary" 
                            className="w-full"
                            onClick={() => onManage(event)}
                        >
                            Manage Event Dashboard
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-white/5 opacity-60">
                    <Avatar src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${event.hostId}&backgroundColor=c084fc`} />
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Curated By</p>
                        <p className="text-sm font-bold truncate">VUX Hub</p>
                    </div>
                </div>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
