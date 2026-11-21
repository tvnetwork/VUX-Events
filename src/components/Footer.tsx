import { ArrowUpRight, Instagram, Mail, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const footerGroups = [
  {
    title: 'Discover',
    links: [
      { label: 'Explore events', to: '/discover' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Developer hub', to: '/developer' },
      { label: 'Help centre', to: '/help' },
    ],
  },
  {
    title: 'Your account',
    links: [
      { label: 'My tickets', to: '/tickets' },
      { label: 'Waitlists', to: '/waitlists' },
      { label: 'Settings', to: '/settings' },
      { label: 'Security', to: '/security' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Terms of service', to: '/terms' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Copyright & DMCA', to: '/dmca' },
    ],
  },
];

export function Footer({ onAuthClick }: { onAuthClick?: () => void }) {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/[0.08] bg-[#100e11] px-5 pb-7 pt-14 sm:px-8 sm:pt-20">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-48 -z-10 size-[28rem] rounded-full bg-[#a85e4b]/10 blur-[110px]" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/[0.08] pb-12 md:grid-cols-[1.3fr_2fr] md:gap-16 md:pb-16">
          <div className="max-w-sm">
            <Link to="/" aria-label="VUX Events home" className="inline-flex rounded-md"><Logo /></Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">
              Gather people around the things that matter. One thoughtful home for hosting, discovering and attending events.
            </p>
            <button onClick={onAuthClick} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#d88c74] px-5 text-sm font-semibold text-[#211612] transition-colors hover:bg-[#e4a08a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e4a08a]">
              Start hosting <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">{group.title}</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="text-sm text-white/70 transition-colors hover:text-[#e4a08a] focus-visible:rounded-sm">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} VUX Events. Made for bringing people together.</p>
          <div className="flex items-center gap-2">
            <a aria-label="Email VUX Events" href="mailto:events@kontyra.name.ng" className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-[#d88c74]/50 hover:text-[#e4a08a]"><Mail size={17} /></a>
            <a aria-label="VUX Events on X" href="https://x.com/vuxevents" target="_blank" rel="noopener noreferrer" className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-[#d88c74]/50 hover:text-[#e4a08a]"><X size={17} /></a>
            <a aria-label="VUX Events on Instagram" href="https://instagram.com/vuxevents" target="_blank" rel="noopener noreferrer" className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-[#d88c74]/50 hover:text-[#e4a08a]"><Instagram size={17} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
