export type PlanId = 'free' | 'starter' | 'professional' | 'business' | 'enterprise';
export type BillingInterval = 'monthly' | 'annual';

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  limits: {
    activeEvents: number | null;
    monthlyRegistrations: number | null;
    teamSeats: number | null;
  };
  features: {
    waitlists: boolean;
    customRegistrationFields: boolean;
    attendeeExports: boolean;
    paidTicketing: boolean;
    customBranding: boolean;
    customDomain: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    organisationWorkspace: boolean;
  };
  highlights: string[];
  checkoutAvailable: boolean;
}

export const SUBSCRIPTION_PLANS: Record<PlanId, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'For individuals exploring VUX and hosting occasional events.',
    monthlyPrice: 0,
    annualPrice: 0,
    limits: { activeEvents: 2, monthlyRegistrations: 100, teamSeats: 1 },
    features: {
      waitlists: false,
      customRegistrationFields: false,
      attendeeExports: false,
      paidTicketing: false,
      customBranding: false,
      customDomain: false,
      advancedAnalytics: false,
      apiAccess: false,
      organisationWorkspace: false,
    },
    highlights: [
      '2 active events',
      '100 registrations per month',
      'Standard event pages and RSVP forms',
      'QR code check-in',
      'Basic attendee management and analytics',
      'Community support',
    ],
    checkoutAvailable: true,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For freelancers, independent organisers and small communities.',
    monthlyPrice: 4900,
    annualPrice: 49000,
    limits: { activeEvents: 10, monthlyRegistrations: 500, teamSeats: 1 },
    features: {
      waitlists: true,
      customRegistrationFields: true,
      attendeeExports: true,
      paidTicketing: false,
      customBranding: false,
      customDomain: false,
      advancedAnalytics: false,
      apiAccess: false,
      organisationWorkspace: false,
    },
    highlights: [
      '10 active events',
      '500 registrations per month',
      'Custom registration fields',
      'Waitlist management',
      'Attendee CSV exports',
      'Email notifications and event duplication',
    ],
    checkoutAvailable: true,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'For professional organisers and growing event businesses.',
    monthlyPrice: 14900,
    annualPrice: 149000,
    limits: { activeEvents: null, monthlyRegistrations: 2500, teamSeats: 5 },
    features: {
      waitlists: true,
      customRegistrationFields: true,
      attendeeExports: true,
      paidTicketing: false,
      customBranding: false,
      customDomain: false,
      advancedAnalytics: false,
      apiAccess: false,
      organisationWorkspace: false,
    },
    highlights: [
      'Unlimited active events',
      '2,500 registrations per month',
      'Everything in Starter',
      'Priority support',
      'Paid ticketing and team tools are not yet available',
    ],
    checkoutAvailable: true,
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'For companies, institutions and established event organisations.',
    monthlyPrice: 39900,
    annualPrice: 399000,
    limits: { activeEvents: null, monthlyRegistrations: 10000, teamSeats: 20 },
    features: {
      waitlists: true,
      customRegistrationFields: true,
      attendeeExports: true,
      paidTicketing: false,
      customBranding: false,
      customDomain: false,
      advancedAnalytics: false,
      apiAccess: false,
      organisationWorkspace: true,
    },
    highlights: [
      'Unlimited active events',
      '10,000 registrations per month',
      'Business subscriptions require an organisation owner',
      'Team administration and organisation tools are rolling out separately',
    ],
    checkoutAvailable: false,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For universities, government institutions and large event operators.',
    monthlyPrice: null,
    annualPrice: null,
    limits: { activeEvents: null, monthlyRegistrations: null, teamSeats: null },
    features: {
      waitlists: true,
      customRegistrationFields: true,
      attendeeExports: true,
      paidTicketing: false,
      customBranding: false,
      customDomain: false,
      advancedAnalytics: false,
      apiAccess: false,
      organisationWorkspace: true,
    },
    highlights: [
      'Custom registration limits and team capacity',
      'Enterprise onboarding and account management',
      'Custom integrations and reporting are scoped per contract',
      'Contact us to discuss availability and terms',
    ],
    checkoutAvailable: false,
  },
};

export function getSubscriptionPlan(id?: string | null): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[id as PlanId] ?? SUBSCRIPTION_PLANS.free;
}

export function getPlanPrice(plan: SubscriptionPlan, interval: BillingInterval): number | null {
  return interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
}

export const AVAILABLE_PLAN_FEATURES = [
  { label: 'Active events', value: (plan: SubscriptionPlan) => plan.limits.activeEvents === null ? 'Unlimited' : String(plan.limits.activeEvents) },
  { label: 'Registrations / month', value: (plan: SubscriptionPlan) => plan.limits.monthlyRegistrations === null ? 'Custom' : plan.limits.monthlyRegistrations.toLocaleString() },
  { label: 'Event pages, forms and RSVPs', value: () => 'Included' },
  { label: 'QR code check-in', value: () => 'Included' },
  { label: 'Waitlist management', value: (plan: SubscriptionPlan) => plan.features.waitlists ? 'Included' : '—' },
  { label: 'Custom registration fields', value: (plan: SubscriptionPlan) => plan.features.customRegistrationFields ? 'Included' : '—' },
  { label: 'Attendee CSV exports', value: (plan: SubscriptionPlan) => plan.features.attendeeExports ? 'Included' : '—' },
];
