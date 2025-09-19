
'use client';

import { Post } from '@/lib/types';
import { PostCard } from './post-card';
import { Users } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

type FollowingFeedProps = {
  posts: Post[];
}

export function FollowingFeed({ posts }: FollowingFeedProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed text-center">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">Login to see your feed</h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Posts from users you follow will appear here.
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  const followingPosts = posts.filter(post => 
    user.following.includes(post.authorInfo.id)
  );

  if (followingPosts.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed text-center">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">Your Feed is Quiet</h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Content from users you follow will appear here. Start following people to see their posts!
        </p>
        <Button asChild className="mt-4">
          <Link href="/tutors">Find Tutors to Follow</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {followingPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
