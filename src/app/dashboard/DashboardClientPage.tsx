
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  Plus,
  LayoutGrid,
  GraduationCap,
  Upload,
  Bookmark,
  Settings,
  FileText,
  Lightbulb,
  MessageSquare,
  Gamepad2,
  Copy,
  Headphones,
  ChevronDown,
  Play,
} from 'lucide-react';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import AIBuddy from '@/components/ai-buddy';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

type Chapter = {
  id: string;
  title: string;
}

type Unit = {
  id: string;
  title: string;
  chapters: Chapter[];
}

type Course = {
  id: string;
  name: string;
  units?: Unit[];
  completedChapters?: string[];
};

const Header = () => {
    const [user] = useAuthState(auth);
    return (
        <header className="flex justify-end items-center p-4 gap-2">
            <Button variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                <Upload className="h-4 w-4 mr-2"/>
                Upgrade
            </Button>
            <Button variant="outline">Feedback</Button>
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                {user?.displayName?.charAt(0) || 'G'}
            </div>
        </header>
    )
}

const CourseDetailCard = ({ course }: { course: Course }) => {
    const totalMaterials = course.units?.reduce((acc, unit) => acc + unit.chapters.length, 0) || 0;
    
    const quickActions = [
        { icon: <FileText size={16}/>, label: 'Tests/Quizzes', count: 1, hasDropdown: true },
        { icon: <Lightbulb size={16}/>, label: 'Explainers', count: 0 },
        { icon: <MessageSquare size={16}/>, label: 'Tutor Me', count: 0 },
        { icon: <Gamepad2 size={16}/>, label: 'Arcade', count: 2, hasDropdown: true },
        { icon: <Copy size={16}/>, label: 'Flashcards', count: 1, hasDropdown: true },
        { icon: <Headphones size={16}/>, label: 'Audio Recap', count: 0 },
    ];
    
    const getUnitProgress = (unit: Unit) => {
        if (!unit.chapters || unit.chapters.length === 0 || !course.completedChapters) {
            return 0;
        }
        const completedInUnit = unit.chapters.filter(chap => course.completedChapters?.includes(chap.id)).length;
        return (completedInUnit / unit.chapters.length) * 100;
    }

    return (
        <div className="mt-8">
            <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border-2 border-blue-200">
                                <GraduationCap className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{course.name}</h2>
                                <p className="text-sm text-muted-foreground">{totalMaterials} materials</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon"><Bookmark/></Button>
                            <Button variant="ghost" size="icon"><Settings/></Button>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        {quickActions.map(action => (
                            <Button key={action.label} variant="outline" className="justify-start h-12 bg-white/50 hover:bg-white/80">
                                {action.icon}
                                <span className="font-semibold ml-2">{action.count}</span>
                                <span className="text-muted-foreground ml-1">{action.label}</span>
                                {action.hasDropdown && <ChevronDown size={16} className="ml-auto text-muted-foreground"/>}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <div className="text-center my-6">
                <Button size="lg" className="rounded-full h-12 px-8 bg-blue-500 hover:bg-blue-600">
                    <Play className="mr-2 h-5 w-5 fill-white"/>
                    Continue Learning
                </Button>
            </div>
            <div className="space-y-4">
                {course.units?.slice(0, 4).map(unit => (
                    <div key={unit.id} className="flex items-center gap-4 p-3 hover:bg-muted rounded-lg">
                        <Link href={`/dashboard/courses?courseId=${course.id}`} className="flex-1">
                            <p className="font-semibold underline-offset-4 hover:underline">{unit.title}</p>
                        </Link>
                        <Progress value={getUnitProgress(unit)} className="w-32 h-2"/>
                        <span className="text-sm font-medium text-muted-foreground w-10 text-right">{getUnitProgress(unit).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
            {course.units && course.units.length > 4 && (
                 <div className="text-center mt-6">
                    <Button variant="ghost">View All</Button>
                </div>
            )}
        </div>
    )
}

function DashboardClientPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, authLoading] = useAuthState(auth);
    const router = useRouter();
    const [activeSet, setActiveSet] = useState<string | null>(null);

     useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/signup');
            return;
        }

        const q = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            if (userCourses.length > 0 && !activeSet) {
                setActiveSet(userCourses[0].id);
            }
            setIsLoading(false);
        });
        
        return () => unsubscribe();
    }, [user, authLoading, router, activeSet]);
    
    const activeCourse = courses.find(c => c.id === activeSet);

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <AIBuddy className="w-16 h-16" />
                <div>
                    <h1 className="text-2xl font-bold">Good afternoon, {user?.displayName?.split(' ')[0] || 'Grady'}!</h1>
                    <p className="text-muted-foreground">Which study set are you working on today?</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <Button variant="ghost">
                    <Plus className="mr-2 h-4 w-4" /> Add Set
                </Button>
                 <Button variant="ghost">
                    <LayoutGrid className="mr-2 h-4 w-4" /> See All My Sets
                </Button>
            </div>
        </div>
        
        <div className="flex items-center gap-2 pb-6 border-b">
            {courses.map(course => (
                 <Button 
                    key={course.id} 
                    variant={activeSet === course.id ? 'default' : 'outline'}
                    className={cn(
                        "flex items-center gap-2",
                        activeSet === course.id && 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20'
                    )}
                    onClick={() => setActiveSet(course.id)}
                >
                    <GraduationCap className="h-4 w-4"/>
                    {course.name}
                </Button>
            ))}
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="border-dashed">
                        <Plus className="h-4 w-4"/>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a New Study Set</DialogTitle>
                        <DialogDescription>
                            What subject are you studying?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Set Name</Label>
                            <Input id="name" placeholder="e.g., SAT Math, Biology 101"/>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button>Add Set</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        {activeCourse && <CourseDetailCard course={activeCourse} />}

    </div>
  )
}

export default DashboardClientPage;
