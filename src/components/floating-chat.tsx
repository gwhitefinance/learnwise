

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Loader2, PanelLeft, Plus, Edit, Trash2, FileText, Home, Phone, ChevronRight, HelpCircle, Search, Calendar, Lightbulb, Sparkles, Upload, User, Award, Gem, Copy, RefreshCw, ChevronLeft, CheckCircle, XCircle, ArrowRight, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, updateDoc, Timestamp, deleteDoc, orderBy } from 'firebase/firestore';
import { studyPlannerFlow, generateChatTitle, generateNoteFromChat, analyzeImage, generateQuizAction, generateFlashcardsFromNote, generateExplanation } from '@/lib/actions';
import { cn } from '@/lib/utils';
import AIBuddy from './ai-buddy';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import Link from 'next/link';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';


interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
    courseId?: string;
    courseContext?: string;
    titleGenerated?: boolean;
    userId?: string;
    isPublic?: boolean;
}

interface FirestoreChatSession {
    id?: string;
    title: string;
    messages: Message[];
    timestamp: Timestamp;
    courseId?: string;
    courseContext?: string;
    titleGenerated?: boolean;
    userId?: string;
    isPublic?: boolean;
}

type Course = {
    id: string;
    name: string;
    description: string;
};


type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  startTime: string;
  type: 'Test' | 'Homework' | 'Quiz' | 'Event' | 'Project';
  description: string;
};

type Flashcard = {
    front: string;
    back: string;
};

type QuizState = 'configuring' | 'in-progress' | 'results';
type AnswerState = 'unanswered' | 'answered';
type AnswerFeedback = { question: string; answer: string; correctAnswer: string; isCorrect: boolean; explanation?: string; };


