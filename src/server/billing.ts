import express, { type Express, type Request, type Response, type Router } from 'express';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';
import { SUBSCRIPTION_PLANS, type PlanId } from '../lib/plans';
import { getEffectivePlan, isWithinLimit } from '../lib/entitlements';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('Stripe is not configured on the server.');
  return new Stripe(secretKey);
}

async function getIdentity(req: Request) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) throw Object.assign(new Error('Authentication required'), { status: 401 });
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    throw Object.assign(new Error('Invalid or expired authentication token'), { status: 401 });
  }
}

async function getProfile(db: Firestore, uid: string, email?: string) {
  const uidSnapshot = await db.collection('users').doc(uid).get();
  if (uidSnapshot.exists) return uidSnapshot.data() || {};
  if (email) {
    const emailSnapshot = await db.collection('users').doc(email.toLowerCase()).get();
    if (emailSnapshot.exists) return emailSnapshot.data() || {};
  }
  return {};
}

async function getOrganizationOwner(db: Firestore, uid: string, profile: Record<string, any>) {
  const organizationId = typeof profile.organizationId === 'string' ? profile.organizationId.trim() : '';
  if (!organizationId) return null;
  const [organizationSnapshot, memberSnapshot] = await Promise.all([
    db.collection('organizations').doc(organizationId).get(),
    db.collection('organizations').doc(organizationId).collection('members').doc(uid).get(),
  ]);
  const role = String(memberSnapshot.data()?.role || '').toLowerCase();
  const authorized = organizationSnapshot.data()?.ownerUid === uid || role === 'owner' || role === 'admin';
  return authorized ? organizationId : null;
}

async function getBillingOwner(db: Firestore, uid: string, email?: string, preferOrganization = false) {
  const profile = await getProfile(db, uid, email);
  const organizationId = await getOrganizationOwner(db, uid, profile);
  if (preferOrganization && !organizationId) {
    throw Object.assign(new Error('Business subscriptions are available to verified organisation owners and administrators.'), { status: 403 });
  }
  if (organizationId) {
    const organizationBilling = await db.collection('billing_accounts').doc(organizationId).get();
    if (preferOrganization || organizationBilling.exists) return organizationId;
  }
  return uid;
}

function getMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getPlanId(value: unknown): PlanId | null {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, value)
    ? value as PlanId
    : null;
}

function subscriptionFields(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata || {};
  const planId = getPlanId(metadata.planId);
  const status = subscription.status;
  return {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    ...(planId ? { planId } : {}),
    interval: metadata.interval === 'annual' ? 'annual' : 'monthly',
    status,
    currentPeriodEnd: subscription.items.data[0]?.current_period_end
      ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
      : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: new Date().toISOString(),
  };
}

async function persistSubscription(db: Firestore, ownerId: string, subscription: Stripe.Subscription) {
  const accountRef = db.collection('billing_accounts').doc(ownerId);
  const existingSnapshot = await accountRef.get();
  const existing = existingSnapshot.data() || {};
  const fields = subscriptionFields(subscription);
  const gracePeriodEndsAt = fields.status === 'past_due'
    ? existing.gracePeriodEndsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : null;
  await accountRef.set({ ...fields, ownerId, gracePeriodEndsAt }, { merge: true });
}

export function registerStripeWebhook(app: Express, db: Firestore) {
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers['stripe-signature'];
    if (!webhookSecret || typeof signature !== 'string') {
      return res.status(503).json({ error: 'Stripe webhook signing is not configured.' });
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch {
      return res.status(400).json({ error: 'Invalid Stripe webhook signature.' });
    }

    try {
      if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const ownerId = subscription.metadata.ownerId;
        if (ownerId) {
          await persistSubscription(db, ownerId, subscription);
        }
      } else if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        if (subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const ownerId = subscription.metadata.ownerId || session.metadata?.ownerId;
          if (ownerId) {
            await persistSubscription(db, ownerId, subscription);
          }
        }
      }
      return res.json({ received: true });
    } catch (error) {
      console.error('[Stripe webhook] Subscription sync failed:', error instanceof Error ? error.message : 'unknown error');
      return res.status(500).json({ error: 'Subscription sync failed.' });
    }
  });
}

