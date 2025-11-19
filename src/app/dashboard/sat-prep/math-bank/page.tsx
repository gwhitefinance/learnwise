'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import questionBank from '@/lib/sat-math-question-bank.json';
import { generateExplanation } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type Question = {
    id: string;
    topic: string;
    subTopic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    question: string;
    options?: string[];
    answer: string;
    type: 'multiple-choice' | 'grid-in';
};

export default function MathBankPage() {
    const router = useRouter();
    // FIX 1: Cast the initial state data to Question[]
    const [questions, setQuestions] = useState<Question[]>(questionBank.questions as Question[]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [explanations, setExplanations] = useState<Record<string, string>>({});
    const [explanationLoading, setExplanationLoading] = useState<Record<string, boolean>>({});
    const [filters, setFilters] = useState({ difficulty: 'all', topic: 'all' });
    const { toast } = useToast();

    useEffect(() => {
        // FIX 2: Cast the data here as well so filtering works correctly
        let filteredQuestions = questionBank.questions as Question[];

        if (filters.difficulty !== 'all') {
            filteredQuestions = filteredQuestions.filter(q => q.difficulty === filters.difficulty);
        }
        if (filters.topic !== 'all') {
            filteredQuestions = filteredQuestions.filter(q => q.topic === filters.topic);
        }

        setQuestions(filteredQuestions);
        setAnswers({});
        setExplanations({});
    }, [filters]);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleGetExplanation = async (question: Question) => {
        const userAnswer = answers[question.id];
        if (!userAnswer) return;

        setExplanationLoading(prev => ({ ...prev, [question.id]: true }));
        try {
            const result = await generateExplanation({
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.answer,
                learnerType: 'Reading/Writing', // Math explanations are generally best this way
                provideFullExplanation: true,
            });
            setExplanations(prev => ({...prev, [question.id]: result.explanation}));
        } catch (error) {
            console.error("Failed to get explanation:", error);
            toast({ variant: 'destructive', title: "Could not load explanation." });
        } finally {
            setExplanationLoading(prev => ({ ...prev, [question.id]: false }));
        }
    };
    
    const difficultyColors: Record<string, string> = {
        'Easy': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'Hard': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    };

    const topics = [...new Set((questionBank.questions as Question[]).map(q => q.topic))];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Button variant="ghost" onClick={() => router.push('/dashboard/sat-prep')}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to SAT Prep Hub
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Math Question Bank</h1>
                <p className="text-muted-foreground">Practice with a curated set of questions at your own pace.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <Select value={filters.difficulty} onValueChange={(v) => setFilters(f => ({...f, difficulty: v}))}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filters.topic} onValueChange={(v) => setFilters(f => ({...f, topic: v}))}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Filter by topic" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Topics</SelectItem>
                        {topics.map(topic => (
                            <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-8">
                {questions.map((q, index) => {
                    const userAnswer = answers[q.id];
                    const isAnswered = userAnswer !== undefined && userAnswer.trim() !== '';
                    const isCorrect = isAnswered && userAnswer.trim() === q.answer;
                    
                    return (
                    <Card key={q.id}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <p className="font-bold">Question {index + 1}</p>
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <Badge className={cn(difficultyColors[q.difficulty])}>{q.difficulty}</Badge>
                                    <Badge variant="secondary">{q.topic}</Badge>
                                </div>
                            </div>
                            <p className="font-semibold mb-4 text-lg">{q.question}</p>
                            
                            {q.type === 'multiple-choice' && q.options ? (
                                <RadioGroup value={userAnswer} onValueChange={(value) => handleAnswerChange(q.id, value)} disabled={isAnswered}>
                                    <div className="space-y-3">
                                        {q.options.map((option, oIndex) => (
                                            <Label key={oIndex} className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                                isAnswered && option === q.answer && "border-green-500 bg-green-500/10",
                                                isAnswered && userAnswer === option && !isCorrect && "border-red-500 bg-red-500/10",
                                                !isAnswered && "cursor-pointer hover:bg-muted"
                                            )}>
                                                <RadioGroupItem value={option} />
                                                <span>{option}</span>
                                                {isAnswered && option === q.answer && <CheckCircle className="h-5 w-5 text-green-500 ml-auto"/>}
                                                {isAnswered && userAnswer === option && !isCorrect && <XCircle className="h-5 w-5 text-red-500 ml-auto"/>}
                                            </Label>
                                        ))}
                                    </div>
                                </RadioGroup>
                            ) : (
                                <Input
                                    placeholder="Enter your answer"
                                    value={userAnswer || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    disabled={isAnswered}
                                    className={cn(
                                        "text-lg",
                                        isAnswered && isCorrect && "border-green-500 bg-green-500/10",
                                        isAnswered && !isCorrect && "border-red-500 bg-red-500/10"
                                    )}
                                />
                            )}
                            
                            {isAnswered && (
                                <div className="mt-4">
                                    {!isCorrect ? (
                                        <>
                                            <div className="p-3 rounded-md bg-green-500/10 text-green-700 text-sm">
                                                <span className="font-semibold">Correct Answer:</span> {q.answer}
                                            </div>
                                            {!explanations[q.id] ? (
                                                <Button size="sm" variant="outline" onClick={() => handleGetExplanation(q)} disabled={explanationLoading[q.id]} className="mt-2">
                                                    {explanationLoading[q.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Lightbulb className="mr-2 h-4 w-4"/>}
                                                    Explain Answer
                                                </Button>
                                            ) : (
                                                <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-sm text-muted-foreground">
                                                    <p className="font-semibold text-amber-700 mb-1">Explanation:</p>
                                                    {explanations[q.id]}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 text-green-700 text-sm">
                                            <CheckCircle className="h-5 w-5"/>
                                            <span className="font-semibold">Correct!</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )})}
            </div>
        </div>
    );
}