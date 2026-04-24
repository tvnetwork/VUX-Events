/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
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
  location: string;
  coverImageUrl: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  isApprovalRequired: boolean;
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
