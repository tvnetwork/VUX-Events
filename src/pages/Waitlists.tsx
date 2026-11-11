import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Waitlist, WaitlistEntry, WaitlistType } from '../types';
import { WaitlistService } from '../services/WaitlistService';
import { CreateWaitlistModal } from '../components/waitlist/CreateWaitlistModal';
import { ModalShell } from '../components/ui/ModalShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { 
  Users, 
  Sparkles, 
  Calendar, 
  Plus, 
  Link2, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Trash2, 
  Search, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Waitlists() {
  const { user } = useAuth();
  const [waitlists, setWaitlists] = useState<Waitlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'event' | 'feature'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeWaitlist, setActiveWaitlist] = useState<Waitlist | null>(null);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadWaitlists = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const list = await WaitlistService.getWaitlistsByCreator(user.uid);
      setWaitlists(list);
    } catch (err) {
      console.error('Failed to load waitlists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaitlists();
  }, [user]);

  const handleOpenEntries = async (w: Waitlist) => {
    setActiveWaitlist(w);
    setLoadingEntries(true);
    try {
      const list = await WaitlistService.getEntries(w.id);
      setEntries(list);
    } catch (err) {
      console.error('Failed to load entries:', err);
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleCopyLink = (w: Waitlist) => {
    const url = `${window.location.origin}/w/${w.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(w.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteWaitlist = async (w: Waitlist) => {
    if (!window.confirm(`Are you sure you want to delete "${w.title}"? This cannot be undone.`)) return;
    try {
      await WaitlistService.deleteWaitlist(w.id);
      setWaitlists(waitlists.filter(item => item.id !== w.id));
      if (activeWaitlist?.id === w.id) setActiveWaitlist(null);
    } catch (err) {
      console.error('Failed to delete waitlist:', err);
    }
  };

  const handleStatusChange = async (w: Waitlist, status: Waitlist['status']) => {
    try {
      await WaitlistService.updateWaitlist(w.id, { status });
      setWaitlists(waitlists.map(item => item.id === w.id ? { ...item, status } : item));
      if (activeWaitlist?.id === w.id) {
        setActiveWaitlist({ ...activeWaitlist, status });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleEntryStatus = async (entryId: string, status: WaitlistEntry['status']) => {
    if (!activeWaitlist) return;
    try {
      await WaitlistService.updateEntryStatus(activeWaitlist.id, entryId, status);
      setEntries(entries.map(e => e.id === entryId ? { ...e, status } : e));
    } catch (err) {
      console.error('Failed to update subscriber status:', err);
    }
  };

  // Filtered waitlists
  const filteredWaitlists = waitlists.filter(w => {
    if (filterType !== 'all' && w.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return w.title.toLowerCase().includes(q) || w.slug.toLowerCase().includes(q) || (w.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalSubscribersCollected = waitlists.reduce((acc, curr) => acc + (curr.totalSubscribers || 0), 0);
  const activeCount = waitlists.filter(w => w.status === 'active').length;

  return (
    <div className="space-y-10 py-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-purple-400">
            <Users className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.25em]">Audience & Early Access</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
            Waitlists & Signups
          </h1>
          <p className="text-sm text-white/60 max-w-xl leading-relaxed font-normal">
            Create dedicated landing links to collect signups for upcoming events or new app features. Track subscriber queues and export data anytime.
          </p>
        </div>

        <Button
          variant="vux"
          onClick={() => setIsCreateOpen(true)}
          className="h-12 px-6 rounded-2xl shadow-xl shadow-purple-600/30 font-semibold gap-2 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Waitlist</span>
        </Button>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 bg-[#09090b]/80 border-white/[0.08] backdrop-blur-xl rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Total Waitlists</div>
            <div className="text-3xl font-black text-white italic tracking-tight">{waitlists.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-6 bg-[#09090b]/80 border-white/[0.08] backdrop-blur-xl rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Total Subscribers</div>
            <div className="text-3xl font-black text-white italic tracking-tight">{totalSubscribersCollected.toLocaleString()}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-6 bg-[#09090b]/80 border-white/[0.08] backdrop-blur-xl rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Active Lists</div>
            <div className="text-3xl font-black text-emerald-400 italic tracking-tight">{activeCount}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Flame className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Controls: Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Type Filter Tabs */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-[#09090b] border border-white/10 self-start">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              filterType === 'all' ? "bg-purple-600 text-white shadow-md shadow-purple-600/25" : "text-white/60 hover:text-white"
            )}
          >
            All ({waitlists.length})
          </button>
          <button
            onClick={() => setFilterType('event')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
              filterType === 'event' ? "bg-purple-600 text-white shadow-md shadow-purple-600/25" : "text-white/60 hover:text-white"
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            Events
          </button>
          <button
            onClick={() => setFilterType('feature')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
              filterType === 'feature' ? "bg-purple-600 text-white shadow-md shadow-purple-600/25" : "text-white/60 hover:text-white"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            App Features
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search waitlists..."
            className="pl-9 h-10 text-xs"
          />
        </div>
      </div>

      {/* Waitlist Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-white/40 font-mono">Loading waitlists...</p>
        </div>
      ) : filteredWaitlists.length === 0 ? (
        <Card className="p-12 text-center space-y-5 border-white/[0.08] bg-[#09090b]/80 backdrop-blur-xl rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 text-white/30 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white">No waitlists found</h3>
            <p className="text-sm text-white/50 max-w-sm mx-auto">
              {searchQuery ? "No waitlists match your search." : "You haven't created any waitlists yet. Start collecting early interest today."}
            </p>
          </div>
          <Button variant="vux" onClick={() => setIsCreateOpen(true)} className="text-xs font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> Create Your First Waitlist
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWaitlists.map((w) => {
            const isEvent = w.type === 'event';
            const publicUrl = `${window.location.origin}/w/${w.slug}`;

            return (
              <Card
                key={w.id}
                hover={true}
                className="p-6 border-white/[0.08] bg-[#09090b]/85 hover:border-purple-500/35 backdrop-blur-xl rounded-3xl space-y-6 flex flex-col justify-between transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={isEvent ? "coral" : "purple"} className="text-[10px]">
                      {isEvent ? (
                        <>
                          <Calendar className="w-3 h-3 mr-1" /> Event
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" /> Feature
                        </>
                      )}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        w.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        w.status === 'launched' ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" :
                        "bg-white/5 text-white/40 border border-white/10"
                      )}>
                        {w.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Slug */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white tracking-tight leading-snug line-clamp-1">{w.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono truncate">
                      <Link2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">/w/{w.slug}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {w.description && (
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {w.description}
                    </p>
                  )}

                  {/* Metadata pill */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                    <span className="text-white/50">Subscribers</span>
                    <span className="text-white font-bold font-mono">{(w.totalSubscribers || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyLink(w)}
                      className="text-xs font-semibold h-9"
                    >
                      {copiedId === w.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                        </>
                      )}
                    </Button>

                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs font-semibold h-9 border-white/10 hover:border-purple-500/30"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> Public Page
                      </Button>
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="purple"
                      onClick={() => handleOpenEntries(w)}
                      className="flex-1 text-xs font-semibold h-9"
                    >
                      <Users className="w-3.5 h-3.5 mr-1" /> View Subscribers ({(w.totalSubscribers || 0)})
                    </Button>

                    <button
                      onClick={() => handleDeleteWaitlist(w)}
                      className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete waitlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      {isCreateOpen && (
        <CreateWaitlistModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={(newWaitlist) => {
            setWaitlists([newWaitlist, ...waitlists]);
          }}
        />
      )}

      {/* Subscribers Viewer Modal */}
      {activeWaitlist && (
        <ModalShell
          isOpen={true}
          onClose={() => setActiveWaitlist(null)}
          title={`Subscribers: ${activeWaitlist.title}`}
          subtitle={`${entries.length} ${entries.length === 1 ? 'person' : 'people'} currently in this queue.`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Status:</span>
                <select
                  value={activeWaitlist.status}
                  onChange={(e) => handleStatusChange(activeWaitlist, e.target.value as Waitlist['status'])}
                  className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-purple-500/50"
                >
                  <option value="active">Active (Collecting)</option>
                  <option value="closed">Closed</option>
                  <option value="launched">Launched / Sent</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => WaitlistService.exportToCSV(activeWaitlist, entries)}
                  disabled={entries.length === 0}
                  className="text-xs font-semibold h-9"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyLink(activeWaitlist)}
                  className="text-xs font-semibold h-9 border-white/10"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Share Link
                </Button>
              </div>
            </div>

            {/* Subscribers Table */}
            {loadingEntries ? (
              <div className="py-12 text-center text-xs text-white/40">Loading subscribers...</div>
            ) : entries.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Users className="w-8 h-8 text-white/20 mx-auto" />
                <p className="text-sm text-white/60">No signups yet.</p>
                <p className="text-xs text-white/40">Share the link with your audience to start collecting signups.</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[400px] custom-scrollbar border border-white/[0.08] rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-white/50 border-b border-white/[0.08] uppercase tracking-wider sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="py-3 px-4">Pos</th>
                      <th className="py-3 px-4">Subscriber</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Referrals</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-purple-400">
                          #{entry.position}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {entry.name || 'Anonymous'}
                        </td>
                        <td className="py-3 px-4 font-mono text-white/70">
                          {entry.email}
                        </td>
                        <td className="py-3 px-4 font-mono text-white/60">
                          {entry.referralCount || 0}
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            entry.status === 'invited' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            entry.status === 'approved' ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" :
                            "bg-white/5 text-white/40"
                          )}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {entry.status !== 'invited' ? (
                            <button
                              onClick={() => handleEntryStatus(entry.id, 'invited')}
                              className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-bold transition-all"
                            >
                              Invite
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-semibold">Invited</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
