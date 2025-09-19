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
import {
  Brain,
  Puzzle,
  SpellCheck,
  PlusCircle,
  Award,
  Tv,
  Clock,
  Trophy,
  Database,
  Forward,
  Book,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { CreateGameDialog } from '@/components/create-game-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Game, User, GameScore } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { awardPoints } from '@/ai/flows/award-points';
import { differenceInSeconds } from 'date-fns';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { createGame, getGames, getGameScores } from '@/lib/services/games';
import { Skeleton } from '@/components/ui/skeleton';

// ✅ Props type for dynamic route
interface BrainGamesPageProps {
  params: {
    slug: string;
  };
}

type UserScore = {
  user: Pick<User, 'id' | 'name' | 'avatar' | 'sudoName'>;
  totalScore: number;
};

function Countdown({ startTime, endTime }: { startTime: Date; endTime: Date }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (now < startTime) {
    const seconds = differenceInSeconds(startTime, now);
    return <span>Starts in {seconds}s</span>;
  } else if (now < endTime) {
    const seconds = differenceInSeconds(endTime, now);
    return <span>Ends in {seconds}s</span>;
  } else {
    return <span>Ended</span>;
  }
}

function LeaderboardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function GameCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  );
}

function getGameIcon(type: string): LucideIcon {
  switch (type) {
    case 'brain':
      return Brain;
    case 'puzzle':
      return Puzzle;
    case 'spelling':
      return SpellCheck;
    case 'quiz':
      return HelpCircle;
    case 'study':
      return Book; // ✅ fixed BookA → Book
    case 'forward':
      return Forward;
    case 'database':
      return Database;
    case 'trophy':
      return Trophy;
    case 'clock':
      return Clock;
    case 'tv':
      return Tv;
    case 'award':
      return Award;
    default:
      return Brain;
  }
}

// ✅ Main component now receives params
export default function BrainGamesPage({ params }: BrainGamesPageProps) {
  const { slug } = params;
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [games, setGames] = useState<Omit<Game, 'icon'>[]>([]);
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateGameDialogOpen, setCreateGameDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedGames, fetchedScores] = await Promise.all([
          getGames(),
          getGameScores(),
        ]);
        setGames(fetchedGames);
        setGameScores(fetchedScores);
      } catch (error) {
        console.error('Failed to fetch games data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load games data.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleCreateGame = async (gameData: Omit<Game, 'id' | 'icon'>) => {
    try {
      const newGame = await createGame(gameData);
      setGames((prevGames) => [...prevGames, newGame]);
      toast({
        title: 'Game created',
        description: `New game ${newGame.name} has been created.`,
      });
    } catch (error) {
      console.error('Failed to create game:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create game.',
      });
    }
  };

  const userScores: UserScore[] = Object.values(
    gameScores.reduce<Record<string, UserScore>>((acc, score) => {
      if (!acc[score.user.id]) {
        acc[score.user.id] = { user: score.user, totalScore: 0 };
      }
      acc[score.user.id].totalScore += score.score;
      return acc;
    }, {})
  );

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={isCreateGameDialogOpen} onOpenChange={setCreateGameDialogOpen}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Brain Game: {slug}</h1>

        {/* Games list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? [1, 2, 3].map((i) => <GameCardSkeleton key={i} />)
            : games.map((game) => {
                const Icon = getGameIcon(game.type);
                return (
                  <Card key={game.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="w-5 h-5" /> {game.name}
                      </CardTitle>
                      <CardDescription>{game.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Countdown
                        startTime={new Date(game.startTime)}
                        endTime={new Date(game.endTime)}
                      />
                    </CardContent>
                    <CardFooter>
                      <Link href={`/brain-games/${game.id}`} passHref>
                        <Button>Play</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
        </div>

        {/* Leaderboard */}
        <div>
          {loading ? (
            <LeaderboardSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...userScores] // ✅ clone before sort
                      .sort((a, b) => b.totalScore - a.totalScore)
                      .map((userScore, index) => (
                        <TableRow key={userScore.user.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar>
                                {userScore.user.avatar ? (
                                  <AvatarImage
                                    src={userScore.user.avatar}
                                    alt={userScore.user.name}
                                  />
                                ) : (
                                  <AvatarFallback>
                                    {userScore.user.name[0]}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <span>{userScore.user.sudoName ?? userScore.user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {userScore.totalScore}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ✅ Corrected dialog structure */}
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" /> Create Game
          </Button>
        </DialogTrigger>
        <CreateGameDialog onCreateGame={handleCreateGame} />
      </div>
    </Dialog>
  );
}
