
'use client';
import { useEffect, useState, useRef } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { studyRooms, addPost } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Users,
  ScreenShare,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { Post, User } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';

type ChatMessage = {
  user: {
    id: string;
    name: string;
    sudoName: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
};

export default function StudyRoomPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { id } = params;
  const room = studyRooms.find((r) => r.id === id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [shareText, setShareText] = useState('');
  const [initialSubject, setInitialSubject] = useState<string | undefined>(undefined);


  useEffect(() => {
    let localStream: MediaStream | null = null;
    const getCameraPermission = async () => {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localStream = mediaStream;
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser to use this feature.',
          });
        }
      }
    };
    getCameraPermission();

    return () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);


  if (!room || !currentUser) {
    if (!currentUser) return <div>Loading...</div>
    notFound();
  }
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if(newMessage.trim()){
      const message: ChatMessage = {
        user: {
          id: currentUser.id,
          name: currentUser.name,
          sudoName: currentUser.sudoName,
          avatar: currentUser.avatar
        },
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  }

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff((prev) => !prev);
    }
  };

  const handleExitRoom = () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    router.push('/study-rooms');
  };

  const handleCreatePost = (postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'createdAt' | 'updatedAt' | 'commentsCount'>) => {
      if (!currentUser) return;
      const newPost: Post = {
        ...postData,
        id: `post-${Date.now()}`,
        authorInfo: {
          id: currentUser.id,
          name: currentUser.name,
          sudoName: currentUser.sudoName,
          avatar: currentUser.avatar,
        },
        authorId: currentUser.id,
        timestamp: 'Just now',
        likes: 0,
        comments: [],
        commentsCount: 0,
        shares: 0,
        class: currentUser.class,
        imageUrl: postData.imageUrl || `https://picsum.photos/seed/post${Date.now()}/600/400`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      addPost(newPost);
      toast({
            title: 'Event Shared!',
            description: 'Your post has been shared to the main feed.'
      });
  }

  const handleShareOnFeed = () => {
    let text = `Join this live event: "${room.name}"! Everyone is welcome.\n\n${window.location.href}`;
    setShareText(text);
    setInitialSubject(room.subject);
  }

  const handleShareLink = () => {
      navigator.clipboard.writeText(window.location.href);
      toast({
          title: 'Link Copied!',
          description: 'Event link has been copied to your clipboard.',
      });
  };

  const participants = [room.host, ...room.participants, currentUser].filter(
    (p, index, self) => index === self.findIndex((t) => t.id === p.id)
  );

  return (
    <Dialog>
    <div className="grid h-[calc(100vh-10rem)] grid-cols-1 gap-4 lg:grid-cols-4">
      <div className="lg:col-span-3 h-full flex flex-col">
        <div className="flex-1 w-full bg-card rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden">
            <video ref={videoRef} className={`w-full h-full object-cover rounded-md ${isVideoOff ? 'hidden' : 'block'}`} autoPlay muted playsInline />
            {(isVideoOff || !hasCameraPermission) && (
                 <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-center p-4">
                    { !hasCameraPermission ? (
                        <Alert variant="destructive" className='max-w-md'>
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access to use this feature. Check your browser settings to grant permission.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                           <Avatar className="h-24 w-24">
                              <AvatarImage src={currentUser.avatar} />
                              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className='font-semibold'>Your video is off</p>
                        </div>
                    )}
                 </div>
            )}
             <div className="absolute top-4 right-4 flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon">
                            <Share2 />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={handleShareOnFeed}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Share on Feed
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem onSelect={handleShareLink}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Copy Link
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-background/50 p-2 backdrop-blur-sm">
                <Button variant={isMuted ? 'destructive' : 'secondary'} size="icon" className="rounded-full" onClick={toggleAudio}>
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button variant={isVideoOff ? 'destructive' : 'secondary'} size="icon" className="rounded-full" onClick={toggleVideo}>
                    {isVideoOff ? <VideoOff /> : <Video />}
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full">
                    <ScreenShare />
                </Button>
                 <Button variant="destructive" onClick={handleExitRoom} className="rounded-full px-4">
                    <PhoneOff className="mr-2 h-4 w-4" /> Exit
                </Button>
                 <Button variant="secondary" size="icon" className="rounded-full lg:hidden" onClick={() => setShowChat(!showChat)}>
                    <MessageSquare />
                </Button>
            </div>
        </div>
      </div>
      <div className={`h-full flex-col ${showChat ? 'flex' : 'hidden'} lg:flex`}>
        <Card className='h-full flex flex-col'>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Chat & Participants</span>
                    <Badge variant="secondary">{participants.length} <Users className='ml-1.5 h-3 w-3'/></Badge>
                </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                    <div className='p-4 space-y-4'>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Participants</h4>
                             {participants.map(p => (
                                <div key={p.id} className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={p.avatar} />
                                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{p.sudoName} {p.id === currentUser.id && '(You)'}</span>
                                    {p.role === 'teacher' && <ShieldCheck className="h-4 w-4 text-primary" title="Verified Teacher" />}
                                </div>
                             ))}
                        </div>
                        <Separator />
                        <div className='space-y-4'>
                            <h4 className="font-semibold text-sm">Messages</h4>
                            {messages.length === 0 ? (
                                <p className='text-sm text-muted-foreground text-center py-4'>No messages yet. Start the conversation!</p>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-2 ${msg.user.id === currentUser.id ? 'justify-end' : ''}`}>
                                        {msg.user.id !== currentUser.id && <Avatar className="h-8 w-8"><AvatarImage src={msg.user.avatar} /><AvatarFallback>{msg.user.name.charAt(0)}</AvatarFallback></Avatar>}
                                        <div className={`rounded-lg p-2 max-w-[80%] ${msg.user.id === currentUser.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            <p className='text-sm'>{msg.message}</p>
                                            <p className={`text-xs opacity-70 mt-1 ${msg.user.id === currentUser.id ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className='p-4 border-t'>
                <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                    <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                    <Button type="submit">Send</Button>
                </form>
            </CardFooter>
        </Card>
      </div>
    </div>
    <CreatePostDialog
        postType='qa'
        initialContent={shareText}
        onCreatePost={handleCreatePost}
        initialSubject={initialSubject}
    />
    </Dialog>
  );
}
