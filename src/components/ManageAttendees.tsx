/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Mail,
  Loader2,
  QrCode,
  Filter,
  ChevronLeft,
  Download,
  ShieldCheck,
  TrendingUp,
  Ticket,
  Zap,
  Sparkles,
  Trash2,
  Plus,
  Share2,
  Copy,
  BarChart2,
  Check,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { RSVP, Event } from '../types';
import { cn, getAvatarUrl } from '../lib/utils';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { VUXQRCode } from './VUXQRCode';
import { ModalShell } from './ui/ModalShell';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';

export function ManageAttendees({ event, onClose }: { event: Event; onClose: () => void }) {
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
    if (!pollQuestion.trim() || pollOptions.some((o) => !o.trim())) return;
    const pollId = Math.random().toString(36).substring(7);
    const newPoll: any = {
      id: pollId,
      question: pollQuestion.trim(),
      options: pollOptions.map((text) => ({ id: Math.random().toString(36).substring(7), text: text.trim(), votes: 0 })),
      isActive: true,
      resultsVisible: true,
      createdAt: new Date().toISOString(),
    };

    try {
      const eventRef = doc(db, 'events', event.id);
      await runTransaction(db, async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        if (!eventDoc.exists()) throw new Error('Event not found');
        const eventData = eventDoc.data() as Event;
        transaction.update(eventRef, {
          polls: [...(eventData.polls || []), newPoll],
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
        if (!eventDoc.exists()) throw new Error('Event not found');
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
    const rsvp = rsvps.find(
      (r) =>
        r.id === code.trim() ||
        r.userEmail?.toLowerCase() === code.trim().toLowerCase() ||
        r.userId === code.trim()
    );

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

    toast.success(`Checked in ${rsvp.userDisplayName}!`, {
      duration: 3000,
      icon: '✅',
    });
  };

  useEffect(() => {
    const q = query(collection(db, 'events', event.id, 'rsvps'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RSVP));
        setRsvps(docs);
        setLoading(false);
      },
      (error) => {
        console.error('ManageAttendees onSnapshot error:', error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [event.id]);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (mode === 'scanner') {
      try {
        scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 220, height: 220 } }, false);
        scanner.render(
          (text) => {
            const urlParams = new URLSearchParams(text.split('?')[1] || '');
            const uid = urlParams.get('user') || text;

            const rsvp = rsvps.find((r) => r.userId === uid || r.id === uid);
            if (rsvp) {
              if (!rsvp.checkedIn) {
                toggleCheckIn(rsvp.id, false);
                toast.success(`Checked in ${rsvp.userDisplayName}!`);
              } else {
                toast.error(`${rsvp.userDisplayName} is already checked in.`);
              }
            } else {
              toast.error('Invalid Ticket / User not found.');
            }
          },
          () => {}
        );
      } catch (e) {
        console.error('Scanner init error', e);
      }
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((e) => console.error('Failed to clear scanner', e));
      }
    };
  }, [mode, rsvps]);

  const updateStatus = async (rsvpId: string, status: RSVP['status']) => {
    try {
      await updateDoc(doc(db, 'events', event.id, 'rsvps', rsvpId), {
        status,
        updatedAt: serverTimestamp(),
      });

      if (status === 'declined' && event.capacity) {
        const currentApproved = rsvps.filter((r) => r.status === 'approved' && r.id !== rsvpId).length;

        if (currentApproved < event.capacity) {
          const waitlisted = rsvps
            .filter((r) => r.status === 'waitlist')
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          if (waitlisted.length > 0) {
            const nextPerson = waitlisted[0];
            await updateDoc(doc(db, 'events', event.id, 'rsvps', nextPerson.id), {
              status: 'approved',
              updatedAt: serverTimestamp(),
            });

            fetch('/api/email/waitlist-promoted', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: nextPerson.userEmail,
                displayName: nextPerson.userDisplayName,
                eventTitle: event.title,
              }),
            }).catch(console.error);

            toast.success(`${nextPerson.userDisplayName} auto-promoted from waitlist!`);
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
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRSVPs = rsvps.filter(
    (r) =>
      ((r.userDisplayName || '').toLowerCase().includes((search || '').toLowerCase()) ||
        (r.userEmail || '').toLowerCase().includes((search || '').toLowerCase())) &&
      (filter === 'all' ||
        (filter === 'pending' && r.status === 'pending') ||
        (filter === 'approved' && r.status === 'approved') ||
        (filter === 'waitlist' && r.status === 'waitlist') ||
        (filter === 'checked-in' && r.checkedIn))
  );

  const stats = {
    total: rsvps.length,
    approved: rsvps.filter((r) => r.status === 'approved').length,
    checkedIn: rsvps.filter((r) => r.checkedIn).length,
    waitlist: rsvps.filter((r) => r.status === 'waitlist').length,
  };

  const exportManifest = () => {
    const headers = ['Name', 'Email', 'RSVP Date', 'Status', 'Checked In'];
    const rows = rsvps.map((r) => [
      r.userDisplayName,
      r.userEmail,
      new Date(r.createdAt).toLocaleDateString(),
      r.status,
      r.checkedIn ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `VUX_MANIFEST_${event.title.toUpperCase().replace(/\s+/g, '_')}.csv`);
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
      className="fixed inset-0 z-50 bg-[#07080f] flex flex-col overflow-hidden text-white font-sans"
    >
      {/* Top Navigation Bar */}
      <header className="h-16 px-4 sm:px-6 bg-[#0c0e17]/95 border-b border-white/[0.08] backdrop-blur-xl flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            aria-label="Back to dashboard"
            className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                Event Control
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportManifest}
            className="h-9 px-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-semibold gap-1.5 hover:bg-white/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button
            variant="kontyra"
            size="sm"
            onClick={() => setShowShareModal(true)}
            className="h-9 px-3.5 rounded-xl text-xs font-semibold gap-1.5 shadow-md shadow-blue-900/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </Button>
        </div>
      </header>

      {/* Mode Navigation Tabs (Sticky underneath top nav) */}
      <div className="bg-[#0a0b12] border-b border-white/[0.06] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide shrink-0">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'list', label: 'Attendees', icon: Users },
            { id: 'scanner', label: 'Gate Scanner', icon: QrCode },
            { id: 'polls', label: 'Live Polls', icon: Sparkles },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick summary stats in nav */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-zinc-400 pr-2">
          <span>Total: <strong className="text-white">{stats.total}</strong></span>
          <span>Approved: <strong className="text-emerald-400">{stats.approved}</strong></span>
          <span>Checked In: <strong className="text-blue-400">{stats.checkedIn}</strong></span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <StatCard label="Total RSVPs" value={stats.total} color="text-white" />
            <StatCard label="Approved" value={stats.approved} color="text-emerald-400" />
            <StatCard label="Checked In" value={stats.checkedIn} color="text-blue-400" />
            <StatCard label="Waitlist" value={stats.waitlist} color="text-amber-400" />
          </div>

          {/* MODE: ATTENDEE LIST */}
          {mode === 'list' && (
            <div className="space-y-4">
              {/* Search + Filter Chips Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full h-11 pl-10 pr-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-blue-500/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'approved', label: 'Approved' },
                    { id: 'waitlist', label: 'Waitlist' },
                    { id: 'checked-in', label: 'Checked In' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id as any)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                        filter === f.id
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white bg-white/[0.02] border border-white/[0.06]'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attendee Cards */}
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-xs text-zinc-500">Loading attendee registry...</p>
                </div>
              ) : filteredRSVPs.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredRSVPs.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={rsvp.userPhotoURL}
                          fallback={getAvatarUrl(rsvp.userId)}
                          size="md"
                          className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white truncate">
                              {rsvp.userDisplayName || 'Anonymous'}
                            </span>
                            {rsvp.ticketType && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                                {rsvp.ticketType}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
                            <span>{rsvp.userEmail}</span>
                          </p>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-none border-white/[0.06]">
                        {/* Approval buttons if pending */}
                        {(rsvp.status === 'pending' || rsvp.status === 'waitlist') && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateStatus(rsvp.id, 'approved')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Approve
                            </button>
                            {rsvp.status === 'pending' && (
                              <button
                                onClick={() => updateStatus(rsvp.id, 'declined')}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
                              >
                                Decline
                              </button>
                            )}
                          </div>
                        )}

                        {/* Status Badge */}
                        <span
                          className={cn(
                            'text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border',
                            rsvp.status === 'approved'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : rsvp.status === 'waitlist'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : rsvp.status === 'pending'
                                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          )}
                        >
                          {rsvp.status}
                        </span>

                        {/* Check-in Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleCheckIn(rsvp.id, !!rsvp.checkedIn)}
                          className={cn(
                            'h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                            rsvp.checkedIn
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                              : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10'
                          )}
                        >
                          {rsvp.checkedIn && <Check className="w-3.5 h-3.5" />}
                          <span>{rsvp.checkedIn ? 'Checked In' : 'Check In'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-2 rounded-2xl bg-white/[0.01] border border-white/[0.06]">
                  <Filter className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-sm text-zinc-400">No attendees match your filter criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* MODE: SCANNER */}
          {mode === 'scanner' && (
            <div className="space-y-6 max-w-xl mx-auto py-2">
              <div className="text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Rapid Gate Check-in</h3>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Point the camera at attendee ticket QR codes or type ticket ID
                </p>
              </div>

              {/* Camera Scanner Viewport */}
              <div className="relative aspect-square max-w-[340px] mx-auto rounded-3xl bg-black border border-white/10 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
                <div id="reader" className="w-full h-full" />
              </div>

              {/* Manual Ticket Entry Form */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Manual Check-In</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannerInput}
                    onChange={(e) => setScannerInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScannerCheckIn(scannerInput)}
                    placeholder="Enter Ticket ID or Email"
                    className="flex-1 h-12 px-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-blue-500/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <Button
                    type="button"
                    onClick={() => handleScannerCheckIn(scannerInput)}
                    disabled={!scannerInput.trim()}
                    variant="kontyra"
                    className="h-12 px-5 rounded-xl text-xs font-semibold shrink-0"
                  >
                    Check In
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* MODE: POLLS */}
          {mode === 'polls' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Poll Creation */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-white">Create Live Audience Poll</h3>
                  <p className="text-xs text-zinc-400">Gather instant feedback and votes from attendees</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">Question</label>
                    <input
                      type="text"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="e.g. Which topic would you like us to cover next?"
                      className="w-full h-11 px-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-blue-500/70 focus:bg-white/[0.06] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 block">Options</label>
                    {pollOptions.map((opt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...pollOptions];
                            newOpts[idx] = e.target.value;
                            setPollOptions(newOpts);
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 h-10 px-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-zinc-500 text-xs focus:outline-none focus:border-blue-500/70"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                            className="p-2 text-zinc-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="w-full h-9 rounded-xl border border-dashed border-white/10 text-xs font-semibold text-zinc-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Option
                    </Button>
                  </div>

                  <Button
                    type="button"
                    onClick={createPoll}
                    variant="kontyra"
                    disabled={!pollQuestion.trim() || pollOptions.some((o) => !o.trim())}
                    className="w-full h-11 rounded-xl text-xs font-semibold gap-2 shadow-lg shadow-blue-900/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Poll</span>
                  </Button>
                </div>
              </div>

              {/* Active Polls List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white px-1">Published Polls</h3>
                {(event.polls || []).length > 0 ? (
                  event.polls?.map((poll: any) => (
                    <div
                      key={poll.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">{poll.question}</h4>
                        <button
                          type="button"
                          onClick={() => togglePoll(poll.id)}
                          className={cn(
                            'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                            poll.isActive
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
                          )}
                        >
                          {poll.isActive ? 'Active' : 'Closed'}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {poll.options.map((opt: any) => {
                          const total = poll.options.reduce((acc: number, cur: any) => acc + (cur.votes || 0), 0);
                          const percent = total === 0 ? 0 : Math.round((opt.votes / total) * 100);
                          return (
                            <div key={opt.id} className="space-y-1">
                              <div className="flex justify-between text-xs text-zinc-400">
                                <span>{opt.text}</span>
                                <span className="font-semibold text-white">{percent}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center rounded-xl bg-white/[0.01] border border-white/[0.06] text-xs text-zinc-500">
                    No polls active yet. Create one on the left!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE: ANALYTICS */}
          {mode === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
                    <Ticket className="w-4 h-4 text-blue-400" />
                    <span>Confirmed Attendees</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.approved}</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Turnout Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats.approved > 0 ? Math.round((stats.checkedIn / stats.approved) * 100) : 0}%
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Waitlist Backlog</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.waitlist}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal via ModalShell */}
      {showShareModal && (
        <ModalShell
          onClose={() => setShowShareModal(false)}
          title="Share Event & Passes"
          subtitle="Direct link and QR code for attendee registrations"
          badge={
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-medium text-blue-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Public Link</span>
            </div>
          }
          maxWidth="sm"
        >
          <div className="space-y-4 text-center">
            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto">
              <VUXQRCode value={shareUrl} size={180} className="border-none bg-transparent p-0" />
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-400 truncate text-left pl-1 select-all">{shareUrl}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Link copied to clipboard!');
                }}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shrink-0 active:scale-95 transition-all cursor-pointer"
                title="Copy link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1 text-center sm:text-left">
      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
      <p className={cn('text-xl sm:text-2xl font-bold', color || 'text-white')}>{value}</p>
    </div>
  );
}
