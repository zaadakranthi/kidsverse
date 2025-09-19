
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { quests as initialQuests } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Rocket, Flag, Video, MessageSquare, BookA, Check, Award } from 'lucide-react';
import type { Quest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useAuth } from '@/hooks/use-auth';

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const { toast } = useToast();
  const { user } = useAuth();
  
  if (!user) {
      return <div>Loading...</div>;
  }

  const getStepIcon = (type: Quest['steps'][0]['type']) => {
    switch(type) {
      case 'watch_video': return <Video className="h-4 w-4" />;
      case 'answer_question': return <MessageSquare className="h-4 w-4" />;
      case 'complete_quiz': return <BookA className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getStepLink = (step: Quest['steps'][0]) => {
      switch(step.type) {
        case 'watch_video':
        case 'answer_question':
            // In a real app, you would link to a specific post page, e.g. /posts/${step.targetId}
            // For this demo, we link to the homepage where the post might be visible.
            return '/'; 
        case 'complete_quiz':
            return `/brain-games/${step.targetId}`;
        default:
            return '#';
      }
  }
  
  const handleClaimReward = (questId: string, reward: number) => {
    // In a real app, you'd update user state and make a backend call
    toast({
        title: "Quest Complete!",
        description: `Congratulations! You have earned ${reward} Knowledge Coins.`,
    });
    // Maybe disable the button or mark the quest as claimed
  }

  return (
    <div className="space-y-8">
       <div className='flex items-center gap-4'>
            <Rocket className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold font-headline">Learning Quests</h1>
              <p className="text-muted-foreground">
                  Follow guided paths to master subjects and earn big rewards!
              </p>
            </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {quests.map((quest) => {
          const completedSteps = quest.steps.filter(s => s.isCompleted).length;
          const totalSteps = quest.steps.length;
          const progress = (completedSteps / totalSteps) * 100;
          const isCompleted = completedSteps === totalSteps;

          return (
             <Card key={quest.id} className="flex flex-col transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                    <quest.icon className="w-10 h-10 text-primary" />
                    <Badge variant="outline" className="font-semibold">{quest.subject}</Badge>
                </div>
                <CardTitle>{quest.title}</CardTitle>
                <CardDescription>{quest.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="steps">
                    <AccordionTrigger className="text-sm font-semibold">
                      View Steps ({completedSteps}/{totalSteps})
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-3 mt-2">
                        {quest.steps.map(step => (
                          <li key={step.id} className="flex items-center gap-3 text-sm">
                             <div className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full",
                                step.isCompleted ? 'bg-green-500 text-white' : 'bg-muted'
                            )}>
                                {step.isCompleted ? <Check className="h-4 w-4" /> : getStepIcon(step.type)}
                            </div>
                            <Link href={getStepLink(step)} className={cn("hover:underline", step.isCompleted && 'text-muted-foreground line-through')}>
                               {step.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="mt-4">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1.5 text-right">{Math.round(progress)}% Complete</p>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2">
                <Button disabled={!isCompleted} onClick={() => handleClaimReward(quest.id, quest.reward)}>
                  <Award className="mr-2 h-4 w-4" />
                  {isCompleted ? `Claim ${quest.reward} Coins` : 'Complete All Steps'}
                </Button>
                {!isCompleted && (
                    <Button asChild variant="secondary">
                        <Link href={`/subjects/${quest.subject.toLowerCase()}`}>
                            Continue Quest <Flag className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
