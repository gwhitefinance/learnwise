
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { GitMerge, CheckCircle, Flag, FlaskConical, Calendar as CalendarIcon, Users, Trophy } from "lucide-react";
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateRoadmap } from '@/ai/flows/roadmap-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

type Course = {
    id: string;
    name: string;
    description: string;
};

type Goal = {
    icon: keyof typeof LucideIcons;
    title: string;
    description: string;
};

type Milestone = {
    icon: keyof typeof LucideIcons;
    date: string; // YYYY-MM-DD
    title: string;
    description: string;
    completed: boolean;
};

type Roadmap = {
    goals: Goal[];
    milestones: Milestone[];
};

const initialCourses: Course[] = [
    {
        id: '1',
        name: "Introduction to Programming",
        description: "Learn the fundamentals of programming using Python."
    },
    {
        id: '2',
        name: "Calculus I",
        description: "An introduction to differential and integral calculus."
    },
    {
        id: '3',
        name: "Linear Algebra",
        description: "Explore vectors, matrices, and linear transformations."
    },
];

const getIcon = (iconName: keyof typeof LucideIcons | undefined, defaultIcon: keyof typeof LucideIcons) => {
    const Icon = iconName ? LucideIcons[iconName] as React.ElementType : LucideIcons[defaultIcon] as React.ElementType;
    if (!Icon) return LucideIcons[defaultIcon] as React.ElementType;
    return Icon;
};


export default function RoadmapsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [roadmaps, setRoadmaps] = useState<Record<string, Roadmap>>({});
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const { toast } = useToast();

    useEffect(() => {
        const savedCourses = localStorage.getItem('courses');
        if (savedCourses) {
            setCourses(JSON.parse(savedCourses));
        } else {
            setCourses(initialCourses);
        }
        
        const savedRoadmaps = localStorage.getItem('roadmaps');
        if (savedRoadmaps) {
            setRoadmaps(JSON.parse(savedRoadmaps));
        }
    }, []);

    const handleGenerateRoadmap = async (course: Course) => {
        setIsLoading(prev => ({ ...prev, [course.id]: true }));
        toast({ title: 'Generating Roadmap...', description: `The AI is creating a personalized study plan for ${course.name}.` });
        try {
            const response = await generateRoadmap({
                courseName: course.name,
                courseDescription: course.description
            });

            const newRoadmap: Roadmap = {
                goals: response.goals.map(g => ({ ...g, icon: g.icon as keyof typeof LucideIcons || 'Flag' })),
                milestones: response.milestones.map(m => ({ ...m, description: m.title, icon: m.icon as keyof typeof LucideIcons || 'CalendarIcon', completed: new Date(m.date) < new Date() }))
            };
            
            const updatedRoadmaps = { ...roadmaps, [course.id]: newRoadmap };
            setRoadmaps(updatedRoadmaps);
            localStorage.setItem('roadmaps', JSON.stringify(updatedRoadmaps));
            
            toast({
                title: 'Roadmap Generated!',
                description: `Your new roadmap for ${course.name} is ready.`,
            });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate roadmap.' });
        } finally {
            setIsLoading(prev => ({ ...prev, [course.id]: false }));
        }
    };

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold tracking-tight">My Study Roadmaps</h1>
            <p className="text-muted-foreground">
            Visualize your learning journey with key milestones and goals for each course.
            </p>
        </div>
        
        {courses.length > 0 ? (
        <Tabs defaultValue={courses[0].id} className="w-full">
            <TabsList>
                {courses.map(course => (
                    <TabsTrigger key={course.id} value={course.id}>{course.name}</TabsTrigger>
                ))}
            </TabsList>

            {courses.map(course => {
                const roadmap = roadmaps[course.id];
                const courseIsLoading = isLoading[course.id];

                return (
                 <TabsContent key={course.id} value={course.id}>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => handleGenerateRoadmap(course)} disabled={courseIsLoading}>
                            <GitMerge className="mr-2 h-4 w-4"/> {courseIsLoading ? 'Generating...' : 'Generate with AI'}
                        </Button>
                    </div>

                    {!roadmap && !courseIsLoading ? (
                        <Card className="text-center p-12">
                            <h2 className="text-xl font-semibold">No Roadmap Yet</h2>
                            <p className="text-muted-foreground mt-2">Click the "Generate with AI" button to create a study plan for this course.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <h2 className="text-2xl font-semibold">Goals</h2>
                                 <div className="grid gap-4 md:grid-cols-2">
                                     {courseIsLoading && !roadmap ? (
                                        <>
                                            <Skeleton className="h-24"/>
                                            <Skeleton className="h-24"/>
                                        </>
                                     ) : roadmap?.goals.map((goal, index) => {
                                         const GoalIcon = getIcon(goal.icon, 'Flag');
                                         return (
                                            <Card key={index}>
                                                <CardContent className="p-6 flex items-start gap-4">
                                                    <div className="bg-muted p-3 rounded-lg">
                                                        <GoalIcon className="h-6 w-6 text-muted-foreground"/>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                                                        <p className="text-muted-foreground text-sm">{goal.description}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                     })}
                                </div>
                            </div>
                             <div className="space-y-8">
                              <h2 className="text-2xl font-semibold">Milestones</h2>
                              <div className="relative">
                                <div className="absolute left-3.5 top-0 h-full w-0.5 bg-border"></div>
                                 {courseIsLoading && !roadmap ? (
                                    <div className="space-y-8">
                                        <div className="flex items-start gap-6"><Skeleton className="h-8 w-8 rounded-full"/><div className="space-y-2"><Skeleton className="h-4 w-48"/><Skeleton className="h-4 w-32"/></div></div>
                                        <div className="flex items-start gap-6"><Skeleton className="h-8 w-8 rounded-full"/><div className="space-y-2"><Skeleton className="h-4 w-48"/><Skeleton className="h-4 w-32"/></div></div>
                                        <div className="flex items-start gap-6"><Skeleton className="h-8 w-8 rounded-full"/><div className="space-y-2"><Skeleton className="h-4 w-48"/><Skeleton className="h-4 w-32"/></div></div>
                                    </div>
                                 ) : roadmap?.milestones.map((milestone, index) => {
                                     const MilestoneIcon = getIcon(milestone.icon, 'CalendarIcon');
                                     const isCompleted = new Date(milestone.date) < new Date();
                                     return (
                                        <div key={index} className="relative flex items-start gap-6 mb-8">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted border-2 border-primary'}`}>
                                            <MilestoneIcon className="h-4 w-4" />
                                            </div>
                                            <div>
                                            <p className="text-sm text-muted-foreground">{new Date(milestone.date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                            <h3 className="font-semibold text-lg">{milestone.title}</h3>
                                            </div>
                                        </div>
                                    )
                                })}
                              </div>
                            </div>
                        </div>
                    )}

                 </TabsContent>
                )
            })}
        </Tabs>
        ) : (
            <Card className="text-center p-12">
                <h2 className="text-xl font-semibold">No Courses Found</h2>
                <p className="text-muted-foreground mt-2">Add a course from the "Courses" page to start creating roadmaps.</p>
            </Card>
        )}
    </div>
  );
}
