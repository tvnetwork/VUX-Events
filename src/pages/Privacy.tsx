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
            <h2 className="text-xl font-bold text-white tracking-tight">1. Information We Collect</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              We collect information to provide better services to all our users. This includes Information you provide us (your name, email address, and profile picture from Google) and Information we get from your use of our services (event metadata, RSVPs, and usage logs).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">2. How We Use Information</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              We use the information we collect from all our services to provide, maintain, protect and improve them, to develop new ones, and to protect VUX Events and our users. We also use this information to offer you tailored content – like giving you more relevant event recommendations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">3. Information Security</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              We work hard to protect VUX Events and our users from unauthorized access to or unauthorized alteration, disclosure or destruction of information we hold. In particular: We encrypt many of our services using SSL and we review our information collection, storage and processing practices to guard against unauthorized access to systems.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">4. Information You Share</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              Our services let you share information with others. When you RSVP to an event, the host and other attendees may see your name and profile picture. Remember that when you share information publicly, it may be indexable by search engines.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">5. Accessing & Updating Information</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              Whenever you use our services, we aim to provide you with access to your personal information. If that information is wrong, we strive to give you ways to update it quickly or to delete it – unless we have to keep that information for legitimate business or legal purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">6. Changes</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              Our Privacy Policy may change from time to time. We will not reduce your rights under this Privacy Policy without your explicit consent. We will post any privacy policy changes on this page and, if the changes are significant, we will provide a more prominent notice.
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
