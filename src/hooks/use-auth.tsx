
'use client';

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import type { User as AppUser } from '@/lib/types';
import { User as FirebaseAuthUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/services/users';
import { Skeleton } from '@/components/ui/skeleton';

type AuthContextType = {
  user: AppUser | null;
  setUser: Dispatch<SetStateAction<AppUser | null>>;
  firebaseUser: FirebaseAuthUser | null;
  authLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setFirebaseUser(user);
        const userProfile = await getUserProfile(user.uid);
        setUser(userProfile);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    setUser,
    firebaseUser,
    authLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {authLoading ? <div className="flex h-screen items-center justify-center"><p>Loading...</p></div> : children}
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
