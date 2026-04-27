/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';

export interface SiteConfig {
  title: string;
  tagline: string;
  contactEmail: string;
  supportLink: string;
  categories: string[];
  announcement: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  branding: {
    primaryColor: string;
    logoUrl?: string;
  };
}

const DEFAULT_CONFIG: SiteConfig = {
  title: 'VUX Events',
  tagline: 'Modern events for modern communities.',
  contactEmail: 'vuxevents@gmail.com',
  supportLink: '/help',
  categories: ['Conference', 'Workshop', 'Meetup', 'Social', 'Webinar', 'Other'],
  announcement: {
    enabled: false,
    text: 'Platform update scheduled for midnight.',
  },
  branding: {
    primaryColor: '#6366f1',
  }
};

export const SiteConfigService = {
  async getConfig(): Promise<SiteConfig> {
    try {
      const configDoc = await getDoc(doc(db, 'settings', 'global'));
      if (configDoc.exists()) {
        return { ...DEFAULT_CONFIG, ...configDoc.data() } as SiteConfig;
      }
      return DEFAULT_CONFIG;
    } catch (e) {
      console.error('Failed to fetch site configuration:', e);
      return DEFAULT_CONFIG;
    }
  },

  async updateConfig(config: Partial<SiteConfig>): Promise<void> {
    try {
      await setDoc(doc(db, 'settings', 'global'), config, { merge: true });
    } catch (e) {
      console.error('Failed to update site configuration:', e);
      handleFirestoreError(e, 'write', 'settings/global');
    }
  }
};
