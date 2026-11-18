/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Download,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  Sparkles,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collectionGroup, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Event, RSVP } from '../types';
import { formatDate, cn } from '../lib/utils';
import { TicketPass } from '../components/TicketPass';
import { ModalShell } from '../components/ui/ModalShell';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import toast from 'react-hot-toast';

interface TicketItem {
  rsvp: RSVP;
  event: Event;
}

export function TicketWallet() {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'checked-in' | 'past'>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      if (!user?.email && !user?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userEmail = (user.email || '').toLowerCase().trim();
        const rsvpRef = collectionGroup(db, 'rsvps');
        
        // Query by userEmail
        const qEmail = query(rsvpRef, where('userEmail', '==', userEmail));
        const emailSnap = await getDocs(qEmail);

        // Fetch associated event for each RSVP
        const items: TicketItem[] = [];
        const seenRsvps = new Set<string>();

        for (const rDoc of emailSnap.docs) {
          const rData = { id: rDoc.id, ...rDoc.data() } as RSVP;
          if (seenRsvps.has(rData.id)) continue;
          seenRsvps.add(rData.id);

          try {
            const eventDoc = await getDoc(doc(db, 'events', rData.eventId));
            if (eventDoc.exists()) {
              items.push({
                rsvp: rData,
                event: { id: eventDoc.id, ...eventDoc.data() } as Event,
              });
            }
          } catch (e) {
            console.warn(`Could not load event ${rData.eventId}:`, e);
          }
        }

        // Sort by event date
        items.sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());
        setTickets(items);
      } catch (err) {
        console.error('Failed to load tickets in wallet:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [user]);

  const handleCancelRegistration = async (item: TicketItem) => {
    if (!window.confirm(`Are you sure you want to cancel your ticket for "${item.event.title}"?`)) {
      return;
    }

    setCancellingId(item.rsvp.id);
    try {
      await deleteDoc(doc(db, 'events', item.event.id, 'rsvps', item.rsvp.id));
      setTickets(prev => prev.filter(t => t.rsvp.id !== item.rsvp.id));
      if (selectedTicket?.rsvp.id === item.rsvp.id) {
        setSelectedTicket(null);
      }
      toast.success('Registration cancelled');
    } catch (e) {
      console.error('Failed to cancel ticket:', e);
      toast.error('Failed to cancel registration');
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date().toISOString().split('T')[0];

  const filteredTickets = tickets.filter(item => {
    const matchesSearch =
      item.event.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.rsvp.ticketCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.event.location || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'upcoming') {
      return item.event.date >= now && !item.rsvp.checkedIn;
    }
    if (filter === 'checked-in') {
      return item.rsvp.checkedIn;
    }
    if (filter === 'past') {
      return item.event.date < now;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07070a] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Helmet>
        <title>My Ticket Wallet | VUX Pass</title>
        <meta name="description" content="View, download, and manage your confirmed event tickets, QR codes, and admission passes." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-3">
            <Ticket className="w-3.5 h-3.5" />
            <span>VUX Pass &bull; Digital Wallet</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tight text-white">
            Ticket Wallet
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Access your confirmed admission passes, QR codes, and official digital tickets.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets, events..."
              className="w-full sm:w-64 h-11 pl-10 pr-4 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div className="flex rounded-xl bg-white/[0.03] border border-white/10 p-1">
            {(['all', 'upcoming', 'checked-in', 'past'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                  filter === tab ? "bg-purple-600 text-white shadow-md shadow-purple-900/40" : "text-zinc-400 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Retrieving tickets from ledger...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white/[0.01] border border-white/5 rounded-3xl p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Tickets in Wallet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {search || filter !== 'all'
                ? 'No tickets matched your filter criteria.'
                : "You haven't registered for any events yet. Explore upcoming experiences on VUX Discover."}
            </p>
            <Button
              onClick={() => window.location.href = '/discover'}
              className="bg-purple-600 hover:bg-purple-500 text-xs font-bold uppercase tracking-wider rounded-xl mt-2"
            >
              Discover Events
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map(({ rsvp, event }) => {
              const ticketCode = rsvp.ticketCode || `VUX-TKT-${(rsvp.id || '').substring(0, 8).toUpperCase()}`;
              const isPast = event.date < now;

              return (
                <motion.div
                  key={rsvp.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl bg-[#0c0c14] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300 shadow-xl group"
                >
                  {/* Card Cover & Header */}
                  <div className="relative h-36 bg-zinc-900 overflow-hidden">
                    {event.coverImageUrl ? (
                      <img
                        src={event.coverImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-950/40 via-zinc-900 to-black" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-[#0c0c14]/40 to-transparent" />

                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                        {event.category || 'EVENT'}
                      </span>

                      <span className={cn(
                        "text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border backdrop-blur-md",
                        rsvp.checkedIn ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                        rsvp.status === 'approved' ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                        "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      )}>
                        {rsvp.checkedIn ? 'Checked In' : rsvp.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-[10px] font-mono text-purple-400 block tracking-wider font-bold">
                        {ticketCode}
                      </span>
                      <h3 className="text-lg font-black italic uppercase tracking-tight text-white line-clamp-1">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="text-zinc-200 font-medium">
                          {formatDate(event.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {event.time && <span className="text-zinc-500">&bull; {event.time}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="text-zinc-300 truncate">
                          {event.isVirtual ? 'Online Virtual Event' : (event.location || 'Location TBA')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedTicket({ rsvp, event })}
                        className="flex-1 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-900/30"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View Pass</span>
                      </button>

                      <button
                        onClick={() => handleCancelRegistration({ rsvp, event })}
                        disabled={cancellingId === rsvp.id || rsvp.checkedIn || isPast}
                        title={rsvp.checkedIn ? 'Cannot cancel checked in ticket' : isPast ? 'Past event' : 'Cancel Registration'}
                        className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 hover:text-rose-400 border border-white/10 text-zinc-500 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {cancellingId === rsvp.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Pass Viewer Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <ModalShell
            onClose={() => setSelectedTicket(null)}
            badge={
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-medium text-purple-400">
                <Ticket className="w-3.5 h-3.5" />
                <span>VUX Pass &bull; Official Digital Ticket</span>
              </div>
            }
            title={selectedTicket.event.title}
            subtitle="Present this digital ticket at entry or download your PDF pass"
            maxWidth="xl"
          >
            <TicketPass
              event={selectedTicket.event}
              rsvp={selectedTicket.rsvp}
              onClose={() => setSelectedTicket(null)}
            />
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}
