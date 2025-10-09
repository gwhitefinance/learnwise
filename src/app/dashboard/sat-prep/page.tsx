
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Calculator, Pencil, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const practiceTools = [
    {
        title: "Full-Length Practice Tests",
        description: "Simulate the real testing experience with official, full-length practice tests on Bluebook™.",
        icon: <BookOpen className="h-8 w-8 text-primary" />,
        href: "https://bluebook.app.collegeboard.org/",
        cta: "Go to Bluebook"
    },
    {
        title: "Question of the Day",
        description: "Build a consistent practice habit with a new question every day.",
        icon: <Pencil className="h-8 w-8 text-primary" />,
        href: "https://satsuite.collegeboard.org/digital/daily-practice",
        cta: "Practice Now"
    },
    {
        title: "Free Practice on Khan Academy",
        description: "Access thousands of official practice questions and personalized study plans.",
        icon: <Image src="https://logos-world.net/wp-content/uploads/2021/04/Khan-Academy-Logo.png" width={32} height={32} alt="Khan Academy Logo" />,
        href: "https://www.khanacademy.org/digital-sat",
        cta: "Start on Khan Academy"
    },
];

const readingWritingTopics = [
    { title: "Information and Ideas", description: "Comprehend, analyze, and synthesize information from texts and graphics." },
    { title: "Craft and Structure", description: "Understand how authors use structure and language to achieve their purpose." },
    { title: "Expression of Ideas", description: "Revise texts to improve effectiveness and meet rhetorical goals." },
    { title: "Standard English Conventions", description: "Edit texts to conform to grammar, usage, and punctuation standards." },
];

const mathTopics = [
    { title: "Algebra", description: "Solve linear equations and systems in one and two variables." },
    { title: "Advanced Math", description: "Work with quadratic, exponential, and other nonlinear equations." },
    { title: "Problem-Solving & Data Analysis", description: "Apply quantitative reasoning using ratios, percentages, and rates." },
    { title: "Geometry and Trigonometry", description: "Solve problems involving area, volume, triangles, and trigonometry." },
];


export default function SatPrepPage() {
    const [gradeLevel, setGradeLevel] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
    useEffect(() => {
        const storedGrade = localStorage.getItem('onboardingGradeLevel');
        setGradeLevel(storedGrade);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Loading...</p>
            </div>
        );
    }
    
    if (gradeLevel !== 'High School') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Card className="max-w-md p-8">
                    <CardHeader>
                        <CardTitle>Feature Not Available</CardTitle>
                        <CardDescription>
                            This SAT Prep feature is exclusively available for high school students.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/dashboard')}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SAT Prep Hub</h1>
                <p className="text-muted-foreground">Your centralized dashboard for Digital SAT resources and practice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {practiceTools.map((tool, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <div className="p-3 bg-primary/10 rounded-lg w-fit text-primary mb-4">{tool.icon}</div>
                            <CardTitle>{tool.title}</CardTitle>
                            <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end">
                            <a href={tool.href} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button className="w-full">
                                    {tool.cta} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </a>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Reading and Writing</CardTitle>
                        <CardDescription>This section tests your comprehension, analysis, and editing skills across a range of texts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {readingWritingTopics.map(topic => (
                             <div key={topic.title} className="p-4 rounded-lg bg-muted flex items-start gap-4">
                                <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold">{topic.title}</h4>
                                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Math</CardTitle>
                        <CardDescription>This section tests your skills in algebra, advanced math, problem-solving, and geometry.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mathTopics.map(topic => (
                             <div key={topic.title} className="p-4 rounded-lg bg-muted flex items-start gap-4">
                                <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold">{topic.title}</h4>
                                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
