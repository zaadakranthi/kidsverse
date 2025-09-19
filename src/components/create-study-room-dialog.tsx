
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { awardPoints } from '@/ai/flows/award-points';
import { StudyRoom } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { currentUser } from '@/lib/data';


const roomFormSchema = z.object({
  name: z.string().min(5, 'Room name must be at least 5 characters long.'),
  subject: z.string().min(1, 'Please select a subject.'),
  description: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  entryFee: z.coerce.number().optional(),
  prize: z.string().optional(),
}).refine(data => {
    if (data.startTime && data.endTime) {
      return data.endTime > data.startTime;
    }
    return true;
}, {
    message: "End time must be after start time.",
    path: ["endTime"],
});


type RoomFormValues = z.infer<typeof roomFormSchema>;

type CreateStudyRoomDialogProps = {
  onCreateRoom: (roomData: Omit<StudyRoom, 'id' | 'host' | 'participants' | 'createdAt'>) => void;
};

const subjects = [
  'Mathematics', 'Science', 'English', 'History', 'Geography', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 'Art', 'Music', 'Mythology', 'Entertainment', 'General Knowledge', 'Current Affairs', 'Environmental Science', 'Civics', 'Economics', 'Cooking', 'Debate', 'Talk Show'
];

export function CreateStudyRoomDialog({
  onCreateRoom,
}: CreateStudyRoomDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: '',
      subject: '',
      description: ''
    },
  });

  async function onSubmit(data: RoomFormValues) {
    if (!currentUser) {
        toast({
            variant: "destructive",
            title: 'Not Logged In',
            description: 'You must be logged in to create an event.'
        })
        return;
    }

    setIsSubmitting(true);
    
    // Pass the created room data to the parent page
    onCreateRoom(data);

    try {
      // Call the AI flow to award points
      const pointsResult = await awardPoints({
        userId: currentUser.id,
        action: 'CREATE_STUDY_ROOM'
      });
      
      toast({
        title: 'Event Created & Coins Earned!',
        description: `You've earned ${pointsResult.pointsAwarded} Knowledge Coins.`,
      });

    } catch (error) {
       console.error("Failed to award points:", error);
       toast({
        variant: "destructive",
        title: 'Event Created!',
        description: `The event was created, but we failed to award points.`,
      });
    } finally {
        setIsSubmitting(false);
        form.reset();
    }
  }
  
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          Create a New Event
        </DialogTitle>
        <DialogDescription>
          Fill in the details for your study session, debate, or talk show.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Event Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Algebra Avengers" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic / Subject</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What will this event focus on?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                  <FormItem className="flex flex-col">
                  <FormLabel>Start Time</FormLabel>
                  <Popover>
                      <PopoverTrigger asChild>
                      <FormControl>
                          <Button
                          variant={"outline"}
                          className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                          )}
                          >
                          {field.value ? (
                              format(field.value, "PPP")
                          ) : (
                              <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                      </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                      />
                      </PopoverContent>
                  </Popover>
                  <FormMessage />
                  </FormItem>
              )}
          />
           <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                  <FormItem className="flex flex-col">
                  <FormLabel>End Time</FormLabel>
                  <Popover>
                      <PopoverTrigger asChild>
                      <FormControl>
                          <Button
                          variant={"outline"}
                          className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                          )}
                          >
                          {field.value ? (
                              format(field.value, "PPP")
                          ) : (
                              <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                      </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                      />
                      </PopoverContent>
                  </Popover>
                  <FormMessage />
                  </FormItem>
              )}
          />
          <FormField
              control={form.control}
              name="entryFee"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Entry Fee (Coins)</FormLabel>
                  <FormControl>
                      <Input type="number" placeholder="e.g., 10" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
          />
          <FormField
              control={form.control}
              name="prize"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Prize</FormLabel>
                  <FormControl>
                      <Input placeholder="e.g., 500 Coins" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => form.reset()} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
