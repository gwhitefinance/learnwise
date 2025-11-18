

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Loading from './loading';
import { Progress } from '@/components/ui/progress';
import { generateQuizFromNote, generateFlashcardsFromNote, generateCrunchTimeStudyGuide, generateExplanation, generateSummary, generateChapterContent } from '@/lib/actions';
import type { QuizQuestion } from '@/ai/schemas/quiz-schema';
import AIBuddy from '@/components/ai-buddy';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

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
    content?: ChapterContentBlock[];
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
        if (Array.isArray(chapter.content)) {
            setContentBlocks(chapter.content);
        } else if (typeof chapter.content === 'string' && chapter.content.trim().startsWith('[')) {
            try {
                setContentBlocks(JSON.parse(chapter.content));
            } catch (e) {
                // It's not JSON, treat as plain text
                setContentBlocks([{ type: 'text', content: chapter.content }]);
            }
        } else if (typeof chapter.content === 'string') {
            setContentBlocks([{ type: 'text', content: chapter.content }]);
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
    { progress: 15, label: "Analyzing unit content..." },
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
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [user] = useAuthState(auth);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const generateQuiz = async () => {
            setIsGenerating(true);
            try {
                const unitContent = unit.chapters
                    .filter(c => c.title !== 'Unit Quiz')
                    .map(c => {
                        let contentString = '';
                        if (typeof c.content === 'string') {
                            contentString = c.content;
                        } else if (Array.isArray(c.content)) {
                            contentString = c.content.map(block => block.content || block.question).join(' ');
                        }
                        return `Chapter: ${c.title}\n${contentString}`;
                    })
                    .join('\n\n');


                const result = await generateQuizFromNote({
                    noteContent: unitContent,
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

    const handleAnswerSelect = (answer: string) => {
        setUserAnswers(prev => ({...prev, [currentQuestionIndex]: answer}));
    };

    const handleNextQuestion = () => {
        if (!quiz) return;
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleFinishQuiz();
        }
    };
    
    const handleFinishQuiz = async () => {
        if (!quiz || !user) return;
        const score = quiz.reduce((acc, question, index) => {
            return acc + (userAnswers[index] === question.correctAnswer ? 1 : 0);
        }, 0);
        
        try {
            await addDoc(collection(db, 'quizResults'), {
                userId: user.uid,
                courseId: course.id,
                unitId: unit.id,
                score: score,
                totalQuestions: quiz.length,
                answers: userAnswers,
                timestamp: serverTimestamp()
            });

            // Save incorrect answers for review
            for (let i = 0; i < quiz.length; i++) {
                if(userAnswers[i] && userAnswers[i] !== quiz[i].correctAnswer) {
                    await addDoc(collection(db, 'quizAttempts'), {
                        userId: user.uid,
                        courseId: course.id,
                        topic: unit.title,
                        question: quiz[i].questionText,
                        userAnswer: userAnswers[i],
                        correctAnswer: quiz[i].correctAnswer,
                        timestamp: serverTimestamp(),
                    });
                }
            }

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
    
    if (isFinished) {
        const score = quiz.reduce((acc, q, i) => acc + (userAnswers[i] === q.correctAnswer ? 1 : 0), 0);
        const total = quiz.length;
        
        return (
            <div className="max-w-2xl mx-auto py-8 text-center">
                <h2 className="text-3xl font-bold">Quiz Complete!</h2>
                <p className="text-6xl font-bold my-6">{score} / {total}</p>
                 <div className="flex justify-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/courses/${course.id}`}>Back to Course</Link>
                    </Button>
                    <Button onClick={() => { setCurrentQuestionIndex(0); setUserAnswers({}); setIsFinished(false); }}>Retake Quiz</Button>
                </div>

                <Card className="mt-8 text-left">
                    <CardHeader>
                        <CardTitle>Post-Quiz Tools</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="secondary" className="w-full justify-start">Generate Flashcards from this unit</Button>
                        <Button variant="secondary" className="w-full justify-start">Create a Study Guide for this unit</Button>
                    </CardContent>
                </Card>

                 {score < total && (
                    <Card className="mt-8 text-left">
                         <CardHeader>
                            <CardTitle>Review Incorrect Answers</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="single" collapsible className="w-full">
                                {quiz.map((q, i) => userAnswers[i] !== q.correctAnswer && (
                                    <AccordionItem value={`item-${i}`} key={i}>
                                        <AccordionTrigger>{q.questionText}</AccordionTrigger>
                                        <AccordionContent>
                                            <p className="text-red-500">Your Answer: {userAnswers[i] || 'No Answer'}</p>
                                            <p className="text-green-500">Correct Answer: {q.correctAnswer}</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }
    
    const currentQuestion = quiz[currentQuestionIndex];

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
                    <RadioGroup value={userAnswers[currentQuestionIndex] || ''} onValueChange={handleAnswerSelect}>
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                 <Label key={index} className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                                    userAnswers[currentQuestionIndex] === option ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                                )}>
                                    <RadioGroupItem value={option} />
                                    <span>{option}</span>
                                </Label>
                            ))}
                        </div>
                    </RadioGroup>
                </CardContent>
                 <CardFooter className="justify-end">
                     <Button onClick={handleNextQuestion} disabled={!userAnswers[currentQuestionIndex]}>
                        {currentQuestionIndex < quiz.length - 1 ? 'Next' : 'Finish Quiz'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

const GeneratingNextChapter = ({ summary, progress }: { summary: string, progress: number }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 max-w-2xl mx-auto">
            <div className="relative mb-8 flex flex-col items-center">
                <div className="relative w-32 h-32">
                    <AIBuddy className="w-full h-full" isStatic={false} />
                </div>
            </div>
            <h1 className="text-2xl font-bold">Building your next chapter...</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">While you wait, here's a quick summary of what you just learned!</p>
            <Card className="w-full mb-8 text-left">
                <CardHeader><CardTitle>Chapter Summary</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{summary}</p>
                </CardContent>
            </Card>
            <div className="w-full max-w-sm mx-auto">
                <Progress value={progress} className="h-2" />
            </div>
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
    
    // New state for generating next chapter
    const [isGeneratingNext, setIsGeneratingNext] = useState(false);
    const [currentSummary, setCurrentSummary] = useState('');
    const [generationProgress, setGenerationProgress] = useState(0);


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
                    // If content is missing, generate it on the fly
                    if (!foundChapter.content) {
                        generateChapterContent({
                            courseName: courseData.name,
                            unitTitle: foundUnit.title,
                            chapterTitle: foundChapter.title,
                            learnerType: (localStorage.getItem('learnerType') as any) || 'Reading/Writing'
                        }).then(contentResult => {
                            const updatedChapter = { ...foundChapter!, ...contentResult };
                            setChapter(updatedChapter);
                            setUnit(foundUnit!);
                             // Update Firestore in the background
                            const updatedUnits = courseData.units.map(u => 
                                u.id === foundUnit!.id ? {
                                    ...u,
                                    chapters: u.chapters.map(c => c.id === foundChapter!.id ? updatedChapter : c)
                                } : u
                            );
                            updateDoc(doc(db, 'courses', courseId as string), { units: updatedUnits });
                        });
                    } else {
                        setChapter(foundChapter);
                        setUnit(foundUnit);
                    }

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

        // Immediately mark current chapter as complete
        const courseRef = doc(db, 'courses', courseId as string);
        await updateDoc(courseRef, {
            completedChapters: arrayUnion(chapter.id)
        });
        toast({ title: 'Chapter Complete!' });

        const chapterIndex = unit.chapters.findIndex(c => c.id === chapter.id);
        const isLastChapterInUnit = chapterIndex === unit.chapters.length - 1;
        const unitIndex = course.units.findIndex(u => u.id === unit.id);
        const isLastUnitInCourse = unitIndex === course.units.length - 1;

        if (isLastChapterInUnit && isLastUnitInCourse) {
            router.push(`/dashboard/courses/${courseId}`);
            return;
        }

        // Set loading state
        setIsGeneratingNext(true);
        setGenerationProgress(0);

        // Generate summary for the current chapter
        let summaryText = 'Great job completing that chapter!';
        if (chapter.content) {
            try {
                const summaryResult = await generateSummary({
                    noteContent: Array.isArray(chapter.content)
                        ? chapter.content.map(b => b.content || b.question).join(' ')
                        : typeof chapter.content === 'string' ? chapter.content : ''
                });
                summaryText = summaryResult.summary;
            } catch (e) {
                console.error("Summary generation failed:", e);
            }
        }
        setCurrentSummary(summaryText);
        setGenerationProgress(25);

        // Determine next chapter and unit
        let nextChapter, nextUnit;
        if (!isLastChapterInUnit) {
            nextChapter = unit.chapters[chapterIndex + 1];
            nextUnit = unit;
        } else {
            nextUnit = course.units[unitIndex + 1];
            nextChapter = nextUnit.chapters[0];
        }

        // Generate content for the next chapter
        try {
            const contentResult = await generateChapterContent({
                courseName: course.name,
                unitTitle: nextUnit.title,
                chapterTitle: nextChapter.title,
                learnerType: (localStorage.getItem('learnerType') as any) || 'Reading/Writing'
            });
            setGenerationProgress(75);

            const courseDoc = await getDoc(courseRef);
            const currentCourseData = courseDoc.data() as Course;

            const updatedUnits = currentCourseData.units.map(u => {
                if (u.id === nextUnit.id) {
                    return {
                        ...u,
                        chapters: u.chapters.map(c => 
                            c.id === nextChapter.id ? { ...c, ...contentResult } : c
                        )
                    };
                }
                return u;
            });
            
            await updateDoc(courseRef, { units: updatedUnits });
            setGenerationProgress(100);
            
            // Navigate to the next chapter
            router.push(`/dashboard/courses/${courseId}/${nextChapter.id}`);
            setIsGeneratingNext(false);

        } catch (error) {
            console.error("Failed to generate next chapter:", error);
            toast({ variant: 'destructive', title: 'Could not generate the next chapter.' });
            setIsGeneratingNext(false);
            router.push(`/dashboard/courses/${courseId}`); // Go back to course page on failure
        }
    };
    
    if (isGeneratingNext) {
        return <GeneratingNextChapter summary={currentSummary} progress={generationProgress} />;
    }

    if (loading || authLoading || !chapter) {
        return <Loading />;
    }

    if (chapter.title === 'Unit Quiz' && course && unit) {
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
