
'use client';
import { CreatePost } from '@/components/create-post';
import { ForYouFeed } from '@/components/for-you-feed';
import { PostCard } from '@/components/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearch } from '@/hooks/use-search';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Post, Tutor, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users as UsersIcon, UserCheck, Bot } from 'lucide-react';
import { FollowingFeed } from '@/components/following-feed';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { createPost, getPosts } from '@/lib/services/posts';
import { getTutors } from '@/lib/services/users';
import { StoryReel } from '@/components/story-reel';

const subjects = [
  'All', 'Mathematics', 'Science', 'English', 'History', 'Geography', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 'Art', 'Music', 'Mythology', 'Entertainment', 'General Knowledge', 'Current Affairs', 'Environmental Science', 'Civics', 'Economics', 'Cooking'
];

export default function HomePage() {
  const { toast } = useToast();
  const { user, authLoading } = useAuth();
  const { searchQuery } = useSearch();
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [posts, setPosts] = useState<Post[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const router = useRouter();
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  
  useEffect(() => {
    if (user) {
        const count = user.following.length > 0
            ? user.following.reduce((acc, id) => acc + Math.floor(Math.random() * 5), 25)
            : 125;
        setFollowersCount(count);
    }
  }, [user]);

  useEffect(() => {
    // Do not fetch data until authentication is resolved
    if (authLoading) return;

    const fetchInitialData = async () => {
        try {
            setPostsLoading(true);
            const [fetchedPosts, fetchedTutors] = await Promise.all([
                getPosts(),
                getTutors(),
            ]);
            setPosts(fetchedPosts);
            setTutors(fetchedTutors);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            toast({
                variant: 'destructive',
                title: 'Error loading data',
                description: 'Could not load posts and tutors from the database.'
            });
        } finally {
            setPostsLoading(false);
        }
    }
    fetchInitialData();
  }, [authLoading, toast]);

  const handleCreatePost = async (postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'createdAt' | 'updatedAt' | 'commentsCount' | 'authorInfo'>) => {
    if (!user) return;
    
    try {
      const newPost = await createPost(postData, user);
      setPosts(prevPosts => [newPost, ...prevPosts]);
      toast({
          title: 'Post Created & Coins Earned!',
          description: `You've earned coins for your new post.`
      });
    } catch (error) {
       console.error("Failed to create post:", error);
       toast({
        variant: 'destructive',
        title: 'Failed to Create Post',
        description: `Your post could not be saved.`,
       });
    }
  }

  const trendingPosts = [...posts].sort((a, b) => (b.likes + b.shares) - (a.likes + a.shares));

  const filterPosts = (postsToFilter: typeof posts) => {
    return postsToFilter.filter(post => {
      const subjectMatch = subjectFilter === 'All' || post.subject.toLowerCase() === subjectFilter.toLowerCase();
      const searchMatch = !searchQuery || post.content.toLowerCase().includes(searchQuery.toLowerCase()) || post.authorInfo.name.toLowerCase().includes(searchQuery.toLowerCase());
      return subjectMatch && searchMatch;
    });
  };

  const filteredTrendingPosts = filterPosts(trendingPosts);
  
  const featuredTutors = tutors.slice(0, 3);
  
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      <div className="space-y-6 lg:col-span-3">
        <StoryReel />
        {user && <CreatePost onCreatePost={handleCreatePost} />}
        <div className="block lg:hidden">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Tabs defaultValue="foryou" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="foryou">For You</TabsTrigger>
            <TabsTrigger value="trending">Trending Q&A</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="foryou" className="mt-4 space-y-4">
             <ForYouFeed />
          </TabsContent>
          <TabsContent value="trending" className="mt-4 space-y-4">
              {(postsLoading || authLoading) ? (
                [...Array(3)].map((_, i) => <PostCard.Skeleton key={i} />)
              ) : filteredTrendingPosts.length > 0 ? (
                filteredTrendingPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                  <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
                      <p className="text-muted-foreground">No trending posts match your filters.</p>
                  </div>
              )}
            </TabsContent>
          <TabsContent value="following" className="mt-4">
             <FollowingFeed posts={posts} />
          </TabsContent>
        </Tabs>
      </div>
      <aside className="hidden space-y-6 lg:block">
          {authLoading ? (
             <Skeleton className="h-48 w-full" />
          ) : user ? (
            <Card>
              <CardContent className='p-4'>
                  <Link href="/profile" className='block hover:bg-muted p-2 rounded-lg'>
                      <div className='flex items-center gap-3'>
                          <Avatar className='h-12 w-12'>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                              <p className='font-semibold'>{user.sudoName}</p>
                              <p className='text-sm text-muted-foreground'>@{user.name}</p>
                          </div>
                      </div>
                      <div className='flex justify-around mt-4'>
                          <div className='text-center'>
                              <p className='font-bold text-lg'>{followersCount !== null ? followersCount : '...'}</p>
                              <p className='text-xs text-muted-foreground flex items-center gap-1'><UsersIcon className='h-3 w-3'/>Followers</p>
                          </div>
                           <div className='text-center'>
                              <p className='font-bold text-lg'>{user.following.length}</p>
                              <p className='text-xs text-muted-foreground flex items-center gap-1'><UserCheck className='h-3 w-3'/>Following</p>
                          </div>
                      </div>
                  </Link>
              </CardContent>
            </Card>
          ) : null}
          <Card>
              <CardContent className="p-2">
                <h3 className="p-2 text-lg font-semibold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5"/>
                    Featured Tutors
                </h3>
                  <div className="space-y-2">
                      {featuredTutors.map(tutor => (
                           <Link key={tutor.userId} href={`/tutors`} className="block rounded-md p-2 hover:bg-muted">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={tutor.avatar} />
                                    <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{tutor.sudoName}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                    {tutor.subjects.slice(0, 2).map(subject => (
                                        <Badge key={subject} variant="secondary">{subject}</Badge>
                                    ))}
                                    </div>
                                </div>
                            </div>
                           </Link>
                      ))}
                  </div>
              </CardContent>
          </Card>
      </aside>
    </div>
  );
}
