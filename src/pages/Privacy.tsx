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

        <div className="space-y-16 bg-white/[0.01] p-12 md:p-20 rounded-[4rem] border border-white/[0.03] shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-600/5 blur-[150px] rounded-full -mr-60 -mt-60" />
          
          <section className="space-y-4 relative">
            <h2 className="text-2xl font-black italic text-white tracking-tight uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">01</span>
                Information We Collect
            </h2>
            <p className="text-white/70 leading-relaxed font-medium text-base">
              We collect the information you provide when using VUX Events, including your name, email address, profile picture, and the events you create or RSVP to.
            </p>
          </section>

          <section className="space-y-4 relative">
            <h2 className="text-2xl font-black italic text-white tracking-tight uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">02</span>
                How We Use Your Information
            </h2>
            <p className="text-white/70 leading-relaxed font-medium text-base">
              We use your information to manage your event registrations, send confirmations and reminder emails, and provide organizers with attendee lists for check-ins.
            </p>
          </section>

          <section className="space-y-4 relative">
            <h2 className="text-2xl font-black italic text-white tracking-tight uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">03</span>
                Security & Encryption
            </h2>
            <p className="text-white/70 leading-relaxed font-medium text-base">
              Your account is protected using modern encryption standards. All network traffic is encrypted over TLS, and sensitive credentials are handled securely.
            </p>
          </section>

          <section className="space-y-4 relative">
            <h2 className="text-2xl font-black italic text-white tracking-tight uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">04</span>
                Event Visibility & Networking
            </h2>
            <p className="text-white/70 leading-relaxed font-medium text-base">
              When you RSVP to an event, the host receives your details so they can check you in. You have full control over whether your profile is shown in attendee lists.
            </p>
          </section>

          <section className="space-y-4 relative">
            <h2 className="text-2xl font-black italic text-white tracking-tight uppercase flex items-center gap-4">
                <span className="text-indigo-500 font-mono text-sm opacity-40">05</span>
                Your Privacy Rights
            </h2>
            <p className="text-white/70 leading-relaxed font-medium text-base">
              You own your personal data. You can edit your profile details, manage your communication preferences, or delete your account at any time in your Settings.
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
