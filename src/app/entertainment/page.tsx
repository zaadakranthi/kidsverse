
'use client';

import { PostCard } from '@/components/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clapperboard, PlusCircle } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import { Post } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { createPost, getPosts } from '@/lib/services/posts';
import { Skeleton } from '@/components/ui/skeleton';

const entertainmentCategories = ['All', 'Mini Skits', 'Dance', 'Music', 'Magic', 'Comedy', 'Puppet Shows', 'Storytelling'];

export default function EntertainmentPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { searchQuery } = useSearch();
  const [isCreatePostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [postType, setPostType] = useState<'video' | 'qa'>('video');
  const [entertainmentPosts, setEntertainmentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const allPosts = await getPosts();
            setEntertainmentPosts(allPosts.filter(p => p.subject.toLowerCase() === 'entertainment'));
        } catch (error) {
            console.error("Failed to fetch entertainment posts:", error);
            toast({
                variant: 'destructive',
                title: 'Error loading posts',
                description: 'Could not fetch entertainment posts from the database.'
            });
        } finally {
            setLoading(false);
        }
    };
    fetchPosts();
  }, [toast]);


  const handleCreatePost = async (postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'createdAt' | 'updatedAt' | 'commentsCount' | 'authorInfo'>) => {
      if (!currentUser) return;
      
      setCreatePostDialogOpen(false);
      
      try {
        const newPost = await createPost(postData, currentUser);
        setEntertainmentPosts(prev => [newPost, ...prev]);
        toast({
            title: 'Post Created & Coins Earned!',
            description: `You've earned coins for your new post.`
        });
      } catch (error) {
           toast({
            title: 'Post Creation Failed',
            description: 'There was an error creating your post.',
            variant: 'destructive'
        });
      }
  }


  const filterPosts = (postsToFilter: Post[], category: string) => {
    return postsToFilter.filter(post => {
      const subjectMatch = post.subject.toLowerCase() === 'entertainment';
      const categoryMatch = category === 'All' || post.subCategory === category;
      const searchMatch = !searchQuery || post.content.toLowerCase().includes(searchQuery.toLowerCase()) || post.authorInfo.name.toLowerCase().includes(searchQuery.toLowerCase());
      return subjectMatch && categoryMatch && searchMatch;
    });
  };
  
  const handleOpenDialog = (type: 'video' | 'qa') => {
    setPostType(type);
    setCreatePostDialogOpen(true);
  };


  return (
    <Dialog open={isCreatePostDialogOpen} onOpenChange={setCreatePostDialogOpen}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
              <Clapperboard className="h-10 w-10 text-primary" />
              <div>
              <h1 className="text-3xl font-bold font-headline">Talent & Entertainment</h1>
              <p className="text-muted-foreground">
                  Showcase your creative talents and discover performances from others.
              </p>
              </div>
          </div>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog('video')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Post
            </Button>
          </DialogTrigger>
        </div>
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-8">
              {entertainmentCategories.map(cat => (
                  <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
          </TabsList>
          {entertainmentCategories.map(category => (
              <TabsContent key={category} value={category}>
                  <div className="mt-4 space-y-4">
                  {loading ? (
                       [...Array(2)].map((_, i) => <PostCard.Skeleton key={i} />)
                  ) : filterPosts(entertainmentPosts, category).length > 0 ? (
                      filterPosts(entertainmentPosts, category).map((post) => (
                          <PostCard key={post.id} post={post} />
                      ))
                  ) : (
                      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
                          <h3 className="text-xl font-medium">No {category} content yet!</h3>
                          <p className="text-muted-foreground">Be the first to post something in this category.</p>
                      </div>
                  )}
                  </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <CreatePostDialog
          postType={postType}
          onCreatePost={handleCreatePost}
          initialSubject="Entertainment"
        />
    </Dialog>
  );
}
