
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, Wand2, Gamepad2, UploadCloud, Link as LinkIcon, Video, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const tools = [
    {
        title: "AI Lesson Builder",
        description: "Create comprehensive lessons from scratch or with AI assistance. Includes text, quizzes, and activities.",
        icon: <Wand2 className="h-8 w-8 text-purple-500" />,
        href: "/teacher-dashboard/content/lesson-builder"
    },
    {
        title: "Assignment Generator",
        description: "Quickly generate worksheets, quizzes, or modules based on a topic or your uploaded content.",
        icon: <FilePlus className="h-8 w-8 text-blue-500" />,
        href: "/teacher-dashboard/content/assignment-generator"
    },
    {
        title: "Gamified Activity Creator",
        description: "Build engaging games, flashcard decks, and badge missions to make learning more interactive and fun.",
        icon: <Gamepad2 className="h-8 w-8 text-green-500" />,
        href: "/teacher-dashboard/content/game-creator"
    },
    {
        title: "Embed & Upload",
        description: "Easily include PDFs, videos, websites, or content from third-party tools like Edpuzzle and Kahoot.",
        icon: <UploadCloud className="h-8 w-8 text-orange-500" />,
        href: "/teacher-dashboard/content/upload"
    }
];

export default function ContentCreationPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Creation & Customization</h1>
                <p className="text-muted-foreground">Your toolkit for building engaging and effective learning experiences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map(tool => (
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
                                <Button variant="outline" className="w-full">
                                    Open Tool <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
