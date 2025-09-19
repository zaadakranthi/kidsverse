
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { Gamepad2, Award, CheckCircle2, XCircle, Share2, MessageCircle, RotateCw, Clock, Database, Trophy, Star, PlayCircle, Copy, HelpCircle, ChevronsRight, Sparkles, Video, Mic, StopCircle } from 'lucide-react';
import { games as allGames, gameScores, addPost, currentUser, sponsoredPost, wordScrambleData, tongueTwisterData, riddleData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { awardPoints } from '@/ai/flows/award-points';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { cn } from '@/lib/utils';
import { Post, Game } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import Confetti from 'react-confetti';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const memoryCardValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const createShuffledDeck = () => {
  const deck = [...memoryCardValues, ...memoryCardValues];
  return deck
    .map((value) => ({ value, id: Math.random() }))
    .sort(() => Math.random() - 0.5)
    .map((card, index) => ({ ...card, index, isFlipped: false, isMatched: false }));
};

const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}


export default function BrainGamePage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const { toast } = useToast();
    const game = allGames.find((g) => g.slug === slug);

    // Quiz state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [quizFinished, setQuizFinished] = useState(false);
    const [score, setScore] = useState(0);
    
    // Series Games state
    const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0);
    const [seriesInput, setSeriesInput] = useState('');
    const [seriesFinished, setSeriesFinished] = useState(false);
    const [seriesAttempts, setSeriesAttempts] = useState(0);

    // Memory match state
    const [memoryCards, setMemoryCards] = useState(createShuffledDeck());
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [memoryGameMoves, setMemoryGameMoves] = useState(0);
    const [memoryGameFinished, setMemoryGameFinished] = useState(false);
    
    // Daily dynamic content
    const [dailyScrambles, setDailyScrambles] = useState(wordScrambleData.slice(0, 5));
    const [dailyTwisters, setDailyTwisters] = useState(tongueTwisterData.slice(0, 5));
    const [dailyRiddles, setDailyRiddles] = useState(riddleData.slice(0, 5));
    
    const [showConfetti, setShowConfetti] = useState(false);

    // Tongue Twister Video Recording State
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Get camera permission for Tongue Twister game
    useEffect(() => {
        if (game?.gameType === 'Tongue Twister') {
            const getCameraPermission = async () => {
                if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
                    try {
                        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                        setStream(mediaStream);
                        if (videoRef.current) {
                            videoRef.current.srcObject = mediaStream;
                        }
                        setHasCameraPermission(true);
                    } catch (error) {
                        console.error('Error accessing camera:', error);
                        setHasCameraPermission(false);
                        toast({
                            variant: 'destructive',
                            title: 'Camera Access Denied',
                            description: 'Please enable camera permissions in your browser to record your video.',
                        });
                    }
                }
            };
            getCameraPermission();
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [game?.gameType, toast, stream]);

    const handleStartRecording = () => {
        if (stream) {
            setRecordedVideoUrl(null);
            setIsRecording(true);
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            const chunks: Blob[] = [];
            recorder.ondataavailable = (event) => {
                if(event.data.size > 0) chunks.push(event.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedVideoUrl(url);
            };
            recorder.start();
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleShareVideo = (postData: Omit<Post, 'id' | 'authorInfo' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'class'>) => {
        const newPost: Post = {
            ...postData,
            id: `post-${Date.now()}`,
            authorInfo: { id: currentUser.id, name: currentUser.name, sudoName: currentUser.sudoName, avatar: currentUser.avatar },
            authorId: currentUser.id,
            timestamp: 'Just now',
            likes: 0,
            comments: [],
            shares: 0,
            class: currentUser.class,
            videoUrl: recordedVideoUrl ?? undefined,
            commentsCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        addPost(newPost);
        toast({
            title: 'Post Shared!',
            description: 'Your tongue twister challenge has been shared to the feed.'
        });
        setRecordedVideoUrl(null);
    }


    useEffect(() => {
        const dayOfYear = getDayOfYear();
        const scrambleStart = (dayOfYear * 5) % wordScrambleData.length;
        setDailyScrambles(wordScrambleData.slice(scrambleStart, scrambleStart + 5));

        const twisterStart = (dayOfYear * 5) % tongueTwisterData.length;
        setDailyTwisters(tongueTwisterData.slice(twisterStart, twisterStart + 5));
        
        const riddleStart = (dayOfYear * 5) % riddleData.length;
        setDailyRiddles(riddleData.slice(riddleStart, riddleStart + 5));

    }, []);

    const handleAwardPoints = async () => {
        try {
            const pointsResult = await awardPoints({
                userId: currentUser.id,
                action: 'PLAY_BRAIN_GAME'
            });
             toast({
                title: 'Points Awarded!',
                description: `You've earned ${pointsResult.pointsAwarded} Knowledge Coins for completing the game.`
            });
        } catch (error) {
            console.error("Failed to award points:", error);
             toast({
                variant: 'destructive',
                title: 'Error Awarding Points',
                description: 'There was an issue awarding your points. Please try again later.',
            });
        }
    }


    useEffect(() => {
        if (flippedCards.length !== 2) return;

        const timer = setTimeout(() => {
            const [firstIndex, secondIndex] = flippedCards;
            const firstCard = memoryCards[firstIndex];
            const secondCard = memoryCards[secondIndex];

            if (firstCard.value === secondCard.value) {
                setMemoryCards(prev => prev.map(card => 
                    card.index === firstIndex || card.index === secondIndex ? { ...card, isMatched: true } : card
                ));
            } else {
                setMemoryCards(prev => prev.map(card =>
                    (card.index === firstIndex || card.index === secondIndex) ? { ...card, isFlipped: false } : card
                ));
            }
            setFlippedCards([]);
        }, 1000);

        return () => clearTimeout(timer);

    }, [flippedCards, memoryCards]);

    useEffect(() => {
        if(memoryCards.length > 0 && !memoryGameFinished) {
            const allMatched = memoryCards.every(card => card.isMatched);
            if (allMatched) {
                setMemoryGameFinished(true);
                handleAwardPoints();
                toast({
                    title: "You Win!",
                    description: `You completed the memory game in ${memoryGameMoves} moves.`
                })
            }
        }
    }, [memoryCards, memoryGameMoves, toast, memoryGameFinished, handleAwardPoints]);


    if (!game) {
        notFound();
    }

    const isQuiz = (game.gameType === 'Quiz' || game.gameType === 'Math Puzzle') && game.questions && game.questions.length > 0;
    const currentQuestion = isQuiz ? game.questions![currentQuestionIndex] : null;
    const topScores = gameScores.filter(s => s.gameId === game.id).sort((a,b) => b.score - a.score).slice(0, 5);


    const handleAnswerChange = (value: string) => {
        setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }));
    };
    
    const handleNextQuestion = () => {
        if (!isQuiz || !currentQuestion) return;

        const isCorrect = selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer;
        if(isCorrect) setScore(s => s + 1);

        if (currentQuestionIndex < game.questions!.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            const finalScore = score + (isCorrect ? 1 : 0);
            setScore(finalScore);
            setQuizFinished(true);
            if(finalScore / game.questions!.length >= 0.7) {
                setShowConfetti(true);
            }
            toast({
                title: 'Quiz Complete!',
                description: `You scored ${finalScore} out of ${game.questions!.length}.`
            });
            handleAwardPoints();
        }
    };
    
    const handleSeriesSubmit = () => {
        let isCorrect = false;
        let answer = '';
        if (game.gameType === 'Word Scramble') {
            answer = dailyScrambles[currentSeriesIndex].answer;
            isCorrect = seriesInput.trim().toUpperCase() === answer.toUpperCase();
        } else if (game.gameType === 'Riddle') {
            answer = dailyRiddles[currentSeriesIndex].answer;
            isCorrect = seriesInput.trim().toLowerCase() === answer.toLowerCase();
        }

        if(isCorrect) {
            toast({
                title: "Correct!",
                description: game.gameType === 'Word Scramble' ? `You unscrambled the word "${answer}"!` : 'You solved the riddle!',
            });
            
            if ((game.gameType === 'Word Scramble' && currentSeriesIndex === dailyScrambles.length -1) || (game.gameType === 'Riddle' && currentSeriesIndex === dailyRiddles.length -1)) {
                setSeriesFinished(true);
                handleAwardPoints();
            } else {
                setCurrentSeriesIndex(prev => prev + 1);
            }
            setSeriesInput('');
            setSeriesAttempts(0);
        } else {
             setSeriesAttempts(prev => prev + 1);
            toast({
                variant: 'destructive',
                title: "Incorrect",
                description: "That's not the right answer. Keep trying!"
            })
        }
    };
    
    const handleNextTwister = () => {
        if(currentSeriesIndex < dailyTwisters.length - 1) {
            setCurrentSeriesIndex(prev => prev + 1);
            setRecordedVideoUrl(null);
        } else {
            setSeriesFinished(true);
            handleAwardPoints();
        }
    }
    
    const handleViewAnswer = () => {
        let answer = '';
        if (game.gameType === 'Word Scramble') answer = dailyScrambles[currentSeriesIndex].answer;
        if (game.gameType === 'Riddle' && dailyRiddles[currentSeriesIndex]) answer = dailyRiddles[currentSeriesIndex].answer;
        toast({
            title: "Answer Revealed",
            description: `The correct answer is "${answer}".`,
        });
    }

    const handleMemoryCardClick = (cardIndex: number) => {
        if (memoryGameFinished || flippedCards.length === 2 || memoryCards[cardIndex].isFlipped) {
            return;
        }

        const newFlippedCards = [...flippedCards, cardIndex];
        setMemoryCards(prev => prev.map(card => card.index === cardIndex ? { ...card, isFlipped: true } : card));
        setFlippedCards(newFlippedCards);
       
        if (newFlippedCards.length === 1) {
            setMemoryGameMoves(prev => prev + 1);
        }
    };

    const resetMemoryGame = () => {
        setMemoryGameFinished(false);
        setMemoryCards(createShuffledDeck());
        setFlippedCards([]);
        setMemoryGameMoves(0);
    }

    const handleShareLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: 'Link Copied!',
            description: 'Game link has been copied to your clipboard.',
        });
    };


    const renderGameContent = () => {
        switch(game.gameType) {
            case 'Quiz':
            case 'Math Puzzle':
                if (currentQuestion) {
                    return (
                        <div className="text-left space-y-4">
                            <p className="text-lg font-semibold">Question {currentQuestionIndex + 1}/{game.questions!.length}</p>
                            {currentQuestion.imageUrl && (
                                <div className="relative w-full aspect-video rounded-md overflow-hidden flex justify-center">
                                <Image src={currentQuestion.imageUrl} alt="Question visual" width={200} height={200} style={{objectFit:"contain"}} />
                                </div>
                            )}
                            <p>{currentQuestion.question}</p>
                            <RadioGroup 
                                onValueChange={handleAnswerChange} 
                                value={selectedAnswers[currentQuestionIndex]}
                                className="space-y-2"
                            >
                                {currentQuestion.options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2 rounded-md border p-3">
                                        <RadioGroupItem value={option} id={`q${currentQuestionIndex}-o${index}`} />
                                        <Label htmlFor={`q${currentQuestionIndex}-o${index}`}>{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )
                }
                return <p>This game has no content.</p>;
            case 'Tongue Twister':
                 if (seriesFinished) {
                    return (
                        <div className="text-center space-y-4 flex flex-col items-center">
                            <p className="text-2xl font-bold">Great Job!</p>
                            <p className="text-muted-foreground">You've completed all the tongue twisters for today. Come back tomorrow for more!</p>
                            <Sparkles className="h-12 w-12 text-yellow-500" />
                        </div>
                    );
                }
                return (
                     <div className="text-center space-y-4 w-full">
                        <p className="text-sm text-muted-foreground">Twister {currentSeriesIndex + 1} of {dailyTwisters.length}</p>
                        <p className="text-2xl font-semibold">"{dailyTwisters[currentSeriesIndex]}"</p>
                        
                        <div className="w-full aspect-video bg-muted rounded-md relative flex items-center justify-center">
                           <video ref={videoRef} className={cn("w-full h-full object-cover rounded-md", recordedVideoUrl && 'hidden')} autoPlay muted playsInline />
                           {recordedVideoUrl && <video src={recordedVideoUrl} className="w-full h-full object-contain rounded-md" controls autoPlay />}
                            { !hasCameraPermission && (
                                <Alert variant="destructive" className='max-w-sm'>
                                          <AlertTitle>Camera Access Required</AlertTitle>
                                          <AlertDescription>
                                            Please allow camera access to use this feature.
                                          </AlertDescription>
                                  </Alert>
                            )}
                        </div>

                        <div className="flex gap-2 justify-center">
                            {!isRecording && !recordedVideoUrl && (
                                <Button onClick={handleStartRecording} disabled={!hasCameraPermission}>
                                    <Mic className="mr-2 h-4 w-4"/> Start Recording
                                </Button>
                            )}
                            {isRecording && (
                                <Button onClick={handleStopRecording} variant="destructive">
                                    <StopCircle className="mr-2 h-4 w-4"/> Stop Recording
                                </Button>
                            )}
                            {recordedVideoUrl && (
                                <>
                                <Button onClick={handleStartRecording} variant="outline">
                                    <RotateCw className="mr-2 h-4 w-4"/> Record Again
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button><Share2 className="mr-2 h-4 w-4"/> Share on Feed</Button>
                                    </DialogTrigger>
                                    <CreatePostDialog postType='video' onCreatePost={handleShareVideo} initialContent={`I took the Tongue Twister Challenge! Can you say "${dailyTwisters[currentSeriesIndex]}"?`} initialSubject='Entertainment' />
                                </Dialog>
                                </>
                            )}
                        </div>

                        <Button onClick={handleNextTwister} variant="secondary">
                           {currentSeriesIndex < dailyTwisters.length - 1 ? "Next Twister" : "Finish"}
                           <ChevronsRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )
            case 'Word Scramble':
                 if (seriesFinished) {
                    return (
                        <div className="text-center space-y-4 flex flex-col items-center">
                            <p className="text-2xl font-bold">You're a Word Whiz!</p>
                            <p className="text-muted-foreground">You've unscrambled all the words for today. Come back tomorrow for a new set!</p>
                            <Sparkles className="h-12 w-12 text-yellow-500" />
                        </div>
                    );
                }
                 return (
                    <div className="text-center space-y-4">
                         <p className="text-sm text-muted-foreground">Word {currentSeriesIndex + 1} of {dailyScrambles.length}</p>
                        <p className="text-3xl font-bold tracking-widest">{dailyScrambles[currentSeriesIndex].scrambled}</p>
                        <p className="text-muted-foreground">Unscramble the letters to form a word.</p>
                        <div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
                            <Input 
                                type="text" 
                                value={seriesInput}
                                onChange={(e) => setSeriesInput(e.target.value)}
                                className="w-full text-center p-2 border rounded-md" 
                                placeholder="Your answer"
                            />
                            <Button onClick={handleSeriesSubmit}>Submit</Button>
                        </div>
                        {seriesAttempts >= 3 && !seriesFinished && (
                            <Button variant="link" onClick={handleViewAnswer}>
                                View Answer
                            </Button>
                        )}
                    </div>
                )
            case 'Riddle':
                 if (seriesFinished) {
                    return (
                        <div className="text-center space-y-4 flex flex-col items-center">
                            <p className="text-2xl font-bold">Riddle Master!</p>
                            <p className="text-muted-foreground">You've solved all the riddles for today. Return tomorrow for new challenges!</p>
                            <Sparkles className="h-12 w-12 text-yellow-500" />
                        </div>
                    );
                }
                 if (!dailyRiddles[currentSeriesIndex]) {
                     return <p>Loading riddle...</p>
                 }
                 return (
                    <div className="text-center space-y-4">
                         <p className="text-sm text-muted-foreground">Riddle {currentSeriesIndex + 1} of {dailyRiddles.length}</p>
                        <p className="text-2xl font-semibold">"{dailyRiddles[currentSeriesIndex].riddle}"</p>
                        <div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
                            <Input 
                                type="text" 
                                value={seriesInput}
                                onChange={(e) => setSeriesInput(e.target.value)}
                                className="w-full text-center p-2 border rounded-md" 
                                placeholder="Your answer"
                            />
                            <Button onClick={handleSeriesSubmit}>Submit</Button>
                        </div>
                        {seriesAttempts >= 3 && !seriesFinished && (
                            <Button variant="link" onClick={handleViewAnswer}>
                                View Answer
                            </Button>
                        )}
                    </div>
                )
            case 'Memory Match':
                 return (
                    <div className="text-center space-y-4">
                        <p className="text-muted-foreground">Flip the cards to find matching pairs! Moves: {memoryGameMoves}</p>
                        <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto [perspective:1000px]">
                           {memoryCards.map((card) => (
                                <button 
                                    key={card.index} 
                                    className={cn(
                                        "w-16 h-16 rounded-md flex items-center justify-center font-bold text-2xl cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]",
                                        {
                                            "bg-primary text-primary-foreground hover:bg-primary/90": !card.isFlipped && !card.isMatched,
                                            "bg-accent text-accent-foreground": card.isFlipped && !card.isMatched,
                                            "bg-green-200 text-green-800 border-green-400 border-2 cursor-default": card.isMatched,
                                            '[transform:rotateY(180deg)]': card.isFlipped || card.isMatched
                                        }
                                    )}
                                    onClick={() => handleMemoryCardClick(card.index)}
                                    disabled={card.isFlipped || memoryGameFinished}
                                >
                                     <div className="[backface-visibility:hidden] [transform:rotateY(180deg)]">
                                         {(card.isFlipped || card.isMatched) ? card.value : ''}
                                     </div>
                                      <div className="absolute [backface-visibility:hidden]">
                                         <HelpCircle className="text-primary-foreground/80" />
                                     </div>
                                </button>
                            ))}
                        </div>
                        {memoryGameFinished && (
                            <div className="space-y-2 pt-4 animate-in fade-in zoom-in-50">
                                <p className="text-xl font-bold text-green-600">You Win!</p>
                                <Button onClick={resetMemoryGame}><RotateCw className="mr-2 h-4 w-4" /> Play Again</Button>
                            </div>
                        )}
                    </div>
                )
            default:
                 return (
                    <div>
                        <p className="text-muted-foreground">This game is currently under development.</p>
                        <p className="text-muted-foreground">Check back soon to play!</p>
                    </div>
                );
        }
    }


    if (quizFinished) {
         return (
             <Dialog>
                {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}
                <div className="flex flex-col items-center justify-center h-full p-4">
                    <Card className="w-full max-w-2xl text-center animate-in fade-in-50 zoom-in-95">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className='flex flex-col items-center justify-center gap-2'>
                                <Trophy className="h-12 w-12 text-yellow-400" />
                                <span className="text-3xl">Quiz Results</span>
                            </CardTitle>
                             <p className="text-muted-foreground">{game.title}</p>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div>
                                <p className="text-muted-foreground mt-2">Your Score</p>
                                <p className="text-6xl font-bold">{score} / {game.questions!.length}</p>
                                <Progress value={(score / game.questions!.length) * 100} className="w-3/4 mx-auto mt-2 h-3" />
                            </div>
                            <div className='flex gap-2 justify-center'>
                                <Button onClick={() => window.location.reload()}>
                                    <RotateCw className="mr-2 h-4 w-4" />
                                    Play Again
                                </Button>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <MessageCircle className='mr-2 h-4 w-4' /> Share on Feed
                                    </Button>
                                </DialogTrigger>
                            </div>
                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Review Your Answers</AccordionTrigger>
                                    <AccordionContent>
                                        <ScrollArea className="h-60 text-left">
                                            <div className="space-y-4 p-4">
                                            {game.questions?.map((q, index) => {
                                                const userAnswer = selectedAnswers[index];
                                                const isCorrect = userAnswer === q.correctAnswer;
                                                return (
                                                    <div key={index} className="space-y-2 p-2 rounded-md border">
                                                        <p className="font-semibold">Q{index+1}: {q.question}</p>
                                                        <p className={`flex items-center gap-2 text-sm ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                                                            {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                            Your Answer: {userAnswer || 'Not answered'}
                                                        </p>
                                                        {!isCorrect && (
                                                            <p className="flex items-center gap-2 text-sm text-green-600">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Correct Answer: {q.correctAnswer}
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                            </div>
                                        </ScrollArea>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                     <AccordionTrigger>Leaderboard</AccordionTrigger>
                                    <AccordionContent>
                                        <Table className="mt-2">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-center">Rank</TableHead>
                                                    <TableHead>Player</TableHead>
                                                    <TableHead className="text-center">Score</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {topScores.map((s, index) => (
                                                    <TableRow key={s.id}>
                                                        <TableCell className="font-bold text-center">{index + 1}</TableCell>
                                                        <TableCell className="flex items-center gap-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={s.user.avatar} />
                                                                <AvatarFallback>{s.user.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            {s.user.sudoName}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-center">{s.score}/{game.questions!.length}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                     </AccordionContent>
                                </AccordionItem>
                             </Accordion>
                        </CardContent>
                        <CardFooter className="p-4 border-t bg-muted/50">
                            <Link href="/" className="w-full">
                                <div className="text-center p-4 rounded-lg bg-background hover:bg-background/80 transition-colors">
                                    <p className="text-xs font-semibold text-yellow-600 flex items-center justify-center gap-1"><Star className="h-3 w-3" /> A Message From Our Sponsor</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="relative h-16 w-16">
                                            <Image src={sponsoredPost.imageUrl!} alt={sponsoredPost.subject} fill className="rounded-md object-cover" data-ai-hint="learning tablet" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-sm">{sponsoredPost.subject}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{sponsoredPost.content}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
                <CreatePostDialog
                    postType="qa"
                    initialContent={`I scored ${score}/${game.questions!.length} on "${game.title}"! Can you beat my score?\n\n${typeof window !== 'undefined' ? window.location.href : ''}`}
                    initialSubject="Games & Challenges"
                    onCreatePost={(postData) => {
                        const newPost: Post = {
                            ...postData,
                            id: `post-${Date.now()}`,
                            authorInfo: { id: currentUser.id, name: currentUser.name, sudoName: currentUser.sudoName, avatar: currentUser.avatar },
                            authorId: currentUser.id,
                            timestamp: 'Just now',
                            likes: 0,
                            comments: [],
                            shares: 0,
                            class: currentUser.class,
                            imageUrl: postData.imageUrl || `https://picsum.photos/seed/post${Date.now()}/600/400`,
                            commentsCount: 0,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        addPost(newPost);
                        toast({
                            title: 'Post Shared!',
                            description: 'Your game result has been shared to the feed.'
                        });
                    }}
                />
            </Dialog>
        );
    }

    return (
        <Dialog>
            <div className="flex flex-col items-center justify-center h-full p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <div className='flex items-center justify-center relative'>
                             <CardTitle className='flex items-center justify-center gap-2 text-center'>
                                <game.icon className="h-8 w-8 text-primary" />
                                {game.title}
                            </CardTitle>
                            <div className='absolute right-0 top-1/2 -translate-y-1/2 flex items-center'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                Share on Feed
                                            </DropdownMenuItem>
                                        </DialogTrigger>
                                        <DropdownMenuItem onSelect={handleShareLink}>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy Link
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                         <div className="text-center text-muted-foreground text-sm pt-4 space-y-2">
                            {game.startTime && (
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{format(game.startTime, "PPP p")} - {game.endTime && format(game.endTime, "p")}</span>
                                </div>
                            )}
                            <div className="flex justify-center gap-6">
                                {game.entryFee && (
                                    <div className="flex items-center gap-2">
                                        <Database className="h-4 w-4 text-primary" />
                                        <span>{game.entryFee} Coins to Enter</span>
                                    </div>
                                )}
                                {game.prize && (
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-yellow-500" />
                                        <span>Prize: {game.prize}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="text-center min-h-[250px] flex items-center justify-center">
                        {renderGameContent()}
                    </CardContent>
                    {(isQuiz && game.questions!.length > 0) && (
                        <CardFooter className='justify-end'>
                             <Button onClick={handleNextQuestion} disabled={!selectedAnswers[currentQuestionIndex]}>
                                {currentQuestionIndex < game.questions!.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </Button>
                        </CardFooter>
                    )}
                     {(memoryGameFinished || seriesFinished || game.gameType === 'Tongue Twister') && (
                         <CardFooter className="p-4 border-t bg-muted/50">
                            <Link href="/" className="w-full">
                                 <div className="text-center p-4 rounded-lg bg-background hover:bg-background/80 transition-colors">
                                    <p className="text-xs font-semibold text-yellow-600 flex items-center justify-center gap-1"><Star className="h-3 w-3" /> A Message From Our Sponsor</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="relative h-16 w-16">
                                            <Image src={sponsoredPost.imageUrl!} alt={sponsoredPost.subject} fill className="rounded-md object-cover" data-ai-hint="learning tablet" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-sm">{sponsoredPost.subject}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{sponsoredPost.content}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </CardFooter>
                    )}
                </Card>
            </div>
            <CreatePostDialog
                postType="qa"
                initialContent={`Check out this cool game: "${game.title}"! Can you beat me?\n\n${typeof window !== 'undefined' ? window.location.href : ''}`}
                initialSubject="Games & Challenges"
                onCreatePost={(postData) => {
                    const newPost: Post = {
                        ...postData,
                        id: `post-${Date.now()}`,
                        authorInfo: { id: currentUser.id, name: currentUser.name, sudoName: currentUser.sudoName, avatar: currentUser.avatar },
                        authorId: currentUser.id,
                        timestamp: 'Just now',
                        likes: 0,
                        comments: [],
                        shares: 0,
                        class: currentUser.class,
                        imageUrl: postData.imageUrl || `https://picsum.photos/seed/post${Date.now()}/600/400`,
                        commentsCount: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    addPost(newPost);
                    toast({
                        title: 'Post Shared!',
                        description: 'Your game result has been shared to the feed.'
                    });
                }}
            />
    </Dialog>
    );
}

    