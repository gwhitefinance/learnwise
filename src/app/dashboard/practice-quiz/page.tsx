
'use client';

import React, { useState, useEffect, useRef, useContext, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, RotateCcw, Lightbulb, CheckCircle, XCircle, PenSquare, Palette, Brush, Eraser, Minimize, Maximize, Gem } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GenerateQuizInput, GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { generateExplanation, generateHint } from '@/lib/actions';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import AudioPlayer from '@/components/audio-player';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { generateQuizAction } from '@/lib/actions';
import { RewardContext } from '@/context/RewardContext';
import Loading from './loading';

export const dynamic = "force-dynamic";

type Course = {
    id: string;
    name: string;
    description: string;
};

type QuizState = 'configuring' | 'in-progress' | 'results';
type AnswerState = 'unanswered' | 'answered';
type AnswerFeedback = { question: string; answer: string; correctAnswer: string; isCorrect: boolean; explanation?: string; };

function PracticeQuizComponent() {
    const searchParams = useSearchParams();
    const initialTopic = searchParams.get('topic');

    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [topics, setTopics] = useState(initialTopic || '');
    const [questionType, setQuestionType] = useState('Multiple Choice');
    const [difficulty, setDifficulty] = useState('Medium');
    const [numQuestions, setNumQuestions] = useState('5');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [quizState, setQuizState] = useState<QuizState>('configuring');
    const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
    const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [answers, setAnswers] = useState<AnswerFeedback[]>([]);
    const [learnerType, setLearnerType] = useState<string | null>(null);
    
    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);
    const { showReward } = useContext(RewardContext);

    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showFocusModeDialog, setShowFocusModeDialog] = useState(false);
    
    // Whiteboard state
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);

    const [userCoins, setUserCoins] = useState(0);
    const [isHintLoading, setIsHintLoading] = useState(false);

     useEffect(() => {
        const urlTopic = searchParams.get('topic');
        if (urlTopic) {
            setTopics(urlTopic);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!authLoading && user) {
            const q = query(collection(db, "courses"), where("userId", "==", user.uid));
            const unsubscribeCourses = onSnapshot(q, (querySnapshot) => {
                const userCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(userCourses);
                // Pre-select course if topic matches
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
            startQuiz(); // Start the quiz right after entering fullscreen
        }).catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            setIsFocusMode(false);
            startQuiz();
        });
    };

    const exitFocusMode = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        setIsFocusMode(false);
    };

    const handleGenerateQuiz = async () => {
        if (!topics.trim()) {
            toast({
                variant: 'destructive',
                title: 'Course or Topics are required',
                description: 'Please select a course or enter some topics for your quiz.',
            });
            return;
        }

        setIsLoading(true);
        try {
            const input: GenerateQuizInput = {
                topics,
                questionType: questionType as 'Multiple Choice' | 'True/False' | 'Short Answer',
                difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
                numQuestions: parseInt(numQuestions),
            };
            const generatedQuiz = await generateQuizAction(input);
            setQuiz(generatedQuiz);
            setShowFocusModeDialog(true);
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
        if (!quiz) {
            handleGenerateQuiz();
        } else {
            setQuizState('in-progress');
        }
        setShowFocusModeDialog(false);
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
                    courseId: selectedCourseId, // Save courseId with the attempt
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
        
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            const correctAnswers = answers.filter(a => a.isCorrect).length;
            if (correctAnswers > 0) {
                let coinsEarned = correctAnswers * 5;
                
                if (difficulty === 'Medium') {
                    coinsEarned += 10;
                } else if (difficulty === 'Hard') {
                    coinsEarned += 25;
                }

                try {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        coins: increment(coinsEarned)
                    });
                    showReward({ type: 'coins', amount: coinsEarned });
                    toast({ title: "Quiz Complete!", description: `You earned ${coinsEarned} coins!`});

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
        setQuizState('configuring');
        setQuiz(null);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setTopics('');
        setSelectedCourseId(null);
        setFeedback(null);
        setAnswerState('unanswered');
    }

    const handleCourseSelection = (courseId: string) => {
        setSelectedCourseId(courseId);
        const selected = courses.find(c => c.id === courseId);
        if (selected) {
            setTopics(selected.name);
        }
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
            
            toast({
                title: 'Here\'s a hint!',
                description: hint,
                duration: 10000,
            });

        } catch (error) {
            console.error("Failed to get hint:", error);
            toast({ variant: 'destructive', title: 'Could not get a hint.' });
             // Refund coins on failure
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { coins: increment(10) });

        } finally {
            setIsHintLoading(false);
        }
    };


    // Whiteboard functions
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
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (context) {
        context.closePath();
        }
        setIsDrawing(false);
    };
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    const onSheetOpenChange = (open: boolean) => {
        if (open) {
             setTimeout(() => {
                const canvas = canvasRef.current;
                if (canvas) {
                    const parent = canvas.parentElement;
                    if (parent) {
                        canvas.width = parent.clientWidth;
                        canvas.height = parent.clientHeight;
                    }
                }
            }, 0);
        }
    };

    const whiteboardColors = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

    const score = answers.filter(a => a.isCorrect).length;
    const totalQuestions = quiz?.questions.length ?? 0;

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
                                <Label key={index} htmlFor={`option-${index}`} className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                                    answerState === 'unanswered' && (selectedAnswer === option ? "border-primary bg-primary/10" : "border-border hover:bg-muted"),
                                    answerState === 'answered' && option === currentQuestion.answer && "border-green-500 bg-green-500/10",
                                    answerState === 'answered' && selectedAnswer === option && option !== currentQuestion.answer && "border-red-500 bg-red-500/10",
                                )}>
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <span>{option}</span>
                                </Label>
                            ))}
                            </div>
                        </RadioGroup>
                         <div className="mt-8 flex justify-between items-center">
                            <div className="flex gap-2">
                                <Sheet onOpenChange={onSheetOpenChange}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline"><PenSquare className="mr-2 h-4 w-4"/> Whiteboard</Button>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="h-[80vh]">
                                        <SheetHeader className="mb-4">
                                            <SheetTitle className="flex justify-between items-center">
                                                <span>Digital Whiteboard</span>
                                                <div className="flex items-center gap-2">
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
                                                            className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-primary' : 'border-transparent'}`}
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
                                            </SheetTitle>
                                        </SheetHeader>
                                        <div className="bg-muted rounded-lg border border-dashed h-[calc(100%-80px)]">
                                            <canvas
                                                ref={canvasRef}
                                                className="w-full h-full"
                                                onMouseDown={startDrawing}
                                                onMouseMove={draw}
                                                onMouseUp={stopDrawing}
                                                onMouseLeave={stopDrawing}
                                            />
                                        </div>
                                    </SheetContent>
                                </Sheet>
                                <Button variant="outline" onClick={handleGetHint} disabled={isHintLoading || answerState === 'answered'}>
                                    <Gem className="mr-2 h-4 w-4"/> Hint (10 Coins)
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
                    </CardContent>
                </Card>
                
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
                        <p className="text-muted-foreground">You answered {((score / totalQuestions) * 100).toFixed(0)}% of the questions correctly.</p>

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

            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold">Practice Quiz</h1>
                <p className="text-muted-foreground mt-2">Generate a customized quiz to test your knowledge.</p>
            </div>

            <Card className="w-full max-w-3xl">
                <CardContent className="p-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <Label htmlFor="course">Select a Course</Label>
                            <Select value={selectedCourseId ?? ''} onValueChange={handleCourseSelection}>
                                <SelectTrigger id="course" className="mt-2">
                                    <SelectValue placeholder="Select one of your courses..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="topics">Or Enter Custom Topics</Label>
                            <Input 
                                id="topics" 
                                placeholder="e.g., Photosynthesis, World War II" 
                                className="mt-2"
                                value={topics}
                                onChange={(e) => {
                                    setTopics(e.target.value);
                                    if (selectedCourseId) setSelectedCourseId(null);
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quiz Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label htmlFor="question-type">Question Type</Label>
                                <Select value={questionType} onValueChange={setQuestionType}>
                                    <SelectTrigger id="question-type" className="mt-2">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                        <SelectItem value="True/False">True/False</SelectItem>
                                        <SelectItem value="Short Answer">Short Answer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="difficulty">Difficulty Level</Label>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger id="difficulty" className="mt-2">
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="num-questions">Number of Questions</Label>
                                <Select value={numQuestions} onValueChange={setNumQuestions}>
                                    <SelectTrigger id="num-questions" className="mt-2">
                                        <SelectValue placeholder="Select number" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <Button onClick={handleGenerateQuiz} disabled={isLoading}>
                            {isLoading ? 'Generating...' : 'Generate Quiz'}
                            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>

                </CardContent>
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
