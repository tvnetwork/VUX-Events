# VUX — Complete Product Feature Catalogue

**Kontyra · Product specification · Master feature inventory**

VUX is intended to become a comprehensive event-management platform for individuals, communities, businesses, educational institutions, agencies, and large organisations. This document is the working inventory for implementation tracking. Check an item only when the capability is implemented and verified; planned, partial, demo-only, or UI-only work remains unchecked. A checked item does not by itself imply production readiness or contractual availability.

**Status:** `[ ]` Not yet verified · `[x]` Implemented and code-reviewed
**Scope:** Product capabilities and proposed commercial entitlements. Checked items have code-level evidence and pass the project build; there is no dedicated end-to-end test suite, so checked items are not a production-readiness or contractual claim. Features with incomplete security or operational verification remain unchecked.

## 1. Event management

- [x] Create, edit, and delete events; publish/unpublish through event status controls
- [ ] Duplicate events
- [ ] Schedule publication and archive completed events
- [ ] Save and manage draft events
- [x] Titles, descriptions, cover images, and categories
- [ ] Banners, tags, time zones, and hybrid location workflows
- [x] Event dates, times, and physical or virtual locations
- [x] Event capacity limits
- [ ] Registration deadlines
- [x] Public and private event visibility
- [ ] Password-protected and invite-only access
- [ ] Recurring events and event calendars
- [x] Event status tracking

## 2. Event pages and website builder

- [x] Public event landing pages and shareable event links
- [ ] Custom event URLs
- [ ] Rich-text descriptions and image galleries
- [x] Speaker and sponsor profiles on event pages
- [ ] Schedules, FAQs, and venue details
- [ ] Google Maps integration
- [x] Social sharing and SEO metadata, including Open Graph previews
- [ ] Custom branding and themes; responsive mobile layouts
- [ ] Custom domains (eligible plans)
- [ ] Event-page analytics

## 3. Registration management

- [x] Online and free registration; configurable registration forms
- [x] Custom form fields with required/optional and selectable field types
- [ ] Multiple choice and consent field workflows
- [x] Registration confirmation and organiser approval workflows
- [ ] Manual and bulk attendee registration
- [x] Registration cancellation and attendee status management
- [ ] Registration deadlines
- [x] Capacity limits and registration status tracking
- [x] Attendee database and registration records
- [ ] CSV imports; attendee CSV export is available in the attendee manager
- [x] Duplicate-registration detection

## 4. RSVP management

- [ ] Send invitations; accept, decline, or mark undecided
- [ ] Guest confirmation and RSVP deadlines
- [ ] Guest lists, reminders, and invitation tracking
- [ ] Attendance confirmation and plus-one invitations
- [ ] Guest-count management and RSVP analytics

## 5. Waitlist management

- [ ] Automatic and manual waitlist registration
- [ ] Position tracking and capacity settings
- [ ] Automatic promotion when spaces become available
- [ ] Waitlist invitation emails, expiry, and acceptance deadlines
- [ ] Notifications, analytics, and conversion tracking

## 6. Ticketing and payments

- [ ] Free and paid tickets; multiple ticket categories
- [ ] Early-bird, VIP, standard, limited-quantity, and group tickets
- [ ] Ticket prices and sales deadlines
- [ ] Discount and promotional codes; complimentary tickets
- [ ] Ticket transfers, cancellations, and refunds
- [ ] Order management and payment confirmation
- [ ] Digital ticket generation and email delivery
- [ ] Purchase history, sales analytics, revenue reports, and reconciliation

## 7. QR code and event check-in

- [x] QR ticket codes and digital QR tickets
- [ ] QR scanning and manual check-in (implemented, but not marked complete until the check-in endpoint is access-controlled)
- [ ] Attendee/guest verification and race-safe duplicate check-in prevention
- [ ] Real-time attendance, timestamps, and check-in history
- [ ] Multiple check-in stations and staff accounts
- [ ] Offline check-in with later synchronisation
- [ ] Check-in analytics, attendance reports, and exports

## 8. Attendee management

- [x] Attendee records with registration and ticket details
- [x] Contact information and attendance status
- [x] Search and filter attendees by registration status
- [ ] Sorting and guest categorisation
- [ ] Bulk management and imports
- [x] CSV attendee export
- [x] Manual check-in and attendee status updates
- [ ] Attendee notes and privacy controls

## 9. Speakers, sponsors, and exhibitors

- [x] Speaker profiles, biographies, and photographs
- [ ] Speaker registration, schedules, and session assignments
- [x] Sponsor profiles, logos, categories, and event-page visibility
- [ ] Sponsor packages
- [ ] Exhibitor profiles, directories, and booth information
- [ ] Sponsor reporting

