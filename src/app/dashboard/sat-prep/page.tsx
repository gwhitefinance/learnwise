
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calculator, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { SatQuestion } from '@/ai/schemas/sat-question-schema';
import { generateSatQuestion } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

const readingWritingTopics = [
    { title: "Information and Ideas", description: "Comprehend, analyze, and synthesize information from texts and graphics." },
    { title: "Craft and Structure", description: "Understand how authors use structure and language to achieve their purpose." },
    { title: "Expression of Ideas", description: "Revise texts to improve effectiveness and meet rhetorical goals." },
    { title: "Standard English Conventions", description: "Edit texts to conform to grammar, usage, and punctuation standards." },
];

const mathTopics = [
    { title: "Algebra", description: "Solve linear equations and systems in one and two variables." },
    { title: "Advanced Math", description: "Work with quadratic, exponential, and other nonlinear equations." },
    { title: "Problem-Solving & Data Analysis", description: "Apply quantitative reasoning using ratios, percentages, and rates." },
    { title: "Geometry and Trigonometry", description: "Solve problems involving area, volume, triangles, and trigonometry." },
];


export default function SatPrepPage() {
    const [gradeLevel, setGradeLevel] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    
    const [question, setQuestion] = useState<SatQuestion | null>(null);
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    
    const fetchQuestion = async () => {
        setIsLoadingQuestion(true);
        setSelectedAnswer(null);
        setIsAnswered(false);
        try {
            const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
            const today = new Date().toDateString(); // Use date as a seed for daily consistency
            const result = await generateSatQuestion({ seed: today, learnerType });
            setQuestion(result);
        } catch (error) {
            console.error("Failed to fetch daily SAT question:", error);
            toast({ variant: 'destructive', title: 'Could not load question.' });
        } finally {
            setIsLoadingQuestion(false);
        }
    };
    
    useEffect(() => {
        const storedGrade = localStorage.getItem('onboardingGradeLevel');
        setGradeLevel(storedGrade);
        setLoading(false);
        fetchQuestion();
    }, []);

    const handleSubmit = () => {
        if (!selectedAnswer) {
            toast({ variant: 'destructive', title: 'Please select an answer.'});
            return;
        }
        setIsAnswered(true);
    };

    if (loading) {
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

    const isCorrect = selectedAnswer === question?.correctAnswer;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SAT Prep Hub</h1>
                <p className="text-muted-foreground">Your centralized dashboard for Digital SAT resources and practice.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Question of the Day</CardTitle>
                            <CardDescription>A new question every day to build your skills.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={fetchQuestion} disabled={isLoadingQuestion}>
                            <RefreshCw className={cn("h-4 w-4", isLoadingQuestion && "animate-spin")} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingQuestion ? (
                         <div className="space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <div className="space-y-2 pt-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    ) : question ? (
                        <div>
                            <div className="prose dark:prose-invert max-w-none">
                                {question.passage && <p className="text-muted-foreground border-l-4 pl-4 italic">{question.passage}</p>}
                                <p className="text-lg font-semibold">{question.question}</p>
                            </div>

                            <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer} disabled={isAnswered}>
                                <div className="space-y-2 mt-4">
                                {question.options.map((option, index) => {
                                    const isCorrectOption = option === question.correctAnswer;
                                    const isSelected = option === selectedAnswer;
                                    
                                    return (
                                        <Label 
                                            key={index}
                                            className={cn(
                                                "flex items-start gap-4 p-4 rounded-lg border transition-all",
                                                isAnswered && isCorrectOption && "bg-green-500/10 border-green-500",
                                                isAnswered && isSelected && !isCorrectOption && "bg-red-500/10 border-red-500",
                                                !isAnswered && "cursor-pointer hover:bg-muted"
                                            )}
                                        >
                                            <RadioGroupItem value={option} id={`option-${index}`} className="mt-1" />
                                            <span className="flex-1">{option}</span>
                                        </Label>
                                    )
                                })}
                                </div>
                            </RadioGroup>

                            {!isAnswered ? (
                                <Button onClick={handleSubmit} className="mt-6" disabled={!selectedAnswer}>Submit</Button>
                            ) : (
                                <div className="mt-6 p-4 rounded-lg bg-muted border">
                                    <h4 className="font-bold text-lg mb-2">{isCorrect ? "Correct!" : "Not Quite..."}</h4>
                                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Could not load today's question. Please try again.</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen/> Reading and Writing</CardTitle>
                        <CardDescription>This section tests your comprehension, analysis, and editing skills.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {readingWritingTopics.map(topic => (
                             <div key={topic.title} className="p-3 rounded-lg bg-muted/50">
                                <h4 className="font-semibold text-sm">{topic.title}</h4>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calculator/> Math</CardTitle>
                        <CardDescription>This section tests your skills in algebra, advanced math, and geometry.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {mathTopics.map(topic => (
                             <div key={topic.title} className="p-3 rounded-lg bg-muted/50">
                                <h4 className="font-semibold text-sm">{topic.title}</h4>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
