
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, Bot, Plus, MessageSquare, Trash2, Edit, X, Check, Home } from "lucide-react";
import { studyPlannerFlow } from '@/ai/flows/study-planner-flow';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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
}

type Course = {
    id: string;
    name: string;
    description?: string;
};

// Simplified event type for what the AI expects
type AIEvent = {
  id: string;
  date: string;
  title: string;
  time: string;
  type: 'Test' | 'Homework' | 'Quiz' | 'Event';
  description: string;
};

// More detailed event type from the calendar page
type CalendarEvent = {
  id: string | number;
  date: string;
  title: string;
  startTime?: string;
  time?: string; // It could be either
  type: 'Test' | 'Homework' | 'Quiz' | 'Event';
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
  const courseId = searchParams.get('courseId');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');


  useEffect(() => {
    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
      setLearnerType(storedLearnerType);
    }

    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
    } else {
        createNewSession();
    }
    
    const lastActiveId = localStorage.getItem('activeChatSessionId');
    if(lastActiveId && sessions.find(s => s.id === lastActiveId)) {
        setActiveSessionId(lastActiveId);
    } else if (sessions.length > 0) {
        setActiveSessionId(sessions[0].id);
    }

  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
     if (activeSessionId) {
        localStorage.setItem('activeChatSessionId', activeSessionId);
    }
  }, [sessions, activeSessionId]);
  
  useEffect(() => {
    if(scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const createNewSession = () => {
    const newSessionId = `chat-${Date.now()}`;
    const courseIdParam = searchParams.get('courseId');
    
    let initialMessage = 'Hi there! How can I assist you today with your studies?';
    let courseContext: string | undefined = undefined;
    let title = "New Chat";

    if (courseIdParam) {
        const savedCourses = localStorage.getItem('courses');
        if (savedCourses) {
            try {
                const allCourses: Course[] = JSON.parse(savedCourses);
                const currentCourse = allCourses.find(c => c.id === courseIdParam);
                if (currentCourse) {
                    courseContext = `Course: ${currentCourse.name}. Description: ${currentCourse.description || 'No description available.'}`;
                    initialMessage = `Hello! I see you're working on ${currentCourse.name}. How can I help you with this course?`;
                    title = `${currentCourse.name} Chat`;
                }
            } catch (e) {
                console.error("Failed to parse courses from local storage", e);
            }
        }
    }

    const newSession: ChatSession = {
        id: newSessionId,
        title: title,
        messages: [{ role: 'ai', content: initialMessage }],
        timestamp: Date.now(),
        courseContext,
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !activeSession) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...activeSession.messages, userMessage];
    
    // Optimistically update UI
    setSessions(sessions.map(s => s.id === activeSessionId ? { ...s, messages: updatedMessages } : s));
    setInput('');
    setIsLoading(true);

    try {
      const savedEvents = localStorage.getItem('calendarEvents');
      let calendarEvents: CalendarEvent[] = [];
      if (savedEvents) {
        try {
            const parsedEvents = JSON.parse(savedEvents);
            if (Array.isArray(parsedEvents)) {
            calendarEvents = parsedEvents;
            }
        } catch (e) {
            console.error("Failed to parse calendar events", e);
        }
      }
      
      const serializableEvents: AIEvent[] = calendarEvents.map(e => ({
          id: String(e.id),
          date: new Date(e.date).toISOString(),
          title: e.title,
          time: e.time || e.startTime || 'All day',
          type: e.type,
          description: e.description,
      }));

      const response = await studyPlannerFlow({
        history: updatedMessages,
        learnerType: learnerType || undefined,
        courseContext: activeSession.courseContext || undefined,
        calendarEvents: serializableEvents,
      });

      const aiMessage: Message = { role: 'ai', content: response };
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...updatedMessages, aiMessage] } : s));

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
      });
       // Revert to the state before sending the message on error
       setSessions(sessions.map(s => s.id === activeSessionId ? { ...s, messages: activeSession.messages } : s));
    } finally {
      setIsLoading(false);
    }
  };
  
  const startRename = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setRenameInput(session.title);
  }

  const handleRename = () => {
    if (!editingSessionId || !renameInput.trim()) return;
    setSessions(sessions.map(s => s.id === editingSessionId ? { ...s, title: renameInput } : s));
    setEditingSessionId(null);
    setRenameInput('');
  };
  
  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    
    // If we deleted the active session, activate another one or create a new one
    if (activeSessionId === sessionId) {
        if(updatedSessions.length > 0) {
            setActiveSessionId(updatedSessions[0].id);
        } else {
            createNewSession();
        }
    }
    toast({ title: 'Chat deleted.' });
  }

  return (
    <div className="flex h-screen bg-muted/40">
        {/* Chat History Sidebar */}
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
        
        {/* Main Chat Area */}
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
                <Button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full" onClick={handleSendMessage} disabled={isLoading}>
                    Send <Send className="ml-2 h-4 w-4" />
                </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
