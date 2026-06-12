import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Key, ShieldCheck, Zap, ExternalLink, Plus, Trash2, Copy, CheckCircle2, Globe, Server } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '../AuthContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';

interface APIKey {
  id: string;
  key: string;
  appName: string;
  webhookUrl: string;
  createdAt: any;
}

export function DeveloperHub() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [newAppName, setNewAppName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchKeys();
  }, [user]);

  const fetchKeys = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'api_keys'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const fetchedKeys = snap.docs.map(d => ({ id: d.id, ...d.data() } as APIKey));
      setKeys(fetchedKeys);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAppName || !newWebhookUrl) return;

    setIsGenerating(true);
    try {
      const rawKey = 'vux_live_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      await addDoc(collection(db, 'api_keys'), {
        userId: user.uid,
        key: rawKey,
        appName: newAppName,
        webhookUrl: newWebhookUrl,
        createdAt: serverTimestamp()
      });

      toast.success('API Key generated successfully!');
      setNewAppName('');
      setNewWebhookUrl('');
      setIsGenerating(false);
      fetchKeys();
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate API key');
      setIsGenerating(false);
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API Key? Any integrations using it will immediately fail.')) return;
    
    try {
      await deleteDoc(doc(db, 'api_keys', id));
      toast.success('API Key revoked');
      fetchKeys();
    } catch (err) {
      toast.error('Failed to revoke API key');
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20 mix-blend-screen pointer-events-none">
          <Terminal className="w-32 h-32 text-indigo-400" />
        </div>
        
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-indigo-400">
            <Zap className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Developer Hub</span>
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">VUX Events Engine</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Generate secure API keys to integrate the VUX ticket engine directly into your own platform. Webhooks will automatically dispatch ticket updates to your systems in real-time.
          </p>
          <div className="pt-4 flex gap-4">
            <a href="https://events.kontyra.name.ng/VUX_INTEGRATION.md" target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10">
                <ExternalLink className="w-4 h-4" /> View Documentation
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-6">
          <Card className="p-6 bg-white/[0.02] border-white/5 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Create New Key
            </h3>
            
            <form onSubmit={generateKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Application Name</label>
                <Input 
                  placeholder="e.g. DevOS Production" 
                  value={newAppName} 
                  onChange={(e) => setNewAppName(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 text-white placeholder:text-white/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Webhook URL</label>
                <Input 
                  type="url"
                  placeholder="https://your-app.com/api/webhooks" 
                  value={newWebhookUrl} 
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 text-white placeholder:text-white/20"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isGenerating || !newAppName || !newWebhookUrl}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 py-6"
              >
                {isGenerating ? 'Generating...' : 'Generate API Key'}
              </Button>
            </form>
          </Card>
        </div>

        <div className="md:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 px-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" /> Active Keys
          </h3>

          {loading ? (
            <div className="text-center py-12 text-white/30 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
              Loading security keys...
            </div>
          ) : keys.length === 0 ? (
            <Card className="p-12 border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Key className="w-6 h-6 text-white/20" />
              </div>
              <div>
                <p className="text-white font-bold mb-1">No API Keys Generated</p>
                <p className="text-white/40 text-sm">Create your first key to start integrating VUX Events.</p>
              </div>
            </Card>
          ) : (
            <AnimatePresence>
              {keys.map((apiKey) => (
                <motion.div 
                  key={apiKey.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="p-6 bg-black/40 border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Server className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-lg font-bold text-white">{apiKey.appName}</h4>
                          </div>
                          <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
                            <Globe className="w-3 h-3" />
                            {apiKey.webhookUrl}
                          </div>
                        </div>

                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-4 group">
                          <code className="text-emerald-400 text-sm font-mono truncate">{apiKey.key}</code>
                          <button 
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="text-white/40 hover:text-white transition-colors flex-shrink-0"
                          >
                            {copiedKey === apiKey.key ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-end">
                        <Button 
                          variant="ghost" 
                          onClick={() => deleteKey(apiKey.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2 text-xs h-10"
                        >
                          <Trash2 className="w-4 h-4" /> Revoke Key
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
