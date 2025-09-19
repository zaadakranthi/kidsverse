
'use server';

import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile } from "./users";

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user profile exists in Firestore
    const userProfile = await getUserProfile(user.uid);

    if (!userProfile) {
      // Create a new user profile if it doesn't exist
      await createUserProfile(user, user.displayName || 'New User');
    }

  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};


export const signOutFromApp = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};
