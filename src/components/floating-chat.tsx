

'use client';

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Loader2, Plus, Edit, Trash2, FileText, Home, Phone, ChevronRight, HelpCircle, Search, Calendar, Lightbulb, Sparkles, Upload, User, Award, Gem, Copy, RefreshCw, ChevronLeft, CheckCircle, XCircle, ArrowRight, BrainCircuit, Bot, MoreVertical, Link as LinkIcon, Share2, Maximize, Minimize, NotebookText, Download, Eraser, Mic, Hand } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from './ui/dropdown-menu';


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


const ChatHomeScreen = ({ sessions, onNavigate, onStartNewChat, onSelectSession, onStartChatWithPrompt, customizations }: { sessions: ChatSession[], onNavigate: (tab: string) => void, onStartNewChat: () => void, onSelectSession: (sessionId: string) => void, onStartChatWithPrompt: (prompt: string) => void, customizations: Record<string, string> }) => {
    const [user] = useAuthState(auth);

    const conversationStarters = [
        { icon: <Calendar className="h-5 w-5" />, text: "Help me create a study plan" },
        { icon: <Lightbulb className="h-5 w-5" />, text: "Explain a difficult concept" },
        { icon: <Sparkles className="h-5 w-5" />, text: "Give me ideas for a project" },
        { icon: <HelpCircle className="h-5 w-5" />, text: "Generate practice questions" },
    ];

    return (
        <div className="flex flex-col h-full bg-muted/30">
             <div className="p-4 flex justify-between items-center">
                <h2 className="text-lg font-bold">Home</h2>
                <Button size="sm" onClick={onStartNewChat}><Plus className="w-4 h-4 mr-2" /> New Chat</Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-8">
                     <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border">
                        <AIBuddy {...customizations} className="w-24 h-24 mb-2" />
                        <h3 className="font-semibold text-lg">Hello, {user?.displayName?.split(' ')[0] || 'Learner'}!</h3>
                        <p className="text-sm text-muted-foreground">How can I help you learn today?</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3 px-2">Conversation Starters</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {conversationStarters.map(starter => (
                                <button key={starter.text} onClick={() => onStartChatWithPrompt(starter.text)} className="bg-card border p-3 rounded-lg text-left hover:bg-muted transition-colors">
                                    <div className="text-primary mb-2">{starter.icon}</div>
                                    <p className="text-sm font-medium">{starter.text}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                   
                    <div>
                        <h4 className="font-semibold mb-3 px-2">Recent Chats</h4>
                        {sessions.length > 0 ? (
                            <div className="space-y-2">
                                {sessions.slice(0, 3).map(session => (
                                     <button
                                        key={session.id}
                                        onClick={() => onSelectSession(session.id)}
                                        className="w-full text-left bg-card p-3 rounded-lg flex items-center gap-3 hover:bg-muted transition-colors border"
                                    >
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-semibold truncate">{session.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-8 text-sm text-muted-foreground">
                                <p>Your past conversations will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};

const AIToolsTab = ({ onStartChatWithPrompt }: { onStartChatWithPrompt: (prompt: string) => void }) => {
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
                 <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold flex items-center gap-2"><BrainCircuit className="text-purple-500"/> AI Tutor</h3>
                    <p className="text-sm text-muted-foreground">Upload an image of your homework to get a step-by-step walkthrough.</p>
                    <Button className="w-full" variant="outline" onClick={() => onStartChatWithPrompt("I need help with my homework, I'm uploading an image.")}>Start AI Tutor</Button>
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


export default function FloatingChat({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAuthState(auth);
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  
  // State for upload dialog
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // State for "Save as Note" dialog
  const [isNoteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteGenerationLoading, setNoteGenerationLoading] = useState(false);
  const [generatedNoteTitle, setGeneratedNoteTitle] = useState('');
  const [generatedNoteContent, setGeneratedNoteContent] = useState('');
  const [selectedNoteCourseId, setSelectedNoteCourseId] = useState<string | undefined>(undefined);

  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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
  
  const [isSessionCreating, setIsSessionCreating] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    
    const q = query(collection(db, "chatSessions"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userSessions = querySnapshot.docs.map(doc => {
            const data = doc.data() as Omit<FirestoreChatSession, 'id'>;
            return { id: doc.id, ...data, timestamp: data.timestamp.toMillis() } as ChatSession;
        });
        setSessions(userSessions);

        if (userSessions.length === 0 && !activeSessionId && !isSessionCreating && activeTab !== 'home') {
            createNewSession();
        } else if (!activeSessionId && userSessions.length > 0) {
            setActiveSessionId(userSessions[0].id);
        }
    });
    
    const coursesQuery = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
        const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);
    });

    return () => {
        unsubscribe();
        unsubscribeCourses();
    }

  }, [isOpen, user, activeSessionId, isSessionCreating, activeTab]);


   useEffect(() => {
    if(scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [activeSession?.messages, isOpen]);

  const createNewSession = async (prompt?: string): Promise<string> => {
    if (!user || isSessionCreating) return '';
    setIsSessionCreating(true);
    
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
    } finally {
        setIsSessionCreating(false);
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
          return { ...data, id: doc.id };
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
    const newSessionId = await createNewSession(prompt);
    if (newSessionId) {
        // Use a short delay to ensure state updates before sending message
        setTimeout(() => handleSendMessage(prompt), 100);
    }
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

  const handleOpenNoteDialog = async () => {
    if (!activeSession) return;
    setNoteDialogOpen(true);
    setNoteGenerationLoading(true);
    try {
        const result = await generateNoteFromChat({ messages: activeSession.messages });
        setGeneratedNoteTitle(result.title);
        setGeneratedNoteContent(result.note);
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate note summary.' });
        setNoteDialogOpen(false);
    } finally {
        setNoteGenerationLoading(false);
    }
  }

  const handleSaveNote = async () => {
    if (!user) return;
    try {
        await addDoc(collection(db, "notes"), {
            title: generatedNoteTitle,
            content: generatedNoteContent,
            date: Timestamp.now(),
            color: 'bg-indigo-100 dark:bg-indigo-900/20',
            isImportant: false,
            isCompleted: false,
            userId: user.uid,
            courseId: selectedNoteCourseId || null,
        });
        toast({ title: "Note Saved!", description: "Find it on your Notes page." });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error saving note.' });
    } finally {
        setNoteDialogOpen(false);
        setGeneratedNoteTitle('');
        setGeneratedNoteContent('');
        setSelectedNoteCourseId(undefined);
    }
  }

  const handleSetCourseFocus = async (course: Course | null) => {
    if (!activeSessionId) return;
    const sessionRef = doc(db, 'chatSessions', activeSessionId);
    try {
        await updateDoc(sessionRef, {
            courseId: course?.id || null,
            courseContext: course ? `${course.name}: ${course.description}` : null,
        });
        toast({ title: 'Course Focus Updated!', description: course ? `AI will now focus on ${course.name}.` : 'AI focus has been cleared.' });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not set course focus.' });
    }
  };

  const handleExportConversation = () => {
    if (!activeSession) return;
    const content = activeSession.messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSession.title.replace(/ /g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Chat Exported!' });
  };
  
  const handleClearConversation = async () => {
    if (!activeSessionId || !user) return;
    try {
        const sessionRef = doc(db, 'chatSessions', activeSessionId);
        await updateDoc(sessionRef, {
            messages: [{ role: 'ai', content: `Hey ${user.displayName?.split(' ')[0] || 'there'}! How can I help?` }]
        });
        toast({ title: 'Chat Cleared' });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not clear the chat.' });
    }
  };


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
  
   const activateVoiceInput = () => {
    setIsOpen(true);
    setActiveTab('conversation');

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Voice input not supported in this browser.' });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSendMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast({ variant: 'destructive', title: 'Voice recognition error.' });
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
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
    <>
      {children}
      <div className={cn(
          "fixed bottom-6 right-6 z-50",
          isFullscreen && "inset-0 bottom-0 right-0 w-full h-full"
      )}>
          <AnimatePresence>
              {isOpen && (
                   <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                          "bg-card rounded-2xl shadow-2xl border flex flex-col origin-bottom-right",
                          isFullscreen ? "w-full h-full" : "w-96 h-[600px]"
                      )}
                  >
                      <div className="flex-1 overflow-hidden flex flex-col">
                          {activeTab === 'home' && <ChatHomeScreen sessions={sessions} onNavigate={setActiveTab} onStartNewChat={createNewSession} onSelectSession={(id) => { setActiveSessionId(id); setActiveTab('conversation'); }} onStartChatWithPrompt={handleStartChatWithPrompt} customizations={customizations} />}
                          {activeTab === 'ai tools' && <AIToolsTab onStartChatWithPrompt={handleStartChatWithPrompt} />}
                          {activeTab === 'my stats' && <MyStatsTab />}
                          {activeTab === 'conversation' && (
                              <div className="flex-1 flex flex-row h-full overflow-hidden">
                                  <div className="flex-1 flex flex-col min-w-0">
                                      <header className="p-2 border-b flex items-center justify-between gap-2">
                                          <div className="flex-1 flex items-center gap-2 overflow-hidden">
                                              <div className="flex-1 truncate">
                                                  <h3 className="font-semibold text-sm truncate">{activeSession?.title || 'AI Buddy'}</h3>
                                                  {activeSession?.courseContext && <p className="text-xs text-muted-foreground truncate">Focus: {courses.find(c => c.id === activeSession.courseId)?.name}</p>}
                                              </div>
                                          </div>
                                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(!isFullscreen)}>
                                              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                                          </Button>
                                           <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                                      <MoreVertical className="h-4 w-4" />
                                                  </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                   <DropdownMenuSub>
                                                      <DropdownMenuSubTrigger>
                                                          <BrainCircuit className="mr-2 h-4 w-4" />
                                                          <span>Focus on Course</span>
                                                      </DropdownMenuSubTrigger>
                                                      <DropdownMenuPortal>
                                                          <DropdownMenuSubContent>
                                                              <DropdownMenuItem onSelect={() => handleSetCourseFocus(null)}>
                                                                  { !activeSession?.courseId && <CheckCircle className="mr-2 h-4 w-4" />}
                                                                  <span>None</span>
                                                              </DropdownMenuItem>
                                                              <DropdownMenuSeparator />
                                                              {courses.map(course => (
                                                                  <DropdownMenuItem key={course.id} onSelect={() => handleSetCourseFocus(course)}>
                                                                      { activeSession?.courseId === course.id && <CheckCircle className="mr-2 h-4 w-4" />}
                                                                      {course.name}
                                                                  </DropdownMenuItem>
                                                              ))}
                                                          </DropdownMenuSubContent>
                                                      </DropdownMenuPortal>
                                                  </DropdownMenuSub>
                                                   <DropdownMenuItem onSelect={handleExportConversation}>
                                                      <Download className="mr-2 h-4 w-4" />
                                                      <span>Export Conversation</span>
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onSelect={handleOpenNoteDialog}>
                                                      <NotebookText className="mr-2 h-4 w-4" />
                                                      <span>Save as Note</span>
                                                  </DropdownMenuItem>
                                                  <DropdownMenuSeparator />
                                                  <AlertDialog>
                                                      <AlertDialogTrigger asChild>
                                                           <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                              <Eraser className="mr-2 h-4 w-4"/> Clear Conversation
                                                          </DropdownMenuItem>
                                                      </AlertDialogTrigger>
                                                      <AlertDialogContent>
                                                          <AlertDialogHeader><AlertDialogTitle>Clear Conversation?</AlertDialogTitle><AlertDialogDescription>This will remove all messages from this chat session.</AlertDialogDescription></AlertDialogHeader>
                                                          <AlertDialogFooter>
                                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                              <AlertDialogAction onClick={handleClearConversation}>Clear</AlertDialogAction>
                                                          </AlertDialogFooter>
                                                      </AlertDialogContent>
                                                  </AlertDialog>
                                                  <AlertDialog>
                                                      <AlertDialogTrigger asChild>
                                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                              <Trash2 className="mr-2 h-4 w-4"/> Delete Chat
                                                          </DropdownMenuItem>
                                                      </AlertDialogTrigger>
                                                      <AlertDialogContent>
                                                          <AlertDialogHeader>
                                                              <AlertDialogTitle>Are you sure you want to delete this chat?</AlertDialogTitle>
                                                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                          </AlertDialogHeader>
                                                          <AlertDialogFooter>
                                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                              <AlertDialogAction onClick={() => activeSessionId && handleDeleteSession(activeSessionId)}>Delete</AlertDialogAction>
                                                          </AlertDialogFooter>
                                                      </AlertDialogContent>
                                                  </AlertDialog>
                                              </DropdownMenuContent>
                                          </DropdownMenu>
                                      </header>
                                      <ScrollArea className="flex-1" ref={scrollAreaRef}>
                                          <div className="p-4 space-y-4">
                                              {activeSession?.messages.map((msg, index) => (
                                                  <div key={index} className={cn("flex items-end gap-2", msg.role === 'user' ? 'justify-end' : '')}>
                                                      {msg.role === 'ai' && (
                                                           <Avatar className="h-10 w-10">
                                                              <AIBuddy
                                                                  className="w-full h-full"
                                                                  color={customizations.color}
                                                                  hat={customizations.hat}
                                                                  shirt={customizations.shirt}
                                                                  shoes={customizations.shoes}
                                                              />
                                                          </Avatar>
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
                                                      <Avatar className="h-10 w-10">
                                                          <AIBuddy
                                                              className="w-full h-full"
                                                              color={customizations.color}
                                                              hat={customizations.hat}
                                                              shirt={customizations.shirt}
                                                              shoes={customizations.shoes}
                                                          />
                                                      </Avatar>
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
                                                  <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full", isListening && "bg-red-500/20 text-red-500")} onClick={activateVoiceInput}>
                                                      {isListening ? <Hand className="h-4 w-4" /> : <Mic className="h-4 w-4"/>}
                                                  </Button>
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
                          className="flex items-end gap-2"
                      >
                           <div className="bg-card border p-4 rounded-xl shadow-lg mb-2 relative">
                              <p className="font-semibold">Hello {user.displayName?.split(' ')[0] || 'there'}!</p>
                              <p className="text-sm text-muted-foreground">Chat with me at any time.</p>
                               <div className="absolute right-[-9px] bottom-4 w-3 h-3 bg-card border-b border-r transform rotate-45"></div>
                          </div>
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
           <Dialog open={isNoteDialogOpen} onOpenChange={setNoteDialogOpen}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Save Chat as Note</DialogTitle>
                      <DialogDescription>Review the generated note and assign it to a course.</DialogDescription>
                  </DialogHeader>
                   {noteGenerationLoading ? (
                      <div className="py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div>
                  ) : (
                      <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                              <Label htmlFor="note-title">Title</Label>
                              <Input id="note-title" value={generatedNoteTitle} onChange={(e) => setGeneratedNoteTitle(e.target.value)} />
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="note-content">Content</Label>
                              <Textarea id="note-content" value={generatedNoteContent} onChange={(e) => setGeneratedNoteContent(e.target.value)} className="h-32"/>
                          </div>
                           <div className="grid gap-2">
                              <Label htmlFor="note-course">Assign to Course (Optional)</Label>
                              <Select value={selectedNoteCourseId} onValueChange={setSelectedNoteCourseId}>
                                  <SelectTrigger id="note-course">
                                      <SelectValue placeholder="Select a course"/>
                                  </SelectTrigger>
                                  <SelectContent>
                                      {courses.map(course => (
                                          <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                  )}
                  <DialogFooter>
                      <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                      <Button onClick={handleSaveNote} disabled={noteGenerationLoading}>Save Note</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      </div>
    </>
  );
}
