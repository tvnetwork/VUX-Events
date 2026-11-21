import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { ModalShell } from '../components/ui/ModalShell';
import { BillingCheckout } from '../components/BillingCheckout';
import { requestAuthDialog } from '../lib/authDialog';
import { AVAILABLE_PLAN_FEATURES, getPlanPrice, SUBSCRIPTION_PLANS, type BillingInterval, type PlanId, type SubscriptionPlan } from '../lib/plans';
import { useAuth } from '../AuthContext';

const planOrder: PlanId[] = ['free', 'starter', 'professional', 'business', 'enterprise'];
const currency = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

function formatAmount(amount: number | null) {
  return amount === null ? 'Custom' : currency.format(amount);
}

function PlanCard({ plan, interval, onChoose }: {
  plan: SubscriptionPlan;
  interval: BillingInterval;
  onChoose: (plan: SubscriptionPlan) => void;
}) {
  const price = getPlanPrice(plan, interval);
  const popular = plan.id === 'professional';
  const unavailable = plan.id === 'business' || plan.id === 'enterprise';

  return (
    <article className={`relative flex h-full flex-col rounded-3xl border p-6 transition-colors ${popular ? 'border-fuchsia-400/55 bg-gradient-to-b from-fuchsia-500/[0.13] to-[#0c0c12] shadow-[0_24px_80px_rgba(192,38,211,0.12)]' : 'border-white/10 bg-white/[0.035] hover:border-white/20'}`}>
      {popular && <span className="absolute -top-3 left-6 rounded-full border border-fuchsia-300/30 bg-fuchsia-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">Most popular</span>}
      {unavailable && <span className="absolute -top-3 left-6 rounded-full border border-white/15 bg-zinc-800 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-300">Availability by enquiry</span>}
      <div className="mb-6 pt-2">
        <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
        <p className="mt-2 min-h-[3rem] text-sm leading-6 text-white/55">{plan.description}</p>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-white">{formatAmount(price)}</span>
          {price !== null && price > 0 && <span className="text-sm text-white/45">/{interval === 'annual' ? 'year' : 'month'}</span>}
        </div>
        {interval === 'annual' && plan.monthlyPrice ? <p className="mt-2 text-xs font-medium text-emerald-300">Two months free · {currency.format(plan.monthlyPrice * 2)} saved</p> : <p className="mt-2 text-xs text-white/40">{plan.id === 'enterprise' ? 'Tailored to your organisation' : 'Proposed launch pricing'}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChoose(plan)}
        aria-label={plan.id === 'enterprise' ? 'Contact sales about Enterprise' : plan.id === 'business' ? 'Ask about Business availability' : plan.id === 'free' ? 'Start with the Free plan' : `Choose ${plan.name}`}
        className={`mb-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${popular ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-400' : 'border border-white/15 bg-white/[0.06] text-white hover:bg-white/10'}`}
      >
        {plan.id === 'enterprise' ? 'Contact sales' : plan.id === 'business' ? 'Ask about Business' : plan.id === 'free' ? 'Start for free' : 'Choose plan'}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
      <ul className="space-y-3 text-sm text-white/75">
        {plan.highlights.map((highlight) => (
          <li key={highlight} className="flex items-start gap-2.5 leading-5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-300" aria-hidden="true" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function Pricing() {
  const { user } = useAuth();
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [checkoutPlan, setCheckoutPlan] = useState<PlanId | null>(null);
  const [notice, setNotice] = useState('');

  const choosePlan = (plan: SubscriptionPlan) => {
    setNotice('');
    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:events@kontyra.name.ng?subject=VUX%20Enterprise%20enquiry';
      return;
    }
    if (plan.id === 'business') {
      setNotice('Business billing is being enabled for verified organisation owners. Contact our team to discuss access.');
      return;
    }
    if (plan.id === 'free') {
      if (!user) requestAuthDialog();
      else window.location.href = '/';
      return;
    }
    if (!user) {
      requestAuthDialog();
      return;
    }
    setCheckoutPlan(plan.id);
  };

  return (
    <PageShell>
      <Helmet>
        <title>VUX Plans & Pricing</title>
        <meta name="description" content="Compare VUX event management plans, registration allowances and proposed annual savings." />
        <meta name="theme-color" content="#07070a" />
      </Helmet>
      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        {user && <div className="mb-4 flex justify-end"><a href="/billing" className="text-sm font-medium text-white/55 underline decoration-white/20 underline-offset-4 transition hover:text-white">Billing settings</a></div>}
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-fuchsia-200">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Plans for every kind of organiser
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Make room for your next great event.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">Start free, then choose a plan that grows with your events. Registration limits apply across your account each month.</p>
          <div className="mt-7 inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1" role="group" aria-label="Billing interval">
            {(['monthly', 'annual'] as const).map((option) => (
              <button key={option} type="button" aria-pressed={interval === option} onClick={() => setInterval(option)} className={`min-h-10 rounded-lg px-4 text-sm font-medium capitalize transition ${interval === option ? 'bg-white text-zinc-950' : 'text-white/65 hover:text-white'}`}>
                {option === 'annual' ? 'Yearly · save 2 months' : 'Monthly'}
              </button>
            ))}
          </div>
        </header>

        {notice && <div role="status" className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] px-4 py-3 text-center text-sm text-amber-100">{notice}</div>}

        <section aria-label="Subscription plans" className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {planOrder.map((id) => <PlanCard key={id} plan={SUBSCRIPTION_PLANS[id]} interval={interval} onChoose={choosePlan} />)}
        </section>

        <section className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <div className="border-b border-white/10 px-5 py-5 sm:px-7">
            <h2 className="text-xl font-semibold text-white">Compare available features</h2>
            <p className="mt-1 text-sm text-white/50">Only capabilities that are currently available are shown here. Additional features will be listed after implementation and testing.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-white/[0.035] text-xs uppercase tracking-wider text-white/45">
                <tr><th scope="col" className="px-5 py-4 font-medium sm:px-7">Feature</th>{planOrder.map((id) => <th scope="col" key={id} className="px-4 py-4 font-medium">{SUBSCRIPTION_PLANS[id].name}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {AVAILABLE_PLAN_FEATURES.map((feature) => <tr key={feature.label}>
                  <th scope="row" className="px-5 py-4 font-medium text-white/70 sm:px-7">{feature.label}</th>
                  {planOrder.map((id) => <td key={id} className="px-4 py-4 text-white/65">{feature.value(SUBSCRIPTION_PLANS[id])}</td>)}
                </tr>)}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:grid-cols-2 sm:p-7">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
            <div><h2 className="font-semibold text-white">Clear, flexible billing</h2><p className="mt-1 text-sm leading-6 text-white/55">Subscriptions renew monthly or annually. Manage or cancel through your billing settings. Payment processor fees, if any, are separate from VUX subscription fees.</p></div>
          </div>
          <p className="text-sm leading-6 text-white/50">Prices and feature limits shown are proposed launch terms. Business plans require an organisation owner; enterprise terms are agreed directly. We won&apos;t advertise custom domains, API access or paid ticketing until those features are ready.</p>
        </section>

        {checkoutPlan && (
          <ModalShell onClose={() => setCheckoutPlan(null)} title={`Start ${SUBSCRIPTION_PLANS[checkoutPlan].name}`} subtitle="Your subscription price and billing interval are set securely by VUX." maxWidth="2xl" className="sm:max-w-3xl">
            <BillingCheckout planId={checkoutPlan} interval={interval} />
          </ModalShell>
        )}
      </main>
    </PageShell>
  );
}
