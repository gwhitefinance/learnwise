

'use client';

import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, collection, query, where, updateDoc, arrayUnion } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { CheckCircle, Lock, ArrowLeft, Loader2, X, Check, BookMarked, BrainCircuit, MessageSquare, Copy, Lightbulb, Play, Pen, Tag, RefreshCw, PenSquare, PlayCircle, RotateCcw, BookCopy, Book } from 'lucide-react';
import { generateUnitContent, generateSummary, generateChapterContent, generateMiniCourse, generateQuizAction, generateExplanation, generateFlashcardsFromUnit } from '@/lib/actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FloatingChatContext } from '@/components/floating-chat';
import AIBuddy from '@/components/ai-buddy';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { QuizQuestion } from '@/ai/schemas/quiz-schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Chapter = {
    id: string;
    title: string;
    content?: any;
    activity?: string;
};

type ChapterContentBlock = {
    type: 'text' | 'question';
    content?: string;
    question?: string;
    options?: string[];
    correctAnswer?: string;
};

type Unit = {
    id: string;
    title: string;
    description?: string;
    chapters: Chapter[];
};

type QuizResult = {
    id: string;
    score: number;
    totalQuestions: number;
};

type StudyGuide = {
    id: string;
    title: string;
    courseId: string;
}

type Course = {
    id: string;
    name: string;
    description?: string;
    units: Unit[];
    completedChapters?: string[];
    keyConcepts?: string[];
};

