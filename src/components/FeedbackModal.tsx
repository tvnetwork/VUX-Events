/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Event } from '../types';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

interface FeedbackModalProps {
  event: Event;
  onClose: () => void;
}

export function FeedbackModal({ event, onClose }: FeedbackModalProps) {
  const { profile } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!profile || rating === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/events/${event.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profile.uid,
          userName: profile.displayName || profile.email,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#050508]/90 backdrop-blur-3xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-[500px] bg-[#0d0d12] border border-white/5 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5 text-white/50" />
        </button>

        <div className="p-10 md:p-14 space-y-10">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Guest Experience</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-tight">
                    How was <span className="text-indigo-400">{event.title}</span>?
                  </h2>
                  <p className="text-sm text-white/40 leading-relaxed font-medium">Your feedback helps organizers build better event infrastructure.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Select Rating</label>
                    <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setRating(star)}
                          className="relative p-2 group transition-all duration-300 transform hover:scale-125"
                        >
                          <Star 
                            className={cn(
                              "w-8 h-8 transition-all duration-300",
                              (hoveredRating >= star || rating >= star) 
                                ? "text-indigo-400 fill-indigo-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
                                : "text-white/10"
                            )} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Tell us more (Optional)</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts on the venue, speakers, or organization..."
                      className="w-full h-32 bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-indigo-500/50 transition-all resize-none font-medium"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center">{error}</p>
                )}

                <Button 
                  onClick={handleSubmit}
                  disabled={rating === 0 || loading}
                  variant="vux"
                  className="w-full h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading Protocol
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-8"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                  <div className="relative w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black italic uppercase tracking-tight text-white leading-tight">Feedback Logged</h3>
                  <p className="text-sm text-white/40 leading-relaxed font-medium">Thank you for helping us improve the platform.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