const ChatHomeScreen = ({ onNavigate, onStartChatWithPrompt }: { onNavigate: (tab: string) => void, onStartChatWithPrompt: (prompt: string) => void }) => {
    const [user] = useAuthState(auth);
    const [topPriority, setTopPriority] = useState<CalendarEvent | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [conversationStarters, setConversationStarters] = useState<string[]>([]);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "calendarEvents"),
            where("userId", "==", user.uid),
            orderBy("date", "asc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const events = snapshot.docs
                .map(doc => ({id: doc.id, ...doc.data()} as CalendarEvent))
                .filter(event => new Date(event.date) >= new Date()); // Only future events
            setTopPriority(events[0] || null);
        });
        
        const coursesQuery = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
        });


        return () => {
            unsubscribe();
            unsubscribeCourses();
        };
    }, [user]);

    useEffect(() => {
        const staticStarters = [
            "Explain photosynthesis like I'm five",
            "Give me a 5-step study plan for my exam"
        ];
        const dynamicStarters = courses.slice(0, 2).map(course => `Help me study for ${course.name}`);
        setConversationStarters([...dynamicStarters, ...staticStarters].slice(0, 4));
    }, [courses]);

    return (
        <div className="flex flex-col h-full">
            <div className="bg-primary text-primary-foreground p-6 rounded-t-2xl">
                <h2 className="text-3xl font-bold">Hello {user?.displayName?.split(' ')[0] || 'there'}!</h2>
                <p className="opacity-80">How can I help you today?</p>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60" />
                    <Input placeholder="Search notes and docs..." className="bg-white/20 placeholder:text-primary-foreground/60 border-0 text-white pl-9" />
                </div>
            </div>
            <ScrollArea className="p-6 space-y-4 flex-1 bg-muted/30">
                 {topPriority && (
                    <div className="bg-card p-4 rounded-lg border">
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Today's Top Priority</h3>
                        <p className="font-bold">{topPriority.title}</p>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(topPriority.date), "EEE, MMM d")} at {topPriority.startTime}
                        </p>
                    </div>
                )}
                
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" /> Conversation Starters</h3>
                    {conversationStarters.map(prompt => (
                        <button
                            key={prompt}
                            onClick={() => onStartChatWithPrompt(prompt)}
                            className="w-full text-left bg-card p-3 rounded-lg flex items-center justify-between hover:bg-muted transition-colors"
                        >
                            <p className="text-sm">{prompt}</p>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

const AIToolsTab = () => {
    const [quizTopic, setQuizTopic] = useState('');
    const [numQuestions, setNumQuestions] = useState('3');
    const [flashcardContent, setFlashcardContent] = useState('');
    const { toast } = useToast();
    const [learnerType, setLearnerType] = useState<string | null>(null);

    // Quiz state
    const [isQuizDialogOpen, setQuizDialogOpen] = useState(false);
    const [isQuizLoading, setQuizLoading] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
    const [quickQuizState, setQuickQuizState] = useState<QuizState>('configuring');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
    const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [answers, setAnswers] = useState<AnswerFeedback[]>([]);


    // Flashcard dialog state
    const [isFlashcardDialogOpen, setFlashcardDialogOpen] = useState(false);
    const [isFlashcardLoading, setFlashcardLoading] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const type = localStorage.getItem('learnerType');
        setLearnerType(type);
    }, []);

    const resetQuiz = () => {
        setGeneratedQuiz(null);
        setQuickQuizState('configuring');
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswerState('unanswered');
        setFeedback(null);
        setExplanation(null);
        setAnswers([]);
    }

    const handleGenerateQuiz = async () => {
        if (!quizTopic) {
            toast({ variant: 'destructive', title: 'Topic is required.'});
            return;
        }
        setQuizDialogOpen(true);
        setQuizLoading(true);
        resetQuiz();
        try {
            const result = await generateQuizAction({
                topics: quizTopic,
                questionType: 'Multiple Choice',
                difficulty: 'Medium',
                numQuestions: parseInt(numQuestions),
            });
            setGeneratedQuiz(result);
            setQuickQuizState('in-progress');
        } catch (error) {
            console.error("Quiz generation failed:", error);
            toast({ variant: 'destructive', title: 'Failed to generate quiz.' });
            setQuizDialogOpen(false);
        } finally {
            setQuizLoading(false);
        }
    };
    
    const handleSubmitAnswer = async () => {
        if (!generatedQuiz || selectedAnswer === null) return;
        
        const currentQuestion = generatedQuiz.questions[currentQuestionIndex];
        const isCorrect = selectedAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();

        const answerFeedback: AnswerFeedback = {
            question: currentQuestion.question,
            answer: selectedAnswer,
            correctAnswer: currentQuestion.answer,
            isCorrect: isCorrect,
        };
        
        setAnswerState('answered');
        setFeedback(answerFeedback);
        setAnswers(prev => [...prev, answerFeedback]);
        
        if (!isCorrect) {
            setIsExplanationLoading(true);
            setExplanation(null);
            try {
                const explanationResult = await generateExplanation({
                    question: currentQuestion.question,
                    userAnswer: selectedAnswer,
                    correctAnswer: currentQuestion.answer,
                    learnerType: (learnerType as any) ?? 'Unknown',
                    provideFullExplanation: true,
                });
                setExplanation(explanationResult.explanation);
            } catch (error) {
                console.error(error);
            } finally {
                setIsExplanationLoading(false);
            }
        }
    }

    const handleNextQuestion = async () => {
        setFeedback(null);
        setExplanation(null);
        setSelectedAnswer(null);
        setAnswerState('unanswered');
        
        if (currentQuestionIndex < (generatedQuiz?.questions.length ?? 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setQuickQuizState('results');
        }
    };

    const handleGenerateFlashcards = async () => {
        if (!flashcardContent) {
            toast({ variant: 'destructive', title: 'Content is required.'});
            return;
        }
        setFlashcardDialogOpen(true);
        setFlashcardLoading(true);
        setFlashcards([]);
        try {
            const result = await generateFlashcardsFromNote({
                noteContent: flashcardContent,
                learnerType: (learnerType as any) ?? 'Reading/Writing',
            });
            setFlashcards(result.flashcards);
        } catch (error) {
            console.error("Flashcard generation failed:", error);
            toast({ variant: 'destructive', title: 'Failed to generate flashcards.' });
            setFlashcardDialogOpen(false);
        } finally {
            setFlashcardLoading(false);
        }
    };

    return (
        <>
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-center">AI Toolkit</h2>
            </div>
            <ScrollArea className="flex-1 p-4 space-y-6">
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="text-yellow-500"/> Quick Quiz</h3>
                    <Input placeholder="Enter a topic..." value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} />
                    <Select value={numQuestions} onValueChange={setNumQuestions}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3">3 Questions</SelectItem>
                            <SelectItem value="5">5 Questions</SelectItem>
                            <SelectItem value="10">10 Questions</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="w-full" onClick={handleGenerateQuiz}>Generate Quiz</Button>
                </div>
                 <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold flex items-center gap-2"><FileText className="text-blue-500"/> Flashcard Factory</h3>
                    <Textarea placeholder="Paste notes or concepts here..." value={flashcardContent} onChange={(e) => setFlashcardContent(e.target.value)} />
                    <Button className="w-full" onClick={handleGenerateFlashcards}>Create Flashcards</Button>
                </div>
            </ScrollArea>
        </div>

        <Dialog open={isQuizDialogOpen} onOpenChange={(open) => { if(!open) { setQuizTopic(''); resetQuiz(); } setQuizDialogOpen(open); }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="text-yellow-500" />
                        Quick Quiz on "{quizTopic}"
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 max-h-[70vh] overflow-y-auto">
                    {isQuizLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : (
                       generatedQuiz && quickQuizState === 'in-progress' && (
                           <div className="space-y-6">
                                <div className="text-center">
                                    <p className="text-muted-foreground mb-2">Question {currentQuestionIndex + 1} of {generatedQuiz.questions.length}</p>
                                    <Progress value={((currentQuestionIndex + 1) / generatedQuiz.questions.length) * 100} className="mb-4 h-2"/>
                                    <h3 className="text-2xl font-bold">{generatedQuiz.questions[currentQuestionIndex].question}</h3>
                                </div>
                                 <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer} disabled={answerState === 'answered'}>
                                    <div className="space-y-4">
                                    {generatedQuiz.questions[currentQuestionIndex].options?.map((option, index) => {
                                        const isCorrect = option.toLowerCase() === generatedQuiz.questions[currentQuestionIndex].answer.toLowerCase();
                                        return (
                                        <Label key={index} htmlFor={`q${index}-opt${index}`} className={cn(
                                            "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                                            answerState === 'unanswered' && (selectedAnswer === option ? "border-primary bg-primary/10" : "border-border hover:bg-muted"),
                                            answerState === 'answered' && isCorrect && "border-green-500 bg-green-500/10",
                                            answerState === 'answered' && selectedAnswer === option && !isCorrect && "border-red-500 bg-red-500/10",
                                        )}>
                                            <RadioGroupItem value={option} id={`q${index}-opt${index}`} />
                                            <span>{option}</span>
                                            {answerState === 'answered' && isCorrect && <CheckCircle className="h-5 w-5 text-green-500 ml-auto"/>}
                                            {answerState === 'answered' && selectedAnswer === option && !isCorrect && <XCircle className="h-5 w-5 text-red-500 ml-auto"/>}
                                        </Label>
                                    )})}
                                    </div>
                                </RadioGroup>
                                {answerState === 'answered' && !feedback?.isCorrect && (
                                     <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                        <h4 className="font-semibold flex items-center gap-2 text-amber-700"><Lightbulb/> Explanation</h4>
                                        {isExplanationLoading ? (
                                            <p className="animate-pulse text-muted-foreground mt-2">Generating personalized feedback...</p>
                                        ) : (
                                            <div className="text-muted-foreground mt-2"><p>{explanation}</p></div>
                                        )}
                                    </div>
                                )}
                           </div>
                       )
                    )}
                    {quickQuizState === 'results' && (
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold">Quiz Complete!</h2>
                             <p className="text-5xl font-bold text-primary my-4">{answers.filter(a => a.isCorrect).length} / {generatedQuiz?.questions.length}</p>
                            <p className="text-muted-foreground">Great job practicing!</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    {quickQuizState === 'in-progress' && (
                         <div className="w-full flex justify-end">
                            {answerState === 'unanswered' ? (
                                <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>Submit</Button>
                            ) : (
                                <Button onClick={handleNextQuestion}>
                                    {currentQuestionIndex < (generatedQuiz?.questions.length ?? 0) - 1 ? 'Next Question' : 'Finish Quiz'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                    {quickQuizState === 'results' && (
                         <DialogClose asChild><Button>Done</Button></DialogClose>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isFlashcardDialogOpen} onOpenChange={setFlashcardDialogOpen}>
            <DialogContent className="max-w-xl">
                 <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Copy className="text-blue-500" />
                        Flashcards
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {isFlashcardLoading ? (
                        <div className="flex items-center justify-center h-52">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : flashcards.length > 0 ? (
                        <div className="space-y-4">
                             <div className="text-center text-sm text-muted-foreground">
                                Card {currentFlashcardIndex + 1} of {flashcards.length}
                            </div>
                            <div
                                className="relative w-full h-64 cursor-pointer"
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                <AnimatePresence>
                                    <motion.div
                                        key={isFlipped ? 'back' : 'front'}
                                        initial={{ rotateY: isFlipped ? 180 : 0 }}
                                        animate={{ rotateY: 0 }}
                                        exit={{ rotateY: isFlipped ? 0 : -180 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute w-full h-full p-6 flex items-center justify-center text-center rounded-lg border bg-card text-card-foreground shadow-sm"
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        <p className="text-xl font-semibold">
                                            {isFlipped ? flashcards[currentFlashcardIndex].back : flashcards[currentFlashcardIndex].front}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            <div className="flex justify-center items-center gap-4">
                                <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.max(0, prev - 1))}} disabled={currentFlashcardIndex === 0}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => setIsFlipped(!isFlipped)}>
                                    <RefreshCw className="mr-2 h-4 w-4"/> Flip Card
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.min(flashcards.length - 1, prev + 1))}} disabled={currentFlashcardIndex === flashcards.length - 1}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-52">
                            <p>No flashcards were generated.</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button>Close</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}

const MyStatsTab = () => {
    const [user] = useAuthState(auth);
    const [stats, setStats] = useState({ level: 1, xp: 0, coins: 0, streak: 0 });

    useEffect(() => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setStats(prev => ({...prev, level: data.level || 1, xp: data.xp || 0, coins: data.coins || 0 }));
            }
        });
        
        const lastVisit = localStorage.getItem('lastVisit');
        const today = new Date().toDateString();
        if (lastVisit === today) {
            setStats(prev => ({ ...prev, streak: Number(localStorage.getItem('streakCount')) || 1}));
        } else {
             const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastVisit === yesterday.toDateString()) {
                setStats(prev => ({...prev, streak: (Number(localStorage.getItem('streakCount')) || 0) + 1}));
            } else {
                setStats(prev => ({...prev, streak: 1}));
            }
        }

        return () => unsubscribe();
    }, [user]);

    const xpForNextLevel = stats.level * 100;
    const xpProgress = (stats.xp / xpForNextLevel) * 100;

    return (
         <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-center">My Stats</h2>
            </div>
            <div className="flex-1 p-4 space-y-4">
                <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold text-sm mb-2">Level {stats.level}</h3>
                    <Progress value={xpProgress} />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{stats.xp} / {xpForNextLevel} XP</p>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 border rounded-lg bg-card text-center">
                        <p className="text-2xl font-bold text-amber-500">{stats.coins}</p>
                        <p className="text-xs font-semibold text-muted-foreground">Coins</p>
                    </div>
                     <div className="p-4 border rounded-lg bg-card text-center">
                        <p className="text-2xl font-bold text-orange-500">{stats.streak}</p>
                        <p className="text-xs font-semibold text-muted-foreground">Day Streak</p>
                    </div>
                </div>
                 <Button variant="outline" className="w-full" asChild><Link href="/dashboard/profile">View Full Profile</Link></Button>
                 <Button className="w-full" asChild><Link href="/dashboard/shop">Go to Shop</Link></Button>
            </div>
        </div>
    );
};


export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] =useState(true);
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAuthState(auth);
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  
  // State for upload dialog
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    if(user) {
        const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
        if(savedCustomizations && savedCustomizations.trim() !== '') {
            try {
                setCustomizations(JSON.parse(savedCustomizations));
            } catch (e) {
                console.error("Failed to parse customizations from localStorage", e);
            }
        }
    }

    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(welcomeTimer);
  }, [user]);

  useEffect(() => {
    if (!isOpen || !user) return;
    
    const q = query(collection(db, "chatSessions"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userSessions = querySnapshot.docs.map(doc => {
            const data = doc.data() as FirestoreChatSession;
            return { id: doc.id, ...data, timestamp: data.timestamp.toMillis() } as ChatSession;
        });
        setSessions(userSessions);

        if (!activeSessionId && userSessions.length > 0) {
            setActiveSessionId(userSessions[0].id);
        } else if (userSessions.length === 0) {
            createNewSession();
        }
    });

    return () => unsubscribe();

  }, [isOpen, user, activeSessionId]);


   useEffect(() => {
    if(scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [activeSession?.messages, isOpen]);

  const createNewSession = async (prompt?: string): Promise<string> => {
    if (!user) return '';
    
    const newSessionData = {
        title: prompt ? "New Chat" : "New Chat",
        messages: [{ role: 'ai', content: `Hey ${user.displayName?.split(' ')[0] || 'there'}! How can I help?` }],
        timestamp: Timestamp.now(),
        titleGenerated: !!prompt,
        userId: user.uid,
        isPublic: false,
    };
    
    try {
        const docRef = await addDoc(collection(db, "chatSessions"), newSessionData);
        setActiveSessionId(docRef.id);
        setActiveTab('conversation');
        return docRef.id;
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start a new chat.'})
        return '';
    }
  }

  const handleSendMessage = async (prompt?: string) => {
    const messageContent = prompt || input;
    if (!messageContent.trim() || !user) return;
    
    let currentSessionId = activeSessionId;
    let currentMessages: Message[] = [];

    // If there is no active session, create one first.
    if (!activeSession) {
        const newId = await createNewSession(messageContent);
        if (!newId) return; // Stop if session creation failed
        currentSessionId = newId;
        // The messages array will be the default one from createNewSession
        const newSession = sessions.find(s => s.id === newId);
        currentMessages = newSession ? newSession.messages : [{ role: 'ai', content: `Hey ${user.displayName?.split(' ')[0] || 'there'}! How can I help?` }];
    } else {
        currentMessages = activeSession.messages;
    }
    
    if (!currentSessionId) return;

    const userMessage: Message = { role: 'user', content: messageContent };
    const updatedMessages = [...currentMessages, userMessage];
    
    setSessions(sessions.map(s => s.id === currentSessionId ? { ...s, messages: updatedMessages } : s));
    setInput('');
    setIsLoading(true);

    try {
      const q = query(collection(db, "calendarEvents"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const calendarEvents = querySnapshot.docs.map(doc => {
          const data = doc.data() as CalendarEvent;
          return { id: doc.id, ...data };
      });
      const learnerType = localStorage.getItem('learnerType');

      const response = await studyPlannerFlow({
        userName: user?.displayName?.split(' ')[0],
        history: updatedMessages,
        learnerType: learnerType || undefined,
        courseContext: activeSession?.courseContext || undefined,
        calendarEvents: calendarEvents.map(e => ({
            id: e.id,
            date: e.date,
            title: e.title,
            time: e.startTime,
            type: e.type,
            description: e.description,
        })),
      });

      const aiMessage: Message = { role: 'ai', content: response };
      const finalMessages = [...updatedMessages, aiMessage];
      
      const sessionRef = doc(db, "chatSessions", currentSessionId);
      await updateDoc(sessionRef, { messages: finalMessages, timestamp: Timestamp.now() });

       if (!activeSession?.titleGenerated && updatedMessages.length <= 2) {
          const { title } = await generateChatTitle({ messages: finalMessages });
          await updateDoc(sessionRef, { title, titleGenerated: true });
      }

    } catch (error) {
      console.error(error);
       setSessions(sessions.map(s => s.id === currentSessionId ? activeSession! : s));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChatWithPrompt = async (prompt: string) => {
    setActiveTab('conversation');
    await createNewSession(prompt);
    // Use a short delay to ensure state updates before sending message
    setTimeout(() => handleSendMessage(prompt), 100);
  };


  const startRename = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setRenameInput(session.title);
  }

  const handleRename = async () => {
    if (!editingSessionId || !renameInput.trim()) {
        setEditingSessionId(null);
        return;
    };
    try {
        const sessionRef = doc(db, "chatSessions", editingSessionId);
        await updateDoc(sessionRef, { title: renameInput });
        toast({ title: 'Chat renamed.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not rename chat.'});
    } finally {
        setEditingSessionId(null);
        setRenameInput('');
    }
  };
  
  const handleDeleteSession = async (sessionId: string) => {
    if (sessions.length <= 1) {
        toast({ variant: 'destructive', title: 'Cannot delete last chat.'});
        return;
    }
    try {
        await deleteDoc(doc(db, "chatSessions", sessionId));
        toast({ title: 'Chat deleted.' });
        if (activeSessionId === sessionId) {
            const newActiveSession = sessions.find(s => s.id !== sessionId);
            setActiveSessionId(newActiveSession ? newActiveSession.id : null);
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete chat.'});
    }
  };

  const handleSaveAsNote = async () => {
    if (!activeSession || !user) return;
    try {
        const result = await generateNoteFromChat({ messages: activeSession.messages });
        await addDoc(collection(db, "notes"), {
            title: result.title,
            content: result.note,
            date: Timestamp.now(),
            color: 'bg-indigo-100 dark:bg-indigo-900/20',
            isImportant: false,
            isCompleted: false,
            userId: user.uid,
            courseId: activeSession.courseId || null,
        });
        toast({ title: "Note Saved!", description: "Find it on your Notes page." });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error saving note.'});
    }
  }

  const handleUpload = async () => {
    if (!fileToUpload || !activeSessionId) {
      toast({ variant: 'destructive', title: 'No file selected' });
      return;
    }
    
    setIsLoading(true);
    setUploadOpen(false);

    const userMessageContent = `I've uploaded an image: ${fileToUpload.name}. Can you help me with this?`;
    const userMessage: Message = { role: 'user', content: userMessageContent };
    const updatedMessages = activeSession ? [...activeSession.messages, userMessage] : [userMessage];
    setSessions(sessions.map(s => s.id === activeSessionId ? { ...s, messages: updatedMessages } : s));

    try {
        const reader = new FileReader();
        reader.readAsDataURL(fileToUpload);
        reader.onload = async (e) => {
            const imageDataUri = e.target?.result as string;
            if (!imageDataUri) {
                throw new Error("Could not read file data.");
            }
            const { analysis } = await analyzeImage({ imageDataUri });

            const aiMessage: Message = { role: 'ai', content: analysis };
            const finalMessages = [...updatedMessages, aiMessage];
            
            setIsLoading(false);
            const sessionRef = doc(db, "chatSessions", activeSessionId);
            await updateDoc(sessionRef, { messages: finalMessages });
        }
        reader.onerror = (error) => {
            throw error;
        }

    } catch (error) {
        console.error(error);
        setIsLoading(false);
        toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the uploaded image.' });
        setSessions(sessions.map(s => s.id === activeSessionId ? activeSession! : s)); // Revert
    } finally {
        setFileToUpload(null);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      setFileToUpload(droppedFiles[0]);
    }
  };
  
  const TabButton = ({ name, icon, currentTab, setTab }: {name: string, icon: React.ReactNode, currentTab: string, setTab: (tab:string) => void}) => (
    <button onClick={() => setTab(name.toLowerCase())} className={cn(
        "flex flex-col items-center gap-1 p-2 flex-1 rounded-lg transition-colors",
        currentTab === name.toLowerCase() ? "text-primary" : "text-muted-foreground hover:bg-muted"
    )}>
        {icon}
        <span className="text-xs font-medium">{name}</span>
    </button>
  );


  return (
    <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
            {isOpen && (
                 <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-96 h-[600px] bg-card rounded-2xl shadow-2xl border flex flex-col origin-bottom-right"
                >
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {activeTab === 'home' && <ChatHomeScreen onNavigate={setActiveTab} onStartChatWithPrompt={handleStartChatWithPrompt} />}
                        {activeTab === 'ai tools' && <AIToolsTab />}
                        {activeTab === 'my stats' && <MyStatsTab />}
                        {activeTab === 'conversation' && (
                            <div className="flex-1 flex flex-row h-full overflow-hidden">
                                 <AnimatePresence>
                                    {isSidebarVisible && (
                                        <motion.aside 
                                            initial={{ width: 0, opacity: 0, marginRight: 0, padding: 0 }}
                                            animate={{ width: 144, opacity: 1, marginRight: 8, padding: 4 }}
                                            exit={{ width: 0, opacity: 0, marginRight: 0, padding: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="bg-muted/50 border-r flex-col flex"
                                        >
                                            <div className="p-1 flex justify-between items-center border-b">
                                                <h2 className="text-xs font-semibold pl-2">Chats</h2>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => createNewSession()}><Plus className="h-3 w-3"/></Button>
                                            </div>
                                            <ScrollArea className="flex-1">
                                                <div className="p-1 space-y-1">
                                                    {sessions.map(session => (
                                                        <div key={session.id} className="group relative">
                                                            {editingSessionId === session.id ? (
                                                                <Input value={renameInput} onChange={(e) => setRenameInput(e.target.value)} onBlur={handleRename} onKeyDown={(e) => e.key === 'Enter' && handleRename()} autoFocus className="h-7 text-xs" />
                                                            ) : (
                                                                <Button variant={activeSessionId === session.id ? "secondary" : "ghost"} className="w-full justify-start h-7 text-xs truncate" onClick={() => setActiveSessionId(session.id)}>
                                                                    <MessageSquare className="h-3 w-3 mr-2"/>
                                                                    {session.title}
                                                                </Button>
                                                            )}
                                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startRename(session)}><Edit className="h-3 w-3"/></Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3"/></Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader><AlertDialogTitle>Delete Chat?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => handleDeleteSession(session.id)}>Delete</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </motion.aside>
                                    )}
                                </AnimatePresence>
                                <div className="flex-1 flex flex-col min-w-0">
                                    <header className="p-2 border-b flex items-center justify-between gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
                                            <PanelLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="flex-1 flex items-center gap-2 overflow-hidden">
                                            <div className="flex-1 truncate">
                                                <h3 className="font-semibold text-sm truncate">{activeSession?.title || 'AI Buddy'}</h3>
                                                {activeSession?.courseContext && <p className="text-xs text-muted-foreground truncate">Focus: {activeSession.courseContext}</p>}
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleSaveAsNote}>
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </header>
                                    <ScrollArea className="flex-1" ref={scrollAreaRef}>
                                        <div className="p-4 space-y-4">
                                            {activeSession?.messages.map((msg, index) => (
                                                <div key={index} className={cn("flex items-end gap-2", msg.role === 'user' ? 'justify-end' : '')}>
                                                    {msg.role === 'ai' && (
                                                        <AIBuddy className="w-0 h-0" {...customizations} />
                                                    )}
                                                    <div className={cn(
                                                        "p-3 rounded-2xl max-w-[80%] text-sm",
                                                        msg.role === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                                                    )}>
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {isLoading && (
                                                <div className="flex items-end gap-2">
                                                    <AIBuddy className="w-7 h-7" {...customizations} />
                                                    <div className="p-3 rounded-2xl max-w-[80%] text-sm bg-muted rounded-bl-none animate-pulse">
                                                        Thinking...
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                    <footer className="p-4 border-t">
                                        <div className="relative">
                                            <Input 
                                                placeholder="Ask anything..."
                                                className="pr-20 rounded-full"
                                                value={input}
                                                onChange={e => setInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                                disabled={isLoading}
                                            />
                                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                <Dialog open={isUploadOpen} onOpenChange={setUploadOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Upload className="h-4 w-4"/></Button>
                                                    </DialogTrigger>
                                                    <DialogContent onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
                                                        <DialogHeader>
                                                            <DialogTitle>Upload File</DialogTitle>
                                                            <DialogDescription>Upload an image file to discuss it with the AI.</DialogDescription>
                                                        </DialogHeader>
                                                        <div className={cn("relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors", isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50")} onClick={() => document.getElementById('chat-file-upload')?.click()}>
                                                            <input id="chat-file-upload" type="file" className="hidden" onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} accept="image/*" />
                                                            <Upload className="w-10 h-10 mb-4 text-muted-foreground" />
                                                            <p className="mb-2 text-lg font-semibold">Drag and drop your file here</p>
                                                            <p className="text-sm text-muted-foreground">Or click to browse</p>
                                                        </div>
                                                        {fileToUpload && <p className="text-sm text-muted-foreground">Selected: {fileToUpload.name}</p>}
                                                        <DialogFooter>
                                                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                                            <Button onClick={handleUpload} disabled={!fileToUpload}>Upload & Analyze</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                                <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => handleSendMessage()} disabled={isLoading}>
                                                    <Send className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </footer>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t p-2 flex justify-around bg-card rounded-b-2xl">
                       <TabButton name="Home" icon={<Home />} currentTab={activeTab} setTab={setActiveTab} />
                       <TabButton name="Conversation" icon={<MessageSquare />} currentTab={activeTab} setTab={setActiveTab} />
                       <TabButton name="AI Tools" icon={<Sparkles />} currentTab={activeTab} setTab={setActiveTab} />
                       <TabButton name="My Stats" icon={<Award />} currentTab={activeTab} setTab={setActiveTab} />
                    </div>

                </motion.div>
            )}
        </AnimatePresence>

        <div className="relative mt-4 flex items-end justify-end">
             <AnimatePresence>
                {showWelcome && !isOpen && user && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                        className="bg-card border p-4 rounded-xl shadow-lg mb-2 -mr-12"
                    >
                        <p className="font-semibold">Hello {user.displayName?.split(' ')[0] || 'there'}!</p>
                        <p className="text-sm text-muted-foreground">Chat with me at any time.</p>
                        <div className="absolute right-[-9px] bottom-4 w-3 h-3 bg-card border-b border-r transform rotate-45"></div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-24 h-24 rounded-full flex items-center justify-center relative bg-transparent"
                aria-label="Toggle Chat"
            >
                 <AnimatePresence>
                    {isOpen ? (
                        <motion.div
                            key="close-icon"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 45 }}
                            className="text-white bg-primary rounded-full p-4"
                        >
                            <X className="w-8 h-8" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="buddy-icon"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-primary-foreground w-24 h-24"
                        >
                            <AIBuddy {...customizations} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    </div>
  );
}
