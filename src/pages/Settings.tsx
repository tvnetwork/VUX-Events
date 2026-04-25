/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings as SettingsIcon, CreditCard, ChevronRight, Globe, Twitter, Instagram, Link as LinkIcon, Camera, Bell, Shield, Calendar, Mail, Smartphone, Globe2, Check, ArrowRight, Info, ShieldCheck, Box, QrCode } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Switch } from '../components/ui/Switch';
import { useAuth } from '../AuthContext';
import { cn, getAvatarUrl } from '../lib/utils';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { VUXQRCode } from '../components/VUXQRCode';

export function Settings() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'connections' | 'payment'>('profile');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
   const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    photoURL: profile?.photoURL || '',
    phoneNumber: profile?.phoneNumber || '',
    dob: profile?.dob || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: profile?.preferences?.emailNotifications ?? true,
    pushNotifications: profile?.preferences?.pushNotifications ?? true,
    publicProfile: profile?.preferences?.publicProfile ?? true,
    calendarSync: profile?.preferences?.calendarSync ?? false,
    theme: profile?.preferences?.theme ?? 'dark',
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'preferences', label: 'Account', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'connections', label: 'Apps', icon: <Calendar className="w-4 h-4" /> },
    { id: 'payment', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        photoURL: profile.photoURL || '',
        phoneNumber: profile.phoneNumber || '',
        dob: profile.dob || '',
      });
      setPreferences({
        emailNotifications: profile.preferences?.emailNotifications ?? true,
        pushNotifications: profile.preferences?.pushNotifications ?? true,
        publicProfile: profile.preferences?.publicProfile ?? true,
        calendarSync: profile.preferences?.calendarSync ?? false,
        theme: profile.preferences?.theme ?? 'dark',
      });
    }
  }, [profile]);

  // Auto-save logic
  useEffect(() => {
    if (!profile || !user) return;

    const timer = setTimeout(async () => {
      const hasAvatarChanged = formData.photoURL !== profile.photoURL;
      const hasDisplayNameChanged = formData.displayName !== profile.displayName;
      const hasBioChanged = formData.bio !== profile.bio;
      const hasPhoneChanged = formData.phoneNumber !== profile.phoneNumber;
      const hasDobChanged = formData.dob !== profile.dob;
      const hasPrefsChanged = JSON.stringify(preferences) !== JSON.stringify(profile.preferences);

      if (!hasAvatarChanged && !hasDisplayNameChanged && !hasBioChanged && !hasPhoneChanged && !hasDobChanged && !hasPrefsChanged) {
        return;
      }

      setSaveStatus('saving');
      try {
        const docId = user.email || user.uid;
        await updateDoc(doc(db, 'users', docId), {
          ...formData,
          preferences,
          updatedAt: new Date().toISOString()
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        console.error(e);
        setSaveStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, preferences, profile, user]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-purple-500">
             <div className="w-10 h-px bg-purple-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Settings</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">YOUR<br/>ACCOUNT</h1>
          <div className="flex items-center gap-4 h-6 uppercase font-black italic">
            <span className="text-white/20 text-[10px] tracking-widest">General Settings</span>
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                  className="flex items-center gap-1.5 text-[8px] tracking-[0.2em] text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full"
                >
                  <div className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
                  UPLOADING CHANGES
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                  className="flex items-center gap-1.5 text-[8px] tracking-[0.2em] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full"
                >
                  <Check className="w-2.5 h-2.5" />
                  SYNCHRONIZED
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex bg-white/[0.03] p-1.5 rounded-[2rem] border border-white/10 shadow-2xl overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                        "flex items-center gap-3 px-8 h-12 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all whitespace-nowrap",
                        activeTab === tab.id ? "bg-white text-black shadow-xl shadow-white/5" : "text-white/40 hover:text-white"
                    )}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
      </header>

      <div className="mt-16">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              <div className="lg:col-span-8 space-y-12">
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-white/40" />
                    </div>
                    <h2 className="text-xl font-black italic tracking-tighter uppercase">Personal Profile</h2>
                  </div>
                  
                  <Card className="p-10 space-y-10 border-white/5 bg-white/[0.01] rounded-[40px] shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <div className="relative group">
                         <div className="w-32 h-32 rounded-[3rem] overflow-hidden border-2 border-white/5 group-hover:border-purple-500/50 transition-all duration-700">
                             <img 
                                src={formData.photoURL || getAvatarUrl(profile?.uid)} 
                                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                             />
                         </div>
                         <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-2xl text-black hover:scale-110 active:scale-95 transition-transform">
                             <Camera className="w-5 h-5" />
                         </button>
                      </div>
                      <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Profile Picture</h3>
                        <p className="text-white/20 text-xs font-medium italic max-w-xs uppercase tracking-widest">This is visible to other users on event pages and across the network.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-1">Display Name</label>
                        <Input 
                            value={formData.displayName} 
                            onChange={e => setFormData({...formData, displayName: e.target.value})}
                            className="bg-white/5 border-white/5 h-16 rounded-2xl font-black italic text-xl px-6 focus:border-purple-500/40"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-1">Username</label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 italic text-xl font-black">@</span>
                            <Input 
                                disabled
                                defaultValue={(profile?.uid || '').slice(0, 8).toUpperCase()}
                                className="pl-12 bg-white/[0.02] border-white/5 h-16 rounded-2xl font-mono text-xs opacity-50 cursor-not-allowed"
                            />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-1">Phone Number</label>
                        <Input 
                            value={formData.phoneNumber} 
                            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                            placeholder="+1 (555) 000-0000"
                            className="bg-white/5 border-white/5 h-16 rounded-2xl font-bold italic text-lg px-6 focus:border-purple-500/40"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-1">Date of Birth</label>
                        <Input 
                            type="date"
                            value={formData.dob} 
                            onChange={e => setFormData({...formData, dob: e.target.value})}
                            className="bg-white/5 border-white/5 h-16 rounded-2xl font-bold italic text-lg px-6 focus:border-purple-500/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-1">Bio</label>
                      <textarea 
                        className="w-full min-h-[160px] rounded-[32px] bg-white/5 border border-white/5 p-8 text-sm focus:outline-none focus:border-purple-500/40 transition-all resize-none font-medium italic"
                        value={formData.bio}
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        placeholder="Tell the community about yourself..."
                      />
                    </div>
                  </Card>
                </section>
              </div>

              <div className="lg:col-span-4 space-y-12">
                 <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                            <QrCode className="w-5 h-5 text-white/40" />
                        </div>
                        <h2 className="text-xl font-black italic tracking-tighter uppercase">Personal QR Code</h2>
                    </div>
                    <VUXQRCode 
                        value={`${window.location.origin}/discover?user=${profile?.uid}`}
                        className="w-full"
                    />
                 </section>

                 <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                            <Globe2 className="w-5 h-5 text-white/40" />
                        </div>
                        <h2 className="text-xl font-black italic tracking-tighter uppercase">Social Links</h2>
                    </div>
                    <Card className="p-8 space-y-6 border-white/5 bg-white/[0.01] rounded-[40px]">
                        {[
                            { icon: <Twitter className="w-4 h-4" />, label: 'X (Twitter)' },
                            { icon: <Instagram className="w-4 h-4" />, label: 'Instagram' },
                            { icon: <Globe2 className="w-4 h-4" />, label: 'Portfolio' },
                        ].map((soc, i) => (
                            <div key={i} className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/20 flex items-center gap-2">{soc.icon} {soc.label}</label>
                                <Input className="bg-white/5 border-white/5 h-12 rounded-xl text-xs px-5" placeholder="username" />
                            </div>
                        ))}
                    </Card>
                 </section>

                 <Card className="p-8 border-white/5 bg-purple-500/5 rounded-[40px] space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 blur-3xl rounded-full" />
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        profile?.isVerified ? "bg-emerald-500 text-white" : "bg-white text-black"
                    )}>
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-black italic uppercase tracking-tighter">
                            {profile?.isVerified ? "VERIFIED NODE" : "VERIFICATION"}
                        </h4>
                        <p className="text-[10px] text-white/40 font-medium italic leading-relaxed">
                            {profile?.isVerified 
                                ? "Your identity is authenticated on the VUX network. You have full protocol access." 
                                : "Your account is currently at the standard verification level. Upgrade for premium features."}
                        </p>
                    </div>
                    {!profile?.isVerified && (
                        <Button variant="outline" className="w-full rounded-2xl border-white/10 h-12 text-[10px] font-black uppercase tracking-widest group">
                            Upgrade Verification
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    )}
                 </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
               key="preferences"
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="max-w-3xl mx-auto space-y-16"
            >
               <section className="space-y-8">
                  <div className="text-center space-y-2">
                     <h2 className="text-4xl font-black italic uppercase tracking-tighter">Notifications</h2>
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Control how updates are delivered to you</p>
                  </div>
                   <Card className="overflow-hidden border-white/5 bg-white/[0.01] rounded-[48px]">
                     {[
                        { icon: <Mail className="w-5 h-5 text-purple-400" />, title: 'Email Reports', desc: 'Summary of community activity delivered weekly.', key: 'emailNotifications' },
                        { icon: <Smartphone className="w-5 h-5 text-blue-400" />, title: 'Push Notifications', desc: 'Instant notifications for event updates.', key: 'pushNotifications' },
                        { icon: <Shield className="w-5 h-5 text-emerald-400" />, title: 'Private Mode', desc: 'Hide your profile from public searches.', key: 'publicProfile' },
                        { icon: <Globe className="w-5 h-5 text-amber-500" />, title: 'Calendar Sync', desc: 'Share your schedule across connected apps.', key: 'calendarSync' },
                     ].map((pref, i) => (
                        <div key={i} className={cn("p-10 flex items-center justify-between group hover:bg-white/[0.02] transition-colors", i !== 0 && "border-t border-white/5")}>
                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-white/20 transition-all duration-500">
                                    {pref.icon}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black italic tracking-tighter uppercase">{pref.title}</h4>
                                    <p className="text-[10px] text-white/20 font-medium italic max-w-sm uppercase tracking-widest">{pref.desc}</p>
                                </div>
                            </div>
                            <Switch 
                                checked={(preferences as any)[pref.key]} 
                                onCheckedChange={(val) => setPreferences({...preferences, [pref.key]: val})} 
                            />
                        </div>
                     ))}
                  </Card>
               </section>
            </motion.div>
          )}

          {activeTab === 'connections' && (
            <motion.div
               key="connections"
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="max-w-4xl mx-auto space-y-12"
            >
               <Card className="p-16 border-white/5 bg-white/[0.01] rounded-[48px] text-center space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                  <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto">
                     <Box className="w-10 h-10 text-white/10" />
                  </div>
                  <div className="space-y-4">
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter">ACCOUNT CONNECTIONS</h3>
                      <p className="text-white/40 max-w-sm mx-auto text-sm font-medium italic leading-relaxed">
                         Connect your account to external calendar services for synchronization.
                      </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-6">
                     <button className="flex items-center gap-6 p-6 rounded-[32px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-6 h-6" />
                        </div>
                        <div className="text-left font-black italic tracking-tighter uppercase">Link Google</div>
                     </button>
                     <button className="flex items-center gap-6 p-6 rounded-[32px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0">
                           <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left font-black italic tracking-tighter uppercase">Link Outlook</div>
                     </button>
                  </div>
               </Card>
            </motion.div>
          )}

          {activeTab === 'payment' && (
             <motion.div
               key="payment"
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="py-40 text-center space-y-10"
             >
                <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center justify-center mx-auto text-white/5 animate-pulse">
                        <CreditCard className="w-12 h-12" />
                    </div>
                </div>
                <div className="space-y-4">
                   <h3 className="text-5xl font-black italic uppercase tracking-tighter">BILLING & PAYMENTS</h3>
                   <p className="text-white/20 max-w-sm mx-auto text-sm font-medium italic leading-relaxed uppercase tracking-widest">
                      Payment features for community access and premium events are currently being implemented.
                   </p>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 max-w-xs mx-auto">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Encrypted Secure Payment</span>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
