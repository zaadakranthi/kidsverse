
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Award, MessageSquare, Video, Medal } from 'lucide-react';
import { getPosts } from '@/lib/services/posts';
import type { User, Post, GameScore } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getGameScores } from '@/lib/services/games';

type LeaderboardUser = {
    user: Pick<User, 'id' | 'name' | 'avatar' | 'sudoName' | 'class'>;
    score: number;
    rank: number;
};

const LeaderboardTable = ({ users, scoreLabel }: { users: LeaderboardUser[], scoreLabel: string }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">{scoreLabel}</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {users.map(({ user, score, rank }) => (
                <TableRow key={user.id}>
                    <TableCell className="text-center font-bold text-lg">
                        {rank <= 3 ? (
                            <Medal className={`mx-auto h-7 w-7 ${
                                rank === 1 ? 'text-yellow-400' :
                                rank === 2 ? 'text-slate-400' :
                                'text-orange-400'
                            }`} />
                        ) : rank}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.sudoName}</p>
                                <p className="text-xs text-muted-foreground">@{user.name} &middot; {user.class}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">{score.toLocaleString()}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);


const LeaderboardSkeleton = () => (
     <Card>
        <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-sm" />
        </CardHeader>
        <CardContent>
             <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
)


export default function LeaderboardsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [gameScores, setGameScores] = useState<GameScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [fetchedPosts, fetchedGameScores] = await Promise.all([
                getPosts(),
                getGameScores()
            ]);
            setPosts(fetchedPosts);
            setGameScores(fetchedGameScores);
            setLoading(false);
        }
        fetchData();
    }, []);

    const quizMasters = useMemo((): LeaderboardUser[] => {
        const scores: Record<string, { user: GameScore['user'] & { class: string }, totalScore: number }> = {};
        gameScores.forEach(gs => {
            const user = {
                ...gs.user,
                class: '10th' // Mock class, ideally from user profile
            };

            if (!scores[gs.user.id]) {
                scores[gs.user.id] = { user, totalScore: 0 };
            }
            scores[gs.user.id].totalScore += gs.score;
        });
        return Object.values(scores)
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10)
            .map((item, index) => ({ user: item.user, score: item.totalScore, rank: index + 1 }));
    }, [gameScores]);

    const contributors = useMemo((): LeaderboardUser[] => {
        const scores: Record<string, { user: Post['authorInfo'] & { class: string }, totalScore: number }> = {};
        posts.forEach(p => {
             const user = {
                ...p.authorInfo,
                class: p.class
            };

            if (!scores[p.authorInfo.id]) {
                scores[p.authorInfo.id] = { user, totalScore: 0 };
            }
            scores[p.authorInfo.id].totalScore += (p.type === 'video' ? 10 : 5);
        });
        return Object.values(scores)
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10)
            .map((item, index) => ({ user: item.user, score: item.totalScore, rank: index + 1 }));
    }, [posts]);

    const communityHelpers = useMemo((): LeaderboardUser[] => {
        const scores: Record<string, { user: Post['authorInfo'] & { class: string }, totalScore: number }> = {};
        posts.forEach(p => {
            if (p.type === 'qa' && p.comments) {
                p.comments.forEach(c => {
                    const user = {
                        ...c.authorInfo,
                        class: 'Unknown', // Ideally fetched from user profile
                    };

                    if (!scores[c.authorInfo.id]) {
                        scores[c.authorInfo.id] = { user, totalScore: 0 };
                    }
                    scores[c.authorInfo.id].totalScore += 1;
                });
            }
        });
        return Object.values(scores)
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10)
            .map((item, index) => ({ user: item.user, score: item.totalScore, rank: index + 1 }));
    }, [posts]);

    return (
        <div className="space-y-8">
            <div className='flex items-center gap-4'>
                <Trophy className="h-10 w-10 text-yellow-400" />
                <div>
                <h1 className="text-3xl font-bold font-headline">Leaderboards</h1>
                <p className="text-muted-foreground">
                    See who's topping the charts in the EduVerse community!
                </p>
                </div>
            </div>

             <Tabs defaultValue="quiz-masters" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="quiz-masters">
                        <Award className="mr-2 h-4 w-4"/>
                        Quiz Masters
                    </TabsTrigger>
                    <TabsTrigger value="top-contributors">
                         <Video className="mr-2 h-4 w-4"/>
                        Top Contributors
                    </TabsTrigger>
                    <TabsTrigger value="community-helpers">
                         <MessageSquare className="mr-2 h-4 w-4"/>
                        Community Helpers
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="quiz-masters">
                    {loading ? <LeaderboardSkeleton /> : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Masters</CardTitle>
                                <CardDescription>Top 10 students with the highest scores across all quizzes and games.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LeaderboardTable users={quizMasters} scoreLabel="Total Score" />
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                 <TabsContent value="top-contributors">
                    {loading ? <LeaderboardSkeleton /> : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Contributors</CardTitle>
                                <CardDescription>Top 10 students who have contributed the most by posting videos and questions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LeaderboardTable users={contributors} scoreLabel="Contribution Points" />
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                 <TabsContent value="community-helpers">
                     {loading ? <LeaderboardSkeleton /> : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Community Helpers</CardTitle>
                                <CardDescription>Top 10 students who have helped others the most by answering questions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LeaderboardTable users={communityHelpers} scoreLabel="Answers Provided" />
                            </CardContent>
                        </Card>
                     )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
