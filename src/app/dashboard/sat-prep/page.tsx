
'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calculator, Loader2, RefreshCw, FileText, Trophy, Clock, GraduationCap, ArrowRight, Rocket, Send, FolderSearch } from 'lucide-react';
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
import { formatDistanceToNow } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';


type TestResult = {
    id: string;
    userId: string;
    total: number;
    readingWriting: number;
    math: number;
    timestamp: { toDate: () => Date };
};

type StudySessionResult = {
    id: string;
    userId: string;
    topic: string;
    score: number;
    timestamp: { toDate: () => Date };
    results: any; 
};

type InProgressSession = {
    topic: 'Math' | 'Reading & Writing';
    currentQuestionIndex: number;
    questions: SatQuestion[];
    userAnswers: Record<number, string>;
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
    
    const [user, authLoading] = useAuthState(auth);
    const [pastTestResults, setPastTestResults] = useState<TestResult[]>([]);
    const [pastStudySessions, setPastStudySessions] = useState<StudySessionResult[]>([]);
    const [resultsLoading, setResultsLoading] = useState(true);
    const [goalScore, setGoalScore] = useState(1200);

    const [inProgressSession, setInProgressSession] = useState<InProgressSession | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/signup');
            return;
        }

        const qTests = query(collection(db, 'satTestResults'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
        const unsubscribeTests = onSnapshot(qTests, (snapshot) => {
            const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult));
            setPastTestResults(results);
            setResultsLoading(false);
        });
        
        const qSessions = query(collection(db, 'satStudySessions'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
        const unsubscribeSessions = onSnapshot(qSessions, (snapshot) => {
            const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudySessionResult));
            setPastStudySessions(results);
        });

        const storedGrade = localStorage.getItem('onboardingGradeLevel');
        setGradeLevel(storedGrade);
        
        const storedGoalScore = localStorage.getItem('satGoalScore');
        if (storedGoalScore) {
            setGoalScore(parseInt(storedGoalScore, 10));
        }

        const savedSession = localStorage.getItem('inProgressSatSession');
        if(savedSession) {
            try {
                setInProgressSession(JSON.parse(savedSession));
            } catch (e) {
                console.error("Could not parse saved session", e);
                localStorage.removeItem('inProgressSatSession');
            }
        }

        setLoading(false);

        return () => {
            unsubscribeTests();
            unsubscribeSessions();
        }
    }, [user, authLoading, router]);

    const handleGoalScoreChange = (value: number[]) => {
        const newScore = value[0];
        setGoalScore(newScore);
        localStorage.setItem('satGoalScore', String(newScore));
    };

    const handleStartNewSession = (topic: 'Math' | 'Reading & Writing') => {
        localStorage.removeItem('inProgressSatSession');
        router.push(`/dashboard/sat-prep/study-session?topic=${encodeURIComponent(topic)}`);
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

    const progressPercent = inProgressSession ? (Object.keys(inProgressSession.userAnswers).length / inProgressSession.questions.length) * 100 : 0;


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                 <div className="space-y-4">
                    <h1 className="text-5xl font-bold tracking-tight">Welcome, {user?.displayName?.split(' ')[0] || 'Student'}! 👋</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        I'm Tutorin, your personal SAT tutor. Let's start with a study session to check your current level and build a personalized plan.
                    </p>
                </div>

                {inProgressSession && (
                     <Card className="bg-primary/10 border-primary/20">
                        <CardHeader>
                            <CardTitle>Session in Progress</CardTitle>
                            <CardDescription>You have an unfinished study session.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex justify-between items-center mb-1">
                                <p className="font-semibold">{inProgressSession.topic}</p>
                                <span className="text-sm font-medium text-muted-foreground">{progressPercent.toFixed(0)}% Complete</span>
                            </div>
                            <Progress value={progressPercent} className="h-2"/>
                        </CardContent>
                        <CardFooter>
                            <Button asChild>
                                <Link href="/dashboard/sat-prep/study-session">Continue Session <ArrowRight className="ml-2 h-4 w-4"/></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                 <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Rocket className="text-primary"/> Let's begin:</h2>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={() => handleStartNewSession('Reading & Writing')} className="w-full justify-start text-base py-6" variant="outline">
                            <BookOpen className="mr-2 h-5 w-5" /> Study Session: Reading & Writing
                        </Button>
                        <Button onClick={() => handleStartNewSession('Math')} className="w-full justify-start text-base py-6" variant="outline">
                           <Calculator className="mr-2 h-5 w-5" /> Study Session: Math
                        </Button>
                    </div>
                </div>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FolderSearch/>Question Bank</CardTitle>
                        <CardDescription>Practice specific types of questions from a large database.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/dashboard/sat-prep/reading-writing-bank">Reading & Writing Question Bank</Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                             <Link href="/dashboard/sat-prep/math-bank">Math Question Bank</Link>
                        </Button>
                    </CardContent>
                </Card>

                 <DailyQuestion />
                 <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle>Past Practice Sessions</CardTitle>
                            <CardDescription>Review your recent study sessions.</CardDescription>
                        </div>
                        <Button variant="ghost" asChild>
                            <Link href="/dashboard/sat-prep/sessions">
                                See All
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {resultsLoading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : pastStudySessions.length > 0 ? (
                            <div className="space-y-3">
                                {pastStudySessions.slice(0, 3).map(session => (
                                    <div key={session.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted">
                                        <div>
                                            <p className="font-semibold">{session.topic}</p>
                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(session.timestamp.toDate(), { addSuffix: true })}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-semibold text-primary text-lg">{session.score.toFixed(0)}%</p>
                                            <Button variant="ghost" size="sm">Review</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-sm text-muted-foreground py-4">Your past study sessions will appear here.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle>Full Practice Test</CardTitle>
                        <CardDescription className="text-primary-foreground/80">Simulate the real test environment to gauge your progress.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-white text-black hover:bg-gray-200" asChild size="lg">
                            <Link href="/dashboard/sat-prep/practice-test">
                                Start Full-Length Test <ArrowRight className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Past Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {resultsLoading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : pastTestResults.length > 0 ? (
                            <div className="space-y-3">
                                {pastTestResults.slice(0, 3).map(result => (
                                    <Link key={result.id} href={`/dashboard/sat-prep/${result.id}`}>
                                        <div className="flex justify-between items-center p-3 rounded-lg hover:bg-muted">
                                            <div>
                                                <p className="font-semibold">{result.total}</p>
                                                <p className="text-xs text-muted-foreground">{result.timestamp.toDate().toLocaleDateString()}</p>
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
                 <Card>
                    <CardHeader>
                        <CardTitle>Goal SAT Score</CardTitle>
                        <CardDescription>Adjust the slider to set your target score.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center font-bold text-4xl text-primary mb-6">{goalScore}</div>
                        <Slider
                            defaultValue={[goalScore]}
                            max={1600}
                            min={400}
                            step={10}
                            onValueChange={handleGoalScoreChange}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
