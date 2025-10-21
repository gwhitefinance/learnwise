

'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, query, collection, where, updateDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, Zap, Shield, Star, Award, Flame, Brain, Pen } from 'lucide-react';
import { cn } from '@/lib/utils';
import AIBuddy from '@/components/ai-buddy';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
    displayName: string;
    email: string;
    coins: number;
    unlockedItems?: Record<string, string[]>;
    level?: number;
    xp?: number;
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
    const [streak, setStreak] = useState(0);
    const [learnerType, setLearnerType] = useState<string | null>(null);
    const [aiBuddyName, setAiBuddyName] = useState('Tutorin');
    const [isEditingName, setIsEditingName] = useState(false);
    const router = useRouter();
    const { toast } = useToast();


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

        // Load customizations and buddy name
        const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
        if(savedCustomizations) {
            setCustomizations(JSON.parse(savedCustomizations));
        }
        const savedBuddyName = localStorage.getItem('aiBuddyName');
        if (savedBuddyName) {
            setAiBuddyName(savedBuddyName);
        }
        
        // Load learner type
        const type = localStorage.getItem('learnerType');
        setLearnerType(type);

        // Load streak
        const lastVisit = localStorage.getItem('lastVisit');
        const today = new Date().toDateString();
        if (lastVisit === today) {
            setStreak(Number(localStorage.getItem('streakCount')) || 1);
        } else {
             const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastVisit === yesterday.toDateString()) {
                setStreak((Number(localStorage.getItem('streakCount')) || 0) + 1);
            } else {
                setStreak(1);
            }
        }


        return () => {
            unsubscribeUser();
            unsubscribeRoadmaps();
        };
    }, [user, authLoading, router]);
    
    const handleSaveName = () => {
        localStorage.setItem('aiBuddyName', aiBuddyName);
        setIsEditingName(false);
        toast({ title: "Name saved!", description: `Your buddy is now named ${aiBuddyName}.`});
    }

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
    const level = profile.level || 1;
    const xp = profile.xp || 0;
    const xpForNextLevel = level * 100;
    const xpProgress = (xp / xpForNextLevel) * 100;

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
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground font-semibold">Coins</p>
                                <p className="text-2xl font-bold flex items-center justify-center gap-1 text-amber-500"><Gem size={20}/> {profile.coins}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground font-semibold">Streak</p>
                                <p className="text-2xl font-bold flex items-center justify-center gap-1 text-orange-500"><Flame size={20}/> {streak}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center col-span-2">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <p className="font-semibold">Level {level}</p>
                                    <p className="text-muted-foreground">{xp} / {xpForNextLevel} XP</p>
                                </div>
                                <Progress value={xpProgress}/>
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

                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Your AI Companion</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center bg-muted rounded-lg p-4 relative aspect-square mb-4">
                                <AIBuddy
                                    className="w-48 h-48"
                                    color={customizations.color}
                                    hat={customizations.hat}
                                    shirt={customizations.shirt}
                                    shoes={customizations.shoes}
                                />
                            </div>
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <Input value={aiBuddyName} onChange={(e) => setAiBuddyName(e.target.value)} placeholder="Enter a name..." />
                                    <Button size="sm" onClick={handleSaveName}>Save</Button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-xl font-bold">{aiBuddyName}</p>
                                    <Button variant="link" size="sm" onClick={() => setIsEditingName(true)}><Pen className="h-3 w-3 mr-1"/>Rename</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {learnerType && (
                         <Card className="bg-blue-500/10 border-blue-500/20">
                            <CardHeader>
                                <CardTitle className="text-blue-700 flex items-center gap-2"><Brain /> Learning Style: {learnerType}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-blue-800/80">
                                    <span className="font-semibold">Pro Tip:</span> As a {learnerType} learner, try leveraging features that play to your strengths. For you, this might mean using the Whiteboard to draw diagrams or watching generated video clips in your courses.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

