/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithCustomToken,
  updateProfile
} from 'firebase/auth';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile, Passkey } from './types';
import { PulseService } from './services/PulseService';
import { getAvatarUrl } from './lib/utils';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPasskey: (email?: string) => Promise<void>;
  registerPasskey: () => Promise<void>;
  addPasskey: (passkey: Passkey) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  verifyMFACode: (code: string) => Promise<boolean>;
  mfaVerified: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MFA_SESSION_KEY = 'vux_mfa_verified';

const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaVerified, setMfaVerified] = useState(() => {
    return sessionStorage.getItem(MFA_SESSION_KEY) === 'true';
  });

  const verifyMFACodeAsync = async (code: string) => {
    if (!profile?.security?.twoFactorSecret) return false;
    
    try {
      const result = await totp.verify(code, {
        secret: profile.security.twoFactorSecret
      });
      
      if (result.valid) {
        setMfaVerified(true);
        sessionStorage.setItem(MFA_SESSION_KEY, 'true');
        return true;
      }
    } catch (e) {
      console.error('MFA Verification error:', e);
    }
    return false;
  };

  const sendVerificationCode = async (email: string) => {
    let response;
    try {
      response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (e: any) {
      console.error('Fetch REJECTED:', {
        message: e.message,
        name: e.name,
        stack: e.stack,
        url: '/api/auth/send-otp'
      });
      throw new Error(`Connection failed: ${e.message || 'The authentication server could not be reached.'}`);
    }
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Server returned an invalid response. Please try again.');
      }
    } else {
      let text;
      try {
        text = await response.text();
      } catch (e) {
        text = 'Unknown error';
      }
      console.error('Non-JSON response:', text);
      throw new Error(`Server error (${response.status}): ${text.substring(0, 50)}...`);
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }
  };

  const verifyCode = async (email: string, code: string) => {
    let response;
    try {
      response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
    } catch (e: any) {
      console.error('Verify Fetch REJECTED:', {
        message: e.message,
        name: e.name,
        stack: e.stack,
        url: '/api/auth/verify-otp'
      });
      throw new Error(`Verification connection failed: ${e.message || 'The verification server could not be reached.'}`);
    }
    
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Server returned an invalid verification response. Please try again.');
      }
    } else {
      const text = await response.text();
      console.error('Non-JSON verification response:', text);
      throw new Error(`Verification error (${response.status}). Please try again.`);
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || `Verification failed (${response.status})`);
    }
    
    if (data.token) {
      await signInWithCustomToken(auth, data.token);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          // 1. Resolve canonical email across Firebase user, token claims, and session storage
          let resolvedEmail = user.email || null;
          if (!resolvedEmail) {
            const cachedEmail = sessionStorage.getItem('kontyra_sso_email');
            if (cachedEmail) resolvedEmail = cachedEmail;
          }
          if (!resolvedEmail) {
            try {
              const idTokenResult = await user.getIdTokenResult();
              resolvedEmail = (idTokenResult.claims.email as string) || (idTokenResult.claims.userEmail as string) || null;
            } catch (e) {
              console.warn('Could not fetch ID token claims:', e);
            }
          }

          // 2. Locate existing profile document
          let existingProfile: UserProfile | null = null;
          let profileRef = null;

          // Priority A: Try by resolved email
          if (resolvedEmail) {
            const emailRef = doc(db, 'users', resolvedEmail);
            const emailSnap = await getDoc(emailRef);
            if (emailSnap.exists()) {
              existingProfile = emailSnap.data() as UserProfile;
              profileRef = emailRef;
            }
          }

          // Priority B: Try by user.uid
          if (!existingProfile) {
            const uidRef = doc(db, 'users', user.uid);
            const uidSnap = await getDoc(uidRef);
            if (uidSnap.exists()) {
              const data = uidSnap.data() as any;
              if (data.linkedEmail) {
                const linkedRef = doc(db, 'users', data.linkedEmail);
                const linkedSnap = await getDoc(linkedRef);
                if (linkedSnap.exists()) {
                  existingProfile = linkedSnap.data() as UserProfile;
                  profileRef = linkedRef;
                } else {
                  existingProfile = data as UserProfile;
                  profileRef = uidRef;
                }
              } else {
                existingProfile = data as UserProfile;
                profileRef = uidRef;
              }
            }
          }

          // Priority C: Query by email in users collection
          if (!existingProfile && resolvedEmail) {
            try {
              const q = query(collection(db, 'users'), where('email', '==', resolvedEmail));
              const querySnap = await getDocs(q);
              if (!querySnap.empty) {
                existingProfile = querySnap.docs[0].data() as UserProfile;
                profileRef = querySnap.docs[0].ref;
              }
            } catch (e) {
              console.warn('User query by email failed:', e);
            }
          }

          // 3. Handle existing profile vs new registration
          if (existingProfile && profileRef) {
            // Link Kontyra UID and update activity
            const updates: any = {
              lastLoginAt: new Date().toISOString()
            };
            if (user.uid !== existingProfile.uid) {
              updates.kontyraUid = user.uid;
              updates.linkedAccounts = arrayUnion('kontyra');
              
              // Maintain pointer at users/{user.uid} so any direct UID queries resolve seamlessly
              setDoc(doc(db, 'users', user.uid), {
                ...existingProfile,
                linkedEmail: existingProfile.email || resolvedEmail,
                kontyraUid: user.uid,
                isLinkedPointer: true,
                updatedAt: new Date().toISOString()
              }, { merge: true }).catch(() => {});
            }

            updateDoc(profileRef, updates).catch(() => {});
            setProfile(existingProfile);

            // Send login notification (Security)
            fetch('/api/email/login-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: existingProfile.email, 
                displayName: existingProfile.displayName,
                timestamp: new Date().toLocaleString()
              }),
            }).catch(e => console.error('Failed to send login notification:', e));

            PulseService.sendPulse('LOGIN', `User logged in: ${existingProfile.displayName}`, user.uid);
          } else {
            // New profile creation
            const targetDocId = resolvedEmail || user.uid;
            const newProfileRef = doc(db, 'users', targetDocId);
            const newProfile: UserProfile = {
              uid: user.uid,
              email: resolvedEmail || (user.uid.includes('@') ? user.uid : ''),
              displayName: user.displayName || 'Guest',
              photoURL: user.photoURL || getAvatarUrl(user.uid),
              createdAt: new Date().toISOString(),
              onboardingCompleted: false,
            };
            await setDoc(newProfileRef, {
              ...newProfile,
              createdAt: serverTimestamp()
            });
            setProfile(newProfile);

            // Send welcome email
            fetch('/api/email/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: newProfile.email, 
                displayName: newProfile.displayName 
              }),
            }).catch(e => console.error('Failed to send welcome email:', e));

            PulseService.sendPulse('REGISTRATION', `New user registered: ${newProfile.displayName}`, user.uid, { email: newProfile.email });
          }
        } else {
          setProfile(null);
          setMfaVerified(false);
        }
      } catch (error) {
        console.error('Error syncing user profile:', error);
        // Still allow the app to load even if profile sync fails
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Add custom parameters to force account selection if needed
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      // Handle specific protocol or popup errors
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked. Please enable popups for this site.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in window was closed before completion.');
      } else if (error.message && error.message.includes('ERR_QUIC_PROTOCOL_ERROR')) {
        throw new Error('Network protocol error (QUIC). Please try opening the app in a new browser tab or disabling browser extensions.');
      }
      
      throw new Error(error.message || 'Authentication failed. Please try opening the application in a new tab.');
    }
  };

  const signInWithPasskey = async (email?: string) => {
    try {
      // 1. Get auth options from server
      const emailQuery = email ? `?email=${encodeURIComponent(email)}` : '';
      const resp = await fetch(`/api/auth/login-options${emailQuery}`);
      const options = await resp.json();
      if (options.error) throw new Error(options.error);

      // 2. Start browser authentication
      const { startAuthentication } = await import('@simplewebauthn/browser');
      const assertionResponse = await startAuthentication(options);

      // 3. Verify on server
      const verifyResp = await fetch('/api/auth/verify-authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || '',
          body: assertionResponse
        }),
      });

      const verification = await verifyResp.json();
      if (verification.verified && verification.token) {
        await signInWithCustomToken(auth, verification.token);
      } else {
        throw new Error(verification.error || 'Verification failed on server');
      }
    } catch (err: any) {
      console.error('Passkey Sign-In failed:', err);
      if (err.name === 'NotAllowedError') {
        throw new Error('Passkey authentication was cancelled or timed out.');
      }
      throw err;
    }
  };

  const registerPasskey = async () => {
    if (!user || !profile) throw new Error('Must be logged in to register a passkey.');
    try {
      // 1. Get registration options from server
      const resp = await fetch(`/api/auth/register-options?email=${encodeURIComponent(profile.email)}&displayName=${encodeURIComponent(profile.displayName)}`);
      const options = await resp.json();
      if (options.error) throw new Error(options.error);

      // 2. Start browser registration
      const { startRegistration } = await import('@simplewebauthn/browser');
      const attestationResponse = await startRegistration(options);

      // 3. Verify on server
      const verifyResp = await fetch('/api/auth/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          body: attestationResponse
        }),
      });

      const verification = await verifyResp.json();
      if (verification.verified && verification.registrationInfo) {
        const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;
        
        // Convert to base64 for storage without Buffer
        const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(Object.values(credentialPublicKey))));
        
        const passkey: Passkey = {
          credentialId: credentialID,
          publicKey: publicKeyBase64,
          counter: counter || 0,
          name: navigator.userAgent.includes('Mac') ? 'Mac/iPhone Passkey' : 'Device Passkey',
          createdAt: new Date().toISOString()
        };
        
        await addPasskey(passkey);
      } else {
        throw new Error(verification.error || 'Verification failed on server');
      }
    } catch (err: any) {
      console.error('Passkey Registration failed:', err);
      if (err.name === 'NotAllowedError') {
        throw new Error('Passkey registration was cancelled or timed out.');
      }
      throw err;
    }
  };

  const addPasskey = async (passkey: Passkey) => {
    if (!user) throw new Error('Must be logged in to add a passkey.');
    const docId = profile?.email || user.email || user.uid;
    const userRef = doc(db, 'users', docId);
    await updateDoc(userRef, {
      passkeys: arrayUnion(passkey)
    });
    
    // Update local profile state
    setProfile(prev => prev ? {
      ...prev,
      passkeys: [...(prev.passkeys || []), passkey]
    } : null);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Must be logged in to update profile.');
    const docId = profile?.email || user.email || user.uid;
    const userRef = doc(db, 'users', docId);
    
    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(userRef, updatePayload);
    
    // Update local state
    setProfile(prev => prev ? { ...prev, ...updatePayload } : null);
  };

  const logout = async () => {
    await signOut(auth);
    setMfaVerified(false);
    sessionStorage.removeItem(MFA_SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signInWithGoogle, 
      signInWithPasskey, 
      registerPasskey,
      addPasskey, 
      updateProfileData,
      sendVerificationCode, 
      verifyCode,
      verifyMFACode: verifyMFACodeAsync,
      mfaVerified,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