## 10. Event programme and scheduling

- [ ] Agendas and sessions with descriptions and schedules
- [ ] Multiple tracks, speaker assignments, workshops, and breaks
- [ ] Venue assignments and session capacity
- [ ] Session registration and schedule changes
- [ ] Agenda publication and downloadable programmes

## 11. Communication and notifications

- [x] Registration and ticket confirmation emails
- [ ] Invitations and RSVP reminders
- [x] Waitlist-promotion and event-cancellation notifications
- [x] Event announcement broadcasts
- [ ] Scheduled notifications
- [x] Organiser notifications for new registrations
- [ ] Custom email templates and notification preferences
- [ ] Optional SMS notifications integration

## 12. Event analytics and reporting

- [ ] Event totals and publication status
- [ ] Registrations, growth, ticket sales, and revenue
- [ ] Attendance, check-in, and no-show rates
- [ ] RSVP and waitlist conversion
- [ ] Ticket-category performance, registration trends, and popularity
- [ ] Traffic sources, page views, and registration conversion
- [ ] Geographic audience insights where available
- [ ] Comparative and custom reports; PDF and CSV exports

## 13. Organiser dashboard

- [x] Overview of events, upcoming/past events, and draft status
- [x] Registration and check-in summaries
- [ ] Ticket-sales summaries
- [ ] Recent activity and notification centre
- [x] Event-management quick actions
- [x] Subscription plan and registration-usage status
- [ ] Account settings and organisation switching

## 14. Organisation and team management

- [ ] Create organisations, profiles, logos, and workspaces
- [ ] Invite team members; manage teams and departments
- [ ] Role-based access control and permission management
- [ ] Event ownership and assignment
- [ ] Organisation-wide reporting, activity logs, billing, and settings
- [ ] Owner: complete organisation control
- [ ] Administrator: organisation administration
- [ ] Event Manager: event creation and management
- [ ] Finance Manager: payments and financial reports
- [ ] Check-in Staff: attendee verification
- [ ] Viewer: read-only access

## 15. Discovery and public event directory

- [x] Public event directory and upcoming-event browsing
- [x] Browse/search events by available event details and categories
- [ ] Search by location and date
- [ ] Featured, popular, and recommended events
- [ ] Organiser profiles and public event sharing
- [ ] Bookmark and mark events as interested
- [ ] Discover local events and register from discovery pages

## 16. User accounts and identity

- [x] User authentication and account sign-in
- [ ] Email verification and password recovery
- [x] Profile management and profile photographs
- [x] Account preferences and security settings
- [ ] Full session-security review
- [ ] Social login integrations (only when selected for implementation)
- [ ] Account deletion, organisation memberships, and subscription history

## 17. Subscription and billing management

- [x] Central definitions for Free, Starter, Professional, Business, and Enterprise plans
- [x] Monthly/annual plan comparison and paid-plan checkout for supported tiers
- [ ] Complete upgrades, downgrades, and cancellation lifecycle verification
- [x] Stripe webhook-based subscription status synchronisation
- [ ] Billing history, invoices, and receipts
- [ ] Expiry notifications and full failed-payment handling
- [ ] Grace-period and renewal lifecycle verification
- [x] Account-level registration usage tracking and server-side limits
- [ ] Complete enforcement of all plan entitlements and seat limits
- [x] Plan comparison UI; Business checkout requires a verified organisation owner
- [ ] Admin-controlled plan configuration

## 18. Integrations and developer features

- [ ] REST API, API authentication, and API keys
- [ ] Webhooks
- [ ] Event creation, registration, attendee, and ticket-verification APIs
- [ ] Payment gateway and email-service integrations
- [ ] Calendar, Google Maps, and analytics integrations
- [ ] Custom integrations and API-usage monitoring
- [ ] Developer documentation

## 19. Security and compliance

- [ ] Secure authentication, server-side authorisation, and session handling
- [ ] Encryption in transit and protection of personal information
- [ ] Audit logs and login activity
- [ ] Rate limiting, abuse prevention, spam protection, and registration validation
- [ ] Payment verification; backup and recovery
- [ ] Account-security notifications and privacy settings
- [ ] Data export, deletion requests, and consent management

## 20. VUX administration platform (Kontyra internal control centre)

- [ ] Admin dashboard: users, active users, organisations, events, and registrations
- [ ] Subscription statistics and revenue overview
- [ ] Plan/pricing, user, organisation, and event moderation management
- [ ] Subscription, payment, billing, and refund monitoring
- [ ] Usage monitoring and platform-wide analytics
- [ ] System announcements and platform notifications
- [ ] Support ticket management
- [ ] Audit logs and admin roles/permissions
- [ ] Platform configuration and feature availability controls
- [ ] Promotional codes and account suspension

