
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Check, Loader2, X, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from './loading';
import { Progress } from '@/components/ui/progress';
import { generateQuizFromModule } from '@/lib/actions';
import type { QuizQuestion } from '@/ai/schemas/quiz-schema';
import GeneratingCourse from '@/app/dashboard/courses/GeneratingCourse';
import AIBuddy from '@/components/ai-buddy';
import { motion } from 'framer-motion';

type ChapterContentBlock = {
    type: 'text' | 'question';
    content?: string;
    question?: string;
    options?: string[];
    correctAnswer?: string;
};

type Chapter = {
    id: string;
    title: string;
    content?: ChapterContentBlock[] | string;
    activity?: string;
};

type Unit = {
    id: string;
    title: string;
    chapters: Chapter[];
};

type Course = {
    id: string;
    name: string;
    units: Unit[];
    completedChapters?: string[];
};

const ChapterContentDisplay = ({ chapter }: { chapter: Chapter }) => {
    const [contentBlocks, setContentBlocks] = useState<ChapterContentBlock[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (chapter.content && typeof chapter.content === 'string') {
            try {
                const parsedContent = JSON.parse(chapter.content);
                setContentBlocks(parsedContent);
            } catch (e) {
                 // If it's not a valid JSON string, treat it as plain text.
                setContentBlocks([{ type: 'text', content: chapter.content }]);
            }
        } else if (Array.isArray(chapter.content)) {
            setContentBlocks(chapter.content);
        }
    }, [chapter]);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setUserAnswers(prev => ({...prev, [questionIndex]: answer}));
    };
    
    const handleSubmitAnswer = (questionIndex: number) => {
        setSubmittedAnswers(prev => ({...prev, [questionIndex]: true}));
    };

    return (
        <div className="py-4 space-y-8 prose dark:prose-invert max-w-none">
            {contentBlocks.map((block, index) => (
                <div key={index}>
                    {block.type === 'text' && (
                        <p>{block.content}</p>
                    )}
                    {block.type === 'question' && (
                        <Card className="bg-muted/50 my-6">
                            <CardContent className="p-6">
                                <p className="font-semibold mb-4">{block.question}</p>
                                <RadioGroup 
                                    value={userAnswers[index]} 
                                    onValueChange={(val) => handleAnswerChange(index, val)}
                                    disabled={submittedAnswers[index]}
                                >
                                    <div className="space-y-2">
                                    {block.options?.map((option, i) => {
                                        const isSubmitted = submittedAnswers[index];
                                        const isCorrect = option === block.correctAnswer;
                                        const isSelected = userAnswers[index] === option;
                                        return (
                                            <Label key={i} className={cn("flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer",
                                                isSubmitted && isCorrect && "border-green-500 bg-green-500/10",
                                                isSubmitted && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                                                !isSubmitted && "hover:bg-background"
                                            )}>
                                                <RadioGroupItem value={option} />
                                                {option}
                                            </Label>
                                        )
                                    })}
                                    </div>
                                </RadioGroup>
                                {!submittedAnswers[index] && (
                                    <Button onClick={() => handleSubmitAnswer(index)} size="sm" className="mt-4" disabled={!userAnswers[index]}>Submit</Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            ))}
            {chapter.activity && (
                 <Card className="bg-yellow-500/10 border-yellow-500/20">
                    <CardContent className="p-6">
                         <h4 className="font-bold text-yellow-700">Quick Activity</h4>
                         <p className="text-yellow-800/80">{chapter.activity}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
};

const quizGenerationSteps = [
    { progress: 15, label: "Analyzing module content..." },
    { progress: 50, label: "Crafting challenging questions..." },
    { progress: 85, label: "Polishing distractors and explanations..." },
    { progress: 99, label: "Assembling your quiz..." },
];

const QuizLoadingState = ({ unitTitle }: { unitTitle: string }) => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

     useEffect(() => {
        const totalDuration = 8000;
        const stepDurations = [0.2, 0.4, 0.3, 0.1];

        let stepStartTime = 0;
        let stepIndex = 0;
        let animationFrameId: number;

        const animateProgress = (timestamp: number) => {
            if (!stepStartTime) stepStartTime = timestamp;
            const elapsedTime = timestamp - stepStartTime;

            const currentStepInfo = quizGenerationSteps[stepIndex];
            const previousStepProgress = stepIndex > 0 ? quizGenerationSteps[stepIndex - 1].progress : 0;
            const stepDuration = totalDuration * stepDurations[stepIndex];
            
            let stepProgress = Math.min(1, elapsedTime / stepDuration);
            let newOverallProgress = Math.floor(previousStepProgress + stepProgress * (currentStepInfo.progress - previousStepProgress));

            setProgress(newOverallProgress);
            setCurrentStep(stepIndex);

            if (stepProgress >= 1) {
                if (stepIndex < quizGenerationSteps.length - 1) {
                    stepIndex++;
                    stepStartTime = timestamp;
                } else {
                    setProgress(99); 
                    return;
                }
            }
            animationFrameId = requestAnimationFrame(animateProgress);
        };
        
        animationFrameId = requestAnimationFrame(animateProgress);
        
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 max-w-md mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full"
            >
                <div className="relative mb-8 flex flex-col items-center">
                    <div className="relative w-32 h-32">
                        <AIBuddy className="w-full h-full" isStatic={false}/>
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold">Building your quiz:</h1>
                <h2 className="text-xl font-bold text-primary mb-4">{unitTitle}</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">Get ready to show what you know!</p>

                <div className="w-full max-w-sm mx-auto">
                     <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-muted-foreground text-left">
                            {quizGenerationSteps[currentStep].label}
                        </p>
                         <p className="text-xs font-semibold text-primary">{progress}%</p>
                    </div>
                    <Progress value={progress} className="mb-6 h-2"/>
                </div>
            </motion.div>
        </div>
    );
};


const ModuleQuiz = ({ course, unit }: { course: Course, unit: Unit }) => {
    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<number, {answer: string, isCorrect: boolean}>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [user] = useAuthState(auth);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const generateQuiz = async () => {
            setIsGenerating(true);
            try {
                const moduleContent = unit.chapters
                    .filter(c => c.title !== 'Module Quiz')
                    .map(c => `Chapter: ${c.title}\n${typeof c.content === 'string' ? c.content : JSON.stringify(c.content)}`)
                    .join('\n\n');

                const result = await generateQuizFromModule({
                    moduleContent,
                    learnerType: (localStorage.getItem('learnerType') as any) || 'Reading/Writing'
                });
                setQuiz(result.questions);
            } catch (error) {
                console.error("Quiz generation failed:", error);
                toast({ variant: 'destructive', title: 'Failed to generate quiz.' });
            } finally {
                setIsGenerating(false);
            }
        };
        generateQuiz();
    }, [unit, toast]);

    const handleSubmitAnswer = () => {
        if (!quiz || selectedAnswer === null) return;
        
        const isCorrect = selectedAnswer === quiz[currentQuestionIndex].correctAnswer;
        setAnswers(prev => ({...prev, [currentQuestionIndex]: { answer: selectedAnswer, isCorrect }}));
        setSelectedAnswer(null);
    };

    const handleFinishQuiz = async () => {
        if (!quiz || !user) return;
        const score = Object.values(answers).filter(a => a.isCorrect).length;
        const total = quiz.length;
        
        try {
            await addDoc(collection(db, 'quizResults'), {
                userId: user.uid,
                courseId: course.id,
                moduleId: unit.id,
                score: score,
                totalQuestions: total,
                answers: answers,
                timestamp: serverTimestamp()
            });
        } catch(e) {
            console.error(e);
        }

        setIsFinished(true);
    };

    if (isGenerating) {
        return <QuizLoadingState unitTitle={unit.title} />;
    }

    if (!quiz) {
        return <div className="text-center p-8">Could not load the quiz. Please try again.</div>;
    }
    
    const currentQuestion = quiz[currentQuestionIndex];
    const isAnswered = answers[currentQuestionIndex] !== undefined;

    if (isFinished) {
        const score = Object.values(answers).filter(a => a.isCorrect).length;
        const total = quiz.length;
        return (
            <div className="max-w-xl mx-auto text-center py-16">
                <h2 className="text-3xl font-bold">Quiz Complete!</h2>
                <p className="text-6xl font-bold my-6">{score} / {total}</p>
                <Button onClick={() => router.push(`/dashboard/courses/${course.id}`)}>Back to Course</Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {quiz.length}</p>
                <Progress value={((currentQuestionIndex + 1) / quiz.length) * 100} className="mt-2 h-2" />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{currentQuestion.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={selectedAnswer || ''} onValueChange={setSelectedAnswer} disabled={isAnswered}>
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                 <Label key={index} className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all",
                                    isAnswered && option === currentQuestion.correctAnswer && "border-green-500 bg-green-500/10",
                                    isAnswered && selectedAnswer === option && option !== currentQuestion.correctAnswer && "border-red-500 bg-red-500/10",
                                    !isAnswered && "cursor-pointer hover:bg-muted"
                                )}>
                                    <RadioGroupItem value={option} />
                                    <span>{option}</span>
                                     {isAnswered && option === currentQuestion.correctAnswer && <CheckCircle className="h-5 w-5 text-green-500 ml-auto"/>}
                                    {isAnswered && selectedAnswer === option && option !== currentQuestion.correctAnswer && <XCircle className="h-5 w-5 text-red-500 ml-auto"/>}
                                </Label>
                            ))}
                        </div>
                    </RadioGroup>
                </CardContent>
                <CardFooter className="justify-end">
                    {isAnswered ? (
                         currentQuestionIndex < quiz.length - 1 ? (
                            <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>Next</Button>
                        ) : (
                            <Button onClick={handleFinishQuiz}>Finish Quiz</Button>
                        )
                    ) : (
                        <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>Submit</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}

export default function ChapterPage() {
    const params = useParams();
    const router = useRouter();
    const { courseId, chapterId } = params;

    const [user, authLoading] = useAuthState(auth);
    const { toast } = useToast();
    
    const [course, setCourse] = useState<Course | null>(null);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [unit, setUnit] = useState<Unit | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !courseId || !chapterId) {
            if (!authLoading) router.push('/dashboard/courses');
            return;
        }

        const courseRef = doc(db, 'courses', courseId as string);
        const unsubscribe = onSnapshot(courseRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().userId === user.uid) {
                const courseData = { id: docSnap.id, ...docSnap.data() } as Course;
                setCourse(courseData);
                
                let foundChapter: Chapter | undefined;
                let foundUnit: Unit | undefined;

                for (const u of courseData.units || []) {
                    const c = u.chapters.find(c => c.id === chapterId);
                    if (c) {
                        foundChapter = c;
                        foundUnit = u;
                        break;
                    }
                }

                if (foundChapter && foundUnit) {
                    setChapter(foundChapter);
                    setUnit(foundUnit);
                } else {
                    toast({ variant: 'destructive', title: 'Chapter not found' });
                }
            } else {
                 toast({ variant: 'destructive', title: 'Course not found' });
                 router.push('/dashboard/courses');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [courseId, chapterId, user, authLoading, router, toast]);

    const handleComplete = async () => {
        if (!course || !user || !chapter || !unit) return;
        
        const courseRef = doc(db, 'courses', courseId as string);
        
        try {
            await updateDoc(courseRef, {
                completedChapters: arrayUnion(chapter.id)
            });
            
            toast({ title: 'Chapter Complete!', description: 'Moving to the next chapter.'});

            const chapterIndex = unit.chapters.findIndex(c => c.id === chapter.id);
            
            if (chapterIndex < unit.chapters.length - 1) {
                const nextChapter = unit.chapters[chapterIndex + 1];
                router.push(`/dashboard/courses/${courseId}/${nextChapter.id}`);
            } else {
                router.push(`/dashboard/courses/${courseId}`);
            }

        } catch (error) {
            console.error("Failed to mark chapter as complete:", error);
            toast({ variant: 'destructive', title: 'Update failed.' });
        }
    };


    if (loading || authLoading) {
        return <Loading />;
    }

    if (!chapter) {
        return <div>Chapter not found.</div>
    }

    if (chapter.title === 'Module Quiz' && course && unit) {
        return <ModuleQuiz course={course} unit={unit} />;
    }
    
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Button variant="ghost" onClick={() => router.push(`/dashboard/courses/${courseId}`)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Course
            </Button>
            <h1 className="text-4xl font-bold mb-2">{chapter.title}</h1>
            <p className="text-muted-foreground mb-8">From course: {course?.name}</p>

            <ChapterContentDisplay chapter={chapter} />
            
            <Button onClick={handleComplete} size="lg" className="w-full mt-12">
                <Check className="mr-2 h-5 w-5"/>
                Complete & Next Chapter
            </Button>
        </div>
    )
}

    