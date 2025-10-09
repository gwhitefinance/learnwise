

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, ArrowLeft, ArrowRight, BookOpen, Calculator, Loader2, Clock, SkipForward, Trophy, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import practiceTestData from '@/lib/sat-practice-test.json';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';


type Question = {
    id: string;
    passage?: string;
    question: string;
    options?: string[];
    answer: string;
    type: 'multiple-choice' | 'grid-in';
};

type TestSectionModule = {
    id: number;
    difficulty: "medium" | "easy-medium" | "medium-hard";
    questions: Question[];
};

type TestSection = {
    title: string;
    timeLimit: number;
    modules: TestSectionModule[];
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

const CalculatorComponent = () => {
    const [display, setDisplay] = useState('0');
    const [currentValue, setCurrentValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const handleDigitClick = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const handleOperatorClick = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (currentValue === null) {
            setCurrentValue(inputValue);
        } else if (operator) {
            const result = performCalculation();
            setCurrentValue(result);
            setDisplay(String(result));
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };
    
    const performCalculation = (): number => {
        const inputValue = parseFloat(display);
        if (currentValue === null || operator === null) return inputValue;

        switch (operator) {
            case '+': return currentValue + inputValue;
            case '-': return currentValue - inputValue;
            case '*': return currentValue * inputValue;
            case '/': return currentValue / inputValue;
            default: return inputValue;
        }
    };

    const handleEqualsClick = () => {
        if (operator === null || currentValue === null) return;
        const result = performCalculation();
        setDisplay(String(result));
        setCurrentValue(null);
        setOperator(null);
        setWaitingForOperand(false);
    };
    
    const handleClear = () => {
        setDisplay('0');
        setCurrentValue(null);
        setOperator(null);
        setWaitingForOperand(false);
    };

    const handleDecimalClick = () => {
        if (waitingForOperand) {
             setDisplay('0.');
             setWaitingForOperand(false);
             return;
        }
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const buttonClasses = "h-16 text-xl bg-muted hover:bg-muted/80 text-black";

    return (
        <div className="p-4 space-y-2 bg-background rounded-lg">
            <div className="bg-muted text-right p-4 rounded-lg text-4xl font-mono break-all">{display}</div>
            <div className="grid grid-cols-4 gap-2">
                <Button onClick={handleClear} className={cn(buttonClasses, "col-span-2 bg-destructive/80 hover:bg-destructive text-white")}>AC</Button>
                <Button onClick={() => setDisplay(String(parseFloat(display) * -1))} className={buttonClasses}>+/-</Button>
                <Button onClick={() => handleOperatorClick('/')} className={cn(buttonClasses, "bg-primary/80 hover:bg-primary text-white")}>÷</Button>
                
                {['7','8','9'].map(d => <Button key={d} onClick={() => handleDigitClick(d)} className={buttonClasses}>{d}</Button>)}
                <Button onClick={() => handleOperatorClick('*')} className={cn(buttonClasses, "bg-primary/80 hover:bg-primary text-white")}>×</Button>

                {['4','5','6'].map(d => <Button key={d} onClick={() => handleDigitClick(d)} className={buttonClasses}>{d}</Button>)}
                <Button onClick={() => handleOperatorClick('-')} className={cn(buttonClasses, "bg-primary/80 hover:bg-primary text-white")}>−</Button>

                {['1','2','3'].map(d => <Button key={d} onClick={() => handleDigitClick(d)} className={buttonClasses}>{d}</Button>)}
                <Button onClick={() => handleOperatorClick('+')} className={cn(buttonClasses, "bg-primary/80 hover:bg-primary text-white")}>+</Button>

                <Button onClick={() => handleDigitClick('0')} className={cn(buttonClasses, "col-span-2")}>0</Button>
                <Button onClick={handleDecimalClick} className={buttonClasses}>.</Button>
                <Button onClick={handleEqualsClick} className={cn(buttonClasses, "bg-primary/80 hover:bg-primary text-white")}>=</Button>
            </div>
        </div>
    )
}

export default function PracticeTestPage() {
    const [user] = useAuthState(auth);
    const [testData, setTestData] = useState<TestData | null>(null);
    const [currentSectionKey, setCurrentSectionKey] = useState<'reading_writing' | 'math'>('reading_writing');
    const [currentModuleId, setCurrentModuleId] = useState(1);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [testState, setTestState] = useState<'not-started' | 'in-progress' | 'break' | 'completed'>('not-started');
    const [breakTimeRemaining, setBreakTimeRemaining] = useState(10 * 60);
    const [finalScore, setFinalScore] = useState<Score | null>(null);
    const [isReviewing, setIsReviewing] = useState(false);

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

    const calculateScore = async () => {
        if (!testData || !user) return;

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
        
        const scoreData = {
            readingWriting: readingWritingScore,
            math: mathScore,
            total: totalScore,
        };

        setFinalScore(scoreData);
        setTestState('completed');

        // Save to Firestore
        try {
            await addDoc(collection(db, 'satTestResults'), {
                userId: user.uid,
                ...scoreData,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving test results:", error);
        }
    };

    const handleContinueFromBreak = () => {
        setCurrentQuestionIndex(0);
        setCurrentSectionKey('math');
        setCurrentModuleId(1);
        setTestState('in-progress');
    };

    const handleNext = () => {
        if (!testData) return;
        const currentModule = testData[currentSectionKey].modules.find(m => m.id === currentModuleId);
        if (!currentModule) return;

        if (currentQuestionIndex < currentModule.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of a module
            if (currentSectionKey === 'reading_writing' && currentModuleId === 1) {
                // Adaptive logic for Reading & Writing
                const module1Questions = currentModule.questions;
                const correctCount = module1Questions.filter(q => userAnswers[q.id] === q.answer).length;
                const nextDifficulty = correctCount > module1Questions.length / 2 ? "medium-hard" : "easy-medium";
                const nextModule = testData.reading_writing.modules.find(m => m.difficulty === nextDifficulty);
                setCurrentModuleId(nextModule ? nextModule.id : 2); // Fallback to id 2 if not found
                setCurrentQuestionIndex(0);
            } else if (currentSectionKey === 'reading_writing') {
                setBreakTimeRemaining(10 * 60);
                setTestState('break');
            } else if (currentSectionKey === 'math' && currentModuleId === 1) {
                 // Adaptive logic for Math
                const module1Questions = currentModule.questions;
                const correctCount = module1Questions.filter(q => userAnswers[q.id] === q.answer).length;
                const nextDifficulty = correctCount > module1Questions.length / 2 ? "medium-hard" : "easy-medium";
                const nextModule = testData.math.modules.find(m => m.difficulty === nextDifficulty);
                setCurrentModuleId(nextModule ? nextModule.id : 2); // Fallback
                setCurrentQuestionIndex(0);
            } else {
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
        
        if (isReviewing) {
            const allQuestions = testData ? [...testData.reading_writing.modules.flatMap(m => m.questions), ...testData.math.modules.flatMap(m => m.questions)] : [];
            const incorrectAnswers = allQuestions.filter(q => userAnswers[q.id] && userAnswers[q.id] !== q.answer);

            return (
                <div className="max-w-4xl mx-auto p-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold">Review Incorrect Answers</h1>
                        <p className="text-muted-foreground">You got {incorrectAnswers.length} questions wrong.</p>
                    </div>
                     <Accordion type="single" collapsible className="w-full space-y-4">
                        {incorrectAnswers.map((question, index) => (
                            <AccordionItem value={`item-${index}`} key={question.id} className="border bg-card rounded-lg">
                                <AccordionTrigger className="p-4 text-left hover:no-underline">
                                    <span className="font-semibold flex-1">Question {index + 1}: {question.question.substring(0, 50)}...</span>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 pt-0 border-t">
                                    <div className="prose dark:prose-invert max-w-none mb-4">
                                        {question.passage && <p className="text-muted-foreground border-l-4 pl-4 italic">{question.passage}</p>}
                                        <p className="font-bold">{question.question}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 p-3 rounded-md bg-red-500/10 text-red-700">
                                            <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <div><span className="font-semibold">Your Answer:</span> {userAnswers[question.id] || "No answer"}</div>
                                        </div>
                                         <div className="flex items-start gap-2 p-3 rounded-md bg-green-500/10 text-green-700">
                                            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <div><span className="font-semibold">Correct Answer:</span> {question.answer}</div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                     <div className="mt-8 text-center">
                        <Button onClick={() => setIsReviewing(false)}>Back to Score</Button>
                    </div>
                </div>
            )
        }
        
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
                        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" variant="outline" onClick={() => setIsReviewing(true)}>Review Your Answers</Button>
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
                            <li className="flex items-center gap-2"><strong>Reading and Writing:</strong> {practiceTestData.reading_writing.timeLimit} minutes, {practiceTestData.reading_writing.modules.reduce((acc, m) => acc + m.questions.length, 0)} questions</li>
                            <li className="flex items-center gap-2"><strong>Math:</strong> {practiceTestData.math.timeLimit} minutes, {practiceTestData.math.modules.reduce((acc, m) => acc + m.questions.length, 0)} questions</li>
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
                            You've completed the Reading & Writing section. Take a 10-minute break.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-6xl font-bold my-6">
                            {Math.floor(breakTimeRemaining / 60)}:{(breakTimeRemaining % 60).toString().padStart(2, '0')}
                        </div>
                        <Button size="lg" onClick={handleContinueFromBreak}>
                            Skip & Continue to Math <SkipForward className="ml-2 h-5 w-5"/>
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
    const currentModule = currentSection.modules.find(m => m.id === currentModuleId);

    if (!currentModule) {
        return (
             <div className="flex justify-center items-center h-full">
                 <p>Error: Could not find the current test module. The test may be misconfigured.</p>
                 <Button onClick={() => setTestState('not-started')} className="mt-4">Restart</Button>
             </div>
        );
     }
 
    const currentQuestion = currentModule.questions[currentQuestionIndex];
    
    if (!currentQuestion) {
       return (
            <div className="flex justify-center items-center h-full">
                <p>Error loading question data. Please try again.</p>
                <Button onClick={() => setTestState('not-started')} className="mt-4">Restart</Button>
            </div>
       );
    }

    const totalQuestionsInSection = currentSection.modules.reduce((acc, mod) => acc + mod.questions.length, 0);
    const questionsAnsweredInSection = Object.keys(userAnswers).filter(qid => currentSection.modules.flatMap(m => m.questions).some(q => q.id === qid)).length;
    const progress = (questionsAnsweredInSection / totalQuestionsInSection) * 100;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <header className="mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {currentSectionKey === 'reading_writing' ? <BookOpen /> : <Calculator />}
                        {currentSection.title} - Module {currentModule.id}
                    </h1>
                    <div className="flex items-center gap-4">
                        {currentSectionKey === 'math' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon"><Calculator/></Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Calculator</DialogTitle></DialogHeader>
                                    <CalculatorComponent/>
                                </DialogContent>
                            </Dialog>
                        )}
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
                    <div className={cn("flex flex-col justify-center", !currentQuestion.passage && "max-w-2xl mx-auto w-full")}>
                        <p className="font-semibold mb-4 text-lg">{currentQuestionIndex + 1}. {currentQuestion.question}</p>
                        
                        {currentQuestion.type === 'multiple-choice' ? (
                            <RadioGroup 
                                value={userAnswers[currentQuestion.id] || ''} 
                                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                            >
                                <div className="space-y-3">
                                    {currentQuestion.options?.map((option, index) => (
                                        <Label key={index} htmlFor={`option-${index}`} className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted cursor-pointer transition-colors">
                                            <RadioGroupItem value={option} id={`option-${index}`} className="mt-1"/>
                                            <span>{option}</span>
                                        </Label>
                                    ))}
                                </div>
                            </RadioGroup>
                        ) : (
                            <Input
                                placeholder="Enter your answer"
                                value={userAnswers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                className="text-lg p-4"
                            />
                        )}
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