export function registerBillingRoutes(router: Router, db: Firestore) {
  router.get('/billing/status', async (req: Request, res: Response) => {
    try {
      const identity = await getIdentity(req);
      const ownerId = await getBillingOwner(db, identity.uid, identity.email);
      const snapshot = await db.collection('billing_accounts').doc(ownerId).get();
      const record = snapshot.data() || {};
      const plan = getEffectivePlan(record);
      return res.json({
        planId: plan.id,
        status: record.status || 'free',
        interval: plan.id === 'free' ? null : record.interval || 'monthly',
        currentPeriodEnd: record.currentPeriodEnd || null,
        cancelAtPeriodEnd: record.cancelAtPeriodEnd === true,
        limits: plan.limits,
        features: plan.features,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({ error: error.message || 'Unable to load billing status.' });
    }
  });

  router.post('/billing/checkout', async (req: Request, res: Response) => {
    try {
      const identity = await getIdentity(req);
      const planId = getPlanId(req.body?.planId);
      const interval = req.body?.interval === 'annual' ? 'annual' : req.body?.interval === 'monthly' ? 'monthly' : null;
      if (!planId || !interval || !['starter', 'professional', 'business'].includes(planId)) {
        return res.status(400).json({ error: 'Choose an available paid plan and billing interval.' });
      }
      const ownerId = await getBillingOwner(db, identity.uid, identity.email, planId === 'business');
      const accountRef = db.collection('billing_accounts').doc(ownerId);
      const accountSnapshot = await accountRef.get();
      const account = accountSnapshot.data() || {};
      if (['active', 'trialing', 'past_due'].includes(account.status) && account.planId && account.planId !== 'free') {
        return res.status(409).json({ error: 'You already have a paid subscription. Manage it from billing settings.' });
      }

      const plan = SUBSCRIPTION_PLANS[planId];
      const amount = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
      if (!amount) return res.status(400).json({ error: 'This plan is not available for online checkout.' });

      const stripe = getStripe();
      let customerId = typeof account.stripeCustomerId === 'string' ? account.stripeCustomerId : undefined;
      const email = identity.email || (await admin.auth().getUser(identity.uid)).email || undefined;
      if (!customerId) {
        const customer = await stripe.customers.create({
          ...(email ? { email } : {}),
          metadata: { ownerId, createdBy: identity.uid },
        });
        customerId = customer.id;
        await accountRef.set({ ownerId, stripeCustomerId: customerId, createdAt: new Date().toISOString() }, { merge: true });
      }

      const requestOrigin = req.get('origin');
      const requestHost = req.get('host');
      const safeRequestOrigin = requestOrigin && requestHost && new URL(requestOrigin).host === requestHost ? requestOrigin : null;
      const origin = process.env.APP_URL || safeRequestOrigin || `${req.protocol}://${requestHost}`;
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded_page',
        mode: 'subscription',
        customer: customerId,
        redirect_on_completion: 'if_required',
        return_url: `${origin}/billing?checkout=complete&session_id={CHECKOUT_SESSION_ID}`,
        line_items: [{
          price_data: {
            currency: 'ngn',
            product_data: { name: `VUX ${plan.name}`, description: `VUX ${plan.name} subscription (${interval})` },
            unit_amount: amount * 100,
            recurring: { interval: interval === 'annual' ? 'year' : 'month' },
          },
          quantity: 1,
        }],
        client_reference_id: ownerId,
        metadata: { ownerId, planId, interval, createdBy: identity.uid },
        subscription_data: { metadata: { ownerId, planId, interval, createdBy: identity.uid } },
      }, {
        idempotencyKey: `vux-${ownerId}-${planId}-${interval}-${Math.floor(Date.now() / 60_000)}`,
      });

      if (!session.client_secret) return res.status(502).json({ error: 'Stripe did not return an embedded checkout session.' });
      return res.json({ clientSecret: session.client_secret });
    } catch (error: any) {
      console.error('[Billing checkout] Could not create session:', error instanceof Error ? error.message : 'unknown error');
      return res.status(error.status || 500).json({ error: error.message || 'Unable to start checkout.' });
    }
  });

  router.post('/billing/portal', async (req: Request, res: Response) => {
    try {
      const identity = await getIdentity(req);
      const ownerId = await getBillingOwner(db, identity.uid, identity.email);
      const account = (await db.collection('billing_accounts').doc(ownerId).get()).data() || {};
      if (!account.stripeCustomerId) return res.status(404).json({ error: 'No Stripe customer is linked to this account yet.' });
      const returnUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const session = await getStripe().billingPortal.sessions.create({ customer: account.stripeCustomerId, return_url: `${returnUrl}/billing` });
      return res.json({ url: session.url });
    } catch (error: any) {
      return res.status(error.status || 500).json({ error: error.message || 'Unable to open billing settings.' });
    }
  });
}

