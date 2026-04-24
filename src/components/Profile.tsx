/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { X, User as UserIcon, Mail, Info, Loader2, Save, Camera } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function Profile({ onClose }: { onClose: () => void }) {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    photoURL: profile?.photoURL || '',
  });

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="glass w-full max-w-lg rounded-[3rem] overflow-hidden relative border-white/20"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="p-12 space-y-8">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <img 
                src={formData.photoURL || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${profile?.uid}&backgroundColor=c084fc`} 
                className="w-24 h-24 rounded-full border-4 border-white/10 mx-auto" 
              />
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-slate-900 border-4 border-slate-950">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-2xl font-bold">Edit Profile</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Display Name
              </label>
              <input
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-1 focus:ring-white/20 outline-none transition-all text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                disabled
                value={profile?.email}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Info className="w-4 h-4" /> Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell the community about yourself..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 resize-none transition-all focus:ring-1 focus:ring-white/20 outline-none text-white"
              />
            </div>
          </div>

          <button
            disabled={loading}
            onClick={handleSave}
            className="w-full bg-white text-slate-950 py-4 rounded-xl flex items-center justify-center gap-3 font-bold hover:bg-slate-200 transition-all disabled:opacity-50 shadow-xl shadow-white/10"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
