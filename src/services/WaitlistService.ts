import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Waitlist, WaitlistEntry } from '../types';

export class WaitlistService {
  /**
   * Normalize a title or custom string into a URL-friendly slug
   */
  static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }

  /**
   * Check if a slug already exists
   */
  static async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const q = query(collection(db, 'waitlists'), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return false;
    if (excludeId) {
      return snap.docs.some(d => d.id !== excludeId);
    }
    return true;
  }

  /**
   * Create a new waitlist
   */
  static async createWaitlist(
    data: Omit<Waitlist, 'id' | 'createdAt' | 'totalSubscribers' | 'creatorId' | 'creatorEmail' | 'creatorName'>,
    idToken?: string
  ): Promise<Waitlist> {
    const user = auth.currentUser;

    // 1. Try server API route if idToken is provided
    if (idToken) {
      try {
        const response = await fetch('/api/waitlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          return result as Waitlist;
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn('[WaitlistService] API create failed, falling back to direct Firestore:', errData);
        }
      } catch (networkErr) {
        console.warn('[WaitlistService] API network error, falling back to direct Firestore:', networkErr);
      }
    }

    // 2. Direct Firestore fallback (authenticated client write)
    if (!user) {
      throw new Error('Authentication required to create a waitlist');
    }

    let finalSlug = this.slugify(data.slug || data.title);
    if (!finalSlug) finalSlug = `waitlist-${Math.random().toString(36).substring(2, 7)}`;

    const taken = await this.isSlugTaken(finalSlug);
    if (taken) {
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const waitlistsRef = collection(db, 'waitlists');
    const newDoc = doc(waitlistsRef);

    const newWaitlist: Waitlist = {
      ...data,
      id: newDoc.id,
      slug: finalSlug,
      creatorId: user.uid,
      creatorName: user.displayName || 'Organizer',
      creatorEmail: user.email || '',
      organizationId: data.organizationId || user.uid,
      totalSubscribers: 0,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Remove any undefined values to satisfy Firestore serialization requirements
    const sanitizedWaitlist = Object.fromEntries(
      Object.entries(newWaitlist).filter(([_, v]) => v !== undefined)
    ) as Waitlist;

    await setDoc(newDoc, sanitizedWaitlist);
    return sanitizedWaitlist;
  }

  /**
   * Fetch waitlist by slug or document ID
   */
  static async getWaitlistBySlugOrId(identifier: string): Promise<Waitlist | null> {
    // First try by ID
    const directDoc = await getDoc(doc(db, 'waitlists', identifier));
    if (directDoc.exists()) {
      return { id: directDoc.id, ...directDoc.data() } as Waitlist;
    }

    // Try query by slug
    const q = query(collection(db, 'waitlists'), where('slug', '==', identifier));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as Waitlist;
    }

    return null;
  }

  /**
   * Get all waitlists created by a user
   */
  static async getWaitlistsByCreator(creatorId: string): Promise<Waitlist[]> {
    const q = query(
      collection(db, 'waitlists'), 
      where('creatorId', '==', creatorId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Waitlist));
    // Sort descending by creation date
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Join a waitlist with atomic position assignment and referral tracking
   */
  static async joinWaitlist(
    waitlistId: string,
    payload: {
      email: string;
      name?: string;
      userId?: string;
      referredBy?: string;
      answers?: Record<string, any>;
    }
  ): Promise<{ entry: WaitlistEntry; isNew: boolean }> {
    const cleanEmail = payload.email.trim().toLowerCase();
    const entriesColRef = collection(db, 'waitlists', waitlistId, 'entries');

    // 1. Check if user already joined this waitlist by document ID (avoids list permission denials)
    const entryDocId = cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
    const existingDocRef = doc(entriesColRef, entryDocId);

    try {
      const existingDocSnap = await getDoc(existingDocRef);
      if (existingDocSnap.exists()) {
        const existingEntry = { id: existingDocSnap.id, ...existingDocSnap.data() } as WaitlistEntry;
        return { entry: existingEntry, isNew: false };
      }
    } catch (e) {
      console.warn('[WaitlistService] Direct entry lookup bypassed:', e);
    }

    // 2. Fallback query check if list permissions are granted
    try {
      const existingQ = query(entriesColRef, where('email', '==', cleanEmail));
      const existingSnap = await getDocs(existingQ);
      if (!existingSnap.empty) {
        const existingEntry = { id: existingSnap.docs[0].id, ...existingSnap.docs[0].data() } as WaitlistEntry;
        return { entry: existingEntry, isNew: false };
      }
    } catch {
      // Ignore list permission error for unauthenticated visitors
    }

    const waitlistRef = doc(db, 'waitlists', waitlistId);
    const newEntryRef = existingDocRef; // use deterministic ref

    // Unique referral code for this subscriber
    const referralCode = Math.random().toString(36).substring(2, 9).toUpperCase();
    let assignedPosition = 1;

    await runTransaction(db, async (transaction) => {
      const wDoc = await transaction.get(waitlistRef);
      if (!wDoc.exists()) {
        throw new Error('Waitlist not found');
      }

      const existingSubscribers = wDoc.data().totalSubscribers || 0;
      assignedPosition = existingSubscribers + 1;

      // Update waitlist count (matches firestore.rules public increment policy)
      transaction.update(waitlistRef, {
        totalSubscribers: assignedPosition,
        updatedAt: new Date().toISOString()
      });

      const entryData: WaitlistEntry = {
        id: newEntryRef.id,
        waitlistId,
        email: cleanEmail,
        name: payload.name?.trim() || '',
        userId: payload.userId || '',
        position: assignedPosition,
        referralCode,
        referredBy: payload.referredBy || '',
        referralCount: 0,
        answers: payload.answers || {},
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      transaction.set(newEntryRef, entryData);
    });

    // 3. Process referral count asynchronously (non-blocking for visitor join)
    if (payload.referredBy) {
      try {
        const referrerQ = query(entriesColRef, where('referralCode', '==', payload.referredBy.toUpperCase()));
        const refSnap = await getDocs(referrerQ);
        if (!refSnap.empty) {
          const referrerDocRef = doc(entriesColRef, refSnap.docs[0].id);
          const currentCount = (refSnap.docs[0].data().referralCount || 0) + 1;
          await updateDoc(referrerDocRef, { referralCount: currentCount });
        }
      } catch (refErr) {
        console.warn('[WaitlistService] Non-critical referral counter increment failed:', refErr);
      }
    }

    const createdDoc = await getDoc(newEntryRef);
    return {
      entry: { id: createdDoc.id, ...createdDoc.data() } as WaitlistEntry,
      isNew: true
    };
  }

  /**
   * Get all entries for a waitlist (ordered by position)
   */
  static async getEntries(waitlistId: string): Promise<WaitlistEntry[]> {
    const q = query(
      collection(db, 'waitlists', waitlistId, 'entries'),
      orderBy('position', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as WaitlistEntry));
  }

  /**
   * Update waitlist details
   */
  static async updateWaitlist(waitlistId: string, updates: Partial<Waitlist>): Promise<void> {
    const waitlistRef = doc(db, 'waitlists', waitlistId);
    await updateDoc(waitlistRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Update subscriber status (e.g. invite or approve)
   */
  static async updateEntryStatus(
    waitlistId: string, 
    entryId: string, 
    status: WaitlistEntry['status']
  ): Promise<void> {
    const entryRef = doc(db, 'waitlists', waitlistId, 'entries', entryId);
    await updateDoc(entryRef, { status });
  }

  /**
   * Delete waitlist
   */
  static async deleteWaitlist(waitlistId: string): Promise<void> {
    await deleteDoc(doc(db, 'waitlists', waitlistId));
  }

  /**
   * Export entries to CSV
   */
  static exportToCSV(waitlist: Waitlist, entries: WaitlistEntry[]): void {
    if (entries.length === 0) {
      alert('No subscribers to export.');
      return;
    }

    const headers = ['Position', 'Name', 'Email', 'Referrals', 'Status', 'Date Joined'];
    const rows = entries.map(e => [
      e.position,
      `"${(e.name || '').replace(/"/g, '""')}"`,
      e.email,
      e.referralCount,
      e.status,
      new Date(e.createdAt).toLocaleString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${this.slugify(waitlist.title)}-subscribers.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
