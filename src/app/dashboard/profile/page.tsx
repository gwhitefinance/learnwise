


'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, query, collection, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Shield, Star, Award, Flame, Brain, Pen, Trash2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import AIBuddy from '@/components/ai-buddy';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteUser } from 'firebase/auth';
import Link from 'next/link';
import { getLeaderboard } from '@/app/leaderboard/actions';
import TazCoinIcon from '@/components/TazCoinIcon';
import LevelBadge from '@/components/LevelBadge';

type UserProfile = {
    displayName: string;
    email: string;
    coins: number;
    unlockedItems?: Record<string, string[]>;
    level?: number;
    xp?: number;
    uid?: string;
    photoURL?: string;
    taz?: {
        species: string;
    };
};

type Course = {
    id: string;
    name: string;
    units?: { chapters?: { id: string }[] }[];
    completedChapters?: string[];
};

type Roadmap = {
    id: string;
    courseId: string;
    milestones: { id: string; title: string; completed: boolean; icon: string }[];
};


export default function ProfilePage() {
    const [user, authLoading] = useAuthState(auth);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [profileLoading, setProfileLoading] = useState(true);
    const [customizations, setCustomizations] = useState<Record<string, string>>({});
    const [streak, setStreak] = useState(0);
    const [learnerType, setLearnerType] = useState<string | null>(null);
    const [aiBuddyName, setAiBuddyName] = useState('Taz');
    const [isEditingName, setIsEditingName] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
    const [leaderboardLoading, setLeaderboardLoading] = useState(true);


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

        const coursesQuery = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
        });
        
        const roadmapsQuery = query(collection(db, "roadmaps"), where("userId", "==", user.uid));
        const unsubscribeRoadmaps = onSnapshot(roadmapsQuery, (snapshot) => {
            const userRoadmaps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Roadmap));
            setRoadmaps(userRoadmaps);
        });
        
        const fetchLeaderboard = async () => {
            setLeaderboardLoading(true);
            const leaderboardData = await getLeaderboard();
            setLeaderboard(leaderboardData);
            const userRank = leaderboardData.findIndex(p => p.uid === user.uid);
            setCurrentUserRank(userRank !== -1 ? userRank + 1 : null);
            setLeaderboardLoading(false);
        };
        fetchLeaderboard();

        // Load customizations and buddy name
        const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
        if(savedCustomizations) {
            try {
                setCustomizations(JSON.parse(savedCustomizations));
            } catch (e) {
                console.error("Failed to parse customizations from localStorage", e);
            }
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
            unsubscribeCourses();
        };
    }, [user, authLoading, router]);
    
    const handleSaveName = () => {
        localStorage.setItem('aiBuddyName', aiBuddyName);
        setIsEditingName(false);
        toast({ title: "Name saved!", description: `Your buddy is now named ${aiBuddyName}.`});
    }

    const handleDeleteAccount = async () => {
        if (!user) return;
        try {
            // This is a simplified deletion. A production app would require re-authentication.
            // First, delete Firestore data
            await deleteDoc(doc(db, "users", user.uid));
            
            // Then, delete the Firebase Auth user
            await deleteUser(user);

            toast({ title: "Account Deleted", description: "Your account has been permanently deleted."});
            router.push('/signup');
        } catch (error: any) {
            console.error("Error deleting account:", error);
            let description = "Could not delete your account. Please try again later.";
            if (error.code === 'auth/requires-recent-login') {
                description = "This is a sensitive operation. Please log out and log back in before deleting your account."
            }
            toast({ variant: 'destructive', title: "Deletion Failed", description });
        }
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
    const xpProgress = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 0;

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
                                <p className="text-2xl font-bold flex items-center justify-center gap-1 text-amber-500"><TazCoinIcon className="h-6 w-6"/> {profile.coins}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground font-semibold">Streak</p>
                                <p className="text-2xl font-bold flex items-center justify-center gap-1 text-orange-500"><Flame size={20}/> {streak}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center col-span-2">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <LevelBadge level={level} />
                                    <p className="text-muted-foreground">{xp} / {xpForNextLevel} XP</p>
                                </div>
                                <Progress value={xpProgress}/>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Course Progress</CardTitle>
                            <CardDescription>A high-level overview of your learning landscape.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {courses.length > 0 ? courses.map(course => {
                                const totalChapters = course.units?.reduce((acc, unit) => acc + (unit.chapters?.length ?? 0), 0) ?? 0;
                                const completedCount = course.completedChapters?.length ?? 0;
                                const courseProgress = totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0;
                                return (
                                    <div key={course.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <Link href={`/dashboard/courses?courseId=${course.id}`}>
                                                <p className="font-semibold hover:underline">{course.name}</p>
                                            </Link>
                                            <span className="text-sm font-medium text-muted-foreground">{Math.round(courseProgress)}%</span>
                                        </div>
                                        <Progress value={courseProgress} className="h-2"/>
                                    </div>
                                )
                            }) : (
                                <p className="text-center text-muted-foreground py-4">No courses started yet.</p>
                            )}
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
                                    species={profile.taz?.species}
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
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy /> Leaderboard Snapshot</CardTitle>
                </CardHeader>
                <CardContent>
                    {leaderboardLoading ? (
                        <div className="flex justify-center items-center h-24">
                            <p className="text-muted-foreground">Loading leaderboard...</p>
                        </div>
                    ) : currentUserRank ? (
                         <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-lg bg-muted">
                            <div className="text-center md:text-left">
                                <p className="text-sm text-muted-foreground font-semibold">Your Rank</p>
                                <p className="text-4xl font-bold text-primary">#{currentUserRank}</p>
                            </div>
                            <div className="space-y-2 flex-1 max-w-sm">
                                {leaderboard.slice(0, 3).map((player, index) => (
                                    <div key={player.uid} className="flex items-center gap-3 text-sm">
                                        <span className="font-bold w-6 text-muted-foreground">{index + 1}.</span>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={player.photoURL} />
                                            <AvatarFallback>{player.displayName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium flex-1 truncate">{player.displayName}</span>
                                        <span className="font-bold flex items-center gap-1 text-amber-500"><TazCoinIcon className="h-5 w-5"/> {player.coins}</span>
                                    </div>
                                ))}
                            </div>
                             <Button asChild variant="outline">
                                <Link href="/leaderboard">View Full Leaderboard</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-4">
                            Start earning coins to appear on the leaderboard!
                        </div>
                    )}
                </CardContent>
            </Card>

             <Card className="bg-destructive/10 border-destructive/20 mt-8">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-semibold">Delete Account</h4>
                            <p className="text-sm text-muted-foreground">This will permanently delete your account and all associated data.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your
                                        account and remove all your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount}>Delete Account</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    

    

