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
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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
    data: Omit<Waitlist, 'id' | 'createdAt' | 'totalSubscribers'>
  ): Promise<Waitlist> {
    const waitlistsRef = collection(db, 'waitlists');
    const newDoc = doc(waitlistsRef);

    let finalSlug = this.slugify(data.slug || data.title);
    if (!finalSlug) finalSlug = `waitlist-${Math.random().toString(36).substring(2, 7)}`;

    // If slug is taken, append random hash
    const taken = await this.isSlugTaken(finalSlug);
    if (taken) {
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const newWaitlist: Waitlist = {
      ...data,
      id: newDoc.id,
      slug: finalSlug,
      totalSubscribers: 0,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(newDoc, newWaitlist);
    return newWaitlist;
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

    // Check if user already joined this waitlist
    const existingQ = query(
      collection(db, 'waitlists', waitlistId, 'entries'),
      where('email', '==', cleanEmail)
    );
    const existingSnap = await getDocs(existingQ);

    if (!existingSnap.empty) {
      const existingEntry = { id: existingSnap.docs[0].id, ...existingSnap.docs[0].data() } as WaitlistEntry;
      return { entry: existingEntry, isNew: false };
    }

    const waitlistRef = doc(db, 'waitlists', waitlistId);
    const entriesColRef = collection(db, 'waitlists', waitlistId, 'entries');
    const newEntryRef = doc(entriesColRef);

    // Unique referral code for this subscriber
    const referralCode = Math.random().toString(36).substring(2, 9).toUpperCase();

    let assignedPosition = 1;

    await runTransaction(db, async (transaction) => {
      const wDoc = await transaction.get(waitlistRef);
      if (!wDoc.exists()) {
        throw new Error('Waitlist not found');
      }

      const currentSubscribers = (wDoc.data().totalSubscribers || 0) + 1;
      assignedPosition = currentSubscribers;

      transaction.update(waitlistRef, {
        totalSubscribers: currentSubscribers,
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

      // If referred by someone, increment that person's referral count
      if (payload.referredBy) {
        const referrerQ = query(entriesColRef, where('referralCode', '==', payload.referredBy.toUpperCase()));
        const refSnap = await getDocs(referrerQ);
        if (!refSnap.empty) {
          const referrerDocRef = doc(entriesColRef, refSnap.docs[0].id);
          const currentCount = (refSnap.docs[0].data().referralCount || 0) + 1;
          transaction.update(referrerDocRef, {
            referralCount: currentCount
          });
        }
      }
    });

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
