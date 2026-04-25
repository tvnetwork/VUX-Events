/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, CheckCircle2, XCircle, Search, Mail, Loader2, QrCode, Filter, ChevronLeft } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { RSVP, Event } from '../types';
import { cn, getAvatarUrl } from '../lib/utils';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { Input } from './ui/Input';

export function ManageAttendees({ event, onClose }: { event: Event, onClose: () => void }) {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'checked-in'>('all');

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

  const updateStatus = async (rsvpId: string, status: RSVP['status']) => {
    try {
      await updateDoc(doc(db, 'events', event.id, 'rsvps', rsvpId), {
        status,
        updatedAt: serverTimestamp()
      });
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
       (filter === 'checked-in' && r.checkedIn))
    );

  const stats = {
    total: rsvps.length,
    approved: rsvps.filter(r => r.status === 'approved').length,
    checkedIn: rsvps.filter(r => r.checkedIn).length,
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
          <div className="grid grid-cols-3 gap-4">
            <StatBox label="Invited" value={stats.total} />
            <StatBox label="Going" value={stats.approved} />
            <StatBox label="Arrived" value={stats.checkedIn} />
          </div>
        </div>

        <div className="space-y-6">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Quick Filters</label>
          <nav className="space-y-1">
            <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>All Guests</FilterBtn>
            <FilterBtn active={filter === 'pending'} onClick={() => setFilter('pending')}>Pending Requests</FilterBtn>
            <FilterBtn active={filter === 'approved'} onClick={() => setFilter('approved')}>Approved List</FilterBtn>
            <FilterBtn active={filter === 'checked-in'} onClick={() => setFilter('checked-in')}>Active Check-ins</FilterBtn>
          </nav>
        </div>

        <Card className="p-6 border-purple-500/10 bg-purple-500/[0.02] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Gate Control</h4>
            <p className="text-xs text-white/40 leading-relaxed">Turn your device into a QR scanner for rapid entry management.</p>
          </div>
          <Button variant="secondary" size="sm" className="w-full">Launch Scanner</Button>
        </Card>
      </aside>

      {/* Main Content - Guest List */}
      <main className="flex-1 flex flex-col min-w-0 order-1 md:order-2">
        <header className="p-8 border-b border-white/5 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-white/40 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{event.status} EVENT</span>
             </div>
             <h1 className="text-3xl font-bold tracking-tight line-clamp-1">{event.title}</h1>
          </div>
          <div className="w-full sm:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <Input 
              placeholder="Search guests by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 bg-white/2"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-white/10" />
              <p className="text-white/20 font-medium">Fetching guest data...</p>
            </div>
          ) : (
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
                      {rsvp.status === 'pending' ? (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button 
                            onClick={() => updateStatus(rsvp.id, 'approved')} 
                            variant="primary" 
                            size="sm" 
                            className="bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white flex-1 sm:flex-none py-3 sm:py-2"
                          >
                            Approve
                          </Button>
                          <Button 
                            onClick={() => updateStatus(rsvp.id, 'declined')} 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:bg-red-500/10 flex-1 sm:flex-none py-3 sm:py-2"
                          >
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-6">
                          <Badge variant="glass" className={cn(
                            "px-4 py-1.5",
                            rsvp.status === 'approved' ? "text-green-400 bg-green-500/10 border-green-500/10" : "text-red-400 bg-red-500/10 border-red-500/10"
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
                      )}
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
      {active && <motion.div layoutId="manage-filter" className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
    </button>
  );
}
