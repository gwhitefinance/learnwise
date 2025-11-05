
'use client';

import React, { useState, useEffect, useRef, useContext, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, RotateCcw, Lightbulb, CheckCircle, XCircle, PenSquare, Palette, Brush, Eraser, Minimize, Maximize, Gem, Loader2, BookCopy, CheckSquare, ListChecks, FileText, Copy as CopyIcon, ChevronRight, BookOpen, Calculator, Send, Bot, MoreVertical, Link as LinkIcon, Share2, NotebookText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GenerateQuizInput, GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { generateExplanation, generateHint } from '@/lib/actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import AudioPlayer from '@/components/audio-player';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { generateQuizAction } from '@/lib/actions';
import { RewardContext } from '@/context/RewardContext';
import Loading from './loading';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

export const dynamic = "force-dynamic";

type Course = {
    id: string;
    name: string;
    description: string;
};

type QuizState = 'start' | 'source-selection' | 'topic-selection' | 'configuring' | 'pre-quiz' | 'in-progress' | 'results';
type AnswerState = 'unanswered' | 'answered';
type AnswerFeedback = { question: string; answer: string; correctAnswer: string; isCorrect: boolean; explanation?: string; };

const examSpecificTypes = [
    {
        category: 'Med School',
        exams: ['NCLEX Preparation', 'USMLE Step 1', 'USMLE Step 2'],
        more: 8,
    },
    {
        category: 'Finance',
        exams: ['Series 7', 'Series 63', 'Series 65'],
        more: 1,
    },
    {
        category: 'AP Exams',
        exams: ['AP Biology', 'AP Calculus AB', 'AP Calculus BC'],
        more: 35,
    },
    {
        category: 'Law School',
        exams: ['LSAT', 'Bar Exam (MBE)', 'MPRE'],
        more: 2,
    },
];

function PracticeQuizComponent() {
    const searchParams = useSearchParams();
    const initialTopic = searchParams.get('topic');

    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [topics, setTopics] = useState(initialTopic || '');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [language, setLanguage] = useState('English');
    
    // New state for multiple question types
    const [questionCounts, setQuestionCounts] = useState({
        'Multiple Choice': 10,
        'Short Answer': 0,
        'Free Response (FRQ)': 0,
        'True or False': 0,
        'Fill in the Blank': 0,
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [quizState, setQuizState] = useState<QuizState>('start');
    const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
    const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [answers, setAnswers] = useState<AnswerFeedback[]>([]);
    const [learnerType, setLearnerType] = useState<string | null>(null);
    const [quizMode, setQuizMode] = useState<'practice' | 'quizfetch' | null>(null);
    const [creationSource, setCreationSource] = useState<'materials' | 'flashcards' | null>(null);
    
    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);
    const { showReward } = useContext(RewardContext);

    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showFocusModeDialog, setShowFocusModeDialog] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [whiteboardData, setWhiteboardData] = useState<Record<number, string>>({});


    const [userCoins, setUserCoins] = useState(0);
    const [isHintLoading, setIsHintLoading] = useState(false);
    const [hint, setHint] = useState<string | null>(null);

     useEffect(() => {
        const urlTopic = searchParams.get('topic');
        if (urlTopic) {
            setTopics(urlTopic);
            setQuizMode('quizfetch');
            setQuizState('configuring');
        }
    }, [searchParams]);

    useEffect(() => {
        if (!authLoading && user) {
            const q = query(collection(db, "courses"), where("userId", "==", user.uid));
            const unsubscribeCourses = onSnapshot(q, (querySnapshot) => {
                const userCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(userCourses);
                const matchingCourse = userCourses.find(c => c.name.toLowerCase() === (initialTopic || '').toLowerCase());
                if (matchingCourse) {
                    setSelectedCourseId(matchingCourse.id);
                }
            });

            const userDocRef = doc(db, 'users', user.uid);
            const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setUserCoins(doc.data().coins || 0);
                }
            });

            return () => {
                unsubscribeCourses();
                unsubscribeUser();
            };
        }
    }, [user, authLoading, initialTopic]);


    useEffect(() => {
        const storedLearnerType = localStorage.getItem('learnerType');
        setLearnerType(storedLearnerType ?? 'Unknown');

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFocusMode(false);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const enterFocusMode = () => {
        document.documentElement.requestFullscreen().then(() => {
            setIsFocusMode(true);
            setQuizState('in-progress');
        }).catch(err => {
            console.error(`Error attempting to enable full-screen mode: \${err.message} (\${err.name})`);
            setIsFocusMode(false);
            setQuizState('in-progress');
        });
        setShowFocusModeDialog(false);
    };

    const exitFocusMode = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        setIsFocusMode(false);
    };
    
    const handleQuestionCountChange = (type: keyof typeof questionCounts, value: string) => {
        const count = parseInt(value, 10);
        if (!isNaN(count) && count >= 0) {
            setQuestionCounts(prev => ({...prev, [type]: count}));
        } else if (value === '') {
             setQuestionCounts(prev => ({...prev, [type]: 0}));
        }
    };


    const handleGenerateQuiz = async () => {
        let finalTopics = topics;
        if (quizMode === 'practice' && selectedCourseId) {
            const course = courses.find(c => c.id === selectedCourseId);
            finalTopics = course?.name || topics;
        }

        if (!finalTopics.trim()) {
            toast({
                variant: 'destructive',
                title: 'Course or Topics are required',
                description: 'Please select a course or enter some topics for your quiz.',
            });
            return;
        }
        
        const totalQuestions = Object.values(questionCounts).reduce((sum, count) => sum + count, 0);
        if (totalQuestions === 0) {
            toast({ variant: 'destructive', title: 'No questions selected.'});
            return;
        }

        setIsLoading(true);
        try {
            const generatedQuiz: GenerateQuizOutput = { questions: [] };

            for (const [type, count] of Object.entries(questionCounts)) {
                if (count > 0) {
                     const input: GenerateQuizInput = {
                        topics: finalTopics,
                        questionType: type as 'Multiple Choice' | 'True/False' | 'Short Answer',
                        difficulty: difficulty, 
                        numQuestions: count,
                    };
                    const result = await generateQuizAction(input);
                    generatedQuiz.questions.push(...result.questions);
                }
            }

            setQuiz(generatedQuiz);
            setTopics(finalTopics);
            setQuizState('pre-quiz');
             toast({
                title: 'Quiz Generated!',
                description: 'Your quiz is ready.',
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to generate quiz. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const startQuiz = () => {
        if (showFocusModeDialog) {
            setShowFocusModeDialog(false);
        }
        setQuizState('in-progress');
    }
    
    const handleSubmitAnswer = async () => {
        if (!quiz || selectedAnswer === null || !user) return;
        
        const currentQuestion = quiz.questions[currentQuestionIndex];
        const isCorrect = selectedAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();

        const answerFeedback: AnswerFeedback = {
            question: currentQuestion.question,
            answer: selectedAnswer,
            correctAnswer: currentQuestion.answer,
            isCorrect: isCorrect,
        };
        
        setAnswerState('answered');
        setFeedback(answerFeedback);
        setAnswers(prev => [...prev, answerFeedback]);
        
        if (!isCorrect) {
            try {
                await addDoc(collection(db, 'quizAttempts'), {
                    userId: user.uid,
                    question: currentQuestion.question,
                    userAnswer: selectedAnswer,
                    correctAnswer: currentQuestion.answer,
                    topic: topics,
                    courseId: selectedCourseId,
                    timestamp: serverTimestamp()
                });
            } catch (error) {
                console.error("Error saving incorrect answer:", error);
            }
            
            setIsExplanationLoading(true);
            setExplanation(null);
            try {
                const explanationResult = await generateExplanation({
                    question: currentQuestion.question,
                    userAnswer: selectedAnswer,
                    correctAnswer: currentQuestion.answer,
                    learnerType: (learnerType as 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading/Writing' | 'Unknown') ?? 'Unknown',
                    provideFullExplanation: true,
                });
                setExplanation(explanationResult.explanation);
            } catch (error) {
                console.error(error);
                setExplanation("Sorry, I couldn't generate an explanation for this question.");
            } finally {
                setIsExplanationLoading(false);
            }
        }
    }

    const handleNextQuestion = async () => {
        if (!quiz || !user) return;
        setFeedback(null);
        setExplanation(null);
        setSelectedAnswer(null);
        setAnswerState('unanswered');
        setIsWhiteboardOpen(false);
        setHint(null);
        
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            const correctAnswers = answers.filter(a => a.isCorrect).length;
            if (correctAnswers > 0) {
                let coinsEarned = correctAnswers * 5;

                try {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        coins: increment(coinsEarned)
                    });
                    showReward({ type: 'coins', amount: coinsEarned });
                    toast({ title: "Quiz Complete!", description: `You earned \${coinsEarned} coins!`});

                } catch(e) {
                    console.error("Error awarding coins:", e);
                    toast({
                        variant: 'destructive',
                        title: "Reward Award Failed",
                        description: "There was an issue awarding your coins. Please try again."
                    })
                }
            }
            if (isFocusMode) exitFocusMode();
            setQuizState('results');
        }
    };
    
    const handleStartNewQuiz = () => {
        if (isFocusMode) exitFocusMode();
        setQuizState('start');
        setQuiz(null);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setTopics('');
        setSelectedCourseId(null);
        setFeedback(null);
        setAnswerState('unanswered');
        setWhiteboardData({});
        setIsWhiteboardOpen(false);
        setHint(null);
        setCreationSource(null);
        setQuestionCounts({
            'Multiple Choice': 10,
            'Short Answer': 0,
            'Free Response (FRQ)': 0,
            'True or False': 0,
            'Fill in the Blank': 0,
        });
    }

    const handleGetHint = async () => {
        if (!quiz || !user) return;
        if (userCoins < 10) {
            toast({ variant: 'destructive', title: "Not enough coins!", description: "You need 10 coins to get a hint."});
            return;
        }

        setIsHintLoading(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { coins: increment(-10) });

            const currentQuestion = quiz.questions[currentQuestionIndex];
            const { hint } = await generateHint({
                question: currentQuestion.question,
                options: currentQuestion.options || [],
                correctAnswer: currentQuestion.answer
            });
            
            setHint(hint);

        } catch (error) {
            console.error("Failed to get hint:", error);
            toast({ variant: 'destructive', title: 'Could not get a hint.' });
             const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { coins: increment(10) });

        } finally {
            setIsHintLoading(false);
        }
    };


    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        context.strokeStyle = color;
        context.lineWidth = brushSize;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        context.stroke();
    };

    const stopDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas || !isDrawing) return;
        const context = canvas.getContext('2d');
        if (context) {
            context.closePath();
            setWhiteboardData(prev => ({
                ...prev,
                [currentQuestionIndex]: canvas.toDataURL()
            }));
        }
        setIsDrawing(false);
    };
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        setWhiteboardData(prev => ({
            ...prev,
            [currentQuestionIndex]: ''
        }));
    };
    
    const onWhiteboardOpenChange = (open: boolean) => {
        setIsWhiteboardOpen(open);
        if (open) {
             setTimeout(() => {
                const canvas = canvasRef.current;
                if (canvas) {
                    const parent = canvas.parentElement;
                    if (parent) {
                        canvas.width = parent.clientWidth;
                        canvas.height = 300;
                        
                        const context = canvas.getContext('2d');
                        if (context && whiteboardData[currentQuestionIndex]) {
                            const img = new Image();
                            img.onload = () => {
                                context.drawImage(img, 0, 0);
                            };
                            img.src = whiteboardData[currentQuestionIndex];
                        }
                    }
                }
            }, 0);
        }
    };

    const whiteboardColors = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

    const score = answers.filter(a => a.isCorrect).length;
    const totalQuestions = quiz?.questions.length ?? 0;

    if (quizState === 'start') {
        return (
             <div className="flex flex-col items-center">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold">Practice</h1>
                    <p className="text-muted-foreground mt-2">Get ready for your test, it's time to practice!</p>
                </div>
                 <div className="w-full max-w-4xl space-y-6">
                    <h2 className="text-2xl font-bold">Choose an Option to Start Studying</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={() => { setQuizMode('practice'); setQuizState('source-selection');}} className="p-6 rounded-lg text-left transition-all bg-green-500/10 border-2 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50">
                            <CheckSquare className="h-8 w-8 text-green-500 mb-2"/>
                            <h3 className="text-xl font-bold">Take a Practice Test</h3>
                            <p className="text-sm text-muted-foreground">Generate a practice test from your course content and get ready for your test.</p>
                        </button>
                        <button onClick={() => { setQuizMode('quizfetch'); setQuizState('topic-selection');}} className="p-6 rounded-lg text-left transition-all bg-blue-500/10 border-2 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50">
                            <ListChecks className="h-8 w-8 text-blue-500 mb-2"/>
                            <h3 className="text-xl font-bold">QuizFetch</h3>
                            <p className="text-sm text-muted-foreground">Generate quizzes from any topic and learn as you answer questions.</p>
                        </button>
                    </div>
                 </div>
             </div>
        )
    }

     if (quizState === 'source-selection') {
        return (
            <div className="flex flex-col items-center max-w-2xl mx-auto">
                <div className="w-full text-left mb-10">
                    <h1 className="text-4xl font-bold">Create a Test</h1>
                    <p className="text-muted-foreground mt-2">Generate a practice test from your study set, and get ready for your test.</p>
                </div>
                 <div className="w-full space-y-6">
                    <h2 className="text-xl font-semibold text-left">How would you like to create your test?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => {setCreationSource('materials'); setQuizState('topic-selection');}} className={cn("p-6 rounded-lg text-left transition-all border-2", creationSource === 'materials' ? 'border-primary bg-primary/10' : 'bg-muted/50 border-transparent hover:border-primary/50')}>
                            <div className="mb-4 bg-background p-2 rounded-md inline-block border"><FileText className="h-6 w-6 text-primary"/></div>
                            <h3 className="font-semibold">From Materials</h3>
                            <p className="text-sm text-muted-foreground">Create a test from your Study Set materials.</p>
                        </button>
                        <button onClick={() => {setCreationSource('flashcards'); setQuizState('topic-selection');}} className={cn("p-6 rounded-lg text-left transition-all border-2", creationSource === 'flashcards' ? 'border-primary bg-primary/10' : 'bg-muted/50 border-transparent hover:border-primary/50')}>
                             <div className="mb-4 bg-background p-2 rounded-md inline-block border"><CopyIcon className="h-6 w-6 text-primary"/></div>
                            <h3 className="font-semibold">From Flashcards</h3>
                            <p className="text-sm text-muted-foreground">Create a test from your Study Set flashcards.</p>
                        </button>
                    </div>
                </div>
                <div className="w-full flex justify-between items-center mt-8">
                    <Button variant="ghost" onClick={() => setQuizState('start')}>Back</Button>
                </div>
            </div>
        )
    }

    if (quizState === 'topic-selection') {
        return (
            <div className="flex flex-col items-center">
                <div className="text-center mb-10 w-full max-w-2xl">
                    <h1 className="text-4xl font-bold">Test Details</h1>
                    <p className="text-muted-foreground mt-2">Select a course and specify the details for your test.</p>
                </div>
                <Card className="w-full max-w-2xl">
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                             <Label htmlFor="course">Course</Label>
                             <Select onValueChange={setSelectedCourseId} value={selectedCourseId ?? ''} disabled={courses.length === 0}>
                                <SelectTrigger id="course">
                                    <SelectValue placeholder={courses.length > 0 ? "Select a course..." : "No courses found"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger id="language"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="English">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="difficulty">Difficulty Level</Label>
                             <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                                <SelectTrigger id="difficulty"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-6 bg-muted/50 border-t">
                        <Button variant="ghost" onClick={() => setQuizState('source-selection')}>Back</Button>
                        <Button onClick={() => setQuizState('configuring')} disabled={!selectedCourseId}>Next</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (quizState === 'pre-quiz') {
        return (
             <div className="flex flex-col items-center justify-center min-h-[60vh]">
                 <Card className="w-full max-w-lg text-center p-8">
                     <CardHeader>
                        <h2 className="text-3xl font-bold">Ready for your test?</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg grid grid-cols-3 divide-x">
                            <div className="px-2"><p className="text-sm text-muted-foreground">Questions</p><p className="font-bold text-lg">{quiz?.questions.length}</p></div>
                            <div className="px-2"><p className="text-sm text-muted-foreground">Difficulty</p><p className="font-bold text-lg">{difficulty}</p></div>
                            <div className="px-2"><p className="text-sm text-muted-foreground">Topic</p><p className="font-bold text-lg truncate">{topics}</p></div>
                        </div>
                        <p className="text-muted-foreground">Would you like to enter Focus Mode for a distraction-free experience?</p>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-4">
                        <Button className="w-full" size="lg" onClick={enterFocusMode}><Maximize className="mr-2 h-4 w-4"/> Start in Focus Mode</Button>
                        <Button className="w-full" size="lg" variant="outline" onClick={startQuiz}>Start Quiz</Button>
                    </CardFooter>
                 </Card>
            </div>
        )
    }

    if (quizState === 'in-progress' && quiz) {
        const currentQuestion = quiz.questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

        return (
             <div className="flex flex-col items-center">
                {isFocusMode && (
                    <Button onClick={exitFocusMode} variant="outline" className="fixed top-4 right-4 z-50">
                        <Minimize className="mr-2 h-4 w-4"/> Exit Focus Mode
                    </Button>
                )}
                <div className="text-center mb-10 w-full max-w-3xl">
                    <p className="text-muted-foreground mb-2">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                    <Progress value={progress} className="mb-4 h-2"/>
                    <h1 className="text-3xl font-bold mt-8">{currentQuestion.question}</h1>
                </div>

                <Card className="w-full max-w-3xl">
                    <CardContent className="p-8">
                         <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer} disabled={answerState === 'answered'}>
                            <div className="space-y-4">
                            {currentQuestion.options?.map((option, index) => (
                                <Label key={index} htmlFor={`option-\${index}`} className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                                    answerState === 'unanswered' && (selectedAnswer === option ? "border-primary bg-primary/10" : "border-border hover:bg-muted"),
                                    answerState === 'answered' && option === currentQuestion.answer && "border-green-500 bg-green-500/10",
                                    answerState === 'answered' && selectedAnswer === option && option !== currentQuestion.answer && "border-red-500 bg-red-500/10",
                                )}>
                                    <RadioGroupItem value={option} id={`option-\${index}`} />
                                    <span>{option}</span>
                                </Label>
                            ))}
                            </div>
                        </RadioGroup>
                         <div className="mt-8 flex justify-between items-center">
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => onWhiteboardOpenChange(!isWhiteboardOpen)}><PenSquare className="mr-2 h-4 w-4"/> Whiteboard</Button>
                                <Button variant="outline" onClick={handleGetHint} disabled={isHintLoading || answerState === 'answered'}>
                                    {isHintLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Gem className="mr-2 h-4 w-4"/>}
                                    Hint (10 Coins)
                                </Button>
                            </div>
                            {answerState === 'unanswered' ? (
                                <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
                                    Submit
                                </Button>
                            ) : (
                                <Button onClick={handleNextQuestion}>
                                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <Collapsible open={isWhiteboardOpen} onOpenChange={onWhiteboardOpenChange}>
                             <CollapsibleContent>
                                <div className="mt-4 p-4 border rounded-lg">
                                    <div className="flex justify-end items-center gap-2 mb-2">
                                         <Popover>
                                            <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon"><Palette /></Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-2">
                                            <div className="flex gap-1">
                                                {whiteboardColors.map(c => (
                                                <button 
                                                    key={c}
                                                    onClick={() => setColor(c)}
                                                    className={`w-8 h-8 rounded-full border-2 \${color === c ? 'border-primary' : 'border-transparent'}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                                ))}
                                            </div>
                                            </PopoverContent>
                                        </Popover>
                                         <Popover>
                                            <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon"><Brush /></Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-40 p-2">
                                            <Slider
                                                defaultValue={[brushSize]}
                                                max={30}
                                                min={1}
                                                step={1}
                                                onValueChange={(value) => setBrushSize(value[0])}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                         <Button variant="destructive" size="icon" onClick={clearCanvas}>
                                            <Eraser />
                                        </Button>
                                    </div>
                                    <canvas
                                        ref={canvasRef}
                                        className="w-full h-[300px] bg-muted rounded-md border border-dashed"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                    />
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </CardContent>
                </Card>
                
                 <Dialog open={!!hint} onOpenChange={(open) => !open && setHint(null)}>
                    <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-200 to-yellow-300">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-amber-900">
                                <Lightbulb /> Here's a Hint!
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 text-amber-800 font-medium">
                            {hint}
                        </div>
                         <DialogFooter>
                            <Button onClick={() => setHint(null)} className="bg-amber-800 hover:bg-amber-900 text-white">Got it</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={answerState === 'answered' && !feedback?.isCorrect} onOpenChange={(open) => !open && handleNextQuestion()}>
                    <DialogContent>
                        <DialogHeader>
                             <div className="flex items-center gap-2 text-red-600">
                                <XCircle className="h-8 w-8"/>
                                <DialogTitle className="text-2xl">Not Quite...</DialogTitle>
                            </div>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                            <div>
                                <h4 className="font-semibold">Your Answer:</h4>
                                <p className="text-muted-foreground">{feedback?.answer}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold">Correct Answer:</h4>
                                <p className="text-muted-foreground">{feedback?.correctAnswer}</p>
                            </div>
                            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <h4 className="font-semibold flex items-center gap-2 text-amber-700"><Lightbulb/> Explanation</h4>
                                {isExplanationLoading ? (
                                    <p className="animate-pulse text-muted-foreground mt-2">Generating personalized feedback...</p>
                                ) : (
                                    <div className="text-muted-foreground mt-2">
                                        {explanation && <AudioPlayer textToPlay={explanation} />}
                                        <p>{explanation}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                             <Button onClick={handleNextQuestion} disabled={isExplanationLoading}>
                               {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                               <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    if (quizState === 'results') {
        return (
            <div className="flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold">Quiz Results</h1>
                    <p className="text-muted-foreground mt-2">Here's how you did!</p>
                </div>
                 <Card className="w-full max-w-3xl">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-semibold">Your Score</h2>
                        <p className="text-6xl font-bold text-primary my-4">{score} / {totalQuestions}</p>
                        <p className="text-muted-foreground">You answered {totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(0) : 0}% of the questions correctly.</p>

                        <div className="mt-8">
                            <Button onClick={handleStartNewQuiz}>
                                <RotateCcw className="mr-2 h-4 w-4" /> Take a New Quiz
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    return (
        <div className="flex flex-col items-center">
            <Dialog open={showFocusModeDialog} onOpenChange={setShowFocusModeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter Focus Mode?</DialogTitle>
                        <DialogDescription>
                            Focus Mode provides a distraction-free, fullscreen environment for your quiz. You can exit anytime by pressing 'Esc' or clicking the exit button.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={startQuiz}>No, thanks</Button>
                        <Button onClick={enterFocusMode}><Maximize className="mr-2 h-4 w-4"/> Enter Focus Mode</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <div className="text-center mb-10 w-full max-w-2xl">
                <h1 className="text-4xl font-bold">Select Question Types</h1>
                <p className="text-muted-foreground mt-2">Choose the types and number of questions for your test</p>
            </div>
             <Card className="w-full max-w-2xl">
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries(questionCounts).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                                <Label htmlFor={type} className="text-base">{type}</Label>
                                <Input 
                                    id={type} 
                                    type="number" 
                                    className="w-20 h-10 text-center" 
                                    value={count} 
                                    onChange={(e) => handleQuestionCountChange(type as keyof typeof questionCounts, e.target.value)}
                                    min={0}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Exam-Specific Question Types</h3>
                        <p className="text-sm text-muted-foreground">Choose specialized question formats for various standardized exams</p>
                         <Accordion type="multiple" className="w-full space-y-2">
                             {examSpecificTypes.map(section => (
                                <AccordionItem key={section.category} value={section.category} className="border rounded-lg bg-muted/30 px-4">
                                    <AccordionTrigger className="hover:no-underline">{section.category}</AccordionTrigger>
                                    <AccordionContent className="p-2 flex flex-wrap gap-2">
                                        {section.exams.map(exam => (
                                            <Button key={exam} variant="outline" disabled>{exam}</Button>
                                        ))}
                                        {section.more > 0 && <Badge variant="secondary">+{section.more} more</Badge>}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                 </CardContent>
                 <CardFooter className="flex justify-between p-6 bg-muted/50 border-t">
                     <Button variant="ghost" onClick={() => setQuizState('topic-selection')}>Back</Button>
                     <Button onClick={handleGenerateQuiz} disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                 </CardFooter>
            </Card>
        </div>
    )
}

export default function PracticeQuizPage() {
    return (
        <Suspense fallback={<Loading />}>
            <PracticeQuizComponent />
        </Suspense>
    )
}