## 21. Proposed subscription entitlements

The five tiers and prices below are the proposed commercial model. Entitlements must be enforced on the server, not merely hidden in the UI. Usage limits apply across the subscribing account/workspace, not separately per event. Business/Enterprise subscriptions should be owned by an organisation. Do not advertise a capability as available until it is implemented and tested.

| Capability / limit | Free | Starter | Professional | Business | Enterprise |
| --- | --- | --- | --- | --- | --- |
| Monthly price (proposed) | ₦0 | ₦4,900 | ₦14,900 | ₦39,900 | Custom |
| Annual price (proposed) | ₦0 | ₦49,000 | ₦149,000 | ₦399,000 | Custom |
| Active events | 2 | 10 | Unlimited | Unlimited | Unlimited |
| Monthly registrations | 100 | 500 | 2,500 | 10,000 | Custom |
| Team seats | 1 | 1 | Up to 5 | Up to 20 | Custom |
| Event management/pages/forms/RSVP | Basic | Full | Full | Full | Full/custom |
| Waitlists | — | Included | Included | Included | Included |
| Attendee CSV exports | — | Included | Included | Included | Included |
| Paid ticketing | — | — | Proposed | Proposed | Custom |
| Custom branding | VUX branding | Remove VUX branding | Proposed | Proposed | Custom |
| Organisation workspace | — | — | — | Proposed | Multiple proposed |
| Custom domain | — | — | — | Proposed | Custom |
| Advanced analytics | — | — | Proposed | Proposed | Advanced reporting proposed |
| API access | — | — | — | — | Proposed |
| Support | Community | Standard | Priority | Dedicated | Account management / SLA options |
| RSVP management | Yes | Yes | Yes | Yes | Yes |
| Waitlists | — | Yes | Yes | Yes | Yes |
| Ticketing | — | — | — | — | — |
| QR check-in | Basic | Standard | Advanced | Advanced | Advanced |
| Attendee management | Basic | Standard | Advanced | Advanced | Advanced |
| Speakers and sponsors | — | Basic | Basic | Basic | Basic |
| Event scheduling | Basic | Standard | Advanced | Advanced | Advanced |
| Communications | Basic | Standard | Advanced | Advanced | Advanced |
| Analytics | Basic | Standard | Advanced | Advanced | Advanced |
| Team management | — | — | — | — | — |
| Organisation workspace | — | — | — | — | — |
| Custom domain | — | — | — | — | — |
| API and webhooks | — | — | — | — | — |
| Dedicated support | — | — | — | — | — |

The allocation above is proposed, not a verified list of features already implemented in VUX. Reconcile it against shipped functionality and commercial decisions before using it as a public plan comparison.

- [ ] Confirm final pricing and billing cadence
- [x] Implement account-level registration usage measurement and server enforcement
- [ ] Verify payment, renewal, cancellation, grace-period, and expiry lifecycle end to end
- [ ] Implement billing history and invoice presentation; plan changes remain to be verified
- [ ] Implement organisation-owned subscriptions and seat enforcement
- [x] Configure plan definitions and registration limits centrally; other entitlements remain incomplete
- [ ] Verify each advertised feature before enabling it for a tier

## Product and commercial notes

- These prices and entitlement assignments are proposals, not proof that the corresponding features are operational.
- Annual billing is proposed at the cost of 10 monthly payments (two months free).
- VUX should not add a percentage-based platform commission to ticket sales; disclose third-party processor fees separately.
- Launch with the five-plan structure, but enable only entitlements that have passed implementation and testing. API access, custom domains, and advanced ticketing require particular care before being advertised.

## 22. Recommended development phases

- [ ] Subscription infrastructure: plan definitions, billing cycles, payment verification, subscription status, and renewals
- [ ] Entitlement engine: central feature permissions, account-level usage tracking, and server-enforced limits
- [ ] Customer billing dashboard: current plan, invoices, renewal date, upgrade, downgrade, and cancellation
- [ ] Organisation billing: Business workspaces, ownership, team seats, and organisation-level subscriptions
- [ ] Administration dashboard: manage plans, pricing, subscriptions, customers, payments, and usage
- [ ] Deliver the event, registration, attendee, communications, and event-operations capabilities in this catalogue
- [ ] Add developer APIs, webhooks, enterprise controls, and compliance workflows as their dependencies and support model are ready

## 23. Final product positioning

> **VUX**  
> **Events. People. Experiences.**  
> A complete event management platform for creating, managing, discovering, and attending events.  
> Built by Kontyra.
