/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Camera, 
  Mail, 
  Music, 
  Globe, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  MessageSquare, 
  Monitor, 
  Share2,
  Phone,
  Link as LinkIcon
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../AuthContext';
import { cn, getAvatarUrl } from '../lib/utils';
import { VUXQRCode } from '../components/VUXQRCode';
import { StorageService } from '../services/StorageService';

export function Profile() {
  const { user, profile, updateProfileData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    photoURL: profile?.photoURL || '',
    phoneNumber: profile?.phoneNumber || '',
    dob: profile?.dob || '',
    socialLinks: {
      twitter: profile?.socialLinks?.twitter || '',
      instagram: profile?.socialLinks?.instagram || '',
      linkedin: profile?.socialLinks?.linkedin || '',
      facebook: profile?.socialLinks?.facebook || '',
      youtube: profile?.socialLinks?.youtube || '',
      tiktok: profile?.socialLinks?.tiktok || '',
      discord: profile?.socialLinks?.discord || '',
      website: profile?.socialLinks?.website || '',
      email: profile?.socialLinks?.email || '',
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        photoURL: profile.photoURL || '',
        phoneNumber: profile.phoneNumber || '',
        dob: profile.dob || '',
        socialLinks: {
          twitter: profile.socialLinks?.twitter || '',
          instagram: profile.socialLinks?.instagram || '',
          linkedin: profile.socialLinks?.linkedin || '',
          facebook: profile.socialLinks?.facebook || '',
          youtube: profile.socialLinks?.youtube || '',
          tiktok: profile.socialLinks?.tiktok || '',
          discord: profile.socialLinks?.discord || '',
          website: profile.socialLinks?.website || '',
          email: profile.socialLinks?.email || '',
        }
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
      const hasSocialChanged = JSON.stringify(formData.socialLinks) !== JSON.stringify(profile.socialLinks || {});

      if (!hasAvatarChanged && !hasDisplayNameChanged && !hasBioChanged && !hasPhoneChanged && !hasDobChanged && !hasSocialChanged) {
        return;
      }

      setSaveStatus('saving');
      try {
        await updateProfileData(formData);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        console.error(e);
        setSaveStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, profile, user, updateProfileData]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-500">
             <div className="w-10 h-px bg-indigo-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol Identity</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">PROFILE<br/>STATION</h1>
          <div className="flex items-center gap-4 h-6 uppercase font-black italic">
            <span className="text-white/20 text-[10px] tracking-widest">Digital Avatar Management</span>
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                  className="flex items-center gap-1.5 text-[8px] tracking-[0.2em] text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full"
                >
                  <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                  UPLOADING BIOMETRICS
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                  className="flex items-center gap-1.5 text-[8px] tracking-[0.2em] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full"
                >
                  <Check className="w-2.5 h-2.5" />
                  IDENTITY SYNCED
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* Main Identity Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-white/40" />
              </div>
              <h2 className="text-xl font-black italic tracking-tighter uppercase">Identity Core</h2>
            </div>
            
            <Card className="p-10 space-y-10 border-white/5 bg-white/[0.01] rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10 rounded-full" />
              
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                   <div className="w-40 h-40 rounded-[3.5rem] overflow-hidden border-2 border-white/5 group-hover:border-indigo-500/50 transition-all duration-700">
                       <img 
                          src={formData.photoURL || getAvatarUrl(profile?.uid)} 
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                       />
                   </div>
                   <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl text-black hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                       <Camera className="w-6 h-6" />
                       <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file && user) {
                              try {
                                setSaveStatus('saving');
                                const url = await StorageService.uploadProfileImage(file, user.uid);
                                setFormData(prev => ({ ...prev, photoURL: url }));
                              } catch (err) {
                                console.error('Upload failed:', err);
                                setSaveStatus('error');
                              }
                            }
                          }}
                       />
                   </label>
                </div>
                <div className="space-y-3 text-center md:text-left">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">Avatar Node</h3>
                  <p className="text-white/20 text-xs font-medium italic max-w-xs uppercase tracking-[0.2em] leading-relaxed">
                    This cryptographic representation is broadcasted across the network during event interactions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    Display Name
                  </label>
                  <Input 
                      value={formData.displayName} 
                      onChange={e => setFormData({...formData, displayName: e.target.value})}
                      className="bg-white/5 border-white/5 h-16 rounded-2xl font-black italic text-xl px-6 focus:border-indigo-500/40"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-2">Network ID</label>
                  <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 italic text-xl font-black">#</span>
                      <Input 
                          disabled
                          defaultValue={(profile?.uid || '').slice(0, 12).toUpperCase()}
                          className="pl-12 bg-white/[0.02] border-white/5 h-16 rounded-2xl font-mono text-xs opacity-50 cursor-not-allowed"
                      />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-2">Secure Line</label>
                  <Input 
                      value={formData.phoneNumber} 
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                      placeholder="+1 (555) VUX-ZONE"
                      className="bg-white/5 border-white/5 h-16 rounded-2xl font-bold italic text-lg px-6 focus:border-indigo-500/40"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-2">Origin Date</label>
                  <Input 
                      type="date"
                      value={formData.dob} 
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                      className="bg-white/5 border-white/5 h-16 rounded-2xl font-bold italic text-lg px-6 focus:border-indigo-500/40"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-2">System Manifest (Bio)</label>
                <textarea 
                  className="w-full min-h-[200px] rounded-[32px] bg-white/5 border border-white/5 p-8 text-sm focus:outline-none focus:border-indigo-500/40 transition-all resize-none font-medium italic placeholder:text-white/10"
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  placeholder="Define your existence in the VUX ecosystem..."
                />
              </div>
            </Card>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-12">
           {/* QR Identification */}
           <section className="space-y-8">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-white/40" />
                  </div>
                  <h2 className="text-xl font-black italic tracking-tighter uppercase">Access Node</h2>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <VUXQRCode 
                    value={`${window.location.origin}/discover?user=${profile?.uid}`}
                    className="w-full relative bg-[#0b0b0f] border border-white/10 rounded-[3rem] p-4"
                />
              </div>
           </section>

            {/* Verification Status */}
            <Card className="p-8 border-white/5 bg-indigo-500/5 rounded-[40px] space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-3xl rounded-full" />
              <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl",
                  profile?.isVerified ? "bg-emerald-500 text-white" : "bg-white text-black"
              )}>
                  <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">
                      {profile?.isVerified ? "VERIFIED NODE" : "AUTHENTICATE"}
                  </h4>
                  <p className="text-[10px] text-white/40 font-bold italic leading-relaxed uppercase tracking-widest">
                      {profile?.isVerified 
                          ? "Protocol clearance confirmed. You are a trusted entity on the global VUX substrate." 
                          : "Level 1 Access. Complete identity verification to unlock premium administrative permissions."}
                  </p>
              </div>
              {!profile?.isVerified && (
                  <Button variant="vux" className="w-full rounded-2xl h-14 text-[10px] font-black uppercase tracking-[0.3em] group">
                      GO VERIFIED
                      <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                  </Button>
              )}
           </Card>

            {/* Social Signal Matrix */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-white/40" />
                  </div>
                  <h2 className="text-xl font-black italic tracking-tighter uppercase">Social Signals</h2>
              </div>
              <Card className="p-8 space-y-6 border-white/5 bg-white/[0.01] rounded-[40px]">
                  {[
                      { key: 'twitter', icon: <MessageSquare className="w-4 h-4" />, label: 'X (Twitter)' },
                      { key: 'instagram', icon: <Camera className="w-4 h-4" />, label: 'Instagram' },
                      { key: 'linkedin', icon: <Share2 className="w-4 h-4" />, label: 'LinkedIn' },
                      { key: 'discord', icon: <Monitor className="w-4 h-4" />, label: 'Discord' },
                      { key: 'youtube', icon: <Globe className="w-4 h-4" />, label: 'YouTube' },
                  ].map((soc) => (
                      <div key={soc.key} className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/20 flex items-center gap-2">
                            {soc.icon} {soc.label}
                          </label>
                          <Input 
                            className="bg-white/5 border-white/5 h-12 rounded-xl text-xs px-5 focus:border-indigo-500/40 italic font-bold" 
                            placeholder="@handle"
                            value={(formData.socialLinks as any)[soc.key]}
                            onChange={(e) => setFormData({
                              ...formData,
                              socialLinks: {
                                ...formData.socialLinks,
                                [soc.key]: e.target.value
                              }
                            })}
                          />
                      </div>
                  ))}
              </Card>
           </section>
        </div>
      </div>
    </div>
  );
}
