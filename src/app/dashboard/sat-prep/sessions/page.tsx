
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Calculator } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

type StudySessionResult = {
    id: string;
    userId: string;
    topic: string;
    score: number;
    timestamp: { toDate: () => Date };
};

export default function AllSessionsPage() {
    const [user, authLoading] = useAuthState(auth);
    const router = useRouter();
    const [sessions, setSessions] = useState<StudySessionResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const qSessions = query(collection(db, 'satStudySessions'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
        const unsubscribeSessions = onSnapshot(qSessions, (snapshot) => {
            const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudySessionResult));
            setSessions(results);
            setLoading(false);
        });

        return () => unsubscribeSessions();
    }, [user, authLoading, router]);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Button variant="ghost" onClick={() => router.push('/dashboard/sat-prep')}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to SAT Prep Hub
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">All Practice Sessions</h1>
                <p className="text-muted-foreground">Review your entire study session history.</p>
            </div>
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="space-y-2 p-6">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : sessions.length > 0 ? (
                        <div className="space-y-1">
                            {sessions.map(session => (
                                <div key={session.id} className="flex justify-between items-center p-4 border-b hover:bg-muted">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-muted rounded-full">
                                            {session.topic === 'Math' ? <Calculator className="h-5 w-5 text-primary" /> : <BookOpen className="h-5 w-5 text-primary" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{session.topic} Session</p>
                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(session.timestamp.toDate(), { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold text-primary text-lg">{session.score.toFixed(0)}%</p>
                                        <Button variant="outline" size="sm" asChild>
                                            {/* This link will be a 404 until the dynamic review page is created */}
                                            <Link href={`/dashboard/sat-prep/sessions/${session.id}`}>Review</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-muted-foreground py-12">You haven't completed any study sessions yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
