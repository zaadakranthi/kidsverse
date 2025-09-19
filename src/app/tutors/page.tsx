
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, GraduationCap, BookOpen, Search, PlusCircle, Database, IndianRupee } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import { useToast } from '@/hooks/use-toast';
import { Tutor, User } from '@/lib/types';
import { BecomeTutorDialog } from '@/components/become-tutor-dialog';
import { format } from 'date-fns';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { getTutors, createTutor } from '@/lib/services/users';
import { Skeleton } from '@/components/ui/skeleton';

const subjects = [
  'All',
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
];

const TutorCardSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className='space-y-2'>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </div>
        </CardContent>
        <CardFooter className='flex-col items-stretch gap-2'>
             <Skeleton className="h-6 w-40 mx-auto" />
             <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);


export default function TutorsPage() {
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [subjectFilter, setSubjectFilter] = useState('All');
  const { toast } = useToast();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBecomeTutorDialogOpen, setBecomeTutorDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchTutors = async () => {
        try {
            setLoading(true);
            const fetchedTutors = await getTutors();
            setTutors(fetchedTutors);
        } catch (error) {
            console.error("Failed to fetch tutors", error);
            toast({
                variant: 'destructive',
                title: 'Error loading tutors',
                description: 'Could not load tutors from the database.'
            });
        } finally {
            setLoading(false);
        }
    }
    fetchTutors();
  }, [toast]);
  
  if (!authUser) {
      return <div>Loading...</div>;
  }
  const isAlreadyTutor = tutors.some(t => t.userId === authUser.id);

  const filteredTutors = tutors.filter((tutor) => {
    const subjectMatch =
      subjectFilter === 'All' || tutor.subjects.includes(subjectFilter);
    const searchMatch =
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.sudoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return subjectMatch && searchMatch;
  });

  const handleBookSession = (tutor: Tutor, method: 'coins' | 'cash') => {
    if (!authUser) return;
    if (method === 'coins') {
        if (authUser.coins < tutor.price_per_hour) {
            toast({
                variant: 'destructive',
                title: "Not Enough Coins",
                description: `You need ${tutor.price_per_hour} coins, but only have ${authUser.coins}.`,
            });
            return;
        }

        setAuthUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                coins: prevUser.coins - tutor.price_per_hour,
                transactions: [
                    {
                        id: `tx-spend-${Date.now()}`,
                        type: 'spend' as const,
                        description: `Booked session with ${tutor.sudoName}`,
                        amount: tutor.price_per_hour,
                        date: format(new Date(), 'PPP'),
                        paymentMethod: 'coins' as const,
                    },
                    ...prevUser.transactions
                ]
            };
        });
        
        toast({
          title: 'Booking Confirmed!',
          description: `${tutor.price_per_hour} coins were debited for your session with ${tutor.sudoName}.`,
        });

    } else { // Cash payment
         toast({
            title: 'Booking Confirmed!',
            description: `Your session request with ${tutor.sudoName} has been sent.`,
        });
    }
  };

  const handleBecomeTutor = async (data: Omit<Tutor, 'userId' | 'name' | 'sudoName' | 'avatar' | 'role' | 'class' | 'rating' | 'reviews'>) => {
    if (!authUser) return;
    try {
        const newTutor = await createTutor(data, authUser);
        setTutors(prev => [newTutor, ...prev]);
        setBecomeTutorDialogOpen(false);
        toast({
            title: 'You are now a Tutor!',
            description: 'Your profile is now listed for other students to book sessions.'
        });
    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'Failed to become tutor',
            description: 'There was an error submitting your application.'
        });
    }
  }

  return (
    <Dialog open={isBecomeTutorDialogOpen} onOpenChange={setBecomeTutorDialogOpen}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className='flex items-center gap-4'>
              <GraduationCap className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold font-headline">
                Find a Tutor
                </h1>
                <p className="text-muted-foreground">
                Book one-on-one tutoring sessions with expert teachers and senior
                students.
                </p>
              </div>
          </div>
          <div className='flex gap-4 items-center'>
              <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold">
                  <Database className="h-5 w-5 text-primary" />
                  <span>{authUser.coins} Coins</span>
              </div>
              {!isAlreadyTutor && (
                  <DialogTrigger asChild>
                      <Button>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Become a Tutor
                      </Button>
                  </DialogTrigger>
              )}
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for tutors or subjects..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by subject" />
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

        {loading ? (
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {[...Array(3)].map((_, i) => <TutorCardSkeleton key={i} />)}
            </div>
        ) : filteredTutors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredTutors.map((tutor) => {
              const canAffordWithCoins = authUser.coins >= tutor.price_per_hour;
              
              return (
                <Card key={tutor.userId} className="flex flex-col transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={tutor.avatar} />
                        <AvatarFallback>
                          {tutor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{tutor.sudoName}</CardTitle>
                        <CardDescription>
                          {tutor.role === 'teacher'
                            ? `Verified Teacher`
                            : `${tutor.class} Student`}
                        </CardDescription>
                        <div className="flex items-center gap-1 pt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold">{tutor.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({tutor.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <p className="text-sm text-muted-foreground h-16 line-clamp-3">
                      {tutor.bio}
                    </p>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Specializes in:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className='flex-col items-stretch gap-2'>
                    <div className="text-center font-bold text-lg flex items-center justify-center gap-2">
                        <Database className="h-5 w-5 text-primary"/>
                        {tutor.price_per_hour} Coins / hour
                        <span className='text-sm text-muted-foreground font-normal'>(approx. ₹{tutor.price_per_hour / 10})</span>
                    </div>
                    <Button
                      onClick={() => handleBookSession(tutor, canAffordWithCoins ? 'coins' : 'cash')}
                      className="w-full"
                      disabled={tutor.userId === authUser.id}
                    >
                      <GraduationCap className="mr-2 h-4 w-4" />
                      {tutor.userId === authUser.id 
                          ? "This is you" 
                          : canAffordWithCoins
                              ? 'Book with Coins'
                              : `Pay ₹${tutor.price_per_hour / 10} & Book`
                      }
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <h3 className="text-xl font-medium">No tutors found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
      <BecomeTutorDialog
          onBecomeTutor={handleBecomeTutor}
      />
    </Dialog>
  );
}
