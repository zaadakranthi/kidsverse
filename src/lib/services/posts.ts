
'use server';

import { getFirebaseAdmin } from '@/lib/firebase-admin';
import type { Post, User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { posts as mockPosts } from '@/lib/data';
import { awardPoints } from '@/ai/flows/award-points';

export const createPost = async (
  postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'createdAt' | 'updatedAt' | 'commentsCount' | 'authorInfo'>,
  user: User
): Promise<Post> => {
   if (!user) {
        throw new Error("User must be logged in to create a post");
    }
  const { adminDb } = await getFirebaseAdmin();
  const postRef = adminDb.collection('posts').doc();
  const now = new Date();

  const newPostData: Omit<Post, 'id' | 'comments' | 'timestamp'> & { createdAt: Date, updatedAt: Date } = {
    ...postData,
    authorInfo: {
        id: user.id,
        name: user.name,
        sudoName: user.sudoName,
        avatar: user.avatar,
    },
    authorId: user.id,
    likes: 0,
    shares: 0,
    commentsCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  
  await postRef.set(newPostData);
  
  try {
      const actionType = postData.type === 'qa' ? 'ASK_QUESTION' : 'CREATE_VIDEO_POST';
      await awardPoints({
          userId: user.id,
          action: actionType,
      });
  } catch (e) {
      console.error("Failed to award points for post creation:", e);
      // Non-critical error, so we don't throw. The post is still created.
  }


  return {
    ...newPostData,
    id: postRef.id,
    timestamp: formatDistanceToNow(now) + ' ago',
    comments: [],
  };
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    const { adminDb } = await getFirebaseAdmin();
    const postsSnapshot = await adminDb.collection('posts').orderBy('createdAt', 'desc').limit(20).get();
    
    if (postsSnapshot.empty) {
        console.log("No posts found in database, returning mock data.");
        return mockPosts;
    }

    const posts: Post[] = await Promise.all(postsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const createdAt = (data.createdAt as FirebaseFirestore.Timestamp).toDate();
        
        const commentsSnapshot = await doc.ref.collection('comments').orderBy('createdAt', 'desc').get();
        const comments = commentsSnapshot.docs.map(commentDoc => {
            const commentData = commentDoc.data();
            const commentCreatedAt = (commentData.createdAt as FirebaseFirestore.Timestamp).toDate();
            return {
                id: commentDoc.id,
                ...commentData,
                timestamp: formatDistanceToNow(commentCreatedAt) + ' ago',
            } as any;
        });

        return {
            id: doc.id,
            timestamp: formatDistanceToNow(createdAt) + ' ago',
            ...data,
            authorInfo: data.authorInfo || { id: 'unknown', name: 'Unknown', sudoName: 'unknown', avatar: '' },
            createdAt,
            updatedAt: (data.updatedAt as FirebaseFirestore.Timestamp).toDate(),
            comments: comments,
        } as Post;
    }));
    
    return posts;
  } catch (error) {
    console.error("Error fetching posts: ", error);
    return mockPosts; // Fallback to mock data on error
  }
}
