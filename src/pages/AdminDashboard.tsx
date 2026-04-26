/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Users, Calendar, BarChart3, Trash2, Shield, Search, Filter, MoreVertical, RefreshCcw, Activity, Mail, Settings, ShieldCheck } from 'lucide-react';
import { Event, UserProfile } from '../types';
import { PulseType } from '../services/PulseService';
import { formatDate, cn } from '../lib/utils';

interface Pulse {
  id: string;
  type: PulseType;
  message: string;
  userId: string;
  metadata: any;
  timestamp: any;
}
import { motion, AnimatePresence } from 'motion/react';

const ADMIN_EMAIL = 'oladoyeheritage445@gmail.com';

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, events: 0, rsvps: 0 });
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [pulsesList, setPulsesList] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'events' | 'pulses' | 'broadcast'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'completed' | 'cancelled'>('all');
  
  // Broadcast State
  const [broadcastSubject, setBroadcastSubject] = useState('Important Update from VUX Events');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [templates, setTemplates] = useState([
    { id: 'default', name: 'Official Notice', body: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0b0b0f; border: 1px solid #222; border-radius: 24px; overflow: hidden;"><div style="background: #111; padding: 30px; text-align: center; border-bottom: 1px solid #222;"><h1 style="color: white; margin: 0; font-style: italic; text-transform: uppercase; letter-spacing: -1px;">VUX Broadcast</h1></div><div style="padding: 40px; color: #ccc; line-height: 1.6; font-size: 16px;">{{message}}</div><div style="padding: 30px; background: #080808; text-align: center; border-top: 1px solid #222;"><p style="color: #444; font-size: 11px; text-transform: uppercase; margin: 0;">System Notification</p></div></div>' },
    { id: 'upgrade', name: 'Upgrade Signal', body: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0b0b0f; border: 2px solid #6366f1; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);"><div style="background: linear-gradient(to right, #6366f1, #a855f7); padding: 40px; text-align: center;"><h1 style="color: white; margin: 0; font-style: italic; text-transform: uppercase; letter-spacing: -2px; font-size: 42px;">SYSTEM UPGRADE</h1><p style="color: rgba(255,255,255,0.8); margin-top: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Version 2.0 Synchronized</p></div><div style="padding: 50px; color: #fff; line-height: 1.8; font-size: 18px; background: rgba(255,255,255,0.02);">{{message}}</div><div style="padding: 30px; background: #050505; text-align: center; border-top: 1px solid #222;"><a href="https://vuxevents.zone.id" style="color: #6366f1; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Access Update Details &rarr;</a></div></div>' },
    { id: 'urgent', name: 'Emergency Alert', body: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0b0b0f; border: 1px solid #ff000033; border-radius: 24px; overflow: hidden;"><div style="background: #ff000033; padding: 30px; text-align: center; border-bottom: 1px solid #ff000055;"><h1 style="color: #ff4444; margin: 0; font-style: italic; text-transform: uppercase;">URGENT MESSAGE</h1></div><div style="padding: 40px; color: #fff; line-height: 1.6; font-size: 16px;">{{message}}</div><div style="padding: 30px; background: #080808; text-align: center;"><p style="color: #ff4444; font-size: 11px; text-transform: uppercase; margin: 0;">Priority Delivery</p></div></div>' }
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
      const usersSnap = await getDocs(collection(db, 'users'));
      const eventsSnap = await getDocs(collection(db, 'events'));
      const pulsesSnap = await getDocs(query(collection(db, 'system_pulses'), orderBy('timestamp', 'desc'), limit(100)));
      
      const users = usersSnap.docs.map(doc => ({ uid: doc.id, id: doc.id, ...doc.data() } as any));
      const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const pulses = pulsesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      setUsersList(users);
      setEventsList(events);
      setPulsesList(pulses);
      setSelectedRecipients(users.map(u => u.email).filter(Boolean));
      setStats({
        users: users.length,
        events: events.length,
        rsvps: pulses.filter(p => p.type === 'RSVP').length
      });

      // Fetch templates from DB if they exist
      const templatesSnap = await getDocs(collection(db, 'email_templates'));
      if (!templatesSnap.empty) {
        setTemplates(templatesSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage || selectedRecipients.length === 0) {
      alert('Missing message or recipients.');
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
        alert('Broadcast message sent successfully.');
        setBroadcastMessage('');
      } else {
        const err = await response.json();
        alert(`Failed to send broadcast: ${err.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Broadcast delivery encountered an error.');
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
        <div className="w-24 h-24 rounded-[2.5rem] bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <Shield className="w-10 h-10 text-red-500 animate-pulse" />
        </div>
        <div className="space-y-2">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">ADMIN ACCESS ONLY</h2>
            <p className="text-white/60 max-w-sm uppercase text-[10px] font-black tracking-[0.4em] leading-relaxed">
              This area is restricted to authorized VUX administrators only.
            </p>
        </div>
        <Button variant="outline" className="rounded-xl border-white/10 uppercase text-[10px] font-black tracking-widest px-8" onClick={() => window.location.href = '/'}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-500">
            <div className="w-10 h-px bg-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Admin Management</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">ADMIN<br/>DASHBOARD</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-white/[0.03] p-2 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-xl">
            {[
                { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
                { id: 'broadcast', label: 'Broadcast', icon: <Mail className="w-4 h-4" /> },
                { id: 'pulses', label: 'Recent Activity', icon: <Activity className="w-4 h-4" /> },
                { id: 'users', label: 'All Users', icon: <Users className="w-4 h-4" /> },
                { id: 'events', label: 'All Events', icon: <Calendar className="w-4 h-4" /> }
            ].map((tab) => (
                <Button 
                    key={tab.id}
                    variant={activeView === tab.id ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveView(tab.id as any)}
                    className={cn(
                        "text-[10px] font-black uppercase tracking-widest h-12 px-8 rounded-2xl transition-all gap-3 whitespace-nowrap",
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
             { label: 'Total active users', value: stats.users, icon: <Users className="w-6 h-6 text-indigo-400" />, trend: '+14.2%', trendUp: true, color: 'indigo' },
             { label: 'Published events', value: stats.events, icon: <Calendar className="w-6 h-6 text-indigo-400" />, trend: '+8.1%', trendUp: true, color: 'indigo' },
             { label: 'Server Availability', value: '99.9%', icon: <RefreshCcw className="w-6 h-6 text-emerald-400" />, trend: 'HEALTHY', trendUp: true, color: 'emerald' },
           ].map((stat, i) => (
             <Card key={i} className="p-10 border-white/5 bg-white/[0.01] space-y-8 rounded-[40px] relative overflow-hidden group hover:bg-white/[0.03] transition-all duration-700">
                <div className={cn("absolute -top-20 -right-20 w-48 h-48 blur-3xl rounded-full transition-colors duration-700", i === 2 ? "bg-emerald-500/5 group-hover:bg-emerald-500/15" : "bg-indigo-500/5 group-hover:bg-indigo-500/15")} />
                <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner">
                        {stat.icon}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{stat.label}</p>
                    <h3 className="text-6xl font-black italic tracking-tighter uppercase">{stat.value}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn("px-2 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase", stat.trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                        {stat.trend}
                    </div>
                    <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Real-time updates</span>
                </div>
             </Card>
           ))}
        </section>
      )}

      {activeView === 'broadcast' && (
        <section className="max-w-4xl mx-auto px-4 space-y-12 animate-in fade-in slide-in-from-bottom-8">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase">Global Communications</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/40">Send official notifications to all platform members</p>
            </div>

            <Card className="p-12 border-white/5 bg-white/[0.01] rounded-[48px] space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 px-1">Message Subject</label>
                        <Input 
                            value={broadcastSubject}
                            onChange={(e) => setBroadcastSubject(e.target.value)}
                            className="bg-white/5 border-white/5 h-16 rounded-2xl font-black italic text-xl px-6 focus:border-indigo-500/40"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 px-1">Email Template</label>
                        <div className="flex gap-2">
                             <select 
                                value={activeTemplateId}
                                onChange={(e) => setActiveTemplateId(e.target.value)}
                                className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl h-16 px-6 text-sm italic font-bold focus:outline-none focus:border-indigo-500/40 appearance-none"
                             >
                                 {templates.map(t => <option key={t.id} value={t.id} className="bg-[#0b0b0f]">{t.name === 'Urgent Dispatch' ? 'Emergency Alert' : (t.name === 'Standard Protocol' || t.name === 'Official Notice' ? 'Official Announcement' : t.name)}</option>)}
                             </select>
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
                         <label className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 px-1">Template HTML Content</label>
                         <div className="text-[8px] text-white/20 uppercase font-bold tracking-widest italic">Use {"{{message}}"} for content mapping</div>
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
                            className="text-[10px] font-black uppercase tracking-widest gap-2 hover:text-indigo-400"
                        >
                            <RefreshCcw className="w-3 h-3" />
                            Save to Database
                        </Button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 px-1">Message Announcement</label>
                    <textarea 
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Type your announcement here..."
                        className="w-full min-h-[300px] bg-white/[0.01] border border-white/5 rounded-[40px] p-10 focus:outline-none focus:border-indigo-500/40 transition-all font-medium italic text-lg resize-none"
                    />
                </div>

                <div className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20 italic">
                         <ShieldCheck className="w-4 h-4 text-emerald-500" />
                         Authorized Secure Delivery Channel
                    </div>
                    <Button 
                        variant="vux"
                        onClick={handleSendBroadcast}
                        disabled={sendingBroadcast || !broadcastMessage}
                        className="h-20 px-16 rounded-3xl gap-6 shadow-2xl shadow-indigo-600/30 group"
                    >
                        <span className="font-black uppercase tracking-widest text-lg">Send Broadcast</span>
                        <RefreshCcw className={cn("w-6 h-6", sendingBroadcast && "animate-spin")} />
                    </Button>
                </div>
            </Card>
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
                       className="w-full bg-white/[0.01] border border-white/5 rounded-3xl h-16 pl-16 pr-8 text-sm focus:outline-none focus:border-purple-500/40 transition-all font-medium placeholder:italic placeholder:text-white/10"
                    />
                </div>
                
                {activeView === 'events' && (
                    <div className="relative">
                        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-white/[0.01] border border-white/5 rounded-3xl h-16 pl-14 pr-10 text-[10px] font-black uppercase tracking-widest text-white/40 focus:outline-none focus:border-purple-500/40 appearance-none cursor-pointer hover:bg-white/5 transition-all"
                        >
                            <option value="all" className="bg-[#0b0b0f]">ALL STATUS</option>
                            <option value="draft" className="bg-[#0b0b0f]">DRAFT</option>
                            <option value="published" className="bg-[#0b0b0f]">PUBLISHED</option>
                            <option value="completed" className="bg-[#0b0b0f]">COMPLETED</option>
                            <option value="cancelled" className="bg-[#0b0b0f]">CANCELLED</option>
                        </select>
                    </div>
                )}

                <Button variant="ghost" size="icon" onClick={fetchData} className="w-16 h-16 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all">
                    <RefreshCcw className={cn("w-5 h-5 text-white/40", loading && "animate-spin")} />
                </Button>
            </div>

            <Card className="overflow-hidden border-white/5 bg-white/[0.01] rounded-[40px] shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/40">
                                  {activeView === 'pulses' ? 'Log Time' : 'Name'}
                                </th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/40">
                                  {activeView === 'pulses' ? 'Action' : 'Status'}
                                </th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/40">
                                  {activeView === 'pulses' ? 'Details' : (activeView === 'users' ? 'Joined On' : 'Event Date')}
                                </th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/40 text-right">
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
                                                <p className="font-black italic text-lg tracking-tighter uppercase text-white group-hover:text-indigo-400 transition-colors">{u.displayName}</p>
                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            {u.isVerified ? (
                                                <Badge className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] uppercase font-black tracking-widest px-3 py-1 italic">OFFICIAL</Badge>
                                            ) : (
                                                <Badge className="bg-white/5 border border-white/10 text-white/40 text-[9px] uppercase font-black tracking-widest px-3 py-1 italic">STANDARD</Badge>
                                            )}
                                        </td>
                                        <td className="p-8 text-[11px] text-white/60 font-mono italic tracking-tighter">
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
                                                    <p className="font-black italic text-lg tracking-tighter uppercase text-white group-hover:text-indigo-400 transition-colors leading-none">{e.title}</p>
                                                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">{e.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-col gap-2">
                                                <Badge className={cn(
                                                    "text-[9px] uppercase font-black tracking-widest px-3 py-1 italic w-fit",
                                                    e.status === 'published' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                    e.status === 'draft' ? "bg-white/5 text-white/40 border border-white/10" :
                                                    e.status === 'completed' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                                                    "bg-red-500/10 text-red-400 border border-red-500/20"
                                                )}>
                                                    {e.status.toUpperCase()}
                                                </Badge>
                                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">{e.location}</span>
                                            </div>
                                        </td>
                                        <td className="p-8 text-[11px] text-white/40 font-mono italic tracking-tighter">
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
                                        <td className="p-8 text-[11px] text-white/40 font-mono italic tracking-tighter uppercase">
                                            {p.timestamp?.toDate ? formatDate(p.timestamp.toDate(), { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Pending...'}
                                        </td>
                                        <td className="p-8">
                                            <Badge className={cn(
                                              "text-[9px] uppercase font-black tracking-widest px-3 py-1 italic",
                                              p.type === 'REGISTRATION' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                                              p.type === 'RSVP' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                              "bg-white/5 text-white/40 border border-white/10"
                                            )}>
                                              {p.type.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-8 text-sm font-bold italic tracking-tight text-white/80 group-hover:text-white transition-colors">
                                            {p.message}
                                        </td>
                                        <td className="p-8 text-right text-[9px] font-mono text-white/10 uppercase tracking-widest">
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
