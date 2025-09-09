
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, Bot, Plus, MessageSquare, Trash2, Edit, Home } from "lucide-react";
import { studyPlannerFlow } from '@/ai/flows/study-planner-flow';
import { generateChatTitle } from '@/ai/flows/chat-title-flow';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, onSnapshot, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
    courseContext?: string;
    titleGenerated?: boolean;
    userId?: string;
}

interface FirestoreChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: Timestamp;
    courseContext?: string;
    titleGenerated?: boolean;
    userId?: string;
}

type Course = {
    id: string;
    name: string;
    description?: string;
};

// This now refers to the Firestore event structure
type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  startTime: string;
  type: 'Test' | 'Homework' | 'Quiz' | 'Event' | 'Project';
  description: string;
};


export default function AiChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/signup');
        return;
    }

    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
      setLearnerType(storedLearnerType);
    }
    
    // Set up a real-time listener for chat sessions
    const q = query(collection(db, "chatSessions"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userSessions = querySnapshot.docs.map(doc => {
            const data = doc.data() as FirestoreChatSession;
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp.toMillis()
            } as ChatSession;
        });
        setSessions(userSessions);

        // If no active session, or active one was deleted, set a new one.
        if (!activeSessionId && userSessions.length > 0) {
             setActiveSessionId(userSessions[0].id);
        } else if (userSessions.length === 0) {
            createNewSession();
        }
    });

    return () => unsubscribe();

  }, [user, authLoading, router]);

  
  useEffect(() => {
    if(scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const createNewSession = async () => {
    if (!user) return;
    
    const courseIdParam = searchParams.get('courseId');
    let initialMessage = 'Hi there! How can I assist you today with your studies?';
    let courseContext: string | undefined = undefined;
    let title = "New Chat";

    if (courseIdParam) {
        const docRef = doc(db, "courses", courseIdParam);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const currentCourse = docSnap.data() as Course;
            if(currentCourse) {
                 courseContext = `Course: ${currentCourse.name}. Description: ${currentCourse.description || 'No description available.'}`;
                initialMessage = `Hello! I see you're working on ${currentCourse.name}. How can I help you with this course?`;
                title = `${currentCourse.name} Chat`;
            }
        }
    }

    const newSessionData = {
        title: title,
        messages: [{ role: 'ai', content: initialMessage }],
        timestamp: new Date(),
        courseContext,
        titleGenerated: !!courseIdParam,
        userId: user.uid,
    };
    
    try {
        const docRef = await addDoc(collection(db, "chatSessions"), newSessionData);
        setActiveSessionId(docRef.id);
    } catch(e) {
        console.error("Error creating new session: ", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start a new chat.'})
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !activeSession || !user) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...activeSession.messages, userMessage];
    
    // Optimistically update UI
    const tempSession = { ...activeSession, messages: updatedMessages };
    setSessions(sessions.map(s => s.id === activeSessionId ? tempSession : s));
    setInput('');
    setIsLoading(true);

    try {
      const q = query(collection(db, "calendarEvents"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const calendarEvents = querySnapshot.docs.map(doc => doc.data() as CalendarEvent);

      const response = await studyPlannerFlow({
        history: updatedMessages,
        learnerType: learnerType || undefined,
        courseContext: activeSession.courseContext || undefined,
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
      
      const sessionRef = doc(db, "chatSessions", activeSession.id);
      await updateDoc(sessionRef, { messages: finalMessages });

      if (!activeSession.titleGenerated && activeSession.messages.length <= 2) {
          const { title } = await generateChatTitle({ messages: finalMessages });
          await updateDoc(sessionRef, { title, titleGenerated: true });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
      });
       // Revert optimistic update on error
       setSessions(sessions.map(s => s.id === activeSessionId ? activeSession : s));
    } finally {
      setIsLoading(false);
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
    try {
        await deleteDoc(doc(db, "chatSessions", sessionId));
        toast({ title: 'Chat deleted.' });
        if (activeSessionId === sessionId) {
            const remainingSessions = sessions.filter(s => s.id !== sessionId);
            if (remainingSessions.length > 0) {
                setActiveSessionId(remainingSessions[0].id);
            } else {
                createNewSession();
            }
        }
    } catch(error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete chat.'});
    }
  }

  return (
    <div className="flex h-screen bg-muted/40">
        <div className="hidden md:flex flex-col w-72 bg-background border-r">
             <div className="p-4 border-b flex justify-between items-center">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon"><Home className="h-5 w-5"/></Button>
                </Link>
                <h2 className="text-lg font-semibold">My Chats</h2>
                <Button variant="ghost" size="icon" onClick={createNewSession}>
                    <Plus className="h-5 w-5"/>
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {sessions.map(session => (
                         <div key={session.id} className="relative group">
                            <button
                                onClick={() => setActiveSessionId(session.id)}
                                className={cn(
                                    "w-full text-left p-2 rounded-md truncate text-sm flex items-center gap-2",
                                    activeSessionId === session.id ? 'bg-muted font-semibold' : 'hover:bg-muted'
                                )}
                            >
                                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                {editingSessionId === session.id ? (
                                     <Input
                                        value={renameInput}
                                        onChange={(e) => setRenameInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                        onBlur={handleRename}
                                        autoFocus
                                        className="h-7 text-sm"
                                    />
                                ) : (
                                    <span className="truncate flex-1">{session.title}</span>
                                )}
                            </button>
                            {editingSessionId !== session.id && (
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-muted">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startRename(session)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Delete Chat?</DialogTitle>
                                                <DialogDescription>This will permanently delete "{session.title}". This action cannot be undone.</DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                                <Button variant="destructive" onClick={() => handleDeleteSession(session.id)}>Delete</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                         </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
        
        <div className="flex flex-col flex-1 h-screen">
            <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
                <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                    {activeSession?.messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        {message.role === 'ai' && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://picsum.photos/150/150" data-ai-hint="robot assistant" />
                                <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                        )}
                        <div className="max-w-md">
                            <div className={`text-xs font-semibold mb-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {message.role === 'ai' ? 'AI Assistant' : 'You'}
                            </div>
                            <div className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                        {message.role === 'user' && (
                            <Avatar className="h-8 w-8">
                            <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                            <AvatarFallback>
                                <User />
                            </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://picsum.photos/150/150" data-ai-hint="robot assistant" />
                                <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div className="max-w-md">
                                <div className="text-xs font-semibold mb-1">AI Assistant</div>
                                <div className="bg-background border rounded-lg p-3">
                                    <p className="animate-pulse">Thinking...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 border-t bg-background">
                <div className="relative max-w-4xl mx-auto">
                <Input
                    placeholder="Type your message here..."
                    className="pr-24 rounded-full"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                    disabled={isLoading}
                />
                <Button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full" onClick={handleSendMessage} disabled={isLoading || !activeSessionId}>
                    Send <Send className="ml-2 h-4 w-4" />
                </Button>
                </div>
            </div>
        </div>
    </div>
  );
}

    