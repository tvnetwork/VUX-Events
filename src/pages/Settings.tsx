/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings as SettingsIcon, CreditCard, ChevronRight, Globe, Twitter, Instagram, Link as LinkIcon, Camera } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Settings() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'payment'>('profile');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    photoURL: profile?.photoURL || '',
  });

  const tabs = [
    { id: 'profile', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const handleUpdate = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      alert('Profile updated successfully!');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-end justify-between border-b border-white/5 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-white/40">Manage your account and preferences.</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-48 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-xl transition-all',
                  activeTab === tab.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-indicator" className="ml-auto hidden md:block">
                     <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <Card className="p-8 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full glass border border-white/10 overflow-hidden ring-4 ring-white/5 group-hover:ring-white/10 transition-all">
                        <img 
                          src={formData.photoURL || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${profile?.uid}&backgroundColor=c084fc`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full shadow-xl hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Profile Photo</h3>
                      <p className="text-sm text-white/40">Update your avatar displayed on your profile.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">Display Name</label>
                       <Input 
                        value={formData.displayName} 
                        onChange={e => setFormData({...formData, displayName: e.target.value})}
                        placeholder="Your name" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">Username</label>
                       <Input 
                        placeholder="@username" 
                        defaultValue={profile?.uid.slice(0, 8)}
                        className="bg-white/2"
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">Biography</label>
                    <textarea 
                      className="flex min-h-[120px] w-full rounded-xl glass border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 transition-all"
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us a little about yourself..."
                    />
                  </div>
                </Card>

                <Card className="p-8 space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" /> Online Presence
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center border border-white/5 shrink-0">
                        <Twitter className="w-4 h-4 text-white/70" />
                      </div>
                      <Input placeholder="Twitter profile URL" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center border border-white/5 shrink-0">
                        <Instagram className="w-4 h-4 text-white/70" />
                      </div>
                      <Input placeholder="Instagram profile URL" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center border border-white/5 shrink-0">
                        <LinkIcon className="w-4 h-4 text-white/70" />
                      </div>
                      <Input placeholder="Personal website URL" />
                    </div>
                  </div>
                </Card>

                <div className="flex justify-end gap-3 pt-4">
                   <Button variant="ghost">Cancel</Button>
                   <Button onClick={handleUpdate} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                   </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="py-12 text-center"
              >
                <SettingsIcon className="w-12 h-12 text-white/5 mx-auto mb-4" />
                <p className="text-white/40">Preference settings coming soon.</p>
              </motion.div>
            )}

            {activeTab === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="py-12 text-center"
              >
                <CreditCard className="w-12 h-12 text-white/5 mx-auto mb-4" />
                <p className="text-white/40">Payment management coming soon.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
