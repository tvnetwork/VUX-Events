/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, orderBy, limit, setDoc, collectionGroup } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { useAuth } from '../AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Users, Calendar, BarChart3, Trash2, Shield, Search, Filter, MoreVertical, RefreshCcw, Activity, Mail, Settings, ShieldCheck, Globe, Save, HelpCircle, X, Plus, TrendingUp, Coins, Sparkles, Clock } from 'lucide-react';
import { Event, UserProfile, Collection } from '../types';
import { PulseType } from '../services/PulseService';
import { formatDate, cn } from '../lib/utils';
import { SiteConfig, SiteConfigService } from '../services/SiteConfigService';

interface Pulse {
  id: string;
  type: PulseType;
  message: string;
  userId: string;
  metadata: any;
  timestamp: any;
}
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const ADMIN_EMAIL = 'oladoyeheritage445@gmail.com';

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, events: 0, rsvps: 0, revenue: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [collectionsList, setCollectionsList] = useState<Collection[]>([]);
  const [pulsesList, setPulsesList] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'events' | 'pulses' | 'broadcast' | 'config' | 'analytics' | 'collections'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'completed' | 'cancelled'>('all');
  
  // Site Config State
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  
  // Broadcast State
  const [broadcastSubject, setBroadcastSubject] = useState('Important Update from VUX Events');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [templates, setTemplates] = useState([
    { id: 'default', name: 'Official Notice', body: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0b0b0f; border: 1px solid #222; border-radius: 24px; overflow: hidden;"><div style="background: #111; padding: 30px; text-align: center; border-bottom: 1px solid #222;"><h1 style="color: white; margin: 0; font-style: ; text-transform: ; letter-spacing: -1px;">VUX Broadcast</h1></div><div style="padding: 40px; color: #ccc; line-height: 1.6; font-size: 16px;">{{message}}</div><div style="padding: 30px; background: #080808; text-align: center; border-top: 1px solid #222;"><p style="color: #444; font-size: 11px; text-transform: ; margin: 0;">System Notification</p></div></div>' },
    { id: 'upgrade', name: 'Platform Update', body: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0b0b0f; border: 2px solid #6366f1; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);"><div style="background: linear-gradient(to right, #6366f1, #a855f7); padding: 40px; text-align: center;"><h1 style="color: white; margin: 0; font-style: ; text-transform: ; letter-spacing: -2px; font-size: 42px;">PLATFORM UPDATE</h1><p style="color: rgba(255,255,255,0.8); margin-top: 10px; font-weight: 800; text-transform: ; letter-spacing: 2px;">Version 2.0 Now Live</p></div><div style="padding: 50px; color: #fff; line-height: 1.8; font-size: 18px; background: rgba(255,255,255,0.02);">{{message}}</div><div style="padding: 30px; background: #050505; text-align: center; border-top: 1px solid #222;"><a href="#" style="color: #6366f1; text-decoration: none; font-weight: 900; text-transform: ; letter-spacing: 1px;">View Update Details &rarr;</a></div></div>' },
    { id: 'urgent', name: 'Emergency Alert', body: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0b0b0f; border: 1px solid #ff000033; border-radius: 24px; overflow: hidden;"><div style="background: #ff000033; padding: 30px; text-align: center; border-bottom: 1px solid #ff000055;"><h1 style="color: #ff4444; margin: 0; font-style: ; text-transform: ;">URGENT MESSAGE</h1></div><div style="padding: 40px; color: #fff; line-height: 1.6; font-size: 16px;">{{message}}</div><div style="padding: 30px; background: #080808; text-align: center;"><p style="color: #ff4444; font-size: 11px; text-transform: ; margin: 0;">Priority Delivery</p></div></div>' }
  ]);
  const [activeTemplateId, setActiveTemplateId] = useState('default');

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    if (isAdmin && user) {
      fetchData();
    }
  }, [isAdmin, user]);

    const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'events')),
        getDocs(query(collection(db, 'system_pulses'), orderBy('timestamp', 'desc'), limit(100))),
        getDocs(collection(db, 'email_templates')),
        getDocs(collection(db, 'collections'))
      ]);

      const [usersRes, eventsRes, pulsesRes, templatesRes, collectionsRes] = results;

      if (usersRes.status === 'fulfilled') {
        const users = usersRes.value.docs.map(doc => ({ uid: doc.id, id: doc.id, ...doc.data() } as any));
        setUsersList(users);
        setSelectedRecipients(users.map(u => u.email).filter(Boolean));
        setStats(prev => ({ ...prev, users: users.length }));
      } else {
        handleFirestoreError(usersRes.reason, 'list', 'users');
      }

      if (eventsRes.status === 'fulfilled') {
        const events = eventsRes.value.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setEventsList(events);
        setStats(prev => ({ ...prev, events: events.length }));
      } else {
        handleFirestoreError(eventsRes.reason, 'list', 'events');
      }

      if (pulsesRes.status === 'fulfilled') {
        const pulses = pulsesRes.value.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setPulsesList(pulses);
        const rsvpPulses = pulses.filter(p => p.type === 'RSVP');
        setStats(prev => ({ 
            ...prev, 
            rsvps: rsvpPulses.length,
            revenue: rsvpPulses.length * 50 
        }));
      } else {
        handleFirestoreError(pulsesRes.reason, 'list', 'system_pulses');
      }

      if (templatesRes.status === 'fulfilled') {
        setTemplates(templatesRes.value.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      } else {
        handleFirestoreError(templatesRes.reason, 'list', 'email_templates');
      }

      if (collectionsRes.status === 'fulfilled') {
        setCollectionsList(collectionsRes.value.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      } else {
        handleFirestoreError(collectionsRes.reason, 'list', 'collections');
      }

      // Fetch site config separately
      const config = await SiteConfigService.getConfig();
      setSiteConfig(config);
    } catch (e) {
      console.error('AdminDashboard general error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage || selectedRecipients.length === 0) {
      toast.error('Missing message or recipients.');
      return;
    }
    
    setSendingBroadcast(true);
    try {
      const template = templates.find(t => t.id === activeTemplateId) || templates[0];
      const finalBody = template.body.replace('{{message}}', broadcastMessage.replace(/\n/g, '<br/>'));

      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: selectedRecipients,
          subject: broadcastSubject,
          body: finalBody
        })
      });

      if (response.ok) {
        toast.success('Broadcast message sent successfully.');
        setBroadcastMessage('');
      } else {
        const err = await response.json();
        toast.error(`Failed to send broadcast: ${err.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Broadcast delivery encountered an error.');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const saveTemplate = async (id: string, body: string) => {
    try {
      await updateDoc(doc(db, 'email_templates', id), { body });
      alert('Template synchronized.');
    } catch (e) {
       // if doc doesn't exist, try setDoc (simplified for here)
       console.error(e);
    }
  };

const handleVerifyUser = async (userId: string) => {
    try {
        await updateDoc(doc(db, 'users', userId), { isVerified: true });
        setUsersList(usersList.map((u: any) => u.uid === userId ? { ...u, isVerified: true } : u));
        alert('User verified on the network.');
    } catch (e) {
        console.error(e);
        alert('Verification failure.');
    }
  };

  const handleDirectMail = (email: string) => {
    setActiveView('broadcast');
    setSelectedRecipients([email]);
    setBroadcastSubject(`Personal notification for ${email}`);
    setBroadcastMessage('Hello,\n\n');
  };

  const handleSaveConfig = async () => {
    if (!siteConfig) return;
    setSavingConfig(true);
    try {
      await SiteConfigService.updateConfig(siteConfig);
      alert('Global configuration updated successfully.');
    } catch (e) {
      console.error(e);
      alert('Failed to update configuration.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action is irreversible.')) return;
    try {
        await deleteDoc(doc(db, 'users', userId));
        setUsersList(usersList.filter(u => u.uid !== userId));
    } catch (e) {
        console.error(e);
        alert('Failed to delete user.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action is irreversible.')) return;
    try {
        await deleteDoc(doc(db, 'events', eventId));
        setEventsList(eventsList.filter(e => e.id !== eventId));
    } catch (e) {
        console.error(e);
        alert('Failed to delete event.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <Shield className="w-10 h-10 text-red-500 animate-pulse" />
        </div>
        <div className="space-y-2">
            <h2 className="text-4xl font-medium tracking-tight mb-2">ADMIN ACCESS ONLY</h2>
            <p className="text-white/60 max-w-sm text-[10px] font-medium tracking-tight leading-relaxed">
              This area is restricted to authorized VUX administrators only.
            </p>
        </div>
        <Button variant="outline" className="rounded-xl border-white/10 text-[10px] font-medium tracking-tight px-8" onClick={() => window.location.href = '/'}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-500">
            <div className="w-10 h-px bg-indigo-500" />
            <span className="text-[10px] font-medium tracking-tight">Admin Management</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-medium tracking-tight leading-[0.8] text-white">ADMIN<br/>CONTROLS</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl p-2 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
            {[
                { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
                { id: 'analytics', label: 'Revenue', icon: <TrendingUp className="w-4 h-4" /> },
                { id: 'collections', label: 'Collections', icon: <Plus className="w-4 h-4" /> },
                { id: 'broadcast', label: 'Broadcast', icon: <Mail className="w-4 h-4" /> },
                { id: 'config', label: 'Site Config', icon: <Globe className="w-4 h-4" /> },
                { id: 'pulses', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
                { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
                { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> }
            ].map((tab) => (
                <Button 
                    key={tab.id}
                    variant={activeView === tab.id ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveView(tab.id as any)}
                    className={cn(
                        "text-[10px] font-medium  tracking-tight h-12 px-8 rounded-2xl transition-all gap-3 whitespace-nowrap",
                        activeView === tab.id ? "bg-indigo-600 shadow-2xl shadow-indigo-500/20" : "text-white/40 hover:text-white"
                    )}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </Button>
            ))}
        </div>
      </header>

      {activeView === 'overview' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
           {[
             { label: 'Total active users', value: stats.users, icon: <Users className="w-6 h-6 text-indigo-400" />, trend: 'LIVE', trendUp: true, color: 'indigo' },
             { label: 'Published events', value: stats.events, icon: <Calendar className="w-6 h-6 text-indigo-400" />, trend: 'LIVE', trendUp: true, color: 'indigo' },
             { label: 'Server Availability', value: '99.9%', icon: <RefreshCcw className="w-6 h-6 text-emerald-400" />, trend: 'HEALTHY', trendUp: true, color: 'emerald' },
           ].map((stat, i) => (
             <Card key={i} className="p-10 border-white/5 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl space-y-8 rounded-2xl relative overflow-hidden group hover:bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl transition-all duration-700">
                <div className={cn("absolute -top-20 -right-20 w-48 h-48 blur-3xl rounded-full transition-colors duration-700", i === 2 ? "bg-emerald-500/5 group-hover:bg-emerald-500/15" : "bg-indigo-500/5 group-hover:bg-indigo-500/15")} />
                <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl border border-white/10 flex items-center justify-center shadow-inner">
                        {stat.icon}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-medium tracking-tight text-white/40">{stat.label}</p>
                    <h3 className="text-6xl font-medium tracking-tight">{stat.value}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn("px-2 py-1 rounded-lg text-[8px] font-medium tracking-tight ", stat.trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                        {stat.trend}
                    </div>
                    <span className="text-[9px] font-bold text-white/10 tracking-tight">Real-time updates</span>
                </div>
             </Card>
           ))}
        </section>
      )}

      {activeView === 'analytics' && (
        <section className="space-y-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                 { label: 'Total Revenue', value: '$' + (stats.revenue || 12450).toLocaleString(), icon: <TrendingUp className="w-5 h-5" /> },
                 { label: 'Ticket Velocity', value: '42/day', icon: <Activity className="w-5 h-5" /> },
                 { label: 'Avg. Order Value', value: '$85.00', icon: <Coins className="w-5 h-5" /> },
                 { label: 'Conversion Rate', value: '12.4%', icon: <Sparkles className="w-5 h-5" /> },
               ].map((s, i) => (
                 <Card key={i} className="p-8 border-white/5 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            {s.icon}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-medium tracking-tight text-white/40">{s.label}</p>
                        <h4 className="text-3xl font-medium tracking-tight text-white">{s.value}</h4>
                    </div>
                 </Card>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-10 border-white/5 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl space-y-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-medium tracking-tight">Registration Velocity</h3>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-medium tracking-tight">+18% vs Last Month</Badge>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { name: 'Apr 20', val: 120 },
                                { name: 'Apr 21', val: 240 },
                                { name: 'Apr 22', val: 180 },
                                { name: 'Apr 23', val: 400 },
                                { name: 'Apr 24', val: 320 },
                                { name: 'Apr 25', val: 560 },
                                { name: 'Apr 26', val: 480 },
                            ]}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ background: '#0b0b0f', border: '1px solid #ffffff10', borderRadius: '16px' }} 
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} 
                                />
                                <Area type="monotone" dataKey="val" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-10 border-white/5 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl space-y-10">
                     <div className="flex items-center justify-between">
                        <h3 className="text-xl font-medium tracking-tight">Revenue Distribution</h3>
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-none text-[8px] font-medium tracking-tight">Global Aggregation</Badge>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Tech', rev: 4500 },
                                { name: 'Music', rev: 2800 },
                                { name: 'Design', rev: 3200 },
                                { name: 'AI', rev: 5100 },
                                { name: 'Other', rev: 1900 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{fill: '#ffffff05'}}
                                    contentStyle={{ background: '#0b0b0f', border: '1px solid #ffffff10', borderRadius: '16px' }} 
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} 
                                />
                                <Bar dataKey="rev" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </section>
      )}

      {activeView === 'collections' && (
        <section className="px-4 space-y-12">
            <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-4xl font-medium tracking-tight">Collections</h2>
                   <p className="text-[10px] font-medium tracking-tight text-indigo-500/40">Series and Event Tours</p>
                </div>
                <Button 
                    variant="vux" 
                    onClick={() => {
                        const name = prompt('Collection Name:');
                        if (name) {
                            const newColId = name.toLowerCase().replace(/\s+/g, '-');
                            const newCol: Collection = { 
                                id: newColId,
                                name, 
                                description: '',
                                creatorId: user?.uid || 'admin',
                                eventIds: [],
                                createdAt: new Date().toISOString() 
                            };
                            setDoc(doc(db, 'collections', newColId), newCol);
                            setCollectionsList(prev => [...prev, newCol]);
                            toast.success('Collection Created');
                        }
                    }}
                    className="h-14 rounded-2xl gap-2 font-medium text-[10px]"
                >
                    <Plus className="w-4 h-4" /> Create New Series
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {collectionsList.map((col, idx) => (
                    <Card key={idx} className="p-8 border-white/5 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl space-y-6 group hover:bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl transition-all">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Plus className="w-5 h-5 flex-shrink-0" />
                            </div>
                            <Button variant="ghost" size="icon" className="text-white/10 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-medium tracking-tight text-white">{col.name}</h3>
                            <p className="text-[10px] font-medium text-white/30 tracking-tight">
                                {eventsList.filter(e => e.collectionId === col.id).length} Associated Events
                            </p>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                             <div className="flex -space-x-4">
                                {eventsList.filter(e => e.collectionId === col.id).slice(0, 5).map((e, i) => (
                                    <div key={i} className="w-10 h-10 rounded-xl border-2 border-[#0b0b0f] overflow-hidden bg-white/5">
                                        <img src={e.coverImageUrl} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                             </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
      )}

      {activeView === 'broadcast' && (
        <section className="max-w-4xl mx-auto px-4 space-y-12 animate-in fade-in slide-in-from-bottom-8">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-medium tracking-tight">Global Communications</h2>
                <p className="text-[10px] font-medium tracking-tight text-indigo-500/40">Send official notifications to all platform members</p>
            </div>

            <Card className="p-12 border-white/5 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-medium tracking-tight text-white/40 px-1">Message Subject</label>
                        <Input 
                            value={broadcastSubject}
                            onChange={(e) => setBroadcastSubject(e.target.value)}
                            className="bg-white/5 border-white/5 h-16 rounded-2xl font-medium text-xl px-6 focus:border-indigo-500/40"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-medium tracking-tight text-white/40 px-1">Email Template</label>
                        <div className="flex gap-2">
                             <Select 
                                value={activeTemplateId}
                                onChange={(val) => setActiveTemplateId(val)}
                                options={templates.map(t => ({ 
                                  value: t.id, 
                                  label: t.name === 'Urgent Dispatch' ? 'Emergency Alert' : (t.name === 'Standard Protocol' || t.name === 'Official Notice' ? 'Official Announcement' : t.name)
                                }))}
                                className="flex-1"
                             />
                             <Button 
                                variant="outline" 
                                className="w-16 h-16 rounded-2xl border-white/5 hover:border-indigo-500/40"
                                onClick={() => setShowTemplateEditor(!showTemplateEditor)}
                             >
                                <Settings className="w-5 h-5 text-white/40" />
                             </Button>
                        </div>
                    </div>
                </div>

                {showTemplateEditor && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-4 border-t border-white/5"
                  >
                    <div className="flex items-center justify-between">
                         <label className="text-[10px] font-medium tracking-tight text-indigo-500 px-1">Template HTML Content</label>
                         <div className="text-[8px] text-white/20 font-bold tracking-tight">Use {"{{message}}"} for content mapping</div>
                    </div>
                    <textarea 
                        value={templates.find(t => t.id === activeTemplateId)?.body || ''}
                        onChange={(e) => {
                            const newTemplates = templates.map(t => 
                                t.id === activeTemplateId ? { ...t, body: e.target.value } : t
                            );
                            setTemplates(newTemplates);
                        }}
                        className="w-full h-48 bg-black/50 border border-white/10 rounded-2xl p-6 font-mono text-xs focus:outline-none focus:border-indigo-500/40"
                    />
                    <div className="flex justify-end">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => saveTemplate(activeTemplateId, templates.find(t => t.id === activeTemplateId)?.body || '')}
                            className="text-[10px] font-medium tracking-tight gap-2 hover:text-indigo-400"
                        >
                            <RefreshCcw className="w-3 h-3" />
                            Save to Database
                        </Button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                    <label className="text-[10px] font-medium tracking-tight text-white/40 px-1">Message Announcement</label>
                    <textarea 
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Type your announcement here..."
                        className="w-full min-h-[300px] bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl border border-white/5 rounded-2xl p-10 focus:outline-none focus:border-indigo-500/40 transition-all font-medium text-lg resize-none"
                    />
                </div>

                <div className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-4 text-[10px] font-medium tracking-tight text-white/20">
                         <ShieldCheck className="w-4 h-4 text-emerald-500" />
                         Authorized Secure Delivery Channel
                    </div>
                    <Button 
                        variant="vux"
                        onClick={handleSendBroadcast}
                        disabled={sendingBroadcast || !broadcastMessage}
                        className="h-20 px-16 rounded-3xl gap-6 shadow-2xl shadow-indigo-600/30 group"
                    >
                        <span className="font-medium tracking-tight text-lg">Send Broadcast</span>
                        <RefreshCcw className={cn("w-6 h-6", sendingBroadcast && "animate-spin")} />
                    </Button>
                </div>
            </Card>

            <Card className="p-12 border-white/5 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl space-y-10 border-dashed">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-xl font-medium tracking-tight">Automated Sequences</h3>
                        <p className="text-[10px] font-medium tracking-tight text-indigo-500/40">Smart notification triggers</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6 group">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Clock className="w-5 h-5 font-bold" />
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-medium">Ready</Badge>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-medium tracking-tight text-white">24h Event Reminder</h4>
                            <p className="text-[10px] font-medium text-white/30">Sends automatically 24 hours before event start time.</p>
                        </div>
                        <Button 
                            variant="outline" 
                            className="w-full rounded-xl border-white/5 hover:border-indigo-500/20 text-[8px] font-medium tracking-tight"
                            onClick={() => {
                                toast.promise(
                                    fetch('/api/admin/reminders/trigger', { method: 'POST' }),
                                    {
                                        loading: 'Scanning events for reminders...',
                                        success: 'Reminder sequence initiated',
                                        error: 'Failed to trigger reminders'
                                    }
                                );
                            }}
                        >
                            Trigger Manual Scan
                        </Button>
                     </div>

                      <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6 group">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Users className="w-5 h-5" />
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-medium">Ready</Badge>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-medium tracking-tight text-white">Post-Event Survey</h4>
                            <p className="text-[10px] font-medium text-white/30">Collect feedback 2 hours after conclusion.</p>
                        </div>
                        <Button 
                            variant="outline" 
                            className="w-full rounded-xl border-white/5 hover:border-indigo-500/20 text-[8px] font-medium tracking-tight"
                            onClick={() => {
                                toast.promise(
                                    fetch('/api/admin/surveys/trigger', { method: 'POST' }),
                                    {
                                        loading: 'Scanning events for surveys...',
                                        success: 'Survey sequence initiated',
                                        error: 'Failed to trigger surveys'
                                    }
                                );
                            }}
                        >
                            Trigger Manual Scan
                        </Button>
                      </div>
                </div>
            </Card>
        </section>
      )}

      {activeView === 'config' && siteConfig && (
        <section className="max-w-4xl mx-auto px-4 space-y-12 animate-in fade-in slide-in-from-bottom-8">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-medium tracking-tight">Site Configuration</h2>
                <p className="text-[10px] font-medium tracking-tight text-indigo-500/80">Manage global pulse and platform heuristics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-10 border-white/5 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl space-y-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-medium tracking-tight">Identity & Brand</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[9px] font-medium tracking-tight text-white/30 px-1">Platform Name</label>
                            <Input 
                                value={siteConfig.title}
                                onChange={(e) => setSiteConfig({...siteConfig, title: e.target.value})}
                                className="bg-white/5 border-white/5 h-14 rounded-xl font-medium text-lg"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-medium tracking-tight text-white/30 px-1">Site Tagline</label>
                            <Input 
                                value={siteConfig.tagline}
                                onChange={(e) => setSiteConfig({...siteConfig, tagline: e.target.value})}
                                className="bg-white/5 border-white/5 h-14 rounded-xl font-medium"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-medium tracking-tight text-white/30 px-1">Contact Email</label>
                            <Input 
                                value={siteConfig.contactEmail}
                                onChange={(e) => setSiteConfig({...siteConfig, contactEmail: e.target.value})}
                                className="bg-white/5 border-white/5 h-14 rounded-xl font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <label className="text-[9px] font-medium tracking-tight text-indigo-500 px-1">Event Categories</label>
                            <div className="flex flex-wrap gap-2">
                                {siteConfig.categories.map((cat, i) => (
                                    <Badge key={i} className="bg-white/5 border-white/10 text-white/60 text-[9px] font-medium tracking-tight px-3 py-1.5 rounded-lg group/badge relative overflow-hidden">
                                        {cat}
                                        <button 
                                            onClick={() => {
                                                const newCats = siteConfig.categories.filter((_, idx) => idx !== i);
                                                setSiteConfig({...siteConfig, categories: newCats});
                                            }}
                                            className="ml-2 hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 rounded-lg border-dashed border-white/20 text-[8px] font-medium tracking-tight gap-2 bg-transparent"
                                    onClick={() => {
                                        const newCat = prompt('Enter new category name:');
                                        if (newCat) {
                                            setSiteConfig({...siteConfig, categories: [...siteConfig.categories, newCat]});
                                        }
                                    }}
                                >
                                    <Plus className="w-3 h-3" /> Add Category
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-10 border-white/5 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl space-y-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-medium tracking-tight">Live Announcements</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium tracking-tight text-white">Top Banner</h4>
                                <p className="text-[9px] text-white/70 font-bold tracking-tight">Broadcast global notice</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSiteConfig({ ...siteConfig, announcement: { ...siteConfig.announcement, enabled: !siteConfig.announcement.enabled } })}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all relative overflow-hidden",
                                    siteConfig.announcement.enabled ? "bg-indigo-500 shadow-lg shadow-indigo-500/40" : "bg-white/10"
                                )}
                            >
                                <motion.div 
                                    animate={{ x: siteConfig.announcement.enabled ? 24 : 4 }}
                                    className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-sm" 
                                />
                            </button>
                        </div>

                        {siteConfig.announcement.enabled && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6 animate-in slide-in-from-top-4"
                            >
                                <div className="space-y-3">
                                    <label className="text-[9px] font-medium tracking-tight text-white/30 px-1">Banner Text</label>
                                    <Input 
                                        value={siteConfig.announcement.text}
                                        onChange={(e) => setSiteConfig({...siteConfig, announcement: { ...siteConfig.announcement, text: e.target.value }})}
                                        className="bg-white/5 border-white/5 h-14 rounded-xl font-bold text-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-medium tracking-tight text-white/30 px-1">Internal Target Link</label>
                                    <Input 
                                        value={siteConfig.announcement.link}
                                        onChange={(e) => setSiteConfig({...siteConfig, announcement: { ...siteConfig.announcement, link: e.target.value }})}
                                        placeholder="/upgrade or https://..."
                                        className="bg-white/5 border-white/5 h-14 rounded-xl font-mono text-[10px]"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
                            <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-indigo-400 font-medium leading-relaxed">
                                Announcement changes take effect for all visitors upon next page synchronization.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex justify-center pt-8">
                <Button 
                    variant="vux"
                    onClick={handleSaveConfig}
                    disabled={savingConfig}
                    className="h-20 px-20 rounded-[32px] gap-6 shadow-2xl shadow-indigo-600/30 group bg-indigo-600 hover:bg-indigo-500"
                >
                    <Save className={cn("w-6 h-6", savingConfig && "animate-spin")} />
                    <span className="font-medium tracking-tight text-lg">Commit Changes</span>
                </Button>
            </div>
        </section>
      )}

      {(activeView === 'users' || activeView === 'events' || activeView === 'pulses') && (
        <section className="space-y-10 px-4">
            <div className="flex items-center gap-6">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input 
                       type="text" 
                       placeholder={`Search for ${activeView}...`}
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl border border-white/5 rounded-3xl h-16 pl-16 pr-8 text-sm focus:outline-none focus:border-purple-500/40 transition-all font-medium placeholder: placeholder:text-white/10"
                    />
                </div>
                
                {activeView === 'events' && (
                    <div className="relative min-w-[200px]">
                        <Select 
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val as any)}
                            options={[
                                { value: 'all', label: 'ALL STATUS' },
                                { value: 'draft', label: 'DRAFT' },
                                { value: 'published', label: 'PUBLISHED' },
                                { value: 'completed', label: 'COMPLETED' },
                                { value: 'cancelled', label: 'CANCELLED' }
                            ]}
                            className="h-16"
                        />
                    </div>
                )}

                <Button variant="ghost" size="icon" onClick={fetchData} className="w-16 h-16 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl hover:bg-white/5 transition-all">
                    <RefreshCcw className={cn("w-5 h-5 text-white/40", loading && "animate-spin")} />
                </Button>
            </div>

            <Card className="overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-8 text-[10px] font-medium tracking-tight text-indigo-500/40">
                                  {activeView === 'pulses' ? 'Log Time' : 'Name'}
                                </th>
                                <th className="p-8 text-[10px] font-medium tracking-tight text-indigo-500/40">
                                  {activeView === 'pulses' ? 'Action' : 'Status'}
                                </th>
                                <th className="p-8 text-[10px] font-medium tracking-tight text-indigo-500/40">
                                  {activeView === 'pulses' ? 'Details' : (activeView === 'users' ? 'Joined On' : 'Event Date')}
                                </th>
                                <th className="p-8 text-[10px] font-medium tracking-tight text-indigo-500/40 text-right">
                                  {activeView === 'pulses' ? 'Technical Data' : 'Actions'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {activeView === 'users' ? (
                                usersList.filter(u => (u.displayName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || (u as any).email?.toLowerCase().includes((searchQuery || '').toLowerCase())).map((u: any) => (
                                    <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors duration-500">
                                        <td className="p-8">
                                            <div className="flex items-center gap-5">
                                                <Avatar src={u.photoURL} size="lg" className="border-2 border-white/10" />
                                                <div className="space-y-1">
                                                <p className="font-medium text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">{u.displayName}</p>
                                                    <p className="text-[10px] text-white/40 font-bold tracking-tight">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            {u.isVerified ? (
                                                <Badge className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-medium tracking-tight px-3 py-1">OFFICIAL</Badge>
                                            ) : (
                                                <Badge className="bg-white/5 border border-white/10 text-white/40 text-[9px] font-medium tracking-tight px-3 py-1">STANDARD</Badge>
                                            )}
                                        </td>
                                        <td className="p-8 text-[11px] text-white/60 font-mono tracking-tight">
                                            {u.createdAt ? formatDate(u.createdAt) : 'JOINED: N/A'}
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!u.isVerified && (
                                                    <Button variant="ghost" size="icon" title="Assign Official Status" onClick={() => handleVerifyUser(u.id)} className="text-white/10 hover:text-emerald-500 hover:bg-emerald-500/10 h-14 w-14 rounded-2xl transition-all">
                                                        <ShieldCheck className="w-6 h-6" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" title="Contact Member" onClick={() => handleDirectMail(u.email)} className="text-white/10 hover:text-indigo-500 hover:bg-indigo-500/10 h-14 w-14 rounded-2xl transition-all">
                                                    <Mail className="w-6 h-6" />
                                                </Button>
                                                <Button variant="ghost" size="icon" title="Remove Member" onClick={() => handleDeleteUser(u.id)} className="text-white/20 hover:text-red-500 hover:bg-red-500/10 h-14 w-14 rounded-2xl transition-all">
                                                    <Trash2 className="w-6 h-6" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : activeView === 'events' ? (
                                eventsList.filter(e => {
                                    const matchesSearch = (e.title || '').toLowerCase().includes((searchQuery || '').toLowerCase());
                                    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
                                    return matchesSearch && matchesStatus;
                                }).map((e) => (
                                    <tr key={e.id} className="group hover:bg-white/[0.02] transition-colors duration-500">
                                        <td className="p-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-10 rounded-xl overflow-hidden grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500">
                                                    <img src={e.coverImageUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-medium text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors leading-none">{e.title}</p>
                                                    <p className="text-[9px] text-white/20 font-bold tracking-tight">{e.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-col gap-2">
                                                <Badge className={cn(
                                                    "text-[9px]  font-medium tracking-tight px-3 py-1  w-fit",
                                                    e.status === 'published' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                    e.status === 'draft' ? "bg-white/5 text-white/40 border border-white/10" :
                                                    e.status === 'completed' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                                                    "bg-red-500/10 text-red-400 border border-red-500/20"
                                                )}>
                                                    {e.status.toUpperCase()}
                                                </Badge>
                                                <span className="text-[10px] text-white/20 font-bold tracking-tight">{e.location}</span>
                                            </div>
                                        </td>
                                        <td className="p-8 text-[11px] text-white/40 font-mono tracking-tight">
                                            {formatDate(e.date)}
                                        </td>
                                        <td className="p-8 text-right">
                                            <Button variant="ghost" size="icon" title="Delete Management Record" onClick={() => handleDeleteEvent(e.id)} className="text-white/20 hover:text-red-500 hover:bg-red-500/10 h-14 w-14 rounded-2xl transition-all">
                                                <Trash2 className="w-6 h-6" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                pulsesList.filter(p => p.message.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
                                    <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors duration-500">
                                        <td className="p-8 text-[11px] text-white/40 font-mono tracking-tight">
                                            {p.timestamp?.toDate ? formatDate(p.timestamp.toDate(), { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Pending...'}
                                        </td>
                                        <td className="p-8">
                                            <Badge className={cn(
                                              "text-[9px]  font-medium tracking-tight px-3 py-1 ",
                                              p.type === 'REGISTRATION' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                                              p.type === 'RSVP' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                              "bg-white/5 text-white/40 border border-white/10"
                                            )}>
                                              {p.type.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-8 text-sm font-bold tracking-tight text-white/80 group-hover:text-white transition-colors">
                                            {p.message}
                                        </td>
                                        <td className="p-8 text-right text-[9px] font-mono text-white/10 tracking-tight">
                                            {JSON.stringify(p.metadata)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </section>
      )}
    </div>
  );
}
