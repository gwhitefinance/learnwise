
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { studyPlannerFlow } from '@/lib/actions';
import { cn } from '@/lib/utils';
import AIBuddy from './ai-buddy';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  startTime: string;
  type: 'Test' | 'Homework' | 'Quiz' | 'Event';
  description: string;
};

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] =useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hey there! How can I help you study today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAuthState(auth);
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    if(scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
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
        userName: user.displayName?.split(' ')[0],
        history: [...messages, userMessage],
        learnerType: learnerType || undefined,
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
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
       setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };


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
                    <header className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <AIBuddy className="w-10 h-10" {...customizations} />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"/>
                            </div>
                            <div>
                                <h3 className="font-semibold">Your AI Buddy</h3>
                                <p className="text-xs text-muted-foreground">Online</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-5 w-5"/>
                        </Button>
                    </header>
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={cn("flex items-end gap-2", msg.role === 'user' ? 'justify-end' : '')}>
                                     {msg.role === 'ai' && (
                                        <Avatar className="h-8 w-8">
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-full">
                                                <AIBuddy className="w-10 h-10" {...customizations}/>
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
                                    <Avatar className="h-8 w-8">
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-full">
                                            <AIBuddy className="w-10 h-10" {...customizations}/>
                                        </div>
                                    </Avatar>
                                    <div className="p-3 rounded-2xl max-w-[80%] text-sm bg-muted rounded-bl-none">
                                        <Loader2 className="w-5 h-5 animate-spin"/>
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
                </motion.div>
            )}
        </AnimatePresence>

        <div className="relative mt-4 flex items-end justify-end">
             <AnimatePresence>
                {showWelcome && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                        className="bg-card border p-4 rounded-xl shadow-lg mb-2 mr-20"
                    >
                        <p className="font-semibold">Hello {user?.displayName?.split(' ')[0] || 'there'}!</p>
                        <p className="text-sm text-muted-foreground">I am your AI buddy. Chat with me at any time.</p>
                        <div className="absolute right-[-9px] bottom-4 w-3 h-3 bg-card border-b border-r transform rotate-45"></div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl relative"
                aria-label="Open Chat"
            >
                <AnimatePresence>
                    {isOpen ? (
                         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <X className="w-8 h-8" />
                         </motion.div>
                    ) : (
                         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                             <AIBuddy className="w-20 h-20" {...customizations} />
                         </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    </div>
  );
}
