
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getPublicChatSession } from '@/lib/chat-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, User, BrainCircuit } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
}

export default function SharedChatPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const [session, setSession] = useState<ChatSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!sessionId) return;
        
        getPublicChatSession(sessionId).then(chatSession => {
            if (chatSession) {
                setSession(chatSession);
            } else {
                setError(true);
            }
            setLoading(false);
        }).catch(() => {
            setError(true);
            setLoading(false);
        });
    }, [sessionId]);

    if (error) {
        notFound();
    }

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                 <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </div>
                <div className="flex items-start gap-4 justify-end">
                    <div className="space-y-2 flex-1 items-end flex flex-col">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="bg-background min-h-screen">
            <header className="p-4 border-b">
                 <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        <BrainCircuit />
                        <span>LearnWise</span>
                    </Link>
                    <Button asChild>
                        <Link href="/signup">Get Started</Link>
                    </Button>
                </div>
            </header>
            <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
                <div className="text-center border-b pb-4">
                    <h1 className="text-3xl font-bold">{session?.title}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Shared on {session ? format(session.timestamp, 'PPP') : ''}
                    </p>
                </div>
                {session?.messages.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? "justify-end" : "")}>
                        {message.role === 'ai' && (
                            <Avatar><AvatarFallback><Bot size={20}/></AvatarFallback></Avatar>
                        )}
                        <div className={cn(
                            "p-4 rounded-lg max-w-xl",
                            message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                            <Avatar><AvatarFallback><User size={20}/></AvatarFallback></Avatar>
                        )}
                    </div>
                ))}
            </main>
             <footer className="text-center p-8 text-sm text-muted-foreground">
                Shared from LearnWise - Your AI Study Partner
            </footer>
        </div>
    );
}
