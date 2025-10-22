
'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calculator, Loader2, RefreshCw, FileText, Trophy, Clock, GraduationCap, ArrowRight, Rocket, Send } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type TestResult = {
    id: string;
    userId: string;
    total: number;
    readingWriting: number;
    math: number;
    timestamp: { toDate: () => Date };
};

const DailyQuestion = () => {
    const [questionData, setQuestionData] = useState<SatQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [learnerType, setLearnerType] = useState<string | null>(null);

    useEffect(() => {
        const type = localStorage.getItem('learnerType');
        setLearnerType(type);
        fetchQuestion();
    }, []);

    const fetchQuestion = async () => {
        setIsLoading(true);
        setSelectedAnswer(null);
        setIsAnswered(false);
        try {
            const today = new Date().toISOString().split('T')[0];
            const result = await generateSatQuestion({ seed: today, learnerType: (learnerType as any) ?? 'Reading/Writing' });
            setQuestionData(result);
        } catch (error) {
            console.error("Failed to fetch daily question:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckAnswer = () => {
        setIsAnswered(true);
    };

    if (isLoading) {
        return <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>;
    }
    
    if (!questionData) {
        return <Card><CardContent className="p-6 text-center text-muted-foreground">Could not load question. Try refreshing.</CardContent></Card>;
    }

    const isCorrect = selectedAnswer === questionData.correctAnswer;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Question of the Day</CardTitle>
                        <CardDescription>A new challenge every day to keep you sharp.</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchQuestion} disabled={isLoading}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        <Badge variant="secondary" className="capitalize">{questionData.category}</Badge>
                        {questionData.passage && (
                            <blockquote className="border-l-4 pl-4 italic text-sm text-muted-foreground">
                                {questionData.passage}
                            </blockquote>
                        )}
                        <p className="font-semibold">{questionData.question}</p>
                        <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer} disabled={isAnswered}>
                            <div className="space-y-3">
                                {questionData.options.map((option, index) => (
                                    <Label key={index} htmlFor={`option-${index}`} className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                        isAnswered && option === questionData.correctAnswer && "border-green-500 bg-green-500/10",
                                        isAnswered && selectedAnswer === option && !isCorrect && "border-red-500 bg-red-500/10",
                                        !isAnswered && selectedAnswer === option && "border-primary"
                                    )}>
                                        <RadioGroupItem value={option} id={`option-${index}`} />
                                        <span>{option}</span>
                                    </Label>
                                ))}
                            </div>
                        </RadioGroup>
                        <Button onClick={handleCheckAnswer} disabled={isAnswered || !selectedAnswer}>Check Answer</Button>
                    </div>
                    {isAnswered && (
                        <div className="md:w-1/3 md:border-l md:pl-8 space-y-4">
                            <h4 className={cn("font-bold text-lg", isCorrect ? 'text-green-600' : 'text-red-600')}>
                                {isCorrect ? "Correct!" : "Not Quite"}
                            </h4>
                            <p className="text-sm text-muted-foreground">{questionData.explanation}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
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
        toast({ title: 'Opening chat...', description: `You asked: ${chatInput}`});
        openChatWithVoice(); 
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
    ];
    
    const todayIndex = new Date().getDay();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                 <div className="space-y-4">
                    <h1 className="text-5xl font-bold tracking-tight">Welcome, {user?.displayName?.split(' ')[0] || 'Student'}! 👋</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        I'm Tutorin, your personal SAT tutor. I'll guide you every step of the way and help you
                        reach your goal. To get started, jump into a study session or a practice test. This will help me check your current level, estimate your score, and build
                        your personalised study plan.
                    </p>
                </div>
                 <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Rocket className="text-primary"/> Let's begin:</h2>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li><Link href="#" className="hover:underline font-medium">Study Session: Reading</Link></li>
                        <li><Link href="#" className="hover:underline font-medium">Study Session: Math</Link></li>
                        <li><Link href="/dashboard/sat-prep/practice-test" className="hover:underline font-medium">Full-Length Practice Test</Link></li>
                    </ul>
                </div>
                 <DailyQuestion />
                <div className="pt-8">
                     <div className="relative">
                        <Input 
                            placeholder="Ask Tutorin anything" 
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
                                        i < streak % 7 && "bg-green-500/20",
                                        i === streak % 7 && "bg-primary text-primary-foreground"
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
                        <CardTitle>Past Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {resultsLoading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : pastResults.length > 0 ? (
                            <div className="space-y-3">
                                {pastResults.slice(0, 3).map(result => (
                                    <Link key={result.id} href={`/dashboard/sat-prep/${result.id}`}>
                                        <div className="flex justify-between items-center p-3 rounded-lg hover:bg-muted">
                                            <div>
                                                <p className="font-semibold">{result.total}</p>
                                                <p className="text-xs text-muted-foreground">{format(result.timestamp.toDate(), 'MMM d, yyyy')}</p>
                                            </div>
                                            <Trophy className="h-5 w-5 text-yellow-500"/>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-sm text-muted-foreground py-4">No past test results.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
