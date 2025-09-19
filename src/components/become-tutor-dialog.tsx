
'use client';

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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Tutor } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const tutorFormSchema = z.object({
  bio: z.string().min(20, 'Bio must be at least 20 characters long.'),
  subjects: z.string().min(3, 'Please list at least one subject.'),
  price_per_hour: z.coerce.number().min(10, 'Price must be at least 10 coins per hour.'),
});

// We create a separate type for the output after transform
type TutorFormSubmitValues = Omit<z.infer<typeof tutorFormSchema>, 'subjects'> & {
  subjects: string[];
}


type BecomeTutorDialogProps = {
  onBecomeTutor: (data: Omit<Tutor, 'userId' | 'name' | 'sudoName' | 'avatar' | 'role' | 'class' | 'rating' | 'reviews'>) => void;
};

export function BecomeTutorDialog({
  onBecomeTutor,
}: BecomeTutorDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof tutorFormSchema>>({
    resolver: zodResolver(tutorFormSchema),
    defaultValues: {
      bio: '',
      subjects: '',
      price_per_hour: 50,
    },
  });

  function onSubmit(data: z.infer<typeof tutorFormSchema>) {
    const transformedData = {
        ...data,
        subjects: data.subjects.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };
    onBecomeTutor(transformedData);
    form.reset();
  }

  return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Become a Tutor</DialogTitle>
          <DialogDescription>
            Share your knowledge with other students and earn Knowledge Coins.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[60vh] p-1">
              <div className="space-y-4 pr-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell students about your teaching style, expertise, and what makes you a great tutor."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subjects You Teach (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Physics, Mathematics, English"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="price_per_hour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Hour (in Knowledge Coins)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="submit">Submit Application</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
  );
}
