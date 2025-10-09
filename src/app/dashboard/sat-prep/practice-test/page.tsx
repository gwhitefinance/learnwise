
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, ArrowLeft, ArrowRight, BookOpen, Calculator, Loader2, Clock, SkipForward, Trophy } from 'lucide-react';
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

type Score = {
    readingWriting: number;
    math: number;
    total: number;
};

export default function PracticeTestPage() {
    const [testData, setTestData] = useState<TestData | null>(null);
    const [currentSectionKey, setCurrentSectionKey] = useState<'reading_writing' | 'math'>('reading_writing');
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [testState, setTestState] = useState<'not-started' | 'in-progress' | 'break' | 'completed'>('not-started');
    const [breakTimeRemaining, setBreakTimeRemaining] = useState(10 * 60);
    const [finalScore, setFinalScore] = useState<Score | null>(null);

    useEffect(() => {
        setTestData(practiceTestData as TestData);
    }, []);
    
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (testState === 'break' && breakTimeRemaining > 0) {
            timer = setTimeout(() => setBreakTimeRemaining(t => t - 1), 1000);
        } else if (testState === 'break' && breakTimeRemaining === 0) {
            handleContinueFromBreak();
        }
        return () => clearTimeout(timer);
    }, [testState, breakTimeRemaining]);

    const calculateScore = () => {
        if (!testData) return;

        const calculateSectionScore = (sectionKey: 'reading_writing' | 'math') => {
            const section = testData[sectionKey];
            const correctAnswers = section.modules.flatMap(m => m.questions).filter(q => userAnswers[q.id] === q.answer).length;
            const totalQuestions = section.modules.flatMap(m => m.questions).length;
            
            // Simple linear scaling from raw score to 200-800 range
            const scaledScore = 200 + Math.round((correctAnswers / totalQuestions) * 600);
            return Math.round(scaledScore / 10) * 10; // Round to nearest 10
        };

        const readingWritingScore = calculateSectionScore('reading_writing');
        const mathScore = calculateSectionScore('math');
        const totalScore = readingWritingScore + mathScore;

        setFinalScore({
            readingWriting: readingWritingScore,
            math: mathScore,
            total: totalScore,
        });
        setTestState('completed');
    };

    const handleContinueFromBreak = () => {
        if (currentSectionKey === 'reading_writing' && currentModuleIndex === 0) {
            setCurrentModuleIndex(1);
            setTestState('in-progress');
            setBreakTimeRemaining(10 * 60); // Reset for next break if any
        } else if (currentSectionKey === 'reading_writing' && currentModuleIndex === 1) {
            setCurrentSectionKey('math');
            setCurrentModuleIndex(0);
            setTestState('in-progress');
            setBreakTimeRemaining(25 * 60); 
        } else if (currentSectionKey === 'math' && currentModuleIndex === 0) {
            setCurrentModuleIndex(1);
            setTestState('in-progress');
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < currentModule.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            if (currentSectionKey === 'reading_writing' && currentModuleIndex === 0) {
                setBreakTimeRemaining(10 * 60);
                setTestState('break');
            } else if (currentSectionKey === 'reading_writing' && currentModuleIndex === 1) {
                setBreakTimeRemaining(25 * 60);
                setTestState('break');
            } else if (currentSectionKey === 'math' && currentModuleIndex === 0) {
                 // After Math Module 1, go straight to Module 2 (as per official SAT)
                 handleContinueFromBreak();
            } else {
                // Finished the whole test
                calculateScore();
            }
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
    
     if (testState === 'completed' && finalScore) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Card className="max-w-2xl w-full text-center p-8">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
                            <Trophy className="h-10 w-10" />
                        </div>
                        <CardTitle className="text-4xl mt-4">Test Complete!</CardTitle>
                        <CardDescription className="mt-2 text-lg">
                            Here's how you did on your practice SAT.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-7xl font-bold my-6 text-primary">{finalScore.total}</div>
                        <div className="flex justify-around items-center text-lg mt-8">
                             <div className="text-center">
                                <p className="text-muted-foreground">Reading & Writing</p>
                                <p className="font-bold text-2xl">{finalScore.readingWriting}</p>
                            </div>
                             <div className="text-center">
                                <p className="text-muted-foreground">Math</p>
                                <p className="font-bold text-2xl">{finalScore.math}</p>
                            </div>
                        </div>
                        <div className="mt-12">
                            <Button size="lg" asChild>
                                <Link href="/dashboard/sat-prep">Back to SAT Prep Hub</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

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
    
     if (testState === 'break') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Card className="max-w-lg w-full text-center p-8">
                    <CardHeader>
                         <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
                            <Clock className="h-10 w-10" />
                        </div>
                        <CardTitle className="text-3xl mt-4">Break Time!</CardTitle>
                        <CardDescription className="mt-2 text-lg">
                            You've completed a section. Take a short break.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-6xl font-bold my-6">
                            {Math.floor(breakTimeRemaining / 60)}:{(breakTimeRemaining % 60).toString().padStart(2, '0')}
                        </div>
                        <Button size="lg" onClick={handleContinueFromBreak}>
                            Skip & Continue <SkipForward className="ml-2 h-5 w-5"/>
                        </Button>
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

    return (
        <div className="max-w-4xl mx-auto p-4">
            <header className="mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {currentSectionKey === 'reading_writing' ? <BookOpen /> : <Calculator />}
                        {currentSection.title}
                    </h1>
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
                         <div className="prose dark:prose-invert max-w-none bg-muted p-6 rounded-lg h-fit">
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
                <Button variant="default" onClick={handleNext}>
                    {currentQuestionIndex === currentModule.questions.length - 1 ? 'Finish Module' : 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </footer>
        </div>
    );
}
