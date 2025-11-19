'use client';

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Plus, Edit, Trash2, FileText, Home, Phone, ChevronRight, HelpCircle, Search, Calendar, Lightbulb, Sparkles, Upload, User, Award, Gem, Copy, RefreshCw, ChevronLeft, CheckCircle, XCircle, ArrowRight, BrainCircuit, Bot, MoreVertical, Link as LinkIcon, Share2, Maximize, Minimize, NotebookText, Download, Eraser, Mic, Hand, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, updateDoc, Timestamp, deleteDoc, orderBy, getDoc, arrayUnion } from 'firebase/firestore';
import { studyPlannerAction, generateChatTitle, generateNoteFromChat, analyzeImage, generateQuizAction } from '@/lib/actions';
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
import type { GenerateQuizOutput, GenerateQuizInput, QuizQuestion } from '@/ai/schemas/quiz-schema';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from './ui/dropdown-menu';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Skeleton } from './ui/skeleton';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  streaming?: boolean;
  quizParams?: Omit<GenerateQuizInput, 'numQuestions' | 'difficulty'> & { numQuestions: number; difficulty: 'Easy' | 'Medium' | 'Hard' };
  quizTitle?: string;
  timestamp?: number;
  interactiveQuiz?: GenerateQuizOutput;
  quizState?: {
    currentQuestionIndex: number;
    answers: Record<number, string>;
    score: number;
    isComplete: boolean;
  }
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

type QuizState = 'configuring' | 'in-progress' | 'results';
type AnswerState = 'unanswered' | 'answered';
type AnswerFeedback = { question: string; answer: string; correctAnswer: string; isCorrect: boolean; explanation?: string; };

export const FloatingChatContext = createContext({
  openChatWithVoice: () => {},
  openChatWithPrompt: (prompt: string) => {},
});

