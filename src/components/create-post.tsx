
"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, BookOpen } from "lucide-react";
import { CreatePostDialog } from './create-post-dialog';
import { Post } from '@/lib/types';
import { Dialog, DialogTrigger } from './ui/dialog';
import { useAuth } from '@/hooks/use-auth';

type CreatePostProps = {
    onCreatePost: (postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'createdAt' | 'updatedAt' | 'commentsCount'>) => void;
}

export function CreatePost({ onCreatePost }: CreatePostProps) {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [postType, setPostType] = useState<'video' | 'qa'>('qa');
  const [initialSubject, setInitialSubject] = useState<string | undefined>(undefined);

  const handleOpenDialog = (type: 'video' | 'qa', subject?: string) => {
    setPostType(type);
    setInitialSubject(subject);
    setDialogOpen(true);
  };

  const handleCreatePost = (postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'createdAt' | 'updatedAt' | 'commentsCount'>) => {
      onCreatePost(postData);
      setDialogOpen(false);
  }

  if (!user) return null;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div
              className="flex-1 cursor-pointer rounded-full bg-background px-4 py-2 text-left text-muted-foreground hover:bg-muted"
              onClick={() => handleOpenDialog('qa')}
            >
              Ask a question or share a video...
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary"
              onClick={() => handleOpenDialog('video')}
            >
              <Video className="mr-2 h-5 w-5" />
              Share Video
            </Button>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary"
              onClick={() => handleOpenDialog('qa')}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Ask Question
            </Button>
          </div>
        </CardContent>
      </Card>
      <CreatePostDialog
        postType={postType}
        onCreatePost={handleCreatePost}
        initialSubject={initialSubject}
      />
    </Dialog>
  );
}
