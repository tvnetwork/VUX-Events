/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event, RSVP } from '../types';
import { useAuth } from '../AuthContext';
import { MapPin, Users, Calendar, ChevronRight, Clock, Map as MapIcon, Plus, User, CreditCard, ArrowRight, Ghost, Search, Play, Star, BarChart3, CheckCircle2, Activity, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar, AvatarStack } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { formatDate, cn, getAvatarUrl } from '../lib/utils';
import { PixelAssembly } from '../components/effects/PixelAssembly';

function StatItem({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20">
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
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'discover' | 'manage'>('discover');

  const categories = ['All', 'Conference', 'Workshop', 'Meetup', 'Social', 'Webinar'];

  useEffect(() => {
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

  const filteredEvents = viewMode === 'discover'
    ? (activeCategory === 'All' ? events : events.filter(e => e.category === activeCategory))
    : events.filter(e => e.hostId === user?.uid);

  const hostedEventsCount = events.filter(e => e.hostId === user?.uid).length;

  const featuredEvent = events.find(e => e.visibility === 'public');

  // Simple grouping by date for the timeline
  const groupedEvents: { [key: string]: Event[] } = {};
  filteredEvents.forEach(e => {
    const date = formatDate(e.date, { day: 'numeric', month: 'short' });
    if (!groupedEvents[date]) groupedEvents[date] = [];
    groupedEvents[date].push(e);
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="relative">
            <div className="w-16 h-16 border-2 border-white/5 border-t-purple-500 rounded-full animate-spin" />
            <div className="absolute inset-0 blur-xl bg-purple-500/20 rounded-full animate-pulse" />
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
          className="relative h-[600px] rounded-[48px] overflow-hidden group shadow-2xl mx-4"
        >
          <img 
            src={featuredEvent.coverImageUrl} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <div className="absolute inset-x-0 bottom-0 p-12 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 text-white text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-purple-500/40">
                  FEATURED EVENT
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-white/60 tracking-wider">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>Trending Now</span>
                </div>
              </div>
              <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">
                {featuredEvent.title}
              </h2>
              <p className="text-white/60 text-lg font-medium leading-relaxed max-w-xl line-clamp-2">
                {featuredEvent.description}
              </p>
              <div className="flex items-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => onEventClick(featuredEvent)}
                  className="rounded-2xl px-12 h-16 text-lg shadow-2xl shadow-purple-500/20 gap-3 group/btn"
                >
                  <span className="font-black italic uppercase">View Details</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="hidden sm:flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-14 h-14 rounded-full border-4 border-black overflow-hidden bg-white/5 ring-1 ring-white/10">
                            <img src={getAvatarUrl(i + featuredEvent.hostId)} className="w-full h-full" />
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Event Location</p>
                <p className="text-3xl font-black italic text-white uppercase tracking-tighter">{featuredEvent.location}</p>
                <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-xs tracking-widest">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(featuredEvent.date, { month: 'long', day: 'numeric' })}</span>
                </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* View Mode Toggle & Category Filters */}
      <section className="px-4 max-w-[1400px] mx-auto space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-purple-500">
               <div className="w-10 h-px bg-purple-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                 {viewMode === 'discover' ? 'Event Discovery' : 'Event Management'}
               </span>
            </div>
            <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">
              {viewMode === 'discover' ? <>FEATURED<br/>EVENTS</> : <>YOUR<br/>PLATFORM</>}
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 self-end">
              <button
                onClick={() => setViewMode('discover')}
                className={cn(
                  "px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  viewMode === 'discover' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                )}
              >
                Discover
              </button>
              <button
                onClick={() => setViewMode('manage')}
                className={cn(
                  "px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                  viewMode === 'manage' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                )}
              >
                Manage {hostedEventsCount > 0 && <span className="w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-[8px]">{hostedEventsCount}</span>}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              {viewMode === 'discover' ? (
                categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      activeCategory === cat 
                        ? "bg-white text-black border-white shadow-xl shadow-white/5" 
                        : "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                ))
              ) : (
                <div className="flex items-center gap-8 px-8 py-4 bg-white/[0.02] border border-white/10 rounded-[2rem]">
                  <StatItem label="TOTAL RSVPS" value={events.filter(e => e.hostId === user?.uid).length * 12} icon={<Users className="w-3.5 h-3.5" />} />
                  <div className="w-px h-8 bg-white/5" />
                  <StatItem label="AVG. ENGAGEMENT" value="94%" icon={<Activity className="w-3.5 h-3.5" />} />
                </div>
              )}
              <div className="w-px h-10 bg-white/5 mx-2 hidden lg:block" />
              <Button 
                  onClick={onCreateClick}
                  className="rounded-2xl h-12 px-6 shadow-xl shadow-purple-500/10 gap-2 border border-purple-500/20"
              >
                  <Plus className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Create Event</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative pl-0 md:pl-24">
            {/* Visual Timeline Path */}
            <div className="absolute left-[39px] top-4 bottom-4 w-px bg-gradient-to-b from-purple-500 via-white/5 to-transparent hidden md:block" />
            
            <div className="space-y-40">
                {Object.entries(groupedEvents).map(([date, dateEvents], sectionIdx) => (
                    <TimelineSection 
                      key={date} 
                      date={date} 
                      events={dateEvents} 
                      onEventClick={onEventClick}
                      onEditEvent={onEditEvent}
                      index={sectionIdx}
                      isManageMode={viewMode === 'manage'}
                    />
                ))}

                {filteredEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 text-center space-y-10">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center animate-pulse">
                            <Ghost className="w-10 h-10 text-white/10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">No Events Found</h3>
                            <p className="text-white/20 text-sm max-w-xs mx-auto italic font-medium">There are no events matching your search right now.</p>
                        </div>
                        <Button onClick={onCreateClick} variant="outline" className="rounded-xl border-white/10 px-10 h-14 uppercase text-[10px] font-black tracking-widest">Host a Gathering</Button>
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
}

function TimelineSection({ date, events, onEventClick, onEditEvent, index, isManageMode }: { 
  date: string, 
  events: Event[], 
  onEventClick: (e: Event) => void, 
  onEditEvent?: (e: Event) => void,
  index: number,
  isManageMode?: boolean
}) {
  return (
    <div className="relative space-y-16">
      {/* Enhanced Date Marker */}
      <div className="absolute -left-[10px] md:-left-[103px] -top-8 flex flex-col items-center z-10">
        <div className="w-14 h-14 rounded-full bg-[#0b0b0f] border-2 border-white/5 flex items-center justify-center text-xl font-black italic tracking-tighter shadow-2xl relative">
            <span className="text-purple-500">0{index + 1}</span>
        </div>
        <div className="mt-4 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block leading-none mb-1">{date.split(' ')[0]}</span>
            <span className="text-2xl font-black tracking-tighter leading-none text-white italic">{date.split(' ')[1]}</span>
        </div>
      </div>

      <div className="space-y-16">
          {events.map((event) => (
            <TimelineItem 
              key={event.id} 
              event={event} 
              onClick={() => onEventClick(event)} 
              onEdit={() => onEditEvent?.(event)}
              isManageMode={isManageMode}
            />
          ))}
      </div>
    </div>
  );
}

function TimelineItem({ event, onClick, onEdit, isManageMode }: { event: Event, onClick: () => void, onEdit: () => void, isManageMode?: boolean }) {
  const { user } = useAuth();
  const [attendees, setAttendees] = useState<RSVP[]>([]);
  const isHost = user?.uid === event.hostId;
  const [analytics, setAnalytics] = useState({
    checkins: 0,
    engagement: Math.floor(Math.random() * 30) + 70, // Simulated engagement
    views: Math.floor(Math.random() * 500) + 200, // Simulated views
  });

  useEffect(() => {
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
      <div className="absolute left-[29px] top-[50px] -translate-x-1/2 w-5 h-5 rounded-full bg-[#0b0b0f] border-2 border-white/10 group-hover:border-purple-500 group-hover:scale-125 transition-all z-20 hidden md:flex items-center justify-center shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-purple-500 transition-colors" />
      </div>

      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card 
            onClick={onClick}
            className="group relative cursor-pointer p-0 overflow-hidden flex flex-col xl:flex-row items-stretch border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-700 rounded-[40px] shadow-2xl hover:shadow-purple-500/5 group"
        >
            <div className="flex-1 p-10 md:p-14 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-white/5 text-white/60 border-none font-black italic tracking-widest px-4 py-1.5 h-8">
                            {(event.category || 'General').toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-4 border-l border-white/5 h-8">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{(() => {
                                if (!event.date || !event.time) return 'TBA';
                                const dt = new Date(`${event.date}T${event.time}`);
                                return isNaN(dt.getTime()) ? 'TBA' : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            })()}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white group-hover:text-purple-400 transition-colors leading-[0.8] uppercase flex items-center gap-3">
                        {event.title}
                    </h3>
                    
                    {isManageMode && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 space-y-1">
                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20">
                                    <Users className="w-3 h-3 text-purple-400" />
                                    <span>Total RSVPs</span>
                                </div>
                                <p className="text-xl font-black italic text-white tracking-tighter">{attendees.length}</p>
                            </div>
                            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 space-y-1">
                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Check-ins</span>
                                </div>
                                <p className="text-xl font-black italic text-white tracking-tighter">{analytics.checkins}</p>
                            </div>
                            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 space-y-1">
                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20">
                                    <TrendingUp className="w-3 h-3 text-blue-400" />
                                    <span>Engagement</span>
                                </div>
                                <p className="text-xl font-black italic text-white tracking-tighter">{analytics.engagement}%</p>
                            </div>
                            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 space-y-1">
                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20">
                                    <BarChart3 className="w-3 h-3 text-yellow-400" />
                                    <span>Unique Views</span>
                                </div>
                                <p className="text-xl font-black italic text-white tracking-tighter">{analytics.views}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-[10px] font-bold uppercase tracking-widest text-white/30">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-purple-400" /><span>{event.hostName}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /><span>{event.location}</span></div>
                        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /><span>{event.capacity} Capacity</span></div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10 pt-10 border-t border-white/5">
                    <div className="flex items-center gap-6">
                        <AvatarStack>
                            {attendees.slice(0, 5).map((a, i) => (
                                <Avatar 
                                    key={i} 
                                    size="md" 
                                    src={a.userPhotoURL} 
                                    fallback={getAvatarUrl(a.userId)} 
                                    className="border-4 border-[#0b0b0f] shadow-lg"
                                />
                            ))}
                            {attendees.length > 5 && (
                                <div className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40 z-10">
                                    +{attendees.length - 5}
                                </div>
                            )}
                        </AvatarStack>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Participants</p>
                            <p className="text-sm font-bold text-white italic">{attendees.length} Going</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isHost && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest border-white/5 hover:bg-white hover:text-black transition-all"
                            >
                                Edit Event
                            </Button>
                        )}
                        <div className="w-14 h-14 rounded-full glass border border-white/5 flex items-center justify-center group-hover:bg-purple-600 transition-all duration-500 text-white">
                            <ChevronRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full xl:w-[460px] h-[340px] xl:h-auto overflow-hidden shrink-0 border-l border-white/5 relative">
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
      </motion.div>
    </div>
  );
}
