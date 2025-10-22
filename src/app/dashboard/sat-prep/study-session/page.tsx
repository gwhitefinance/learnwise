
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { generateSatStudySession } from '@/ai/flows/sat-study-session-flow';
import type { SatQuestion } from '@/ai/schemas/sat-question-schema';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, XCircle, FileText, BookOpen, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function StudySessionPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic') as 'Math' | 'Reading & Writing' | null;

    const [questions, setQuestions] = useState<SatQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState<Record<number, boolean>>({});
    
    const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes
    const { toast } = useToast();
    
    useEffect(() => {
        if (!topic) {
            toast({ variant: 'destructive', title: 'No topic selected!' });
            router.push('/dashboard/sat-prep');
            return;
        }

        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
                const result = await generateSatStudySession({ category: topic, learnerType });
                setQuestions(result.questions);
            } catch (error) {
                console.error("Failed to fetch study session:", error);
                toast({ variant: 'destructive', title: 'Failed to load session' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, [topic, router, toast]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Handle time up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = () => {
        setIsSubmitted(prev => ({ ...prev, [currentQuestionIndex]: true }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Handle end of session
            toast({ title: "Study session complete!", description: "Great work!" });
            router.push('/dashboard/sat-prep');
        }
    };
    
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (isLoading) {
        return (
             <div className="max-w-4xl mx-auto p-8">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-8" />
                <Skeleton className="h-40 w-full mb-4" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
            </div>
        );
    }
    
    if (questions.length === 0) {
        return <div>No questions found for this session.</div>
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCurrentAnswered = isSubmitted[currentQuestionIndex];
    const selectedAnswer = userAnswers[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <header className="mb-8">
                 <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                         {topic === 'Reading & Writing' ? <BookOpen /> : <Calculator />}
                        Study Session: {topic}
                    </h1>
                     <div className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-5 w-5" />
                        <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
                    </div>
                </div>
                <div>
                     <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{currentQuestionIndex + 1} / {questions.length}</p>
                </div>
            </header>

            <main>
                <div className="space-y-6">
                    {currentQuestion.passage && (
                         <blockquote className="border-l-4 pl-4 italic text-muted-foreground bg-muted p-4 rounded-r-lg">
                            {currentQuestion.passage}
                        </blockquote>
                    )}
                    <p className="font-semibold text-lg">{currentQuestion.question}</p>
                    
                    <RadioGroup 
                        value={selectedAnswer || ''} 
                        onValueChange={(value) => setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }))}
                        disabled={isCurrentAnswered}
                    >
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                <Label key={index} htmlFor={`option-${index}`} className={cn(
                                    "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                                    isCurrentAnswered && option === currentQuestion.correctAnswer && "border-green-500 bg-green-500/10",
                                    isCurrentAnswered && selectedAnswer === option && !isCorrect && "border-red-500 bg-red-500/10",
                                    !isCurrentAnswered && selectedAnswer === option && "border-primary"
                                )}>
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <span>{option}</span>
                                    {isCurrentAnswered && option === currentQuestion.correctAnswer && <CheckCircle className="h-5 w-5 text-green-500 ml-auto"/>}
                                    {isCurrentAnswered && selectedAnswer === option && !isCorrect && <XCircle className="h-5 w-5 text-red-500 ml-auto"/>}
                                </Label>
                            ))}
                        </div>
                    </RadioGroup>

                    {isCurrentAnswered && (
                        <Card className="bg-amber-500/10 border-amber-500/20">
                            <CardHeader><CardTitle className="text-amber-700">Explanation</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            <footer className="mt-8 pt-4 border-t flex justify-between items-center">
                 <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                {isCurrentAnswered ? (
                    <Button onClick={handleNext}>
                         {currentQuestionIndex === questions.length - 1 ? 'Finish Session' : 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={!selectedAnswer}>Submit</Button>
                )}
            </footer>
        </div>
    );
}

export default function StudySessionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StudySessionPageContent />
        </Suspense>
    );
}
