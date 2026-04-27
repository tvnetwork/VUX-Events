/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, memo } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where, doc, updateDoc, deleteDoc, collectionGroup } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event, RSVP } from '../types';
import { useAuth } from '../AuthContext';
import { MapPin, Users, Calendar, ChevronRight, Clock, Map as MapIcon, Plus, User, CreditCard, ArrowRight, Ghost, Search, Play, Star, BarChart3, CheckCircle2, Activity, TrendingUp, Trash2, FileEdit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar, AvatarStack } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { formatDate, cn, getAvatarUrl } from '../lib/utils';
import { PixelAssembly } from '../components/effects/PixelAssembly';
import { Countdown } from '../components/Countdown';

function StatItem({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/90">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-xl font-black italic text-white tracking-tighter leading-none">{value}</p>
    </div>
  );
}

export function Dashboard({ onEventClick, onCreateClick, onEditEvent }: { 
  onEventClick: (e: Event) => void, 
  onCreateClick: () => void,
  onEditEvent?: (e: Event) => void
}) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'attending' | 'hosting'>('attending');
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);

  // Optimize: Fetch only relevant events (hosted or public)
  useEffect(() => {
    // We still fetch all for now but in a production app we'd paginate or filter strictly
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(data);
      setLoading(false);
    }, (error) => {
      console.error('Dashboard onSnapshot error:', error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    // Query rsvps using collectionGroup for better performance across all events
    const q = query(collectionGroup(db, 'rsvps'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setRSVPs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVP)));
    }, (error) => {
      console.error('Dashboard RSVPs error:', error);
    });
    return unsubscribe;
  }, [user]);

  const attendingEvents = useMemo(() => 
    events.filter(e => rsvps.some(r => r.eventId === e.id && r.status === 'approved')),
    [events, rsvps]
  );

  const hostedEvents = useMemo(() => 
    events.filter(e => e.hostId === user?.uid),
    [events, user]
  );

  const filteredEvents = viewMode === 'attending' ? attendingEvents : hostedEvents;

  const hostedEventsCount = hostedEvents.length;
  const attendingEventsCount = attendingEvents.length;

  const featuredEvent = useMemo(() => 
    events.find(e => e.visibility === 'public'),
    [events]
  );

  const groupedEvents = useMemo(() => {
    const grouped: { [key: string]: Event[] } = {};
    filteredEvents.forEach(e => {
      const date = formatDate(e.date, { day: 'numeric', month: 'short' });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(e);
    });
    return grouped;
  }, [filteredEvents]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="relative">
            <div className="w-16 h-16 border-2 border-white/5 border-t-indigo-500 rounded-full animate-spin" />
            <div className="absolute inset-0 blur-xl bg-indigo-500/20 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-8">
      {/* Dynamic Hero Section - Large Format */}
      {featuredEvent && (
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[400px] md:h-[600px] rounded-[32px] md:rounded-[48px] overflow-hidden group shadow-2xl mx-4"
        >
          <img 
            src={featuredEvent.coverImageUrl} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
            <div className="space-y-4 md:space-y-6 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 text-white text-[8px] md:text-[10px] font-black tracking-widest px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-lg shadow-indigo-500/40 uppercase">
                  Featured Event
                </div>
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-white/95 tracking-wider uppercase">
                  <Star className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                  <span className="hidden sm:inline italic">Trending Now</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">
                {featuredEvent.title}
              </h2>
              <p className="text-white/95 text-sm md:text-lg font-medium leading-relaxed max-w-xl line-clamp-2 hidden sm:block">
                {featuredEvent.description}
              </p>
              <div className="flex items-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => onEventClick(featuredEvent)}
                  className="rounded-xl md:rounded-2xl px-6 md:px-12 h-12 md:h-16 text-sm md:text-lg shadow-2xl shadow-purple-500/20 gap-2 md:gap-3 group/btn"
                >
                  <span className="font-black italic uppercase">Details</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="w-px h-12 bg-white/10 hidden lg:block mx-2" />
                <Countdown targetDate={featuredEvent.date} className="scale-75 origin-left hidden lg:flex" />
                <div className="flex -space-x-4">
                    {[1, 2].map(i => (
                        <div key={i} className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 md:border-4 border-black overflow-hidden bg-white/5 ring-1 ring-white/10">
                            <img src={getAvatarUrl(i + featuredEvent.hostId)} className="w-full h-full" />
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1 md:gap-2 text-left md:text-right">
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Location</p>
                <p className="text-xl md:text-3xl font-black italic text-white uppercase tracking-tighter truncate max-w-[200px]">{featuredEvent.location}</p>
                <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{formatDate(featuredEvent.date, { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* View Mode Toggle & Category Filters */}
      <section className="px-4 max-w-[1400px] mx-auto space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-500">
               <div className="w-10 h-px bg-indigo-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                 Personal Dashboard
               </span>
            </div>
            <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">
              {viewMode === 'attending' ? <>YOUR<br/>SCHEDULE</> : <>YOUR<br/>EVENTS</>}
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 self-end">
              <button
                onClick={() => setViewMode('attending')}
                className={cn(
                  "px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                  viewMode === 'attending' ? "bg-white text-black shadow-lg" : "text-white/70 hover:text-white"
                )}
              >
                Going {attendingEventsCount > 0 && <span className="w-5 h-5 flex items-center justify-center bg-indigo-500 text-white rounded-full text-[8px]">{attendingEventsCount}</span>}
              </button>
              <button
                onClick={() => setViewMode('hosting')}
                className={cn(
                  "px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                  viewMode === 'hosting' ? "bg-white text-black shadow-lg" : "text-white/70 hover:text-white"
                )}
              >
                Hosting {hostedEventsCount > 0 && <span className="w-5 h-5 flex items-center justify-center bg-indigo-500 text-white rounded-full text-[8px]">{hostedEventsCount}</span>}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              {viewMode === 'attending' ? (
                 <div className="flex items-center gap-8 px-8 py-4 bg-white/[0.02] border border-white/10 rounded-[2rem]">
                  <StatItem label="CONFIRMED" value={attendingEventsCount} icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />} />
                  <div className="w-px h-8 bg-white/5" />
                  <StatItem label="UPCOMING" value={attendingEvents.filter(e => new Date(e.date) > new Date()).length} icon={<Calendar className="w-3.5 h-3.5 text-indigo-400" />} />
                </div>
              ) : (
                <div className="flex items-center gap-8 px-8 py-4 bg-white/[0.02] border border-white/10 rounded-[2rem]">
                  <StatItem label="TOTAL RSVPS" value={hostedEvents.length} icon={<Users className="w-3.5 h-3.5 text-indigo-400" />} />
                  <div className="w-px h-8 bg-white/5" />
                  <StatItem label="LISTINGS" value={hostedEventsCount} icon={<BarChart3 className="w-3.5 h-3.5 text-purple-400" />} />
                </div>
              )}
              <div className="w-px h-10 bg-white/5 mx-2 hidden lg:block" />
              <Button 
                  onClick={onCreateClick}
                  className="rounded-2xl h-12 px-6 shadow-xl shadow-indigo-500/10 gap-2 border border-indigo-500/20"
              >
                  <Plus className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Create Event</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative pl-0 md:pl-24">
            {/* Visual Timeline Path */}
            <div className="absolute left-[39px] top-4 bottom-4 w-px bg-gradient-to-b from-indigo-500 via-white/5 to-transparent hidden md:block" />
            
            <div className="space-y-20 md:space-y-40">
                {Object.entries(groupedEvents).map(([date, dateEvents], sectionIdx) => (
                    <TimelineSection 
                      key={date} 
                      date={date} 
                      events={dateEvents} 
                      onEventClick={onEventClick}
                      onEditEvent={onEditEvent}
                      index={sectionIdx}
                      isManageMode={viewMode === 'hosting'}
                    />
                ))}

                {filteredEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 text-center space-y-10">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center animate-pulse">
                            <Ghost className="w-10 h-10 text-white/30" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                              {viewMode === 'attending' ? "NO UPCOMING EVENTS" : "NO EVENTS HOSTED"}
                            </h3>
                            <p className="text-white/80 text-sm max-w-xs mx-auto italic font-medium">
                              {viewMode === 'attending' 
                                ? "You haven't joined any events yet. Check out the explore page to find something interesting!" 
                                : "You haven't created any events yet. Start hosting today!"}
                            </p>
                        </div>
                        <Button 
                          onClick={() => viewMode === 'attending' ? (window as any).setActiveTab?.('discover') : onCreateClick()} 
                          variant="outline" 
                          className="rounded-xl border-white/10 px-10 h-14 uppercase text-[10px] font-black tracking-widest"
                        >
                          {viewMode === 'attending' ? 'Browse Events' : 'Create Event'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
}

const TimelineSection = memo(({ date, events, onEventClick, onEditEvent, index, isManageMode }: { 
  date: string, 
  events: Event[], 
  onEventClick: (e: Event) => void, 
  onEditEvent?: (e: Event) => void,
  index: number,
  isManageMode?: boolean
}) => {
  return (
    <div className="relative space-y-12 md:space-y-16">
      {/* Enhanced Date Marker */}
      <div className="absolute -left-2 md:-left-[103px] -top-8 flex md:flex-col items-center gap-4 md:gap-0 z-10">
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#0b0b0f] border-2 border-white/5 flex items-center justify-center text-sm md:text-xl font-black italic tracking-tighter shadow-2xl relative">
            <span className="text-indigo-500">0{index + 1}</span>
        </div>
        <div className="md:mt-4 text-left md:text-center">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/80 block leading-none mb-1">{date.split(' ')[0]}</span>
            <span className="text-lg md:text-2xl font-black tracking-tighter leading-none text-white italic">{date.split(' ')[1]}</span>
        </div>
      </div>

      <div className="space-y-12 md:space-y-16 pt-8 md:pt-0">
          {events.map((event) => (
            <TimelineItem 
              key={event.id} 
              event={event} 
              onClick={() => onEventClick(event)} 
              onEdit={() => onEditEvent?.(event)}
              isManageMode={isManageMode || false}
            />
          ))}
      </div>
    </div>
  );
});

const TimelineItem = memo(({ event, onClick, onEdit, isManageMode }: { event: Event, onClick: () => void, onEdit: () => void, isManageMode?: boolean }) => {
  const { user, profile } = useAuth();
  const [attendees, setAttendees] = useState<RSVP[]>([]);
  const isHost = user && (
    event.hostId === user.uid || 
    event.coHostIds?.includes(user.email || '') ||
    profile?.email === 'oladoyeheritage445@gmail.com'
  );
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'events', event.id));
    } catch (err) {
      console.error('Error deleting event:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (e: React.MouseEvent, status: 'draft' | 'published') => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'events', event.id), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const [analytics, setAnalytics] = useState({
    checkins: 0,
    engagement: Math.floor(Math.random() * 30) + 70, 
    views: Math.floor(Math.random() * 500) + 200, 
  });

  useEffect(() => {
    // Only fetch if displayed or needed
    const q = query(
      collection(db, 'events', event.id, 'rsvps'), 
      where('status', '==', 'approved')
    );
    getDocs(q).then(snap => {
      const data = snap.docs.map(doc => doc.data() as RSVP);
      setAttendees(data);
      setAnalytics(prev => ({
        ...prev,
        checkins: data.filter(a => a.checkedIn).length
      }));
    });
  }, [event.id]);

  return (
    <div className={cn("relative group pl-0 md:pl-10", isManageMode && "md:pl-0")}>
      {/* Pulse point on timeline */}
      <div className="absolute left-[29px] top-[50px] -translate-x-1/2 w-5 h-5 rounded-full bg-[#0b0b0f] border-2 border-white/10 group-hover:border-indigo-500 group-hover:scale-125 transition-all z-20 hidden md:flex items-center justify-center shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-indigo-500 transition-colors" />
      </div>

      <Card 
          onClick={onClick}
          hover={true}
          className="group relative cursor-pointer p-0 overflow-hidden flex flex-col xl:flex-row items-stretch border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-700 rounded-[32px] md:rounded-[40px] shadow-2xl hover:shadow-purple-500/5"
      >
          {/* Holographic Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-white/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:via-white/5 group-hover:to-purple-500/5 transition-all duration-1000 pointer-events-none" />
            <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
            
            <div className="flex-1 p-6 md:p-14 space-y-6 md:space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                    <div className="flex items-center gap-3">
                        <Badge className={cn(
                              "font-black italic tracking-widest px-3 md:px-4 py-1 md:py-1.5 h-7 md:h-8 text-[8px] md:text-[10px]",
                              event.status === 'draft' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-white/5 text-white/80 border-none"
                            )}>
                                {(event.category || 'General').toUpperCase()}
                                {event.status === 'draft' && " (DRAFT)"}
                            </Badge>
                        <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-white/80 uppercase tracking-[0.2em] px-3 md:px-4 border-l border-white/5 h-7 md:h-8">
                            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            <span>{(() => {
                                if (!event.date || !event.time) return 'TBA';
                                const dt = new Date(`${event.date}T${event.time}`);
                                return isNaN(dt.getTime()) ? 'TBA' : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            })()}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                    <h3 className="text-2xl md:text-5xl font-black italic tracking-tighter text-white group-hover:text-purple-400 transition-colors leading-[0.9] md:leading-[0.8] uppercase flex items-center gap-3">
                        {event.title}
                    </h3>
                    
                    {isManageMode && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
                            <div className="bg-white/[0.03] rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/5 space-y-1">
                                <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white/80">
                                    <Users className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-400" />
                                    <span>RSVPs</span>
                                </div>
                                <p className="text-lg md:text-xl font-black italic text-white tracking-tighter">{attendees.length}</p>
                            </div>
                            <div className="bg-white/[0.03] rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/5 space-y-1">
                                <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white/80">
                                    <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-400" />
                                    <span>Check-ins</span>
                                </div>
                                <p className="text-lg md:text-xl font-black italic text-white tracking-tighter">{analytics.checkins}</p>
                            </div>
                            <div className="bg-white/[0.03] rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/5 space-y-1 hidden sm:block">
                                <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white/50">
                                    <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400" />
                                    <span>Engage</span>
                                </div>
                                <p className="text-lg md:text-xl font-black italic text-white tracking-tighter">{analytics.engagement}%</p>
                            </div>
                            <div className="bg-white/[0.03] rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/5 space-y-1 hidden sm:block">
                                <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white/50">
                                    <BarChart3 className="w-2.5 h-2.5 md:w-3 md:h-3 text-yellow-400" />
                                    <span>Views</span>
                                </div>
                                <p className="text-lg md:text-xl font-black italic text-white tracking-tighter">{analytics.views}</p>
                            </div>
                        </div>
                    ) || (
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/90">
                            <div className="flex items-center gap-1.5"><User className="w-3 h-3 md:w-4 md:h-4 text-purple-400" /><span>{event.hostName}</span></div>
                            <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-400" /><span>{event.location}</span></div>
                            <div className="flex items-center gap-1.5"><Users className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" /><span>{event.capacity} Capacity</span></div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-10 pt-6 md:pt-10 border-t border-white/5">
                    <div className="flex items-center gap-4 md:gap-6">
                        <AvatarStack>
                            {attendees.slice(0, 3).map((a, i) => (
                                <Avatar 
                                    key={i} 
                                    size="sm" 
                                    src={a.userPhotoURL} 
                                    fallback={getAvatarUrl(a.userId)} 
                                    className="border-2 border-[#0b0b0f] shadow-lg"
                                />
                            ))}
                            {attendees.length > 3 && (
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full glass border border-white/10 flex items-center justify-center text-[7px] md:text-[10px] font-black text-white/70 z-10">
                                    +{attendees.length - 3}
                                </div>
                            )}
                        </AvatarStack>
                        <div className="space-y-0.5">
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Participants</p>
                            <p className="text-xs font-bold text-white italic">{attendees.length} Going</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4 self-end sm:self-auto">
                        {isHost && (
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                    className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border-white/5 hover:bg-white hover:text-black transition-all"
                                >
                                    Edit
                                </Button>
                            </div>
                        )}
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full glass border border-white/5 flex items-center justify-center group-hover:bg-purple-600 transition-all duration-500 text-white">
                            <ChevronRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full xl:w-[400px] h-[200px] md:h-[300px] xl:h-auto overflow-hidden shrink-0 border-t md:border-t-0 xl:border-l border-white/5 relative">
                <img 
                    src={event.coverImageUrl} 
                    className="w-full h-full object-cover grayscale-[0.2] brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 transition-all duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-l from-[#0b0b0f]/80 to-transparent hidden xl:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f]/80 to-transparent xl:hidden" />
                
                <div className="absolute bottom-8 right-8">
                   <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-white italic tracking-widest">UPCOMING</span>
                   </div>
                </div>
            </div>
        </Card>
    </div>
  );
});
