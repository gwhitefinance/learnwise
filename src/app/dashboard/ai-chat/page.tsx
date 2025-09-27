
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, Bot, Plus, MessageSquare, Trash2, Edit, Home, Upload, Share2, MoreHorizontal, Info, Sparkles, Copy, Check, FileText } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, onSnapshot, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { studyPlannerFlow } from '@/lib/actions';
import { generateChatTitle, generateNoteFromChat } from '@/lib/actions';
import { analyzeImage } from '@/lib/actions';
import AIBuddy from '@/components/ai-buddy';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    id?: string; // optional here, since we use doc.id instead
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  
  // State for upload dialog
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveNoteDialogOpen, setSaveNoteDialogOpen] = useState(false);
  const [noteCourseId, setNoteCourseId] = useState<string | undefined>(undefined);


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
    
    // Fetch courses
    const coursesQuery = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
        const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);
    });

    // Set up a real-time listener for chat sessions
    const q = query(collection(db, "chatSessions"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userSessions = querySnapshot.docs.map(doc => {
            const data = doc.data() as FirestoreChatSession;
            return {
                id: doc.id,
                ...data,
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

    return () => {
        unsubscribe();
        unsubscribeCourses();
    }

  }, [user, authLoading, router, activeSessionId]);

  
  useEffect(() => {
    if(scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [sessions, activeSessionId]);
  
  useEffect(() => {
    if(activeSession?.courseId) {
        setNoteCourseId(activeSession.courseId);
    } else {
        setNoteCourseId(undefined);
    }
  }, [activeSession]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const createNewSession = async () => {
    if (!user) return;
    
    const courseIdParam = searchParams.get('courseId');
    let initialMessage = `Hey ${user.displayName?.split(' ')[0] || 'there'}! How can I help you today?`;
    let courseContext: string | undefined = undefined;
    let title = "New Chat";

    const newSessionData: any = {
        title: title,
        messages: [{ role: 'ai', content: initialMessage }],
        timestamp: Timestamp.now(),
        titleGenerated: !!courseIdParam,
        userId: user.uid,
        isPublic: false,
    };

    if (courseIdParam) {
        const docRef = doc(db, "courses", courseIdParam);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const currentCourse = docSnap.data() as Course;
            if(currentCourse) {
                 courseContext = `Course: ${currentCourse.name}. Description: ${currentCourse.description || 'No description available.'}`;
                initialMessage = `Hello! I see you're working on ${currentCourse.name}. How can I help you with this course?`;
                title = `${currentCourse.name} Chat`;
                newSessionData.courseId = courseIdParam;
                newSessionData.courseContext = courseContext;
                newSessionData.title = title;
                newSessionData.messages = [{ role: 'ai', content: initialMessage }];
            }
        }
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
      
      setIsLoading(false);

      const sessionRef = doc(db, "chatSessions", activeSession.id);
      await updateDoc(sessionRef, { messages: finalMessages, timestamp: Timestamp.now() });

      if (!activeSession.titleGenerated && activeSession.messages.length <= 3) {
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
    if (sessions.length <= 1) {
        toast({ variant: 'destructive', title: 'Cannot delete last chat.'});
        return;
    }
    try {
        await deleteDoc(doc(db, "chatSessions", sessionId));
        toast({ title: 'Chat deleted.' });
        if (activeSessionId === sessionId) {
            // Find a new session to make active
            const newActiveSession = sessions.find(s => s.id !== sessionId);
            setActiveSessionId(newActiveSession ? newActiveSession.id : null);
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete chat.'});
    }
  };

  const handleClearMessages = async (sessionId: string) => {
    if (!user) return;
    try {
        const sessionRef = doc(db, 'chatSessions', sessionId);
        await updateDoc(sessionRef, {
            messages: [{ role: 'ai', content: `Hey ${user.displayName?.split(' ')[0] || 'there'}! Let's start over. What's on your mind?` }]
        });
        toast({ title: 'Chat Cleared' });
    } catch (error) {
        console.error("Error clearing messages:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not clear chat messages.' });
    }
  };
  
  const handleFileChange = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles[0]) {
      setFileToUpload(selectedFiles[0]);
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
            const { analysis } = await analyzeImage({ imageDataUri, model: 'gemini-2.5-flash' });

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
      handleFileChange(droppedFiles);
    }
  };

  const handleShare = async () => {
    if (!activeSession) return;
    try {
      const sessionRef = doc(db, "chatSessions", activeSession.id);
      await updateDoc(sessionRef, { isPublic: true });
      // The local state will be updated by the onSnapshot listener
      toast({ title: "Chat is now public!", description: "Anyone with the link can view it."});
    } catch(e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not share chat.'});
    }
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

   const handleSaveAsNote = async () => {
    if (!activeSession || !user) return;

    setIsSavingNote(true);
    
    try {
      const result = await generateNoteFromChat({ messages: activeSession.messages });
      
      const noteData = {
        title: result.title,
        content: result.note,
        date: Timestamp.now(),
        color: 'bg-indigo-100 dark:bg-indigo-900/20',
        isImportant: false,
        isCompleted: false,
        userId: user.uid,
        courseId: noteCourseId || null,
      };

      await addDoc(collection(db, "notes"), noteData);
      
      toast({ title: "Note Saved!", description: "Your chat has been saved as a note on the Notes page." });

    } catch (error) {
      console.error("Failed to save note:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save the chat as a note.' });
    } finally {
        setIsSavingNote(false);
        setSaveNoteDialogOpen(false);
    }
  };


  return (
    <div className="flex h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="w-72 bg-background p-2 flex-col border-r hidden md:flex">
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
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
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
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        <header className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{activeSession?.title || "LearnWise AI"}</h2>
            </div>
            <div className="flex items-center gap-2">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4 mr-2" /> Share
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Share Chat</DialogTitle>
                            <DialogDescription>
                                {activeSession?.isPublic ? "This chat is public. Anyone with the link can view it." : "Make this chat public to share it with a link."}
                            </DialogDescription>
                        </DialogHeader>
                        {activeSession?.isPublic ? (
                            <div className="flex items-center space-x-2">
                                <Input value={`${window.location.origin}/share/chat/${activeSessionId}`} readOnly />
                                <Button onClick={() => handleCopyToClipboard(`${window.location.origin}/share/chat/${activeSessionId}`)} size="sm" className="px-3">
                                    <span className="sr-only">Copy</span>
                                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        ) : (
                           <DialogFooter>
                                <Button onClick={handleShare}>Make public & get link</Button>
                           </DialogFooter>
                        )}
                    </DialogContent>
                </Dialog>
                <Dialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Info className="mr-2 h-4 w-4"/> View Info
                                </DropdownMenuItem>
                            </DialogTrigger>
                             <Dialog open={saveNoteDialogOpen} onOpenChange={setSaveNoteDialogOpen}>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <FileText className="mr-2 h-4 w-4"/> Save as Note
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Save Chat as Note</DialogTitle>
                                        <DialogDescription>Select a course to associate this note with.</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Label htmlFor="note-course">Course</Label>
                                        <Select value={noteCourseId} onValueChange={setNoteCourseId}>
                                            <SelectTrigger id="note-course">
                                                <SelectValue placeholder="Select a course..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Course</SelectItem>
                                                {courses.map(course => (
                                                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                        <Button onClick={handleSaveAsNote} disabled={isSavingNote}>
                                            {isSavingNote ? "Saving..." : "Save Note"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                             </Dialog>
                            <DropdownMenuItem onSelect={() => activeSession && startRename(activeSession)}>
                                <Edit className="mr-2 h-4 w-4"/> Rename Chat
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Sparkles className="mr-2 h-4 w-4"/> Clear Messages
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Clear All Messages?</AlertDialogTitle>
                                        <AlertDialogDescription>This will delete all messages in this chat, but the chat session will remain. This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => activeSession && handleClearMessages(activeSession.id)}>Clear Messages</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="mr-2 h-4 w-4"/> Delete Chat
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently delete this chat session. This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => activeSession && handleDeleteSession(activeSession.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Chat Information</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            <p><strong>Title:</strong> {activeSession?.title}</p>
                            <p><strong>Created:</strong> {activeSession ? format(activeSession.timestamp, 'PPP p') : 'N/A'}</p>
                            <p><strong>Messages:</strong> {activeSession?.messages.length}</p>
                            <p><strong>Course Context:</strong> {activeSession?.courseContext || 'General Chat'}</p>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button>Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
            </div>
        </header>
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 pb-32">
            {activeSession?.messages.map((message, index) => (
              <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? "justify-end" : "")}>
                {message.role === 'ai' && (
                     <Avatar className="h-10 w-10">
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
                    message.role === 'user' ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                  )}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
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

        <div className="px-4 py-2 bg-background border-t">
          <div className="relative max-w-3xl mx-auto">
            <Input
              placeholder="Ask anything..."
              className="pr-24 rounded-full h-12 text-base shadow-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                 <Dialog open={isUploadOpen} onOpenChange={setUploadOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full h-9 w-9 p-0"><Upload className="h-4 w-4"/></Button>
                    </DialogTrigger>
                    <DialogContent
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <DialogHeader>
                            <DialogTitle>Upload File</DialogTitle>
                            <DialogDescription>
                                Upload an image file to discuss it with the AI.
                            </DialogDescription>
                        </DialogHeader>
                        <div 
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                            )}
                            onClick={() => document.getElementById('chat-file-upload')?.click()}
                        >
                            <input 
                                id="chat-file-upload"
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileChange(e.target.files)}
                                accept="image/*"
                            />
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-10 h-10 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-lg font-semibold">
                                Drag and drop your file here
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Or click to browse
                              </p>
                            </div>
                        </div>
                        {fileToUpload && (
                          <div className="mt-4">
                              <h3 className="text-lg font-semibold">Selected file:</h3>
                              <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                                  <li>{fileToUpload.name}</li>
                              </ul>
                          </div>
                        )}
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleUpload} disabled={!fileToUpload}>Upload & Analyze</Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
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
