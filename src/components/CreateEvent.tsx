/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Loader2, Ticket } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../AuthContext';
import { Event } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import confetti from 'canvas-confetti';

export function CreateEvent({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    location: '',
    coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop',
    status: 'published',
    isApprovalRequired: false,
    capacity: 0,
    ticketTypes: [{ name: 'Standard VUX Entry', price: 0 }]
  });

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const eventId = Math.random().toString(36).substring(7);
      const newEvent = {
        ...formData,
        id: eventId,
        hostId: user.uid,
        hostName: user.displayName || 'VUX Host',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'published',
      };
      await setDoc(doc(db, 'events', eventId), newEvent);
      
      // Celebration effect
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#ffffff']
      });

      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0b0b0f]/80 backdrop-blur-2xl flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="glass w-full max-w-2xl rounded-[2.5rem] overflow-hidden relative border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/10 transition-all z-10 group"
        >
          <X className="w-5 h-5 text-white/20 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
        </button>

        <div className="p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight text-white">Create Event</h2>
                        <p className="text-white/40 text-sm">Fill in the details to launch your gathering.</p>
                    </div>
                </div>

                <div className="space-y-8 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputField 
                        label="Title" 
                        value={formData.title} 
                        onChange={v => setFormData({...formData, title: v})} 
                      />
                     <InputField 
                        label="Date" 
                        value={formData.date} 
                        onChange={v => setFormData({...formData, date: v})} 
                      />
                     <InputField 
                        label="Location" 
                        value={formData.location} 
                        onChange={v => setFormData({...formData, location: v})} 
                      />
                     <InputField 
                        label="Capacity" 
                        value={formData.capacity?.toString()} 
                        onChange={v => setFormData({...formData, capacity: parseInt(v)})} 
                        type="number"
                      />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Ticketing</label>
                    <div className="space-y-3">
                      {(formData.ticketTypes || []).map((t, idx) => (
                        <div key={idx} className="flex gap-4 items-center glass p-4 rounded-2xl border-white/5 group hover:bg-white/[0.04]">
                          <Ticket className="w-5 h-5 text-white/20" />
                          <input 
                            placeholder="Ticket Name" 
                            value={t.name}
                            onChange={(e) => {
                              const newTypes = [...(formData.ticketTypes || [])];
                              newTypes[idx].name = e.target.value;
                              setFormData({...formData, ticketTypes: newTypes});
                            }}
                            className="bg-transparent border-none outline-none text-sm font-bold flex-1 text-white placeholder:text-white/10"
                          />
                          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <span className="text-white/30 text-xs">$</span>
                            <input 
                                placeholder="0" 
                                type="number"
                                value={t.price}
                                onChange={(e) => {
                                const newTypes = [...(formData.ticketTypes || [])];
                                newTypes[idx].price = parseFloat(e.target.value);
                                setFormData({...formData, ticketTypes: newTypes});
                                }}
                                className="bg-transparent border-none outline-none w-12 text-xs font-bold text-white text-right"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">About the Event</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full h-40 bg-white/[0.02] border border-white/10 rounded-2xl p-6 resize-none transition-all focus:ring-1 focus:ring-purple-500/30 outline-none text-white text-sm leading-relaxed placeholder:text-white/10"
                      placeholder="Give a brief description of the event..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button variant="outline" size="lg" className="px-8 border-white/5 w-full sm:w-auto" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="flex-1 py-7 text-lg shadow-2xl shadow-purple-500/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch on VUX Events'}
                    </Button>
                </div>
              </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InputField({ label, value, onChange, type = 'text' }: { label: string, value?: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">
        {label}
      </label>
      <Input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-4 bg-white/[0.02] border-white/10 text-sm font-semibold"
      />
    </div>
  );
}
