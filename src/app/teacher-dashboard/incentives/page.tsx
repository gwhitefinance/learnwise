
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ShoppingBag, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const incentiveTools = [
    {
        title: "Award Custom Badges",
        description: "Recognize student achievements by creating and awarding unique badges for milestones and excellent work.",
        icon: <Award className="h-8 w-8 text-yellow-500" />,
        href: "#"
    },
    {
        title: "Shop Control Panel",
        description: "Approve new items for the cosmetic shop or suggest learning-based rewards for students to unlock.",
        icon: <ShoppingBag className="h-8 w-8 text-green-500" />,
        href: "#"
    },
    {
        title: "Challenge Builder",
        description: "Design daily, weekly, or monthly learning quests and challenges to keep students engaged and motivated.",
        icon: <Shield className="h-8 w-8 text-blue-500" />,
        href: "#"
    }
];

export default function IncentivesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Incentives & Progress Tracking</h1>
                <p className="text-muted-foreground">Motivate your students with gamified rewards and challenges.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incentiveTools.map(tool => (
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
