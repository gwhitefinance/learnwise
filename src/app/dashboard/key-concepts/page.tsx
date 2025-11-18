
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookMarked, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type FlashcardSession = {
    id: string;
    name: string;
    cards: { front: string; back: string }[];
    mastered: string[];
    timestamp: string;
};

export default function FlashcardHubPage() {
    const [sessions, setSessions] = useState<FlashcardSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user] = useAuthState(auth);
    const router = useRouter();

    useEffect(() => {
        if (!user) return;
        const savedSessionsData = localStorage.getItem('flashcardSessions');
        if (savedSessionsData) {
            try {
                const parsedSessions = Object.values(JSON.parse(savedSessionsData));
                // @ts-ignore
                setSessions(parsedSessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            } catch (e) {
                console.error("Failed to parse flashcard sessions", e);
            }
        }
        setIsLoading(false);
    }, [user]);

    if (isLoading) {
        return (
             <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Flashcard Hub</h1>
                <p className="text-muted-foreground">Review your study sets and track your mastery.</p>
            </div>

            {sessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map(session => {
                        const masteryProgress = (session.mastered.length / session.cards.length) * 100;
                        return (
                            <Card key={session.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="truncate">{session.name}</CardTitle>
                                    <div className="text-xs text-muted-foreground pt-1 space-y-1">
                                        <p>{session.cards.length} cards</p>
                                        <p>Created {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Mastery</span>
                                        <span className="font-semibold">{masteryProgress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${masteryProgress}%` }}/>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" asChild>
                                        <Link href={`/dashboard/flashcards?session=${session.id}`}>
                                            Study Now <ArrowRight className="ml-2 h-4 w-4"/>
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <Card className="text-center p-12 col-span-full">
                    <div className="mx-auto bg-muted p-4 rounded-full w-fit mb-4">
                        <BookMarked className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No flashcard sessions found.</h3>
                    <p className="text-muted-foreground mt-2 mb-4">Generate a flashcard deck from one of your courses to get started.</p>
                    <Button asChild>
                        <Link href="/dashboard/courses">Go to Courses</Link>
                    </Button>
                </Card>
            )}
        </div>
    );
}
