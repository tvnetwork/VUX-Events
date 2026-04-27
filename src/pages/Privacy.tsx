/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Privacy() {
  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link to="/">
          <Button variant="ghost" className="gap-2 text-white/70 hover:text-white -ml-4">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>

        <header className="space-y-8">
          <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/20 relative group">
            <div className="absolute inset-0 bg-indigo-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            <Lock className="w-10 h-10 text-indigo-400 relative z-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-[0.8]">PRIVACY<br/>SHIELD</h1>
            <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-indigo-500" />
                <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.4em] italic leading-none">Last sync: April 23, 2026</p>
            </div>
          </div>
        </header>

        <div className="space-y-16 bg-white/[0.01] p-12 md:p-20 rounded-[4rem] border border-white/[0.03] shadow-2xl relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-600/5 blur-[150px] rounded-full -mr-60 -mt-60" />
          
          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">01</span>
                Data Harvesting
            </h2>
            <p className="text-white/80 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              We collect information to optimize the VUX substrate for all entities. This includes provided biometric data (name, email, avatar) and interaction logs within the decentralized synchronization layer.
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">02</span>
                Protocol Utilization
            </h2>
            <p className="text-white/80 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              Data is utilized to maintain, protect, and augment the VUX infrastructure. We process interaction metadata to architect personalized event recommendations within the global directory.
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">03</span>
                Security Matrix
            </h2>
            <p className="text-white/80 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              Enterprise-grade encryption guards the VUX network. We implement SSL-hardened sessions and continuous security audits of our collection and storage protocols to ensure absolute data sovereignty.
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">04</span>
                Public Broadcasts
            </h2>
            <p className="text-white/80 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              Interaction within the community is public by design. When registering for a roadmap, your identity node is visible to the orchestrator and other verified participants.
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">05</span>
                Identity Sovereignty
            </h2>
            <p className="text-white/80 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              You maintain total control over your digital avatar. The system provides integrated tools for rapid data augmentation or complete identity termination unless prohibited by legal smart-contracts.
            </p>
          </section>
        </div>

        <footer className="pt-24 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.4em] font-mono leading-loose">
                © 2026 VUX Events Matrix • Secure Protocol v2.0 • Identity Confirmed
            </p>
        </footer>
      </div>
    </div>
  );
}
