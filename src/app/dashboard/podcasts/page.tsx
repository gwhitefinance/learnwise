
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Podcast, Play, User, Star } from "lucide-react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Loading from './loading';
import AudioPlayer from '@/components/audio-player';

type PodcastEpisode = {
    id: string;
    userId: string;
    courseId: string;
    unitTitle: string;
    script: string;
    audioUrl?: string;
    timestamp: { toDate: () => Date };
};

export default function PodcastsPage() {
    const [user, authLoading] = useAuthState(auth);
    const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;

        const q = query(collection(db, "podcastEpisodes"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userEpisodes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PodcastEpisode));
            setEpisodes(userEpisodes);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    if (isLoading || authLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Podcast Studio</h1>
                    <p className="text-muted-foreground">Create, review, and share your own AI-generated audio lessons.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/podcasts/record">
                        <Plus className="mr-2 h-4 w-4" /> New Episode
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>My Episodes</CardTitle>
                    <CardDescription>Your library of generated podcast episodes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {episodes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {episodes.map(episode => (
                                <Card key={episode.id}>
                                    <CardHeader>
                                        <CardTitle className="truncate">{episode.unitTitle}</CardTitle>
                                        <CardDescription>{formatDistanceToNow(episode.timestamp.toDate(), { addSuffix: true })}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <AudioPlayer textToPlay={episode.script} />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                             <Podcast className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No episodes yet</h3>
                            <p className="text-muted-foreground mt-2 mb-6">Click "New Episode" to generate your first audio lesson.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
