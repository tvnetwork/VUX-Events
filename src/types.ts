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

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  discord?: string;
  website?: string;
  email?: string;
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
  socialLinks?: SocialLinks;
  onboardingCompleted?: boolean;
  integrations?: {
    googleCalendar?: boolean;
    discord?: boolean;
    spotify?: boolean;
  };
  security?: {
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    backupCodes?: string[];
  };
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

export interface Sponsor {
  name: string;
  logoUrl?: string;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Community';
  websiteUrl?: string;
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photoUrl?: string;
  twitter?: string;
  linkedin?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  isActive: boolean;
  resultsVisible: boolean;
}

export interface Contestant {
  id: string;
  name: string;
  role?: string;
  photoUrl?: string;
  votes: number;
  bio?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  eventIds: string[];
  coverImageUrl?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  hostId: string;
  coHostIds?: string[];
  hostName?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  category: string;
  visibility: 'public' | 'private';
  password?: string;
  coverImageUrl: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  isApprovalRequired: boolean;
  isPrivate?: boolean;
  hideParticipants?: boolean;
  registrationFields?: { label: string; type: 'text' | 'email' | 'longtext' | 'select' | 'multichoice' | 'checkbox' | 'phone'; required: boolean; options?: string[] }[];
  capacity?: number;
  ticketTypes?: TicketType[];
  tags?: string[];
  socialLinks?: SocialLinks;
  sponsors?: Sponsor[];
  speakers?: Speaker[];
  polls?: Poll[];
  contestants?: Contestant[];
  collectionId?: string;
  createdAt: string;
  updatedAt: string;
  surveySent?: boolean;
}

export interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  userPhotoURL?: string;
  status: 'pending' | 'approved' | 'declined' | 'waitlist';
  customFields?: Record<string, string>;
  checkedIn?: boolean;
  ticketType?: string;
  shareProfile?: boolean;
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
