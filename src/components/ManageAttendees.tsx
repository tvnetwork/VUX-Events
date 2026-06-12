/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, CheckCircle2, XCircle, Search, Mail, Loader2, QrCode, Filter, ChevronLeft, Download, ShieldCheck, TrendingUp, Ticket, Zap, Sparkles, Trash2, Plus, Share2, Copy } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { RSVP, Event } from '../types';
import { cn, getAvatarUrl } from '../lib/utils';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { VUXQRCode } from './VUXQRCode';
import { Html5QrcodeScanner } from 'html5-qrcode';

import toast from 'react-hot-toast';

export function ManageAttendees({ event, onClose }: { event: Event, onClose: () => void }) {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'checked-in' | 'waitlist'>('all');
  const [mode, setMode] = useState<'list' | 'scanner' | 'polls' | 'analytics'>('list');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [scannerInput, setScannerInput] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const shareUrl = `${window.location.origin}/discover?event=${event.id}`;

  const createPoll = async () => {
    if (!pollQuestion || pollOptions.some(o => !o)) return;
    const pollId = Math.random().toString(36).substring(7);
    const newPoll: any = {
      id: pollId,
      question: pollQuestion,
      options: pollOptions.map(text => ({ id: Math.random().toString(36).substring(7), text, votes: 0 })),
      isActive: true,
      resultsVisible: true,
      createdAt: new Date().toISOString()
    };

    try {
      const eventRef = doc(db, 'events', event.id);
      await runTransaction(db, async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        if (!eventDoc.exists()) throw new Error("Event not found");
        const eventData = eventDoc.data() as Event;
        transaction.update(eventRef, {
          polls: [...(eventData.polls || []), newPoll]
        });
      });
      setPollQuestion('');
      setPollOptions(['', '']);
      toast.success('Poll published live!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to create poll');
    }
  };

  const togglePoll = async (pollId: string) => {
    try {
      const eventRef = doc(db, 'events', event.id);
      await runTransaction(db, async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        if (!eventDoc.exists()) throw new Error("Event not found");
        const eventData = eventDoc.data() as Event;
        const updatedPolls = (eventData.polls || []).map((p: any) => 
          p.id === pollId ? { ...p, isActive: !p.isActive } : p
        );
        transaction.update(eventRef, { polls: updatedPolls });
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to toggle poll');
    }
  };

  const handleScannerCheckIn = async (code: string) => {
    if (!code.trim()) return;
    const rsvp = rsvps.find(r => r.id === code || r.userEmail?.toLowerCase() === code.toLowerCase() || r.userId === code);
    
    if (!rsvp) {
      toast.error('Ticket not found');
      return;
    }

    if (rsvp.checkedIn) {
      toast.error(`${rsvp.userDisplayName} is already checked in`);
      return;
    }

    await toggleCheckIn(rsvp.id, false);
    setScannerInput('');
    
    toast.success('Check-in successful', {
      duration: 3000,
      icon: '✅',
    });
  };

  useEffect(() => {
    const q = query(collection(db, 'events', event.id, 'rsvps'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVP));
      setRsvps(docs);
      setLoading(false);
    }, (error) => {
      console.error('ManageAttendees onSnapshot error:', error);
      setLoading(false);
    });
    return unsubscribe;
  }, [event.id]);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (mode === 'scanner') {
      try {
        scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
        scanner.render((text) => {
          const urlParams = new URLSearchParams(text.split('?')[1] || '');
          const uid = urlParams.get('user') || text;
          
          const rsvp = rsvps.find(r => r.userId === uid || r.id === uid);
          if (rsvp) {
            if (!rsvp.checkedIn) {
               toggleCheckIn(rsvp.id, false);
               toast.success(`Successfully checked in ${rsvp.userDisplayName}!`);
            } else {
               toast.error(`${rsvp.userDisplayName} is already checked in.`);
            }
          } else {
            toast.error('Invalid Ticket / User not found.');
          }
        }, (err) => {
          // ignore scan errors
        });
      } catch (e) {
        console.error("Scanner init error", e);
      }
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [mode, rsvps]);

  const updateStatus = async (rsvpId: string, status: RSVP['status']) => {
    try {
      await updateDoc(doc(db, 'events', event.id, 'rsvps', rsvpId), {
        status,
        updatedAt: serverTimestamp()
      });

      // Handle Waitlist Auto-Promotion
      if (status === 'declined' && event.capacity) {
        // Calculate approved without the newly declined user
        const currentApproved = rsvps.filter(r => r.status === 'approved' && r.id !== rsvpId).length;
        
        if (currentApproved < event.capacity) {
           const waitlisted = rsvps.filter(r => r.status === 'waitlist').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
           if (waitlisted.length > 0) {
              const nextPerson = waitlisted[0];
              await updateDoc(doc(db, 'events', event.id, 'rsvps', nextPerson.id), { 
                status: 'approved',
                updatedAt: serverTimestamp() 
              });
              
              fetch('/api/email/waitlist-promoted', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email: nextPerson.userEmail, 
                  displayName: nextPerson.userDisplayName, 
                  eventTitle: event.title 
                })
              }).catch(console.error);
              
              toast.success(`${nextPerson.userDisplayName} was auto-promoted from the waitlist!`);
           }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCheckIn = async (rsvpId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'events', event.id, 'rsvps', rsvpId), {
        checkedIn: !current,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRSVPs = rsvps
    .filter(r => 
      ((r.userDisplayName || '').toLowerCase().includes((search || '').toLowerCase()) || (r.userEmail || '').toLowerCase().includes((search || '').toLowerCase())) &&
      (filter === 'all' || 
       (filter === 'pending' && r.status === 'pending') ||
       (filter === 'approved' && r.status === 'approved') ||
       (filter === 'waitlist' && r.status === 'waitlist') ||
       (filter === 'checked-in' && r.checkedIn))
    );

  const stats = {
    total: rsvps.length,
    approved: rsvps.filter(r => r.status === 'approved').length,
    checkedIn: rsvps.filter(r => r.checkedIn).length,
    waitlist: rsvps.filter(r => r.status === 'waitlist').length,
  };

  const exportManifest = () => {
    const headers = ['Name', 'Email', 'RSVP Date', 'Status', 'Checked In'];
    const rows = rsvps.map(r => [
        r.userDisplayName,
        r.userEmail,
        new Date(r.createdAt).toLocaleDateString(),
        r.status,
        r.checkedIn ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `VUX_MANIFEST_${event.title.toUpperCase().replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0b0b0f] flex flex-col md:flex-row overflow-hidden"
    >
      {/* Sidebar - Controls & Stats */}
      <aside className="w-full md:w-80 glass border-r border-white/5 p-8 space-y-12 overflow-y-auto shrink-0 order-2 md:order-1">
        <div className="hidden md:flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="space-y-0.5">
                <h2 className="text-xl font-bold">Manager</h2>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none">Event Tools</p>
            </div>
        </div>

        <div className="space-y-6">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Analytics</label>
          <div className="grid grid-cols-2 gap-4">
            <StatBox label="Invited" value={stats.total} />
            <StatBox label="Going" value={stats.approved} />
            <StatBox label="Waitlist" value={stats.waitlist} />
            <StatBox label="Arrived" value={stats.checkedIn} />
          </div>
        </div>

        <div className="space-y-6">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Quick Filters</label>
          <nav className="space-y-1">
            <FilterBtn active={mode === 'list'} onClick={() => setMode('list')}>Attendee List</FilterBtn>
            <FilterBtn active={mode === 'scanner'} onClick={() => setMode('scanner')}>Rapid Scanner</FilterBtn>
            <FilterBtn active={mode === 'polls'} onClick={() => setMode('polls')}>Live Polls</FilterBtn>
            <FilterBtn active={mode === 'analytics'} onClick={() => setMode('analytics')}>Insights</FilterBtn>
          </nav>
        </div>

        <div className="space-y-6 pt-10 border-t border-white/5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Guest Segments</label>
          <nav className="space-y-1">
            <FilterBtn active={filter === 'all'} onClick={() => { setFilter('all'); setMode('list'); }}>All Guests</FilterBtn>
            <FilterBtn active={filter === 'pending'} onClick={() => { setFilter('pending'); setMode('list'); }}>Pending Requests</FilterBtn>
            <FilterBtn active={filter === 'waitlist'} onClick={() => { setFilter('waitlist'); setMode('list'); }}>Waitlist Queue</FilterBtn>
            <FilterBtn active={filter === 'approved'} onClick={() => { setFilter('approved'); setMode('list'); }}>Approved List</FilterBtn>
            <FilterBtn active={filter === 'checked-in'} onClick={() => { setFilter('checked-in'); setMode('list'); }}>Active Check-ins</FilterBtn>
          </nav>
        </div>

        <Card className="p-6 border-indigo-500/10 bg-indigo-500/[0.02] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Gate Control</h4>
            <p className="text-xs text-white/40 leading-relaxed">Turn your device into a QR scanner for rapid entry management.</p>
          </div>
          <Button variant="secondary" size="sm" className="w-full">Launch Scanner</Button>
        </Card>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 order-1 md:order-2 overflow-hidden">
        <header className="p-8 border-b border-white/5 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center bg-black/20 backdrop-blur-xl">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{mode} MODE</span>
             </div>
             <h1 className="text-3xl font-black italic uppercase tracking-tighter line-clamp-1">{event.title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {mode === 'list' && (
                <div className="w-full sm:w-80 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                        placeholder="Search guests..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 bg-white/5 border-white/5 h-12 rounded-2xl"
                    />
                </div>
             )}
             <Button 
                variant="outline" 
                size="sm" 
                onClick={exportManifest}
                className="h-12 px-6 rounded-2xl border-white/5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-black transition-all"
             >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
             </Button>
             <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowShareModal(true)}
                className="h-12 px-6 rounded-2xl border-white/5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-black transition-all"
             >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
             </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-white/10" />
              <p className="text-white/20 font-medium italic">Fetching guest data...</p>
            </div>
          ) : (
            <>
              {mode === 'list' && (
                <div className="space-y-4">
                  {filteredRSVPs.length > 0 ? (
                    filteredRSVPs.map(rsvp => (
                  <motion.div 
                    layout
                    key={rsvp.id} 
                    className="glass p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 group hover:bg-white/[0.04] transition-all border-white/5"
                  >
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                      <Avatar 
                        src={rsvp.userPhotoURL} 
                        fallback={getAvatarUrl(rsvp.userId)}
                        size="xl"
                        className="w-14 h-14"
                      />
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">{rsvp.userDisplayName}</h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                          <span className="flex items-center gap-1.5 text-xs text-white/30 truncate">
                            <Mail className="w-3 h-3" /> {rsvp.userEmail}
                          </span>
                          {rsvp.ticketType && (
                            <Badge variant="outline" className="text-[10px] py-0 border-pink-500/20 text-pink-400">
                                {rsvp.ticketType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-none border-white/5 pt-4 sm:pt-0">
                      {(rsvp.status === 'pending' || rsvp.status === 'waitlist') && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button 
                            onClick={() => updateStatus(rsvp.id, 'approved')} 
                            variant="primary" 
                            size="sm" 
                            className="bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white flex-1 sm:flex-none py-3 sm:py-2"
                          >
                            Approve
                          </Button>
                          {rsvp.status === 'pending' && (
                            <Button 
                              onClick={() => updateStatus(rsvp.id, 'declined')} 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-400 hover:bg-red-500/10 flex-1 sm:flex-none py-3 sm:py-2"
                            >
                              Decline
                            </Button>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-6">
                        <Badge variant="glass" className={cn(
                          "px-4 py-1.5",
                          rsvp.status === 'approved' ? "text-green-400 bg-green-500/10 border-green-500/10" : 
                          rsvp.status === 'waitlist' ? "text-blue-400 bg-blue-500/10 border-blue-500/10" : 
                          rsvp.status === 'pending' ? "text-amber-400 bg-amber-500/10 border-amber-500/10" :
                          "text-red-400 bg-red-500/10 border-red-500/10"
                        )}>
                          {rsvp.status}
                        </Badge>
                          
                          <div className="h-8 w-px bg-white/5 hidden sm:block" />

                          <button 
                            onClick={() => toggleCheckIn(rsvp.id, !!rsvp.checkedIn)}
                            className={cn(
                              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0",
                              rsvp.checkedIn 
                                ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                                : "glass text-white/50 hover:text-white hover:bg-white/10"
                            )}
                          >
                            {rsvp.checkedIn && <CheckCircle2 className="w-4 h-4" />}
                            {rsvp.checkedIn ? 'At the Event' : 'Check In'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
              ) : (
                <div className="py-20 text-center space-y-4">
                    <Filter className="w-12 h-12 text-white/5 mx-auto" />
                    <p className="text-white/30 font-medium">No results matching your request.</p>
                </div>
              )}
            </div>
          )}

          {mode === 'scanner' && (
                <div className="max-w-4xl mx-auto space-y-12 py-10">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-px bg-indigo-500/50" />
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">QR SCANNER</h2>
                    <p className="text-xs font-black uppercase tracking-[0.6em] text-white/30">Scan tickets for entry</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div className="relative aspect-square w-full rounded-[64px] border border-white/5 bg-white/[0.01] flex items-center justify-center overflow-hidden group">
                       <div className="absolute inset-0 border-[20px] border-transparent border-t-white/5 border-l-white/5 rounded-[64px] pointer-events-none" />
                       <div className="absolute inset-0 border-[20px] border-transparent border-b-white/5 border-r-white/5 rounded-[64px] pointer-events-none" />
                       
                       <motion.div 
                         animate={{ top: ['0%', '100%', '0%'] }}
                         transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                         className="absolute left-0 right-0 h-[2px] bg-indigo-500/60 shadow-[0_0_30px_rgba(99,102,241,0.8)] z-10"
                       />

                       <div className="absolute inset-0 flex items-center justify-center">
                          <div id="reader" className="w-full h-full max-w-[400px] bg-black/50 backdrop-blur-md rounded-3xl overflow-hidden flex flex-col items-center justify-center relative z-20">
                             <QrCode className="w-32 h-32 text-white/5 animate-pulse absolute -z-10" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-10">
                       <div className="space-y-6">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20 px-2">
                             <span>Manual Entry</span>
                             <span className="text-indigo-400">Search by ID or Email</span>
                          </div>
                          <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-indigo-500 transition-colors" />
                            <Input 
                              autoFocus
                              value={scannerInput}
                              onChange={(e) => setScannerInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleScannerCheckIn(scannerInput)}
                              placeholder="ID / Email / Name"
                              className="h-24 bg-white/5 border-white/10 rounded-[32px] text-center text-3xl font-black italic tracking-tighter pl-16 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                            />
                          </div>
                          <p className="text-center text-[10px] font-medium text-white/20 italic">Press Enter to check in the guest.</p>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Checked In</p>
                             <p className="text-3xl font-black italic text-indigo-400">{stats.checkedIn}</p>
                          </div>
                          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Remaining</p>
                             <p className="text-3xl font-black italic text-white/60">{stats.approved - stats.checkedIn}</p>
                          </div>
                       </div>

                       <Button 
                        onClick={() => handleScannerCheckIn(scannerInput)}
                        className="w-full h-20 rounded-[32px] bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10 gap-4 group"
                       >
                         <ShieldCheck className="w-6 h-6 group-hover:scale-110 transition-transform" />
                         <span className="text-sm font-black uppercase tracking-[0.2em]">Check In Guest</span>
                       </Button>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'polls' && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8 p-10 rounded-[40px] bg-white/[0.02] border border-white/5">
                      <div className="space-y-2">
                        <h3 className="text-xl font-black italic uppercase tracking-tight">New Broadcast</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Sync with audience in real-time</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Question</label>
                          <Input 
                            value={pollQuestion}
                            onChange={(e) => setPollQuestion(e.target.value)}
                            placeholder="What is your favorite tech stack?"
                            className="bg-white/5 border-white/5 h-14 rounded-2xl"
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Options</label>
                          {pollOptions.map((opt, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Input 
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...pollOptions];
                                  newOpts[idx] = e.target.value;
                                  setPollOptions(newOpts);
                                }}
                                placeholder={`Option ${idx + 1}`}
                                className="bg-white/5 border-white/5 h-12 rounded-xl text-xs"
                              />
                              {pollOptions.length > 2 && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                                  className="w-12 h-12 rounded-xl text-white/10 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button 
                            variant="outline" 
                            onClick={() => setPollOptions([...pollOptions, ''])}
                            className="w-full h-12 rounded-xl border-dashed border-white/10 gap-2 text-[10px] font-black uppercase tracking-widest"
                          >
                            <Plus className="w-3 h-3" /> Add Option
                          </Button>
                        </div>

                        <Button 
                          onClick={createPoll}
                          className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white gap-3"
                        >
                          <Sparkles className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Launch Poll</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {(event.polls || []).map((poll: any) => (
                        <div key={poll.id} className="p-8 rounded-[38px] bg-white/[0.01] border border-white/5 space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                               <h4 className="text-lg font-black italic uppercase tracking-tighter">{poll.question}</h4>
                               <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{poll.isActive ? 'Signal Active' : 'Broadcast Terminated'}</p>
                            </div>
                            <button 
                              onClick={() => togglePoll(poll.id)}
                              className={cn(
                                "w-12 h-6 rounded-full transition-all relative",
                                poll.isActive ? "bg-green-500" : "bg-white/10"
                              )}
                            >
                               <motion.div 
                                 animate={{ x: poll.isActive ? 24 : 4 }}
                                 className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white" 
                               />
                            </button>
                          </div>

                          <div className="space-y-2">
                             {poll.options.map((opt: any) => {
                               const total = poll.options.reduce((acc: number, cur: any) => acc + cur.votes, 0);
                               const percent = total === 0 ? 0 : Math.round((opt.votes / total) * 100);
                               return (
                                 <div key={opt.id} className="space-y-1">
                                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-2">
                                     <span className="text-white/40">{opt.text}</span>
                                     <span className="text-indigo-400">{percent}%</span>
                                   </div>
                                   <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${percent}%` }}
                                       className="h-full bg-indigo-500/50" 
                                     />
                                   </div>
                                 </div>
                               );
                             })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {mode === 'analytics' && (
                <div className="space-y-12">
                   <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-2">
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter">REVENUE & ANALYTICS</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Event Performance Report</p>
                      </div>
                      <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Live Data</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-10 rounded-[48px] bg-indigo-600 text-white space-y-8 relative overflow-hidden group shadow-2xl shadow-indigo-600/30"
                      >
                          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                              <TrendingUp className="w-24 h-24" />
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                              <TrendingUp className="w-7 h-7" />
                          </div>
                          <div className="space-y-2 relative z-10">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Total Revenue</p>
                              <h3 className="text-5xl font-black italic tracking-tighter leading-none">${(stats.approved * (event.ticketTypes?.[0]?.price || 0)).toLocaleString()}</h3>
                          </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden group"
                      >
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                              <Ticket className="w-24 h-24 text-purple-400" />
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                              <Ticket className="w-7 h-7 text-purple-400" />
                          </div>
                          <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Active Tickets</p>
                              <h3 className="text-5xl font-black italic tracking-tighter leading-none">{stats.approved}</h3>
                          </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden group"
                      >
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                              <Zap className="w-24 h-24 text-amber-400" />
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                              <Zap className="w-7 h-7 text-amber-400" />
                          </div>
                          <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Attendance Rate</p>
                              <h3 className="text-5xl font-black italic tracking-tighter leading-none">{stats.approved > 0 ? Math.round((stats.checkedIn / stats.approved) * 100) : 0}%</h3>
                          </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden group"
                      >
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                              <Users className="w-24 h-24 text-blue-400" />
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                              <Users className="w-7 h-7 text-blue-400" />
                          </div>
                          <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Waitlist Demand</p>
                              <h3 className="text-5xl font-black italic tracking-tighter leading-none">{stats.waitlist}</h3>
                          </div>
                      </motion.div>
                   </div>
                   
                   {/* Advanced Metrics / Charts would go here */}
                   <div className="p-12 rounded-[64px] bg-white/[0.01] border border-white/5 space-y-8">
                      <div className="flex items-center gap-4">
                         <div className="p-3 rounded-xl bg-indigo-500/10">
                            <TrendingUp className="w-6 h-6 text-indigo-400" />
                         </div>
                         <h4 className="text-xl font-bold">Key Performance Indicators</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                         <Metric label="RSVP Growth" value="+12%" sub="Last 24h" />
                         <Metric label="Conversion Rate" value="84%" sub="Landing to RSVP" />
                         <Metric label="Check-in Time" value="0.8s" sub="Avg per guest" />
                      </div>
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Close Button */}
      <Button 
        variant="glass" 
        size="icon" 
        onClick={onClose} 
        className="fixed bottom-8 right-8 rounded-full md:hidden w-14 h-14 shadow-2xl z-[60]"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="p-10 border-white/10 bg-[#0b0b0f] space-y-10 rounded-[48px] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">SHARE NODE</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Broadcast this signal</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowShareModal(false)} className="w-12 h-12 rounded-2xl">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-8 py-4">
                  <VUXQRCode value={shareUrl} size={240} className="border-none bg-transparent p-0" />
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] animate-pulse">
                     <Zap className="w-3 h-3 fill-indigo-500" />
                     <span>Live Signal URL</span>
                  </div>
                </div>

                <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                    <p className="text-[10px] font-bold truncate text-white/20 uppercase tracking-widest pl-2">{shareUrl}</p>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success('Signal URL copied');
                      }}
                      className="h-12 w-12 rounded-2xl text-white/40 hover:text-white"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatBox({ label, value }: { label: string, value: number }) {
  return (
    <div className="p-4 glass rounded-2xl border-white/5 space-y-1 grow text-center">
      <p className="text-[10px] uppercase tracking-wider font-black text-white/20 leading-none">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group",
        active ? "bg-white/10 text-white shadow-inner" : "text-white/40 hover:text-white/70 hover:bg-white/5"
      )}
    >
      <span>{children}</span>
      {active && <motion.div layoutId="manage-filter" className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
    </button>
  );
}

function Metric({ label, value, sub }: { label: string, value: string, subText?: string, sub?: string }) {
  return (
    <div className="space-y-1">
       <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{label}</p>
       <div className="flex items-end gap-3">
          <h5 className="text-3xl font-black italic tracking-tighter text-white">{value}</h5>
          {sub && <span className="text-[10px] font-bold text-indigo-400 mb-1">{sub}</span>}
       </div>
    </div>
  );
}
