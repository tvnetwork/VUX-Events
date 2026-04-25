/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Plus, Check, ArrowRight, Calendar as CalendarIcon, Clock, MapPin, Globe2, Info, Image as ImageIcon, Trash2, ListChecks } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../AuthContext';
import { Event } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';
import { StorageService } from '../services/StorageService';

export function CreateEvent({ onClose, eventToEdit }: { onClose: () => void, eventToEdit?: Event | null }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>(eventToEdit ? {
    ...eventToEdit,
  } : {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Workshop',
    visibility: 'public',
    capacity: 50,
    registrationFields: [],
    coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop',
  });

  const categories = ['Conference', 'Workshop', 'Meetup', 'Social', 'Webinar', 'Other'];

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const isEditing = !!eventToEdit;
      const eventId = eventToEdit ? eventToEdit.id : Math.random().toString(36).substring(7);
      
      const eventData = {
        ...formData,
        id: eventId,
        hostId: user.uid,
        hostName: user.displayName || 'VUX Host',
        updatedAt: serverTimestamp(),
      };

      if (!isEditing) {
        (eventData as any).createdAt = serverTimestamp();
        (eventData as any).status = 'published';
      }

      await setDoc(doc(db, 'events', eventId), eventData, { merge: true });
      
      if (!isEditing) {
        confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#ec4899', '#3b82f6', '#ffffff']
        });
      }

      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-[#0b0b0f] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="flex flex-col md:flex-row h-[700px]">
          {/* Sidebar Info */}
          <div className="hidden md:flex w-72 bg-white/5 border-r border-white/5 p-10 flex-col justify-between">
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Plus className="w-7 h-7 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {eventToEdit ? 'Update Event' : 'Create Event'}
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">VUX Events</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { step: 1, label: 'Details' },
                  { step: 2, label: 'Location' },
                  { step: 3, label: 'Form' },
                  { step: 4, label: 'Preview' }
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                      step === s.step ? "bg-purple-500 text-white shadow-lg shadow-purple-500/40" : (step > s.step ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40")
                    )}>
                      {step > s.step ? <Check className="w-4 h-4" /> : s.step}
                    </div>
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-widest transition-all",
                      step === s.step ? "text-white translate-x-1" : "text-white/20"
                    )}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 italic text-[10px] text-white/40 leading-relaxed">
              &quot;Creating an event makes it visible to all users in the network.&quot;
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full relative">
            <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/10 transition-all z-10"
            >
                <X className="w-5 h-5 text-white/20" />
            </button>

            <div className="flex-1 overflow-y-auto p-10 md:p-14 custom-scrollbar">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter">EVENT DETAILS</h3>
                        <p className="text-white/40 text-sm">Define the primary characteristics of your gathering.</p>
                     </div>

                     <div className="space-y-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Event Title</label>
                           <Input 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g., Summer Workshop"
                            className="bg-white/5 border-white/5 h-16 text-xl font-bold rounded-2xl focus:border-purple-500/50"
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Category</label>
                              <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl h-16 px-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                              >
                                {categories.map(c => <option key={c} value={c} className="bg-[#0b0b0f]">{c}</option>)}
                              </select>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Capacity</label>
                              <Input 
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                                className="bg-white/5 border-white/5 h-16 rounded-2xl font-bold"
                              />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Description</label>
                           <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Describe your event... What should people know?"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 h-40 text-sm focus:outline-none focus:border-purple-500/50 resize-none font-medium leading-relaxed"
                           />
                        </div>
                     </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter">LOCATION & TIME</h3>
                        <p className="text-white/40 text-sm">Where and when exactly is the event happening?</p>
                     </div>

                     <div className="space-y-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Event Location</label>
                           <div className="relative">
                             <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                             <Input 
                              value={formData.location}
                              onChange={(e) => setFormData({...formData, location: e.target.value})}
                              placeholder="Physical location or link"
                              className="bg-white/5 border-white/5 h-16 pl-14 rounded-2xl font-semibold"
                             />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Event Date</label>
                              <div className="relative">
                                <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <Input 
                                  type="date"
                                  value={formData.date}
                                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                                  className="bg-white/5 border-white/5 h-16 pl-14 rounded-2xl font-mono text-xs"
                                />
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Start Time</label>
                              <div className="relative">
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <Input 
                                  type="time"
                                  value={formData.time}
                                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                                  className="bg-white/5 border-white/5 h-16 pl-14 rounded-2xl font-mono text-xs"
                                />
                              </div>
                           </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center gap-6 text-center">
                            <div className="w-12 h-12 rounded-full glass flex items-center justify-center">
                                <Globe2 className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold uppercase tracking-widest">VISIBILITY SETTINGS</h4>
                                <p className="text-[10px] text-white/30 px-8">Choose who can see and join this event across the VUX network.</p>
                            </div>
                            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                                <button 
                                    onClick={() => setFormData({...formData, visibility: 'public'})}
                                    className={cn("px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", formData.visibility === 'public' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/30 hover:text-white')}
                                >Public</button>
                                <button 
                                    onClick={() => setFormData({...formData, visibility: 'private'})}
                                    className={cn("px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", formData.visibility === 'private' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/30 hover:text-white')}
                                >Private</button>
                            </div>
                        </div>
                     </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter">REGISTRATION FORM</h3>
                        <p className="text-white/40 text-sm">Add custom fields you want attendees to fill out.</p>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-4">
                           {formData.registrationFields?.map((field, idx) => (
                              <div key={idx} className="flex gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5 items-start">
                                 <div className="flex-1 space-y-4">
                                    <Input 
                                      value={field.label}
                                      onChange={(e) => {
                                        const newFields = [...(formData.registrationFields || [])];
                                        newFields[idx].label = e.target.value;
                                        setFormData({...formData, registrationFields: newFields});
                                      }}
                                      placeholder="Field Label (e.g., Job Title)"
                                      className="bg-transparent border-white/10 h-12"
                                    />
                                    <div className="flex gap-4">
                                      <select 
                                        value={field.type}
                                        onChange={(e) => {
                                          const newFields = [...(formData.registrationFields || [])];
                                          newFields[idx].type = e.target.value as any;
                                          setFormData({...formData, registrationFields: newFields});
                                        }}
                                        className="bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none"
                                      >
                                        <option value="text">Text</option>
                                        <option value="email">Email</option>
                                        <option value="longtext">Long Text</option>
                                      </select>
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                          type="checkbox"
                                          checked={field.required}
                                          onChange={(e) => {
                                            const newFields = [...(formData.registrationFields || [])];
                                            newFields[idx].required = e.target.checked;
                                            setFormData({...formData, registrationFields: newFields});
                                          }}
                                          className="w-4 h-4 rounded border-white/10 bg-white/5"
                                        />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Required</span>
                                      </label>
                                    </div>
                                 </div>
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => {
                                      const newFields = (formData.registrationFields || []).filter((_, i) => i !== idx);
                                      setFormData({...formData, registrationFields: newFields});
                                    }}
                                    className="text-white/20 hover:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                 </Button>
                              </div>
                           ))}
                        </div>

                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setFormData({
                              ...formData, 
                              registrationFields: [...(formData.registrationFields || []), { label: '', type: 'text', required: false }]
                            });
                          }}
                          className="w-full h-16 rounded-2xl border-dashed border-white/10 hover:border-purple-500/50 gap-3"
                        >
                          <Plus className="w-5 h-5 text-purple-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Add Custom Field</span>
                        </Button>
                     </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter">FINAL VERIFICATION</h3>
                        <p className="text-white/40 text-sm">Preview of the visual signal before deployment.</p>
                     </div>

                     <div className="space-y-8">
                        <div className="relative aspect-[21/9] rounded-3xl overflow-hidden group shadow-2xl">
                           <img src={formData.coverImageUrl} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <label className="flex items-center gap-2 h-10 px-6 rounded-full shadow-2xl bg-white text-black hover:scale-105 transition-transform cursor-pointer font-bold text-[10px] uppercase tracking-widest">
                                 <ImageIcon className="w-3.5 h-3.5" />
                                 <span>Upload Image</span>
                                 <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          setLoading(true);
                                          const url = await StorageService.uploadEventBanner(file, eventToEdit?.id || 'temp');
                                          setFormData(prev => ({ ...prev, coverImageUrl: url }));
                                        } catch (err) {
                                          console.error('Upload failed:', err);
                                        } finally {
                                          setLoading(false);
                                        }
                                      }
                                    }}
                                 />
                               </label>
                           </div>
                           <div className="absolute bottom-6 left-6 flex items-center gap-2">
                              <Badge className="bg-purple-600 text-white uppercase text-[8px] font-black tracking-widest py-1 border-none">{formData.category}</Badge>
                              <Badge className="bg-white/20 backdrop-blur-md text-white uppercase text-[8px] font-black tracking-widest py-1 border-none">{formData.visibility}</Badge>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 overflow-hidden">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Title</p>
                              <h4 className="text-sm font-bold truncate">{formData.title || 'Untitled Pulse'}</h4>
                           </div>
                           <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Occupancy</p>
                              <h4 className="text-sm font-bold">{formData.capacity} Travelers</h4>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500">
                           <Info className="w-5 h-5 shrink-0" />
                           <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Ready for grid deployment. All checks passed.</p>
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-10 md:p-14 border-t border-white/5 flex items-center justify-between bg-black/20">
                <Button 
                    variant="ghost" 
                    onClick={step === 1 ? onClose : handleBack}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] h-12"
                >
                    {step === 1 ? 'Cancel' : 'Back'}
                </Button>
                
                <div className="flex gap-4">
                    {step < totalSteps ? (
                        <Button 
                            onClick={handleNext}
                            disabled={!formData.title || !formData.date || !formData.location}
                            className="h-14 px-10 rounded-2xl shadow-xl shadow-purple-500/20 gap-3"
                        >
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Next Step</span>
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="h-14 px-10 rounded-2xl shadow-xl shadow-purple-500/20 gap-3 bg-purple-600 hover:bg-purple-500 text-white"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            <span className="text-xs font-black uppercase tracking-[0.2em]">
                                {eventToEdit ? 'Save Changes' : 'Create Event'}
                            </span>
                        </Button>
                    )}
                </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
