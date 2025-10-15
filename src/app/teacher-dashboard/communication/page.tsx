
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Annoyed, MessageSquare, Bot, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const communicationTools = [
    {
        title: "Class Feed",
        description: "Post announcements, start discussions, and share updates with your classes.",
        icon: <Annoyed className="h-8 w-8 text-blue-500" />,
        href: "#"
    },
    {
        title: "1-Click Messaging",
        description: "Quickly send messages to individual students, groups, or parents.",
        icon: <MessageSquare className="h-8 w-8 text-green-500" />,
        href: "#"
    },
    {
        title: "AI Chat Logs",
        description: "Review student interactions with the AI tutor for insight into their learning process.",
        icon: <Bot className="h-8 w-8 text-purple-500" />,
        href: "#"
    },
    {
        title: "Office Hours",
        description: "Schedule and manage your availability for student questions and support.",
        icon: <Calendar className="h-8 w-8 text-orange-500" />,
        href: "#"
    }
];

export default function CommunicationPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Communication & Engagement</h1>
                <p className="text-muted-foreground">Interact with your students and monitor their engagement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {communicationTools.map(tool => (
                    <Card key={tool.title} className="flex flex-col hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-muted rounded-lg">
                                    {tool.icon}
                                </div>
                                <div>
                                    <CardTitle>{tool.title}</CardTitle>
                                    <CardDescription className="mt-1">{tool.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardFooter className="mt-auto">
                            <Link href={tool.href} className="w-full">
                                <Button variant="outline" className="w-full" disabled>
                                    Coming Soon <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
