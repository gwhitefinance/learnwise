
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, Bot } from "lucide-react";
import { studyPlannerFlow } from '@/ai/flows/study-planner-flow';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

type Course = {
    id: string;
    name: string;
    description?: string;
};

type Event = {
  id: string;
  date: string;
  title: string;
  time: string;
  type: 'Test' | 'Homework' | 'Quiz' | 'Event';
  description: string;
};

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [courseContext, setCourseContext] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
      setLearnerType(storedLearnerType);
    }
    
    let initialMessage = 'Hi there! How can I assist you today with your studies?';

    if (courseId) {
        const savedCourses = localStorage.getItem('courses');
        if (savedCourses) {
            try {
                const allCourses: Course[] = JSON.parse(savedCourses);
                const currentCourse = allCourses.find(c => c.id === courseId);
                if(currentCourse) {
                    const context = `Course: ${currentCourse.name}. Description: ${currentCourse.description || 'No description available.'}`;
                    setCourseContext(context);
                    initialMessage = `Hello! I see you're working on ${currentCourse.name}. How can I help you with this course?`;
                }
            } catch (e) {
                console.error("Failed to parse courses from local storage", e);
            }
        }
    }
     setMessages([{ role: 'ai', content: initialMessage }]);
  }, [courseId]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const savedEvents = localStorage.getItem('calendarEvents');
      let calendarEvents: Event[] = [];
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        if (Array.isArray(parsedEvents)) {
          calendarEvents = parsedEvents;
        }
      }
      
      // Convert date objects to ISO strings for serialization
      const serializableEvents = calendarEvents.map(e => ({...e, date: new Date(e.date).toISOString()}));


      const response = await studyPlannerFlow({
        history: newMessages,
        learnerType: learnerType || undefined,
        courseContext: courseContext || undefined,
        calendarEvents: serializableEvents,
      });
      const aiMessage: Message = { role: 'ai', content: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
      });
       // Revert to the state before sending the message on error
       setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold">AI Chat</h1>
        <p className="text-muted-foreground">Ask me anything about your courses, study roadmaps, or notes. I'm here to help you learn smarter, not harder.</p>
        {learnerType && (
            <div className="text-sm text-muted-foreground mt-2">
                <span className="font-semibold">Your Learner Type:</span>
                <span className="ml-2 inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{learnerType}</span>
            </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
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
                     <div className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{message.content}</p>
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
                        <div className="bg-muted rounded-lg p-3">
                            <p className="animate-pulse">Thinking...</p>
                        </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
      <div className="p-4 border-t bg-background">
        <div className="relative">
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
  );
}
