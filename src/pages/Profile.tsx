import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Camera, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Monitor, 
  Share2,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Music
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
    <div className="max-w-[1000px] mx-auto py-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Profile Settings</h1>
          <p className="text-sm text-white/50">Manage your personal information and social presence.</p>
        </div>
        
        <div className="h-6">
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                  className="flex items-center gap-2 text-xs font-medium text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Saving...
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                  className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  Saved
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Main Identity Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-white/70" />
              </div>
              <h2 className="text-lg font-medium text-white">Personal Details</h2>
            </div>
            
            <Card className="p-8 space-y-8 border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -z-10 rounded-full" />
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                   <div className="w-32 h-32 rounded-full overflow-hidden border border-white/10 group-hover:border-indigo-500/40 transition-all duration-500 shadow-xl">
                       <img 
                          src={formData.photoURL || getAvatarUrl(profile?.uid)} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                       />
                   </div>
                   <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-black hover:scale-105 transition-transform cursor-pointer border-2 border-[#07070a]">
                       <Camera className="w-4 h-4" />
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
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-lg font-medium text-white">Profile Photo</h3>
                  <p className="text-white/50 text-sm max-w-xs leading-relaxed">
                    This photo will be visible to other community members and event organizers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70 px-1">Display Name</label>
                  <Input 
                      value={formData.displayName} 
                      onChange={e => setFormData({...formData, displayName: e.target.value})}
                      className="bg-white/[0.03] border-white/10 h-12 rounded-xl text-sm px-4 focus:border-indigo-500/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70 px-1">Account ID</label>
                  <Input 
                      disabled
                      defaultValue={(profile?.uid || '').slice(0, 12).toUpperCase()}
                      className="bg-white/[0.01] border-white/5 h-12 rounded-xl font-mono text-xs opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70 px-1">Phone Number</label>
                  <Input 
                      value={formData.phoneNumber} 
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="bg-white/[0.03] border-white/10 h-12 rounded-xl text-sm px-4 focus:border-indigo-500/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70 px-1">Date of Birth</label>
                  <Input 
                      type="date"
                      value={formData.dob} 
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                      className="bg-white/[0.03] border-white/10 h-12 rounded-xl text-sm px-4 focus:border-indigo-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70 px-1">Bio</label>
                <textarea 
                  className="w-full min-h-[120px] rounded-xl bg-white/[0.03] border border-white/10 p-4 text-sm focus:outline-none focus:border-indigo-500/40 transition-all resize-none placeholder:text-white/30 text-white"
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </Card>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           {/* QR Identification */}
           <section className="space-y-6">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center">
                      <QrCode className="w-4 h-4 text-white/70" />
                  </div>
                  <h2 className="text-lg font-medium text-white">Profile QR</h2>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <VUXQRCode 
                    value={`${window.location.origin}/discover?user=${profile?.uid}`}
                    className="w-full relative bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl"
                />
              </div>
           </section>

            {/* Verification Status */}
            <Card className="p-6 border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-3xl space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
              <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                  profile?.isVerified ? "bg-emerald-500 text-white" : "bg-white text-black"
              )}>
                  <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                  <h4 className="text-lg font-medium text-white">
                      {profile?.isVerified ? "Verified Account" : "Get Verified"}
                  </h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                      {profile?.isVerified 
                          ? "Account verification confirmed. Your identity is trusted across the platform." 
                          : "Verify your identity to unlock exclusive perks and premium event access."}
                  </p>
              </div>
              {!profile?.isVerified && (
                  <Button className="w-full rounded-xl h-10 text-xs font-medium bg-white text-black hover:bg-white/90">
                      Verify Identity
                  </Button>
              )}
           </Card>

            {/* Social Accounts */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-white/70" />
                  </div>
                  <h2 className="text-lg font-medium text-white">Social Links</h2>
              </div>
              <Card className="p-6 space-y-5 border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-3xl">
                  {[
                      { key: 'twitter', icon: <Twitter className="w-4 h-4" />, label: 'X (Twitter)' },
                      { key: 'instagram', icon: <Instagram className="w-4 h-4" />, label: 'Instagram' },
                      { key: 'linkedin', icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn' },
                      { key: 'discord', icon: <Monitor className="w-4 h-4" />, label: 'Discord' },
                  ].map((soc) => (
                      <div key={soc.key} className="space-y-2">
                           <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                             {soc.icon} {soc.label}
                           </label>
                           <Input 
                             className="bg-white/[0.03] border-white/10 h-10 rounded-lg text-sm px-4 focus:border-indigo-500/40" 
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
