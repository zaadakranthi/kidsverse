
'use server';

import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { users, posts, games, tutors, partners, studyRooms, comments as mockComments, storyReels as mockStoryReels } from '@/lib/data';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

async function seedCollection(adminDb: FirebaseFirestore.Firestore, collectionName: string, data: any[], idField: string) {
  const collectionRef = adminDb.collection(collectionName);
  const snapshot = await collectionRef.limit(1).get();

  if (!snapshot.empty) {
    console.log(`Collection "${collectionName}" already contains data. Skipping seed.`);
    return 0;
  }

  console.log(`Seeding collection: "${collectionName}"...`);
  const batch = adminDb.batch();
  let count = 0;

  data.forEach(item => {
    // Handle nested ID fields like 'user.id'
    const docId = idField.split('.').reduce((obj, key) => obj && obj[key], item);
    if (!docId) {
      console.warn(`Skipping item in ${collectionName}, missing ID field '${idField}':`, item);
      return;
    }
    const docRef = collectionRef.doc(docId);
    
    // Convert JS Date objects to Firestore Timestamps for seeding
    const itemWithTimestamps = Object.entries(item).reduce((acc, [key, value]) => {
        if (value instanceof Date) {
            acc[key] = Timestamp.fromDate(value);
        } else if (Array.isArray(value)) {
            // Firestore does not support nested server timestamps in arrays.
            // We'll leave array fields as they are.
            acc[key] = value;
        }
        // Add other special handling if needed
        else {
            acc[key] = value;
        }
        return acc;
    }, {} as any);

    // Remove fields that should not be directly seeded (like sub-collections)
    delete itemWithTimestamps.comments;
    delete itemWithTimestamps.stories;

    
    batch.set(docRef, {
      ...itemWithTimestamps,
       // These are set by the server on write, so we don't include them in the initial data object.
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    count++;
  });

  await batch.commit();
  console.log(`✅ Seeded ${count} documents into "${collectionName}".`);
  return count;
}

export const seedDatabase = async () => {
  try {
    const { adminDb } = await getFirebaseAdmin();
    console.log("🚀 Starting database seed...");

    // 1. Users
    await seedCollection(adminDb, 'users', users, 'id');

    // 2. Tutors
    const tutorsToSeed = tutors.map(t => {
      const { name, sudoName, avatar, role, class: userClass, ...tutorData } = t;
      return {
        ...tutorData,
        bio: t.bio,
        subjects: t.subjects,
        price_per_hour: t.price_per_hour,
        rating: t.rating,
        reviews: t.reviews,
      };
    });
    await seedCollection(adminDb, 'tutors', tutorsToSeed, 'userId');

    // 3. Partners
    await seedCollection(adminDb, 'partners', partners, 'slug');

    // 4. Games
    const gamesToSeed = games.map(g => {
        const { icon, creator, ...gameToSave } = g;
        return {
            ...gameToSave,
            creatorId: creator.id,
            creatorInfo: { name: creator.name, sudoName: creator.sudoName, avatar: creator.avatar, id: creator.id }
        };
    });
    await seedCollection(adminDb, 'games', gamesToSeed, 'id');
    
    // 5. Posts and their sub-collections (comments)
    const postsToSeed = posts.map(p => {
      const { comments, ...postToSave } = p;
      return { ...postToSave, commentsCount: comments.length };
    });
    const postCount = await seedCollection(adminDb, 'posts', postsToSeed, 'id');

    if (postCount > 0) {
        const commentsBatch = adminDb.batch();
        let commentCount = 0;
        for (const post of posts) {
            if (post.comments && post.comments.length > 0) {
                const commentsRef = adminDb.collection('posts').doc(post.id).collection('comments');
                for (const comment of post.comments) {
                    const { id, ...commentToSave } = comment;
                    const commentRef = commentsRef.doc(id);
                    commentsBatch.set(commentRef, {
                        ...commentToSave,
                        createdAt: FieldValue.serverTimestamp(),
                    });
                    commentCount++;
                }
            }
        }
        await commentsBatch.commit();
        console.log(`✅ Seeded ${commentCount} comments.`);
    }

    // 6. Study Rooms
    const roomsToSeed = studyRooms.map(r => {
      const { ...roomToSave } = r;
      return {
        ...roomToSave,
      };
    });
    await seedCollection(adminDb, 'studyRooms', roomsToSeed, 'id');

    // 7. Stories (new model: one doc per story)
    const storiesBatch = adminDb.batch();
    const allStories = Object.values(mockStoryReels).flatMap(reel => reel.stories);
    let storiesCount = 0;
    for (const story of allStories) {
      const storyRef = adminDb.collection('stories').doc(story.id);
      storiesBatch.set(storyRef, { ...story, createdAt: Timestamp.fromMillis(Date.parse(story.createdAt as string)) });
      storiesCount++;
    }
    await storiesBatch.commit();
    console.log(`✅ Seeded ${storiesCount} stories.`);

    console.log('🎉 Database seeding finished successfully.');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error during database seeding:', error.message);
    return { success: false, error: error.message };
  }
};
