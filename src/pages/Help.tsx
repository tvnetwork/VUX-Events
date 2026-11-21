import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
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
    category: 'Getting started',
    question: 'How do I create an event?',
    answer: "Once you're signed in, click Create in the navigation bar or the + icon on your dashboard. Add a title, date, location, and description to get started.",
  },
  {
    category: 'Getting started',
    question: 'Is VUX free to use?',
    answer: 'Creating events and RSVPing to free events is completely free. A small service fee applies to paid ticket sales to help maintain our secure infrastructure.',
  },
  {
    category: 'Event management',
    question: 'How do I manage attendees?',
    answer: "Open My Events, choose the event you want to manage, then select Manage Attendees. You can review guest lists, approve requests, and send updates there.",
  },
  {
    category: 'Event management',
    question: 'Can I make my event private?',
    answer: "Yes. During event creation, choose Invite Only or hide your event from the public discovery feed.",
  },
  {
    category: 'Account & security',
    question: 'How do I delete my account?',
    answer: "Find the account deletion option at the bottom of Settings under Account. This action is permanent and removes the events you've hosted.",
  },
  {
    category: 'Account & security',
    question: 'Is my data secure?',
    answer: 'We use secure authentication and industry-standard safeguards to protect your information. Visit our Security page to learn more.',
  },
];

const topics = [
  { name: 'All topics', icon: Sparkles, description: 'Browse every answer' },
  { name: 'Getting started', icon: BookOpen, description: 'Your first steps with VUX' },
  { name: 'Event management', icon: Zap, description: 'Create and manage events' },
  { name: 'Account & security', icon: ShieldCheck, description: 'Your account and privacy' },
];

export function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All topics');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesTopic = activeTopic === 'All topics' || faq.category === activeTopic;
      const matchesSearch = !query || `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(query);
      return matchesTopic && matchesSearch;
    });
  }, [activeTopic, searchQuery]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-white/55 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">
        <ChevronLeft aria-hidden="true" className="size-4" /> Back to VUX
      </Link>

      <section className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/[0.12] via-white/[0.035] to-indigo-500/[0.08] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-200">
            <CircleHelp aria-hidden="true" className="size-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">VUX support</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">How can we help?</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/60 sm:text-base">Find quick answers and helpful guides for making your next event a success.</p>
          <div className="relative mx-auto mt-7 max-w-2xl text-left">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/40" />
            <label htmlFor="help-search" className="sr-only">Search help articles</label>
            <Input
              id="help-search"
              type="search"
              placeholder="Search questions, topics, and guides..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-12 rounded-xl border-white/10 bg-black/25 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus-visible:border-fuchsia-300/50 focus-visible:ring-fuchsia-300/20"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="topics-heading" className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Explore support</p>
            <h2 id="topics-heading" className="mt-1 text-xl font-semibold text-white">Browse by topic</h2>
          </div>
          <span className="hidden text-xs text-white/40 sm:inline">Choose a topic to filter answers</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map(({ name, icon: Icon, description }) => {
            const selected = activeTopic === name;
            return (
              <Card key={name} className="rounded-2xl border-0 bg-transparent p-0 shadow-none">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveTopic(name)}
                  className={cn(
                    'flex min-h-[104px] w-full items-start gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400',
                    selected ? 'border-fuchsia-300/35 bg-fuchsia-400/[0.08]' : 'border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]',
                  )}
                >
                  <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', selected ? 'bg-fuchsia-400/15 text-fuchsia-200' : 'bg-white/[0.06] text-white/65')}>
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="block text-sm font-semibold text-white">{name}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/45">{description}</span>
                  </span>
                </button>
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Answers and guides</p>
            <h2 id="faq-heading" className="mt-1 text-xl font-semibold text-white">Frequently asked questions</h2>
          </div>
          <span className="shrink-0 text-xs text-white/45">{filteredFaqs.length} {filteredFaqs.length === 1 ? 'answer' : 'answers'}</span>
        </div>

        {filteredFaqs.length ? (
          <div className="divide-y divide-white/[0.08] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            {filteredFaqs.map((faq) => {
              const expanded = expandedQuestion === faq.question;
              const answerId = `answer-${faqs.indexOf(faq)}`;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={answerId}
                    onClick={() => setExpandedQuestion(expanded ? null : faq.question)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fuchsia-400 sm:px-5"
                  >
                    <span className="min-w-0">
                      <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-fuchsia-200/75">{faq.category}</span>
                      <span className="mt-1 block break-words text-sm font-medium leading-5 text-white sm:text-base">{faq.question}</span>
                    </span>
                    <ChevronDown aria-hidden="true" className={cn('size-5 shrink-0 text-white/45 transition-transform', expanded && 'rotate-180 text-fuchsia-200')} />
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        id={answerId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="max-w-3xl px-4 pb-5 text-sm leading-6 text-white/65 sm:px-5">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div role="status" className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-10 text-center">
            <Search aria-hidden="true" className="mx-auto size-6 text-white/35" />
            <p className="mt-3 text-sm font-medium text-white">No answers found</p>
            <p className="mt-1 text-sm text-white/50">Try another search or browse all topics.</p>
            <Button type="button" variant="ghost" onClick={() => { setSearchQuery(''); setActiveTopic('All topics'); }} className="mt-3 text-fuchsia-200 hover:text-white">Clear filters</Button>
          </div>
        )}
      </section>

      <section className="mt-10 flex flex-col gap-5 rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/[0.08] to-fuchsia-500/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-fuchsia-200"><Users aria-hidden="true" className="size-5" /></span>
          <div>
            <h2 className="font-semibold text-white">Still need a hand?</h2>
            <p className="mt-1 text-sm leading-5 text-white/55">Our support team can help with your account or event.</p>
          </div>
        </div>
        <a href="mailto:events@kontyra.name.ng" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
          Email support <Mail aria-hidden="true" className="size-4" /> <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </section>

      <nav aria-label="Help center policies" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.08] pt-5 text-xs text-white/45">
        <Link to="/terms" className="transition hover:text-white">Terms of access</Link>
        <Link to="/privacy" className="transition hover:text-white">Privacy</Link>
        <Link to="/security" className="transition hover:text-white">Security</Link>
      </nav>
    </main>
  );
}
