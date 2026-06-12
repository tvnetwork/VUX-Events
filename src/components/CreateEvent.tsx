/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { X, Loader2, Plus, Check, ArrowRight, Calendar as CalendarIcon, Clock, MapPin, Globe2, Info, Image as ImageIcon, Trash2, ListChecks, Mic, Wrench, Users, PartyPopper, Video, TrendingUp, Sparkles, Building2, Ticket, Trophy, Upload, Shield, Mail, Link as LinkIcon } from 'lucide-react';
import { doc, setDoc, serverTimestamp, collection, getDocs, query } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { useAuth } from '../AuthContext';
import { Event, Speaker, Sponsor, Contestant } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Select } from './ui/Select';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';
import { ImageUpload } from './ImageUpload';
import { StorageService } from '../services/StorageService';
import { SiteConfigService } from '../services/SiteConfigService';
import { useEffect } from 'react';
import { VUXQRCode } from './VUXQRCode';
import { Copy, Share2 } from 'lucide-react';

export function CreateEvent({ onClose, eventToEdit }: { onClose: () => void, eventToEdit?: Event | null }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const q = query(collection(db, 'collections'));
        const querySnapshot = await getDocs(q);
        const fetchedCollections = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched collections:', fetchedCollections.length);
        setCollections(fetchedCollections);
      } catch (err: any) {
        if (err.code === 'permission-denied') {
          handleFirestoreError(err, 'list', 'collections');
        }
        console.error('Failed to fetch collections', err);
      }
    };
    fetchCollections();
  }, []);

  const [categories, setCategories] = useState<string[]>(['Conference', 'Workshop', 'Meetup', 'Social', 'Webinar', 'Other']);
  const [formData, setFormData] = useState<Partial<Event>>(eventToEdit ? {
    ...eventToEdit,
  } : {
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    category: 'Workshop',
    visibility: 'public',
    capacity: 50,
    registrationFields: [],
    coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop',
  });

  useEffect(() => {
    if (eventToEdit) {
      setFormData({ ...eventToEdit });
      setStep(2);
    } else {
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        endTime: '',
        location: '',
        category: 'Workshop',
        visibility: 'public',
        capacity: 50,
        registrationFields: [],
        coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop',
      });
      setStep(1);
    }
  }, [eventToEdit]);

  const EVENT_TYPES = [
    { id: 'Conference', label: 'Conference', icon: <Mic className="w-6 h-6" />, description: 'Formal gathering for experts', color: 'from-blue-500/20 to-indigo-500/20' },
    { id: 'Workshop', label: 'Workshop', icon: <Wrench className="w-6 h-6" />, description: 'Hands-on practical training', color: 'from-amber-500/20 to-orange-500/20' },
    { id: 'Meetup', label: 'Meetup', icon: <Users className="w-6 h-6" />, description: 'Casual community gathering', color: 'from-emerald-500/20 to-teal-500/20' },
    { id: 'Social', label: 'Social', icon: <PartyPopper className="w-6 h-6" />, description: 'Parties and celebrations', color: 'from-pink-500/20 to-rose-500/20' },
    { id: 'Webinar', label: 'Webinar', icon: <Video className="w-6 h-6" />, description: 'Digital online session', color: 'from-cyan-500/20 to-blue-500/20' },
    { id: 'Summit', label: 'Summit', icon: <TrendingUp className="w-6 h-6" />, description: 'Strategic industry meeting', color: 'from-purple-500/20 to-fuchsia-500/20' },
    { id: 'Exhibition', label: 'Exhibition', icon: <Building2 className="w-6 h-6" />, description: 'Showcasing products or art', color: 'from-violet-500/20 to-purple-500/20' },
    { id: 'Contest', label: 'Contest', icon: <Trophy className="w-6 h-6" />, description: 'Talent shows, hackathons, or awards', color: 'from-yellow-500/20 to-amber-500/20' },
    { id: 'Other', label: 'Other', icon: <Sparkles className="w-6 h-6" />, description: 'Something entirely unique', color: 'from-gray-500/20 to-slate-500/20' },
  ];

  useEffect(() => {
    SiteConfigService.getConfig().then(config => {
      setCategories(config.categories);
      if (!eventToEdit && config.categories.length > 0) {
        setFormData(prev => ({ ...prev, category: config.categories[0] }));
      }
    });
  }, [eventToEdit]);

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
        setCreatedEventId(eventId);
        setShowSuccess(true);
      } else {
        toast.success('Event updated successfully');
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStepConfig = () => {
    const cat = formData.category || '';
    const isVirtual = cat === 'Webinar' || formData.isVirtual;
    const isSocial = cat === 'Social' || cat === 'Meetup';
    const isContest = cat === 'Contest';

    const stepsList = [
      { id: 'type', label: 'Type' },
      { id: 'details', label: 'Details' },
      { id: isVirtual ? 'virtual' : 'location', label: isVirtual ? 'Virtual Link' : 'Location' }
    ];

    if (!isSocial && !isVirtual) stepsList.push({ id: 'sponsors', label: 'Sponsors' });
    if (isContest) stepsList.push({ id: 'contestants', label: 'Contestants' });
    if (!isSocial) stepsList.push({ id: 'speakers', label: 'Speakers' });
    if (!isSocial) stepsList.push({ id: 'form', label: 'Form' });
    
    stepsList.push({ id: 'theme', label: 'Theme' });
    stepsList.push({ id: 'preview', label: 'Preview' });

    return stepsList.map((s, index) => ({ ...s, step: index + 1 }));
  };

  const steps = getStepConfig();
  const currentStepId = steps[step - 1]?.id;
  const totalSteps = steps.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-[#0b0b0f] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl my-auto"
      >
        {showSuccess && createdEventId ? (
          <div className="p-12 md:p-20 text-center space-y-12">
            <div className="space-y-6">
              <div className="w-24 h-24 rounded-[32px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mx-auto">
                <Check className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Event Published!</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Your signal is live on the network</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8">
              <div className="p-8 rounded-[48px] bg-white/[0.02] border border-white/5">
                <VUXQRCode value={`${window.location.origin}/discover?event=${createdEventId}`} size={240} className="border-none bg-transparent p-0" />
              </div>
              
              <div className="w-full max-w-md space-y-4">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                  <p className="text-[10px] font-bold truncate text-white/20 uppercase tracking-widest pl-2">
                    {`${window.location.origin}/discover?event=${createdEventId}`}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/discover?event=${createdEventId}`);
                      toast.success('Link copied to clipboard');
                    }}
                    className="h-12 w-12 rounded-2xl text-white/40 hover:text-white"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
                
                <Button 
                  onClick={onClose}
                  className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row min-h-[500px] max-h-[90vh] md:h-[700px]">
          {/* Sidebar Info */}
          <div className="hidden md:flex w-72 bg-white/5 border-r border-white/5 p-10 flex-col justify-between">
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Plus className="w-7 h-7 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {eventToEdit ? 'Update Event' : 'Create Event'}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60">Event Setup</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Check className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Host Like a Pro</span>
                </div>
                <p className="text-[10px] font-medium text-white/40 leading-relaxed italic">
                  You're using the best platform for events. Manage guests, track check-ins, and build community with ease.
                </p>
              </div>

              <div className="space-y-6">
                {steps.map((s) => (
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
                {currentStepId === 'type' && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter italic text-white">EVENT TYPE</h3>
                        <p className="text-white/40 text-sm">Select the nature of your gathering to optimize experience.</p>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {EVENT_TYPES.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => {
                              setFormData({ ...formData, category: type.id as any });
                              handleNext();
                            }}
                            className={cn(
                              "p-6 rounded-3xl border transition-all duration-300 group text-left relative overflow-hidden",
                              formData.category === type.id 
                                ? "bg-white/10 border-indigo-500/50 shadow-2xl shadow-indigo-500/20" 
                                : "bg-white/[0.02] border-white/5 hover:border-white/20"
                            )}
                          >
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity", type.color)} />
                            <div className="relative z-10 space-y-4">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                                formData.category === type.id ? "bg-indigo-500 text-white" : "bg-white/5 text-white/40"
                              )}>
                                {type.icon}
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase tracking-widest">{type.label}</h4>
                                <p className="text-[10px] text-white/30 font-medium leading-tight">{type.description}</p>
                              </div>
                            </div>
                            
                            {formData.category === type.id && (
                              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white scale-110">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        ))}
                     </div>
                  </motion.div>
                )}

                {currentStepId === 'details' && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter italic text-white">EVENT DETAILS</h3>
                        <p className="text-white/40 text-sm">Define the primary characteristics of your gathering.</p>
                     </div>

                     <div className="space-y-8 overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
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
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Selected Category</label>
                              <div className="h-16 px-6 glass rounded-2xl flex items-center justify-between border border-white/10 group cursor-pointer" onClick={() => setStep(1)}>
                                 <span className="text-sm font-bold text-white uppercase tracking-widest">{formData.category}</span>
                                 <Badge className="bg-indigo-500/10 text-indigo-400 border-none text-[8px] uppercase tracking-tighter font-black">Change</Badge>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Capacity</label>
                              <Input 
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                                className="bg-white/5 border-white/5 h-16 rounded-2xl font-bold"
                              />
                           </div>
                        </div>

                        {collections.length > 0 && (
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">COLLECTION / SERIES</label>
                                <div className="h-16 px-6 glass rounded-2xl flex items-center border border-white/10 group cursor-pointer relative">
                                    <select 
                                        value={formData.collectionId || ''}
                                        onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                                        className="w-full bg-transparent border-none text-white text-xs font-bold uppercase tracking-widest outline-none appearance-none"
                                    >
                                        <option value="" className="bg-[#0b0b0f]">NONE (STANDALONE EVENT)</option>
                                        {collections.map(c => (
                                            <option key={c.id} value={c.id} className="bg-[#0b0b0f]">{c.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    <Plus className="absolute right-6 w-4 h-4 text-white/20" />
                                </div>
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest px-1">Group events into a series or tour</p>
                            </div>
                        )}

                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Tags (comma separated)</label>
                           <Input 
                            value={formData.tags?.join(', ') || ''}
                            onChange={(e) => {
                              const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                              setFormData({...formData, tags});
                            }}
                            placeholder="e.g., design, tech, networking"
                            className="bg-white/5 border-white/5 h-16 rounded-2xl font-bold italic"
                           />
                        </div>

                        <div className="space-y-3">
                           <ImageUpload 
                            label="Event Banner"
                            aspect={16 / 9}
                            defaultValue={formData.coverImageUrl}
                            onUpload={(url) => setFormData({...formData, coverImageUrl: url})}
                           />
                           <p className="text-[9px] text-white/20 italic ml-1">High-resolution banner for the event backdrop.</p>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Description</label>
                           <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Describe your event... What should people know?"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 h-40 text-sm focus:outline-none focus:border-purple-500/50 resize-none font-medium leading-relaxed font-bold"
                           />
                        </div>

                        <div className="space-y-6 pt-10 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Project Collaboration</h4>
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Add Co-Hosts to this signal</p>
                                </div>
                                <Shield className="w-6 h-6 text-indigo-500/40" />
                            </div>

                            <div className="space-y-4 pb-12">
                                <div className="flex flex-wrap gap-2">
                                    {(formData.coHostIds || []).map(email => (
                                        <Badge key={email} className="bg-indigo-500/10 text-indigo-400 border-none pl-3 pr-1 py-1 rounded-full flex items-center gap-2 group">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{email}</span>
                                            <button 
                                                onClick={() => setFormData({ ...formData, coHostIds: formData.coHostIds?.filter(e => e !== email) })}
                                                className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center hover:bg-red-500/40 transition-colors"
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>

                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <Input 
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const email = (e.currentTarget).value.trim().toLowerCase();
                                                if (email && !formData.coHostIds?.includes(email)) {
                                                    setFormData({ ...formData, coHostIds: [...(formData.coHostIds || []), email] });
                                                    (e.currentTarget).value = '';
                                                }
                                            }
                                        }}
                                        placeholder="Add co-host by email (press Enter)"
                                        className="bg-white/5 border-white/5 h-16 pl-14 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                                    />
                                </div>
                                <p className="text-[9px] text-white/20 italic px-1 font-medium">Co-hosts will have full administrative access to manage registrations and broadcast messages.</p>
                            </div>
                        </div>
                     </div>
                  </motion.div>
                )}

                {currentStepId === 'location' && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter italic text-white">LOCATION & TIME</h3>
                        <p className="text-white/40 text-sm">Where and when exactly is the event happening?</p>
                     </div>

                     <div className="space-y-8">
                        <div className="space-y-3">
                           <div className="flex items-center justify-between px-1">
                               <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Event Location</label>
                               <button 
                                   type="button"
                                   onClick={() => {
                                       navigator.geolocation.getCurrentPosition((pos) => {
                                           setFormData(prev => ({
                                               ...prev,
                                               coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude }
                                           }));
                                       });
                                   }}
                                   className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
                               >
                                   <MapPin className="w-3 h-3" />
                                   {formData.coordinates ? 'COORDINATES SYNCED' : 'USE CURRENT GPS'}
                                </button>
                           </div>
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

                        <div className="grid grid-cols-3 gap-6">
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
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">End Time</label>
                              <div className="relative">
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <Input 
                                  type="time"
                                  value={formData.endTime}
                                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
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
                                <h4 className="text-sm font-bold uppercase tracking-widest text-white">VISIBILITY SETTINGS</h4>
                                <p className="text-[10px] text-white/30 px-8 font-bold italic">Choose who can see and join this event across the VUX network.</p>
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

                {currentStepId === 'virtual' && (
                  <motion.div
                    key="step_virtual"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold tracking-tight">Virtual Details</h3>
                      <p className="text-xs text-white/50">Where will this virtual event take place?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-white/40">Date</label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <Input type="date" className="pl-12 h-14" value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-white/40">Time</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <Input type="time" className="pl-12 h-14" value={formData.time || ''} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-white/40">Meeting Link (Zoom, Meet, etc.)</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <Input placeholder="https://zoom.us/j/..." className="pl-12 h-14" value={formData.meetingLink || ''} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStepId === 'sponsors' && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter italic text-white uppercase">Sponsors & Privacy</h3>
                        <p className="text-white/40 text-sm">Add event partners and configure security access.</p>
                     </div>

                     <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60">Sponsors</p>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setFormData({
                                        ...formData,
                                        sponsors: [...(formData.sponsors || []), { name: '', tier: 'Community' }]
                                    })}
                                    className="h-10 rounded-xl border-dashed border-white/10 text-[8px] font-black uppercase tracking-widest gap-2"
                                >
                                    <Plus className="w-3 h-3" /> Add Sponsor
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {formData.sponsors?.map((sponsor, idx) => (
                                    <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Badge className="bg-indigo-500/10 text-indigo-400 border-none text-[8px] uppercase font-black">Sponsor #{idx + 1}</Badge>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => {
                                                    const newSponsors = (formData.sponsors || []).filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, sponsors: newSponsors });
                                                }}
                                                className="w-8 h-8 rounded-lg text-white/20 hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                            <ImageUpload 
                                                label="Sponsor Logo"
                                                aspect={1 / 1}
                                                defaultValue={sponsor.logoUrl}
                                                onUpload={(url) => {
                                                    const newSponsors = [...(formData.sponsors || [])];
                                                    newSponsors[idx].logoUrl = url;
                                                    setFormData({ ...formData, sponsors: newSponsors });
                                                }}
                                                className="md:row-span-1"
                                            />
                                            <div className="space-y-4">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Sponsor Name</label>
                                                    <Input 
                                                        placeholder="e.g., Google Cloud"
                                                        value={sponsor.name}
                                                        onChange={(e) => {
                                                            const newSponsors = [...(formData.sponsors || [])];
                                                            newSponsors[idx].name = e.target.value;
                                                            setFormData({ ...formData, sponsors: newSponsors });
                                                        }}
                                                        className="bg-white/5 border-white/5 h-12 rounded-xl text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Tier</label>
                                                    <select 
                                                        value={sponsor.tier}
                                                        onChange={(e) => {
                                                            const newSponsors = [...(formData.sponsors || [])];
                                                            newSponsors[idx].tier = e.target.value as any;
                                                            setFormData({ ...formData, sponsors: newSponsors });
                                                        }}
                                                        className="w-full bg-white/5 border border-white/5 rounded-xl h-12 px-4 text-[10px] font-black uppercase tracking-widest text-white/60 focus:outline-none"
                                                    >
                                                        <option value="Diamond">Diamond</option>
                                                        <option value="Gold">Gold</option>
                                                        <option value="Silver">Silver</option>
                                                        <option value="Community">Community</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60">Privacy Layer</p>
                            
                            <div className="space-y-4">
                                {formData.visibility === 'private' && (
                                    <div className="space-y-3 p-6 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 px-1">Access Password (Optional)</label>
                                        <Input 
                                            type="password"
                                            value={formData.password || ''}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            placeholder="Leave blank for invite-only"
                                            className="bg-white/5 border-white/5 h-14 rounded-xl font-mono text-sm"
                                        />
                                        <p className="text-[9px] text-white/20 italic">Attendees will need this password to view details and register.</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black italic uppercase tracking-widest text-white">Hide Guest List</h4>
                                        <p className="text-[10px] text-white/30 font-medium italic">Attendees won't see other participants.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, hideParticipants: !formData.hideParticipants })}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative overflow-hidden",
                                            formData.hideParticipants ? "bg-indigo-500" : "bg-white/10"
                                        )}
                                    >
                                        <motion.div 
                                            animate={{ x: formData.hideParticipants ? 24 : 4 }}
                                            className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-sm" 
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60">Community Links</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Discord Invite URL</label>
                                    <Input 
                                        value={formData.socialLinks?.discord || ''}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            socialLinks: { ...(formData.socialLinks || {}), discord: e.target.value }
                                        })}
                                        placeholder="discord.gg/your-event"
                                        className="bg-white/5 border-white/5 h-14 rounded-xl text-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">TikTok Profile</label>
                                    <Input 
                                        value={formData.socialLinks?.tiktok || ''}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            socialLinks: { ...(formData.socialLinks || {}), tiktok: e.target.value }
                                        })}
                                        placeholder="@your-event"
                                        className="bg-white/5 border-white/5 h-14 rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-10 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black italic uppercase tracking-tighter text-white">CO-HOSTS</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 truncate">Add collaboration administrators</p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFormData({
                                            ...formData,
                                            coHostIds: [...(formData.coHostIds || []), '']
                                        });
                                    }}
                                    className="h-10 rounded-xl border-dashed border-white/10 text-[8px] font-black uppercase tracking-widest gap-2"
                                >
                                    <Plus className="w-3 h-3" /> INVITE
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {(formData.coHostIds || []).map((id, index) => (
                                    <div key={index} className="flex gap-4">
                                        <Input 
                                            value={id}
                                            onChange={(e) => {
                                                const newIds = [...(formData.coHostIds || [])];
                                                newIds[index] = e.target.value;
                                                setFormData({ ...formData, coHostIds: newIds });
                                            }}
                                            placeholder="Enter User ID or Email"
                                            className="bg-white/5 border-white/5 h-14 rounded-xl text-sm"
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => {
                                                const newIds = [...(formData.coHostIds || [])];
                                                newIds.splice(index, 1);
                                                setFormData({ ...formData, coHostIds: newIds });
                                            }}
                                            className="w-14 h-14 rounded-xl hover:bg-red-500/10 hover:text-red-400"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                  </motion.div>
                )}

                 {currentStepId === 'contestants' && (
                  <motion.div
                    key="contestants"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter italic text-white uppercase">Contestants</h3>
                        <p className="text-white/40 text-sm">Add profiles for people audience can vote for.</p>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60">Contestant Roster</p>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setFormData({
                                    ...formData,
                                    contestants: [...(formData.contestants || []), { id: Math.random().toString(36).substring(7), name: '', votes: 0 }]
                                })}
                                className="h-10 rounded-xl border-dashed border-white/10 text-[8px] font-black uppercase tracking-widest gap-2"
                            >
                                <Plus className="w-3 h-3" /> Add Contestant
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {(formData.contestants || []).map((contestant, idx) => (
                                <div key={contestant.id} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6 relative group">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <Trophy className="w-6 h-6 text-yellow-500/40" />
                                            <div className="space-y-0.5">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-white">Entry #{idx + 1}</h4>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => {
                                                const newContestants = (formData.contestants || []).filter((_, i) => i !== idx);
                                                setFormData({ ...formData, contestants: newContestants });
                                            }}
                                            className="w-10 h-10 rounded-xl text-white/10 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                        <ImageUpload 
                                            label="Contestant Photo"
                                            aspect={1 / 1}
                                            defaultValue={contestant.photoUrl}
                                            onUpload={(url) => {
                                                const newContestants = [...(formData.contestants || [])];
                                                newContestants[idx].photoUrl = url;
                                                setFormData({ ...formData, contestants: newContestants });
                                            }}
                                            className="md:row-span-2"
                                        />
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Name</label>
                                                <Input 
                                                    value={contestant.name}
                                                    onChange={(e) => {
                                                        const newContestants = [...(formData.contestants || [])];
                                                        newContestants[idx].name = e.target.value;
                                                        setFormData({ ...formData, contestants: newContestants });
                                                    }}
                                                    placeholder="e.g., Alex Rivers"
                                                    className="bg-white/5 border-white/10 h-12 rounded-xl text-sm"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Category / Role</label>
                                                <Input 
                                                    value={contestant.role || ''}
                                                    onChange={(e) => {
                                                        const newContestants = [...(formData.contestants || [])];
                                                        newContestants[idx].role = e.target.value;
                                                        setFormData({ ...formData, contestants: newContestants });
                                                    }}
                                                    placeholder="e.g., Singer, Developer"
                                                    className="bg-white/5 border-white/10 h-12 rounded-xl text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Biography / Submission</label>
                                        <textarea 
                                            value={contestant.bio || ''}
                                            onChange={(e) => {
                                                const newContestants = [...(formData.contestants || [])];
                                                newContestants[idx].bio = e.target.value;
                                                setFormData({ ...formData, contestants: newContestants });
                                            }}
                                            placeholder="What makes this entry stand out?"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-24 text-xs font-medium focus:outline-none focus:border-yellow-500/50 resize-none"
                                        />
                                    </div>
                                </div>
                            ))}

                            {(!formData.contestants || formData.contestants.length === 0) && (
                                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
                                    <Trophy className="w-12 h-12 text-white/5 mx-auto" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No contestants added yet</p>
                                </div>
                            )}
                        </div>
                     </div>
                  </motion.div>
                )}

                {currentStepId === 'speakers' && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter italic text-white uppercase">Event Speakers</h3>
                        <p className="text-white/40 text-sm">Add profiles for whoever is taking the stage.</p>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60">Stage Roster</p>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setFormData({
                                    ...formData,
                                    speakers: [...(formData.speakers || []), { id: Math.random().toString(36).substring(7), name: '', role: '' }]
                                })}
                                className="h-10 rounded-xl border-dashed border-white/10 text-[8px] font-black uppercase tracking-widest gap-2"
                            >
                                <Plus className="w-3 h-3" /> Add Speaker
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {(formData.speakers || []).map((speaker, idx) => (
                                <div key={speaker.id} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6 relative group">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-black italic">
                                                {idx + 1}
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-white">Speaker Details</h4>
                                                <p className="text-[9px] text-white/20 italic">Presenter Profile</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => {
                                                const newSpeakers = (formData.speakers || []).filter((_, i) => i !== idx);
                                                setFormData({ ...formData, speakers: newSpeakers });
                                            }}
                                            className="w-10 h-10 rounded-xl text-white/10 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                        <ImageUpload 
                                            label="Speaker Photo"
                                            aspect={1 / 1}
                                            defaultValue={speaker.photoUrl}
                                            onUpload={(url) => {
                                                const newSpeakers = [...(formData.speakers || [])];
                                                newSpeakers[idx].photoUrl = url;
                                                setFormData({ ...formData, speakers: newSpeakers });
                                            }}
                                            className="md:row-span-2"
                                        />
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Speaker Name</label>
                                                <Input 
                                                    value={speaker.name}
                                                    onChange={(e) => {
                                                        const newSpeakers = [...(formData.speakers || [])];
                                                        newSpeakers[idx].name = e.target.value;
                                                        setFormData({ ...formData, speakers: newSpeakers });
                                                    }}
                                                    placeholder="e.g., Satya Nadella"
                                                    className="bg-white/5 border-white/10 h-12 rounded-xl text-sm"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Role / Title</label>
                                                <Input 
                                                    value={speaker.role}
                                                    onChange={(e) => {
                                                        const newSpeakers = [...(formData.speakers || [])];
                                                        newSpeakers[idx].role = e.target.value;
                                                        setFormData({ ...formData, speakers: newSpeakers });
                                                    }}
                                                    placeholder="e.g., CEO @ Microsoft"
                                                    className="bg-white/5 border-white/10 h-12 rounded-xl text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Short Bio</label>
                                        <textarea 
                                            value={speaker.bio || ''}
                                            onChange={(e) => {
                                                const newSpeakers = [...(formData.speakers || [])];
                                                newSpeakers[idx].bio = e.target.value;
                                                setFormData({ ...formData, speakers: newSpeakers });
                                            }}
                                            placeholder="A brief introduction..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-24 text-xs font-medium focus:outline-none focus:border-indigo-500/50 resize-none"
                                        />
                                    </div>
                                </div>
                            ))}

                            {(!formData.speakers || formData.speakers.length === 0) && (
                                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
                                    <Mic className="w-12 h-12 text-white/5 mx-auto" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No speakers added yet</p>
                                </div>
                            )}
                        </div>
                     </div>
                  </motion.div>
                )}

                {currentStepId === 'form' && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter italic text-white uppercase">Registration Form</h3>
                        <p className="text-white/40 text-sm">Add custom fields you want attendees to fill out.</p>
                     </div>

                         <div className="space-y-6">
                            {formData.registrationFields?.map((field, idx) => (
                               <div key={idx} className="space-y-4 p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative group/field">
                                  <div className="flex justify-between items-start">
                                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black italic text-white/20">
                                        0{idx + 1}
                                     </div>
                                     <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => {
                                          const newFields = (formData.registrationFields || []).filter((_, i) => i !== idx);
                                          setFormData({...formData, registrationFields: newFields});
                                        }}
                                        className="w-10 h-10 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-white/10"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                     </Button>
                                  </div>

                                  <div className="space-y-6">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                           <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Field Label</label>
                                           <Input 
                                              value={field.label}
                                              onChange={(e) => {
                                                const newFields = [...(formData.registrationFields || [])];
                                                newFields[idx].label = e.target.value;
                                                setFormData({...formData, registrationFields: newFields});
                                              }}
                                              placeholder="e.g., T-Shirt Size"
                                              className="bg-white/5 border-white/10 h-14 rounded-2xl"
                                           />
                                        </div>
                                        <div className="space-y-3">
                                           <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Input Type</label>
                                           <select 
                                              value={field.type}
                                              onChange={(e) => {
                                                const newFields = [...(formData.registrationFields || [])];
                                                newFields[idx].type = e.target.value as any;
                                                if (e.target.value === 'select' || e.target.value === 'multichoice') {
                                                  newFields[idx].options = field.options || [''];
                                                }
                                                setFormData({...formData, registrationFields: newFields});
                                              }}
                                              className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-4 text-xs font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer"
                                           >
                                              <option value="text">Text Input</option>
                                              <option value="longtext">Paragraph</option>
                                              <option value="email">Email Address</option>
                                              <option value="phone">Phone Number</option>
                                              <option value="select">Dropdown</option>
                                              <option value="multichoice">Multi Choice</option>
                                              <option value="checkbox">Single Checkbox</option>
                                           </select>
                                        </div>
                                     </div>

                                     {(field.type === 'select' || field.type === 'multichoice') && (
                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                           <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Option Values</label>
                                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                              {(field.options || []).map((option, optIdx) => (
                                                 <div key={optIdx} className="flex gap-2">
                                                    <Input 
                                                       value={option}
                                                       onChange={(e) => {
                                                          const newFields = [...(formData.registrationFields || [])];
                                                          const newOptions = [...(newFields[idx].options || [])];
                                                          newOptions[optIdx] = e.target.value;
                                                          newFields[idx].options = newOptions;
                                                          setFormData({...formData, registrationFields: newFields});
                                                       }}
                                                       placeholder={`Option ${optIdx + 1}`}
                                                       className="bg-white/5 border-white/5 h-12 rounded-xl text-xs"
                                                    />
                                                    <Button 
                                                       variant="ghost" 
                                                       size="icon"
                                                       onClick={() => {
                                                          const newFields = [...(formData.registrationFields || [])];
                                                          const newOptions = (newFields[idx].options || []).filter((_, i) => i !== optIdx);
                                                          newFields[idx].options = newOptions;
                                                          setFormData({...formData, registrationFields: newFields});
                                                       }}
                                                       className="w-12 h-12 rounded-xl text-white/10 hover:text-red-400"
                                                    >
                                                       <X className="w-4 h-4" />
                                                    </Button>
                                                 </div>
                                              ))}
                                              <Button 
                                                 variant="outline" 
                                                 size="sm"
                                                 onClick={() => {
                                                    const newFields = [...(formData.registrationFields || [])];
                                                    const newOptions = [...(newFields[idx].options || []), ''];
                                                    newFields[idx].options = newOptions;
                                                    setFormData({...formData, registrationFields: newFields});
                                                 }}
                                                 className="h-12 rounded-xl border-dashed border-white/10 text-[10px] font-black gap-2"
                                              >
                                                 <Plus className="w-3 h-3" /> Add Option
                                              </Button>
                                           </div>
                                        </div>
                                     )}

                                     <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                           <div className={cn(
                                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                              field.required ? "bg-indigo-500 border-indigo-500" : "border-white/10 bg-white/5 group-hover:border-white/20"
                                           )}>
                                              {field.required && <Check className="w-4 h-4 text-white" />}
                                           </div>
                                           <input 
                                             type="checkbox"
                                             className="hidden"
                                             checked={field.required}
                                             onChange={(e) => {
                                               const newFields = [...(formData.registrationFields || [])];
                                               newFields[idx].required = e.target.checked;
                                               setFormData({...formData, registrationFields: newFields});
                                             }}
                                           />
                                           <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Mark as Mandatory</span>
                                        </label>
                                     </div>
                                  </div>
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

                        <div className="space-y-6 pt-10 border-t border-white/5 opacity-0 pointer-events-none hidden">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60">PRIVACY SETTINGS</p>
                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black italic uppercase tracking-widest text-white">Hide Guest List</h4>
                                    <p className="text-[10px] text-white/30 font-medium italic">If enabled, attendees will not be able to see who else is going.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, hideParticipants: !formData.hideParticipants })}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-all relative overflow-hidden",
                                        formData.hideParticipants ? "bg-indigo-500" : "bg-white/10"
                                    )}
                                >
                                    <motion.div 
                                        animate={{ x: formData.hideParticipants ? 24 : 4 }}
                                        className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-sm" 
                                    />
                                </button>
                            </div>
                        </div>
                     </motion.div>
                )}

                {currentStepId === 'theme' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold tracking-tight">White-Label Theming</h3>
                      <p className="text-xs text-white/50">Customize the look and feel of your event page.</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-white/40">Primary Brand Color (Hex)</label>
                        <div className="flex gap-4 items-center">
                          <input
                            type="color"
                            value={formData.theme?.primaryColor || '#a855f7'}
                            onChange={(e) => setFormData({ ...formData, theme: { ...formData.theme, primaryColor: e.target.value } })}
                            className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0"
                          />
                          <Input
                            placeholder="#a855f7"
                            value={formData.theme?.primaryColor || ''}
                            onChange={(e) => setFormData({ ...formData, theme: { ...formData.theme, primaryColor: e.target.value } })}
                            className="font-mono max-w-[150px]"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-white/40">Custom Background Image URL</label>
                        <Input
                          placeholder="https://example.com/background.jpg"
                          value={formData.theme?.backgroundUrl || ''}
                          onChange={(e) => setFormData({ ...formData, theme: { ...formData.theme, backgroundUrl: e.target.value } })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStepId === 'preview' && (
                  <motion.div
                    key="step7"
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
                            disabled={
                              (currentStepId === 'type' && !formData.category) ||
                              (currentStepId === 'details' && !formData.title) ||
                              (currentStepId === 'location' && (!formData.date || !formData.location || !formData.time)) ||
                              (currentStepId === 'virtual' && (!formData.date || !formData.meetingLink || !formData.time)) ||
                              (currentStepId === 'contestants' && (!formData.contestants || formData.contestants.length === 0))
                            }
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
      )}
    </motion.div>
  </div>
  );
}
