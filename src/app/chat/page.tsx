
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { startChat } from '@/lib/services/chat';
import { getUserChats } from '@/lib/client/chat';
import { Chat, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, PlusCircle } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getUsers } from '@/lib/services/users';
import { useToast } from '@/hooks/use-toast';

function ChatList({ chats, currentUserId }: { chats: Chat[], currentUserId: string }) {
  const router = useRouter();

  const getOtherParticipant = (chat: Chat) => {
    const otherId = chat.participants.find(p => p !== currentUserId);
    if (!otherId || !chat.participantInfo) return null;
    return chat.participantInfo[otherId];
  };

  return (
    <div className="space-y-2">
      {chats.map(chat => {
        const otherUser = getOtherParticipant(chat);
        if (!otherUser) return null;
        return (
          <div
            key={chat.id}
            className="flex items-center gap-4 rounded-lg p-3 hover:bg-muted cursor-pointer transition-colors"
            onClick={() => router.push(`/chat/${chat.id}`)}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between">
                <p className="font-semibold">{otherUser.sudoName}</p>
                {chat.lastTimestamp && (
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(chat.lastTimestamp.toDate(), { addSuffix: true })}
                    </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {chat.lastSenderId === currentUserId && 'You: '}{chat.lastMessage || 'No messages yet...'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ChatsPage() {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();


  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    
    if (!user) {
        router.push('/login');
        return;
    };
    
    const unsubscribe = getUserChats(user.id, (userChats) => {
      setChats(userChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, router]);

  const handleStartNewChat = async (otherUser: User) => {
    if (!user) return;
    setIsNewChatOpen(false);
    const newChat = await startChat(user, otherUser);
    router.push(`/chat/${newChat.id}`);
  }
  
  useEffect(() => {
    if (isNewChatOpen && allUsers.length === 0) {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const fetchedUsers = await getUsers();
          setAllUsers(fetchedUsers.filter(u => u.id !== user?.id));
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error fetching users' });
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [isNewChatOpen, allUsers.length, toast, user]);
  
  const potentialChatPartners = allUsers.filter(u => 
    (u.sudoName.toLowerCase().includes(searchQuery.toLowerCase()) || u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  if (loading || authLoading) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
             <Card>
                <CardContent className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    </div>
                ))}
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className='space-y-1'>
              <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-primary" />
                My Chats
              </h1>
              <p className="text-muted-foreground">Your recent conversations.</p>
          </div>
          <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                  <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Chat
                  </Button>
              </DialogTrigger>
              <DialogContent className="p-0">
                  <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Start a new chat</DialogTitle>
                    <DialogDescription>Search for a student or teacher to start a conversation with.</DialogDescription>
                  </DialogHeader>
                  <Command>
                      <CommandInput 
                        placeholder="Search for a user to chat with..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                          {loadingUsers ? (
                            <CommandEmpty>Loading users...</CommandEmpty>
                          ) : potentialChatPartners.length === 0 ? (
                            <CommandEmpty>No users found.</CommandEmpty>
                          ) : (
                          <CommandGroup heading="Students & Teachers">
                              {potentialChatPartners.map(pUser => (
                                  <CommandItem key={pUser.id} onSelect={() => handleStartNewChat(pUser)} className="cursor-pointer">
                                      <Avatar className="mr-2 h-8 w-8">
                                          <AvatarImage src={pUser.avatar} />
                                          <AvatarFallback>{pUser.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div className='flex justify-between items-center w-full'>
                                        <span>{pUser.sudoName}</span>
                                        <span className='text-xs text-muted-foreground'>@{pUser.name}</span>
                                      </div>
                                  </CommandItem>
                              ))}
                          </CommandGroup>
                          )}
                      </CommandList>
                  </Command>
              </DialogContent>
          </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          {chats.length > 0 ? (
            <ChatList chats={chats} currentUserId={user!.id} />
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">You have no active chats.</p>
              <p className="text-muted-foreground text-sm">Click "New Chat" to start a conversation.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
