
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Loader2, PanelLeft, Plus, Edit, Trash2, FileText, Home, Phone, ChevronRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, updateDoc, Timestamp, deleteDoc, orderBy } from 'firebase/firestore';
import { studyPlannerFlow, generateChatTitle, generateNoteFromChat } from '@/lib/actions';
import { cn } from '@/lib/utils';
import AIBuddy from './ai-buddy';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


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

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  startTime: string;
  type: 'Test' | 'Homework' | 'Quiz' | 'Event';
  description: string;
};

const ChatHomeScreen = ({ onNavigate }: { onNavigate: (tab: string) => void }) => (
    <div className="flex flex-col h-full">
        <div className="bg-primary text-primary-foreground p-6 rounded-t-2xl">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Home className="w-7 h-7 text-white" />
                </div>
            </div>
            <h2 className="text-3xl font-bold">LearnWise</h2>
            <p className="opacity-80">We are here to help you!</p>
        </div>
        <div className="p-6 space-y-4 flex-1 bg-muted/30">
            <button 
                onClick={() => onNavigate('conversation')}
                className="w-full bg-card p-4 rounded-lg flex items-center justify-between text-left hover:bg-muted transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">Chat with us now</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full bg-card p-4 rounded-lg flex items-center justify-between text-left hover:bg-muted transition-colors">
                <div className="flex items-center gap-4">
                     <div className="p-3 bg-primary/10 rounded-full">
                        <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">Leave a voice message</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
        </div>
    </div>
);


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

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    if(user) {
        const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
        if(savedCustomizations) {
            setCustomizations(JSON.parse(savedCustomizations));
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

  const createNewSession = async () => {
    if (!user) return;
    
    const newSessionData = {
        title: "New Chat",
        messages: [{ role: 'ai', content: `Hey ${user.displayName?.split(' ')[0] || 'there'}! How can I help?` }],
        timestamp: Timestamp.now(),
        titleGenerated: false,
        userId: user.uid,
        isPublic: false,
    };
    
    try {
        const docRef = await addDoc(collection(db, "chatSessions"), newSessionData);
        setActiveSessionId(docRef.id);
        setActiveTab('conversation');
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start a new chat.'})
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !user || !activeSession) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...activeSession.messages, userMessage];
    
    setSessions(sessions.map(s => s.id === activeSessionId ? { ...s, messages: updatedMessages } : s));
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
      await updateDoc(sessionRef, { messages: finalMessages, timestamp: Timestamp.now() });

       if (!activeSession.titleGenerated && activeSession.messages.length <= 3) {
          const { title } = await generateChatTitle({ messages: finalMessages });
          await updateDoc(sessionRef, { title, titleGenerated: true });
      }

    } catch (error) {
      console.error(error);
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
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'home' && <ChatHomeScreen onNavigate={setActiveTab} />}
                        {activeTab === 'conversation' && (
                            <div className="flex-1 flex flex-col h-full">
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
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={createNewSession}><Plus className="h-3 w-3"/></Button>
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
                                <div className="flex-1 flex flex-col">
                                    <header className="p-2 border-b flex items-center justify-between">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
                                            <PanelLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <AIBuddy className="w-6 h-6" {...customizations} />
                                                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-card rounded-full"/>
                                            </div>
                                            <h3 className="font-semibold text-sm truncate max-w-28">{activeSession?.title || 'AI Buddy'}</h3>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveAsNote}>
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </header>
                                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                                        <div className="space-y-4">
                                            {activeSession?.messages.map((msg, index) => (
                                                <div key={index} className={cn("flex items-end gap-2", msg.role === 'user' ? 'justify-end' : '')}>
                                                    {msg.role === 'ai' && (
                                                        <Avatar className="h-7 w-7">
                                                            <div className="w-full h-full flex items-center justify-center rounded-full">
                                                                <AIBuddy className="w-7 h-7" {...customizations}/>
                                                            </div>
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
                                                    <Avatar className="h-7 w-7">
                                                        <div className="w-full h-full flex items-center justify-center rounded-full">
                                                            <AIBuddy className="w-7 h-7" {...customizations}/>
                                                        </div>
                                                    </Avatar>
                                                    <div className="p-3 rounded-2xl max-w-[80%] text-sm bg-muted rounded-bl-none">
                                                        <Loader2 className="w-4 h-4 animate-spin"/>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                    <footer className="p-4 border-t">
                                        <div className="relative">
                                            <Input 
                                                placeholder="Ask anything..."
                                                className="pr-12 rounded-full"
                                                value={input}
                                                onChange={e => setInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                                disabled={isLoading}
                                            />
                                            <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" onClick={handleSendMessage} disabled={isLoading}>
                                                <Send className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </footer>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t p-2 flex justify-around bg-card rounded-b-2xl">
                       <TabButton name="Home" icon={<Home />} currentTab={activeTab} setTab={setActiveTab} />
                       <TabButton name="Conversation" icon={<MessageSquare />} currentTab={activeTab} setTab={setActiveTab} />
                       <TabButton name="FAQs" icon={<HelpCircle />} currentTab={activeTab} setTab={setActiveTab} />
                       <TabButton name="Articles" icon={<FileText />} currentTab={activeTab} setTab={setActiveTab} />
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
