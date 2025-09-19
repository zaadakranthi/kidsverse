
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { achievements as allAchievements } from '@/lib/data';
import {
  Languages,
  Book,
  Heart,
  Medal,
  Clock,
  MapPin,
  Target,
  Handshake,
  BookCopy,
  Users as UsersIcon,
  UserCheck,
  Shield,
  Wallet,
  Database,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Edit,
} from 'lucide-react';
import { PostCard } from '@/components/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Post } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { getPosts } from '@/lib/services/posts';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { user: initialUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
     if (initialUser) {
        setCurrentUser(initialUser);
     }
  }, [initialUser]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      setLoadingPosts(false);
    };
    fetchPosts();
  }, []);

  if (!currentUser) {
      return <div>Loading...</div>
  }

  const userPosts = posts.filter((post) => post.authorInfo.id === currentUser.id);

  const handleProfileUpdate = (updatedUser: Partial<User>) => {
    setCurrentUser(prev => prev ? ({...prev, ...updatedUser}) : null);
  }
  
  const getTierColor = (tier: 'bronze' | 'silver' | 'gold') => {
    switch (tier) {
      case 'bronze': return 'text-orange-400';
      case 'silver': return 'text-slate-400';
      case 'gold': return 'text-yellow-500';
    }
  }

  return (
    <>
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-1">
        <Card>
          <CardContent className="p-6 text-center">
            <Avatar className="mx-auto mb-4 h-24 w-24">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold font-headline">
              {currentUser.sudoName}
            </h2>
            <p className="text-sm text-muted-foreground">@{currentUser.name}</p>
            <p className="text-muted-foreground mt-2">
              {currentUser.class} @ {currentUser.school}
            </p>
            <Dialog>
                <DialogTrigger asChild>
                     <Button className="mt-4 w-full">
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                </DialogTrigger>
                <EditProfileDialog user={currentUser} onProfileUpdate={handleProfileUpdate} />
            </Dialog>
             <div className='flex justify-around mt-4'>
                <div className='text-center'>
                    <p className='font-bold text-lg'>125</p>
                    <p className='text-xs text-muted-foreground flex items-center gap-1'><UsersIcon className='h-3 w-3'/>Followers</p>
                </div>
                <div className='text-center'>
                    <p className='font-bold text-lg'>{currentUser.following.length}</p>
                    <p className='text-xs text-muted-foreground flex items-center gap-1'><UserCheck className='h-3 w-3'/>Following</p>
                </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span>
                {currentUser.area}, {currentUser.state}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <BookCopy className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span>Syllabus: {currentUser.syllabus}</span>
            </div>
            <div className="flex items-start gap-2">
              <Languages className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span>Speaks {currentUser.languages.join(', ')}</span>
            </div>
            <div className="flex items-start gap-2">
              <Target className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                Sports:
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentUser.sports.map((sport) => (
                    <Badge key={sport} variant="secondary">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Heart className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span>Interests: Cricket, Coding</span>
            </div>
            <div className="flex items-start gap-2">
              <Handshake className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span>
                {currentUser.willing_to_tutor
                  ? 'Willing to tutor'
                  : 'Not available to tutor'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Parental Controls</CardTitle>
            <CardDescription>Manage your child's activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/parental-controls')} className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Manage Settings
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">My Posts</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-4 space-y-4">
            {loadingPosts ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => <PostCard.Skeleton key={i} />)}
                </div>
            ) : userPosts.length > 0 ? (
              userPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <Card className="flex h-64 flex-col items-center justify-center">
                <CardContent className="flex items-center justify-center pt-6">
                  <p className="text-muted-foreground">
                    You haven't posted anything yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>My Achievements</CardTitle>
                <CardDescription>Badges you've earned and can unlock through platform activities.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                 <TooltipProvider>
                  {allAchievements.map(achievement => {
                    const isUnlocked = currentUser.achievements.includes(achievement.id);
                    const Icon = achievement.icon;
                    return (
                      <Tooltip key={achievement.id}>
                        <TooltipTrigger asChild>
                           <div className={cn(
                              "flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center aspect-square transition-all",
                              isUnlocked ? "bg-accent/30 border-accent" : "bg-muted/50 opacity-60"
                           )}>
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-full",
                                isUnlocked ? "bg-accent" : "bg-muted-foreground/20"
                            )}>
                                {isUnlocked ? (
                                    <Icon className={cn("h-8 w-8", getTierColor(achievement.tier))} />
                                ) : (
                                    <Lock className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                            <p className="font-semibold text-sm">{achievement.title}</p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{achievement.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                 </TooltipProvider>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-6 w-6" /> Knowledge Coin Wallet
                </CardTitle>
                <CardDescription>View your coin balance and transaction history.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border bg-gradient-to-r from-primary/10 to-accent/10 p-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                    <div className="flex items-center justify-center gap-2">
                        <Database className="h-8 w-8 text-primary" />
                        <p className="text-4xl font-bold">{currentUser.coins.toLocaleString()}</p>
                    </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
                  <div className="space-y-2">
                    {currentUser.transactions.length > 0 ? (
                      currentUser.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", tx.type === 'earn' ? 'bg-green-100' : 'bg-red-100')}>
                               {tx.type === 'earn' ? <ArrowUpRight className="h-5 w-5 text-green-600"/> : <ArrowDownLeft className="h-5 w-5 text-red-600" />}
                            </div>
                            <div>
                              <p className="font-medium">{tx.description}</p>
                              <p className="text-sm text-muted-foreground">{tx.date}</p>
                            </div>
                          </div>
                           <p className={cn("font-semibold text-lg", tx.type === 'earn' ? 'text-green-600' : 'text-destructive')}>
                            {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
