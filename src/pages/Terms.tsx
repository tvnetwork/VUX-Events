/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Scale } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Terms() {
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
            <Scale className="w-10 h-10 text-indigo-400 relative z-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-[0.8]">TERMS OF<br/>ACCESS</h1>
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
                Entry Protocol
            </h2>
            <p className="text-white/80 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              By accessing the VUX substrate (the "Protocol"), you agree to be bound by these Terms of Access and all underlying cryptographic laws. Unauthorized intrusion or protocol exploitation is strictly prohibited.
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">02</span>
                Identity Authentication
            </h2>
            <p className="text-white/80 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              Access requires valid Google Identity verification. You are solely responsible for your digital avatar and all interaction strings broadcasted under your unique network ID.
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">03</span>
                Roadmap Deployment
            </h2>
            <p className="text-white/80 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              Orchestrators hosting roadmaps represent they have full protocol rights. VUX reserves the right to terminate any event node that violates community harmonics or legal frameworks.
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">04</span>
                Value Exchange
            </h2>
            <p className="text-white/80 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              Value transfers within the VUX network are facilitated by secure third-party gateways. VUX facilitates the handshake but holds no liability for external physical event fulfillment.
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">05</span>
                Liability Boundaries
            </h2>
            <p className="text-white/80 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              VUX Matrix Inc. and its nodes provide the protocol "as is." We bear no responsibility for data corruption, sync failures, or loss of value arising from protocol utilization.
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">06</span>
                Global Substrate Law
            </h2>
            <p className="text-white/80 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              These terms are governed by the laws of the host jurisdiction. All disputes shall be settled within the exclusive digital courts of the Matrix operational zone.
            </p>
          </section>
        </div>

        <footer className="pt-24 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.4em] font-mono leading-loose">
                © 2026 VUX Events Matrix • Secure Protocol v2.0 • Entry Logged
            </p>
        </footer>
      </div>
    </div>
  );
}
