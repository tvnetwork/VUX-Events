/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { X, Calendar, MapPin, Users, CheckCircle2, Loader2, ChevronLeft, Share2, Heart, Clock, Ticket, Copy, QrCode, Globe, Info, Zap, ArrowRight, ShieldCheck, Share, Ghost, Sparkles, Trophy, Download, Mic } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, query, collection, where, onSnapshot, serverTimestamp, deleteDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Event, RSVP } from '../types';
import { formatDate, cn, getAvatarUrl } from '../lib/utils';
import { Countdown } from './Countdown';
import ReactMarkdown from 'react-markdown';
import { VUXQRCode } from './VUXQRCode';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { AddToCalendar } from './AddToCalendar';
import { PulseService } from '../services/PulseService';
import confetti from 'canvas-confetti';

export function EventDetails({ event, onClose, onManage, onEdit }: { event: Event, onClose: () => void, onManage?: (e: Event) => void, onEdit?: (e: Event) => void }) {
  const { user, profile } = useAuth();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isRSVPLoading, setIsRSVPLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [userRSVP, setUserRSVP] = useState<RSVP | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleExportOG = async () => {
    const element = document.getElementById('og-preview-card');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { useCORS: true, backgroundColor: '#0b0b0f', scale: 2 });
      const link = document.createElement('a');
      link.download = `SOCIAL-${event.title.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Social card exported');
    } catch (err) {
      toast.error('Failed to export social card');
    }
  };

  const [reactions, setReactions] = useState<{ [key: string]: number }>({ '🔥': 0, '⚡': 0, '🚀': 0, '🧬': 0 });
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '' });
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const [votedContestants, setVotedContestants] = useState<Set<string>>(new Set());

  const handleContestantVote = async (contestantId: string) => {
    if (votedContestants.has(contestantId) || !event.contestants) return;

    const updatedContestants = event.contestants.map((c) => {
      if (c.id === contestantId) {
        return { ...c, votes: (c.votes || 0) + 1 };
      }
      return c;
    });

    await updateDoc(doc(db, 'events', event.id), { contestants: updatedContestants });
    setVotedContestants(prev => new Set(prev).add(contestantId));
    toast.success('Vote recorded!', { icon: '🏆' });
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#fbbf24', '#f59e0b', '#ffffff']
    });
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (votedPolls.has(pollId)) return;

    try {
      const eventRef = doc(db, 'events', event.id);
      await runTransaction(db, async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        if (!eventDoc.exists()) throw new Error("Event not found");

        const currentData = eventDoc.data() as Event;
        const updatedPolls = (currentData.polls || []).map(p => {
          if (p.id === pollId) {
            return {
              ...p,
              options: p.options.map(o => 
                o.id === optionId ? { ...o, votes: (o.votes || 0) + 1 } : o
              )
            };
          }
          return p;
        });

        transaction.update(eventRef, { polls: updatedPolls });
      });

      setVotedPolls(prev => new Set(prev).add(pollId));
      localStorage.setItem(`voted_poll_${event.id}_${pollId}`, 'true');
      
      toast.success('Signal Synchronized', {
        icon: '📡',
        style: {
          background: '#0b0b0f',
          color: '#fff',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          fontSize: '11px',
          fontWeight: '900',
          letterSpacing: '0.1em'
        }
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Sync Failed');
    }
  };
  const [unlockPassword, setUnlockPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const containerRef = useState<HTMLDivElement | null>(null)[0];

  useEffect(() => {
    // Scroll the window and the container to top when event details open
    window.scrollTo(0, 0);
    
    // Also scroll the internal container if it exists
    const container = document.querySelector('.event-details-container');
    if (container) {
      container.scrollTop = 0;
    }

    // Lock body scroll when details are open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [event.id]);

  useEffect(() => {
    if (!showGuestForm) {
      setRsvpError(null);
    }
  }, [showGuestForm]);

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
        const found = rsvpList.find(r => 
          r.userId === user.uid || 
          (r.userEmail && user.email && r.userEmail.toLowerCase() === user.email.toLowerCase())
        );
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

  useEffect(() => {
    if (!event.id) return;
    const unsub = onSnapshot(doc(db, 'events', event.id), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            if (data.reactions) setReactions(data.reactions);
        }
    });
    return () => unsub();
  }, [event.id]);

  const handleReaction = async (emoji: string) => {
    if (!event.id) return;
    const eventRef = doc(db, 'events', event.id);
    const newReactions = { ...reactions, [emoji]: (reactions[emoji] || 0) + 1 };
    try {
        await updateDoc(eventRef, { reactions: newReactions });
    } catch (err) {
        console.error("Failed to update reactions", err);
    }
  };

  const shareProtocol = async () => {
    setIsSharing(true);
    try {
        if (navigator.share) {
            await navigator.share({
                title: event.title,
                text: `Synchronize with this node: ${event.description}`,
                url: window.location.href,
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            import('react-hot-toast').then(t => t.default.success("Signal Copied to Clipboard"));
        }
    } catch (err) {
        console.error("Share failed", err);
    } finally {
        setTimeout(() => setIsSharing(false), 1000);
    }
  };

  const handleRSVPTrigger = () => {
    if ((event.registrationFields && event.registrationFields.length > 0) || !user || !profile) {
      setShowGuestForm(true);
    } else {
      handleRSVP(false);
    }
  };

  const isFull = event.capacity && rsvps.filter(r => r.status === 'approved').length >= event.capacity;
  const canRSVP = !userRSVP;

  const [shareProfile, setShareProfile] = useState(true);

  const handleExportPDF = async () => {
    const element = document.getElementById('ticket-preview');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0b0b0f',
        scale: 2
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ticket-${event.title}.pdf`);
      toast.success('Ticket exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export ticket');
    }
  };

  const handleRSVP = async (isGuest = false) => {
    if (!event) return;
    
    // If event is full, user will be placed on the waitlist automatically

    setIsRSVPLoading(true);
    setRsvpError(null);
    try {
      const emailToRegister = (isGuest ? guestInfo.email : user!.email || '').toLowerCase();
      
      // Check if already registered
      const isAlreadyRegistered = rsvps.some(r => r.userEmail.toLowerCase() === emailToRegister);
      if (isAlreadyRegistered) {
        setRsvpError('This email is already registered for this event.');
        setIsRSVPLoading(false);
        return;
      }

      // Use email as a deterministic ID to prevent duplicates at the DB level
      const rsvpId = emailToRegister.replace(/[^a-zA-Z0-9@.]/g, '_');
      
      const rsvpStatus = isFull ? 'waitlist' : (event.isApprovalRequired ? 'pending' : 'approved');

      const rsvpData: RSVP = {
        id: rsvpId,
        eventId: event.id,
        userId: user?.uid || rsvpId,
        userEmail: emailToRegister,
        userDisplayName: isGuest ? guestInfo.name : profile!.displayName,
        userPhotoURL: isGuest ? getAvatarUrl(guestInfo.email) : profile!.photoURL,
        status: rsvpStatus,
        customFields: { ...customFields },
        shareProfile,
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
          eventDescription: event.description,
          eventDate: formatDate(event.date, { month: 'long', day: 'numeric', year: 'numeric' }),
          eventLocation: (event.isVirtual || event.category === 'Webinar') ? 'Virtual Meeting' : event.location,
          rawDate: event.date,
          rawTime: event.time,
          rsvpId: rsvpData.id,
          eventId: event.id
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

  const isHost = user && (
    user.uid === event.hostId || 
    event.coHostIds?.includes(user.email || '') ||
    profile?.email === 'oladoyeheritage445@gmail.com'
  );
  const needsPassword = event.visibility === 'private' && event.password && !isUnlocked && !isHost;

  const handleUnlock = () => {
    if (unlockPassword === event.password) {
      setIsUnlocked(true);
      setPasswordError(false);
      localStorage.setItem(`event_unlock_${event.id}`, 'true');
      toast.success('ACCESS GRANTED', {
        icon: '🔓',
        style: {
          background: '#0b1a0e',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          fontSize: '10px',
          fontWeight: '900',
          letterSpacing: '0.2em'
        }
      });
    } else {
      setPasswordError(true);
      toast.error('INVALID PROTOCOL KEY', {
        icon: '⚠️',
        style: {
          background: '#1a0b0b',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '10px',
          fontWeight: '900',
          letterSpacing: '0.2em'
        }
      });
    }
  };

  if (needsPassword) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050508]/95 backdrop-blur-xl">
        <Helmet>
          <title>Encrypted Node | VUX</title>
        </Helmet>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md p-12 rounded-[48px] bg-[#0b0b0f] border border-white/5 shadow-2xl text-center space-y-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-white/5 transition-all group"
          >
            <X className="w-5 h-5 text-white/20 group-hover:text-white" />
          </button>

          <div className="space-y-6 relative">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mx-auto shadow-2xl shadow-indigo-500/10 animate-pulse">
              <ShieldCheck className="w-10 h-10 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">ENCRYPTED NODE</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Restricted Access Protocol</p>
            </div>
          </div>

          <div className="space-y-6 relative">
            <div className="space-y-2">
              <p className="text-xs font-medium text-white/40 leading-relaxed italic">
                This event has been flagged as private. Please input the security clearance password to synchronize with this node.
              </p>
            </div>

            <div className="space-y-4">
               <input 
                 type="password"
                 value={unlockPassword}
                 onChange={(e) => setUnlockPassword(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                 placeholder="Clearance Password"
                 className={cn(
                   "w-full h-16 bg-white/[0.02] border rounded-2xl p-6 text-center text-xl font-bold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all",
                   passwordError ? "border-red-500/40 text-red-400" : "border-white/5 text-white"
                 )}
                 autoFocus
               />
               <Button 
                 onClick={handleUnlock}
                 className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 gap-3"
               >
                 <Zap className="w-5 h-5" />
                 <span className="text-xs font-black uppercase tracking-widest">Authorize Access</span>
               </Button>
            </div>
          </div>

          <p className="text-[10px] font-black uppercase tracking-widest text-white/10 italic">
            SECURED BY VUX QUANTUM LAYER
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-[#0b0b0f] overflow-y-auto custom-scrollbar event-details-container"
    >
      <Helmet>
        <title>{event.title} | VUX Events</title>
        <meta name="description" content={event.description.substring(0, 160)} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description.substring(0, 160)} />
        <meta property="og:image" content={event.coverImageUrl} />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Immersive Backdrop */}
      <div 
        className="fixed inset-0 -z-10 bg-[#0b0b0f]"
        style={event.theme?.backgroundUrl ? { backgroundImage: `url(${event.theme.backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!event.theme?.backgroundUrl ? (
          <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden opacity-40">
              <img src={event.coverImageUrl} className="w-full h-full object-cover blur-[120px] scale-125" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0b0f]/80 to-[#0b0b0f]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#0b0b0f]/70" />
        )}
      </div>

      <nav className="sticky top-0 z-50 glass border-b border-white/5 h-20 flex items-center justify-center px-4 lg:px-12">
        <div className="max-w-[1400px] w-full flex items-center justify-between">
           <Button variant="ghost" size="sm" onClick={onClose} className="gap-3 rounded-2xl h-12 px-6">
                <ChevronLeft className="w-5 h-5 text-purple-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Back to Events</span>
           </Button>
           <div className="flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowShareDialog(true)}
                    className={cn("w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 text-white/40 hover:text-white transition-all", isSharing && "text-indigo-400 border-indigo-500/40 bg-indigo-500/10")}
                >
                    <Share2 className={cn("w-5 h-5", isSharing && "animate-pulse")} />
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
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto custom-scrollbar">
             <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md my-auto"
            >
              <Card className="p-12 border-white/10 bg-[#0b0b0f] space-y-10 rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">SHARE EVENT</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Invite friends to this event</p>
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

                <div className="space-y-6 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Social Card</p>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleExportOG}
                            className="h-8 rounded-xl text-[8px] font-black uppercase tracking-widest gap-2 text-white/40 hover:text-white"
                        >
                            <Download className="w-3 h-3" />
                            Download
                        </Button>
                    </div>

                    <div id="og-preview-card" className="aspect-[1.91/1] w-full rounded-2xl bg-black border border-white/10 overflow-hidden relative group">
                        <img src={event.coverImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 gray-scale group-hover:grayscale-0 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 space-y-2">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400">VUX NETWORK</span>
                             </div>
                             <h4 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">{event.title}</h4>
                             <div className="flex items-center gap-4 text-[8px] font-bold text-white/40 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Calendar className="w-2.5 h-2.5" /> {event.date}</span>
                                <span className="flex items-center gap-1.5">{(event.isVirtual || event.category === 'Webinar') ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />} {(event.isVirtual || event.category === 'Webinar') ? 'Virtual Event' : event.location}</span>
                             </div>
                        </div>
                    </div>
                    <p className="text-[8px] text-center text-white/20 font-medium italic">Optimized for Twitter, LinkedIn, and Instagram previews</p>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {showGuestForm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl my-auto"
            >
              <Card className="p-12 border-white/10 bg-[#0b0b0f] space-y-10 rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">REGISTRATION</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Complete your entry details</p>
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
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 ml-2">Full Name</label>
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
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 ml-2">Email Address</label>
                          <input
                            required
                            type="email"
                            value={guestInfo.email}
                            onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                            className={cn(
                              "w-full h-14 bg-white/[0.03] border rounded-2xl px-6 text-white text-sm focus:outline-none transition-colors",
                              rsvpError ? "border-pink-500/50" : "border-white/10 focus:border-purple-500/50"
                            )}
                            placeholder="your@email.com"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {rsvpError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[10px] font-black uppercase tracking-widest text-center"
                    >
                      {rsvpError}
                    </motion.div>
                  )}

                  {event.registrationFields && event.registrationFields.length > 0 && (
                    <div className="space-y-8 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">REGISTRATION DETAILS</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {event.registrationFields.map((field, idx) => (
                          <div key={idx} className={cn("space-y-3", (field.type === 'longtext' || field.type === 'multichoice') ? "md:col-span-2" : "")}>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">
                              {field.label} {field.required && <span className="text-pink-500 font-black">*</span>}
                            </label>
                            
                            {field.type === 'longtext' ? (
                              <textarea
                                required={field.required}
                                value={customFields[field.label] || ''}
                                onChange={(e) => setCustomFields(prev => ({ ...prev, [field.label]: e.target.value }))}
                                className="w-full h-40 bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors resize-none font-medium"
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                              />
                            ) : field.type === 'select' ? (
                              <Select 
                                value={customFields[field.label] || ''}
                                onChange={(val) => setCustomFields(prev => ({ ...prev, [field.label]: val }))}
                                options={(field.options || []).map(opt => ({ value: opt, label: opt }))}
                                placeholder="Select an option"
                                className="h-16"
                              />
                            ) : field.type === 'multichoice' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(field.options || []).map(opt => {
                                        const values = (customFields[field.label] || '').split(',').filter(Boolean);
                                        const isSelected = values.includes(opt);
                                        return (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => {
                                                    let newValues;
                                                    if (isSelected) {
                                                        newValues = values.filter(v => v !== opt);
                                                    } else {
                                                        newValues = [...values, opt];
                                                    }
                                                    setCustomFields(prev => ({ ...prev, [field.label]: newValues.join(',') }));
                                                }}
                                                className={cn(
                                                    "h-14 rounded-2xl border px-6 flex items-center justify-between transition-all group/opt",
                                                    isSelected ? "bg-indigo-500/10 border-indigo-500/40" : "bg-white/[0.02] border-white/10 hover:border-white/20"
                                                )}
                                            >
                                                <span className={cn("text-xs font-bold uppercase tracking-widest", isSelected ? "text-indigo-400" : "text-white/40 group-hover/opt:text-white")}>{opt}</span>
                                                <div className={cn(
                                                    "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                                    isSelected ? "bg-indigo-500 border-indigo-500" : "border-white/10 group-hover/opt:border-white/20"
                                                )}>
                                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : field.type === 'checkbox' ? (
                                <button
                                    type="button"
                                    onClick={() => setCustomFields(prev => ({ ...prev, [field.label]: prev[field.label] === 'true' ? 'false' : 'true' }))}
                                    className={cn(
                                        "w-full h-16 rounded-2xl border px-6 flex items-center justify-between transition-all group/chk",
                                        customFields[field.label] === 'true' ? "bg-indigo-500/10 border-indigo-500/40" : "bg-white/[0.02] border-white/10 hover:border-white/20"
                                    )}
                                >
                                    <span className={cn("text-xs font-bold uppercase tracking-widest", customFields[field.label] === 'true' ? "text-indigo-400" : "text-white/40 group-hover/chk:text-white")}>{field.label}</span>
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                        customFields[field.label] === 'true' ? "bg-indigo-500 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "border-white/10 group-hover/chk:border-white/20"
                                    )}>
                                        {customFields[field.label] === 'true' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>
                                </button>
                            ) : (
                              <input
                                required={field.required}
                                type={field.type === 'phone' ? 'tel' : field.type}
                                value={customFields[field.label] || ''}
                                onChange={(e) => setCustomFields(prev => ({ ...prev, [field.label]: e.target.value }))}
                                className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors font-bold"
                                placeholder={`Enter your ${field.label.toLowerCase()}`}
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
                    className="w-full h-20 rounded-[32px] bg-indigo-600 hover:bg-indigo-500 text-sm font-black italic uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20"
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
                         <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10">
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
                        <div className="pt-8">
                            <Countdown targetDate={event.date} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="prose prose-invert prose-xl max-w-none prose-p:text-white/60 prose-p:italic prose-headings:font-black prose-headings:italic prose-headings:tracking-tighter border-l-4 border-purple-500/20 pl-10">
                <ReactMarkdown>{event.description}</ReactMarkdown>
            </div>

            {/* Community Reactions */}
            <div className="flex flex-wrap gap-4 pt-4">
                {Object.entries(reactions).map(([emoji, count]) => (
                    <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all active:scale-95"
                    >
                        <span className="text-2xl group-hover:scale-125 transition-transform">{emoji}</span>
                        <span className="text-xs font-black italic text-white/30 group-hover:text-indigo-400">{count}</span>
                    </button>
                ))}
            </div>

            {/* Live Interaction Section */}
            {event.polls && event.polls.some(p => p.isActive) && (
              <section className="space-y-12">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">LIVE BROADCAST</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Real-time audience interaction</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {event.polls.filter(p => p.isActive).map(poll => (
                    <div key={poll.id} className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8">
                        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                      </div>
                      
                      <div className="space-y-2 relative">
                        <h4 className="text-2xl font-black italic uppercase tracking-tight leading-tight">{poll.question}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Select one option to cast signal</p>
                      </div>

                      <div className="space-y-3 relative">
                        {poll.options.map((option) => {
                          const total = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                          const percentage = total === 0 ? 0 : Math.round((option.votes / total) * 100);
                          const hasVoted = votedPolls.has(poll.id);

                          return (
                            <button
                                key={option.id}
                                disabled={hasVoted}
                                onClick={() => handleVote(poll.id, option.id)}
                                className={cn(
                                    "w-full p-6 rounded-3xl text-left transition-all relative overflow-hidden group/opt border",
                                    hasVoted ? "bg-white/[0.02] border-white/5 cursor-default" : "bg-white/5 border-white/5 hover:border-indigo-500/50 hover:bg-white/10"
                                )}
                            >
                                <div 
                                    className="absolute inset-0 bg-indigo-500/10 transition-all duration-1000"
                                    style={{ width: hasVoted ? `${percentage}%` : '0%' }}
                                />
                                <div className="flex justify-between items-center relative z-10">
                                    <span className={cn(
                                        "text-xs font-black uppercase tracking-widest",
                                        hasVoted ? "text-white/60" : "text-white group-hover/opt:text-indigo-400"
                                    )}>
                                        {option.text}
                                    </span>
                                    {hasVoted && (
                                        <span className="text-[10px] font-black font-mono text-indigo-400">
                                            {percentage}%
                                        </span>
                                    )}
                                </div>
                            </button>
                          );
                        })}
                      </div>

                      {votedPolls.has(poll.id) && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/20 pt-4"
                          >
                              Signal Recorded. Results Syncing...
                          </motion.p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contestants Section */}
            {event.contestants && event.contestants.length > 0 && (
              <section className="space-y-12">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">CONTESTANT LINEUP</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Select your favorite to win</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {event.contestants.map((contestant) => {
                    const hasVoted = votedContestants.has(contestant.id);
                    const totalVotes = event.contestants?.reduce((acc, curr) => acc + (curr.votes || 0), 0) || 0;
                    const percentage = totalVotes === 0 ? 0 : Math.round(((contestant.votes || 0) / totalVotes) * 100);

                    return (
                      <div 
                        key={contestant.id} 
                        className={cn(
                          "relative group p-10 rounded-[48px] bg-white/[0.01] border transition-all duration-500 overflow-hidden",
                          hasVoted ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/5 hover:border-white/20"
                        )}
                      >
                        <div className="absolute top-0 right-0 p-8">
                          <Badge className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-3 py-1.5 border-none",
                            hasVoted ? "bg-yellow-500 text-black" : "bg-white/5 text-white/40"
                          )}>
                            {hasVoted ? 'YOUR VOTE' : `${percentage}% SUPPORT`}
                          </Badge>
                        </div>

                        <div className="space-y-8 relative z-10">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                              {contestant.photoUrl ? (
                                <img src={contestant.photoUrl} className="w-full h-full object-cover" />
                              ) : (
                                <Trophy className="w-8 h-8 text-white/10" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-2xl font-black italic uppercase tracking-tight">{contestant.name}</h4>
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{contestant.role || 'Competitor'}</p>
                            </div>
                          </div>

                          <p className="text-xs font-medium text-white/40 leading-relaxed italic line-clamp-3">
                            {contestant.bio || "This contestant has entered the arena but has not yet provided a biography."}
                          </p>

                          <div className="pt-4 space-y-4">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
                              />
                            </div>
                            <Button 
                              onClick={() => handleContestantVote(contestant.id)}
                              disabled={hasVoted}
                              variant={hasVoted ? "outline" : "primary"}
                              className={cn(
                                "w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2",
                                hasVoted ? "border-yellow-500/20 text-yellow-500" : "bg-white text-black hover:scale-[1.02]"
                              )}
                            >
                              {hasVoted ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                              {hasVoted ? 'VOTE RECORDED' : 'CAST YOUR VOTE'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Speakers Section */}
            {event.speakers && event.speakers.length > 0 && (
                <section className="space-y-16 py-20 border-t border-white/5">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-px bg-indigo-500" />
                                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-500">HEADLINERS</span>
                            </div>
                            <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">THE STAGE</h3>
                            <p className="text-sm font-medium text-white/40 max-w-md">Our visionaries and industry leaders taking the node to broadcast the next generation of ideas.</p>
                        </div>
                        <div className="hidden md:block">
                            <Badge className="bg-white/5 text-white/40 border-none font-mono text-[10px] tracking-widest px-4 py-2">
                                {event.speakers.length} VISIONARIES ACTIVE
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {event.speakers.map((speaker, idx) => (
                            <motion.div 
                                key={speaker.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] bg-white/[0.02] border border-white/5 transition-all duration-700 group-hover:border-indigo-500/50 group-hover:bg-white/[0.05] group-hover:translate-y-[-8px] group-hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)]">
                                    {speaker.photoUrl ? (
                                        <img 
                                            src={speaker.photoUrl} 
                                            className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" 
                                            alt={speaker.name}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-white/[0.02]">
                                            <Mic className="h-20 w-20 text-white/[0.02] group-hover:text-indigo-500/20 transition-all duration-700" />
                                        </div>
                                    )}
                                    
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                                    
                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-10 space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">{speaker.role}</p>
                                            <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none whitespace-normal break-words">{speaker.name}</h4>
                                        </div>
                                        
                                        <div className="h-px w-0 bg-white/20 group-hover:w-full transition-all duration-1000 delay-200" />
                                        
                                        <p className="text-xs font-medium text-white/50 leading-relaxed italic line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300">
                                            {speaker.bio || "Visionary speaker ready to transform the industry standard."}
                                        </p>
                                    </div>

                                    {/* Corner Accent */}
                                    <div className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 rotate-12 group-hover:rotate-0">
                                        <Zap className="w-5 h-5 text-indigo-400" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Sponsors Section */}
            {event.sponsors && event.sponsors.length > 0 && (
                <section className="space-y-12">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">SPONSORS</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Powered by the best</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {event.sponsors.map((sponsor, idx) => (
                            <a 
                                key={idx} 
                                href={sponsor.websiteUrl || '#'} 
                                target="_blank" 
                                rel="noreferrer"
                                className="group flex flex-col items-center justify-center p-8 rounded-[40px] bg-white/[0.01] border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all duration-500"
                            >
                                {sponsor.logoUrl ? (
                                    <img src={sponsor.logoUrl} alt={sponsor.name} className="h-16 w-auto object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                                ) : (
                                    <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/20 font-black italic text-xl group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                                        {sponsor.name.charAt(0)}
                                    </div>
                                )}
                                <div className="mt-6 text-center space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{sponsor.name}</p>
                                    <Badge className="bg-white/5 text-white/20 border-none group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors uppercase text-[8px] font-black tracking-tighter">
                                        {sponsor.tier} Partner
                                    </Badge>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {/* Networking Section */}
            {!event.hideParticipants && (
                <section className="space-y-12">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">WHO&apos;S GOING</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Networking & Directory</p>
                        </div>
                        <div className="w-px h-10 bg-white/5 hidden md:block" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {rsvps.filter(r => r.status === 'approved').map(rsvp => (
                            <Card key={rsvp.id} className="p-6 flex flex-col items-center gap-4 bg-white/[0.01] border-white/5 rounded-3xl hover:bg-white/[0.03] transition-all group">
                                 <Avatar size="lg" src={rsvp.userPhotoURL} className="border-2 border-white/5 group-hover:border-purple-500/40 transition-colors" />
                                 <div className="space-y-1 text-center min-w-0 w-full">
                                    <span className="text-xs font-black italic uppercase tracking-tighter truncate block text-white">{rsvp.userDisplayName}</span>
                                    {rsvp.shareProfile ? (
                                        <Badge className="bg-indigo-500/10 text-indigo-400 border-none text-[7px] uppercase font-black px-2">Networking Active</Badge>
                                    ) : (
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">PRIVATE PROFILE</span>
                                    )}
                                 </div>
                                 {rsvp.shareProfile && rsvp.userId && rsvp.userId !== user?.uid && (
                                     <Button variant="ghost" size="sm" className="w-full text-[8px] font-black uppercase tracking-widest h-8 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">Connect</Button>
                                 )}
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {event.hideParticipants && (
                <section className="p-16 rounded-[48px] bg-white/[0.01] border border-white/5 text-center space-y-6">
                    <ShieldCheck className="w-12 h-12 text-indigo-500/40 mx-auto" />
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white/60">GUEST LIST PRIVATE</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">The host has kept the participant list private for this event.</p>
                    </div>
                </section>
            )}
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
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 leading-none">Date & Time</p>
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
                                    {(event.isVirtual || event.category === 'Webinar') ? <Video className="w-6 h-6 text-pink-500" /> : <MapPin className="w-6 h-6 text-pink-500" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 leading-none">{(event.isVirtual || event.category === 'Webinar') ? 'Virtual' : 'Venue'}</p>
                                    <p className="text-lg font-black italic tracking-tighter uppercase text-white truncate max-w-[200px]">
                                      {(event.isVirtual || event.category === 'Webinar') ? 'Online Meeting' : event.location}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 italic tracking-widest">
                                        <Globe className="w-3 h-3" />
                                        <span>GLOBAL ACCESS</span>
                                    </div>
                                    {(event.isVirtual || event.category === 'Webinar') && event.meetingLink && userRSVP?.status === 'approved' && (
                                        <Button 
                                            onClick={() => window.open(event.meetingLink, '_blank')}
                                            className="h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 mt-2 shadow-lg shadow-blue-500/20"
                                        >
                                            JOIN MEETING
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-white/5 space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">ENTRY TICKETS</p>
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
                                userRSVP.status === 'waitlist' ? "bg-blue-500/5 border-blue-500/10" :
                                userRSVP.status === 'pending' ? "bg-amber-500/5 border-amber-500/10" : 
                                "bg-red-500/5 border-red-500/10"
                            )}>
                                <div id="ticket-preview" className={cn(
                                    "w-20 h-20 rounded-[2.5rem] flex items-center justify-center shrink-0 border-2",
                                    userRSVP.status === 'approved' ? "bg-emerald-500 border-white/10 shadow-2xl shadow-emerald-500/20" : 
                                    userRSVP.status === 'waitlist' ? "bg-blue-500 border-white/10 shadow-2xl shadow-blue-500/20" :
                                    "bg-white/5 border-white/5"
                                )}>
                                     {userRSVP.status === 'approved' ? <CheckCircle2 className="w-10 h-10 text-white" /> : 
                                      userRSVP.status === 'waitlist' ? <Clock className="w-10 h-10 text-white" /> :
                                      <Clock className="w-10 h-10 text-white/20" />}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                        {userRSVP.status === 'approved' ? "CONFIRMED" : 
                                         userRSVP.status === 'waitlist' ? "WAITLISTED" : "PENDING APPROVAL"}
                                    </p>
                                    <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">
                                        {userRSVP.status === 'approved' ? "You are going to this event." : 
                                         userRSVP.status === 'waitlist' ? "The event is currently full. We'll notify you if a spot opens up." :
                                         "Wait for host approval."}
                                    </p>
                                </div>
                                {userRSVP.status === 'approved' && (
                                  <Button 
                                    variant="outline" 
                                    onClick={handleExportPDF}
                                    className="w-full rounded-2xl border-white/5 py-4 text-[10px] font-black uppercase tracking-widest gap-3 hover:bg-white/5"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download PDF Ticket
                                  </Button>
                                )}
                                {userRSVP.customFields && Object.keys(userRSVP.customFields).length > 0 && (
                                  <div className="w-full space-y-4 pt-6 border-t border-white/5 text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Your Registration Info</p>
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
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setShareProfile(!shareProfile)}
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            shareProfile ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/40" : "bg-white/5 border border-white/10 text-white/20"
                                        )}
                                    >
                                        <Users className="w-5 h-5" />
                                    </button>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none">NETWORK OPT-IN</p>
                                        <p className="text-[9px] font-medium text-white/40 italic">Share your profile in the networking directory.</p>
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleRSVPTrigger} 
                                    disabled={isRSVPLoading}
                                    style={event.theme?.primaryColor ? { backgroundColor: event.theme.primaryColor, boxShadow: `0 25px 50px -12px ${event.theme.primaryColor}33` } : {}}
                                    className={cn(
                                        "w-full h-20 rounded-[32px] text-xl font-black italic uppercase tracking-tighter transition-all group/reg",
                                        !event.theme?.primaryColor && (isFull ? "bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-500/20" : "bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20")
                                    )}
                                >
                                {isRSVPLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <div className="flex items-center gap-4">
                                        <span>{isFull ? "JOIN WAITLIST" : "RSVP NOW"}</span>
                                        <ArrowRight className="w-6 h-6 group-hover/reg:translate-x-2 transition-transform" />
                                    </div>
                                )}
                            </Button>
                          </div>
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
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/60 leading-none">EVENT HOST</p>
                        <p className="text-xl font-black italic tracking-tighter uppercase text-white truncate">{event.hostName}</p>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" />
                            <span className="text-[9px] font-black uppercase text-white/10 tracking-widest italic">Verified Host</span>
                        </div>
                    </div>
                </Card>

                {event.socialLinks && (Object.values(event.socialLinks).some(link => link)) && (
                    <Card className="p-8 border-white/5 bg-white/[0.01] rounded-[40px] space-y-6 group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-px bg-indigo-500/30" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">COMMUNITY</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {event.socialLinks.discord && (
                                <a 
                                    href={event.socialLinks.discord.startsWith('http') ? event.socialLinks.discord : `https://${event.socialLinks.discord}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all group/link"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#5865F2]/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993.023.03.063.04.084.028a19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
                                            </svg>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white">DISCORD SIGNAL</p>
                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter italic">Join the node</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-white/10 group-hover/link:text-indigo-400 group-hover/link:translate-x-1 transition-all" />
                                </a>
                            )}
                            {event.socialLinks.tiktok && (
                                <a 
                                    href={event.socialLinks.tiktok.startsWith('http') ? event.socialLinks.tiktok : `https://tiktok.com/${event.socialLinks.tiktok.startsWith('@') ? event.socialLinks.tiktok : `@${event.socialLinks.tiktok}`}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-pink-500/40 hover:bg-pink-500/10 transition-all group/link"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.52-4.14-1.32-.7-.44-1.35-.98-1.91-1.61-.01 2.93-.01 5.85-.01 8.78 0 2.25-.63 4.51-2.02 6.27-1.15 1.46-2.82 2.48-4.66 2.8-1.52.28-3.13.16-4.59-.44-1.58-.63-2.92-1.84-3.79-3.32-.9-1.54-1.25-3.37-1-5.14.28-1.92 1.25-3.77 2.82-4.99 1.48-1.15 3.39-1.74 5.27-1.64.03 1.41.02 2.81.02 4.22-1.07-.11-2.21.05-3.14.65-.92.59-1.54 1.65-1.58 2.75-.03 1.12.5 2.23 1.34 3 1.02.94 2.58 1.16 3.73.54.83-.44 1.37-1.3 1.4-2.22.02-4.44.01-8.89.01-13.34h.02z"/>
                                            </svg>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white">TIKTOK FEED</p>
                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter italic">Experience live</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-white/10 group-hover/link:text-pink-400 group-hover/link:translate-x-1 transition-all" />
                                </a>
                            )}
                        </div>
                    </Card>
                )}

                <div className="px-8 flex items-center gap-3">
                   <Info className="w-4 h-4 text-white/10" />
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/50 italic">Secure transmission. Your data is protected.</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
