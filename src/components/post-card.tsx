
"use client";

import type { Post, Comment } from '@/lib/types';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  MessageCircle,
  Share2,
  Flag,
  MoreHorizontal,
  UserPlus,
  User,
  Send,
  Video,
  Edit,
  Trash2,
  X,
  Star,
  PlayCircle,
  Copy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiSafetyFilter } from '@/ai/flows/ai-safety-filter';
import { useState, useRef, ChangeEvent, memo } from 'react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Link from 'next/link';
import { CreatePostDialog } from './create-post-dialog';
import { Dialog, DialogTrigger } from './ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from './ui/skeleton';

type PostCardProps = {
  post: Post;
};

const PostCardComponent = ({ post }: PostCardProps) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isReporting, setIsReporting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
  const [newComment, setNewComment] = useState('');
  const [videoReply, setVideoReply] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const isCurrentUserPost = currentUser && post.authorInfo.sudoName === currentUser.sudoName;

  const getAiHint = () => {
    switch (post.subject) {
        case 'Mathematics': return 'mathematics equations';
        case 'Science': return 'science experiment';
        case 'English': return 'books theater';
        case 'Entertainment':
            switch (post.subCategory) {
                case 'Magic': return 'magic trick';
                case 'Comedy': return 'comedy sketch';
                case 'Dance': return 'person dancing';
                default: return 'person performing';
            }
        default: return 'education content';
    }
  }

  const handleReport = async () => {
    setIsReporting(true);
    toast({
      title: 'Reporting post...',
      description: 'Checking content with our AI safety filter.',
    });
    try {
      const result = await aiSafetyFilter({
        text: post.content,
        mediaUrl: post.imageUrl,
      });

      if (!result.isSafe) {
        toast({
          variant: 'destructive',
          title: 'Post Reported',
          description: `This post has been flagged for review. Reason: ${result.reason}`,
        });
        // Here you would typically update the post status in your database
      } else {
        toast({
          title: 'Content is Safe',
          description: 'Our AI has determined this content to be safe.',
        });
      }
    } catch (error) {
      console.error('Failed to report post:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not complete the report. Please try again later.',
      });
    } finally {
      setIsReporting(false);
    }
  };

  const handleSubscribe = () => {
    toast({
      title: `Subscribed to ${post.authorInfo.name}!`,
      description: "You'll now see their posts in your following feed.",
    });
  };
  
  const clearVideoReply = () => {
    setVideoReply(null);
    if (videoInputRef.current) {
        videoInputRef.current.value = '';
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (newComment.trim() === '' && !videoReply)) return;

    const comment: Comment = {
      id: `c${Date.now()}`,
      authorInfo: {
        id: currentUser.id,
        name: currentUser.name,
        sudoName: currentUser.sudoName,
        avatar: currentUser.avatar,
      },
      text: newComment,
      timestamp: 'Just now',
      videoUrl: videoReply ?? undefined,
    };
    setComments([...comments, comment]);
    setNewComment('');
    clearVideoReply();
    toast({
        title: 'Comment posted!',
    });
  };

  const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setVideoReply(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please select a video file."
        })
    }
  };

  const handleDelete = () => {
    toast({
      title: 'Post Deleted',
      description: 'Your post has been successfully deleted.',
    });
    // In a real app, you would also remove the post from the UI.
  };

  const handleEdit = () => {
    // In a real app, this would open a dialog to edit the post.
     toast({
      title: 'Edit Post',
      description: 'This feature is coming soon!',
    });
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(`https://eduvurse/posts/${post.id}`); // Dummy URL
    toast({
        title: 'Link Copied!',
        description: 'Post link has been copied to your clipboard.',
    });
  };

  const onCreatePost = (postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'createdAt' | 'updatedAt' | 'commentsCount' | 'authorInfo'>) => {
      // Dummy function for dialog, actual creation is on the page level
      toast({
        title: 'Post Shared!',
        description: 'Your post has been shared to the main feed.',
      });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Avatar>
          <AvatarImage src={post.authorInfo.avatar} alt={post.authorInfo.name} />
          <AvatarFallback>{post.authorInfo.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{post.authorInfo.sudoName} <span className="text-muted-foreground font-normal">@{post.authorInfo.name}</span></p>
          <p className="text-xs text-muted-foreground">
            {post.timestamp} {post.isSponsored ? '' : `· ${post.class}`}
          </p>
           {post.isSponsored && <Badge variant="secondary" className="mt-1 text-xs border-yellow-400 text-yellow-600"><Star className="mr-1 h-3 w-3"/>Sponsored</Badge>}
        </div>
        {!isCurrentUserPost && !post.isSponsored && (
          <Button variant="ghost" size="icon" onClick={handleSubscribe}>
            <UserPlus className="h-5 w-5" />
            <span className="sr-only">Subscribe to user</span>
          </Button>
        )}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="sr-only">More options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {isCurrentUserPost ? (
                    <>
                        <DropdownMenuItem onClick={handleEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Post</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Post</span>
                        </DropdownMenuItem>
                    </>
                ) : (
                   <>
                    {!post.isSponsored &&
                    <DropdownMenuItem asChild>
                        <Link href={`/profile/${post.authorId}`}>
                            <User className="mr-2 h-4 w-4" />
                            <span>View Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    }
                     {!post.isSponsored &&
                     <DropdownMenuItem onClick={handleSubscribe}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Follow @{post.authorInfo.sudoName}</span>
                    </DropdownMenuItem>
                    }
                   </>
                )}
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleReport}>
                    <Flag className="mr-2 h-4 w-4" />
                    <span>Report Content</span>
                 </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <p className="mb-4">{post.content}</p>
        {post.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={post.imageUrl}
              alt="Post image or video thumbnail"
              fill
              className="object-cover"
              data-ai-hint={getAiHint()}
            />
            {post.type === 'video' && (
              <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-colors hover:bg-black/50">
                <PlayCircle className="h-16 w-16 text-white/80" />
              </div>
            )}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Badge variant="secondary">{post.subject}</Badge>
          {post.subCategory && <Badge variant="outline">{post.subCategory}</Badge>}
          {!post.isSponsored && <Badge variant="secondary">Class {post.class}</Badge>}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-4 pt-2">
        <div className="flex w-full justify-between">
            <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Heart className="h-5 w-5" /> {post.likes}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => setShowComments(!showComments)}>
                    <MessageCircle className="h-5 w-5" /> {post.commentsCount}
                </Button>
                 <Dialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                <Share2 className="h-5 w-5" /> {post.shares}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                             <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Share on Feed
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DropdownMenuItem onSelect={handleShareLink}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Link
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <CreatePostDialog
                        postType='qa'
                        initialContent={`Check out this post by @${post.authorInfo.sudoName}:\n\n"${post.content.substring(0, 100)}..."`}
                        initialSubject={post.subject}
                        onCreatePost={onCreatePost}
                    />
                 </Dialog>

            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleReport} disabled={isReporting}>
                <Flag className="h-5 w-5" />
            </Button>
        </div>
        {showComments && currentUser && (
            <div className='w-full space-y-4 pt-2'>
                <Separator />
                <div className="space-y-2">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-2 text-sm">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.authorInfo.avatar} />
                                <AvatarFallback>{comment.authorInfo.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                                <span className='font-semibold'>{comment.authorInfo.name}</span>
                                <p className='text-muted-foreground'>{comment.text}</p>
                                {comment.videoUrl && <video src={comment.videoUrl} className="mt-2 w-full max-w-xs rounded-md" controls />}
                            </div>
                        </div>
                    ))}
                </div>
                 {videoReply && (
                  <div className="mt-2 relative w-full max-w-xs">
                    <video src={videoReply} className="w-full rounded-md" controls />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/50 hover:bg-background/75"
                        onClick={clearVideoReply}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove video reply</span>
                      </Button>
                  </div>
                )}
                <form onSubmit={handleCommentSubmit} className='flex w-full items-center gap-2'>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Input 
                        placeholder="Add a reply..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1" 
                    />
                     <Button type="button" variant="ghost" size="icon" onClick={() => videoInputRef.current?.click()}>
                        <Video className={`h-5 w-5 ${videoReply ? 'text-primary' : ''}`} />
                        <span className="sr-only">Add video reply</span>
                    </Button>
                    <input
                        type="file"
                        ref={videoInputRef}
                        className="hidden"
                        accept="video/*"
                        onChange={handleVideoFileChange}
                    />
                    <Button type="submit" size="icon">
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Post Reply</span>
                    </Button>
                </form>
            </div>
        )}
      </CardFooter>
    </Card>
  );
}

const MemoizedPostCard = memo(PostCardComponent);

const PostCardSkeleton = () => {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="aspect-video w-full" />
        </div>
    )
}

export const PostCard = Object.assign(MemoizedPostCard, {
  Skeleton: PostCardSkeleton,
});

    