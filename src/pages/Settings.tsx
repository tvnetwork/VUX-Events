import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
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
  ShieldCheck,
  Link as LinkIcon,
  Terminal
} from 'lucide-react';
import { Button } from '../components/ui/Button';
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
  ];

   return (
    <div className="w-full">
      <div className="max-w-[1000px] mx-auto space-y-10">
 
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
             <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
             <p className="text-sm text-white/50">Manage your account preferences, security, and developer settings.</p>
          </div>
          
          <div className="flex bg-white/[0.02] p-1.5 rounded-full border border-white/10 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" 
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </header>
 
        <div className="grid grid-cols-1 gap-8">
          {activeTab === 'security' && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-6"
            >
              {/* Identity Protection */}
              <div className="p-8 border border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                
                <div className="space-y-8 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div className="space-y-1">
                      <h2 className="text-lg font-medium text-white">Identity Protection</h2>
                      <p className="text-sm text-white/50">Configure multi-layer authentication to secure your account.</p>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap self-start sm:self-center",
                      profile?.security?.twoFactorEnabled 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                      {profile?.security?.twoFactorEnabled ? 'Fortified' : 'Vulnerable'}
                    </div>
                  </div>
 
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors gap-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                          <Smartphone className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-white">Authenticator App (2FA)</h3>
                          <p className="text-xs text-white/50 max-w-[300px]">Secure your account with rotating 6-digit codes.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 justify-between md:justify-start">
                        <span className={cn(
                          "text-xs font-medium",
                          profile?.security?.twoFactorEnabled ? "text-emerald-400" : "text-white/30"
                        )}>
                          {profile?.security?.twoFactorEnabled ? 'Active' : 'Not Configured'}
                        </span>
                        {profile?.security?.twoFactorEnabled ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDisable2FA}
                            disabled={loading}
                            className="h-9 px-4 rounded-lg text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
                          >
                            Disable
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => setShow2FASetup(true)}
                            className="h-9 px-4 rounded-lg text-xs bg-white text-black hover:bg-white/90 font-medium"
                          >
                            Set up
                          </Button>
                        )}
                      </div>
                    </div>
 
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors gap-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                          <Fingerprint className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-white">Passkeys</h3>
                          <p className="text-xs text-white/50 max-w-[300px]">Sign in with Face ID, Touch ID, or device PIN.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 justify-between md:justify-start">
                        <span className={cn(
                          "text-xs font-medium",
                          profile?.passkeys?.length ? "text-emerald-400" : "text-white/30"
                        )}>
                          {profile?.passkeys?.length ? `${profile.passkeys.length} Registered` : 'Not Configured'}
                        </span>
                        <Button 
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
                          className="h-9 px-4 rounded-lg text-xs bg-white text-black hover:bg-white/90 font-medium"
                        >
                          Register
                        </Button>
                      </div>
                    </div>

                    {profile?.passkeys && profile.passkeys.length > 0 && (
                      <div className="pt-4 space-y-3">
                        <h4 className="text-xs font-medium text-white/40 px-2">Authorized Devices</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {profile.passkeys.map((pk, i) => (
                             <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                   <span className="text-xs text-white/80">{pk.name}</span>
                                </div>
                                <span className="text-[10px] text-white/30">
                                   {new Date(pk.createdAt).toLocaleDateString()}
                                </span>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
 
              <AnimatePresence>
                {show2FASetup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 border border-indigo-500/20 bg-indigo-500/[0.02] rounded-3xl">
                      <TwoFactorSetup 
                        onComplete={() => setShow2FASetup(false)} 
                        onCancel={() => setShow2FASetup(false)} 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <section className="space-y-3 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-sm font-medium text-white">Enterprise Infrastructure</h2>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">
                      Your data is secured by TLS 1.3 encryption and AES-256 protection. We use industry standard security protocols to ensure your data is safe.
                    </p>
                 </section>
                 <section className="space-y-3 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-sm font-medium text-white">Privacy First</h2>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">
                      We never sell your information. VUX Events leverages OAuth for secure zero-credential storage and strict privacy controls.
                    </p>
                 </section>
              </div>
            </motion.div>
          )}
 
          {activeTab === 'integrations' && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-6"
            >
              <div className="p-8 border border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-3xl space-y-8">
                <div className="space-y-1 border-b border-white/5 pb-6">
                  <h2 className="text-lg font-medium text-white">Connected Applications</h2>
                  <p className="text-sm text-white/50">Extend functionality by linking external services to your workspace.</p>
                </div>
 
                <div className="grid grid-cols-1 gap-4">
                   {/* Google Calendar Sync */}
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                              <Calendar className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                              <h4 className="text-sm font-medium text-white">Google Calendar</h4>
                              <p className="text-xs text-white/50 mt-0.5">Automatically sync events to your calendar.</p>
                          </div>
                      </div>
                      
                      {GoogleCalendarService.isConfigured() ? (
                        <div className="flex items-center gap-4 justify-between sm:justify-start">
                           <span className={cn(
                               "text-xs font-medium",
                               profile?.integrations?.googleCalendar ? "text-emerald-400" : "text-white/30"
                           )}>
                               {profile?.integrations?.googleCalendar ? "Active Sync" : "Disconnected"}
                           </span>
                           <button 
                               onClick={async () => {
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
                               className={cn(
                                   "w-11 h-6 rounded-full transition-all relative p-1 shrink-0 cursor-pointer",
                                   profile?.integrations?.googleCalendar ? "bg-emerald-500" : "bg-white/10"
                               )}
                           >
                              <div className={cn(
                                  "w-4 h-4 bg-white rounded-full transition-transform",
                                  profile?.integrations?.googleCalendar ? "translate-x-5" : "translate-x-0"
                              )} />
                           </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-[10px] text-amber-500 font-medium">API Key Missing</span>
                        </div>
                      )}
                   </div>
 
                   {/* Discord Connection */}
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#5865F2]/10 flex items-center justify-center border border-[#5865F2]/20 shrink-0">
                              <Monitor className="w-5 h-5 text-[#5865F2]" />
                          </div>
                          <div>
                              <h4 className="text-sm font-medium text-white">Discord</h4>
                              <p className="text-xs text-white/50 mt-0.5">Broadcast event presence to your server.</p>
                          </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg text-xs bg-white/5 border-white/10 hover:bg-[#5865F2] hover:text-white hover:border-[#5865F2]">
                         Connect
                      </Button>
                   </div>
 
                   {/* Spotify Connection */}
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                              <Music className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                              <h4 className="text-sm font-medium text-white">Spotify</h4>
                              <p className="text-xs text-white/50 mt-0.5">Sync event soundtracks and playlists.</p>
                          </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg text-xs bg-white/5 border-white/10 hover:bg-emerald-500 hover:text-white hover:border-emerald-500">
                         Connect
                      </Button>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
 
          {activeTab === 'account' && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-6"
            >
              <div className="p-8 border border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-3xl space-y-8">
                <div className="space-y-1 border-b border-white/5 pb-6">
                  <h2 className="text-lg font-medium text-white">Account Details</h2>
                  <p className="text-sm text-white/50">Manage your core identity and data storage preferences.</p>
                </div>
 
                <div className="space-y-4">
                  {/* Google Core Account */}
                  <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" className="w-6 h-6">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.68-2.31 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.13c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.13H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.87l3.66-2.74z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{user?.email}</p>
                            <p className="text-xs text-white/50 mt-0.5">Primary Authentication Method</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-xs text-emerald-400 font-medium">Verified</span>
                      </div>
                    </div>
                  </div>
 
                  {/* Account Sync Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 flex items-center justify-between">
                       <div className="flex gap-3 items-center">
                          <LinkIcon className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/80">Cloud Sync Active</span>
                       </div>
                       <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 flex items-center justify-between">
                       <div className="flex gap-3 items-center">
                          <Shield className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/80">Data Encrypted</span>
                       </div>
                       <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
 
              <div className="flex justify-center pt-4">
                 <button className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium hover:underline px-4 py-2">
                    Delete Account & Data
                 </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
