
'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User } from "lucide-react";
import { studyPlannerFlow } from '@/ai/flows/study-planner-flow';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! How can I help you plan for your tests today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await studyPlannerFlow(input);
      const aiMessage: Message = { role: 'ai', content: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
      });
       const userMessageIndex = messages.length;
       setMessages(prev => prev.slice(0, userMessageIndex + 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold mb-4">AI Study Planner</h1>
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-col gap-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'ai' && (
                      <div className="rounded-full bg-primary text-primary-foreground h-8 w-8 flex items-center justify-center font-bold">AI</div>
                    )}
                     <div className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{message.content}</p>
                    </div>
                     {message.role === 'user' && (
                      <div className="rounded-full bg-muted text-muted-foreground h-8 w-8 flex items-center justify-center font-bold"><User className="h-4 w-4" /></div>
                    )}
                  </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary text-primary-foreground h-8 w-8 flex items-center justify-center font-bold">AI</div>
                        <div className="bg-muted rounded-lg p-3">
                            <p className="animate-pulse">Thinking...</p>
                        </div>
                    </div>
                )}
            </div>
        </CardContent>
        <div className="p-4 border-t">
          <div className="relative">
            <Input
              placeholder="Ask about a topic, get a study plan, etc."
              className="pr-12"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              disabled={isLoading}
            />
            <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleSendMessage} disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
