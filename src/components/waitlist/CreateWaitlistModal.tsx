import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Waitlist } from '../../types';
import { WaitlistService } from '../../services/WaitlistService';
import { useAuth } from '../../AuthContext';
import { Sparkles, Plus, X, Check, Link2, ArrowRight, Layers, Monitor, Smartphone, Terminal, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CreateWaitlistModalProps {
  onClose: () => void;
  onCreated: (waitlist: Waitlist) => void;
}

export function CreateWaitlistModal({ onClose, onCreated }: CreateWaitlistModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  
  // Feature-specific fields
  const [platformTarget, setPlatformTarget] = useState('Web & Mobile');
  const [featureCategory, setFeatureCategory] = useState('Developer Tools');
  const [targetRelease, setTargetRelease] = useState('');

  // Capacity & Perks
  const [maxCapacity, setMaxCapacity] = useState<string>('');
  const [newPerk, setNewPerk] = useState('');
  const [perks, setPerks] = useState<string[]>([
    'Private Alpha / Beta testing invite',
    'Lifetime early adopter profile badge',
    'Direct feedback channel with founding engineers'
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
      setError('Please provide a name for your app or feature waitlist.');
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
        type: 'feature',
        description: description.trim(),
        organizationId: profile?.organizationId || user.uid,
        targetDate: targetRelease.trim() || undefined,
        platformTarget: platformTarget.trim() || 'Web & Mobile',
        featureCategory: featureCategory.trim() || 'General Feature',
        maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : undefined,
        status: 'active',
        perks: perks.length > 0 ? perks : undefined
      }, await user.getIdToken());

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
      title={createdWaitlist ? "Waitlist Created!" : "Create Feature Waitlist"}
      subtitle={
        createdWaitlist 
          ? "Your waitlist is live and ready to collect beta testers." 
          : "Gather early beta testers, manage early access queues, and build anticipation for upcoming software features."
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
              Share your waitlist link across social media, GitHub, Discord, or your community to start onboarding beta testers.
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

          {/* Banner Notice explaining dedication to app/feature waitlists */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            <p className="text-xs text-purple-200/90 leading-relaxed">
              <strong>App & Feature Waitlists</strong> empower software developers and creators to collect private beta testers, gate access tiers, and reward early adopters. (To host and publish an event, use the <em>Create Event</em> workflow).
            </p>
          </div>

          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70">
                App or Feature Name <span className="text-purple-400">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Realtime Voice Agents or Mobile SDK"
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
                  placeholder="realtime-voice"
                  className="pl-9 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/70">
              Feature Overview & What You Are Building
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the new feature does, who it is for, and what early beta testers will get access to."
              rows={3}
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
            />
          </div>

          {/* Platform Target & Category */}
          <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Target Platform & Category</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">Platform Target</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Web & Cloud', icon: Monitor },
                    { id: 'iOS & Android', icon: Smartphone },
                    { id: 'Developer API', icon: Terminal },
                    { id: 'Desktop App', icon: Layers }
                  ].map((p) => {
                    const Icon = p.icon;
                    const selected = platformTarget === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlatformTarget(p.id)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer",
                          selected ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{p.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Feature Category</label>
                  <select
                    value={featureCategory}
                    onChange={(e) => setFeatureCategory(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#121217] border border-white/10 px-3 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Developer Tools">Developer Tools & SDKs</option>
                    <option value="AI & Intelligence">AI & Machine Learning</option>
                    <option value="Audio & Video">Realtime Audio & Video</option>
                    <option value="Payments & Monetization">Payments & Monetization</option>
                    <option value="Analytics & Insights">Analytics & Insights</option>
                    <option value="Mobile App">Mobile Experience</option>
                    <option value="Security & Auth">Security & Authentication</option>
                    <option value="Community & Social">Community & Social</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Target Release Window (Optional)</label>
                  <Input
                    value={targetRelease}
                    onChange={(e) => setTargetRelease(e.target.value)}
                    placeholder="e.g. Q1 2027 or Closed Beta Next Month"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Limit */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/70">Beta Tester Capacity Limit (Optional)</label>
            <Input
              type="number"
              min="1"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              placeholder="e.g. 250 (leave blank for unlimited signups)"
            />
            <p className="text-[11px] text-white/40">If set, signups exceeding this limit will automatically be placed on the waitlist queue.</p>
          </div>

          {/* Early Adopter Perks */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70">Early Adopter Perks</label>
            <div className="space-y-2">
              {perks.map((perk, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{perk}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePerk(i)}
                    className="text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  value={newPerk}
                  onChange={(e) => setNewPerk(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPerk();
                    }
                  }}
                  placeholder="e.g. Free 3-month Pro tier pass"
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddPerk}
                  className="shrink-0 h-10 px-4 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Perk
                </Button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-white/10 text-white/70 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="vux"
              disabled={loading}
              className="shadow-lg shadow-purple-600/30 px-6 font-semibold"
            >
              {loading ? "Creating Waitlist..." : "Create Feature Waitlist"}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
