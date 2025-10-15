
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, ScrollText, MessageSquare, Video, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const assessmentTools = [
    {
        title: "AI-Graded Quizzes",
        description: "Get instant results, detailed analytics, and AI-powered suggestions for every student.",
        icon: <CheckSquare className="h-8 w-8 text-green-500" />,
        href: "#"
    },
    {
        title: "Rubric Builder",
        description: "Create, share, and reuse dynamic rubrics for projects, essays, and even podcast episodes.",
        icon: <ScrollText className="h-8 w-8 text-blue-500" />,
        href: "#"
    },
    {
        title: "Inline Feedback Tool",
        description: "Leave targeted comments and suggestions directly on student notes and assignments.",
        icon: <MessageSquare className="h-8 w-8 text-purple-500" />,
        href: "#"
    },
    {
        title: "Voice & Video Feedback",
        description: "Respond to students in their preferred learning mode for more impactful feedback.",
        icon: <Video className="h-8 w-8 text-orange-500" />,
        href: "#"
    },
    {
        title: "Plagiarism & Originality Checker",
        description: "Ensure academic integrity with a built-in checker for all uploaded student work.",
        icon: <ShieldCheck className="h-8 w-8 text-red-500" />,
        href: "#"
    }
];

export default function AssessmentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Assessment & Feedback</h1>
                <p className="text-muted-foreground">Powerful tools for evaluation, feedback, and ensuring academic integrity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessmentTools.map(tool => (
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
