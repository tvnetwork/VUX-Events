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
          <Button variant="ghost" className="gap-2 text-white/40 hover:text-white -ml-4">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>

        <header className="space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 glass">
            <Scale className="w-8 h-8 text-purple-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-white uppercase italic">Terms of Service</h1>
            <p className="text-xs text-white/20 font-bold uppercase tracking-widest">Last updated: April 23, 2026</p>
          </div>
        </header>

        <div className="space-y-12 bg-white/5 glass p-10 rounded-[2.5rem] border border-white/10">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">1. Acceptance of Agreement</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              By accessing the VUX Events platform, you agree to be bound by these Terms of Service. VUX Events provides a modern infrastructure for community gathering and event management. Your use of the service constitutes a legally binding agreement between you and VUX Events Inc.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">2. User Conduct & Content</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              Users are solely responsible for the content they publish, including event descriptions, images, and community guidelines. VUX Events reserves the right to remove any content that violates our Community Standards or is deemed harmful to the high-signal nature of our platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">3. Payments & Tickets</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              VUX Events facilitates ticket sales between hosts and guests. While we provide the secure infrastructure for these transactions, VUX Events is not a party to the individual ticket purchase agreements. Fees collected by VUX Events are non-refundable unless otherwise specified in the event-specific policy.
            </p>
          </section>
        </div>

        <footer className="pt-20 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/10 font-black uppercase tracking-widest leading-loose">
                © 2026 VUX Events Inc. • Built for the modern community.
            </p>
        </footer>
      </div>
    </div>
  );
}
