

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Lightbulb, TrendingDown, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { generateExplanation } from '@/lib/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type Course = {
    id: string;
    name: string;
    labCompleted?: boolean;
}

type QuizAttempt = {
  id: string;
  userId: string;
  courseId: string;
  topic: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  practiceQuestion?: any;
  practiceAnswer?: string;
  practiceResult?: 'correct' | 'incorrect';
};

const WeakLinkCard = ({ attempt, onRetry, onMarkAsReviewed }: { attempt: QuizAttempt, onRetry: (attemptId: string) => void, onMarkAsReviewed: (attemptId: string) => void }) => {
    const { toast } = useToast();
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCheckAnswer = () => {
        if (!selectedAnswer || !attempt.practiceQuestion) return;
        setIsSubmitting(true);
        const isCorrect = selectedAnswer === attempt.practiceQuestion.answer;
        
        if (isCorrect) {
            toast({ title: "Correct!", description: "Great job! This topic has been marked as reviewed." });
            onMarkAsReviewed(attempt.id);
        } else {
            toast({ variant: 'destructive', title: "Not quite!", description: "Try generating another question to keep practicing." });
        }
        
        // This is a temporary state update for immediate feedback, the parent state will handle the permanent change.
        const tempUpdatedAttempt = {
            ...attempt,
            practiceResult: isCorrect ? 'correct' : 'incorrect',
            practiceAnswer: selectedAnswer
        };
        // To visually show the result before the item is removed from the list
        // This part is tricky without full state management here. A simple approach:
        if (!isCorrect) {
             onRetry(attempt.id); // Re-trigger fetching a new question
        }
        setIsSubmitting(false);
    };

    return (
        <Card className="bg-muted/50">
            <CardHeader>
                <CardTitle className="text-base font-semibold">{attempt.question}</CardTitle>
                <CardDescription>From your quiz on <span className="font-semibold">{attempt.topic}</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 text-red-700 border border-red-500/20">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">You answered: <span className="font-semibold">{attempt.userAnswer}</span></p>
                </div>
                 <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 text-green-700 border border-green-500/20">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">Correct answer: <span className="font-semibold">{attempt.correctAnswer}</span></p>
                </div>

                <Accordion type="single" collapsible>
                    <AccordionItem value="practice">
                        <AccordionTrigger className="text-sm font-semibold">
                            {attempt.practiceQuestion ? 'Practice Question' : 'Try Another Like This'}
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                             {!attempt.practiceQuestion ? (
                                <Button onClick={() => onRetry(attempt.id)} className="w-full">
                                    <RefreshCw className="mr-2 h-4 w-4"/> Generate Practice Question
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <p className="font-semibold text-sm">{attempt.practiceQuestion.question}</p>
                                    <RadioGroup onValueChange={setSelectedAnswer} value={selectedAnswer ?? ''}>
                                        {attempt.practiceQuestion.options.map((opt: string, i: number) => (
                                            <Label key={i} className="flex items-center gap-3 p-2 border rounded-md cursor-pointer hover:bg-background">
                                                <RadioGroupItem value={opt} />
                                                {opt}
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                    <div className="flex justify-between items-center">
                                         <Button variant="ghost" size="sm" onClick={() => onRetry(attempt.id)}>
                                            <RefreshCw className="mr-2 h-4 w-4"/> New Question
                                        </Button>
                                        <Button onClick={handleCheckAnswer} disabled={!selectedAnswer || isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                            Check Answer
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};


function AnalysisPage() {
  const [learnerType, setLearnerType] = useState('Visual');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [weakestCourse, setWeakestCourse] = useState<Course | null>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState<QuizAttempt[]>([]);
  const [generatingQuestionId, setGeneratingQuestionId] = useState<string | null>(null);
  
  const [user, authLoading] = useAuthState(auth);

  useEffect(() => {
    if (authLoading || !user) return;

    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
      setLearnerType(storedLearnerType);
    }
    
    // Fetch courses
    const coursesQuery = query(collection(db, 'courses'), where('userId', '==', user.uid));
    const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
        const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);

        // This logic depends on courses, so it's nested or chained
        const attemptsQuery = query(collection(db, 'quizAttempts'), where('userId', '==', user.uid));
        const unsubscribeAttempts = onSnapshot(attemptsQuery, (snapshot) => {
            const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
            setIncorrectAnswers(attempts);
            
            const stats: Record<string, { incorrect: number }> = {};
            attempts.forEach(attempt => {
                if (attempt.courseId) {
                    if (!stats[attempt.courseId]) {
                        stats[attempt.courseId] = { incorrect: 0 };
                    }
                    stats[attempt.courseId].incorrect++;
                }
            });
            
            let weakestId: string | null = null;
            let maxIncorrect = -1;

            for (const courseId in stats) {
                if (stats[courseId].incorrect > maxIncorrect) {
                    maxIncorrect = stats[courseId].incorrect;
                    weakestId = courseId;
                }
            }
            
            if (weakestId) {
                 const foundCourse = userCourses.find(c => c.id === weakestId);
                 setWeakestCourse(foundCourse ?? {id: weakestId, name: 'A course you\'re struggling with'});
            } else {
                setWeakestCourse(null);
            }
            
            setLoading(false);
        });

        // Return a cleanup function for the attempts listener
        return () => unsubscribeAttempts();
    });

    // Return a cleanup function for the courses listener
    return () => unsubscribeCourses();
  }, [user, authLoading]);
  
  const chartData = useMemo(() => {
      const masteredCount = courses.filter(c => c.labCompleted).length;
      const needsWorkCount = courses.length - masteredCount;

      return [
        { topic: 'Mastered', count: masteredCount, fill: 'hsl(var(--primary))' },
        { topic: 'Needs Work', count: needsWorkCount, fill: 'hsl(var(--muted))' }
      ];
  }, [courses]);
  
    const groupedWeakLinks = useMemo(() => {
        return incorrectAnswers.reduce((acc, attempt) => {
            const courseName = courses.find(c => c.id === attempt.courseId)?.name || 'General Knowledge';
            if (!acc[courseName]) {
                acc[courseName] = [];
            }
            acc[courseName].push(attempt);
            return acc;
        }, {} as Record<string, QuizAttempt[]>);
    }, [incorrectAnswers, courses]);

  const handleGeneratePracticeQuestion = async (attemptId: string) => {
    const attempt = incorrectAnswers.find(a => a.id === attemptId);
    if (!attempt) return;
    
    setGeneratingQuestionId(attemptId);
    try {
        const result = await generateExplanation({
            question: attempt.question,
            userAnswer: attempt.userAnswer,
            correctAnswer: attempt.correctAnswer,
            learnerType: learnerType as any,
            provideFullExplanation: false,
        });
        
        setIncorrectAnswers(prev => prev.map(a => 
            a.id === attemptId ? { ...a, practiceQuestion: result.practiceQuestion, practiceResult: undefined, practiceAnswer: undefined } : a
        ));

    } catch (error) {
        console.error("Failed to generate practice question:", error);
    } finally {
        setGeneratingQuestionId(null);
    }
  };

  const handleMarkAsReviewed = async (attemptId: string) => {
      try {
          await deleteDoc(doc(db, "quizAttempts", attemptId));
          setIncorrectAnswers(prev => prev.filter(a => a.id !== attemptId));
      } catch (error) {
          console.error("Failed to mark as reviewed:", error);
      }
  };

  if (loading || authLoading) {
      return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <Skeleton className="h-8 w-80 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>

            <div>
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
             <div>
                <Skeleton className="h-8 w-96 mb-4" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Analysis Dashboard</h1>
        <p className="text-muted-foreground">Personalized insights and tools to enhance your study sessions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Your Learner Type</CardTitle>
               <Lightbulb className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{learnerType}</div>
               <p className="text-xs text-muted-foreground">AI responses are tailored to this style</p>
            </CardContent>
          </Card>
           <Card className="bg-amber-500/10 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Weakest Course</CardTitle>
               <TrendingDown className="w-4 h-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">{weakestCourse?.name ?? 'None yet!'}</div>
               <p className="text-xs text-muted-foreground">{weakestCourse ? 'Focus here for the biggest gains.' : 'Keep taking quizzes to find out.'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Course Mastery</CardTitle>
            </CardHeader>
             <CardContent className="flex gap-4">
                <ChartContainer config={{}} className="h-24 w-24">
                     <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData} dataKey="count" nameKey="topic" innerRadius={18}>
                            {chartData.map((entry) => (
                                <Cell key={entry.topic} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="flex flex-col justify-center">
                    <p className="text-sm font-medium">{chartData[0].count} Courses Mastered</p>
                    <p className="text-sm text-muted-foreground">{chartData[1].count} Courses Need Work</p>
                </div>
            </CardContent>
          </Card>
      </div>

       <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Review Your Weak Links</h2>
        {incorrectAnswers.length > 0 ? (
           <Accordion type="multiple" defaultValue={Object.keys(groupedWeakLinks)} className="w-full space-y-4">
                {Object.entries(groupedWeakLinks).map(([courseName, attempts]) => (
                    <AccordionItem key={courseName} value={courseName} className="border bg-card rounded-lg">
                        <AccordionTrigger className="p-4 font-semibold text-lg hover:no-underline">
                           {courseName} ({attempts.length} weak links)
                        </AccordionTrigger>
                        <AccordionContent className="p-4 border-t">
                             <div className="grid gap-6 md:grid-cols-2">
                                {attempts.map(attempt => (
                                    <WeakLinkCard 
                                        key={attempt.id} 
                                        attempt={attempt}
                                        onRetry={handleGeneratePracticeQuestion}
                                        onMarkAsReviewed={handleMarkAsReviewed}
                                    />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        ) : (
            <Card className="text-center p-8">
                <CardContent>
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="font-semibold">No incorrect answers found!</p>
                    <p className="text-sm text-muted-foreground">Keep up the great work. Take more quizzes to identify areas for improvement.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

export default AnalysisPage;
