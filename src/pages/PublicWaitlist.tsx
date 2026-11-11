import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  Check, 
  Copy, 
  Share2, 
  ArrowRight, 
  Clock, 
  Lock, 
  Flame, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { Waitlist, WaitlistEntry } from '../types';
import { WaitlistService } from '../services/WaitlistService';
import { useAuth } from '../AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Logo } from '../components/Logo';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function PublicWaitlist() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const querySlug = searchParams.get('waitlist');
  const targetSlug = slug || querySlug || '';
  const refCode = searchParams.get('ref') || undefined;

  const { user, profile } = useAuth();

  const [waitlist, setWaitlist] = useState<Waitlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Success state
  const [joinedEntry, setJoinedEntry] = useState<WaitlistEntry | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-fill logged in user info
  useEffect(() => {
    if (user || profile) {
      if (!email) setEmail(user?.email || profile?.email || '');
      if (!name) setName(profile?.displayName || user?.displayName || '');
    }
  }, [user, profile]);

  // Load waitlist
  useEffect(() => {
    if (!targetSlug) {
      setLoading(false);
      setError('No waitlist specified.');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const w = await WaitlistService.getWaitlistBySlugOrId(targetSlug);
        if (!w) {
          setError('Waitlist not found or link has expired.');
        } else {
          setWaitlist(w);
        }
      } catch (err: any) {
        console.error('Error fetching waitlist:', err);
        setError('Failed to load waitlist details.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [targetSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlist) return;
    if (!email.trim() || !email.includes('@')) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { entry, isNew } = await WaitlistService.joinWaitlist(waitlist.id, {
        email: email.trim(),
        name: name.trim() || undefined,
        userId: user?.uid,
        referredBy: refCode
      });

      setJoinedEntry(entry);

      if (isNew) {
        // Fire celebration confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A855F7', '#7C3AED', '#F43F5E', '#13D9F2']
        });
      }
    } catch (err: any) {
      console.error('Failed to join waitlist:', err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getReferralUrl = () => {
    if (!joinedEntry || !waitlist) return '';
    return `${window.location.origin}/w/${waitlist.slug}?ref=${joinedEntry.referralCode}`;
  };

  const handleCopyReferral = () => {
    const url = getReferralUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    if (!waitlist || !joinedEntry) return;
    const text = encodeURIComponent(
      `I just joined the waitlist for "${waitlist.title}"! Get early access with me: ${getReferralUrl()}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    if (!waitlist || !joinedEntry) return;
    const text = encodeURIComponent(
      `Join the waitlist for ${waitlist.title}: ${getReferralUrl()}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-white/40 font-mono">Loading Waitlist...</p>
        </div>
      </div>
    );
  }

  if (error || !waitlist) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-6 border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Waitlist Not Found</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              {error || "This waitlist link is invalid or may have been removed."}
            </p>
          </div>
          <Link to="/discover">
            <Button variant="vux" className="w-full">
              Explore Events & Launches
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isFeature = waitlist.type === 'feature';

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-purple-500/30 font-sans flex flex-col justify-between relative overflow-hidden">
      <Helmet>
        <title>{waitlist.title} | Early Access Waitlist</title>
        <meta name="description" content={waitlist.description || `Join the waitlist for ${waitlist.title}`} />
        <meta property="og:title" content={`${waitlist.title} | Waitlist`} />
        <meta property="og:description" content={waitlist.description || `Join the waitlist for ${waitlist.title}`} />
      </Helmet>

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/15 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-rose-600/10 blur-[180px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="h-16 px-6 max-w-5xl mx-auto w-full flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" showText={true} />
        </Link>
        <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
          <span>Hosted on</span>
          <span className="font-bold text-purple-400">VUX</span>
        </div>
      </header>

      {/* Main Waitlist Body */}
      <main className="max-w-2xl mx-auto w-full px-4 py-8 md:py-16 relative z-10 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!joinedEntry ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Badge & Type */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold backdrop-blur-md shadow-sm shadow-purple-500/10">
                  {isFeature ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>{waitlist.featureCategory || 'Feature Early Access'}</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>{waitlist.targetDate ? `Event Target: ${waitlist.targetDate}` : 'Event Waitlist'}</span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl md:text-5xl font-black italic tracking-tight text-white uppercase leading-tight">
                  {waitlist.title}
                </h1>

                {waitlist.description && (
                  <p className="text-white/70 text-base md:text-lg max-w-lg mx-auto leading-relaxed font-normal">
                    {waitlist.description}
                  </p>
                )}
              </div>

              {/* Form Card */}
              <Card className="p-6 md:p-8 border-white/[0.08] bg-[#09090b]/85 backdrop-blur-2xl rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
                {/* Live count banner */}
                <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/50 font-bold">Current Waitlist</div>
                      <div className="text-xl font-black text-white italic tracking-tight">
                        {waitlist.totalSubscribers.toLocaleString()} {waitlist.totalSubscribers === 1 ? 'person' : 'people'} waiting
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Open
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {submitError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                      {submitError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">Your Name (Optional)</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">
                      Email Address <span className="text-purple-400">*</span>
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      required
                      className="h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="vux"
                    disabled={submitting || !email.trim()}
                    className="w-full h-12 text-sm font-semibold shadow-xl shadow-purple-600/30 cursor-pointer"
                  >
                    {submitting ? "Securing your spot..." : "Join the Waitlist"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                {/* Early Access Perks */}
                {waitlist.perks && waitlist.perks.length > 0 && (
                  <div className="pt-4 border-t border-white/[0.06] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">What you get:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {waitlist.perks.map((perk, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Organizer Attribution */}
              <div className="text-center text-xs text-white/40">
                Created by <span className="text-white/70 font-semibold">{waitlist.creatorName || 'Organizer'}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/30">
                <Check className="w-10 h-10" />
              </div>

              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
                  Spot Reserved
                </span>
                <h2 className="text-3xl md:text-5xl font-black italic tracking-tight text-white uppercase leading-none">
                  You&apos;re On The List!
                </h2>
                <p className="text-white/60 text-base max-w-md mx-auto">
                  We&apos;ve reserved your priority spot for <span className="text-white font-semibold">{waitlist.title}</span>.
                </p>
              </div>

              {/* Position Highlight Card */}
              <Card className="p-8 border-purple-500/30 bg-[#09090b]/90 backdrop-blur-2xl rounded-3xl shadow-2xl space-y-6 max-w-lg mx-auto">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-widest text-white/50 font-bold">Your Queue Position</div>
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300 italic tracking-tight">
                    #{joinedEntry.position}
                  </div>
                  <p className="text-xs text-white/50 pt-1">
                    Ahead of the public release. We&apos;ll notify <span className="text-white/80 font-mono">{joinedEntry.email}</span> when invites unlock.
                  </p>
                </div>

                {/* Referral Booster */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 text-left">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Move up the waitlist!</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Share your unique link with friends or team members. Every person that signs up moves you closer to the front!
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      readOnly
                      value={getReferralUrl()}
                      className="font-mono text-xs bg-white/5 h-10 text-purple-200"
                    />
                    <Button
                      size="sm"
                      variant={copied ? "purple" : "secondary"}
                      onClick={handleCopyReferral}
                      className="h-10 px-4 shrink-0 text-xs font-semibold"
                    >
                      {copied ? <><Check className="w-3.5 h-3.5 mr-1" /> Copied</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>}
                    </Button>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={shareOnTwitter}
                    className="flex-1 h-11 border-white/10 text-xs font-semibold hover:border-purple-500/30"
                  >
                    Share on X (Twitter)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={shareOnWhatsApp}
                    className="flex-1 h-11 border-white/10 text-xs font-semibold hover:border-purple-500/30"
                  >
                    Share on WhatsApp
                  </Button>
                </div>
              </Card>

              <div>
                <Link to="/discover" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                  ← Discover more community events
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="h-14 px-6 text-center text-xs text-white/30 flex items-center justify-center border-t border-white/[0.04]">
        © 2026 VUX Events. Built for high-impact communities.
      </footer>
    </div>
  );
}
