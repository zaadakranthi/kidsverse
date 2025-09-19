
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { studyRooms as allRooms } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Users, Tv, Clock, Trophy, Database } from 'lucide-react';
import { CreateStudyRoomDialog } from '@/components/create-study-room-dialog';
import { useSearch } from '@/hooks/use-search';
import { StudyRoom } from '@/lib/types';
import { differenceInSeconds } from 'date-fns';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';

const Countdown = ({ to }: { to: string | Date }) => {
    const targetDate = typeof to === 'string' ? new Date(to) : to;
    const [time, setTime] = useState<number | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const calculateTime = () => differenceInSeconds(targetDate, new Date());
        setTime(calculateTime());
        
        const interval = setInterval(() => {
            const newTime = calculateTime();
            if (newTime <= 0) {
                clearInterval(interval);
                setTime(0);
            } else {
                setTime(newTime);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);
    
    if (!isClient || time === null) {
        // Render nothing on the server or on initial client render
        return <span className='font-mono text-xs'>...</span>;
    }

    if (time <= 0) return <span className="font-mono text-xs">Live Now</span>;

    const days = Math.floor(time / (24 * 60 * 60));
    const hours = Math.floor((time % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((time % (60 * 60)) / 60);
    const seconds = Math.floor(time % 60);

    return (
        <span className='font-mono text-xs'>
            {days > 0 && `${days}d `}
            {hours > 0 && `${hours}h `}
            {minutes > 0 && `${minutes}m `}
            {seconds}s
        </span>
    );
};

const subjects = [
  'All', 'Mathematics', 'Science', 'English', 'History', 'Geography', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 'Art', 'Music', 'Mythology', 'Entertainment', 'General Knowledge', 'Current Affairs', 'Environmental Science', 'Civics', 'Economics', 'Cooking', 'Debate', 'Talk Show'
];


export default function StudyRoomsPage() {
  const { user: currentUser } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>(allRooms);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateRoom = (roomData: Omit<StudyRoom, 'id' | 'host' | 'participants' | 'createdAt'>) => {
    if (!currentUser) return;
    const newRoom: StudyRoom = {
      ...roomData,
      id: `sr-${Date.now()}`,
      hostId: currentUser.id,
      hostInfo: { id: currentUser.id, name: currentUser.name, sudoName: currentUser.sudoName, avatar: currentUser.avatar, role: currentUser.role },
      participantIds: [],
      createdAt: new Date(),
    };
    setStudyRooms(prev => [newRoom, ...prev]);
  };

  const filteredRooms = studyRooms.filter(room => {
    const subjectMatch = subjectFilter === 'All' || room.subject.toLowerCase() === subjectFilter.toLowerCase();
    const searchMatch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) || room.description.toLowerCase().includes(searchQuery.toLowerCase());
    return subjectMatch && searchMatch;
  });

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className='space-y-1'>
            <h1 className="text-3xl font-bold font-headline">Live Events</h1>
            <p className="text-muted-foreground">Join study rooms, debates, and talk shows in real-time.</p>
        </div>
        <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Create New Event
            </Button>
        </DialogTrigger>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Input 
            placeholder="Search for events..." 
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by topic" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredRooms.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => {
            const isLive = room.startTime && room.endTime ? new Date() >= new Date(room.startTime) && new Date() <= new Date(room.endTime) : false;
            const isUpcoming = room.startTime ? new Date() < new Date(room.startTime) : false;

            return (
              <Card key={room.id} className="flex flex-col transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1.5'>
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription>{room.subject}</CardDescription>
                    </div>
                     <div className='flex items-center gap-2'>
                        {isLive && <Badge className="flex items-center gap-1 bg-green-500 text-white hover:bg-green-600"><Tv className='h-3 w-3'/>Live</Badge>}
                        {isUpcoming && room.startTime && <Badge variant="secondary" className="flex items-center gap-1"><Clock className='h-3 w-3'/>Upcoming: <Countdown to={room.startTime} /></Badge>}
                      </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
                   <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm font-medium">Host:</span>
                      <Avatar className="h-6 w-6">
                          <AvatarImage src={room.hostInfo.avatar} />
                          <AvatarFallback>{room.hostInfo.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{room.hostInfo.name}</span>
                  </div>
                  <div className='flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-4'>
                      {room.entryFee != null && room.entryFee > 0 && (
                          <div className='flex items-center gap-1.5'>
                              <Database className='h-4 w-4 text-primary'/>
                              <span className='font-medium'>{room.entryFee} Coins to Enter</span>
                          </div>
                      )}
                        {room.prize && (
                          <div className='flex items-center gap-1.5'>
                              <Trophy className='h-4 w-4 text-yellow-500'/>
                              <span className='font-medium'>Prize: {room.prize}</span>
                          </div>
                      )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{room.participantIds.length} participants</span>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/study-rooms/${room.id}`}>{isLive || !isUpcoming ? 'Join Room' : 'View Details'}</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <h3 className="text-xl font-medium">No events found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
    <CreateStudyRoomDialog 
      onCreateRoom={handleCreateRoom}
    />
    </Dialog>
  );
}
