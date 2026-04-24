# Security Specification - VUX Events

## Data Invariants
1. **User Identity**: Users can only create their own profile. The `uid` and `email` must match their Auth token.
2. **Event Ownership**: Only the `hostId` (creator) of an event can update or delete it.
3. **RSVP Integrity**:
    - RSVPs must belong to a valid event.
    - Users can only create RSVPs for themselves.
    - Status updates are restricted:
        - Guests can only change their status to 'declined'.
        - Hosts can change any guest's status to 'approved' or 'declined'.
4. **Immutability**: `createdAt`, `id`, `hostId`, `eventId`, and `userId` fields must never change after creation.
5. **Temporal Integrity**: `createdAt` and `updatedAt` must use `request.time`.

## The Dirty Dozen (Test Payloads)
1. **Identity Theft (User)**: Create a user document where `uid` != `request.auth.uid`.
2. **Email Hijack**: Update user profile to a different email.
3. **Shadow Field (User)**: Create user profile with extra field `isAdmin: true`.
4. **Host Impersonation**: Create an event with `hostId` of another user.
5. **Immutable Break (Event)**: Update an event's `hostId`.
6. **Value Poisoning**: Set event `title` to a 1MB string.
7. **Orphan RSVP**: Create an RSVP for a project ID that doesn't exist.
8. **Self-Approval**: Guest updates their own RSVP status from 'pending' to 'approved'.
9. **RSVP Scraping**: List all RSVPs in a collection without filtering by `userId` or being the host.
10. **Checked-In Forgery**: Guest updates their own `checkedIn` status to `true`.
11. **Timestamp Manipulation**: Set `createdAt` to a date in the past.
12. **ID Injection**: Create a document where the ID is 500 characters long.

## Security Audit Report (Initial)
| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
|------------|-------------------|--------------------|--------------------|
| users      | Blocked (isOwner) | N/A                | Blocked (size limit)|
| events     | Blocked (isValid) | Blocked (isValid)  | Blocked (size limit)|
| rsvps      | Blocked (isOwner) | Blocked (Rule logic)| Blocked (size limit)|
