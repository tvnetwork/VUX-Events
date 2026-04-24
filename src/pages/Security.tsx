/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Security() {
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
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-white uppercase italic">Security</h1>
            <p className="text-xs text-white/20 font-bold uppercase tracking-widest">Last updated: April 23, 2026</p>
          </div>
        </header>

        <div className="space-y-12 bg-white/5 glass p-10 rounded-[2.5rem] border border-white/10">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Zero-Trust Architecture</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              VUX Events is engineered with a Zero-Trust philosophy. Every request and data access point is verified at every level of our stack. We utilize enterprise-grade infrastructure to anchor our events and data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Passwordless Verification</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              We have eliminated the risk of credential stuffing and password theft by moving to a 100% passwordless environment. Verification is handled via high-entropy secure codes and biometric passkeys tied to your hardware.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Continuous Auditing</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              Our engineering team conducts regular security audits and penetration testing. We monitor for anomalies in real-time to ensure that the VUX Events community remains a safe, high-signal space for everyone.
            </p>
          </section>
        </div>

        <footer className="pt-20 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/10 font-black uppercase tracking-widest leading-loose">
                © 2026 VUX Events Inc. • Hardened for the community.
            </p>
        </footer>
      </div>
    </div>
  );
}
