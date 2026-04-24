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
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { UserProfile, Passkey } from './types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPasskey: (email: string, authenticateWithPasskey: any, credential: any) => Promise<void>;
  addPasskey: (passkey: Passkey) => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const sendVerificationCode = async (email: string) => {
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Server returned invalid response (${response.status})`);
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }
  };

  const verifyCode = async (email: string, code: string) => {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Server returned invalid response (${response.status})`);
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
      setUser(user);
      if (user) {
        // Sync profile - use email as ID if available for easier lookup
        const docId = user.email || user.uid;
        const profileRef = doc(db, 'users', docId);
        const profileSnap = await getDoc(profileRef);
        
        if (!profileSnap.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || (user.uid.includes('@') ? user.uid : ''),
            displayName: user.displayName || 'Guest',
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.uid}&backgroundColor=c084fc`,
            createdAt: new Date().toISOString(),
          };
          await setDoc(profileRef, {
            ...newProfile,
            createdAt: serverTimestamp()
          });
          setProfile(newProfile);
        } else {
          setProfile(profileSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const signInWithPasskey = async (email: string, authenticateWithPasskey: any, credential: any) => {
    try {
      // 1. Authenticate with passkey via server to get custom token
      const token = await authenticateWithPasskey(email, credential);
      
      // 2. Sign in with the custom token
      if (token) {
        await signInWithCustomToken(auth, token);
      }
    } catch (err: any) {
      console.error('Passkey Sign-In failed:', err);
      throw err;
    }
  };

  const addPasskey = async (passkey: Passkey) => {
    if (!user) throw new Error('Must be logged in to add a passkey.');
    const docId = user.email || user.uid;
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

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signInWithGoogle, 
      signInWithPasskey, 
      addPasskey, 
      sendVerificationCode, 
      verifyCode,
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
