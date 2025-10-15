
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Book, Edit, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const pdTools = [
    {
        title: "Teacher Growth Tracker",
        description: "Log professional development goals, track student outcomes, and reflect on your teaching practices.",
        icon: <TrendingUp className="h-8 w-8 text-green-500" />,
        href: "#"
    },
    {
        title: "Lesson Analytics",
        description: "Analyze student performance data post-lesson to understand engagement and effectiveness.",
        icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
        href: "#"
    },
    {
        title: "Reflection Journal",
        description: "A private space to log daily teaching wins, challenges, and moments of inspiration.",
        icon: <Edit className="h-8 w-8 text-purple-500" />,
        href: "#"
    },
    {
        title: "Built-In PD Courses",
        description: "Access micro-certifications on SEL, Differentiation, AI in Education, and more.",
        icon: <Book className="h-8 w-8 text-orange-500" />,
        href: "#"
    }
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Professional Development & Reflection</h1>
                <p className="text-muted-foreground">Tools to support your growth as an educator.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pdTools.map(tool => (
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
