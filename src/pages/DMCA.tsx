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

        <header className="space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 glass">
            <FileText className="w-8 h-8 text-teal-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-white uppercase italic">DMCA Policy</h1>
            <p className="text-xs text-white/20 font-bold uppercase tracking-widest">Last updated: April 23, 2026</p>
          </div>
        </header>

        <div className="space-y-12 bg-white/5 glass p-10 rounded-[2.5rem] border border-white/10">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Copyright Compliance</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              VUX Events Inc. respects the intellectual property rights of others. In accordance with the Digital Millennium Copyright Act (DMCA), we respond promptly to notices of alleged infringement that are reported to our designated copyright agent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Filing a Notice</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              If you believe that your work has been copied in a way that constitutes copyright infringement, please provide our Copyright Agent with a written notice containing the following information:
            </p>
            <ul className="list-disc list-inside text-white/40 text-sm space-y-2 ml-4 italic">
              <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material that is claimed to be infringing and information reasonably sufficient to permit us to locate the material.</li>
              <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and email.</li>
              <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner.</li>
              <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner.</li>
            </ul>
            <p className="text-white/40 leading-relaxed text-sm pt-4">
              Notices should be sent to: <span className="text-white font-bold">legal@vuxevents.com</span>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Counter-Notification</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              If you believe that your content was removed by mistake or misidentification, you may submit a counter-notification to our Copyright Agent. The counter-notification must be a written communication that includes your identification of the material and a statement under penalty of perjury that you have a good faith belief the material was removed as a result of mistake.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Repeat Infringers</h2>
            <p className="text-white/40 leading-relaxed text-sm">
              In appropriate circumstances, VUX Events will terminate user accounts of those who are found to be repeat copyright infringers. We strive to maintain a respectful and legally compliant community of creators and hosts.
            </p>
          </section>
        </div>

        <footer className="pt-20 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/10 font-black uppercase tracking-widest leading-loose">
                © 2026 VUX Events Inc. • Respecting creators.
            </p>
        </footer>
      </div>
    </div>
  );
}
