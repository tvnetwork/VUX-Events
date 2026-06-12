import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Key, 
  Webhook, 
  Activity, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Check, 
  Code2, 
  BookOpen, 
  ExternalLink,
  Zap,
  Globe,
  Lock
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';

export function Developer() {
  const { profile, updateProfileData } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'webhooks'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Form states
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const developerSettings = profile?.developer || { apiKeys: [], webhooks: [] };
  const apiKeys = developerSettings.apiKeys || [];
  const webhooks = developerSettings.webhooks || [];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (id: string) => {
    const newSet = new Set(visibleKeys);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleKeys(newSet);
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) return;
    
    // In a real app, the server would generate this. We mock it for the frontend.
    const newKey = 'vux_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    const keyRecord = {
      id: crypto.randomUUID(),
      name: newKeyName,
      key: newKey,
      createdAt: new Date().toISOString(),
    };

    await updateProfileData({
      developer: {
        ...developerSettings,
        apiKeys: [...apiKeys, keyRecord]
      }
    });

    setNewKeyName('');
    setIsCreatingKey(false);
  };

  const deleteApiKey = async (id: string) => {
    await updateProfileData({
      developer: {
        ...developerSettings,
        apiKeys: apiKeys.filter(k => k.id !== id)
      }
    });
  };

  const addWebhook = async () => {
    if (!newWebhookUrl.trim()) return;

    const secret = 'whsec_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    const webhookRecord = {
      id: crypto.randomUUID(),
      url: newWebhookUrl,
      events: ['*'],
      secret: secret,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    await updateProfileData({
      developer: {
        ...developerSettings,
        webhooks: [...webhooks, webhookRecord]
      }
    });

    setNewWebhookUrl('');
    setIsCreatingWebhook(false);
  };

  const deleteWebhook = async (id: string) => {
    await updateProfileData({
      developer: {
        ...developerSettings,
        webhooks: webhooks.filter(w => w.id !== id)
      }
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'keys', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  ] as const;

  return (
    <div className="max-w-[1100px] mx-auto py-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
           <div className="flex items-center gap-3 text-indigo-400 mb-2">
             <Code2 className="w-5 h-5" />
             <span className="text-xs font-semibold uppercase tracking-widest">Developer Hub</span>
           </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">API & Integrations</h1>
          <p className="text-sm text-white/50 max-w-xl leading-relaxed">
            Manage your API keys, configure webhooks, and monitor your integration usage. Build powerful experiences on top of the VUX Events platform.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
            <Button variant="outline" className="h-10 text-xs font-medium border-white/10 hover:bg-white/5">
                <BookOpen className="w-4 h-4 mr-2" /> API Reference
                <ExternalLink className="w-3 h-3 ml-2 text-white/40" />
            </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-[#07070a]/50 backdrop-blur-md rounded-2xl border border-white/5 w-fit mt-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                isActive ? "text-white" : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="dev-tab-active"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white/[0.02] border-white/5 backdrop-blur-xl rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full" />
                    <Activity className="w-6 h-6 text-indigo-400 mb-4" />
                    <h3 className="text-3xl font-semibold text-white tracking-tight">24.5k</h3>
                    <p className="text-sm text-white/50 mt-1">API Requests (30d)</p>
                </Card>
                <Card className="p-6 bg-white/[0.02] border-white/5 backdrop-blur-xl rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full" />
                    <Zap className="w-6 h-6 text-emerald-400 mb-4" />
                    <h3 className="text-3xl font-semibold text-white tracking-tight">42ms</h3>
                    <p className="text-sm text-white/50 mt-1">Avg Response Time</p>
                </Card>
                <Card className="p-6 bg-white/[0.02] border-white/5 backdrop-blur-xl rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px] rounded-full" />
                    <Globe className="w-6 h-6 text-rose-400 mb-4" />
                    <h3 className="text-3xl font-semibold text-white tracking-tight">0.01%</h3>
                    <p className="text-sm text-white/50 mt-1">Error Rate</p>
                </Card>
              </div>

              <Card className="p-8 border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-3xl">
                 <h3 className="text-lg font-medium text-white mb-6">Request Volume</h3>
                 <div className="h-[300px] w-full flex items-end justify-between gap-2 px-4 pb-4 border-b border-white/5">
                     {/* Mock Chart Bars */}
                     {Array.from({ length: 30 }).map((_, i) => (
                         <div key={i} className="w-full flex flex-col justify-end group">
                             <div 
                               className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 rounded-t-md transition-all duration-300 relative"
                               style={{ height: `${Math.max(10, Math.random() * 100)}%` }}
                             >
                                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {Math.floor(Math.random() * 5000)}
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
                 <div className="flex justify-between text-xs text-white/40 mt-4 px-4">
                     <span>30 days ago</span>
                     <span>Today</span>
                 </div>
              </Card>
            </motion.div>
          )}

          {/* API KEYS TAB */}
          {activeTab === 'keys' && (
            <motion.div
              key="keys"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Secret API Keys</h3>
                  <Button 
                    onClick={() => setIsCreatingKey(true)}
                    className="bg-white text-black hover:bg-white/90 text-xs font-medium h-9"
                  >
                     <Plus className="w-4 h-4 mr-2" /> Create new key
                  </Button>
              </div>

              {isCreatingKey && (
                  <Card className="p-6 border-indigo-500/30 bg-indigo-500/5 backdrop-blur-xl rounded-2xl flex items-end gap-4 animate-in slide-in-from-top-4">
                      <div className="flex-1 space-y-2">
                          <label className="text-xs font-medium text-white/70">Key Name</label>
                          <Input 
                             value={newKeyName}
                             onChange={(e) => setNewKeyName(e.target.value)}
                             placeholder="e.g. Production Mobile App"
                             className="h-10 bg-white/5 border-white/10"
                             autoFocus
                          />
                      </div>
                      <Button onClick={generateApiKey} disabled={!newKeyName.trim()} className="bg-indigo-500 hover:bg-indigo-600 text-white h-10">
                          Generate
                      </Button>
                      <Button variant="ghost" onClick={() => setIsCreatingKey(false)} className="h-10 text-white/50 hover:text-white">
                          Cancel
                      </Button>
                  </Card>
              )}

              <div className="space-y-4">
                  {apiKeys.length === 0 && !isCreatingKey && (
                      <div className="text-center py-12 border border-white/5 border-dashed rounded-3xl bg-white/[0.01]">
                          <Key className="w-8 h-8 text-white/20 mx-auto mb-3" />
                          <p className="text-sm text-white/50">No API keys created yet.</p>
                      </div>
                  )}

                  {apiKeys.map((keyRecord) => (
                      <Card key={keyRecord.id} className="p-5 border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-white/20 transition-all">
                          <div className="space-y-1">
                              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                {keyRecord.name}
                                <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white/60">LIVE</span>
                              </h4>
                              <p className="text-xs text-white/40">Created {new Date(keyRecord.createdAt).toLocaleDateString()}</p>
                          </div>

                          <div className="flex items-center gap-3">
                              <div className="flex items-center bg-[#07070a] border border-white/10 rounded-lg p-1">
                                  <div className="px-3 text-sm font-mono text-white/70 tracking-wider">
                                      {visibleKeys.has(keyRecord.id) 
                                        ? keyRecord.key 
                                        : 'vux_' + '•'.repeat(32)}
                                  </div>
                                  <button onClick={() => toggleKeyVisibility(keyRecord.id)} className="p-2 text-white/40 hover:text-white transition-colors">
                                      {visibleKeys.has(keyRecord.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                  <div className="w-px h-4 bg-white/10 mx-1" />
                                  <button onClick={() => copyToClipboard(keyRecord.key, keyRecord.id)} className="p-2 text-white/40 hover:text-white transition-colors">
                                      {copiedKey === keyRecord.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                  </button>
                              </div>

                              <button onClick={() => deleteApiKey(keyRecord.id)} className="p-2 text-white/20 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      </Card>
                  ))}
              </div>
            </motion.div>
          )}

          {/* WEBHOOKS TAB */}
          {activeTab === 'webhooks' && (
            <motion.div
              key="webhooks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Webhook Endpoints</h3>
                  <Button 
                    onClick={() => setIsCreatingWebhook(true)}
                    className="bg-white text-black hover:bg-white/90 text-xs font-medium h-9"
                  >
                     <Plus className="w-4 h-4 mr-2" /> Add Endpoint
                  </Button>
              </div>

              {isCreatingWebhook && (
                  <Card className="p-6 border-indigo-500/30 bg-indigo-500/5 backdrop-blur-xl rounded-2xl flex flex-col md:flex-row items-end gap-4 animate-in slide-in-from-top-4">
                      <div className="flex-1 w-full space-y-2">
                          <label className="text-xs font-medium text-white/70">Payload URL</label>
                          <Input 
                             value={newWebhookUrl}
                             onChange={(e) => setNewWebhookUrl(e.target.value)}
                             placeholder="https://api.yourdomain.com/webhooks/vux"
                             className="h-10 bg-white/5 border-white/10"
                             autoFocus
                          />
                      </div>
                      <Button onClick={addWebhook} disabled={!newWebhookUrl.trim() || !newWebhookUrl.startsWith('http')} className="bg-indigo-500 hover:bg-indigo-600 text-white h-10 w-full md:w-auto">
                          Save
                      </Button>
                      <Button variant="ghost" onClick={() => setIsCreatingWebhook(false)} className="h-10 text-white/50 hover:text-white w-full md:w-auto">
                          Cancel
                      </Button>
                  </Card>
              )}

              <div className="space-y-4">
                  {webhooks.length === 0 && !isCreatingWebhook && (
                      <div className="text-center py-12 border border-white/5 border-dashed rounded-3xl bg-white/[0.01]">
                          <Webhook className="w-8 h-8 text-white/20 mx-auto mb-3" />
                          <p className="text-sm text-white/50">No webhooks configured.</p>
                      </div>
                  )}

                  {webhooks.map((webhook) => (
                      <Card key={webhook.id} className="p-6 border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-white/20 transition-all">
                          <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                <h4 className="text-sm font-medium text-white truncate max-w-sm">{webhook.url}</h4>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-white/40">Events:</span>
                                <span className="bg-white/10 text-white/70 px-2 py-0.5 rounded">All Events (*)</span>
                              </div>
                          </div>

                          <div className="flex items-center gap-4">
                              <div className="flex flex-col items-end">
                                  <span className="text-xs text-white/40 mb-1">Signing Secret</span>
                                  <div className="flex items-center bg-[#07070a] border border-white/10 rounded-lg p-1">
                                      <div className="px-3 text-xs font-mono text-white/70 tracking-wider">
                                          {visibleKeys.has(webhook.id) 
                                            ? webhook.secret 
                                            : 'whsec_' + '•'.repeat(16)}
                                      </div>
                                      <button onClick={() => toggleKeyVisibility(webhook.id)} className="p-1.5 text-white/40 hover:text-white transition-colors">
                                          {visibleKeys.has(webhook.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                      </button>
                                  </div>
                              </div>

                              <button onClick={() => deleteWebhook(webhook.id)} className="p-2 mt-5 text-white/20 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      </Card>
                  ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
