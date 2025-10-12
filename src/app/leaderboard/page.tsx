
'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Gem, Shield } from 'lucide-react';
import Loading from './loading';
import { cn } from '@/lib/utils';
import Navbar from '@/sections/Navbar';
import Footer from '@/sections/Footer';
import { getLeaderboard } from './actions';
import { Progress } from '@/components/ui/progress';

export type UserProfile = {
    uid: string;
    displayName: string;
    email: string;
    coins: number;
    photoURL?: string;
};

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const users = await getLeaderboard();
                setLeaderboard(users);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return <Loading />;
    }

    const getRankColor = (rank: number) => {
        if (rank === 0) return "text-yellow-400";
        if (rank === 1) return "text-gray-400";
        if (rank === 2) return "text-yellow-600";
        return "text-muted-foreground";
    }

    return (
        <main className="bg-black text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold tracking-tight">Leaderboard</h1>
                    <p className="text-muted-foreground mt-2">See who's at the top of their game.</p>
                </div>

                <Card className="bg-neutral-900 border-white/10">
                    <CardHeader>
                        <CardTitle>Top Learners</CardTitle>
                        <CardDescription>Ranked by coins earned.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-white/10">
                                    <TableHead className="w-[80px]">Rank</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Coins</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboard.map((user, index) => {
                                    
                                    return (
                                        <TableRow key={user.uid} className={cn(
                                            "border-b-white/10",
                                            index < 3 && "bg-white/5"
                                        )}>
                                            <TableCell className="font-bold text-lg">
                                                <div className="flex items-center gap-2">
                                                    <Trophy className={cn("h-6 w-6", getRankColor(index))} />
                                                    <span>{index + 1}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <Avatar>
                                                        <AvatarImage src={user.photoURL} />
                                                        <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{user.displayName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                <div className="flex items-center justify-end gap-2 text-amber-400">
                                                    <Gem className="h-5 w-5"/>
                                                    <span>{user.coins}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                         {leaderboard.length === 0 && (
                            <div className="text-center text-muted-foreground p-8">
                                The leaderboard is currently empty. Start learning to get on the board!
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </main>
    );
}
