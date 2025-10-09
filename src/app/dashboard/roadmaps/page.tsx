
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { GitMerge, Plus, Trash2, Edit, Check, Lightbulb, Flag, Rocket, Play } from "lucide-react";
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { generateRoadmap } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const dynamic = "force-dynamic";

type Course = {
    id: string;
    name: string;
    description: string;
    url?: string;
    userId?: string;
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
    id: string;
    courseId: string;
    userId: string;
    goals: Goal[];
    milestones: Milestone[];
};

const getIcon = (iconName: keyof typeof LucideIcons | undefined, defaultIcon: keyof typeof LucideIcons) => {
    if (!iconName) return LucideIcons[defaultIcon] as React.ElementType;
    const Icon = LucideIcons[iconName];
    if (typeof Icon === 'function') {
        return Icon;
    }
    const iconKey = Object.keys(LucideIcons).find(key => key.toLowerCase() === iconName.toLowerCase()) as keyof typeof LucideIcons;
    if (iconKey && typeof LucideIcons[iconKey] === 'function') {
        return LucideIcons[iconKey] as React.ElementType;
    }
    return LucideIcons[defaultIcon] as React.ElementType;
};

const NumberIcon = ({ number }: { number: number }) => {
    const numberMap: Record<number, keyof typeof LucideIcons> = {
        1: 'Filter1', 2: 'Filter2', 3: 'Filter3', 4: 'Filter4', 5: 'Filter5',
        6: 'Filter6', 7: 'Filter7', 8: 'Filter8', 9: 'Filter9'
    };
    const Icon = number > 0 && number < 10 ? getIcon(numberMap[number], 'GitMerge') : getIcon('GitMerge', 'GitMerge');
    return <Icon className="w-8 h-8" />;
};


