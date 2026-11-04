/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Bell, Shield, Check, ArrowRight, Camera, Mail, User } from 'lucide-react';
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';
import { useAuth } from '../AuthContext';
import { cn, getAvatarUrl } from '../lib/utils';
import { StorageService } from '../services/StorageService';

export function OnboardingWizard({ onComplete, profile: initialProfile }: { onComplete: () => void; profile?: any }) {
  const { user, profile, updateProfileData } = useAuth();
  const activeProfile = initialProfile || profile;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: activeProfile?.displayName || '',
    bio: '',
    phoneNumber: '',
    dob: '',
    photoURL: activeProfile?.photoURL || '',
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#07080f]/85 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full sm:max-w-xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col bg-[#0c0e17]/95 border-t sm:border border-white/[0.08] rounded-t-[28px] sm:rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden"
      >
        {/* Subtle top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

        {/* Mobile handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 sm:pt-6 pb-3 flex items-center justify-between border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Getting Started</h2>
              <p className="text-xs text-zinc-400">Step {step} of {totalSteps}</p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  s === step ? 'w-6 bg-blue-500' : s < step ? 'w-2 bg-emerald-400' : 'w-2 bg-white/10'
                )}
              />
            ))}
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Set up your profile</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Tell the community who you are</p>
                </div>

                {/* Avatar and name */}
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden">
                      <img
                        src={formData.photoURL || getAvatarUrl(user?.uid)}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all">
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

                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Display Name</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="Your full name or handle"
                      className="w-full h-11 px-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-blue-500/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Phone & Date of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+234 800 000 0000"
                      className="w-full h-11 px-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-blue-500/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-blue-500/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Short Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us what you build, design, or organize..."
                    rows={3}
                    className="w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-blue-500/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Notification Settings</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Stay informed about event passes, reminders, and updates</p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      icon: <Bell className="w-5 h-5 text-blue-400" />,
                      title: 'Push Notifications',
                      desc: 'Real-time alerts for ticket approval & door scan.',
                      key: 'pushNotifications',
                    },
                    {
                      icon: <Mail className="w-5 h-5 text-indigo-400" />,
                      title: 'Email Notifications',
                      desc: 'Receive digital passes and calendar invitations in your inbox.',
                      key: 'emailNotifications',
                    },
                  ].map((pref) => (
                    <div
                      key={pref.key}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3 pr-3">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0">
                          {pref.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{pref.title}</h4>
                          <p className="text-xs text-zinc-400 mt-0.5">{pref.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={(formData.preferences as any)[pref.key]}
                        onCheckedChange={(val) =>
                          setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, [pref.key]: val },
                          })
                        }
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
                className="space-y-5"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Privacy & Visibility</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Control how other attendees discover your profile</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Public Profile Visibility</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
                      When enabled, your profile and verified attendance badges will be visible to fellow event attendees and organizers.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-2">
                    <span className="text-xs font-semibold text-zinc-400">Private</span>
                    <Switch
                      checked={formData.preferences.publicProfile}
                      onCheckedChange={(val) =>
                        setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, publicProfile: val },
                        })
                      }
                    />
                    <span className="text-xs font-semibold text-blue-400">Public</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1 || loading}
            className="text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Back
          </Button>

          <Button
            type="button"
            variant="kontyra"
            onClick={handleNext}
            disabled={loading || (step === 1 && !formData.displayName.trim())}
            className="h-11 px-5 rounded-xl text-xs font-semibold gap-1.5 shadow-lg shadow-blue-900/20"
          >
            <span>{step === totalSteps ? 'Complete Setup' : 'Continue'}</span>
            {step === totalSteps ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
