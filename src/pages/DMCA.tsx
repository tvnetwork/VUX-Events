/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function DMCA() {
  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link to="/">
          <Button variant="ghost" className="gap-2 text-white/40 hover:text-white -ml-4">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>

        <header className="space-y-8">
          <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/20 relative group">
            <div className="absolute inset-0 bg-indigo-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            <FileText className="w-10 h-10 text-indigo-400 relative z-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-[0.8]">IP<br/>PROTECT</h1>
            <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-indigo-500" />
                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] italic leading-none">Last sync: April 23, 2026</p>
            </div>
          </div>
        </header>

        <div className="space-y-16 bg-white/[0.01] p-12 md:p-20 rounded-[4rem] border border-white/[0.03] shadow-2xl relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-600/5 blur-[150px] rounded-full -mr-60 -mt-60" />
          
          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">01</span>
                Compliance Registry
            </h2>
            <p className="text-white/40 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              VUX Events Matrix respects the intellectual property nodes of all entities. In accordance with total DMCA protocols, we respond instantly to notices of alleged data infringement reported to our legal agents.
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">02</span>
                Infringement Query
            </h2>
            <p className="text-white/40 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              If your digital assets have been synchronized without authorization, provide our Legal Agent with an encrypted notice containing:
            </p>
            <ul className="space-y-4 ml-8">
              {[
                'Digital signature of authorized legal representative.',
                'Identification of the copyrighted node string.',
                'Specific protocol path of the infringing material.',
                'Contact vector (Signal, Mail, or Matrix ID).',
                'Good faith belief statement of protocol violation.',
                'Accuracy affirmation under penalty of matrix law.'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 shrink-0" />
                  <span className="text-white/40 font-bold italic text-sm uppercase tracking-wider">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-white/20 leading-relaxed font-black uppercase italic tracking-widest text-xs pt-6">
                Broadcast terminal: <span className="text-indigo-400">legal@vuxevents.com</span>
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">03</span>
                Counter-Sync
            </h2>
            <p className="text-white/40 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              If your content nodes were terminated by error, you may deploy a counter-notification. This must include ID verification and an affirmation under penalty of matrix law regarding the mistake.
            </p>
          </section>

          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">04</span>
                Red-List Protocol
            </h2>
            <p className="text-white/40 leading-relaxed font-bold italic text-lg uppercase tracking-wide">
              Repeat data infringers will face permanent identity termination from the VUX substrate. We maintain a zero-tolerance harmony protocol for all creators and orchestrators.
            </p>
          </section>
        </div>

        <footer className="pt-24 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.4em] font-mono leading-loose">
                © 2026 VUX Events Matrix • Secure Protocol v2.0 • Assets Protected
            </p>
        </footer>
      </div>
    </div>
  );
}
