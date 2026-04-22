import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const PUBLIC_UID = 'public_user_v1';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const activeUser = firebaseUser || { 
        uid: PUBLIC_UID, 
        displayName: 'Guest User', 
        email: 'guest@vitalis.ai',
        photoURL: null 
      };

      setUser(activeUser);
      
      // Fetch or create profile
      const profileRef = doc(db, 'users', activeUser.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        setProfile(profileSnap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: activeUser.uid,
          fullName: activeUser.displayName || 'Guest',
          email: activeUser.email || '',
          createdAt: serverTimestamp(),
        };
        await setDoc(profileRef, newProfile);
        setProfile(newProfile);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
