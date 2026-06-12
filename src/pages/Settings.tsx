/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Shield, 
  Lock, 
  Smartphone, 
  Fingerprint, 
  Zap, 
  Calendar, 
  Monitor, 
  Music, 
  AlertCircle, 
  Check, 
  ArrowRight,
  User,
  ExternalLink,
  ShieldCheck,
  Link as LinkIcon,
  Terminal
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';
import { TwoFactorSetup } from '../components/auth/TwoFactorSetup';
import { GoogleCalendarService } from '../services/GoogleCalendarService';
import { DeveloperHub } from '../components/DeveloperHub';

type SettingsTab = 'security' | 'integrations' | 'account' | 'developer';

export function Settings() {
  const { user, profile, updateProfileData, registerPasskey } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('security');
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will reduce your account security.')) return;
    
    setLoading(true);
    try {
      await updateProfileData({
        security: {
          ...profile?.security,
          twoFactorEnabled: false
        }
      });
    } catch (err) {
      console.error('Failed to disable 2FA:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'account', label: 'Account', icon: User },
    { id: 'developer', label: 'Developer API', icon: Terminal },
  ];

   return (
    <div className="min-h-screen bg-transparent pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        <Link to="/">
          <Button variant="ghost" className="gap-2 text-white/70 hover:text-white -ml-2 md:-ml-4 text-xs">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
 
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-blue-500">
               <div className="w-8 md:w-10 h-px bg-blue-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Configuration</span>
             </div>
             <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">SETTINGS</h1>
             <p className="text-[10px] text-white/90 font-black uppercase tracking-[0.4em] max-w-[200px] md:max-w-none">Personal Environment & Security Protocol</p>
          </div>
          
          <div className="flex bg-white/[0.03] p-1.5 rounded-2xl md:rounded-[2rem] border border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-blue-500 text-white shadow-xl shadow-blue-500/20" 
                    : "text-white/60 hover:text-white"
                )}
              >
                <tab.icon className="w-3 md:w-3.5 h-3 md:h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </header>
 
        <div className="grid grid-cols-1 gap-8 md:gap-12">
          {activeTab === 'security' && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-8 md:space-y-10"
            >
              {/* Identity Protection */}
              <Card className="p-6 md:p-10 border-white/5 bg-white/[0.01] rounded-[2rem] md:rounded-[3rem] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                
                <div className="space-y-8 md:space-y-10 relative z-10">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white">Identity Protection</h2>
                      <p className="text-[9px] md:text-[10px] text-white/90 font-bold uppercase tracking-widest leading-relaxed">Multi-Layer Authentication Layers</p>
                    </div>
                    <div className={cn(
                      "px-3 md:px-4 py-1 md:py-1.5 rounded-full border text-[8px] md:text-[9px] font-black uppercase tracking-widest italic whitespace-nowrap",
                      profile?.security?.twoFactorEnabled 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                      {profile?.security?.twoFactorEnabled ? 'Fortified' : 'Vulnerable'}
                    </div>
                  </div>
 
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all gap-6">
                      <div className="flex gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                          <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <h3 className="text-sm font-black uppercase tracking-widest text-white truncate">2FA (TOTP)</h3>
                          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic leading-relaxed max-w-[200px]">Secure your terminal with rotating keys.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 justify-between md:justify-start">
                        <span className={cn(
                          "text-[9px] md:text-[10px] font-black uppercase tracking-widest italic whitespace-nowrap",
                          profile?.security?.twoFactorEnabled ? "text-emerald-500" : "text-white/10"
                        )}>
                          {profile?.security?.twoFactorEnabled ? 'Active' : 'Inactive'}
                        </span>
                        {profile?.security?.twoFactorEnabled ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDisable2FA}
                            disabled={loading}
                            className="h-10 md:h-12 px-4 md:px-6 rounded-xl text-[9px] font-black uppercase tracking-widest border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                          >
                            Disable
                          </Button>
                        ) : (
                          <Button 
                            variant="vux" 
                            size="sm" 
                            onClick={() => setShow2FASetup(true)}
                            className="h-10 md:h-12 px-6 md:px-8 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2"
                          >
                            Initiate <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
 
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all gap-6">
                      <div className="flex gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                          <Fingerprint className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <h3 className="text-sm font-black uppercase tracking-widest text-white truncate">Passkeys</h3>
                          <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest italic leading-relaxed truncate md:whitespace-normal">Hardware biometric auth.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 justify-between md:justify-start">
                        <span className={cn(
                          "text-[9px] md:text-[10px] font-black uppercase tracking-widest italic whitespace-nowrap",
                          profile?.passkeys?.length ? "text-emerald-500" : "text-white/10"
                        )}>
                          {profile?.passkeys?.length ? `${profile.passkeys.length} Registered` : 'Inactive'}
                        </span>
                        <Button 
                          variant="vux" 
                          size="sm" 
                          onClick={async () => {
                            setLoading(true);
                            try {
                              await registerPasskey();
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={loading}
                          className="h-10 md:h-12 px-6 md:px-8 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2"
                        >
                          Register <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {profile?.passkeys && profile.passkeys.length > 0 && (
                      <div className="space-y-3 px-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Authorized Devices</h4>
                        <div className="grid grid-cols-1 gap-2">
                           {profile.passkeys.map((pk, i) => (
                             <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                                <div className="flex items-center gap-3">
                                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                   <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{pk.name}</span>
                                </div>
                                <span className="text-[9px] font-medium text-white/20 uppercase tracking-widest italic">
                                   {new Date(pk.createdAt).toLocaleDateString()}
                                </span>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
 
              <AnimatePresence>
                {show2FASetup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Card className="p-6 md:p-10 border-blue-500/20 bg-blue-500/[0.02] rounded-[2rem] md:rounded-[3rem]">
                      <TwoFactorSetup 
                        onComplete={() => setShow2FASetup(false)} 
                        onCancel={() => setShow2FASetup(false)} 
                      />
                    </Card>
                  </motion.div>
                )}
            
            {activeTab === 'developer' && (
              <DeveloperHub />
            )}
          </AnimatePresence>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                 <section className="space-y-4 p-8 md:p-10 bg-white/[0.01] rounded-[2rem] md:rounded-[3rem] border border-white/5">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-blue-500/40" />
                        <h2 className="text-sm font-black uppercase tracking-tighter text-white italic">Infrastructure</h2>
                    </div>
                    <p className="text-[10px] text-white/60 leading-relaxed font-medium italic uppercase tracking-widest">
                      Built on secure-by-default architecture. We leverage TLS 1.3 encryption & AES-256 protection.
                    </p>
                 </section>
                 <section className="space-y-4 p-8 md:p-10 bg-white/[0.01] rounded-[2rem] md:rounded-[3rem] border border-white/5">
                    <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-blue-500/40" />
                        <h2 className="text-sm font-black uppercase tracking-tighter text-white italic">Privacy</h2>
                    </div>
                    <p className="text-[10px] text-white/60 leading-relaxed font-medium italic uppercase tracking-widest">
                      Your data is yours. We never sell info and use OAuth for secure zero-credential storage.
                    </p>
                 </section>
              </div>
            </motion.div>
          )}
 
          {activeTab === 'integrations' && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-8 md:space-y-10"
            >
              <Card className="p-6 md:p-10 border-white/5 bg-white/[0.01] rounded-[2rem] md:rounded-[3rem] space-y-10">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white">App Ecosystem Status</h2>
                  <p className="text-[9px] md:text-[10px] text-white/30 font-bold uppercase tracking-widest">Connect external services to your VUX experience</p>
                </div>
 
                <div className="grid grid-cols-1 gap-6">
                   {/* Google Calendar Sync */}
                   <div className="flex flex-col gap-6 p-6 md:p-8 bg-white/[0.02] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 hover:bg-white/[0.04] transition-all group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-black uppercase text-white/70 tracking-widest leading-none truncate">Google Calendar</h4>
                                <p className="text-[10px] text-white/50 font-medium italic mt-2 uppercase tracking-widest truncate">Auto-sync events</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 justify-between sm:justify-start">
                           <span className={cn(
                               "text-[9px] font-black uppercase tracking-widest italic whitespace-nowrap",
                               profile?.integrations?.googleCalendar ? "text-emerald-500" : "text-white/20"
                           )}>
                               {profile?.integrations?.googleCalendar ? "Active Sync" : "Disconnected"}
                           </span>
                           <button 
                               onClick={async () => {
                                   if (!GoogleCalendarService.isConfigured()) return;
                                   setSaveStatus('saving');
                                   try {
                                     const isEnabling = !profile?.integrations?.googleCalendar;
                                     if (isEnabling) await GoogleCalendarService.getAccessToken();
                                     await updateProfileData({
                                         integrations: { ...profile?.integrations, googleCalendar: isEnabling }
                                     });
                                     setSaveStatus('saved');
                                   } catch (err) {
                                     setSaveStatus('error');
                                   } finally {
                                     setTimeout(() => setSaveStatus('idle'), 2000);
                                   }
                               }}
                               disabled={!GoogleCalendarService.isConfigured()}
                               className={cn(
                                   "w-12 h-6 md:w-14 md:h-7 rounded-full transition-all relative p-1 disabled:opacity-20 shrink-0",
                                   profile?.integrations?.googleCalendar ? "bg-emerald-500" : "bg-white/10"
                               )}
                           >
                              <div className={cn(
                                  "w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-transform",
                                  profile?.integrations?.googleCalendar ? "translate-x-6 md:translate-x-7" : "translate-x-0"
                              )} />
                           </button>
                        </div>
                      </div>
                      
                      {!GoogleCalendarService.isConfigured() && (
                        <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4 items-start">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-amber-500 tracking-wider italic">Configuration Required</p>
                            <p className="text-[10px] text-white/60 leading-relaxed italic uppercase tracking-widest">
                              Feature disabled. Add keys in project secrets.
                            </p>
                          </div>
                        </div>
                      )}
                   </div>
 
                   {/* Discord Connection */}
                   <div className="flex items-center justify-between p-6 md:p-8 bg-white/[0.02] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 hover:bg-white/[0.04] transition-all group gap-4">
                      <div className="flex items-center gap-4 md:gap-6 min-w-0">
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#5865F2]/10 flex items-center justify-center border border-[#5865F2]/20 shrink-0">
                              <Monitor className="w-5 h-5 md:w-6 md:h-6 text-[#5865F2]" />
                          </div>
                          <div className="min-w-0">
                              <h4 className="text-sm font-black uppercase text-white tracking-widest leading-none truncate">Discord</h4>
                              <p className="text-[10px] text-white/20 font-medium italic mt-2 uppercase tracking-widest truncate">Broadcast presence</p>
                          </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl px-4 md:px-6 border-white/10 text-[9px] font-black uppercase tracking-widest italic h-10 md:h-12 group-hover:bg-[#5865F2] group-hover:text-white transition-all shrink-0">
                         Connect
                      </Button>
                   </div>
 
                   {/* Spotify Connection */}
                   <div className="flex items-center justify-between p-6 md:p-8 bg-white/[0.02] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 hover:bg-white/[0.04] transition-all group gap-4">
                      <div className="flex items-center gap-4 md:gap-6 min-w-0">
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                              <Music className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                          </div>
                          <div className="min-w-0">
                              <h4 className="text-sm font-black uppercase text-white tracking-widest leading-none truncate">Spotify</h4>
                              <p className="text-[10px] text-white/20 font-medium italic mt-2 uppercase tracking-widest truncate">Sync soundtracks</p>
                          </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl px-4 md:px-6 border-white/10 text-[9px] font-black uppercase tracking-widest italic h-10 md:h-12 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                         Connect
                      </Button>
                   </div>
                </div>
              </Card>
            </motion.div>
          )}
 
          {activeTab === 'account' && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-8 md:space-y-10"
            >
              <Card className="p-6 md:p-10 border-white/5 bg-white/[0.01] rounded-[2rem] md:rounded-[3rem] space-y-10">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white">System Identity Status</h2>
                  <p className="text-[9px] md:text-[10px] text-white/60 font-bold uppercase tracking-widest leading-relaxed">Terminal profile & authentication records</p>
                </div>
 
                <div className="space-y-6">
                  {/* Google Core Account */}
                  <div className="p-6 md:p-8 bg-white/[0.02] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4 md:gap-6 min-w-0">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white flex items-center justify-center shadow-2xl shrink-0">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.68-2.31 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.13c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.13H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.87l3.66-2.74z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-[10px] font-black uppercase text-white/70 tracking-widest mb-1 italic">Authorized ID</h4>
                            <p className="text-base md:text-lg font-black italic tracking-tighter text-white uppercase truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] md:text-[9px] font-black uppercase text-emerald-500 tracking-widest italic">Connected</span>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                       <p className="text-[9px] md:text-[10px] text-white/50 font-bold uppercase tracking-widest">Protocol: OAuth 2.0</p>
                       <p className="text-[9px] md:text-[10px] text-white/50 font-bold uppercase tracking-widest">Type: Permanent Link</p>
                    </div>
                  </div>
 
                  {/* Account Sync Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-6 md:p-8 bg-white/[0.02] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                       <div className="flex gap-4">
                          <LinkIcon className="w-5 h-5 text-blue-500/40" />
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white italic">Cloud Sync</span>
                       </div>
                       <Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                    </div>
                    <div className="p-6 md:p-8 bg-white/[0.02] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                       <div className="flex gap-4">
                          <Shield className="w-5 h-5 text-blue-500/40" />
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white italic">Edge Encryption</span>
                       </div>
                       <Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </Card>
 
              <div className="flex justify-center pt-8">
                 <button className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-red-500/40 hover:text-red-500 transition-colors italic leading-relaxed text-center px-6">
                    Request Terminal Reset & Data Deletion
                 </button>
              </div>
            </motion.div>
          )}
        </div>
 
        <footer className="pt-20 border-t border-white/5 text-center space-y-6">
            <p className="text-[9px] md:text-[10px] text-white/10 font-black uppercase tracking-[0.4em] leading-loose italic">
                © 2026 VUX • System Configuration Sub-Module • v4.0.1
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
               <Link to="/security" className="text-[8px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">Security Documentation</Link>
               <span className="hidden sm:inline-block text-[8px] font-black uppercase text-white/5 italic select-none">Unauthorized Access Will Be Traced</span>
            </div>
        </footer>
      </div>
    </div>
  );
}
