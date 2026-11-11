import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Waitlist, WaitlistType } from '../../types';
import { WaitlistService } from '../../services/WaitlistService';
import { useAuth } from '../../AuthContext';
import { Sparkles, Calendar, Plus, X, Globe, Check, Link2, ArrowRight, ShieldCheck, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CreateWaitlistModalProps {
  onClose: () => void;
  onCreated: (waitlist: Waitlist) => void;
}

export function CreateWaitlistModal({ onClose, onCreated }: CreateWaitlistModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<WaitlistType>('event');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [featureCategory, setFeatureCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<string>('');
  const [newPerk, setNewPerk] = useState('');
  const [perks, setPerks] = useState<string[]>([
    'Priority notification on launch',
    'Exclusive early adopter badge'
  ]);

  const [createdWaitlist, setCreatedWaitlist] = useState<Waitlist | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-slugify as title changes if slug was not manually touched
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === WaitlistService.slugify(title)) {
      setSlug(WaitlistService.slugify(val));
    }
  };

  const handleAddPerk = () => {
    if (!newPerk.trim()) return;
    setPerks([...perks, newPerk.trim()]);
    setNewPerk('');
  };

  const handleRemovePerk = (index: number) => {
    setPerks(perks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for your waitlist.');
      return;
    }
    if (!user) {
      setError('You must be signed in to create a waitlist.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const waitlist = await WaitlistService.createWaitlist({
        slug: slug.trim() || WaitlistService.slugify(title),
        title: title.trim(),
        type,
        description: description.trim(),
        creatorId: user.uid,
        creatorName: profile?.displayName || user.displayName || 'Organizer',
        creatorEmail: user.email || profile?.email || '',
        targetDate: targetDate || undefined,
        featureCategory: type === 'feature' ? (featureCategory.trim() || 'General Feature') : undefined,
        maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : undefined,
        status: 'active',
        perks: perks.length > 0 ? perks : undefined
      });

      setCreatedWaitlist(waitlist);
      onCreated(waitlist);
    } catch (err: any) {
      console.error('Failed to create waitlist:', err);
      setError(err.message || 'Failed to create waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPublicUrl = (waitlistSlug: string) => {
    return `${window.location.origin}/w/${waitlistSlug}`;
  };

  const handleCopyLink = () => {
    if (!createdWaitlist) return;
    navigator.clipboard.writeText(getPublicUrl(createdWaitlist.slug));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalShell
      isOpen={true}
      onClose={onClose}
      title={createdWaitlist ? "Waitlist Created!" : "Create Waitlist"}
      subtitle={
        createdWaitlist 
          ? "Your waitlist is live and ready to collect signups." 
          : "Gather early interest for an upcoming event or app feature."
      }
      maxWidth="lg"
    >
      {createdWaitlist ? (
        <div className="space-y-6 py-2 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-xl shadow-purple-500/20">
            <Check className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">{createdWaitlist.title}</h3>
            <p className="text-sm text-white/60 max-w-md mx-auto">
              Share your waitlist link across social media, Discord, or your community to start collecting signups.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Link2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-xs text-white/80 font-mono truncate">{getPublicUrl(createdWaitlist.slug)}</span>
            </div>
            <Button
              size="sm"
              variant={copied ? "purple" : "secondary"}
              onClick={handleCopyLink}
              className="shrink-0 text-xs h-8 px-4"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Copied
                </>
              ) : (
                "Copy Link"
              )}
            </Button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 border-white/10 text-white/70 hover:text-white"
            >
              Close
            </Button>
            <a
              href={getPublicUrl(createdWaitlist.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="vux"
                className="w-full h-11 shadow-lg shadow-purple-600/30"
              >
                <span>View Public Page</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Type Selector: Event vs Feature */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Waitlist Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('event')}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden",
                  type === 'event'
                    ? "bg-purple-500/15 border-purple-500/40 text-white shadow-lg shadow-purple-500/15"
                    : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", type === 'event' ? "bg-purple-500 text-white" : "bg-white/5 text-white/60")}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  {type === 'event' && <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Event Waitlist</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">Early tickets, sold-out drops, or invite-only gatherings.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('feature')}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden",
                  type === 'feature'
                    ? "bg-purple-500/15 border-purple-500/40 text-white shadow-lg shadow-purple-500/15"
                    : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", type === 'feature' ? "bg-purple-500 text-white" : "bg-white/5 text-white/60")}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  {type === 'feature' && <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">App / Feature Waitlist</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">Beta releases, new tools, or upcoming platform features.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70">
                {type === 'event' ? 'Event Name / Subject' : 'Feature / Product Name'} <span className="text-purple-400">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={type === 'event' ? "e.g. VUX Design Summit 2026" : "e.g. AI Co-Host & Live Audio Rooms"}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70">Custom URL Slug</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-white/30 font-mono">/w/</span>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(WaitlistService.slugify(e.target.value))}
                  placeholder="custom-slug"
                  className="pl-9 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/70">Pitch / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell visitors what they're signing up for, why they should get on the list early, and what to expect."
              rows={3}
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
            />
          </div>

          {/* Type-Specific Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {type === 'feature' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">Feature Category</label>
                <Input
                  value={featureCategory}
                  onChange={(e) => setFeatureCategory(e.target.value)}
                  placeholder="e.g. Mobile App, AI Tools, Developer API"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">Target Event Date (Optional)</label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70">Target Capacity / Limit (Optional)</label>
              <Input
                type="number"
                min="1"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="e.g. 500 spots"
              />
            </div>
          </div>

          {/* Early Access Perks */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70">Subscriber Perks & Highlights</label>
            <div className="flex gap-2">
              <Input
                value={newPerk}
                onChange={(e) => setNewPerk(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPerk(); }}}
                placeholder="e.g. 50% discount on first ticket, Discord VIP badge..."
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddPerk}
                className="shrink-0 px-4 text-xs font-semibold"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {perks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {perks.map((perk, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs"
                  >
                    <Check className="w-3 h-3 text-purple-400" />
                    <span>{perk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePerk(idx)}
                      className="ml-1 text-white/40 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="text-white/60 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="vux"
              disabled={loading || !title.trim()}
              className="px-6 shadow-lg shadow-purple-600/30 font-semibold"
            >
              {loading ? "Publishing..." : "Publish Waitlist"}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
