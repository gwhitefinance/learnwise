
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Library, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const collaborationTools = [
    {
        title: "Co-Teaching Mode",
        description: "Share a class with other teachers or aides to collaborate on lessons, grading, and student support.",
        icon: <Users className="h-8 w-8 text-blue-500" />,
        href: "#"
    },
    {
        title: "Department Resource Library",
        description: "A shared space for your department to store, organize, and reuse lesson plans, quizzes, and modules.",
        icon: <Library className="h-8 w-8 text-green-500" />,
        href: "#"
    },
    {
        title: "Parent/Guardian Portal Sync",
        description: "Control what parents and guardians can see, from grades and feedback to badges and progress reports.",
        icon: <Shield className="h-8 w-8 text-purple-500" />,
        href: "#"
    }
];

export default function CollaborationPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin & Collaboration</h1>
                <p className="text-muted-foreground">Tools for team teaching, resource sharing, and parent communication.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborationTools.map(tool => (
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
