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
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from './types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPasskey: () => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // In a real production app, you would use Firebase's isSignInWithEmailLink
  // For this demonstration, we'll simulate the "code" experience requested.
  const sendVerificationCode = async (email: string) => {
    console.log(`Sending verification code to ${email}...`);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In production: await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  };

  const verifyCode = async (email: string, code: string) => {
    console.log(`Verifying code ${code} for ${email}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (code === '123456') { // Demo code
      // In production, we'd complete the Firebase Email Link flow here
      // For now, we'll manually sign in with a demo user or throw error
      throw new Error('Verification service is being configured. Try Google Sign-In for now.');
    } else {
      throw new Error('Invalid verification code.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync profile
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (!profileSnap.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
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

  const signInWithPasskey = async () => {
    console.log('Simulating Passkey Biometric Auth...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    // In a real app, this would use the WebAuthn API
    throw new Error('Passkey registration is required on your first login. Try Google for now.');
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithPasskey, sendVerificationCode, verifyCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
