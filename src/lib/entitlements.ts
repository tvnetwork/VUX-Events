import { getSubscriptionPlan, type PlanId, type SubscriptionPlan } from './plans';

export interface BillingRecord {
  planId?: PlanId;
  status?: string;
  currentPeriodEnd?: string | null;
  gracePeriodEndsAt?: string | null;
  cancelAtPeriodEnd?: boolean;
  interval?: 'monthly' | 'annual' | null;
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);

export function getEffectivePlan(record?: BillingRecord | null, now = Date.now()): SubscriptionPlan {
  if (!record || !record.planId || record.planId === 'free') return getSubscriptionPlan('free');
  if (ACTIVE_SUBSCRIPTION_STATUSES.has(record.status || '')) return getSubscriptionPlan(record.planId);

  const graceEndsAt = record.gracePeriodEndsAt ? Date.parse(record.gracePeriodEndsAt) : 0;
  if (record.status === 'past_due' && Number.isFinite(graceEndsAt) && graceEndsAt > now) {
    return getSubscriptionPlan(record.planId);
  }

  return getSubscriptionPlan('free');
}

export function hasPlanFeature(plan: SubscriptionPlan, feature: keyof SubscriptionPlan['features']): boolean {
  return plan.features[feature];
}

export function isWithinLimit(limit: number | null, current: number): boolean {
  return limit === null || current < limit;
}
