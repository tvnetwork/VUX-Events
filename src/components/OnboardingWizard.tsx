/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Sparkles, Bell, Shield, Check, ArrowRight, Camera, Mail } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Switch } from './ui/Switch';
import { useAuth } from '../AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { cn, getAvatarUrl } from '../lib/utils';
import { StorageService } from '../services/StorageService';

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const { user, profile, updateProfileData } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: '',
    phoneNumber: '',
    dob: '',
    photoURL: profile?.photoURL || '',
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      publicProfile: true,
      calendarSync: false,
      theme: 'dark' as const,
    }
  });

  const totalSteps = 3;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfileData({
        displayName: formData.displayName,
        bio: formData.bio,
        phoneNumber: formData.phoneNumber,
        dob: formData.dob,
        photoURL: formData.photoURL,
        preferences: formData.preferences,
        onboardingCompleted: true,
      });
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto custom-scrollbar">
      {/* Immersive Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[50rem] h-[50rem] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-purple-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl overflow-hidden my-auto relative z-10"
      >
        <Card className="p-0 border-white/[0.03] bg-black/40 backdrop-blur-3xl shadow-2xl relative overflow-y-auto max-h-[92vh] rounded-[3rem] custom-scrollbar">
          {/* Top Decorative bar */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          
          <div className="p-10 md:p-16 space-y-12">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                  <Sparkles className="w-7 h-7 text-indigo-400" />
                </div>
                 <div>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">GETTING STARTED</h2>
                   <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">Step {step} of {totalSteps}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={cn(
                      "w-12 h-1 rounded-full transition-all duration-700",
                      s === step ? "bg-indigo-500 w-20 shadow-lg shadow-indigo-500/40" : (s < step ? "bg-emerald-500/40" : "bg-white/[0.05]")
                    )}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="space-y-10"
                >
                  <div className="space-y-4">
                     <h3 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.8]">PROFILE<br/><span className="text-indigo-400">SETUP</span></h3>
                     <p className="text-white/30 text-sm font-bold uppercase tracking-widest italic">Set up your public identity on VUX.</p>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 overflow-hidden ring-4 ring-indigo-500/5 shadow-2xl shadow-indigo-500/10 transition-transform duration-700 group-hover:scale-105">
                                <img src={formData.photoURL || getAvatarUrl(user?.uid)} className="w-full h-full object-cover" />
                            </div>
                            <label className="absolute -bottom-3 -right-3 w-10 min-w-[40px] h-10 p-0 bg-white text-black rounded-xl shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-black">
                                <Camera className="w-4 h-4" />
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file && user) {
                                      try {
                                        setLoading(true);
                                        const url = await StorageService.uploadProfileImage(file, user.uid);
                                        setFormData(prev => ({ ...prev, photoURL: url }));
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
                        <div className="flex-1 w-full space-y-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60 px-1">Display Name</label>
                                <Input 
                                   value={formData.displayName}
                                   onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                   placeholder="Your Name"
                                   className="bg-white/[0.02] border-white/5 focus:border-indigo-500/40 h-16 rounded-2xl italic font-bold text-lg px-6"
                                />
                             </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60 px-1">Phone Number</label>
                            <Input 
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                placeholder="+1 (000) 000-0000"
                                className="bg-white/[0.02] border-white/5 h-16 rounded-2xl px-6 italic font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60 px-1">Date of Birth</label>
                            <Input 
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                className="bg-white/[0.02] border-white/5 h-16 rounded-2xl px-6 italic font-bold appearance-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60 px-1">Bio</label>
                        <textarea 
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="Tell us about yourself..."
                            className="w-full h-32 rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 text-lg font-bold italic resize-none focus:outline-none focus:border-indigo-500/40 transition-all"
                        />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="space-y-10"
                >
                  <div className="space-y-4">
                     <h3 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.8]">NOTIFY<br/><span className="text-indigo-400">SETTINGS</span></h3>
                     <p className="text-white/30 text-sm font-bold uppercase tracking-widest italic">Choose how you want to stay updated.</p>
                  </div>

                  <div className="space-y-6">
                     {[
                       { icon: <Bell className="w-6 h-6 text-indigo-400" />, title: 'Push Alerts', desc: 'Real-time phone notifications.', key: 'pushNotifications' },
                       { icon: <Mail className="w-6 h-6 text-indigo-400" />, title: 'Email Sync', desc: 'Updates directly to your inbox.', key: 'emailNotifications' },
                     ].map((pref) => (
                        <div key={pref.key} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 group hover:bg-white/[0.03] transition-all">
                            <div className="flex gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-indigo-500/40 transition-all duration-500">
                                    {pref.icon}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black italic uppercase tracking-tighter">{pref.title}</h4>
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">{pref.desc}</p>
                                </div>
                            </div>
                            <Switch 
                                checked={(formData.preferences as any)[pref.key]}
                                onCheckedChange={(val) => setFormData({
                                    ...formData, 
                                    preferences: { ...formData.preferences, [pref.key]: val }
                                })}
                                className="data-[state=checked]:bg-indigo-600 scale-125"
                            />
                        </div>
                     ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="space-y-10"
                >
                  <div className="space-y-4">
                     <h3 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.8]">PRIVACY<br/><span className="text-indigo-400">CONTROL</span></h3>
                     <p className="text-white/30 text-sm font-bold uppercase tracking-widest italic">Choose who can see your profile.</p>
                  </div>

                  <div className="p-12 md:p-16 rounded-[4rem] bg-white/[0.01] border border-white/5 space-y-10 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Shield className="w-24 h-24 text-indigo-500/20 mx-auto mb-4 animate-pulse relative z-10" />
                    <div className="space-y-4 relative z-10">
                        <h4 className="text-3xl font-black italic uppercase tracking-tighter">Public Profile</h4>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] leading-relaxed max-w-sm mx-auto">
                            When enabled, other members can see your profile and events you are attending.
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-8 pt-4 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10">PRIVATE</span>
                        <Switch 
                            checked={formData.preferences.publicProfile}
                            onCheckedChange={(val) => setFormData({
                                ...formData, 
                                preferences: { ...formData.preferences, publicProfile: val }
                            })}
                            className="data-[state=checked]:bg-indigo-600 scale-150 shadow-2xl shadow-indigo-500/20"
                        />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">PUBLIC</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-8 border-t border-white/[0.03]">
                <Button 
                    variant="ghost" 
                    onClick={() => step > 1 && setStep(step - 1)}
                    disabled={step === 1 || loading}
                    className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 hover:text-white"
                >
                    BACK
                </Button>
                <Button 
                    variant="vux"
                    onClick={handleNext}
                    disabled={loading || (step === 1 && !formData.displayName)}
                    className="h-20 px-14 rounded-3xl gap-4 shadow-2xl shadow-indigo-500/30 text-lg"
                >
                    <span className="font-black uppercase tracking-widest">
                        {step === totalSteps ? 'COMPLETE SETUP' : 'CONTINUE'}
                    </span>
                    {step === totalSteps ? <Check className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
                </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
