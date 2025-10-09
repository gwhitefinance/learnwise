

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

const getIcon = (iconName: keyof typeof LucideIcons | undefined, defaultIcon: keyof typeof LucideIcons = 'Flag'): React.ElementType => {
    if (!iconName) {
        return LucideIcons[defaultIcon];
    }
    const iconKey = Object.keys(LucideIcons).find(key => key.toLowerCase() === iconName.toLowerCase()) as keyof typeof LucideIcons | undefined;
    
    if (iconKey && LucideIcons[iconKey]) {
        const IconComponent = (LucideIcons as any)[iconKey];
        if (typeof IconComponent === 'function') {
            return IconComponent;
        }
    }
    return LucideIcons[defaultIcon];
};


const CarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.5 14.5A2.5 2.5 0 0 1 17 17H7a2.5 2.5 0 0 1-2.5-2.5V12h15v2.5Z"/>
        <path d="M19.33 10.13A2 2 0 0 0 17.5 9H6.5a2 2 0 0 0-1.83 1.13L3 14h18l-1.67-3.87Z"/>
        <path d="M7 9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v0"/>
        <circle cx="8" cy="17" r="2"/>
        <circle cx="16" cy="17" r="2"/>
    </svg>
)

const badgeColors = [
    { bg: "bg-blue-100 dark:bg-blue-900/50", border: "border-blue-500", text: "text-blue-500" },
    { bg: "bg-purple-100 dark:bg-purple-900/50", border: "border-purple-500", text: "text-purple-500" },
    { bg: "bg-green-100 dark:bg-green-900/50", border: "border-green-500", text: "text-green-500" },
    { bg: "bg-orange-100 dark:bg-orange-900/50", border: "border-orange-500", text: "text-orange-500" },
];


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
        <header>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Study Roadmap</h1>
              <p className="text-muted-foreground">
                Visualize your learning journey with key milestones and goals for each course.
              </p>
            </div>
             {courses.length > 0 && (
                <div className="relative mt-4">
                    <Select value={activeCourseId ?? undefined} onValueChange={(value) => setActiveCourseId(value)}>
                      <SelectTrigger className="w-full md:w-[300px]">
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
             <Loading />
        ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {activeCourseId && courses.find((c) => c.id === activeCourseId) ? (
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
                      const completedCount = roadmap.milestones.filter(m => m.completed).length;
                      const carPosition = roadmap.milestones.length > 0 ? (completedCount / roadmap.milestones.length) : 0;
                      
                      const pathD = `M 250 80 C 100 150, 400 250, 250 350 S 100 450, 250 550 S 400 650, 250 750`;

                      return (
                        <>
                            <div className="lg:col-span-2 relative pt-8">
                                <svg className="absolute top-0 left-0 h-full w-full pointer-events-none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 500 800">
                                    <motion.path
                                        d={pathD}
                                        fill="none"
                                        stroke="hsl(var(--border))"
                                        strokeWidth="2"
                                        strokeDasharray="5 5"
                                    />
                                    <motion.path
                                        d={pathD}
                                        fill="none"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth="2"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: carPosition }}
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                    />
                                     <motion.g
                                        style={{ offsetPath: `path("${pathD}")` }}
                                        animate={{ offsetDistance: `${carPosition * 100}%` }}
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                    >
                                        <foreignObject x="-20" y="-20" width="40" height="40">
                                            <CarIcon className="w-8 h-8 text-primary" />
                                        </foreignObject>
                                    </motion.g>
                                </svg>
                                <div className="space-y-4 relative">
                                    {roadmap.milestones.map((milestone, index) => (
                                         <div key={milestone.id} className={cn("flex items-start gap-4 w-[calc(50%-2rem)]", index % 2 === 0 ? "ml-auto" : "mr-auto")}>
                                             <div className="z-10 bg-primary w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                                <LucideIcons.Calendar/>
                                            </div>
                                            <Card className="flex-1">
                                                 <CardContent className="p-4">
                                                     <div className="flex justify-between items-start gap-2">
                                                         <div>
                                                            <p className="font-semibold">{milestone.title}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">{new Date(milestone.date).toLocaleDateString()}</p>
                                                         </div>
                                                        <button onClick={() => handleToggleMilestone(milestone.id)} className={cn("h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0", milestone.completed ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-primary hover:bg-primary/20')}>
                                                            {milestone.completed && <Check className="h-4 w-4" />}
                                                        </button>
                                                     </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                     ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold">Your Badges</h2>
                                    <Button variant="outline" size="sm" onClick={() => openItemDialog('goal')}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Goal
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    {roadmap.goals.map((goal, index) => {
                                        const Icon = getIcon(goal.icon, 'Flag');
                                        const color = badgeColors[index % badgeColors.length];
                                        return (
                                            <Card key={goal.id} className="group text-center p-4 aspect-square flex flex-col justify-center items-center bg-card hover:bg-muted/50 transition-colors">
                                                <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4", color.bg, color.border)}>
                                                    <Icon className={cn("h-12 w-12", color.text)} />
                                                </div>
                                                <h3 className="font-semibold text-sm">{goal.title}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                      );
                    }
                    return null;
                  })()
            ) : null}
            </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
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
