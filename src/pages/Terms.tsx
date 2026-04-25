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
            <h2 className="text-xl font-bold text-white tracking-tight">1. Acceptance of Terms</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              By accessing or using VUX Events (the "Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">2. User Accounts & Responsibilities</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              To access certain features, you must register for an account using a valid Google Identity. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You must notify us immediately of any unauthorized use or security breach.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">3. Event Hosting & Content</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              When you host an event on VUX, you represent that you have the right to organize and promote such an event. You retain ownership of all content you upload, but grant VUX Events a license to host, display, and promote that content. We reserve the right to remove any event that violates our Community Guidelines, including events promoting illegal activities, hate speech, or harassment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">4. Ticketing & Payments</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              VUX Events acts as a platform for event organizers to sell tickets to attendees. All payment processing is handled by third-party secure providers. While we facilitate the transaction, we are not responsible for the fulfillment of the event. Refunds are at the sole discretion of the event organizer unless the event is cancelled and not rescheduled.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">5. Limitation of Liability</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              In no event shall VUX Events Inc. or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on VUX Events, even if VUX Events or a VUX Events authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">6. Governing Law</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which VUX Events operates and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
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
