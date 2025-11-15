
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import questionBank from '@/lib/sat-rw-question-bank.json';
import { generateExplanation } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type Question = {
    id: string;
    topic: string;
    subTopic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    passage?: string;
    question: string;
    options: string[];
    answer: string;
};

export default function ReadingWritingBankPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>(questionBank.questions);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [explanations, setExplanations] = useState<Record<string, string>>({});
    const [explanationLoading, setExplanationLoading] = useState<Record<string, boolean>>({});
    const [filters, setFilters] = useState({ difficulty: 'all', topic: 'all' });
    const { toast } = useToast();

    useEffect(() => {
        let filteredQuestions = questionBank.questions;

        if (filters.difficulty !== 'all') {
            filteredQuestions = filteredQuestions.filter(q => q.difficulty === filters.difficulty);
        }
        if (filters.topic !== 'all') {
            filteredQuestions = filteredQuestions.filter(q => q.topic === filters.topic);
        }

        setQuestions(filteredQuestions);
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
                learnerType: 'Reading/Writing',
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

    const topics = [...new Set(questionBank.questions.map(q => q.topic))];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Button variant="ghost" onClick={() => router.push('/dashboard/sat-prep')}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to SAT Prep Hub
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reading & Writing Question Bank</h1>
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
                    const isAnswered = userAnswer !== undefined;
                    const isCorrect = isAnswered && userAnswer === q.answer;
                    
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
                            {q.passage && (
                                <blockquote className="border-l-4 pl-4 italic text-muted-foreground bg-muted p-4 rounded-r-md mb-4">
                                    {q.passage}
                                </blockquote>
                            )}
                            <p className="font-semibold mb-4">{q.question}</p>
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
                            {isAnswered && !isCorrect && (
                                <div className="mt-4">
                                    {!explanations[q.id] ? (
                                        <Button size="sm" variant="outline" onClick={() => handleGetExplanation(q)} disabled={explanationLoading[q.id]}>
                                            {explanationLoading[q.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Lightbulb className="mr-2 h-4 w-4"/>}
                                            Explain Answer
                                        </Button>
                                    ) : (
                                        <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-sm text-muted-foreground">
                                            <p className="font-semibold text-amber-700 mb-1">Explanation:</p>
                                            {explanations[q.id]}
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
