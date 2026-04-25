/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type PulseType = 'REGISTRATION' | 'RSVP' | 'CANCEL_RSVP' | 'EVENT_CREATED' | 'EVENT_UPDATED' | 'PROFILE_UPDATED' | 'LOGIN';

export const PulseService = {
  async sendPulse(type: PulseType, message: string, userId: string, metadata?: any) {
    try {
      await addDoc(collection(db, 'system_pulses'), {
        type,
        message,
        userId,
        metadata: metadata || {},
        timestamp: serverTimestamp()
      });
      console.log(`[PULSE] ${type}: ${message}`);
    } catch (e) {
      // Fail silently to not interrupt user flow, but log to console
      console.warn('System Pulse delivery failed:', e);
    }
  }
};
