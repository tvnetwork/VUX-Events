/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Users, CheckCircle2, Loader2, ChevronLeft, Share2, Heart, Clock, Ticket, Copy, QrCode, Globe, Info, Zap, ArrowRight, ShieldCheck, Share, Ghost } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, query, collection, where, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Event, RSVP } from '../types';
import { formatDate, cn, getAvatarUrl } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { VUXQRCode } from './VUXQRCode';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { AddToCalendar } from './AddToCalendar';
import { PulseService } from '../services/PulseService';
import confetti from 'canvas-confetti';

export function EventDetails({ event, onClose, onManage, onEdit }: { event: Event, onClose: () => void, onManage?: (e: Event) => void, onEdit?: (e: Event) => void }) {
  const { user, profile } = useAuth();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isRSVPLoading, setIsRSVPLoading] = useState(false);
  const [userRSVP, setUserRSVP] = useState<RSVP | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '' });
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  const shareUrl = `${window.location.origin}/discover?event=${event.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const q = query(collection(db, 'events', event.id, 'rsvps'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rsvpList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVP));
      setRsvps(rsvpList);
      
      // If we have a user, find their RSVP
      if (user) {
        const found = rsvpList.find(r => r.userId === user.uid);
        setUserRSVP(found || null);
      } else {
        // If guest, try to find by email in localStorage if we previously RSVP'd as guest
        const guestEmail = localStorage.getItem(`guest_rsvp_${event.id}`);
        if (guestEmail) {
          const found = rsvpList.find(r => r.userEmail === guestEmail);
          setUserRSVP(found || null);
        }
      }
    }, (error) => {
      console.error('EventDetails onSnapshot error:', error);
    });

    return unsubscribe;
  }, [event.id, user]);

  const handleRSVP = async (isGuest = false) => {
    if (!event) return;
    if (!isGuest && (!user || !profile)) {
      setShowGuestForm(true);
      return;
    }

    setIsRSVPLoading(true);
    try {
      const rsvpId = isGuest ? `guest_${Date.now()}` : user!.uid;
      const rsvpData: RSVP = {
        id: rsvpId,
        eventId: event.id,
        userId: isGuest ? rsvpId : user!.uid,
        userEmail: isGuest ? guestInfo.email : user!.email || '',
        userDisplayName: isGuest ? guestInfo.name : profile!.displayName,
        userPhotoURL: isGuest ? getAvatarUrl(guestInfo.email) : profile!.photoURL,
        status: event.isApprovalRequired ? 'pending' : 'approved',
        customFields: { ...customFields },
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'events', event.id, 'rsvps', rsvpId), {
        ...rsvpData,
        createdAt: serverTimestamp()
      });

      if (isGuest) {
        localStorage.setItem(`guest_rsvp_${event.id}`, guestInfo.email);
        setShowGuestForm(false);
      }

      // Send RSVP confirmation email
      fetch('/api/email/rsvp-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: rsvpData.userEmail,
          displayName: rsvpData.userDisplayName,
          eventTitle: event.title,
          eventDate: formatDate(event.date, { month: 'long', day: 'numeric', year: 'numeric' }),
          eventLocation: event.location,
          rsvpId: rsvpData.id
        }),
      }).catch(e => console.error('Failed to send RSVP email:', e));

      PulseService.sendPulse('RSVP', `${rsvpData.userDisplayName} RSVP'd to ${event.title}`, rsvpData.userId, { eventId: event.id, eventTitle: event.title, isGuest });

      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#ffffff']
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsRSVPLoading(false);
    }
  };

  const handleCancelRSVP = async () => {
    if (!userRSVP || !event) return;
    
    setIsRSVPLoading(true);
    try {
      await deleteDoc(doc(db, 'events', event.id, 'rsvps', userRSVP.id));
      setUserRSVP(null);
      
      // Clear localStorage if guest
      if (!user) {
        const guestEmail = localStorage.getItem(`guest_rsvp_${event.id}`);
        if (guestEmail) localStorage.removeItem(`guest_rsvp_${event.id}`);
      }
      
      PulseService.sendPulse('CANCEL_RSVP', `${userRSVP.userDisplayName} cancelled RSVP for ${event.title}`, userRSVP.userId, { eventId: event.id });
    } catch (error) {
      console.error('Cancel RSVP Error:', error);
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
      className="fixed inset-0 z-[110] bg-[#0b0b0f] overflow-y-auto custom-scrollbar"
    >
      {/* Immersive Backdrop */}
      <div className="fixed inset-0 -z-10 bg-[#0b0b0f]">
        <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden opacity-40">
            <img src={event.coverImageUrl} className="w-full h-full object-cover blur-[120px] scale-125" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0b0f]/80 to-[#0b0b0f]" />
        </div>
      </div>

      <nav className="sticky top-0 z-50 glass border-b border-white/5 h-20 flex items-center justify-center px-4 lg:px-12">
        <div className="max-w-[1400px] w-full flex items-center justify-between">
           <Button variant="ghost" size="sm" onClick={onClose} className="gap-3 rounded-2xl h-12 px-6">
                <ChevronLeft className="w-5 h-5 text-purple-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Back to Events</span>
           </Button>
           <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setShowShareDialog(true)} className="w-12 h-12 rounded-2xl border border-white/10">
                    <Share className="w-5 h-5 text-white/40 group-hover:text-white" />
                </Button>
                <div className="w-[1px] h-6 bg-white/10 mx-2" />
                <Badge className="bg-purple-600/10 text-purple-400 border-none font-black italic tracking-widest px-4 py-2 uppercase rounded-xl">
                    {event.category} EVENT
                </Badge>
            </div>
        </div>
      </nav>

      <AnimatePresence>
        {showShareDialog && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
             <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="p-12 border-white/10 bg-[#0b0b0f] space-y-10 rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">SHARE EVENT</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Invite friends to this event</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowShareDialog(false)} className="w-12 h-12 rounded-2xl">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-8 py-4">
                  <VUXQRCode value={shareUrl} size={240} className="border-none bg-transparent p-0" />
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] animate-pulse">
                     <Zap className="w-3 h-3 fill-emerald-500" />
                     <span>Live Link</span>
                  </div>
                </div>

                <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                    <p className="text-[10px] font-bold truncate text-white/20 uppercase tracking-widest pl-2">{shareUrl}</p>
                    <Button 
                      variant="ghost" 
                      onClick={copyToClipboard}
                      className={cn("h-12 w-12 rounded-2xl transition-all shrink-0", copied ? "text-emerald-400 bg-emerald-500/10" : "text-white/40")}
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {showGuestForm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl"
            >
              <Card className="p-12 border-white/10 bg-[#0b0b0f] space-y-10 rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">REGISTRATION</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Complete your entry details</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowGuestForm(false)} className="w-12 h-12 rounded-2xl">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRSVP(!user);
                  }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {!user && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-2">Full Name</label>
                          <input
                            required
                            type="text"
                            value={guestInfo.name}
                            onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                            placeholder="Enter your name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-2">Email Address</label>
                          <input
                            required
                            type="email"
                            value={guestInfo.email}
                            onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                            placeholder="your@email.com"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {event.registrationFields && event.registrationFields.length > 0 && (
                    <div className="space-y-8 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Additional Information</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {event.registrationFields.map((field, idx) => (
                          <div key={idx} className={cn("space-y-2", field.type === 'longtext' ? "md:col-span-2" : "")}>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-2">
                              {field.label} {field.required && <span className="text-pink-500 font-black">*</span>}
                            </label>
                            {field.type === 'longtext' ? (
                              <textarea
                                required={field.required}
                                value={customFields[field.label] || ''}
                                onChange={(e) => setCustomFields(prev => ({ ...prev, [field.label]: e.target.value }))}
                                className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                              />
                            ) : (
                              <input
                                required={field.required}
                                type={field.type}
                                value={customFields[field.label] || ''}
                                onChange={(e) => setCustomFields(prev => ({ ...prev, [field.label]: e.target.value }))}
                                className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit"
                    disabled={isRSVPLoading}
                    className="w-full h-20 rounded-[32px] bg-purple-600 hover:bg-purple-500 text-sm font-black italic uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/20"
                  >
                    {isRSVPLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "COMPLETE RSVP"}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          <div className="lg:col-span-8 space-y-20">
            <div className="space-y-12">
                <div className="relative aspect-[21/9] w-full rounded-[48px] overflow-hidden border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] group">
                    <img src={event.coverImageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-x-12 bottom-12 flex items-center justify-between">
                         <div className="flex -space-x-4">
                            {rsvps.slice(0, 5).map((r, i) => (
                                <Avatar key={i} src={r.userPhotoURL} size="lg" className="border-4 border-black ring-1 ring-white/10" />
                            ))}
                            {rsvps.length > 5 && (
                                <div className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40 z-10">
                                    +{rsvps.length - 5}
                                </div>
                            )}
                         </div>
                         <div className="flex items-center gap-3 bg-black/40 backdrop-blur-3xl px-6 py-3 rounded-2xl border border-white/10">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{rsvps.length} / {event.capacity} GOING</span>
                         </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-purple-500">
                           <div className="w-8 h-px bg-purple-500" />
                           <span className="text-[10px] font-black uppercase tracking-[0.4em]">About this Event</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.8] uppercase text-white">{event.title}</h1>
                    </div>
                </div>
            </div>

            <div className="prose prose-invert prose-xl max-w-none prose-p:text-white/60 prose-p:italic prose-headings:font-black prose-headings:italic prose-headings:tracking-tighter border-l-4 border-purple-500/20 pl-10">
                <ReactMarkdown>{event.description}</ReactMarkdown>
            </div>

            {/* Participants Grid */}
            <section className="space-y-12">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter">PARTICIPANTS</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Confirmed Guests</p>
                    </div>
                    <div className="w-px h-10 bg-white/5 hidden md:block" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {rsvps.filter(r => r.status === 'approved').map(rsvp => (
                        <Card key={rsvp.id} className="p-6 flex items-center gap-4 bg-white/[0.01] border-white/5 rounded-3xl hover:bg-white/[0.03] transition-all group">
                             <Avatar size="md" src={rsvp.userPhotoURL} className="border-2 border-white/5 group-hover:border-purple-500/40 transition-colors" />
                             <div className="space-y-0.5 min-w-0">
                                <span className="text-xs font-black italic uppercase tracking-tighter truncate block text-white">{rsvp.userDisplayName}</span>
                                <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest leading-none">VERIFIED USER</span>
                             </div>
                        </Card>
                    ))}
                    {rsvps.filter(r => r.status === 'approved').length === 0 && (
                        <div className="col-span-full py-16 rounded-[40px] bg-white/[0.01] border border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-4">
                            <Ghost className="w-10 h-10 text-white/5" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10 uppercase italic">Awaiting Confirmed guests</p>
                        </div>
                    )}
                </div>
            </section>
          </div>

          {/* Intelligence Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-10">
                <Card className="p-10 space-y-10 border-white/5 bg-white/[0.01] rounded-[48px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                    
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-purple-500/20 transition-all duration-700">
                                    <Calendar className="w-6 h-6 text-purple-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 leading-none">Date & Time</p>
                                    <p className="text-lg font-black italic tracking-tighter uppercase text-white">{formatDate(event.date, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    <p className="text-[10px] font-black uppercase text-emerald-500 italic tracking-widest">
                                      Starts at {(() => {
                                        if (!event.date || !event.time) return 'TBA';
                                        const dt = new Date(`${event.date}T${event.time}`);
                                        return isNaN(dt.getTime()) ? 'TBA' : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                      })()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-pink-500/20 transition-all duration-700">
                                    <MapPin className="w-6 h-6 text-pink-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 leading-none">Venue</p>
                                    <p className="text-lg font-black italic tracking-tighter uppercase text-white truncate max-w-[200px]">{event.location}</p>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 italic tracking-widest">
                                        <Globe className="w-3 h-3" />
                                        <span>GLOBAL ACCESS</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-white/5 space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">ENTRY TICKETS</p>
                            <div className="space-y-3">
                                {(event.ticketTypes || [{ name: 'Standard Access', price: 0 }]).map((tier, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-white/[0.02] border border-white/5 group/tier hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-white/[0.02] flex items-center justify-center text-white/10 group-hover/tier:text-white/40 transition-colors">
                                                <Ticket className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-black italic uppercase tracking-widest">{tier.name}</span>
                                        </div>
                                        <span className="text-lg font-black italic tracking-tighter text-white">{tier.price === 0 ? 'FREE' : `$${tier.price}`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        {userRSVP ? (
                            <div className={cn(
                                "p-10 rounded-[40px] border flex flex-col items-center gap-6 text-center relative overflow-hidden transition-all duration-700",
                                userRSVP.status === 'approved' ? "bg-emerald-500/5 border-emerald-500/10" : 
                                userRSVP.status === 'pending' ? "bg-amber-500/5 border-amber-500/10" : 
                                "bg-red-500/5 border-red-500/10"
                            )}>
                                <div className={cn(
                                    "w-20 h-20 rounded-[2.5rem] flex items-center justify-center shrink-0 border-2",
                                    userRSVP.status === 'approved' ? "bg-emerald-500 border-white/10 shadow-2xl shadow-emerald-500/20" : "bg-white/5 border-white/5"
                                )}>
                                     {userRSVP.status === 'approved' ? <CheckCircle2 className="w-10 h-10 text-white" /> : <Clock className="w-10 h-10 text-white/20" />}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black italic uppercase tracking-tighter text-white">{userRSVP.status === 'approved' ? "CONFIRMED" : "PENDING APPROVAL"}</p>
                                    <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">
                                        {userRSVP.status === 'approved' ? "You are going to this event." : "Wait for host approval."}
                                    </p>
                                </div>
                                {userRSVP.customFields && Object.keys(userRSVP.customFields).length > 0 && (
                                  <div className="w-full space-y-4 pt-6 border-t border-white/5 text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Your Registration Info</p>
                                    <div className="space-y-3">
                                      {Object.entries(userRSVP.customFields).map(([label, value]) => (
                                        <div key={label} className="space-y-1">
                                          <p className="text-[8px] font-black uppercase text-white/40 tracking-wider">{label}</p>
                                          <p className="text-xs text-white/80 font-medium break-words">{value}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {userRSVP.status === 'approved' && (
                                    <AddToCalendar event={event} className="w-full pt-8 border-t border-white/5" />
                                )}
                                
                                <Button 
                                  variant="ghost" 
                                  onClick={handleCancelRSVP}
                                  disabled={isRSVPLoading}
                                  className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors gap-2"
                                >
                                  {isRSVPLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                  CANCEL RSVP
                                </Button>
                            </div>
                        ) : (
                            <Button 
                                onClick={() => handleRSVP()} 
                                disabled={isRSVPLoading}
                                className="w-full h-20 rounded-[32px] text-xl font-black italic uppercase tracking-tighter shadow-2xl shadow-purple-500/20 group/reg bg-purple-600 hover:bg-purple-500"
                            >
                                {isRSVPLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <div className="flex items-center gap-4">
                                        <span>RSVP NOW</span>
                                        <ArrowRight className="w-6 h-6 group-hover/reg:translate-x-2 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        )}
                    </div>

                    {isHost && (
                        <div className="grid grid-cols-2 gap-4">
                            {onEdit && (
                                <Button 
                                    variant="outline" 
                                    className="w-full h-14 rounded-2xl border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                                    onClick={(e) => {
                                        onEdit(event);
                                        onClose();
                                    }}
                                >
                                    Edit Event
                                </Button>
                            )}
                            {onManage && (
                                <Button 
                                    variant="secondary" 
                                    className="w-full h-14 rounded-2xl border-white/5 text-[10px] font-black uppercase tracking-widest"
                                    onClick={() => onManage(event)}
                                >
                                    Admin View
                                </Button>
                            )}
                        </div>
                    )}
                </Card>

                <Card className="p-8 border-white/5 bg-white/[0.01] rounded-[40px] flex items-center gap-6 group hover:bg-white/[0.02] transition-all">
                    <div className="w-16 h-16 rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-purple-500/20 transition-all duration-700 shadow-inner">
                        <Avatar src={getAvatarUrl(event.hostId)} size="md" />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/20 leading-none">EVENT HOST</p>
                        <p className="text-xl font-black italic tracking-tighter uppercase text-white truncate">{event.hostName}</p>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" />
                            <span className="text-[9px] font-black uppercase text-white/10 tracking-widest italic">Verified Host</span>
                        </div>
                    </div>
                </Card>

                <div className="px-8 flex items-center gap-3">
                   <Info className="w-4 h-4 text-white/10" />
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/10 italic">Secure transmission. Your data is protected.</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