const ChatHomeScreen = ({ sessions, onNavigate, onStartNewChat, onSelectSession, onStartChatWithPrompt, customizations, tazSpecies }: { sessions: ChatSession[], onNavigate: (tab: string) => void, onStartNewChat: () => void, onSelectSession: (sessionId: string) => void, onStartChatWithPrompt: (prompt: string) => void, customizations: Record<string, string>, tazSpecies?: string }) => {
    const [user] = useAuthState(auth);

    const conversationStarters = [
        { icon: <FileText className="h-5 w-5" />, text: "Generate summary about this material" },
        { icon: <BrainCircuit className="h-5 w-5" />, text: "Explain the difficult parts of this" },
        { icon: <Lightbulb className="h-5 w-5" />, text: "Generate study questions for this" },
    ];

    return (
        <div className="flex flex-col h-full bg-muted/30">
             <div className="p-4 flex justify-between items-center">
                <h2 className="text-lg font-bold">Home</h2>
                <Button size="sm" onClick={onStartNewChat}><Plus className="w-4 h-4 mr-2" /> New Chat</Button>
            </div>
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-8">
                     <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl min-h-[300px]">
                        <div style={{ width: '150px', height: '150px' }}>
                           <AIBuddy {...customizations} species={tazSpecies} className="w-full h-full" />
                        </div>
                        <h3 className="font-semibold text-lg">Hello, {user?.displayName?.split(' ')[0] || 'there'}!</h3>
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
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-center">AI Toolkit</h2>
            </div>
            <ScrollArea className="flex-1 p-4 space-y-6">
                <button className="w-full text-left bg-card p-4 rounded-lg border hover:bg-muted" onClick={() => onStartChatWithPrompt("Generate a 3 question multiple choice quiz about photosynthesis.")}>
                    <div className="flex items-start gap-3">
                         <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Lightbulb/></div>
                        <div>
                            <h3 className="font-semibold">Quick Quiz</h3>
                            <p className="text-sm text-muted-foreground">Generate a short quiz on any topic.</p>
                        </div>
                    </div>
                </button>
                <button className="w-full text-left bg-card p-4 rounded-lg border hover:bg-muted" onClick={() => onStartChatWithPrompt("Create flashcards for these terms: Mitosis, Meiosis, Cytokinesis.")}>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Copy/></div>
                        <div>
                            <h3 className="font-semibold">Flashcard Factory</h3>
                            <p className="text-sm text-muted-foreground">Turn notes or concepts into a deck of flashcards.</p>
                        </div>
                    </div>
                </button>
                <button className="w-full text-left bg-card p-4 rounded-lg border hover:bg-muted" onClick={() => onStartChatWithPrompt("I need help with my homework, I'm uploading an image.")}>
                    <div className="flex items-start gap-3">
                         <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><BrainCircuit/></div>
                        <div>
                            <h3 className="font-semibold">AI Tutor</h3>
                            <p className="text-sm text-muted-foreground">Upload an image of your homework for a walkthrough.</p>
                        </div>
                    </div>
                </button>
            </ScrollArea>
        </div>
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

interface FloatingChatProps {
    children: React.ReactNode;
    isHidden?: boolean;
    isEmbedded?: boolean;
}

const InteractiveQuiz = ({ message, onUpdateQuizState }: { message: Message, onUpdateQuizState: (newState: Partial<Message['quizState']>) => void }) => {
    const quiz = message.interactiveQuiz;
    const quizState = message.quizState;

    if (!quiz || !quizState) return null;

    const currentQuestion = quiz.questions[quizState.currentQuestionIndex];
    const selectedAnswer = quizState.answers[quizState.currentQuestionIndex];
    const isSubmitted = !!selectedAnswer;
    
    if (!currentQuestion) {
        // This might happen if the quiz data is malformed
        return <div className="p-4 text-red-500">Error: Could not load question.</div>;
    }
    // FIX 1: Changed .answer to .correctAnswer
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const handleAnswerSelect = (answer: string) => {
        if (isSubmitted) return;
        const newAnswers = { ...quizState.answers, [quizState.currentQuestionIndex]: answer };
        onUpdateQuizState({ answers: newAnswers });
    };

    const handleSubmit = () => {
        if (!selectedAnswer) return;
        const newScore = isCorrect ? quizState.score + 1 : quizState.score;
        onUpdateQuizState({ score: newScore });
    };

    const handleNext = () => {
        if (quizState.currentQuestionIndex < quiz.questions.length - 1) {
            onUpdateQuizState({ currentQuestionIndex: quizState.currentQuestionIndex + 1 });
        } else {
            onUpdateQuizState({ isComplete: true });
        }
    };
    
    if (quizState.isComplete) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <h3 className="text-2xl font-bold">Quiz Complete!</h3>
                <p className="text-5xl font-bold my-4">{quizState.score}/{quiz.questions.length}</p>
                <p className="text-muted-foreground">You can now close this quiz.</p>
            </div>
        )
    }

    return (
        <div className="bg-muted h-full flex flex-col p-6 rounded-l-2xl">
            <h3 className="text-xl font-bold mb-2">{quiz.quizTitle}</h3>
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-6">
                <span>Question {quizState.currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <span>Score: {quizState.score}</span>
            </div>
            <p className="font-semibold mb-4">{currentQuestion.questionText}</p>
            <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                    <Label 
                        key={index} 
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer",
                            // FIX 2: Changed .answer to .correctAnswer
                            isSubmitted && option === currentQuestion.correctAnswer && "border-green-500 bg-green-500/10",
                            isSubmitted && selectedAnswer === option && !isCorrect && "border-red-500 bg-red-500/10",
                            !isSubmitted && selectedAnswer === option && "border-primary bg-primary/10",
                            !isSubmitted && "hover:bg-background"
                        )}
                    >
                        <RadioGroupItem value={option} onClick={() => handleAnswerSelect(option)} disabled={isSubmitted} />
                        {option}
                        {/* FIX 3: Changed .answer to .correctAnswer */}
                        {isSubmitted && option === currentQuestion.correctAnswer && <CheckCircle className="h-5 w-5 text-green-500 ml-auto"/>}
                        {isSubmitted && selectedAnswer === option && !isCorrect && <XCircle className="h-5 w-5 text-red-500 ml-auto"/>}
                    </Label>
                ))}
            </div>
            <div className="mt-auto pt-6 flex justify-end">
                {isSubmitted ? (
                    <Button onClick={handleNext}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={!selectedAnswer}>Check Answer</Button>
                )}
            </div>
        </div>
    );
};

