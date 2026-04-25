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
import { cn } from '../lib/utils';

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: '',
    phoneNumber: '',
    dob: '',
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      publicProfile: true,
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
      const docId = user.email || user.uid;
      await updateDoc(doc(db, 'users', docId), {
        displayName: formData.displayName,
        bio: formData.bio,
        phoneNumber: formData.phoneNumber,
        dob: formData.dob,
        preferences: formData.preferences,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      });
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl overflow-hidden"
      >
        <Card className="p-0 border-white/10 bg-[#0b0b0f] shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[100px] rounded-full" />
          
          <div className="p-8 md:p-12 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                   <h2 className="text-xl font-bold tracking-tight">Welcome to VUX</h2>
                   <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Protocol Initiation</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={cn(
                      "w-8 h-1 rounded-full transition-all duration-500",
                      s === step ? "bg-purple-500 w-12" : (s < step ? "bg-emerald-500" : "bg-white/5")
                    )}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                     <h3 className="text-3xl font-bold tracking-tighter">IDENTIFY YOURSELF</h3>
                     <p className="text-white/40 text-sm">How should the community address you in the roadmap?</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full glass border border-white/10 overflow-hidden ring-4 ring-white/5">
                                <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user?.uid}&backgroundColor=c084fc`} className="w-full h-full object-cover" />
                            </div>
                            <button className="absolute -bottom-1 -right-1 p-2 bg-white text-black rounded-full shadow-lg">
                                <Camera className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="flex-1 space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Display Name</label>
                             <Input 
                                value={formData.displayName}
                                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                placeholder="Ghost in the Shell"
                                className="bg-white/[0.02] border-white/10 focus:border-purple-500/50 h-12"
                             />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Phone Protocol</label>
                            <Input 
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                placeholder="+1 (555) 000-0000"
                                className="bg-white/[0.02] border-white/10 h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Birth Cycle (DOB)</label>
                            <Input 
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                className="bg-white/[0.02] border-white/10 h-12"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Data Log (Bio)</label>
                        <textarea 
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="A brief history of your presence..."
                            className="w-full h-24 rounded-2xl glass border border-white/10 bg-white/[0.02] p-4 text-sm resize-none focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                     <h3 className="text-3xl font-bold tracking-tighter">SYNC PREFERENCES</h3>
                     <p className="text-white/40 text-sm">Control how you receive pulse signals from the grid.</p>
                  </div>

                  <div className="space-y-4">
                     {[
                       { icon: <Bell className="w-4 h-4 text-purple-400" />, title: 'Signal Alerts', desc: 'Real-time updates for invitations.', key: 'pushNotifications' },
                       { icon: <Mail className="w-4 h-4 text-blue-400" />, title: 'Dispatch Log', desc: 'Detailed event summaries via email.', key: 'emailNotifications' },
                     ].map((pref) => (
                        <div key={pref.key} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center shrink-0">
                                    {pref.icon}
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-bold">{pref.title}</h4>
                                    <p className="text-xs text-white/40">{pref.desc}</p>
                                </div>
                            </div>
                            <Switch 
                                checked={(formData.preferences as any)[pref.key]}
                                onCheckedChange={(val) => setFormData({
                                    ...formData, 
                                    preferences: { ...formData.preferences, [pref.key]: val }
                                })}
                            />
                        </div>
                     ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                     <h3 className="text-3xl font-bold tracking-tighter">DATA PRIVACY</h3>
                     <p className="text-white/40 text-sm">Define your visibility within the VUX network.</p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6 text-center">
                    <Shield className="w-16 h-16 text-emerald-500/20 mx-auto mb-2" />
                    <div className="space-y-2">
                        <h4 className="font-bold">Public Explorer Access</h4>
                        <p className="text-xs text-white/40 leading-relaxed px-4">
                            By enabling this, your profile and verified events will be searchable by other travelers on the grid.
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-4 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Private Mode</span>
                        <Switch 
                            checked={formData.preferences.publicProfile}
                            onCheckedChange={(val) => setFormData({
                                ...formData, 
                                preferences: { ...formData.preferences, publicProfile: val }
                            })}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Public Protocol</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-4">
                <Button 
                    variant="ghost" 
                    onClick={() => step > 1 && setStep(step - 1)}
                    disabled={step === 1 || loading}
                    className="text-[10px] uppercase tracking-[0.2em] font-bold"
                >
                    Back
                </Button>
                <Button 
                    onClick={handleNext}
                    disabled={loading || (step === 1 && !formData.displayName)}
                    className="h-12 px-8 rounded-xl shadow-xl shadow-purple-500/20 gap-3"
                >
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">
                        {step === totalSteps ? 'Initiate Account' : 'Next Protocol'}
                    </span>
                    {step === totalSteps ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
