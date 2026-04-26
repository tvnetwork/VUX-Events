/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, CreditCard, Shield, Calendar, Mail, Smartphone, Globe, Check, Info, ShieldCheck, Box, Monitor, RefreshCcw, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { useAuth } from '../AuthContext';
import { usePasskey } from '../hooks/usePasskey';
import { cn, formatDate } from '../lib/utils';

export function Settings() {
  const { user, profile, updateProfileData, addPasskey } = useAuth();
  const [activeTab, setActiveTab] = useState<'preferences' | 'connections' | 'security' | 'payment'>('preferences');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const { register } = usePasskey();
  
  const [preferences, setPreferences] = useState({
    emailNotifications: profile?.preferences?.emailNotifications ?? true,
    pushNotifications: profile?.preferences?.pushNotifications ?? true,
    publicProfile: profile?.preferences?.publicProfile ?? true,
    calendarSync: profile?.preferences?.calendarSync ?? false,
    theme: profile?.preferences?.theme ?? 'dark',
  });

  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'connections', label: 'Apps', icon: <Calendar className="w-4 h-4" /> },
    { id: 'payment', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (profile) {
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
      const hasPrefsChanged = JSON.stringify(preferences) !== JSON.stringify(profile.preferences);

      if (!hasPrefsChanged) {
        return;
      }

      setSaveStatus('saving');
      try {
        await updateProfileData({
          preferences
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        console.error(e);
        setSaveStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [preferences, profile, user, updateProfileData]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-purple-500">
             <div className="w-10 h-px bg-purple-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Config</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">SYSTEM<br/>SETTINGS</h1>
          <div className="flex items-center gap-4 h-6 uppercase font-black italic">
            <span className="text-white/20 text-[10px] tracking-widest">Protocol Configurations</span>
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                  className="flex items-center gap-1.5 text-[8px] tracking-[0.2em] text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full"
                >
                  <div className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
                  UPDATING PROTOCOLS
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                  className="flex items-center gap-1.5 text-[8px] tracking-[0.2em] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full"
                >
                  <Check className="w-2.5 h-2.5" />
                  CONFIG SYNCED
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

          {activeTab === 'security' && (
            <motion.div
               key="security"
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="max-w-4xl mx-auto space-y-16"
            >
               <section className="space-y-8">
                  <div className="text-center space-y-2">
                     <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Passkeys</h2>
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Secure biometric authentication</p>
                  </div>
                   
                   <Card className="p-12 border-white/5 bg-white/[0.01] rounded-[48px] space-y-10 relative overflow-hidden">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                          <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                  <Shield className="w-5 h-5 text-purple-500" />
                                  <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">Register Device</h3>
                              </div>
                              <p className="text-xs text-white/40 max-w-sm italic font-medium leading-relaxed">
                                  Passkeys allow you to sign in securely using biometrics (Face ID, Touch ID) without needing a password or OTP.
                              </p>
                          </div>
                          <Button 
                            disabled={passkeyLoading}
                            onClick={async () => {
                              if (!user || !profile) return;
                              setPasskeyLoading(true);
                              setPasskeyError(null);
                              try {
                                const passkey = await register(user.email!, profile.displayName);
                                await addPasskey(passkey);
                              } catch (err: any) {
                                console.error(err);
                                setPasskeyError(err.message || "Passkey registration failed");
                              } finally {
                                setPasskeyLoading(false);
                              }
                            }}
                            className="rounded-2xl h-14 px-10 gap-3 group"
                          >
                            <Plus className={cn("w-4 h-4 transition-transform group-hover:rotate-90", passkeyLoading && "animate-spin")} />
                            <span className="font-black italic uppercase text-xs tracking-widest">Add Passkey</span>
                          </Button>
                      </div>

                      {passkeyError && (
                        <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                          {passkeyError}
                        </div>
                      )}

                      <div className="space-y-6 pt-10 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Registered Passkeys</h4>
                            <span className="text-[10px] font-bold text-white/10 uppercase italic">
                              {(profile?.passkeys?.length || 0)} Devices
                            </span>
                          </div>

                          <div className="space-y-4">
                            {profile?.passkeys?.map((pk, i) => (
                              <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                  <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center border border-white/5 group-hover:border-purple-500/20 transition-all">
                                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-black italic uppercase tracking-tighter text-white">{pk.name || "Default Passkey"}</p>
                                    <p className="text-[9px] text-white/20 font-medium uppercase tracking-widest italic">
                                      Registered {formatDate(pk.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest">Active</div>
                                </div>
                              </div>
                            ))}
                            {(!profile?.passkeys || profile.passkeys.length === 0) && (
                              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
                                <Monitor className="w-10 h-10 text-white/5 mx-auto" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10 italic">No passkeys registered on this account.</p>
                              </div>
                            )}
                          </div>
                      </div>

                      <div className="p-8 rounded-[32px] bg-purple-500/5 border border-purple-500/10 flex items-start gap-6">
                        <Info className="w-5 h-5 text-purple-500 shrink-0 mt-1" />
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Security Requirement</p>
                          <p className="text-[11px] text-white/40 italic font-medium leading-relaxed uppercase tracking-wide">
                            Passkeys are device-specific. If you access VUX Events from a new computer or phone, you must register a passkey for that device while logged in with your email.
                          </p>
                        </div>
                      </div>
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
