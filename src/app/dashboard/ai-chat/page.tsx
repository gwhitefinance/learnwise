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
            const { id, ...rest } = data as any;  // <-- Remove id from data to prevent duplicate key
            return {
                id: doc.id,
                ...rest,
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
      const calendarEvents = querySnapshot.docs.map(doc => doc.data() as CalendarEvent);

      const response = await studyPlannerFlow({
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
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 p-4 flex flex-col">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-lg">Chats</h2>
          <Button size="sm" onClick={createNewSession} aria-label="New Chat"><Plus size={16} /></Button>
        </div>

        <nav className="flex flex-col space-y-2 overflow-y-auto flex-grow">
          {sessions.map(session => (
            <div key={session.id} className={cn("flex items-center justify-between p-2 rounded cursor-pointer", session.id === activeSessionId ? 'bg-blue-100' : 'hover:bg-gray-100')} onClick={() => setActiveSessionId(session.id)}>
              {editingSessionId === session.id ? (
                <input
                  value={renameInput}
                  onChange={e => setRenameInput(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') setEditingSessionId(null);
                  }}
                  className="flex-grow border border-gray-300 rounded px-2 py-1"
                  autoFocus
                />
              ) : (
                <span className="flex-grow truncate">{session.title}</span>
              )}
              <div className="flex space-x-2">
                <button onClick={e => { e.stopPropagation(); startRename(session); }} aria-label="Rename chat">
                  <Edit size={14} />
                </button>
                <button onClick={e => { e.stopPropagation(); handleDeleteSession(session.id); }} aria-label="Delete chat">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Chat Area */}
      <main className="flex flex-col flex-grow p-4">
        <div className="flex-grow overflow-y-auto" ref={scrollAreaRef}>
          {activeSession?.messages.map((msg, idx) => (
            <div key={idx} className={cn("flex mb-4", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn("rounded px-4 py-2 max-w-[60%]", msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black')}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded px-4 py-2 max-w-[60%] bg-gray-200 text-black animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2 mt-4"
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            aria-label="Message input"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} aria-label="Send message">
            <Send size={16} />
          </Button>
        </form>
      </main>
    </div>
  );
}
