
'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Video, Paperclip, X, Check, ChevronsUpDown, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Post } from '@/lib/types';

const postFormSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
  subject: z.string().min(1, 'Please select a subject.'),
  subCategory: z.string().optional(),
  type: z.enum(['video', 'qa']),
  videoUrl: z.string().optional(),
  imageUrl: z.string().optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

type CreatePostDialogProps = {
  postType: 'video' | 'qa';
  initialContent?: string;
  initialSubject?: string;
  onCreatePost: (postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'createdAt' | 'updatedAt' | 'commentsCount'>) => void;
};

const subjects = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'english', label: 'English' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'biology', label: 'Biology' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'physics', label: 'Physics' },
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'art', label: 'Art' },
  { value: 'music', label: 'Music' },
  { value: 'mythology', label: 'Mythology' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'general-knowledge', label: 'General Knowledge' },
  { value: 'current-affairs', label: 'Current Affairs' },
  { value: 'environmental-science', label: 'Environmental Science' },
  { value: 'civics', label: 'Civics' },
  { value: 'economics', label: 'Economics' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'games', label: 'Games & Challenges'},
];

const entertainmentCategories = ['Mini Skits', 'Dance', 'Music', 'Magic', 'Comedy', 'Puppet Shows', 'Storytelling', 'Tongue Twister Challenge'];
const artCategories = ['Painting', 'Sketching', 'Digital Art', 'DIY Craft', 'Art Attack'];


export function CreatePostDialog({
  postType,
  initialContent = '',
  initialSubject = '',
  onCreatePost,
}: CreatePostDialogProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: initialContent,
      subject: initialSubject,
      subCategory: '',
      type: postType,
      imageUrl: '',
      videoUrl: '',
    },
  });
  
  useEffect(() => {
      form.reset({
        content: initialContent,
        subject: initialSubject || (initialContent ? 'Games & Challenges' : ''),
        subCategory: postType === 'video' && initialSubject === 'Entertainment' ? 'Tongue Twister Challenge' : '',
        type: postType,
        imageUrl: '',
        videoUrl: '',
      });
  }, [initialContent, initialSubject, postType, form]);
  
  const selectedSubject = form.watch('subject');
  const imagePreview = form.watch('imageUrl');
  const videoPreview = form.watch('videoUrl');

  function onSubmit(data: PostFormValues) {
    onCreatePost(data);
    form.reset();
  }

  return (
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {postType === 'video' ? 'Share a Video' : 'Ask a Question'}
          </DialogTitle>
          <DialogDescription>
            {postType === 'video'
              ? 'Share your talent! Fun experiments, DIY crafts, skits, cultural performances, or cooking videos!'
              : 'Ask a question to get help from your peers and teachers.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {postType === 'video' ? 'Description' : 'Question'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        postType === 'video'
                          ? 'Describe your video...'
                          : 'What is your question?'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Subject</FormLabel>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? subjects.find(
                                (subject) => subject.label.toLowerCase() === field.value.toLowerCase()
                              )?.label ?? field.value
                            : "Select or type a subject"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command shouldFilter={true}>
                        <CommandInput 
                          placeholder="Search or add a subject..."
                          onValueChange={(search) => {
                            const exists = subjects.some(s => s.label.toLowerCase() === search.toLowerCase());
                            if (!exists) {
                                form.setValue('subject', search);
                            }
                          }}
                         />
                        <CommandEmpty>No subject found. You can add it.</CommandEmpty>
                        <CommandGroup>
                           <ScrollArea className="h-48">
                          {[...subjects].map((subject) => (
                            <CommandItem
                              value={subject.label}
                              key={subject.value}
                              onSelect={(currentValue) => {
                                const subjectLabel = subjects.find(s => s.label.toLowerCase() === currentValue.toLowerCase())?.label
                                form.setValue("subject", subjectLabel || currentValue);
                                setComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value && field.value.toLowerCase() === subject.label.toLowerCase()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {subject.label}
                            </CommandItem>
                          ))}
                          </ScrollArea>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedSubject?.toLowerCase() === 'entertainment' && (
               <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entertainment Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {entertainmentCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
             {selectedSubject?.toLowerCase() === 'art' && (
               <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Art Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {artCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

            <FormField
                control={form.control}
                name={postType === 'video' ? "videoUrl" : "imageUrl"}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{postType === 'video' ? 'Video URL' : 'Image URL'} (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder={
                                postType === 'video' 
                                ? "e.g., https://youtube.com/watch?v=..." 
                                : "e.g., https://picsum.photos/..."
                            } {...field} />
                        </FormControl>
                         {imagePreview && postType === 'qa' && (
                            <div className="mt-2 relative">
                                <Image src={imagePreview} width={475} height={267} alt="Image preview" className="rounded-md" />
                            </div>
                        )}
                        {videoPreview && postType === 'video' && (
                          <div className='mt-2 relative'>
                              <video src={videoPreview} className="w-full rounded-md" controls />
                          </div>
                        )}
                        <FormMessage />
                    </FormItem>
                )}
            />
            <DialogFooter>
              <Button type="submit">Post</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
  );
}
