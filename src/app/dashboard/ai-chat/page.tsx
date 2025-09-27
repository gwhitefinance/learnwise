

'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, Bot, Plus, MessageSquare, Trash2, Edit, Home, Upload, Share2, MoreHorizontal, ChevronDown } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, onSnapshot, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { studyPlannerFlow, generateChatTitle } from '@/lib/actions';
import AIBuddy from '@/components/ai-buddy';

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
    id?: string; // optional here, since we use doc.id instead
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
  const [customizations, setCustomizations] = useState<Record<string, string>>({});


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/signup');
        return;
    }

    const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
    if(savedCustomizations) {
        setCustomizations(JSON.parse(savedCustomizations));
    }

    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
      setLearnerType(storedLearnerType);
    }
    
    // Set up a real-time listener for chat sessions
    const q = query(collection(db, "chatSessions"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userSessions = querySnapshot.docs.map(doc => {
            const data = doc.data() as FirestoreChatSession;
            const { id, ...rest } = data as any;  // <-- Remove id from data to prevent duplicate key
            return {
                id: doc.id,
                ...rest,
                timestamp: data.timestamp.toMillis()
            } as ChatSession;
        });

        // Sort on the client side
        userSessions.sort((a, b) => b.timestamp - a.timestamp);

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
    let initialMessage = `Hey ${user.displayName?.split(' ')[0] || 'there'} - what's good?`;
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

    const newSessionData: any = {
        title: title,
        messages: [{ role: 'ai', content: initialMessage }],
        timestamp: new Date(),
        titleGenerated: !!courseIdParam,
        userId: user.uid,
    };

    if (courseContext) {
      newSessionData.courseContext = courseContext;
    }
    
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
    
    // Immediately update the UI with the user's message and set loading state
    setSessions(sessions.map(s => s.id === activeSessionId ? { ...activeSession, messages: updatedMessages } : s));
    setInput('');
    setIsLoading(true);

    try {
      const q = query(collection(db, "calendarEvents"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const calendarEvents = querySnapshot.docs.map(doc => {
          const data = doc.data() as CalendarEvent;
          return { id: doc.id, ...data };
      });

      const response = await studyPlannerFlow({
        userName: user.displayName?.split(' ')[0],
        history: updatedMessages,
        learnerType: learnerType || undefined,
        courseContext: activeSession.courseContext || undefined,
        calendarEvents: calendarEvents
          .filter(e => e.type !== 'Project') // Filter out 'Project' type to match expected type
          .map(e => ({
            id: e.id,
            date: e.date,
            title: e.title,
            time: e.startTime,
            type: e.type as 'Test' | 'Homework' | 'Quiz' | 'Event', // cast to expected type
            description: e.description,
        })),
      });

      const aiMessage: Message = { role: 'ai', content: response };
      const finalMessages = [...updatedMessages, aiMessage];
      
      // The real-time listener will handle updating the UI, so we just update Firestore.
      // We set isLoading to false *before* the update to prevent a race condition.
      setIsLoading(false);

      const sessionRef = doc(db, "chatSessions", activeSession.id);
      await updateDoc(sessionRef, { messages: finalMessages });

      if (!activeSession.titleGenerated && activeSession.messages.length <= 2) {
          const { title } = await generateChatTitle({ messages: finalMessages });
          await updateDoc(sessionRef, { title, titleGenerated: true });
      }

    } catch (error) {
      console.error(error);
      setIsLoading(false); // Ensure loading is false on error
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
      });
       // Revert optimistic update on error by restoring the original session state
       setSessions(sessions.map(s => s.id === activeSessionId ? activeSession : s));
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
          setActiveSessionId(null);
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete chat.'});
    }
  };
  
  return (
    <div className="flex h-[calc(100vh_-_80px)] bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-72 bg-muted/40 p-2 flex-col border-r hidden md:flex">
        <div className="p-2 flex justify-between items-center">
            <Link href="/dashboard">
                <Button variant="ghost" size="icon"><Home className="h-5 w-5"/></Button>
            </Link>
            <h2 className="text-lg font-semibold">Chats</h2>
            <Button variant="ghost" size="icon" onClick={createNewSession}><Plus className="h-5 w-5"/></Button>
        </div>
        <ScrollArea className="flex-1">
            <div className="space-y-1">
                {sessions.map(session => (
                    <div key={session.id} className="group relative">
                        {editingSessionId === session.id ? (
                            <Input 
                                value={renameInput} 
                                onChange={(e) => setRenameInput(e.target.value)} 
                                onBlur={handleRename}
                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                autoFocus
                                className="h-10"
                            />
                        ) : (
                            <Button 
                                variant={activeSessionId === session.id ? "secondary" : "ghost"}
                                className="w-full justify-start h-10 truncate"
                                onClick={() => setActiveSessionId(session.id)}
                            >
                                <MessageSquare className="h-4 w-4 mr-2"/>
                                {session.title}
                            </Button>
                        )}
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startRename(session)}><Edit className="h-4 w-4"/></Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Delete Chat?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                        <Button variant="destructive" onClick={() => handleDeleteSession(session.id)}>Delete</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
         <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">LearnWise AI</h2>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
            {activeSession?.messages.map((message, index) => (
              <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? "ml-auto justify-end" : "justify-start")}>
                {message.role === 'ai' && (
                    <Avatar className="h-12 w-12">
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-full">
                             <AIBuddy
                                className="w-16 h-16"
                                color={customizations.color}
                                hat={customizations.hat}
                                shirt={customizations.shirt}
                                shoes={customizations.shoes}
                            />
                        </div>
                    </Avatar>
                )}
                <div className={cn(
                    "p-4 rounded-lg max-w-xl",
                    message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                     <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-full">
                         <AIBuddy
                            className="w-16 h-16"
                            color={customizations.color}
                            hat={customizations.hat}
                            shirt={customizations.shirt}
                            shoes={customizations.shoes}
                        />
                    </div>
                </Avatar>
                <div className="bg-muted rounded-lg p-4">
                  <p className="animate-pulse">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <div className="relative max-w-3xl mx-auto">
            <Input
              placeholder="Ask anything..."
              className="pr-24 rounded-full h-12 text-base"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                 <Button variant="outline" size="icon" className="rounded-full h-9 w-9 p-0"><Upload className="h-4 w-4"/></Button>
                <Button className="rounded-full h-9 w-9 p-0" onClick={handleSendMessage} disabled={isLoading || !activeSessionId}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