export function registerEventCreationRoute(router: Router, db: Firestore) {
  router.post('/events', async (req: Request, res: Response) => {
    try {
      const identity = await getIdentity(req);
      const { title, date, time, location, description, category, ...details } = req.body || {};
      if (typeof title !== 'string' || !title.trim() || title.trim().length > 180) {
        return res.status(400).json({ error: 'An event title of 1–180 characters is required.' });
      }

      const ownerId = await getBillingOwner(db, identity.uid, identity.email);
      const account = (await db.collection('billing_accounts').doc(ownerId).get()).data() || {};
      const plan = getEffectivePlan(account);
      const events = ownerId === identity.uid
        ? await db.collection('events').where('hostId', '==', identity.uid).get()
        : await db.collection('events').where('organizationId', '==', ownerId).get();
      const activeCount = events.docs.filter((doc) => !['completed', 'cancelled'].includes(String(doc.data().status || 'published'))).length;
      if (!isWithinLimit(plan.limits.activeEvents, activeCount)) {
        return res.status(403).json({ error: `Your ${plan.name} plan allows ${plan.limits.activeEvents} active events. Upgrade to create another event.` });
      }

      const eventRef = db.collection('events').doc();
      const now = new Date().toISOString();
      const event = {
        ...details,
        id: eventRef.id,
        title: title.trim(),
        date: typeof date === 'string' ? date.slice(0, 100) : '',
        time: typeof time === 'string' ? time.slice(0, 60) : '',
        location: typeof location === 'string' ? location.slice(0, 300) : '',
        description: typeof description === 'string' ? description.slice(0, 10000) : '',
        category: typeof category === 'string' ? category.slice(0, 100) : 'Other',
        hostId: identity.uid,
        hostName: typeof identity.name === 'string' ? identity.name : 'VUX Host',
        organizationId: ownerId,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      };
      await eventRef.create(event);
      return res.status(201).json({ event });
    } catch (error: any) {
      return res.status(error.status || 500).json({ error: error.message || 'Unable to create event.' });
    }
  });
}

export function getRegistrationUsageRef(db: Firestore, ownerId: string, date = new Date()) {
  return db.collection('billing_accounts').doc(ownerId).collection('usage').doc(`registrations-${getMonthKey(date)}`);
}

export function getMonthKeyForUsage(date = new Date()) {
  return getMonthKey(date);
}

export function getRegistrationPlanId(record: Record<string, any> | undefined) {
  return getEffectivePlan(record);
}

export function canRegisterUnderPlan(planId: PlanId, currentCount: number) {
  return isWithinLimit(SUBSCRIPTION_PLANS[planId].limits.monthlyRegistrations, currentCount);
}
