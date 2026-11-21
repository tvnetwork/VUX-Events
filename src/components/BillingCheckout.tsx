import { useCallback, useMemo } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../AuthContext';
import type { BillingInterval, PlanId } from '../lib/plans';

const stripePromise = loadStripe(import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export function BillingCheckout({ planId, interval }: { planId: PlanId; interval: BillingInterval }) {
  const { user } = useAuth();
  const fetchClientSecret = useCallback(async () => {
    if (!user) throw new Error('Please sign in before choosing a subscription.');
    const token = await user.getIdToken();
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId, interval }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || typeof payload.clientSecret !== 'string') {
      throw new Error(payload.error || 'Unable to start checkout. Please try again.');
    }
    return payload.clientSecret;
  }, [interval, planId, user]);

  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  return (
    <div className="min-h-[420px] overflow-hidden rounded-2xl bg-white text-zinc-950">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
