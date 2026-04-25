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
            <h2 className="text-xl font-bold text-white tracking-tight">Security Infrastructure</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              VUX Events is built on a globally distributed, secure-by-default infrastructure. We leverage industry-leading cloud providers that comply with SOC 2 Type II, ISO 27001, and other major security certifications. Our network is protected by enterprise-grade firewalls and DDoS mitigation layers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Data Encryption</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              All data transmitted between your browser and our servers is encrypted using Transport Layer Security (TLS 1.2 or higher). Data at rest in our databases is encrypted using AES-256. We handle authentication through Google's secure OAuth 2.0 implementation, ensuring that your login credentials never touch our servers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Authentication & Access</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              We reinforce account security through multi-factor authentication and token-based session management. Access to our internal systems is strictly controlled using the principle of least privilege (PoLP) and requires hardware-based second-factor authentication for all administrators.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Reporting a Vulnerability</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              We welcome reports from security researchers and users. If you believe you have found a security vulnerability in our platform, please contact us immediately at security@vuxevents.com. We investigate all credible reports and strive to fix identified issues promptly.
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
