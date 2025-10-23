
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Sparkles, Bot, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateEssayFeedback } from '@/lib/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import AIBuddy from '@/components/ai-buddy';

type Message = {
    role: 'user' | 'ai';
    content: string;
};

export default function EssayCoachPage() {
    const router = useRouter();
    const [essayText, setEssayText] = useState('');
    const [chatHistory, setChatHistory] = useState<Message[]>([
        { role: 'ai', content: "Welcome to the Essay Coach! Paste your essay draft here, or just start writing. Ask for feedback, brainstorming help, or anything else you need." }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user] = useAuthState(auth);

    useEffect(() => {
        const savedEssay = localStorage.getItem('essayDraft');
        if (savedEssay) {
            setEssayText(savedEssay);
        }
    }, []);

    const handleEssayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEssayText(e.target.value);
        localStorage.setItem('essayDraft', e.target.value);
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const newUserMessage: Message = { role: 'user', content: chatInput };
        setChatHistory(prev => [...prev, newUserMessage]);
        setChatInput('');
        setIsLoading(true);

        try {
            const response = await generateEssayFeedback({
                essay: essayText,
                prompt: chatInput,
                history: [...chatHistory, newUserMessage],
            });
            const newAiMessage: Message = { role: 'ai', content: response.feedback };
            setChatHistory(prev => [...prev, newAiMessage]);
        } catch (error) {
            console.error("Failed to get essay feedback:", error);
            const errorMessage: Message = { role: 'ai', content: "Sorry, I encountered an error. Please try again." };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 p-4 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/college-prep')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold">College Essay Coach</h1>
                    <p className="text-sm text-muted-foreground">Your personal AI writing assistant</p>
                </div>
            </header>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-hidden">
                {/* Editor */}
                <div className="md:col-span-2 h-full flex flex-col">
                    <Textarea
                        placeholder="Start writing your essay here..."
                        className="w-full flex-1 resize-none text-base p-6 rounded-lg border focus-visible:ring-1"
                        value={essayText}
                        onChange={handleEssayChange}
                    />
                </div>

                {/* AI Chat */}
                <Card className="h-full flex flex-col">
                    <CardContent className="p-0 flex-1 flex flex-col">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                        {msg.role === 'ai' && <AIBuddy className="w-8 h-8 flex-shrink-0" />}
                                        <div className={`rounded-lg p-3 max-w-xs text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                         {msg.role === 'user' && (
                                            <Avatar className="h-8 w-8"><AvatarFallback>{user?.displayName?.[0]}</AvatarFallback></Avatar>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                     <div className="flex items-start gap-3">
                                        <AIBuddy className="w-8 h-8 flex-shrink-0" />
                                        <div className="rounded-lg p-3 max-w-xs text-sm bg-muted animate-pulse">
                                            Thinking...
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t relative">
                            <Textarea
                                placeholder="Ask for feedback or ideas..."
                                className="pr-12"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <Button
                                size="icon"
                                className="absolute right-6 top-1/2 -translate-y-1/2 h-8 w-8"
                                onClick={handleSendMessage}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
