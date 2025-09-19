
'use client';

import { useEffect, useState, useRef, ChangeEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { sendMessage, markMessagesAsRead, setTypingStatus } from '@/lib/services/chat';
import { listenForMessages, listenForChatMetadata } from '@/lib/client/chat';
import { ChatMessage, User, ChatParticipantInfo, Chat } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Paperclip, X, CheckCheck, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const ReadReceipt = ({ message, currentUserId, otherUser }: { message: ChatMessage; currentUserId: string, otherUser: ChatParticipantInfo | null }) => {
    if (message.senderId !== currentUserId) {
        return null;
    }
    const isRead = otherUser ? message.readBy.includes(otherUser.id) : false;
    return (
        <CheckCheck className={cn("h-4 w-4 ml-1", isRead ? "text-blue-500" : "text-muted-foreground")} />
    );
};


const ChatMessageBubble = ({ message, isCurrentUser, otherUser, currentUserId }: { message: ChatMessage, isCurrentUser: boolean, otherUser: ChatParticipantInfo | null, currentUserId: string }) => {
  return (
    <div className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
      {!isCurrentUser && otherUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
      )}
      <div className={cn(
        "max-w-xs md:max-w-md rounded-lg p-3",
        isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {message.mediaUrl && (
            <div className="relative aspect-video w-full mb-2 bg-muted rounded-md overflow-hidden">
                <Image src={message.mediaUrl} alt="Chat image" fill className="object-cover" />
            </div>
        )}
        {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
        <div className={cn("text-xs mt-1 flex items-center", isCurrentUser ? "text-primary-foreground/70 justify-end" : "text-muted-foreground/70 justify-start")}>
            <span>{message.timestamp ? format(message.timestamp.toDate(), 'p') : 'sending...'}</span>
            {isCurrentUser && <ReadReceipt message={message} currentUserId={currentUserId} otherUser={otherUser} />}
        </div>
      </div>
    </div>
  );
};


export default function ChatConversationPage({ params }: { params: { chatId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { chatId } = params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMetadata, setChatMetadata] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const otherUser = useMemo(() => {
    if (!user || !chatMetadata) return null;
    const otherUserId = chatMetadata.participants.find(p => p !== user.id);
    if (!otherUserId) return null;
    return chatMetadata.participantInfo[otherUserId];
  }, [user, chatMetadata]);
  
  const isOtherUserTyping = useMemo(() => {
      if (!otherUser || !chatMetadata?.isTyping) return false;
      const otherUserId = Object.keys(chatMetadata.isTyping).find(id => id !== user?.id);
      if (!otherUserId) return false;
      return chatMetadata.isTyping[otherUserId] ?? false;
  }, [otherUser, chatMetadata, user]);

  useEffect(() => {
    if (!user || !chatId) return;

    setLoading(true);
    
    // Listen for chat metadata (participants, isTyping)
    const metaUnsubscribe = listenForChatMetadata(chatId, (chatData) => {
        setChatMetadata(chatData);
        setLoading(false);
    });
    
    // Listen for messages and mark them as read
    const messagesUnsubscribe = listenForMessages(chatId, (newMessages) => {
      setMessages(newMessages);
      const unreadMessageIds = newMessages
        .filter(m => m.senderId !== user.id && !m.readBy.includes(user.id))
        .map(m => m.id);
      
      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(chatId, user.id, unreadMessageIds);
      }
    });

    return () => {
        metaUnsubscribe();
        messagesUnsubscribe();
    };
  }, [user, chatId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !otherUser || (!newMessage.trim() && !mediaFile) || sending) return;

    setSending(true);
    await sendMessage(chatId, user.id, otherUser.id, newMessage, mediaFile ?? undefined);
    
    // Reset form state
    setNewMessage('');
    setMediaFile(null);
    setMediaPreview(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    setSending(false);
  };
  
  const handleTyping = (e: ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    setNewMessage(e.target.value);
    
    // Set typing to true immediately
    setTypingStatus(chatId, user.id, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a new timeout to mark as not typing
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(chatId, user.id, false);
    }, 2000); // User is considered "not typing" after 2 seconds of inactivity
  }
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
          setMediaFile(file);
          setMediaPreview(URL.createObjectURL(file));
      }
  }

  if (loading) {
    return (
      <Card className="h-[calc(100vh-10rem)] flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4 p-4 border-b">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 space-y-4">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-16 w-3/4 ml-auto" />
          <Skeleton className="h-24 w-1/2" />
        </CardContent>
        <CardFooter className="p-4 border-t">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (!user || !otherUser) {
    return <div className="p-8 text-center">Chat not found or user not authenticated.</div>;
  }

  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.push('/chat')}>
          <ArrowLeft />
        </Button>
        <Avatar>
          <AvatarImage src={otherUser.avatar} />
          <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle>{otherUser.sudoName}</CardTitle>
          <p className="text-xs text-muted-foreground h-4">
            {isOtherUserTyping ? <span className="italic text-primary">typing...</span> : `@${otherUser.name}`}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
           <div className="p-4 space-y-4">
            {messages.map(msg => (
                <ChatMessageBubble key={msg.id} message={msg} isCurrentUser={msg.senderId === user.id} otherUser={otherUser} currentUserId={user.id} />
            ))}
           </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="w-full space-y-2">
           {mediaPreview && (
                <div className="relative w-24 h-24">
                    <Image src={mediaPreview} alt="media preview" fill className="rounded-md object-cover" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                        disabled={sending}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleTyping}
                    disabled={sending}
                />
                 <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={sending}>
                    <Paperclip />
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button type="submit" disabled={(!newMessage.trim() && !mediaFile) || sending}>
                    {sending ? <Loader2 className="animate-spin" /> : <Send />}
                </Button>
            </div>
        </form>
      </CardFooter>
    </Card>
  );
}
