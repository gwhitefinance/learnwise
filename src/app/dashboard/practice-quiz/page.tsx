
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz } from '@/ai/flows/quiz-flow';
import type { GenerateQuizInput, GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const suggestedTopics = ["Mathematics", "Science", "History", "Literature", "Computer Science"];

type QuizState = 'configuring' | 'in-progress' | 'results';
type Answer = { question: string; answer: string; correctAnswer: string; isCorrect: boolean };

export default function PracticeQuizPage() {
    const [topics, setTopics] = useState('');
    const [questionType, setQuestionType] = useState('Multiple Choice');
    const [difficulty, setDifficulty] = useState('Medium');
    const [numQuestions, setNumQuestions] = useState('10');
    
    const [isLoading, setIsLoading] = useState(false);
    const [quizState, setQuizState] = useState<QuizState>('configuring');
    const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    
    const { toast } = useToast();

    useEffect(() => {
        const savedState = sessionStorage.getItem('quizState');
        const savedQuiz = sessionStorage.getItem('quizData');
        const savedAnswers = sessionStorage.getItem('quizAnswers');
        const savedIndex = sessionStorage.getItem('quizCurrentIndex');

        if (savedState && savedQuiz && savedAnswers && savedIndex) {
            setQuizState(JSON.parse(savedState));
            setQuiz(JSON.parse(savedQuiz));
            setAnswers(JSON.parse(savedAnswers));
            setCurrentQuestionIndex(parseInt(savedIndex, 10));
        }
    }, []);

    useEffect(() => {
        if (quizState !== 'configuring') {
            sessionStorage.setItem('quizState', JSON.stringify(quizState));
            sessionStorage.setItem('quizData', JSON.stringify(quiz));
            sessionStorage.setItem('quizAnswers', JSON.stringify(answers));
            sessionStorage.setItem('quizCurrentIndex', currentQuestionIndex.toString());
        }
    }, [quizState, quiz, answers, currentQuestionIndex]);

    const handleGenerateQuiz = async () => {
        if (!topics.trim()) {
            toast({
                variant: 'destructive',
                title: 'Topics are required',
                description: 'Please enter some topics or keywords for your quiz.',
            });
            return;
        }

        setIsLoading(true);
        try {
            const input: GenerateQuizInput = {
                topics,
                questionType: questionType as 'Multiple Choice' | 'True/False' | 'Short Answer',
                difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
                numQuestions: parseInt(numQuestions),
            };
            const generatedQuiz = await generateQuiz(input);
            setQuiz(generatedQuiz);
            setQuizState('in-progress');
             toast({
                title: 'Quiz Generated!',
                description: 'Your quiz is ready.',
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to generate quiz. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextQuestion = () => {
        if (!quiz || selectedAnswer === null) return;
        
        const currentQuestion = quiz.questions[currentQuestionIndex];
        const isCorrect = selectedAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();

        const newAnswer: Answer = {
            question: currentQuestion.question,
            answer: selectedAnswer,
            correctAnswer: currentQuestion.answer,
            isCorrect: isCorrect
        };
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);

        setSelectedAnswer(null);

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setQuizState('results');
        }
    };
    
    const handleStartNewQuiz = () => {
        setQuizState('configuring');
        setQuiz(null);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setTopics('');
        sessionStorage.removeItem('quizState');
        sessionStorage.removeItem('quizData');
        sessionStorage.removeItem('quizAnswers');
        sessionStorage.removeItem('quizCurrentIndex');
    }

    const score = answers.filter(a => a.isCorrect).length;
    const totalQuestions = quiz?.questions.length ?? 0;

    if (quizState === 'in-progress' && quiz) {
        const currentQuestion = quiz.questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

        return (
             <div className="flex flex-col items-center">
                <div className="text-center mb-10 w-full max-w-3xl">
                    <p className="text-muted-foreground mb-2">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                    <Progress value={progress} className="mb-4 h-2"/>
                    <h1 className="text-3xl font-bold mt-8">{currentQuestion.question}</h1>
                </div>

                <Card className="w-full max-w-3xl">
                    <CardContent className="p-8">
                         <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer}>
                            <div className="space-y-4">
                            {currentQuestion.options?.map((option, index) => (
                                <Label key={index} htmlFor={`option-${index}`} className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                                    selectedAnswer === option ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                                )}>
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <span>{option}</span>
                                </Label>
                            ))}
                            </div>
                        </RadioGroup>
                         <div className="mt-8 flex justify-end">
                            <Button onClick={handleNextQuestion} disabled={!selectedAnswer}>
                               {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Finish Quiz'}
                               <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (quizState === 'results') {
        return (
            <div className="flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold">Quiz Results</h1>
                    <p className="text-muted-foreground mt-2">Here's how you did!</p>
                </div>
                 <Card className="w-full max-w-3xl">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-semibold">Your Score</h2>
                        <p className="text-6xl font-bold text-primary my-4">{score} / {totalQuestions}</p>
                        <p className="text-muted-foreground">You answered {((score / totalQuestions) * 100).toFixed(0)}% of the questions correctly.</p>

                        <div className="mt-8">
                            <Button onClick={handleStartNewQuiz}>
                                <RotateCcw className="mr-2 h-4 w-4" /> Take a New Quiz
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    return (
        <div className="flex flex-col items-center">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold">Practice Quiz</h1>
                <p className="text-muted-foreground mt-2">Generate a customized quiz to test your knowledge.</p>
            </div>

            <Card className="w-full max-w-3xl">
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <Label htmlFor="topics" className="text-sm font-medium">Enter Topics or Keywords</Label>
                            <Input 
                                id="topics" 
                                placeholder="e.g., Photosynthesis, World War II" 
                                className="mt-2"
                                value={topics}
                                onChange={(e) => setTopics(e.target.value)}
                            />
                        </div>
                        <div>
                             <Label className="text-sm font-medium">Or Select a Suggested Area</Label>
                             <div className="flex flex-wrap gap-2 mt-2">
                                {suggestedTopics.map(topic => (
                                    <Button key={topic} variant="outline" size="sm" onClick={() => setTopics(prev => prev ? `${prev}, ${topic}` : topic)}>
                                        {topic}
                                    </Button>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quiz Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label htmlFor="question-type">Question Type</Label>
                                <Select value={questionType} onValueChange={setQuestionType}>
                                    <SelectTrigger id="question-type" className="mt-2">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                        <SelectItem value="True/False">True/False</SelectItem>
                                        <SelectItem value="Short Answer">Short Answer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="difficulty">Difficulty Level</Label>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger id="difficulty" className="mt-2">
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="num-questions">Number of Questions</Label>
                                <Select value={numQuestions} onValueChange={setNumQuestions}>
                                    <SelectTrigger id="num-questions" className="mt-2">
                                        <SelectValue placeholder="Select number" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <Button onClick={handleGenerateQuiz} disabled={isLoading}>
                            {isLoading ? 'Generating...' : 'Generate Quiz'}
                            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
