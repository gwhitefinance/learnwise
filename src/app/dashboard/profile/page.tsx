

'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, query, collection, where } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, Zap, Shield, Star, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import AIBuddy from '@/components/ai-buddy';

type UserProfile = {
    displayName: string;
    email: string;
    coins: number;
    unlockedItems?: Record<string, string[]>;
};

type Roadmap = {
    id: string;
    courseId: string;
    milestones: { id: string; title: string; completed: boolean; icon: string }[];
};


export default function ProfilePage() {
    const [user, authLoading] = useAuthState(auth);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [profileLoading, setProfileLoading] = useState(true);
    const [customizations, setCustomizations] = useState<Record<string, string>>({});
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/signup');
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setProfile(doc.data() as UserProfile);
            }
            setProfileLoading(false);
        });
        
        const roadmapsQuery = query(collection(db, "roadmaps"), where("userId", "==", user.uid));
        const unsubscribeRoadmaps = onSnapshot(roadmapsQuery, (snapshot) => {
            const userRoadmaps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Roadmap));
            setRoadmaps(userRoadmaps);
        });

        const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
        if(savedCustomizations) {
            setCustomizations(JSON.parse(savedCustomizations));
        }

        return () => {
            unsubscribeUser();
            unsubscribeRoadmaps();
        };
    }, [user, authLoading, router]);

    if (authLoading || profileLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!profile) {
        return <div>Could not load user profile. Please try refreshing.</div>
    }
    
    const allCompletedMilestones = roadmaps.flatMap(r => r.milestones.filter(m => m.completed));

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
                <p className="text-muted-foreground">
                    View your stats, achievements, and customized AI buddy.
                </p>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
                             <Avatar className="h-20 w-20">
                                <AvatarImage src={user?.photoURL ?? undefined} />
                                <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                                <CardTitle className="text-2xl">{profile.displayName}</CardTitle>
                                <CardDescription>{profile.email}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex items-center gap-8">
                             <div className="flex items-center gap-2 text-2xl font-bold text-amber-500">
                                <Gem className="h-6 w-6"/>
                                <span>{profile.coins} Coins</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Badge Collection</CardTitle>
                             <CardDescription>Badges earned from completing Mastery Challenges.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {allCompletedMilestones.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {allCompletedMilestones.map((milestone) => (
                                        <div key={milestone.id} className="flex flex-col items-center text-center gap-2">
                                            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-green-500/10 border-2 border-green-500 text-green-500">
                                                <Award className="h-10 w-10"/>
                                            </div>
                                            <p className="text-xs font-semibold text-center">{milestone.title}</p>
                                        </div>
                                    ))}
                                </div>
                           ) : (
                               <p className="text-muted-foreground text-center py-8">No badges earned yet. Complete some Mastery Challenges on your roadmaps!</p>
                           )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Your AI Buddy</CardTitle>
                            <CardDescription>Your customized study companion.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center bg-muted rounded-lg p-4 relative aspect-square">
                                <AIBuddy
                                    className="w-48 h-48"
                                    color={customizations.color}
                                    hat={customizations.hat}
                                    shirt={customizations.shirt}
                                    shoes={customizations.shoes}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

