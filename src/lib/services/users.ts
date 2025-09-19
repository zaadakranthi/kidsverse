
'use server';

import { getFirebaseAdmin } from '@/lib/firebase-admin';
import type { Tutor, User } from '@/lib/types';
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import { User as FirebaseAuthUser } from 'firebase/auth';

export const getTutors = async (): Promise<Tutor[]> => {
  try {
    const { adminDb } = await getFirebaseAdmin();
    const tutorsSnapshot = await adminDb.collection('tutors').get();
    
    if (tutorsSnapshot.empty) {
        return [];
    }

    const userIds = tutorsSnapshot.docs.map(doc => doc.id);

    if (userIds.length === 0) {
        return [];
    }

    const usersRef = userIds.map(id => adminDb.collection('users').doc(id));
    const userDocs = await adminDb.getAll(...usersRef);

    const usersData = userDocs.reduce((acc, doc) => {
        if (doc.exists) {
            acc[doc.id] = doc.data() as Omit<User, 'id'>;
        }
        return acc;
    }, {} as { [key: string]: Omit<User, 'id'> });


    const tutors: Tutor[] = tutorsSnapshot.docs.map(doc => {
        const tutorData = doc.data();
        const userData = usersData[doc.id];

        if (!userData) {
            return null;
        }

        return {
            ...userData,
            ...tutorData,
            userId: doc.id,
            id: doc.id,
        } as Tutor;
    }).filter((tutor): tutor is Tutor => tutor !== null);
    
    return tutors;
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return [];
  }
}

export const createTutor = async (
    tutorData: Omit<Tutor, 'id' | 'userId' | 'name' | 'sudoName' | 'avatar' | 'role' | 'class' | 'rating' | 'reviews'>,
    user: User
): Promise<Tutor> => {
    const { adminDb } = await getFirebaseAdmin();
    const tutorRef = adminDb.collection('tutors').doc(user.id);

    const newTutorData = {
        bio: tutorData.bio,
        subjects: tutorData.subjects,
        price_per_hour: tutorData.price_per_hour,
        rating: 0,
        reviews: 0,
        updatedAt: AdminTimestamp.now(),
    };

    await tutorRef.set(newTutorData);

    const fullTutorData: Tutor = {
        ...user,
        ...newTutorData,
        userId: user.id,
        id: user.id,
    };

    return fullTutorData;
};

export const getUsers = async (): Promise<User[]> => {
    try {
        const { adminDb } = await getFirebaseAdmin();
        const usersSnapshot = await adminDb.collection('users').get();
        if (usersSnapshot.empty) {
            return [];
        }
        return usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as AdminTimestamp).toDate(),
                updatedAt: (data.updatedAt as AdminTimestamp).toDate(),
            } as User;
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { adminDb } = await getFirebaseAdmin();
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (!userData) return null;
      // Convert Firestore Timestamps to JS Date objects for client-side usage
      return { 
        id: userDoc.id, 
        ...userData,
        createdAt: (userData.createdAt as AdminTimestamp).toDate(),
        updatedAt: (userData.updatedAt as AdminTimestamp).toDate(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};


export const createUserProfile = async (firebaseUser: FirebaseAuthUser, name: string): Promise<void> => {
  const { adminDb } = await getFirebaseAdmin();
  const userDocRef = adminDb.collection('users').doc(firebaseUser.uid);

  const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
    name: name,
    sudoName: `user_${firebaseUser.uid.substring(0, 6)}`,
    email: firebaseUser.email!,
    role: 'student',
    avatar: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
    class: 'Not Set',
    school: 'Not Set',
    syllabus: 'Not Set',
    area: 'Not Set',
    state: 'Not Set',
    languages: ['English'],
    sports: [],
    willing_to_tutor: false,
    coins: 50,
    subscription_status: 'free',
    transactions: [],
    parental_controls: {
      max_screen_time: 120,
      history_enabled: true,
    },
    achievements: [],
    following: [],
  };

  await userDocRef.set({
    ...newUser,
    createdAt: AdminTimestamp.now(),
    updatedAt: AdminTimestamp.now(),
  });
};
