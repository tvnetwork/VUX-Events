/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Shield, Lock, Fingerprint, Smartphone, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../AuthContext';
import { TwoFactorSetup } from '../components/auth/TwoFactorSetup';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';

export function Security() {
  const { profile, updateProfileData } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDisable2FA = async () => {
     if (!confirm('Are you sure you want to disable two-factor authentication? This will reduce your account security.')) return;
     
     setLoading(true);
     try {
        await updateProfileData({
           security: {
              ...profile?.security,
              twoFactorEnabled: false
           }
        });
     } catch (err) {
        console.error('Failed to disable 2FA:', err);
     } finally {
        setLoading(false);
     }
  };

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link to="/">
          <Button variant="ghost" className="gap-2 text-white/70 hover:text-white -ml-4">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>

        <header className="space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-2xl shadow-blue-500/10">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-white uppercase italic leading-none">Security<br/><span className="text-blue-500">Center</span></h1>
            <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.4em]">Protocol Version 4.0.1 • Authorized Personnel Only</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
            {/* Account Protection Card */}
            <Card className="p-10 border-white/5 bg-white/[0.01] rounded-[3rem] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                
                <div className="space-y-10 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Identity Protection</h2>
                            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Multi-Layer Authentication Layers</p>
                        </div>
                        <div className={cn(
                            "px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest italic",
                            profile?.security?.twoFactorEnabled 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                        )}>
                            {profile?.security?.twoFactorEnabled ? 'Fortified' : 'Vulnerable'}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                            <div className="flex gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Smartphone className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">2FA (TOTP)</h3>
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic leading-relaxed max-w-[200px]">Secure your terminal with a unique rotating security core.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest italic",
                                    profile?.security?.twoFactorEnabled ? "text-emerald-500" : "text-white/10"
                                )}>
                                    {profile?.security?.twoFactorEnabled ? 'Protocol Enabled' : 'Protocol Inactive'}
                                </span>
                                {profile?.security?.twoFactorEnabled ? (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleDisable2FA}
                                        disabled={loading}
                                        className="h-12 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                                    >
                                        Disable
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="vux" 
                                        size="sm" 
                                        onClick={() => setShowSetup(true)}
                                        className="h-12 px-8 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2"
                                    >
                                        Initiate <ArrowRight className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] opacity-50 cursor-not-allowed">
                            <div className="flex gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                    <Fingerprint className="w-6 h-6 text-white/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white/70">Biometric Link</h3>
                                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest italic leading-relaxed">Hardware-level passkey authentication.</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-white/5 text-white/20 uppercase text-[9px] font-black tracking-widest italic">Coming Soon</Badge>
                        </div>
                    </div>
                </div>
            </Card>

            <AnimatePresence>
                {showSetup && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="p-10 border-blue-500/20 bg-blue-500/[0.02] rounded-[3rem]">
                            <TwoFactorSetup 
                               onComplete={() => setShowSetup(false)} 
                               onCancel={() => setShowSetup(false)} 
                            />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-12 bg-white/[0.01] p-10 rounded-[2.5rem] border border-white/5">
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-blue-500/40" />
                    <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">Security Infrastructure</h2>
                </div>
                <p className="text-white/60 leading-relaxed text-sm italic font-medium">
                  VUX Events is built on a globally distributed, secure-by-default infrastructure. We leverage industry-leading cloud providers that comply with SOC 2 Type II, ISO 27001, and other major security certifications. Our network is protected by enterprise-grade firewalls and DDoS mitigation layers.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-blue-500/40" />
                    <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">Data Encryption</h2>
                </div>
                <p className="text-white/60 leading-relaxed text-sm italic font-medium">
                  All data transmitted between your browser and our servers is encrypted using Transport Layer Security (TLS 1.2 or higher). Data at rest in our databases is encrypted using AES-256. We handle authentication through Google's secure OAuth 2.0 implementation, ensuring that your login credentials never touch our servers.
                </p>
              </section>
            </div>
        </div>

        <footer className="pt-20 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em] leading-loose italic">
                © 2026 VUX Events • Neural Core Hardened • v4.0.1
            </p>
        </footer>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
    return (
        <span className={cn(
            "px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest italic",
            variant === 'outline' ? "border-white/10 text-white/70" : "bg-white/10 text-white",
            className
        )}>
            {children}
        </span>
    );
}
