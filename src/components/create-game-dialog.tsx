
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import type { Game, GameType, QuizQuestion, WordScramble } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { PlusCircle, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useEffect } from 'react';
import { currentUser } from '@/lib/data';

const questionSchema = z.object({
    question: z.string().min(5, "Question must be at least 5 characters."),
    options: z.array(z.string().min(1, "Option cannot be empty.")).length(4, "Please provide 4 options."),
    correctAnswer: z.string().min(1, "Please select a correct answer."),
});

const gameFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  gameType: z.enum(['Quiz', 'Math Puzzle', 'Riddle']),
  questions: z.array(questionSchema).optional(),
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

type GameFormValues = z.infer<typeof gameFormSchema>;

type CreateGameDialogProps = {
  onCreateGame: (game: Omit<Game, 'icon' | 'slug' | 'creator' | 'id'>) => void;
};

const defaultValues: GameFormValues = {
      title: '',
      description: '',
      gameType: 'Quiz',
      questions: [],
      entryFee: 0,
      prize: ''
};

export function CreateGameDialog({
  onCreateGame,
}: CreateGameDialogProps) {

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: defaultValues,
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: 'questions',
  });
  
  const gameType = form.watch('gameType');

  useEffect(() => {
    const currentValues = form.getValues();
    form.reset({ 
        ...defaultValues,
        title: currentValues.title,
        description: currentValues.description,
        gameType: currentValues.gameType,
        questions: [] 
    });
  }, [gameType, form]);

  function onSubmit(data: GameFormValues) {
    onCreateGame(data);
    form.reset(defaultValues);
  }

  const addNewQuestion = () => {
    appendQuestion({ question: '', options: ['', '', '', ''], correctAnswer: '' });
  };
  
  const handleCorrectAnswerChange = (questionIndex: number, value: string) => {
    form.setValue(`questions.${questionIndex}.correctAnswer`, value);
  }
  
  const renderGameFields = () => {
    switch(gameType) {
        case 'Quiz':
        case 'Math Puzzle':
            return (
                 <div>
                    <h3 className="text-lg font-semibold mb-2">{gameType} Questions</h3>
                    <div className="space-y-6">
                        {questionFields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-lg space-y-4 bg-background/50 relative">
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.question`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question {index + 1}</FormLabel>
                                            <FormControl><Input placeholder={gameType === 'Math Puzzle' ? "e.g., What is 2 + 2?" : "What is the capital of India?"} {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-2">
                                    <Label>Options & Correct Answer</Label>
                                    <FormField
                                        control={form.control}
                                        name={`questions.${index}.correctAnswer`}
                                        render={({ field }) => (
                                            <FormItem>
                                            <RadioGroup onValueChange={(value) => handleCorrectAnswerChange(index, value)} value={form.watch(`questions.${index}.correctAnswer`)} className="grid grid-cols-2 gap-4">
                                                {[0,1,2,3].map(optionIndex => (
                                                        <FormField
                                                        key={optionIndex}
                                                        control={form.control}
                                                        name={`questions.${index}.options.${optionIndex}`}
                                                        render={({ field: optionField }) => (
                                                            <FormItem className="flex items-center gap-2 space-y-0">
                                                                    <FormControl>
                                                                    <RadioGroupItem value={optionField.value} id={`q${index}-o${optionIndex}`} />
                                                                    </FormControl>
                                                                <Input placeholder={`Option ${optionIndex + 1}`} {...optionField} className="flex-1" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </RadioGroup>
                                                <FormMessage>{form.formState.errors.questions?.[index]?.correctAnswer?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />

                                    <FormDescription>
                                        Type the 4 options above and select the correct one by clicking the radio button.
                                    </FormDescription>
                                </div>
                                <Button type="button" variant="destructive" size="icon" className="absolute -top-3 -right-3 h-7 w-7" onClick={() => removeQuestion(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                        <Button type="button" variant="outline" onClick={addNewQuestion} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Question
                    </Button>
                </div>
            )
        default:
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">Manual creation for "{gameType}" is not yet supported.</p>
                    <p className="text-xs text-muted-foreground mt-1">This game type uses daily rotating content.</p>
                </div>
            );
    }
  }

  return (
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create a New Game</DialogTitle>
          <DialogDescription>
            Fill out the form below to manually create a new game for the community.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <ScrollArea className="h-[70vh] p-4 border rounded-md">
                <div className='space-y-4'>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Game Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Indian History Challenge" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="A brief, engaging description of the game."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="gameType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Game Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a game type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Quiz">Quiz (MCQ)</SelectItem>
                              <SelectItem value="Math Puzzle">Math Puzzle</SelectItem>
                              <SelectItem value="Riddle">Riddle (Not Creatable)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <h3 className="text-lg font-semibold">Scheduling & Prizes (Optional)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>


                    <Separator />

                   {renderGameFields()}
                </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => form.reset()}>Cancel</Button>
              <Button type="submit">Create Game</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
  );
}
