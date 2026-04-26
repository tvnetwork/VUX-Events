/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Zap, 
  Shield, 
  Users, 
  Calendar,
  ChevronDown,
  Mail,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I create an event?",
    answer: "Once you're signed in, you can create an event by clicking the 'Create' button in the navigation bar or the '+' icon on your dashboard. You'll need to provide a title, date, location, and description."
  },
  {
    category: "Getting Started",
    question: "Is VUX free to use?",
    answer: "Creating events and RSVPing to free events is completely free. We charge a small service fee for paid ticket sales to maintain our secure infrastructure."
  },
  {
    category: "Event Management",
    question: "How do I manage attendees?",
    answer: "Go to your 'My Events' tab, click on the event you want to manage, and select 'Manage Attendees'. From there, you can approve requests, view guest lists, and send updates."
  },
  {
    category: "Event Management",
    question: "Can I make my event private?",
    answer: "Yes, you can choose to make your event 'Invite Only' or hide it from the public discovery feed during the creation process."
  },
  {
    category: "Account & Security",
    question: "How do I delete my account?",
    answer: "You can find the account deletion option at the bottom of your Settings page under 'Account'. Please note that this action is permanent and will remove all your hosted events."
  },
  {
    category: "Account & Security",
    question: "Is my data secure?",
    answer: "We use enterprise-grade encryption and secure authentication via Google to ensure your personal data is protected. Read our Security page for more details."
  }
];

export function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map(f => f.category)));

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Navigation & Header */}
        <div className="space-y-12">
          <Link to="/">
            <Button variant="ghost" className="gap-2 text-white/40 hover:text-white -ml-4 rounded-2xl">
              <ChevronLeft className="w-4 h-4" /> Back to App
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6 max-w-2xl">
              <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/20 relative group">
                <div className="absolute inset-0 bg-indigo-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                <HelpCircle className="w-10 h-10 text-indigo-400 relative z-10" />
              </div>
              <div className="space-y-4">
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-[0.8]">HELP<br/>CENTER</h1>
                <p className="text-white/40 text-sm font-bold uppercase tracking-[0.3em] italic">Omni-Channel Protocol Assistance</p>
              </div>
            </div>

            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-focus-within:text-white transition-colors" />
              <Input 
                placeholder="Query System Database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 bg-white/[0.02] border-white/5 focus:border-indigo-500/40 rounded-3xl h-16 italic font-bold text-lg transition-all"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <BookOpen className="w-7 h-7 text-indigo-400" />, title: 'User Manuals', desc: 'Step-by-step cryptographic tutorials.' },
            { icon: <Zap className="w-7 h-7 text-amber-500" />, title: 'Prime Protocol', desc: 'Maximize your community engagement.' },
            { icon: <Shield className="w-7 h-7 text-emerald-400" />, title: 'Trust Matrix', desc: 'Understanding your data sovereignty.' }
          ].map((item, i) => (
            <Card key={i} className="p-10 border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all rounded-[40px] group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-500/40 transition-all duration-500">
                  {item.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter transition-colors group-hover:text-indigo-400">{item.title}</h3>
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-relaxed italic">{item.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="space-y-10">
          <div className="flex items-center gap-6">
             <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Query Results</h2>
            <div className="h-px flex-1 bg-white/[0.03]" />
          </div>

          <div className="space-y-6">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, i) => (
                <div 
                  key={i}
                  className={cn(
                    "rounded-[2.5rem] border transition-all overflow-hidden relative",
                    expandedIndex === i 
                      ? "bg-white/[0.03] border-indigo-500/20 shadow-2xl shadow-indigo-500/10" 
                      : "bg-white/[0.01] border-white/5 hover:bg-white/[0.02]"
                  )}
                >
                  <button 
                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                    className="w-full p-10 flex items-center justify-between text-left group"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/60 font-mono">{faq.category}</span>
                      <h4 className="text-xl font-black italic tracking-tight text-white group-hover:text-indigo-300 transition-colors uppercase">
                        {faq.question}
                      </h4>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-all duration-500",
                      expandedIndex === i ? "rotate-180 bg-indigo-600 text-white shadow-xl shadow-indigo-500/40" : "text-white/20"
                    )}>
                      <ChevronDown className="w-6 h-6" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      >
                        <div className="px-10 pb-10 text-white/40 leading-relaxed font-bold italic text-lg border-t border-white/[0.03] pt-8 bg-black/20">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <div className="py-32 text-center space-y-6 bg-white/[0.01] rounded-[48px] border border-dashed border-white/[0.05]">
                <Search className="w-12 h-12 text-white/5 mx-auto" />
                <p className="text-[10px] italic font-black uppercase tracking-[0.4em] text-white/10">No protocol match for query: "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <section className="bg-gradient-to-br from-indigo-600/[0.08] via-purple-600/[0.03] to-transparent p-16 md:p-24 rounded-[4rem] border border-white/10 space-y-12 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/10 blur-[150px] rounded-full -mr-80 -mt-80 group-hover:bg-indigo-600/15 transition-all duration-1000" />
          <div className="space-y-6 relative">
             <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 ring-4 ring-indigo-500/5">
                <MessageCircle className="w-12 h-12 text-indigo-400" />
             </div>
             <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight">Need Direct<br/>Access?</h2>
             <p className="text-white/20 max-w-lg mx-auto text-sm font-black italic leading-relaxed uppercase tracking-[0.2em]">
                Our support agents are on standby 24/7. Access the high-priority communication channel below.
             </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative">
             <a href="mailto:vuxevents@gmail.com" className="w-full sm:w-auto">
               <Button variant="vux" className="w-full sm:w-auto h-20 px-14 rounded-3xl text-lg font-black uppercase tracking-widest gap-3 shadow-2xl shadow-indigo-500/20">
                 <Mail className="w-5 h-5" /> Open Ticket
               </Button>
             </a>
             <Button variant="ghost" className="w-full sm:w-auto h-20 px-14 rounded-3xl border border-white/5 font-black uppercase tracking-widest gap-3 hover:bg-white/[0.03] transition-all">
                <ExternalLink className="w-5 h-5" /> HQ Discord
             </Button>
          </div>
        </section>

        <footer className="pt-24 border-t border-white/5 text-center flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.3em] font-mono">
                [PROTOCOL 2.0] VUX Events Matrix • © 2026 • Encrypted Documentation
            </p>
            <div className="flex items-center gap-12">
              <Link to="/terms" className="text-[10px] font-black text-white/20 hover:text-indigo-400 uppercase tracking-widest transition-all">Terms of Access</Link>
              <Link to="/privacy" className="text-[10px] font-black text-white/20 hover:text-indigo-400 uppercase tracking-widest transition-all">Privacy Shield</Link>
            </div>
        </footer>
      </div>
    </div>
  );
}
