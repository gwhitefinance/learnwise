
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { GitMerge, Plus, Trash2, Edit, Check, Lightbulb } from "lucide-react";
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateRoadmap } from '@/ai/flows/roadmap-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';


type Course = {
    id: string;
    name: string;
    description: string;
    url?: string;
};

type Goal = {
    id: string;
    icon: keyof typeof LucideIcons;
    title: string;
    description: string;
};

type Milestone = {
    id: string;
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
        description: "Learn the fundamentals of programming using Python.",
        url: "https://www.coursera.org/specializations/python"
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
    
    // State for the edit/add dialog
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Goal | Milestone | null>(null);
    const [editingType, setEditingType] = useState<'goal' | 'milestone' | null>(null);
    const [currentItemTitle, setCurrentItemTitle] = useState('');
    const [currentItemDesc, setCurrentItemDesc] = useState('');
    const [currentItemDate, setCurrentItemDate] = useState<Date | undefined>(undefined);
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);


    useEffect(() => {
        const savedCourses = localStorage.getItem('courses');
        if (savedCourses) {
            const parsedCourses = JSON.parse(savedCourses);
            setCourses(parsedCourses);
            if(parsedCourses.length > 0) {
                setActiveCourseId(parsedCourses[0].id);
            }
        } else {
            setCourses(initialCourses);
             if(initialCourses.length > 0) {
                setActiveCourseId(initialCourses[0].id);
            }
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
                courseDescription: course.description,
                courseUrl: course.url,
            });

            const newRoadmap: Roadmap = {
                goals: response.goals.map(g => ({ ...g, id: crypto.randomUUID(), icon: g.icon as keyof typeof LucideIcons || 'Flag' })),
                milestones: response.milestones.map(m => ({ ...m, id: crypto.randomUUID(), icon: m.icon as keyof typeof LucideIcons || 'Calendar', completed: new Date(m.date) < new Date() }))
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
    
    const openItemDialog = (type: 'goal' | 'milestone', item?: Goal | Milestone) => {
        setEditingType(type);
        setEditingItem(item || null);
        setCurrentItemTitle(item?.title || '');
        setCurrentItemDesc(item?.description || '');
        if (type === 'milestone' && item && 'date' in item) {
            setCurrentItemDate(new Date(item.date));
        } else {
            setCurrentItemDate(undefined);
        }
        setIsItemDialogOpen(true);
    };

    const handleSaveItem = () => {
        if (!activeCourseId || !editingType) return;
        
        let updatedRoadmap = roadmaps[activeCourseId] || { goals: [], milestones: [] };

        if (editingType === 'goal') {
            const newGoal: Goal = {
                id: editingItem?.id || crypto.randomUUID(),
                title: currentItemTitle,
                description: currentItemDesc,
                icon: 'Flag',
            };
            if (editingItem) {
                updatedRoadmap.goals = updatedRoadmap.goals.map(g => g.id === newGoal.id ? newGoal : g);
            } else {
                updatedRoadmap.goals.push(newGoal);
            }
        } else if (editingType === 'milestone') {
             const newMilestone: Milestone = {
                id: editingItem?.id || crypto.randomUUID(),
                title: currentItemTitle,
                description: currentItemDesc,
                date: currentItemDate ? currentItemDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                icon: 'Calendar',
                completed: (editingItem as Milestone)?.completed ?? false,
            };
            if (editingItem) {
                updatedRoadmap.milestones = updatedRoadmap.milestones.map(m => m.id === newMilestone.id ? newMilestone : m);
            } else {
                updatedRoadmap.milestones.push(newMilestone);
            }
            // Sort milestones by date
            updatedRoadmap.milestones.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        
        const updatedRoadmaps = { ...roadmaps, [activeCourseId]: updatedRoadmap };
        setRoadmaps(updatedRoadmaps);
        localStorage.setItem('roadmaps', JSON.stringify(updatedRoadmaps));
        toast({ title: `${editingType} saved!` });
        setIsItemDialogOpen(false);
    };

    const handleDeleteItem = (type: 'goal' | 'milestone', id: string) => {
        if (!activeCourseId) return;

        let updatedRoadmap = roadmaps[activeCourseId];
        if (!updatedRoadmap) return;

        if (type === 'goal') {
            updatedRoadmap.goals = updatedRoadmap.goals.filter(g => g.id !== id);
        } else {
            updatedRoadmap.milestones = updatedRoadmap.milestones.filter(m => m.id !== id);
        }
        
        const updatedRoadmaps = { ...roadmaps, [activeCourseId]: updatedRoadmap };
        setRoadmaps(updatedRoadmaps);
        localStorage.setItem('roadmaps', JSON.stringify(updatedRoadmaps));
        toast({ title: `${type} deleted.` });
    };

    const handleToggleMilestone = (milestoneId: string) => {
        if (!activeCourseId) return;

        let updatedRoadmap = { ...roadmaps[activeCourseId] };
        let milestoneCompleted = false;

        updatedRoadmap.milestones = updatedRoadmap.milestones.map(m => {
            if (m.id === milestoneId) {
                const updatedMilestone = { ...m, completed: !m.completed };
                if (updatedMilestone.completed) {
                    milestoneCompleted = true;
                }
                return updatedMilestone;
            }
            return m;
        });

        const updatedRoadmaps = { ...roadmaps, [activeCourseId]: updatedRoadmap };
        setRoadmaps(updatedRoadmaps);
        localStorage.setItem('roadmaps', JSON.stringify(updatedRoadmaps));

        if (milestoneCompleted) {
            toast({
                title: '🎉 Milestone Complete!',
                description: "Great job! Keep up the momentum.",
            });
        }
    };


  return (
    <>
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold tracking-tight">My Study Roadmaps</h1>
            <p className="text-muted-foreground">
            Visualize your learning journey with key milestones and goals for each course.
            </p>
        </div>
        
        {courses.length > 0 ? (
        <Tabs defaultValue={courses[0].id} onValueChange={setActiveCourseId} className="w-full">
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
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-semibold">Goals</h2>
                                    <Button variant="outline" size="sm" onClick={() => openItemDialog('goal')}>
                                        <Plus className="mr-2 h-4 w-4"/> Add Goal
                                    </Button>
                                </div>
                                 <div className="grid gap-4 md:grid-cols-2">
                                     {courseIsLoading && !roadmap ? (
                                        <>
                                            <Skeleton className="h-32"/>
                                            <Skeleton className="h-32"/>
                                        </>
                                     ) : roadmap?.goals.map((goal, index) => {
                                         const GoalIcon = getIcon(goal.icon, 'Flag');
                                         return (
                                            <Card key={index} className="group">
                                                <CardHeader>
                                                    <div className="flex justify-between items-start">
                                                         <div className="bg-muted p-3 rounded-lg">
                                                            <GoalIcon className="h-6 w-6 text-muted-foreground"/>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openItemDialog('goal', goal)}><Edit className="h-4 w-4"/></Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this goal.</AlertDialogDescription></AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDeleteItem('goal', goal.id)}>Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <h3 className="font-semibold text-lg">{goal.title}</h3>
                                                    <p className="text-muted-foreground text-sm mt-1">{goal.description}</p>
                                                </CardContent>
                                            </Card>
                                        )
                                     })}
                                </div>
                            </div>
                             <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-semibold">Milestones</h2>
                                     <Button variant="outline" size="sm" onClick={() => openItemDialog('milestone')}>
                                        <Plus className="mr-2 h-4 w-4"/> Add Milestone
                                    </Button>
                                </div>
                              <div className="relative">
                                <div className="absolute left-3.5 top-0 h-full w-0.5 bg-border"></div>
                                 {courseIsLoading && !roadmap ? (
                                    <div className="space-y-8">
                                        <div className="flex items-start gap-6"><Skeleton className="h-8 w-8 rounded-full"/><div className="space-y-2"><Skeleton className="h-4 w-48"/><Skeleton className="h-4 w-32"/></div></div>
                                        <div className="flex items-start gap-6"><Skeleton className="h-8 w-8 rounded-full"/><div className="space-y-2"><Skeleton className="h-4 w-48"/><Skeleton className="h-4 w-32"/></div></div>
                                        <div className="flex items-start gap-6"><Skeleton className="h-8 w-8 rounded-full"/><div className="space-y-2"><Skeleton className="h-4 w-48"/><Skeleton className="h-4 w-32"/></div></div>
                                    </div>
                                 ) : roadmap?.milestones.map((milestone, index) => {
                                     const MilestoneIcon = getIcon(milestone.icon, 'Calendar');
                                     return (
                                        <div key={index} className="relative flex items-start gap-4 mb-8 group">
                                            <div className="flex flex-col items-center">
                                                <button onClick={() => handleToggleMilestone(milestone.id)} className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center z-10 border-2 transition-colors",
                                                    milestone.completed ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-primary hover:bg-primary/20'
                                                )}>
                                                    {milestone.completed ? <Check className="h-4 w-4" /> : <MilestoneIcon className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <p className="text-sm text-muted-foreground">{new Date(milestone.date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                <h3 className={cn("font-semibold text-lg", milestone.completed && "line-through text-muted-foreground")}>{milestone.title}</h3>
                                                <p className={cn("text-muted-foreground text-sm", milestone.completed && "line-through")}>{milestone.description}</p>
                                                
                                                <div className="mt-2 flex gap-2 items-center">
                                                    <Link href={`/dashboard/practice-quiz?topic=${encodeURIComponent(milestone.title)}`}>
                                                        <Button variant="outline" size="sm" className="text-xs h-7">
                                                            <Lightbulb className="mr-2 h-3 w-3"/> Checkpoint Quiz
                                                        </Button>
                                                    </Link>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openItemDialog('milestone', milestone)}><Edit className="h-4 w-4"/></Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this milestone.</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteItem('milestone', milestone.id)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
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

    <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit' : 'Add'} {editingType}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="item-title">Title</Label>
                    <Input id="item-title" value={currentItemTitle} onChange={(e) => setCurrentItemTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="item-desc">Description</Label>
                    <Textarea id="item-desc" value={currentItemDesc} onChange={(e) => setCurrentItemDesc(e.target.value)} />
                </div>
                {editingType === 'milestone' && (
                    <div className="grid gap-2">
                        <Label htmlFor="item-date">Date</Label>
                        <DatePicker date={currentItemDate} setDate={setCurrentItemDate} />
                    </div>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleSaveItem}>Save</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}

    