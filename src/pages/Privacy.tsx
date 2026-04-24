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
          <Button variant="ghost" className="gap-2 text-white/40 hover:text-white -ml-4">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>

        <header className="space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 glass">
            <Lock className="w-8 h-8 text-pink-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-white uppercase italic">Privacy Policy</h1>
            <p className="text-xs text-white/20 font-bold uppercase tracking-widest">Last updated: April 23, 2026</p>
          </div>
        </header>

        <div className="space-y-12 bg-white/5 glass p-10 rounded-[2.5rem] border border-white/10">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">1. Data Architecture</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              Our privacy framework is built on transparency. We collect only the data necessary to provide a seamless event experience: your name, email, and social identifiers. We do not sell your data to third-party advertisers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">2. Secure Processing</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              VUX Events uses state-of-the-art encryption to protect your information both in transit and at rest. Metadata from your events is used solely to improve our intelligent discovery engine and enhance platform utility.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">3. Your Autonomy</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              You maintain full control over your digital identity on VUX Events. You may request a full export of your data or complete account deletion through your profile settings at any time. Your right to privacy is non-negotiable.
            </p>
          </section>
        </div>

        <footer className="pt-20 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/10 font-black uppercase tracking-widest leading-loose">
                © 2026 VUX Events Inc. • Your data, your rules.
            </p>
        </footer>
      </div>
    </div>
  );
}
