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
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <HelpCircle className="w-8 h-8 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h1 className="text-6xl font-black tracking-tight text-white uppercase italic leading-[0.9]">Help Center</h1>
                <p className="text-white/40 text-lg font-medium italic">Everything you need to know about hosting and attending events on VUX.</p>
              </div>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input 
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 rounded-2xl h-14 italic"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <BookOpen className="w-6 h-6 text-blue-400" />, title: 'User Guides', desc: 'Step-by-step tutorials for hosts and guests.' },
            { icon: <Zap className="w-6 h-6 text-yellow-400" />, title: 'Best Practices', desc: 'How to make your community event stand out.' },
            { icon: <Shield className="w-6 h-6 text-emerald-400" />, title: 'Privacy & Trust', desc: 'Understanding how we keep your data safe.' }
          ].map((item, i) => (
            <Card key={i} className="p-8 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-[32px] group cursor-pointer">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">{item.title}</h3>
                  <p className="text-xs text-white/30 font-medium italic leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Frequently Asked Questions</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, i) => (
                <div 
                  key={i}
                  className={cn(
                    "rounded-[2rem] border border-white/5 transition-all overflow-hidden",
                    expandedIndex === i ? "bg-white/[0.03] border-white/10" : "bg-white/[0.01] hover:bg-white/[0.02]"
                  )}
                >
                  <button 
                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                    className="w-full p-8 flex items-center justify-between text-left group"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{faq.category}</span>
                      <h4 className="text-lg font-bold italic tracking-tight text-white/80 group-hover:text-white transition-colors">
                        {faq.question}
                      </h4>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition-transform",
                      expandedIndex === i ? "rotate-180 bg-purple-500/20 text-purple-400" : "text-white/20"
                    )}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        <div className="px-8 pb-8 text-white/40 leading-relaxed italic text-sm border-t border-white/5 pt-6">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4 bg-white/[0.01] rounded-[40px] border border-dashed border-white/5">
                <Search className="w-8 h-8 text-white/10 mx-auto" />
                <p className="text-sm italic text-white/20">No matching questions found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <section className="bg-gradient-to-br from-purple-500/[0.05] to-transparent p-12 md:p-16 rounded-[3rem] border border-white/10 space-y-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="space-y-4 relative">
             <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-purple-500/20">
                <MessageCircle className="w-10 h-10 text-purple-400" />
             </div>
             <h2 className="text-4xl font-black italic uppercase tracking-tighter">Still need help?</h2>
             <p className="text-white/30 max-w-md mx-auto text-sm font-medium italic leading-relaxed">
                Our support team is active 24/7. Reach out and we'll get your community event back on track.
             </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
             <a href="mailto:vuxevents@gmail.com" className="w-full sm:w-auto">
               <Button className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest gap-2">
                 <Mail className="w-4 h-4" /> Email Support
               </Button>
             </a>
             <Button variant="ghost" className="w-full sm:w-auto h-16 px-10 rounded-2xl border border-white/10 font-black uppercase tracking-widest gap-2">
                <ExternalLink className="w-4 h-4" /> Join Discord
             </Button>
          </div>
        </section>

        <footer className="pt-20 border-t border-white/5 text-center flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] text-white/10 font-black uppercase tracking-widest">
                © 2026 VUX Events Inc. • Built for the modern community.
            </p>
            <div className="flex items-center gap-8">
              <Link to="/terms" className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">Terms</Link>
              <Link to="/privacy" className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">Privacy</Link>
            </div>
        </footer>
      </div>
    </div>
  );
}