export default function RoadmapsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [roadmaps, setRoadmaps] = useState<Record<string, Roadmap>>({});
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);
    const router = useRouter();
    
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Goal | Milestone | null>(null);
    const [editingType, setEditingType] = useState<'goal' | 'milestone' | null>(null);
    const [currentItemTitle, setCurrentItemTitle] = useState('');
    const [currentItemDesc, setCurrentItemDesc] = useState('');
    const [currentItemDate, setCurrentItemDate] = useState<Date | undefined>(undefined);
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);


    useEffect(() => {
        if (authLoading || !user) return;

        const coursesQuery = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            if (userCourses.length > 0 && !activeCourseId) {
                setActiveCourseId(userCourses[0].id);
            } else if (userCourses.length === 0) {
                setActiveCourseId(null);
            }
        });

        const roadmapsQuery = query(collection(db, "roadmaps"), where("userId", "==", user.uid));
        const unsubscribeRoadmaps = onSnapshot(roadmapsQuery, (snapshot) => {
            const userRoadmaps: Record<string, Roadmap> = {};
            snapshot.forEach(doc => {
                const roadmapData = { id: doc.id, ...doc.data() } as Roadmap;
                userRoadmaps[roadmapData.courseId] = roadmapData;
            });
            setRoadmaps(userRoadmaps);
        });
        
        return () => {
            unsubscribeCourses();
            unsubscribeRoadmaps();
        }
        
    }, [user, authLoading, activeCourseId]);
    
    const activeRoadmap = activeCourseId ? roadmaps[activeCourseId] : null;

    const handleGenerateRoadmap = async (course: Course) => {
        if (!user) return;
        setIsLoading(prev => ({ ...prev, [course.id]: true }));
        toast({ title: 'Generating Roadmap...', description: `The AI is creating a personalized study plan for ${course.name}.` });
        try {
            const response = await generateRoadmap({
                courseName: course.name,
                courseDescription: course.description,
                courseUrl: course.url,
            });

            const roadmapData = {
                courseId: course.id,
                userId: user.uid,
                goals: response.goals.map(g => ({ ...g, id: crypto.randomUUID(), icon: g.icon as keyof typeof LucideIcons || 'Flag' })),
                milestones: response.milestones.map(m => ({ ...m, id: crypto.randomUUID(), icon: m.icon as keyof typeof LucideIcons || 'Calendar', completed: new Date(m.date) < new Date() }))
            };
            
            const existingRoadmapId = roadmaps[course.id]?.id;
            
            if (existingRoadmapId) {
                const roadmapRef = doc(db, 'roadmaps', existingRoadmapId);
                await updateDoc(roadmapRef, roadmapData);
            } else {
                await addDoc(collection(db, 'roadmaps'), roadmapData);
            }
           
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

    const handleSaveItem = async () => {
        if (!activeCourseId || !roadmaps[activeCourseId]) return;
        
        let updatedRoadmap = { ...roadmaps[activeCourseId] };

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
            updatedRoadmap.milestones.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        
        try {
            const roadmapRef = doc(db, 'roadmaps', updatedRoadmap.id);
            await updateDoc(roadmapRef, { goals: updatedRoadmap.goals, milestones: updatedRoadmap.milestones });
            toast({ title: `${editingType} saved!` });
        } catch (error) {
            console.error("Error saving item: ", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the item.'})
        }
        setIsItemDialogOpen(false);
    };

    const handleDeleteItem = async (type: 'goal' | 'milestone', id: string) => {
        if (!activeCourseId || !roadmaps[activeCourseId]) return;

        let updatedRoadmap = { ...roadmaps[activeCourseId] };
        
        if (type === 'goal') {
            updatedRoadmap.goals = updatedRoadmap.goals.filter(g => g.id !== id);
        } else {
            updatedRoadmap.milestones = updatedRoadmap.milestones.filter(m => m.id !== id);
        }
        
        try {
            const roadmapRef = doc(db, 'roadmaps', updatedRoadmap.id);
            await updateDoc(roadmapRef, { goals: updatedRoadmap.goals, milestones: updatedRoadmap.milestones });
            toast({ title: `${type} deleted.` });
        } catch(error) {
            console.error("Error deleting item: ", error);
            toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete the item.'})
        }
    };

    const handleToggleMilestone = async (milestoneId: string) => {
        if (!activeCourseId || !roadmaps[activeCourseId]) return;

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

        try {
            const roadmapRef = doc(db, 'roadmaps', updatedRoadmap.id);
            await updateDoc(roadmapRef, { milestones: updatedRoadmap.milestones });
            if (milestoneCompleted) {
                toast({
                    title: '🎉 Milestone Complete!',
                    description: "Great job! Keep up the momentum.",
                });
            }
        } catch (error) {
            console.error("Error toggling milestone: ", error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update the milestone.'})
        }
    };

    const navigateToLearningLab = (courseId: string, milestone: Milestone) => {
        router.push(`/dashboard/learning-lab?courseId=${courseId}&milestone=${encodeURIComponent(milestone.title)}`);
    }

  return (
    <>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Study Roadmap</h1>
              <p className="text-muted-foreground">
                Visualize your learning journey with key milestones and goals for each course.
              </p>
            </div>
             {courses.length > 0 && (
                <div className="relative">
                    <Select value={activeCourseId ?? undefined} onValueChange={(value) => setActiveCourseId(value)}>
                      <SelectTrigger className="w-full md:w-[300px] mt-4 md:mt-0">
                        <SelectValue placeholder="Select a course..." />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
            )}
        </header>

        {authLoading ? (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-96 w-full" />
                </div>
                <div className="space-y-8">
                <Skeleton className="h-8 w-32" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
                </div>
            </div>
        ) : courses.length > 0 ? (
            activeCourseId && courses.find((c) => c.id === activeCourseId) ? (
                 (() => {
                    const course = courses.find((c) => c.id === activeCourseId)!;
                    const roadmap = roadmaps[course.id];
                    const courseIsLoading = isLoading[course.id];
      
                    if (!roadmap && !courseIsLoading) {
                      return (
                        <Card className="text-center p-12 col-span-full">
                          <h2 className="text-xl font-semibold">No Roadmap Yet for {course.name}</h2>
                          <p className="text-muted-foreground mt-2 mb-6">Click the button to create a personalized study plan for this course.</p>
                          <Button onClick={() => handleGenerateRoadmap(course)} disabled={courseIsLoading}>
                            <GitMerge className="mr-2 h-4 w-4" /> {courseIsLoading ? 'Generating...' : 'Generate with AI'}
                          </Button>
                        </Card>
                      );
                    }
      
                    if (courseIsLoading && !roadmap) {
                      return <Loading />;
                    }
      
                    if (roadmap) {
                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                           <div className="lg:col-span-2 relative">
                                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                                    <motion.path 
                                        d="M 40 100 C 200 100, 200 290, 380 290 S 600 290, 600 480" 
                                        fill="none" 
                                        stroke="hsl(var(--border))"
                                        strokeWidth="2"
                                        strokeDasharray="5 5"
                                    />
                                </svg>
                                <div className="space-y-16 relative">
                                     {roadmap.milestones.map((milestone, index) => (
                                         <div key={milestone.id} className="flex items-center">
                                            <div className="z-10 bg-primary w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                                                <NumberIcon number={index + 1} />
                                            </div>
                                            <Card className="ml-6 flex-1">
                                                 <CardContent className="p-6">
                                                     <div className="flex justify-between items-start">
                                                         <div>
                                                            <CardTitle className={cn("text-lg", milestone.completed && "line-through text-muted-foreground")}>{milestone.title}</CardTitle>
                                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{milestone.description}</p>
                                                         </div>
                                                          <button onClick={() => handleToggleMilestone(milestone.id)} className={cn("h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0", milestone.completed ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-primary hover:bg-primary/20')}>
                                                            {milestone.completed && <Check className="h-4 w-4" />}
                                                        </button>
                                                     </div>
                                                    <div className="mt-4 flex gap-2 items-center">
                                                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => navigateToLearningLab(course.id, milestone)}>
                                                            <Play className="mr-2 h-3 w-3" /> Start Learning
                                                        </Button>
                                                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openItemDialog('milestone', milestone)}><Edit className="h-4 w-4" /></Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
                                                </CardContent>
                                            </Card>
                                        </div>
                                     ))}
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold">Your Badges</h2>
                                    <Button variant="outline" size="sm" onClick={() => openItemDialog('goal')}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Goal
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    {roadmap.goals.map((goal, index) => {
                                        const GoalIcon = getIcon(goal.icon, 'Flag');
                                        return (
                                            <Card key={goal.id} className="group text-center p-4 aspect-square flex flex-col justify-center items-center bg-card hover:bg-muted/50 transition-colors">
                                                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4 border-4 border-green-500">
                                                    <GoalIcon className="h-10 w-10 text-green-500" />
                                                </div>
                                                <h3 className="font-semibold text-sm">{goal.title}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                      );
                    }
                    return null;
                  })()
            ) : null
        ) : (
          <Card className="text-center p-12">
            <h2 className="text-xl font-semibold">No Courses Found</h2>
            <p className="text-muted-foreground mt-2">Add a course to start creating roadmaps.</p>
            <Link href="/dashboard/courses">
              <Button className="mt-6">Go to Courses</Button>
            </Link>
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

function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-1/2" />
                 <Skeleton className="h-10 w-48" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <div className="space-y-16">
                       <div className="flex items-center gap-6"><Skeleton className="h-16 w-16 rounded-full flex-shrink-0"/><div className="space-y-2 flex-1"><Skeleton className="h-5 w-3/4"/><Skeleton className="h-4 w-full"/><Skeleton className="h-4 w-1/2"/></div></div>
                       <div className="flex items-center gap-6"><Skeleton className="h-16 w-16 rounded-full flex-shrink-0"/><div className="space-y-2 flex-1"><Skeleton className="h-5 w-3/4"/><Skeleton className="h-4 w-full"/><Skeleton className="h-4 w-1/2"/></div></div>
                       <div className="flex items-center gap-6"><Skeleton className="h-16 w-16 rounded-full flex-shrink-0"/><div className="space-y-2 flex-1"><Skeleton className="h-5 w-3/4"/><Skeleton className="h-4 w-full"/><Skeleton className="h-4 w-1/2"/></div></div>
                    </div>
                </div>
                <div className="space-y-8">
                     <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-28" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-40" />
                        <Skeleton className="h-40" />
                        <Skeleton className="h-40" />
                         <Skeleton className="h-40" />
                    </div>
                </div>
            </div>
        </div>
    );
}