export default function FloatingChat({ children, isHidden, isEmbedded }: FloatingChatProps) {
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
  const [tazSpecies, setTazSpecies] = useState<string | undefined>(undefined);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  
  const [isNoteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteGenerationLoading, setNoteGenerationLoading] = useState(false);
  const [generatedNoteTitle, setGeneratedNoteTitle] = useState('');
  const [generatedNoteContent, setGeneratedNoteContent] = useState('');
  const [selectedNoteCourseId, setSelectedNoteCourseId] = useState<string | undefined>(undefined);

  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
        
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setTazSpecies(data.taz?.species);
            }
        });
        return () => unsubscribeUser();
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
  }, [activeSession?.messages, isOpen, isLoading]);

  const createNewSession = async (prompt?: string): Promise<string> => {
    if (!user || isSessionCreating) return '';
    setIsSessionCreating(true);
    
    const newSessionData = {
        title: prompt ? "New Chat" : "New Chat",
        messages: [{ role: 'model', content: `Hey ${user.displayName?.split(' ')[0] || 'there'}! How can I help?`, id: crypto.randomUUID() }],
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
  
    if (!currentSessionId) {
      const newId = await createNewSession(messageContent);
      if (!newId) return;
      currentSessionId = newId;
    }
  
    const userMessage: Message = { role: 'user', content: messageContent, id: crypto.randomUUID() };
    
    const sessionRef = doc(db, "chatSessions", currentSessionId);
    await updateDoc(sessionRef, {
        messages: arrayUnion(userMessage),
        timestamp: Timestamp.now()
    });
    
    setInput('');
    setIsLoading(true);
  
    try {
        const currentSessionDoc = await getDoc(sessionRef);
        const currentSession = {id: currentSessionDoc.id, ...currentSessionDoc.data()} as ChatSession;
        
        const historyForAI: { role: 'user' | 'model'; content: string }[] = currentSession?.messages.map(({ role, content }) => ({ role, content })) || [];
        
        const q = query(collection(db, "calendarEvents"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const calendarEventsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CalendarEvent));
        const learnerType = localStorage.getItem('learnerType');
        const aiBuddyName = localStorage.getItem('aiBuddyName') || 'Taz';
    
        const response = await studyPlannerAction({
            userName: user?.displayName?.split(' ')[0],
            aiBuddyName: aiBuddyName,
            history: historyForAI,
            learnerType: learnerType || undefined,
            allCourses: courses.map(c => ({ id: c.id, name: c.name, description: c.description })),
            courseContext: activeSession?.courseContext || undefined,
            calendarEvents: calendarEventsData.map(e => ({
                id: e.id,
                date: e.date,
                title: e.title,
                time: e.startTime,
                type: e.type,
                description: e.description,
            })),
        });

        const aiTextResponse = response.text || '';
        const toolRequest = response.tool_requests?.[0];

        let aiMessage: Message | null = null;
        if (toolRequest && toolRequest.name === 'generateQuizTool') {
            const quizParams = toolRequest.input;
            aiMessage = {
                id: crypto.randomUUID(),
                role: 'model',
                content: aiTextResponse,
                quizParams: quizParams,
                quizTitle: `Practice Quiz: ${quizParams.topic}`,
                timestamp: Date.now(),
            };
        } else if (aiTextResponse) {
             aiMessage = {role: 'model', content: aiTextResponse, id: crypto.randomUUID()};
        }
        
        if (aiMessage) {
            await updateDoc(sessionRef, {
                messages: arrayUnion(aiMessage),
                timestamp: Timestamp.now(),
            });
        }
        
        if (currentSession && !currentSession.titleGenerated && (currentSession.messages.length || 0) <= 2) {
            generateChatTitle({ messages: currentSession.messages }).then(({title}) => {
                updateDoc(sessionRef, { title, titleGenerated: true });
            });
        }
    } catch (error) {
        console.error(error);
        const errorMessage = "Sorry, I had trouble generating a response. Please try again.";
        const botErrorMsg: Message = { id: crypto.randomUUID(), role: 'model', content: errorMessage };
        await updateDoc(sessionRef, { messages: arrayUnion(botErrorMsg) });
    } finally {
        setIsLoading(false);
    }
  };


  const handleStartChatWithPrompt = async (prompt: string) => {
    setIsOpen(true);
    setActiveTab('conversation');
    const newSessionId = await createNewSession(prompt);
    if (newSessionId) {
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
    toast({ title: 'Chat Exported!' });
  };
  
  const handleClearConversation = async () => {
    if (!activeSessionId || !user) return;
    try {
        const sessionRef = doc(db, 'chatSessions', activeSessionId);
        await updateDoc(sessionRef, {
            messages: [{ role: 'model', content: `Hey ${user.displayName?.split(' ')[0] || 'there'}! How can I help?`, id: crypto.randomUUID() }]
        });
        toast({ title: 'Chat Cleared' });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not clear the chat.' });
    }
  };

  const openChatWithVoice = () => {
    setIsOpen(true);
    setActiveTab('conversation');

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Voice input not supported in this browser.' });
      return;
    }
  };
  
  const handleOpenInteractiveQuiz = async (messageId: string, params: NonNullable<Message['quizParams']>) => {
    if (!activeSessionId) return;
    const sessionRef = doc(db, 'chatSessions', activeSessionId);
    
    // Clear old quiz state first
    let tempMessages = activeSession?.messages.map(m => ({ ...m, interactiveQuiz: undefined, quizState: undefined })) || [];
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: tempMessages } : s));

    try {
        const quiz = await generateQuizAction({
            topic: params.topic,
            numQuestions: params.numQuestions,
            difficulty: params.difficulty,
        });

        const updatedMessages = tempMessages.map(m => 
            m.id === messageId ? { 
                ...m, 
                interactiveQuiz: quiz,
                quizState: {
                    currentQuestionIndex: 0,
                    answers: {},
                    score: 0,
                    isComplete: false,
                }
            } : m
        );
        
        await updateDoc(sessionRef, { messages: updatedMessages });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate quiz.'});
    }
  };

  const updateQuizState = async (messageId: string, newState: Partial<Message['quizState']>) => {
    if (!activeSessionId) return;
    const sessionRef = doc(db, 'chatSessions', activeSessionId);
    
    const currentMessages = sessions.find(s => s.id === activeSessionId)?.messages || [];

    const updatedMessages = currentMessages.map(m => 
        m.id === messageId ? { 
            ...m, 
            quizState: { ...(m.quizState!), ...newState }
        } : m
    );

    setSessions(prev => prev.map(s => s.id === activeSessionId ? {...s, messages: updatedMessages} : s));
    await updateDoc(sessionRef, { messages: updatedMessages });
  }

  
  const TabButton = ({ name, icon, currentTab, setTab }: {name: string, icon: React.ReactNode, currentTab: string, setTab: (tab:string) => void}) => (
    <button onClick={() => setTab(name.toLowerCase())} className={cn(
        "flex flex-col items-center gap-1 p-2 flex-1 rounded-lg transition-colors",
        currentTab === name.toLowerCase() ? "text-primary" : "text-muted-foreground hover:bg-muted"
    )}>
        {icon}
        <span className="text-xs font-medium">{name}</span>
    </button>
  );

  const QuizCard = ({ title, timestamp, onOpen }: { title: string, timestamp: number, onOpen: () => void }) => {
    return (
        <div className="bg-muted p-4 rounded-xl border">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-background rounded-lg border">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold">{title}</h4>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</p>
                </div>
                <Button size="sm" onClick={onOpen}>Open</Button>
            </div>
        </div>
    )
  };


  const ChatComponent = (
    <AnimatePresence>
        {isOpen && (
             <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "bg-card rounded-2xl shadow-2xl border flex flex-col origin-bottom-right",
                    isFullscreen 
                        ? "fixed inset-0 z-50" 
                        : "w-96 h-[600px]"
                )}
            >
                {isFullscreen && activeSession?.messages.some(m => m.interactiveQuiz && !m.quizState?.isComplete) ? (
                    <div className="flex-1 h-full overflow-hidden grid grid-cols-5">
                        <div className="col-span-2 flex flex-col h-full overflow-hidden">
                           <header className="p-2 border-b flex items-center justify-between gap-2">
                                <div className="flex-1 flex items-center gap-2 overflow-hidden">
                                    <div className="flex-1 truncate">
                                        <h3 className="font-semibold text-sm truncate">{activeSession?.title || 'Taz is Thinking'}</h3>
                                        {activeSession?.courseContext && <p className="text-xs text-muted-foreground truncate">Focus: {courses.find(c => c.id === activeSession.courseId)?.name}</p>}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(false)}>
                                    <Minimize className="h-4 w-4" />
                                </Button>
                            </header>
                             <ScrollArea className="flex-1" viewportRef={scrollAreaRef}>
                                {/* Chat history rendered here... */}
                            </ScrollArea>
                            {/* Chat input rendered here... */}
                        </div>
                         <div className="col-span-3 border-l">
                            <InteractiveQuiz 
                                message={activeSession.messages.find(m => m.interactiveQuiz && !m.quizState?.isComplete)!}
                                onUpdateQuizState={(newState) => updateQuizState(activeSession.messages.find(m => m.interactiveQuiz && !m.quizState?.isComplete)!.id, newState)}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {activeTab === 'home' && <ChatHomeScreen sessions={sessions} onNavigate={setActiveTab} onStartNewChat={createNewSession} onSelectSession={(id) => { setActiveSessionId(id); setActiveTab('conversation'); }} onStartChatWithPrompt={handleStartChatWithPrompt} customizations={customizations} tazSpecies={tazSpecies} />}
                            {activeTab === 'ai tools' && <AIToolsTab onStartChatWithPrompt={handleStartChatWithPrompt} />}
                            {activeTab === 'my stats' && <MyStatsTab />}
                            {activeTab === 'conversation' && (
                                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                                     <header className="p-2 border-b flex items-center justify-between gap-2">
                                        <div className="flex-1 flex items-center gap-2 overflow-hidden">
                                            <div className="flex-1 truncate">
                                                <h3 className="font-semibold text-sm truncate">{activeSession?.title || 'Taz is Thinking'}</h3>
                                                {activeSession?.courseContext && <p className="text-xs text-muted-foreground truncate">Focus: {courses.find(c => c.id === activeSession.courseId)?.name}</p>}
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(true)}>
                                            <Maximize className="h-4 w-4"/>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger><BrainCircuit className="mr-2 h-4 w-4" /><span>Focus on Course</span></DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal><DropdownMenuSubContent><DropdownMenuItem onSelect={() => handleSetCourseFocus(null)}>{ !activeSession?.courseId && <CheckCircle className="mr-2 h-4 w-4" />}<span>None</span></DropdownMenuItem><DropdownMenuSeparator />{courses.map(course => (<DropdownMenuItem key={course.id} onSelect={() => handleSetCourseFocus(course)}>{ activeSession?.courseId === course.id && <CheckCircle className="mr-2 h-4 w-4" />}{course.name}</DropdownMenuItem>))}</DropdownMenuSubContent></DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuItem onSelect={handleExportConversation}><Download className="mr-2 h-4 w-4" /><span>Export Conversation</span></DropdownMenuItem>
                                                <DropdownMenuItem onSelect={handleOpenNoteDialog}><NotebookText className="mr-2 h-4 w-4" /><span>Save as Note</span></DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <AlertDialog><AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}><Eraser className="mr-2 h-4 w-4"/> Clear Conversation</DropdownMenuItem></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Clear Conversation?</AlertDialogTitle><AlertDialogDescription>This will remove all messages from this chat session.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleClearConversation}>Clear</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                                <AlertDialog><AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete Chat</DropdownMenuItem></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you absolutely sure you want to delete this chat?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => activeSessionId && handleDeleteSession(activeSessionId)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </header>
                                    <ScrollArea className="flex-1" viewportRef={scrollAreaRef}>
                                        <div className="p-4 space-y-4">
                                            {activeSession?.messages.map((msg, index) => {
                                                if (msg.quizParams && !msg.interactiveQuiz) {
                                                    return <QuizCard key={msg.id} title={msg.quizTitle || 'Practice Quiz'} timestamp={msg.timestamp || Date.now()} onOpen={() => handleOpenInteractiveQuiz(msg.id, msg.quizParams!)} />;
                                                }
                                                return (
                                                    <div key={msg.id || index} className={cn("flex items-end gap-2", msg.role === 'user' ? 'justify-end' : '')}>
                                                        {msg.role === 'model' && <Avatar className="h-10 w-10"><AIBuddy className="w-full h-full" {...customizations} species={tazSpecies} /></Avatar>}
                                                        <div className={cn( "p-3 rounded-2xl max-w-[80%] text-sm prose dark:prose-invert prose-p:my-0 prose-headings:my-0 prose-table:my-0", msg.role === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none" )}>
                                                             {msg.interactiveQuiz ? (
                                                                <InteractiveQuiz message={msg} onUpdateQuizState={(newState) => updateQuizState(msg.id, newState)} />
                                                            ) : (
                                                                msg.streaming && msg.content === '' ? '...' : <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                             {isLoading && (
                                                <div className="flex items-end gap-2">
                                                    <Avatar className="h-10 w-10"><AIBuddy className="w-full h-full" {...customizations} species={tazSpecies} /></Avatar>
                                                    <div className="p-3 rounded-2xl max-w-[80%] text-sm bg-muted rounded-bl-none animate-pulse">
                                                        Taz is thinking...
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                    <footer className="p-4 border-t space-y-2">
                                        
                                        <div className="relative">
                                            <Input placeholder="Ask anything..." className="pr-20 rounded-full" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} disabled={isLoading} />
                                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={openChatWithVoice}><Mic className="h-4 w-4"/></Button>
                                                <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => handleSendMessage()} disabled={isLoading}><Send className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    </footer>
                                </div>
                            )}
                        </div>

                        <div className="border-t p-2 flex justify-around bg-card rounded-b-2xl">
                           <TabButton name="Home" icon={<Home />} currentTab={activeTab} setTab={setActiveTab} />
                           <TabButton name="Conversation" icon={<MessageSquare />} currentTab={activeTab} setTab={setActiveTab} />
                           <TabButton name="AI Tools" icon={<Sparkles />} currentTab={activeTab} setTab={setActiveTab} />
                           <TabButton name="My Stats" icon={<Award />} currentTab={activeTab} setTab={setActiveTab} />
                        </div>
                    </>
                )}
            </motion.div>
        )}
    </AnimatePresence>
  );

  return (
    <FloatingChatContext.Provider value={{ openChatWithVoice, openChatWithPrompt: handleStartChatWithPrompt }}>
      {children}
      {!isHidden && (
        isEmbedded ? ChatComponent : (
            <div className="fixed bottom-6 right-6 z-50">
                {ChatComponent}
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
                                    <AIBuddy {...customizations} species={tazSpecies} />
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
        ))
      }
    </FloatingChatContext.Provider>
  );
}