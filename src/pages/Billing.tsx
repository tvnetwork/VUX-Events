import { useState } from 'react';
import useSWR from 'swr';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, CalendarDays, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { useAuth } from '../AuthContext';
import { getSubscriptionPlan, type PlanId } from '../lib/plans';

type BillingStatus = {
  planId: PlanId;
  status: string;
  interval: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

async function loadBillingStatus(user: NonNullable<ReturnType<typeof useAuth>['user']>): Promise<BillingStatus> {
  const token = await user.getIdToken();
  const response = await fetch('/api/billing/status', { headers: { Authorization: `Bearer ${token}` } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Unable to load billing status.');
  return payload;
}

export default function Billing() {
  const { user } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const { data, error, isLoading } = useSWR(user ? ['billing-status', user.uid] : null, () => loadBillingStatus(user!));
  const plan = getSubscriptionPlan(data?.planId);

  const openPortal = async () => {
    if (!user) return;
    setPortalLoading(true);
    setActionError('');
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/billing/portal', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.url !== 'string') throw new Error(payload.error || 'Could not open billing settings.');
      window.location.assign(payload.url);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not open billing settings.');
      setPortalLoading(false);
    }
  };

  const nextBillingDate = data?.currentPeriodEnd ? new Intl.DateTimeFormat('en-NG', { dateStyle: 'long' }).format(new Date(data.currentPeriodEnd)) : null;

  return (
    <PageShell>
      <Helmet><title>Billing settings | VUX</title><meta name="description" content="View your VUX subscription and manage billing." /></Helmet>
      <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-8 sm:px-6">
        <header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-300">Account</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Billing & plan</h1><p className="mt-2 text-sm text-white/55">Review your subscription and update payment details or cancellation preferences.</p></header>
        {isLoading ? <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 p-6 text-sm text-white/60"><Loader2 className="h-4 w-4 animate-spin" /> Loading subscription details</div> : error ? <div role="alert" className="mt-8 rounded-2xl border border-rose-300/20 bg-rose-300/[0.06] p-5 text-sm text-rose-100">{error.message}</div> : (
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-emerald-200"><ShieldCheck className="h-4 w-4" /> {data?.status === 'active' || data?.status === 'trialing' ? 'Subscription active' : 'Current plan'}</div>
                <h2 className="mt-3 text-2xl font-semibold text-white">{plan.name}</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/55">{plan.description}</p>
              </div>
              <a href="/pricing" className="inline-flex h-10 items-center justify-center rounded-xl bg-fuchsia-500 px-4 text-sm font-semibold text-white transition hover:bg-fuchsia-400">Compare plans <ArrowUpRight className="ml-2 h-4 w-4" /></a>
            </div>
            <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-black/20 p-4"><CreditCard className="h-5 w-5 text-fuchsia-300" /><div><p className="text-xs text-white/45">Billing cycle</p><p className="mt-1 text-sm font-medium capitalize text-white">{data?.interval || 'No paid subscription'}</p></div></div>
              <div className="flex items-center gap-3 rounded-2xl bg-black/20 p-4"><CalendarDays className="h-5 w-5 text-fuchsia-300" /><div><p className="text-xs text-white/45">{data?.cancelAtPeriodEnd ? 'Access ends' : 'Next renewal'}</p><p className="mt-1 text-sm font-medium text-white">{nextBillingDate || 'Not scheduled'}</p></div></div>
            </div>
            {actionError && <p role="alert" className="mt-4 text-sm text-rose-300">{actionError}</p>}
            {data?.planId !== 'free' && <button type="button" onClick={openPortal} disabled={portalLoading} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-medium text-white transition hover:bg-white/[0.06] disabled:opacity-50">{portalLoading && <Loader2 className="h-4 w-4 animate-spin" />}Manage subscription and payment methods</button>}
          </section>
        )}
        <p className="mt-5 text-xs leading-5 text-white/40">Cancellation and payment details are handled securely by Stripe. Your plan changes only after Stripe confirms them.</p>
      </main>
    </PageShell>
  );
}
