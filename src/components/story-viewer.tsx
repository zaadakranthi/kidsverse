
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { DialogContent } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { X, ChevronLeft, ChevronRight, Pause, Play, Send } from 'lucide-react';
import { Story, StoryReelWithViewed } from '@/lib/types';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';

type StoryViewerProps = {
  reels: StoryReelWithViewed[];
  initialReelIndex?: number;
  onClose: () => void;
  onReelViewed: (userId: string) => void;
};

export function StoryViewer({ reels, initialReelIndex = 0, onClose, onReelViewed }: StoryViewerProps) {
  const [currentReelIndex, setCurrentReelIndex] = useState(initialReelIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentReel = reels[currentReelIndex];
  const currentStory = currentReel?.stories[currentStoryIndex];

  const goToNextStory = useCallback(() => {
    if (!currentReel) return;

    if (currentStoryIndex < currentReel.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
       onReelViewed(currentReel.id); // Mark reel as viewed when last story finishes
      if (currentReelIndex < reels.length - 1) {
        setCurrentReelIndex(prev => prev + 1);
        setCurrentStoryIndex(0);
      } else {
        onClose();
      }
    }
  }, [currentReel, currentStoryIndex, currentReelIndex, reels.length, onClose, onReelViewed]);

  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentReelIndex > 0) {
      const prevReelIndex = currentReelIndex - 1;
      setCurrentReelIndex(prevReelIndex);
      setCurrentStoryIndex(reels[prevReelIndex].stories.length - 1);
    }
  }, [currentStoryIndex, currentReelIndex, reels]);

  useEffect(() => {
    if (!currentStory || isPaused) return;

    setProgress(0);
    const duration = currentStory.duration;
    
    let startTime: number;
    let animationFrameId: number;

    const animateProgress = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const newProgress = (elapsedTime / duration) * 100;

      if (newProgress >= 100) {
        goToNextStory();
      } else {
        setProgress(newProgress);
        animationFrameId = requestAnimationFrame(animateProgress);
      }
    };
    
    animationFrameId = requestAnimationFrame(animateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentStory, isPaused, goToNextStory]);
  
  useEffect(() => {
    setCurrentReelIndex(initialReelIndex);
    setCurrentStoryIndex(0);
  }, [initialReelIndex]);


  if (!currentReel || !currentStory) return null;

  return (
    <DialogContent 
      className="p-0 border-0 bg-black/80 max-w-full h-full md:max-w-md md:h-[90vh] md:rounded-lg"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <div className="relative h-full w-full flex flex-col items-center justify-center">
        {/* Header & Progress */}
        <div className="absolute top-0 left-0 w-full p-4 z-10">
          <div className="flex items-center gap-1 w-full mb-2">
            {currentReel.stories.map((story, index) => (
              <div key={story.id} className="w-full bg-gray-500/50 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-white h-1"
                  style={{ width: `${index < currentStoryIndex ? 100 : index === currentStoryIndex ? progress : 0}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={currentReel.avatar} />
                <AvatarFallback>{currentReel.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-white">{currentReel.username}</p>
                 <p className="text-xs text-gray-300">{formatDistanceToNow(currentStory.createdAt.toDate())} ago</p>
              </div>
            </div>
            <div className='flex items-center'>
                 <Button onClick={() => setIsPaused(!isPaused)} variant="ghost" size="icon" className="text-white h-8 w-8 bg-black/30 hover:bg-black/50">
                    {isPaused ? <Play /> : <Pause />}
                 </Button>
                <Button onClick={onClose} variant="ghost" size="icon" className="text-white h-8 w-8 bg-black/30 hover:bg-black/50">
                <X />
                </Button>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="relative w-full h-full flex items-center justify-center" onClick={() => setIsPaused(!isPaused)}>
          {currentStory.type === 'image' ? (
            <Image
              src={currentStory.url}
              alt={`Story by ${currentReel.username}`}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <video
              src={currentStory.url}
              className="max-h-full max-w-full"
              autoPlay={!isPaused}
              onPause={() => setIsPaused(true)}
              onPlay={() => setIsPaused(false)}
              playsInline
              key={currentStory.id} // Re-mount video element on story change
            />
          )}
        </div>

        {/* Click Areas for Navigation */}
        <div className="absolute left-0 top-0 h-full w-1/3 z-20" onClick={(e) => { e.stopPropagation(); goToPrevStory(); }}></div>
        <div className="absolute right-0 top-0 h-full w-1/3 z-20" onClick={(e) => { e.stopPropagation(); goToNextStory(); }}></div>

        <div className="absolute bottom-0 left-0 w-full p-4 z-10 flex flex-col gap-2">
           {currentStory.caption && (
                <div className="w-full text-center">
                    <p className="text-white text-sm bg-black/50 rounded-full px-4 py-2 inline-block">{currentStory.caption}</p>
                </div>
            )}
          <div className='flex items-center gap-2'>
            <Input placeholder="Send a message..." className="bg-background/80 border-none text-black" />
            <Button size="icon"><Send /></Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
