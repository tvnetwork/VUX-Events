/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Send, Loader2, CheckCircle2, MessageSquareHeart } from 'lucide-react';
import { Event } from '../types';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { ModalShell } from './ui/ModalShell';

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
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      badge={
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-medium text-blue-400">
          <MessageSquareHeart className="w-3.5 h-3.5" />
          <span>Event Review</span>
        </div>
      }
      title={submitted ? 'Thank you!' : `How was ${event.title}?`}
      subtitle={
        submitted
          ? 'Your response was successfully recorded.'
          : 'Your feedback helps organizers build better experiences.'
      }
      maxWidth="md"
    >
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="feedback-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Rating Stars Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Rating
              </label>
              <div className="flex items-center justify-around py-3 px-4 rounded-xl bg-white/[0.03] border border-white/10">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoveredRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      className="p-2 transition-transform duration-150 active:scale-125 hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={cn(
                          'w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-150',
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                            : 'text-zinc-600 hover:text-zinc-400'
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Area */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Feedback & Notes <span className="text-zinc-500 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you enjoy most? What could be improved?"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* Submit CTA */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
              variant="kontyra"
              className="w-full h-12 rounded-xl text-sm font-semibold shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="feedback-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 text-center space-y-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-bold text-white">Feedback received</h4>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Thank you for contributing to the community!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalShell>
  );
}
