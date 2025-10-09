
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, ArrowLeft, ArrowRight, BookOpen, Calculator, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import practiceTestData from '@/lib/sat-practice-test.json';

type Question = {
    id: string;
    passage?: string;
    question: string;
    options: string[];
    answer: string;
};

type TestSection = {
    title: string;
    timeLimit: number;
    modules: {
        id: number;
        questions: Question[];
    }[];
};

type TestData = {
    reading_writing: TestSection;
    math: TestSection;
};

export default function PracticeTestPage() {
    const [testData, setTestData] = useState<TestData | null>(null);
    const [currentSectionKey, setCurrentSectionKey] = useState<'reading_writing' | 'math'>('reading_writing');
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [testState, setTestState] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');

    useEffect(() => {
        setTestData(practiceTestData as TestData);
    }, []);

    if (testState === 'not-started') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Card className="max-w-2xl w-full text-center p-8">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
                            <FileText className="h-10 w-10" />
                        </div>
                        <CardTitle className="text-3xl mt-4">Full-Length Digital SAT Practice Test</CardTitle>
                        <CardDescription className="mt-2 text-lg">
                            This is a full-length practice test that mirrors the format of the official digital SAT.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-left space-y-2 text-muted-foreground mb-8">
                            <li className="flex items-center gap-2"><strong>Reading and Writing:</strong> 64 minutes, {practiceTestData.reading_writing.modules.reduce((acc, m) => acc + m.questions.length, 0)} questions</li>
                            <li className="flex items-center gap-2"><strong>Math:</strong> 70 minutes, {practiceTestData.math.modules.reduce((acc, m) => acc + m.questions.length, 0)} questions</li>
                            <li className="flex items-center gap-2"><strong>Total Time:</strong> Approximately 2 hours 14 minutes</li>
                        </ul>
                        <Button size="lg" className="w-full max-w-xs" onClick={() => setTestState('in-progress')}>
                           Start Test
                        </Button>
                         <div className="mt-4">
                            <Button variant="link" asChild>
                                <Link href="/dashboard/sat-prep">Back to SAT Prep Hub</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!testData) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const currentSection = testData[currentSectionKey];
    const currentModule = currentSection.modules[currentModuleIndex];
    const currentQuestion = currentModule.questions[currentQuestionIndex];
    const totalQuestionsInSection = currentSection.modules.reduce((acc, mod) => acc + mod.questions.length, 0);
    const questionsAnsweredInSection = Object.keys(userAnswers).filter(qid => currentSection.modules.flatMap(m => m.questions).some(q => q.id === qid)).length;
    const progress = (questionsAnsweredInSection / totalQuestionsInSection) * 100;

    const handleNextQuestion = () => {
        if (currentQuestionIndex < currentModule.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleAnswerChange = (questionId: string, answer: string) => {
        setUserAnswers(prev => ({...prev, [questionId]: answer}));
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <header className="mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{currentSection.title}</h1>
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground">Time: --:--</p>
                        <Button variant="outline">End Section</Button>
                    </div>
                </div>
                 <div className="mt-4">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{questionsAnsweredInSection} / {totalQuestionsInSection} Questions Answered</p>
                </div>
            </header>

            <main>
                <div className={cn("grid gap-8", currentQuestion.passage ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                    {currentQuestion.passage && (
                         <div className="prose dark:prose-invert max-w-none bg-muted p-6 rounded-lg">
                            <p>{currentQuestion.passage}</p>
                        </div>
                    )}
                    <div className={cn(!currentQuestion.passage && "max-w-2xl mx-auto w-full")}>
                        <p className="font-semibold mb-4 text-lg">{currentQuestion.question}</p>
                        <RadioGroup 
                            value={userAnswers[currentQuestion.id] || ''} 
                            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                        >
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => (
                                    <Label key={index} htmlFor={`option-${index}`} className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted cursor-pointer transition-colors">
                                        <RadioGroupItem value={option} id={`option-${index}`} className="mt-1"/>
                                        <span>{option}</span>
                                    </Label>
                                ))}
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </main>

            <footer className="mt-8 pt-4 border-t flex justify-between items-center">
                 <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {currentModule.questions.length}</p>
                <Button variant="default" onClick={handleNextQuestion} disabled={currentQuestionIndex === currentModule.questions.length - 1}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </footer>
        </div>
    );
}
