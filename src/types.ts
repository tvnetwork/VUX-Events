/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Passkey {
  credentialId: string;
  publicKey: string;
  name: string;
  counter: number;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  phoneNumber?: string;
  dob?: string;
  isVerified?: boolean;
  createdAt: string;
  passkeys?: Passkey[];
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    publicProfile: boolean;
    calendarSync: boolean;
    theme: 'dark' | 'light' | 'system';
  };
  onboardingCompleted?: boolean;
  connections?: {
    googleCalendar?: {
      connected: boolean;
      email: string;
      lastSync?: string;
    };
  };
}

export interface TicketType {
  name: string;
  price: number;
  capacity?: number;
}

export interface Event {
  id: string;
  hostId: string;
  hostName?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  visibility: 'public' | 'private';
  coverImageUrl: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  isApprovalRequired: boolean;
  registrationFields?: { label: string; type: 'text' | 'email' | 'longtext'; required: boolean }[];
  capacity?: number;
  ticketTypes?: TicketType[];
  createdAt: string;
  updatedAt: string;
}

export interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  userPhotoURL?: string;
  status: 'pending' | 'approved' | 'declined';
  customFields?: Record<string, string>;
  checkedIn?: boolean;
  ticketType?: string;
  createdAt: string;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}
