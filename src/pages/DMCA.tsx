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

        <div className="space-y-16 bg-white/[0.01] p-12 md:p-20 rounded-[4rem] border border-white/[0.03] shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-600/5 blur-[150px] rounded-full -mr-60 -mt-60" />
          
          <section className="space-y-6 relative">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">01</span>
                Copyright Policy
            </h2>
            <p className="text-white/70 leading-relaxed font-medium text-base">
              VUX Events respects the intellectual property rights of creators. In accordance with the Digital Millennium Copyright Act (DMCA), we respond promptly to notices of alleged copyright infringement.
            </p>
          </section>

          <section className="space-y-4 relative">
            <h2 className="text-2xl font-black italic text-white tracking-tight uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">02</span>
                Filing a Notice
            </h2>
            <p className="text-white/70 leading-relaxed font-medium text-base">
              If your copyrighted work has been posted on VUX Events without permission, please send a notice to our copyright team containing:
            </p>
            <ul className="space-y-3 ml-6">
              {[
                'A signature of the authorized copyright owner or agent.',
                'Identification of the copyrighted work claimed to be infringed.',
                'The URL or link of the infringing event or image on our site.',
                'Your contact information (name, address, email, and phone number).',
                'A statement that you have a good-faith belief the use is not authorized.',
                'A statement made under penalty of perjury that your notice is accurate.'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 shrink-0" />
                  <span className="text-white/60 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-white/50 text-sm pt-4">
              Send notices to: <span className="text-indigo-400 font-semibold">legal@vuxevents.com</span>
            </p>
          </section>

          <section className="space-y-4 relative">
            <h2 className="text-2xl font-black italic text-white tracking-tight uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">03</span>
                Counter-Notices
            </h2>
            <p className="text-white/70 leading-relaxed font-medium text-base">
              If you believe your event or content was removed by mistake or misidentification, you may submit a counter-notice with your contact details and an explanation of the error.
            </p>
          </section>

          <section className="space-y-4 relative">
            <h2 className="text-2xl font-black italic text-white tracking-tight uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">04</span>
                Repeat Infringers
            </h2>
            <p className="text-white/70 leading-relaxed font-medium text-base">
              Accounts that repeatedly violate copyright or post unauthorized media may be permanently suspended from VUX Events.
            </p>
          </section>
        </div>

        <footer className="pt-24 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">
                &copy; 2026 VUX Events. All rights reserved.
            </p>
        </footer>
      </div>
    </div>
  );
}
