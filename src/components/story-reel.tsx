
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog } from '@/components/ui/dialog';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Story, StoryReel as StoryReelType, StoryReelWithViewed } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AddStoryDialog } from './add-story-dialog';
import { StoryViewer } from './story-viewer';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { subDays } from 'date-fns';

const VIEWED_REELS_STORAGE_KEY = 'viewed_story_reels';


export function StoryReel() {
  const { user, authLoading } = useAuth();
  const [storyReels, setStoryReels] = useState<StoryReelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewedReels, setViewedReels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
        const storedViewedReels = localStorage.getItem(VIEWED_REELS_STORAGE_KEY);
        if (storedViewedReels) {
          setViewedReels(JSON.parse(storedViewedReels));
        }
    } catch (e) {
        console.error("Could not parse viewed reels from localStorage", e)
    }
  }, []);
  
  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    };
    
    if (!user) {
        setLoading(false);
        setStoryReels([]);
        return;
    }

    setLoading(true);
    const twentyFourHoursAgo = Timestamp.fromDate(subDays(new Date(), 1));
    const q = query(
        collection(db, "stories"), 
        where("createdAt", ">=", twentyFourHoursAgo),
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const storiesFromDb: Story[] = [];
        querySnapshot.forEach((doc) => {
            storiesFromDb.push(doc.data() as Story);
        });

        // Group stories by user
        const reelsMap = storiesFromDb.reduce((acc, story) => {
            if (!acc[story.userId]) {
                acc[story.userId] = {
                    id: story.userId,
                    userId: story.userId,
                    username: story.username,
                    avatar: story.userAvatar,
                    stories: [],
                    updatedAt: story.createdAt, // Use the latest story's timestamp
                };
            }
            acc[story.userId].stories.push(story);
            // Ensure updatedAt is the most recent timestamp
            if (story.createdAt.toMillis() > acc[story.userId].updatedAt.toMillis()) {
                acc[story.userId].updatedAt = story.createdAt;
            }
            return acc;
        }, {} as Record<string, StoryReelType>);

        const reelsFromMap = Object.values(reelsMap);

        // Sort stories within each reel
        reelsFromMap.forEach(reel => {
            reel.stories.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
        });

        const sortedReels = reelsFromMap.sort((a, b) => {
            const aIsCurrentUser = a.id === user.id;
            const bIsCurrentUser = b.id === user.id;

            if (aIsCurrentUser) return -1;
            if (bIsCurrentUser) return 1;
            
            return b.updatedAt.toMillis() - a.updatedAt.toMillis();
        });
        
        setStoryReels(sortedReels);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching stories: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const reelsWithViewedStatus = storyReels.map(reel => ({
    ...reel,
    isAllViewed: !!viewedReels[reel.id]
  })).sort((a, b) => {
      const aIsCurrentUser = a.id === user?.id;
      const bIsCurrentUser = b.id === user?.id;
      if (aIsCurrentUser) return -1;
      if (bIsCurrentUser) return 1;
      if (a.isAllViewed && !b.isAllViewed) return 1;
      if (!a.isAllViewed && b.isAllViewed) return -1;
      return b.updatedAt.toMillis() - a.updatedAt.toMillis();
  });


  const handleSetReelViewed = (userId: string) => {
    const updatedViewedReels = { ...viewedReels, [userId]: true };
    setViewedReels(updatedViewedReels);
    try {
        localStorage.setItem(VIEWED_REELS_STORAGE_KEY, JSON.stringify(updatedViewedReels));
    } catch(e) {
        console.error("Could not save viewed reels to localStorage", e);
    }
  };

  const openStoryViewer = (index: number) => {
    setCurrentReelIndex(index);
    setIsViewerOpen(true);
  };
  
  if (authLoading) {
    return (
       <ScrollArea className="w-full whitespace-nowrap rounded-md pb-4">
          <div className="flex w-max space-x-4">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
                    <div className="mt-1 w-20 h-3 rounded-md bg-muted animate-pulse" />
                </div>
            ))}
          </div>
        </ScrollArea>
    );
  }
  
  if (!user) {
      return null;
  }
  
  const currentUserReelIndex = reelsWithViewedStatus.findIndex(reel => reel.id === user.id);
  const currentUserReel = currentUserReelIndex !== -1 ? reelsWithViewedStatus[currentUserReelIndex] : null;

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap rounded-md pb-4">
        <div className="flex w-max space-x-4">
          <AddStoryDialog>
             <div onClick={() => currentUserReel && openStoryViewer(currentUserReelIndex)} className="relative h-20 w-20 flex-shrink-0 cursor-pointer text-center">
              <div className={cn(
                "h-20 w-20 rounded-full p-1",
                currentUserReel && !currentUserReel.isAllViewed && "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
              )}>
                <Avatar className="h-full w-full border-2 border-background">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-background">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
               <p className="mt-1 w-20 truncate text-xs font-medium">Your Story</p>
            </div>
          </AddStoryDialog>

          {loading ? (
             [...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
                    <div className="mt-1 w-20 h-3 rounded-md bg-muted animate-pulse" />
                </div>
            ))
          ) : (
            reelsWithViewedStatus.filter(reel => reel.id !== user.id).map((reel) => (
                <div
                    key={reel.id}
                    onClick={() => openStoryViewer(reelsWithViewedStatus.findIndex(r => r.id === reel.id))}
                    className="flex-shrink-0 cursor-pointer text-center"
                >
                    <div
                    className={cn(
                        "h-20 w-20 rounded-full p-1",
                        reel.isAllViewed
                        ? "bg-muted"
                        : "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                    )}
                    >
                    <Avatar className="h-full w-full border-2 border-background">
                        <AvatarImage src={reel.avatar} />
                        <AvatarFallback>{reel.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    </div>
                    <p className="mt-1 w-20 truncate text-xs font-medium">{reel.username}</p>
                </div>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <StoryViewer
          reels={reelsWithViewedStatus}
          initialReelIndex={currentReelIndex}
          onReelViewed={handleSetReelViewed}
          onClose={() => setIsViewerOpen(false)}
        />
      </Dialog>
    </>
  );
}
