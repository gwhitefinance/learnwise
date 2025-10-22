
'use client';

import { useState, useEffect, Suspense, useContext } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { generateMiniCourse } from '@/lib/actions';
import type { SatQuestion, AnswerFeedback as FeedbackAnswer, FeedbackInput } from '@/ai/schemas/sat-study-session-schema';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, XCircle, FileText, BookOpen, Calculator, Send, Bot, Wand2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AIBuddy from '@/components/ai-buddy';
import { Input } from '@/components/ui/input';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import type { Message } from '@/components/floating-chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FloatingChatContext } from '@/components/floating-chat';
import { addDoc, collection } from 'firebase/firestore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import GeneratingCourse from '@/app/dashboard/courses/GeneratingCourse';
import { generateFeedbackFlow, generateExplanation, generateTutorResponse } from '@/ai/flows/sat-feedback-flow';
import GeneratingSession from '../GeneratingSession';


function StudySessionPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic') as 'Math' | 'Reading & Writing' | null;

    const [questions, setQuestions] = useState<SatQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState<Record<number, boolean>>({});
    
    const [questionTimers, setQuestionTimers] = useState<Record<number, number>>({});
    const [currentQuestionTime, setCurrentQuestionTime] = useState(0);

    const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
    
    const [sessionState, setSessionState] = useState<'studying' | 'results'>('studying');
    const [resultsData, setResultsData] = useState<any>(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [user] = useAuthState(auth);

    const { toast } = useToast();

    const { openChatWithPrompt } = useContext(FloatingChatContext) as any;

    useEffect(() => {
        if (!topic) {
            toast({ variant: 'destructive', title: 'No topic selected!' });
            router.push('/dashboard/sat-prep');
            return;
        }

        const storedData = sessionStorage.getItem('satStudySessionData');
        if (storedData) {
            try {
                const parsedQuestions = JSON.parse(storedData);
                if (parsedQuestions && parsedQuestions.length > 0) {
                    setQuestions(parsedQuestions);
                    setIsLoading(false);
                } else {
                    // Data is empty or invalid, push back.
                    toast({ variant: 'destructive', title: 'Session data is invalid.', description: 'Please start a new session.' });
                    router.push('/dashboard/sat-prep');
                }
            } catch (e) {
                console.error("Failed to parse study session data from sessionStorage", e);
                toast({ variant: 'destructive', title: 'Session Expired', description: 'Could not load session data. Please start a new session.' });
                router.push('/dashboard/sat-prep');
            }
        } else {
            toast({ variant: 'destructive', title: 'Session Expired', description: 'Please start a new session.' });
            router.push('/dashboard/sat-prep');
        }
    }, [topic, router, toast]);

    useEffect(() => {
        if (sessionState === 'studying') {
            setCurrentQuestionTime(0); // Reset timer for new question
            const timer = setInterval(() => {
                // Only count time if an answer has NOT been submitted for the current question
                if (!isSubmitted[currentQuestionIndex]) {
                    setCurrentQuestionTime(prev => prev + 1);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [currentQuestionIndex, isSubmitted, sessionState]);

    const handleTurnStrugglingIntoCourse = async () => {
        if (!resultsData || !user) return;
        setIsSubmittingCourse(true);
        // We won't show a toast here, the GeneratingCourse component will handle the UI

        const strugglingTopics = Object.entries(resultsData.accuracyByTopic)
            .filter(([, stats]) => (stats as any).correct / (stats as any).total < 0.6)
            .map(([topic]) => topic);
            
        if(strugglingTopics.length === 0) {
            toast({ title: "No struggling areas to create a course from. Great job!" });
            setIsSubmittingCourse(false);
            return;
        }

        const courseName = `Personalized SAT Review: ${strugglingTopics.join(', ')}`;
        const courseDescription = `An AI-generated course focusing on your areas for improvement: ${strugglingTopics.join(', ')}.`;

        try {
            const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
            const courseOutline = await generateMiniCourse({
                courseName,
                courseDescription,
                learnerType,
            });

            const courseData = {
                name: courseName,
                description: courseDescription,
                instructor: "AI Assistant",
                credits: 3,
                url: '',
                progress: 0,
                files: 0,
                userId: user.uid,
                units: courseOutline.modules.map(m => ({...m, id: crypto.randomUUID(), chapters: m.chapters.map(c => ({...c, id: crypto.randomUUID()}))})),
                isNewTopic: true,
                completedChapters: [],
            };

            await addDoc(collection(db, "courses"), courseData);
            
            toast({ title: "Course Created!", description: "Your new review course is available on the courses page." });
            router.push('/dashboard/courses');

        } catch (error) {
            console.error("Course creation failed:", error);
            toast({ variant: "destructive", title: "Course Creation Failed" });
        } finally {
            setIsSubmittingCourse(false);
        }
    }


    const handleSubmit = () => {
        setIsSubmitted(prev => ({ ...prev, [currentQuestionIndex]: true }));
        setQuestionTimers(prev => ({...prev, [currentQuestionIndex]: currentQuestionTime}));
    };

    const handleNext = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of session, calculate results
            setFeedbackLoading(true);
            const totalTime = Object.values(questionTimers).reduce((sum, time) => sum + time, 0);
            const correctAnswers = questions.filter((q, i) => userAnswers[i] === q.answer).length;
            
            const accuracyByTopic = questions.reduce((acc, q, i) => {
                const topic = q.topic;
                if (!acc[topic]) {
                    acc[topic] = { correct: 0, total: 0 };
                }
                acc[topic].total++;
                if (userAnswers[i] === q.answer) {
                    acc[topic].correct++;
                }
                return acc;
            }, {} as Record<string, { correct: number, total: number }>);

            const accuracyByDifficulty = questions.reduce((acc, q, i) => {
                const difficulty = q.difficulty;
                if (!acc[difficulty]) {
                    acc[difficulty] = { correct: 0, total: 0 };
                }
                acc[difficulty].total++;
                if (userAnswers[i] === q.answer) {
                    acc[difficulty].correct++;
                }
                return acc;
            }, {} as Record<string, { correct: number, total: number }>);

             const feedbackInput: FeedbackInput = {
                answeredQuestions: questions.map((q, i) => ({
                    question: q.question,
                    userAnswer: userAnswers[i] || "No answer",
                    isCorrect: userAnswers[i] === q.answer,
                    topic: q.topic,
                }))
            };

            const feedbackResult = await generateFeedbackFlow(feedbackInput);

            const results = {
                accuracy: (correctAnswers / questions.length) * 100,
                totalQuestions: questions.length,
                avgTime: totalTime / questions.length,
                accuracyByTopic,
                accuracyByDifficulty,
                feedback: feedbackResult.feedback,
            };
            setResultsData(results);
            setFeedbackLoading(false);
            setSessionState('results');
        }
    };
    
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleAskTutorin = (question: SatQuestion) => {
        const prompt = `I'm confused about this SAT question: "${question.question}". Can you explain it to me in a different way? The correct answer is ${question.correctAnswer}.`;
        openChatWithPrompt(prompt);
    }

    if (isLoading) {
        return <GeneratingSession topic={topic || 'SAT Session'} />;
    }
    
    if (isSubmittingCourse) {
        const strugglingTopics = Object.entries(resultsData.accuracyByTopic)
            .filter(([, stats]) => (stats as any).correct / (stats as any).total < 0.6)
            .map(([topic]) => topic);

        const courseName = `Personalized SAT Review: ${strugglingTopics.join(', ')}`;
        return <GeneratingCourse courseName={courseName} />;
    }

    if (sessionState === 'results' && resultsData) {
        return (
            <div className="p-4 md:p-8 space-y-8">
                <h1 className="text-3xl font-bold">Session Results</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader><CardTitle>Accuracy</CardTitle></CardHeader>
                        <CardContent><p className="text-4xl font-bold">{resultsData.accuracy.toFixed(0)}%</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Questions</CardTitle></CardHeader>
                        <CardContent><p className="text-4xl font-bold">{resultsData.totalQuestions}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Avg. Time</CardTitle></CardHeader>
                        <CardContent><p className="text-4xl font-bold">{resultsData.avgTime.toFixed(0)}s/q</p></CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Tutorin's Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {feedbackLoading ? <Skeleton className="h-16 w-full" /> : <p className="text-muted-foreground">{resultsData.feedback}</p>}
                    </CardContent>
                </Card>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle>Accuracy by Domain</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(resultsData.accuracyByTopic).map(([topic, stats]: any) => (
                                <div key={topic}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{topic}</span>
                                        <span className="text-muted-foreground">{stats.correct}/{stats.total}</span>
                                    </div>
                                    <Progress value={(stats.correct / stats.total) * 100} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Accuracy by Difficulty</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(resultsData.accuracyByDifficulty).map(([difficulty, stats]: any) => (
                                <div key={difficulty}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{difficulty}</span>
                                        <span className="text-muted-foreground">{stats.correct}/{stats.total}</span>
                                    </div>
                                    <Progress value={(stats.correct / stats.total) * 100} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Question Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {questions.map((q, i) => (
                                <AccordionItem value={`item-${i}`} key={i}>
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            {userAnswers[i] === q.answer ? <CheckCircle className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-red-500"/>}
                                            <span>Question {i+1}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            <p className="font-semibold">{q.question}</p>
                                            <div className="text-sm">
                                                <p><span className="font-bold">Your Answer:</span> <span className={cn(userAnswers[i] === q.answer ? "text-green-600" : "text-red-600")}>{userAnswers[i] || 'No Answer'}</span></p>
                                                {userAnswers[i] !== q.answer && <p className="text-green-600 font-bold">Correct Answer: {q.answer}</p>}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2"><Star/> Turn Struggling Areas into a Course</CardTitle>
                        <CardDescription>Create a personalized learning lab focusing on the topics you need to improve.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={handleTurnStrugglingIntoCourse} disabled={isSubmittingCourse}>
                            Create My Course
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }
    
    if (questions.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                 <h1 className="text-2xl font-bold">Generating Your Session...</h1>
                 <p className="text-muted-foreground">This may take a moment.</p>
                 <Loader2 className="mt-4 h-8 w-8 animate-spin"/>
             </div>
        )
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCurrentAnswered = isSubmitted[currentQuestionIndex];
    const selectedAnswer = userAnswers[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    const difficultyColors = {
        'Easy': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'Hard': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                 <header className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {topic === 'Reading & Writing' ? <BookOpen /> : <Calculator />}
                            Study Session: {topic}
                        </h1>
                        <div className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-5 w-5" />
                             <span>{Math.floor(currentQuestionTime / 60).toString().padStart(2, '0')}:{(currentQuestionTime % 60).toString().padStart(2, '0')}</span>
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
                            <div className="border rounded-lg p-6 space-y-4">
                               <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    <Badge className={cn(difficultyColors[currentQuestion.difficulty])}>{currentQuestion.difficulty}</Badge>
                                    <span className="font-medium">{currentQuestion.topic}</span>
                                    <span>&bull;</span>
                                    <span>{currentQuestion.subTopic}</span>
                                </div>
                                
                                <h4 className="font-bold text-lg">Explanation</h4>
                                <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                                
                                <div>
                                    <Button variant="link" className="p-0 h-auto" onClick={() => handleAskTutorin(currentQuestion)}>
                                        Still confused? Ask Tutorin.
                                    </Button>
                                </div>
                            </div>
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
        </div>
    );
}


const EmbeddedChat = ({ topic }: { topic: string | null }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: `Any questions on ${topic}? I'm here to help.` }
    ]);
    const [chatInput, setChatInput] = useState('');
    const { toast } = useToast();
    const [user] = useAuthState(auth);

    const handleChatSubmit = async () => {
        if (!chatInput.trim() || !user) return;
    
        const userMessage: Message = { role: 'user', content: chatInput };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setChatInput('');
        setIsLoading(true);
    
        try {
          const response = await generateTutorResponse({ chapterContext: `The user is in an SAT study session about ${topic}.`, question: chatInput });
    
          const aiMessage: Message = { role: 'ai', content: response.answer };
          setMessages([...newMessages, aiMessage]);
    
        } catch (error) {
          console.error(error);
          setMessages(messages); // Revert on error
          toast({ variant: 'destructive', title: 'Error', description: 'Could not get a response from the AI.'})
        } finally {
          setIsLoading(false);
        }
    }

    return (
        <div className="p-4 border-r h-full flex flex-col bg-card">
             <header className="p-2 mb-4 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/sat-prep')} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold">Ask Tutorin</h3>
                <div className="w-8"></div>
            </header>
            <ScrollArea className="flex-1 -mx-4">
                <div className="px-4 space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={cn("flex items-start gap-3", message.role === 'user' && 'justify-end')}>
                            {message.role === 'ai' && (
                                <div className="w-10 h-10 flex-shrink-0">
                                    <AIBuddy className="w-10 h-10" />
                                </div>
                            )}
                             <div className={cn("p-3 rounded-lg max-w-[85%]", message.role === 'ai' ? 'bg-muted rounded-bl-none' : 'bg-primary text-primary-foreground rounded-br-none')}>
                                <p className="text-sm">{message.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 flex-shrink-0">
                                <AIBuddy className="w-10 h-10" />
                            </div>
                            <div className="bg-muted p-3 rounded-lg rounded-bl-none animate-pulse">
                                <p className="text-sm">Thinking...</p>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="relative mt-4">
                <Input 
                    placeholder="Ask anything..."
                    className="h-12 rounded-full pl-6 pr-16 text-base"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                    disabled={isLoading}
                />
                <Button 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9"
                    onClick={handleChatSubmit}
                    disabled={isLoading}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default function StudySessionPage() {
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic') as 'Math' | 'Reading & Writing' | null;

    return (
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
                <div className="hidden lg:block lg:col-span-1">
                   <EmbeddedChat topic={topic} />
                </div>
                <div className="lg:col-span-2">
                    <StudySessionPageContent />
                </div>
            </div>
        </Suspense>
    );
}
