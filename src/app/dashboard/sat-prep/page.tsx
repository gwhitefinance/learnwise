
'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calculator, Loader2, RefreshCw, FileText, Trophy, Clock, GraduationCap, ArrowRight, Rocket, Send, FileQuestion } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { SatQuestion } from '@/ai/schemas/sat-question-schema';
import { generateSatQuestion } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';
import { FloatingChatContext } from '@/components/floating-chat';
import { Progress } from '@/components/ui/progress';

type TestResult = {
    id: string;
    userId: string;
    total: number;
    readingWriting: number;
    math: number;
    timestamp: { toDate: () => Date };
};


export default function SatPrepPage() {
    const [gradeLevel, setGradeLevel] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    
    const [user, authLoading] = useAuthState(auth);
    const [pastResults, setPastResults] = useState<TestResult[]>([]);
    const [resultsLoading, setResultsLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [chatInput, setChatInput] = useState('');
    const { openChatWithVoice } = useContext(FloatingChatContext);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/signup');
            return;
        }

        const q = query(collection(db, 'satTestResults'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult));
            setPastResults(results);
            setResultsLoading(false);
        });

        const storedGrade = localStorage.getItem('onboardingGradeLevel');
        setGradeLevel(storedGrade);
        setLoading(false);
        
        // Mock streak
        const lastVisit = localStorage.getItem('lastVisit');
        const today = new Date().toDateString();
        if (lastVisit === today) {
            setStreak(Number(localStorage.getItem('streakCount')) || 0);
        } else {
             const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastVisit === yesterday.toDateString()) {
                setStreak((Number(localStorage.getItem('streakCount')) || 0) + 1);
            } else {
                setStreak(0);
            }
        }

        return () => unsubscribe();
    }, [user, authLoading, router]);

    const handleChatSubmit = () => {
        if (!chatInput.trim()) return;
        // This function would ideally open the chat and send the message
        toast({ title: 'Opening chat...', description: `You asked: ${chatInput}`});
        openChatWithVoice(); // This will just open the chat for now
        setChatInput('');
    }

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Loading...</p>
            </div>
        );
    }
    
    if (gradeLevel !== 'High School') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Card className="max-w-md p-8">
                    <CardHeader>
                        <CardTitle>Feature Not Available</CardTitle>
                        <CardDescription>
                            This SAT Prep feature is exclusively available for high school students.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/dashboard')}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }


    const studyTasks = [
        { title: 'Study Session', subject: 'Math', progress: 0, total: 10, color: 'bg-purple-500' },
        { title: 'Study Session', subject: 'Reading and Writing', progress: 1, total: 10, color: 'bg-green-500' },
        { title: 'Practice Test', subject: 'Short Practice Test', progress: 0, total: 20, color: 'bg-yellow-500' },
    ];
    
    const todayIndex = new Date().getDay();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                 <div className="space-y-4">
                    <h1 className="text-5xl font-bold tracking-tight">Welcome, {user?.displayName?.split(' ')[0] || 'Grady'}! 👋</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        I'm Satori, your personal SAT tutor. I'll guide you every step of the way and help you
                        reach your 1480 goal. To get started, jump into two guided study sessions and a short
                        practice test. This will help me check your current level, estimate your score, and build
                        your personalised study plan.
                    </p>
                </div>
                 <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Rocket className="text-primary"/> Let's begin:</h2>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li><Link href="#" className="hover:underline font-medium">Study Session: Reading</Link></li>
                        <li><Link href="#" className="hover:underline font-medium">Study Session: Math</Link></li>
                        <li><Link href="/dashboard/sat-prep/practice-test" className="hover:underline font-medium">Short Practice Test</Link></li>
                    </ul>
                </div>

                <div className="pt-8">
                     <div className="relative">
                        <Input 
                            placeholder="Ask Satori anything" 
                            className="h-14 rounded-full pl-6 pr-16 text-lg"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                        />
                        <Button size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-10 w-10" onClick={handleChatSubmit}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Study Streak</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-bold text-lg mb-2">{streak} Days study streak</p>
                         <div className="flex justify-between gap-1">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <div key={day} className="text-center space-y-1">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full bg-muted flex items-center justify-center",
                                        i < todayIndex && "bg-green-500/20",
                                        i === todayIndex && "bg-primary text-primary-foreground"
                                    )}>
                                        <p className="font-bold text-sm">{day.charAt(0)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Do this next:</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {studyTasks.map((task, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{task.title}</p>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-2 w-2 rounded-full", task.color)}/>
                                        <p className="font-semibold">{task.subject}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-medium">{task.progress}/{task.total}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Side quests:</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center py-4">Coming soon...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