export default function CoursePage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const router = useRouter();
    const [user, authLoading] = useAuthState(auth);
    const [course, setCourse] = useState<Course | null>(null);
    const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
    const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [aiBuddyName, setAiBuddyName] = useState('Taz');

    const [isEditingConcepts, setIsEditingConcepts] = useState(false);
    const [tempConcepts, setTempConcepts] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [previousKeyConcepts, setPreviousKeyConcepts] = useState<string[] | null>(null);
    const [previousUnits, setPreviousUnits] = useState<Unit[] | null>(null);

    // Practice Quiz State
    const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
    const [quizDialogStep, setQuizDialogStep] = useState(1);
    const [quizConfig, setQuizConfig] = useState<{unit: Unit | null; selectedChapters: string[], numQuestions: number}>({ unit: null, selectedChapters: [], numQuestions: 5 });
    const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({
        'Multiple Choice': 5,
        'Short Answer': 0,
        'Free Response (FRQ)': 0,
        'True/False': 0,
        'Fill in the Blank': 0,
    });
    const [practiceQuiz, setPracticeQuiz] = useState<QuizQuestion[] | null>(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [currentPracticeQuestionIndex, setCurrentPracticeQuestionIndex] = useState(0);
    const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});
    const [practiceFeedback, setPracticeFeedback] = useState<Record<number, { isCorrect: boolean; explanation?: string; }>>({});
    const [isExplanationLoading, setIsExplanationLoading] = useState<number | null>(null);

    // Flashcard State
    const [isFlashcardDialogOpen, setIsFlashcardDialogOpen] = useState(false);
    const [flashcardConfig, setFlashcardConfig] = useState<{unit: Unit | null; selectedChapters: string[]}>({ unit: null, selectedChapters: [] });
    const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

    const { toast } = useToast();
    const { openChatWithPrompt } = useContext(FloatingChatContext) as any;

    useEffect(() => {
        if (!user) return;
        const savedName = localStorage.getItem('aiBuddyName');
        if (savedName) {
            setAiBuddyName(savedName);
        }
    }, [user]);

    useEffect(() => {
        if (!user || !courseId) return;

        const courseRef = doc(db, 'courses', courseId);
        const unsubscribe = onSnapshot(courseRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().userId === user.uid) {
                const courseData = { id: docSnap.id, ...docSnap.data() } as Course;
                setCourse(courseData);
                 setTempConcepts(courseData.keyConcepts?.join(', ') || '');
            } else {
                router.push('/dashboard/courses');
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching course:", error);
            router.push('/dashboard/courses');
        });
        
        const resultsQuery = query(collection(db, "quizResults"), where("userId", "==", user.uid), where("courseId", "==", courseId));
        const unsubscribeResults = onSnapshot(resultsQuery, (snapshot) => {
            const resultsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizResult));
            setQuizResults(resultsData);
        });

        const guidesQuery = query(collection(db, 'studyGuides'), where('userId', '==', user.uid), where('courseId', '==', courseId));
        const unsubscribeGuides = onSnapshot(guidesQuery, (snapshot) => {
            const guidesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyGuide));
            setStudyGuides(guidesData);
        });

        return () => {
            unsubscribe();
            unsubscribeResults();
            unsubscribeGuides();
        }
    }, [courseId, user, router]);

    const openUnit = (unit: Unit) => {
        setSelectedUnit(unit);
        setIsSheetOpen(true);
    };
    
     const handleSaveConcepts = async () => {
        if (!course) return;
        const conceptsArray = tempConcepts.split(',').map(c => c.trim()).filter(Boolean);
        try {
            const courseRef = doc(db, 'courses', course.id);
            await updateDoc(courseRef, { keyConcepts: conceptsArray });
            toast({ title: 'Key Concepts Updated!' });
            setIsEditingConcepts(false);
        } catch (error) {
            console.error("Error saving concepts:", error);
            toast({ variant: 'destructive', title: 'Could not save concepts.' });
        }
    };

    const handleRegenerateOutline = async () => {
        if (!course) return;
        setIsRegenerating(true);
        setPreviousKeyConcepts(course.keyConcepts || []);
        setPreviousUnits(course.units || []);
        toast({ title: 'Regenerating Course Outline...' });
        try {
            const result = await generateMiniCourse({
                courseName: course.name,
                courseDescription: `A course about ${course.name}. The key concepts are: ${course.keyConcepts?.join(', ') || ''}`,
                learnerType: (localStorage.getItem('learnerType') as any) || 'Reading/Writing',
            });
            const newUnits = result.modules.map(unit => ({
                id: crypto.randomUUID(),
                title: unit.title,
                chapters: unit.chapters.map(chapter => ({
                    id: crypto.randomUUID(),
                    title: chapter.title,
                }))
            }));
            const courseRef = doc(db, 'courses', course.id);
            await updateDoc(courseRef, { units: newUnits, keyConcepts: result.keyConcepts, completedChapters: [] }); // Reset progress
            toast({ title: 'Course Outline Regenerated!' });
        } catch(error) {
            toast({ variant: 'destructive', title: 'Failed to regenerate outline.' });
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleRevertOutline = async () => {
        if (!course || !previousUnits) return;
        try {
            const courseRef = doc(db, 'courses', course.id);
            await updateDoc(courseRef, { 
                keyConcepts: previousKeyConcepts,
                units: previousUnits
            });
            toast({ title: 'Course Reverted!' });
            setPreviousKeyConcepts(null);
            setPreviousUnits(null);
        } catch (error) {
            console.error("Error reverting course:", error);
            toast({ variant: 'destructive', title: 'Could not revert course.' });
        }
    };

    const handlePracticeQuizOpen = (unit: Unit) => {
        setQuizConfig({
            unit: unit,
            selectedChapters: unit.chapters.map(c => c.id),
            numQuestions: 5,
        });
        setQuizDialogStep(1);
        setPracticeQuiz(null);
        setCurrentPracticeQuestionIndex(0);
        setPracticeAnswers({});
        setPracticeFeedback({});
        setQuestionCounts({ 'Multiple Choice': 5, 'Short Answer': 0, 'Free Response (FRQ)': 0, 'True/False': 0, 'Fill in the Blank': 0 });
        setIsQuizDialogOpen(true);
    };

    const handleStartPracticeQuiz = async () => {
        if (!quizConfig.unit) return;

        const totalQuestions = Object.values(questionCounts).reduce((sum, count) => sum + count, 0);
        if (totalQuestions === 0) {
            toast({ variant: 'destructive', title: 'Please select at least one question type.' });
            return;
        }

        setIsGeneratingQuiz(true);
        setIsQuizDialogOpen(false);
        try {
            const content = quizConfig.unit.chapters
                .filter(c => quizConfig.selectedChapters.includes(c.id))
                .map(c => `Chapter: ${c.title}\n${typeof c.content === 'string' ? c.content : JSON.stringify(c.content) || ''}`)
                .join('\n\n');
            
            if (!content.trim()) {
                toast({ variant: 'destructive', title: 'Selected chapters have no content.' });
                setIsGeneratingQuiz(false);
                return;
            }

            const result = await generateQuizAction({
                topic: content,
                difficulty: 'Medium',
                numQuestions: totalQuestions,
            });

            setPracticeQuiz(result.questions);

        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to generate quiz.' });
        } finally {
            setIsGeneratingQuiz(false);
        }
    };
    
    const handleCheckPracticeAnswer = async () => {
        const currentQuestion = practiceQuiz?.[currentPracticeQuestionIndex];
        const userAnswer = practiceAnswers[currentPracticeQuestionIndex];
        if (!currentQuestion || !userAnswer) return;
        
        const isCorrect = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        
        let explanationText: string | undefined = undefined;
        
        if (!isCorrect) {
            setIsExplanationLoading(currentPracticeQuestionIndex);
            try {
                const result = await generateExplanation({
                    question: currentQuestion.questionText,
                    userAnswer,
                    correctAnswer: currentQuestion.correctAnswer,
                    learnerType: "Reading/Writing", // Default for simplicity here
                    provideFullExplanation: true, 
                });
                explanationText = result.explanation;
            } catch (e) {
                explanationText = "Could not load explanation.";
            } finally {
                setIsExplanationLoading(null);
            }
        }
        
        setPracticeFeedback(prev => ({ ...prev, [currentPracticeQuestionIndex]: { isCorrect, explanation: explanationText } }));
    }

     const handleQuestionCountChange = (type: string, value: string) => {
        const count = parseInt(value, 10);
        if (!isNaN(count) && count >= 0) {
            setQuestionCounts(prev => ({...prev, [type]: count}));
        } else if (value === '') {
             setQuestionCounts(prev => ({...prev, [type]: 0}));
        }
    };
    
    const handleExitQuiz = () => {
        setPracticeQuiz(null);
        setCurrentPracticeQuestionIndex(0);
        setPracticeAnswers({});
        setPracticeFeedback({});
    }

    const handleFlashcardOpen = (unit: Unit) => {
        setFlashcardConfig({
            unit: unit,
            selectedChapters: unit.chapters.filter(c => c.title !== 'Unit Quiz').map(c => c.id),
        });
        setIsFlashcardDialogOpen(true);
    };

    const handleStartFlashcards = async () => {
        if (!flashcardConfig.unit) return;

        setIsGeneratingFlashcards(true);
        setIsFlashcardDialogOpen(false);
        
        try {
            const content = flashcardConfig.unit.chapters
                .filter(c => flashcardConfig.selectedChapters.includes(c.id))
                .map(c => `Chapter: ${c.title}\n${typeof c.content === 'string' ? c.content : JSON.stringify(c.content) || ''}`)
                .join('\n\n');
            
            if (!content.trim()) {
                toast({ variant: 'destructive', title: 'Selected chapters have no content.' });
                setIsGeneratingFlashcards(false);
                return;
            }
            
            const result = await generateFlashcardsFromUnit({
                unitContent: content,
                learnerType: (localStorage.getItem('learnerType') as any) || 'Reading/Writing'
            });

            const sessionId = `flashcards_${Date.now()}`;
            const sessionData = {
                id: sessionId,
                name: `${course?.name} - ${flashcardConfig.unit.title}`,
                cards: result.flashcards,
                mastered: [],
                timestamp: new Date().toISOString(),
            };
            
            const existingSessions = JSON.parse(localStorage.getItem('flashcardSessions') || '{}');
            existingSessions[sessionId] = sessionData;
            localStorage.setItem('flashcardSessions', JSON.stringify(existingSessions));

            router.push(`/dashboard/flashcards?session=${sessionId}`);

        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to generate flashcards.' });
             setIsGeneratingFlashcards(false);
        }
    };

    if (isGeneratingFlashcards) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="relative mb-8 flex flex-col items-center">
                    <div className="relative w-48 h-48">
                        <AIBuddy className="w-full h-full" isStatic={false}/>
                    </div>
                </div>
                <h1 className="text-2xl font-bold">Taz is working on your flashcards...</h1>
                <p className="text-muted-foreground">This may take a moment.</p>
                <Loader2 className="mt-4 h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (loading || authLoading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
                <Skeleton className="h-10 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-24 w-full mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }
    
    if (!course) {
        return <div>Course not found or you do not have permission to view it.</div>;
    }

    if (practiceQuiz) {
        const currentQuestion = practiceQuiz[currentPracticeQuestionIndex];
        const feedback = practiceFeedback[currentPracticeQuestionIndex];
        const isAnswered = !!feedback;
        
        return (
            <div className="max-w-3xl mx-auto py-8 px-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Practice Quiz: {quizConfig.unit?.title}</h2>
                    <Button variant="ghost" onClick={handleExitQuiz}><X className="mr-2 h-4 w-4"/> Exit</Button>
                </div>
                <div className="mb-6">
                    <Progress value={((currentPracticeQuestionIndex + 1) / practiceQuiz.length) * 100} className="h-2"/>
                    <p className="text-sm text-muted-foreground mt-1 text-right">{currentPracticeQuestionIndex + 1} / {practiceQuiz.length}</p>
                </div>

                <Card className="flex-1">
                    <CardContent className="p-8 h-full flex flex-col">
                        <p className="text-lg font-semibold mb-6 flex-shrink-0">{currentQuestion.questionText}</p>
                        <RadioGroup 
                            value={practiceAnswers[currentPracticeQuestionIndex] || ''} 
                            onValueChange={(val) => setPracticeAnswers(p => ({ ...p, [currentPracticeQuestionIndex]: val }))}
                            disabled={isAnswered}
                            className="space-y-4"
                        >
                            {currentQuestion.options.map((option, index) => (
                                 <Label key={index} className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                                    isAnswered && (option === currentQuestion.correctAnswer ? "border-green-500 bg-green-500/10" : (practiceAnswers[currentPracticeQuestionIndex] === option ? "border-red-500 bg-red-500/10" : "")),
                                    !isAnswered && (practiceAnswers[currentPracticeQuestionIndex] === option ? "border-primary" : "")
                                )}>
                                    <RadioGroupItem value={option} />
                                    <span>{option}</span>
                                </Label>
                            ))}
                        </RadioGroup>
                         <div className="mt-auto pt-6">
                            {isAnswered ? (
                                <div className="space-y-4">
                                    {feedback.isCorrect ? (
                                         <div className="p-3 rounded-lg bg-green-500/10 text-green-700 flex items-center gap-2"><CheckCircle className="h-5 w-5"/> Correct!</div>
                                    ) : (
                                         <div className="p-3 rounded-lg bg-red-500/10 text-red-700">
                                            <p className="font-semibold">Not quite. The correct answer is: {currentQuestion.correctAnswer}</p>
                                            {isExplanationLoading === currentPracticeQuestionIndex ? (
                                                <div className="flex items-center gap-2 mt-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading explanation...</div>
                                            ) : (
                                                <p className="text-sm mt-2">{feedback.explanation}</p>
                                            )}
                                        </div>
                                    )}
                                    <Button onClick={() => {
                                        if (currentPracticeQuestionIndex < practiceQuiz.length - 1) {
                                            setCurrentPracticeQuestionIndex(i => i + 1);
                                        } else {
                                            toast({ title: 'Practice quiz finished!'});
                                            handleExitQuiz();
                                        }
                                    }}>
                                        {currentPracticeQuestionIndex < practiceQuiz.length - 1 ? 'Next' : 'Finish'}
                                    </Button>
                                </div>
                            ) : (
                                <Button onClick={handleCheckPracticeAnswer} disabled={!practiceAnswers[currentPracticeQuestionIndex]}>Check</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isGeneratingQuiz) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg font-semibold text-muted-foreground">Generating your practice quiz...</p>
            </div>
        )
    }

    const totalChapters = course.units?.flatMap(u => u.chapters).length || 0;
    const completedChaptersCount = course.completedChapters?.length || 0;
    const progress = totalChapters > 0 ? (completedChaptersCount / totalChapters) * 100 : 0;
    const hasContent = course.units && course.units.length > 0;

    const calculateCourseGrade = () => {
        if (quizResults.length === 0) return null;
        const totalScore = quizResults.reduce((acc, result) => acc + (result.score / result.totalQuestions), 0);
        const average = (totalScore / quizResults.length) * 100;
        return Math.round(average);
    }
    const courseGrade = calculateCourseGrade();

    return (
        <TooltipProvider>
            <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
                 <Button variant="ghost" onClick={() => router.push('/dashboard/courses')} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Courses
                </Button>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-grow">
                        <div className="flex flex-wrap justify-between gap-4 mb-6">
                            <div className="flex min-w-72 flex-col gap-2">
                                <p className="text-4xl font-black leading-tight tracking-[-0.033em]">{course.name}</p>
                                <p className="text-secondary-dark-text dark:text-gray-400 text-base font-normal leading-normal">{course.description || 'Your central dashboard for all course materials and study tools.'}</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <Card className="flex-1">
                                <CardHeader>
                                    <CardTitle>Course Progress</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-6 justify-between items-center">
                                        <p className="text-4xl font-bold">{Math.round(progress)}%</p>
                                    </div>
                                    <Progress value={progress} className="mt-2 h-2.5" />
                                </CardContent>
                            </Card>
                             <Card className="flex-1">
                                <CardHeader>
                                    <CardTitle>Course Grade</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-6 justify-between items-center">
                                        <p className="text-4xl font-bold">{courseGrade !== null ? `${courseGrade}%` : 'N/A'}</p>
                                    </div>
                                     <p className="text-xs text-muted-foreground mt-2">
                                        {courseGrade !== null ? `Based on ${quizResults.length} quiz(zes).` : 'Take quizzes to see your grade.'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="flex justify-center mb-6">
                            <Tabs defaultValue="units" className="w-full">
                                <div className="flex justify-center">
                                    <TabsList className="h-auto p-2">
                                        <TabsTrigger value="units" className="text-base px-6 py-2">My Study Units</TabsTrigger>
                                        <TabsTrigger value="guides" className="text-base px-6 py-2">My Study Guides</TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="units" className="pt-4">
                                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {course.units?.map(unit => (
                                            <div key={unit.id} className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-5 transition-shadow hover:shadow-lg">
                                                <div>
                                                    <p className="text-lg font-bold leading-normal">{unit.title}</p>
                                                    <p className="text-secondary-dark-text dark:text-gray-400 text-sm font-normal leading-normal mt-1 mb-4">{unit.description || `${unit.chapters.length} chapters`}</p>
                                                </div>
                                                <div className="flex flex-col gap-2 mt-auto">
                                                    <Button className="w-full justify-start bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400" onClick={() => openUnit(unit)}>
                                                        <PlayCircle className="mr-2 h-4 w-4"/>
                                                        {completedChaptersCount > 0 ? 'Continue Unit' : 'Start Unit'}
                                                    </Button>
                                                    <Button className="w-full justify-start bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400" onClick={() => handleFlashcardOpen(unit)} disabled={isGeneratingFlashcards}>
                                                        <Copy className="mr-2 h-4 w-4"/> 
                                                        Start Flashcards
                                                    </Button>
                                                    <hr className="my-2 border-border" />
                                                    <Button className="w-full justify-start" onClick={() => handlePracticeQuizOpen(unit)}>
                                                        <PenSquare className="mr-2 h-4 w-4"/> Take Practice Quiz
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="guides" className="pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {studyGuides.length > 0 ? (
                                            studyGuides.map(guide => (
                                                <Card key={guide.id} className="flex flex-col">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2"><BookCopy className="h-5 w-5"/> {guide.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardFooter className="mt-auto">
                                                        <Button variant="outline" className="w-full" asChild>
                                                            <Link href={`/dashboard/study-guides/${guide.id}`}>View Guide</Link>
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))
                                        ) : (
                                            <p className="col-span-full text-center text-muted-foreground py-16">No study guides created for this course yet.</p>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                    </div>
                    <aside className="w-full lg:w-72 xl:w-80 lg:sticky top-24 self-start flex-shrink-0">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Study Tools</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/dashboard/key-concepts">
                                            <Copy className="mr-2 h-4 w-4" /> Flashcard Hub
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/dashboard/taz-tutors">
                                            <BrainCircuit className="mr-2 h-4 w-4" /> {aiBuddyName} Study Session
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" onClick={() => openChatWithPrompt(`I have a question about ${course.name}`)}>
                                        <MessageSquare className="mr-2 h-4 w-4" /> Ask {aiBuddyName}
                                    </Button>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2"><Tag /> Key Concepts</CardTitle>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditingConcepts(!isEditingConcepts)}><Pen className="h-4 w-4"/></Button>
                                    </div>
                                    <CardDescription>Define the core topics for the AI to focus on, separated by commas.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isEditingConcepts ? (
                                        <div className="space-y-2">
                                            <Input 
                                                value={tempConcepts}
                                                onChange={(e) => setTempConcepts(e.target.value)}
                                                placeholder="e.g., Photosynthesis, Cellular Respiration"
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={handleSaveConcepts}>Save</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setIsEditingConcepts(false)}>Cancel</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {course.keyConcepts && course.keyConcepts.length > 0 ? (
                                                course.keyConcepts.map(c => <Badge key={c}>{c}</Badge>)
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No concepts defined yet.</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                                {hasContent && (
                                <CardFooter className="flex flex-col gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="secondary" size="sm" className="w-full" onClick={handleRegenerateOutline} disabled={isRegenerating}>
                                                {isRegenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                                Regenerate Outline
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Regenerates the course units and chapters based on the current Key Concepts.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    {previousUnits && !isEditingConcepts && (
                                        <Button size="sm" variant="outline" className="mt-2 w-full" onClick={handleRevertOutline}>
                                            <RotateCcw className="h-4 w-4 mr-2" /> Revert to Previous
                                        </Button>
                                    )}
                                </CardFooter>
                                )}
                            </Card>
                        </div>
                    </aside>
                </div>
            </main>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="max-w-2xl w-full sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle className="text-2xl">{selectedUnit?.title}</SheetTitle>
                        <SheetDescription>{selectedUnit?.description}</SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                        {selectedUnit?.chapters.map((chapter, index) => {
                                const unitIndex = course.units.findIndex(u => u.id === selectedUnit?.id);
                                const previousUnit = unitIndex > 0 ? course.units[unitIndex - 1] : null;
                                const areAllPreviousUnitChaptersDone = previousUnit ? previousUnit.chapters.every(c => course.completedChapters?.includes(c.id)) : true;

                                const isUnlocked = areAllPreviousUnitChaptersDone && (index === 0 || !!course.completedChapters?.includes(selectedUnit.chapters[index - 1]?.id));
                                const isCompleted = course.completedChapters?.includes(chapter.id);
                                
                                return (
                                <div key={chapter.id} className="p-4 border rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {isCompleted ? <CheckCircle className="h-6 w-6 text-green-500" /> : !isUnlocked ? <Lock className="h-6 w-6 text-muted-foreground"/> : <div className="h-6 w-6 rounded-full border-2 border-primary" />}
                                        <span className={cn("font-medium", !isUnlocked && "text-muted-foreground")}>{chapter.title}</span>
                                    </div>
                                    <Button asChild variant="secondary" size="sm" disabled={!isUnlocked}>
                                        <Link href={`/dashboard/courses/${courseId}/${chapter.id}`}>View</Link>
                                    </Button>
                                </div>
                            )})}
                        </div>
                </SheetContent>
            </Sheet>

            <Dialog open={isQuizDialogOpen} onOpenChange={(open) => { if (!open) setPracticeQuiz(null); setIsQuizDialogOpen(open); }}>
                <DialogContent className="max-w-2xl">
                     <DialogHeader>
                        <DialogTitle>Practice Quiz: {quizConfig.unit?.title}</DialogTitle>
                        <DialogDescription>
                            {quizDialogStep === 1 ? "Choose which chapters to include in your quiz." : "Choose the types and number of questions."}
                        </DialogDescription>
                    </DialogHeader>
                     {quizDialogStep === 1 ? (
                        <div className="py-4 space-y-6">
                            <div>
                                <Label>Chapters to include:</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto p-1">
                                {quizConfig.unit?.chapters.filter(c => c.title !== 'Unit Quiz').map(chapter => (
                                    <div key={chapter.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={chapter.id} 
                                            checked={quizConfig.selectedChapters.includes(chapter.id)} 
                                            onCheckedChange={(checked) => {
                                                setQuizConfig(prev => ({
                                                    ...prev,
                                                    selectedChapters: checked ? [...prev.selectedChapters, chapter.id] : prev.selectedChapters.filter(id => id !== chapter.id)
                                                }));
                                            }}
                                        />
                                        <Label htmlFor={chapter.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{chapter.title}</Label>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {Object.entries(questionCounts).map(([type, count]) => (
                                    <div key={type} className="flex items-center justify-between">
                                        <Label htmlFor={type} className="text-base">{type}</Label>
                                        <Input 
                                            id={type} 
                                            type="number" 
                                            className="w-20 h-10 text-center" 
                                            value={count} 
                                            onChange={(e) => handleQuestionCountChange(type, e.target.value)}
                                            min={0}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        {quizDialogStep === 1 ? (
                            <Button onClick={() => setQuizDialogStep(2)} disabled={quizConfig.selectedChapters.length === 0}>Next</Button>
                        ) : (
                            <div className="flex justify-between w-full">
                                <Button variant="ghost" onClick={() => setQuizDialogStep(1)}>Back</Button>
                                <Button onClick={handleStartPracticeQuiz}>Start Quiz</Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <Dialog open={isFlashcardDialogOpen} onOpenChange={setIsFlashcardDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Flashcards for {flashcardConfig.unit?.title}</DialogTitle>
                        <DialogDescription>Select the chapters you want to include.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                            {flashcardConfig.unit?.chapters.filter(c => c.title !== 'Unit Quiz').map(chapter => (
                                <div key={chapter.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`flashcard-${chapter.id}`}
                                        checked={flashcardConfig.selectedChapters.includes(chapter.id)}
                                        onCheckedChange={(checked) => {
                                            setFlashcardConfig(prev => ({
                                                ...prev,
                                                selectedChapters: checked ? [...prev.selectedChapters, chapter.id] : prev.selectedChapters.filter(id => id !== chapter.id)
                                            }));
                                        }}
                                    />
                                    <Label htmlFor={`flashcard-${chapter.id}`}>{chapter.title}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsFlashcardDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleStartFlashcards} disabled={flashcardConfig.selectedChapters.length === 0 || isGeneratingFlashcards}>
                            {isGeneratingFlashcards ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                            Generate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
